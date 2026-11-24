import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react'

/* ---------------- Button ---------------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'farmer' | 'accent' | 'gold'
type Size = 'sm' | 'md' | 'lg'

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  fullWidth,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-[background-color,opacity,transform] duration-150 ease-out active:scale-[.98] disabled:opacity-45 disabled:cursor-not-allowed select-none'
  const sizes: Record<Size, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-12 px-4 text-[15px]',
    lg: 'h-14 px-5 text-[17px]',
  }
  const variants: Record<Variant, string> = {
    primary: 'bg-primary text-on-primary hover:bg-primary-hover',
    secondary: 'bg-surface text-primary border border-border hover:bg-surface-soft',
    ghost: 'bg-transparent text-text hover:bg-surface-soft',
    danger: 'bg-danger text-white hover:opacity-90',
    accent: 'bg-accent text-on-accent hover:opacity-90',
    gold: 'bg-gold-soft text-gold-ink border border-gold-ink/10 hover:bg-gold-soft-hover',
    // Nút chính cho nhà nông: cao 56px, chữ lớn
    farmer: 'bg-primary text-on-primary hover:bg-primary-hover h-14 text-[18px] px-5',
  }
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ---------------- Inputs ---------------- */
export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-text">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[13px] text-muted">{hint}</p>}
      {error && (
        <p className="text-[13px] text-danger flex items-center gap-1">
          <XCircle size={14} aria-hidden /> {error}
        </p>
      )}
    </div>
  )
}

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-12 w-full rounded-md border border-input-border bg-surface px-3 text-[15px] text-text placeholder:text-muted/70 focus:border-primary ${className}`}
      {...rest}
    />
  )
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-24 w-full rounded-md border border-input-border bg-surface p-3 text-[15px] text-text placeholder:text-muted/70 focus:border-primary ${className}`}
      {...rest}
    />
  )
}

/* ---------------- Badge / chip ---------------- */
type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'primary' | 'gold'

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-soft text-muted',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  accent: 'bg-accent/15 text-on-accent',
  primary: 'bg-primary/10 text-primary',
  gold: 'bg-gold-soft text-gold-ink',
}

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className = '',
}: {
  tone?: Tone
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${toneClasses[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  )
}

export function DemoTag({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-dashed border-warning/50 bg-warning-bg px-2 py-0.5 text-[11.5px] font-semibold text-warning ${className}`}
      title="Dữ liệu giả lập dùng cho demo"
    >
      Mẫu/Demo
    </span>
  )
}

/* ---------------- Card ---------------- */
export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-lg border border-border bg-surface p-4 shadow-card ${className}`}>
      {children}
    </div>
  )
}

export function SectionHeader({
  title,
  action,
  subtitle,
  as: As = 'h2',
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  as?: 'h1' | 'h2' | 'h3'
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <As className="text-[22px] font-bold tracking-tight text-text md:text-[26px]">{title}</As>
        {subtitle && <p className="mt-1 text-[14px] text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* ---------------- States ---------------- */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-surface-soft ${className}`} aria-hidden />
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-muted">
      <Loader2 className="animate-spin" size={18} aria-hidden />
      {label && <span className="text-sm">{label}</span>}
    </span>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      {icon && <div className="text-leaf">{icon}</div>}
      <h3 className="text-[17px] font-semibold text-text">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

export function ErrorState({
  title = 'Đã có lỗi xảy ra',
  description = 'Vui lòng thử lại. Dữ liệu bạn đã nhập vẫn được giữ.',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-danger/30 bg-danger-bg px-6 py-10 text-center">
      <AlertTriangle className="text-danger" size={28} aria-hidden />
      <h3 className="text-[17px] font-semibold text-danger">{title}</h3>
      <p className="max-w-sm text-sm text-danger/80">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  )
}

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger'
  children: ReactNode
}) {
  const map = {
    info: { cls: 'bg-info-bg text-info border-info/25', Icon: Info },
    success: { cls: 'bg-success-bg text-success border-success/25', Icon: CheckCircle2 },
    warning: { cls: 'bg-warning-bg text-warning border-warning/25', Icon: AlertTriangle },
    danger: { cls: 'bg-danger-bg text-danger border-danger/25', Icon: XCircle },
  } as const
  const { cls, Icon } = map[tone]
  return (
    <div className={`flex items-start gap-2 rounded-md border px-3 py-2.5 text-[14px] ${cls}`}>
      <Icon size={17} className="mt-0.5 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  )
}

/* ---------------- Tabs ---------------- */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div role="tablist" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((t) => {
        const active = t.key === value
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`relative whitespace-nowrap px-3 py-3 text-[14.5px] font-semibold transition-colors ${
              active ? 'text-primary' : 'text-muted hover:text-text'
            }`}
          >
            {t.label}
            {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- Pill chip (bộ lọc) ---------------- */
export function Chip({
  active = false,
  onClick,
  count,
  children,
}: {
  active?: boolean
  onClick?: () => void
  count?: number
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13.5px] font-semibold transition-colors ${
        active
          ? 'border-primary bg-primary text-on-primary'
          : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-text'
      }`}
    >
      {children}
      {typeof count === 'number' && (
        <span className={`tnum text-[12px] ${active ? 'text-on-primary/80' : 'text-muted/70'}`}>({count})</span>
      )}
    </button>
  )
}

/* ---------------- Stepper (quantity) ---------------- */
export function QtyStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  suffix = 'kg',
}: {
  value: number
  min?: number
  max?: number
  onChange: (v: number) => void
  suffix?: string
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-surface">
      <button
        type="button"
        aria-label="Giảm số lượng"
        className="h-11 w-11 text-lg font-bold text-text hover:bg-surface-soft disabled:opacity-40"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className="tnum min-w-16 px-2 text-center text-[15px] font-semibold">
        {value} {suffix}
      </span>
      <button
        type="button"
        aria-label="Tăng số lượng"
        className="h-11 w-11 text-lg font-bold text-text hover:bg-surface-soft disabled:opacity-40"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  )
}

/* ---------------- Modal ---------------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-text/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-lg rounded-t-xl bg-surface p-5 shadow-overlay sm:rounded-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-text">{title}</h3>
          <button aria-label="Đóng" className="rounded-md p-1.5 hover:bg-surface-soft" onClick={onClose}>
            <XCircle size={20} aria-hidden />
          </button>
        </div>
        <div className="text-[15px]">{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

/* ---------------- Timeline ---------------- */
export function Timeline({
  items,
}: {
  items: { title: string; meta?: string; body?: string; tone?: 'default' | 'accent' }[]
}) {
  return (
    <ol className="relative ml-3 border-l border-border">
      {items.map((it, i) => (
        <li key={i} className="mb-5 ml-5 last:mb-0">
          <span
            className={`absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full ring-4 ring-surface ${
              it.tone === 'accent' ? 'bg-accent' : 'bg-primary'
            }`}
            aria-hidden
          />
          <p className="text-[14px] font-semibold text-text">{it.title}</p>
          {it.meta && <p className="tnum text-[12.5px] text-muted">{it.meta}</p>}
          {it.body && <p className="mt-1 text-[13.5px] text-muted">{it.body}</p>}
        </li>
      ))}
    </ol>
  )
}
