'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, X, Package, ChevronDown } from 'lucide-react'
import { api, getTelegramUser } from '../../lib/api'
import BottomNav from '../../components/BottomNav'

const SORT_OPTIONS = [
  { value: '',           label: 'Default'     },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'newest',     label: 'Newest'      },
]

export default function SearchPage() {
  const [user, setUser]           = useState<any>(null)
  const [products, setProducts]   = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch]       = useState('')
  const [selCat, setSelCat]       = useState('')
  const [sort, setSort]           = useState('')
  const [minPrice, setMinPrice]   = useState('')
  const [maxPrice, setMaxPrice]   = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    setUser(getTelegramUser())
    api.get('/api/categories').then(r => setCategories(r.data)).catch(() => {})
    api.get('/api/products').then(r => { setProducts(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = products
    .filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
      const matchCat    = !selCat  || p.category_id === selCat
      const matchMin    = !minPrice || parseFloat(p.price) >= parseFloat(minPrice)
      const matchMax    = !maxPrice || parseFloat(p.price) <= parseFloat(maxPrice)
      return matchSearch && matchCat && matchMin && matchMax
    })
    .sort((a, b) => {
      if (sort === 'price_asc')  return parseFloat(a.price) - parseFloat(b.price)
      if (sort === 'price_desc') return parseFloat(b.price) - parseFloat(a.price)
      if (sort === 'newest')     return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return 0
    })

  const activeFilters = [selCat, minPrice, maxPrice, sort].filter(Boolean).length

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            className="w-full pl-9 pr-10 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:bg-slate-100"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={15} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {/* Filter button */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition
              ${showFilter || activeFilters > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
            <SlidersHorizontal size={13} />
            Filter
            {activeFilters > 0 && <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilters}</span>}
          </button>

          {/* Sort */}
          <div className="relative flex-shrink-0">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-sm font-medium border border-slate-200 bg-white text-slate-600 outline-none cursor-pointer">
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Category pills */}
          <button onClick={() => setSelCat('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition
              ${!selCat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}>
            All
          </button>
          {categories.map((c: any) => (
            <button key={c.id} onClick={() => setSelCat(c.id === selCat ? '' : c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition
                ${selCat === c.id ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Price Filter Panel */}
        {showFilter && (
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">Price:</span>
            <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min ৳" type="number"
              className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400 bg-white" />
            <span className="text-slate-400 text-xs">–</span>
            <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max ৳" type="number"
              className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-400 bg-white" />
            {(minPrice || maxPrice) && (
              <button onClick={() => { setMinPrice(''); setMaxPrice('') }}
                className="text-xs text-rose-500 font-medium">Clear</button>
            )}
          </div>
        )}
      </header>

      <main className="px-4 py-4">
        {/* Result count */}
        <p className="text-xs text-slate-400 mb-3">
          {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
        </p>

        {filtered.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
            <Search size={48} strokeWidth={1.1} className="text-slate-200 mb-3" />
            <p className="font-medium text-slate-600">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p: any) => (
              <Link key={p.id} href={`/product/${p.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <div className="h-40 bg-slate-50 relative overflow-hidden">
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-slate-200" /></div>
                  }
                  {p.old_price && (
                    <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      {Math.round((1 - p.price / p.old_price) * 100)}% OFF
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-slate-700 line-clamp-2 mb-1">{p.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-600 font-bold text-sm">৳{p.price}</span>
                    {p.old_price && <span className="text-slate-400 text-xs line-through">৳{p.old_price}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
