'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ShoppingCart, CheckCircle, Tag, Package } from 'lucide-react'
import { api, getTelegramUser } from '../../../lib/api'

export default function ProductDetail() {
  const { id }   = useParams()
  const router   = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [user, setUser]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx]   = useState(0)
  const [adding, setAdding]   = useState(false)
  const [added, setAdded]     = useState(false)

  useEffect(() => {
    setUser(getTelegramUser())
    api.get(`/api/products/${id}`)
      .then(r => { setProduct(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const addToCart = async () => {
    if (!user || adding) return
    setAdding(true)
    try {
      await api.post('/api/cart/add', { telegram_id: user.id, product_id: id, quantity: 1 })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {}
    setAdding(false)
  }

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
        <h1 className="font-semibold text-slate-800 truncate">{product.name}</h1>
      </header>

      {/* Image Gallery */}
      <div className="bg-white">
        <div className="h-72 bg-slate-50 relative overflow-hidden">
          {product.images?.length > 0
            ? <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                <Package size={64} strokeWidth={1} className="text-slate-200" />
              </div>
          }
          {product.old_price && (
            <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              {Math.round((1 - product.price / product.old_price) * 100)}% OFF
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {product.images?.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
            {product.images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition
                  ${i === imgIdx ? 'border-blue-600' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-4 space-y-4">

        {/* Category badge */}
        {product.categories?.name && (
          <div className="flex items-center gap-1.5">
            <Tag size={13} className="text-blue-500" />
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {product.categories.name}
            </span>
          </div>
        )}

        <h2 className="text-xl font-bold text-slate-900 leading-snug">{product.name}</h2>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-blue-600">৳{product.price}</span>
          {product.old_price && (
            <span className="text-slate-400 text-lg line-through">৳{product.old_price}</span>
          )}
        </div>

        {/* Stock */}
        <div className={`flex items-center gap-1.5 text-sm font-medium
          ${product.stock > 0 ? 'text-green-600' : 'text-rose-500'}`}>
          <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-rose-500'}`} />
          {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Description */}
        {product.description && (
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
            <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4">
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/cart')}
            className="flex-1 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            <ShoppingCart size={17} />
            View Cart
          </button>
          <button
            onClick={addToCart}
            disabled={adding || product.stock === 0}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition
              ${added ? 'bg-green-500' : product.stock === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 active:bg-blue-700'}`}
          >
            {added ? <><CheckCircle size={17} /> Added!</> : <><ShoppingCart size={17} /> Add to Cart</>}
          </button>
        </div>
      </div>
    </div>
  )
}
