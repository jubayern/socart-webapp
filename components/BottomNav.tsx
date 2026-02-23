'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Package, User } from 'lucide-react'

const tabs = [
  { href: '/',        label: 'Home',    Icon: Home        },
  { href: '/cart',    label: 'Cart',    Icon: ShoppingBag },
  { href: '/orders',  label: 'Orders',  Icon: Package     },
  { href: '/profile', label: 'Profile', Icon: User        },
]

export default function BottomNav({ cartCount = 0 }: { cartCount?: number }) {
  const path = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50">
      <div className="flex">
        {tabs.map(({ href, label, Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative
                ${active ? 'text-blue-600' : 'text-slate-400'}`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {href === '/cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                {label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-b-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
