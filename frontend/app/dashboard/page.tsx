'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'
import { artistApi } from '@/lib/api/artist'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Music, User, LogOut, Settings, TrendingUp, Heart, PlayCircle, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import type { ArtistProfile } from '@/types/artist'
import './dashboard.css'

function DashboardContent() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [dismissedVerification, setDismissedVerification] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const { tokens } = useAuthStore.getState()
      await apiClient.post('/auth/logout', {
        refreshToken: tokens?.refreshToken,
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
      router.push('/login')
    }
  }

  const isArtist = user?.role === 'ARTIST'

  // Load artist profile if user is an artist
  useEffect(() => {
    if (isArtist) {
      loadArtistProfile()
    } else {
      setLoadingProfile(false)
    }
  }, [isArtist])

  const loadArtistProfile = async () => {
    try {
      const profile = await artistApi.getMyProfile()
      setArtistProfile(profile)
    } catch (error: any) {
      console.error('Failed to load artist profile:', error)
      // Profile might not exist yet, which is fine
    } finally {
      setLoadingProfile(false)
    }
  }

  // Check if artist needs verification
  const isVerified = artistProfile?.verification?.status === 'VERIFIED'
  const isPending = artistProfile?.verification?.status === 'PENDING'
  const needsVerification = isArtist && !isVerified && !isPending && !dismissedVerification
  const showPendingOverlay = isPending && !dismissedVerification

  return (
    <div className="dashboard-container">
      {/* Verification Overlay for Unverified Artists */}
      {isArtist && needsVerification && (
        <div className="verification-overlay">
          <div className="verification-card">
            <ShieldCheck size={64} className="verification-icon" />
            <h2>Verify Your Artist Account</h2>
            <p>
              To access all features and upload music, you need to verify your identity.
              This helps us maintain a trusted community of artists.
            </p>
            <button
              className="verify-btn"
              onClick={() => router.push('/artist/verification')}
            >
              Start Verification
            </button>
            <button
              className="verify-later-btn"
              onClick={() => setDismissedVerification(true)}
            >
              I&apos;ll do this later
            </button>
          </div>
        </div>
      )}

      {/* Pending Verification Overlay */}
      {isArtist && showPendingOverlay && (
        <div className="verification-overlay pending">
          <div className="verification-card">
            <Loader2 size={64} className="verification-icon spinner" />
            <h2>Verification in Progress</h2>
            <p>
              Your documents are being reviewed by our team. This usually takes 24-48 hours.
              We&apos;ll notify you once the review is complete.
            </p>
            <button
              className="verify-btn"
              onClick={() => router.push('/artist/verification')}
            >
              View Verification Status
            </button>
            <button
              className="verify-later-btn"
              onClick={() => setDismissedVerification(true)}
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <Music size={32} />
            <span>Cameroon Music</span>
          </div>

          <div className="header-actions">
            <button className="icon-btn">
              <Settings size={20} />
            </button>
            <button
              className="logout-btn"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={20} />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`dashboard-main ${(needsVerification || showPendingOverlay) ? 'blurred' : ''}`}>
        <div className="dashboard-content">
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-text">
              <h1>Welcome back, {user?.name}! 👋</h1>
              <p>
                {isArtist
                  ? "Ready to share your music with the world? Let's get started!"
                  : "Discover new music and connect with your favorite artists."}
              </p>
            </div>
            <div className="user-badge">
              <div className="badge-icon">
                {isArtist ? <Music size={24} /> : <User size={24} />}
              </div>
              <div className="badge-text">
                <div className="badge-role">
                  {isArtist ? 'Artist' : 'Listener'}
                  {isArtist && isVerified && (
                    <span className="verified-badge" title="Verified Artist">
                      <ShieldCheck size={16} />
                    </span>
                  )}
                </div>
                <div className="badge-email">{user?.email}</div>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <PlayCircle size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">0</div>
                <div className="stat-label">{isArtist ? 'Songs Uploaded' : 'Songs Played'}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Heart size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">0</div>
                <div className="stat-label">{isArtist ? 'Followers' : 'Favorites'}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">0</div>
                <div className="stat-label">{isArtist ? 'Total Plays' : 'Playlists'}</div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              {isArtist ? (
                <>
                  {!isVerified && (
                    <button
                      className="action-card verification-card-action"
                      onClick={() => router.push('/artist/verification')}
                    >
                      <ShieldCheck size={32} />
                      <div className="action-title">
                        {isPending ? 'Verification Pending' : 'Verify Account'}
                      </div>
                      <div className="action-description">
                        {isPending ? 'Check verification status' : 'Required to upload music'}
                      </div>
                    </button>
                  )}
                  {isVerified ? (
                    <>
                      <button className="action-card" onClick={() => router.push('/artist/songs/upload')}>
                        <Music size={32} />
                        <div className="action-title">Upload Song</div>
                        <div className="action-description">Share your latest track</div>
                      </button>
                      <button className="action-card" onClick={() => router.push('/artist/songs')}>
                        <PlayCircle size={32} />
                        <div className="action-title">My Songs</div>
                        <div className="action-description">View your uploaded music</div>
                      </button>
                    </>
                  ) : (
                    <button className="action-card disabled" disabled>
                      <Music size={32} />
                      <div className="action-title">Upload Song</div>
                      <div className="action-description">Requires verification</div>
                    </button>
                  )}
                  <button className="action-card" onClick={() => router.push('/artist/profile/edit')}>
                    <User size={32} />
                    <div className="action-title">Edit Profile</div>
                    <div className="action-description">Update your artist info</div>
                  </button>
                  <button className="action-card" onClick={() => alert('Coming soon!')}>
                    <TrendingUp size={32} />
                    <div className="action-title">View Analytics</div>
                    <div className="action-description">Track your performance</div>
                  </button>
                </>
              ) : user?.role === 'ADMIN' ? (
                <>
                  <button className="action-card" onClick={() => router.push('/admin/verifications')}>
                    <ShieldCheck size={32} />
                    <div className="action-title">Manage Verifications</div>
                    <div className="action-description">Review artist verification requests</div>
                  </button>
                  <button className="action-card" onClick={() => alert('Coming soon!')}>
                    <User size={32} />
                    <div className="action-title">Manage Users</div>
                    <div className="action-description">View and manage all users</div>
                  </button>
                  <button className="action-card" onClick={() => alert('Coming soon!')}>
                    <TrendingUp size={32} />
                    <div className="action-title">Platform Analytics</div>
                    <div className="action-description">View platform statistics</div>
                  </button>
                </>
              ) : (
                <>
                  <button className="action-card" onClick={() => router.push('/songs')}>
                    <PlayCircle size={32} />
                    <div className="action-title">Discover Music</div>
                    <div className="action-description">Find new songs</div>
                  </button>
                  <button className="action-card" onClick={() => alert('Coming soon!')}>
                    <Heart size={32} />
                    <div className="action-title">Your Library</div>
                    <div className="action-description">Saved songs & playlists</div>
                  </button>
                  <button className="action-card" onClick={() => alert('Coming soon!')}>
                    <User size={32} />
                    <div className="action-title">Follow Artists</div>
                    <div className="action-description">Connect with creators</div>
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Milestone Notice */}
          <section className="milestone-notice">
            <h3>🎉 Milestone 4 Complete: Song Upload & Cloud Storage</h3>
            <p>
              {isArtist
                ? isVerified
                  ? "Upload your songs and share your music with the world! Click 'Upload Song' above to get started."
                  : "Complete verification to start uploading your music!"
                : "Listen to music from verified artists across Cameroon!"}
            </p>
            <p>More features coming in the next milestones:</p>
            <ul>
              <li>M5: Audio Fingerprinting</li>
              <li>M6: Booking System</li>
              <li>M7: Wallet & Payments</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
