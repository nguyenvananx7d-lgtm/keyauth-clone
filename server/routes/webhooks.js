import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router({ mergeParams: true })
router.use(authMiddleware)

async function checkApp(appId, userId) {
  return db.prepare('SELECT * FROM applications WHERE id = ? AND owner_id = ?').get(appId, userId)
}

router.get('/', async (req, res) => {
  if (!(await checkApp(req.params.appId, req.user.id))) return res.status(404).json({ error: 'App not found.' })
  const hooks = await db.prepare('SELECT * FROM webhooks WHERE app_id = ? ORDER BY created_at DESC').all(req.params.appId)
  res.json(hooks.map(h => ({ ...h, events: JSON.parse(h.events || '[]'), active: !!h.active })))
})

router.post('/', async (req, res) => {
  if (!(await checkApp(req.params.appId, req.user.id))) return res.status(404).json({ error: 'App not found.' })
  const { url, events = [] } = req.body
  if (!url) return res.status(400).json({ error: 'URL required.' })
  const r = await db.prepare('INSERT INTO webhooks (app_id, url, events) VALUES (?, ?, ?)').run(req.params.appId, url, JSON.stringify(events))
  const h = await db.prepare('SELECT * FROM webhooks WHERE id = ?').get(r.lastInsertRowid)
  res.json({ ...h, events: JSON.parse(h.events || '[]'), active: !!h.active })
})

router.patch('/:id', async (req, res) => {
  if (!(await checkApp(req.params.appId, req.user.id))) return res.status(404).json({ error: 'App not found.' })
  const { active } = req.body
  await db.prepare('UPDATE webhooks SET active = ? WHERE id = ? AND app_id = ?').run(active ? 1 : 0, req.params.id, req.params.appId)
  const h = await db.prepare('SELECT * FROM webhooks WHERE id = ?').get(req.params.id)
  res.json({ ...h, events: JSON.parse(h.events || '[]'), active: !!h.active })
})

router.delete('/:id', async (req, res) => {
  if (!(await checkApp(req.params.appId, req.user.id))) return res.status(404).json({ error: 'App not found.' })
  await db.prepare('DELETE FROM webhooks WHERE id = ? AND app_id = ?').run(req.params.id, req.params.appId)
  res.json({ ok: true })
})

export default router
