const BASE = ''  // Vite proxies /api → http://localhost:3001 in dev; same origin in production

function getToken() {
  return localStorage.getItem('keyauth_token')
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export const api = {
  // Auth
  register: (body) => request('POST', '/api/auth/register', body),
  login: (body) => request('POST', '/api/auth/login', body),

  // Applications
  getApps: () => request('GET', '/api/applications'),
  createApp: (body) => request('POST', '/api/applications', body),
  updateApp: (id, body) => request('PATCH', `/api/applications/${id}`, body),
  deleteApp: (id) => request('DELETE', `/api/applications/${id}`),
  refreshSecret: (id) => request('POST', `/api/applications/${id}/refresh-secret`),

  // Licenses
  getLicenses: (appId) => request('GET', `/api/applications/${appId}/licenses`),
  createLicenses: (appId, body) => request('POST', `/api/applications/${appId}/licenses`, body),
  deleteLicense: (appId, id) => request('DELETE', `/api/applications/${appId}/licenses/${id}`),
  deleteLicenses: (appId, ids) => request('DELETE', `/api/applications/${appId}/licenses`, { ids }),

  // App Users
  getAppUsers: (appId) => request('GET', `/api/applications/${appId}/users`),
  createAppUser: (appId, body) => request('POST', `/api/applications/${appId}/users`, body),
  updateAppUser: (appId, id, body) => request('PATCH', `/api/applications/${appId}/users/${id}`, body),
  deleteAppUser: (appId, id) => request('DELETE', `/api/applications/${appId}/users/${id}`),
  deleteAppUsers: (appId, ids) => request('DELETE', `/api/applications/${appId}/users`, { ids }),

  // Subscriptions
  getSubs: (appId) => request('GET', `/api/applications/${appId}/subscriptions`),
  createSub: (appId, body) => request('POST', `/api/applications/${appId}/subscriptions`, body),
  updateSub: (appId, id, body) => request('PATCH', `/api/applications/${appId}/subscriptions/${id}`, body),
  deleteSub: (appId, id) => request('DELETE', `/api/applications/${appId}/subscriptions/${id}`),

  // Variables
  getVars: (appId) => request('GET', `/api/applications/${appId}/variables`),
  createVar: (appId, body) => request('POST', `/api/applications/${appId}/variables`, body),
  updateVar: (appId, id, body) => request('PATCH', `/api/applications/${appId}/variables/${id}`, body),
  deleteVar: (appId, id) => request('DELETE', `/api/applications/${appId}/variables/${id}`),

  // Webhooks
  getWebhooks: (appId) => request('GET', `/api/applications/${appId}/webhooks`),
  createWebhook: (appId, body) => request('POST', `/api/applications/${appId}/webhooks`, body),
  updateWebhook: (appId, id, body) => request('PATCH', `/api/applications/${appId}/webhooks/${id}`, body),
  deleteWebhook: (appId, id) => request('DELETE', `/api/applications/${appId}/webhooks/${id}`),
}
