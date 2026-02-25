'use client'

import { useEffect } from 'react'
import { api, getTelegramUser } from '../lib/api'

export default function InitUser() {
  useEffect(() => {
    const u = getTelegramUser()
    if (!u) return
    api
      .post('/api/users/register', {
        telegram_id: u.id,
        name: `${u.first_name} ${u.last_name || ''}`.trim(),
        username: u.username,
      })
      .catch(() => {})
  }, [])

  return null
}
