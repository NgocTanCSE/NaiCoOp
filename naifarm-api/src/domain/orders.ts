import type { OrderStatus } from '../types'

/** Luồng trạng thái đơn hàng hợp lệ (nguồn chân lý ở server). */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Packing', 'Cancelled'],
  Packing: ['Ready', 'Cancelled'],
  Ready: ['Shipping', 'Cancelled'],
  Shipping: ['Completed'],
  Completed: [],
  Cancelled: [],
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false
}

export function orderTotal(
  items: { qtyKg: number; unitPrice: number }[],
  shippingFee: number,
): number {
  return items.reduce((sum, it) => sum + it.qtyKg * it.unitPrice, 0) + shippingFee
}
