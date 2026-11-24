import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Store, Truck } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { Badge, Button, Card, DemoTag, Field, Input, Notice, Textarea } from '../../components/ui'
import { money } from '../../lib/format'

export function Checkout() {
  const { productById } = useData()
  const { cart, createOrder, pushToast } = useDemo()
  const navigate = useNavigate()
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (cart.length === 0) {
    return (
      <Notice tone="warning">
        Giỏ hàng trống. <Link to="/" className="underline">Về chợ</Link> để chọn sản phẩm.
      </Notice>
    )
  }

  const subtotal = cart.reduce((s, l) => s + (productById(l.productId)?.pricePerKg ?? 0) * l.qtyKg, 0)
  const shippingFee = fulfillment === 'delivery' ? 20000 : 0
  const total = subtotal + shippingFee
  const addressMissing = fulfillment === 'delivery' && address.trim().length < 5

  function submit() {
    setSubmitting(true)
    // server-side trong sản phẩm thật; demo mô phỏng một lần gửi
    window.setTimeout(() => {
      const order = createOrder({ fulfillment, shippingFee })
      pushToast(`Đã tạo đơn ${order.code} (demo)`, 'success')
      navigate(`/orders/${order.id}`)
    }, 500)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold text-text">Đặt hàng</h1>
          <DemoTag />
        </div>

        <Card className="space-y-3">
          <h2 className="text-[16px] font-bold text-text">Hình thức nhận hàng</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Choice
              active={fulfillment === 'delivery'}
              onClick={() => setFulfillment('delivery')}
              icon={<Truck size={18} aria-hidden />}
              title="Giao tận nơi"
              desc="Phí giao demo 20.000 đ"
            />
            <Choice
              active={fulfillment === 'pickup'}
              onClick={() => setFulfillment('pickup')}
              icon={<Store size={18} aria-hidden />}
              title="Nhận tại vườn/điểm nhận"
              desc="Phí 0 đ · Nhận tại Nhà vườn Ba Tư"
            />
          </div>

          {fulfillment === 'delivery' && (
            <Field
              label="Địa chỉ giao hàng"
              htmlFor="addr"
              error={addressMissing ? 'Vui lòng nhập địa chỉ giao hàng.' : undefined}
              hint="Chỉ thu thập địa chỉ khi bạn chọn giao tận nơi."
            >
              <Textarea
                id="addr"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              />
            </Field>
          )}

          <Field label="Ghi chú cho nhà vườn (không bắt buộc)" htmlFor="note">
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: giao buổi sáng" />
          </Field>
        </Card>

        <Card className="space-y-2">
          <h2 className="text-[16px] font-bold text-text">Sản phẩm</h2>
          {cart.map((l) => {
            const p = productById(l.productId)!
            return (
              <div key={l.productId} className="flex items-center justify-between text-[14px]">
                <span className="text-text">
                  {p.name} · {l.qtyKg} kg
                </span>
                <span className="tnum font-semibold">{money(p.pricePerKg * l.qtyKg)}</span>
              </div>
            )
          })}
          <p className="text-[12.5px] text-muted">Đơn demo giới hạn một nhà bán (Nhà vườn Ba Tư).</p>
        </Card>

        <Notice tone="warning">
          Thanh toán <strong>COD / mô phỏng</strong>. Hệ thống không thực hiện giao dịch thật trong bản demo.
        </Notice>
      </div>

      <aside className="lg:sticky lg:top-32 lg:h-fit">
        <Card className="space-y-3">
          <h2 className="text-[16px] font-bold text-text">Chi tiết thanh toán</h2>
          <Line label="Tiền hàng" value={money(subtotal)} />
          <Line label="Phí giao hàng" value={shippingFee ? money(shippingFee) : '0 đ'} />
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-[15px] font-semibold text-text">Tổng cộng</span>
            <span className="tnum text-[22px] font-bold text-primary">{money(total)}</span>
          </div>
          <Badge tone="info">Thanh toán: COD / demo</Badge>
          <Button variant="farmer" fullWidth disabled={addressMissing || submitting} onClick={submit}>
            {submitting ? 'Đang gửi đơn…' : 'Xác nhận đặt hàng'}
          </Button>
          {addressMissing && <p className="text-[12.5px] text-danger">Nhập địa chỉ giao hàng để tiếp tục.</p>}
          <p className="flex items-center gap-1 text-[12px] text-muted">
            <Home size={12} aria-hidden /> Dữ liệu của bạn chỉ dùng trong đơn hàng này.
          </p>
        </Card>
      </aside>
    </div>
  )
}

function Choice({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-start gap-3 rounded-md border p-3 text-left transition-colors ${
        active ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-surface-soft'
      }`}
    >
      <span className={`mt-0.5 ${active ? 'text-primary' : 'text-muted'}`}>{icon}</span>
      <span>
        <span className="block text-[14.5px] font-semibold text-text">{title}</span>
        <span className="block text-[12.5px] text-muted">{desc}</span>
      </span>
    </button>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[14px]">
      <span className="text-muted">{label}</span>
      <span className="tnum font-semibold text-text">{value}</span>
    </div>
  )
}
