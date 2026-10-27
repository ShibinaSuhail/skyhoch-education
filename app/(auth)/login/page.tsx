'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const res = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    })
    if (res?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }
    window.location.href = '/dashboard'
  }

  return (
    <main className="mx-auto max-w-sm p-6 mt-16">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="Email" required
          className="w-full border rounded p-2" />
        <input name="password" type="password" placeholder="Password" required
          className="w-full border rounded p-2" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading}
          className="w-full bg-black text-white rounded p-2 disabled:opacity-50">
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p className="text-sm mt-4">
        No account? <Link href="/register" className="underline">Register</Link>
      </p>
    </main>
  )
}