import { Hono } from 'hono'
import { z } from 'zod'
import { requireRole, type AppEnv } from '../middleware/auth'
import { jsonBody } from '../lib/parse'
import { many, one } from '../lib/db'
import { badRequest } from '../lib/errors'
import { mapCertificate, mapFarm, mapMission, mapSubmission } from '../lib/mappers'

export const coordinator = new Hono<AppEnv>()

coordinator.use('*', requireRole('local_coordinator'))

coordinator.get('/overview', async (c) => {
  const db = c.get('db')
  const [certs, subs, missions, farms, logs] = await Promise.all([
    db.from('certificates').select('*').order('id'),
    db.from('mission_submissions').select('*').order('version', { ascending: false }),
    db.from('missions').select('*').order('due_date'),
    db.from('farms').select('*').order('name'),
    db.from('volunteer_logs').select('*'),
  ])
  const certList = many(certs).map(mapCertificate)
  const subList = many(subs).map((s) => mapSubmission(s))
  return c.json({
    counts: {
      pendingVerifications: certList.filter((x) => x.verificationStatus === 'self_declared').length,
      matchedCertificates: certList.filter((x) => x.verificationStatus === 'document_matched').length,
      pendingHours: subList.filter((s) => s.beneficiaryStatus === 'accepted' && s.reviewStatus === 'pending').length,
      missions: many(missions).length,
      farms: many(farms).length,
      loggedHours: Math.round((many(logs).reduce((t, l) => t + Number(l.approved_minutes), 0) / 60) * 10) / 10,
    },
    recentCertificates: certList.slice(0, 5),
  })
})

/* ------------------------- Đối chiếu hồ sơ (S24b) ------------------------- */

coordinator.get('/verifications', async (c) => {
  const db = c.get('db')
  const [certRows, farmRows] = await Promise.all([
    db.from('certificates').select('*').order('id'),
    db.from('farms').select('*').order('name'),
  ])
  const farms = new Map(many(farmRows).map((f) => [f.id, mapFarm(f)]))
  const certificates = many(certRows).map((row) => {
    const cert = mapCertificate(row)
    return { ...cert, farm: farms.get(cert.farmId) ?? null }
  })
  return c.json({ certificates })
})

const matchSchema = z.object({
  /** Chỉ cho phép 'document_matched' (không nhảy sang source_confirmed). */
  to: z.literal('document_matched').default('document_matched'),
  note: z.string().max(500).optional(),
})

coordinator.patch('/certificates/:id', async (c) => {
  const body = await jsonBody(c, matchSchema)
  const { error } = await c.get('db').rpc('fn_match_certificate', {
    p_cert_id: c.req.param('id'),
    p_to: body.to,
    p_note: body.note ?? null,
  })
  if (error) throw badRequest(error.message)
  const row = one(await c.get('db').from('certificates').select('*').eq('id', c.req.param('id')).maybeSingle(), 'Không tìm thấy chứng nhận')
  return c.json({ certificate: mapCertificate(row) })
})

/* ------------------------- Duyệt minh chứng & giờ (S24c) ------------------------- */

coordinator.get('/missions', async (c) => {
  const db = c.get('db')
  const [subRows, missionRows] = await Promise.all([
    db.from('mission_submissions').select('*').order('version', { ascending: false }),
    db.from('missions').select('*').order('due_date'),
  ])
  const missions = new Map(many(missionRows).map((m) => [m.id, mapMission(m)]))
  const submissions = many(subRows).map((row) => {
    const sub = mapSubmission(row)
    return { ...sub, mission: missions.get(sub.missionId) ?? null }
  })
  return c.json({ submissions })
})

const approveSchema = z.object({
  minutes: z.number().int().positive().max(60 * 24),
  adjustmentOf: z.string().nullish(),
})

coordinator.post('/submissions/:id/approve', async (c) => {
  const body = await jsonBody(c, approveSchema)
  const { error } = await c.get('db').rpc('fn_approve_hours', {
    p_submission_id: c.req.param('id'),
    p_minutes: body.minutes,
    p_adjustment_of: body.adjustmentOf ?? null,
  })
  if (error) throw badRequest(error.message)
  return c.json({ ok: true, minutes: body.minutes })
})

/** Từ chối / yêu cầu sửa minh chứng. */
coordinator.post('/submissions/:id/reject', async (c) => {
  await jsonBody(c, z.object({ note: z.string().max(500).optional() }))
  const { error } = await c.get('db').rpc('fn_reject_submission', { p_submission_id: c.req.param('id') })
  if (error) throw badRequest(error.message)
  return c.json({ ok: true })
})
