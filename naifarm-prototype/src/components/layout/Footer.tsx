import { Link } from 'react-router-dom'
import { Leaf, Sprout } from 'lucide-react'
import { OfflineDemoToggle } from './OfflineBanner'

const spaces = [
  { to: '/', label: 'Chợ (khách)' },
  { to: '/farmer', label: 'Nhà nông' },
  { to: '/volunteer', label: 'Thanh niên' },
  { to: '/coordinator', label: 'Điều phối' },
  { to: '/admin', label: 'Quản trị' },
]

const cols: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: 'Mua sắm',
    links: [
      { to: '/', label: 'Chợ nông sản' },
      { to: '/explore/map', label: 'Bản đồ nhà vườn' },
      { to: '/live', label: 'Livestream' },
      { to: '/trace/NF-DEMO-001', label: 'Hộ chiếu mẫu' },
    ],
  },
  {
    title: 'Tham gia',
    links: [
      { to: '/farmer', label: 'Nhà nông bán hàng' },
      { to: '/volunteer', label: 'Thanh niên tình nguyện' },
      { to: '/coordinator', label: 'Điều phối viên' },
      { to: '/login', label: 'Đăng nhập demo' },
    ],
  },
]

/** Dải liên kết không gian demo — nhỏ, tĩnh (thay cho thanh đổi vai trò). */
export function WorkspaceLinks({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  return (
    <nav aria-label="Không gian làm việc (demo)" className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <span className={`text-[12px] font-semibold uppercase tracking-wide ${dark ? 'text-white/50' : 'text-muted/80'}`}>
        Không gian demo
      </span>
      {spaces.map((s, i) => (
        <span key={s.to} className="flex items-center gap-2">
          {i > 0 && <span className={dark ? 'text-white/25' : 'text-muted/40'} aria-hidden>·</span>}
          <Link
            to={s.to}
            className={`text-[12.5px] font-medium transition-colors ${
              dark ? 'text-white/75 hover:text-white' : 'text-muted hover:text-primary'
            }`}
          >
            {s.label}
          </Link>
        </span>
      ))}
    </nav>
  )
}

export function SiteFooter({ maxWidth = 1280 }: { maxWidth?: number }) {
  return (
    <footer className="mt-12 bg-header text-white/80">
      <div className="mx-auto px-4 py-10 md:px-6 md:py-12" style={{ maxWidth }}>
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2.5" aria-label="NaiFarm — trang chủ">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white">
                <Sprout size={20} aria-hidden />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-[19px] font-semibold text-white">NaiFarm</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  Chợ OCOP Thanh niên
                </span>
              </span>
            </Link>
            <p className="max-w-[30ch] text-[13px] leading-relaxed text-white/70">
              Gieo tri thức · Kết nối nhà nông · Lan tỏa giá trị. Nông sản Đồng Nai minh bạch từ vườn đến bàn ăn.
            </p>
            <div className="flex items-center gap-1.5 text-[12.5px] text-white/60">
              <Leaf size={14} aria-hidden /> Bản demo thiết kế 2026
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="space-y-2.5">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-white/50">{c.title}</p>
              <ul className="space-y-1.5">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-[13.5px] text-white/75 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-white/50">Không gian demo</p>
            <ul className="space-y-1.5">
              {spaces.map((s) => (
                <li key={s.to}>
                  <Link to={s.to} className="text-[13.5px] text-white/75 transition-colors hover:text-white">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
            <OfflineDemoToggle className="!text-white/60 hover:!text-white" />
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-white/15 pt-5 text-[12.5px] text-white/55 md:flex-row md:items-center md:justify-between">
          <p>NaiFarm — Chợ OCOP Thanh niên, Thành phố Đồng Nai.</p>
          <p className="flex items-center gap-2">
            <span className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] font-semibold text-white/70">
              Dữ liệu minh hoạ (Demo)
            </span>
            Mọi dữ liệu, hình ảnh và chứng nhận là giả lập.
          </p>
        </div>
      </div>
    </footer>
  )
}