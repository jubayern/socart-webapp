'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, ShoppingCart, Star } from 'lucide-react'
import { api, getTelegramUser } from '../lib/api'
import BottomNav from '../components/BottomNav'

export default function Home() {
  const [user, setUser]           = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts]   = useState<any[]>([])
  const [featured, setFeatured]   = useState<any[]>([])
  const [selectedCat, setSelectedCat] = useState('')
  const [search, setSearch]       = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading]     = useState(true)
  const [addingId, setAddingId]   = useState<string | null>(null)
  const [addedId, setAddedId]     = useState<string | null>(null)

  useEffect(() => {
    const u = getTelegramUser()
    setUser(u)
    if (u) {
      api.post('/api/users/register', {
        telegram_id: u.id,
        name: `${u.first_name} ${u.last_name || ''}`.trim(),
        username: u.username,
      }).catch(() => {})
      api.get(`/api/cart/${u.id}`)
        .then(r => setCartCount(r.data.length))
        .catch(() => {})
    }
    loadData()
  }, [])

  const loadData = async () => {
    const [cats, prods, feat] = await Promise.all([
      api.get('/api/categories').then(r => r.data).catch(() => []),
      api.get('/api/products').then(r => r.data).catch(() => []),
      api.get('/api/products?featured=true').then(r => r.data).catch(() => []),
    ])
    setCategories(cats)
    setProducts(prods)
    setFeatured(feat)
    setLoading(false)
  }

  const addToCart = async (productId: string) => {
    if (!user || addingId) return
    setAddingId(productId)
    try {
      await api.post('/api/cart/add', { telegram_id: user.id, product_id: productId, quantity: 1 })
      setCartCount(c => c + 1)
      setAddedId(productId)
      setTimeout(() => setAddedId(null), 1500)
    } catch {}
    setAddingId(null)
  }

  const filtered = products.filter((p: any) => {
    const matchCat    = selectedCat ? p.category_id === selectedCat : true
    const matchSearch = search ? p.name.toLowerCase().includes(search.toLowerCase()) : true
    return matchCat && matchSearch
  })

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-bg">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm font-medium">Loading SoCart...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg pb-24">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">SoCart</h1>
            {user && <p className="text-xs text-slate-400">Hi, {user.first_name}</p>}
          </div>
          <Link href="/cart" className="relative p-2 rounded-xl bg-slate-50">
            <ShoppingCart size={20} className="text-slate-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:bg-slate-100"
          />
        </div>
      </header>

      <main className="px-4 pt-4 space-y-5">

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setSelectedCat('')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition
              ${!selectedCat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            All
          </button>
          {categories.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition
                ${selectedCat === c.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Featured */}
        {!search && !selectedCat && featured.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Star size={15} className="text-amber-400 fill-amber-400" />
              <h2 className="text-sm font-semibold text-slate-700">Featured</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {featured.map((p: any) => (
                <Link key={p.id} href={`/product/${p.id}`}
                  className="flex-shrink-0 w-36 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                  <div className="h-28 bg-slate-50 overflow-hidden">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><ShoppingCart size={28} className="text-slate-200" /></div>
                    }
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-slate-700 line-clamp-2">{p.name}</p>
                    <p className="text-blue-600 font-bold text-sm mt-0.5">৳{p.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section>
          {!search && !selectedCat && (
            <h2 className="text-sm font-semibold text-slate-700 mb-3">All Products</h2>
          )}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Search size={40} strokeWidth={1.2} className="mb-3 text-slate-200" />
              <p className="font-medium">No products found</p>
              <p className="text-sm mt-1">Try a different search</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((p: any) => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                  <Link href={`/product/${p.id}`}>
                    <div className="h-40 bg-slate-50 relative overflow-hidden">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ShoppingCart size={32} className="text-slate-200" /></div>
                      }
                      {p.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded-lg">Out of Stock</span>
                        </div>
                      )}
                      {p.old_price && (
                        <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          {Math.round((1 - p.price / p.old_price) * 100)}% OFF
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <p className="text-xs font-medium text-slate-700 line-clamp-2 mb-1.5">{p.name}</p>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="text-blue-600 font-bold text-sm">৳{p.price}</span>
                      {p.old_price && (
                        <span className="text-slate-400 text-xs line-through">৳{p.old_price}</span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(p.id)}
                      disabled={p.stock === 0 || addingId === p.id}
                      className={`w-full py-1.5 rounded-lg text-xs font-semibold transition
                        ${addedId === p.id
                          ? 'bg-green-500 text-white'
                          : p.stock === 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white active:bg-blue-700'
                        }`}
                    >
                      {addedId === p.id ? 'Added!' : addingId === p.id ? '...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav cartCount={cartCount} />
    </div>
  )
}
