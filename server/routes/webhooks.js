import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router({ mergeParams: true })
router.use(authMiddleware)

function checkApp(appId, userId) {
  return db.prepare('SELECT * FROM applications WHERE id = ? AND owner_id = ?').get(appId, userId)
}

router.get('/', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const hooks = db.prepare('SELECT * FROM webhooks WHERE app_id = ? ORDER BY created_at DESC').all(req.params.appId)
  res.json(hooks.map(h => ({ ...h, events: JSON.parse(h.events), active: !!h.active })))
})

router.post('/', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const { url, events = [] } = req.body
  if (!url) return res.status(400).json({ error: 'URL required.' })
  const r = db.prepare('INSERT INTO webhooks (app_id, url, events) VALUES (?, ?, ?)').run(req.params.appId, url, JSON.stringify(events))
  const h = db.prepare('SELECT * FROM webhooks WHERE id = ?').get(r.lastInsertRowid)
  res.json({ ...h, events: JSON.parse(h.events), active: !!h.active })
})

router.patch('/:id', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const { active } = req.body
  db.prepare('UPDATE webhooks SET active = ? WHERE id = ? AND app_id = ?').run(active ? 1 : 0, req.params.id, req.params.appId)
  const h = db.prepare('SELECT * FROM webhooks WHERE id = ?').get(req.params.id)
  res.json({ ...h, events: JSON.parse(h.events), active: !!h.active })
})

router.delete('/:id', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  db.prepare('DELETE FROM webhooks WHERE id = ? AND app_id = ?').run(req.params.id, req.params.appId)
  res.json({ ok: true })
})

export default router
