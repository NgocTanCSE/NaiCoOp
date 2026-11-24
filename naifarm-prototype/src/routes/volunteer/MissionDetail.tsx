import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarClock, Clock, FileCheck2, MapPin, Send, Users } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { missionStatusLabel, missionStatusTone } from '../../lib/labels'
import { Badge, Button, Card, DemoTag, Field, Input, Notice, SectionHeader, Textarea } from '../../components/ui'

const flow = ['Assigned', 'InProgress', 'Submitted', 'BeneficiaryAccepted', 'Approved', 'Recorded']

export function MissionDetail() {
  const { farmById, missionById } = useData()
  const { id } = useParams()
  const navigate = useNavigate()
  const { missions, submissions, acceptMission, submitMission, pushToast } = useDemo()
  const mission = id ? missions.find((m) => m.id === id) ?? missionById(id) : undefined
  const [hours, setHours] = useState('2')
  const [note, setNote] = useState('')

  if (!mission) return <Notice tone="warning">Không tìm thấy nhiệm vụ.</Notice>

  const farm = farmById(mission.farmId)
  const sub = submissions.find((s) => s.missionId === mission.id)
  const currentIdx = flow.indexOf(mission.status)

  const canAccept = mission.status === 'Open'
  const canSubmit = mission.status === 'Assigned' || mission.status === 'InProgress' || mission.status === 'Revision'
  const waiting = mission.status === 'Submitted'
  const beneficiaryAccepted = mission.status === 'BeneficiaryAccepted'
  const recorded = mission.status === 'Recorded' || mission.status === 'Approved'

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <DemoTag />
        <Badge tone={missionStatusTone[mission.status]}>{missionStatusLabel[mission.status]}</Badge>
      </div>

      <div>
        <h1 className="font-display text-[26px] font-semibold text-text">{mission.title}</h1>
        <p className="mt-1 flex items-center gap-1 text-[14px] text-muted">
          <MapPin size={14} aria-hidden /> Người thụ hưởng: {farm?.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact icon={<Clock size={14} aria-hidden />} label="Ước tính" value={`${mission.expectedHours} giờ`} />
        <Fact icon={<CalendarClock size={14} aria-hidden />} label="Hạn" value={new Date(mission.dueDate).toLocaleDateString('vi-VN')} />
        <Fact label="Hình thức" value={mission.mode === 'online' ? 'Trực tuyến' : mission.mode === 'onsite' ? 'Tại chỗ' : 'Kết hợp'} />
        <Fact icon={<Users size={14} aria-hidden />} label="Số người" value={`${mission.slots}`} />
      </div>

      <Card className="space-y-2">
        <h2 className="text-[16px] font-bold text-text">Mục tiêu & đầu ra</h2>
        <p className="text-[14px] text-muted">{mission.goal}</p>
        <p className="text-[14px]">
          <span className="font-semibold text-text">Sản phẩm bàn giao: </span>
          <span className="text-muted">{mission.output}</span>
        </p>
      </Card>

      {/* Timeline */}
      <Card>
        <SectionHeader as="h3" title="Tiến trình nhiệm vụ" subtitle="Hai lớp xác nhận độc lập mới ghi giờ" />
        <ol className="space-y-4">
          {flow.map((s, i) => {
            const done = i <= currentIdx
            const isRevision = mission.status === 'Revision' && s === 'Submitted'
            return (
              <li key={s} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                    isRevision ? 'bg-danger-bg text-danger' : done ? 'bg-primary text-on-primary' : 'bg-surface-soft text-muted'
                  }`}
                >
                  {done && !isRevision ? '✓' : i + 1}
                </span>
                <div>
                  <p className={`text-[14px] font-semibold ${done || isRevision ? 'text-text' : 'text-muted'}`}>
                    {missionStatusLabel[s]}
                    {isRevision && ' → yêu cầu chỉnh sửa'}
                  </p>
                  {s === 'Submitted' && <p className="text-[12.5px] text-muted">Người nhận nộp minh chứng (riêng tư)</p>}
                  {s === 'BeneficiaryAccepted' && <p className="text-[12.5px] text-muted">Nhà vườn xác nhận đã nhận đầu ra</p>}
                  {s === 'Approved' && <p className="text-[12.5px] text-muted">Điều phối viên độc lập duyệt giờ (không phải người nộp)</p>}
                </div>
              </li>
            )
          })}
        </ol>
      </Card>

      {/* Submission evidence */}
      {sub && (
        <Card className="space-y-2">
          <h3 className="text-[15px] font-bold text-text">Minh chứng đã nộp (riêng tư)</h3>
          <ul className="list-inside list-disc text-[13.5px] text-muted">
            {sub.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="text-[13.5px] text-muted">Giờ thực tế: {sub.actualHours} giờ</p>
        </Card>
      )}

      {/* Actions */}
      {canAccept && (
        <Card className="space-y-3">
          <Notice tone="info">Nhiệm vụ tự nguyện. Bạn có thể nhận nếu phù hợp kỹ năng và thời gian.</Notice>
          <Button
            variant="farmer"
            fullWidth
            onClick={() => {
              acceptMission(mission.id)
              pushToast('Đã nhận nhiệm vụ', 'success')
            }}
          >
            Nhận nhiệm vụ
          </Button>
        </Card>
      )}

      {canSubmit && (
        <Card className="space-y-4">
          <h3 className="text-[16px] font-bold text-text">Nộp minh chứng</h3>
          <div className="rounded-md border-2 border-dashed border-border bg-background p-4 text-center text-[13.5px] text-muted">
            <FileCheck2 className="mx-auto mb-1 text-leaf" size={22} aria-hidden />
            Kéo thả hoặc chọn ảnh/file/link (minh chứng riêng tư)
          </div>
          <Field label="Giờ thực tế đã làm" htmlFor="hours">
            <Input id="hours" inputMode="numeric" value={hours} onChange={(e) => setHours(e.target.value)} />
          </Field>
          <Field label="Ghi chú bàn giao" htmlFor="note">
            <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mô tả ngắn sản phẩm bàn giao…" />
          </Field>
          <Button
            fullWidth
            onClick={() => {
              submitMission(mission.id, { note, hours: Number(hours) || 0 })
              pushToast('Đã nộp minh chứng. Chờ nhà vườn xác nhận đầu ra.', 'success')
            }}
          >
            <Send size={17} aria-hidden /> Nộp minh chứng
          </Button>
          <Button variant="ghost" fullWidth onClick={() => navigate('/volunteer')}>
            Về danh sách nhiệm vụ
          </Button>
        </Card>
      )}

      {waiting && (
        <Notice tone="warning">
          Đang chờ <strong>nhà vườn xác nhận đầu ra</strong>. Giờ chưa được cộng cho đến khi điều phối viên duyệt.
        </Notice>
      )}
      {beneficiaryAccepted && (
        <Notice tone="info">Nhà vườn đã xác nhận đầu ra. Đang chờ <strong>điều phối viên duyệt giờ</strong>.</Notice>
      )}
      {recorded && (
        <Notice tone="success">
          Đã ghi nhận <strong>{sub?.actualHours ?? mission.expectedHours} giờ</strong> vào hồ sơ năng lực của bạn.
        </Notice>
      )}
    </div>
  )
}

function Fact({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2">
      <p className="flex items-center gap-1 text-[12px] text-muted">
        {icon} {label}
      </p>
      <p className="tnum text-[14.5px] font-semibold text-text">{value}</p>
    </div>
  )
}
