'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'USER' | 'ARTIST' | 'PROMOTER' | 'ADMIN'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuthStore()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }

    // Check role if required
    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      router.push('/dashboard') // Redirect to dashboard if insufficient permissions
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router])

  // Show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F0F0F',
        color: '#2FFF8D'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '1.125rem', color: '#B3B3B3' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
