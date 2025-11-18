'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { AuthResponse, RegisterRequest } from '@/types/auth'
import { Music, User, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import './signup.css'

export default function SignupPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    accountType: 'user',
  })

  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter'
    }

    if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter'
    }

    if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one number'
    }

    if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', formData)

      setAuth(response.data.user, response.data.tokens)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Signup error:', err)

      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data?.errors) {
        const backendErrors: Record<string, string> = {}
        err.response.data.errors.forEach((error: { field: string; message: string }) => {
          backendErrors[error.field] = error.message
        })
        setFieldErrors(backendErrors)
      } else {
        setError('Failed to create account. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* Left side - Branding */}
        <div className="signup-branding">
          <div className="brand-content">
            <div className="brand-icon">
              <Music size={48} />
            </div>
            <h1 className="brand-title">
              Cameroon Music
              <br />
              Industry Platform
            </h1>
            <p className="brand-description">
              Join the largest community of Cameroonian artists and music lovers. Create, share, and celebrate our music.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <CheckCircle2 size={20} />
                <span>Upload and share your music</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={20} />
                <span>Connect with fans and artists</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={20} />
                <span>Book artists for events</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={20} />
                <span>Grow your music career</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="signup-form-section">
          <div className="form-header">
            <h2>Create Account</h2>
            <p>Start your musical journey today</p>
          </div>

          {error && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="signup-form">
            {/* Account Type Selection */}
            <div className="account-type-selector">
              <button
                type="button"
                className={`account-type-btn ${formData.accountType === 'user' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, accountType: 'user' })}
              >
                <User size={24} />
                <div>
                  <div className="type-label">Listener</div>
                  <div className="type-description">Discover & enjoy music</div>
                </div>
              </button>

              <button
                type="button"
                className={`account-type-btn ${formData.accountType === 'artist' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, accountType: 'artist' })}
              >
                <Music size={24} />
                <div>
                  <div className="type-label">Artist</div>
                  <div className="type-description">Share your music</div>
                </div>
              </button>
            </div>

            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={fieldErrors.name ? 'error' : ''}
                  disabled={isLoading}
                  required
                />
              </div>
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
            </div>

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
                  className={fieldErrors.email ? 'error' : ''}
                  disabled={isLoading}
                  required
                />
              </div>
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
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
                  className={fieldErrors.password ? 'error' : ''}
                  disabled={isLoading}
                  required
                />
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={fieldErrors.confirmPassword ? 'error' : ''}
                  disabled={isLoading}
                  required
                />
              </div>
              {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Login Link */}
            <div className="form-footer">
              Already have an account?{' '}
              <Link href="/login" className="link">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
