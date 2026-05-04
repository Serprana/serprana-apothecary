import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Update herb
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const herb = await prisma.herb.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(herb)
}

// Delete (deactivate) herb
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.herb.update({
    where: { id: params.id },
    data: { active: false },
  })
  return NextResponse.json({ success: true })
}
