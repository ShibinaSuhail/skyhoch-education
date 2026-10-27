'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const body = {
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password'),
    }
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      setError((await res.json()).error ?? 'Something went wrong')
      setLoading(false)
      return
    }
    await signIn('credentials', {
      email: body.email,
      password: body.password,
      redirect: false,
    })
    window.location.href = '/dashboard'
  }

  return (
    <main className="mx-auto max-w-sm p-6 mt-16">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input name="name" placeholder="Full name" required
          className="w-full border rounded p-2" />
        <input name="email" type="email" placeholder="Email" required
          className="w-full border rounded p-2" />
        <input name="password" type="password" placeholder="Password (min 8)" required
          className="w-full border rounded p-2" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading}
          className="w-full bg-black text-white rounded p-2 disabled:opacity-50">
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p className="text-sm mt-4">
        Already registered? <Link href="/login" className="underline">Login</Link>
      </p>
    </main>
  )
}