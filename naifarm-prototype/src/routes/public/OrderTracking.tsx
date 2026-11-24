import { Link, useParams } from 'react-router-dom'
import { PackageCheck, Store, Truck } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { Badge, Button, Card, DemoTag, Modal, Notice } from '../../components/ui'
import { OrderStatusStepper } from '../../components/domain'
import { orderStatusLabel, orderStatusTone } from '../../lib/labels'
import { dateTime, money } from '../../lib/format'
import { useState } from 'react'

export function OrderTracking() {
  const { farmById, orderById, orderTotal, productById } = useData()
  const { id } = useParams()
  const order = id ? orderById(id) : undefined
  const { orders, setOrderStatus, pushToast } = useDemo()
  const live = orders.find((o) => o.id === id) ?? order
  const [cancelOpen, setCancelOpen] = useState(false)

  if (!live) return <Notice tone="warning">Không tìm thấy đơn hàng.</Notice>

  const farm = farmById(live.farmId)
  const canCancel = live.status === 'Pending' || live.status === 'Confirmed'

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="tnum text-[22px] font-bold text-text">{live.code}</h1>
        <Badge tone={orderStatusTone[live.status]}>{orderStatusLabel[live.status]}</Badge>
        <DemoTag />
      </div>

      <div className="overflow-hidden rounded-xl bg-header p-5 text-white md:p-6">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/60">Đặt hàng thành công</p>
        <h2 className="mt-1 font-display text-[24px] font-semibold leading-snug md:text-[28px]">
          Cảm ơn bạn đã đồng hành cùng nông sản Đồng Nai!
        </h2>
        <p className="mt-2 max-w-[60ch] text-[14px] text-white/75">
          Nhà vườn sẽ xác nhận đơn và cập nhật từng bước. Bạn có thể theo dõi trạng thái ngay tại đây.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/80">
          <span>Mã đơn: <strong className="tnum text-white">{live.code}</strong></span>
          <span>Tổng: <strong className="tnum text-white">{money(orderTotal(live))}</strong></span>
          <span>{live.fulfillment === 'delivery' ? 'Giao tận nơi' : 'Nhận tại vườn'}</span>
        </div>
      </div>

      <Card className="space-y-4">
        <OrderStatusStepper status={live.status} />
        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3 text-[13.5px] text-muted">
          <span className="flex items-center gap-1">
            {live.fulfillment === 'delivery' ? <Truck size={15} aria-hidden /> : <Store size={15} aria-hidden />}
            {live.fulfillment === 'delivery' ? 'Giao tận nơi' : 'Nhận tại vườn'}
          </span>
          <span className="flex items-center gap-1">
            <PackageCheck size={15} aria-hidden /> {farm?.name}
          </span>
          <Badge tone="info">Thanh toán: {live.paymentStatus}</Badge>
        </div>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-[16px] font-bold text-text">Sản phẩm</h2>
        {live.items.map((it) => {
          const p = productById(it.productId)
          return (
            <div key={it.productId} className="flex items-center justify-between text-[14px]">
              <span>
                {p?.name} · {it.qtyKg} kg
              </span>
              <span className="tnum font-semibold">{money(it.qtyKg * it.unitPrice)}</span>
            </div>
          )
        })}
        <div className="flex items-center justify-between border-t border-border pt-2 text-[14px]">
          <span className="text-muted">Phí giao</span>
          <span className="tnum font-semibold">{live.shippingFee ? money(live.shippingFee) : '0 đ'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-semibold text-text">Tổng cộng</span>
          <span className="tnum text-[20px] font-bold text-primary">{money(orderTotal(live))}</span>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-[16px] font-bold text-text">Lịch sử đơn hàng</h2>
        <ol className="space-y-3">
          {live.history.map((h, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
              <div>
                <p className="text-[14px] font-semibold text-text">{orderStatusLabel[h.status]}</p>
                <p className="tnum text-[12.5px] text-muted">
                  {dateTime(h.at)} · {h.note}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link to="/account/orders">
          <Button variant="secondary">Đơn hàng của tôi</Button>
        </Link>
        {canCancel && (
          <Button variant="ghost" onClick={() => setCancelOpen(true)}>
            Hủy đơn
          </Button>
        )}
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Hủy đơn hàng?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              Giữ đơn
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setOrderStatus(live.id, 'Cancelled', 'Khách hủy đơn (demo).')
                pushToast('Đã hủy đơn (demo)', 'warning')
                setCancelOpen(false)
              }}
            >
              Xác nhận hủy
            </Button>
          </>
        }
      >
        <p className="text-[14px] text-muted">
          Đơn <strong className="tnum">{live.code}</strong> sẽ chuyển sang trạng thái “Đã hủy”. Kho sẽ được giải phóng
          nếu đơn đã giữ tồn. Đây là thao tác demo.
        </p>
      </Modal>
    </div>
  )
}
