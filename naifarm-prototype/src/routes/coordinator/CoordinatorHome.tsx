import { Link } from 'react-router-dom'
import { BadgeCheck, ClipboardCheck, FileSearch, ListChecks, MapPin, TrendingUp, Users } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { Badge, Card, DemoTag, Notice, SectionHeader } from '../../components/ui'
import { orderStatusLabel, orderStatusTone, certLabel } from '../../lib/labels'
import { money } from '../../lib/format'

export function CoordinatorHome() {
  const { farmById, farms, profileById, productById, orderTotal } = useData()
  const { missions, submissions, orders, workspace } = useDemo()
  const me = profileById('u-thu-ha')

  const openMissions = missions.filter((m) => m.status === 'Open')
  const pendingSubs = submissions.filter((s) => s.reviewStatus === 'pending')
  const certsToReview = 1
  const farmsInUnit = farms.filter((f) => f.unitCode === 'P-LONGKHANH')
  const farmOrders = orders.filter((o) => o.farmId === 'farm-ba-tu-demo')

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <DemoTag />
        <Badge tone="primary" icon={<MapPin size={12} aria-hidden />}>
          {me?.unitCode ? 'Phường Long Khánh' : 'Chưa gán địa bàn'}
        </Badge>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-semibold text-text md:text-[30px]">Bảng điều phối địa bàn</h1>
          <p className="mt-1 max-w-[60ch] text-[14px] text-muted">
            Xử lý hồ sơ, ghép nhiệm vụ và duyệt giờ trong phạm vi được giao. Mọi thao tác đều ghi nhật ký kiểm toán.
          </p>
        </div>
        <Link to="/coordinator/missions">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-[13px] font-semibold text-primary">
            <TrendingUp size={14} aria-hidden /> {pendingSubs.length} việc chờ xử lý
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi icon={<ListChecks size={18} aria-hidden />} value={openMissions.length} label="Nhiệm vụ chưa có người nhận" tone="info" />
        <Kpi icon={<ClipboardCheck size={18} aria-hidden />} value={pendingSubs.length} label="Minh chứng chờ duyệt giờ" tone="warning" />
        <Kpi icon={<FileSearch size={18} aria-hidden />} value={certsToReview} label="Hồ sơ chờ đối chiếu" tone="gold" />
        <Kpi icon={<Users size={18} aria-hidden />} value={farmsInUnit.length} label="Nhà vườn trên địa bàn" tone="success" />
      </div>

      {/* Orders table */}
      <Card className="space-y-3 p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            <p className="text-[15px] font-bold text-text">Đơn hàng của địa bàn</p>
            <p className="text-[12.5px] text-muted">{farmOrders.length} đơn · cập nhật theo trạng thái</p>
          </div>
          <Badge tone="neutral">Dữ liệu demo</Badge>
        </div>
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[13px]">
            <thead className="bg-surface-soft/60 text-muted">
              <tr>
                <th className="px-4 py-2 font-semibold">Mã đơn</th>
                <th className="px-4 py-2 font-semibold">Nông sản</th>
                <th className="px-4 py-2 font-semibold">Sản lượng</th>
                <th className="px-4 py-2 font-semibold">Giá trị</th>
                <th className="px-4 py-2 font-semibold">Nhận hàng</th>
                <th className="px-4 py-2 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {farmOrders.map((o) => {
                const p = productById(o.items[0]?.productId ?? '')
                const qty = o.items.reduce((s, i) => s + i.qtyKg, 0)
                return (
                  <tr key={o.id} className="border-b border-border/60 last:border-0">
                    <td className="tnum px-4 py-2.5 font-semibold text-text">{o.code}</td>
                    <td className="px-4 py-2.5 text-text">{p?.name ?? '—'}</td>
                    <td className="tnum px-4 py-2.5 text-muted">{qty} kg</td>
                    <td className="tnum px-4 py-2.5 font-semibold text-text">{money(orderTotal(o))}</td>
                    <td className="px-4 py-2.5 text-muted">{o.fulfillment === 'delivery' ? 'Giao tận nơi' : 'Nhận tại vườn'}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <SectionHeader as="h2" title="Việc cần xử lý" />
          <ul className="divide-y divide-border text-[14px]">
            <li className="flex items-center justify-between py-2">
              <span className="text-text">Đối chiếu hồ sơ Nhà vườn Ba Tư</span>
              <Link to="/coordinator/verifications" className="text-[13.5px] font-semibold text-primary">Mở</Link>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-text">Duyệt giờ nhiệm vụ “Số hóa 5 sản phẩm”</span>
              <Link to="/coordinator/missions" className="text-[13.5px] font-semibold text-primary">Mở</Link>
            </li>
            <li className="flex items-center justify-between py-2">
              <span className="text-text">Nhiệm vụ “Thiết kế bao bì hạt điều”</span>
              <Badge tone="info">Chờ ghép</Badge>
            </li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <SectionHeader as="h2" title="Cộng đồng địa bàn" />
          <ul className="divide-y divide-border">
            {farmsInUnit.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-2 text-[14px]">
                <span className="text-text">{f.name}</span>
                <Badge tone={f.certStatus === 'self_declared' ? 'warning' : 'neutral'}>
                  {f.certStatus === 'self_declared' ? 'Tự khai báo' : certLabel[f.certStatus]}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Notice tone="warning">
        Bạn chỉ <strong>đối chiếu tài liệu</strong> và <strong>duyệt giờ theo hai lớp</strong>. Không cấp chứng nhận
        OCOP/VietGAP, không sửa giá/đơn, không tự duyệt nhiệm vụ do chính mình thực hiện. Workspace: {workspace}.
      </Notice>

      <Card className="flex items-center gap-3 bg-surface-soft">
        <BadgeCheck size={18} className="text-primary" aria-hidden />
        <p className="text-[13.5px] text-muted">
          Mọi thao tác duyệt, từ chối hoặc thu hồi đều được ghi vào nhật ký kiểm toán kèm người thực hiện, thời gian, lý do.
        </p>
      </Card>
      <span className="sr-only">{farmById('farm-ba-tu-demo')?.name}</span>
    </div>
  )
}

function Kpi({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode
  value: number
  label: string
  tone: 'info' | 'warning' | 'gold' | 'success'
}) {
  const bg = {
    info: 'bg-info-bg text-info',
    warning: 'bg-warning-bg text-warning',
    gold: 'bg-gold-soft text-gold-ink',
    success: 'bg-success-bg text-success',
  }[tone]
  return (
    <Card className="space-y-2">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>{icon}</span>
      <p className="tnum text-[28px] font-bold leading-none text-text">{value}</p>
      <p className="text-[12.5px] leading-snug text-muted">{label}</p>
    </Card>
  )
}