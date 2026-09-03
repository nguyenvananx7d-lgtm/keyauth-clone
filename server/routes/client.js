import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const router = express.Router()

// Initialize - Get app info
router.post('/init', async (req, res) => {
  const { appName, ownerID } = req.body
  if (!appName || !ownerID) {
    return res.status(400).json({ success: false, message: 'Missing appName or ownerID' })
  }
  const app = await db.prepare('SELECT * FROM applications WHERE name = ? AND owner_id = ?').get(appName, ownerID)
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found' })
  }
  res.json({ success: true, message: 'Initialized successfully', app: { name: app.name, version: app.version || '1.0' } })
})

// Login - User authentication
router.post('/login', async (req, res) => {
  const { username, password, appName, ownerID } = req.body
  if (!username || !password || !appName || !ownerID) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }
  const app = await db.prepare('SELECT * FROM applications WHERE name = ? AND owner_id = ?').get(appName, ownerID)
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' })

  const user = await db.prepare('SELECT * FROM app_users WHERE username = ? AND app_id = ?').get(username, app.id)
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })

  const validPassword = await bcrypt.compare(password, user.password || '')
  if (!validPassword) return res.status(401).json({ success: false, message: 'Invalid credentials' })

  if (user.status === 'banned') return res.status(403).json({ success: false, message: 'User is banned' })

  if (user.expires && user.expires !== 'Lifetime' && new Date(user.expires) < new Date()) {
    return res.status(403).json({ success: false, message: 'Subscription expired' })
  }

  await db.prepare('UPDATE app_users SET ip = ?, hwid = ? WHERE id = ?').run(req.ip || 'N/A', req.body.hwid || 'N/A', user.id)

  const token = jwt.sign(
    { userId: user.id, appId: app.id, username: user.username },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  )
  res.json({ success: true, message: 'Login successful', user: { username: user.username, email: user.email, expiry: user.expires, subscription: user.subscription, token } })
})

// Register - Create new user with a license key
router.post('/register', async (req, res) => {
  const { username, password, email, license, appName, ownerID } = req.body
  if (!username || !password || !license || !appName || !ownerID) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }
  const app = await db.prepare('SELECT * FROM applications WHERE name = ? AND owner_id = ?').get(appName, ownerID)
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' })

  const existingUser = await db.prepare('SELECT * FROM app_users WHERE username = ? AND app_id = ?').get(username, app.id)
  if (existingUser) return res.status(409).json({ success: false, message: 'Username already exists' })

  // A license is valid if status = 'unused'
  const licenseRecord = await db.prepare('SELECT * FROM licenses WHERE key_value = ? AND app_id = ? AND status = ?').get(license, app.id, 'unused')
  if (!licenseRecord) return res.status(400).json({ success: false, message: 'Invalid or already used license' })

  const hashedPassword = await bcrypt.hash(password, 10)

  const result = await db.prepare(
    'INSERT INTO app_users (app_id, username, password, email, subscription, expires, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(app.id, username, hashedPassword, email || null, licenseRecord.duration || 'Free', 'Lifetime', 'active')

  await db.prepare('UPDATE licenses SET status = ?, used_by = ?, used_at = NOW() WHERE id = ?')
    .run('used', username, licenseRecord.id)

  const token = jwt.sign(
    { userId: result.lastInsertRowid, appId: app.id, username: username },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  )
  res.json({ success: true, message: 'Registration successful', user: { username, email, expiry: 'Lifetime', subscription: licenseRecord.duration || 'Free', token } })
})

// License - Verify license key only
router.post('/license', async (req, res) => {
  const { license, appName, ownerID } = req.body
  if (!license || !appName || !ownerID) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }
  const app = await db.prepare('SELECT * FROM applications WHERE name = ? AND owner_id = ?').get(appName, ownerID)
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' })

  const licenseRecord = await db.prepare('SELECT * FROM licenses WHERE key_value = ? AND app_id = ?').get(license, app.id)
  if (!licenseRecord) return res.status(404).json({ success: false, message: 'License not found' })

  if (licenseRecord.status === 'used') {
    return res.status(400).json({ success: false, message: 'License already used', usedBy: licenseRecord.used_by, usedAt: licenseRecord.used_at })
  }

  res.json({ success: true, message: 'Valid license', license: { key: licenseRecord.key_value, subscription: licenseRecord.duration || 'Unknown', duration: 0, used: licenseRecord.status === 'used' } })
})

// Upgrade - Upgrade user subscription with new license
router.post('/upgrade', async (req, res) => {
  const { username, license, appName, ownerID } = req.body
  if (!username || !license || !appName || !ownerID) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }
  const app = await db.prepare('SELECT * FROM applications WHERE name = ? AND owner_id = ?').get(appName, ownerID)
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' })

  const user = await db.prepare('SELECT * FROM app_users WHERE username = ? AND app_id = ?').get(username, app.id)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })

  const licenseRecord = await db.prepare('SELECT * FROM licenses WHERE key_value = ? AND app_id = ? AND status = ?').get(license, app.id, 'unused')
  if (!licenseRecord) return res.status(400).json({ success: false, message: 'Invalid or already used license' })

  await db.prepare('UPDATE app_users SET subscription = ?, expires = ? WHERE id = ?')
    .run(licenseRecord.duration || 'Free', 'Lifetime', user.id)
  await db.prepare('UPDATE licenses SET status = ?, used_by = ?, used_at = NOW() WHERE id = ?')
    .run('used', username, licenseRecord.id)

  res.json({ success: true, message: 'Upgrade successful', user: { username: user.username, subscription: licenseRecord.duration || 'Free', expiry: 'Lifetime' } })
})

export default router
