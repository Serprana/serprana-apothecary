'use client'

import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = 'Serprana1111!'

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  type: string
  items: any[]
  total: number
  ownerShare: number
  storeShare: number
  createdAt: string
}

interface Herb {
  id: string
  name: string
  pricePerOunce: number
  inventoryOunces: number
  active: boolean
  tags: string[]
}

interface Summary {
  count: number
  totalRevenue: number
  ownerTotal: number
  storeTotal: number
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [wrongPassword, setWrongPassword] = useState(false)
  const [tab, setTab] = useState<'orders' | 'herbs' | 'add-herb'>('orders')
  const [period, setPeriod] = useState('month')
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [herbs, setHerbs] = useState<Herb[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingHerbs, setLoadingHerbs] = useState(false)
  const [editingHerb, setEditingHerb] = useState<Herb | null>(null)
  const [editForm, setEditForm] = useState<Partial<Herb>>({})
  const [newHerbForm, setNewHerbForm] = useState({
    name: '', spanishName: '', latinName: '', description: '',
    pricePerOunce: '', inventoryOunces: '', tags: '', energetics: '',
    taste: '', partsUsed: '', contraindications: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
    } else {
      setWrongPassword(true)
    }
  }

  useEffect(() => {
    if (!authenticated) return
    if (tab === 'orders') loadOrders()
    if (tab === 'herbs') loadHerbs()
  }, [authenticated, tab, period])

  const loadOrders = async () => {
    setLoadingOrders(true)
    const res = await fetch(`/api/orders?period=${period}`)
    const data = await res.json()
    setOrders(data.orders)
    setSummary(data.summary)
    setLoadingOrders(false)
  }

  const loadHerbs = async () => {
    setLoadingHerbs(true)
    const res = await fetch('/api/admin/herbs')
    const data = await res.json()
    setHerbs(data)
    setLoadingHerbs(false)
  }

  const startEdit = (herb: Herb) => {
    setEditingHerb(herb)
    setEditForm({
      name: herb.name,
      pricePerOunce: herb.pricePerOunce,
      inventoryOunces: herb.inventoryOunces,
    })
  }

