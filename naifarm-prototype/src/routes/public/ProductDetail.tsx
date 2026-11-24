import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BadgeCheck,
  ChevronRight,
  MapPin,
  Package,
  QrCode,
  ScanLine,
  ShieldCheck,
  ShoppingBasket,
  Truck,
} from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { useData } from '../../lib/data'
import { certLabel, certTone, seasonLabel } from '../../lib/labels'
import { Badge, Button, Card, DemoTag, Notice, QtyStepper, SectionHeader, Timeline } from '../../components/ui'
import { ProduceImage } from '../../components/domain'
import { TraceQR } from '../../components/domain/TraceQR'
import { date, money, perKg } from '../../lib/format'

export function ProductDetail() {
  const { batchByCode, farmById, productById } = useData()
  const { id } = useParams()
  const navigate = useNavigate()
  const product = id ? productById(id) : undefined
  const { addToCart, pushToast } = useDemo()
  const [qtyKg, setQtyKg] = useState(1)

  if (!product) return <p className="text-muted">Không tìm thấy sản phẩm.</p>

  const farm = farmById(product.farmId)
  const batch = product.batchCode ? batchByCode(product.batchCode) : undefined
  const buyable = product.season === 'in_season' && product.stockKg > 0

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-1 text-[13px] text-muted">
        <Link to="/" className="hover:text-primary">Chợ</Link>
        <ChevronRight size={13} aria-hidden />
        <span>{product.category}</span>
        <ChevronRight size={13} aria-hidden />
        <span className="font-semibold text-text">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl border border-border shadow-card">
            <ProduceImage
              seed={product.id}
              label={product.name}
              className="aspect-4/3 w-full"
              rounded="rounded-none"
              showCaption={false}
            />
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              <Badge tone={buyable ? 'success' : 'warning'}>{seasonLabel[product.season]}</Badge>
              {farm && (
                <Badge tone={certTone[farm.certStatus] as never} icon={<BadgeCheck size={12} aria-hidden />}>
                  {certLabel[farm.certStatus]}
                </Badge>
              )}
            </div>
            <span className="absolute bottom-3 right-3 rounded-full bg-text/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              Ảnh minh họa (Demo)
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <ProduceImage key={i} seed={`${product.id}-${i}`} className="aspect-1/1 w-full" rounded="rounded-md" showCaption={false} />
            ))}
          </div>
        </div>

        {/* Info — sticky on desktop */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="flex items-center gap-2">
            <DemoTag />
            {batch && (
              <Badge tone="primary" icon={<QrCode size={12} aria-hidden />}>
                Có hộ chiếu lô
              </Badge>
            )}
          </div>

          <div>
            <h1 className="font-display text-[28px] font-semibold leading-tight text-text md:text-[34px]">{product.name}</h1>
            {farm && (
              <Link to={`/farms/${farm.id}`} className="mt-1.5 inline-flex items-center gap-1 text-[14px] font-semibold text-primary">
                <MapPin size={14} aria-hidden /> {farm.name} · {farm.address.split(',')[0]}
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <span className="tnum text-[30px] font-bold leading-none text-primary">{perKg(product.pricePerKg)}</span>
            <span className="text-[13px] text-muted">
              {buyable ? `Tồn kho ${product.stockKg} kg` : 'Đang hẹn mùa / đặt trước'}
            </span>
          </div>

          <p className="max-w-[60ch] text-[15px] leading-relaxed text-muted">{product.description}</p>

          {buyable ? (
            <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-muted">Số lượng</span>
                <QtyStepper value={qtyKg} max={product.stockKg} onChange={setQtyKg} />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-[14px] text-muted">Tạm tính</span>
                <span className="tnum text-[20px] font-bold text-primary">{money(product.pricePerKg * qtyKg)}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    addToCart(product.id, qtyKg)
                    pushToast(`Đã thêm ${qtyKg} kg vào giỏ`, 'success')
                  }}
                >
                  <ShoppingBasket size={18} aria-hidden /> Thêm vào giỏ
                </Button>
                <Button
                  variant="farmer"
                  onClick={() => {
                    addToCart(product.id, qtyKg)
                    navigate('/checkout')
                  }}
                >
                  Mua ngay
                </Button>
              </div>
            </div>
          ) : (
            <Notice tone="warning">
              Sản phẩm đang <strong>hẹn mùa/đặt trước</strong>. Bạn có thể theo dõi mùa vụ để nhận thông báo khi có hàng.
              <div className="mt-2">
                <Button size="sm" variant="secondary" onClick={() => pushToast('Đã bật theo dõi mùa vụ (demo)', 'success')}>
                  Theo dõi mùa vụ
                </Button>
              </div>
            </Notice>
          )}

          <div className="grid gap-2 text-[13px] text-muted sm:grid-cols-2">
            <span className="flex items-center gap-1.5"><Truck size={15} className="text-leaf" aria-hidden /> Giao tận nơi hoặc nhận tại vườn</span>
            <span className="flex items-center gap-1.5"><Package size={15} className="text-leaf" aria-hidden /> Đóng gói theo lô, truy xuất được</span>
          </div>
        </div>
      </div>

      {/* Seller + passport */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-3">
          <SectionHeader as="h3" title="Người bán" subtitle="Nhà vườn trực tiếp, không qua trung gian" />
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck size={22} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-text">{farm?.name}</p>
              <p className="text-[13px] text-muted">{farm?.address}</p>
            </div>
            {farm && (
              <Link to={`/farms/${farm.id}`} className="ml-auto shrink-0">
                <Button size="sm" variant="secondary">Xem hồ sơ</Button>
              </Link>
            )}
          </div>
          <p className="rounded-md bg-surface-soft px-3 py-2 text-[13px] text-muted">
            Hồ sơ đang ở mức <strong className="text-text">{farm ? certLabel[farm.certStatus] : '—'}</strong>. NaiFarm không
            tự nhận chứng nhận thay cơ quan có thẩm quyền.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[15px] font-bold text-text">Hộ chiếu số nông sản</p>
              <p className="text-[13px] text-muted">Mã lô, nhật ký mùa vụ và mức xác minh nguồn.</p>
            </div>
            <Badge tone="primary" icon={<ScanLine size={12} aria-hidden />}>QR</Badge>
          </div>
          {batch ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <TraceQR code={batch.publicCode} size={112} />
              <ul className="flex-1 space-y-1.5 text-[13px] text-muted">
                <li className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-primary" aria-hidden /> Mã lô {batch.publicCode}</li>
                <li className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-primary" aria-hidden /> Nhật ký {batch.diary.length} mốc</li>
                <li className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-primary" aria-hidden /> Thu hoạch {date(batch.harvestDate)}</li>
              </ul>
              <Link to={`/trace/${batch.publicCode}`} className="shrink-0">
                <Button size="sm" variant="gold">Mở hộ chiếu</Button>
              </Link>
            </div>
          ) : (
            <p className="text-[13.5px] text-muted">Sản phẩm chưa gắn lô truy xuất.</p>
          )}
        </Card>
      </div>

      {/* Diary */}
      {batch && (
        <Card>
          <SectionHeader as="h3" title="Nhật ký canh tác" subtitle="Người ghi và thời điểm được lưu cho mỗi mốc" />
          <Timeline
            items={batch.diary.map((d) => ({
              title: d.note,
              meta: `${date(d.at)} · ${d.actor}${d.evidence ? ` · ${d.evidence}` : ''}`,
              tone: d.phase === 'thu_hoach' ? 'accent' : 'default',
            }))}
          />
        </Card>
      )}
    </div>
  )
}