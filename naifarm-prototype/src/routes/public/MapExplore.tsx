import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, MapPin, Sprout } from 'lucide-react'
import { useData } from '../../lib/data'
import { Badge, Card, Chip, DemoTag, EmptyState } from '../../components/ui'
import { perKg } from '../../lib/format'

// Khung tọa độ minh họa (Đồng Nai mới) — KHÔNG phải địa giới thực.
const BOUNDS = { minLat: 10.75, maxLat: 12.05, minLng: 106.45, maxLng: 107.55 }
const pos = (lat: number, lng: number) => ({
  left: `${((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100}%`,
  top: `${(1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100}%`,
})

const layerOptions = [
  { key: 'farm', label: 'Nhà vườn' },
  { key: 'experience', label: 'Trải nghiệm' },
  { key: 'ocop', label: 'OCOP' },
]

export function MapExplore() {
  const { farmById, farms, productsByFarm } = useData()
  const [selected, setSelected] = useState<string | null>(farms[0].id)
  const [layers, setLayers] = useState<string[]>(['farm'])
  const [query, setQuery] = useState('')

  const visible = useMemo(
    () => farms.filter((f) => (query.trim() ? f.name.toLowerCase().includes(query.toLowerCase()) : true)),
    [query],
  )
  const sel = selected ? farmById(selected) : undefined

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-[26px] font-semibold text-text md:text-[30px]">Bản đồ nông nghiệp Đồng Nai</h1>
        <DemoTag />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={`${farms.length}`} label="Nhà vườn" />
        <Stat value={`${farms.reduce((s, f) => s + productsByFarm(f.id).length, 0)}`} label="Sản phẩm" />
        <Stat value="10" label="Đơn vị địa bàn" />
        <Stat value="2" label="Điểm nhận hàng" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {layerOptions.map((l) => {
            const on = layers.includes(l.key)
            return (
              <Chip
                key={l.key}
                active={on}
                onClick={() => setLayers((s) => (on ? s.filter((k) => k !== l.key) : [...s, l.key]))}
              >
                {l.label}
              </Chip>
            )
          })}
        </div>
        <input
          aria-label="Lọc nhà vườn trên bản đồ"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Lọc theo tên nhà vườn…"
          className="h-10 flex-1 rounded-full border border-border bg-surface px-4 text-[14px] focus:border-primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        {/* List */}
        <div className="space-y-2 lg:max-h-[560px] lg:overflow-y-auto">
          {visible.length === 0 ? (
            <EmptyState title="Không có điểm phù hợp" description="Nới bộ lọc hoặc xóa từ khóa." />
          ) : (
            visible.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selected === f.id ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-surface-soft'
                }`}
              >
                <p className="text-[14.5px] font-semibold text-text">{f.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-muted">
                  <MapPin size={12} aria-hidden /> {f.address.split(',')[0]}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge tone="neutral">{f.crops.join(' · ')}</Badge>
                  {productsByFarm(f.id)[0] && (
                    <Badge tone="primary">{perKg(productsByFarm(f.id)[0].pricePerKg)}</Badge>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Map canvas (basemap trung tính, điểm demo) */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-[#EDEFE8]" style={{ minHeight: 420 }}>
          {/* lưới nền */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.18]" aria-hidden>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="#245B3D" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md border border-warning/40 bg-warning-bg px-2 py-1 text-[11.5px] font-semibold text-warning">
            <Info size={12} aria-hidden /> Bản đồ minh họa — không phải địa giới thực
          </div>

          {visible.map((f) => {
            const p = pos(f.location.lat, f.location.lng)
            const active = selected === f.id
            return (
              <button
                key={f.id}
                onClick={() => setSelected(f.id)}
                style={p}
                aria-label={f.name}
                className={`absolute -translate-x-1/2 -translate-y-full transition-transform ${
                  active ? 'z-10 scale-110' : 'hover:z-10 hover:scale-105'
                }`}
              >
                <span
                  className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[11.5px] font-semibold shadow-card ${
                    active ? 'border-primary bg-primary text-on-primary' : 'border-border bg-surface text-text'
                  }`}
                >
                  <MapPin size={12} aria-hidden /> {f.name.replace('Nhà vườn ', '').replace('Vườn ', '')}
                </span>
              </button>
            )
          })}

          <span className="absolute bottom-2 right-3 text-[11px] text-muted">
            Nền bản đồ minh họa · Dữ liệu điểm là giả lập
          </span>
        </div>
      </div>

      {/* Popup chi tiết */}
      {sel && (
        <Card className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-text">{sel.name}</p>
            <p className="text-[13px] text-muted">
              {sel.address} · {sel.areaHa} ha · {sel.crops.join(', ')}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/farms/${sel.id}`}>
              <Badge tone="primary">Xem hồ sơ</Badge>
            </Link>
            {productsByFarm(sel.id)[0] && (
              <Link to={`/products/${productsByFarm(sel.id)[0].id}`}>
                <Badge tone="neutral" icon={<Sprout size={12} aria-hidden />}>
                  Sản phẩm
                </Badge>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5 shadow-card">
      <p className="tnum text-[22px] font-bold leading-none text-text">{value}</p>
      <p className="mt-1 text-[12px] text-muted">{label}</p>
    </div>
  )
}
