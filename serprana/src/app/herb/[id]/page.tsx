import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function HerbDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const herb = await prisma.herb.findUnique({
    where: { id: params.id },
  })

  if (!herb || !herb.active) notFound()

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Back nav */}
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link href="/browse" className="font-sans text-xs text-forest-400 hover:text-teal-500 transition-colors">
            ← Back to Browse
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left: Herb Info */}
          <div className="md:col-span-3">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🌿</span>
              </div>
              <div>
                <h1 className="font-display text-4xl font-light text-forest-600 leading-tight">
                  {herb.name}
                </h1>
                {herb.spanishName && (
                  <p className="font-sans text-sm text-terracotta-500 italic mt-1">{herb.spanishName}</p>
                )}
                {herb.latinName && (
                  <p className="font-sans text-xs text-forest-400 mt-1">{herb.latinName}</p>
                )}
              </div>
            </div>

            <p className="font-sans text-sm text-forest-600 leading-relaxed mb-6">
              {herb.description}
            </p>

            {/* Properties */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {herb.energetics && (
                <div className="bg-white border border-cream-200 p-3 rounded-sm">
                  <p className="font-sans text-xs text-forest-400 uppercase tracking-wide mb-1">Energetics</p>
                  <p className="font-sans text-sm text-forest-600">{herb.energetics}</p>
                </div>
              )}
              {herb.taste && (
                <div className="bg-white border border-cream-200 p-3 rounded-sm">
                  <p className="font-sans text-xs text-forest-400 uppercase tracking-wide mb-1">Taste</p>
                  <p className="font-sans text-sm text-forest-600">{herb.taste}</p>
                </div>
              )}
              {herb.partsUsed && (
                <div className="bg-white border border-cream-200 p-3 rounded-sm">
                  <p className="font-sans text-xs text-forest-400 uppercase tracking-wide mb-1">Parts Used</p>
                  <p className="font-sans text-sm text-forest-600">{herb.partsUsed}</p>
                </div>
              )}
              <div className="bg-white border border-cream-200 p-3 rounded-sm">
                <p className="font-sans text-xs text-forest-400 uppercase tracking-wide mb-1">Price</p>
                <p className="font-sans text-sm font-medium text-terracotta-500">${herb.pricePerOunce} per ounce</p>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <p className="font-sans text-xs text-forest-400 uppercase tracking-wide mb-2">Benefits & Uses</p>
              <div className="flex flex-wrap gap-2">
                {(herb.tags as string[]).map((tag) => (
                  <Link
                    key={tag}
                    href={`/browse?tag=${encodeURIComponent(tag)}`}
                    className="tag-pill hover:bg-teal-100 hover:text-teal-600 transition-colors cursor-pointer"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contraindications */}
            {herb.contraindications && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm">
                <p className="font-sans text-xs text-amber-700 uppercase tracking-wide mb-1">⚠️ Cautions & Contraindications</p>
                <p className="font-sans text-sm text-amber-800">{herb.contraindications}</p>
              </div>
            )}

            {/* Inventory */}
            <div className="mt-4">
              <span className={`font-sans text-xs px-3 py-1 rounded-full ${
                herb.inventoryOunces > 2
                  ? 'bg-sage-100 text-sage-600'
                  : herb.inventoryOunces > 0
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-red-50 text-red-500'
              }`}>
                {herb.inventoryOunces > 2
                  ? `✓ In Stock (${herb.inventoryOunces} oz available)`
                  : herb.inventoryOunces > 0
                  ? `⚠ Low Stock (${herb.inventoryOunces} oz remaining)`
                  : '✗ Out of Stock'}
              </span>
            </div>
          </div>

          {/* Right: Action Panel */}
          <div className="md:col-span-2">
            <div className="sticky top-24">
              <div className="bg-white border border-cream-300 p-5 rounded-sm shadow-sm mb-4">
                <h3 className="font-display text-xl text-forest-600 mb-4">Add to Your Order</h3>

                {herb.inventoryOunces > 0 ? (
                  <>
                    {/* Add to Tea */}
                    <Link
                      href={`/tea-builder?herb=${herb.id}`}
                      className="block w-full text-center btn-primary mb-3 text-sm"
                    >
                      🍵 Add to Custom Tea — $15 flat
                    </Link>

                    {/* Buy Bulk */}
                    <Link
                      href={`/bulk?herb=${herb.id}`}
                      className="block w-full text-center btn-secondary text-sm"
                    >
                      Buy Bulk (${herb.pricePerOunce}/oz)
                    </Link>
                  </>
                ) : (
                  <p className="font-sans text-sm text-red-500 text-center">Currently out of stock</p>
                )}
              </div>

              {/* Help */}
              <div className="bg-sage-50 border border-sage-200 p-4 rounded-sm text-center">
                <p className="font-sans text-xs text-forest-500 mb-2">Not sure if this herb is right for you?</p>
                <a
                  href="mailto:serpranahealing@gmail.com"
                  className="font-sans text-xs text-teal-500 hover:text-teal-600 transition-colors"
                >
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
