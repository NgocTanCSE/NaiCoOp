import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/** QR thật (không phủ logo, có quiet zone 4 module) — dẫn tới /trace/{code} */
export function TraceQR({ code, size = 148 }: { code: string; size?: number }) {
  const [url, setUrl] = useState<string>('')
  useEffect(() => {
    let alive = true
    QRCode.toDataURL(code, {
      width: size,
      margin: 4,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#FFFFFF' },
    })
      .then((d) => alive && setUrl(d))
      .catch(() => alive && setUrl(''))
    return () => {
      alive = false
    }
  }, [code, size])

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        className="rounded-md border border-border bg-white p-1"
        style={{ width: size, height: size }}
        aria-label={`Mã QR truy xuất cho lô ${code}`}
        role="img"
      >
        {url ? (
          <img src={url} width={size - 8} height={size - 8} alt="" />
        ) : (
          <div className="h-full w-full animate-pulse bg-surface-soft" />
        )}
      </div>
      <span className="tnum rounded-full bg-surface-soft px-2.5 py-1 text-[12.5px] font-semibold text-text">{code}</span>
    </div>
  )
}
