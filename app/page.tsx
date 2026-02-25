'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Zap, Truck, ChevronRight, Package, Star, Heart, Bell, Tag, Shield, RotateCcw, Headphones, Grid3x3, TrendingUp } from 'lucide-react'
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
  const [notifCount, setNotifCount] = useState(0)
  const [bannerIdx, setBannerIdx]   = useState(0)
  const [addingId, setAddingId]     = useState<string|null>(null)
  const [addedId, setAddedId]       = useState<string|null>(null)
  const [loading, setLoading]       = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [annVisible, setAnnVisible] = useState(true)
  const timer = useRef<any>(null)
  const [flashTime, setFlashTime]   = useState({ h:2, m:34, s:59 })

  useEffect(() => {
    const tg = getTg(); if (tg) { tg.ready(); tg.expand() }
    const u = getTelegramUser(); setUser(u)
    if (u) {
      api.post('/api/users/register', { telegram_id: u.id, name: `${u.first_name} ${u.last_name||''}`.trim(), username: u.username }).catch(()=>{})
      api.get(`/api/cart/${u.id}`).then(r => setCartCount(r.data.length||0)).catch(()=>{})
      api.get('/api/notifications/unread-count').then(r => setNotifCount(r.data.count||0)).catch(()=>{})
    }
    api.get('/api/announcements/active').then(r => setAnn(r.data)).catch(()=>{})
    api.get('/api/banners').then(r => setBanners(r.data)).catch(()=>{})
    api.get('/api/categories').then(r => setCategories(r.data.filter((c:any)=>c.is_active))).catch(()=>{})
    api.get('/api/products?flash_sale=true').then(r => setFlashSale(r.data.slice(0,12))).catch(()=>{})
    api.get('/api/products').then(r => { setProducts(r.data); setLoading(false) }).catch(()=>setLoading(false))
  }, [])

  useEffect(() => {
    if (banners.length < 2) return
    timer.current = setInterval(() => setBannerIdx(i => (i+1) % banners.length), 4500)
    return () => clearInterval(timer.current)
  }, [banners])

  // Flash sale countdown
  useEffect(() => {
    const t = setInterval(() => {
      setFlashTime(prev => {
        let { h, m, s } = prev
        s--; if (s < 0) { s = 59; m-- }; if (m < 0) { m = 59; h-- }; if (h < 0) { h = 5; m = 59; s = 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

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
  const pad = (n:number) => String(n).padStart(2,'0')
  const greeting = () => { const h = new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening' }

  return (
    <div style={{ minHeight:'100vh', background:'#f0f2f5', fontFamily:"'DM Sans',sans-serif", paddingBottom:90 }}>

      {/* ── Announcement Bar ── */}
      {announcement && annVisible && (
        <div style={{
          background: `linear-gradient(135deg, ${announcement.bg_color||'#6d28d9'}, ${announcement.bg_color||'#4f46e5'})`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* shimmer */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.1) 50%,transparent 100%)', animation:'shimmer 2.5s infinite' }}/>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px', position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, overflow:'hidden' }}>
              <span style={{ fontSize:14, flexShrink:0 }}>📢</span>
              <p style={{ fontSize:12, fontWeight:700, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {announcement.text}
              </p>
            </div>
            <button onClick={() => setAnnVisible(false)} style={{ flexShrink:0, marginLeft:10, background:'rgba(255,255,255,0.2)', border:'none', color:'white', width:20, height:20, borderRadius:'50%', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)',
        padding: '12px 14px 16px',
        position: 'sticky',
        top: 0, zIndex: 50,
      }}>
        {/* Top row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:9, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={16} color="white" fill="white"/>
            </div>
            <div>
              <span style={{ fontSize:17, fontWeight:800, color:'white', letterSpacing:'-0.3px' }}>SoCart</span>
              {user && <p style={{ fontSize:10, color:'rgba(255,255,255,0.7)', fontWeight:500, marginTop:1 }}>{greeting()}, {user.first_name} 👋</p>}
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <Link href="/notifications" style={{ position:'relative', width:36, height:36, borderRadius:11, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Bell size={17} color="white" strokeWidth={2}/>
              {notifCount > 0 && <span style={{ position:'absolute', top:-4, right:-4, minWidth:16, height:16, borderRadius:99, background:'#ef4444', color:'white', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #5b21b6', padding:'0 3px' }}>{notifCount>9?'9+':notifCount}</span>}
            </Link>
            <Link href="/cart" style={{ position:'relative', width:36, height:36, borderRadius:11, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ShoppingCart size={17} color="white" strokeWidth={2}/>
              {cartCount > 0 && <span style={{ position:'absolute', top:-4, right:-4, minWidth:16, height:16, borderRadius:99, background:'#ef4444', color:'white', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #5b21b6', padding:'0 3px' }}>{cartCount>9?'9+':cartCount}</span>}
            </Link>
          </div>
        </div>
        {/* Search bar */}
        <div onClick={() => router.push('/search')} style={{
          background: 'white', borderRadius:14, padding:'11px 14px',
          display:'flex', alignItems:'center', gap:9, cursor:'text',
          boxShadow:'0 4px 16px rgba(0,0,0,0.15)',
        }}>
          <Search size={16} color="#94a3b8" strokeWidth={2.5}/>
          <span style={{ fontSize:13, color:'#94a3b8', fontWeight:500 }}>Search products, brands & more...</span>
        </div>
      </div>

      {/* ── Trust Badges ── */}
      <div style={{ background:'white', padding:'10px 14px', borderBottom:'1px solid #f1f5f9' }}>
        <div style={{ display:'flex', justifyContent:'space-around' }}>
          {[
            { icon:'🚚', label:'Fast Delivery' },
            { icon:'🔒', label:'Secure Pay'   },
            { icon:'↩️', label:'Easy Return'  },
            { icon:'🎧', label:'24/7 Support' },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:18 }}>{icon}</span>
              <span style={{ fontSize:9, fontWeight:700, color:'#64748b', whiteSpace:'nowrap' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Banner Slider ── */}
      {banners.length > 0 && (
        <div style={{ padding:'12px 14px 0' }}>
          <div style={{
            borderRadius:18, overflow:'hidden', position:'relative', height:175,
            boxShadow:'0 8px 28px rgba(0,0,0,0.15)',
          }}
            onTouchStart={e => setTouchStart(e.touches[0].clientX)}
            onTouchEnd={e => {
              const dx = e.changedTouches[0].clientX - touchStart
              if (Math.abs(dx) > 50) { clearInterval(timer.current); setBannerIdx(i => (i + (dx>0?-1:1) + banners.length) % banners.length) }
            }}
          >
            {banners.map((b, i) => (
              <div key={b.id} onClick={() => b.link && router.push(b.link)} style={{
                position:'absolute', inset:0, transition:'opacity 0.6s ease',
                opacity: i===bannerIdx?1:0, cursor: b.link?'pointer':'default',
              }}>
                <img src={b.image_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }}/>
                {b.title && (
                  <div style={{ position:'absolute', bottom:14, left:16, right:60 }}>
                    <p style={{ color:'white', fontWeight:800, fontSize:16, textShadow:'0 2px 8px rgba(0,0,0,0.5)', letterSpacing:'-0.3px', marginBottom:4 }}>{b.title}</p>
                    {b.link && <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'white', color:'#6d28d9', fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:99 }}>Shop now <ChevronRight size={11}/></span>}
                  </div>
                )}
              </div>
            ))}
            {/* Counter badge */}
            {banners.length > 1 && (
              <div style={{ position:'absolute', bottom:14, right:14, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)', color:'white', fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:99 }}>
                {bannerIdx+1}/{banners.length}
              </div>
            )}
            {/* Dots */}
            {banners.length > 1 && (
              <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', display:'flex', gap:5 }}>
                {banners.map((_,i) => <div key={i} onClick={() => { clearInterval(timer.current); setBannerIdx(i) }} style={{ width: i===bannerIdx?20:6, height:6, borderRadius:99, background:'white', opacity: i===bannerIdx?1:0.5, transition:'all 0.35s', cursor:'pointer' }}/>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <div style={{ background:'white', margin:'12px 0 0', padding:'14px 14px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <p style={{ fontWeight:800, fontSize:14, color:'#0f172a' }}>Categories</p>
            <Link href="/search" style={{ fontSize:11, fontWeight:700, color:'#7c3aed', display:'flex', alignItems:'center', gap:2, textDecoration:'none' }}>All <ChevronRight size={12}/></Link>
          </div>
          <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto' }}>
            {[{id:'',name:'All',emoji:'🏠'}, ...categories.map((c:any)=>({...c,emoji:'📦'}))].map((c:any) => (
              <button key={c.id} onClick={() => { setCat(c.id); window.scrollTo({top:400,behavior:'smooth'}) }} style={{
                flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer',
                border:'none', background:'transparent', padding:0,
              }}>
                <div style={{
                  width:58, height:58, borderRadius:17, overflow:'hidden',
                  border: selectedCat===c.id ? '2.5px solid #7c3aed' : '2px solid #f1f5f9',
                  background: selectedCat===c.id ? '#f5f3ff' : '#f8fafc',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: selectedCat===c.id ? '0 4px 14px rgba(109,40,217,0.25)' : '0 1px 6px rgba(0,0,0,0.07)',
                  transition:'all 0.2s',
                }}>
                  {c.image ? <img src={c.image} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : <span style={{ fontSize:24 }}>{c.emoji}</span>}
                </div>
                <span style={{ fontSize:10, fontWeight: selectedCat===c.id ? 800:600, color: selectedCat===c.id ? '#7c3aed':'#475569', whiteSpace:'nowrap' }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Flash Sale ── */}
      {flashSale.length > 0 && (
        <div style={{ margin:'10px 0 0' }}>
          {/* Section header */}
          <div style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Zap size={18} color="white" fill="white" className="flash-pulse"/>
              <span style={{ fontSize:15, fontWeight:800, color:'white', letterSpacing:'-0.2px' }}>Flash Sale</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.85)', fontWeight:600 }}>Ends in</span>
              <div style={{ display:'flex', gap:3 }}>
                {[pad(flashTime.h),pad(flashTime.m),pad(flashTime.s)].map((v,i) => (
                  <span key={i} style={{ background:'rgba(0,0,0,0.25)', color:'white', fontSize:13, fontWeight:800, padding:'3px 6px', borderRadius:6, fontVariantNumeric:'tabular-nums', minWidth:26, textAlign:'center' }}>{v}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background:'white', padding:'12px 0 12px 14px' }}>
            <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto', paddingRight:14 }}>
              {flashSale.map((p:any) => <FlashCard key={p.id} p={p} onAdd={addToCart} addingId={addingId} addedId={addedId}/>)}
              <Link href="/search?flash=1" style={{ width:110, flexShrink:0, borderRadius:16, border:'2px dashed #e2e8f0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, textDecoration:'none', color:'#7c3aed' }}>
                <ChevronRight size={22}/>
                <span style={{ fontSize:10, fontWeight:700 }}>See all</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Products ── */}
      <div style={{ margin:'10px 0 0' }}>
        {/* Section Header */}
        <div style={{ background:'white', padding:'14px 14px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #f8fafc' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <TrendingUp size={16} color="#7c3aed"/>
            <p style={{ fontWeight:800, fontSize:14, color:'#0f172a' }}>
              {selectedCat ? categories.find((c:any)=>c.id===selectedCat)?.name||'Products' : 'Popular Products'}
            </p>
          </div>
          <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>{filtered.length} items</span>
        </div>

        {/* Products grid */}
        <div style={{ background:'#f0f2f5', padding:'10px 10px 0' }}>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
              <div style={{ width:34, height:34, borderRadius:'50%', border:'3px solid #ede9fe', borderTopColor:'#7c3aed', animation:'spin 0.75s linear infinite' }}/>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background:'white', borderRadius:18, padding:'50px 20px', textAlign:'center', margin:'0 0 10px' }}>
              <div style={{ width:70, height:70, borderRadius:20, background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <Package size={32} color="#cbd5e1"/>
              </div>
              <p style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:5 }}>No products found</p>
              <p style={{ fontSize:12, color:'#94a3b8' }}>Try a different category</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, paddingBottom:8 }}>
              {filtered.map((p:any, i:number) => <ProductCard key={p.id} p={p} onAdd={addToCart} addingId={addingId} addedId={addedId} idx={i}/>)}
            </div>
          )}
        </div>
      </div>

      <BottomNav/>

      <style>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
      `}</style>
    </div>
  )
}

/* ── Flash Sale Card ── */
function FlashCard({ p, onAdd, addingId, addedId }: any) {
  const router = useRouter()
  const price   = p.flash_sale && p.flash_sale_price ? p.flash_sale_price : p.price
  const discPct = p.old_price ? Math.round((1 - price / p.old_price) * 100) : 0
  const added   = addedId === p.id
  const adding  = addingId === p.id

  return (
    <div onClick={() => router.push(`/product/${p.id}`)} style={{
      width:136, flexShrink:0, background:'white', borderRadius:16,
      overflow:'hidden', cursor:'pointer', border:'1px solid #f1f5f9',
      boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
    }}>
      <div style={{ height:128, background:'#f8fafc', position:'relative', overflow:'hidden' }}>
        {p.images?.[0]
          ? <img src={p.images[0]} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={28} color="#e2e8f0"/></div>
        }
        {discPct > 0 && (
          <span style={{ position:'absolute', top:7, left:7, background:'#ef4444', color:'white', fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:6 }}>
            -{discPct}%
          </span>
        )}
        {p.stock > 0 && p.stock <= 5 && (
          <span style={{ position:'absolute', bottom:6, left:7, background:'rgba(0,0,0,0.6)', color:'white', fontSize:8, fontWeight:700, padding:'2px 6px', borderRadius:5 }}>
            🔥 {p.stock} left
          </span>
        )}
      </div>
      <div style={{ padding:'9px 10px' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'#0f172a', marginBottom:4, lineHeight:1.3 }} className="line-clamp-2">{p.name}</p>
        <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:7 }}>
          <span style={{ fontSize:14, fontWeight:800, color:'#ef4444' }}>৳{price}</span>
          {p.old_price && <span style={{ fontSize:9, color:'#94a3b8', textDecoration:'line-through' }}>৳{p.old_price}</span>}
        </div>
        <button onClick={e => onAdd(p.id,e)} disabled={adding||p.stock===0} style={{
          width:'100%', padding:'6px', borderRadius:9, border:'none', cursor:'pointer',
          fontSize:10, fontWeight:800,
          background: added?'#dcfce7':p.stock===0?'#f1f5f9':'#ef4444',
          color: added?'#16a34a':p.stock===0?'#94a3b8':'white',
        }}>
          {adding ? '...' : added ? '✓ Added' : p.stock===0 ? 'Out of stock' : '+ Add'}
        </button>
      </div>
    </div>
  )
}

/* ── Product Card ── */
function ProductCard({ p, onAdd, addingId, addedId, idx }: any) {
  const router  = useRouter()
  const price   = p.flash_sale && p.flash_sale_price ? p.flash_sale_price : p.price
  const discPct = p.old_price ? Math.round((1 - price / p.old_price) * 100) : 0
  const added   = addedId === p.id
  const adding  = addingId === p.id

  return (
    <div
      onClick={() => router.push(`/product/${p.id}`)}
      className="anim-fadeup"
      style={{
        background:'white', borderRadius:16, overflow:'hidden', cursor:'pointer',
        boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
        animationDelay:`${idx*25}ms`, animationFillMode:'both',
      }}
    >
      {/* Image */}
      <div style={{ aspectRatio:'1/1', background:'#f8fafc', position:'relative', overflow:'hidden' }}>
        {p.images?.[0]
          ? <img src={p.images[0]} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={30} color="#e2e8f0"/></div>
        }
        {/* Discount badge */}
        {discPct > 0 && (
          <span style={{ position:'absolute', top:8, left:8, background:'#ef4444', color:'white', fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:6 }}>
            -{discPct}%
          </span>
        )}
        {/* Flash badge */}
        {p.flash_sale && (
          <span style={{ position:'absolute', top: discPct>0?28:8, left:8, background:'#fef3c7', color:'#d97706', fontSize:8, fontWeight:800, padding:'2px 6px', borderRadius:6, display:'flex', alignItems:'center', gap:2 }}>
            <Zap size={8} fill="#d97706" color="#d97706" className="flash-pulse"/> SALE
          </span>
        )}
        {/* Free delivery */}
        {p.offer_badge === 'free_delivery' && (
          <span style={{ position:'absolute', top:8, right:8, background:'#dcfce7', color:'#15803d', fontSize:8, fontWeight:800, padding:'2px 6px', borderRadius:6, display:'flex', alignItems:'center', gap:2 }}>
            <Truck size={8}/> FREE
          </span>
        )}
        {/* Low stock */}
        {p.stock > 0 && p.stock <= 5 && (
          <div style={{ position:'absolute', bottom:7, left:8, background:'rgba(0,0,0,0.58)', backdropFilter:'blur(4px)', color:'white', fontSize:8, fontWeight:700, padding:'2px 7px', borderRadius:5 }}>
            🔥 {p.stock} left
          </div>
        )}
        {/* Out of stock overlay */}
        {p.stock === 0 && (
          <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.72)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:10, fontWeight:800, color:'#94a3b8', background:'white', padding:'4px 10px', borderRadius:7 }}>Out of Stock</span>
          </div>
        )}
        {/* Social proof */}
        {p.social_proof_count > 10 && (
          <span style={{ position:'absolute', bottom:7, right:8, background:'rgba(0,0,0,0.5)', color:'white', fontSize:8, fontWeight:700, padding:'2px 6px', borderRadius:5 }}>
            👥{p.social_proof_count}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'10px 10px 11px' }}>
        <p style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:5, lineHeight:1.35 }} className="line-clamp-2">
          {p.name}
        </p>

        {/* Stars */}
        {p.avg_rating > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:3, marginBottom:6 }}>
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={9} fill={s<=Math.round(p.avg_rating)?'#f59e0b':'#e9ecef'} color="transparent" strokeWidth={0}/>
            ))}
            <span style={{ fontSize:9.5, color:'#94a3b8', fontWeight:600 }}>{p.avg_rating.toFixed(1)}</span>
            {p.review_count > 0 && <span style={{ fontSize:9, color:'#cbd5e1' }}>({p.review_count})</span>}
          </div>
        )}

        {/* Price row */}
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:9 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
            <span style={{ fontSize:15, fontWeight:800, color:'#7c3aed', letterSpacing:'-0.2px' }}>৳{price}</span>
            {p.old_price && <span style={{ fontSize:9.5, color:'#cbd5e1', textDecoration:'line-through' }}>৳{p.old_price}</span>}
          </div>
        </div>

        {/* Button */}
        <button
          onClick={e => onAdd(p.id,e)}
          disabled={adding || p.stock===0}
          style={{
            width:'100%', padding:'8.5px 8px', borderRadius:10,
            border: added ? '1.5px solid #10b981' : 'none',
            cursor: p.stock===0 ? 'default' : 'pointer',
            fontSize:11, fontWeight:800,
            display:'flex', alignItems:'center', justifyContent:'center', gap:5,
            background: added ? '#f0fdf4' : p.stock===0 ? '#f8fafc' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color: added ? '#10b981' : p.stock===0 ? '#94a3b8' : 'white',
            boxShadow: (!added && p.stock>0) ? '0 3px 10px rgba(109,40,217,0.25)' : 'none',
          }}
        >
          {adding
            ? <div style={{ width:11, height:11, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', animation:'spin 0.7s linear infinite' }}/>
            : added ? '✓ Added'
            : p.stock===0 ? 'Out of Stock'
            : <><ShoppingCart size={11}/> Add to Cart</>
          }
        </button>
      </div>
    </div>
  )
}
