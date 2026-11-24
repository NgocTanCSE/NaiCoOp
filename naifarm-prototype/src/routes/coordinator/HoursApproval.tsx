import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, FileCheck2, ShieldX } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { missionStatusLabel, missionStatusTone } from '../../lib/labels'
import { Badge, Button, Card, DemoTag, Field, Notice, SectionHeader, Textarea } from '../../components/ui'

export function HoursApproval() {
  const { farmById, missionById } = useData()
  const { submissions, missions, reviewHours, pushToast } = useDemo()
  const [notes, setNotes] = useState<Record<string, string>>({})
  const reviewer = 'u-thu-ha'

  const queue = submissions.filter((s) => {
    const m = missions.find((x) => x.id === s.missionId)
    return m && (m.status === 'Submitted' || m.status === 'BeneficiaryAccepted' || s.reviewStatus === 'pending')
  })

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <DemoTag />
        <span className="text-[13px] text-muted">Duyệt minh chứng & giờ tình nguyện</span>
      </div>

      <Notice tone="info">
        Quy tắc: nhà vườn xác nhận đầu ra <strong>trước</strong>, sau đó điều phối viên độc lập kiểm minh chứng và duyệt
        giờ. Người nộp không thể tự duyệt giờ của mình.
      </Notice>

      {queue.length === 0 ? (
        <Card className="text-[14px] text-muted">Không có minh chứng chờ duyệt.</Card>
      ) : (
        queue.map((sub) => {
          const m = missions.find((x) => x.id === sub.missionId)!
          const farm = farmById(m.farmId)
          const selfApproval = m.assigneeId === reviewer
          const canApprove = sub.beneficiaryStatus === 'accepted' && !selfApproval
          return (
            <Card key={sub.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-bold text-text">{m.title}</h2>
                  <p className="text-[13px] text-muted">Người thụ hưởng: {farm?.name}</p>
                </div>
                <Badge tone={missionStatusTone[m.status]}>{missionStatusLabel[m.status]}</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="flex items-center gap-1 text-[12.5px] font-semibold text-muted">
                    <FileCheck2 size={13} aria-hidden /> Sản phẩm bàn giao
                  </p>
                  <ul className="mt-1 list-inside list-disc text-[13.5px] text-text">
                    {sub.evidence.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                  <p className="mt-1 text-[13px] text-muted">{sub.outputNote}</p>
                </div>
                <div className="rounded-md border border-border bg-background p-3">
                  <p className="text-[12.5px] font-semibold text-muted">Xác nhận hai lớp</p>
                  <div className="mt-1 space-y-1 text-[13.5px]">
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Nhà vườn xác nhận đầu ra</span>
                      <Badge tone={sub.beneficiaryStatus === 'accepted' ? 'success' : 'warning'}>
                        {sub.beneficiaryStatus === 'accepted' ? 'Đã xác nhận' : 'Chưa'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Giờ thực tế</span>
                      <span className="tnum font-semibold text-text">{sub.actualHours} giờ</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Người nhận nhiệm vụ</span>
                      <span className="font-semibold text-text">{selfApproval ? 'Chính bạn' : 'Minh Anh'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selfApproval && (
                <Notice tone="danger">
                  <span className="flex items-center gap-1">
                    <ShieldX size={15} aria-hidden /> Bạn là người nhận nhiệm vụ này.
                  </span>
                  <p className="mt-1">Không thể tự duyệt giờ. Nút duyệt đã bị khóa và yêu cầu chuyển người phụ trách khác.</p>
                </Notice>
              )}

              <Field label="Ghi chú duyệt / lý do yêu cầu sửa" htmlFor={`n-${sub.id}`}>
                <Textarea
                  id={`n-${sub.id}`}
                  value={notes[sub.id] ?? ''}
                  onChange={(e) => setNotes({ ...notes, [sub.id]: e.target.value })}
                  placeholder="Ví dụ: minh chứng đủ, giờ hợp lý / cần bổ sung ảnh bàn giao"
                />
              </Field>

              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!canApprove}
                  onClick={() => {
                    reviewHours(sub.id, 'approved', notes[sub.id] ?? '')
                    pushToast(`Đã duyệt ${sub.actualHours} giờ cho Minh Anh (demo)`, 'success')
                  }}
                >
                  <CheckCircle2 size={16} aria-hidden /> Duyệt giờ
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    reviewHours(sub.id, 'revision', notes[sub.id] ?? '')
                    pushToast('Đã yêu cầu chỉnh sửa minh chứng (demo)', 'warning')
                  }}
                >
                  <AlertTriangle size={16} aria-hidden /> Yêu cầu chỉnh sửa
                </Button>
                <span className="flex items-center gap-1 text-[12.5px] text-muted">
                  <Clock3 size={14} aria-hidden /> Cộng giờ một lần sau khi duyệt
                </span>
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}
