'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2 } from 'lucide-react'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated - redirect to login
        router.push('/login')
      } else if (user.role !== 'ADMIN') {
        // Not an admin - redirect to dashboard
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0F0F0F',
        color: '#FFFFFF',
      }}>
        <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  // Don't render until we verify user is admin
  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return <>{children}</>
}
