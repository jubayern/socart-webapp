'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, MapPin, CreditCard, Banknote, Plus, Check, Calendar, Gift, FileText } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'

const PAYMENT_METHODS = [
  { id:'cod',    label:'Cash on Delivery', icon:'💵' },
  { id:'bkash',  label:'bKash',            icon:'📱' },
  { id:'nagad',  label:'Nagad',            icon:'📱' },
  { id:'rocket', label:'Rocket',           icon:'📱' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const [user, setUser]       = useState<any>(null)
  const [cart, setCart]       = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [settings, setSettings]   = useState<any>({})
  const [refBalance, setRefBalance] = useState(0)
  const [placing, setPlacing] = useState(false)

  const [form, setForm] = useState({
    name:'', phone:'', address:'', area:'', note:'',
    schedule_date:'', gift_wrap:false,
    payment:'cod', paymentNumber:'', paymentTrx:'',
    coupon: sp?.get('coupon')||'',
    use_ref_balance: sp?.get('useRef')==='true',
  })
  const [couponData, setCouponData] = useState<any>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [showNewAddress, setShowNewAddress] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({...f, [k]:v}))

  useEffect(() => {
    const u = getTelegramUser(); setUser(u)
    if (!u) return
    set('name', `${u.first_name} ${u.last_name||''}`.trim())
    api.get(`/api/cart/${u.id}`).then(r => setCart(r.data)).catch(()=>{})
    api.get('/api/admin/settings/public').then(r => setSettings(r.data)).catch(()=>{})
    api.get('/api/addresses').then(r => {
      setAddresses(r.data)
      const def = r.data.find((a:any)=>a.is_default)
      if (def) { set('name',def.name); set('phone',def.phone); set('address',def.address); set('area',def.area) }
    }).catch(()=>{})
    api.get('/api/referral/info').then(r => setRefBalance(r.data.referral_balance||0)).catch(()=>{})

    if (sp?.get('coupon')) {
      setTimeout(() => validateCoupon(sp.get('coupon')!), 500)
    }
  }, [])

  const validateCoupon = async (code: string) => {
    if (!code) return
    setCouponLoading(true)
    try { const r = await api.post('/api/cart/validate-coupon', { code: code.toUpperCase(), subtotal }); setCouponData(r.data) }
    catch { setCouponData(null) }
    setCouponLoading(false)
  }

  const selectAddress = (a: any) => { set('name',a.name); set('phone',a.phone); set('address',a.address); set('area',a.area) }

  const subtotal   = cart.reduce((s,i) => s + i.quantity * parseFloat(i.products?.price||0), 0)
  const delCharge  = parseFloat(settings.delivery_charge||60)
  const freeAbove  = parseFloat(settings.free_delivery_above||1000)
  const giftCharge = form.gift_wrap ? parseFloat(settings.gift_wrap_charge||30) : 0
  const freeDeliv  = subtotal >= freeAbove || couponData?.type === 'free_delivery'
  const delivery   = freeDeliv ? 0 : delCharge
  const couponDisc = couponData?.discount || 0
  const refDisc    = form.use_ref_balance ? Math.min(refBalance, subtotal*0.5) : 0
  const total      = Math.max(0, subtotal + delivery + giftCharge - couponDisc - refDisc)

  const placeOrder = async () => {
    if (!user) return
    if (!form.name || !form.phone || !form.address || !form.area) { alert('Please fill all required fields'); return }
    if (form.payment !== 'cod' && !form.paymentNumber) { alert('Enter your payment number'); return }
    setPlacing(true)
    try {
      const r = await api.post('/api/orders/create', {
        telegram_id: user.id,
        payment_method: form.payment, payment_number: form.paymentNumber||null, payment_trx: form.paymentTrx||null,
        delivery_name: form.name, delivery_phone: form.phone, delivery_address: form.address, delivery_area: form.area,
        note: form.note||null, coupon_code: form.coupon||null,
        schedule_date: form.schedule_date||null,
        gift_wrapping: form.gift_wrap,
        use_referral_balance: form.use_ref_balance,
      })
      router.push(`/order-success?order=${r.data.order_number}`)
    } catch { alert('Something went wrong. Please try again.') }
    setPlacing(false)
  }

  const iS: React.CSSProperties = { width:'100%', padding:'12px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontSize:13, color:'#0f172a', outline:'none', fontFamily:'DM Sans, sans-serif' }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', paddingBottom:120 }}>
      <header style={{ position:'sticky', top:0, zIndex:40, background:'white', borderBottom:'1px solid #f1f5f9', height:52, display:'flex', alignItems:'center', gap:10, padding:'0 14px' }}>
        <button onClick={() => router.back()} style={{ width:34, height:34, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><ChevronLeft size={18} color="#0f172a"/></button>
        <p style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>Checkout</p>
      </header>

      <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:12 }}>

        {/* Saved Addresses */}
        {addresses.length > 0 && (
          <div style={{ background:'white', borderRadius:18, padding:14, border:'1px solid #f1f5f9' }}>
            <p style={{ fontWeight:700, fontSize:13, color:'#0f172a', marginBottom:10 }}>Saved Addresses</p>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {addresses.map((a:any) => (
                <div key={a.id} onClick={() => selectAddress(a)} style={{ padding:'10px 12px', borderRadius:11, border:`1.5px solid ${form.name===a.name&&form.phone===a.phone?'#7c3aed':'#e2e8f0'}`, background: form.name===a.name&&form.phone===a.phone?'#faf7ff':'white', cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
                  <MapPin size={14} color={form.name===a.name&&form.phone===a.phone?'#7c3aed':'#94a3b8'}/>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:'#0f172a' }}>{a.label} · {a.name}</p>
                    <p style={{ fontSize:11, color:'#64748b' }}>{a.area} · {a.phone}</p>
                  </div>
                  {form.name===a.name&&form.phone===a.phone && <Check size={14} color="#7c3aed"/>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Info */}
        <div style={{ background:'white', borderRadius:18, padding:14, border:'1px solid #f1f5f9' }}>
          <p style={{ fontWeight:700, fontSize:13, color:'#0f172a', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}><MapPin size={14} color="#7c3aed"/>Delivery Information</p>
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            <input value={form.name}    onChange={e=>set('name',e.target.value)}    placeholder="Full Name *"    style={iS}/>
            <input value={form.phone}   onChange={e=>set('phone',e.target.value)}   placeholder="Phone Number *" style={iS} type="tel"/>
            <input value={form.area}    onChange={e=>set('area',e.target.value)}    placeholder="Area / District *" style={iS}/>
            <textarea value={form.address} onChange={e=>set('address',e.target.value)} rows={2} placeholder="Full Address *" style={{ ...iS, resize:'none' }}/>
          </div>
        </div>

        {/* Extra Options */}
        <div style={{ background:'white', borderRadius:18, padding:14, border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:10 }}>
          <p style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>Options</p>
          {/* Schedule */}
          <div>
            <p style={{ fontSize:12, color:'#64748b', marginBottom:6, display:'flex', alignItems:'center', gap:5 }}><Calendar size={12}/>Preferred Delivery Date (optional)</p>
            <input value={form.schedule_date} onChange={e=>set('schedule_date',e.target.value)} type="date" style={iS} min={new Date().toISOString().split('T')[0]}/>
          </div>
          {/* Gift wrap */}
          <label style={{ display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', padding:'10px 12px', borderRadius:11, background:'#faf7ff', border:'1px solid #ede9fe' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Gift size={15} color="#7c3aed"/>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Gift Wrapping</p>
                <p style={{ fontSize:11, color:'#64748b' }}>+৳{settings.gift_wrap_charge||30}</p>
              </div>
            </div>
            <div style={{ position:'relative', width:44, height:24 }} onClick={()=>set('gift_wrap',!form.gift_wrap)}>
              <div style={{ position:'absolute', inset:0, borderRadius:99, background: form.gift_wrap?'#7c3aed':'#e2e8f0', transition:'background .2s' }}>
                <div style={{ position:'absolute', top:2, left: form.gift_wrap?22:2, width:20, height:20, borderRadius:'50%', background:'white', transition:'left .2s' }}/>
              </div>
            </div>
          </label>
          {/* Note */}
          <div>
            <p style={{ fontSize:12, color:'#64748b', marginBottom:6, display:'flex', alignItems:'center', gap:5 }}><FileText size={12}/>Order Note (optional)</p>
            <textarea value={form.note} onChange={e=>set('note',e.target.value)} rows={2} placeholder="Special instructions..." style={{ ...iS, resize:'none' }}/>
          </div>
        </div>

        {/* Referral balance */}
        {refBalance > 0 && (
          <div style={{ background:'white', borderRadius:16, padding:14, border:'1px solid #f1f5f9' }}>
            <label style={{ display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Use Referral Balance</p>
                <p style={{ fontSize:12, color:'#64748b' }}>৳{refBalance.toFixed(2)} available</p>
              </div>
              <div style={{ position:'relative', width:44, height:24 }} onClick={()=>set('use_ref_balance',!form.use_ref_balance)}>
                <div style={{ position:'absolute', inset:0, borderRadius:99, background: form.use_ref_balance?'#10b981':'#e2e8f0', transition:'background .2s' }}>
                  <div style={{ position:'absolute', top:2, left: form.use_ref_balance?22:2, width:20, height:20, borderRadius:'50%', background:'white', transition:'left .2s' }}/>
                </div>
              </div>
            </label>
            {form.use_ref_balance && refDisc > 0 && <p style={{ fontSize:12, color:'#10b981', fontWeight:700, marginTop:6 }}>−৳{refDisc.toFixed(2)} will be applied</p>}
          </div>
        )}

        {/* Payment */}
        <div style={{ background:'white', borderRadius:18, padding:14, border:'1px solid #f1f5f9' }}>
          <p style={{ fontWeight:700, fontSize:13, color:'#0f172a', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}><CreditCard size={14} color="#7c3aed"/>Payment Method</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {PAYMENT_METHODS.map(pm => (
              <div key={pm.id} onClick={()=>set('payment',pm.id)} style={{ padding:'11px 13px', borderRadius:11, border:`1.5px solid ${form.payment===pm.id?'#7c3aed':'#e2e8f0'}`, background: form.payment===pm.id?'#faf7ff':'white', cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18 }}>{pm.icon}</span>
                <p style={{ fontSize:13, fontWeight:700, color:'#0f172a', flex:1 }}>{pm.label}</p>
                {form.payment===pm.id && <Check size={14} color="#7c3aed"/>}
              </div>
            ))}
          </div>
          {form.payment !== 'cod' && (
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:8 }}>
              <input value={form.paymentNumber} onChange={e=>set('paymentNumber',e.target.value)} placeholder={`Your ${form.payment} number *`} style={iS} type="tel"/>
              <input value={form.paymentTrx} onChange={e=>set('paymentTrx',e.target.value)} placeholder="Transaction ID (optional)" style={iS}/>
            </div>
          )}
        </div>

        {/* Summary */}
        <div style={{ background:'white', borderRadius:18, padding:16, border:'1px solid #f1f5f9' }}>
          <p style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:12 }}>Order Summary</p>
          {[
            ['Subtotal', `৳${subtotal.toFixed(0)}`],
            ['Delivery', freeDeliv?'🎉 FREE':`৳${delivery}`],
            ...(giftCharge>0 ? [['Gift Wrap',`৳${giftCharge}`]] : []),
            ...(couponDisc>0 ? [[`Coupon`,`-৳${couponDisc.toFixed(0)}`]] : []),
            ...(refDisc>0 ? [['Ref Balance',`-৳${refDisc.toFixed(0)}`]] : []),
          ].map(([l,v]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
              <span style={{ color:'#64748b' }}>{l}</span>
              <span style={{ fontWeight:600, color:(v as string).startsWith('-')?'#10b981':'#0f172a' }}>{v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, borderTop:'1.5px solid #f1f5f9' }}>
            <span style={{ fontWeight:800, fontSize:15 }}>Total</span>
            <span style={{ fontWeight:800, fontSize:18, color:'#7c3aed' }}>৳{total.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'white', borderTop:'1px solid #f1f5f9', padding:'12px 14px' }}>
        <button onClick={placeOrder} disabled={placing||cart.length===0} style={{ width:'100%', padding:'15px', borderRadius:14, border:'none', background: placing||cart.length===0?'#e2e8f0':'linear-gradient(135deg,#7c3aed,#4f46e5)', color: placing||cart.length===0?'#94a3b8':'white', fontWeight:800, fontSize:15, cursor:'pointer', boxShadow: !placing&&cart.length>0?'0 4px 18px rgba(109,40,217,.3)':undefined }}>
          {placing ? 'Placing Order...' : `Place Order · ৳${total.toFixed(0)}`}
        </button>
      </div>
    </div>
  )
}
