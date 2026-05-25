'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TEA_PRICE, CONDITION_CATEGORIES } from '@/types'

interface Herb {
  id: string
  name: string
  tags: string[]
  inventoryOunces: number
  pricePerOunce: number
}

interface TeaHerb {
  herbId: string
  name: string
  scoops: number
}

export default function TeaBuilderPage() {
  const [herbs, setHerbs] = useState<Herb[]>([])
  const [filteredHerbs, setFilteredHerbs] = useState<Herb[]>([])
  const [selectedHerbs, setSelectedHerbs] = useState<TeaHerb[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [recipeName, setRecipeName] = useState('')

  useEffect(() => {
    // Load herbs
    fetch('/api/herbs')
      .then(r => r.json())
      .then((data: Herb[]) => {
        setHerbs(data)
        setFilteredHerbs(data)
        setLoading(false)
      })

    // Check for pre-loaded recipe from URL
    const params = new URLSearchParams(window.location.search)
    const recipe = params.get('recipe')
    const herbsParam = params.get('herbs')
    const singleHerb = params.get('herb')

    if (recipe) setRecipeName(recipe)

    if (herbsParam) {
      // Format: "HerbName:parts,HerbName:parts"
      const preloaded = herbsParam.split(',').map(h => {
        const [name, partsStr] = h.split(':')
        return { name: decodeURIComponent(name), scoops: parseInt(partsStr) || 1 }
      })
      // Will match after herbs load
      setTimeout(() => {
        fetch('/api/herbs')
          .then(r => r.json())
          .then((data: Herb[]) => {
            const matched: TeaHerb[] = []
            preloaded.forEach(p => {
              const found = data.find((h: Herb) => h.name.toLowerCase() === p.name.toLowerCase())
              if (found) matched.push({ herbId: found.id, name: found.name, scoops: p.scoops })
            })
            setSelectedHerbs(matched)
          })
      }, 100)
    }

    if (singleHerb && !herbsParam) {
      setTimeout(() => {
        fetch('/api/herbs')
          .then(r => r.json())
          .then((data: Herb[]) => {
            const found = data.find((h: Herb) => h.id === singleHerb)
            if (found) setSelectedHerbs([{ herbId: found.id, name: found.name, scoops: 1 }])
          })
      }, 100)
    }
  }, [])

  useEffect(() => {
    let filtered = herbs.filter(h => h.inventoryOunces > 0)

    if (activeFilter) {
      const cat = CONDITION_CATEGORIES.find(c => c.label === activeFilter)
      if (cat) {
        filtered = filtered.filter(h =>
          h.tags.some(t => cat.tags.includes(t))
        )
      }
    }

    if (search) {
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredHerbs(filtered)
  }, [herbs, activeFilter, search])

  const addHerb = (herb: Herb) => {
    if (selectedHerbs.find(h => h.herbId === herb.id)) return
    setSelectedHerbs(prev => [...prev, { herbId: herb.id, name: herb.name, scoops: 1 }])
  }

  const removeHerb = (herbId: string) => {
    setSelectedHerbs(prev => prev.filter(h => h.herbId !== herbId))
  }

  const updateScoops = (herbId: string, scoops: number) => {
    if (scoops < 1) return
    setSelectedHerbs(prev => prev.map(h => h.herbId === herbId ? { ...h, scoops } : h))
  }

  const totalScoops = selectedHerbs.reduce((sum, h) => sum + h.scoops, 0)
  const isReady = selectedHerbs.length > 0

  const checkoutUrl = `/checkout?type=tea&herbs=${encodeURIComponent(JSON.stringify(selectedHerbs))}`

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-teal-400 text-cream-50 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-teal-100 mb-2">Build Your Blend</p>
          <h1 className="font-display text-4xl font-light mb-2">Custom Tea Builder</h1>
          <p className="font-sans text-sm text-teal-100">Choose up to 7 herbs · $15 flat rate · Prepared fresh for you</p>
          {recipeName && (
            <div className="mt-3 inline-block px-4 py-1 bg-white/20 rounded-sm">
              <p className="font-sans text-xs">Loaded from recipe: <span className="font-medium">{recipeName}</span></p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Herb Selection - left 3 cols */}
          <div className="md:col-span-3">
            {/* Filter by condition */}
            <div className="mb-5">
              <p className="font-sans text-xs text-forest-400 uppercase tracking-wide mb-2">Filter by concern</p>
              <div className="flex flex-wrap gap-2">
                {CONDITION_CATEGORIES.slice(0, 8).map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setActiveFilter(activeFilter === cat.label ? null : cat.label)}
                    className={`flex items-center gap-1 px-3 py-1.5 border rounded-sm font-sans text-xs transition-all ${
                      activeFilter === cat.label
                        ? 'bg-teal-400 text-white border-teal-400'
                        : 'bg-white border-cream-300 text-forest-600 hover:border-teal-300'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="mb-5">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search herbs..."
                className="w-full px-4 py-2 border border-cream-300 bg-white font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
              />
            </div>

            {/* Herbs grid */}
            {loading ? (
              <div className="text-center py-12 text-forest-400 font-sans text-sm">Loading herbs...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredHerbs.map((herb) => {
                  const isSelected = selectedHerbs.find(h => h.herbId === herb.id)
                  const isFull = selectedHerbs.length >= 7 && !isSelected
                  return (
                    <button
                      key={herb.id}
                      onClick={() => isSelected ? removeHerb(herb.id) : addHerb(herb)}
                      disabled={!!isFull}
                      className={`text-left p-3 border rounded-sm transition-all duration-150 ${
                        isSelected
                          ? 'bg-teal-50 border-teal-400 shadow-sm'
                          : isFull
                          ? 'opacity-40 cursor-not-allowed bg-white border-cream-200'
                          : 'bg-white border-cream-300 hover:border-teal-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-sans text-xs font-medium text-forest-600 leading-tight">{herb.name}</span>
                        {isSelected && <span className="text-teal-400 text-sm">✓</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {herb.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs text-forest-400">{tag}</span>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Tea Blend Summary - right 2 cols */}
          <div className="md:col-span-2">
            <div className="sticky top-24">
              <div className="bg-white border border-cream-300 rounded-sm shadow-sm p-5 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-display text-xl text-forest-600">Your Tea Blend</h2>
                  <span className="font-sans text-xs text-forest-400">{selectedHerbs.length} herbs</span>
                </div>

                {selectedHerbs.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-3xl mb-3 block">🍵</span>
                    <p className="font-sans text-sm text-forest-400">
                      Select herbs from the left to start building your blend.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {selectedHerbs.map((h) => (
                      <div key={h.herbId} className="flex items-center gap-3 p-2 bg-cream-50 border border-cream-200 rounded-sm">
                        <div className="flex-1 font-sans text-sm text-forest-600 min-w-0 truncate">{h.name}</div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => updateScoops(h.herbId, h.scoops - 1)}
                            className="w-6 h-6 flex items-center justify-center border border-cream-300 rounded-sm text-forest-500 hover:bg-cream-200 font-sans text-xs"
                          >−</button>
                          <span className="font-sans text-sm w-6 text-center text-forest-600">{h.scoops}</span>
                          <button
                            onClick={() => updateScoops(h.herbId, h.scoops + 1)}
                            className="w-6 h-6 flex items-center justify-center border border-cream-300 rounded-sm text-forest-500 hover:bg-cream-200 font-sans text-xs"
                          >+</button>
                        </div>
                        <span className="font-sans text-xs text-teal-500 w-14 text-right flex-shrink-0">
                          {h.scoops} scoop{h.scoops !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => removeHerb(h.herbId)}
                          className="text-forest-300 hover:text-red-400 transition-colors font-sans text-xs flex-shrink-0"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-cream-200 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-sm text-forest-500">Total scoops: {totalScoops}</span>
                    <span className="font-display text-2xl text-terracotta-500">${TEA_PRICE}</span>
                  </div>
                  <p className="font-sans text-xs text-forest-400 mt-1">Flat rate · Pay in store</p>
                </div>

                {isReady ? (
                  <Link href={checkoutUrl} className="block w-full text-center btn-terracotta">
                    Proceed to Checkout →
                  </Link>
                ) : (
                  <button disabled className="w-full btn-terracotta opacity-40 cursor-not-allowed">
                    Add herbs to continue
                  </button>
                )}
              </div>

              {/* Help */}
              <div className="bg-sage-50 border border-sage-200 p-4 rounded-sm text-center">
                <p className="font-sans text-xs text-forest-500 mb-1">Not sure what to add?</p>
                <Link href="/browse#concerns" className="font-sans text-xs text-teal-500">
                  Browse by concern →
                </Link>
                <span className="font-sans text-xs text-forest-300 mx-2">or</span>
                <Link href="/recipes" className="font-sans text-xs text-teal-500">
                  start from a recipe →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
