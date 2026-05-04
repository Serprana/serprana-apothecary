'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MIN_BULK_OUNCES } from '@/types'

interface Herb {
  id: string
  name: string
  pricePerOunce: number
  inventoryOunces: number
  tags: string[]
  description: string
}

interface CartItem {
  herbId: string
  name: string
  ounces: number
  pricePerOunce: number
}

export default function BulkPage() {
  const [herbs, setHerbs] = useState<Herb[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [preloadedId, setPreloadedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/herbs')
      .then(r => r.json())
      .then((data: Herb[]) => {
        setHerbs(data.filter((h: Herb) => h.inventoryOunces > 0))
        setLoading(false)
      })

    const params = new URLSearchParams(window.location.search)
    setPreloadedId(params.get('herb'))
  }, [])

  const addToCart = (herb: Herb) => {
    const amount = parseFloat(amounts[herb.id] || '0.5')
    if (isNaN(amount) || amount < MIN_BULK_OUNCES) return
    if (amount > herb.inventoryOunces) return

    setCart(prev => {
      const existing = prev.find(c => c.herbId === herb.id)
      if (existing) {
        return prev.map(c => c.herbId === herb.id ? { ...c, ounces: amount } : c)
      }
      return [...prev, { herbId: herb.id, name: herb.name, ounces: amount, pricePerOunce: herb.pricePerOunce }]
    })
  }

  const removeFromCart = (herbId: string) => {
    setCart(prev => prev.filter(c => c.herbId !== herbId))
  }

  const total = cart.reduce((sum, c) => sum + c.ounces * c.pricePerOunce, 0)

  const filteredHerbs = herbs.filter(h =>
    !search || h.name.toLowerCase().includes(search.toLowerCase())
  )

  const checkoutUrl = `/checkout?type=bulk&items=${encodeURIComponent(JSON.stringify(cart))}&total=${total.toFixed(2)}`

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-forest-600 text-cream-100 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-sage-300 mb-2">Apothecary</p>
          <h1 className="font-display text-4xl font-light mb-2">Buy Single Herbs</h1>
          <p className="font-sans text-sm text-cream-300">Sold by the ounce · Minimum 0.5 oz · Pay in store</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Herb list */}
          <div className="md:col-span-3">
            <div className="mb-5">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search herbs..."
                className="w-full px-4 py-2 border border-cream-300 bg-white font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
              />
            </div>

            {loading ? (
              <div className="text-center py-12 text-forest-400 font-sans text-sm">Loading herbs...</div>
            ) : (
              <div className="space-y-3">
                {filteredHerbs.map((herb) => {
                  const inCart = cart.find(c => c.herbId === herb.id)
                  const isHighlighted = herb.id === preloadedId
                  return (
                    <div
                      key={herb.id}
                      className={`bg-white border rounded-sm p-4 transition-all ${
                        isHighlighted ? 'border-teal-400 shadow-sm' : 'border-cream-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-sans text-sm font-medium text-forest-600">{herb.name}</h3>
                            <span className="font-sans text-xs text-terracotta-500 font-medium">
                              ${herb.pricePerOunce}/oz
                            </span>
                          </div>
                          <p className="font-sans text-xs text-forest-400 line-clamp-2 mb-2">{herb.description}</p>
                          <p className="font-sans text-xs text-sage-500">
                            {herb.inventoryOunces} oz in stock
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={amounts[herb.id] || ''}
                              onChange={e => setAmounts(prev => ({ ...prev, [herb.id]: e.target.value }))}
                              placeholder="0.5"
                              min={MIN_BULK_OUNCES}
                              max={herb.inventoryOunces}
                              step={0.5}
                              className="w-20 px-2 py-1.5 border border-cream-300 font-sans text-sm text-center focus:outline-none focus:border-teal-400 rounded-sm"
                            />
                            <span className="font-sans text-xs text-forest-400">oz</span>
                          </div>
                          {inCart ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => addToCart(herb)}
                                className="font-sans text-xs px-3 py-1.5 bg-teal-100 text-teal-600 border border-teal-300 rounded-sm hover:bg-teal-200 transition-colors"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => removeFromCart(herb.id)}
                                className="font-sans text-xs px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-sm hover:bg-red-100 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(herb)}
                              className="font-sans text-xs px-4 py-1.5 bg-forest-600 text-cream-50 rounded-sm hover:bg-forest-700 transition-colors"
                            >
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                      {amounts[herb.id] && parseFloat(amounts[herb.id]) > 0 && (
                        <div className="mt-2 font-sans text-xs text-teal-600">
                          Subtotal: ${(parseFloat(amounts[herb.id]) * herb.pricePerOunce).toFixed(2)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="md:col-span-2">
            <div className="sticky top-24">
              <div className="bg-white border border-cream-300 rounded-sm shadow-sm p-5 mb-4">
                <h2 className="font-display text-xl text-forest-600 mb-4">Your Cart</h2>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-3xl mb-3 block">🌿</span>
                    <p className="font-sans text-sm text-forest-400">
                      Enter an amount and click "Add to Cart" to start.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {cart.map((item) => (
                      <div key={item.herbId} className="flex items-center gap-2 p-2 bg-cream-50 border border-cream-200 rounded-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm text-forest-600 truncate">{item.name}</p>
                          <p className="font-sans text-xs text-forest-400">{item.ounces} oz × ${item.pricePerOunce}</p>
                        </div>
                        <span className="font-sans text-sm font-medium text-forest-600 flex-shrink-0">
                          ${(item.ounces * item.pricePerOunce).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.herbId)}
                          className="text-forest-300 hover:text-red-400 transition-colors font-sans text-xs flex-shrink-0"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-cream-200 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm text-forest-500">Total</span>
                    <span className="font-display text-2xl text-terracotta-500">${total.toFixed(2)}</span>
                  </div>
                  <p className="font-sans text-xs text-forest-400 mt-1">Pay in store</p>
                </div>

                {cart.length > 0 ? (
                  <Link href={checkoutUrl} className="block w-full text-center btn-terracotta">
                    Proceed to Checkout →
                  </Link>
                ) : (
                  <button disabled className="w-full btn-terracotta opacity-40 cursor-not-allowed">
                    Add herbs to continue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
