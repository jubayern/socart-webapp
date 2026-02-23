'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin, CreditCard, Tag, ArrowRight, Banknote } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'

const PAYMENT_METHODS = [
  { id: 'cod',    label: 'Cash on Delivery', Icon: Banknote   },
  { id: 'bkash',  label: 'bKash',            Icon: CreditCard },
  { id: 'nagad',  label: 'Nagad',            Icon: CreditCard },
  { id: 'rocket', label: 'Rocket',           Icon: CreditCard },
]

export default function CheckoutPage() {
  const router = useRouter()
  const [user, setUser]     = useState<any>(null)
  const [cart, setCart]     = useState<any[]>([])
  const [settings, setSettings] = useState<any>({})
  const [placing, setPlacing]   = useState(false)
  const [couponMsg, setCouponMsg] = useState('')

  const [form, setForm] = useState({
    name: '', phone: '', address: '', area: '', note: '',
    payment: 'cod', paymentNumber: '', paymentTrx: '', coupon: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    const u = getTelegramUser()
    setUser(u)
    if (u) {
      set('name', `${u.first_name} ${u.last_name || ''}`.trim())
      api.get(`/api/cart/${u.id}`).then(r => setCart(r.data)).catch(() => {})
    }
    api.get('/api/admin/settings?secret=socart_admin_2024')
      .then(r => setSettings(r.data)).catch(() => {})
  }, [])

  const subtotal  = cart.reduce((s, i) => s + i.quantity * parseFloat(i.products?.price || 0), 0)
  const delCharge = parseFloat(settings.delivery_charge || 60)
  const freeAbove = parseFloat(settings.free_delivery_above || 1000)
  const delivery  = subtotal >= freeAbove ? 0 : delCharge
  const total     = subtotal + delivery

  const placeOrder = async () => {
    if (!user) return
    if (!form.name || !form.phone || !form.address || !form.area) {
      alert('Please fill all required fields')
      return
    }
    if (form.payment !== 'cod' && !form.paymentNumber) {
      alert('Please enter your payment number')
      return
    }
    setPlacing(true)
    try {
      const r = await api.post('/api/orders/create', {
        telegram_id:      user.id,
        payment_method:   form.payment,
        payment_number:   form.paymentNumber || null,
        payment_trx:      form.paymentTrx || null,
        delivery_name:    form.name,
        delivery_phone:   form.phone,
        delivery_address: form.address,
        delivery_area:    form.area,
        note:             form.note || null,
        coupon_code:      form.coupon || null,
      })
      router.push(`/order-success?order=${r.data.order_number}`)
    } catch {
      alert('Something went wrong. Please try again.')
    }
    setPlacing(false)
  }

  return (
    <div className="min-h-screen bg-bg pb-32">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-slate-50">
          <ChevronLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="font-semibold text-slate-800">Checkout</h1>
      </header>

      <div className="px-4 py-4 space-y-4">

        {/* Delivery Info */}
        <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-blue-600" />
            <h2 className="font-semibold text-slate-800">Delivery Details</h2>
          </div>
          <div className="space-y-2.5">
            {[
              { key: 'name',    placeholder: 'Full Name *',       type: 'text' },
              { key: 'phone',   placeholder: 'Phone Number *',    type: 'tel'  },
              { key: 'area',    placeholder: 'District / Area *', type: 'text' },
            ].map(f => (
              <input
                key={f.key}
                type={f.type}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => set(f.key, e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              />
            ))}
            <textarea
              placeholder="Full Address *"
              rows={2}
              value={form.address}
              onChange={e => set('address', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
            />
            <input
              placeholder="Special instructions (optional)"
              value={form.note}
              onChange={e => set('note', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </section>

        {/* Payment */}
        <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-blue-600" />
            <h2 className="font-semibold text-slate-800">Payment Method</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => set('payment', id)}
                className={`py-3 px-3 rounded-xl border-2 text-sm font-medium flex items-center gap-2 transition
                  ${form.payment === id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600'
                  }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {form.payment !== 'cod' && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-amber-700">
                Send money to:{' '}
                {form.payment === 'bkash'  && (settings.bkash_number  || 'Not set')}
                {form.payment === 'nagad'  && (settings.nagad_number  || 'Not set')}
                {form.payment === 'rocket' && (settings.rocket_number || 'Not set')}
              </p>
              <p className="text-xs text-amber-600">After sending, fill in the details below</p>
              <input
                placeholder="Your payment number *"
                value={form.paymentNumber}
                onChange={e => set('paymentNumber', e.target.value)}
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
              />
              <input
                placeholder="Transaction ID *"
                value={form.paymentTrx}
                onChange={e => set('paymentTrx', e.target.value)}
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm outline-none bg-white"
              />
            </div>
          )}
        </section>

        {/* Coupon */}
        <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-blue-600" />
            <h2 className="font-semibold text-slate-800">Coupon Code</h2>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Enter coupon code"
              value={form.coupon}
              onChange={e => set('coupon', e.target.value.toUpperCase())}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 uppercase"
            />
            <button
              onClick={() => form.coupon && setCouponMsg('Coupon will be applied at checkout')}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
            >
              Apply
            </button>
          </div>
          {couponMsg && <p className="text-xs text-green-600 mt-1.5">{couponMsg}</p>}
        </section>

        {/* Summary */}
        <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Products ({cart.length})</span>
              <span className="font-medium">৳{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery</span>
              <span className={`font-medium ${delivery === 0 ? 'text-green-600' : ''}`}>
                {delivery === 0 ? 'Free' : `৳${delivery}`}
              </span>
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-blue-600">৳{total.toFixed(0)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Place Order */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4">
        <button
          onClick={placeOrder}
          disabled={placing}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:bg-slate-300"
        >
          {placing ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing order...</>
          ) : (
            <>Place Order — ৳{total.toFixed(0)} <ArrowRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  )
}
