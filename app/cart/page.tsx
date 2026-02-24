'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Trash2, ShoppingCart, Package, Tag, Truck, ArrowRight, Plus, Minus } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart]       = useState<any[]>([])
  const [user, setUser]       = useState<any>(null)
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [coupon, setCoupon]   = useState('')
  const [couponData, setCouponData] = useState<any>(null)
  const [couponErr, setCouponErr]   = useState('')
  const [refCode, setRefCode] = useState('')
  const [refData, setRefData] = useState<any>(null)
  const [refErr, setRefErr]   = useState('')
  const [refBalance, setRefBalance] = useState(0)
  const [useRefBalance, setUseRefBalance] = useState(false)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  useEffect(() => {
    const u = getTelegramUser(); setUser(u)
    api.get('/api/admin/settings/public').then(r => setSettings(r.data)).catch(()=>{})
    if (u) {
      api.get(`/api/cart/${u.id}`).then(r => { setCart(r.data); setLoading(false) }).catch(()=>setLoading(false))
      api.get('/api/referral/info').then(r => setRefBalance(r.data.referral_balance||0)).catch(()=>{})
    } else setLoading(false)
  }, [])

  const remove = async (productId: string) => {
    if (!user) return
    await api.delete(`/api/cart/remove/${user.id}/${productId}`)
    setCart(c => c.filter(i => i.product_id !== productId))
  }

  const updateQty = async (productId: string, qty: number) => {
    if (!user || qty < 1) return
    await api.put(`/api/cart/update`, { telegram_id: user.id, product_id: productId, quantity: qty }).catch(()=>{})
    setCart(c => c.map(i => i.product_id === productId ? {...i, quantity: qty} : i))
  }

  const applyCoupon = async () => {
    if (!coupon.trim()) return
    setApplyingCoupon(true); setCouponErr(''); setCouponData(null)
    try {
      const r = await api.post('/api/cart/validate-coupon', { code: coupon.toUpperCase(), subtotal })
      setCouponData(r.data)
    } catch (e: any) { setCouponErr(e?.response?.data?.detail || 'Invalid coupon') }
    setApplyingCoupon(false)
  }

  const subtotal    = cart.reduce((s, i) => s + i.quantity * parseFloat(i.products?.price || 0), 0)
  const delCharge   = parseFloat(settings.delivery_charge || 60)
  const freeAbove   = parseFloat(settings.free_delivery_above || 1000)
  const freeDeliv   = subtotal >= freeAbove || couponData?.type === 'free_delivery'
  const delivery    = freeDeliv ? 0 : delCharge
  const couponDisc  = couponData?.discount || 0
  const refDisc     = useRefBalance ? Math.min(refBalance, subtotal * 0.5) : 0
  const total       = Math.max(0, subtotal + delivery - couponDisc - refDisc)
  const toFree      = freeAbove - subtotal

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><div style={{ width:28, height:28, borderRadius:'50%', border:'3px solid #ede9fe', borderTopColor:'#7c3aed', animation:'spin 1s linear infinite' }}/></div>

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', paddingBottom:90 }}>
      <header style={{ position:'sticky', top:0, zIndex:40, background:'white', borderBottom:'1px solid #f1f5f9', height:52, display:'flex', alignItems:'center', gap:10, padding:'0 14px' }}>
        <button onClick={() => router.back()} style={{ width:34, height:34, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <ChevronLeft size={18} color="#0f172a"/>
        </button>
        <p style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>My Cart</p>
        <span style={{ marginLeft:'auto', fontSize:12, color:'#64748b' }}>{cart.length} items</span>
      </header>

      {cart.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', textAlign:'center' }}>
          <div style={{ width:70, height:70, borderRadius:22, background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}><ShoppingCart size={32} color="#7c3aed"/></div>
          <p style={{ fontWeight:800, fontSize:17, color:'#0f172a', marginBottom:6 }}>Cart is Empty</p>
          <p style={{ fontSize:13, color:'#94a3b8', marginBottom:20 }}>Add some products to get started</p>
          <Link href="/" style={{ padding:'12px 28px', borderRadius:13, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontWeight:700, fontSize:13, textDecoration:'none' }}>Browse Products</Link>
        </div>
      ) : (
        <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>

          {/* Free delivery progress */}
          {!freeDeliv && toFree > 0 && (
            <div style={{ background:'white', borderRadius:16, padding:14, border:'1px solid #f1f5f9' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <Truck size={15} color="#7c3aed"/>
                <p style={{ fontSize:12, fontWeight:700, color:'#0f172a' }}>Add ৳{toFree.toFixed(0)} more for <span style={{ color:'#10b981' }}>FREE delivery</span></p>
              </div>
              <div style={{ height:5, background:'#f1f5f9', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(100,(subtotal/freeAbove)*100)}%`, background:'linear-gradient(90deg,#7c3aed,#10b981)', borderRadius:99, transition:'width .4s' }}/>
              </div>
            </div>
          )}
          {freeDeliv && <div style={{ background:'#dcfce7', borderRadius:14, padding:'10px 14px', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', gap:7 }}><Truck size={15} color="#16a34a"/><p style={{ fontSize:12, fontWeight:700, color:'#16a34a' }}>🎉 You got FREE delivery!</p></div>}

          {/* Items */}
          <div style={{ background:'white', borderRadius:18, border:'1px solid #f1f5f9', overflow:'hidden' }}>
            {cart.map((item:any, idx:number) => {
              const pr = item.products
              return (
                <div key={item.id||idx} style={{ display:'flex', gap:12, padding:'13px 14px', borderBottom: idx<cart.length-1?'1px solid #f1f5f9':'none' }}>
                  <div onClick={() => router.push(`/product/${item.product_id}`)} style={{ width:62, height:62, borderRadius:12, overflow:'hidden', flexShrink:0, background:'#f8fafc', cursor:'pointer' }}>
                    {pr?.images?.[0] ? <img src={pr.images[0]} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={20} color="#e2e8f0"/></div>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }} className="line-clamp-2">{pr?.name}</p>
                    {item.selected_variant && <p style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{Object.entries(item.selected_variant).map(([k,v])=>`${k}: ${v}`).join(' · ')}</p>}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8 }}>
                      <span style={{ fontSize:15, fontWeight:800, color:'#7c3aed' }}>৳{(parseFloat(pr?.price||0)*item.quantity).toFixed(0)}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <button onClick={() => updateQty(item.product_id, item.quantity-1)} style={{ width:26, height:26, borderRadius:7, border:'1.5px solid #e2e8f0', background:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Minus size={12} color="#64748b"/></button>
                        <span style={{ fontSize:13, fontWeight:700, minWidth:18, textAlign:'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.product_id, item.quantity+1)} style={{ width:26, height:26, borderRadius:7, border:'1.5px solid #e2e8f0', background:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Plus size={12} color="#64748b"/></button>
                        <button onClick={() => remove(item.product_id)} style={{ width:26, height:26, borderRadius:7, background:'#fee2e2', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><Trash2 size={12} color="#dc2626"/></button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Coupon */}
          <div style={{ background:'white', borderRadius:18, padding:14, border:'1px solid #f1f5f9' }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}><Tag size={14} color="#7c3aed"/>Apply Coupon</p>
            <div style={{ display:'flex', gap:8 }}>
              <input value={coupon} onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponData(null); setCouponErr('') }} placeholder="COUPON CODE" style={{ flex:1, padding:'10px 14px', borderRadius:11, border:`1.5px solid ${couponData?'#10b981':couponErr?'#ef4444':'#e2e8f0'}`, fontSize:13, fontFamily:'monospace', fontWeight:700, letterSpacing:'0.1em', color:'#0f172a', outline:'none' }}/>
              <button onClick={applyCoupon} disabled={applyingCoupon||!coupon} style={{ padding:'10px 18px', borderRadius:11, border:'none', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontWeight:700, fontSize:13, cursor:'pointer', opacity:!coupon?0.5:1 }}>
                {applyingCoupon?'...':'Apply'}
              </button>
            </div>
            {couponData && <p style={{ fontSize:12, color:'#10b981', fontWeight:700, marginTop:6 }}>✓ {couponData.message} — saved ৳{couponData.discount}</p>}
            {couponErr && <p style={{ fontSize:12, color:'#ef4444', marginTop:6 }}>{couponErr}</p>}
          </div>

          {/* Referral Balance */}
          {refBalance > 0 && (
            <div style={{ background:'white', borderRadius:16, padding:14, border:'1px solid #f1f5f9' }}>
              <label style={{ display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Use Referral Balance</p>
                  <p style={{ fontSize:12, color:'#64748b' }}>৳{refBalance.toFixed(2)} available</p>
                </div>
                <div style={{ position:'relative', width:46, height:26 }}>
                  <input type="checkbox" checked={useRefBalance} onChange={e => setUseRefBalance(e.target.checked)} style={{ opacity:0, width:0, height:0 }}/>
                  <div onClick={() => setUseRefBalance(v=>!v)} style={{ position:'absolute', inset:0, borderRadius:99, background: useRefBalance?'#7c3aed':'#e2e8f0', cursor:'pointer', transition:'background .2s' }}>
                    <div style={{ position:'absolute', top:3, left: useRefBalance?22:3, width:20, height:20, borderRadius:'50%', background:'white', transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,.2)' }}/>
                  </div>
                </div>
              </label>
              {useRefBalance && refDisc > 0 && <p style={{ fontSize:12, color:'#7c3aed', fontWeight:700, marginTop:6 }}>−৳{refDisc.toFixed(2)} will be deducted</p>}
            </div>
          )}

          {/* Summary */}
          <div style={{ background:'white', borderRadius:18, padding:16, border:'1px solid #f1f5f9' }}>
            <p style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:12 }}>Order Summary</p>
            {[
              ['Subtotal', `৳${subtotal.toFixed(0)}`],
              ['Delivery', freeDeliv ? '🎉 FREE' : `৳${delivery}`],
              ...(couponDisc > 0 ? [[`Coupon (${coupon})`, `-৳${couponDisc.toFixed(0)}`]] : []),
              ...(refDisc > 0 ? [['Referral Balance', `-৳${refDisc.toFixed(0)}`]] : []),
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
                <span style={{ color:'#64748b' }}>{l}</span>
                <span style={{ fontWeight:600, color: (v as string).startsWith('-')?'#10b981':'#0f172a' }}>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, borderTop:'1.5px solid #f1f5f9' }}>
              <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>Total</span>
              <span style={{ fontWeight:800, fontSize:18, color:'#7c3aed' }}>৳{total.toFixed(0)}</span>
            </div>
          </div>

          <button onClick={() => router.push(`/checkout?coupon=${coupon}&useRef=${useRefBalance}`)} style={{ width:'100%', padding:'15px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontWeight:800, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 18px rgba(109,40,217,.3)' }}>
            Proceed to Checkout <ArrowRight size={17}/>
          </button>
        </div>
      )}
      <BottomNav/>
    </div>
  )
}
