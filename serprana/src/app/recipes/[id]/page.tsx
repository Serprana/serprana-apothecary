import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function RecipeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const recipe = await prisma.recipe.findUnique({ where: { id: params.id } })
  if (!recipe) notFound()

  const herbs = recipe.herbs as any[]

  // Build the tea builder URL with herbs pre-selected
  const herbParams = herbs.map((h: any) => `${encodeURIComponent(h.name)}:${h.parts}`).join(',')
  const teaBuilderUrl = `/tea-builder?recipe=${encodeURIComponent(recipe.name)}&herbs=${herbParams}`

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link href="/recipes" className="font-sans text-xs text-forest-400 hover:text-teal-500 transition-colors">
            ← Back to Recipes
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(recipe.tags as string[]).map((tag) => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>

            <h1 className="font-display text-4xl font-light text-forest-600 mb-3">{recipe.name}</h1>
            <p className="font-sans text-sm text-forest-500 leading-relaxed mb-8">{recipe.description}</p>

            {/* Parts formula */}
            <div className="mb-8">
              <h2 className="font-display text-xl text-forest-600 mb-4">The Formula</h2>
              <div className="space-y-3">
                {herbs.map((h: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-3 bg-white border border-cream-200 rounded-sm">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                      <span className="font-display text-lg font-medium text-teal-500">{h.parts}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-sans text-sm font-medium text-forest-600">{h.name}</div>
                      <div className="font-sans text-xs text-forest-400 italic">
                        {h.parts} part{h.parts > 1 ? 's' : ''} → {h.parts} scoop{h.parts > 1 ? 's' : ''}
                      </div>
                      {h.notes && <div className="font-sans text-xs text-forest-400 mt-1">{h.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="font-display text-xl text-forest-600 mb-3">Preparation</h2>
              <div className="bg-sage-50 border border-sage-200 p-5 rounded-sm">
                <p className="font-sans text-sm text-forest-600 leading-relaxed">{recipe.instructions}</p>
              </div>
            </div>
          </div>

          {/* CTA Panel */}
          <div className="md:col-span-2">
            <div className="sticky top-24">
              <div className="bg-white border border-cream-300 p-5 rounded-sm shadow-sm mb-4">
                <h3 className="font-display text-xl text-forest-600 mb-2">Make This Tea</h3>
                <p className="font-sans text-xs text-forest-400 mb-4 leading-relaxed">
                  We'll pre-load this recipe into the tea builder with the correct scoop amounts. All custom teas are $15.
                </p>

                <div className="mb-4 p-3 bg-cream-50 border border-cream-200 rounded-sm">
                  <p className="font-sans text-xs text-forest-400 mb-2 uppercase tracking-wide">Auto-loaded scoops</p>
                  {herbs.map((h: any, i: number) => (
                    <div key={i} className="font-sans text-xs text-forest-600 flex justify-between py-1 border-b border-cream-100 last:border-0">
                      <span>{h.name}</span>
                      <span className="text-teal-500">{h.parts} scoop{h.parts > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>

                <Link href={teaBuilderUrl} className="block w-full text-center btn-primary mb-3">
                  🍵 Make This Tea — $15
                </Link>

                <p className="font-sans text-xs text-center text-forest-400">
                  You can adjust scoops in the builder
                </p>
              </div>

              <div className="bg-sage-50 border border-sage-200 p-4 rounded-sm text-center">
                <p className="font-sans text-xs text-forest-500 mb-2">Questions about this recipe?</p>
                <a href="mailto:serpranahealing@gmail.com" className="font-sans text-xs text-teal-500">
                  Ask an herbalist →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
