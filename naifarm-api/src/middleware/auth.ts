import { createMiddleware } from 'hono/factory'
import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from 'jose'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Env } from '../env'
import { createAdminClient, createUserClient } from '../lib/supabase'
import type { AppRole, ProfileRow } from '../types'
import { AppError, forbidden, unauthorized } from '../lib/errors'

export interface AppVariables {
  userId: string | null
  profile: ProfileRow | null
  accessToken?: string
  db: SupabaseClient
  admin: SupabaseClient
}

export type AppEnv = { Bindings: Env; Variables: AppVariables }

// Bộ khoá JWKS được lưu đệm theo isolate (module scope).
let jwksCache: { url: string; getKey: JWTVerifyGetKey } | null = null

function getJwks(url: string): JWTVerifyGetKey {
  if (jwksCache && jwksCache.url === url) return jwksCache.getKey
  const getKey = createRemoteJWKSet(new URL(url))
  jwksCache = { url, getKey }
  return getKey
}

async function verifyToken(env: Env, token: string): Promise<JWTPayload> {
  const options = { audience: 'authenticated' }
  if (env.SUPABASE_JWT_SECRET) {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(env.SUPABASE_JWT_SECRET), {
      ...options,
      algorithms: ['HS256'],
    })
    return payload
  }
  const jwksUrl = `${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`
  const { payload } = await jwtVerify(token, getJwks(jwksUrl), options)
  return payload
}

/**
 * Luôn gắn client Supabase (theo người dùng), admin client, và — nếu có Bearer token hợp lệ —
 * hồ sơ người dùng. Token sai/hết hạn thì coi như khách (không lỗi).
 */
export const attachContext = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : undefined

  const db = createUserClient(c.env, token)
  c.set('db', db)
  c.set('admin', createAdminClient(c.env))
  c.set('userId', null)
  c.set('profile', null)
  c.set('accessToken', token)

  if (token) {
    try {
      const payload = await verifyToken(c.env, token)
      const sub = typeof payload.sub === 'string' ? payload.sub : null
      if (sub) {
        c.set('userId', sub)
        const { data } = await db.from('profiles').select('*').eq('id', sub).maybeSingle()
        if (data) c.set('profile', data as ProfileRow)
      }
    } catch {
      // token không hợp lệ — tiếp tục với vai trò khách
    }
  }

  await next()
})

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.get('userId')) throw unauthorized()
  await next()
})

/** Yêu cầu đã đăng nhập + vai trò thuộc danh sách cho phép. */
export const requireRole = (...roles: AppRole[]) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const profile = c.get('profile')
    if (!c.get('userId') || !profile) throw unauthorized()
    if (!roles.includes(profile.role)) throw forbidden()
    await next()
  })

/** Đảm bảo có hồ sơ người dùng (dùng sau requireAuth khi cần role/unit). */
export function currentProfile(c: { get: (k: 'profile') => ProfileRow | null }): ProfileRow {
  const p = c.get('profile')
  if (!p) throw new AppError(403, 'no_profile', 'Tài khoản chưa có hồ sơ người dùng')
  return p
}
