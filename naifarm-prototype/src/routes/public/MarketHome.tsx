import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, MapPin, PlayCircle, QrCode, Radio, RefreshCw, ScanLine, Search, Sparkles, TriangleAlert } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { Badge, Button, Card, Chip, DemoTag, EmptyState, ErrorState, SectionHeader, Skeleton } from '../../components/ui'
import { PriceTag, ProduceImage } from '../../components/domain'
import { dateTime } from '../../lib/format'

const categories = ['Tất cả', 'Trái cây', 'Hạt'] as const

export function MarketHome() {
  const { farms, livestreams, products, productsByFarm } = useData()
  const { pushToast } = useDemo()
  const [params] = useSearchParams()
  const initialQ = params.get('q') ?? ''
  const [q, setQ] = useState(initialQ)
  const [cat, setCat] = useState<string>('Tất cả')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const countByCat = useMemo(() => {
    const m: Record<string, number> = { 'Tất cả': products.length }
    for (const p of products) m[p.category] = (m[p.category] ?? 0) + 1
    return m
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const okCat = cat === 'Tất cả' || p.category === cat
      const okQ = !q.trim() || p.name.toLowerCase().includes(q.toLowerCase())
      return okCat && okQ
    })
  }, [q, cat])

  const featuredFarms = farms.slice(0, 4)
  const upcomingLives = livestreams.filter((l) => l.status === 'scheduled' || l.status === 'live').slice(0, 2)

  return (
    <div className="space-y-12">
      {/* Hero 60/40 */}
      <section className="grid items-center gap-6 md:grid-cols-[3fr_2fr]">
        <div>
          <Badge tone="gold" icon={<Sparkles size={13} aria-hidden />}>
            Chợ OCOP Thanh niên · Đồng Nai
          </Badge>
          <h1 className="mt-4 font-display text-[32px] font-semibold leading-[1.12] text-text md:text-[46px]">
            Nông sản Đồng Nai
            <span className="text-primary"> — minh bạch</span> từ vườn đến bàn ăn
          </h1>
          <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-muted md:text-[17px]">
            Kết nối trực tiếp nhà vườn và người mua, minh bạch nguồn gốc qua hộ chiếu số. Đồng hành cùng thanh niên
            chuyển đổi số nông nghiệp địa phương.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#san-pham">
              <Button size="lg">
                Xem chợ ngay <ArrowRight size={18} aria-hidden />
              </Button>
            </a>
            <Link to="/trace/NF-DEMO-001">
              <Button size="lg" variant="gold">
                <QrCode size={18} aria-hidden /> Quét mã QR truy xuất
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-muted">
            <span className="flex items-center gap-1.5"><ScanLine size={14} aria-hidden /> Hộ chiếu số từng lô</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} aria-hidden /> Nhà vườn đã đối chiếu</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border shadow-card">
          <ProduceImage seed="farm-ba-tu-demo" label="Nhà vườn Long Khánh" className="aspect-4/3 w-full" rounded="rounded-none" />
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-lg bg-header/85 px-3 py-2 text-white backdrop-blur">
            <span className="flex items-center gap-1.5 text-[12.5px] font-semibold">
              <MapPin size={13} aria-hidden /> Nhà vườn Ba Tư · Long Khánh
            </span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-semibold">Ảnh minh họa</span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section id="san-pham" className="scroll-mt-24">
        <div className="flex flex-col gap-3">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
            {categories.map((c) => (
              <Chip key={c} active={cat === c} count={countByCat[c] ?? 0} onClick={() => setCat(c)}>
                {c}
              </Chip>
            ))}
            <span className="mx-1 h-5 w-px bg-border" aria-hidden />
            <Chip active={false} onClick={() => pushToast('Bộ lọc vùng nguyên liệu (demo)', 'info')}>
              Tất cả vùng nguyên liệu
            </Chip>
            <Chip active={false} onClick={() => pushToast('Sắp xếp theo giá (demo)', 'info')}>
              Giá thấp → cao
            </Chip>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
              <input
                aria-label="Tìm sản phẩm, nhà vườn"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm sản phẩm, nhà vườn, vùng trồng..."
                className="h-11 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-[14.5px] focus:border-primary"
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-[13px] text-muted">
                {filtered.length} sản phẩm {q && `cho “${q}”`}
              </p>
              <DemoTag />
              <div className="ml-auto flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[12px] font-semibold text-muted transition-colors hover:text-primary"
                  onClick={() => {
                    setLoading(true)
                    setError(false)
                    window.setTimeout(() => setLoading(false), 700)
                  }}
                  title="Mô phỏng trạng thái đang tải"
                >
                  <RefreshCw size={13} aria-hidden /> Tải lại
                </button>
                <button
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[12px] font-semibold text-muted transition-colors hover:text-danger"
                  onClick={() => setError((e) => !e)}
                  title="Mô phỏng trạng thái lỗi"
                >
                  <TriangleAlert size={13} aria-hidden /> {error ? 'Tắt lỗi' : 'Lỗi'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          {error ? (
            <ErrorState
              title="Không tải được danh sách sản phẩm"
              description="Kết nối gián đoạn. Bộ lọc và từ khóa bạn đã chọn vẫn được giữ."
              onRetry={() => setError(false)}
            />
          ) : loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-4/3 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Search size={28} aria-hidden />}
              title="Không tìm thấy sản phẩm phù hợp"
              description="Thử từ khóa khác, hoặc xóa bộ lọc để xem toàn bộ chợ."
              action={
                <Button variant="secondary" onClick={() => { setQ(''); setCat('Tất cả') }}>
                  Xóa bộ lọc
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {filtered.map((p) => (
                <ProductTile key={p.id} id={p.id} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Story banner */}
      <section className="overflow-hidden rounded-xl border border-border bg-surface-soft">
        <div className="grid md:grid-cols-[1fr_1.15fr]">
          <ProduceImage seed="story-youth" label="Thanh niên và nhà nông" className="aspect-16/10 w-full md:aspect-auto md:h-full" rounded="rounded-none" />
          <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-primary/80">Hành trình xanh</p>
            <h2 className="font-display text-[24px] font-semibold leading-snug text-text md:text-[30px]">
              Hạnh phúc số hoá — khi thanh niên đồng hành cùng nhà nông
            </h2>
            <p className="max-w-[52ch] text-[14.5px] leading-relaxed text-muted">
              Từ nhật ký mùa vụ, chụp ảnh sản phẩm đến livestream bán hàng: thanh niên địa phương hỗ trợ nhà vườn
              chuyển đổi số từng bước, minh bạch và bền vững.
            </p>
            <div>
              <Link to="/explore/map">
                <Button variant="secondary">
                  Khám phá nhà vườn <ArrowRight size={17} aria-hidden />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Farms strip */}
      <section>
        <SectionHeader
          title="Nhà vườn tiêu biểu"
          subtitle="Điểm đến trải nghiệm và mua nông sản trực tiếp"
          action={
            <Link to="/explore/map" className="flex items-center gap-1 text-[14px] font-semibold text-primary">
              Xem bản đồ <ArrowRight size={15} aria-hidden />
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredFarms.map((f) => (
            <Card key={f.id} className="flex flex-col gap-3">
              <ProduceImage seed={f.id} label={f.name} className="aspect-16/9 w-full" />
              <div>
                <Link to={`/farms/${f.id}`} className="text-[15px] font-semibold text-text hover:text-primary">
                  {f.name}
                </Link>
                <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-muted">
                  <MapPin size={13} aria-hidden /> {f.address.split(',')[0]}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Badge tone="neutral">{f.crops.join(' · ')}</Badge>
                <span className="text-[12.5px] text-muted">{productsByFarm(f.id).length} SP</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Live */}
      <section>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-primary/80">Kết nối trực tiếp</p>
        <SectionHeader
          title="Lịch Live từ nhà vườn (Demo)"
          subtitle="Theo dõi phiên bán hàng và tham quan vườn sắp diễn ra"
          action={
            <Link to="/live" className="flex items-center gap-1 text-[14px] font-semibold text-primary">
              Xem tất cả <ArrowRight size={15} aria-hidden />
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          {upcomingLives.map((l) => {
            const farm = farms.find((f) => f.id === l.farmId)
            return (
              <Card key={l.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-soft">
                  <ProduceImage seed={l.id} className="h-full w-full" rounded="rounded-none" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Radio size={13} className="text-primary" aria-hidden />
                    <span className="text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                      {l.status === 'live' ? 'Đang diễn ra' : 'Sắp diễn ra'}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[15px] font-semibold text-text">{l.title}</p>
                  <p className="text-[12.5px] text-muted">
                    {dateTime(l.scheduledAt)} · {farm?.name}
                  </p>
                </div>
                <Button size="sm" variant="gold" onClick={() => pushToast('Đã đặt nhắc lịch live (demo)', 'success')}>
                  <PlayCircle size={15} aria-hidden /> Nhắc lịch
                </Button>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function ProductTile({ id }: { id: string }) {
  const { products, farms } = useData()
  const p = products.find((x) => x.id === id)!
  const farm = farms.find((f) => f.id === p.farmId)
  const buyable = p.season === 'in_season' && p.stockKg > 0
  const traceTo = p.batchCode ? `/trace/${p.batchCode}` : `/products/${p.id}`
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card transition-shadow hover:shadow-raised">
      <Link to={`/products/${p.id}`} className="relative block">
        <ProduceImage seed={p.id} label={p.name} className="aspect-4/3 w-full" rounded="rounded-none" />
        <span className="absolute left-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-semibold text-text backdrop-blur">
          {p.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link to={`/products/${p.id}`} className="line-clamp-2 text-[15px] font-semibold leading-snug text-text hover:text-primary">
          {p.name}
        </Link>
        <p className="flex items-center gap-1 text-[12.5px] text-muted">
          <MapPin size={13} aria-hidden />
          <span className="line-clamp-1">{farm?.name} · {farm?.address.split(',')[0]}</span>
        </p>
        <PriceTag pricePerKg={p.pricePerKg} className="mt-0.5" />
        <div className="mt-auto flex items-center gap-2 pt-2">
          {buyable ? (
            <Link to={traceTo} className="w-full">
              <Button size="sm" variant="gold" fullWidth>
                Xem nguồn gốc
              </Button>
            </Link>
          ) : (
            <Link to={`/products/${p.id}`} className="w-full">
              <Button size="sm" variant="secondary" fullWidth>
                Hẹn mùa
              </Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}