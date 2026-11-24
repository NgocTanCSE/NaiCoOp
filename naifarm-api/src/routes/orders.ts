import { Hono } from 'hono'
import { z } from 'zod'
import { requireRole, type AppEnv } from '../middleware/auth'
import { jsonBody } from '../lib/parse'
import { many, one } from '../lib/db'
import { badRequest } from '../lib/errors'
import { hydrateOrder, hydrateOrders } from '../repo/orders'

export const orders = new Hono<AppEnv>()

orders.use('*', requireRole('customer'))

const createSchema = z.object({
  fulfillment: z.enum(['delivery', 'pickup']).default('delivery'),
  paymentStatus: z.enum(['Unpaid', 'Paid', 'COD']).default('COD'),
  items: z
    .array(z.object({ productId: z.string().min(1), qtyKg: z.number().positive().max(1000) }))
    .optional(),
})

orders.post('/', async (c) => {
  const body = await jsonBody(c, createSchema)
  const { data, error } = await c.get('db').rpc('fn_place_order', {
    p_fulfillment: body.fulfillment,
    p_payment_status: body.paymentStatus,
    p_items: body.items ?? null,
  })
  if (error) throw badRequest(error.message)
  const orderId = typeof data === 'string' ? data : (data?.order_id as string)
  const row = one(
    await c.get('db').from('orders').select('*').eq('id', orderId).maybeSingle(),
    'Không tạo được đơn hàng',
  )
  return c.json({ order: await hydrateOrder(c.get('db'), row) }, 201)
})

orders.get('/', async (c) => {
  const rows = many(
    await c.get('db').from('orders').select('*').eq('customer_id', c.get('userId')!).order('created_at', { ascending: false }),
  )
  return c.json({ orders: await hydrateOrders(c.get('db'), rows) })
})

orders.get('/:id', async (c) => {
  const row = one(await c.get('db').from('orders').select('*').eq('id', c.req.param('id')).maybeSingle(), 'Không tìm thấy đơn hàng')
  return c.json({ order: await hydrateOrder(c.get('db'), row) })
})

orders.post('/:id/cancel', async (c) => {
  const { error } = await c.get('db').rpc('fn_set_order_status', {
    p_order_id: c.req.param('id'),
    p_next: 'Cancelled',
  })
  if (error) throw badRequest(error.message)
  const row = one(await c.get('db').from('orders').select('*').eq('id', c.req.param('id')).maybeSingle(), 'Không tìm thấy đơn hàng')
  return c.json({ order: await hydrateOrder(c.get('db'), row) })
})
