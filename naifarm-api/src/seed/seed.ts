/**
 * NaiFarm — seed dữ liệu demo vào Supabase.
 * Chạy:  npm run db:seed   (cần SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
 * Đọc thêm .env nếu có. Idempotent: dùng upsert theo id / email.
 *
 * Tất cả bản ghi là DỮ LIỆU GIẢ LẬP (demo) — tham chiếu Blueprint V3 chương 11.
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

/* ------------------------------ env ------------------------------ */
function loadEnvFile() {
  try {
    const text = readFileSync('.env', 'utf8')
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    /* không có .env — dùng biến môi trường */
  }
}
loadEnvFile()

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY (xem .dev.vars.example / .env)')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const DEMO_PASSWORD = 'Naifarm@2026'

/* ------------------------------ dữ liệu ------------------------------ */
const adminUnits = [
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

const users = [
  { legacyId: 'u-ba-tu', email: 'batu@naifarm.demo', displayName: 'Chú Ba Tư', age: 50, role: 'farm_owner', workspace: 'W02', unitCode: 'P-LONGKHANH', home: null },
  { legacyId: 'u-minh-anh', email: 'minhanh@naifarm.demo', displayName: 'Nguyễn Minh Anh', age: 21, role: 'volunteer', workspace: 'W03', unitCode: 'P-LONGKHANH', home: null },
  { legacyId: 'u-youth-2', email: 'giahan@naifarm.demo', displayName: 'Trần Gia Hân', age: 22, role: 'volunteer', workspace: 'W03', unitCode: 'P-BINHLOC', home: null },
  { legacyId: 'u-ngoc-linh', email: 'ngoclinh@naifarm.demo', displayName: 'Ngọc Linh', age: 29, role: 'customer', workspace: 'W01', unitCode: null, home: 'TP. Hồ Chí Minh' },
  { legacyId: 'u-thu-ha', email: 'thuha@naifarm.demo', displayName: 'Thu Hà', age: 27, role: 'local_coordinator', workspace: 'W04', unitCode: 'P-LONGKHANH', home: null },
  { legacyId: 'u-admin', email: 'admin@naifarm.demo', displayName: 'Quản trị NaiFarm', age: null, role: 'platform_admin', workspace: 'W06', unitCode: null, home: null },
]

const farms = [
  { id: 'farm-ba-tu-demo', ownerId: 'u-ba-tu', name: 'Nhà vườn Ba Tư', owner: 'Chú Ba Tư, 50 tuổi', story: 'Nhà vườn 2,5 ha chôm chôm và sầu riêng ở Long Khánh. Ba Tư làm vườn hơn 20 năm, mong bán được nông sản đúng giá trị và ghi lại hành trình mỗi lô hàng để khách yên tâm.', unitCode: 'P-LONGKHANH', address: 'Phường Long Khánh, Thành phố Đồng Nai', areaHa: 2.5, crops: ['Chôm chôm', 'Sầu riêng'], lat: 10.9333, lng: 107.2444, certStatus: 'self_declared' },
  { id: 'farm-mua-xanh', ownerId: 'u-ba-tu', name: 'Vườn trải nghiệm Mùa Xanh', owner: 'Đại diện minh họa', story: 'Không gian trải nghiệm trái cây theo mùa, đón khách nhỏ và gia đình.', unitCode: 'P-BINHLOC', address: 'Phường Bình Lộc, Thành phố Đồng Nai', areaHa: 3.2, crops: ['Trái cây', 'Trải nghiệm'], lat: 10.9694, lng: 107.2203, certStatus: 'none' },
  { id: 'farm-an-lanh', ownerId: 'u-ba-tu', name: 'Vườn Bưởi An Lành', owner: 'Đại diện minh họa', story: 'Vườn bưởi Tân Triều gắn câu chuyện vùng đặc sản, có sơ chế.', unitCode: 'P-TANTRIEU', address: 'Phường Tân Triều, Thành phố Đồng Nai', areaHa: 2.1, crops: ['Bưởi'], lat: 10.8611, lng: 106.9722, certStatus: 'document_matched' },
  { id: 'farm-dat-do', ownerId: 'u-ba-tu', name: 'Trang trại Đất Đỏ', owner: 'Đại diện minh họa', story: 'Trang trại cây ăn quả tổng hợp.', unitCode: 'X-GIAKIEM', address: 'Xã Gia Kiệm, Thành phố Đồng Nai', areaHa: 4.0, crops: ['Cây ăn quả'], lat: 11.0667, lng: 107.15, certStatus: 'none' },
  { id: 'farm-dieu-binh-minh', ownerId: 'u-ba-tu', name: 'Vườn Điều Bình Minh', owner: 'Đại diện minh họa', story: 'Vườn điều phía Bắc thành phố, có chế biến hạt.', unitCode: 'X-BUDANG', address: 'Xã Bù Đăng, Thành phố Đồng Nai', areaHa: 5.5, crops: ['Hạt điều'], lat: 11.8167, lng: 107.2, certStatus: 'self_declared' },
  { id: 'farm-hat-viet', ownerId: 'u-ba-tu', name: 'Nông trại Hạt Việt', owner: 'Đại diện minh họa', story: 'Điều và nông sản phía Bắc.', unitCode: 'X-PHURIENG', address: 'Xã Phú Riềng, Thành phố Đồng Nai', areaHa: 6.0, crops: ['Điều', 'Nông sản'], lat: 11.7167, lng: 106.9833, certStatus: 'none' },
  { id: 'farm-tieu-xanh', ownerId: 'u-ba-tu', name: 'Vườn Tiêu Xanh', owner: 'Đại diện minh họa', story: 'Vùng hồ tiêu truyền thống, có bài học thu hoạch và chế biến.', unitCode: 'P-LOCNINH', address: 'Phường Lộc Ninh, Thành phố Đồng Nai', areaHa: 3.0, crops: ['Hồ tiêu'], lat: 11.8333, lng: 106.6, certStatus: 'document_matched' },
  { id: 'farm-ban-xanh', ownerId: 'u-ba-tu', name: 'Tổ nông nghiệp Bản Xanh', owner: 'Đại diện minh họa', story: 'Rau nhíp, mật ong và nông sản bản địa, gắn tri thức cộng đồng.', unitCode: 'X-THOSON', address: 'Xã Thọ Sơn, Thành phố Đồng Nai', areaHa: 1.8, crops: ['Rau nhíp', 'Mật ong'], lat: 11.5, lng: 107.3, certStatus: 'none' },
  { id: 'farm-doi-xanh', ownerId: 'u-ba-tu', name: 'Nông trại Đồi Xanh', owner: 'Đại diện minh họa', story: 'Điều và chế biến nông sản.', unitCode: 'X-BUGIAMAP', address: 'Xã Bù Gia Mập, Thành phố Đồng Nai', areaHa: 4.5, crops: ['Điều', 'Chế biến'], lat: 11.9833, lng: 107.15, certStatus: 'none' },
]

const products = [
  { id: 'P01', farmId: 'farm-ba-tu-demo', name: 'Chôm chôm Java', category: 'Trái cây', pricePerKg: 35000, stockKg: 30, season: 'in_season', description: 'Chôm chôm Java tách hạt, vỏ đỏ, vị ngọt thanh. Thu hoạch tại vườn, đóng theo yêu cầu.', batchCode: 'NF-DEMO-001' },
  { id: 'P02', farmId: 'farm-ba-tu-demo', name: 'Chôm chôm nhãn', category: 'Trái cây', pricePerKg: 45000, stockKg: 0, season: 'preorder', description: 'Chôm chôm nhãn trái to, hạt nhỏ. Đặt trước theo mùa.' },
  { id: 'P03', farmId: 'farm-ba-tu-demo', name: 'Chôm chôm tuyển chọn', category: 'Trái cây', pricePerKg: 60000, stockKg: 0, season: 'preorder', description: 'Chôm chôm tuyển chọn, phân loại theo hộp quà.' },
  { id: 'P04', farmId: 'farm-ba-tu-demo', name: 'Sầu riêng Ri6', category: 'Trái cây', pricePerKg: 85000, stockKg: 0, season: 'preorder', description: 'Sầu riêng Ri6 cơm vàng, theo lô giả lập cần xác nhận.' },
  { id: 'P05', farmId: 'farm-ba-tu-demo', name: 'Sầu riêng tuyển chọn', category: 'Trái cây', pricePerKg: 120000, stockKg: 0, season: 'preorder', description: 'Sầu riêng tuyển chọn, đóng theo lô.' },
  { id: 'P10', farmId: 'farm-an-lanh', name: 'Bưởi Tân Triều', category: 'Trái cây', pricePerKg: 42000, stockKg: 40, season: 'in_season', description: 'Bưởi Tân Triều, câu chuyện vùng đặc sản.', batchCode: 'NF-DEMO-010' },
  { id: 'P11', farmId: 'farm-dieu-binh-minh', name: 'Hạt điều Bình Phước', category: 'Hạt', pricePerKg: 95000, stockKg: 60, season: 'in_season', description: 'Hạt điều đã chế biến đúng quy trình (thông tin minh họa).', batchCode: 'NF-DEMO-011' },
]

const batches = [
  {
    id: 'b-001', productId: 'P01', farmId: 'farm-ba-tu-demo', publicCode: 'NF-DEMO-001', harvestDate: '2026-11-20', quantityKg: 30, sourceStatus: 'self_declared',
    diary: [
      { id: 'd1', at: '2026-10-02', phase: 'khoi_tao', note: 'Khởi tạo lô chôm chôm Java, vùng trồng Long Khánh.', actor: 'Chú Ba Tư' },
      { id: 'd2', at: '2026-10-18', phase: 'cham_soc', note: 'Bón phân hữu cơ, tỉa cành. Ghi nhận có ảnh minh họa.', actor: 'Chú Ba Tư', evidence: 'Ảnh minh họa' },
      { id: 'd3', at: '2026-11-12', phase: 'cham_soc', note: 'Kiểm tra sâu bệnh, tỉa quả. Không dùng thuốc ngoài danh mục.', actor: 'Nguyễn Minh Anh (hỗ trợ nhập)' },
      { id: 'd4', at: '2026-11-20', phase: 'thu_hoach', note: 'Thu hoạch 30 kg giả lập. Có người xác nhận.', actor: 'Chú Ba Tư', evidence: 'Ảnh minh họa' },
      { id: 'd5', at: '2026-11-21', phase: 'phan_loai', note: 'Phân loại quy cách hộp 1 kg, đóng gói sẵn sàng giao.', actor: 'Chú Ba Tư' },
    ],
  },
  {
    id: 'b-010', productId: 'P10', farmId: 'farm-an-lanh', publicCode: 'NF-DEMO-010', harvestDate: '2026-11-10', quantityKg: 40, sourceStatus: 'document_matched',
    diary: [
      { id: 'd10-1', at: '2026-10-01', phase: 'khoi_tao', note: 'Khởi tạo lô bưởi Tân Triều.', actor: 'Vườn Bưởi An Lành' },
      { id: 'd10-2', at: '2026-11-10', phase: 'thu_hoach', note: 'Thu hoạch 40 kg giả lập.', actor: 'Vườn Bưởi An Lành' },
    ],
  },
]

const orders = [
  { id: 'o-001', code: 'NF-ORD-DEMO-001', customerId: 'u-ngoc-linh', farmId: 'farm-ba-tu-demo', status: 'Pending', fulfillment: 'delivery', shippingFee: 20000, paymentStatus: 'COD', createdAt: '2026-11-24T08:40:00Z', items: [{ productId: 'P01', batchId: 'b-001', qtyKg: 2, unitPrice: 35000 }], history: [{ at: '2026-11-24T08:40:00Z', status: 'Pending', note: 'Khách đặt hàng (demo).' }] },
  { id: 'o-002', code: 'NF-ORD-DEMO-002', customerId: 'u-ngoc-linh', farmId: 'farm-ba-tu-demo', status: 'Confirmed', fulfillment: 'pickup', shippingFee: 0, paymentStatus: 'COD', createdAt: '2026-11-23T15:10:00Z', items: [{ productId: 'P01', batchId: 'b-001', qtyKg: 3, unitPrice: 35000 }], history: [{ at: '2026-11-23T15:10:00Z', status: 'Pending', note: 'Khách đặt hàng (demo).' }, { at: '2026-11-23T16:00:00Z', status: 'Confirmed', note: 'Nhà vườn xác nhận.' }] },
  { id: 'o-003', code: 'NF-ORD-DEMO-003', customerId: 'u-ngoc-linh', farmId: 'farm-ba-tu-demo', status: 'Completed', fulfillment: 'delivery', shippingFee: 20000, paymentStatus: 'Paid', createdAt: '2026-11-18T09:00:00Z', items: [{ productId: 'P04', batchId: 'b-001', qtyKg: 1, unitPrice: 85000 }], history: [{ at: '2026-11-18T09:00:00Z', status: 'Pending', note: 'Khách đặt hàng (demo).' }, { at: '2026-11-18T10:00:00Z', status: 'Completed', note: 'Đã nhận hàng (demo).' }] },
]

const supportRequests = [
  { id: 'sr-001', farmId: 'farm-ba-tu-demo', title: 'Số hóa 5 sản phẩm và nhật ký lô chôm chôm', need: 'Cần chụp ảnh, viết mô tả và nhập nhật ký mùa vụ cho 5 sản phẩm.', desiredOutput: '5 hồ sơ sản phẩm + nhật ký lô NF-DEMO-001.', status: 'Open' },
]

const missions = [
  { id: 'm-001', requestId: 'sr-001', farmId: 'farm-ba-tu-demo', title: 'Số hóa 5 sản phẩm Ba Tư', goal: 'Chụp ảnh, viết mô tả và nhập nhật ký cho 5 sản phẩm.', output: '5 hồ sơ sản phẩm + 1 nhật ký lô có minh chứng.', skill: 'TMĐT, nội dung', mode: 'onsite', expectedHours: 2, dueDate: '2026-11-27', assigneeId: 'u-minh-anh', slots: 2, unitCode: 'P-LONGKHANH', status: 'Submitted' },
  { id: 'm-002', requestId: 'sr-001', farmId: 'farm-dieu-binh-minh', title: 'Thiết kế bao bì hạt điều', goal: 'Thiết kế nhãn bao bì trung thực, ghi rõ vùng trồng.', output: '1 bộ nhãn bao bì (file thiết kế).', skill: 'Thiết kế đồ họa', mode: 'online', expectedHours: 3, dueDate: '2026-11-30', assigneeId: null, slots: 1, unitCode: 'X-BUDANG', status: 'Open' },
  { id: 'm-003', requestId: 'sr-001', farmId: 'farm-an-lanh', title: 'Tạo mô hình 3D quả bưởi', goal: 'Dựng mô hình GLB đơn giản có chú thích bộ phận.', output: '1 mô hình GLB + poster tĩnh.', skill: '3D, CNTT', mode: 'online', expectedHours: 4, dueDate: '2026-12-02', assigneeId: null, slots: 1, unitCode: 'P-TANTRIEU', status: 'Open' },
  { id: 'm-004', requestId: 'sr-001', farmId: 'farm-ba-tu-demo', title: 'Hướng dẫn nhà vườn livestream', goal: 'Hướng dẫn Ba Tư tạo lịch và lên sóng bán hàng.', output: '1 buổi hướng dẫn + checklist.', skill: 'Truyền thông, chuyển giao', mode: 'hybrid', expectedHours: 2, dueDate: '2026-11-29', assigneeId: 'u-youth-2', slots: 1, unitCode: 'P-LONGKHANH', status: 'InProgress' },
  { id: 'm-prev', requestId: 'sr-001', farmId: 'farm-ba-tu-demo', title: 'Hướng dẫn ghi nhật ký (đã hoàn thành)', goal: 'Hướng dẫn nhà vườn ghi nhật ký bằng ảnh.', output: '1 buổi hướng dẫn + 5 mốc nhật ký mẫu.', skill: 'Truyền thông', mode: 'onsite', expectedHours: 2, dueDate: '2026-11-10', assigneeId: 'u-youth-2', slots: 1, unitCode: 'P-LONGKHANH', status: 'Recorded' },
]

const submissions = [
  { id: 'sub-001', missionId: 'm-001', submitterId: 'u-minh-anh', version: 1, outputNote: 'Đã chụp 5 sản phẩm, viết mô tả và nhập 5 mốc nhật ký cho lô NF-DEMO-001.', actualHours: 2.5, beneficiaryStatus: 'pending', reviewStatus: 'pending', evidence: ['Bộ ảnh 5 sản phẩm', 'File mô tả.docx', 'Liên kết nhật ký lô'] },
  { id: 'sub-prev', missionId: 'm-prev', submitterId: 'u-youth-2', version: 1, outputNote: 'Đã hướng dẫn Ba Tư ghi nhật ký bằng ảnh và giọng nói; hoàn tất 5 mốc mẫu.', actualHours: 1.83, beneficiaryStatus: 'accepted', reviewStatus: 'approved', evidence: ['Biên bản buổi hướng dẫn'] },
]

const volunteerLogs = [
  { id: 'vl-000', missionId: 'm-004', volunteerId: 'u-youth-2', submissionId: 'sub-prev', approvedMinutes: 110, reviewerId: 'u-thu-ha', beneficiaryConfirmationId: 'bc-prev', at: '2026-11-15T09:00:00Z', adjustmentOf: null },
]

const livestreams = [
  { id: 'lv-001', farmId: 'farm-ba-tu-demo', hostId: 'u-minh-anh', title: 'Live bán chôm chôm Long Khánh cùng Ba Tư', scheduledAt: '2026-11-25T20:00:00Z', durationMin: 45, status: 'scheduled', products: ['P01'] },
  { id: 'lv-002', farmId: 'farm-an-lanh', hostId: 'u-youth-2', title: 'Tham quan vườn bưởi Tân Triều', scheduledAt: '2026-11-26T09:00:00Z', durationMin: 30, status: 'scheduled', products: ['P10'] },
  { id: 'lv-003', farmId: 'farm-ba-tu-demo', hostId: 'u-minh-anh', title: 'Đã kết thúc — hướng dẫn ghi nhật ký (bản ghi)', scheduledAt: '2026-11-20T20:00:00Z', durationMin: 40, status: 'ended', products: ['P01'] },
]

const certificates = [
  { id: 'cert-001', farmId: 'farm-ba-tu-demo', productId: null, issuer: 'Hồ sơ minh họa (demo)', type: 'OCOP (chưa đối chiếu)', validity: null, verificationStatus: 'self_declared' },
  { id: 'cert-002', farmId: 'farm-an-lanh', productId: 'P10', issuer: 'Hồ sơ minh họa (demo)', type: 'VietGAP (đã đối chiếu tài liệu)', validity: '2027-06-30', verificationStatus: 'document_matched' },
]

const lessons = [
  { id: 'l-001', title: 'Hành trình của hạt điều Đồng Nai', audience: 'thpt', subject: 'Công nghệ / Địa lý', minutes: 15, objectives: ['Phân biệt quả giả và quả thật chứa hạt', 'Nhận biết vùng trồng trên bản đồ Đồng Nai', 'Hiểu vì sao cần chế biến đúng quy trình (không tự thực hiện)'] },
  { id: 'l-002', title: 'Nhật ký mùa vụ: từ lời nói đến dữ liệu', audience: 'dh', subject: 'CNTT / Nông học', minutes: 20, objectives: ['Ghi nhật ký bằng ảnh/giọng', 'Hiểu cấu trúc sự kiện lô hàng'] },
]

/* ------------------------------ helpers ------------------------------ */
async function ensureUser(u: typeof users[number]): Promise<string> {
  const created = await db.auth.admin.createUser({
    email: u.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      legacy_id: u.legacyId,
      display_name: u.displayName,
      age: u.age ?? '',
      role: u.role,
      workspace: u.workspace,
      unit_code: u.unitCode ?? '',
      home: u.home ?? '',
    },
  })
  if (created.data?.user) return created.data.user.id

  // Đã tồn tại → tìm lại theo email
  const { data } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const found = data?.users.find((x) => x.email === u.email)
  if (!found) throw new Error(`Không tạo/tìm được người dùng ${u.email}: ${created.error?.message}`)
  return found.id
}

