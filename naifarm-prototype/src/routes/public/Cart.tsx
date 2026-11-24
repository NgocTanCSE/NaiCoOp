import { Link } from 'react-router-dom'
import { ShoppingBasket, Trash2 } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { Badge, Button, Card, DemoTag, EmptyState, QtyStepper } from '../../components/ui'
import { ProduceImage } from '../../components/domain'
import { money } from '../../lib/format'

export function Cart() {
  const { productById } = useData()
  const { cart, updateCartQty, removeFromCart, pushToast } = useDemo()

  if (cart.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBasket size={30} aria-hidden />}
        title="Giỏ hàng đang trống"
        description="Khám phá nông sản Đồng Nai và thêm vào giỏ để đặt hàng."
        action={
          <Link to="/">
            <Button>Khám phá nông sản</Button>
          </Link>
        }
      />
    )
  }

  const subtotal = cart.reduce((s, l) => {
    const p = productById(l.productId)
    return s + (p?.pricePerKg ?? 0) * l.qtyKg
  }, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold text-text">Giỏ hàng</h1>
          <DemoTag />
        </div>
        {cart.map((line) => {
          const p = productById(line.productId)
          if (!p) return null
          const overStock = line.qtyKg > p.stockKg
          return (
            <Card key={line.productId} className="flex gap-3">
              <ProduceImage seed={p.id} className="h-20 w-20 shrink-0" rounded="rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/products/${p.id}`} className="text-[15px] font-semibold text-text hover:text-primary">
                    {p.name}
                  </Link>
                  <button
                    aria-label={`Xóa ${p.name}`}
                    className="text-muted hover:text-danger"
                    onClick={() => removeFromCart(line.productId)}
                  >
                    <Trash2 size={17} aria-hidden />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <QtyStepper
                    value={line.qtyKg}
                    max={p.stockKg}
                    min={1}
                    onChange={(v) => updateCartQty(line.productId, v)}
                  />
                  <span className="tnum text-[16px] font-bold text-primary">{money(p.pricePerKg * line.qtyKg)}</span>
                </div>
                {overStock && <Badge tone="danger">Vượt tồn ({p.stockKg} kg)</Badge>}
              </div>
            </Card>
          )
        })}
      </div>

      <aside className="lg:sticky lg:top-32 lg:h-fit">
        <Card className="space-y-3">
          <h2 className="text-[16px] font-bold text-text">Tạm tính</h2>
          <Row label="Tiền hàng" value={money(subtotal)} />
          <Row label="Phí giao (demo)" value="Tính khi thanh toán" muted />
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-[14px] font-semibold text-text">Tổng tạm tính</span>
            <span className="tnum text-[20px] font-bold text-primary">{money(subtotal)}</span>
          </div>
          <Link to="/checkout">
            <Button variant="farmer" fullWidth>
              Tiến hành đặt hàng
            </Button>
          </Link>
          <Button variant="ghost" fullWidth onClick={() => pushToast('Đã lưu giỏ (demo)', 'info')}>
            Lưu giỏ để sau
          </Button>
        </Card>
      </aside>
    </div>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[14px]">
      <span className="text-muted">{label}</span>
      <span className={`tnum font-semibold ${muted ? 'text-muted' : 'text-text'}`}>{value}</span>
    </div>
  )
}
