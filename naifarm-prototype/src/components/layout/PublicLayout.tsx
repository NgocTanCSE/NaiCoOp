import { type ReactNode, useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Clock3, Home, Map, Receipt, Search, ShoppingBasket, Sprout, User } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'
import { OfflineBanner } from './OfflineBanner'
import { SiteFooter } from './Footer'

export function Logo({ compact = false, onDark = false }: { compact?: boolean; onDark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="NaiFarm — trang chủ">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          onDark ? 'bg-white/15 text-white' : 'bg-primary text-on-primary'
        }`}
      >
        <Sprout size={20} aria-hidden />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className={`block font-display text-[19px] font-semibold ${onDark ? 'text-white' : 'text-text'}`}>NaiFarm</span>
          <span
            className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${
              onDark ? 'text-white/70' : 'text-muted'
            }`}
          >
            Chợ OCOP Thanh niên
          </span>
        </span>
      )}
    </Link>
  )
}

const navItems = [
  { to: '/', label: 'Chợ' },
  { to: '/explore/map', label: 'Khám phá' },
  { to: '/live', label: 'Live' },
]

export function PublicLayout({ children }: { children: ReactNode }) {
  const { cart, setWorkspace } = useDemo()
  const navigate = useNavigate()
  const location = useLocation()
  const [q, setQ] = useState('')
  const cartCount = cart.reduce((s, l) => s + l.qtyKg, 0)

  useEffect(() => {
    setWorkspace('W01')
  }, [setWorkspace])

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/?q=${encodeURIComponent(q)}`)
  }

  const tabs = [
    { to: '/', icon: Home, label: 'Chợ' },
    { to: '/explore/map', icon: Map, label: 'Khám phá' },
    { to: '/account/orders', icon: Receipt, label: 'Đơn & lịch' },
    { to: '/account', icon: User, label: 'Cá nhân' },
  ]

  return (
    <div className="min-h-[100dvh] bg-background pb-16 md:pb-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Bỏ qua tới nội dung chính
      </a>

      <header className="sticky top-0 z-30 bg-header text-white shadow-[0_1px_0_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-2.5 md:px-6 md:py-3">
          <Logo onDark />

          <form onSubmit={onSearch} className="hidden flex-1 items-center md:flex" role="search">
            <div className="relative mx-auto w-full max-w-md">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-header/60" aria-hidden />
              <input
                aria-label="Tìm sản phẩm, nhà vườn, vùng trồng"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm sản phẩm, nhà vườn, vùng trồng..."
                className="h-10 w-full rounded-full border border-white/10 bg-white pl-10 pr-4 text-[14px] text-text placeholder:text-muted/80 focus:border-accent focus:outline-none"
              />
            </div>
          </form>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-[14px] font-semibold transition-colors ${
                    isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <span className="ml-auto hidden items-center gap-1.5 text-[12.5px] text-white/75 xl:flex">
            <Clock3 size={14} aria-hidden /> Giờ lấy hàng 06:00–18:00
          </span>

          <Link
            to="/cart"
            aria-label={`Giỏ hàng, ${cartCount} kg`}
            className="relative ml-auto flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:ml-0"
          >
            <ShoppingBasket size={20} aria-hidden />
            {cartCount > 0 && (
              <span className="tnum absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-on-accent">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/account"
            className="hidden h-10 items-center gap-2 rounded-full bg-white px-3.5 text-[13.5px] font-semibold text-header transition-colors hover:bg-white/90 sm:flex"
          >
            <User size={16} aria-hidden /> Tài khoản
          </Link>
        </div>

        {/* Search — mobile */}
        <form onSubmit={onSearch} className="px-4 pb-2.5 md:hidden" role="search">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-header/60" aria-hidden />
            <input
              aria-label="Tìm sản phẩm, nhà vườn"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm sản phẩm, nhà vườn..."
              className="h-10 w-full rounded-full border border-white/10 bg-white pl-9 pr-4 text-[14px] text-text placeholder:text-muted/80 focus:border-accent focus:outline-none"
            />
          </div>
        </form>
      </header>

      <OfflineBanner />

      <main id="main" className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 md:py-8">{children}</main>

      <SiteFooter />

      {/* Bottom tabs — mobile */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Điều hướng dưới"
      >
        <ul className="grid grid-cols-4">
          {tabs.map((t) => {
            const active = location.pathname === t.to
            const Icon = t.icon
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[11.5px] font-semibold ${
                    active ? 'text-primary' : 'text-muted'
                  }`}
                >
                  <Icon size={20} aria-hidden />
                  {t.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}