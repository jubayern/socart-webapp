import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://socart-backend-production.up.railway.app',
})

api.interceptors.request.use(cfg => {
  if (typeof window !== 'undefined') {
    const tg = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
    if (tg?.id) {
      cfg.headers['X-Telegram-Id'] = String(tg.id)
    }
  }
  return cfg
})

export function getTelegramUser(): any | null {
  if (typeof window === 'undefined') return null
  const tg = (window as any).Telegram?.WebApp
  if (!tg?.initDataUnsafe?.user) return null
  return tg.initDataUnsafe.user
}

export function getTg(): any {
  if (typeof window === 'undefined') return null
  return (window as any).Telegram?.WebApp
}
