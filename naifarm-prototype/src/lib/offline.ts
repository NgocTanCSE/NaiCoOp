// Trạng thái mạng dùng cho demo. `navigator.onLine` là nguồn chính;
// cờ `forced` cho phép mô phỏng ngoại tuyến mà không cần ngắt mạng thật.
import { useSyncExternalStore } from 'react'

let forced = false
const subs = new Set<() => void>()

function emit() {
  subs.forEach((f) => f())
}

export const offlineDemo = {
  set(v: boolean) {
    if (forced === v) return
    forced = v
    emit()
  },
  toggle() {
    this.set(!forced)
  },
  get() {
    return forced
  },
  subscribe(f: () => void) {
    subs.add(f)
    return () => subs.delete(f)
  },
}

function subscribeNetwork(cb: () => void) {
  window.addEventListener('online', cb)
  window.addEventListener('offline', cb)
  return () => {
    window.removeEventListener('online', cb)
    window.removeEventListener('offline', cb)
  }
}

/** true khi thực sự ngoại tuyến hoặc đang bật mô phỏng. */
export function useOffline(): boolean {
  const forcedOff = useSyncExternalStore(offlineDemo.subscribe, offlineDemo.get, () => false)
  const netOn = useSyncExternalStore(
    subscribeNetwork,
    () => (typeof navigator === 'undefined' ? true : navigator.onLine),
    () => true,
  )
  return forcedOff || !netOn
}
