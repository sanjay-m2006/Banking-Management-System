import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const pendingUsers = await db.user.findMany({
      where: { isApproved: false, isAdmin: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        dob: true,
        createdAt: true,
      },
    })

    return NextResponse.json(pendingUsers)
  } catch (error) {
    console.error('Error fetching pending users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}