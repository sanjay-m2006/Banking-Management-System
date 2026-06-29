import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    // Check if user already has an account
    const existingAccount = await db.account.findFirst({
      where: { userId },
    })

    if (existingAccount) {
      // User already has an account, just approve them
      const user = await db.user.update({
        where: { id: userId },
        data: { isApproved: true },
      })
      return NextResponse.json({ message: 'User approved successfully', user })
    }

    // Get the highest account number
    const lastAccount = await db.account.findFirst({
      orderBy: { accountNumber: 'desc' },
    })

    // Generate new account number (start from 1000000001)
    const lastNumber = lastAccount ? parseInt(lastAccount.accountNumber) : 1000000000
    const newAccountNumber = (lastNumber + 1).toString()

    // Approve user and create account in a transaction
    const user = await db.user.update({
      where: { id: userId },
      data: {
        isApproved: true,
        accounts: {
          create: {
            accountNumber: newAccountNumber,
            balance: 0,
          },
        },
      },
      include: {
        accounts: true,
      },
    })

    return NextResponse.json({
      message: 'User approved and account created successfully',
      user,
      accountNumber: newAccountNumber,
    })
  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}