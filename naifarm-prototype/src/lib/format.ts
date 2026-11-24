// Định dạng hiển thị theo DESIGN.md: 35.000 đ/kg · 2 kg · DD/MM/YYYY · 24h · GMT+7

export function money(amount: number, suffix = ''): string {
  const s = new Intl.NumberFormat('vi-VN').format(Math.round(amount))
  return suffix ? `${s} ${suffix}` : `${s} đ`
}

export function perKg(amount: number): string {
  return `${money(amount)}/kg`
}

export function qty(amount: number, unit = 'kg'): string {
  const s = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(amount)
  return `${s} ${unit}`
}

export function date(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getUTCFullYear()}`
}

export function dateTime(iso: string): string {
  const d = new Date(iso)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mi = String(d.getUTCMinutes()).padStart(2, '0')
  return `${date(iso)} · ${hh}:${mi}`
}

export function today(): string {
  // Mốc bối cảnh đề thi
  return '24/11/2026'
}
