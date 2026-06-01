import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AccountClient from './AccountClient'

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const [user, orders, savedBlend] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.savedBlend.findUnique({ where: { userId: session.user.id } }),
  ])

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-forest-600 text-cream-100 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-sage-300 mb-2">Your Account</p>
          <h1 className="font-display text-4xl font-light">
            Welcome back, {user.firstName} 🌿
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <AccountClient
          user={{ firstName: user.firstName, lastName: user.lastName, email: user.email }}
          orders={orders.map(o => ({
            id: o.id,
            type: o.type,
            items: o.items as any[],
            total: o.total,
            createdAt: o.createdAt.toISOString(),
          }))}
          savedBlend={savedBlend ? savedBlend.herbs as any[] : []}
        />
      </div>
    </div>
  )
}
