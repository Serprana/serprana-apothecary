import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const recipes = await prisma.recipe.findMany({
    orderBy: [{ featured: 'desc' }, { name: 'asc' }]
  })
  return NextResponse.json(recipes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const recipe = await prisma.recipe.create({ data: body })
  return NextResponse.json(recipe)
}
