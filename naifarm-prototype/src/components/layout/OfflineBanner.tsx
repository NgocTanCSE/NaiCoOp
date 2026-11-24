import { CloudOff, Wifi, WifiOff } from 'lucide-react'
import { offlineDemo, useOffline } from '../../lib/offline'

/** Chỉ hiện khi thực sự ngoại tuyến (hoặc đang mô phỏng). Ẩn hoàn toàn khi trực tuyến. */
export function OfflineBanner() {
  const offline = useOffline()
  if (!offline) return null

  return (
    <div
      role="status"
      className="border-b border-warning/30 bg-warning-bg px-4 py-2 text-[13px] font-semibold text-warning md:px-6"
    >
      <div className="mx-auto flex max-w-[1440px] items-center gap-2">
        <CloudOff size={15} aria-hidden />
        <span>Bạn đang ngoại tuyến. Thao tác đã nhập được giữ lại và sẽ gửi khi có mạng.</span>
        <button
          onClick={() => offlineDemo.set(false)}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-warning/40 bg-surface/70 px-2.5 py-1 text-[12px] font-semibold"
        >
          <Wifi size={12} aria-hidden /> Bật mạng (demo)
        </button>
      </div>
    </div>
  )
}

/** Nút nhỏ đặt ở footer để mô phỏng ngoại tuyến khi trình diễn. */
export function OfflineDemoToggle({ className = '' }: { className?: string }) {
  const offline = useOffline()
  return (
    <button
      onClick={() => offlineDemo.toggle()}
      className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted hover:text-text ${className}`}
      title="Bật/tắt mô phỏng trạng thái ngoại tuyến"
    >
      {offline ? <Wifi size={13} aria-hidden /> : <WifiOff size={13} aria-hidden />}
      {offline ? 'Đang mô phỏng ngoại tuyến — tắt' : 'Mô phỏng ngoại tuyến'}
    </button>
  )
}
