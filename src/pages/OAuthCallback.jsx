import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import styles from './AuthPage.module.css'

export default function OAuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { loginOAuth } = useAuth()
  const [error, setError] = useState('')
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true
    const code = params.get('code')
    const provider = params.get('state') || 'google'
    if (!code) {
      setError('Missing authorization code.')
      return
    }
    ;(async () => {
      try {
        const data = await api.oauthCallback(provider, { code })
        loginOAuth(data)
        navigate('/app/applications', { replace: true })
      } catch (err) {
        setError(err.message || 'OAuth failed. Please try again.')
      }
    })()
  }, [params, loginOAuth, navigate])

  return (
    <div className={styles.page}>
      <div className={styles.bgBlob1} />
      <div className={styles.bgBlob2} />
      <div className={styles.bgBlob3} />
      <div className={styles.card}>
        <span className={styles.logo}>KeyAuth</span>
        <p className={styles.subtitle}>
          {error ? 'Đăng nhập thất bại' : 'Đang xác thực tài khoản...'}
        </p>
        {error ? (
          <>
            <div className={styles.errorBox}>{error}</div>
            <button className={styles.submitBtn} onClick={() => navigate('/login')}>
              Quay lại đăng nhập
            </button>
          </>
        ) : (
          <div className={styles.spinner} />
        )}
      </div>
    </div>
  )
}
