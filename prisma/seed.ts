import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function seed() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await db.user.upsert({
    where: { email: 'admin@bank.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@bank.com',
      password: hashedPassword,
      dob: new Date('1990-01-01'),
      mobile: '9999999999',
      isApproved: true,
      isAdmin: true,
    },
  })

  console.log('Admin user created:', admin)
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())