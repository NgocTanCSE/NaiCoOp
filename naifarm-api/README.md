# naifarm-api

API cho **NaiFarm — Chợ OCOP Thanh niên, Thành phố Đồng Nai**.

- **Cloudflare Worker** (TypeScript + [Hono](https://hono.dev))
- **Supabase**: Postgres (+RLS) · Auth (JWT) · Storage
- Bất biến nghiệp vụ đặt ở **Postgres (RPC + trigger)**, Worker chỉ là lớp HTTP + xác thực + kiểm tra đầu vào.

```
Prototype (Vite/React) ──Bearer JWT──▶ Cloudflare Worker (Hono) ──▶ Supabase
```

## 1. Cài đặt

```bash
npm install
cp .dev.vars.example .dev.vars   # rồi điền giá trị Supabase
```

`.dev.vars` (và bí mật) **không** commit.

## 2. Cơ sở dữ liệu

```bash
# Cách A — dùng dự án Supabase đám mây
supabase link --project-ref <project-ref>
supabase db push                     # chạy 0001..0004 trong supabase/migrations
npm run db:seed                      # tạo tài khoản demo + dữ liệu (cần .env)

# Cách B — chạy Supabase cục bộ
supabase start
supabase db reset                    # áp migrations + seed.sql (nếu có)
```

Biến cho seed (đặt trong `.env` ở thư mục này):

```env
SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

Sinh kiểu CSDL (tuỳ chọn):

```bash
npm run db:types                     # types/database.ts
```

### Migration

| File | Nội dung |
|---|---|
| `0001_init.sql` | Enum + toàn bộ bảng (bản sao 1:1 của `seed.ts`) |
| `0002_rls.sql` | Hàm phụ trợ quyền, trigger đồng bộ hồ sơ, bật RLS + chính sách |
| `0003_rpc.sql` | Hàm nghiệp vụ: đặt hàng, đổi trạng thái, nhận việc, 2 lớp xác nhận giờ, đối chiếu chứng nhận |
| `0004_storage.sql` | Bucket ảnh: `product-images`, `farm-images`, `mission-evidence` |

## 3. Bí mật (Worker)

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# tuỳ chọn (nếu dùng khoá HS256); bỏ trống ⇒ xác minh JWT qua JWKS
wrangler secret put SUPABASE_JWT_SECRET
```

## 4. Chạy & triển khai

```bash
npm run dev          # http://localhost:8787
npm run typecheck    # tsc --noEmit
npm run build:dry    # kiểm tra bundle
npm run deploy       # wrangler deploy
```

Cập nhật `CORS_ORIGINS` trong `wrangler.toml` cho đúng origin của front-end.

## 5. Xác thực & phân quyền

- Đăng nhập bằng **Supabase Auth**; gửi `Authorization: Bearer <access_token>`.
- Worker xác minh JWT: JWKS `${SUPABASE_URL}/auth/v1/.well-known/jwks.json` (mặc định) hoặc HS256 nếu có `SUPABASE_JWT_SECRET`.
- `profiles.id = auth.users.id`; vai trò lấy từ `profiles.role`. RLS là lưới an toàn cuối cùng.
- `service_role` **chỉ** dùng cho seed/tác vụ hệ thống — không lộ ra client.

Vai trò: `customer` · `farm_owner` · `volunteer` · `local_coordinator` · `platform_admin`.

## 6. Endpoint (`/v1`)

| Nhóm | Endpoint | Quyền |
|---|---|---|
| Health | `GET /v1/health` · `GET /v1/health/db` | mở |
| Tôi | `GET/PATCH /v1/me` | đã đăng nhập |
| Công khai | `GET /products` `/products/:id` `/farms` `/farms/:id` `/explore/farms` `/trace/:code` `/batches` `/certificates` `/livestreams` `/lessons` `/units` `/market/home` | mở |
| W01 khách | `GET/POST /cart` · `PATCH/DELETE /cart/items/:productId` · `POST /orders` · `GET /orders[/:id]` · `POST /orders/:id/cancel` | `customer` |
| W02 nhà nông | `GET /farmer/dashboard` · `POST/PATCH /farmer/products` · `POST /farmer/products/ai-draft` · `POST /farmer/batches/:id/diary` · `GET /farmer/orders` · `PATCH /farmer/orders/:id/status` · `GET/POST /farmer/support-requests` · `POST /farmer/submissions/:id/beneficiary-confirm` | `farm_owner` |
| W03 thanh niên | `GET /volunteer/missions[/:id]` · `POST /volunteer/missions/:id/claim` · `POST /volunteer/missions/:id/submissions` · `GET/POST /volunteer/livestreams` · `GET /volunteer/passport` | `volunteer` |
| W04 điều phối | `GET /coordinator/overview` `/coordinator/verifications` `/coordinator/missions` · `PATCH /coordinator/certificates/:id` · `POST /coordinator/submissions/:id/approve` `/reject` | `local_coordinator` |
| W06 admin | `GET /admin/overview` `/admin/organizations` `/admin/audit` · `PATCH /admin/profiles/:id` | `platform_admin` |

Lỗi trả về `application/problem+json` (`{ title, status, code, details }`).

## 7. Bất biến nghiệp vụ (trong DB)

- `fn_place_order` — tạo đơn từ giỏ/items, kiểm tra cùng một nhà vườn, trừ tồn kho, ghi lịch sử, xoá giỏ.
- `fn_set_order_status` — chỉ cho phép chuyển trạng thái hợp lệ; kiểm tra quyền.
- `fn_beneficiary_confirm` — **lớp 1**: nhà vườn xác nhận đầu ra.
- `fn_approve_hours` — **lớp 2**: điều phối duyệt giờ; **chặn tự duyệt** và yêu cầu đã có lớp 1; ghi `volunteer_logs`.
- `fn_match_certificate` — chỉ tiến từng bậc: `self_declared → document_matched → source_confirmed`.
- `fn_claim_mission` — nhận nhiệm vụ còn mở.
- Mọi thao tác quan trọng ghi `audit_log` (`fn_audit`).

## 8. Tài khoản demo (mật khẩu `Naifarm@2026`)

| Email | Vai trò | Vào |
|---|---|---|
| `ngoclinh@naifarm.demo` | customer | `/` |
| `batu@naifarm.demo` | farm_owner | `/farmer` |
| `minhanh@naifarm.demo` | volunteer | `/volunteer` |
| `giahan@naifarm.demo` | volunteer | `/volunteer` |
| `thuha@naifarm.demo` | local_coordinator | `/coordinator` |
| `admin@naifarm.demo` | platform_admin | `/admin` |

> ⚠️ Toàn bộ dữ liệu là **giả lập** (nhãn “Mẫu/Demo”).
