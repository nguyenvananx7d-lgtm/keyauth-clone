import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import styles from './DashboardPage.module.css'

export default function UsersPage() {
  const [apps, setApps] = useState([])
  const [appId, setAppId] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', sub: 'Free', expiry: 'lifetime', expiryDate: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    api.getApps().then(data => {
      setApps(data)
      const id = data[0]?.id || null
      setAppId(id)
      if (id) return api.getAppUsers(id)
      return []
    }).then(u => setUsers(u || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const loadUsers = async (id) => {
    try { setUsers(await api.getAppUsers(id)) } catch (e) { setError(e.message) }
  }

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(u => u.id))

  const banUser = async (user) => {
    try {
      const updated = await api.updateAppUser(appId, user.id, { status: user.status === 'banned' ? 'active' : 'banned' })
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u))
    } catch (e) { setError(e.message) }
  }

  const deleteUser = async (id) => {
    try { await api.deleteAppUser(appId, id); setUsers(prev => prev.filter(u => u.id !== id)) }
    catch (e) { setError(e.message) }
  }

  const deleteSelected = async () => {
    try { await api.deleteAppUsers(appId, selected); setUsers(prev => prev.filter(u => !selected.includes(u.id))); setSelected([]) }
    catch (e) { setError(e.message) }
  }

  const createUser = async () => {
    if (!newUser.username || !appId) return
    let expires = 'Lifetime'
    if (newUser.expiry === 'date' && newUser.expiryDate) {
      expires = new Date(newUser.expiryDate).toLocaleDateString('en-GB')
    }
    try {
      const created = await api.createAppUser(appId, { username: newUser.username, email: newUser.email, password: newUser.password, subscription: newUser.sub, expires })
      setUsers(prev => [created, ...prev])
      setNewUser({ username: '', email: '', password: '', sub: 'Free', expiry: 'lifetime', expiryDate: '' })
      setShowCreate(false)
    } catch (e) { setError(e.message) }
  }

  if (loading) return <div className={styles.emptyState}>Loading...</div>

  return (
    <div>
      <div className={styles.breadcrumb}>
        <span>🏠 Manage Apps</span><span className={styles.breadSep}>›</span>
        <span>Current Application</span><span className={styles.breadSep}>›</span>
        <span className={styles.breadActive}>Users</span>
      </div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Users</h1>
          <p className={styles.pageDesc}>Manage users registered in your application.</p>
        </div>
        {apps.length > 1 && (
          <select className={styles.select} style={{ width: 'auto' }} value={appId || ''} onChange={e => { setAppId(Number(e.target.value)); loadUsers(Number(e.target.value)) }}>
            {apps.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
      </div>

      {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.4)', color: '#f85149', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>}

      <div className={styles.statsGrid}>
        {[
          { label: 'Total Users', value: users.length },
          { label: 'Active', value: users.filter(u => u.status === 'active').length },
          { label: 'Banned', value: users.filter(u => u.status === 'banned').length },
          { label: 'Pro Subscribers', value: users.filter(u => u.subscription === 'Pro').length },
        ].map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <input className={styles.searchSmall} placeholder="🔍 Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240 }} />
            {selected.length > 0 && <span className={`${styles.badge} ${styles.badgeBlue}`}>{selected.length} selected</span>}
          </div>
          <div className={styles.toolbarRight}>
            <button className={`${styles.iconBtn} ${styles.iconBtnRed}`} onClick={deleteSelected} disabled={selected.length === 0}>🗑</button>
            <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>+ Add User</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ accentColor: '#1f6feb' }} /></th>
                <th>Username</th><th>Email</th><th>HWID</th><th>IP</th>
                <th>Subscription</th><th>Expires</th><th>Created</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td><input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleSelect(user.id)} style={{ accentColor: '#1f6feb' }} /></td>
                  <td style={{ color: '#e6edf3', fontWeight: 600 }}>{user.username}</td>
                  <td>{user.email}</td>
                  <td><span className={styles.tableCode}>{user.hwid}</span></td>
                  <td>{user.ip}</td>
                  <td><span className={`${styles.badge} ${user.subscription === 'Pro' ? styles.badgeBlue : styles.badgeGray}`}>{user.subscription}</span></td>
                  <td>{user.expires}</td>
                  <td>{user.created_at?.split('T')[0]}</td>
                  <td><span className={`${styles.badge} ${user.status === 'active' ? styles.badgeGreen : styles.badgeRed}`}>{user.status === 'active' ? 'Active' : 'Banned'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className={`${styles.actionBtn} ${styles.actionBtnYellow}`} onClick={() => banUser(user)}>{user.status === 'active' ? '🚫 Ban' : '✓ Unban'}</button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => deleteUser(user.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className={styles.emptyState}>No users found.</div>}
        </div>
      </div>

      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Add User</h3>
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input className={styles.input} placeholder="Username" value={newUser.username} onChange={e => setNewUser(f => ({...f, username: e.target.value}))} autoFocus />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser(f => ({...f, email: e.target.value}))} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input className={styles.input} type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser(f => ({...f, password: e.target.value}))} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Subscription</label>
              <select className={styles.select} value={newUser.sub} onChange={e => setNewUser(f => ({...f, sub: e.target.value}))}>
                <option value="Free">Free</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Expiry</label>
              <select className={styles.select} value={newUser.expiry} onChange={e => setNewUser(f => ({...f, expiry: e.target.value, expiryDate: ''}))}>
                <option value="lifetime">Lifetime</option>
                <option value="date">Custom Date</option>
              </select>
            </div>
            {newUser.expiry === 'date' && (
              <div className={styles.field}>
                <label className={styles.label}>Expiry Date</label>
                <input className={styles.input} type="date" value={newUser.expiryDate} min={new Date().toISOString().split('T')[0]} onChange={e => setNewUser(f => ({...f, expiryDate: e.target.value}))} style={{ colorScheme: 'dark' }} />
              </div>
            )}
            <div className={styles.modalActions}>
              <button className={styles.btnOutline} onClick={() => setShowCreate(false)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={createUser}>Add User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
