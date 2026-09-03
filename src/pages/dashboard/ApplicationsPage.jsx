import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import styles from './DashboardPage.module.css'

export default function ApplicationsPage() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newAppName, setNewAppName] = useState('')
  const [showSecret, setShowSecret] = useState({})
  const [selectedApp, setSelectedApp] = useState(null)
  const [renaming, setRenaming] = useState(null)
  const [renamVal, setRenamVal] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.getApps()
      .then(data => { setApps(data); if (data.length) setSelectedApp(data[0].id) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const createApp = async () => {
    if (!newAppName.trim()) return
    try {
      const app = await api.createApp({ name: newAppName })
      setApps(prev => [app, ...prev])
      setSelectedApp(app.id)
      setNewAppName('')
      setShowCreate(false)
    } catch (e) { setError(e.message) }
  }

  const deleteApp = async (id) => {
    try {
      await api.deleteApp(id)
      setApps(prev => prev.filter(a => a.id !== id))
      if (selectedApp === id) setSelectedApp(apps.find(a => a.id !== id)?.id || null)
    } catch (e) { setError(e.message) }
  }

  const toggleStatus = async (app) => {
    const newStatus = app.status === 'active' ? 'paused' : 'active'
    try {
      const updated = await api.updateApp(app.id, { status: newStatus })
      setApps(prev => prev.map(a => a.id === app.id ? updated : a))
    } catch (e) { setError(e.message) }
  }

  const confirmRename = async () => {
    if (!renamVal.trim()) return
    try {
      const updated = await api.updateApp(renaming, { name: renamVal })
      setApps(prev => prev.map(a => a.id === renaming ? updated : a))
      setRenaming(null)
    } catch (e) { setError(e.message) }
  }

  const refreshSecret = async (id) => {
    try {
      const { secret } = await api.refreshSecret(id)
      setApps(prev => prev.map(a => a.id === id ? { ...a, secret } : a))
    } catch (e) { setError(e.message) }
  }

  const activeApp = apps.find(a => a.id === selectedApp) || apps[0]

  const stats = [
    { label: 'Total Apps',      value: apps.length },
    { label: 'Active',          value: apps.filter(a => a.status === 'active').length },
    { label: 'Paused',          value: apps.filter(a => a.status === 'paused').length },
    { label: 'Active Sessions', value: 0 },
  ]

  if (loading) return <div className={styles.emptyState}>Loading...</div>

  return (
    <div>
      <div className={styles.breadcrumb}>
        <span>🏠 Manage Apps</span>
        <span className={styles.breadSep}>›</span>
        <span>Current Application: {activeApp?.name || 'none'}</span>
        <span className={styles.breadSep}>›</span>
        <span className={styles.breadActive}>Manage Applications</span>
      </div>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Manage Applications</h1>
          <p className={styles.pageDesc}>
            Manage your applications. Applications are the backbone of all the data.{' '}
            <a href="#">Learn More.</a>
          </p>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.4)', color: '#f85149', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>}

      <div className={styles.statsGrid}>
        {stats.map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        {activeApp ? (
          <div className={styles.appInfoCard}>
            <h3 className={styles.cardTitle}>Application Credentials</h3>
            <p className={styles.cardDesc}>Simply replace the placeholder code in the example with these.</p>

            <div className={styles.toggleRow}>
              <div className={styles.toggle} />
              <span className={styles.toggleLabel}>Display Code Snippet</span>
            </div>

            {[
              { label: 'APPLICATION NAME', value: activeApp.name },
              { label: 'ACCOUNT OWNER ID', value: String(activeApp.owner_id) },
              { label: 'APPLICATION VERSION', value: activeApp.version },
            ].map(({ label, value }) => (
              <div key={label} className={styles.infoRow}>
                <div className={styles.infoLabel}>{label}</div>
                <div className={styles.infoValueCopy}>
                  <span>{value}</span>
                  <button className={styles.copyBtn} onClick={() => navigator.clipboard?.writeText(value)} title="Copy">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>
                  </button>
                </div>
              </div>
            ))}

            <div className={styles.infoRow}>
              <div className={styles.infoLabel}>APPLICATION SECRET</div>
              <div className={styles.infoValueSecret}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {showSecret[activeApp.id] ? activeApp.secret : '••••••••••••••••••••••••••••••••••••••••••••••••'}
                </span>
                <button className={styles.copyBtn} onClick={() => setShowSecret(s => ({...s, [activeApp.id]: !s[activeApp.id]}))} title="Toggle">
                  {showSecret[activeApp.id]
                    ? <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M.143 2.31a.75.75 0 0 1 1.047-.167l14.5 10.5a.75.75 0 1 1-.88 1.214l-2.248-1.628C11.346 13.19 9.792 14 8 14c-3.49 0-6.04-2.548-7.395-4.703a1.947 1.947 0 0 1 0-2.094c.536-.859 1.28-1.847 2.202-2.682L.31 3.357A.75.75 0 0 1 .143 2.31Z"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z"/></svg>
                  }
                </button>
                <button className={styles.copyBtn} onClick={() => navigator.clipboard?.writeText(activeApp.secret)} title="Copy">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>
                </button>
              </div>
            </div>

            <button className={styles.btnWarning} onClick={() => refreshSecret(activeApp.id)}>
              🔄 Refresh Application Secret
            </button>
          </div>
        ) : (
          <div className={styles.appInfoCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <p style={{ color: '#6e7681', fontSize: 14 }}>Create an application to see credentials.</p>
          </div>
        )}

        <div className={styles.appListCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>My Applications</h3>
            <div className={styles.cardHeaderRight}>
              <input className={styles.searchSmall} placeholder="🔍 Search applications..." />
              <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>+ Create Application</button>
            </div>
          </div>

          <div className={styles.filterRow}>
            <button className={`${styles.filterBtn} ${styles.filterActive}`}>All Applications</button>
          </div>

          {apps.map(app => (
            <div key={app.id} className={`${styles.appCard} ${selectedApp === app.id ? styles.appCardSelected : ''}`} onClick={() => setSelectedApp(app.id)}>
              <div className={styles.appCardHeader}>
                {renaming === app.id ? (
                  <input className={styles.inlineInput} value={renamVal} onChange={e => setRenamVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenaming(null) }} onBlur={confirmRename} autoFocus onClick={e => e.stopPropagation()} />
                ) : (
                  <span className={styles.appCardName}>{app.name}</span>
                )}
                <span className={`${styles.badge} ${app.status === 'active' ? styles.badgeGreen : styles.badgeYellow}`}>
                  {app.status === 'active' ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <div className={styles.appCardStats}>
                <span>App Version: <strong>{app.version}</strong></span>
                <span>Application Standing: <strong>{app.status === 'active' ? 'Good' : 'Paused'}</strong></span>
              </div>
              <div className={styles.appCardActions} onClick={e => e.stopPropagation()}>
                <button className={`${styles.actionBtn} ${styles.actionBtnGreen}`} onClick={() => setSelectedApp(app.id)}>✓ Selected</button>
                <button className={`${styles.actionBtn} ${styles.actionBtnBlue}`} onClick={() => { setRenaming(app.id); setRenamVal(app.name) }}>✏️ Rename</button>
                <button className={`${styles.actionBtn} ${styles.actionBtnPurple}`}>📝 Edit Description</button>
                <button className={`${styles.actionBtn} ${styles.actionBtnYellow}`} onClick={() => toggleStatus(app)}>⏸ {app.status === 'active' ? 'Pause' : 'Resume'}</button>
                <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => deleteApp(app.id)}>🗑 Delete</button>
              </div>
            </div>
          ))}

          {apps.length === 0 && <div className={styles.emptyState}><p>No applications yet. Create your first one!</p></div>}
        </div>
      </div>

      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Create Application</h3>
            <div className={styles.field}>
              <label className={styles.label}>Application Name</label>
              <input className={styles.input} placeholder="Enter application name..." value={newAppName} onChange={e => setNewAppName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createApp()} autoFocus />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnOutline} onClick={() => setShowCreate(false)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={createApp}>Create Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
