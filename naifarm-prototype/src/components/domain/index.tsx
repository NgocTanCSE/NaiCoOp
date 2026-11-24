import { Link } from 'react-router-dom'
import { Clock, Leaf, MapPin, ShoppingBasket, Sparkles } from 'lucide-react'
import { money, perKg } from '../../lib/format'
import {
  missionStatusLabel,
  missionStatusTone,
  orderStatusLabel,
  orderStatusTone,
  seasonLabel,
} from '../../lib/labels'
import { farmById, type Mission, type Order, type OrderStatus, type Product } from '../../lib/seed'
import { Badge } from '../ui'
import { type Tone } from '../../lib/labels'
import { kindForSeed, ProduceArt } from './ProduceArt'

/* ---------- Ảnh minh họa (không dùng ảnh thật/AI giả danh) ---------- */
export function ProduceImage({
  seed,
  label,
  className = '',
  rounded = 'rounded-lg',
  showCaption = true,
}: {
  seed: string
  label?: string
  className?: string
  rounded?: string
  showCaption?: boolean
}) {
  const kind = kindForSeed(seed)
  const caption = showCaption && (
    <span className="absolute bottom-2 left-2 rounded-full bg-surface/85 px-2 py-0.5 text-[10px] font-semibold text-muted backdrop-blur">
      Ảnh minh họa
    </span>
  )

  if (kind) {
    return (
      <div
        className={`relative overflow-hidden ${rounded} ${className}`}
        role="img"
        aria-label={label ? `${label} (ảnh minh họa)` : 'Ảnh minh họa'}
      >
        <ProduceArt kind={kind} rounded={rounded} className="absolute inset-0 h-full w-full" />
        {caption}
      </div>
    )
  }

  // Bảng gradient ấm/trung tính, xác định theo seed để ổn định
  const palettes = [
    ['#E9F1E3', '#CFE1C2'],
    ['#F4EEDC', '#E7D9B6'],
    ['#E7F1F6', '#C9E0EA'],
    ['#F8EBDC', '#EBCBA8'],
    ['#EDF3EC', '#D2E3D0'],
  ]
  const [c1, c2] = palettes[Math.abs(hash(seed)) % palettes.length]
  const gid = `g-${Math.abs(hash(seed))}`
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${rounded} ${className}`}
      role="img"
      aria-label={label ? `${label} (ảnh minh họa)` : 'Ảnh minh họa'}
    >
      <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c2} />
          </linearGradient>
          <pattern id={`${gid}-p`} width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M17 4c5 5 5 15 0 20-5-5-5-15 0-20z" fill="#245B3D" opacity="0.10" />
          </pattern>
        </defs>
        <rect width="200" height="150" fill={`url(#${gid})`} />
        <rect width="200" height="150" fill={`url(#${gid}-p)`} />
      </svg>
      <Leaf size={30} className="relative text-primary/40" aria-hidden />
      {caption}
    </div>
  )
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return h
}

/* ---------- Price ---------- */
export function PriceTag({ pricePerKg, className = '' }: { pricePerKg: number; className?: string }) {
  return (
    <span className={`tnum text-[19px] font-bold text-primary ${className}`}>{perKg(pricePerKg)}</span>
  )
}

/* ---------- Status chip ---------- */
export function StatusChip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <Badge tone={tone}>{children}</Badge>
}

