import { createContext, useContext, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

function loadUser() {
  try {
    const u = localStorage.getItem('keyauth_user')
    return u ? JSON.parse(u) : null
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  const login = async (credentials) => {
    // Called with { username, password } for real login
    // or with user object directly (for profile updates)
    if (credentials.password !== undefined && typeof credentials.password === 'string' && !credentials.id) {
      const data = await api.login(credentials)
      localStorage.setItem('keyauth_token', data.token)
      const u = { ...data.user, avatar: data.user.username[0].toUpperCase() }
      setUser(u)
      localStorage.setItem('keyauth_user', JSON.stringify(u))
      return data
    } else {
      // Profile update
      const u = { ...credentials, avatar: credentials.username?.[0]?.toUpperCase() || 'U' }
      setUser(u)
      localStorage.setItem('keyauth_user', JSON.stringify(u))
    }
  }

  const register = async (credentials) => {
    const data = await api.register(credentials)
    localStorage.setItem('keyauth_token', data.token)
    const u = { ...data.user, avatar: data.user.username[0].toUpperCase() }
    setUser(u)
    localStorage.setItem('keyauth_user', JSON.stringify(u))
    return data
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('keyauth_user')
    localStorage.removeItem('keyauth_token')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
