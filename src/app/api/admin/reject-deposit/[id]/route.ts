import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transactionId } = await params

    await db.transaction.update({
      where: { id: transactionId },
      data: { status: 'rejected' },
    })

    return NextResponse.json({ message: 'Deposit rejected successfully' })
  } catch (error) {
    console.error('Error rejecting deposit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}