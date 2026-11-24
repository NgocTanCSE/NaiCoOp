import { Hono } from 'hono'
import { z } from 'zod'
import { requireRole, type AppEnv } from '../middleware/auth'
import { jsonBody } from '../lib/parse'
import { many, one } from '../lib/db'
import { mapFarm, mapProfile } from '../lib/mappers'

export const admin = new Hono<AppEnv>()

admin.use('*', requireRole('platform_admin'))

admin.get('/overview', async (c) => {
  const db = c.get('db')
  const counts: Record<string, number> = {}
  for (const table of ['profiles', 'farms', 'products', 'orders', 'missions', 'livestreams', 'certificates']) {
    const { count } = await db.from(table).select('*', { count: 'exact', head: true })
    counts[table] = count ?? 0
  }
  return c.json({ counts })
})

admin.get('/organizations', async (c) => {
  const db = c.get('db')
  const [profileRows, farmRows] = await Promise.all([
    db.from('profiles').select('*').order('display_name'),
    db.from('farms').select('*').order('name'),
  ])
  return c.json({
    profiles: many(profileRows).map(mapProfile),
    farms: many(farmRows).map(mapFarm),
  })
})

const patchOrg = z.object({
  unitCode: z.string().nullish(),
  role: z.enum(['farm_owner', 'volunteer', 'customer', 'local_coordinator', 'platform_admin']).optional(),
})

admin.patch('/profiles/:id', async (c) => {
  const body = await jsonBody(c, patchOrg)
  const patch: Record<string, unknown> = {}
  if (body.unitCode !== undefined) patch.unit_code = body.unitCode
  if (body.role !== undefined) patch.role = body.role
  const row = one(
    await c.get('admin').from('profiles').update(patch).eq('id', c.req.param('id')).select('*').maybeSingle(),
    'Không tìm thấy hồ sơ',
  )
  return c.json({ profile: mapProfile(row) })
})

admin.get('/audit', async (c) => {
  const rows = many(
    await c.get('db').from('audit_log').select('*').order('at', { ascending: false }).limit(100),
  )
  return c.json({
    entries: rows.map((r) => ({
      id: r.id,
      actorId: r.actor_id,
      action: r.action,
      entity: r.entity,
      entityId: r.entity_id,
      at: r.at,
      meta: r.meta ?? null,
    })),
  })
})
