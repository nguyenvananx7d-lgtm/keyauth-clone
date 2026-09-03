import { Router } from 'express'
import crypto from 'crypto'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router({ mergeParams: true })
router.use(authMiddleware)

async function checkApp(appId, userId) {
  return db.prepare('SELECT * FROM applications WHERE id = ? AND owner_id = ?').get(appId, userId)
}

function genKey(prefix) {
  const seg = () => crypto.randomBytes(3).toString('hex').toUpperCase()
  return `${prefix}-${seg()}-${seg()}-${seg()}`
}

// GET /api/applications/:appId/licenses
router.get('/', async (req, res) => {
  if (!(await checkApp(req.params.appId, req.user.id))) return res.status(404).json({ error: 'App not found.' })
  const licenses = await db.prepare('SELECT * FROM licenses WHERE app_id = ? ORDER BY created_at DESC').all(req.params.appId)
  res.json(licenses)
})

// POST /api/applications/:appId/licenses
router.post('/', async (req, res) => {
  if (!(await checkApp(req.params.appId, req.user.id))) return res.status(404).json({ error: 'App not found.' })
  const { amount = 1, duration, prefix = 'KEYAUTH' } = req.body
  if (!duration) return res.status(400).json({ error: 'Duration is required.' })
  const count = Math.min(parseInt(amount) || 1, 50)
  const insert = db.prepare('INSERT INTO licenses (app_id, key_value, duration, created_by) VALUES (?, ?, ?, ?)')
  const created = await db.transaction(async () => {
    const out = []
    for (let i = 0; i < count; i++) {
      let key, attempts = 0
      do { key = genKey(prefix); attempts++ } while (await db.prepare('SELECT id FROM licenses WHERE key_value = ?').get(key) && attempts < 10)
      const r = await insert.run(req.params.appId, key, duration, req.user.username)
      out.push(await db.prepare('SELECT * FROM licenses WHERE id = ?').get(r.lastInsertRowid))
    }
    return out
  })
  res.json(created)
})

// DELETE /api/applications/:appId/licenses/:id
router.delete('/:id', async (req, res) => {
  if (!(await checkApp(req.params.appId, req.user.id))) return res.status(404).json({ error: 'App not found.' })
  await db.prepare('DELETE FROM licenses WHERE id = ? AND app_id = ?').run(req.params.id, req.params.appId)
  res.json({ ok: true })
})

// DELETE /api/applications/:appId/licenses (bulk)
router.delete('/', async (req, res) => {
  if (!(await checkApp(req.params.appId, req.user.id))) return res.status(404).json({ error: 'App not found.' })
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids array required.' })
  await db.transaction(async () => {
    for (const id of ids) {
      await db.prepare('DELETE FROM licenses WHERE id = ? AND app_id = ?').run(id, req.params.appId)
    }
  })
  res.json({ ok: true })
})

export default router
