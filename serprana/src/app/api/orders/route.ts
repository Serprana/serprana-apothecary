import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { SCOOP_TO_OUNCE } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerName, customerEmail, customerPhone, type, items, total } = body

  // Calculate revenue split
  const ownerShare = total * 0.65
  const storeShare = total * 0.35

  // Create order in a transaction with inventory deduction
  const order = await prisma.$transaction(async (tx) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        type,
        items,
        total,
        ownerShare,
        storeShare,
      },
    })

    // Deduct inventory
    if (type === 'tea') {
      // items is array of { herbId, name, scoops }
      for (const item of items) {
        const ouncesToDeduct = item.scoops * SCOOP_TO_OUNCE
        await tx.herb.update({
          where: { id: item.herbId },
          data: {
            inventoryOunces: { decrement: ouncesToDeduct },
          },
        })
      }

      // Create tea blend record
      const totalScoops = items.reduce((sum: number, h: any) => sum + h.scoops, 0)
      await tx.teaBlend.create({
        data: {
          orderId: newOrder.id,
          herbs: items,
          totalScoops,
        },
      })
    } else if (type === 'bulk') {
      // items is array of { herbId, name, ounces, pricePerOunce }
      for (const item of items) {
        await tx.herb.update({
          where: { id: item.herbId },
          data: {
            inventoryOunces: { decrement: item.ounces },
          },
        })
      }
    }

    return newOrder
  })

  return NextResponse.json({ orderId: order.id })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'all'

  let dateFilter = {}
  const now = new Date()

  if (period === 'today') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    dateFilter = { createdAt: { gte: start } }
  } else if (period === 'week') {
    const start = new Date(now)
    start.setDate(start.getDate() - 7)
    dateFilter = { createdAt: { gte: start } }
  } else if (period === 'month') {
    const start = new Date(now)
    start.setMonth(start.getMonth() - 1)
    dateFilter = { createdAt: { gte: start } }
  }

  const orders = await prisma.order.findMany({
    where: dateFilter,
    orderBy: { createdAt: 'desc' },
    include: { teaBlend: true },
  })

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const ownerTotal = orders.reduce((sum, o) => sum + o.ownerShare, 0)
  const storeTotal = orders.reduce((sum, o) => sum + o.storeShare, 0)

  return NextResponse.json({
    orders,
    summary: {
      count: orders.length,
      totalRevenue,
      ownerTotal,
      storeTotal,
    }
  })
}
