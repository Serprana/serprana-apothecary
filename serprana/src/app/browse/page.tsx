import { prisma } from '@/lib/prisma'
import { CONDITION_CATEGORIES } from '@/types'
import Link from 'next/link'

interface SearchParams {
  concern?: string
  search?: string
  tag?: string
}

async function getHerbs(searchParams: SearchParams) {
  const { concern, search, tag } = searchParams

  let tags: string[] = []
  if (concern) {
    const category = CONDITION_CATEGORIES.find(c => c.label === concern)
    if (category) tags = category.tags
  }
  if (tag) tags = [tag]

  return prisma.herb.findMany({
    where: {
      active: true,
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { spanishName: { contains: search, mode: 'insensitive' } },
          ]
        } : {},
        tags.length > 0 ? {
          tags: { hasSome: tags }
        } : {},
      ]
    },
    orderBy: { name: 'asc' }
  })
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const herbs = await getHerbs(searchParams)
  const activeCategory = searchParams.concern || null

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Page Header */}
      <div className="bg-forest-600 text-cream-100 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-sage-300 mb-3">The Apothecary</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-cream-100 mb-4">
            {activeCategory ? activeCategory : 'Browse All Herbs'}
          </h1>
          <p className="font-sans text-sm text-cream-300">
            {herbs.length} herb{herbs.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Search */}
        <form method="get" className="mb-8">
          <div className="flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search || ''}
              placeholder="Search herbs by name, benefit, or condition..."
              className="flex-1 px-4 py-3 border border-cream-300 bg-white font-sans text-sm focus:outline-none focus:border-teal-400 rounded-sm"
            />
            <button type="submit" className="btn-primary text-sm px-5 py-3">
              Search
            </button>
            {(searchParams.search || searchParams.concern) && (
              <a href="/browse" className="px-4 py-3 border border-cream-300 text-forest-500 font-sans text-sm hover:bg-cream-200 transition-colors rounded-sm">
                Clear
              </a>
            )}
          </div>
        </form>

        {/* Browse by Concern */}
        <div id="concerns" className="mb-10">
          <h2 className="font-display text-2xl text-forest-600 mb-5 text-center">Browse by Concern</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {CONDITION_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={`/browse?concern=${encodeURIComponent(cat.label)}`}
                className={`flex items-center gap-2 px-4 py-2 border rounded-sm font-sans text-sm transition-all duration-150 ${
                  activeCategory === cat.label
                    ? 'bg-teal-400 text-white border-teal-400'
                    : 'bg-white border-cream-300 text-forest-600 hover:border-teal-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
            {activeCategory && (
              <Link href="/browse" className="px-4 py-2 border border-cream-300 rounded-sm font-sans text-sm text-forest-500 hover:bg-cream-200 transition-colors">
                Show All
              </Link>
            )}
          </div>
        </div>

        {/* Herbs Grid */}
        {herbs.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-display text-2xl text-forest-400 mb-3">No herbs found</p>
            <p className="font-sans text-sm text-forest-400 mb-6">Try a different search or concern.</p>
            <Link href="/browse" className="btn-secondary text-sm">Browse All Herbs</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {herbs.map((herb) => (
              <Link key={herb.id} href={`/herb/${herb.id}`} className="group card p-4 herb-card">
                <div className="w-10 h-10 mb-3 rounded-full bg-sage-100 flex items-center justify-center">
                  <span className="text-lg">🌿</span>
                </div>
                <h3 className="font-display text-lg text-forest-600 mb-1 group-hover:text-teal-500 transition-colors leading-tight">
                  {herb.name}
                </h3>
                {herb.spanishName && (
                  <p className="font-sans text-xs text-forest-400 italic mb-2">{herb.spanishName}</p>
                )}
                <p className="font-sans text-xs text-forest-400 line-clamp-2 mb-3 leading-relaxed">
                  {herb.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-medium text-terracotta-500">
                    ${herb.pricePerOunce}/oz
                  </span>
                  <span className={`font-sans text-xs ${herb.inventoryOunces > 0 ? 'text-sage-500' : 'text-red-400'}`}>
                    {herb.inventoryOunces > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(herb.tags as string[]).slice(0, 2).map((tag) => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
