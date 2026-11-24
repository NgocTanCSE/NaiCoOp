// ============================================================
// NaiFarm — SEED DEMO (nguồn dữ liệu duy nhất cho mọi màn hình)
// Tất cả bản ghi là DỮ LIỆU GIẢ LẬP, gắn nhãn "Mẫu/Demo".
// Tham chiếu: Blueprint V3 chương 11. Không dùng để công bố thật.
// ============================================================

export type UnitType = 'phuong' | 'xa'

export interface AdminUnit {
  code: string
  name: string
  type: UnitType
}

export interface Profile {
  id: string
  displayName: string
  age?: number
  role: string
  workspace: 'W01' | 'W02' | 'W03' | 'W04' | 'W06'
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
  certStatus: 'self_declared' | 'document_matched' | 'source_confirmed' | 'none'
}

export interface Product {
  id: string
  farmId: string
  name: string
  category: string
  pricePerKg: number
  unit: string
  stockKg: number
  season: 'in_season' | 'preorder' | 'out_of_stock'
  description: string
  batchCode?: string
}

export interface DiaryEvent {
  id: string
  at: string
  phase: 'khoi_tao' | 'cham_soc' | 'thu_hoach' | 'phan_loai' | 'giao_nhan'
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
  sourceStatus: 'self_declared' | 'volunteer_recorded' | 'document_matched' | 'source_confirmed'
  diary: DiaryEvent[]
}

export type OrderStatus =
  | 'Pending' | 'Confirmed' | 'Packing' | 'Ready'
  | 'Shipping' | 'Completed' | 'Cancelled'

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
  fulfillment: 'delivery' | 'pickup'
  shippingFee: number
  paymentStatus: 'Unpaid' | 'Paid' | 'COD'
  items: OrderItem[]
  createdAt: string
  history: { at: string; status: OrderStatus; note: string }[]
}

export type MissionStatus =
  | 'Open' | 'Assigned' | 'InProgress' | 'Submitted' | 'Revision'
  | 'BeneficiaryAccepted' | 'Approved' | 'Recorded' | 'Cancelled'

export interface Mission {
  id: string
  requestId: string
  farmId: string
  title: string
  goal: string
  output: string
  skill: string
  mode: 'online' | 'onsite' | 'hybrid'
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
  beneficiaryStatus: 'pending' | 'accepted' | 'needs_work'
  reviewStatus: 'pending' | 'approved' | 'revision'
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
  status: 'scheduled' | 'live' | 'ended' | 'cancelled'
  products: string[]
}

