import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { fromAccountId, toAccountNumber, amount } = await request.json()

    if (!fromAccountId || !toAccountNumber || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid transfer data' }, { status: 400 })
    }

    // Verify from account exists and has sufficient balance
    const fromAccount = await db.account.findUnique({
      where: { id: fromAccountId },
      include: { user: true },
    })

    if (!fromAccount) {
      return NextResponse.json({ error: 'Source account not found' }, { status: 404 })
    }

    if (fromAccount.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Verify to account exists
    const toAccount = await db.account.findUnique({
      where: { accountNumber: toAccountNumber },
      include: { user: true },
    })

    if (!toAccount) {
      return NextResponse.json({ error: 'Recipient account not found' }, { status: 404 })
    }

    if (fromAccount.id === toAccount.id) {
      return NextResponse.json({ error: 'Cannot transfer to same account' }, { status: 400 })
    }

    // Perform transfer
    await db.$transaction([
      // Create debit transaction
      db.transaction.create({
        data: {
          type: 'transfer',
          amount,
          accountId: fromAccount.id,
          description: `Transfer to ${toAccountNumber}`,
          status: 'approved',
          fromAccount: fromAccount.accountNumber,
          toAccount: toAccount.accountNumber,
        },
      }),
      // Create credit transaction for recipient
      db.transaction.create({
        data: {
          type: 'transfer',
          amount,
          accountId: toAccount.id,
          description: `Transfer from ${fromAccount.accountNumber}`,
          status: 'approved',
          fromAccount: fromAccount.accountNumber,
          toAccount: toAccount.accountNumber,
        },
      }),
      // Update source account balance
      db.account.update({
        where: { id: fromAccount.id },
        data: {
          balance: { decrement: amount },
        },
      }),
      // Update recipient account balance
      db.account.update({
        where: { id: toAccount.id },
        data: {
          balance: { increment: amount },
        },
      }),
    ])

    return NextResponse.json({ message: 'Transfer successful' })
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}