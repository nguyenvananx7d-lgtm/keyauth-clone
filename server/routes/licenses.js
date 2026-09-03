import { Router } from 'express'
import crypto from 'crypto'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router({ mergeParams: true })
router.use(authMiddleware)

function checkApp(appId, userId) {
  return db.prepare('SELECT * FROM applications WHERE id = ? AND owner_id = ?').get(appId, userId)
}

function genKey(prefix) {
  const seg = () => crypto.randomBytes(3).toString('hex').toUpperCase()
  return `${prefix}-${seg()}-${seg()}-${seg()}`
}

// GET /api/applications/:appId/licenses
router.get('/', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const licenses = db.prepare('SELECT * FROM licenses WHERE app_id = ? ORDER BY created_at DESC').all(req.params.appId)
  res.json(licenses)
})

// POST /api/applications/:appId/licenses
router.post('/', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const { amount = 1, duration, prefix = 'KEYAUTH' } = req.body
  if (!duration) return res.status(400).json({ error: 'Duration is required.' })
  const count = Math.min(parseInt(amount) || 1, 50)
  const insert = db.prepare('INSERT INTO licenses (app_id, key_value, duration, created_by) VALUES (?, ?, ?, ?)')
  const insertMany = db.transaction(() => {
    const created = []
    for (let i = 0; i < count; i++) {
      let key, attempts = 0
      do { key = genKey(prefix); attempts++ } while (db.prepare('SELECT id FROM licenses WHERE key_value = ?').get(key) && attempts < 10)
      const r = insert.run(req.params.appId, key, duration, req.user.username)
      created.push(db.prepare('SELECT * FROM licenses WHERE id = ?').get(r.lastInsertRowid))
    }
    return created
  })
  res.json(insertMany())
})

// DELETE /api/applications/:appId/licenses/:id
router.delete('/:id', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  db.prepare('DELETE FROM licenses WHERE id = ? AND app_id = ?').run(req.params.id, req.params.appId)
  res.json({ ok: true })
})

// DELETE /api/applications/:appId/licenses (bulk)
router.delete('/', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array required.' })
  const del = db.transaction(() => ids.forEach(id => db.prepare('DELETE FROM licenses WHERE id = ? AND app_id = ?').run(id, req.params.appId)))
  del()
  res.json({ ok: true })
})

export default router
