import { useState } from 'react'
import { CheckCircle2, PackageCheck, XCircle } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { orderStatusLabel, orderStatusTone } from '../../lib/labels'
import { Badge, Button, Card, DemoTag, EmptyState, Modal, Tabs, Textarea } from '../../components/ui'
import { OrderStatusStepper } from '../../components/domain'
import { dateTime, money } from '../../lib/format'
import type { Order, OrderStatus } from '../../lib/seed'

const filterTabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Pending', label: 'Chờ xác nhận' },
  { key: 'active', label: 'Đang xử lý' },
  { key: 'done', label: 'Hoàn thành' },
  { key: 'Cancelled', label: 'Đã hủy' },
] as const

type FilterKey = (typeof filterTabs)[number]['key']

export function FarmerOrders() {
  const { productById } = useData()
  const { orders, setOrderStatus, pushToast } = useDemo()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const farmOrders = orders.filter((o) => o.farmId === 'farm-ba-tu-demo')
  const shown = farmOrders.filter((o) => {
    if (filter === 'all') return true
    if (filter === 'active') return ['Confirmed', 'Packing', 'Ready', 'Shipping'].includes(o.status)
    return o.status === filter
  })

  const nextAction: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
    Pending: { label: 'Xác nhận đơn', next: 'Confirmed' },
    Confirmed: { label: 'Bắt đầu đóng gói', next: 'Packing' },
    Packing: { label: 'Sẵn sàng giao/nhận', next: 'Ready' },
    Ready: { label: 'Hoàn thành', next: 'Completed' },
    Shipping: { label: 'Đã giao', next: 'Completed' },
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-2">
        <DemoTag />
        <span className="text-[13px] text-muted">{farmOrders.length} đơn của Nhà vườn Ba Tư</span>
      </div>

      <Tabs tabs={filterTabs.map((t) => ({ key: t.key, label: t.label }))} value={filter} onChange={setFilter} />

      {shown.length === 0 ? (
        <EmptyState title="Không có đơn ở mục này" description="Đơn mới sẽ hiển thị ở đây khi khách đặt hàng." />
      ) : (
        <div className="space-y-3">
          {shown.map((o) => (
            <OrderRow
              key={o.id}
              order={o}
              action={nextAction[o.status]}
              onAction={(next) => {
                setOrderStatus(o.id, next, `Nhà vườn cập nhật: ${orderStatusLabel[next]} (demo).`)
                pushToast(`Đã chuyển đơn sang “${orderStatusLabel[next]}”`, 'success')
              }}
              onCancel={() => setCancelId(o.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Hủy đơn hàng?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelId(null)}>
              Đóng
            </Button>
            <Button
              variant="danger"
              disabled={reason.trim().length < 3}
              onClick={() => {
                if (cancelId) setOrderStatus(cancelId, 'Cancelled', `Lý do hủy: ${reason}`)
                pushToast('Đã hủy đơn kèm lý do (demo)', 'warning')
                setCancelId(null)
                setReason('')
              }}
            >
              Xác nhận hủy
            </Button>
          </>
        }
      >
        <p className="mb-2 text-[14px] text-muted">Bắt buộc nhập lý do hủy (được lưu lịch sử).</p>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ví dụ: hết hàng đúng quy cách" />
      </Modal>
    </div>
  )
}

function OrderRow({
  order,
  action,
  onAction,
  onCancel,
}: {
  order: Order
  action?: { label: string; next: OrderStatus }
  onAction: (next: OrderStatus) => void
  onCancel: () => void
}) {
  const { productById } = useData()
  const canCancel = order.status !== 'Completed' && order.status !== 'Cancelled'
  const total = order.items.reduce((s, i) => s + i.qtyKg * i.unitPrice, 0) + order.shippingFee

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="tnum text-[16px] font-bold text-text">{order.code}</p>
          <p className="text-[13px] text-muted">
            {dateTime(order.createdAt)} · {order.fulfillment === 'delivery' ? 'Giao tận nơi' : 'Nhận tại vườn'}
          </p>
        </div>
        <Badge tone={orderStatusTone[order.status]}>{orderStatusLabel[order.status]}</Badge>
      </div>

      <div className="rounded-md border border-border bg-background p-3">
        <OrderStatusStepper status={order.status} />
      </div>

      <div className="space-y-1">
        {order.items.map((it) => {
          const p = productById(it.productId)
          return (
            <div key={it.productId} className="flex justify-between text-[14px]">
              <span className="text-text">
                {p?.name} · {it.qtyKg} kg
              </span>
              <span className="tnum font-semibold">{money(it.qtyKg * it.unitPrice)}</span>
            </div>
          )
        })}
        <div className="flex justify-between border-t border-border pt-1 text-[14px]">
          <span className="font-semibold text-text">Tổng (gồm phí giao)</span>
          <span className="tnum font-bold text-primary">{money(total)}</span>
        </div>
      </div>

      {order.status !== 'Completed' && order.status !== 'Cancelled' && (
        <div className="flex flex-wrap gap-2">
          {action && (
            <Button size="sm" onClick={() => onAction(action.next)}>
              <CheckCircle2 size={15} aria-hidden /> {action.label}
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => onAction('Completed')}>
            <PackageCheck size={15} aria-hidden /> Đánh dấu đã giao
          </Button>
          {canCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              <XCircle size={15} aria-hidden /> Hủy đơn
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
