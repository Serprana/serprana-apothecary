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

interface RecipeHerb {
  name: string
  parts: number
  notes: string
}

interface Recipe {
  id: string
  name: string
  description: string
  tags: string[]
  herbs: RecipeHerb[]
  instructions: string
  featured: boolean
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
  const [tab, setTab] = useState<'orders' | 'herbs' | 'add-herb' | 'recipes' | 'add-recipe'>('orders')
  const [period, setPeriod] = useState('month')
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [herbs, setHerbs] = useState<Herb[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingHerbs, setLoadingHerbs] = useState(false)
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [editingHerb, setEditingHerb] = useState<Herb | null>(null)
  const [editForm, setEditForm] = useState<Partial<Herb>>({})
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [editRecipeForm, setEditRecipeForm] = useState<Partial<Recipe> & { tagsString?: string, herbsString?: string }>({})
  const [newHerbForm, setNewHerbForm] = useState({
    name: '', spanishName: '', latinName: '', description: '',
    pricePerOunce: '', inventoryOunces: '', tags: '', energetics: '',
    taste: '', partsUsed: '', contraindications: ''
  })
  const [newRecipeForm, setNewRecipeForm] = useState({
    name: '', description: '', tags: '', instructions: '', featured: false,
    herbs: [{ name: '', parts: 1, notes: '' }]
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
    if (tab === 'herbs' || tab === 'add-herb') loadHerbs()
    if (tab === 'recipes' || tab === 'add-recipe') loadRecipes()
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

  const loadRecipes = async () => {
    setLoadingRecipes(true)
    const res = await fetch('/api/admin/recipes')
    const data = await res.json()
    setRecipes(data)
    setLoadingRecipes(false)
  }

  const showMessage = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const startEdit = (herb: Herb) => {
    setEditingHerb(herb)
    setEditForm({ name: herb.name, pricePerOunce: herb.pricePerOunce, inventoryOunces: herb.inventoryOunces })
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
    showMessage('Herb updated!')
    await loadHerbs()
    setSaving(false)
  }

  const deactivateHerb = async (herbId: string) => {
    if (!confirm('Remove this herb from the store?')) return
    await fetch(`/api/admin/herbs/${herbId}`, { method: 'DELETE' })
    showMessage('Herb removed.')
    await loadHerbs()
  }

  const reactivateHerb = async (herbId: string) => {
    await fetch(`/api/admin/herbs/${herbId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true }),
    })
    showMessage('Herb reactivated.')
    await loadHerbs()
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
        tags, active: true, featured: false,
      }),
    })
    showMessage('New herb added!')
    setNewHerbForm({ name: '', spanishName: '', latinName: '', description: '', pricePerOunce: '', inventoryOunces: '', tags: '', energetics: '', taste: '', partsUsed: '', contraindications: '' })
    setSaving(false)
  }

  const startEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setEditRecipeForm({
      name: recipe.name,
      description: recipe.description,
      instructions: recipe.instructions,
      featured: recipe.featured,
      tagsString: recipe.tags.join(', '),
      herbsString: recipe.herbs.map(h => `${h.parts} part ${h.name}${h.notes ? ` (${h.notes})` : ''}`).join('\n'),
    })
  }

  const saveEditRecipe = async () => {
    if (!editingRecipe) return
    setSaving(true)
    const tags = (editRecipeForm.tagsString || '').split(',').map(t => t.trim()).filter(Boolean)
    const herbLines = (editRecipeForm.herbsString || '').split('\n').filter(Boolean)
const herbs = herbLines.map(line => {
  const match = line.match(/^(\d+)\s+parts?\s+(.+?)(?:\s+\((.+)\))?$/)
  const notesMatch = line.match(/\(([^)]+)\)/)
  const nameMatch = line.match(/^\d+\s+parts?\s+(.+?)(?:\s+\(|$)/)
  const partsMatch = line.match(/^(\d+)/)
  return {
    parts: partsMatch ? parseInt(partsMatch[1]) : 1,
    name: nameMatch ? nameMatch[1].trim() : line.trim(),
    notes: notesMatch ? notesMatch[1].trim() : ''
  }
})
    await fetch(`/api/admin/recipes/${editingRecipe.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editRecipeForm.name, description: editRecipeForm.description, instructions: editRecipeForm.instructions, featured: editRecipeForm.featured, tags, herbs }),
    })
    setEditingRecipe(null)
    showMessage('Recipe updated!')
    await loadRecipes()
    setSaving(false)
  }

