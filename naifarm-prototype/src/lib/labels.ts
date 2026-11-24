import type { OrderStatus } from './seed'

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'primary' | 'gold'

export const orderStatusLabel: Record<OrderStatus, string> = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Packing: 'Đang đóng gói',
  Ready: 'Sẵn sàng giao/nhận',
  Shipping: 'Đang giao',
  Completed: 'Hoàn thành',
  Cancelled: 'Đã hủy',
}

export const orderStatusTone: Record<OrderStatus, Tone> = {
  Pending: 'warning',
  Confirmed: 'info',
  Packing: 'info',
  Ready: 'primary',
  Shipping: 'info',
  Completed: 'success',
  Cancelled: 'danger',
}

export const missionStatusLabel: Record<string, string> = {
  Open: 'Đang mở',
  Assigned: 'Đã nhận',
  InProgress: 'Đang thực hiện',
  Submitted: 'Đã nộp minh chứng',
  Revision: 'Cần chỉnh sửa',
  BeneficiaryAccepted: 'Nhà vườn đã nhận đầu ra',
  Approved: 'Đã duyệt giờ',
  Recorded: 'Đã ghi giờ',
  Cancelled: 'Đã hủy',
}

export const missionStatusTone: Record<string, Tone> = {
  Open: 'info',
  Assigned: 'primary',
  InProgress: 'primary',
  Submitted: 'warning',
  Revision: 'danger',
  BeneficiaryAccepted: 'accent',
  Approved: 'success',
  Recorded: 'success',
  Cancelled: 'neutral',
}

export const certLabel: Record<string, string> = {
  self_declared: 'Nhà vườn tự khai báo',
  document_matched: 'Đã đối chiếu tài liệu',
  source_confirmed: 'Đã xác nhận nguồn',
  expired: 'Hết hạn',
  revoked: 'Đã thu hồi',
  none: 'Chưa có chứng nhận',
}

export const certTone: Record<string, Tone> = {
  self_declared: 'warning',
  document_matched: 'info',
  source_confirmed: 'success',
  expired: 'danger',
  revoked: 'danger',
  none: 'neutral',
}

export const sourceStatusLabel: Record<string, string> = {
  self_declared: 'Nhà vườn tự khai báo (chưa đối chiếu)',
  volunteer_recorded: 'Thanh niên hỗ trợ ghi nhận',
  document_matched: 'Hồ sơ đã đối chiếu tài liệu',
  source_confirmed: 'Nguồn đã được xác nhận',
}

export const seasonLabel: Record<string, string> = {
  in_season: 'Đang có hàng',
  preorder: 'Hẹn mùa / đặt trước',
  out_of_stock: 'Tạm hết hàng',
}

export const modeLabel: Record<string, string> = {
  online: 'Trực tuyến',
  onsite: 'Tại chỗ',
  hybrid: 'Kết hợp',
}
