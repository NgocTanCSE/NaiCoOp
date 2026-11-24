import { Hono } from 'hono'
import { z } from 'zod'
import type { AppEnv } from '../middleware/auth'
import { query } from '../lib/parse'
import { many, one } from '../lib/db'
import {
  mapAdminUnit,
  mapBatch,
  mapCertificate,
  mapDiaryEvent,
  mapFarm,
  mapLesson,
  mapLivestream,
  mapProduct,
} from '../lib/mappers'

export const publicRoutes = new Hono<AppEnv>()

/* ----------------------------- Sản phẩm ----------------------------- */

const productQuery = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  farmId: z.string().optional(),
  season: z.enum(['in_season', 'preorder', 'out_of_stock']).optional(),
})

publicRoutes.get('/products', async (c) => {
  const { category, q, farmId, season } = query(c, productQuery)
  let builder = c.get('db').from('products').select('*').order('name')
  if (category) builder = builder.eq('category', category)
  if (farmId) builder = builder.eq('farm_id', farmId)
  if (season) builder = builder.eq('season', season)
  if (q) builder = builder.ilike('name', `%${q}%`)
  const rows = many(await builder)
  return c.json({ products: rows.map(mapProduct) })
})

publicRoutes.get('/products/:id', async (c) => {
  const db = c.get('db')
  const id = c.req.param('id')
  const productRow = one(await db.from('products').select('*').eq('id', id).maybeSingle(), 'Không tìm thấy sản phẩm')
  const product = mapProduct(productRow)

  const [farmRes, batchRes] = await Promise.all([
    db.from('farms').select('*').eq('id', product.farmId).maybeSingle(),
    product.batchCode
      ? db.from('batches').select('*').eq('public_code', product.batchCode).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  return c.json({
    product,
    farm: farmRes.data ? mapFarm(farmRes.data) : null,
    batch: batchRes.data ? mapBatch(batchRes.data) : null,
  })
})

/* ----------------------------- Nhà vườn ----------------------------- */

publicRoutes.get('/farms', async (c) => {
  const rows = many(await c.get('db').from('farms').select('*').order('name'))
  return c.json({ farms: rows.map(mapFarm) })
})

/** Điểm bản đồ — chỉ trả trường cần cho bản đồ (dữ liệu giả lập). */
publicRoutes.get('/explore/farms', async (c) => {
  const rows = many(
    await c.get('db').from('farms').select('id,name,address,unit_code,crops,lat,lng,cert_status,area_ha,is_demo').order('name'),
  )
  return c.json({ points: rows.map(mapFarm) })
})

publicRoutes.get('/farms/:id', async (c) => {
  const db = c.get('db')
  const id = c.req.param('id')
  const farmRow = one(await db.from('farms').select('*').eq('id', id).maybeSingle(), 'Không tìm thấy nhà vườn')
  const products = many(await db.from('products').select('*').eq('farm_id', id).order('name'))
  const certificates = many(
    await db.from('certificates').select('*').eq('farm_id', id).order('id'),
  )
  return c.json({
    farm: mapFarm(farmRow),
    products: products.map(mapProduct),
    certificates: certificates.map(mapCertificate),
  })
})

/* -------------------- Hộ chiếu số (truy xuất công khai) -------------------- */

publicRoutes.get('/trace/:code', async (c) => {
  const db = c.get('db')
  const code = c.req.param('code')
  const batchRow = one(
    await db.from('batches').select('*').eq('public_code', code).maybeSingle(),
    'Không tìm thấy mã lô này',
  )
  const batch = mapBatch(batchRow)

  const [diaryRes, farmRes, productRes] = await Promise.all([
    db.from('diary_events').select('*').eq('batch_id', batch.id).order('at'),
    db.from('farms').select('*').eq('id', batch.farmId).maybeSingle(),
    db.from('products').select('*').eq('id', batch.productId).maybeSingle(),
  ])

  // Chỉ trả trường công khai tối thiểu cho hộ chiếu số.
  return c.json({
    batch: mapBatch(batchRow, many(diaryRes).map(mapDiaryEvent)),
    farm: farmRes.data ? mapFarm(farmRes.data) : null,
    product: productRes.data ? mapProduct(productRes.data) : null,
  })
})

/* ----------------------------- Livestream ----------------------------- */

publicRoutes.get('/livestreams', async (c) => {
  const db = c.get('db')
  const rows = many(await db.from('livestreams').select('*').order('scheduled_at', { ascending: false }))
  const ids = rows.map((r) => r.id)
  const links = ids.length
    ? many(await db.from('livestream_products').select('*').in('livestream_id', ids))
    : []
  const byLive = new Map<string, string[]>()
  for (const l of links) {
    const list = byLive.get(l.livestream_id) ?? []
    list.push(l.product_id)
    byLive.set(l.livestream_id, list)
  }
  return c.json({ livestreams: rows.map((r) => mapLivestream(r, byLive.get(r.id) ?? [])) })
})

/* ----------------------------- Bài học / đơn vị ----------------------------- */

publicRoutes.get('/lessons', async (c) => {
  const rows = many(await c.get('db').from('lessons').select('*').order('id'))
  return c.json({ lessons: rows.map(mapLesson) })
})

/** Danh sách lô + nhật ký (dữ liệu demo nhỏ; dùng cho tích hợp front-end). */
publicRoutes.get('/batches', async (c) => {
  const db = c.get('db')
  const batchRows = many(await db.from('batches').select('*').order('id'))
  const ids = batchRows.map((b) => b.id)
  const diaryRows = ids.length ? many(await db.from('diary_events').select('*').in('batch_id', ids)) : []
  const byBatch = new Map<string, ReturnType<typeof mapDiaryEvent>[]>()
  for (const d of diaryRows) {
    byBatch.set(d.batch_id, [...(byBatch.get(d.batch_id) ?? []), mapDiaryEvent(d)])
  }
  return c.json({ batches: batchRows.map((b) => mapBatch(b, byBatch.get(b.id) ?? [])) })
})

publicRoutes.get('/certificates', async (c) => {
  const rows = many(await c.get('db').from('certificates').select('*').order('id'))
  return c.json({ certificates: rows.map(mapCertificate) })
})

publicRoutes.get('/units', async (c) => {
  const rows = many(await c.get('db').from('admin_units').select('*').order('code'))
  return c.json({ units: rows.map(mapAdminUnit) })
})

/* ----------------------------- Nhà vườn có sản phẩm (tiện cho chợ) ----------------------------- */

publicRoutes.get('/market/home', async (c) => {
  const db = c.get('db')
  const [products, farms, lives] = await Promise.all([
    db.from('products').select('*').order('name'),
    db.from('farms').select('*').order('name'),
    db.from('livestreams').select('*').in('status', ['scheduled', 'live']).order('scheduled_at'),
  ])
  return c.json({
    products: many(products).map(mapProduct),
    farms: many(farms).map(mapFarm),
    featuredFarms: many(farms).slice(0, 4).map(mapFarm),
    upcomingLives: many(lives).map((r) => mapLivestream(r)),
  })
})
