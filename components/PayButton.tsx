'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PayButton({ courseId, price }: { courseId: string; price: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function pay() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      router.push('/student')
      router.refresh()
      return
    }
    setError(data.error ?? 'Payment failed')
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={pay}
        disabled={loading}
        className="w-full rounded bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ₹${price} (demo)`}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}