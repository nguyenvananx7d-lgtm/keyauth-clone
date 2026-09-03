import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import styles from './DashboardPage.module.css'

export default function SettingsPage() {
  const { user, login } = useAuth()
  const [profile, setProfile] = useState({ username: user?.username || '', email: user?.email || '' })
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [saved, setSaved] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  const saveProfile = () => {
    login({ ...user, ...profile })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const savePassword = () => {
    setPwError('')
    if (!passwords.current) { setPwError('Enter your current password.'); return }
    if (passwords.newPass.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (passwords.newPass !== passwords.confirm) { setPwError('Passwords do not match.'); return }
    setPasswords({ current: '', newPass: '', confirm: '' })
    setPwSaved(true)
    setTimeout(() => setPwSaved(false), 2000)
  }

  return (
    <div>
      <div className={styles.breadcrumb}>
        <span>🏠 Manage Apps</span>
        <span className={styles.breadSep}>›</span>
        <span className={styles.breadActive}>Settings</span>
      </div>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Account Settings</h1>
          <p className={styles.pageDesc}>Manage your account information and security.</p>
        </div>
      </div>

      {/* Profile */}
      <div className={styles.sectionCard} style={{ marginBottom: 20 }}>
        <h3 className={styles.cardTitle} style={{ marginBottom: 16 }}>Profile</h3>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input className={styles.input} value={profile.username} onChange={e => setProfile(p => ({...p, username: e.target.value}))} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className={styles.btnPrimary} onClick={saveProfile}>Save Changes</button>
          {saved && <span style={{ color: '#3fb950', fontSize: 13 }}>✓ Saved!</span>}
        </div>
      </div>

      {/* Password */}
      <div className={styles.sectionCard} style={{ marginBottom: 20 }}>
        <h3 className={styles.cardTitle} style={{ marginBottom: 16 }}>Change Password</h3>
        {pwError && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.4)', color: '#f85149', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{pwError}</div>}
        <div className={styles.field}>
          <label className={styles.label}>Current Password</label>
          <input className={styles.input} type="password" value={passwords.current} onChange={e => setPasswords(p => ({...p, current: e.target.value}))} />
        </div>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label}>New Password</label>
            <input className={styles.input} type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({...p, newPass: e.target.value}))} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <input className={styles.input} type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({...p, confirm: e.target.value}))} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className={styles.btnPrimary} onClick={savePassword}>Update Password</button>
          {pwSaved && <span style={{ color: '#3fb950', fontSize: 13 }}>✓ Password updated!</span>}
        </div>
      </div>

      {/* Danger zone */}
      <div className={styles.sectionCard} style={{ borderColor: 'rgba(248,81,73,0.3)' }}>
        <h3 className={styles.cardTitle} style={{ color: '#f85149', marginBottom: 8 }}>Danger Zone</h3>
        <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 16 }}>
          These actions are irreversible. Please be careful.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className={styles.btnDanger}>🗑 Delete All App Data</button>
          <button className={styles.btnDanger}>❌ Delete Account</button>
        </div>
      </div>
    </div>
  )
}
