'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2 } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { getApiUrl } from '@/lib/get-api-url'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [dbStatus, setDbStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    checkApiHealth()
  }, [])

  const checkApiHealth = async () => {
    try {
      const apiUrl = getApiUrl()
      const response = await axios.get(`${apiUrl}/api/health`)
      setApiStatus('online')
      if (response.data.database === 'connected') {
        setDbStatus('online')
      } else {
        setDbStatus('offline')
      }
    } catch (error) {
      setApiStatus('offline')
      setDbStatus('offline')
    }
  }

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'checking') return <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
    if (status === 'online') return <Check className="h-5 w-5 text-green-500" />
    return <X className="h-5 w-5 text-red-500" />
  }

  const StatusText = ({ status }: { status: string }) => {
    if (status === 'checking') return <span className="text-yellow-500">Checking...</span>
    if (status === 'online') return <span className="text-green-500">Online</span>
    return <span className="text-red-500">Offline</span>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="text-6xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                🎵
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Cameroon Music Industry Platform
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Connect, Create, and Celebrate Cameroonian Music
            </p>
          </div>

          {/* System Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
              <span className="mr-3">System Status</span>
              {apiStatus === 'online' && dbStatus === 'online' && (
                <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                  All Systems Operational
                </span>
              )}
            </h2>

            <div className="space-y-4">
              {/* Frontend Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <StatusIcon status="online" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Frontend (Next.js)</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">localhost:3000</p>
                  </div>
                </div>
                <StatusText status="online" />
              </div>

              {/* API Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <StatusIcon status={apiStatus} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">API (NestJS)</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">localhost:4000</p>
                  </div>
                </div>
                <StatusText status={apiStatus} />
              </div>

              {/* Database Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <StatusIcon status={dbStatus} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Database (MySQL)</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">XAMPP - Port 3306</p>
                  </div>
                </div>
                <StatusText status={dbStatus} />
              </div>
            </div>

            {apiStatus === 'offline' && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Make sure XAMPP MySQL is running and the backend server is started. Run <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded">npm run start:dev</code> in the backend directory.
                </p>
              </div>
            )}
          </div>

          {/* Auth Status / CTA */}
          {isAuthenticated ? (
            <div className="bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg shadow-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h3>
              <p className="mb-6">You're logged in and ready to go.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg shadow-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">🎉 Milestone 2: Authentication Complete</h3>
              <p className="mb-4">Full authentication system is now live:</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  User Registration & Login
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  JWT Access & Refresh Tokens
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Protected Routes & Auth Guards
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Artist & User Account Types
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Redis Session Management
                </li>
              </ul>
              <div className="flex gap-4">
                <Link
                  href="/signup"
                  className="flex-1 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="flex-1 bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
