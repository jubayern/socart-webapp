'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Heart, Package, Trash2 } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

export default function WishlistPage() {
  const router = useRouter()
  const [items, setItems]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string|null>(null)

  useEffect(() => {
    const u = getTelegramUser()
    if (!u) return
    api.get(`/api/wishlist/${u.id}`).then(r => { setItems(r.data); setLoading(false) }).catch(()=>setLoading(false))
  }, [])

  const remove = async (productId: string) => {
    const u = getTelegramUser()
    await api.delete(`/api/wishlist/remove/${u?.id}/${productId}`).catch(()=>{})
    setItems(i => i.filter(x => x.product_id !== productId))
  }

  const addToCart = async (productId: string) => {
    const u = getTelegramUser()
    if (!u || addingId) return
    setAddingId(productId)
    await api.post('/api/cart/add', { telegram_id: u.id, product_id: productId, quantity: 1 }).catch(()=>{})
    setTimeout(() => setAddingId(null), 1200)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', paddingBottom:80 }}>
      <header style={{ position:'sticky', top:0, zIndex:40, background:'white', borderBottom:'1px solid #f1f5f9', height:52, display:'flex', alignItems:'center', padding:'0 14px', gap:10 }}>
        <button onClick={() => router.back()} style={{ width:34, height:34, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><ChevronLeft size={18} color="#0f172a"/></button>
        <p style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>Wishlist</p>
        <span style={{ marginLeft:'auto', fontSize:12, color:'#64748b' }}>{items.length} items</span>
      </header>

      <div style={{ padding:'12px 14px' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}><div style={{ width:28, height:28, borderRadius:'50%', border:'3px solid #ede9fe', borderTopColor:'#7c3aed', animation:'spin 1s linear infinite' }}/></div>
        ) : items.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:60 }}>
            <div style={{ width:70, height:70, borderRadius:22, background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><Heart size={32} color="#f87171"/></div>
            <p style={{ fontWeight:800, fontSize:16, color:'#0f172a', marginBottom:6 }}>Wishlist is Empty</p>
            <p style={{ fontSize:13, color:'#94a3b8', marginBottom:20 }}>Save products you love</p>
            <button onClick={() => router.push('/')} style={{ padding:'11px 24px', borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', color:'white', fontWeight:700, fontSize:13, cursor:'pointer' }}>Browse Products</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {items.map((item:any) => {
              const p = item.products
              return (
                <div key={item.id} style={{ background:'white', borderRadius:16, border:'1px solid #f1f5f9', display:'flex', gap:12, padding:'12px 14px', cursor:'pointer' }} onClick={() => router.push(`/product/${item.product_id}`)}>
                  <div style={{ width:72, height:72, borderRadius:13, overflow:'hidden', background:'#f8fafc', flexShrink:0 }}>
                    {p?.images?.[0] ? <img src={p.images[0]} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={22} color="#e2e8f0"/></div>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:'#0f172a', marginBottom:4 }} className="line-clamp-2">{p?.name}</p>
                    <p style={{ fontSize:15, fontWeight:800, color:'#7c3aed', marginBottom:8 }}>৳{p?.price}</p>
                    <button onClick={e => { e.stopPropagation(); addToCart(item.product_id) }} style={{ padding:'7px 16px', borderRadius:9, border:'none', background: addingId===item.product_id?'#dcfce7':'linear-gradient(135deg,#7c3aed,#4f46e5)', color: addingId===item.product_id?'#16a34a':'white', fontWeight:700, fontSize:11, cursor:'pointer' }}>
                      {addingId===item.product_id ? '✓ Added' : '+ Add to Cart'}
                    </button>
                  </div>
                  <button onClick={e => { e.stopPropagation(); remove(item.product_id) }} style={{ width:32, height:32, borderRadius:9, background:'#fee2e2', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, alignSelf:'center' }}>
                    <Trash2 size={14} color="#dc2626"/>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <BottomNav/>
    </div>
  )
}
