import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ herbs: [] })

  const saved = await prisma.savedBlend.findUnique({
    where: { userId: session.user.id },
  })

  return NextResponse.json({ herbs: saved?.herbs || [] })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { herbs } = await req.json()

  await prisma.savedBlend.upsert({
    where: { userId: session.user.id },
    update: { herbs },
    create: { userId: session.user.id, herbs },
  })

  return NextResponse.json({ success: true })
}
