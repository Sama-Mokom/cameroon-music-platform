'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { artistApi } from '@/lib/api/artist';
import type { ArtistProfile } from '@/types/artist';
import { Music, MapPin, Calendar, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ArtistProfilePage() {
  const params = useParams();
  const artistId = params.id as string;

  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [artistId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await artistApi.getProfileById(artistId);
      setProfile(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      setError(error.response?.data?.message || 'Failed to load artist profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading artist profile...</p>

        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            color: #A0A0A0;
          }

          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #161616;
            border-top-color: #2FFF8D;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h1>Artist Not Found</h1>
          <p>{error || 'The artist profile you are looking for does not exist.'}</p>
          <Link href="/dashboard">
            <button className="back-button">Back to Dashboard</button>
          </Link>
        </div>

        <style jsx>{`
          .error-container {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
            background: #0F0F0F;
          }

          .error-card {
            background: #161616;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 3rem 2rem;
            max-width: 500px;
            text-align: center;
          }

          .error-card h1 {
            color: #FF4444;
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }

          .error-card p {
            color: #A0A0A0;
            margin-bottom: 2rem;
          }

          .back-button {
            background: #2FFF8D;
            color: #0F0F0F;
            border: none;
            border-radius: 8px;
            padding: 0.875rem 2rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 200ms;
          }

          .back-button:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  const displayName = profile.stageName || profile.user?.name || 'Unknown Artist';

  return (
    <div className="artist-profile-page">
      {/* Cover Image */}
      <div className="cover-section">
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="Cover" className="cover-image" />
        ) : (
          <div className="cover-placeholder">
            <Music size={64} />
          </div>
        )}
      </div>

      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="avatar-section">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={displayName} className="avatar" />
            ) : (
              <div className="avatar-placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="header-info">
            <div className="name-section">
              <h1>{displayName}</h1>
              {profile.verified && (
                <span className="verified-badge" title="Verified Artist">
                  <CheckCircle2 size={24} />
                </span>
              )}
            </div>

            {profile.user?.email && (
              <p className="email">{profile.user.email}</p>
            )}

            {profile.phoneNumber && (
              <p className="phone">{profile.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <div className="bio-section">
            <h2>About</h2>
            <p className="bio-text">{profile.bio}</p>
          </div>
        )}

        {/* Genres */}
        {profile.genres && profile.genres.length > 0 && (
          <div className="section">
            <h2>Genres</h2>
            <div className="tags-container">
              {profile.genres.map((genre) => (
                <span key={genre} className="tag genre-tag">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {profile.tags && profile.tags.length > 0 && (
          <div className="section">
            <h2>Tags</h2>
            <div className="tags-container">
              {profile.tags.map((tag) => (
                <span key={tag} className="tag tag-secondary">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Profile Stats */}
        <div className="stats-section">
          <div className="stat-card">
            <Calendar size={20} />
            <div className="stat-info">
              <span className="stat-label">Joined</span>
              <span className="stat-value">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="back-link-container">
          <Link href="/dashboard" className="back-link">
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .artist-profile-page {
          min-height: 100vh;
          background: #0F0F0F;
          padding-bottom: 4rem;
        }

        .cover-section {
          width: 100%;
          height: 300px;
          background: #161616;
          position: relative;
          overflow: hidden;
        }

        .cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cover-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .profile-header {
          display: flex;
          align-items: flex-end;
          gap: 2rem;
          margin-top: -80px;
          margin-bottom: 3rem;
          position: relative;
          z-index: 10;
        }

        .avatar-section {
          flex-shrink: 0;
        }

        .avatar {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 4px solid #0F0F0F;
          object-fit: cover;
          background: #161616;
        }

        .avatar-placeholder {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 4px solid #0F0F0F;
          background: linear-gradient(135deg, #2FFF8D 0%, #1acc6d 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          font-weight: 700;
          color: #0F0F0F;
        }

        .header-info {
          flex: 1;
          padding-bottom: 1rem;
        }

        .name-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        h1 {
          color: #FFFFFF;
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
        }

        .verified-badge {
          color: #2FFF8D;
          display: flex;
          align-items: center;
        }

        .email,
        .phone {
          color: #A0A0A0;
          font-size: 1rem;
          margin: 0.25rem 0;
        }

        .bio-section {
          background: #161616;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .bio-section h2 {
          color: #2FFF8D;
          font-size: 1.25rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .bio-text {
          color: #FFFFFF;
          line-height: 1.7;
          font-size: 1.125rem;
          white-space: pre-wrap;
        }

        .section {
          background: #161616;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .section h2 {
          color: #2FFF8D;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .tag {
          padding: 0.625rem 1.25rem;
          border-radius: 20px;
          font-size: 0.9375rem;
          font-weight: 500;
          display: inline-block;
        }

        .genre-tag {
          background: #2FFF8D;
          color: #0F0F0F;
        }

        .tag-secondary {
          background: rgba(47, 255, 141, 0.15);
          color: #2FFF8D;
          border: 1px solid rgba(47, 255, 141, 0.3);
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: #161616;
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #2FFF8D;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          color: #A0A0A0;
          font-size: 0.875rem;
        }

        .stat-value {
          color: #FFFFFF;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .back-link-container {
          margin-top: 3rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #2FFF8D;
          text-decoration: none;
          font-weight: 500;
          transition: transform 200ms;
        }

        .back-link:hover {
          transform: translateX(-4px);
        }

        @media (max-width: 768px) {
          .cover-section {
            height: 200px;
          }

          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-top: -60px;
          }

          .avatar,
          .avatar-placeholder {
            width: 120px;
            height: 120px;
          }

          .avatar-placeholder {
            font-size: 3rem;
          }

          h1 {
            font-size: 2rem;
          }

          .name-section {
            justify-content: center;
          }

          .bio-section,
          .section {
            padding: 1.5rem;
          }

          .bio-text {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
