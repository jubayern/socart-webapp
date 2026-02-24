'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Trash2, ShoppingCart, Package, ArrowRight } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart]     = useState<any[]>([])
  const [user, setUser]     = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    const u = getTelegramUser()
    setUser(u)
    api.get('/api/admin/settings/public')
      .then(r => setSettings(r.data)).catch(() => {})
    if (u) {
      api.get(`/api/cart/${u.id}`)
        .then(r => { setCart(r.data); setLoading(false) })
        .catch(() => setLoading(false))
    } else setLoading(false)
  }, [])

  const remove = async (productId: string) => {
    if (!user) return
    await api.delete(`/api/cart/remove/${user.id}/${productId}`)
    setCart(c => c.filter(i => i.product_id !== productId))
  }

  const subtotal    = cart.reduce((s, i) => s + i.quantity * parseFloat(i.products.price), 0)
  const delCharge   = parseFloat(settings.delivery_charge || 60)
  const freeAbove   = parseFloat(settings.free_delivery_above || 1000)
  const delivery    = subtotal >= freeAbove ? 0 : delCharge
  const total       = subtotal + delivery

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-bg">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-slate-50">
          <ChevronLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="font-semibold text-slate-800">Cart ({cart.length})</h1>
      </header>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 px-8 text-center">
          <ShoppingCart size={56} strokeWidth={1.1} className="text-slate-200 mb-4" />
          <p className="font-semibold text-slate-600">Your cart is empty</p>
          <p className="text-sm mt-1 mb-5">Add products to get started</p>
          <Link href="/" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {/* Cart Items */}
          {cart.map((item: any) => (
            <div key={item.id} className="bg-white rounded-2xl p-3 flex gap-3 border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                {item.products?.images?.[0]
                  ? <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <Package size={24} className="text-slate-200" />
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-700 text-sm line-clamp-2">{item.products?.name}</p>
                <p className="text-blue-600 font-bold text-sm mt-1">৳{item.products?.price}</p>
                <p className="text-slate-400 text-xs mt-0.5">Qty: {item.quantity}</p>
                <p className="text-slate-700 font-semibold text-sm">
                  Subtotal: ৳{(item.quantity * parseFloat(item.products?.price)).toFixed(0)}
                </p>
              </div>
              <button
                onClick={() => remove(item.product_id)}
                className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl self-start"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Products</span>
                <span className="font-medium">৳{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery</span>
                <span className={`font-medium ${delivery === 0 ? 'text-green-600' : ''}`}>
                  {delivery === 0 ? 'Free' : `৳${delivery}`}
                </span>
              </div>
              {subtotal < freeAbove && (
                <p className="text-xs text-green-600 bg-green-50 px-2 py-1.5 rounded-lg">
                  Add ৳{(freeAbove - subtotal).toFixed(0)} more for free delivery!
                </p>
              )}
              <div className="h-px bg-slate-100 my-1" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-blue-600">৳{total.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-base shadow-sm"
          >
            Proceed to Checkout
            <ArrowRight size={18} />
          </Link>
        </div>
      )}

      <BottomNav cartCount={cart.length} />
    </div>
  )
}
