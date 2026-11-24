/**
 * Luật ghi nhận giờ tình nguyện — phải khớp với bất biến trong DB (RPC + trigger).
 * 1) Nhà vườn xác nhận đầu ra (lớp 1)
 * 2) Điều phối duyệt giờ (lớp 2) — KHÔNG được tự duyệt nhiệm vụ của mình
 */
export const HOURS_RULES = {
  requiresBeneficiaryAcceptance: true,
  forbidsSelfApproval: true,
} as const

export function minutesFromHours(hours: number): number {
  return Math.round(hours * 60)
}
