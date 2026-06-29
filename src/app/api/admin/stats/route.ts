import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const [totalUsers, totalAccounts, pendingApprovals, allAccounts] = await Promise.all([
      db.user.count({ where: { isAdmin: false } }),
      db.account.count(),
      db.user.count({ where: { isApproved: false, isAdmin: false } }),
      db.account.findMany({ select: { balance: true } }),
    ])

    const totalBalance = allAccounts.reduce((sum, acc) => sum + acc.balance, 0)

    return NextResponse.json({
      totalUsers,
      totalAccounts,
      pendingApprovals,
      totalBalance,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}