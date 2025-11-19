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
  const [currentApiUrl, setCurrentApiUrl] = useState<string>('')
  const [currentFrontendUrl, setCurrentFrontendUrl] = useState<string>('')

  useEffect(() => {
    checkApiHealth()
    // Set current URLs for display
    const apiUrl = getApiUrl()
    setCurrentApiUrl(apiUrl)
    if (typeof window !== 'undefined') {
      setCurrentFrontendUrl(`${window.location.protocol}//${window.location.host}`)
    }
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
    <main className="min-h-screen bg-gradient-to-br bg-black dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="text-6xl font-bold bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                🎵
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-white dark:text-white">
              Cameroon Music Industry Platform
            </h1>
            <p className="text-lg text-white dark:text-gray-300">
              Connect, Create, and Celebrate Cameroonian Music
            </p>
          </div>

          {/* Hero / Intro Section */}
          <section className="relative rounded-lg overflow-hidden mb-8 bg-black text-white">
            <div className="absolute inset-0 bg-black/95" />
            <div className="relative z-10 container mx-auto px-6 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-3 mb-4">
                    <img src="/logo.jpg" alt="CIMFest Logo" className="h-14 w-auto rounded-md shadow" />
                    <span className="text-sm font-medium text-white/90">Cameroon Music Industry Platform</span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-white mb-4">
                    Showcase. Protect. Celebrate Cameroonian Music.
                  </h2>

                  <p className="text-lg text-white/80 mb-6 max-w-xl">
                    Upload your tracks, build your audience, and keep ownership safe with our audio fingerprinting & duplicate detection. Discover the community, manage releases, and grow your career.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link href="/signup" className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow">
                      Get Started
                    </Link>
            
                  </div>
                </div>

                <div className="flex justify-center md:justify-end">
                  <div className="w-full max-w-md p-6 bg-neutral-900/70 rounded-xl shadow-lg backdrop-blur">
                    <img src="/cimfestlogo.jpg" alt="CIMFest artwork" className="w-full h-52 object-cover rounded-md mb-4" />
                    <div className="text-sm text-white/80">
                      <strong className="block text-white">Featured</strong>
                      Listen to top tracks and explore trending artists on the platform.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
