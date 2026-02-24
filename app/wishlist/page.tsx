'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Package, Trash2 } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

export default function WishlistPage() {
  const router = useRouter()
  const [wishlist, setWishlist] = useState<any[]>([])
  const [user, setUser]         = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedId, setAddedId]   = useState<string | null>(null)

  useEffect(() => {
    const u = getTelegramUser()
    setUser(u)
    if (u) {
      api.get(`/api/wishlist/${u.id}`)
        .then(r => { setWishlist(r.data); setLoading(false) })
        .catch(() => setLoading(false))
    } else setLoading(false)
  }, [])

  const remove = async (productId: string) => {
    if (!user) return
    await api.delete(`/api/wishlist/remove/${user.id}/${productId}`)
    setWishlist(w => w.filter(i => i.product_id !== productId))
  }

  const addToCart = async (productId: string) => {
    if (!user || addingId) return
    setAddingId(productId)
    try {
      await api.post('/api/cart/add', { telegram_id: user.id, product_id: productId, quantity: 1 })
      setAddedId(productId)
      setTimeout(() => setAddedId(null), 1500)
    } catch {}
    setAddingId(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-bg">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3">
        <h1 className="font-semibold text-slate-800">Wishlist</h1>
      </header>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400 text-center px-8">
          <Heart size={56} strokeWidth={1.1} className="text-slate-200 mb-4" />
          <p className="font-semibold text-slate-600">No saved items</p>
          <p className="text-sm mt-1 mb-5">Tap the heart icon on any product to save it</p>
          <Link href="/" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm">Browse Products</Link>
        </div>
      ) : (
        <div className="px-4 py-4 grid grid-cols-2 gap-3">
          {wishlist.map((item: any) => {
            const p = item.products
            return (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <Link href={`/product/${p?.id}`}>
                  <div className="h-40 bg-slate-50 relative">
                    {p?.images?.[0]
                      ? <img src={p.images[0]} alt={p?.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-slate-200" /></div>
                    }
                    {p?.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded-lg">Out of Stock</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <p className="text-xs font-medium text-slate-700 line-clamp-2 mb-1.5">{p?.name}</p>
                  <p className="text-blue-600 font-bold text-sm mb-2.5">৳{p?.price}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(p?.id)}
                      disabled={p?.stock === 0 || addingId === p?.id}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition
                        ${addedId === p?.id ? 'bg-green-500 text-white' : p?.stock === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white'}`}>
                      {addedId === p?.id ? 'Added!' : <span className="flex items-center justify-center gap-1"><ShoppingCart size={12} /> Add</span>}
                    </button>
                    <button
                      onClick={() => remove(p?.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <BottomNav wishlistCount={wishlist.length} />
    </div>
  )
}
