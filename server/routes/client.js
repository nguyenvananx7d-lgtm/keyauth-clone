import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db.js'

const router = express.Router()

// Initialize - Get app info
router.post('/init', (req, res) => {
  const { appName, ownerID } = req.body
  
  if (!appName || !ownerID) {
    return res.status(400).json({ success: false, message: 'Missing appName or ownerID' })
  }

  const app = db.prepare('SELECT * FROM applications WHERE name = ? AND owner_id = ?').get(appName, ownerID)
  
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found' })
  }

  res.json({
    success: true,
    message: 'Initialized successfully',
    app: {
      name: app.name,
      version: app.version || '1.0'
    }
  })
})

// Login - User authentication
router.post('/login', async (req, res) => {
  const { username, password, appName, ownerID } = req.body

  if (!username || !password || !appName || !ownerID) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }

  // Verify app exists
  const app = db.prepare('SELECT * FROM applications WHERE name = ? AND owner_id = ?').get(appName, ownerID)
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found' })
  }

  // Find user
  const user = db.prepare('SELECT * FROM app_users WHERE username = ? AND app_id = ?').get(username, app.id)
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  // Check password
  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  // Check if user is banned
  if (user.banned) {
    return res.status(403).json({ success: false, message: 'User is banned' })
  }

  // Check expiry
  if (user.expiry && new Date(user.expiry) < new Date()) {
    return res.status(403).json({ success: false, message: 'Subscription expired' })
  }

  // Update last login
  db.prepare('UPDATE app_users SET last_login = ? WHERE id = ?').run(new Date().toISOString(), user.id)

  // Generate session token
  const token = jwt.sign(
    { userId: user.id, appId: app.id, username: user.username },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  )

  res.json({
    success: true,
    message: 'Login successful',
    user: {
      username: user.username,
      email: user.email,
      expiry: user.expiry,
      subscription: user.subscription,
      token: token
    }
  })
})

// Register - Create new user
router.post('/register', async (req, res) => {
  const { username, password, email, license, appName, ownerID } = req.body

  if (!username || !password || !license || !appName || !ownerID) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }

  // Verify app exists
  const app = db.prepare('SELECT * FROM applications WHERE name = ? AND owner_id = ?').get(appName, ownerID)
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found' })
  }

  // Check if username exists
  const existingUser = db.prepare('SELECT * FROM app_users WHERE username = ? AND app_id = ?').get(username, app.id)
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Username already exists' })
  }

  // Verify license
  const licenseRecord = db.prepare('SELECT * FROM licenses WHERE key = ? AND app_id = ? AND used = 0').get(license, app.id)
  if (!licenseRecord) {
    return res.status(400).json({ success: false, message: 'Invalid or already used license' })
  }

  // Get subscription info
  const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(licenseRecord.subscription_id)
  
  // Calculate expiry
  let expiry = null
  if (subscription && subscription.duration > 0) {
    const now = new Date()
    now.setDate(now.getDate() + subscription.duration)
    expiry = now.toISOString()
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const result = db.prepare(`
    INSERT INTO app_users (app_id, username, password, email, subscription, expiry, created_at, last_login)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    app.id,
    username,
    hashedPassword,
    email || null,
    subscription ? subscription.name : 'Free',
    expiry,
    new Date().toISOString(),
    new Date().toISOString()
  )

  // Mark license as used
  db.prepare('UPDATE licenses SET used = 1, used_by = ?, used_at = ? WHERE id = ?')
    .run(username, new Date().toISOString(), licenseRecord.id)

  // Generate token
  const token = jwt.sign(
    { userId: result.lastInsertRowid, appId: app.id, username: username },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  )

  res.json({
    success: true,
    message: 'Registration successful',
    user: {
      username: username,
      email: email,
      expiry: expiry,
      subscription: subscription ? subscription.name : 'Free',
      token: token
    }
  })
})

// License - Verify license key only
router.post('/license', (req, res) => {
  const { license, appName, ownerID } = req.body

  if (!license || !appName || !ownerID) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }

  // Verify app exists
  const app = db.prepare('SELECT * FROM applications WHERE name = ? AND owner_id = ?').get(appName, ownerID)
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found' })
  }

  // Check license
  const licenseRecord = db.prepare('SELECT * FROM licenses WHERE key = ? AND app_id = ?').get(license, app.id)
  
  if (!licenseRecord) {
    return res.status(404).json({ success: false, message: 'License not found' })
  }

  if (licenseRecord.used) {
    return res.status(400).json({ 
      success: false, 
      message: 'License already used',
      usedBy: licenseRecord.used_by,
      usedAt: licenseRecord.used_at
    })
  }

  // Get subscription info
  const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(licenseRecord.subscription_id)

  res.json({
    success: true,
    message: 'Valid license',
    license: {
      key: licenseRecord.key,
      subscription: subscription ? subscription.name : 'Unknown',
      duration: subscription ? subscription.duration : 0,
      used: licenseRecord.used
    }
  })
})

// Upgrade - Upgrade user subscription with new license
router.post('/upgrade', (req, res) => {
  const { username, license, appName, ownerID } = req.body

  if (!username || !license || !appName || !ownerID) {
    return res.status(400).json({ success: false, message: 'Missing required fields' })
  }

  // Verify app
  const app = db.prepare('SELECT * FROM applications WHERE name = ? AND owner_id = ?').get(appName, ownerID)
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found' })
  }

  // Find user
  const user = db.prepare('SELECT * FROM app_users WHERE username = ? AND app_id = ?').get(username, app.id)
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' })
  }

  // Verify license
  const licenseRecord = db.prepare('SELECT * FROM licenses WHERE key = ? AND app_id = ? AND used = 0').get(license, app.id)
  if (!licenseRecord) {
    return res.status(400).json({ success: false, message: 'Invalid or already used license' })
  }

  // Get subscription
  const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(licenseRecord.subscription_id)

  // Calculate new expiry
  let newExpiry = null
  if (subscription && subscription.duration > 0) {
    const currentExpiry = user.expiry ? new Date(user.expiry) : new Date()
    const now = new Date()
    const baseDate = currentExpiry > now ? currentExpiry : now
    baseDate.setDate(baseDate.getDate() + subscription.duration)
    newExpiry = baseDate.toISOString()
  }

  // Update user
  db.prepare('UPDATE app_users SET subscription = ?, expiry = ? WHERE id = ?')
    .run(subscription ? subscription.name : 'Free', newExpiry, user.id)

  // Mark license as used
  db.prepare('UPDATE licenses SET used = 1, used_by = ?, used_at = ? WHERE id = ?')
    .run(username, new Date().toISOString(), licenseRecord.id)

  res.json({
    success: true,
    message: 'Upgrade successful',
    user: {
      username: user.username,
      subscription: subscription ? subscription.name : 'Free',
      expiry: newExpiry
    }
  })
})

export default router
