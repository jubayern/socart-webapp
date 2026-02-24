'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ShoppingCart, CheckCircle, Tag, Package, Heart, Star } from 'lucide-react'
import { api, getTelegramUser } from '../../../lib/api'

export default function ProductDetail() {
  const { id }   = useParams()
  const router   = useRouter()
  const [product, setProduct]   = useState<any>(null)
  const [variants, setVariants] = useState<any[]>([])
  const [reviews, setReviews]   = useState<any>(null)
  const [user, setUser]         = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [imgIdx, setImgIdx]     = useState(0)
  const [adding, setAdding]     = useState(false)
  const [added, setAdded]       = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [tab, setTab]           = useState<'details'|'reviews'>('details')
  const [selectedVars, setSelectedVars] = useState<Record<string,string>>({})

  // Review form
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)

  useEffect(() => {
    const u = getTelegramUser()
    setUser(u)
    Promise.all([
      api.get(`/api/products/${id}`).then(r => setProduct(r.data)).catch(() => {}),
      api.get(`/api/variants/${id}`).then(r => setVariants(r.data)).catch(() => {}),
      api.get(`/api/reviews/${id}`).then(r => setReviews(r.data)).catch(() => {}),
      u ? api.get(`/api/wishlist/check/${u.id}/${id}`).then(r => setWishlisted(r.data.wishlisted)).catch(() => {}) : Promise.resolve(),
    ]).finally(() => setLoading(false))
  }, [id])

  const addToCart = async () => {
    if (!user || adding) return
    // Check if all variants selected
    for (const v of variants) {
      if (!selectedVars[v.name]) { alert(`Please select ${v.name}`); return }
    }
    setAdding(true)
    try {
      await api.post('/api/cart/add', { telegram_id: user.id, product_id: id, quantity: 1 })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {}
    setAdding(false)
  }

  const toggleWishlist = async () => {
    if (!user) return
    if (wishlisted) {
      await api.delete(`/api/wishlist/remove/${user.id}/${id}`).catch(() => {})
      setWishlisted(false)
    } else {
      await api.post('/api/wishlist/add', { telegram_id: user.id, product_id: id }).catch(() => {})
      setWishlisted(true)
    }
  }

  const submitReview = async () => {
    if (!user || !myRating) return
    setSubmitting(true)
    try {
      await api.post('/api/reviews/', {
        product_id:  id,
        telegram_id: user.id,
        user_name:   `${user.first_name} ${user.last_name || ''}`.trim(),
        rating:      myRating,
        comment:     myComment || null,
      })
      const r = await api.get(`/api/reviews/${id}`)
      setReviews(r.data)
      setSubmitted(true)
      setMyComment('')
    } catch {}
    setSubmitting(false)
  }

  const renderStars = (rating: number, size = 14, interactive = false, onSelect?: (n: number) => void) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onClick={() => interactive && onSelect && onSelect(n)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}>
          <Star size={size}
            className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
        </button>
      ))}
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-bg">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!product) return (
    <div className="flex flex-col items-center justify-center h-screen text-slate-400">
      <Package size={48} strokeWidth={1.2} className="text-slate-200 mb-3" />
      <p className="font-medium">Product not found</p>
      <button onClick={() => router.back()} className="mt-4 text-blue-600 text-sm font-medium">Go back</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg pb-28">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-slate-50">
          <ChevronLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="font-semibold text-slate-800 flex-1 truncate">{product.name}</h1>
        <button onClick={toggleWishlist} className="p-2 rounded-xl bg-slate-50">
          <Heart size={20} className={wishlisted ? 'text-rose-500 fill-rose-500' : 'text-slate-400'} />
        </button>
      </header>

      {/* Images */}
      <div className="bg-white">
        <div className="h-72 bg-slate-50 relative overflow-hidden">
          {product.images?.length > 0
            ? <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Package size={64} strokeWidth={1} className="text-slate-200" /></div>
          }
          {product.old_price && (
            <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              {Math.round((1 - product.price / product.old_price) * 100)}% OFF
            </div>
          )}
        </div>
        {product.images?.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
            {product.images.map((img: string, i: number) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition
                  ${i === imgIdx ? 'border-blue-600' : 'border-transparent'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-4 space-y-4">
        {product.categories?.name && (
          <div className="flex items-center gap-1.5">
            <Tag size={13} className="text-blue-500" />
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{product.categories.name}</span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{product.name}</h2>
            {reviews?.total > 0 && (
              <button onClick={() => setTab('reviews')} className="flex items-center gap-1 mt-1">
                {renderStars(Math.round(reviews.average))}
                <span className="text-xs text-slate-400 ml-1">{reviews.average} ({reviews.total})</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-blue-600">৳{product.price}</span>
          {product.old_price && <span className="text-slate-400 text-lg line-through">৳{product.old_price}</span>}
        </div>

        <div className={`flex items-center gap-1.5 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-rose-500'}`}>
          <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-rose-500'}`} />
          {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
        </div>

        {/* Variants */}
        {variants.map(v => (
          <div key={v.id}>
            <p className="text-sm font-semibold text-slate-700 mb-2">{v.name}</p>
            <div className="flex flex-wrap gap-2">
              {v.options.map((opt: string) => (
                <button key={opt} onClick={() => setSelectedVars(sv => ({ ...sv, [v.name]: opt }))}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition
                    ${selectedVars[v.name] === opt ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {(['details','reviews'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium capitalize transition border-b-2
                ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>
              {t === 'reviews' ? `Reviews (${reviews?.total || 0})` : 'Details'}
            </button>
          ))}
        </div>

        {tab === 'details' && product.description && (
          <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{product.description}</p>
        )}

        {tab === 'reviews' && (
          <div className="space-y-4">
            {/* Summary */}
            {reviews?.total > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-slate-900">{reviews.average}</p>
                  {renderStars(Math.round(reviews.average), 16)}
                  <p className="text-xs text-slate-400 mt-1">{reviews.total} reviews</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5,4,3,2,1].map(n => (
                    <div key={n} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-2">{n}</span>
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${reviews.total ? (reviews.breakdown[n] / reviews.total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-4">{reviews.breakdown[n]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Write Review */}
            {user && !submitted && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <p className="font-semibold text-slate-800 mb-3 text-sm">Write a Review</p>
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1.5">Rating *</p>
                  {renderStars(myRating, 28, true, setMyRating)}
                </div>
                <textarea value={myComment} onChange={e => setMyComment(e.target.value)}
                  placeholder="Share your experience... (optional)" rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none mb-3" />
                <button onClick={submitReview} disabled={!myRating || submitting}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}
            {submitted && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center text-green-700 text-sm font-medium">
                Review submitted! Thank you.
              </div>
            )}

            {/* Review List */}
            {(reviews?.reviews || []).length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-6">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {reviews.reviews.map((r: any) => (
                  <div key={r.id} className="bg-white rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{r.user_name}</p>
                        <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('en-GB')}</p>
                      </div>
                      {renderStars(r.rating)}
                    </div>
                    {r.comment && <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4">
        <div className="flex gap-3">
          <button onClick={() => router.push('/cart')}
            className="flex-1 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
            <ShoppingCart size={17} /> View Cart
          </button>
          <button onClick={addToCart} disabled={adding || product.stock === 0}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition
              ${added ? 'bg-green-500' : product.stock === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 active:bg-blue-700'}`}>
            {added ? <><CheckCircle size={17} /> Added!</> : <><ShoppingCart size={17} /> Add to Cart</>}
          </button>
        </div>
      </div>
    </div>
  )
}
