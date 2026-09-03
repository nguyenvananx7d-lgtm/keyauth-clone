import { api } from '../api/client'

export async function startOAuth(provider) {
  try {
    const { url } = await api.oauthStart(provider)
    window.location.href = url
  } catch (err) {
    throw new Error(err.message || 'Không thể bắt đầu đăng nhập.')
  }
}
