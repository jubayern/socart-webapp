'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Search, Package, Clock, CheckCircle, Truck, XCircle, ShoppingBag } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

const STATUS_CONFIG: Record<string, { label: string; Icon: any; color: string; bg: string }> = {
  pending:    { label: 'Order Placed',  Icon: Clock,        color: 'text-amber-600',  bg: 'bg-amber-100'  },
  confirmed:  { label: 'Confirmed',     Icon: CheckCircle,  color: 'text-blue-600',   bg: 'bg-blue-100'   },
  processing: { label: 'Processing',   Icon: Package,      color: 'text-purple-600', bg: 'bg-purple-100' },
  shipped:    { label: 'Shipped',       Icon: Truck,        color: 'text-orange-600', bg: 'bg-orange-100' },
  delivered:  { label: 'Delivered',    Icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-100'  },
  cancelled:  { label: 'Cancelled',    Icon: XCircle,      color: 'text-rose-600',   bg: 'bg-rose-100'   },
}

const ALL_STATUSES = ['pending','confirmed','processing','shipped','delivered']

export default function OrderTrackingPage() {
  const router = useRouter()
  const [user, setUser]           = useState<any>(null)
  const [orderNum, setOrderNum]   = useState('')
  const [data, setData]           = useState<any>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    setUser(getTelegramUser())
    // URL এ ?order=SC123456 থাকলে auto-fill
    const params = new URLSearchParams(window.location.search)
    const o = params.get('order')
    if (o) setOrderNum(o)
  }, [])

  const track = async () => {
    if (!orderNum.trim() || !user) return
    setLoading(true)
    setError('')
    setData(null)
    try {
      const r = await api.get(`/api/orders/track/${orderNum.toUpperCase()}?telegram_id=${user.id}`)
      setData(r.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Order not found')
    }
    setLoading(false)
  }

  const order   = data?.order
  const history = data?.history || []

  // Current step index
  const currentIdx = order ? ALL_STATUSES.indexOf(order.status) : -1

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-slate-50">
          <ChevronLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="font-semibold text-slate-800">Track Order</h1>
      </header>

      <div className="px-4 py-4 space-y-4">

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-sm font-medium text-slate-700 mb-3">Enter your order number</p>
          <div className="flex gap-2">
            <input
              value={orderNum}
              onChange={e => setOrderNum(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && track()}
              placeholder="e.g. SC123456"
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 font-mono uppercase"
            />
            <button onClick={track} disabled={loading || !orderNum}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search size={15} />}
              Track
            </button>
          </div>
          {error && <p className="text-rose-500 text-xs mt-2">{error}</p>}
        </div>

        {/* Result */}
        {order && (
          <>
            {/* Order Info */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-slate-900 text-lg">{order.order_number}</p>
                  <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_CONFIG[order.status]?.bg} ${STATUS_CONFIG[order.status]?.color}`}>
                  {STATUS_CONFIG[order.status]?.label}
                </span>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="text-slate-400">Delivery to:</span> <span className="font-medium">{order.delivery_name}</span></p>
                <p><span className="text-slate-400">Total:</span> <span className="font-bold text-blue-600">৳{parseFloat(order.total_amount).toFixed(0)}</span></p>
                <p><span className="text-slate-400">Payment:</span> <span className="uppercase font-medium">{order.payment_method}</span></p>
              </div>
            </div>

            {/* Timeline */}
            {order.status !== 'cancelled' && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Order Progress</h3>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100" />
                  <div
                    className="absolute left-4 top-4 w-0.5 bg-blue-500 transition-all"
                    style={{ height: `${Math.max(0, (currentIdx / (ALL_STATUSES.length - 1))) * 100}%` }}
                  />

                  <div className="space-y-6">
                    {ALL_STATUSES.map((status, idx) => {
                      const cfg      = STATUS_CONFIG[status]
                      const done     = idx <= currentIdx
                      const current  = idx === currentIdx
                      const histItem = history.find((h: any) => h.status === status)

                      return (
                        <div key={status} className="flex items-start gap-4 relative">
                          {/* Circle */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition
                            ${done ? (current ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-blue-600') : 'bg-slate-100'}`}>
                            <cfg.Icon size={15} className={done ? 'text-white' : 'text-slate-400'} />
                          </div>
                          {/* Content */}
                          <div className="flex-1 pb-2">
                            <p className={`font-semibold text-sm ${done ? 'text-slate-800' : 'text-slate-400'}`}>
                              {cfg.label}
                            </p>
                            {histItem && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                {new Date(histItem.created_at).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                                {histItem.note && histItem.note !== cfg.label && ` · ${histItem.note}`}
                              </p>
                            )}
                            {!histItem && !done && (
                              <p className="text-xs text-slate-300 mt-0.5">Pending</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-3">Items</h3>
              <div className="space-y-3">
                {order.order_items?.map((i: any) => (
                  <div key={i.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                      {i.product_image
                        ? <img src={i.product_image} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-slate-200" /></div>
                      }
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{i.product_name}</p>
                      {i.selected_variant && (
                        <p className="text-xs text-slate-400">
                          {Object.entries(i.selected_variant).map(([k,v]) => `${k}: ${v}`).join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">x{i.quantity}</p>
                      <p className="text-sm font-semibold">৳{(i.price * i.quantity).toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
