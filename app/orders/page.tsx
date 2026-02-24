'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Package, RotateCcw, ChevronRight, Download, AlertCircle } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

const STATUS_CFG: Record<string,{label:string,bg:string,c:string}> = {
  pending:    { label:'Pending',    bg:'#fef3c7', c:'#d97706' },
  confirmed:  { label:'Confirmed',  bg:'#dbeafe', c:'#2563eb' },
  processing: { label:'Processing', bg:'#ede9fe', c:'#7c3aed' },
  shipped:    { label:'Shipped',    bg:'#fed7aa', c:'#ea580c' },
  delivered:  { label:'Delivered',  bg:'#dcfce7', c:'#16a34a' },
  cancelled:  { label:'Cancelled',  bg:'#fee2e2', c:'#dc2626' },
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sel, setSel]         = useState<any>(null)
  const [returnForm, setReturnForm] = useState<any>(null)
  const [returning, setReturning]   = useState(false)

  useEffect(() => {
    const u = getTelegramUser()
    if (!u) return
    api.get(`/api/orders/user/${u.id}`).then(r => { setOrders(r.data); setLoading(false) }).catch(()=>setLoading(false))
  }, [])

  const reorder = async (order: any) => {
    const u = getTelegramUser()
    if (!u) return
    try {
      for (const item of order.order_items||[]) {
        await api.post('/api/cart/add', { telegram_id: u.id, product_id: item.product_id, quantity: item.quantity }).catch(()=>{})
      }
      router.push('/cart')
    } catch {}
  }

  const submitReturn = async () => {
    if (!returnForm?.reason) return
    setReturning(true)
    try {
      await api.post(`/api/orders/${returnForm.order_id}/return`, { reason: returnForm.reason, details: returnForm.details, refund_method: returnForm.refund_method||'bkash' })
      alert('✅ Return request submitted!')
      setReturnForm(null)
    } catch (e:any) { alert(e?.response?.data?.detail||'Failed') }
    setReturning(false)
  }

  const iS: React.CSSProperties = { width:'100%', padding:'11px 14px', borderRadius:11, border:'1.5px solid #e2e8f0', fontSize:13, color:'#0f172a', outline:'none', fontFamily:'DM Sans, sans-serif' }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', paddingBottom:80 }}>
      <header style={{ position:'sticky', top:0, zIndex:40, background:'white', borderBottom:'1px solid #f1f5f9', height:52, display:'flex', alignItems:'center', padding:'0 14px', gap:10 }}>
        <button onClick={() => router.back()} style={{ width:34, height:34, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><ChevronLeft size={18} color="#0f172a"/></button>
        <p style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>My Orders</p>
      </header>

      <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}><div style={{ width:28, height:28, borderRadius:'50%', border:'3px solid #ede9fe', borderTopColor:'#7c3aed', animation:'spin 1s linear infinite' }}/></div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:60 }}>
            <Package size={44} color="#e2e8f0" style={{ margin:'0 auto 12px' }}/>
            <p style={{ fontWeight:800, fontSize:16, color:'#0f172a', marginBottom:6 }}>No orders yet</p>
            <p style={{ fontSize:13, color:'#94a3b8', marginBottom:20 }}>Start shopping to see your orders</p>
            <button onClick={() => router.push('/')} style={{ padding:'11px 24px', borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', color:'white', fontWeight:700, fontSize:13, cursor:'pointer' }}>Shop Now</button>
          </div>
        ) : orders.map((o:any) => {
          const st = STATUS_CFG[o.status]||STATUS_CFG.pending
          return (
            <div key={o.id} style={{ background:'white', borderRadius:18, border:'1px solid #f1f5f9', overflow:'hidden' }}>
              <div onClick={() => router.push(`/order-tracking?order=${o.order_number}`)} style={{ padding:'13px 14px', cursor:'pointer' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <p style={{ fontWeight:800, fontSize:13, color:'#0f172a', fontFamily:'monospace' }}>{o.order_number}</p>
                  <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:99, background:st.bg, color:st.c }}>{st.label}</span>
                </div>
                <p style={{ fontSize:11, color:'#94a3b8', marginBottom:8 }}>{new Date(o.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</p>
                <div style={{ display:'flex', gap:6, marginBottom:8 }}>
                  {o.order_items?.slice(0,3).map((item:any,i:number) => (
                    <div key={i} style={{ width:44, height:44, borderRadius:10, overflow:'hidden', background:'#f8fafc', flexShrink:0 }}>
                      {item.product_image ? <img src={item.product_image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={16} color="#e2e8f0"/></div>}
                    </div>
                  ))}
                  {(o.order_items?.length||0) > 3 && <div style={{ width:44, height:44, borderRadius:10, background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#64748b' }}>+{o.order_items.length-3}</div>}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:15, fontWeight:800, color:'#7c3aed' }}>৳{parseFloat(o.total_amount).toFixed(0)}</span>
                  {o.coins_earned > 0 && <span style={{ fontSize:11, fontWeight:700, color:'#d97706' }}>🪙 +{o.coins_earned} coins</span>}
                  <ChevronRight size={14} color="#94a3b8"/>
                </div>
              </div>
              {/* Actions */}
              <div style={{ display:'flex', borderTop:'1px solid #f8fafc' }}>
                <button onClick={() => reorder(o)} style={{ flex:1, padding:'10px', border:'none', background:'transparent', color:'#7c3aed', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                  <RotateCcw size={13}/> Reorder
                </button>
                {o.status === 'delivered' && (
                  <button onClick={() => setReturnForm({ order_id:o.id, reason:'', details:'', refund_method:'bkash' })} style={{ flex:1, padding:'10px', border:'none', background:'transparent', color:'#ef4444', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5, borderLeft:'1px solid #f8fafc' }}>
                    <AlertCircle size={13}/> Return
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Return Sheet */}
      {returnForm && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.6)' }} onClick={() => setReturnForm(null)}/>
          <div className="anim-slideup" style={{ position:'relative', width:'100%', background:'white', borderRadius:'20px 20px 0 0', padding:'16px 16px 32px' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}><div style={{ width:34, height:3, borderRadius:99, background:'#e2e8f0' }}/></div>
            <p style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:14 }}>Return Request</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <select value={returnForm.reason} onChange={e => setReturnForm((f:any)=>({...f,reason:e.target.value}))} style={iS}>
                <option value="">Select reason *</option>
                <option value="damaged">Item damaged</option>
                <option value="wrong_item">Wrong item received</option>
                <option value="not_as_described">Not as described</option>
                <option value="changed_mind">Changed my mind</option>
                <option value="other">Other</option>
              </select>
              <textarea value={returnForm.details} onChange={e => setReturnForm((f:any)=>({...f,details:e.target.value}))} rows={3} placeholder="Additional details..." style={{ ...iS, resize:'none' }}/>
              <select value={returnForm.refund_method} onChange={e => setReturnForm((f:any)=>({...f,refund_method:e.target.value}))} style={iS}>
                <option value="bkash">Refund via bKash</option>
                <option value="nagad">Refund via Nagad</option>
                <option value="rocket">Refund via Rocket</option>
              </select>
              <button onClick={submitReturn} disabled={returning||!returnForm.reason} style={{ padding:'13px', borderRadius:12, border:'none', background: !returnForm.reason?'#f1f5f9':'linear-gradient(135deg,#ef4444,#dc2626)', color: !returnForm.reason?'#94a3b8':'white', fontWeight:700, fontSize:13, cursor:'pointer', opacity:returning?0.6:1 }}>
                {returning ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}
      <BottomNav/>
    </div>
  )
}
