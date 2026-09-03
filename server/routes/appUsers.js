import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router({ mergeParams: true })
router.use(authMiddleware)

function checkApp(appId, userId) {
  return db.prepare('SELECT * FROM applications WHERE id = ? AND owner_id = ?').get(appId, userId)
}

// GET /api/applications/:appId/users
router.get('/', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const users = db.prepare('SELECT * FROM app_users WHERE app_id = ? ORDER BY created_at DESC').all(req.params.appId)
  res.json(users)
})

// POST /api/applications/:appId/users
router.post('/', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const { username, email, password, subscription = 'Free', expires = 'Lifetime' } = req.body
  if (!username) return res.status(400).json({ error: 'Username is required.' })
  const existing = db.prepare('SELECT id FROM app_users WHERE app_id = ? AND username = ?').get(req.params.appId, username)
  if (existing) return res.status(409).json({ error: 'Username already exists in this app.' })
  const result = db.prepare(
    'INSERT INTO app_users (app_id, username, email, password, subscription, expires) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.params.appId, username, email || '', password || '', subscription, expires)
  res.json(db.prepare('SELECT * FROM app_users WHERE id = ?').get(result.lastInsertRowid))
})

// PATCH /api/applications/:appId/users/:id  (ban/unban)
router.patch('/:id', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const { status } = req.body
  db.prepare('UPDATE app_users SET status = ? WHERE id = ? AND app_id = ?').run(status, req.params.id, req.params.appId)
  res.json(db.prepare('SELECT * FROM app_users WHERE id = ?').get(req.params.id))
})

// DELETE /api/applications/:appId/users/:id
router.delete('/:id', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  db.prepare('DELETE FROM app_users WHERE id = ? AND app_id = ?').run(req.params.id, req.params.appId)
  res.json({ ok: true })
})

// DELETE bulk
router.delete('/', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const { ids } = req.body
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids required.' })
  db.transaction(() => ids.forEach(id => db.prepare('DELETE FROM app_users WHERE id = ? AND app_id = ?').run(id, req.params.appId)))()
  res.json({ ok: true })
})

export default router
