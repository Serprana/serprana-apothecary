import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const recipe = await prisma.recipe.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(recipe)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.recipe.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
