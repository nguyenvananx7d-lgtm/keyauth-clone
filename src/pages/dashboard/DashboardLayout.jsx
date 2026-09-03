import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './DashboardLayout.module.css'

const NAV_ITEMS = [
  { label: 'Licenses',    path: '/app/licenses',      icon: '🎫' },
  { label: 'Users',       path: '/app/users',         icon: '👥' },
  { label: 'Tokens',      path: '#',                  icon: '🔑' },
  { label: 'Subscriptions', path: '/app/subscriptions', icon: '📋' },
  { label: 'Chats',       path: '#',                  icon: '💬' },
  { label: 'Sessions',    path: '#',                  icon: '🔗' },
  { label: 'Webhooks',    path: '/app/webhooks',      icon: '🔔' },
  { label: 'Files',       path: '#',                  icon: '📁' },
  { label: 'Variables',   path: '/app/variables',     icon: '⚙️' },
  { label: 'Rules',       path: '#',                  icon: '📏' },
  { label: 'Event Logs',  path: '#',                  icon: '📝' },
  { label: 'Web Loader',  path: '#',                  icon: '🌐' },
  { label: 'Team',        path: '#',                  icon: '👤' },
  { label: 'Settings',    path: '/app/settings',      icon: '⚙' },
  { label: 'Resources',   path: '#',                  icon: '📚' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [search, setSearch] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link to="/" className={styles.sidebarLogo}>KeyAuth</Link>
          <NavLink
            to="/app/applications"
            className={({ isActive }) =>
              `${styles.appSelector} ${isActive ? styles.appSelectorActive : ''}`
            }
          >
            <span className={styles.appSelectorIcon}>⊞</span>
            <span className={styles.appName}>Manage Apps</span>
          </NavLink>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => (
            item.path === '#' ? (
              <div key={item.label} className={styles.navItemDisabled}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ) : (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            )
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarSearch}>
            <svg className={styles.searchSvg} viewBox="0 0 16 16" fill="currentColor">
              <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Search pages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.topbarRight}>
            <div
              className={styles.userBtn}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className={styles.avatar}>
                {user?.avatar || user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.username || 'User'}</span>
                <span className={styles.userRole}>Tester Subscription</span>
              </div>
              <svg className={styles.chevronSvg} viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.427 7.427l3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"/>
              </svg>
            </div>
            {showUserMenu && (
              <>
                <div className={styles.menuBackdrop} onClick={() => setShowUserMenu(false)} />
                <div className={styles.userMenu}>
                  <div className={styles.userMenuHeader}>
                    <div className={styles.avatarLg}>{user?.avatar || 'U'}</div>
                    <div>
                      <div className={styles.userMenuName}>{user?.username}</div>
                      <div className={styles.userEmail}>{user?.email}</div>
                    </div>
                  </div>
                  <div className={styles.userMenuDivider} />
                  <button className={styles.userMenuItem} onClick={() => { navigate('/app/settings'); setShowUserMenu(false) }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.011-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.011.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0ZM8 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"/></svg>
                    Account Settings
                  </button>
                  <div className={styles.userMenuDivider} />
                  <button className={`${styles.userMenuItem} ${styles.userMenuLogout}`} onClick={handleLogout}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm10.44 4.5-1.97-1.97a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l1.97-1.97H6.75a.75.75 0 0 1 0-1.5Z"/></svg>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Banner */}
        <div className={styles.banner}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>
          <span>You don't have a subscription!</span>
          <a href="#">Upgrade Now.</a>
        </div>

        {/* Content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