async function upsert(table: string, rows: unknown) {
  if (!rows || (Array.isArray(rows) && rows.length === 0)) return
  const { error } = await db.from(table).upsert(rows as never, { onConflict: 'id' })
  if (error) throw new Error(`${table}: ${error.message}`)
  console.log(`  ✓ ${table} (${Array.isArray(rows) ? rows.length : 1})`)
}

/* ------------------------------ chạy ------------------------------ */
async function main() {
  console.log('→ Đơn vị hành chính')
  await upsert('admin_units', adminUnits.map((u) => ({ ...u })))

  console.log('→ Tài khoản demo')
  const idByLegacy: Record<string, string> = {}
  for (const u of users) {
    idByLegacy[u.legacyId] = await ensureUser(u)
    console.log(`  ✓ ${u.email}`)
  }

  console.log('→ Hồ sơ')
  await upsert(
    'profiles',
    users.map((u) => ({
      id: idByLegacy[u.legacyId],
      legacy_id: u.legacyId,
      display_name: u.displayName,
      age: u.age,
      role: u.role,
      workspace: u.workspace,
      unit_code: u.unitCode,
      home: u.home,
    })),
  )
  const uid = (legacy: string) => idByLegacy[legacy]

  console.log('→ Nhà vườn / sản phẩm / lô / nhật ký')
  await upsert('farms', farms.map((f) => ({
    id: f.id, owner_id: uid(f.ownerId), name: f.name, owner: f.owner, story: f.story, unit_code: f.unitCode,
    address: f.address, area_ha: f.areaHa, crops: f.crops, lat: f.lat, lng: f.lng, cert_status: f.certStatus,
  })))
  await upsert('products', products.map((p) => ({
    id: p.id, farm_id: p.farmId, name: p.name, category: p.category, price_per_kg: p.pricePerKg,
    unit: 'kg', stock_kg: p.stockKg, season: p.season, description: p.description, batch_code: p.batchCode ?? null,
  })))
  await upsert('batches', batches.map((b) => ({
    id: b.id, product_id: b.productId, farm_id: b.farmId, public_code: b.publicCode,
    harvest_date: b.harvestDate, quantity_kg: b.quantityKg, source_status: b.sourceStatus,
  })))
  await upsert('diary_events', batches.flatMap((b) => b.diary.map((d) => ({
    id: d.id, batch_id: b.id, at: d.at, phase: d.phase, note: d.note, actor: d.actor, evidence: d.evidence ?? null,
  }))))

  console.log('→ Đơn hàng')
  await upsert('orders', orders.map((o) => ({
    id: o.id, code: o.code, customer_id: uid(o.customerId), farm_id: o.farmId, status: o.status,
    fulfillment: o.fulfillment, shipping_fee: o.shippingFee, payment_status: o.paymentStatus, created_at: o.createdAt,
  })))
  await upsert('order_items', orders.flatMap((o) => o.items.map((it) => ({
    id: `${o.id}-${it.productId}`, order_id: o.id, product_id: it.productId, batch_id: it.batchId,
    qty_kg: it.qtyKg, unit_price: it.unitPrice,
  }))))
  await upsert('order_history', orders.flatMap((o) => o.history.map((h, i) => ({
    id: `${o.id}-h${i}`, order_id: o.id, at: h.at, status: h.status, note: h.note,
  }))))

  console.log('→ Hỗ trợ / nhiệm vụ / minh chứng / giờ')
  await upsert('support_requests', supportRequests.map((s) => ({
    id: s.id, farm_id: s.farmId, title: s.title, need: s.need, desired_output: s.desiredOutput, status: s.status,
  })))
  await upsert('missions', missions.map((m) => ({
    id: m.id, request_id: m.requestId, farm_id: m.farmId, title: m.title, goal: m.goal, output: m.output,
    skill: m.skill, mode: m.mode, expected_hours: m.expectedHours, due_date: m.dueDate,
    assignee_id: m.assigneeId ? uid(m.assigneeId) : null, slots: m.slots, unit_code: m.unitCode, status: m.status,
  })))
  await upsert('mission_submissions', submissions.map((s) => ({
    id: s.id, mission_id: s.missionId, submitter_id: uid(s.submitterId), version: s.version,
    output_note: s.outputNote, actual_hours: s.actualHours, beneficiary_status: s.beneficiaryStatus, review_status: s.reviewStatus,
  })))
  await upsert('submission_evidence', submissions.flatMap((s) => s.evidence.map((label, i) => ({
    id: `${s.id}-e${i}`, submission_id: s.id, label, storage_path: null,
  }))))

  // volunteer_logs: submission 'sub-prev' không tồn tại trong seed lịch sử → bỏ qua nếu FK chặn
  const { error: logErr } = await db.from('volunteer_logs').upsert(
    volunteerLogs.map((l) => ({
      id: l.id, mission_id: l.missionId, volunteer_id: uid(l.volunteerId), submission_id: l.submissionId,
      approved_minutes: l.approvedMinutes, reviewer_id: uid(l.reviewerId),
      beneficiary_confirmation_id: l.beneficiaryConfirmationId, at: l.at, adjustment_of: l.adjustmentOf,
    })) as never,
    { onConflict: 'id' },
  )
  console.log(logErr ? `  ⚠ volunteer_logs bỏ qua (${logErr.message})` : '  ✓ volunteer_logs')

  console.log('→ Livestream / chứng nhận / bài học')
  await upsert('livestreams', livestreams.map((l) => ({
    id: l.id, farm_id: l.farmId, host_id: uid(l.hostId), title: l.title,
    scheduled_at: l.scheduledAt, duration_min: l.durationMin, status: l.status,
  })))
  await upsert('livestream_products', livestreams.flatMap((l) => l.products.map((p) => ({ livestream_id: l.id, product_id: p }))))
  await upsert('certificates', certificates.map((c) => ({
    id: c.id, farm_id: c.farmId, product_id: c.productId, issuer: c.issuer, type: c.type,
    validity: c.validity, verification_status: c.verificationStatus,
    reviewed_by: c.verificationStatus === 'document_matched' ? uid('u-thu-ha') : null,
    reviewed_at: c.verificationStatus === 'document_matched' ? '2026-11-10T08:00:00Z' : null,
    review_note: c.verificationStatus === 'document_matched' ? 'Đã đối chiếu ảnh tài liệu khớp tên chủ thể và phạm vi. Chưa xác nhận từ đơn vị cấp.' : null,
  })))
  await upsert('lessons', lessons.map((l) => ({ ...l })))

  console.log(`\n✅ Xong. Mật khẩu tài khoản demo: ${DEMO_PASSWORD}`)
  console.log('   batu@naifarm.demo · minhanh@naifarm.demo · giahan@naifarm.demo · ngoclinh@naifarm.demo · thuha@naifarm.demo · admin@naifarm.demo')
}

main().catch((err) => {
  console.error('❌ Seed lỗi:', err)
  process.exit(1)
})
