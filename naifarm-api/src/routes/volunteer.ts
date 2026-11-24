import { Hono } from 'hono'
import { z } from 'zod'
import { requireRole, type AppEnv } from '../middleware/auth'
import { jsonBody } from '../lib/parse'
import { many, one } from '../lib/db'
import { badRequest } from '../lib/errors'
import { mapLivestream, mapMission, mapSubmission, mapVolunteerLog } from '../lib/mappers'
import { prefixedId } from '../lib/ids'

export const volunteer = new Hono<AppEnv>()

volunteer.use('*', requireRole('volunteer'))

/* ----------------------------- Nhiệm vụ ----------------------------- */

volunteer.get('/missions', async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')!
  const rows = many(await db.from('missions').select('*').order('due_date'))
  const missions = rows.map(mapMission)
  const visible = missions.filter((m) => m.status === 'Open' || m.assigneeId === userId)
  return c.json({ missions: visible, all: missions })
})

volunteer.get('/missions/:id', async (c) => {
  const db = c.get('db')
  const id = c.req.param('id')
  const missionRow = one(await db.from('missions').select('*').eq('id', id).maybeSingle(), 'Không tìm thấy nhiệm vụ')
  const submissionRows = many(
    await db.from('mission_submissions').select('*').eq('mission_id', id).order('version', { ascending: false }),
  )
  const subIds = submissionRows.map((s) => s.id)
  const evidence = subIds.length
    ? many(await db.from('submission_evidence').select('*').in('submission_id', subIds))
    : []
  const submissions = submissionRows.map((s) =>
    mapSubmission(
      s,
      evidence.filter((e) => e.submission_id === s.id).map((e) => e.label as string),
    ),
  )
  return c.json({ mission: mapMission(missionRow), submissions })
})

volunteer.post('/missions/:id/claim', async (c) => {
  const { error } = await c.get('db').rpc('fn_claim_mission', { p_mission_id: c.req.param('id') })
  if (error) throw badRequest(error.message)
  const row = one(await c.get('db').from('missions').select('*').eq('id', c.req.param('id')).maybeSingle(), 'Không tìm thấy nhiệm vụ')
  return c.json({ mission: mapMission(row) })
})

const submissionSchema = z.object({
  outputNote: z.string().min(1).max(2000),
  actualHours: z.number().positive().max(100),
  evidence: z.array(z.string().min(1).max(300)).max(12).default([]),
})

volunteer.post('/missions/:id/submissions', async (c) => {
  const body = await jsonBody(c, submissionSchema)
  const db = c.get('db')
  const missionId = c.req.param('id')

  // RPC nguyên tử: tạo minh chứng + evidence + chuyển nhiệm vụ sang Submitted.
  // (Cập nhật missions trực tiếp sẽ bị RLS chặn vì người nộp không phải chủ vườn.)
  const { data, error } = await db.rpc('fn_submit_mission', {
    p_mission_id: missionId,
    p_output_note: body.outputNote,
    p_actual_hours: body.actualHours,
    p_evidence: body.evidence,
  })
  if (error) throw badRequest(error.message)

  const submissionId = typeof data === 'string' ? data : ''
  const submission = one(
    await db.from('mission_submissions').select('*').eq('id', submissionId).maybeSingle(),
    'Không nộp được minh chứng',
  )
  return c.json({ submission: mapSubmission(submission, body.evidence) }, 201)
})

/* ----------------------------- Livestream ----------------------------- */

volunteer.get('/livestreams', async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')!
  const rows = many(await db.from('livestreams').select('*').order('scheduled_at', { ascending: false }))
  const ids = rows.map((r) => r.id)
  const links = ids.length ? many(await db.from('livestream_products').select('*').in('livestream_id', ids)) : []
  const byLive = new Map<string, string[]>()
  for (const l of links) byLive.set(l.livestream_id, [...(byLive.get(l.livestream_id) ?? []), l.product_id])
  const mine = rows.filter((r) => r.host_id === userId).map((r) => mapLivestream(r, byLive.get(r.id) ?? []))
  const all = rows.map((r) => mapLivestream(r, byLive.get(r.id) ?? []))
  return c.json({ mine, all })
})

const liveSchema = z.object({
  farmId: z.string().min(1),
  title: z.string().min(1).max(160),
  scheduledAt: z.string().min(10),
  durationMin: z.number().int().positive().max(600).default(30),
  products: z.array(z.string()).max(12).default([]),
})

volunteer.post('/livestreams', async (c) => {
  const body = await jsonBody(c, liveSchema)
  const db = c.get('db')
  const row = one(
    await db
      .from('livestreams')
      .insert({
        id: prefixedId('lv'),
        farm_id: body.farmId,
        host_id: c.get('userId')!,
        title: body.title,
        scheduled_at: body.scheduledAt,
        duration_min: body.durationMin,
        status: 'scheduled',
      })
      .select('*')
      .maybeSingle(),
    'Không tạo được lịch livestream',
  )
  if (body.products.length) {
    await db
      .from('livestream_products')
      .insert(body.products.map((pid) => ({ livestream_id: row.id, product_id: pid })))
  }
  return c.json({ livestream: mapLivestream(row, body.products) }, 201)
})

/* ----------------------------- Hồ sơ năng lực ----------------------------- */

volunteer.get('/passport', async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')!
  const profile = c.get('profile')
  const [logRes, missionRes] = await Promise.all([
    db.from('volunteer_logs').select('*').eq('volunteer_id', userId).order('at', { ascending: false }),
    db.from('missions').select('*').eq('assignee_id', userId).order('due_date'),
  ])
  const logs = many(logRes).map(mapVolunteerLog)
  const missions = many(missionRes).map(mapMission)
  const totalMinutes = logs.reduce((s, l) => s + l.approvedMinutes, 0)
  return c.json({
    profile: profile ? { displayName: profile.display_name, unitCode: profile.unit_code } : null,
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    logs,
    missions,
  })
})
