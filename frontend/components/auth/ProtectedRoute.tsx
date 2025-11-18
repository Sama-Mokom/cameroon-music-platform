// components/auth/ProtectedRoute.tsx
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
  // Include the new _hasHydrated state property
  const { isAuthenticated, user, _hasHydrated } = useAuthStore(
    (state) => ({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      _hasHydrated: state._hasHydrated, // <-- Get the new state
    })
  );

  useEffect(() => {
    // 🚨 Critical Change: Only perform routing checks AFTER the store is hydrated
    if (_hasHydrated) {
      // 1. Redirect to login if not authenticated
      if (!isAuthenticated) {
        router.push('/login')
        return; // Stop further checks
      }

      // 2. Check role if required
      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to dashboard if insufficient permissions
        router.push('/dashboard') 
      }
    }
  }, [isAuthenticated, _hasHydrated, user, requiredRole, router])

  // --- RENDERING LOGIC ---

  // 1. Show loading/spinner if the store is NOT yet hydrated
  if (!_hasHydrated) {
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
          {/* Note: In a real app, you need to define the 'spin' animation in your CSS */}
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '1.125rem', color: '#B3B3B3' }}>Loading Session...</p>
        </div>
      </div>
    )
  }

  // 2. If hydrated but NOT authenticated, return null while waiting for the useEffect redirect.
  // We don't render children until we are certain the user is authenticated.
  if (!isAuthenticated) {
    return null;
  }

  // 3. If hydrated AND authenticated, render the children.
  return <>{children}</>
}