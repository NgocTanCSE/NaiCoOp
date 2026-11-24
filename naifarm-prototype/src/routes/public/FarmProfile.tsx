import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, ChevronRight, MapPin, Radio, ShoppingBasket, Sparkles, Users } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { certLabel, certTone } from '../../lib/labels'
import { Badge, Button, Card, DemoTag, SectionHeader } from '../../components/ui'
import { PriceTag, ProduceImage } from '../../components/domain'
import { dateTime } from '../../lib/format'

export function FarmProfile() {
  const { certificates, farmById, livestreams, missions, productsByFarm } = useData()
  const { id } = useParams()
  const farm = id ? farmById(id) : undefined
  const { addToCart, pushToast } = useDemo()

  if (!farm) {
    return <p className="text-muted">Không tìm thấy nhà vườn.</p>
  }

  const farmProducts = productsByFarm(farm.id)
  const certs = certificates.filter((c) => c.farmId === farm.id)
  const farmMissions = missions.filter((m) => m.farmId === farm.id)
  const lives = livestreams.filter((l) => l.farmId === farm.id)

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-1 text-[13px] text-muted">
        <Link to="/" className="hover:text-primary">Chợ</Link>
        <ChevronRight size={13} aria-hidden />
        <Link to="/explore/map" className="hover:text-primary">Nhà vườn</Link>
        <ChevronRight size={13} aria-hidden />
        <span className="font-semibold text-text">{farm.name}</span>
      </nav>

      {/* Banner */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <ProduceImage seed={farm.id} label={farm.name} className="aspect-16/9 w-full md:aspect-16/6" rounded="rounded-none" />
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <DemoTag />
            <Badge tone={certTone[farm.certStatus] as never} icon={<BadgeCheck size={13} aria-hidden />}>
              {certLabel[farm.certStatus]}
            </Badge>
          </div>
          <h1 className="mt-2 font-display text-[28px] font-semibold text-text md:text-[34px]">{farm.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-[14px] text-muted">
            <MapPin size={15} aria-hidden /> {farm.address}
          </p>
          <p className="mt-4 max-w-[70ch] font-display text-[17px] leading-relaxed text-text/90">{farm.story}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Quy mô" value={`${farm.areaHa} ha`} />
            <Stat label="Cây chính" value={farm.crops.join(', ')} />
            <Stat label="Sản phẩm" value={`${farmProducts.length}`} />
            <Stat label="Đoàn viên hỗ trợ" value={`${new Set(farmMissions.map((m) => m.assigneeId).filter(Boolean)).size}`} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/explore/map">
              <Button variant="secondary">
                <MapPin size={16} aria-hidden /> Xem trên bản đồ
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => pushToast('Đã gửi yêu cầu quan tâm (demo)', 'info')}>
              Quan tâm nhà vườn
            </Button>
          </div>
        </div>
      </div>

      {/* Certificates */}
      <section>
        <SectionHeader title="Hồ sơ & chứng nhận" subtitle="Phân biệt rõ mức xác minh — không tự nhận đã xác minh" />
        {certs.length === 0 || certs.every((c) => c.verificationStatus === 'self_declared') ? (
          <Card className="flex items-start gap-3">
            <Sparkles size={18} className="mt-0.5 text-warning" aria-hidden />
            <div>
              <p className="text-[15px] font-semibold text-text">Chưa có chứng nhận được đối chiếu</p>
              <p className="mt-1 text-[13.5px] text-muted">
                Sản phẩm của nhà vườn hiển thị ở mức “Nhà vườn tự khai báo”. Điều phối viên địa bàn có thể đối chiếu
                tài liệu để nâng lên “Đã đối chiếu tài liệu”, nhưng không thay cơ quan có thẩm quyền cấp chứng nhận.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {certs.map((c) => (
              <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-text">{c.type}</p>
                  <p className="text-[13px] text-muted">
                    Đơn vị ghi nhận: {c.issuer} · Hiệu lực: {c.validity ?? '—'}
                  </p>
                </div>
                <Badge tone={certTone[c.verificationStatus] as never} icon={<BadgeCheck size={13} aria-hidden />}>
                  {certLabel[c.verificationStatus]}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Products */}
      <section>
        <SectionHeader title="Sản phẩm" subtitle={`${farmProducts.length} sản phẩm đang giới thiệu`} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {farmProducts.map((p) => {
            const buyable = p.season === 'in_season' && p.stockKg > 0
            return (
              <article key={p.id} className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
                <Link to={`/products/${p.id}`}>
                  <ProduceImage seed={p.id} label={p.name} className="aspect-4/3 w-full" rounded="rounded-none" />
                </Link>
                <div className="space-y-1.5 p-3">
                  <Link to={`/products/${p.id}`} className="line-clamp-2 text-[15px] font-semibold text-text hover:text-primary">
                    {p.name}
                  </Link>
                  <PriceTag pricePerKg={p.pricePerKg} />
                  {buyable ? (
                    <Button size="sm" onClick={() => { addToCart(p.id, 1); pushToast('Đã thêm 1 kg vào giỏ', 'success') }}>
                      <ShoppingBasket size={15} aria-hidden /> Thêm
                    </Button>
                  ) : (
                    <Badge tone="warning">Hẹn mùa</Badge>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Youth support + live */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <SectionHeader as="h3" title="Nhóm thanh niên đồng hành" />
          <ul className="space-y-2">
            {farmMissions.length === 0 && <li className="text-[13.5px] text-muted">Chưa có nhiệm vụ công khai.</li>}
            {farmMissions.map((m) => (
              <li key={m.id} className="flex items-center gap-2 text-[13.5px]">
                <Users size={15} className="text-leaf" aria-hidden />
                <span className="font-semibold text-text">{m.title}</span>
                <Badge tone="neutral">{m.skill}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionHeader as="h3" title="Lịch livestream" />
          {lives.length === 0 ? (
            <p className="text-[13.5px] text-muted">Chưa có lịch live.</p>
          ) : (
            <ul className="space-y-2">
              {lives.map((l) => (
                <li key={l.id} className="flex items-start gap-2 text-[13.5px]">
                  <Radio size={15} className="mt-0.5 text-primary" aria-hidden />
                  <div>
                    <p className="font-semibold text-text">{l.title}</p>
                    <p className="text-muted">
                      {dateTime(l.scheduledAt)} ·{' '}
                      {l.status === 'scheduled' ? 'Sắp diễn ra' : l.status === 'ended' ? 'Bản ghi' : 'Đang diễn ra'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="tnum text-[15px] font-semibold text-text">{value}</p>
    </div>
  )
}
