import { useState } from 'react'
import { CalendarPlus, PlayCircle, Radio, XCircle } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { Badge, Button, Card, DemoTag, EmptyState, Field, Input, Notice, SectionHeader } from '../../components/ui'
import { dateTime } from '../../lib/format'
import type { Livestream } from '../../lib/seed'

const statusMeta: Record<string, { t: string; tone: 'success' | 'warning' | 'neutral' | 'danger' }> = {
  scheduled: { t: 'Sắp diễn ra', tone: 'warning' },
  live: { t: 'Đang diễn ra', tone: 'success' },
  ended: { t: 'Đã kết thúc (bản ghi)', tone: 'neutral' },
  cancelled: { t: 'Đã hủy', tone: 'danger' },
}

export function VolunteerLive() {
  const { farmById, farms, livestreams, productById, products } = useData()
  const { pushToast } = useDemo()
  const [list, setList] = useState<Livestream[]>(livestreams)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', farmId: farms[0].id, productId: 'P01', at: '2026-11-27T20:00' })

  function create() {
    const lv: Livestream = {
      id: `lv-${Date.now()}`,
      farmId: form.farmId,
      hostId: 'u-minh-anh',
      title: form.title,
      scheduledAt: new Date(form.at).toISOString(),
      durationMin: 45,
      status: 'scheduled',
      products: [form.productId],
    }
    setList((l) => [lv, ...l])
    setShowForm(false)
    setForm({ title: '', farmId: farms[0].id, productId: 'P01', at: '2026-11-27T20:00' })
    pushToast('Đã tạo lịch livestream (demo)', 'success')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <DemoTag />
        <span className="text-[13px] text-muted">Lịch livestream bán hàng của thanh niên hỗ trợ</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-[24px] font-semibold text-text">Lịch livestream</h1>
        <Button onClick={() => setShowForm((s) => !s)}>
          <CalendarPlus size={17} aria-hidden /> Tạo phiên mới
        </Button>
      </div>

      {showForm && (
        <Card className="space-y-3">
          <h2 className="text-[16px] font-bold text-text">Tạo phiên livestream</h2>
          <Field label="Tiêu đề" htmlFor="title">
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ví dụ: Live bán chôm chôm cùng Ba Tư" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Nhà vườn" htmlFor="farm">
              <select
                id="farm"
                value={form.farmId}
                onChange={(e) => setForm({ ...form, farmId: e.target.value })}
                className="h-12 w-full rounded-md border border-input-border bg-surface px-3 text-[14px]"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sản phẩm ghim" htmlFor="prod">
              <select
                id="prod"
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                className="h-12 w-full rounded-md border border-input-border bg-surface px-3 text-[14px]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Thời gian" htmlFor="at">
              <Input id="at" type="datetime-local" value={form.at} onChange={(e) => setForm({ ...form, at: e.target.value })} />
            </Field>
          </div>
          <Notice tone="info">
            P0 chỉ cần tạo lịch và liên kết sản phẩm. Phiên phát thật/replay là phạm vi P1 và sẽ ghi nhãn rõ “bản ghi/demo”.
          </Notice>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Hủy
            </Button>
            <Button disabled={!form.title.trim()} onClick={create}>
              Tạo lịch
            </Button>
          </div>
        </Card>
      )}

      <section>
        <SectionHeader as="h2" title="Danh sách phiên" />
        {list.length === 0 ? (
          <EmptyState icon={<Radio size={26} aria-hidden />} title="Chưa có phiên livestream" />
        ) : (
          <div className="space-y-3">
            {list.map((l) => {
              const farm = farmById(l.farmId)
              const p = productById(l.products[0])
              const st = statusMeta[l.status]
              return (
                <Card key={l.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[15px] font-semibold text-text">{l.title}</p>
                      <p className="text-[13px] text-muted">
                        {farm?.name} · {dateTime(l.scheduledAt)} · {l.durationMin} phút
                      </p>
                    </div>
                    <Badge tone={st.tone} icon={l.status === 'live' ? <Radio size={12} aria-hidden /> : <PlayCircle size={12} aria-hidden />}>
                      {st.t}
                    </Badge>
                  </div>
                  <p className="text-[13px] text-muted">Sản phẩm ghim: {p?.name ?? '—'}</p>
                  {l.status === 'scheduled' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => pushToast('Đã sửa lịch (demo)', 'info')}>
                        Sửa lịch
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setList((s) => s.map((x) => (x.id === l.id ? { ...x, status: 'cancelled' } : x)))
                          pushToast('Đã hủy phiên (demo)', 'warning')
                        }}
                      >
                        <XCircle size={15} aria-hidden /> Hủy
                      </Button>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
