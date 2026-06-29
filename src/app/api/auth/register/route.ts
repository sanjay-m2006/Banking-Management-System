import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, dob, mobile } = await request.json()

    // Validate all fields
    if (!name || !email || !password || !dob || !mobile) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ error: 'Mobile number must be 10 digits' }, { status: 400 })
    }

    // Validate date of birth
    const dobDate = new Date(dob)
    if (isNaN(dobDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 })
    }

    // Check if user is at least 18 years old
    const today = new Date()
    const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    if (dobDate > minAgeDate) {
      return NextResponse.json({ error: 'You must be at least 18 years old to register' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        dob: dobDate,
        mobile: mobile.trim(),
        isApproved: false,
        isAdmin: false,
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Registration successful! Please wait for admin approval.',
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}