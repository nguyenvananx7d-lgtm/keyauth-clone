import { useState } from 'react'
import styles from './DashboardPage.module.css'

const INITIAL_SUBS = []

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState(INITIAL_SUBS)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', level: 0, color: '#1f6feb', features: '', price: 0 })

  const createSub = () => {
    if (!form.name) return
    setSubs(prev => [...prev, { ...form, id: Date.now() }])
    setForm({ name: '', level: 0, color: '#1f6feb', features: '', price: 0 })
    setShowCreate(false)
  }

  return (
    <div>
      <div className={styles.breadcrumb}>
        <span>🏠 Manage Apps</span>
        <span className={styles.breadSep}>›</span>
        <span>Current Application</span>
        <span className={styles.breadSep}>›</span>
        <span className={styles.breadActive}>Subscriptions</span>
      </div>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Subscriptions</h1>
          <p className={styles.pageDesc}>Manage subscription tiers for your application.</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>+ Create Subscription</button>
      </div>

      {subs.length === 0 && (
        <div className={styles.sectionCard}>
          <div className={styles.emptyState}>No subscriptions yet. Create your first tier!</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {subs.map(sub => (
          <div key={sub.id} className={styles.sectionCard} style={{ borderTop: `3px solid ${sub.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', marginBottom: 4 }}>{sub.name}</div>
                <div style={{ fontSize: 13, color: '#8b949e' }}>Level: {sub.level}</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: sub.color }}>
                ${sub.price}<span style={{ fontSize: 13, fontWeight: 400, color: '#8b949e' }}>/mo</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 16 }}>{sub.features}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={`${styles.actionBtn} ${styles.actionBtnBlue}`}>✏️ Edit</button>
              <button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => setSubs(prev => prev.filter(s => s.id !== sub.id))}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Create Subscription</h3>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input className={styles.input} placeholder="e.g. Pro, VIP..." value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} autoFocus />
            </div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Level</label>
                <input className={styles.input} type="number" min="0" value={form.level} onChange={e => setForm(f => ({...f, level: parseInt(e.target.value) || 0}))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Price ($/mo)</label>
                <input className={styles.input} type="number" min="0" value={form.price} onChange={e => setForm(f => ({...f, price: parseFloat(e.target.value) || 0}))} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Color</label>
              <input className={styles.input} type="color" value={form.color} onChange={e => setForm(f => ({...f, color: e.target.value}))} style={{ height: 44, padding: 4 }} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Features Description</label>
              <textarea className={styles.textarea} placeholder="Describe the features..." value={form.features} onChange={e => setForm(f => ({...f, features: e.target.value}))} />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnOutline} onClick={() => setShowCreate(false)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={createSub}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
