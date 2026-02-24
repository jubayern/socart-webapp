'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, ShoppingCart, Package, User, Bell } from 'lucide-react'
import { api, getTelegramUser } from '../lib/api'

const TABS = [
  { href: '/',          Icon: Home,         label: 'Home'     },
  { href: '/cart',      Icon: ShoppingCart, label: 'Cart'     },
  { href: '/orders',    Icon: Package,      label: 'Orders'   },
  { href: '/notifications', Icon: Bell,     label: 'Alerts'   },
  { href: '/profile',   Icon: User,         label: 'Profile'  },
]

export default function BottomNav() {
  const path = usePathname()
  const [cartCount, setCartCount]   = useState(0)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    const u = getTelegramUser()
    if (!u) return
    api.get(`/api/cart/${u.id}`).then(r => setCartCount(r.data.length || 0)).catch(() => {})
    api.get('/api/notifications/unread-count').then(r => setNotifCount(r.data.count || 0)).catch(() => {})
  }, [path])

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#ffffff',
      borderTop: '1px solid #f1f5f9',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
    }}>
      {TABS.map(({ href, Icon, label }) => {
        const active = path === href || (href !== '/' && path.startsWith(href))
        const badge  = href === '/cart' ? cartCount : href === '/notifications' ? notifCount : 0
        return (
          <Link key={href} href={href} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '10px 0 12px', gap: 3,
            color: active ? '#6d28d9' : '#94a3b8',
            textDecoration: 'none', position: 'relative',
          }}>
            {active && (
              <span style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 24, height: 2.5, borderRadius: 99,
                background: '#6d28d9',
              }} />
            )}
            <div style={{ position: 'relative' }}>
              <Icon size={21} strokeWidth={active ? 2.3 : 1.7} />
              {badge > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -7,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#ef4444', color: 'white',
                  fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
