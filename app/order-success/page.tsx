'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ShoppingBag } from 'lucide-react'

function SuccessContent() {
  const params = useSearchParams()
  const order  = params.get('order')

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-sm w-full text-center">

        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-green-500" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h1>
        <p className="text-slate-500 text-sm mb-5">
          Your order has been successfully placed. You will receive a Telegram notification shortly.
        </p>

        {order && (
          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <p className="text-xs text-slate-400 mb-1">Order Number</p>
            <p className="text-xl font-bold text-blue-600 tracking-wider">{order}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm"
          >
            <Package size={16} />
            Track My Order
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-semibold text-sm"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccess() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
