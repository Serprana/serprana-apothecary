import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function RecipesPage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: [{ featured: 'desc' }, { name: 'asc' }]
  })

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-forest-600 text-cream-100 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-sage-300 mb-3">Herbal Wisdom</p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-cream-100 mb-4">
            Recipes & Blends
          </h1>
          <p className="font-sans text-sm text-cream-300 max-w-lg mx-auto">
            Time-honored formulas crafted for specific needs. Each recipe can be made as a custom tea.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => {
            const herbs = recipe.herbs as any[]
            return (
              <div key={recipe.id} className="card p-6">
                {recipe.featured && (
                  <span className="inline-block font-sans text-xs tracking-wide px-2 py-1 bg-terracotta-100 text-terracotta-600 rounded-sm mb-3">
                    Featured
                  </span>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(recipe.tags as string[]).slice(0, 3).map((tag) => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  ))}
                </div>
                <h2 className="font-display text-2xl text-forest-600 mb-2">{recipe.name}</h2>
                <p className="font-sans text-xs text-forest-400 leading-relaxed mb-4">
                  {recipe.description}
                </p>

                {/* Herb list */}
                <div className="mb-5">
                  <p className="font-sans text-xs text-forest-400 uppercase tracking-wide mb-2">Herbs</p>
                  <ul className="space-y-1">
                    {herbs.map((h: any, i: number) => (
                      <li key={i} className="font-sans text-xs text-forest-600 flex items-center gap-2">
                        <span className="text-teal-400">✦</span>
                        <span>{h.parts} part{h.parts > 1 ? 's' : ''} {h.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/recipes/${recipe.id}`}
                  className="block w-full text-center btn-primary text-sm"
                >
                  View & Make This Tea →
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
