'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { AuthResponse, LoginRequest } from '@/types/auth'
import { Music, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import './login.css'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', formData)

      setAuth(response.data.user, response.data.tokens)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)

      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to login. Please check your credentials and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Left side - Branding */}
        <div className="login-branding">
          <div className="brand-content">
            <div className="brand-icon">
              <Music size={48} />
            </div>
            <h1 className="brand-title">
              Welcome Back
            </h1>
            <p className="brand-description">
              Sign in to continue your musical journey. Connect with artists, discover new music, and be part of the Cameroonian music revolution.
            </p>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Artists</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Songs</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100K+</div>
                <div className="stat-label">Listeners</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="login-form-section">
          <div className="form-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="forgot-password">
              <Link href="/forgot-password" className="link-subtle">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Sign Up Link */}
            <div className="form-footer">
              Don't have an account?{' '}
              <Link href="/signup" className="link">
                Create one now
              </Link>
            </div>
          </form>

          {/* Divider */}
          <div className="divider">
            <span>or continue as</span>
          </div>

          {/* Guest Link */}
          <button
            type="button"
            className="guest-btn"
            onClick={() => router.push('/')}
          >
            Browse as Guest
          </button>
        </div>
      </div>
    </div>
  )
}
