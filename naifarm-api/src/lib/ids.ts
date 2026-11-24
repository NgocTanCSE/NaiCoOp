/**
 * Sinh mã công khai + id cho bản ghi mới.
 * Tiền tố giữ đồng bộ với `seed.ts` (NF-DEMO-*, NF-ORD-DEMO-*).
 */

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

export function randomCode(length = 6): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length]
  return out
}

/** Mã lô công khai: NF-DEMO-XXXXXX */
export function batchPublicCode(): string {
  return `NF-DEMO-${randomCode(6)}`
}

/** Mã đơn: NF-ORD-DEMO-XXXXXX */
export function orderCode(): string {
  return `NF-ORD-DEMO-${randomCode(6)}`
}

/** id có tiền tố, vd: o-3f9a2b */
export function prefixedId(prefix: string): string {
  return `${prefix}-${randomCode(8).toLowerCase()}`
}
