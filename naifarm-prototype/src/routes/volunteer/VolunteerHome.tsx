import { useMemo, useState } from 'react'
import { Award, Clock, ListTodo, Sparkles } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { missionStatusLabel, missionStatusTone } from '../../lib/labels'
import { Badge, Card, DemoTag, EmptyState, SectionHeader, Tabs } from '../../components/ui'
import { MissionCard } from '../../components/domain'

const modeFilters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'online', label: 'Trực tuyến' },
  { key: 'onsite', label: 'Tại chỗ' },
  { key: 'hybrid', label: 'Kết hợp' },
] as const

export function VolunteerHome() {
  const { missions, logs } = useDemo()
  const [mode, setMode] = useState<(typeof modeFilters)[number]['key']>('all')
  const me = 'u-minh-anh'

  const shown = useMemo(
    () => missions.filter((m) => (mode === 'all' ? true : m.mode === mode)),
    [missions, mode],
  )
  const mine = missions.filter((m) => m.assigneeId === me)
  const approvedMin = logs
    .filter((l) => l.volunteerId === me)
    .reduce((s, l) => s + l.approvedMinutes, 0)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <DemoTag />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-[26px] font-semibold text-text">Xin chào, Minh Anh</h1>
          <p className="mt-1 text-[14px] text-muted">Tìm nhiệm vụ phù hợp kỹ năng và lịch rảnh của bạn.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={<ListTodo size={18} aria-hidden />} value={`${mine.length}`} label="Nhiệm vụ của tôi" />
        <Stat icon={<Clock size={18} aria-hidden />} value={`${Math.round(approvedMin / 60)}h`} label="Giờ đã duyệt" />
        <Stat icon={<Award size={18} aria-hidden />} value="2" label="Kỹ năng" />
      </div>

      <section>
        <SectionHeader title="Nhiệm vụ đang mở" subtitle="Nhiệm vụ có người thụ hưởng, đầu ra và hạn rõ ràng" />
        <Tabs tabs={modeFilters.map((m) => ({ key: m.key, label: m.label }))} value={mode} onChange={setMode} />
        <div className="mt-4 space-y-3">
          {shown.length === 0 ? (
            <EmptyState title="Không có nhiệm vụ phù hợp" description="Thử đổi bộ lọc hình thức." />
          ) : (
            shown.map((m) => <MissionCard key={m.id} mission={m} showAssignee />)
          )}
        </div>
      </section>

      <section>
        <SectionHeader title="Nhiệm vụ của tôi" />
        <div className="space-y-3">
          {mine.length === 0 ? (
            <EmptyState title="Bạn chưa nhận nhiệm vụ nào" description="Chọn một nhiệm vụ ở trên để bắt đầu." />
          ) : (
            mine.map((m) => (
              <Card key={m.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-text">{m.title}</p>
                  <p className="text-[13px] text-muted">{m.expectedHours} giờ · hạn {new Date(m.dueDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <Badge tone={missionStatusTone[m.status]}>{missionStatusLabel[m.status]}</Badge>
              </Card>
            ))
          )}
        </div>
      </section>

      <Card className="flex items-start gap-3 bg-surface-soft">
        <Sparkles size={18} className="mt-0.5 text-primary" aria-hidden />
        <p className="text-[13.5px] text-muted">
          Giờ tình nguyện chỉ được ghi nhận sau <strong>hai lớp xác nhận</strong>: nhà vườn xác nhận đầu ra và điều phối
          viên kiểm tra minh chứng. Bạn không thể tự duyệt giờ của mình.
        </p>
      </Card>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-leaf">{icon}</span>
      <span className="tnum text-[22px] font-bold text-text">{value}</span>
      <span className="text-[12.5px] text-muted">{label}</span>
    </Card>
  )
}
