import type { SupabaseClient } from '@supabase/supabase-js'
import { many } from '../lib/db'
import { mapOrder } from '../lib/mappers'
import type { Order } from '../types'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>

/** Gắn items + history vào các bản ghi đơn hàng. */
export async function hydrateOrders(db: SupabaseClient, rows: Row[]): Promise<Order[]> {
  if (rows.length === 0) return []
  const ids = rows.map((r) => r.id)
  const [itemsRes, historyRes] = await Promise.all([
    db.from('order_items').select('*').in('order_id', ids),
    db.from('order_history').select('*').in('order_id', ids),
  ])
  const items = many(itemsRes)
  const history = many(historyRes)
  return rows.map((r) =>
    mapOrder(
      r,
      items.filter((it) => it.order_id === r.id),
      history.filter((h) => h.order_id === r.id),
    ),
  )
}

export async function hydrateOrder(db: SupabaseClient, row: Row): Promise<Order> {
  const [order] = await hydrateOrders(db, [row])
  return order
}
