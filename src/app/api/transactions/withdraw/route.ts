import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { accountId, amount } = await request.json()

    if (!accountId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid withdrawal data' }, { status: 400 })
    }

    // Verify account exists and has sufficient balance
    const account = await db.account.findUnique({
      where: { id: accountId },
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    if (account.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Create withdrawal transaction and update balance
    await db.$transaction([
      db.transaction.create({
        data: {
          type: 'withdraw',
          amount,
          accountId,
          description: `Withdrawal of ₹${amount}`,
          status: 'approved',
        },
      }),
      db.account.update({
        where: { id: accountId },
        data: {
          balance: { decrement: amount },
        },
      }),
    ])

    return NextResponse.json({ message: 'Withdrawal successful' })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}