import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import {
  KeyRound, Users, CreditCard, FileText, Bell, Zap, Link2, ScrollText,
  Folder, Ruler, Globe, User, Settings, Search, ChevronDown, LogOut, LayoutGrid,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import styles from './DashboardLayout.module.css'

const NAV_SECTIONS = [
  {
    title: 'Management',
    items: [
      { label: 'Licenses',    path: '/app/licenses',          icon: KeyRound },
      { label: 'Users',       path: '/app/users',             icon: Users },
      { label: 'Subscriptions', path: '/app/subscriptions',   icon: CreditCard },
      { label: 'Variables',   path: '/app/variables',         icon: FileText },
      { label: 'Webhooks',    path: '/app/webhooks',          icon: Bell },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { label: 'Tokens',      path: '#', icon: Zap, disabled: true },
      { label: 'Sessions',    path: '#', icon: Link2, disabled: true },
      { label: 'Event Logs',  path: '#', icon: ScrollText, disabled: true },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Files',       path: '#', icon: Folder, disabled: true },
      { label: 'Rules',       path: '#', icon: Ruler, disabled: true },
      { label: 'Web Loader',  path: '#', icon: Globe, disabled: true },
      { label: 'Team',        path: '#', icon: User, disabled: true },
      { label: 'Settings',    path: '/app/settings',          icon: Settings },
    ],
  },
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
          <div className={styles.sidebarBrand}>
            <span className={styles.brandMark}>K</span>
            <Link to="/" className={styles.sidebarLogo}>KeyAuth</Link>
          </div>
          <NavLink
            to="/app/applications"
            className={({ isActive }) =>
              `${styles.appSelector} ${isActive ? styles.appSelectorActive : ''}`
            }
          >
            <span className={styles.appSelectorIcon}><LayoutGrid size={14} /></span>
            <span className={styles.appName}>Manage Apps</span>
            <span className={styles.appChevron}><ChevronDown size={13} /></span>
          </NavLink>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className={styles.navSection}>
              <div className={styles.navSectionTitle}>{section.title}</div>
              {section.items.map((item) => (
                item.disabled ? (
                  <div key={item.label} className={styles.navItemDisabled}>
                    <item.icon className={styles.navIcon} size={16} />
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
                    <item.icon className={styles.navIcon} size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link to="/app/applications" className={styles.upgradeCard}>
            <span className={styles.upgradeIcon}><Zap size={18} /></span>
            <div className={styles.upgradeInfo}>
              <span className={styles.upgradeTitle}>Upgrade to Pro</span>
              <span className={styles.upgradeDesc}>Unlock all features</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarSearch}>
            <Search className={styles.searchSvg} size={14} />
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
              <ChevronDown className={styles.chevronSvg} size={14} />
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
                    <Settings size={14} />
                    Account Settings
                  </button>
                  <div className={styles.userMenuDivider} />
                  <button className={`${styles.userMenuItem} ${styles.userMenuLogout}`} onClick={handleLogout}>
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Banner */}
        <div className={styles.banner}>
          <AlertTriangle size={14} />
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
