import { Link } from 'react-router-dom'
import {
  BellRing,
  CalendarDays,
  BookOpen,
  Camera,
  GraduationCap,
  HandHeart,
  NotebookPen,
  Package,
  Radio,
  ShoppingBag,
} from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { Badge, Button, Card, DemoTag } from '../../components/ui'
import { ProduceImage } from '../../components/domain'

export function FarmerHome() {
  const { ordersByFarm, productsByFarm } = useData()
  const { orders } = useDemo()
  const pending = orders.filter((o) => o.farmId === 'farm-ba-tu-demo' && o.status === 'Pending')
  const products = productsByFarm('farm-ba-tu-demo')

  const shortcuts = [
    { to: '/farmer/support', icon: NotebookPen, label: 'Nhật ký mùa vụ' },
    { to: '/farmer/support', icon: HandHeart, label: 'Nhờ thanh niên' },
    { to: '/volunteer/live', icon: Radio, label: 'Lịch livestream' },
    { to: '/farmer/products/new', icon: GraduationCap, label: 'Học cách bán' },
    { to: '/farmer/orders', icon: Package, label: 'Đơn & đóng gói' },
    { to: '/farmer/products/new', icon: CalendarDays, label: 'Lịch mùa vụ' },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <DemoTag />
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[30px] font-semibold text-text">Chào chú Ba Tư!</h1>
          <p className="mt-1 text-[18px] text-muted">Hôm nay chú cần bán gì ạ?</p>
        </div>
        <button className="relative flex h-12 w-12 items-center justify-center rounded-full bg-surface-soft text-text" aria-label="Thông báo">
          <BellRing size={22} aria-hidden />
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
        </button>
      </div>

      {/* Bảng tóm tắt lớn */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-bg text-warning">
            <ShoppingBag size={22} aria-hidden />
          </span>
          <div>
            <p className="tnum text-[26px] font-bold leading-none text-text">{pending.length}</p>
            <p className="text-[15px] text-muted">đơn chờ xác nhận</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-success">
            <Package size={22} aria-hidden />
          </span>
          <div>
            <p className="tnum text-[26px] font-bold leading-none text-text">{products.length}</p>
            <p className="text-[15px] text-muted">sản phẩm</p>
          </div>
        </Card>
      </div>

      {/* CTA lớn */}
      <Link to="/farmer/products/new" className="block">
        <div className="flex items-center gap-4 rounded-xl border border-primary bg-primary p-5 text-on-primary shadow-raised transition-transform active:scale-[.99]">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
            <Camera size={30} aria-hidden />
          </span>
          <div>
            <p className="text-[20px] font-bold leading-tight">Chụp ảnh / Nói để đăng sản phẩm</p>
            <p className="text-[15px] text-white/85">Chỉ 3 bước: chụp ảnh → nói thông tin → kiểm tra và đăng</p>
          </div>
        </div>
      </Link>

      {/* Lối tắt lớn */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shortcuts.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.label}
              to={s.to}
              className="flex min-h-24 flex-col items-start justify-between gap-2 rounded-lg border border-border bg-surface p-4 shadow-card transition-transform active:scale-[.98]"
            >
              <Icon size={26} className="text-primary" aria-hidden />
              <span className="text-[16px] font-semibold text-text">{s.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Đơn chờ */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[22px] font-bold text-text">Đơn chờ xác nhận</h2>
          <Link to="/farmer/orders" className="text-[15px] font-semibold text-primary">
            Xem tất cả
          </Link>
        </div>
        {pending.length === 0 ? (
          <Card className="text-[16px] text-muted">Hôm nay chưa có đơn mới.</Card>
        ) : (
          <div className="space-y-3">
            {pending.map((o) => (
              <Card key={o.id} className="flex items-center gap-3">
                <ProduceImage seed={o.id} className="h-14 w-14 shrink-0" rounded="rounded-md" />
                <div className="flex-1">
                  <p className="tnum text-[16px] font-semibold text-text">{o.code}</p>
                  <p className="text-[14px] text-muted">
                    {o.items.reduce((s, i) => s + i.qtyKg, 0)} kg · {o.fulfillment === 'delivery' ? 'Giao tận nơi' : 'Nhận tại vườn'}
                  </p>
                </div>
                <Badge tone="warning">Chờ xác nhận</Badge>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Link to="/farmer/products/new">
        <Button variant="secondary" fullWidth>
          <BookOpen size={18} aria-hidden /> Xem bài hướng dẫn ngắn
        </Button>
      </Link>
    </div>
  )
}
