import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const USE_PG = !!process.env.DATABASE_URL

const POSTGRES_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  provider TEXT DEFAULT 'local',
  provider_id TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  secret TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS licenses (
  id BIGSERIAL PRIMARY KEY,
  app_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  key_value TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'unused',
  duration TEXT NOT NULL,
  created_by TEXT NOT NULL,
  used_by TEXT DEFAULT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  note TEXT DEFAULT 'N/A',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_users (
  id BIGSERIAL PRIMARY KEY,
  app_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT,
  password TEXT,
  hwid TEXT DEFAULT 'N/A',
  ip TEXT DEFAULT 'N/A',
  subscription TEXT DEFAULT 'Free',
  expires TEXT DEFAULT 'Lifetime',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  app_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  color TEXT DEFAULT '#1f6feb',
  features TEXT DEFAULT '',
  price REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS variables (
  id BIGSERIAL PRIMARY KEY,
  app_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  secret INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhooks (
  id BIGSERIAL PRIMARY KEY,
  app_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT DEFAULT '[]',
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apps_owner ON applications(owner_id);
CREATE INDEX IF NOT EXISTS idx_licenses_app ON licenses(app_id);
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(key_value);
CREATE INDEX IF NOT EXISTS idx_appusers_app ON app_users(app_id);
CREATE INDEX IF NOT EXISTS idx_subs_app ON subscriptions(app_id);
CREATE INDEX IF NOT EXISTS idx_vars_app ON variables(app_id);
CREATE INDEX IF NOT EXISTS idx_hooks_app ON webhooks(app_id);
`

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  provider TEXT DEFAULT 'local',
  provider_id TEXT,
  avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  secret TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS licenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id INTEGER NOT NULL,
  key_value TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'unused',
  duration TEXT NOT NULL,
  created_by TEXT NOT NULL,
  used_by TEXT DEFAULT NULL,
  used_at DATETIME DEFAULT NULL,
  note TEXT DEFAULT 'N/A',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id INTEGER NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  password TEXT,
  hwid TEXT DEFAULT 'N/A',
  ip TEXT DEFAULT 'N/A',
  subscription TEXT DEFAULT 'Free',
  expires TEXT DEFAULT 'Lifetime',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 0,
  color TEXT DEFAULT '#1f6feb',
  features TEXT DEFAULT '',
  price REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS variables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  secret INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS webhooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  events TEXT DEFAULT '[]',
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES applications(id) ON DELETE CASCADE
);
`

// convert '?' positional placeholders to $1, $2, ... (skip quoted strings)
function convertPlaceholders(sql) {
  let i = 0
  let out = ''
  let inSingle = false
  let inDouble = false
  for (const ch of sql) {
    if (ch === "'" && !inDouble) inSingle = !inSingle
    else if (ch === '"' && !inSingle) inDouble = !inDouble
    if (ch === '?' && !inSingle && !inDouble) {
      i++
      out += `$${i}`
    } else {
      out += ch
    }
  }
  return out
}

function normalizeRow(row) {
  if (!row) return row
  const o = {}
  for (const k of Object.keys(row)) o[k.toLowerCase()] = row[k]
  return o
}

// ---------------------------------------------------------------------------
// SQLite engine (local dev + fallback)
// ---------------------------------------------------------------------------
let sqlite = null
let sqliteReady = null
if (!USE_PG) {
  const Database = (await import('better-sqlite3')).default
  sqlite = new Database(path.join(__dirname, 'keyauth.db'))
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(SQLITE_SCHEMA)
}

// ---------------------------------------------------------------------------
// PostgreSQL engine (production on Render, persistent)
// ---------------------------------------------------------------------------
let pgPool = null
let pgReady = null
if (USE_PG) {
  const { Pool } = await import('pg')
  pgPool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  pgReady = (async () => {
    await pgPool.query(POSTGRES_SCHEMA)
    console.log('[db] PostgreSQL schema ready (persistent database)')
  })()
  await pgReady
}

await runMigrations()

async function ensureColumn(table, column, ddl) {
  // Postgres
  if (USE_PG) {
    await pgReady
    const r = await pgPool.query(`SELECT column_name FROM information_schema.columns WHERE table_name=$1 AND column_name=$2`, [table, column])
    if (r.rows.length === 0) {
      await pgPool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${ddl}`)
    }
    return
  }
  // SQLite — inspect pragma
  const cols = sqlite.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name)
  if (!cols.includes(column)) {
    sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`)
  }
}

async function runMigrations() {
  await ensureColumn('users', 'provider', 'provider TEXT DEFAULT \'local\'')
  await ensureColumn('users', 'provider_id', 'provider_id TEXT')
  await ensureColumn('users', 'avatar', 'avatar TEXT')
}

async function pgExec(sql, paramsArray, { returning = false } = {}) {
  if (pgReady) await pgReady
  const converted = convertPlaceholders(sql)
  const text = returning ? `${converted} RETURNING *` : converted
  const res = await pgPool.query({ text, values: paramsArray || [] })
  return { rows: (res.rows || []).map(normalizeRow) }
}

// ---------------------------------------------------------------------------
// Unified public API (async)
// ---------------------------------------------------------------------------
function makeStatement(sql) {
  return {
    async run(...params) {
      if (USE_PG) {
        const r = await pgExec(sql, params, { returning: true })
        const lastInsertRowid = r.rows.length ? r.rows[0].id : 0
        return { lastInsertRowid, changes: r.rows.length }
      }
      const info = sqlite.prepare(sql).run(...params)
      return { lastInsertRowid: Number(info.lastInsertRowid), changes: info.changes }
    },
    async get(...params) {
      if (USE_PG) {
        const r = await pgExec(sql, params)
        return r.rows[0] || undefined
      }
      return sqlite.prepare(sql).get(...params)
    },
    async all(...params) {
      if (USE_PG) {
        const r = await pgExec(sql, params)
        return r.rows
      }
      return sqlite.prepare(sql).all(...params)
    },
  }
}

const db = {
  engine: USE_PG ? 'postgres' : 'sqlite',
  prepare: (sql) => makeStatement(sql),
  async transaction(fn) {
    if (!USE_PG) {
      sqlite.exec('BEGIN')
      try {
        const result = await fn()
        sqlite.exec('COMMIT')
        return result
      } catch (e) {
        sqlite.exec('ROLLBACK')
        throw e
      }
    }
    const client = await pgPool.connect()
    try {
      await client.query('BEGIN')
      const prevReady = pgReady
      const prevPool = pgPool
      pgPool = client
      pgReady = Promise.resolve()
      let result
      try {
        result = await fn()
      } finally {
        pgPool = prevPool
        pgReady = prevReady
      }
      await client.query('COMMIT')
      return result
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  },
  close() {
    if (USE_PG) return pgPool?.end()
    if (sqlite) sqlite.close()
  },
}

export default db
