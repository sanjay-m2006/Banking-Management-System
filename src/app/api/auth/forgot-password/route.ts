import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, dob } = await request.json()

    if (!email || !dob) {
      return NextResponse.json({ error: 'Email and Date of Birth are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Validate DOB format
    const dobDate = new Date(dob)
    if (isNaN(dobDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 })
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      // Don't reveal that user doesn't exist
      return NextResponse.json({
        message: 'If the email and DOB match, you will receive further instructions.',
        valid: false
      }, { status: 200 })
    }

    // Verify DOB matches
    const userDob = new Date(user.dob)
    const providedDob = new Date(dob)

    // Compare date parts (year, month, day)
    const dobMatch =
      userDob.getFullYear() === providedDob.getFullYear() &&
      userDob.getMonth() === providedDob.getMonth() &&
      userDob.getDate() === providedDob.getDate()

    if (!dobMatch) {
      return NextResponse.json({
        message: 'The date of birth does not match our records.',
        valid: false
      }, { status: 200 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // Update user with reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // In a real application, you would send an email with the reset token
    // For this demo, we'll return the token in the response
    return NextResponse.json({
      message: 'Verification successful! You can now reset your password.',
      valid: true,
      resetToken,
      // Remove these in production - only return for demo purposes
      email: user.email
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}