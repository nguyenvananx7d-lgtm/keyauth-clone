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
  res.json(db.prepare('SELECT * FROM subscriptions WHERE app_id = ? ORDER BY level ASC').all(req.params.appId))
})

router.post('/', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const { name, level = 0, color = '#1f6feb', features = '', price = 0 } = req.body
  if (!name) return res.status(400).json({ error: 'Name required.' })
  const r = db.prepare('INSERT INTO subscriptions (app_id, name, level, color, features, price) VALUES (?, ?, ?, ?, ?, ?)').run(req.params.appId, name, level, color, features, price)
  res.json(db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(r.lastInsertRowid))
})

router.patch('/:id', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  const { name, level, color, features, price } = req.body
  db.prepare('UPDATE subscriptions SET name=COALESCE(?,name), level=COALESCE(?,level), color=COALESCE(?,color), features=COALESCE(?,features), price=COALESCE(?,price) WHERE id=? AND app_id=?')
    .run(name||null, level??null, color||null, features||null, price??null, req.params.id, req.params.appId)
  res.json(db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id))
})

router.delete('/:id', (req, res) => {
  if (!checkApp(req.params.appId, req.user.id)) return res.status(404).json({ error: 'App not found.' })
  db.prepare('DELETE FROM subscriptions WHERE id = ? AND app_id = ?').run(req.params.id, req.params.appId)
  res.json({ ok: true })
})

export default router
