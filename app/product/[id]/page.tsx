'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ShoppingCart, Heart, Star, Package, Truck, Zap, Share2, ChevronRight, MessageCircle, Plus, Check, Bell } from 'lucide-react'
import { api, getTelegramUser, getTg } from '../../../lib/api'

export default function ProductDetail() {
  const { id } = useParams(); const router = useRouter()
  const [p, setP]             = useState<any>(null)
  const [variants, setVariants] = useState<any[]>([])
  const [reviews, setReviews] = useState<any>(null)
  const [qa, setQa]           = useState<any[]>([])
  const [related, setRelated] = useState<any[]>([])
  const [user, setUser]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx]   = useState(0)
  const [selVars, setSelVars] = useState<Record<string,string>>({})
  const [wishlisted, setWL]   = useState(false)
  const [tab, setTab]         = useState<'details'|'reviews'|'qa'>('details')
  const [adding, setAdding]   = useState(false)
  const [added, setAdded]     = useState(false)
  const [question, setQuestion] = useState('')
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [restockNotified, setRestockNotified] = useState(false)

  useEffect(() => {
    const u = getTelegramUser(); setUser(u)
    Promise.all([
      api.get(`/api/products/${id}`).then(r => setP(r.data)).catch(()=>{}),
      api.get(`/api/variants/${id}`).then(r => setVariants(r.data)).catch(()=>{}),
      api.get(`/api/reviews/${id}`).then(r => setReviews(r.data)).catch(()=>{}),
      api.get(`/api/products/${id}/qa`).then(r => setQa(r.data)).catch(()=>{}),
      u ? api.get(`/api/wishlist/check/${u.id}/${id}`).then(r => setWL(r.data.wishlisted)).catch(()=>{}) : Promise.resolve(),
    ]).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (p?.category_id) {
      api.get(`/api/products?category=${p.category_id}&limit=6`).then(r => setRelated(r.data.filter((x:any) => x.id !== id).slice(0,5))).catch(()=>{})
    }
  }, [p])

  const addToCart = async (buyNow = false) => {
    if (!user || adding) return
    for (const v of variants) { if (!selVars[v.name]) { alert(`Select ${v.name}`); return } }
    setAdding(true)
    try {
      await api.post('/api/cart/add', { telegram_id: user.id, product_id: id, quantity: 1, selected_variant: selVars })
      if (buyNow) router.push('/checkout')
      else { setAdded(true); setTimeout(() => setAdded(false), 2000) }
    } catch {}
    setAdding(false)
  }

  const toggleWL = async () => {
    if (!user) return
    if (wishlisted) { await api.delete(`/api/wishlist/remove/${user.id}/${id}`).catch(()=>{}); setWL(false) }
    else { await api.post('/api/wishlist/add', { telegram_id: user.id, product_id: id }).catch(()=>{}); setWL(true) }
  }

  const share = () => { getTg()?.openTelegramLink?.(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(p?.name||'')}`) }

  const submitReview = async () => {
    if (!user || !myRating) return; setSubmitting(true)
    try {
      await api.post(`/api/reviews/${id}`, { telegram_id: user.id, rating: myRating, comment: myComment })
      api.get(`/api/reviews/${id}`).then(r => setReviews(r.data)).catch(()=>{})
      setMyRating(0); setMyComment('')
    } catch {}
    setSubmitting(false)
  }

  const askQuestion = async () => {
    if (!user || !question.trim()) return
    try { await api.post(`/api/products/${id}/qa`, { question }); setQuestion(''); api.get(`/api/products/${id}/qa`).then(r => setQa(r.data)).catch(()=>{}) }
    catch {}
  }

  const notifyRestock = async () => {
    if (!user) return
    await api.post(`/api/products/${id}/restock-notify`).catch(()=>{})
    setRestockNotified(true)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid #ede9fe', borderTopColor:'#7c3aed', animation:'spin 1s linear infinite' }}/>
    </div>
  )
  if (!p) return <div style={{ padding:20, textAlign:'center', color:'#94a3b8' }}>Product not found</div>

  const price = p.flash_sale && p.flash_sale_price ? p.flash_sale_price : p.price
  const imgs  = p.images || []
  const inStock = p.stock > 0

  const iS: React.CSSProperties = { width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', fontSize:13, color:'#0f172a', outline:'none', fontFamily:'DM Sans, sans-serif' }

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', paddingBottom:100 }}>
      {/* Header */}
      <header style={{ position:'sticky', top:0, zIndex:40, background:'white', borderBottom:'1px solid #f1f5f9', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 14px' }}>
        <button onClick={() => router.back()} style={{ width:36, height:36, borderRadius:11, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <ChevronLeft size={19} color="#0f172a"/>
        </button>
        <p style={{ fontWeight:700, fontSize:14, color:'#0f172a' }}>Product</p>
        <div style={{ display:'flex', gap:7 }}>
          <button onClick={share} style={{ width:36, height:36, borderRadius:11, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <Share2 size={16} color="#64748b"/>
          </button>
          <button onClick={toggleWL} style={{ width:36, height:36, borderRadius:11, background: wishlisted?'#fef2f2':'#f8fafc', border:`1px solid ${wishlisted?'#fecaca':'#e2e8f0'}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <Heart size={16} color={wishlisted?'#ef4444':'#64748b'} fill={wishlisted?'#ef4444':'none'}/>
          </button>
        </div>
      </header>

      {/* Image Gallery */}
      <div style={{ background:'white', marginBottom:8 }}>
        <div style={{ height:280, background:'#f8fafc', position:'relative', overflow:'hidden' }}>
          {imgs[imgIdx] ? <img src={imgs[imgIdx]} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Package size={60} color="#e2e8f0"/></div>}
          {p.flash_sale && <div style={{ position:'absolute', top:12, left:12, display:'flex', alignItems:'center', gap:4, background:'#fef3c7', padding:'4px 10px', borderRadius:99 }}><Zap size={11} fill="#d97706" color="#d97706" className="flash-pulse"/><span style={{ fontSize:11, fontWeight:800, color:'#d97706' }}>FLASH SALE</span></div>}
          {!inStock && <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,.7)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:16, fontWeight:800, color:'#94a3b8' }}>Out of Stock</span></div>}
        </div>
        {imgs.length > 1 && (
          <div style={{ display:'flex', gap:7, padding:'10px 14px', overflowX:'auto' }} className="scrollbar-hide">
            {imgs.map((img:string, i:number) => (
              <div key={i} onClick={() => setImgIdx(i)} style={{ width:56, height:56, borderRadius:10, overflow:'hidden', flexShrink:0, border:`2px solid ${i===imgIdx?'#7c3aed':'#e2e8f0'}`, cursor:'pointer' }}>
                <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding:'0 14px', display:'flex', flexDirection:'column', gap:10 }}>
        {/* Info */}
        <div style={{ background:'white', borderRadius:18, padding:16, border:'1px solid #f1f5f9' }}>
          <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
            {p.flash_sale && <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:99, background:'#fef3c7', color:'#d97706' }}>⚡ Flash Sale</span>}
            {p.offer_badge==='free_delivery' && <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:99, background:'#dcfce7', color:'#16a34a', display:'flex', alignItems:'center', gap:3 }}><Truck size={10}/>Free Delivery</span>}
            {p.authenticity_badge && <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:99, background:'#ede9fe', color:'#6d28d9' }}>✓ {p.authenticity_badge}</span>}
            {p.stock > 0 && p.stock <= 5 && <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:99, background:'#fee2e2', color:'#dc2626' }}>🔥 Only {p.stock} left!</span>}
          </div>
          <h1 style={{ fontSize:17, fontWeight:800, color:'#0f172a', marginBottom:8, lineHeight:1.3 }}>{p.name}</h1>
          <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:8 }}>
            <span style={{ fontSize:24, fontWeight:800, color:'#7c3aed' }}>৳{price}</span>
            {p.old_price && <span style={{ fontSize:15, color:'#94a3b8', textDecoration:'line-through' }}>৳{p.old_price}</span>}
            {p.old_price && <span style={{ fontSize:11, fontWeight:800, padding:'2px 7px', borderRadius:99, background:'#fee2e2', color:'#dc2626' }}>{Math.round((1-price/p.old_price)*100)}% OFF</span>}
          </div>
          {reviews?.avg_rating > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s<=Math.round(reviews.avg_rating)?'#f59e0b':'none'} color="#f59e0b"/>)}
              <span style={{ fontSize:12, fontWeight:600, color:'#64748b' }}>{reviews.avg_rating.toFixed(1)} ({reviews.total_reviews} reviews)</span>
            </div>
          )}
          {p.social_proof_count > 10 && <p style={{ fontSize:12, color:'#64748b', marginBottom:6 }}>👥 {p.social_proof_count} people bought this</p>}
          {p.stock > 0 && <p style={{ fontSize:12, color:'#10b981', fontWeight:600 }}>✓ In Stock ({p.stock} available)</p>}
        </div>

        {/* Variants */}
        {variants.length > 0 && (
          <div style={{ background:'white', borderRadius:18, padding:16, border:'1px solid #f1f5f9' }}>
            {variants.map((v:any) => (
              <div key={v.id} style={{ marginBottom:12 }}>
                <p style={{ fontSize:12, fontWeight:700, color:'#64748b', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>{v.name}</p>
                <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                  {v.options.map((o:string) => (
                    <button key={o} onClick={() => setSelVars(sv => ({...sv,[v.name]:o}))} style={{ padding:'7px 14px', borderRadius:10, border:`2px solid ${selVars[v.name]===o?'#7c3aed':'#e2e8f0'}`, background: selVars[v.name]===o?'#ede9fe':'white', color: selVars[v.name]===o?'#6d28d9':'#0f172a', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ background:'white', borderRadius:18, border:'1px solid #f1f5f9', overflow:'hidden' }}>
          <div style={{ display:'flex', borderBottom:'1px solid #f1f5f9' }}>
            {(['details','reviews','qa'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:'12px 8px', border:'none', cursor:'pointer', fontSize:12, fontWeight:700, textTransform:'capitalize', background: tab===t?'white':'#f8fafc', color: tab===t?'#6d28d9':'#94a3b8', borderBottom: tab===t?'2px solid #6d28d9':'2px solid transparent' }}>
                {t==='qa'?'Q&A':t}
              </button>
            ))}
          </div>
          <div style={{ padding:16 }}>
            {tab === 'details' && (
              <div style={{ fontSize:13, color:'#475569', lineHeight:1.7, display:'flex', flexDirection:'column', gap:10 }}>
                {p.description && <p>{p.description}</p>}
                {p.rules && (
                  <div style={{ background:'#faf5ff', borderRadius:12, padding:12, border:'1px solid #ede9fe' }}>
                    <p style={{ fontWeight:700, color:'#6d28d9', marginBottom:6, fontSize:12 }}>📋 Terms & Instructions</p>
                    <p style={{ whiteSpace:'pre-wrap', fontSize:12 }}>{p.rules}</p>
                  </div>
                )}
                {p.size_guide && (
                  <div style={{ background:'#f0fdf4', borderRadius:12, padding:12, border:'1px solid #dcfce7' }}>
                    <p style={{ fontWeight:700, color:'#16a34a', marginBottom:6, fontSize:12 }}>📏 Size Guide</p>
                    <p style={{ whiteSpace:'pre-wrap', fontSize:12 }}>{p.size_guide}</p>
                  </div>
                )}
                {!p.description && !p.rules && !p.size_guide && <p style={{ color:'#94a3b8' }}>No details available</p>}
              </div>
            )}

            {tab === 'reviews' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {reviews?.reviews?.length === 0 && <p style={{ color:'#94a3b8', fontSize:13, textAlign:'center', padding:'16px 0' }}>No reviews yet. Be the first!</p>}
                {reviews?.reviews?.map((r:any) => (
                  <div key={r.id} style={{ paddingBottom:12, borderBottom:'1px solid #f1f5f9' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#6d28d9' }}>{r.user_name?.[0]?.toUpperCase()||'U'}</div>
                      <div>
                        <p style={{ fontSize:12, fontWeight:700, color:'#0f172a' }}>{r.user_name||'User'}</p>
                        <div style={{ display:'flex', gap:2 }}>{[1,2,3,4,5].map(s => <Star key={s} size={9} fill={s<=r.rating?'#f59e0b':'none'} color="#f59e0b"/>)}</div>
                      </div>
                    </div>
                    {r.comment && <p style={{ fontSize:12, color:'#475569', marginLeft:34 }}>{r.comment}</p>}
                  </div>
                ))}
                {user && (
                  <div style={{ marginTop:4 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom:8 }}>Write a Review</p>
                    <div style={{ display:'flex', gap:5, marginBottom:8 }}>
                      {[1,2,3,4,5].map(s => <Star key={s} onClick={() => setMyRating(s)} size={22} fill={s<=myRating?'#f59e0b':'none'} color="#f59e0b" style={{ cursor:'pointer' }}/>)}
                    </div>
                    <textarea value={myComment} onChange={e => setMyComment(e.target.value)} rows={3} placeholder="Your review..." style={{ ...iS, resize:'none', marginBottom:8 }}/>
                    <button onClick={submitReview} disabled={submitting||!myRating} style={{ width:'100%', padding:'10px', borderRadius:11, border:'none', cursor:'pointer', fontWeight:700, fontSize:13, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', opacity: !myRating?0.5:1 }}>
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'qa' && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {qa.length === 0 && <p style={{ color:'#94a3b8', fontSize:13, textAlign:'center', padding:'8px 0' }}>No questions yet</p>}
                {qa.map((q:any) => (
                  <div key={q.id} style={{ background:'#f8fafc', borderRadius:12, padding:12 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:'#0f172a', marginBottom: q.is_answered?6:0 }}>Q: {q.question}</p>
                    {q.is_answered && <p style={{ fontSize:12, color:'#6d28d9', fontWeight:600 }}>A: {q.answer}</p>}
                  </div>
                ))}
                {user && (
                  <div style={{ display:'flex', gap:8, marginTop:4 }}>
                    <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question..." style={{ ...iS, flex:1 }}/>
                    <button onClick={askQuestion} disabled={!question.trim()} style={{ width:42, height:42, borderRadius:11, border:'none', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', opacity: !question.trim()?0.5:1 }}>
                      <MessageCircle size={16} color="white"/>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <p style={{ fontWeight:800, fontSize:14, color:'#0f172a', marginBottom:10 }}>Related Products</p>
            <div className="scrollbar-hide" style={{ display:'flex', gap:10, overflowX:'auto' }}>
              {related.map((r:any) => (
                <div key={r.id} onClick={() => router.push(`/product/${r.id}`)} style={{ width:120, flexShrink:0, background:'white', borderRadius:14, overflow:'hidden', border:'1px solid #f1f5f9', cursor:'pointer' }}>
                  <div style={{ height:100, background:'#f8fafc' }}>{r.images?.[0]&&<img src={r.images[0]} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/>}</div>
                  <div style={{ padding:'7px 9px' }}>
                    <p style={{ fontSize:11, fontWeight:700, color:'#0f172a' }} className="line-clamp-2">{r.name}</p>
                    <p style={{ fontSize:12, fontWeight:800, color:'#7c3aed', marginTop:3 }}>৳{r.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'white', borderTop:'1px solid #f1f5f9', padding:'12px 14px', display:'flex', gap:10 }}>
        {!inStock ? (
          <button onClick={notifyRestock} disabled={restockNotified} style={{ flex:1, padding:'13px', borderRadius:13, border:'1.5px solid #e2e8f0', background:'white', color: restockNotified?'#10b981':'#0f172a', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <Bell size={15}/> {restockNotified ? 'Will notify you!' : 'Notify When In Stock'}
          </button>
        ) : (
          <>
            <button onClick={() => addToCart(false)} disabled={adding} style={{ flex:1, padding:'13px', borderRadius:13, border:'2px solid #7c3aed', background: added?'#ede9fe':'white', color:'#7c3aed', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
              {added ? <><Check size={15}/>Added!</> : <><ShoppingCart size={15}/>Add to Cart</>}
            </button>
            <button onClick={() => addToCart(true)} disabled={adding} style={{ flex:1, padding:'13px', borderRadius:13, border:'none', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:'0 4px 14px rgba(109,40,217,.3)' }}>
              {adding ? 'Processing...' : 'Buy Now'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
