'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Music, User, LogOut, Settings, TrendingUp, Heart, PlayCircle } from 'lucide-react'
import './dashboard.css'

function DashboardContent() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const { tokens } = useAuthStore.getState()
      console.log(tokens, "token dont exist")
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

  return (
    <div className="dashboard-container">
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
      <main className="dashboard-main">
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
                <div className="badge-role">{isArtist ? 'Artist' : 'Listener'}</div>
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
                  <button className="action-card" onClick={() => alert('Coming in Milestone 4!')}>
                    <Music size={32} />
                    <div className="action-title">Upload Song</div>
                    <div className="action-description">Share your latest track</div>
                  </button>
                  <button className="action-card" onClick={() => alert('Coming soon!')}>
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
              ) : (
                <>
                  <button className="action-card" onClick={() => alert('Coming soon!')}>
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
            <h3>🎉 Milestone 2 Complete: Authentication System</h3>
            <p>
              You've successfully logged in! More features coming in the next milestones:
            </p>
            <ul>
              <li>M3: Artist Profiles</li>
              <li>M4: Song Upload & Storage</li>
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
