'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Wallet,
  ArrowUp,
  ArrowDownRight,
  ArrowRightLeft,
  FileText,
  LogOut,
  User as UserIcon,
  CreditCard,
  IndianRupee,
  Download,
  Eye,
} from 'lucide-react'

interface Account {
  id: string
  accountNumber: string
  balance: number
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string | null
  status: string
  fromAccount: string | null
  toAccount: string | null
  createdAt: string
}

interface DashboardProps {
  user: any
  token: string
}

export function UserDashboard({ user, token }: DashboardProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [transferAccount, setTransferAccount] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const account = accounts.length > 0 ? accounts[0] : null

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`/api/accounts?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
        if (data.length > 0) {
          fetchTransactions(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (accountId: string) => {
    try {
      const response = await fetch(`/api/transactions?accountId=${accountId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleDeposit = async () => {
    if (!account || !depositAmount) return
    try {
      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: account.id,
          amount: parseFloat(depositAmount),
        }),
      })
      if (response.ok) {
        setDepositAmount('')
        await fetchAccounts()
        alert('Deposit request submitted. Awaiting admin approval.')
      } else {
        alert('Failed to submit deposit request')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const handleWithdraw = async () => {
    if (!account || !withdrawAmount) return
    try {
      const response = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountId: account.id,
          amount: parseFloat(withdrawAmount),
        }),
      })
      if (response.ok) {
        setWithdrawAmount('')
        await fetchAccounts()
        alert('Withdrawal successful!')
      } else {
        const data = await response.json()
        alert(data.error || 'Withdrawal failed')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const handleTransfer = async () => {
    if (!account || !transferAccount || !transferAmount) return
    try {
      const response = await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromAccountId: account.id,
          toAccountNumber: transferAccount,
          amount: parseFloat(transferAmount),
        }),
      })
      if (response.ok) {
        setTransferAccount('')
        setTransferAmount('')
        await fetchAccounts()
        alert('Transfer successful!')
      } else {
        const data = await response.json()
        alert(data.error || 'Transfer failed')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const handleDownloadPDF = () => {
    if (!account) {
      alert('No account found')
      return
    }

    const tokenFromStorage = localStorage.getItem('token')
    if (!tokenFromStorage) {
      alert('Not authenticated. Please login again.')
      return
    }

    try {
      // Open statement in new window
      const url = `/api/transactions/statement?accountId=${account.id}&token=${tokenFromStorage}`

      // Create a new window
      const printWindow = window.open(url, '_blank')

      if (!printWindow) {
        alert('Please allow popups for this site to download PDF')
        return
      }

      // Wait for the window to load and trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 1000)
      }

      // Fallback for browsers that don't trigger onload properly
      setTimeout(() => {
        if (printWindow.document.readyState === 'complete') {
          printWindow.print()
        }
      }, 2000)
    } catch (error) {
      console.error('Error opening statement for printing:', error)
      alert('Failed to open statement. Please try again.')
    }
  }

  const handleViewStatement = () => {
    if (!account) {
      alert('No account found')
      return
    }
    
    const tokenFromStorage = localStorage.getItem('token')
    if (!tokenFromStorage) {
      alert('Not authenticated. Please login again.')
      return
    }
    
    try {
      const url = `/api/transactions/statement?accountId=${account.id}&token=${tokenFromStorage}`
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error opening statement:', error)
      alert('Failed to open statement. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Wallet className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                SecureBank
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
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
        {/* Account Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Account</h2>
          {accounts.length > 0 ? (
            <Card className="max-w-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <CardDescription>Account Number</CardDescription>
                </div>
                <CardTitle className="text-lg">{accounts[0].accountNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-3xl font-bold text-emerald-600 flex items-center gap-1">
                    <IndianRupee className="w-6 h-6" />
                    {formatCurrency(accounts[0].balance)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50 text-emerald-600" />
              <h3 className="text-lg font-semibold mb-2">Account Creation Pending</h3>
              <p className="text-muted-foreground mb-4">
                Your account is being created by the administrator. Please wait for approval.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-md text-sm">
                <Wallet className="w-4 h-4" />
                <span>Account will be created upon admin approval</span>
              </div>
            </Card>
          )}
        </div>

        {/* Dashboard Operations */}
        {account && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <Tabs defaultValue="deposit" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="deposit">
                    <ArrowDownRight className="w-4 h-4 mr-2" />
                    Deposit
                  </TabsTrigger>
                  <TabsTrigger value="withdraw">
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Withdraw
                  </TabsTrigger>
                  <TabsTrigger value="transfer">
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Transfer
                  </TabsTrigger>
                  <TabsTrigger value="statement">
                    <FileText className="w-4 h-4 mr-2" />
                    Statement
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="deposit">
                  <Card>
                    <CardHeader>
                      <CardTitle>Deposit Money</CardTitle>
                      <CardDescription>
                        Deposit amount to your account. Awaiting admin approval.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deposit-amount">Amount (₹)</Label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="deposit-amount"
                            type="number"
                            placeholder="Enter amount"
                            className="pl-10"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            min="1"
                          />
                        </div>
                      </div>
                      <Button onClick={handleDeposit} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Submit Deposit Request
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="withdraw">
                  <Card>
                    <CardHeader>
                      <CardTitle>Withdraw Money</CardTitle>
                      <CardDescription>
                        Withdraw money from your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdraw-amount">Amount (₹)</Label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="withdraw-amount"
                            type="number"
                            placeholder="Enter amount"
                            className="pl-10"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            min="1"
                            max={account.balance}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Available: {formatCurrency(account.balance)}
                        </p>
                      </div>
                      <Button onClick={handleWithdraw} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Withdraw
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transfer">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transfer Money</CardTitle>
                      <CardDescription>
                        Transfer money to another account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="transfer-account">Recipient Account Number</Label>
                        <Input
                          id="transfer-account"
                          placeholder="Enter account number"
                          value={transferAccount}
                          onChange={(e) => setTransferAccount(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transfer-amount">Amount (₹)</Label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="transfer-amount"
                            type="number"
                            placeholder="Enter amount"
                            className="pl-10"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            min="1"
                            max={account.balance}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Available: {formatCurrency(account.balance)}
                        </p>
                      </div>
                      <Button onClick={handleTransfer} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Transfer Money
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="statement">
                  <Card>
                    <CardHeader>
                      <CardTitle>E-Statement</CardTitle>
                      <CardDescription>
                        View or download your account statement
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button onClick={handleViewStatement} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <Eye className="w-4 h-4 mr-2" />
                        View Statement
                      </Button>
                      <Button onClick={handleDownloadPDF} variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                        <Download className="w-4 h-4 mr-2" />
                        Download as PDF
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Transactions Table */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                              No transactions yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          transactions.map((transaction) => {
                            // Determine if this is a received transfer
                            const isReceivedTransfer = transaction.type === 'transfer' && transaction.toAccount === account?.accountNumber
                            return (
                              <TableRow key={transaction.id}>
                                <TableCell>
                                  {new Date(transaction.createdAt).toLocaleDateString('en-IN')}
                                </TableCell>
                                <TableCell className="capitalize">
                                  {transaction.type}
                                  {isReceivedTransfer && <span className="ml-1 text-xs text-emerald-600">(Rcvd)</span>}
                                </TableCell>
                                <TableCell>{transaction.description || '-'}</TableCell>
                                <TableCell className={`text-right font-semibold ${
                                  transaction.type === 'deposit' || isReceivedTransfer ? 'text-emerald-600' :
                                  transaction.type === 'withdraw' || (transaction.type === 'transfer' && !isReceivedTransfer) ? 'text-red-600' : ''
                                }`}>
                                  {transaction.type === 'deposit' || isReceivedTransfer ? '+' :
                                   transaction.type === 'withdraw' || (transaction.type === 'transfer' && !isReceivedTransfer) ? '-' : ''}
                                  {formatCurrency(transaction.amount)}
                                </TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    transaction.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    transaction.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {transaction.status}
                                  </span>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}