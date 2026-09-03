import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(input) {
  return typeof input === 'string' ? input.trim() : ''
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const username = clean(req.body.username)
  const email = clean(req.body.email)
  const password = req.body.password

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' })
  }
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters.' })
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }
  if (typeof password !== 'string' || password.length < 12) {
    return res.status(400).json({ error: 'Password must be at least 12 characters.' })
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must include uppercase, lowercase and a number.' })
  }

  const existing = await db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email)
  if (existing) {
    return res.status(409).json({ error: 'Username or email already taken.' })
  }

  const hash = bcrypt.hashSync(password, 10)
  const result = await db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hash)
  const token = signToken({ id: result.lastInsertRowid, username, email })
  res.json({ token, user: { id: result.lastInsertRowid, username, email } })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const username = clean(req.body.username)
  const password = req.body.password
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required.' })
  }

  const user = await db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials.' })
  }

  const token = signToken({ id: user.id, username: user.username, email: user.email })
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
})

export default router
