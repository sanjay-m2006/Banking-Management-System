import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transactionId } = await params

    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
      include: { account: true },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 })
    }

    // Update transaction status and account balance
    await db.$transaction([
      db.transaction.update({
        where: { id: transactionId },
        data: { status: 'approved' },
      }),
      db.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: { increment: transaction.amount },
        },
      }),
    ])

    return NextResponse.json({ message: 'Deposit approved successfully' })
  } catch (error) {
    console.error('Error approving deposit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}