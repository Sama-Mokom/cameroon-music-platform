'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import ArtistProfileForm from '@/components/artist/ArtistProfileForm';
import ImageUpload from '@/components/upload/ImageUpload';
import { artistApi } from '@/lib/api/artist';
import type { ArtistProfile } from '@/types/artist';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditArtistProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is an artist
    if (user?.role !== 'ARTIST') {
      router.push('/dashboard');
      return;
    }

    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await artistApi.getMyProfile();
      setProfile(data);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      await artistApi.updateProfile(data);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      throw error;
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const response = await artistApi.uploadAvatar(file);
      // Reload profile to get updated avatar URL
      await loadProfile();
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload avatar');
    }
  };

  const handleCoverUpload = async (file: File) => {
    try {
      const response = await artistApi.uploadCover(file);
      // Reload profile to get updated cover URL
      await loadProfile();
    } catch (error: any) {
      console.error('Failed to upload cover:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload cover');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>

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

  return (
    <div className="edit-profile-page">
      <div className="container">
        <div className="page-header">
          <Link href="/dashboard" className="back-link">
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <h1>Edit Artist Profile</h1>
          <p className="subtitle">Update your profile information and showcase your music</p>
        </div>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {/* Image Uploads Section */}
        <div className="images-section">
          <h2>Profile Images</h2>
          <div className="images-grid">
            <ImageUpload
              label="Cover Image"
              currentImage={profile?.coverUrl}
              onUpload={handleCoverUpload}
              aspectRatio="4:1"
              maxSizeMB={10}
              recommended="1600x400px recommended"
            />
            <ImageUpload
              label="Avatar"
              currentImage={profile?.avatarUrl}
              onUpload={handleAvatarUpload}
              aspectRatio="1:1"
              maxSizeMB={5}
              recommended="200x200px recommended"
            />
          </div>
        </div>

        <ArtistProfileForm
          initialData={profile || undefined}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard')}
        />
      </div>

      <style jsx>{`
        .edit-profile-page {
          min-height: 100vh;
          background: #0F0F0F;
          padding: 2rem 1rem;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 3rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #2FFF8D;
          text-decoration: none;
          font-weight: 500;
          margin-bottom: 1.5rem;
          transition: transform 200ms;
        }

        .back-link:hover {
          transform: translateX(-4px);
        }

        h1 {
          color: #FFFFFF;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #A0A0A0;
          font-size: 1.125rem;
        }

        .error-banner {
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid #FF4444;
          border-radius: 8px;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          color: #FF4444;
        }

        .images-section {
          background: #161616;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .images-section h2 {
          color: #2FFF8D;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }

        .images-grid {
          display: grid;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .edit-profile-page {
            padding: 1rem 0.5rem;
          }

          h1 {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
