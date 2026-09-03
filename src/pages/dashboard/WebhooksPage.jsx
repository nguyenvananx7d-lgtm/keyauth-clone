import { useState } from 'react'
import styles from './DashboardPage.module.css'

const EVENTS = ['user.login', 'user.register', 'license.used', 'license.expired', 'user.banned']

const INITIAL_HOOKS = []

export default function WebhooksPage() {
  const [hooks, setHooks] = useState(INITIAL_HOOKS)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ url: '', events: [] })

  const toggleEvent = (ev) => setForm(f => ({
    ...f,
    events: f.events.includes(ev) ? f.events.filter(e => e !== ev) : [...f.events, ev]
  }))

  const createHook = () => {
    if (!form.url) return
    setHooks(prev => [...prev, { ...form, id: Date.now(), active: true }])
    setForm({ url: '', events: [] })
    setShowCreate(false)
  }

  return (
    <div>
      <div className={styles.breadcrumb}>
        <span>🏠 Manage Apps</span>
        <span className={styles.breadSep}>›</span>
        <span>Current Application</span>
        <span className={styles.breadSep}>›</span>
        <span className={styles.breadActive}>Webhooks</span>
      </div>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Webhooks</h1>
          <p className={styles.pageDesc}>Receive automatic notifications when events occur in your application.</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>+ Add Webhook</button>
      </div>

      <div className={styles.sectionCard}>
        {hooks.length === 0 && <div className={styles.emptyState}>No webhooks yet. Add your first webhook!</div>}
        {hooks.map(hook => (
          <div key={hook.id} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: 'Consolas, monospace', fontSize: 13, color: '#388bfd', marginBottom: 6 }}>{hook.url}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {hook.events.map(ev => (
                    <span key={ev} className={`${styles.badge} ${styles.badgeBlue}`}>{ev}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`${styles.badge} ${hook.active ? styles.badgeGreen : styles.badgeGray}`}>
                  {hook.active ? 'Active' : 'Disabled'}
                </span>
                <button className={`${styles.actionBtn} ${styles.actionBtnYellow}`} onClick={() => setHooks(prev => prev.map(h => h.id === hook.id ? {...h, active: !h.active} : h))}>
                  {hook.active ? '⏸ Disable' : '▶ Enable'}
                </button>
                <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => setHooks(prev => prev.filter(h => h.id !== hook.id))}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Add Webhook</h3>
            <div className={styles.field}>
              <label className={styles.label}>Webhook URL</label>
              <input className={styles.input} placeholder="https://..." value={form.url} onChange={e => setForm(f => ({...f, url: e.target.value}))} autoFocus />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Events</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {EVENTS.map(ev => (
                  <label key={ev} className={styles.checkboxRow}>
                    <input type="checkbox" checked={form.events.includes(ev)} onChange={() => toggleEvent(ev)} />
                    {ev}
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnOutline} onClick={() => setShowCreate(false)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={createHook}>Add Webhook</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
