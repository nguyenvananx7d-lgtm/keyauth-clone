import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, email, password } = req.body
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email)
  if (existing) {
    return res.status(409).json({ error: 'Username or email already taken.' })
  }

  const hash = bcrypt.hashSync(password, 10)
  const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hash)
  const token = signToken({ id: result.lastInsertRowid, username, email })
  res.json({ token, user: { id: result.lastInsertRowid, username, email } })
})

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required.' })
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials.' })
  }

  const token = signToken({ id: user.id, username: user.username, email: user.email })
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
})

export default router