/* ---------- Product card ---------- */
export function ProductCard({ product, onAdd }: { product: Product; onAdd?: (id: string) => void }) {
  const farm = farmById(product.farmId)
  const buyable = product.season === 'in_season' && product.stockKg > 0
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card transition-shadow hover:shadow-raised">
      <Link to={`/products/${product.id}`} className="block">
        <ProduceImage seed={product.id} label={product.name} className="aspect-4/3 w-full" rounded="rounded-none" />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${product.id}`} className="line-clamp-2 text-[15px] font-semibold leading-snug text-text hover:text-primary">
            {product.name}
          </Link>
        </div>
        <p className="flex items-center gap-1 text-[12.5px] text-muted">
          <MapPin size={13} aria-hidden />
          <span className="line-clamp-1">{farm?.unitCode ? farm.address.split(',')[0] : 'Đồng Nai'}</span>
        </p>
        <PriceTag pricePerKg={product.pricePerKg} />
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Badge tone={buyable ? 'success' : 'warning'}>{seasonLabel[product.season]}</Badge>
          {buyable && onAdd ? (
            <button
              onClick={() => onAdd(product.id)}
              className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-2 text-[13px] font-semibold text-on-primary hover:bg-primary-hover"
            >
              <ShoppingBasket size={15} aria-hidden /> Thêm
            </button>
          ) : (
            <span className="flex items-center gap-1 text-[12.5px] font-semibold text-muted">
              <Clock size={14} aria-hidden /> Theo dõi mùa
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

/* ---------- Order status stepper ---------- */
const orderFlow: OrderStatus[] = ['Pending', 'Confirmed', 'Packing', 'Ready', 'Completed']
export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  const cancelled = status === 'Cancelled'
  const idx = orderFlow.indexOf(status === 'Shipping' ? 'Ready' : status)
  return (
    <ol className="flex flex-wrap items-center gap-y-2">
      {orderFlow.map((s, i) => {
        const done = !cancelled && i <= idx
        return (
          <li key={s} className="flex items-center">
            <span className={`flex items-center gap-1.5 text-[12.5px] font-semibold ${done ? 'text-primary' : 'text-muted'}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${done ? 'bg-primary text-on-primary' : 'bg-surface-soft text-muted'}`}>
                {i + 1}
              </span>
              {orderStatusLabel[s]}
            </span>
            {i < orderFlow.length - 1 && <span className={`mx-2 h-px w-6 ${done ? 'bg-primary/40' : 'bg-border'}`} aria-hidden />}
          </li>
        )
      })}
      {cancelled && <li className="ml-2"><Badge tone="danger">{orderStatusLabel.Cancelled}</Badge></li>}
    </ol>
  )
}

export function OrderSummaryLine({ order }: { order: Order }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="tnum text-[14px] font-semibold text-text">{order.code}</p>
        <p className="text-[12.5px] text-muted">{order.fulfillment === 'delivery' ? 'Giao tận nơi' : 'Nhận tại vườn'}</p>
      </div>
      <Badge tone={orderStatusTone[order.status]}>{orderStatusLabel[order.status]}</Badge>
    </div>
  )
}

/* ---------- Mission card ---------- */
export function MissionCard({ mission, showAssignee = false }: { mission: Mission; showAssignee?: boolean }) {
  const farm = farmById(mission.farmId)
  return (
    <Link
      to={`/volunteer/missions/${mission.id}`}
      className="block rounded-lg border border-border bg-surface p-4 shadow-card transition-shadow hover:shadow-raised"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15.5px] font-semibold text-text">{mission.title}</h3>
        <Badge tone={missionStatusTone[mission.status]}>{missionStatusLabel[mission.status]}</Badge>
      </div>
      <p className="mt-1.5 flex items-center gap-1 text-[13px] text-muted">
        <MapPin size={13} aria-hidden /> {farm?.name}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="neutral">{mission.skill}</Badge>
        <Badge tone="neutral">{mission.mode === 'online' ? 'Trực tuyến' : mission.mode === 'onsite' ? 'Tại chỗ' : 'Kết hợp'}</Badge>
        <Badge tone="neutral">{mission.expectedHours} giờ</Badge>
        <Badge tone="neutral">Hạn {new Date(mission.dueDate).toLocaleDateString('vi-VN')}</Badge>
      </div>
      {showAssignee && mission.assigneeId && (
        <p className="mt-2 flex items-center gap-1 text-[12.5px] text-muted">
          <Sparkles size={13} aria-hidden /> Cần {mission.slots} người · đã có người nhận
        </p>
      )}
    </Link>
  )
}

export { money }
