import { Hono } from 'hono'
import type { AppEnv } from '../middleware/auth'

export const health = new Hono<AppEnv>()

health.get('/', (c) =>
  c.json({
    status: 'ok',
    service: 'naifarm-api',
    env: c.env.ENVIRONMENT ?? 'unknown',
    time: new Date().toISOString(),
  }),
)

/** Kiểm tra kết nối Supabase (đếm đơn vị hành chính). */
health.get('/db', async (c) => {
  const { count, error } = await c
    .get('admin')
    .from('admin_units')
    .select('code', { count: 'exact', head: true })
  if (error) {
    return c.json({ status: 'error', db: 'unreachable', detail: error.message }, 503)
  }
  return c.json({ status: 'ok', db: 'reachable', adminUnits: count ?? 0 })
})
