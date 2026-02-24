'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Zap, Truck, ChevronRight, Package, Star } from 'lucide-react'
import { api, getTelegramUser, getTg } from '../lib/api'
import BottomNav from '../components/BottomNav'

export default function Home() {
  const router = useRouter()
  const [user, setUser]             = useState<any>(null)
  const [announcement, setAnn]      = useState<any>(null)
  const [banners, setBanners]       = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts]     = useState<any[]>([])
  const [flashSale, setFlashSale]   = useState<any[]>([])
  const [selectedCat, setCat]       = useState('')
  const [cartCount, setCartCount]   = useState(0)
  const [bannerIdx, setBannerIdx]   = useState(0)
  const [addingId, setAddingId]     = useState<string|null>(null)
  const [addedId, setAddedId]       = useState<string|null>(null)
  const [loading, setLoading]       = useState(true)
  const timer = useRef<any>(null)

  useEffect(() => {
    const tg = getTg(); if (tg) { tg.ready(); tg.expand() }
    const u = getTelegramUser(); setUser(u)
    if (u) {
      api.post('/api/users/register', { telegram_id: u.id, name: `${u.first_name} ${u.last_name||''}`.trim(), username: u.username }).catch(()=>{})
      api.get(`/api/cart/${u.id}`).then(r => setCartCount(r.data.length||0)).catch(()=>{})
    }
    api.get('/api/announcements/active').then(r => setAnn(r.data)).catch(()=>{})
    api.get('/api/banners').then(r => setBanners(r.data)).catch(()=>{})
    api.get('/api/categories').then(r => setCategories(r.data.filter((c:any)=>c.is_active))).catch(()=>{})
    api.get('/api/products?flash_sale=true').then(r => setFlashSale(r.data.slice(0,10))).catch(()=>{})
    api.get('/api/products').then(r => { setProducts(r.data); setLoading(false) }).catch(()=>setLoading(false))
  }, [])

  useEffect(() => {
    if (banners.length < 2) return
    timer.current = setInterval(() => setBannerIdx(i => (i+1) % banners.length), 3500)
    return () => clearInterval(timer.current)
  }, [banners])

  const addToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!user || addingId) return
    setAddingId(productId)
    try {
      await api.post('/api/cart/add', { telegram_id: user.id, product_id: productId, quantity: 1 })
      setAddedId(productId); setCartCount(c => c+1)
      setTimeout(() => setAddedId(null), 1800)
    } catch {}
    setAddingId(null)
  }

  const filtered = selectedCat ? products.filter((p:any) => p.category_id === selectedCat) : products

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', paddingBottom:80 }}>
      {announcement && (
        <div style={{ background: announcement.bg_color||'#6d28d9', height:30, overflow:'hidden', display:'flex', alignItems:'center' }}>
          <p className="marquee" style={{ whiteSpace:'nowrap', fontSize:11, fontWeight:700, color:'white', paddingLeft:'100%' }}>📢 {announcement.text}</p>
        </div>
      )}
      <header style={{ background:'white', borderBottom:'1px solid #f1f5f9', padding:'0 16px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:announcement?30:0, zIndex:40, boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center' }}><Zap size={13} color="white" fill="white"/></div>
          <span style={{ fontSize:16, fontWeight:800, color:'#0f172a' }}>SoCart</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link href="/search" style={{ width:34, height:34, borderRadius:9, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center' }}><Search size={16} color="#64748b"/></Link>
          <Link href="/cart" style={{ width:34, height:34, borderRadius:9, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <ShoppingCart size={16} color="#64748b"/>
            {cartCount > 0 && <span style={{ position:'absolute', top:-4, right:-4, width:16, height:16, borderRadius:'50%', background:'#ef4444', color:'white', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount>9?'9+':cartCount}</span>}
          </Link>
        </div>
      </header>

      <div style={{ padding:'12px 14px 0' }}>
        {/* Banners */}
        {banners.length > 0 && (
          <div style={{ borderRadius:16, overflow:'hidden', marginBottom:14, position:'relative', height:155 }}>
            {banners.map((b,i) => (
              <div key={b.id} onClick={() => b.link && router.push(b.link)} style={{ position:'absolute', inset:0, transition:'opacity .5s', opacity: i===bannerIdx?1:0, cursor: b.link?'pointer':'default' }}>
                <img src={b.image_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                {b.title && <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent,rgba(0,0,0,.6))', padding:'16px 12px 10px' }}><p style={{ color:'white', fontWeight:700, fontSize:13 }}>{b.title}</p></div>}
              </div>
            ))}
            {banners.length > 1 && (
              <div style={{ position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)', display:'flex', gap:4 }}>
                {banners.map((_,i) => <div key={i} onClick={() => setBannerIdx(i)} style={{ width:i===bannerIdx?16:5, height:5, borderRadius:99, background:'white', opacity:i===bannerIdx?1:0.5, transition:'all .3s', cursor:'pointer' }}/>)}
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="scrollbar-hide" style={{ display:'flex', gap:7, overflowX:'auto', marginBottom:14 }}>
            {[{id:'',name:'All'},...categories].map(c => (
              <button key={c.id} onClick={() => setCat(c.id)} style={{ flexShrink:0, padding:'6px 14px', borderRadius:99, fontSize:12, fontWeight:700, border:'none', cursor:'pointer', background: selectedCat===c.id?'linear-gradient(135deg,#7c3aed,#4f46e5)':'white', color: selectedCat===c.id?'white':'#64748b', boxShadow: selectedCat===c.id?'0 4px 10px rgba(109,40,217,.3)':'0 1px 4px rgba(0,0,0,.07)' }}>{c.name}</button>
            ))}
          </div>
        )}

        {/* Flash Sale */}
        {flashSale.length > 0 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:9 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <Zap size={15} color="#f59e0b" fill="#f59e0b" className="flash-pulse"/>
                <span style={{ fontWeight:800, fontSize:14, color:'#0f172a' }}>Flash Sale</span>
              </div>
              <Link href="/search?flash=1" style={{ fontSize:11, fontWeight:700, color:'#7c3aed', display:'flex', alignItems:'center', gap:2 }}>See all <ChevronRight size={12}/></Link>
            </div>
            <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto' }}>
              {flashSale.map((p:any) => <SmallCard key={p.id} p={p} onAdd={addToCart} addingId={addingId} addedId={addedId}/>)}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div style={{ marginBottom:8 }}>
          <p style={{ fontWeight:800, fontSize:14, color:'#0f172a', marginBottom:10 }}>{selectedCat ? categories.find(c=>c.id===selectedCat)?.name : 'All Products'}</p>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', paddingTop:40 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', border:'3px solid #ede9fe', borderTopColor:'#7c3aed', animation:'spin 1s linear infinite' }}/>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', paddingTop:48 }}>
              <Package size={40} color="#e2e8f0" style={{ margin:'0 auto 10px' }}/>
              <p style={{ color:'#94a3b8', fontSize:13 }}>No products found</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {filtered.map((p:any) => <BigCard key={p.id} p={p} onAdd={addToCart} addingId={addingId} addedId={addedId}/>)}
            </div>
          )}
        </div>
      </div>
      <BottomNav/>
    </div>
  )
}

function SmallCard({ p, onAdd, addingId, addedId }: any) {
  const router = useRouter()
  const price = p.flash_sale && p.flash_sale_price ? p.flash_sale_price : p.price
  return (
    <div onClick={() => router.push(`/product/${p.id}`)} style={{ width:130, flexShrink:0, background:'white', borderRadius:14, overflow:'hidden', border:'1px solid #f1f5f9', cursor:'pointer' }}>
      <div style={{ height:110, background:'#f8fafc', position:'relative' }}>
        {p.images?.[0] ? <img src={p.images[0]} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={24} color="#e2e8f0"/></div>}
        {p.stock > 0 && p.stock <= 5 && <span style={{ position:'absolute', top:6, left:6, fontSize:8, fontWeight:800, padding:'2px 5px', borderRadius:99, background:'#fee2e2', color:'#dc2626' }}>🔥{p.stock} left</span>}
      </div>
      <div style={{ padding:'7px 8px' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'#0f172a', marginBottom:3 }} className="line-clamp-2">{p.name}</p>
        <div style={{ display:'flex', gap:4, alignItems:'baseline', marginBottom:6 }}>
          <span style={{ fontSize:13, fontWeight:800, color:'#7c3aed' }}>৳{price}</span>
          {p.old_price && <span style={{ fontSize:9, color:'#94a3b8', textDecoration:'line-through' }}>৳{p.old_price}</span>}
        </div>
        <button onClick={e => onAdd(p.id,e)} disabled={addingId===p.id||p.stock===0} style={{ width:'100%', padding:'5px', borderRadius:8, border:'none', cursor:'pointer', fontSize:10, fontWeight:700, background: addedId===p.id?'#dcfce7':p.stock===0?'#f1f5f9':'linear-gradient(135deg,#7c3aed,#4f46e5)', color: addedId===p.id?'#16a34a':p.stock===0?'#94a3b8':'white' }}>
          {addedId===p.id?'✓':'+'} {p.stock===0?'Out of stock':addedId===p.id?'Added':'Add'}
        </button>
      </div>
    </div>
  )
}

function BigCard({ p, onAdd, addingId, addedId }: any) {
  const router = useRouter()
  const price = p.flash_sale && p.flash_sale_price ? p.flash_sale_price : p.price
  return (
    <div onClick={() => router.push(`/product/${p.id}`)} style={{ background:'white', borderRadius:16, overflow:'hidden', border:'1px solid #f1f5f9', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ height:148, background:'#f8fafc', position:'relative' }}>
        {p.images?.[0] ? <img src={p.images[0]} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={28} color="#e2e8f0"/></div>}
        <div style={{ position:'absolute', top:7, left:7, display:'flex', flexDirection:'column', gap:3 }}>
          {p.flash_sale && <span style={{ fontSize:8, fontWeight:800, padding:'2px 5px', borderRadius:99, background:'#fef3c7', color:'#d97706', display:'flex', alignItems:'center', gap:2 }}><Zap size={8} fill="#d97706"/>SALE</span>}
          {p.offer_badge==='free_delivery' && <span style={{ fontSize:8, fontWeight:800, padding:'2px 5px', borderRadius:99, background:'#dcfce7', color:'#16a34a', display:'flex', alignItems:'center', gap:2 }}><Truck size={8}/>FREE DEL</span>}
          {p.stock>0&&p.stock<=5 && <span style={{ fontSize:8, fontWeight:800, padding:'2px 5px', borderRadius:99, background:'#fee2e2', color:'#dc2626' }}>🔥{p.stock} left</span>}
          {p.stock===0 && <span style={{ fontSize:8, fontWeight:800, padding:'2px 5px', borderRadius:99, background:'#f1f5f9', color:'#94a3b8' }}>Out of stock</span>}
        </div>
        {p.social_proof_count > 10 && <span style={{ position:'absolute', bottom:6, left:7, fontSize:8, fontWeight:700, padding:'2px 5px', borderRadius:99, background:'rgba(0,0,0,.5)', color:'white' }}>👥{p.social_proof_count} bought</span>}
      </div>
      <div style={{ padding:'10px 11px' }}>
        <p style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:4 }} className="line-clamp-2">{p.name}</p>
        <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom: p.avg_rating>0?5:8 }}>
          <span style={{ fontSize:14, fontWeight:800, color:'#7c3aed' }}>৳{price}</span>
          {p.old_price && <span style={{ fontSize:10, color:'#94a3b8', textDecoration:'line-through' }}>৳{p.old_price}</span>}
        </div>
        {p.avg_rating > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:3, marginBottom:8 }}>
            <Star size={10} fill="#f59e0b" color="#f59e0b"/>
            <span style={{ fontSize:10, color:'#64748b', fontWeight:600 }}>{p.avg_rating.toFixed(1)}</span>
            {p.review_count > 0 && <span style={{ fontSize:10, color:'#94a3b8' }}>({p.review_count})</span>}
          </div>
        )}
        <button onClick={e => onAdd(p.id,e)} disabled={addingId===p.id||p.stock===0} style={{ width:'100%', padding:'8px', borderRadius:10, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, background: addedId===p.id?'#dcfce7':p.stock===0?'#f1f5f9':'linear-gradient(135deg,#7c3aed,#4f46e5)', color: addedId===p.id?'#16a34a':p.stock===0?'#94a3b8':'white', boxShadow: (!addedId&&p.stock>0)?'0 2px 8px rgba(109,40,217,.2)':'none' }}>
          {addingId===p.id ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}><div style={{ width:10, height:10, borderRadius:'50%', border:'2px solid rgba(255,255,255,.3)', borderTopColor:'white', animation:'spin 1s linear infinite' }}/> Adding</span> : addedId===p.id ? '✓ Added' : p.stock===0 ? 'Out of Stock' : '+ Add to Cart'}
        </button>
      </div>
    </div>
  )
}
