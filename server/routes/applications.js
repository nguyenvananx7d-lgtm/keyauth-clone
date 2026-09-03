import { Router } from 'express'
import crypto from 'crypto'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

const genSecret = () => crypto.randomBytes(32).toString('hex')

// GET /api/applications
router.get('/', async (req, res) => {
  const apps = await db.prepare('SELECT * FROM applications WHERE owner_id = ? ORDER BY created_at DESC').all(req.user.id)
  res.json(apps)
})

// POST /api/applications
router.post('/', async (req, res) => {
  const { name, version = '1.0' } = req.body
  if (!name) return res.status(400).json({ error: 'Name is required.' })
  const secret = genSecret()
  const result = await db.prepare(
    'INSERT INTO applications (owner_id, name, version, secret) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, name.toUpperCase(), version, secret)
  const app = await db.prepare('SELECT * FROM applications WHERE id = ?').get(result.lastInsertRowid)
  res.json(app)
})

// PATCH /api/applications/:id
router.patch('/:id', async (req, res) => {
  const app = await db.prepare('SELECT * FROM applications WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id)
  if (!app) return res.status(404).json({ error: 'Not found.' })
  const { name, version, status } = req.body
  await db.prepare('UPDATE applications SET name = COALESCE(?, name), version = COALESCE(?, version), status = COALESCE(?, status) WHERE id = ?')
    .run(name ? name.toUpperCase() : null, version || null, status || null, app.id)
  res.json(await db.prepare('SELECT * FROM applications WHERE id = ?').get(app.id))
})

// POST /api/applications/:id/refresh-secret
router.post('/:id/refresh-secret', async (req, res) => {
  const app = await db.prepare('SELECT * FROM applications WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id)
  if (!app) return res.status(404).json({ error: 'Not found.' })
  const secret = genSecret()
  await db.prepare('UPDATE applications SET secret = ? WHERE id = ?').run(secret, app.id)
  res.json({ secret })
})

// DELETE /api/applications/:id
router.delete('/:id', async (req, res) => {
  const app = await db.prepare('SELECT * FROM applications WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id)
  if (!app) return res.status(404).json({ error: 'Not found.' })
  await db.prepare('DELETE FROM applications WHERE id = ?').run(app.id)
  res.json({ ok: true })
})

export default router
