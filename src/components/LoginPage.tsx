'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, User, Mail, Phone, Calendar, Eye, EyeOff, ArrowLeft } from 'lucide-react'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forgotStep, setForgotStep] = useState<'login' | 'verify' | 'reset' | 'done'>('login')
  const [resetToken, setResetToken] = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        window.location.href = '/'
      } else {
        alert(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      // Don't alert, just reset loading state
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Prevent multiple submissions
    if (loading) {
      return
    }

    setLoading(true)

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const dob = formData.get('dob') as string
    const mobile = formData.get('mobile') as string

    // Client-side validation
    if (!name || !email || !password || !dob || !mobile) {
      alert('❌ All fields are required')
      setLoading(false)
      return
    }

    if (name.trim().length < 2) {
      alert('❌ Name must be at least 2 characters')
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('❌ Please enter a valid email address')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      alert('❌ Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (!/^\d{10}$/.test(mobile)) {
      alert('❌ Mobile number must be 10 digits')
      setLoading(false)
      return
    }

    const userData = { name, email, password, dob, mobile }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ ' + (data.message || 'Registration successful! Please wait for admin approval.'))
        setLoading(false)
        setTimeout(() => {
          form.reset()
        }, 500)
      } else {
        alert('❌ Error: ' + (data.error || 'Registration failed. Please try again.'))
        setLoading(false)
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('❌ Error: Registration failed. Please try again.')
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (loading) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const dob = formData.get('dob') as string

    if (!email || !dob) {
      alert('❌ Email and Date of Birth are required')
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('❌ Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, dob }),
      })

      const data = await response.json()

      if (data.valid) {
        setResetToken(data.resetToken)
        setForgotStep('reset')
        alert('✅ Verification successful! Please enter your new password.')
      } else {
        alert('❌ ' + data.message)
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      alert('❌ Error: Failed to verify. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (loading) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!newPassword || !confirmPassword) {
      alert('❌ Both password fields are required')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      alert('❌ Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      alert('❌ Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ Password reset successful! You can now login with your new password.')
        setForgotStep('done')
      } else {
        alert('❌ ' + (data.error || 'Password reset failed. Please try again.'))
      }
    } catch (error) {
      console.error('Reset password error:', error)
      alert('❌ Error: Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setForgotStep('login')
    setResetToken('')
    setShowPassword(false)
    setShowNewPassword(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              SecureBank
            </h1>
            <p className="text-xl text-muted-foreground">
              Your Trusted Banking Partner
            </p>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-emerald-600" />
              </div>
              <span>Bank-grade security</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <span>Easy account management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <span>24/7 access to your finances</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login/Register Form */}
        <Card className="shadow-2xl border-0">
          {forgotStep === 'login' && (
            <CardHeader className="space-y-1 text-center pb-4">
              <div className="lg:hidden mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  SecureBank
                </h1>
              </div>
              <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to manage your account or create a new one
              </CardDescription>
            </CardHeader>
          )}
          <CardContent>
            {forgotStep === 'login' && (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setForgotStep('verify')}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-mobile">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-mobile"
                        name="mobile"
                        type="tel"
                        placeholder="Enter 10-digit mobile number"
                        className="pl-10"
                        pattern="[0-9]{10}"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-dob">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-dob"
                        name="dob"
                        type="date"
                        className="pl-10"
                        max={(() => {
                          const date = new Date()
                          date.setFullYear(date.getFullYear() - 18)
                          return date.toISOString().split('T')[0]
                        })()}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">You must be at least 18 years old</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            )}

            {/* Forgot Password - Verification Step */}
            {forgotStep === 'verify' && (
              <div className="space-y-4 mt-4">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Login
                </button>
                <CardTitle className="text-2xl font-semibold text-center">Forgot Password</CardTitle>
                <CardDescription className="text-center">
                  Verify your identity by entering your email and date of birth
                </CardDescription>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        name="email"
                        type="email"
                        placeholder="Enter your registered email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="forgot-dob">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="forgot-dob"
                        name="dob"
                        type="date"
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Enter the date of birth you used during registration</p>
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Identity'}
                  </Button>
                </form>
              </div>
            )}

            {/* Forgot Password - Reset Step */}
            {forgotStep === 'reset' && (
              <div className="space-y-4 mt-4">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Login
                </button>
                <CardTitle className="text-2xl font-semibold text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">
                  Enter your new password below
                </CardDescription>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        className="pl-10 pr-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              </div>
            )}

            {/* Forgot Password - Done Step */}
            {forgotStep === 'done' && (
              <div className="space-y-4 mt-4 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl font-semibold">Password Reset Successful!</CardTitle>
                <CardDescription>
                  Your password has been successfully reset. You can now login with your new password.
                </CardDescription>
                <Button onClick={handleBackToLogin} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Go to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}