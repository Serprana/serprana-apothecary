'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TEA_PRICE } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const [type, setType] = useState<'tea' | 'bulk' | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('type') as 'tea' | 'bulk'
    setType(t)

    if (t === 'tea') {
      const herbsParam = params.get('herbs')
      if (herbsParam) {
        setItems(JSON.parse(decodeURIComponent(herbsParam)))
        setTotal(TEA_PRICE)
      }
    } else if (t === 'bulk') {
      const itemsParam = params.get('items')
      const totalParam = params.get('total')
      if (itemsParam) setItems(JSON.parse(decodeURIComponent(itemsParam)))
      if (totalParam) setTotal(parseFloat(totalParam))
    }
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone.trim()) e.phone = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: `${form.firstName} ${form.lastName}`,
          customerEmail: form.email,
          customerPhone: form.phone,
          type,
          items,
          total,
        }),
      })

      const data = await res.json()
      if (data.orderId) {
        router.push(`/receipt/${data.orderId}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-forest-600 text-cream-100 py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-sage-300 mb-2">Almost There</p>
          <h1 className="font-display text-4xl font-light">Checkout</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-white border border-cream-300 rounded-sm p-5 sticky top-24">
              <h2 className="font-display text-xl text-forest-600 mb-4">Order Summary</h2>

              {type === 'tea' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🍵</span>
                    <span className="font-sans text-sm font-medium text-forest-600">Custom Tea Blend</span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {items.map((h: any, i: number) => (
                      <div key={i} className="flex justify-between font-sans text-xs text-forest-500 py-1 border-b border-cream-100">
                        <span>{h.name}</span>
                        <span className="text-teal-500">{h.scoops} scoop{h.scoops !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {type === 'bulk' && (
                <div className="space-y-1 mb-4">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between font-sans text-xs text-forest-500 py-1 border-b border-cream-100">
                      <span>{item.name} ({item.ounces} oz)</span>
                      <span>${(item.ounces * item.pricePerOunce).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-cream-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm text-forest-500">Total Due</span>
                  <span className="font-display text-2xl text-terracotta-500">${total.toFixed(2)}</span>
                </div>
                <p className="font-sans text-xs text-forest-400 mt-1">Pay at the counter after submitting</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3 order-1 md:order-2">
            <div className="bg-white border border-cream-300 rounded-sm p-6">
              <h2 className="font-display text-xl text-forest-600 mb-5">Your Information</h2>
              <p className="font-sans text-xs text-forest-400 mb-6">
                We'll use this to prepare your order and keep a record for you.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                      className={`w-full px-3 py-2 border font-sans text-sm focus:outline-none rounded-sm ${
                        errors.firstName ? 'border-red-400' : 'border-cream-300 focus:border-teal-400'
                      }`}
                    />
                    {errors.firstName && <p className="font-sans text-xs text-red-500 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                      className={`w-full px-3 py-2 border font-sans text-sm focus:outline-none rounded-sm ${
                        errors.lastName ? 'border-red-400' : 'border-cream-300 focus:border-teal-400'
                      }`}
                    />
                    {errors.lastName && <p className="font-sans text-xs text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className={`w-full px-3 py-2 border font-sans text-sm focus:outline-none rounded-sm ${
                      errors.email ? 'border-red-400' : 'border-cream-300 focus:border-teal-400'
                    }`}
                  />
                  {errors.email && <p className="font-sans text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className={`w-full px-3 py-2 border font-sans text-sm focus:outline-none rounded-sm ${
                      errors.phone ? 'border-red-400' : 'border-cream-300 focus:border-teal-400'
                    }`}
                  />
                  {errors.phone && <p className="font-sans text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-terracotta text-base disabled:opacity-60"
                  >
                    {loading ? 'Placing Order...' : 'Place Order & Get Receipt →'}
                  </button>
                  <p className="font-sans text-xs text-center text-forest-400 mt-3">
                    No payment required online. Pay at the counter.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
