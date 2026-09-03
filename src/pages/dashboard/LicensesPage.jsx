import { useState, useEffect } from 'react'
import { api } from '../../api/client'
import styles from './DashboardPage.module.css'

const DEFAULT_APP_ID = () => {
  try { return JSON.parse(localStorage.getItem('keyauth_selected_app')) } catch { return null }
}

export default function LicensesPage() {
  const [appId, setAppId] = useState(null)
  const [apps, setApps] = useState([])
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState('')
  const [createForm, setCreateForm] = useState({ amount: 1, duration: '30', unit: 'Days', prefix: 'KEYAUTH' })
  const [error, setError] = useState('')

  useEffect(() => {
    api.getApps().then(data => {
      setApps(data)
      const id = data[0]?.id || null
      setAppId(id)
      if (id) return api.getLicenses(id)
      return []
    }).then(lics => setLicenses(lics || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const loadLicenses = async (id) => {
    try { setLicenses(await api.getLicenses(id)) } catch (e) { setError(e.message) }
  }

  const filtered = licenses.filter(l => l.key_value?.toLowerCase().includes(search.toLowerCase()))

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(l => l.id))

  const deleteSelected = async () => {
    try { await api.deleteLicenses(appId, selected); setLicenses(prev => prev.filter(l => !selected.includes(l.id))); setSelected([]) }
    catch (e) { setError(e.message) }
  }

  const createLicenses = async () => {
    if (!appId) return setError('No application selected.')
    try {
      const created = await api.createLicenses(appId, { amount: createForm.amount, duration: `${createForm.duration} ${createForm.unit}`, prefix: createForm.prefix })
      setLicenses(prev => [...created, ...prev])
      setShowCreate(false)
    } catch (e) { setError(e.message) }
  }

  const deleteLicense = async (id) => {
    try { await api.deleteLicense(appId, id); setLicenses(prev => prev.filter(l => l.id !== id)) }
    catch (e) { setError(e.message) }
  }

  if (loading) return <div className={styles.emptyState}>Loading...</div>

  return (
    <div>
      <div className={styles.breadcrumb}>
        <span>🏠 Manage Apps</span><span className={styles.breadSep}>›</span>
        <span>Current Application</span><span className={styles.breadSep}>›</span>
        <span className={styles.breadActive}>Licenses</span>
      </div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Licenses</h1>
          <p className={styles.pageDesc}>Licenses allow users to register on your application. <a href="#">Learn More.</a></p>
        </div>
        {apps.length > 1 && (
          <select className={styles.select} style={{ width: 'auto' }} value={appId || ''} onChange={e => { setAppId(Number(e.target.value)); loadLicenses(Number(e.target.value)) }}>
            {apps.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
      </div>

      {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.4)', color: '#f85149', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>}

      <div className={styles.sectionCard}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <input className={styles.searchSmall} placeholder="🔍 Search licenses..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240 }} />
            {selected.length > 0 && <span className={`${styles.badge} ${styles.badgeBlue}`}>{selected.length} selected</span>}
          </div>
          <div className={styles.toolbarRight}>
            <button className={styles.iconBtn} title="Refresh" onClick={() => appId && loadLicenses(appId)}>↺</button>
            <button className={`${styles.iconBtn} ${styles.iconBtnRed}`} title="Delete selected" onClick={deleteSelected} disabled={selected.length === 0}>🗑</button>
            <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>+ Create License</button>
          </div>
        </div>

        <div className={styles.filterRow}>
          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} />
            Select all
          </label>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>License Key</th><th>Status</th><th>Duration</th>
                <th>Created By</th><th>Used By</th><th>Used At</th><th>Note</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lic => (
                <tr key={lic.id}>
                  <td><input type="checkbox" checked={selected.includes(lic.id)} onChange={() => toggleSelect(lic.id)} style={{ accentColor: '#1f6feb' }} /></td>
                  <td><span className={styles.tableCode}>{lic.key_value}</span></td>
                  <td><span className={`${styles.badge} ${lic.status === 'used' ? styles.badgeGreen : styles.badgeGray}`}>{lic.status === 'used' ? 'Used' : 'Unused'}</span></td>
                  <td>{lic.duration}</td>
                  <td>{lic.created_by}</td>
                  <td>{lic.used_by || '-'}</td>
                  <td style={{ fontSize: 12 }}>{lic.used_at || '-'}</td>
                  <td>{lic.note}</td>
                  <td><button className={`${styles.actionBtn} ${styles.actionBtnRed}`} onClick={() => deleteLicense(lic.id)}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className={styles.emptyState}>No licenses found. Create your first license!</div>}
        </div>
      </div>

      {showCreate && (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Create Licenses</h3>
            <div className={styles.field}>
              <label className={styles.label}>Amount (max 50)</label>
              <input className={styles.input} type="number" min="1" max="50" value={createForm.amount} onChange={e => setCreateForm(f => ({...f, amount: parseInt(e.target.value) || 1}))} />
            </div>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>Duration</label>
                <input className={styles.input} type="number" min="1" value={createForm.duration} onChange={e => setCreateForm(f => ({...f, duration: e.target.value}))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Unit</label>
                <select className={styles.select} value={createForm.unit} onChange={e => setCreateForm(f => ({...f, unit: e.target.value}))}>
                  <option>Hours</option><option>Days</option><option>Weeks</option><option>Months</option><option>Years</option>
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Prefix</label>
              <input className={styles.input} value={createForm.prefix} onChange={e => setCreateForm(f => ({...f, prefix: e.target.value}))} />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnOutline} onClick={() => setShowCreate(false)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={createLicenses}>Create Licenses</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
