import { Hono } from 'hono'
import { z } from 'zod'
import { requireRole, type AppEnv } from '../middleware/auth'
import { jsonBody } from '../lib/parse'
import { many, ok } from '../lib/db'
import { badRequest, notFound } from '../lib/errors'

export const cart = new Hono<AppEnv>()

cart.use('*', requireRole('customer'))

async function ensureCart(userId: string, db: AppEnv['Variables']['db']): Promise<string> {
  const existing = await db.from('carts').select('id').eq('user_id', userId).maybeSingle()
  if (existing.data) return existing.data.id as string
  const created = await db.from('carts').insert({ user_id: userId }).select('id').maybeSingle()
  if (!created.data) throw new Error('Không tạo được giỏ hàng')
  return created.data.id as string
}

async function loadCart(db: AppEnv['Variables']['db'], userId: string) {
  const { data, error } = await db
    .from('cart_items')
    .select('product_id, qty_kg')
    .eq('user_id', userId)
    .order('product_id')
  if (error) return []
  return many({ data, error }).map((r) => ({ productId: r.product_id as string, qtyKg: Number(r.qty_kg) }))
}

cart.get('/', async (c) => {
  const items = await loadCart(c.get('db'), c.get('userId')!)
  return c.json({ items })
})

const addSchema = z.object({
  productId: z.string().min(1),
  qtyKg: z.number().positive().max(1000),
})

cart.post('/items', async (c) => {
  const { productId, qtyKg } = await jsonBody(c, addSchema)
  const db = c.get('db')
  const userId = c.get('userId')!

  const product = await db.from('products').select('id,season').eq('id', productId).maybeSingle()
  if (!product.data) throw notFound('Không tìm thấy sản phẩm')
  if (product.data.season === 'out_of_stock') throw badRequest('Sản phẩm đã hết hàng')

  await ensureCart(userId, db)
  const existing = await db
    .from('cart_items')
    .select('id,qty_kg')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle()
  if (existing.data) {
    ok(
      await db
        .from('cart_items')
        .update({ qty_kg: Number(existing.data.qty_kg) + qtyKg })
        .eq('id', existing.data.id),
    )
  } else {
    ok(await db.from('cart_items').insert({ user_id: userId, product_id: productId, qty_kg: qtyKg }))
  }
  return c.json({ items: await loadCart(db, userId) }, 201)
})

const patchSchema = z.object({ qtyKg: z.number().positive().max(1000) })

cart.patch('/items/:productId', async (c) => {
  const { qtyKg } = await jsonBody(c, patchSchema)
  const db = c.get('db')
  const userId = c.get('userId')!
  const productId = c.req.param('productId')
  const { data, error } = await db
    .from('cart_items')
    .update({ qty_kg: qtyKg })
    .eq('user_id', userId)
    .eq('product_id', productId)
    .select('id')
  if (error) throw badRequest(error.message)
  if (!data || data.length === 0) throw notFound('Sản phẩm không có trong giỏ')
  return c.json({ items: await loadCart(db, userId) })
})

cart.delete('/items/:productId', async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')!
  const productId = c.req.param('productId')
  ok(await db.from('cart_items').delete().eq('user_id', userId).eq('product_id', productId))
  return c.json({ items: await loadCart(db, userId) })
})

cart.delete('/', async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')!
  ok(await db.from('cart_items').delete().eq('user_id', userId))
  return c.json({ items: [] })
})
