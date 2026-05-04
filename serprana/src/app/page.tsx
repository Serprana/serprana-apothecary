import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { CONDITION_CATEGORIES } from '@/types'

async function getFeaturedHerbs() {
  return prisma.herb.findMany({
    where: { featured: true, active: true },
    take: 6,
  })
}

async function getFeaturedRecipes() {
  return prisma.recipe.findMany({
    where: { featured: true },
    take: 4,
  })
}

export default async function HomePage() {
  const [featuredHerbs, featuredRecipes] = await Promise.all([
    getFeaturedHerbs(),
    getFeaturedRecipes(),
  ])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-forest-600 text-cream-100 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-sage-300 blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-terracotta-400 blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="mb-8 flex justify-center">
            <img src="/images/logo-white.png" alt="Serprana" className="w-28 h-28 object-contain opacity-90" />
          </div>

          <p className="font-sans text-xs tracking-[0.4em] uppercase text-sage-300 mb-4">
            Playa Venao, Panama • Inside Casa Venao Café
          </p>

          <h1 className="font-display text-5xl md:text-7xl font-light text-cream-100 mb-4 leading-tight">
            Serprana<br />
            <span className="italic font-light text-sage-300">Apothecary</span>
          </h1>

          <p className="font-sans text-sm tracking-widest text-cream-400 mb-10">
            SER — To Be &nbsp;·&nbsp; PRANA — Life-Giving Force
          </p>

          <p className="font-serif text-xl md:text-2xl text-cream-200 max-w-2xl mx-auto leading-relaxed mb-12 font-light italic">
            "Plants hold memory, wisdom, and medicine. Let us help you find yours."
          </p>

          {/* CTA Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <Link href="/browse#concerns" className="group flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-sm transition-all duration-200">
              <span className="text-2xl">🌿</span>
              <span className="font-sans text-xs tracking-wide text-cream-200 text-center leading-tight">Browse by Concern</span>
            </Link>
            <Link href="/tea-builder" className="group flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-sm transition-all duration-200">
              <span className="text-2xl">🍵</span>
              <span className="font-sans text-xs tracking-wide text-cream-200 text-center leading-tight">Build a Custom Tea</span>
            </Link>
            <Link href="/bulk" className="group flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-sm transition-all duration-200">
              <span className="text-2xl">🪴</span>
              <span className="font-sans text-xs tracking-wide text-cream-200 text-center leading-tight">Shop Single Herbs</span>
            </Link>
            <Link href="/recipes" className="group flex flex-col items-center gap-2 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-sm transition-all duration-200">
              <span className="text-2xl">📜</span>
              <span className="font-sans text-xs tracking-wide text-cream-200 text-center leading-tight">View Recipes</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Concern */}
      <section id="concerns" className="py-16 md:py-20 bg-cream-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="section-subtitle">Find Your Remedy</p>
            <h2 className="section-title">What does your body need?</h2>
            <p className="font-sans text-sm text-forest-400 max-w-lg mx-auto mt-3">
              Select a concern below to see herbs and recipes tailored to your needs.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {CONDITION_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={`/browse?concern=${encodeURIComponent(cat.label)}`}
                className="group flex flex-col items-center gap-2 p-4 bg-white border border-cream-300 rounded-sm hover:border-teal-300 hover:shadow-md transition-all duration-200 text-center"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-sans text-xs text-forest-600 leading-tight group-hover:text-teal-500 transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tea Builder Promo */}
      <section className="py-16 bg-teal-400">
        <div className="max-w-4xl mx-auto px-4 text-center text-cream-50">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-teal-100 mb-3">Custom Blend</p>
          <h2 className="font-display text-4xl md:text-5xl font-light mb-4">
            Build Your Perfect Tea
          </h2>
          <p className="font-sans text-sm text-teal-100 max-w-xl mx-auto mb-8 leading-relaxed">
            Choose up to 7 herbs, adjust your blend, and we'll prepare it fresh for you. Every custom tea is $15 flat.
          </p>
          <Link href="/tea-builder" className="inline-block bg-cream-100 text-teal-500 font-sans font-medium text-sm tracking-wide px-8 py-3 hover:bg-white transition-colors rounded-sm">
            Start Building →
          </Link>
        </div>
      </section>

      {/* Featured Recipes */}
      {featuredRecipes.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="section-subtitle">Curated Blends</p>
              <h2 className="section-title">Herbal Recipes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredRecipes.map((recipe) => {
                const herbs = recipe.herbs as any[]
                return (
                  <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="group card p-5 hover:border-teal-300">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(recipe.tags as string[]).slice(0, 2).map((tag) => (
                        <span key={tag} className="tag-pill text-xs">{tag}</span>
                      ))}
                    </div>
                    <h3 className="font-display text-xl text-forest-600 mb-2 group-hover:text-teal-500 transition-colors">
                      {recipe.name}
                    </h3>
                    <p className="font-sans text-xs text-forest-400 leading-relaxed mb-4 line-clamp-3">
                      {recipe.description}
                    </p>
                    <p className="font-sans text-xs text-teal-500 tracking-wide">
                      {herbs.length} herbs · Make This Tea →
                    </p>
                  </Link>
                )
              })}
            </div>
            <div className="text-center mt-8">
              <Link href="/recipes" className="btn-secondary text-sm">
                View All Recipes
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Herbs */}
      {featuredHerbs.length > 0 && (
        <section className="py-16 md:py-20 bg-cream-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="section-subtitle">From the Apothecary</p>
              <h2 className="section-title">Featured Herbs</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredHerbs.map((herb) => (
                <Link key={herb.id} href={`/herb/${herb.id}`} className="group card p-4 text-center herb-card">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-sage-100 flex items-center justify-center">
                    <span className="text-xl">🌿</span>
                  </div>
                  <h3 className="font-display text-lg text-forest-600 mb-1 group-hover:text-teal-500 transition-colors leading-tight">
                    {herb.name}
                  </h3>
                  {herb.spanishName && (
                    <p className="font-sans text-xs text-forest-400 italic mb-2">{herb.spanishName}</p>
                  )}
                  <p className="font-sans text-xs text-terracotta-500 font-medium">
                    ${herb.pricePerOunce}/oz
                  </p>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/browse" className="btn-secondary text-sm">
                Browse All Herbs
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="py-12 bg-terracotta-500 text-cream-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-light mb-3">Need guidance choosing herbs?</h2>
          <p className="font-sans text-sm text-terracotta-100 mb-6">
            Our herbalists are here to help you find the right plants for your body.
          </p>
          <a
            href="mailto:serpranahealing@gmail.com"
            className="inline-block bg-cream-100 text-terracotta-600 font-sans font-medium text-sm tracking-wide px-8 py-3 hover:bg-white transition-colors rounded-sm"
          >
            Have Herb Questions? Email Us →
          </a>
        </div>
      </section>
    </div>
  )
}
