'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface Props {
  user: { firstName: string; lastName: string; email: string }
  orders: { id: string; type: string; items: any[]; total: number; createdAt: string }[]
  savedBlend: any[]
}

export default function AccountClient({ user, orders, savedBlend }: Props) {
  const teaBuilderUrl = savedBlend.length > 0
    ? `/tea-builder?saved=${encodeURIComponent(JSON.stringify(savedBlend))}`
    : '/tea-builder'

  return (
    <div className="space-y-8">
      {/* Saved Blend */}
      <div className="bg-white border border-cream-300 rounded-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-display text-2xl text-forest-600 mb-1">Your Saved Tea Blend</h2>
            <p className="font-sans text-xs text-forest-400">
              {savedBlend.length > 0
                ? 'Your in-progress blend is saved. Pick up right where you left off.'
                : 'You don\'t have a saved blend yet. Start building one!'}
            </p>
          </div>
        </div>

        {savedBlend.length > 0 ? (
          <>
            <div className="space-y-2 mb-5">
              {savedBlend.map((h: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-cream-50 border border-cream-200 rounded-sm">
                  <span className="font-sans text-sm text-forest-600">{h.name}</span>
                  <span className="font-sans text-xs text-teal-500">{h.scoops} scoop{h.scoops !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
            <Link href={teaBuilderUrl} className="inline-block btn-primary text-sm">
              Continue Building →
            </Link>
          </>
        ) : (
          <Link href="/tea-builder" className="inline-block btn-primary text-sm">
            Start Building a Tea →
          </Link>
        )}
      </div>

      {/* Order History */}
      <div className="bg-white border border-cream-300 rounded-sm p-6">
        <h2 className="font-display text-2xl text-forest-600 mb-4">Order History</h2>

        {orders.length === 0 ? (
          <p className="font-sans text-sm text-forest-400">No orders yet. Ready to blend?</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="border border-cream-200 rounded-sm p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`font-sans text-xs px-2 py-0.5 rounded-full ${
                      order.type === 'tea' ? 'bg-teal-100 text-teal-600' : 'bg-sage-100 text-sage-600'
                    }`}>
                      {order.type === 'tea' ? '🍵 Custom Tea' : '🌿 Bulk Herbs'}
                    </span>
                    <p className="font-sans text-xs text-forest-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className="font-display text-xl text-terracotta-500">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {order.items.slice(0, 6).map((item: any, i: number) => (
                    <span key={i} className="font-sans text-xs bg-cream-100 text-forest-500 px-2 py-0.5 rounded-sm">
                      {item.name}
                    </span>
                  ))}
                  {order.items.length > 6 && (
                    <span className="font-sans text-xs text-forest-400">+{order.items.length - 6} more</span>
                  )}
                </div>
                <div className="mt-3">
                  <Link
                    href={`/receipt/${order.id}`}
                    className="font-sans text-xs text-teal-500 hover:text-teal-600 transition-colors"
                  >
                    View Receipt →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-white border border-cream-300 rounded-sm p-6">
        <h2 className="font-display text-2xl text-forest-600 mb-4">Account Info</h2>
        <div className="space-y-2 mb-6">
          <p className="font-sans text-sm text-forest-600">
            <span className="text-forest-400">Name: </span>
            {user.firstName} {user.lastName}
          </p>
          <p className="font-sans text-sm text-forest-600">
            <span className="text-forest-400">Email: </span>
            {user.email}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="font-sans text-sm text-red-500 hover:text-red-600 transition-colors border border-red-200 px-4 py-2 rounded-sm hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

