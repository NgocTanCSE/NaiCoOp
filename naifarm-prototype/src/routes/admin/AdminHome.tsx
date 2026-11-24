import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Boxes, ClipboardList, KeyRound, ShieldCheck, Users } from 'lucide-react'
import { useData } from '../../lib/data'
import { Badge, Card, DemoTag, Notice, SectionHeader, Tabs } from '../../components/ui'

type Section = 'overview' | 'organizations' | 'data' | 'audit'

const auditLog = [
  { at: '2026-11-24 08:52', actor: 'Thu Hà (Điều phối)', action: 'Đối chiếu hồ sơ', entity: 'CERT/farm-an-lanh', reason: 'Đối chiếu tài liệu khớp chủ thể' },
  { at: '2026-11-23 16:00', actor: 'Chú Ba Tư', action: 'Xác nhận đơn', entity: 'ORDER/NF-ORD-DEMO-002', reason: '—' },
  { at: '2026-11-22 09:10', actor: 'Admin', action: 'Cấp grant', entity: 'GRANT/u-thu-ha/local_coordinator', reason: 'Giao phạm vi P-LONGKHANH' },
  { at: '2026-11-21 14:30', actor: 'Minh Anh', action: 'Nộp minh chứng', entity: 'SUB/sub-001', reason: '—' },
]

const grants = [
  { user: 'Thu Hà', workspace: 'W04', action: 'mission.review_hours', scope: 'P-LONGKHANH', expires: '2027-06-30', status: 'active' },
  { user: 'Minh Anh', workspace: 'W03', action: 'mission.accept', scope: 'program demo', expires: '2027-01-31', status: 'active' },
  { user: 'Chú Ba Tư', workspace: 'W02', action: 'product.publish', scope: 'farm-ba-tu-demo', expires: '—', status: 'active' },
]

export function AdminHome() {
  const { profiles, unitName } = useData()
  const { section } = useParams()
  const [tab, setTab] = useState<Section>('overview')

  useEffect(() => {
    if (section === 'organizations' || section === 'data' || section === 'audit') setTab(section)
  }, [section])

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center gap-2">
        <DemoTag />
        <span className="text-[13px] text-muted">W06 · Quản trị nền tảng (tối giản)</span>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { key: 'overview', label: 'Tổng quan' },
          { key: 'organizations', label: 'Tài khoản & tổ chức' },
          { key: 'data', label: 'Dữ liệu & cấu hình' },
          { key: 'audit', label: 'Kiểm toán' },
        ]}
      />

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric icon={<Users size={18} aria-hidden />} value={`${profiles.length}`} label="Tài khoản" />
            <Metric icon={<KeyRound size={18} aria-hidden />} value={`${grants.length}`} label="Grant đang hiệu lực" />
            <Metric icon={<ShieldCheck size={18} aria-hidden />} value="1" label="Tổ chức chờ xác minh" />
            <Metric icon={<Boxes size={18} aria-hidden />} value="10" label="Đơn vị địa bàn demo" />
          </div>
          <Notice tone="warning">
            Admin quản lý định danh, tổ chức, grant và an toàn. Admin <strong>không</strong> tự duyệt giờ, chấm điểm,
            cấp chứng nhận, sửa giá hay giao dịch. Quyền đặc biệt cần người duyệt khác và có kiểm toán.
          </Notice>
        </div>
      )}

      {tab === 'organizations' && (
        <Card className="space-y-3">
          <SectionHeader as="h2" title="Phân quyền & ủy quyền" subtitle="Grant theo scope, có thời hạn, không dùng role tự khai" />
          <div className="space-y-2">
            {grants.map((g, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background p-3 text-[13.5px]">
                <div>
                  <p className="font-semibold text-text">{g.user}</p>
                  <p className="text-muted">
                    {g.workspace} · <code>{g.action}</code> · {g.scope}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="success">{g.status}</Badge>
                  <span className="text-[12.5px] text-muted">HH: {g.expires}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'data' && (
        <Card className="space-y-3">
          <SectionHeader as="h2" title="Dữ liệu chuẩn & cấu hình" />
          <ul className="space-y-2 text-[13.5px] text-muted">
            <li>Đơn vị hành chính: dùng mã chính thức, có phiên bản GIS; không dùng sơ đồ minh họa như địa giới thực.</li>
            <li>Địa bàn demo hiện dùng: {unitName('P-LONGKHANH')} + tập đã đối chiếu (nhãn “phạm vi mở rộng 95 xã/phường”).</li>
            <li>AI/API quota, lưu trữ, streaming: secret đặt server-side, có fallback minh bạch.</li>
            <li>Môi trường demo tách khỏi dữ liệu thật; seed có thể reset.</li>
          </ul>
        </Card>
      )}

      {tab === 'audit' && (
        <Card>
          <SectionHeader as="h2" title="Nhật ký kiểm toán (chỉ đọc)" subtitle="Actor · thời gian · hành động · lý do" />
          <div className="no-scrollbar overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead className="text-muted">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-semibold">Thời gian</th>
                  <th className="py-2 pr-3 font-semibold">Người thực hiện</th>
                  <th className="py-2 pr-3 font-semibold">Hành động</th>
                  <th className="py-2 pr-3 font-semibold">Đối tượng</th>
                  <th className="py-2 font-semibold">Lý do</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((l, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="tnum py-2 pr-3 text-muted">{l.at}</td>
                    <td className="py-2 pr-3 text-text">{l.actor}</td>
                    <td className="py-2 pr-3 text-text">{l.action}</td>
                    <td className="tnum py-2 pr-3 text-muted">{l.entity}</td>
                    <td className="py-2 text-muted">{l.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex items-center gap-1 text-[12.5px] text-muted">
            <ClipboardList size={13} aria-hidden /> Audit append-only: không sửa hoặc xóa log.
          </p>
        </Card>
      )}
    </div>
  )
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Card className="space-y-1">
      <span className="text-leaf">{icon}</span>
      <p className="tnum text-[24px] font-bold text-text">{value}</p>
      <p className="text-[12.5px] text-muted">{label}</p>
    </Card>
  )
}
