'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // User is already logged in, redirect to dashboard
        router.push('/dashboard')
      }
    }
    
    checkSession()
  }, [router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user && data.session) {
        console.log('Login successful, user:', data.user.email)
        
        // Wait a bit for the session to be established
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          if (profileError.code === 'PGRST116') {
            setError('User profile not found. Please ensure your account is properly set up in the system.')
          } else {
            setError(`Profile error: ${profileError.message}`)
          }
          return
        }

        if (profile && profile.role) {
          console.log('Profile found:', profile)
          
          // Redirect based on role with a small delay
          setTimeout(() => {
            switch (profile.role) {
              case 'admin':
                router.push('/dashboard/admin')
                break
              case 'doctor':
                router.push('/dashboard/doctor')
                break
              case 'patient':
                router.push('/dashboard/patient')
                break
              default:
                router.push('/dashboard')
            }
          }, 100)
        } else {
          setError('User profile exists but role is not assigned. Please contact administrator.')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const demoAccounts = [
    { email: 'admin@example.com', password: 'Admin@123', role: 'Admin' },
    { email: 'doctor@example.com', password: 'Doctor@123', role: 'Doctor' },
    { email: 'patient@example.com', password: 'Patient@123', role: 'Patient' },
  ]

  const handleDemoLogin = (email: string, password: string) => {
    setEmail(email)
    setPassword(password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-600 mb-2">AyurSutra</h1>
          <h2 className="text-2xl font-semibold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">
            Panchakarma Patient Management System
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleDemoLogin(account.email, account.password)}
                  className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <div className="font-medium text-gray-900">{account.role}</div>
                  <div className="text-gray-600">{account.email}</div>
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Click on any demo account above to auto-fill credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
