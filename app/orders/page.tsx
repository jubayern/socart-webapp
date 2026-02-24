'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Package, ShoppingBag, Clock, CheckCircle, Truck, XCircle, MapPin } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

const STATUS: Record<string, { label: string; color: string; Icon: any }> = {
  pending:    { label: 'Pending',    color: 'text-amber-600 bg-amber-50',   Icon: Clock       },
  confirmed:  { label: 'Confirmed',  color: 'text-blue-600 bg-blue-50',     Icon: CheckCircle },
  processing: { label: 'Processing', color: 'text-purple-600 bg-purple-50', Icon: Package     },
  shipped:    { label: 'Shipped',    color: 'text-orange-600 bg-orange-50', Icon: Truck       },
  delivered:  { label: 'Delivered',  color: 'text-green-600 bg-green-50',   Icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'text-rose-600 bg-rose-50',     Icon: XCircle     },
}

export default function OrdersPage() {
  const router   = useRouter()
  const [orders, setOrders]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = getTelegramUser()
    if (u) {
      api.get(`/api/orders/user/${u.id}`)
        .then(r => { setOrders(r.data); setLoading(false) })
        .catch(() => setLoading(false))
    } else setLoading(false)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-bg">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-slate-50">
            <ChevronLeft size={20} className="text-slate-700" />
          </button>
          <h1 className="font-semibold text-slate-800">My Orders</h1>
        </div>
        <Link href="/order-tracking" className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
          <MapPin size={14} /> Track
        </Link>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 text-center px-8">
          <Package size={56} strokeWidth={1.1} className="text-slate-200 mb-4" />
          <p className="font-semibold text-slate-600">No orders yet</p>
          <p className="text-sm mt-1 mb-5">Your orders will appear here</p>
          <Link href="/" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm flex items-center gap-2">
            <ShoppingBag size={15} /> Start Shopping
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {orders.map((o: any) => {
            const s = STATUS[o.status] || STATUS.pending
            return (
              <div key={o.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-800 tracking-wide">{o.order_number}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(o.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>
                    <s.Icon size={11} /> {s.label}
                  </span>
                </div>
                <div className="h-px bg-slate-100 mb-3" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{o.order_items?.length} item(s)</p>
                    <p className="text-xs text-slate-400 mt-0.5 uppercase">{o.payment_method}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/order-tracking?order=${o.order_number}`}
                      className="text-xs text-blue-600 font-medium flex items-center gap-1">
                      <MapPin size={11} /> Track
                    </Link>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total</p>
                      <p className="font-bold text-blue-600">৳{parseFloat(o.total_amount).toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
