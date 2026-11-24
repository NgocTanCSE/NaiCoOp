# NaiFarm — Prototype P0 (bản bấm được)

Prototype **React 19 + Vite + Tailwind v4** cho **NaiFarm — Chợ OCOP Thanh niên, Thành phố Đồng Nai**
(Hackathon Đồng Nai 2026, Đề 3).

- Bám token trong [`../DESIGN.md`](../DESIGN.md) (Modern Agricultural Editorial): Forest `#245B3D`, Rice `#F5F3E9`, Harvest `#D7A34D`, Earth `#25352B`; font **Lora** + **Be Vietnam Pro**; **light-only**; icon kiểu Lucide; chuyển động tiết chế.
- Phủ đủ phạm vi **P0**: R1–R6 · B1–B3 · W04 (điều phối) · Admin tối giản (W06).
- Mobile-first (390×844; kiểm 360/430), tiếng Việt đủ dấu, có trạng thái **rỗng / đang tải / lỗi / offline / không quyền**.

> ⚠️ **Toàn bộ dữ liệu là giả lập**, mọi bản ghi đều gắn nhãn **“Mẫu/Demo”**.
> Không có đối tác, chứng nhận, số sao OCOP, đánh giá hay số liệu thật.

---

## Chạy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run preview
```

Dev server mặc định ở `http://localhost:5173` (LAN: `http://<IP>:5173/`).

---

## Vai trò & cách vào

**Không còn thanh “đổi vai trò”.** Vai trò được **suy ra từ URL**: mở một đường dẫn trong
workspace nào thì prototype tự đặt workspace + người dùng demo tương ứng.

