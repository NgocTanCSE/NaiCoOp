import { Hono } from 'hono'
import { z } from 'zod'
import { requireAuth, type AppEnv } from '../middleware/auth'
import { jsonBody } from '../lib/parse'
import { mapProfile } from '../lib/mappers'
import { notFound } from '../lib/errors'

export const me = new Hono<AppEnv>()

me.use('*', requireAuth)

me.get('/', async (c) => {
  const { data, error } = await c.get('db').from('profiles').select('*').eq('id', c.get('userId')!).maybeSingle()
  if (error) return c.json({ status: 'error', detail: error.message }, 500)
  if (!data) throw notFound('Tài khoản chưa có hồ sơ người dùng')
  return c.json({ profile: mapProfile(data) })
})

const patchSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  home: z.string().max(120).nullish(),
})

me.patch('/', async (c) => {
  const body = await jsonBody(c, patchSchema)
  const patch: Record<string, unknown> = {}
  if (body.displayName !== undefined) patch.display_name = body.displayName
  if (body.home !== undefined) patch.home = body.home
  if (Object.keys(patch).length === 0) return c.json({ profile: null, updated: false })
  const { data, error } = await c
    .get('db')
    .from('profiles')
    .update(patch)
    .eq('id', c.get('userId')!)
    .select('*')
    .maybeSingle()
  if (error) return c.json({ status: 'error', detail: error.message }, 500)
  return c.json({ profile: data ? mapProfile(data) : null, updated: true })
})
