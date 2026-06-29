'use client'

import { LoginPage } from '@/components/LoginPage'
import { UserDashboard } from '@/components/dashboard/UserDashboard'
import { AdminDashboard } from '@/components/dashboard/AdminDashboard'

export default function Home() {
  const user = typeof window !== 'undefined' && localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  if (!user || !token) {
    return <LoginPage />
  }

  if (user.isAdmin) {
    return <AdminDashboard user={user} token={token} />
  }

  return <UserDashboard user={user} token={token} />
}