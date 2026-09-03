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
  res.json(db.prepare('SELECT * FROM variables WHERE app_id = ? ORDER BY created_at DESC').all(req.params.appId))
})

router.post('/', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const { name, value, secret = false } = req.body
  if (!name || value === undefined) return res.status(400).json({ error: 'Name and value required.' })
  const r = db.prepare('INSERT INTO variables (app_id, name, value, secret) VALUES (?, ?, ?, ?)').run(req.params.appId, name.toUpperCase(), value, secret ? 1 : 0)
  res.json(db.prepare('SELECT * FROM variables WHERE id = ?').get(r.lastInsertRowid))
})

router.patch('/:id', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const { name, value, secret } = req.body
  db.prepare('UPDATE variables SET name=COALESCE(?,name), value=COALESCE(?,value), secret=COALESCE(?,secret) WHERE id=? AND app_id=?')
    .run(name||null, value||null, secret!=null?secret?1:0:null, req.params.id, req.params.appId)
  res.json(db.prepare('SELECT * FROM variables WHERE id = ?').get(req.params.id))
})

router.delete('/:id', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  db.prepare('DELETE FROM variables WHERE id = ? AND app_id = ?').run(req.params.id, req.params.appId)
  res.json({ ok: true })
})

export default router