export interface Certificate {
  id: string
  farmId: string
  productId: string | null
  issuer: string
  type: string
  validity: string | null
  verificationStatus: 'self_declared' | 'document_matched' | 'source_confirmed' | 'expired' | 'revoked'
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

// ------------------------------------------------------------
// Đơn vị hành chính — chỉ dùng tập ĐÃ ĐỐI CHIẾU cho demo.
// Nguồn chương 11.3 cảnh báo bất nhất danh sách 95 đơn vị;
// hiển thị kèm nhãn "phạm vi mở rộng 95 xã/phường".
// ------------------------------------------------------------
export const adminUnits: AdminUnit[] = [
  { code: 'P-LONGKHANH', name: 'Phường Long Khánh', type: 'phuong' },
  { code: 'P-BINHLOC', name: 'Phường Bình Lộc', type: 'phuong' },
  { code: 'P-TANTRIEU', name: 'Phường Tân Triều', type: 'phuong' },
  { code: 'P-BAOVINH', name: 'Phường Bảo Vinh', type: 'phuong' },
  { code: 'X-GIAKIEM', name: 'Xã Gia Kiệm', type: 'xa' },
  { code: 'X-BUDANG', name: 'Xã Bù Đăng', type: 'xa' },
  { code: 'X-PHURIENG', name: 'Xã Phú Riềng', type: 'xa' },
  { code: 'P-LOCNINH', name: 'Phường Lộc Ninh', type: 'phuong' },
  { code: 'X-THOSON', name: 'Xã Thọ Sơn', type: 'xa' },
  { code: 'X-BUGIAMAP', name: 'Xã Bù Gia Mập', type: 'xa' },
]

export const unitName = (code: string | null): string =>
  adminUnits.find((u) => u.code === code)?.name ?? 'Chưa gán địa bàn'

// ------------------------------------------------------------
// Hồ sơ người dùng demo
// ------------------------------------------------------------
export const profiles: Profile[] = [
  {
    id: 'u-ba-tu',
    displayName: 'Chú Ba Tư',
    age: 50,
    role: 'farm_owner',
    workspace: 'W02',
    unitCode: 'P-LONGKHANH',
  },
  {
    id: 'u-minh-anh',
    displayName: 'Nguyễn Minh Anh',
    age: 21,
    role: 'volunteer',
    workspace: 'W03',
    unitCode: 'P-LONGKHANH',
  },
  {
    id: 'u-youth-2',
    displayName: 'Trần Gia Hân',
    age: 22,
    role: 'volunteer',
    workspace: 'W03',
    unitCode: 'P-BINHLOC',
  },
  {
    id: 'u-ngoc-linh',
    displayName: 'Ngọc Linh',
    age: 29,
    role: 'customer',
    workspace: 'W01',
    unitCode: null,
    home: 'TP. Hồ Chí Minh',
  },
  {
    id: 'u-thu-ha',
    displayName: 'Thu Hà',
    age: 27,
    role: 'local_coordinator',
    workspace: 'W04',
    unitCode: 'P-LONGKHANH',
  },
  {
    id: 'u-admin',
    displayName: 'Quản trị NaiFarm',
    role: 'platform_admin',
    workspace: 'W06',
    unitCode: null,
  },
]

export const profileById = (id: string) => profiles.find((p) => p.id === id)

// ------------------------------------------------------------
// Nhà vườn / cơ sở
// ------------------------------------------------------------
export const farms: Farm[] = [
  {
    id: 'farm-ba-tu-demo',
    ownerId: 'u-ba-tu',
    name: 'Nhà vườn Ba Tư',
    owner: 'Chú Ba Tư, 50 tuổi',
    story:
      'Nhà vườn 2,5 ha chôm chôm và sầu riêng ở Long Khánh. Ba Tư làm vườn hơn 20 năm, mong bán được nông sản đúng giá trị và ghi lại hành trình mỗi lô hàng để khách yên tâm.',
    unitCode: 'P-LONGKHANH',
    address: 'Phường Long Khánh, Thành phố Đồng Nai',
    areaHa: 2.5,
    crops: ['Chôm chôm', 'Sầu riêng'],
    isDemo: true,
    location: { lat: 10.9333, lng: 107.2444 },
    certStatus: 'self_declared',
  },
  {
    id: 'farm-mua-xanh',
    ownerId: 'u-ba-tu',
    name: 'Vườn trải nghiệm Mùa Xanh',
    owner: 'Đại diện minh họa',
    story: 'Không gian trải nghiệm trái cây theo mùa, đón khách nhỏ và gia đình.',
    unitCode: 'P-BINHLOC',
    address: 'Phường Bình Lộc, Thành phố Đồng Nai',
    areaHa: 3.2,
    crops: ['Trái cây', 'Trải nghiệm'],
    isDemo: true,
    location: { lat: 10.9694, lng: 107.2203 },
    certStatus: 'none',
  },
  {
    id: 'farm-an-lanh',
    ownerId: 'u-ba-tu',
    name: 'Vườn Bưởi An Lành',
    owner: 'Đại diện minh họa',
    story: 'Vườn bưởi Tân Triều gắn câu chuyện vùng đặc sản, có sơ chế.',
    unitCode: 'P-TANTRIEU',
    address: 'Phường Tân Triều, Thành phố Đồng Nai',
    areaHa: 2.1,
    crops: ['Bưởi'],
    isDemo: true,
    location: { lat: 10.8611, lng: 106.9722 },
    certStatus: 'document_matched',
  },
  {
    id: 'farm-dat-do',
    ownerId: 'u-ba-tu',
    name: 'Trang trại Đất Đỏ',
    owner: 'Đại diện minh họa',
    story: 'Trang trại cây ăn quả tổng hợp.',
    unitCode: 'X-GIAKIEM',
    address: 'Xã Gia Kiệm, Thành phố Đồng Nai',
    areaHa: 4.0,
    crops: ['Cây ăn quả'],
    isDemo: true,
    location: { lat: 11.0667, lng: 107.15 },
    certStatus: 'none',
  },
  {
    id: 'farm-dieu-binh-minh',
    ownerId: 'u-ba-tu',
    name: 'Vườn Điều Bình Minh',
    owner: 'Đại diện minh họa',
    story: 'Vườn điều phía Bắc thành phố, có chế biến hạt.',
    unitCode: 'X-BUDANG',
    address: 'Xã Bù Đăng, Thành phố Đồng Nai',
    areaHa: 5.5,
    crops: ['Hạt điều'],
    isDemo: true,
    location: { lat: 11.8167, lng: 107.2 },
    certStatus: 'self_declared',
  },
  {
    id: 'farm-hat-viet',
    ownerId: 'u-ba-tu',
    name: 'Nông trại Hạt Việt',
    owner: 'Đại diện minh họa',
    story: 'Điều và nông sản phía Bắc.',
    unitCode: 'X-PHURIENG',
    address: 'Xã Phú Riềng, Thành phố Đồng Nai',
    areaHa: 6.0,
    crops: ['Điều', 'Nông sản'],
    isDemo: true,
    location: { lat: 11.7167, lng: 106.9833 },
    certStatus: 'none',
  },
  {
    id: 'farm-tieu-xanh',
    ownerId: 'u-ba-tu',
    name: 'Vườn Tiêu Xanh',
    owner: 'Đại diện minh họa',
    story: 'Vùng hồ tiêu truyền thống, có bài học thu hoạch và chế biến.',
    unitCode: 'P-LOCNINH',
    address: 'Phường Lộc Ninh, Thành phố Đồng Nai',
    areaHa: 3.0,
    crops: ['Hồ tiêu'],
    isDemo: true,
    location: { lat: 11.8333, lng: 106.6 },
    certStatus: 'document_matched',
  },
  {
    id: 'farm-ban-xanh',
    ownerId: 'u-ba-tu',
    name: 'Tổ nông nghiệp Bản Xanh',
    owner: 'Đại diện minh họa',
    story: 'Rau nhíp, mật ong và nông sản bản địa, gắn tri thức cộng đồng.',
    unitCode: 'X-THOSON',
    address: 'Xã Thọ Sơn, Thành phố Đồng Nai',
    areaHa: 1.8,
    crops: ['Rau nhíp', 'Mật ong'],
    isDemo: true,
    location: { lat: 11.5, lng: 107.3 },
    certStatus: 'none',
  },
  {
    id: 'farm-doi-xanh',
    ownerId: 'u-ba-tu',
    name: 'Nông trại Đồi Xanh',
    owner: 'Đại diện minh họa',
    story: 'Điều và chế biến nông sản.',
    unitCode: 'X-BUGIAMAP',
    address: 'Xã Bù Gia Mập, Thành phố Đồng Nai',
    areaHa: 4.5,
    crops: ['Điều', 'Chế biến'],
    isDemo: true,
    location: { lat: 11.9833, lng: 107.15 },
    certStatus: 'none',
  },
]

export const farmById = (id: string) => farms.find((f) => f.id === id)

// ------------------------------------------------------------
// Sản phẩm (Nhà vườn Ba Tư — giá demo 35.000–120.000 đ/kg)
// ------------------------------------------------------------
export const products: Product[] = [
  {
    id: 'P01',
    farmId: 'farm-ba-tu-demo',
    name: 'Chôm chôm Java',
    category: 'Trái cây',
    pricePerKg: 35000,
    unit: 'kg',
    stockKg: 30,
    season: 'in_season',
    description:
      'Chôm chôm Java tách hạt, vỏ đỏ, vị ngọt thanh. Thu hoạch tại vườn, đóng theo yêu cầu.',
    batchCode: 'NF-DEMO-001',
  },
  {
    id: 'P02',
    farmId: 'farm-ba-tu-demo',
    name: 'Chôm chôm nhãn',
    category: 'Trái cây',
    pricePerKg: 45000,
    unit: 'kg',
    stockKg: 0,
    season: 'preorder',
    description: 'Chôm chôm nhãn trái to, hạt nhỏ. Đặt trước theo mùa.',
  },
  {
    id: 'P03',
    farmId: 'farm-ba-tu-demo',
    name: 'Chôm chôm tuyển chọn',
    category: 'Trái cây',
    pricePerKg: 60000,
    unit: 'kg',
    stockKg: 0,
    season: 'preorder',
    description: 'Chôm chôm tuyển chọn, phân loại theo hộp quà.',
  },
  {
    id: 'P04',
    farmId: 'farm-ba-tu-demo',
    name: 'Sầu riêng Ri6',
    category: 'Trái cây',
    pricePerKg: 85000,
    unit: 'kg',
    stockKg: 0,
    season: 'preorder',
    description: 'Sầu riêng Ri6 cơm vàng, theo lô giả lập cần xác nhận.',
  },
  {
    id: 'P05',
    farmId: 'farm-ba-tu-demo',
    name: 'Sầu riêng tuyển chọn',
    category: 'Trái cây',
    pricePerKg: 120000,
    unit: 'kg',
    stockKg: 0,
    season: 'preorder',
    description: 'Sầu riêng tuyển chọn, đóng theo lô.',
  },
  // vài sản phẩm minh họa cho các vườn khác (map, chợ)
  {
    id: 'P10',
    farmId: 'farm-an-lanh',
    name: 'Bưởi Tân Triều',
    category: 'Trái cây',
    pricePerKg: 42000,
    unit: 'kg',
    stockKg: 40,
    season: 'in_season',
    description: 'Bưởi Tân Triều, câu chuyện vùng đặc sản.',
    batchCode: 'NF-DEMO-010',
  },
  {
    id: 'P11',
    farmId: 'farm-dieu-binh-minh',
    name: 'Hạt điều Bình Phước',
    category: 'Hạt',
    pricePerKg: 95000,
    unit: 'kg',
    stockKg: 60,
    season: 'in_season',
    description: 'Hạt điều đã chế biến đúng quy trình (thông tin minh họa).',
    batchCode: 'NF-DEMO-011',
  },
]

export const productById = (id: string) => products.find((p) => p.id === id)
export const productsByFarm = (farmId: string) => products.filter((p) => p.farmId === farmId)

// ------------------------------------------------------------
// Lô hàng
// ------------------------------------------------------------
export const batches: Batch[] = [
  {
    id: 'b-001',
    productId: 'P01',
    farmId: 'farm-ba-tu-demo',
    publicCode: 'NF-DEMO-001',
    harvestDate: '2026-11-20',
    quantityKg: 30,
    sourceStatus: 'self_declared',
    diary: [
      {
        id: 'd1',
        at: '2026-10-02',
        phase: 'khoi_tao',
        note: 'Khởi tạo lô chôm chôm Java, vùng trồng Long Khánh.',
        actor: 'Chú Ba Tư',
      },
      {
        id: 'd2',
        at: '2026-10-18',
        phase: 'cham_soc',
        note: 'Bón phân hữu cơ, tỉa cành. Ghi nhận có ảnh minh họa.',
        actor: 'Chú Ba Tư',
        evidence: 'Ảnh minh họa',
      },
      {
        id: 'd3',
        at: '2026-11-12',
        phase: 'cham_soc',
        note: 'Kiểm tra sâu bệnh, tỉa quả. Không dùng thuốc ngoài danh mục.',
        actor: 'Nguyễn Minh Anh (hỗ trợ nhập)',
      },
      {
        id: 'd4',
        at: '2026-11-20',
        phase: 'thu_hoach',
        note: 'Thu hoạch 30 kg giả lập. Có người xác nhận.',
        actor: 'Chú Ba Tư',
        evidence: 'Ảnh minh họa',
      },
      {
        id: 'd5',
        at: '2026-11-21',
        phase: 'phan_loai',
        note: 'Phân loại quy cách hộp 1 kg, đóng gói sẵn sàng giao.',
        actor: 'Chú Ba Tư',
      },
    ],
  },
  {
    id: 'b-010',
    productId: 'P10',
    farmId: 'farm-an-lanh',
    publicCode: 'NF-DEMO-010',
    harvestDate: '2026-11-10',
    quantityKg: 40,
    sourceStatus: 'document_matched',
    diary: [
      {
        id: 'd10-1',
        at: '2026-10-01',
        phase: 'khoi_tao',
        note: 'Khởi tạo lô bưởi Tân Triều.',
        actor: 'Vườn Bưởi An Lành',
      },
      {
        id: 'd10-2',
        at: '2026-11-10',
        phase: 'thu_hoach',
        note: 'Thu hoạch 40 kg giả lập.',
        actor: 'Vườn Bưởi An Lành',
      },
    ],
  },
]

export const batchByCode = (code: string) => batches.find((b) => b.publicCode === code)

// ------------------------------------------------------------
// Đơn hàng (demo: 2 kg chôm chôm + phí giao demo 20.000 → 90.000)
// ------------------------------------------------------------
export const orders: Order[] = [
  {
    id: 'o-001',
    code: 'NF-ORD-DEMO-001',
    customerId: 'u-ngoc-linh',
    farmId: 'farm-ba-tu-demo',
    status: 'Pending',
    fulfillment: 'delivery',
    shippingFee: 20000,
    paymentStatus: 'COD',
    items: [{ productId: 'P01', batchId: 'b-001', qtyKg: 2, unitPrice: 35000 }],
    createdAt: '2026-11-24T08:40:00Z',
    history: [{ at: '2026-11-24T08:40:00Z', status: 'Pending', note: 'Khách đặt hàng (demo).' }],
  },
  {
    id: 'o-002',
    code: 'NF-ORD-DEMO-002',
    customerId: 'u-ngoc-linh',
    farmId: 'farm-ba-tu-demo',
    status: 'Confirmed',
    fulfillment: 'pickup',
    shippingFee: 0,
    paymentStatus: 'COD',
    items: [{ productId: 'P01', batchId: 'b-001', qtyKg: 3, unitPrice: 35000 }],
    createdAt: '2026-11-23T15:10:00Z',
    history: [
      { at: '2026-11-23T15:10:00Z', status: 'Pending', note: 'Khách đặt hàng (demo).' },
      { at: '2026-11-23T16:00:00Z', status: 'Confirmed', note: 'Nhà vườn xác nhận.' },
    ],
  },
  {
    id: 'o-003',
    code: 'NF-ORD-DEMO-003',
    customerId: 'u-ngoc-linh',
    farmId: 'farm-ba-tu-demo',
    status: 'Completed',
    fulfillment: 'delivery',
    shippingFee: 20000,
    paymentStatus: 'Paid',
    items: [{ productId: 'P04', batchId: 'b-001', qtyKg: 1, unitPrice: 85000 }],
    createdAt: '2026-11-18T09:00:00Z',
    history: [
      { at: '2026-11-18T09:00:00Z', status: 'Pending', note: 'Khách đặt hàng (demo).' },
      { at: '2026-11-18T10:00:00Z', status: 'Completed', note: 'Đã nhận hàng (demo).' },
    ],
  },
]

export const orderById = (id: string) => orders.find((o) => o.id === id)
export const ordersByFarm = (farmId: string) => orders.filter((o) => o.farmId === farmId)
export const orderTotal = (o: Order) =>
  o.items.reduce((s, it) => s + it.qtyKg * it.unitPrice, 0) + o.shippingFee

// ------------------------------------------------------------
// Yêu cầu hỗ trợ + Nhiệm vụ + Minh chứng + Giờ
// ------------------------------------------------------------
export const supportRequests = [
  {
    id: 'sr-001',
    farmId: 'farm-ba-tu-demo',
    title: 'Số hóa 5 sản phẩm và nhật ký lô chôm chôm',
    need: 'Cần chụp ảnh, viết mô tả và nhập nhật ký mùa vụ cho 5 sản phẩm.',
    desiredOutput: '5 hồ sơ sản phẩm + nhật ký lô NF-DEMO-001.',
    status: 'Open',
  },
]

export const missions: Mission[] = [
  {
    id: 'm-001',
    requestId: 'sr-001',
    farmId: 'farm-ba-tu-demo',
    title: 'Số hóa 5 sản phẩm Ba Tư',
    goal: 'Chụp ảnh, viết mô tả và nhập nhật ký cho 5 sản phẩm.',
    output: '5 hồ sơ sản phẩm + 1 nhật ký lô có minh chứng.',
    skill: 'TMĐT, nội dung',
    mode: 'onsite',
    expectedHours: 2,
    dueDate: '2026-11-27',
    assigneeId: 'u-minh-anh',
    slots: 2,
    unitCode: 'P-LONGKHANH',
    status: 'Submitted',
  },
  {
    id: 'm-002',
    requestId: 'sr-001',
    farmId: 'farm-dieu-binh-minh',
    title: 'Thiết kế bao bì hạt điều',
    goal: 'Thiết kế nhãn bao bì trung thực, ghi rõ vùng trồng.',
    output: '1 bộ nhãn bao bì (file thiết kế).',
    skill: 'Thiết kế đồ họa',
    mode: 'online',
    expectedHours: 3,
    dueDate: '2026-11-30',
    assigneeId: null,
    slots: 1,
    unitCode: 'X-BUDANG',
    status: 'Open',
  },
  {
    id: 'm-003',
    requestId: 'sr-001',
    farmId: 'farm-an-lanh',
    title: 'Tạo mô hình 3D quả bưởi',
    goal: 'Dựng mô hình GLB đơn giản có chú thích bộ phận.',
    output: '1 mô hình GLB + poster tĩnh.',
    skill: '3D, CNTT',
    mode: 'online',
    expectedHours: 4,
    dueDate: '2026-12-02',
    assigneeId: null,
    slots: 1,
    unitCode: 'P-TANTRIEU',
    status: 'Open',
  },
  {
    id: 'm-004',
    requestId: 'sr-001',
    farmId: 'farm-ba-tu-demo',
    title: 'Hướng dẫn nhà vườn livestream',
    goal: 'Hướng dẫn Ba Tư tạo lịch và lên sóng bán hàng.',
    output: '1 buổi hướng dẫn + checklist.',
    skill: 'Truyền thông, chuyển giao',
    mode: 'hybrid',
    expectedHours: 2,
    dueDate: '2026-11-29',
    assigneeId: 'u-youth-2',
    slots: 1,
    unitCode: 'P-LONGKHANH',
    status: 'InProgress',
  },
]

export const missionById = (id: string) => missions.find((m) => m.id === id)

export const missionSubmissions: MissionSubmission[] = [
  {
    id: 'sub-001',
    missionId: 'm-001',
    submitterId: 'u-minh-anh',
    version: 1,
    evidence: ['Bộ ảnh 5 sản phẩm', 'File mô tả.docx', 'Liên kết nhật ký lô'],
    outputNote:
      'Đã chụp 5 sản phẩm, viết mô tả và nhập 5 mốc nhật ký cho lô NF-DEMO-001.',
    actualHours: 2.5,
    beneficiaryStatus: 'pending',
    reviewStatus: 'pending',
  },
]

export const volunteerLogs: VolunteerLog[] = [
  {
    id: 'vl-000',
    missionId: 'm-004',
    volunteerId: 'u-youth-2',
    submissionId: 'sub-prev',
    approvedMinutes: 110,
    reviewerId: 'u-thu-ha',
    beneficiaryConfirmationId: 'bc-prev',
    at: '2026-11-15T09:00:00Z',
    adjustmentOf: null,
  },
]

// ------------------------------------------------------------
// Livestream
// ------------------------------------------------------------
export const livestreams: Livestream[] = [
  {
    id: 'lv-001',
    farmId: 'farm-ba-tu-demo',
    hostId: 'u-minh-anh',
    title: 'Live bán chôm chôm Long Khánh cùng Ba Tư',
    scheduledAt: '2026-11-25T20:00:00Z',
    durationMin: 45,
    status: 'scheduled',
    products: ['P01'],
  },
  {
    id: 'lv-002',
    farmId: 'farm-an-lanh',
    hostId: 'u-youth-2',
    title: 'Tham quan vườn bưởi Tân Triều',
    scheduledAt: '2026-11-26T09:00:00Z',
    durationMin: 30,
    status: 'scheduled',
    products: ['P10'],
  },
  {
    id: 'lv-003',
    farmId: 'farm-ba-tu-demo',
    hostId: 'u-minh-anh',
    title: 'Đã kết thúc — hướng dẫn ghi nhật ký (bản ghi)',
    scheduledAt: '2026-11-20T20:00:00Z',
    durationMin: 40,
    status: 'ended',
    products: ['P01'],
  },
]

// ------------------------------------------------------------
// Chứng nhận / chứng từ nguồn (tách tự khai – đối chiếu – nguồn)
// ------------------------------------------------------------
export const certificates: Certificate[] = [
  {
    id: 'cert-001',
    farmId: 'farm-ba-tu-demo',
    productId: null,
    issuer: 'Hồ sơ minh họa (demo)',
    type: 'OCOP (chưa đối chiếu)',
    validity: null,
    verificationStatus: 'self_declared',
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: null,
  },
  {
    id: 'cert-002',
    farmId: 'farm-an-lanh',
    productId: 'P10',
    issuer: 'Hồ sơ minh họa (demo)',
    type: 'VietGAP (đã đối chiếu tài liệu)',
    validity: '2027-06-30',
    verificationStatus: 'document_matched',
    reviewedBy: 'u-thu-ha',
    reviewedAt: '2026-11-10T08:00:00Z',
    reviewNote: 'Đã đối chiếu ảnh tài liệu khớp tên chủ thể và phạm vi. Chưa xác nhận từ đơn vị cấp.',
  },
]

// ------------------------------------------------------------
// Học tập (minh họa P1)
// ------------------------------------------------------------
export const lessons: Lesson[] = [
  {
    id: 'l-001',
    title: 'Hành trình của hạt điều Đồng Nai',
    audience: 'thpt',
    subject: 'Công nghệ / Địa lý',
    minutes: 15,
    objectives: [
      'Phân biệt quả giả và quả thật chứa hạt',
      'Nhận biết vùng trồng trên bản đồ Đồng Nai',
      'Hiểu vì sao cần chế biến đúng quy trình (không tự thực hiện)',
    ],
  },
  {
    id: 'l-002',
    title: 'Nhật ký mùa vụ: từ lời nói đến dữ liệu',
    audience: 'dh',
    subject: 'CNTT / Nông học',
    minutes: 20,
    objectives: ['Ghi nhật ký bằng ảnh/giọng', 'Hiểu cấu trúc sự kiện lô hàng'],
  },
]

// ------------------------------------------------------------
// KPI tác động — TẤT CẢ GIẢ LẬP (nhãn demo)
// ------------------------------------------------------------
export const impactDemo = {
  farmsSupported: 24,
  productsDigitized: 136,
  hoursApproved: 320,
  missionsCompleted: 48,
  lessonsCompleted: 85,
  farmersSelfPublish: 18,
  missionsByMonth: [
    { label: 'T7', value: 4 },
    { label: 'T8', value: 7 },
    { label: 'T9', value: 9 },
    { label: 'T10', value: 12 },
    { label: 'T11', value: 16 },
  ],
}

// Bằng chứng / minh chứng chờ duyệt cho W04 (theo unit_code Long Khánh)
export const coordinatorPending = {
  supportRequests: supportRequests.filter((s) => s.status === 'Open').length,
  pendingSubmissions: missionSubmissions.filter((s) => s.reviewStatus === 'pending').length,
  certsToReview: certificates.filter(
    (c) => c.verificationStatus === 'self_declared',
  ).length,
}
