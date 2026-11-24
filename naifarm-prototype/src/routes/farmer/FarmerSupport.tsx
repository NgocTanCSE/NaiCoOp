import { useState } from 'react'
import { BadgeCheck, BookOpen, HandHeart, Plus } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { missionStatusLabel, missionStatusTone, sourceStatusLabel } from '../../lib/labels'
import { Badge, Button, Card, DemoTag, Field, Input, Notice, SectionHeader, Textarea } from '../../components/ui'
import { Timeline } from '../../components/ui'
import { date } from '../../lib/format'

export function FarmerSupport() {
  const { batches, farmById, supportRequests } = useData()
  const { pushToast, missions: liveMissions, submissions, beneficiaryConfirm } = useDemo()
  const [form, setForm] = useState({ need: '', output: '', mode: 'trực tiếp', time: '' })
  const farm = farmById('farm-ba-tu-demo')
  const farmMissions = liveMissions.filter((m) => m.farmId === 'farm-ba-tu-demo')
  const batch = batches[0]
  const toConfirm = submissions.filter((s) => s.beneficiaryStatus !== 'accepted')

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <DemoTag />
      </div>

      {/* Nhật ký mùa vụ */}
      <section>
        <SectionHeader
          title="Nhật ký mùa vụ"
          subtitle={`Lô ${batch.publicCode} · ${sourceStatusLabel[batch.sourceStatus]}`}
        />
        <Card>
          <Timeline
            items={batch.diary.map((d) => ({
              title: d.note,
              meta: `${date(d.at)} · ${d.actor}${d.evidence ? ` · ${d.evidence}` : ''}`,
              tone: d.phase === 'thu_hoach' ? 'accent' : 'default',
            }))}
          />
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => pushToast('Thêm sự kiện nhật ký (demo)', 'info')}>
            <Plus size={15} aria-hidden /> Thêm sự kiện (ảnh/giọng nói)
          </Button>
        </Card>
      </section>

      {/* Xác nhận đầu ra của thanh niên (lớp 1/2) */}
      <section>
        <SectionHeader
          title="Xác nhận đầu ra của thanh niên"
          subtitle="Bước 1: chú xác nhận đã nhận đúng sản phẩm/đầu ra. Sau đó điều phối viên mới duyệt giờ (bước 2)."
        />
        {toConfirm.length === 0 ? (
          <Card className="text-[14px] text-muted">
            Không có minh chứng nào đang chờ xác nhận. Minh chứng đã xác nhận sẽ chuyển sang điều phối duyệt giờ.
          </Card>
        ) : (
          <div className="space-y-3">
            {toConfirm.map((sub) => {
              const m = liveMissions.find((x) => x.id === sub.missionId)
              return (
                <Card key={sub.id} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[15px] font-semibold text-text">{m?.title ?? 'Nhiệm vụ'}</p>
                      <p className="text-[13px] text-muted">{sub.outputNote}</p>
                    </div>
                    <Badge tone={sub.beneficiaryStatus === 'accepted' ? 'success' : 'warning'}>
                      {sub.beneficiaryStatus === 'accepted' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                    </Badge>
                  </div>
                  <ul className="list-inside list-disc text-[13.5px] text-muted">
                    {sub.evidence.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                  <Button
                    variant="farmer"
                    fullWidth
                    onClick={() => {
                      beneficiaryConfirm(sub.id)
                      pushToast('Đã xác nhận nhận đầu ra. Chuyển điều phối duyệt giờ (demo).', 'success')
                    }}
                  >
                    <BadgeCheck size={20} aria-hidden /> Xác nhận đã nhận đầu ra
                  </Button>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Yêu cầu hỗ trợ */}
      <section>
        <SectionHeader title="Nhờ thanh niên giúp" subtitle="Nêu rõ việc cần làm và kết quả mong muốn" />
        <Card className="space-y-4">
          <Field label="Chú cần giúp việc gì?" htmlFor="need">
            <Textarea
              id="need"
              value={form.need}
              onChange={(e) => setForm({ ...form, need: e.target.value })}
              placeholder="Ví dụ: chụp ảnh và viết mô tả cho 3 sản phẩm mới"
            />
          </Field>
          <Field label="Kết quả mong muốn" htmlFor="output">
            <Input
              id="output"
              value={form.output}
              onChange={(e) => setForm({ ...form, output: e.target.value })}
              placeholder="Ví dụ: 3 hồ sơ sản phẩm hoàn chỉnh"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Hình thức" htmlFor="mode">
              <select
                id="mode"
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                className="h-12 w-full rounded-md border border-input-border bg-surface px-3 text-[15px]"
              >
                <option>trực tiếp</option>
                <option>trực tuyến</option>
                <option>kết hợp</option>
              </select>
            </Field>
            <Field label="Thời gian mong muốn" htmlFor="time">
              <Input id="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="Ví dụ: trong tuần này" />
            </Field>
          </div>
          <Button
            variant="farmer"
            fullWidth
            disabled={!form.need.trim()}
            onClick={() => {
              pushToast('Đã gửi yêu cầu hỗ trợ (demo). Điều phối sẽ xem và ghép người.', 'success')
              setForm({ need: '', output: '', mode: 'trực tiếp', time: '' })
            }}
          >
            <HandHeart size={20} aria-hidden /> Gửi yêu cầu hỗ trợ
          </Button>
          <Notice tone="info">
            Yêu cầu sẽ được điều phối viên xã/phường kiểm tra phạm vi an toàn trước khi mở nhiệm vụ.
          </Notice>
        </Card>
      </section>

      {/* Danh sách yêu cầu + nhiệm vụ */}
      <section>
        <SectionHeader title="Yêu cầu & nhiệm vụ của vườn" />
        <div className="space-y-3">
          {supportRequests.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-semibold text-text">{r.title}</p>
                <Badge tone="info">{r.status}</Badge>
              </div>
              <p className="mt-1 text-[13.5px] text-muted">{r.need}</p>
            </Card>
          ))}
          {farmMissions.map((m) => (
            <Card key={m.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold text-text">{m.title}</p>
                <p className="text-[13px] text-muted">
                  {m.mode === 'online' ? 'Trực tuyến' : m.mode === 'onsite' ? 'Tại chỗ' : 'Kết hợp'} · {m.expectedHours} giờ
                </p>
              </div>
              <Badge tone={missionStatusTone[m.status]}>{missionStatusLabel[m.status]}</Badge>
            </Card>
          ))}
        </div>
      </section>

      <Card className="flex items-center gap-3 bg-surface-soft">
        <BookOpen size={18} className="text-primary" aria-hidden />
        <p className="text-[13.5px] text-muted">
          Sau khi được hỗ trợ, chú sẽ thực hiện lại thao tác để tạo <strong>Farmer Pass</strong> dựa trên năng lực thật.
        </p>
      </Card>
      {farm && <span className="sr-only">{farm.name}</span>}
    </div>
  )
}
