import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Env } from '../env'

/**
 * Client theo người dùng: gửi kèm JWT của họ ⇒ Postgres áp RLS theo `auth.uid()`.
 * Đây là client mặc định cho mọi luồng nghiệp vụ.
 */
export function createUserClient(env: Env, accessToken?: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : {},
  })
}

/**
 * Client quản trị: bỏ qua RLS. CHỈ dùng cho seed/tác vụ hệ thống.
 * Không bao giờ lộ khoá này ra client.
 */
export function createAdminClient(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