  const deleteRecipe = async (recipeId: string) => {
    if (!confirm('Delete this recipe permanently?')) return
    await fetch(`/api/admin/recipes/${recipeId}`, { method: 'DELETE' })
    showMessage('Recipe deleted.')
    await loadRecipes()
  }

  const addNewRecipe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const tags = newRecipeForm.tags.split(',').map(t => t.trim()).filter(Boolean)
    await fetch('/api/admin/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newRecipeForm.name, description: newRecipeForm.description, instructions: newRecipeForm.instructions, featured: newRecipeForm.featured, tags, herbs: newRecipeForm.herbs.filter(h => h.name.trim()) }),
    })
    showMessage('New recipe added!')
    setNewRecipeForm({ name: '', description: '', tags: '', instructions: '', featured: false, herbs: [{ name: '', parts: 1, notes: '' }] })
    setSaving(false)
  }

  const addHerbRow = () => setNewRecipeForm(p => ({ ...p, herbs: [...p.herbs, { name: '', parts: 1, notes: '' }] }))
  const removeHerbRow = (i: number) => setNewRecipeForm(p => ({ ...p, herbs: p.herbs.filter((_, idx) => idx !== i) }))
  const updateHerbRow = (i: number, field: string, value: any) => setNewRecipeForm(p => ({ ...p, herbs: p.herbs.map((h, idx) => idx === i ? { ...h, [field]: value } : h) }))

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
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm mb-3"
              placeholder="Enter admin password" autoFocus />
            {wrongPassword && <p className="font-sans text-xs text-red-500 mb-3">Incorrect password.</p>}
            <button type="submit" className="w-full btn-primary">Enter Dashboard</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-forest-600 text-cream-100 py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div>
            <span className="font-display text-xl">Serprana</span>
            <span className="font-sans text-xs text-sage-300 ml-2 uppercase tracking-wide">Admin</span>
          </div>
          <button onClick={() => setAuthenticated(false)} className="font-sans text-xs text-cream-400 hover:text-cream-200">Logout</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {message && (
          <div className="mb-4 p-3 bg-sage-50 border border-sage-300 rounded-sm">
            <p className="font-sans text-sm text-forest-600">✓ {message}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-8 bg-white border border-cream-300 rounded-sm p-1 w-fit">
          {(['orders', 'herbs', 'add-herb', 'recipes', 'add-recipe'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 font-sans text-sm rounded-sm transition-all ${tab === t ? 'bg-forest-600 text-cream-50' : 'text-forest-500 hover:bg-cream-100'}`}>
              {t === 'orders' ? 'Orders & Revenue' : t === 'herbs' ? 'Manage Herbs' : t === 'add-herb' ? 'Add Herb' : t === 'recipes' ? 'Manage Recipes' : 'Add Recipe'}
            </button>
          ))}
        </div>

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <div className="flex gap-2 mb-6">
              {['today', 'week', 'month', 'all'].map(p => (
                <button key={p} onClick={() => { setPeriod(p); loadOrders() }}
                  className={`px-4 py-2 font-sans text-xs rounded-sm border transition-all capitalize ${period === p ? 'bg-teal-400 text-white border-teal-400' : 'bg-white border-cream-300 text-forest-600 hover:border-teal-300'}`}>
                  {p === 'all' ? 'All Time' : `This ${p.charAt(0).toUpperCase() + p.slice(1)}`}
                </button>
              ))}
            </div>
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
            {loadingOrders ? <p className="font-sans text-sm text-forest-400 text-center py-8">Loading orders...</p>
              : orders.length === 0 ? <p className="font-sans text-sm text-forest-400 text-center py-8">No orders found for this period.</p>
              : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-cream-300 rounded-sm p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-sans text-sm font-medium text-forest-600">{order.customerName}</span>
                            <span className={`font-sans text-xs px-2 py-0.5 rounded-full ${order.type === 'tea' ? 'bg-teal-100 text-teal-600' : 'bg-sage-100 text-sage-600'}`}>
                              {order.type === 'tea' ? '🍵 Custom Tea' : '🌿 Bulk Herbs'}
                            </span>
                          </div>
                          <p className="font-sans text-xs text-forest-400">{order.customerEmail} · {order.customerPhone}</p>
                          <p className="font-sans text-xs text-forest-400 mt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(order.items as any[]).slice(0, 5).map((item: any, i: number) => (
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
                  ))}
                </div>
              )}
          </div>
        )}

        {/* HERBS */}
        {tab === 'herbs' && (
          <div>
            {loadingHerbs ? <p className="font-sans text-sm text-forest-400 text-center py-8">Loading herbs...</p> : (
              <div className="space-y-2">
                {herbs.map((herb) => (
                  <div key={herb.id} className={`bg-white border rounded-sm p-4 ${!herb.active ? 'opacity-50 border-red-100 bg-red-50' : 'border-cream-300'}`}>
                    {editingHerb?.id === herb.id ? (
                      <div className="flex flex-wrap gap-3 items-end">
                        <div>
                          <label className="font-sans text-xs text-forest-400 block mb-1">Name</label>
                          <input value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                            className="px-2 py-1.5 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400 w-48" />
                        </div>
                        <div>
                          <label className="font-sans text-xs text-forest-400 block mb-1">Price/oz</label>
                          <input type="number" value={editForm.pricePerOunce || ''} onChange={e => setEditForm(p => ({ ...p, pricePerOunce: parseFloat(e.target.value) }))}
                            className="px-2 py-1.5 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400 w-24" step="0.5" />
                        </div>
                        <div>
                          <label className="font-sans text-xs text-forest-400 block mb-1">Inventory (oz)</label>
                          <input type="number" value={editForm.inventoryOunces || ''} onChange={e => setEditForm(p => ({ ...p, inventoryOunces: parseFloat(e.target.value) }))}
                            className="px-2 py-1.5 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400 w-24" step="0.5" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveEdit} disabled={saving} className="px-3 py-1.5 bg-teal-400 text-white font-sans text-xs rounded-sm hover:bg-teal-500 disabled:opacity-60">
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => setEditingHerb(null)} className="px-3 py-1.5 border border-cream-300 text-forest-500 font-sans text-xs rounded-sm hover:bg-cream-100">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-sans text-sm font-medium text-forest-600">{herb.name}</span>
                            {!herb.active && <span className="font-sans text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Inactive</span>}
                            <span className={`font-sans text-xs px-2 py-0.5 rounded-full ${herb.inventoryOunces <= 0 ? 'bg-red-100 text-red-600' : herb.inventoryOunces <= 2 ? 'bg-amber-100 text-amber-600' : 'bg-sage-100 text-sage-600'}`}>
                              {herb.inventoryOunces} oz{herb.inventoryOunces <= 0 ? ' — OUT' : herb.inventoryOunces <= 2 ? ' — LOW' : ''}
                            </span>
                          </div>
                          <p className="font-sans text-xs text-terracotta-500">${herb.pricePerOunce}/oz</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => startEdit(herb)} className="font-sans text-xs px-3 py-1.5 border border-cream-300 text-forest-500 rounded-sm hover:bg-cream-100">Edit</button>
                          {herb.active
                            ? <button onClick={() => deactivateHerb(herb.id)} className="font-sans text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-sm hover:bg-red-50">Remove</button>
                            : <button onClick={() => reactivateHerb(herb.id)} className="font-sans text-xs px-3 py-1.5 border border-sage-300 text-sage-600 rounded-sm hover:bg-sage-50">Reactivate</button>
                          }
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD HERB */}
        {tab === 'add-herb' && (
          <div className="max-w-2xl">
            <div className="bg-white border border-cream-300 rounded-sm p-6">
              <h2 className="font-display text-xl text-forest-600 mb-5">Add New Herb</h2>
              <form onSubmit={addNewHerb} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Name *</label>
                    <input required value={newHerbForm.name} onChange={e => setNewHerbForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Spanish Name</label>
                    <input value={newHerbForm.spanishName} onChange={e => setNewHerbForm(p => ({ ...p, spanishName: e.target.value }))}
                      className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                  </div>
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Latin Name</label>
                  <input value={newHerbForm.latinName} onChange={e => setNewHerbForm(p => ({ ...p, latinName: e.target.value }))}
                    className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Description *</label>
                  <textarea required value={newHerbForm.description} onChange={e => setNewHerbForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Price/oz *</label>
                    <input required type="number" step="0.5" value={newHerbForm.pricePerOunce} onChange={e => setNewHerbForm(p => ({ ...p, pricePerOunce: e.target.value }))}
                      className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Initial Inventory (oz) *</label>
                    <input required type="number" step="0.5" value={newHerbForm.inventoryOunces} onChange={e => setNewHerbForm(p => ({ ...p, inventoryOunces: e.target.value }))}
                      className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                  </div>
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Tags (comma separated)</label>
                  <input value={newHerbForm.tags} onChange={e => setNewHerbForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="digestion, stress, sleep, immune..."
                    className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Energetics</label>
                    <input value={newHerbForm.energetics} onChange={e => setNewHerbForm(p => ({ ...p, energetics: e.target.value }))}
                      className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                  </div>
                  <div>
                    <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Taste</label>
                    <input value={newHerbForm.taste} onChange={e => setNewHerbForm(p => ({ ...p, taste: e.target.value }))}
                      className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                  </div>
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Parts Used</label>
                  <input value={newHerbForm.partsUsed} onChange={e => setNewHerbForm(p => ({ ...p, partsUsed: e.target.value }))}
                    className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Contraindications</label>
                  <textarea value={newHerbForm.contraindications} onChange={e => setNewHerbForm(p => ({ ...p, contraindications: e.target.value }))}
                    rows={2} className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                </div>
                <button type="submit" disabled={saving} className="w-full btn-primary disabled:opacity-60">
                  {saving ? 'Adding Herb...' : 'Add Herb to Apothecary'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* RECIPES */}
        {tab === 'recipes' && (
          <div>
            {loadingRecipes ? <p className="font-sans text-sm text-forest-400 text-center py-8">Loading recipes...</p> : (
              <div className="space-y-4">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white border border-cream-300 rounded-sm p-5">
                    {editingRecipe?.id === recipe.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="font-sans text-xs text-forest-400 block mb-1">Recipe Name</label>
                            <input value={editRecipeForm.name || ''} onChange={e => setEditRecipeForm(p => ({ ...p, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400" />
                          </div>
                          <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 font-sans text-sm text-forest-600 cursor-pointer">
                              <input type="checkbox" checked={editRecipeForm.featured || false}
                                onChange={e => setEditRecipeForm(p => ({ ...p, featured: e.target.checked }))} />
                              Featured on homepage
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="font-sans text-xs text-forest-400 block mb-1">Description</label>
                          <textarea value={editRecipeForm.description || ''} onChange={e => setEditRecipeForm(p => ({ ...p, description: e.target.value }))}
                            rows={2} className="w-full px-3 py-2 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400" />
                        </div>
                        <div>
                          <label className="font-sans text-xs text-forest-400 block mb-1">Tags (comma separated)</label>
                          <input value={editRecipeForm.tagsString || ''} onChange={e => setEditRecipeForm(p => ({ ...p, tagsString: e.target.value }))}
                            className="w-full px-3 py-2 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400" />
                        </div>
                        <div>
                          <label className="font-sans text-xs text-forest-400 block mb-1">
                            Herbs — one per line, format: "2 part Chamomile" or "2 part Chamomile (calming base)"
                          </label>
                          <textarea value={editRecipeForm.herbsString || ''} onChange={e => setEditRecipeForm(p => ({ ...p, herbsString: e.target.value }))}
                            rows={6} className="w-full px-3 py-2 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400 font-mono" />
                        </div>
                        <div>
                          <label className="font-sans text-xs text-forest-400 block mb-1">Instructions</label>
                          <textarea value={editRecipeForm.instructions || ''} onChange={e => setEditRecipeForm(p => ({ ...p, instructions: e.target.value }))}
                            rows={3} className="w-full px-3 py-2 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveEditRecipe} disabled={saving}
                            className="px-4 py-2 bg-teal-400 text-white font-sans text-sm rounded-sm hover:bg-teal-500 disabled:opacity-60">
                            {saving ? 'Saving...' : 'Save Recipe'}
                          </button>
                          <button onClick={() => setEditingRecipe(null)}
                            className="px-4 py-2 border border-cream-300 text-forest-500 font-sans text-sm rounded-sm hover:bg-cream-100">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display text-xl text-forest-600">{recipe.name}</h3>
                            {recipe.featured && <span className="font-sans text-xs px-2 py-0.5 bg-terracotta-100 text-terracotta-600 rounded-sm">Featured</span>}
                          </div>
                          <p className="font-sans text-xs text-forest-400 mb-2">{recipe.description}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {recipe.tags.map(tag => <span key={tag} className="font-sans text-xs bg-sage-100 text-forest-600 px-2 py-0.5 rounded-full">{tag}</span>)}
                          </div>
                          <div className="space-y-0.5">
                            {recipe.herbs.map((h, i) => (
                              <p key={i} className="font-sans text-xs text-forest-500">
                                <span className="text-teal-500 font-medium">{h.parts} part{h.parts > 1 ? 's' : ''}</span> {h.name}
                                {h.notes && <span className="text-forest-400"> — {h.notes}</span>}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => startEditRecipe(recipe)} className="font-sans text-xs px-3 py-1.5 border border-cream-300 text-forest-500 rounded-sm hover:bg-cream-100">Edit</button>
                          <button onClick={() => deleteRecipe(recipe.id)} className="font-sans text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-sm hover:bg-red-50">Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD RECIPE */}
        {tab === 'add-recipe' && (
          <div className="max-w-2xl">
            <div className="bg-white border border-cream-300 rounded-sm p-6">
              <h2 className="font-display text-xl text-forest-600 mb-5">Add New Recipe</h2>
              <form onSubmit={addNewRecipe} className="space-y-4">
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Recipe Name *</label>
                  <input required value={newRecipeForm.name} onChange={e => setNewRecipeForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Description *</label>
                  <textarea required value={newRecipeForm.description} onChange={e => setNewRecipeForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Tags (comma separated)</label>
                  <input value={newRecipeForm.tags} onChange={e => setNewRecipeForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="sleep, anxiety, women hormones..."
                    className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-2">Herbs *</label>
                  <div className="space-y-2">
                    {newRecipeForm.herbs.map((herb, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <div className="w-16 flex-shrink-0">
                          <label className="font-sans text-xs text-forest-400 block mb-1">Parts</label>
                          <input type="number" min="1" value={herb.parts} onChange={e => updateHerbRow(i, 'parts', parseInt(e.target.value))}
                            className="w-full px-2 py-1.5 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400" />
                        </div>
                        <div className="flex-1">
                          <label className="font-sans text-xs text-forest-400 block mb-1">Herb Name</label>
                          <input value={herb.name} onChange={e => updateHerbRow(i, 'name', e.target.value)}
                            placeholder="e.g. Chamomile"
                            className="w-full px-2 py-1.5 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400" />
                        </div>
                        <div className="flex-1">
                          <label className="font-sans text-xs text-forest-400 block mb-1">Notes (optional)</label>
                          <input value={herb.notes} onChange={e => updateHerbRow(i, 'notes', e.target.value)}
                            placeholder="e.g. calming base"
                            className="w-full px-2 py-1.5 border border-cream-300 font-sans text-sm rounded-sm focus:outline-none focus:border-teal-400" />
                        </div>
                        {newRecipeForm.herbs.length > 1 && (
                          <button type="button" onClick={() => removeHerbRow(i)} className="mt-5 text-red-400 hover:text-red-600 font-sans text-xs flex-shrink-0">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addHerbRow} className="mt-2 font-sans text-xs text-teal-500 hover:text-teal-600">
                    + Add another herb
                  </button>
                </div>
                <div>
                  <label className="font-sans text-xs text-forest-500 uppercase tracking-wide block mb-1">Preparation Instructions *</label>
                  <textarea required value={newRecipeForm.instructions} onChange={e => setNewRecipeForm(p => ({ ...p, instructions: e.target.value }))}
                    rows={3} placeholder="How to prepare this tea..."
                    className="w-full px-3 py-2 border border-cream-300 font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm" />
                </div>
                <label className="flex items-center gap-2 font-sans text-sm text-forest-600 cursor-pointer">
                  <input type="checkbox" checked={newRecipeForm.featured} onChange={e => setNewRecipeForm(p => ({ ...p, featured: e.target.checked }))} />
                  Feature this recipe on the homepage
                </label>
                <button type="submit" disabled={saving} className="w-full btn-primary disabled:opacity-60">
                  {saving ? 'Adding Recipe...' : 'Add Recipe'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
