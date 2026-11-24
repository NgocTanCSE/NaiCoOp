// ============================================================
// Kiểu dữ liệu miền — phản chiếu 1:1 `naifarm-prototype/src/lib/seed.ts`
// để front-end nối vào API mà không phải đổi kiểu.
// ============================================================

export type WorkspaceKey = 'W01' | 'W02' | 'W03' | 'W04' | 'W06'

export type AppRole =
  | 'farm_owner'
  | 'volunteer'
  | 'customer'
  | 'local_coordinator'
  | 'platform_admin'

export type UnitType = 'phuong' | 'xa'

export type CertStatus = 'self_declared' | 'document_matched' | 'source_confirmed' | 'none'
export type SourceStatus = 'self_declared' | 'volunteer_recorded' | 'document_matched' | 'source_confirmed'
export type Season = 'in_season' | 'preorder' | 'out_of_stock'
export type DiaryPhase = 'khoi_tao' | 'cham_soc' | 'thu_hoach' | 'phan_loai' | 'giao_nhan'
export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Packing'
  | 'Ready'
  | 'Shipping'
  | 'Completed'
  | 'Cancelled'
export type Fulfillment = 'delivery' | 'pickup'
export type PaymentStatus = 'Unpaid' | 'Paid' | 'COD'
export type MissionStatus =
  | 'Open'
  | 'Assigned'
  | 'InProgress'
  | 'Submitted'
  | 'Revision'
  | 'BeneficiaryAccepted'
  | 'Approved'
  | 'Recorded'
  | 'Cancelled'
export type MissionMode = 'online' | 'onsite' | 'hybrid'
export type BeneficiaryStatus = 'pending' | 'accepted' | 'needs_work'
export type ReviewStatus = 'pending' | 'approved' | 'revision'
export type LivestreamStatus = 'scheduled' | 'live' | 'ended' | 'cancelled'
export type CertificateStatus =
  | 'self_declared'
  | 'document_matched'
  | 'source_confirmed'
  | 'expired'
  | 'revoked'

export interface AdminUnit {
  code: string
  name: string
  type: UnitType
}

export interface Profile {
  id: string
  displayName: string
  age?: number
  role: AppRole
  workspace: WorkspaceKey
  unitCode: string | null
  home?: string
}

export interface Farm {
  id: string
  ownerId: string
  name: string
  owner: string
  story: string
  unitCode: string
  address: string
  areaHa: number
  crops: string[]
  isDemo: boolean
  location: { lat: number; lng: number }
  certStatus: CertStatus
}

export interface Product {
  id: string
  farmId: string
  name: string
  category: string
  pricePerKg: number
  unit: string
  stockKg: number
  season: Season
  description: string
  batchCode?: string
}

export interface DiaryEvent {
  id: string
  at: string
  phase: DiaryPhase
  note: string
  actor: string
  evidence?: string
}

export interface Batch {
  id: string
  productId: string
  farmId: string
  publicCode: string
  harvestDate: string
  quantityKg: number
  sourceStatus: SourceStatus
  diary: DiaryEvent[]
}

export interface OrderItem {
  productId: string
  batchId: string
  qtyKg: number
  unitPrice: number
}

export interface Order {
  id: string
  code: string
  customerId: string
  farmId: string
  status: OrderStatus
  fulfillment: Fulfillment
  shippingFee: number
  paymentStatus: PaymentStatus
  items: OrderItem[]
  createdAt: string
  history: { at: string; status: OrderStatus; note: string }[]
}

export interface Mission {
  id: string
  requestId: string
  farmId: string
  title: string
  goal: string
  output: string
  skill: string
  mode: MissionMode
  expectedHours: number
  dueDate: string
  assigneeId: string | null
  slots: number
  unitCode: string
  status: MissionStatus
}

export interface MissionSubmission {
  id: string
  missionId: string
  submitterId: string
  version: number
  evidence: string[]
  outputNote: string
  actualHours: number
  beneficiaryStatus: BeneficiaryStatus
  reviewStatus: ReviewStatus
}

export interface VolunteerLog {
  id: string
  missionId: string
  volunteerId: string
  submissionId: string
  approvedMinutes: number
  reviewerId: string
  beneficiaryConfirmationId: string
  at: string
  adjustmentOf: string | null
}

export interface Livestream {
  id: string
  farmId: string
  hostId: string
  title: string
  scheduledAt: string
  durationMin: number
  status: LivestreamStatus
  products: string[]
}

export interface Certificate {
  id: string
  farmId: string
  productId: string | null
  issuer: string
  type: string
  validity: string | null
  verificationStatus: CertificateStatus
  reviewedBy: string | null
  reviewedAt: string | null
  reviewNote: string | null
}

export interface Lesson {
  id: string
  title: string
  audience: 'thpt' | 'dh'
  subject: string
  minutes: number
  objectives: string[]
}

export interface SupportRequest {
  id: string
  farmId: string
  title: string
  need: string
  desiredOutput: string
  status: string
}

// Bản ghi cơ bản trong DB (snake_case) — dùng cho mapper
export interface ProfileRow {
  id: string
  legacy_id: string | null
  display_name: string
  age: number | null
  role: AppRole
  workspace: WorkspaceKey
  unit_code: string | null
  home: string | null
}
