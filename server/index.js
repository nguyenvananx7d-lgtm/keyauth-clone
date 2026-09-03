import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import appRoutes from './routes/applications.js'
import licenseRoutes from './routes/licenses.js'
import userRoutes from './routes/appUsers.js'
import subRoutes from './routes/subscriptions.js'
import varRoutes from './routes/variables.js'
import webhookRoutes from './routes/webhooks.js'
import clientRoutes from './routes/client.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const isProd = process.env.NODE_ENV === 'production'

// In production frontend is served from same origin, so no CORS needed
// In dev allow Vite dev server
app.use(cors({
  origin: isProd ? false : (process.env.FRONTEND_URL || 'http://localhost:5173')
}))
app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/applications', appRoutes)
app.use('/api/applications/:appId/licenses', licenseRoutes)
app.use('/api/applications/:appId/users', userRoutes)
app.use('/api/applications/:appId/subscriptions', subRoutes)
app.use('/api/applications/:appId/variables', varRoutes)
app.use('/api/applications/:appId/webhooks', webhookRoutes)
app.use('/api/client', clientRoutes)

// Serve React frontend in production
if (isProd) {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*splat', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT} [${isProd ? 'production' : 'development'}]`)
})
