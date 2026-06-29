'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Wallet,
  CheckCircle,
  XCircle,
  LogOut,
  User as UserIcon,
  IndianRupee,
  RefreshCw,
  CreditCard,
} from 'lucide-react'

interface PendingUser {
  id: string
  name: string
  email: string
  mobile: string
  dob: string
  createdAt: string
}

interface PendingDeposit {
  id: string
  accountNumber: string
  userName: string
  amount: number
  createdAt: string
}

interface AccountInfo {
  id: string
  accountNumber: string
  balance: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    mobile: string
  }
}

interface AdminDashboardProps {
  user: any
  token: string
}

export function AdminDashboard({ user, token }: AdminDashboardProps) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([])
  const [allAccounts, setAllAccounts] = useState<AccountInfo[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAccounts: 0,
    pendingApprovals: 0,
    totalBalance: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([fetchPendingUsers(), fetchPendingDeposits(), fetchStats(), fetchAllAccounts()])
  }

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/pending-users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setPendingUsers(data)
      }
    } catch (error) {
      console.error('Error fetching pending users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingDeposits = async () => {
    try {
      const response = await fetch('/api/admin/pending-deposits', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setPendingDeposits(data)
      }
    } catch (error) {
      console.error('Error fetching pending deposits:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchAllAccounts = async () => {
    try {
      const response = await fetch('/api/admin/all-accounts', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAllAccounts(data)
      }
    } catch (error) {
      console.error('Error fetching all accounts:', error)
    }
  }

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/approve-user/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        await fetchData()
        alert(`✅ ${data.message || 'User approved and account created successfully!'}`)
      } else {
        alert('Failed to approve user')
      }
    } catch (error) {
      console.error('Error approving user:', error)
    }
  }

  const handleRejectUser = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this user?')) return
    try {
      const response = await fetch(`/api/admin/reject-user/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        await fetchData()
        alert('User rejected')
      } else {
        alert('Failed to reject user')
      }
    } catch (error) {
      console.error('Error rejecting user:', error)
    }
  }

  const handleApproveDeposit = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/admin/approve-deposit/${transactionId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        await fetchData()
        alert('✅ Deposit approved!')
      } else {
        alert('Failed to approve deposit')
      }
    } catch (error) {
      console.error('Error approving deposit:', error)
    }
  }

  const handleRejectDeposit = async (transactionId: string) => {
    if (!confirm('Are you sure you want to reject this deposit?')) return
    try {
      const response = await fetch(`/api/admin/reject-deposit/${transactionId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        await fetchData()
        alert('Deposit rejected')
      } else {
        alert('Failed to reject deposit')
      }
    } catch (error) {
      console.error('Error rejecting deposit:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Wallet className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                SecureBank Admin
              </h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="w-4 h-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAccounts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
              <RefreshCw className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingApprovals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(stats.totalBalance)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Operations */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Pending Users
            </TabsTrigger>
            <TabsTrigger value="deposits">
              <Wallet className="w-4 h-4 mr-2" />
              Pending Deposits
            </TabsTrigger>
            <TabsTrigger value="accounts">
              <CreditCard className="w-4 h-4 mr-2" />
              All Accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Approval Requests</CardTitle>
                <CardDescription>
                  Review and approve or reject new user registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending user approvals</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white">
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Date of Birth</TableHead>
                          <TableHead>Registered On</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingUsers.map((pendingUser) => (
                          <TableRow key={pendingUser.id}>
                            <TableCell className="font-medium">{pendingUser.name}</TableCell>
                            <TableCell>{pendingUser.email}</TableCell>
                            <TableCell>{pendingUser.mobile}</TableCell>
                            <TableCell>{new Date(pendingUser.dob).toLocaleDateString('en-IN')}</TableCell>
                            <TableCell>{new Date(pendingUser.createdAt).toLocaleDateString('en-IN')}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveUser(pendingUser.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectUser(pendingUser.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deposits">
            <Card>
              <CardHeader>
                <CardTitle>Pending Deposit Approvals</CardTitle>
                <CardDescription>
                  Review and approve or reject deposit requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingDeposits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending deposit approvals</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white">
                        <TableRow>
                          <TableHead>Account Number</TableHead>
                          <TableHead>User Name</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Requested On</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingDeposits.map((deposit) => (
                          <TableRow key={deposit.id}>
                            <TableCell className="font-medium">{deposit.accountNumber}</TableCell>
                            <TableCell>{deposit.userName}</TableCell>
                            <TableCell className="text-emerald-600 font-semibold">
                              {formatCurrency(deposit.amount)}
                            </TableCell>
                            <TableCell>{new Date(deposit.createdAt).toLocaleDateString('en-IN')}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveDeposit(deposit.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectDeposit(deposit.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle>All Bank Accounts</CardTitle>
                <CardDescription>
                  View all accounts and their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allAccounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No accounts found</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white">
                        <TableRow>
                          <TableHead>Account Number</TableHead>
                          <TableHead>Customer Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                          <TableHead>Created On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allAccounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.accountNumber}</TableCell>
                            <TableCell>{account.user.name}</TableCell>
                            <TableCell>{account.user.email}</TableCell>
                            <TableCell>{account.user.mobile}</TableCell>
                            <TableCell className="text-emerald-600 font-semibold text-right">
                              {formatCurrency(account.balance)}
                            </TableCell>
                            <TableCell>{new Date(account.createdAt).toLocaleDateString('en-IN')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}