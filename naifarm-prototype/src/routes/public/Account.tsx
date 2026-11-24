import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, MapPin, ShieldCheck, User } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { Badge, Card, DemoTag, EmptyState, Notice, Tabs } from '../../components/ui'
import { OrderSummaryLine } from '../../components/domain'
import { money } from '../../lib/format'

export function Account({ tab = 'profile' }: { tab?: 'profile' | 'orders' }) {
  const { orders: seedOrders, orderTotal, profileById } = useData()
  const { orders, currentUserId } = useDemo()
  const me = profileById(currentUserId)
  const [active, setActive] = useState<'profile' | 'orders' | 'family'>(tab)
  const mine = orders.filter((o) => o.customerId === 'u-ngoc-linh')
  const totalSpent = seedOrders.reduce((s, o) => s + (o.status === 'Completed' ? orderTotal(o) : 0), 0)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User size={22} aria-hidden />
        </span>
        <div>
          <h1 className="text-[22px] font-bold text-text">{me?.displayName}</h1>
          <p className="text-[13px] text-muted">{me?.home ?? 'Đồng Nai'} · Tài khoản cá nhân (W01)</p>
        </div>
        <DemoTag className="ml-auto" />
      </div>

      <Tabs
        value={active}
        onChange={setActive}
        tabs={[
          { key: 'profile', label: 'Cá nhân' },
          { key: 'orders', label: 'Đơn & lịch' },
          { key: 'family', label: 'Gia đình' },
        ]}
      />

      {active === 'profile' && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <h2 className="text-[16px] font-bold text-text">Thông tin của tôi</h2>
            <Field label="Họ tên" value={me?.displayName ?? ''} />
            <Field label="Điện thoại" value="Ẩn trong bản demo" muted />
            <Field label="Khu vực" value={me?.home ?? 'Chưa cập nhật'} />
          </Card>
          <Card className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-leaf" aria-hidden />
            <div>
              <p className="text-[14.5px] font-semibold text-text">Quyền riêng tư</p>
              <p className="text-[13px] text-muted">
                Bạn kiểm soát dữ liệu của mình: xem, chỉnh, xóa và quản lý thông báo. Dữ liệu trẻ em được bảo vệ riêng.
              </p>
            </div>
          </Card>
        </div>
      )}

      {active === 'orders' && (
        <div className="space-y-3">
          {mine.length === 0 ? (
            <EmptyState title="Chưa có đơn hàng" description="Đơn hàng của bạn sẽ xuất hiện ở đây." />
          ) : (
            mine.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="block">
                <Card className="transition-shadow hover:shadow-raised">
                  <OrderSummaryLine order={o} />
                  <p className="tnum mt-2 text-[13px] text-muted">
                    {o.items.reduce((s, i) => s + i.qtyKg, 0)} kg · {money(orderTotal(o))}
                  </p>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {active === 'family' && (
        <Card className="space-y-3">
          <h2 className="text-[16px] font-bold text-text">Giám hộ</h2>
          <p className="text-[13.5px] text-muted">
            Nếu bạn là người giám hộ cho trẻ tham gia chương trình giáo dục, bạn xem được hoạt động được giao và đồng ý
            hoặc rút đồng ý cho từng hoạt động. Không xem dữ liệu trẻ khác.
          </p>
          <Notice tone="info">
            Tính năng giám hộ là phạm vi mở rộng (P2) trong bản đặc tả; hiển thị minh họa.
          </Notice>
          <div className="flex flex-wrap gap-2 text-[13px] text-muted">
            <Badge tone="neutral" icon={<Bell size={13} aria-hidden />}>
              Thông báo liên quan trẻ
            </Badge>
            <Badge tone="neutral" icon={<MapPin size={13} aria-hidden />}>
              Hoạt động & lịch
            </Badge>
          </div>
        </Card>
      )}

      {active === 'profile' && (
        <p className="flex items-center gap-1 text-[13px] text-muted">
          Tổng chi tiêu (đơn hoàn thành, demo): <span className="tnum font-semibold">{money(totalSpent)}</span>
        </p>
      )}
    </div>
  )
}

function Field({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 text-[14px] last:border-0">
      <span className="text-muted">{label}</span>
      <span className={`font-semibold ${muted ? 'text-muted' : 'text-text'}`}>{value}</span>
    </div>
  )
}
