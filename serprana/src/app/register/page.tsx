'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    // Auto sign in after registration
    await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    router.push('/account')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-display text-3xl text-forest-600 mb-1">Serprana</div>
          <div className="font-sans text-xs tracking-widest text-terracotta-500 uppercase">Apothecary</div>
          <p className="font-sans text-sm text-forest-400 mt-4">Create your account</p>
        </div>

        <div className="bg-white border border-cream-300 rounded-sm shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">First Name *</label>
                <input
                  required
                  value={form.firstName}
                  onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                />
              </div>
              <div>
                <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Last Name *</label>
                <input
                  required
                  value={form.lastName}
                  onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Password *</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="font-sans text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-sans text-xs text-forest-400">
              Already have an account?{' '}
              <Link href="/login" className="text-teal-500 hover:text-teal-600 transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="font-sans text-xs text-forest-400 hover:text-forest-600 transition-colors">
            ← Back to Apothecary
          </Link>
        </div>
      </div>
    </div>
  )
}
