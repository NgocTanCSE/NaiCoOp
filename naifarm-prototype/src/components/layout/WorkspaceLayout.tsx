import { type ReactNode, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Building2, ChevronDown, ShieldCheck } from 'lucide-react'
import { useDemo, type WorkspaceKey } from '../../lib/demo-store'
import { profileById, unitName } from '../../lib/seed'
import { Logo } from './PublicLayout'
import { OfflineBanner } from './OfflineBanner'
import { WorkspaceLinks } from './Footer'

export interface MenuItem {
  to: string
  label: string
  icon: LucideIcon
}

export function WorkspaceLayout({
  title,
  menu,
  workspace,
  scopeLabel,
  children,
}: {
  title: string
  menu: MenuItem[]
  workspace: WorkspaceKey
  scopeLabel?: string
  children: ReactNode
}) {
  const { setWorkspace, currentUserId } = useDemo()
  const me = profileById(currentUserId)
  const location = useLocation()
  const scope = scopeLabel ?? unitName(me?.unitCode ?? null)

  // Đồng bộ khu vực theo tuyến đang mở (không còn thanh đổi vai trò thủ công)
  useEffect(() => {
    setWorkspace(workspace)
  }, [workspace, setWorkspace])

  return (
    <div className="min-h-[100dvh] bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Bỏ qua tới nội dung chính
      </a>

      <div className="mx-auto flex max-w-[1440px]">
        {/* Sidebar — desktop */}
        <aside className="sticky top-0 hidden h-[100dvh] w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
          <div className="border-b border-border px-4 py-4">
            <Logo />
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label={`Menu ${title}`}>
            {menu.map((m) => {
              const active = location.pathname === m.to || location.pathname.startsWith(m.to + '/')
              const Icon = m.icon
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[14.5px] font-semibold transition-colors ${
                    active ? 'bg-primary text-on-primary' : 'text-muted hover:bg-surface-soft hover:text-text'
                  }`}
                >
                  <Icon size={18} aria-hidden />
                  {m.label}
                </Link>
              )
            })}
          </nav>
          <div className="space-y-3 border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-md bg-surface-soft px-3 py-2">
              <ShieldCheck size={16} className="text-primary" aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-semibold text-text">{me?.displayName}</p>
                <p className="truncate text-[11.5px] text-muted">{me?.role}</p>
              </div>
            </div>
            <WorkspaceLinks className="gap-x-2 gap-y-1" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-header text-white shadow-[0_1px_0_rgba(0,0,0,0.12)]">
            <div className="flex items-center gap-3 px-4 py-2.5 md:px-6 md:py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                  {workspace} · {title}
                </p>
                <h1 className="truncate text-[18px] font-bold text-white md:text-[19px]">{title}</h1>
              </div>
              <button
                className="flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-white/15"
                title="Phạm vi được giao (demo)"
              >
                <Building2 size={15} className="text-white/70" aria-hidden />
                <span className="max-w-[10rem] truncate">{scope}</span>
                <ChevronDown size={15} className="text-white/70" aria-hidden />
              </button>
            </div>
            <OfflineBanner />
          </header>

          <main id="main" className="px-4 py-5 pb-24 md:px-6 md:py-7 md:pb-10">{children}</main>
        </div>
      </div>

      {/* Bottom tabs — mobile */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Điều hướng dưới"
      >
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${menu.length}, minmax(0, 1fr))` }}>
          {menu.map((m) => {
            const active = location.pathname === m.to
            const Icon = m.icon
            return (
              <li key={m.to}>
                <Link
                  to={m.to}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${
                    active ? 'text-primary' : 'text-muted'
                  }`}
                >
                  <Icon size={20} aria-hidden />
                  <span className="max-w-full truncate px-0.5">{m.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