| Workspace | Vai trò | Người dùng demo | Trang vào |
|---|---|---|---|
| **W01** | Người mua / Cá nhân (khách) | Ngọc Linh (`u-ngoc-linh`) | [`/`](http://localhost:5173/) |
| **W02** | Nhà nông | Chú Ba Tư (`u-ba-tu`) | [`/farmer`](http://localhost:5173/farmer) |
| **W03** | Thanh niên & người học | Minh Anh (`u-minh-anh`) | [`/volunteer`](http://localhost:5173/volunteer) |
| **W04** | Điều phối viên | Thu Hà (`u-thu-ha`) | [`/coordinator`](http://localhost:5173/coordinator) |
| **W06** | Quản trị nền tảng | Quản trị (`u-admin`) | [`/admin`](http://localhost:5173/admin) |

---

## Danh sách site theo vai trò

### W01 — Người mua / Cá nhân (khách truy cập)

| Route | Màn hình | Mã đề |
|---|---|---|
| `/` | Chợ nông sản (trang chủ) | S01 |
| `/farms/:id` | Hồ sơ nhà vườn | **S02 / R1** |
| `/products/:id` | Chi tiết sản phẩm | S03 |
| `/trace/:code` | Hộ chiếu số + nhật ký mùa vụ + QR | **S04 / R3** |
| `/cart` | Giỏ hàng | S05 |
| `/checkout` | Thanh toán | S06 |
| `/orders/:id` | Theo dõi đơn hàng | **S07 / R4** |
| `/account` | Trang cá nhân | S07 |
| `/account/orders` | Đơn của tôi (tab Đơn hàng) | S07 |
| `/explore/map` | Bản đồ nông nghiệp | **S17 / B2** |
| `/live` | Livestream công khai | S15 |

### W02 — Nhà nông (Chú Ba Tư)

| Route | Màn hình | Mã đề |
|---|---|---|
| `/farmer` | Tổng quan nhà nông | S08 |
| `/farmer/products/new` | Đăng ảnh/giọng nói + duyệt nháp AI | **S09–S10 / R2 + B1** |
| `/farmer/orders` | Quản lý đơn & cập nhật trạng thái | **S11 / R5** |
| `/farmer/support` | Nhật ký mùa vụ + yêu cầu hỗ trợ | S12 |

### W03 — Thanh niên & người học (Minh Anh)

| Route | Màn hình | Mã đề |
|---|---|---|
| `/volunteer` | Danh sách nhiệm vụ | **S13 / B3** |
| `/volunteer/missions/:id` | Chi tiết nhiệm vụ + nộp minh chứng | **S14 / B3** |
| `/volunteer/live` | Lịch livestream | **S15 / R6** |
| `/volunteer/passport` | Hồ sơ năng lực (P1) | S18 |

### W04 — Điều phối viên (Thu Hà)

| Route | Màn hình | Mã đề |
|---|---|---|
| `/coordinator` | Tổng quan điều phối | S24a |
| `/coordinator/verifications` | Đối chiếu hồ sơ | **S24b** |
| `/coordinator/missions` | Duyệt minh chứng & giờ | **S24c** |

### W06 — Quản trị nền tảng (tối giản)

| Route | Màn hình | Mã đề |
|---|---|---|
| `/admin` | Tổng quan quản trị | S66 |
| `/admin/organizations` | Tài khoản & tổ chức | S66 |
| `/admin/data` | Dữ liệu & cấu hình | S66 |
| `/admin/audit` | Kiểm toán | S66 |

> `/admin/:section` nhận `organizations` · `data` · `audit`; giá trị khác tự về tab **Tổng quan**.

---

## Liên kết demo nhanh (deep link)

Mở trực tiếp để xem từng luồng mà không cần bấm nhiều bước:

| Muốn xem | Mở |
|---|---|
| Chi tiết sản phẩm có tồn kho | `/products/P01` (Chôm chôm Java, 35.000 đ/kg, còn 30 kg) |
| Sản phẩm đặt trước | `/products/P04` (Sầu riêng Ri6) |
| Hộ chiếu số + QR | `/trace/NF-DEMO-001` |
| Hồ sơ nhà vườn | `/farms/farm-ba-tu-demo` |
| Chi tiết đơn | `/orders/o-001` |
| Chi tiết nhiệm vụ | `/volunteer/missions/m-001` |

---

## Luồng demo 4 phút (xương sống)

1. **Ba Tư** (`/farmer`) → “Chụp ảnh/Nói để đăng” → wizard 3 bước *(R2 + B1)*.
2. **Minh Anh** (`/volunteer`) → nhận nhiệm vụ → nộp minh chứng *(B3)*; tạo lịch live *(R6)*.
3. **Ngọc Linh** (`/`) → chợ → sản phẩm → **Hộ chiếu QR** (`/trace/NF-DEMO-001`) *(R1, R3)* → giỏ → đặt hàng *(R4)*.
4. **Ba Tư** → xác nhận đơn và cập nhật trạng thái *(R5)*. Vào **Hỗ trợ** → “Xác nhận đã nhận đầu ra” của thanh niên *(lớp 1)*.
5. **Thu Hà** (`/coordinator`) → đối chiếu hồ sơ *(S24b)* → **duyệt giờ** sau khi nhà vườn đã xác nhận đầu ra; nút tự duyệt chính mình bị khóa *(S24c)*.
6. Bản đồ `/explore/map` *(B2)* + trợ lý **NaiAI** (minh hoạ).

---

## Trạng thái & tính trung thực

- **Rỗng / đang tải / lỗi / offline / không quyền** xuất hiện ở các màn chính; có `OfflineBanner` + công tắc demo offline, có nút demo “Tải lại / Lỗi” trên trang chợ.
- Giờ tình nguyện **chỉ được ghi sau 2 lớp xác nhận**; điều phối **không tự duyệt** nhiệm vụ của mình.
- Điều phối chỉ ghi **“Đã đối chiếu tài liệu”** (không “Đã xác nhận nguồn”); nhà vườn hiển thị mức **“tự khai báo (chưa đối chiếu)”**.
- QR thật, **không phủ logo**; nội dung công khai tối thiểu.
- Tiền định dạng `35.000 đ/kg`, ngày `DD/MM/YYYY`, giờ 24h, múi giờ GMT+7.

---

## Ghi chú kỹ thuật

- **Nguồn dữ liệu mock duy nhất:** [`src/lib/seed.ts`](src/lib/seed.ts) — không hard-code số liệu rải rác trong màn hình.
- **Token thiết kế:** [`src/styles/tokens.css`](src/styles/tokens.css); font self-host ở `public/fonts/` (import qua `src/styles/fonts.css`).
- **Primitive UI:** [`src/components/ui/index.tsx`](src/components/ui/index.tsx) (Button/Badge/Card/Chip/Tabs/Timeline/…) — có `Button variant="gold"`, `Badge/Chip tone="gold"`.
- **Thành phần nghiệp vụ:** [`src/components/domain/index.tsx`](src/components/domain/index.tsx) + [`ProduceArt.tsx`](src/components/domain/ProduceArt.tsx).
- **Ảnh minh hoạ:** hiện dùng **hình vẽ vector riêng cho từng mặt hàng / nhà vườn** (chôm chôm, sầu riêng, bưởi, hạt điều, phong cảnh vườn), luôn có nhãn “Ảnh minh họa”. Không dùng ảnh thật hay ảnh AI giả danh.
  - *Muốn thay bằng ảnh thật:* bỏ file vào `public/images/products/<id>.jpg` (vd `P01.jpg`) hoặc `public/images/farms/<id>.jpg` (vd `farm-ba-tu-demo.jpg`) rồi nhờ ghép — `ProduceImage` sẽ ưu tiên ảnh thật và rơi về vector khi thiếu file.
- **Điều hướng:** [`src/App.tsx`](src/App.tsx) — `PublicLayout` tự đặt **W01**, `WorkspaceLayout` nhận prop `workspace` để đặt **W02/W03/W04/W06**.
- **Trạng thái demo:** [`src/lib/demo-store.tsx`](src/lib/demo-store.tsx) (workspace, người dùng hiện tại, giỏ hàng, đơn, nhiệm vụ, minh chứng, giờ, toast).

---

## Nối API (Cloudflare Worker + Supabase)

Prototype có **hai chế độ**:

- **Seed (mặc định):** không đặt `VITE_API_URL` → dùng dữ liệu trong `src/lib/seed.ts` (chạy offline, không cần backend).
- **API:** đặt `VITE_API_URL` (+ Supabase) → dữ liệu lấy từ Worker, đăng nhập thật.

### Cấu hình

```bash
cp .env.example .env
```

```env
VITE_API_URL="http://localhost:8787"
VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
VITE_SUPABASE_ANON_KEY="<anon-key>"
```

Xem backend tại [`../naifarm-api`](../naifarm-api) (Hono + Supabase, có migrations + seed + tài khoản demo).

### Cách hoạt động

| Tệp | Vai trò |
|---|---|
| [`src/lib/supabase.ts`](src/lib/supabase.ts) | Supabase client (đăng nhập, phiên) |
| [`src/lib/api.ts`](src/lib/api.ts) | `apiGet/apiPost/apiPatch/apiDelete` — tự gắn Bearer token |
| [`src/lib/auth.tsx`](src/lib/auth.tsx) | `AuthProvider` + `useAuth()` + danh sách tài khoản demo |
| [`src/lib/data.tsx`](src/lib/data.tsx) | `DataProvider` + `useData()` — gom dữ liệu công khai + theo vai trò, **tự rơi về seed khi tắt API** |
| `/login` | Trang đăng nhập demo (chọn nhanh 5 vai trò) |

Màn hình dùng `const { productById, products, ... } = useData()` thay cho import trực tiếp từ `seed.ts`. Khi bật API, `useData()` gọi các endpoint theo vai trò đăng nhập; khi tắt, trả về dữ liệu seed như trước.

**Tài khoản demo** (mật khẩu `Naifarm@2026`): `ngoclinh@` · `batu@` · `minhanh@` · `giahan@` · `thuha@` · `admin@` + `naifarm.demo`.
