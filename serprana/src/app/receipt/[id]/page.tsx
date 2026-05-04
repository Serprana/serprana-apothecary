import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ReceiptPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { teaBlend: true },
  })

  if (!order) notFound()

  const items = order.items as any[]
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-cream-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="font-display text-4xl text-forest-600 mb-2">Order Received!</h1>
          <p className="font-sans text-sm text-forest-400">
            Please show this receipt at the counter to complete your purchase.
          </p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white border border-cream-300 rounded-sm shadow-sm overflow-hidden mb-6">
          {/* Receipt Header */}
          <div className="bg-forest-600 text-cream-100 p-5 text-center">
            <div className="font-display text-xl tracking-widest uppercase mb-1">Serprana Apothecary</div>
            <div className="font-sans text-xs tracking-wide text-cream-300">
              Playa Venao, Panama · Inside Casa Venao Café
            </div>
          </div>

          <div className="p-6">
            {/* Order Details */}
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-cream-200">
              <div>
                <p className="font-sans text-xs text-forest-400 uppercase tracking-wide">Order #</p>
                <p className="font-mono text-sm text-forest-600">{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="font-sans text-xs text-forest-400 uppercase tracking-wide">Date</p>
                <p className="font-sans text-xs text-forest-600">{formattedDate}</p>
              </div>
            </div>

            {/* Customer */}
            <div className="mb-5 pb-4 border-b border-cream-200">
              <p className="font-sans text-xs text-forest-400 uppercase tracking-wide mb-2">Customer</p>
              <p className="font-sans text-sm text-forest-600">{order.customerName}</p>
              <p className="font-sans text-xs text-forest-400">{order.customerEmail}</p>
              <p className="font-sans text-xs text-forest-400">{order.customerPhone}</p>
            </div>

            {/* Items */}
            <div className="mb-5 pb-4 border-b border-cream-200">
              <p className="font-sans text-xs text-forest-400 uppercase tracking-wide mb-3">
                {order.type === 'tea' ? '🍵 Custom Tea Blend' : '🌿 Bulk Herbs'}
              </p>

              {order.type === 'tea' && (
                <div className="space-y-1">
                  {items.map((h: any, i: number) => (
                    <div key={i} className="flex justify-between font-sans text-sm text-forest-600 py-1">
                      <span>{h.name}</span>
                      <span className="text-teal-500">{h.scoops} scoop{h.scoops !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                  <div className="mt-3 pt-2 border-t border-cream-100 flex justify-between font-sans text-sm">
                    <span className="text-forest-500">Custom Blend (flat rate)</span>
                    <span className="text-terracotta-500 font-medium">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {order.type === 'bulk' && (
                <div className="space-y-1">
                  {items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between font-sans text-sm text-forest-600 py-1">
                      <span>{item.name} ({item.ounces} oz)</span>
                      <span>${(item.ounces * item.pricePerOunce).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-5">
              <span className="font-display text-xl text-forest-600">Total Due</span>
              <span className="font-display text-3xl text-terracotta-500">${order.total.toFixed(2)}</span>
            </div>

            {/* Pay at counter note */}
            <div className="bg-sage-50 border border-sage-200 p-3 rounded-sm text-center">
              <p className="font-sans text-xs text-forest-600 font-medium">💚 Please pay at the counter</p>
              <p className="font-sans text-xs text-forest-400 mt-1">Show this screen to the herbalist to complete your order</p>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="border-t border-cream-200 p-4 text-center bg-cream-50">
            <p className="font-display text-lg text-forest-500 italic mb-1">"May these plants bring you healing."</p>
            <p className="font-sans text-xs text-forest-400">serprana.com · serpranahealing@gmail.com</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1 btn-secondary text-sm text-center">
            ← Back to Home
          </Link>
          <Link href="/tea-builder" className="flex-1 btn-primary text-sm text-center">
            Build Another Tea
          </Link>
        </div>
      </div>
    </div>
  )
}
