import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useDemo } from '../../lib/demo-store'

export function Toasts() {
  const { toasts, dismissToast } = useDemo()
  if (toasts.length === 0) return null
  return (
    <div
      className="fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end"
      role="region"
      aria-live="polite"
      aria-label="Thông báo"
    >
      {toasts.map((t) => {
        const map = {
          success: { cls: 'border-success/30 bg-success-bg text-success', Icon: CheckCircle2 },
          info: { cls: 'border-info/30 bg-info-bg text-info', Icon: Info },
          warning: { cls: 'border-warning/30 bg-warning-bg text-warning', Icon: AlertTriangle },
          danger: { cls: 'border-danger/30 bg-danger-bg text-danger', Icon: XCircle },
        } as const
        const { cls, Icon } = map[t.tone]
        return (
          <div
            key={t.id}
            className={`nf-reveal flex w-full max-w-sm items-start gap-2 rounded-md border px-3 py-2.5 shadow-raised ${cls}`}
          >
            <Icon size={17} className="mt-0.5 shrink-0" aria-hidden />
            <span className="flex-1 text-[14px] font-medium">{t.message}</span>
            <button aria-label="Đóng thông báo" onClick={() => dismissToast(t.id)}>
              <X size={16} aria-hidden />
            </button>
          </div>
        )
      })}
    </div>
  )
}