  const saveEdit = async () => {
    if (!editingHerb) return
    setSaving(true)
    await fetch(`/api/admin/herbs/${editingHerb.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditingHerb(null)
    setMessage('Herb updated!')
    await loadHerbs()
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const deactivateHerb = async (herbId: string) => {
    if (!confirm('Remove this herb from the store? It can be reactivated in the database.')) return
    await fetch(`/api/admin/herbs/${herbId}`, { method: 'DELETE' })
    setMessage('Herb removed from store.')
    await loadHerbs()
    setTimeout(() => setMessage(''), 3000)
  }

  const reactivateHerb = async (herbId: string) => {
    await fetch(`/api/admin/herbs/${herbId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true }),
    })
    setMessage('Herb reactivated.')
    await loadHerbs()
    setTimeout(() => setMessage(''), 3000)
  }

  const addNewHerb = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const tags = newHerbForm.tags.split(',').map(t => t.trim()).filter(Boolean)
    await fetch('/api/admin/herbs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newHerbForm,
        pricePerOunce: parseFloat(newHerbForm.pricePerOunce),
        inventoryOunces: parseFloat(newHerbForm.inventoryOunces),
        tags,
        active: true,
        featured: false,
      }),
    })
    setMessage('New herb added!')
    setNewHerbForm({
      name: '', spanishName: '', latinName: '', description: '',
      pricePerOunce: '', inventoryOunces: '', tags: '', energetics: '',
      taste: '', partsUsed: '', contraindications: ''
    })
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  // Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-forest-600 flex items-center justify-center px-4">
        <div className="bg-white rounded-sm shadow-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="font-display text-2xl text-forest-600 mb-1">Serprana</div>
            <div className="font-sans text-xs tracking-widest text-terracotta-500 uppercase mb-4">Admin Dashboard</div>
          </div>
          <form onSubmit={handleLogin}>
            <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm mb-3"
              placeholder="Enter admin password"
              autoFocus
            />
            {wrongPassword && (
              <p className="font-sans text-xs text-red-500 mb-3">Incorrect password.</p>
            )}
            <button type="submit" className="w-full btn-primary">
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Admin Header */}
      <div className="bg-forest-600 text-cream-100 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div>
            <span className="font-display text-xl">Serprana</span>
            <span className="font-sans text-xs text-sage-300 ml-2 uppercase tracking-wide">Admin</span>
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="font-sans text-xs text-cream-400 hover:text-cream-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success message */}
        {message && (
          <div className="mb-4 p-3 bg-sage-50 border border-sage-300 rounded-sm">
            <p className="font-sans text-sm text-forest-600">✓ {message}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white border border-cream-300 rounded-sm p-1 w-fit">
          {(['orders', 'herbs', 'add-herb'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 font-sans text-sm rounded-sm transition-all ${
                tab === t
                  ? 'bg-forest-600 text-cream-50'
                  : 'text-forest-500 hover:bg-cream-100'
              }`}
            >
              {t === 'orders' ? 'Orders & Revenue' : t === 'herbs' ? 'Manage Herbs' : 'Add New Herb'}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            {/* Period Filter */}
            <div className="flex gap-2 mb-6">
              {['today', 'week', 'month', 'all'].map(p => (
                <button
                  key={p}
                  onClick={() => { setPeriod(p); loadOrders() }}
                  className={`px-4 py-2 font-sans text-xs rounded-sm border transition-all capitalize ${
                    period === p
                      ? 'bg-teal-400 text-white border-teal-400'
                      : 'bg-white border-cream-300 text-forest-600 hover:border-teal-300'
                  }`}
                >
                  {p === 'all' ? 'All Time' : `This ${p.charAt(0).toUpperCase() + p.slice(1)}`}
                </button>
              ))}
            </div>

            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-cream-300 rounded-sm p-4">
                  <p className="font-sans text-xs text-forest-400 uppercase tracking-wide mb-1">Orders</p>
                  <p className="font-display text-3xl text-forest-600">{summary.count}</p>
                </div>
                <div className="bg-white border border-cream-300 rounded-sm p-4">
                  <p className="font-sans text-xs text-forest-400 uppercase tracking-wide mb-1">Total Revenue</p>
                  <p className="font-display text-3xl text-forest-600">${summary.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-teal-50 border border-teal-200 rounded-sm p-4">
                  <p className="font-sans text-xs text-teal-600 uppercase tracking-wide mb-1">Owner (75%)</p>
                  <p className="font-display text-3xl text-teal-600">${summary.ownerTotal.toFixed(2)}</p>
                </div>
                <div className="bg-sage-50 border border-sage-200 rounded-sm p-4">
                  <p className="font-sans text-xs text-sage-600 uppercase tracking-wide mb-1">Store (25%)</p>
                  <p className="font-display text-3xl text-sage-600">${summary.storeTotal.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Orders List */}
            {loadingOrders ? (
              <p className="font-sans text-sm text-forest-400 text-center py-8">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="font-sans text-sm text-forest-400 text-center py-8">No orders found for this period.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const items = order.items as any[]
                  return (
                    <div key={order.id} className="bg-white border border-cream-300 rounded-sm p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-sans text-sm font-medium text-forest-600">{order.customerName}</span>
                            <span className={`font-sans text-xs px-2 py-0.5 rounded-full ${
                              order.type === 'tea'
                                ? 'bg-teal-100 text-teal-600'
                                : 'bg-sage-100 text-sage-600'
                            }`}>
                              {order.type === 'tea' ? '🍵 Custom Tea' : '🌿 Bulk Herbs'}
                            </span>
                          </div>
                          <p className="font-sans text-xs text-forest-400">
                            {order.customerEmail} · {order.customerPhone}
                          </p>
                          <p className="font-sans text-xs text-forest-400 mt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {items.slice(0, 5).map((item: any, i: number) => (
                              <span key={i} className="font-sans text-xs text-forest-500 bg-cream-100 px-2 py-0.5 rounded-sm">
                                {item.name}{item.scoops ? ` ×${item.scoops}` : item.ounces ? ` (${item.ounces}oz)` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-display text-2xl text-terracotta-500">${order.total.toFixed(2)}</p>
                          <p className="font-sans text-xs text-forest-400">Owner: ${order.ownerShare.toFixed(2)}</p>
                          <p className="font-sans text-xs text-forest-400">Store: ${order.storeShare.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Herbs Tab */}
        {tab === 'herbs' && (
          <div>
            {loadingHerbs ? (
              <p className="font-sans text-sm text-forest-400 text-center py-8">Loading herbs...</p>
            ) : (
              <div className="space-y-2">
                {herbs.map((herb) => (
                  <div key={herb.id} className={`bg-white border rounded-sm p-4 transition-all ${
                    !herb.active ? 'opacity-50 border-red-100 bg-red-50' : 'border-cream-300'
                  }`}>
                    {editingHerb?.id === herb.id ? (
                      <div className="flex flex-wrap gap-3 items-end">
                        <div>
                          <label className="font-sans text-xs text-forest-400 block mb-1">Name</label>
                          <input
                            value={editForm.name || ''}
                            onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                            className="px-2 py-1.5 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400 w-48"
                          />
                        </div>
                        <div>
                          <label className="font-sans text-xs text-forest-400 block mb-1">Price/oz</label>
                          <input
                            type="number"
                            value={editForm.pricePerOunce || ''}
                            onChange={e => setEditForm(p => ({ ...p, pricePerOunce: parseFloat(e.target.value) }))}
                            className="px-2 py-1.5 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400 w-24"
                            step="0.5"
                          />
                        </div>
                        <div>
                          <label className="font-sans text-xs text-forest-400 block mb-1">Inventory (oz)</label>
                          <input
                            type="number"
                            value={editForm.inventoryOunces || ''}
                            onChange={e => setEditForm(p => ({ ...p, inventoryOunces: parseFloat(e.target.value) }))}
                            className="px-2 py-1.5 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400 w-24"
                            step="0.5"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="px-3 py-1.5 bg-teal-400 text-white font-sans text-xs rounded-sm hover:bg-teal-500 disabled:opacity-60"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingHerb(null)}
                            className="px-3 py-1.5 border border-cream-300 text-forest-500 font-sans text-xs rounded-sm hover:bg-cream-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-sans text-sm font-medium text-forest-600">{herb.name}</span>
                            {!herb.active && (
                              <span className="font-sans text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Inactive</span>
                            )}
                            <span className={`font-sans text-xs px-2 py-0.5 rounded-full ${
                              herb.inventoryOunces <= 0
                                ? 'bg-red-100 text-red-600'
                                : herb.inventoryOunces <= 2
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-sage-100 text-sage-600'
                            }`}>
                              {herb.inventoryOunces} oz
                              {herb.inventoryOunces <= 0 ? ' — OUT OF STOCK' : herb.inventoryOunces <= 2 ? ' — LOW' : ''}
                            </span>
                          </div>
                          <p className="font-sans text-xs text-terracotta-500">${herb.pricePerOunce}/oz</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => startEdit(herb)}
                            className="font-sans text-xs px-3 py-1.5 border border-cream-300 text-forest-500 rounded-sm hover:bg-cream-100 transition-colors"
                          >
                            Edit
                          </button>
                          {herb.active ? (
                            <button
                              onClick={() => deactivateHerb(herb.id)}
                              className="font-sans text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-sm hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => reactivateHerb(herb.id)}
                              className="font-sans text-xs px-3 py-1.5 border border-sage-300 text-sage-600 rounded-sm hover:bg-sage-50 transition-colors"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Herb Tab */}
        {tab === 'add-herb' && (
          <div className="max-w-2xl">
            <div className="bg-white border border-cream-300 rounded-sm p-6">
              <h2 className="font-display text-xl text-forest-600 mb-5">Add New Herb</h2>
              <form onSubmit={addNewHerb} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Name *</label>
                    <input
                      required
                      value={newHerbForm.name}
                      onChange={e => setNewHerbForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Spanish Name</label>
                    <input
                      value={newHerbForm.spanishName}
                      onChange={e => setNewHerbForm(p => ({ ...p, spanishName: e.target.value }))}
                      className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Latin Name</label>
                  <input
                    value={newHerbForm.latinName}
                    onChange={e => setNewHerbForm(p => ({ ...p, latinName: e.target.value }))}
                    className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Description *</label>
                  <textarea
                    required
                    value={newHerbForm.description}
                    onChange={e => setNewHerbForm(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Price/oz *</label>
                    <input
                      required
                      type="number"
                      step="0.5"
                      value={newHerbForm.pricePerOunce}
                      onChange={e => setNewHerbForm(p => ({ ...p, pricePerOunce: e.target.value }))}
                      className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Initial Inventory (oz) *</label>
                    <input
                      required
                      type="number"
                      step="0.5"
                      value={newHerbForm.inventoryOunces}
                      onChange={e => setNewHerbForm(p => ({ ...p, inventoryOunces: e.target.value }))}
                      className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    value={newHerbForm.tags}
                    onChange={e => setNewHerbForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="digestion, stress, sleep, immune..."
                    className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Energetics</label>
                    <input
                      value={newHerbForm.energetics}
                      onChange={e => setNewHerbForm(p => ({ ...p, energetics: e.target.value }))}
                      className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Taste</label>
                    <input
                      value={newHerbForm.taste}
                      onChange={e => setNewHerbForm(p => ({ ...p, taste: e.target.value }))}
                      className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Parts Used</label>
                  <input
                    value={newHerbForm.partsUsed}
                    onChange={e => setNewHerbForm(p => ({ ...p, partsUsed: e.target.value }))}
                    className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Contraindications</label>
                  <textarea
                    value={newHerbForm.contraindications}
                    onChange={e => setNewHerbForm(p => ({ ...p, contraindications: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full btn-primary disabled:opacity-60"
                >
                  {saving ? 'Adding Herb...' : 'Add Herb to Apothecary'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
