import { Hono } from 'hono'
import type { Context } from 'hono'
import { z } from 'zod'
import { requireRole, type AppEnv } from '../middleware/auth'
import { jsonBody } from '../lib/parse'
import { many, one } from '../lib/db'
import { badRequest, notFound } from '../lib/errors'
import { mapBatch, mapDiaryEvent, mapMission, mapProduct, mapSupportRequest } from '../lib/mappers'
import { batchPublicCode, prefixedId } from '../lib/ids'
import { hydrateOrders } from '../repo/orders'
import type { Batch } from '../types'

export const farmer = new Hono<AppEnv>()

farmer.use('*', requireRole('farm_owner'))

async function ownedFarmId(c: Context<AppEnv>): Promise<string> {
  const rows = many(await c.get('db').from('farms').select('id').eq('owner_id', c.get('userId')!).limit(1))
  if (rows.length === 0) throw notFound('Tài khoản chưa gắn nhà vườn nào')
  return rows[0].id as string
}

/* ----------------------------- Tổng quan ----------------------------- */

farmer.get('/dashboard', async (c) => {
  const db = c.get('db')
  const farmId = await ownedFarmId(c)
  const [farmRes, productsRes, ordersRes, missionsRes, supportRes] = await Promise.all([
    db.from('farms').select('*').eq('id', farmId).maybeSingle(),
    db.from('products').select('*').eq('farm_id', farmId).order('name'),
    db.from('orders').select('*').eq('farm_id', farmId).order('created_at', { ascending: false }),
    db.from('missions').select('*').eq('farm_id', farmId).order('due_date'),
    db.from('support_requests').select('*').eq('farm_id', farmId).order('id'),
  ])
  const orders = await hydrateOrders(db, many(ordersRes))
  const openOrders = orders.filter((o) => !['Completed', 'Cancelled'].includes(o.status)).length
  const revenue = orders
    .filter((o) => o.status === 'Completed')
    .reduce((s, o) => s + o.items.reduce((t, it) => t + it.qtyKg * it.unitPrice, 0), 0)
  return c.json({
    farm: farmRes.data ?? null,
    counts: {
      products: many(productsRes).length,
      openOrders,
      missions: many(missionsRes).length,
      supportRequests: many(supportRes).length,
    },
    revenueCompleted: revenue,
    products: many(productsRes).map(mapProduct),
    missions: many(missionsRes).map(mapMission),
  })
})

/* ----------------------------- Sản phẩm ----------------------------- */

const productSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(60),
  pricePerKg: z.number().int().positive(),
  unit: z.string().min(1).default('kg'),
  stockKg: z.number().min(0).default(0),
  season: z.enum(['in_season', 'preorder', 'out_of_stock']).default('in_season'),
  description: z.string().max(2000).default(''),
  createBatch: z.boolean().optional(),
  harvestDate: z.string().optional(),
})

farmer.post('/products', async (c) => {
  const body = await jsonBody(c, productSchema)
  const db = c.get('db')
  const farmId = await ownedFarmId(c)
  const id = prefixedId('p')
  const batchCode = body.createBatch ? batchPublicCode() : null

  const inserted = one(
    await db
      .from('products')
      .insert({
        id,
        farm_id: farmId,
        name: body.name,
        category: body.category,
        price_per_kg: body.pricePerKg,
        unit: body.unit,
        stock_kg: body.stockKg,
        season: body.season,
        description: body.description,
        batch_code: batchCode,
      })
      .select('*')
      .maybeSingle(),
    'Không tạo được sản phẩm',
  )

  let batch: Batch | null = null
  if (batchCode) {
    const batchId = prefixedId('b')
    const batchRow = one(
      await db
        .from('batches')
        .insert({
          id: batchId,
          product_id: id,
          farm_id: farmId,
          public_code: batchCode,
          harvest_date: body.harvestDate ?? new Date().toISOString().slice(0, 10),
          quantity_kg: body.stockKg,
          source_status: 'self_declared',
        })
        .select('*')
        .maybeSingle(),
      'Không tạo được lô hàng',
    )
    const diaryRow = one(
      await db
        .from('diary_events')
        .insert({
          id: prefixedId('d'),
          batch_id: batchId,
          at: new Date().toISOString().slice(0, 10),
          phase: 'khoi_tao',
          note: `Khởi tạo lô ${body.name} (nháp do nhà vườn đăng, cần duyệt).`,
          actor: c.get('profile')?.display_name ?? 'Nhà vườn',
        })
        .select('*')
        .maybeSingle(),
      'Không tạo được nhật ký',
    )
    batch = mapBatch(batchRow, [mapDiaryEvent(diaryRow)])
  }

  return c.json({ product: mapProduct(inserted), batch }, 201)
})

farmer.patch('/products/:id', async (c) => {
  const body = await jsonBody(c, productSchema.partial())
  const db = c.get('db')
  const farmId = await ownedFarmId(c)
  const patch: Record<string, unknown> = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.category !== undefined) patch.category = body.category
  if (body.pricePerKg !== undefined) patch.price_per_kg = body.pricePerKg
  if (body.unit !== undefined) patch.unit = body.unit
  if (body.stockKg !== undefined) patch.stock_kg = body.stockKg
  if (body.season !== undefined) patch.season = body.season
  if (body.description !== undefined) patch.description = body.description
  if (Object.keys(patch).length === 0) throw badRequest('Không có trường nào để cập nhật')
  const row = one(
    await db.from('products').update(patch).eq('id', c.req.param('id')).eq('farm_id', farmId).select('*').maybeSingle(),
    'Không tìm thấy sản phẩm của nhà vườn',
  )
  return c.json({ product: mapProduct(row) })
})

