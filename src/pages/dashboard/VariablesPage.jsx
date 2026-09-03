import { useState } from 'react'
import styles from './DashboardPage.module.css'

const INITIAL_VARS = []

export default function VariablesPage() {
  const [vars, setVars] = useState(INITIAL_VARS)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', value: '', secret: false })
  const [revealed, setRevealed] = useState({})

  const createVar = () => {
    if (!form.name) return
    setVars(prev => [...prev, { ...form, id: Date.now() }])
    setForm({ name: '', value: '', secret: false })
    setShowCreate(false)
  }

  return (
    <div>
      <div className={styles.breadcrumb}>
        <span>🏠 Manage Apps</span>
        <span className={styles.breadSep}>›</span>
        <span>Current Application</span>
        <span className={styles.breadSep}>›</span>
        <span className={styles.breadActive}>Variables</span>
      </div>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Variables</h1>
          <p className={styles.pageDesc}>Store configuration variables for your application.</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>+ Add Variable</button>
      </div>

      <div className={styles.sectionCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Variable Name</th>
              <th>Value</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vars.map(v => (
              <tr key={v.id}>
                <td style={{ color: '#e6edf3', fontWeight: 600, fontFamily: 'Consolas, monospace' }}>{v.name}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={styles.tableCode}>
                      {v.secret && !revealed[v.id] ? '••••••••••••' : v.value}
                    </span>
                    {v.secret && (
                      <button className={styles.copyBtn} onClick={() => setRevealed(r => ({...r, [v.id]: !r[v.id]}))}>
                        {revealed[v.id] ? '🙈' : '👁'}
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${v.secret ? styles.badgeRed : styles.badgeGray}`}>
                    {v.secret ? '🔒 Secret' : '📄 Public'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className={`${styles.actionBtn} ${styles.actionBtnBlue}`}>✏️ Edit</button>
                    <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => setVars(prev => prev.filter(x => x.id !== v.id))}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vars.length === 0 && <div className={styles.emptyState}>No variables yet.</div>}
      </div>

      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Add Variable</h3>
            <div className={styles.field}>
              <label className={styles.label}>Variable Name</label>
              <input className={styles.input} placeholder="e.g. API_KEY" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value.toUpperCase()}))} autoFocus />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Value</label>
              <input className={styles.input} placeholder="Value..." value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value}))} />
            </div>
            <label className={styles.checkboxRow} style={{ marginBottom: 16 }}>
              <input type="checkbox" checked={form.secret} onChange={e => setForm(f => ({...f, secret: e.target.checked}))} />
              Secret variable (hide value)
            </label>
            <div className={styles.modalActions}>
              <button className={styles.btnOutline} onClick={() => setShowCreate(false)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={createVar}>Add Variable</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
