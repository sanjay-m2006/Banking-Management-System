import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const pendingDeposits = await db.transaction.findMany({
      where: { type: 'deposit', status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: {
        account: {
          include: { user: true },
        },
      },
    })

    const result = pendingDeposits.map(t => ({
      id: t.id,
      accountNumber: t.account.accountNumber,
      userName: t.account.user.name,
      amount: t.amount,
      createdAt: t.createdAt,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching pending deposits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}