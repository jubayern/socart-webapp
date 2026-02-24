'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Package, Home, Coins } from 'lucide-react'
import { api } from '../../lib/api'

export default function OrderSuccessPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const orderNum = sp?.get('order')
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    if (orderNum) api.get(`/api/orders/track/${orderNum}`).then(r => setOrder(r.data?.order)).catch(()=>{})
  }, [orderNum])

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center' }}>
      <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, boxShadow:'0 8px 24px rgba(16,185,129,.3)' }}>
        <CheckCircle size={40} color="white"/>
      </div>
      <h1 style={{ fontSize:24, fontWeight:800, color:'#0f172a', marginBottom:8 }}>Order Placed!</h1>
      <p style={{ fontSize:14, color:'#64748b', marginBottom:6 }}>Thank you for your order 🎉</p>
      {orderNum && <p style={{ fontSize:16, fontWeight:800, color:'#7c3aed', fontFamily:'monospace', marginBottom:16 }}>{orderNum}</p>}

      {order?.coins_earned > 0 && (
        <div style={{ background:'#fef3c7', borderRadius:16, padding:'14px 24px', marginBottom:20, border:'1px solid #fde68a', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:24 }}>🪙</span>
          <div style={{ textAlign:'left' }}>
            <p style={{ fontWeight:800, fontSize:15, color:'#92400e' }}>+{order.coins_earned} Coins Earned!</p>
            <p style={{ fontSize:12, color:'#b45309' }}>Coins added to your account</p>
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:10, width:'100%', maxWidth:300 }}>
        <button onClick={() => router.push(`/order-tracking?order=${orderNum}`)} style={{ flex:1, padding:'13px', borderRadius:13, border:'2px solid #7c3aed', background:'white', color:'#7c3aed', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
          <Package size={15}/> Track
        </button>
        <button onClick={() => router.push('/')} style={{ flex:1, padding:'13px', borderRadius:13, border:'none', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7, boxShadow:'0 4px 14px rgba(109,40,217,.3)' }}>
          <Home size={15}/> Home
        </button>
      </div>
    </div>
  )
}