/** Nháp nội dung (heuristic, không gọi dịch vụ ngoài). Nhà vườn phải tự duyệt. */
const draftSchema = z.object({
  name: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
})

farmer.post('/products/ai-draft', async (c) => {
  const body = await jsonBody(c, draftSchema)
  const name = body.name?.trim() || 'Sản phẩm mới'
  const notes = body.notes?.trim()
  const category = body.category?.trim() || 'Trái cây'
  const season = /đặt trước|preorder|sắp/i.test(notes ?? '') ? 'preorder' : 'in_season'
  const description = [
    `${name} từ nhà vườn địa phương Đồng Nai.`,
    notes ? `Ghi chú từ nhà vườn: ${notes}` : null,
    'Thu hoạch tại vườn, đóng gói theo yêu cầu.',
  ]
    .filter(Boolean)
    .join(' ')
  return c.json({
    draft: { name, category, season, description, requiresApproval: true, generatedBy: 'heuristic' },
  })
})

/* ----------------------------- Nhật ký lô ----------------------------- */

const diarySchema = z.object({
  at: z.string().min(4),
  phase: z.enum(['khoi_tao', 'cham_soc', 'thu_hoach', 'phan_loai', 'giao_nhan']),
  note: z.string().min(1).max(1000),
  actor: z.string().max(120).optional(),
  evidence: z.string().max(500).optional(),
})

farmer.post('/batches/:id/diary', async (c) => {
  const body = await jsonBody(c, diarySchema)
  const db = c.get('db')
  const farmId = await ownedFarmId(c)
  const batch = one(
    await db.from('batches').select('*').eq('id', c.req.param('id')).eq('farm_id', farmId).maybeSingle(),
    'Không tìm thấy lô của nhà vườn',
  )
  const row = one(
    await db
      .from('diary_events')
      .insert({
        id: prefixedId('d'),
        batch_id: batch.id,
        at: body.at,
        phase: body.phase,
        note: body.note,
        actor: body.actor ?? c.get('profile')?.display_name ?? 'Nhà vườn',
        evidence: body.evidence ?? null,
      })
      .select('*')
      .maybeSingle(),
    'Không ghi được nhật ký',
  )
  return c.json({ event: mapDiaryEvent(row) }, 201)
})

/* ----------------------------- Đơn hàng ----------------------------- */

farmer.get('/orders', async (c) => {
  const db = c.get('db')
  const farmId = await ownedFarmId(c)
  const rows = many(
    await db.from('orders').select('*').eq('farm_id', farmId).order('created_at', { ascending: false }),
  )
  return c.json({ orders: await hydrateOrders(db, rows) })
})

const statusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Packing', 'Ready', 'Shipping', 'Completed', 'Cancelled']),
})

farmer.patch('/orders/:id/status', async (c) => {
  const body = await jsonBody(c, statusSchema)
  const { error } = await c.get('db').rpc('fn_set_order_status', {
    p_order_id: c.req.param('id'),
    p_next: body.status,
  })
  if (error) throw badRequest(error.message)
  return c.json({ ok: true, status: body.status })
})

/* ------------------------- Yêu cầu hỗ trợ ------------------------- */

farmer.get('/support-requests', async (c) => {
  const db = c.get('db')
  const farmId = await ownedFarmId(c)
  const rows = many(await db.from('support_requests').select('*').eq('farm_id', farmId).order('id'))
  return c.json({ supportRequests: rows.map(mapSupportRequest) })
})

const supportSchema = z.object({
  title: z.string().min(1).max(160),
  need: z.string().min(1).max(1000),
  desiredOutput: z.string().min(1).max(500),
})

farmer.post('/support-requests', async (c) => {
  const body = await jsonBody(c, supportSchema)
  const db = c.get('db')
  const farmId = await ownedFarmId(c)
  const row = one(
    await db
      .from('support_requests')
      .insert({ id: prefixedId('sr'), farm_id: farmId, title: body.title, need: body.need, desired_output: body.desiredOutput, status: 'Open' })
      .select('*')
      .maybeSingle(),
    'Không tạo được yêu cầu hỗ trợ',
  )
  return c.json({ supportRequest: mapSupportRequest(row) }, 201)
})

/* --------------- Xác nhận đầu ra (lớp 1) --------------- */

farmer.post('/submissions/:id/beneficiary-confirm', async (c) => {
  const body = await jsonBody(c, z.object({ accepted: z.boolean().default(true), note: z.string().max(500).optional() }))
  const { error } = await c.get('db').rpc('fn_beneficiary_confirm', {
    p_submission_id: c.req.param('id'),
    p_accepted: body.accepted,
    p_note: body.note ?? null,
  })
  if (error) throw badRequest(error.message)
  return c.json({ ok: true, accepted: body.accepted })
})
