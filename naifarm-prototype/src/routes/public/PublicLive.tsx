import { Link } from 'react-router-dom'
import { PlayCircle, Radio, Sprout } from 'lucide-react'
import { useData } from '../../lib/data'
import type { Livestream } from '../../lib/seed'
import { Badge, Card, DemoTag, EmptyState, SectionHeader } from '../../components/ui'
import { ProduceImage } from '../../components/domain'
import { dateTime } from '../../lib/format'

const statusLabel: Record<string, { t: string; tone: 'success' | 'warning' | 'neutral' | 'danger' }> = {
  scheduled: { t: 'Sắp diễn ra', tone: 'warning' },
  live: { t: 'Đang diễn ra', tone: 'success' },
  ended: { t: 'Bản ghi (replay)', tone: 'neutral' },
  cancelled: { t: 'Đã hủy', tone: 'danger' },
}

export function PublicLive() {
  const { farmById, livestreams, productById } = useData()
  const upcoming = livestreams.filter((l) => l.status === 'scheduled' || l.status === 'live')
  const past = livestreams.filter((l) => l.status === 'ended' || l.status === 'cancelled')

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <h1 className="text-[24px] font-bold text-text">Livestream bán hàng, tham quan, học tập</h1>
        <DemoTag />
      </div>

      <section>
        <SectionHeader as="h2" title="Sắp diễn ra" />
        {upcoming.length === 0 ? (
          <EmptyState icon={<Radio size={26} aria-hidden />} title="Chưa có lịch live" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((l) => (
              <LiveCard key={l.id} l={l} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <SectionHeader as="h2" title="Đã phát (bản ghi)" subtitle="Nội dung ghi sẵn, không phải phát trực tiếp" />
          <div className="grid gap-4 md:grid-cols-2">
            {past.map((l) => (
              <LiveCard key={l.id} l={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function LiveCard({ l }: { l: Livestream }) {
  const { farmById, productById } = useData()
  const farm = farmById(l.farmId)
  const p = productById(l.products[0])
  const st = statusLabel[l.status]
  return (
    <Card className="flex gap-3">
      <ProduceImage seed={l.farmId + l.id} className="h-24 w-32 shrink-0" rounded="rounded-md" />
      <div className="flex flex-col gap-1.5">
        <Badge tone={st.tone} icon={l.status === 'live' ? <Radio size={12} aria-hidden /> : <PlayCircle size={12} aria-hidden />}>
          {st.t}
        </Badge>
        <p className="text-[15px] font-semibold leading-snug text-text">{l.title}</p>
        <p className="text-[13px] text-muted">
          {farm?.name} · {dateTime(l.scheduledAt)}
        </p>
        {p && (
          <Link to={`/products/${p.id}`} className="mt-auto flex items-center gap-1 text-[13px] font-semibold text-primary">
            <Sprout size={13} aria-hidden /> Ghim: {p.name}
          </Link>
        )}
      </div>
    </Card>
  )
}
