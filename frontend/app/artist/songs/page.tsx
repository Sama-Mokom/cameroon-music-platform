'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, Upload, Clock, HardDrive, Loader2, AlertCircle } from 'lucide-react';
import { getMySongs, formatFileSize, formatDuration } from '@/lib/api/songs';
import { Song } from '@/types/song';
import { useAuthStore } from '@/stores/auth-store';
import './songs.css';

export default function MySongsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'ARTIST') {
      router.push('/dashboard');
      return;
    }

    fetchSongs();
  }, [user, router]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMySongs();
      setSongs(data);
    } catch (err: any) {
      console.error('Error fetching songs:', err);
      setError(err.message || 'Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="songs-container">
        <div className="loading-state">
          <Loader2 size={48} className="spinner" />
          <p>Loading your songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="songs-container">
      <div className="songs-header">
        <div className="header-content">
          <Music size={32} />
          <div>
            <h1>My Songs</h1>
            <p>{songs.length} {songs.length === 1 ? 'song' : 'songs'} uploaded</p>
          </div>
        </div>
        <button className="upload-btn" onClick={() => router.push('/artist/songs/upload')}>
          <Upload size={20} />
          Upload New Song
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {songs.length === 0 ? (
        <div className="empty-state">
          <Music size={64} />
          <h2>No songs yet</h2>
          <p>Upload your first song to get started</p>
          <button className="upload-btn-large" onClick={() => router.push('/artist/songs/upload')}>
            <Upload size={20} />
            Upload Your First Song
          </button>
        </div>
      ) : (
        <div className="songs-grid">
          {songs.map((song) => (
            <div key={song.id} className="song-card">
              <div className="song-header">
                <div className="song-icon">
                  <Music size={24} />
                </div>
                <div className="song-info">
                  <h3 className="song-title">{song.title}</h3>
                  {song.genre && <span className="song-genre">{song.genre}</span>}
                </div>
              </div>

              <div className="song-details">
                <div className="detail-item">
                  <Clock size={16} />
                  <span>{formatDuration(song.duration)}</span>
                </div>
                <div className="detail-item">
                  <HardDrive size={16} />
                  <span>{formatFileSize(song.size)}</span>
                </div>
                {song.format && (
                  <div className="detail-item">
                    <span className="format-badge">{song.format.toUpperCase()}</span>
                  </div>
                )}
              </div>

              <div className="song-meta">
                <span className="upload-date">Uploaded {formatDate(song.createdAt)}</span>
              </div>

              {/* Inline Audio Player */}
              <div className="audio-player">
                <audio
                  controls
                  preload="metadata"
                  className="audio-controls"
                  src={song.audioUrl}
                  onError={(e) => {
                    console.error('Audio error for song:', song.title, {
                      url: song.audioUrl,
                      error: e.currentTarget.error,
                      errorCode: e.currentTarget.error?.code,
                      errorMessage: e.currentTarget.error?.message,
                    });
                  }}
                  onLoadedMetadata={(e) => {
                    console.log('Audio loaded successfully:', song.title, {
                      duration: e.currentTarget.duration,
                      url: song.audioUrl,
                    });
                  }}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
