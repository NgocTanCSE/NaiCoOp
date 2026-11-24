export interface Env {
  /** URL dự án Supabase, vd: https://xxxx.supabase.co */
  SUPABASE_URL: string
  /** Khoá công khai (anon) — dùng cho client theo người dùng + RLS */
  SUPABASE_ANON_KEY: string
  /** Khoá service role — CHỈ dùng ở server cho tác vụ hệ thống. Không bao giờ trả về client. */
  SUPABASE_SERVICE_ROLE_KEY: string
  /** Tùy chọn: khoá ký HS256 truyền thống. Bỏ trống ⇒ xác minh qua JWKS. */
  SUPABASE_JWT_SECRET?: string
  /** Danh sách origin cho CORS, phân tách bằng dấu phẩy. */
  CORS_ORIGINS?: string
  ENVIRONMENT?: string
}
