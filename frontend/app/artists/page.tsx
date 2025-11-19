'use client';

import { useState, useEffect } from 'react';
import { Users, Loader2, AlertCircle, UserPlus, UserMinus, Music, ShieldCheck } from 'lucide-react';
import { artistApi } from '@/lib/api/artist';
import { followArtist, unfollowArtist, isFollowingArtist } from '@/lib/api/statistics';
import { ArtistProfile } from '@/types/artist';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/stores/auth-store';
import './artists.css';

interface ArtistWithFollowStatus extends ArtistProfile {
  isFollowing: boolean;
  isProcessing: boolean;
}

function ArtistsContent() {
  const { user } = useAuthStore();
  const [artists, setArtists] = useState<ArtistWithFollowStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      setLoading(true);
      setError('');

      const artistsData = await artistApi.getAllProfiles();

      // Filter out verified artists only and exclude current user if they're an artist
      const verifiedArtists = artistsData.filter(
        (artist) =>
          artist.verification?.status === 'VERIFIED' &&
          artist.userId !== user?.id
      );

      // Check follow status for each artist
      const artistsWithStatus = await Promise.all(
        verifiedArtists.map(async (artist) => {
          try {
            const isFollowing = await isFollowingArtist(artist.userId);
            return {
              ...artist,
              isFollowing,
              isProcessing: false,
            };
          } catch (error) {
            console.error(`Error checking follow status for artist ${artist.userId}:`, error);
            return {
              ...artist,
              isFollowing: false,
              isProcessing: false,
            };
          }
        })
      );

      setArtists(artistsWithStatus);
    } catch (err: any) {
      console.error('Error loading artists:', err);
      setError(err.message || 'Failed to load artists');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (artistUserId: string) => {
    const artist = artists.find((a) => a.userId === artistUserId);
    if (!artist) return;

    // Update UI optimistically
    setArtists((prev) =>
      prev.map((a) =>
        a.userId === artistUserId ? { ...a, isProcessing: true } : a
      )
    );

    try {
      if (artist.isFollowing) {
        await unfollowArtist(artistUserId);
      } else {
        await followArtist(artistUserId);
      }

      // Update follow status
      setArtists((prev) =>
        prev.map((a) =>
          a.userId === artistUserId
            ? { ...a, isFollowing: !a.isFollowing, isProcessing: false }
            : a
        )
      );
    } catch (err: any) {
      console.error('Error toggling follow:', err);
      alert(err.message || 'Failed to update follow status');

      // Revert optimistic update
      setArtists((prev) =>
        prev.map((a) =>
          a.userId === artistUserId ? { ...a, isProcessing: false } : a
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="artists-page">
        <div className="artists-loading">
          <Loader2 size={48} className="spinner" />
          <p>Loading artists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="artists-page">
      <div className="artists-header">
        <div className="artists-header-content">
          <Users size={48} />
          <div>
            <h1>Follow Artists</h1>
            <p>{artists.length} verified {artists.length === 1 ? 'artist' : 'artists'} from Cameroon</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="artists-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={loadArtists} className="artists-retry-btn">
            Try Again
          </button>
        </div>
      )}

      {!error && artists.length === 0 ? (
        <div className="artists-empty">
          <Users size={80} />
          <h2>No verified artists yet</h2>
          <p>Check back soon to discover amazing artists from Cameroon</p>
        </div>
      ) : (
        <div className="artists-grid">
          {artists.map((artist) => (
            <div key={artist.id} className="artist-card">
              <div className="artist-card-header">
                {artist.coverUrl ? (
                  <img src={artist.coverUrl} alt={`${artist.stageName || artist.user.name} cover`} className="artist-cover" />
                ) : (
                  <div className="artist-cover-placeholder">
                    <Music size={32} />
                  </div>
                )}
              </div>

              <div className="artist-card-body">
                <div className="artist-avatar-container">
                  {artist.avatarUrl ? (
                    <img src={artist.avatarUrl} alt={artist.stageName || artist.user.name} className="artist-avatar" />
                  ) : (
                    <div className="artist-avatar-placeholder">
                      <Users size={32} />
                    </div>
                  )}
                  {artist.verification?.status === 'VERIFIED' && (
                    <div className="artist-verified-badge" title="Verified Artist">
                      <ShieldCheck size={16} />
                    </div>
                  )}
                </div>

                <h3 className="artist-name">{artist.stageName || artist.user.name}</h3>

                {artist.bio && (
                  <p className="artist-bio">{artist.bio}</p>
                )}

                <div className="artist-meta">
                  {artist.genre && (
                    <span className="artist-genre">{artist.genre}</span>
                  )}
                  {artist.location && (
                    <span className="artist-location">{artist.location}</span>
                  )}
                </div>

                <button
                  onClick={() => handleFollowToggle(artist.userId)}
                  disabled={artist.isProcessing}
                  className={`follow-btn ${artist.isFollowing ? 'following' : ''}`}
                >
                  {artist.isProcessing ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      <span>Processing...</span>
                    </>
                  ) : artist.isFollowing ? (
                    <>
                      <UserMinus size={18} />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ArtistsPage() {
  return (
    <ProtectedRoute>
      <ArtistsContent />
    </ProtectedRoute>
  );
}
