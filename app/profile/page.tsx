'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Package, ShoppingCart, ChevronRight, Hash } from 'lucide-react'
import { getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'
import Link from 'next/link'

export default function ProfilePage() {
  const router  = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => { setUser(getTelegramUser()) }, [])

  const menu = [
    { href: '/orders', label: 'My Orders',  Icon: Package      },
    { href: '/cart',   label: 'My Cart',    Icon: ShoppingCart },
  ]

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3">
        <h1 className="font-semibold text-slate-800">Profile</h1>
      </header>

      {user ? (
        <div className="px-4 py-4 space-y-4">
          {/* User Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {user.first_name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900 text-lg truncate">
                  {user.first_name} {user.last_name || ''}
                </h2>
                {user.username && (
                  <p className="text-slate-400 text-sm">@{user.username}</p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  <Hash size={11} className="text-slate-300" />
                  <p className="text-xs text-slate-300">{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {menu.map(({ href, label, Icon }, i) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-4 active:bg-slate-50
                  ${i < menu.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icon size={16} className="text-blue-600" />
                </div>
                <span className="font-medium text-slate-700 flex-1">{label}</span>
                <ChevronRight size={16} className="text-slate-300" />
              </Link>
            ))}
          </div>

          {/* App Info */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <p className="font-bold text-slate-700">SoCart</p>
            <p className="text-xs text-slate-400 mt-0.5">Version 1.0.0</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 text-center px-8">
          <User size={56} strokeWidth={1.1} className="text-slate-200 mb-4" />
          <p className="font-semibold text-slate-600">Not logged in</p>
          <p className="text-sm mt-1">Please open SoCart via Telegram</p>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
