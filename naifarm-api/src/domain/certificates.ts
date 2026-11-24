import type { CertificateStatus } from '../types'

/**
 * Thứ bậc chứng nhận: tự khai → đã đối chiếu tài liệu → đã xác nhận nguồn.
 * Điều phối chỉ được nâng tối đa theo từng bước; không được nhảy cóc.
 */
export const CERT_TRANSITIONS: Record<CertificateStatus, CertificateStatus[]> = {
  self_declared: ['document_matched', 'revoked'],
  document_matched: ['source_confirmed', 'revoked'],
  source_confirmed: ['expired', 'revoked'],
  expired: [],
  revoked: [],
}

export function canAdvanceCertificate(from: CertificateStatus, to: CertificateStatus): boolean {
  return CERT_TRANSITIONS[from]?.includes(to) ?? false
}
