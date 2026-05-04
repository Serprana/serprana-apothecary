import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const herbs = await prisma.herb.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(herbs)
}
