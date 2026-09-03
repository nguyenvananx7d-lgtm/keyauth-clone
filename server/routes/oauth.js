import { Router } from 'express'
import db from '../db.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const REDIRECT_URI = `${FRONTEND_URL}/auth/callback`

const PROVIDERS = {
  google: {
    authorizeUrl: (state) => {
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        prompt: 'select_account',
      })
      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    },
    async exchange(code) {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.access_token) throw new Error(data.error_description || 'Google token exchange failed')
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
      const user = await userRes.json()
      return {
        providerId: String(user.sub),
        email: user.email,
        name: user.name || user.email?.split('@')[0] || 'google_user',
        avatar: user.picture,
      }
    },
  },
  github: {
    authorizeUrl: (state) => {
      const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'read:user user:email',
        state,
      })
      return `https://github.com/login/oauth/authorize?${params.toString()}`
    },
    async exchange(code) {
      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error || !data.access_token) throw new Error(data.error_description || 'GitHub token exchange failed')
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${data.access_token}`, Accept: 'application/vnd.github+json' },
      })
      const user = await userRes.json()
      let email = user.email
      if (!email) {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${data.access_token}`, Accept: 'application/vnd.github+json' },
        })
        const emails = await emailsRes.json()
        email = (Array.isArray(emails) && emails.find(e => e.primary)?.email) || ''
      }
      return {
        providerId: String(user.id),
        email: email || `${user.login}@users.noreply.github.com`,
        name: user.name || user.login || 'github_user',
        avatar: user.avatar_url,
      }
    },
  },
  discord: {
    authorizeUrl: (state) => {
      const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'identify email',
        state,
      })
      return `https://discord.com/oauth2/authorize?${params.toString()}`
    },
    async exchange(code) {
      const res = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error || !data.access_token) throw new Error('Discord token exchange failed')
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
      const user = await userRes.json()
      return {
        providerId: String(user.id),
        email: user.email || '',
        name: user.username || 'discord_user',
        avatar: user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
          : undefined,
      }
    },
  },
}

function isConfigured(provider) {
  const key = provider.toUpperCase()
  return !!(
    process.env[`${key}_CLIENT_ID`] &&
    process.env[`${key}_CLIENT_SECRET`]
  )
}

async function uniqueUsername(base) {
  let candidate = (base || 'user').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || 'user'
  const exists = await db.prepare('SELECT id FROM users WHERE username = ?').get(candidate)
  if (!exists) return candidate
  let i = 1
  while (true) {
    const next = `${candidate}${i}`
    const row = await db.prepare('SELECT id FROM users WHERE username = ?').get(next)
    if (!row) return next
    i++
  }
}

async function findOrCreateUser(provider, info) {
  // 1. Existing account by provider id
  const byProvider = await db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?').get(provider, info.providerId)
  if (byProvider) return byProvider

  // 2. Existing local/other account with same email → link provider
  if (info.email) {
    const byEmail = await db.prepare('SELECT * FROM users WHERE email = ?').get(info.email)
    if (byEmail) {
      await db.prepare('UPDATE users SET provider = ?, provider_id = ?, avatar = COALESCE(?, avatar) WHERE id = ?')
        .run(provider, info.providerId, info.avatar || null, byEmail.id)
      return db.prepare('SELECT * FROM users WHERE id = ?').get(byEmail.id)
    }
  }

  // 3. Create new
  const username = await uniqueUsername(info.name || `${provider}_user`)
  const result = await db.prepare(
    'INSERT INTO users (username, email, password, provider, provider_id, avatar) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(username, info.email || '', '', provider, info.providerId, info.avatar || null)
  return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid)
}

// GET /api/auth/oauth/:provider/start
router.get('/:provider/start', (req, res) => {
  const provider = PROVIDERS[req.params.provider]
  if (!provider) return res.status(400).json({ error: 'Unsupported provider.' })
  if (!isConfigured(req.params.provider)) return res.status(400).json({ error: 'Provider not configured on server.' })
  res.json({ url: provider.authorizeUrl(req.params.provider) })
})

// POST /api/auth/oauth/:provider/callback
router.post('/:provider/callback', async (req, res) => {
  const providerKey = req.params.provider
  const provider = PROVIDERS[providerKey]
  if (!provider) return res.status(400).json({ error: 'Unsupported provider.' })
  if (!isConfigured(providerKey)) return res.status(400).json({ error: 'Provider not configured on server.' })

  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'Missing code.' })

  try {
    const info = await provider.exchange(code)
    const user = await findOrCreateUser(providerKey, info)
    const token = signToken({ id: user.id, username: user.username, email: user.email })
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, provider: user.provider } })
  } catch (e) {
    res.status(500).json({ error: e.message || 'OAuth failed.' })
  }
})

export default router
