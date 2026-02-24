import { Suspense } from 'react'
import CheckoutClient from './CheckoutClient'

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading checkout...</div>}>
      <CheckoutClient />
    </Suspense>
  )
}
