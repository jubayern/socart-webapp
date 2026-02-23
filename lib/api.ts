import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://socart-backend.up.railway.app',
})

export const getTelegramUser = (): any | null => {
  if (typeof window === 'undefined') return null
  const tg = (window as any).Telegram?.WebApp
  if (!tg) return null
  tg.ready()
  tg.expand()
  return tg.initDataUnsafe?.user || null
}
