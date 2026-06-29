import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { accountId, amount } = await request.json()

    if (!accountId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid deposit data' }, { status: 400 })
    }

    // Verify account exists
    const account = await db.account.findUnique({
      where: { id: accountId },
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Create pending deposit transaction
    const transaction = await db.transaction.create({
      data: {
        type: 'deposit',
        amount,
        accountId,
        description: `Deposit of ₹${amount}`,
        status: 'pending',
      },
    })

    return NextResponse.json({
      message: 'Deposit request submitted',
      transaction,
    })
  } catch (error) {
    console.error('Deposit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}