'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Zap, Truck, ChevronRight, Package, Star, Heart, Bell } from 'lucide-react'
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
  const [touchStart, setTouchStart] = useState(0)
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
    timer.current = setInterval(() => setBannerIdx(i => (i+1) % banners.length), 4000)
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

  const swipeBanner = (dir: number) => {
    clearInterval(timer.current)
    setBannerIdx(i => (i + dir + banners.length) % banners.length)
  }

  const filtered = selectedCat ? products.filter((p:any) => p.category_id === selectedCat) : products
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f4f6fb', paddingBottom:90, fontFamily:"'DM Sans', sans-serif" }}>

      {/* Announcement */}
      {announcement && (
        <div style={{ background: announcement.bg_color||'#6d28d9', height:30, overflow:'hidden', display:'flex', alignItems:'center' }}>
          <p className="marquee" style={{ whiteSpace:'nowrap', fontSize:11, fontWeight:700, color:'white', paddingLeft:'100%' }}>
            📢 {announcement.text}
          </p>
        </div>
      )}

      {/* Header */}
      <header style={{
        background: 'white',
        padding: '0 16px',
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: announcement ? 30 : 0,
        zIndex: 40,
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(109,40,217,0.4)',
          }}>
            <Zap size={15} color="white" fill="white"/>
          </div>
          <div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>SoCart</span>
            {user && (
              <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500, lineHeight: 1, marginTop: 1 }}>
                {greeting()}, {user.first_name} 👋
              </p>
            )}
          </div>
        </div>
        <div style={{ display:'flex', gap:7 }}>
          <Link href="/search" style={{
            width: 38, height: 38, borderRadius: 12,
            background: '#f8fafc', border: '1.5px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Search size={17} color="#475569" strokeWidth={2.2}/>
          </Link>
          <Link href="/cart" style={{
            width: 38, height: 38, borderRadius: 12,
            background: '#f8fafc', border: '1.5px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <ShoppingCart size={17} color="#475569" strokeWidth={2.2}/>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                minWidth: 18, height: 18, borderRadius: 99,
                background: '#ef4444', color: 'white',
                fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid white', padding: '0 3px',
              }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div style={{ padding: '14px 14px 0' }}>

        {/* Banner Slider */}
        {banners.length > 0 && (
          <div style={{ marginBottom: 18, position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
            onTouchStart={e => setTouchStart(e.touches[0].clientX)}
            onTouchEnd={e => { const dx = e.changedTouches[0].clientX - touchStart; if (Math.abs(dx) > 50) swipeBanner(dx > 0 ? -1 : 1) }}
          >
            <div style={{ height: 180, position: 'relative' }}>
              {banners.map((b, i) => (
                <div key={b.id} onClick={() => b.link && router.push(b.link)} style={{
                  position: 'absolute', inset: 0,
                  transition: 'opacity 0.6s cubic-bezier(.4,0,.2,1)',
                  opacity: i === bannerIdx ? 1 : 0,
                  cursor: b.link ? 'pointer' : 'default',
                }}>
                  <img src={b.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%)' }}/>
                  {b.title && (
                    <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
                      <p style={{ color: 'white', fontWeight: 800, fontSize: 15, textShadow: '0 2px 8px rgba(0,0,0,0.5)', letterSpacing: '-0.2px' }}>{b.title}</p>
                      {b.link && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>Shop now <ChevronRight size={11}/></p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {banners.length > 1 && (
              <div style={{ position: 'absolute', bottom: 12, right: 14, display: 'flex', gap: 5, alignItems: 'center' }}>
                {banners.map((_, i) => (
                  <div key={i} onClick={() => { clearInterval(timer.current); setBannerIdx(i) }} style={{
                    width: i === bannerIdx ? 20 : 6, height: 6, borderRadius: 99,
                    background: 'white', opacity: i === bannerIdx ? 1 : 0.5,
                    transition: 'all 0.35s', cursor: 'pointer',
                  }}/>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="scrollbar-hide" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 18 }}>
            {[{ id: '', name: 'All' }, ...categories].map(c => (
              <button key={c.id} onClick={() => setCat(c.id === selectedCat ? '' : c.id)} style={{
                flexShrink: 0,
                padding: '7px 16px',
                borderRadius: 99,
                fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                background: selectedCat === c.id ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'white',
                color: selectedCat === c.id ? 'white' : '#475569',
                boxShadow: selectedCat === c.id ? '0 4px 14px rgba(109,40,217,0.35)' : '0 1px 6px rgba(0,0,0,0.08)',
                transform: selectedCat === c.id ? 'translateY(-1px)' : 'none',
                transition: 'all 0.2s',
              }}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Flash Sale */}
        {flashSale.length > 0 && !selectedCat && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ background: '#fff3cd', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Zap size={13} color="#d97706" fill="#d97706" className="flash-pulse"/>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#92400e', letterSpacing: '-0.2px' }}>Flash Sale</span>
                </div>
              </div>
              <Link href="/search?flash=1" style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none' }}>
                View all <ChevronRight size={12}/>
              </Link>
            </div>
            <div className="scrollbar-hide" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {flashSale.map((p:any) => <FlashCard key={p.id} p={p} onAdd={addToCart} addingId={addingId} addedId={addedId}/>)}
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', letterSpacing: '-0.2px' }}>
              {selectedCat ? categories.find(c => c.id === selectedCat)?.name : '✨ All Products'}
            </p>
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{filtered.length} items</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60, paddingBottom: 40 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #ede9fe', borderTopColor: '#7c3aed', animation: 'spin 0.8s linear infinite' }}/>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 60, paddingBottom: 40 }}>
              <div style={{ width: 72, height: 72, borderRadius: 22, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Package size={32} color="#cbd5e1"/>
              </div>
              <p style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', marginBottom: 5 }}>No products found</p>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Try a different category</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {filtered.map((p:any, idx:number) => (
                <ProductCard key={p.id} p={p} onAdd={addToCart} addingId={addingId} addedId={addedId} delay={idx * 30}/>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav/>
    </div>
  )
}

/* ── Flash Sale horizontal card ── */
function FlashCard({ p, onAdd, addingId, addedId }: any) {
  const router = useRouter()
  const price = p.flash_sale && p.flash_sale_price ? p.flash_sale_price : p.price
  const discPct = p.old_price ? Math.round((1 - price / p.old_price) * 100) : 0
  const added  = addedId === p.id
  const adding = addingId === p.id

  return (
    <div onClick={() => router.push(`/product/${p.id}`)} style={{
      width: 140, flexShrink: 0, background: 'white', borderRadius: 16,
      overflow: 'hidden', cursor: 'pointer',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      border: '1px solid rgba(0,0,0,0.04)',
    }}>
      <div style={{ height: 120, background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
        {p.images?.[0]
          ? <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""/>
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={28} color="#e2e8f0"/></div>
        }
        {discPct > 0 && (
          <div style={{ position: 'absolute', top: 7, left: 7, background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
            -{discPct}%
          </div>
        )}
        {p.stock > 0 && p.stock <= 5 && (
          <div style={{ position: 'absolute', bottom: 6, left: 7, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 5 }}>
            🔥 {p.stock} left
          </div>
        )}
      </div>
      <div style={{ padding: '9px 10px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 4, lineHeight: 1.3 }} className="line-clamp-2">{p.name}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 7 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#7c3aed' }}>৳{price}</span>
          {p.old_price && <span style={{ fontSize: 9, color: '#94a3b8', textDecoration: 'line-through' }}>৳{p.old_price}</span>}
        </div>
        <button onClick={e => onAdd(p.id, e)} disabled={adding || p.stock === 0} style={{
          width: '100%', padding: '6px', borderRadius: 9, border: 'none', cursor: 'pointer',
          fontSize: 10, fontWeight: 800,
          background: added ? '#dcfce7' : p.stock === 0 ? '#f1f5f9' : '#7c3aed',
          color: added ? '#16a34a' : p.stock === 0 ? '#94a3b8' : 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
        }}>
          {adding
            ? <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }}/>
            : added ? '✓ Added'
            : p.stock === 0 ? 'Out of stock'
            : '+ Add'}
        </button>
      </div>
    </div>
  )
}

/* ── Main product grid card ── */
function ProductCard({ p, onAdd, addingId, addedId, delay }: any) {
  const router = useRouter()
  const price  = p.flash_sale && p.flash_sale_price ? p.flash_sale_price : p.price
  const discPct = p.old_price ? Math.round((1 - price / p.old_price) * 100) : 0
  const added  = addedId === p.id
  const adding = addingId === p.id

  return (
    <div
      onClick={() => router.push(`/product/${p.id}`)}
      className="anim-fadeup"
      style={{
        background: 'white', borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
        animationDelay: `${delay}ms`, animationFillMode: 'both',
      }}
    >
      {/* Image */}
      <div style={{ height: 158, background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
        {p.images?.[0]
          ? <img src={p.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} alt=""/>
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={32} color="#e2e8f0"/>
            </div>
        }
        {/* Top badges */}
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {discPct > 0 && (
            <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 7, background: '#ef4444', color: 'white' }}>
              -{discPct}%
            </span>
          )}
          {p.flash_sale && (
            <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 7, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Zap size={8} fill="#d97706" color="#d97706" className="flash-pulse"/> SALE
            </span>
          )}
          {p.offer_badge === 'free_delivery' && (
            <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 7, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Truck size={8}/> FREE
            </span>
          )}
        </div>
        {/* Stock warning */}
        {p.stock > 0 && p.stock <= 5 && (
          <div style={{ position: 'absolute', bottom: 7, left: 8, background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(4px)', color: 'white', fontSize: 8, fontWeight: 700, padding: '3px 7px', borderRadius: 6 }}>
            🔥 Only {p.stock} left
          </div>
        )}
        {p.stock === 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', background: 'white', padding: '4px 10px', borderRadius: 8 }}>Out of Stock</span>
          </div>
        )}
        {/* Social proof */}
        {p.social_proof_count > 10 && (
          <span style={{ position: 'absolute', bottom: 7, right: 7, background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 6 }}>
            👥{p.social_proof_count}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '11px 12px 12px' }}>
        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginBottom: 5, lineHeight: 1.35 }} className="line-clamp-2">
          {p.name}
        </p>

        {/* Rating */}
        {p.avg_rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 7 }}>
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={9} fill={s <= Math.round(p.avg_rating) ? '#f59e0b' : '#e2e8f0'} color={s <= Math.round(p.avg_rating) ? '#f59e0b' : '#e2e8f0'} strokeWidth={0}/>
            ))}
            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{p.avg_rating.toFixed(1)}</span>
            {p.review_count > 0 && <span style={{ fontSize: 10, color: '#cbd5e1' }}>({p.review_count})</span>}
          </div>
        )}

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed', letterSpacing: '-0.3px' }}>৳{price}</span>
          {p.old_price && <span style={{ fontSize: 10, color: '#cbd5e1', textDecoration: 'line-through' }}>৳{p.old_price}</span>}
        </div>

        {/* Add to cart */}
        <button
          onClick={e => onAdd(p.id, e)}
          disabled={adding || p.stock === 0}
          style={{
            width: '100%', padding: '9px 8px', borderRadius: 11,
            border: added ? '1.5px solid #10b981' : 'none',
            cursor: p.stock === 0 ? 'default' : 'pointer',
            fontSize: 11.5, fontWeight: 800, letterSpacing: '0.01em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            background: added
              ? '#f0fdf4'
              : p.stock === 0
                ? '#f8fafc'
                : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            color: added ? '#10b981' : p.stock === 0 ? '#94a3b8' : 'white',
            boxShadow: (!added && p.stock > 0) ? '0 3px 10px rgba(109,40,217,0.28)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {adding
            ? <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }}/>
            : added
              ? <><span>✓</span> Added to Cart</>
              : p.stock === 0
                ? 'Out of Stock'
                : <><ShoppingCart size={12}/> Add to Cart</>
          }
        </button>
      </div>
    </div>
  )
}
