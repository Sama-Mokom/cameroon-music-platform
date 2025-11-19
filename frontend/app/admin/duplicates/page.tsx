'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, XCircle, Music, Play, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';
import { DuplicateMatchRecord } from '@/types/fingerprint';
import './duplicates.css';

export default function AdminDuplicatesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [duplicates, setDuplicates] = useState<DuplicateMatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<DuplicateMatchRecord | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchPendingDuplicates();
  }, [user, router]);

  const fetchPendingDuplicates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/duplicates');
      setDuplicates(response.data);
    } catch (err: any) {
      console.error('Error fetching duplicates:', err);
      setError('Failed to load duplicate matches');
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (
    matchId: string,
    status: string,
    resolution?: string
  ) => {
    try {
      setProcessing(true);
      await apiClient.post(`/admin/duplicates/${matchId}/update`, {
        status,
        resolution,
        notes: reviewNotes || undefined,
      });

      // Refresh list
      await fetchPendingDuplicates();
      setSelectedMatch(null);
      setReviewNotes('');
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 95) return '#FF4D4D'; // High - Red
    if (similarity >= 85) return '#FFDD00'; // Medium - Yellow
    return '#2FFF8D'; // Low - Green
  };

  if (loading) {
    return (
      <div className="duplicates-container">
        <div className="loading-state">
          <Loader2 size={48} className="spinner" />
          <p>Loading duplicate matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="duplicates-container">
        <div className="error-state">
          <AlertCircle size={48} />
          <p>{error}</p>
          <button onClick={fetchPendingDuplicates} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="duplicates-container">
      <div className="duplicates-header">
        <h1>🔍 Duplicate Song Review</h1>
        <p>Review and manage potential duplicate uploads</p>
        <div className="stats">
          <span className="stat-item">
            <strong>{duplicates.filter(d => d.status === 'PENDING').length}</strong> Pending
          </span>
          <span className="stat-item">
            <strong>{duplicates.length}</strong> Total Matches
          </span>
        </div>
      </div>

      {duplicates.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={64} />
          <h2>No Pending Duplicates</h2>
          <p>All potential duplicate matches have been reviewed!</p>
        </div>
      ) : (
        <div className="duplicates-list">
          {duplicates.map((match) => (
            <div
              key={match.id}
              className={`duplicate-card ${selectedMatch?.id === match.id ? 'selected' : ''}`}
              onClick={() => setSelectedMatch(match)}
            >
              <div className="match-header">
                <div className="similarity-badge" style={{ backgroundColor: getSimilarityColor(match.similarity) }}>
                  {match.similarity.toFixed(1)}% Match
                </div>
                <div className="status-badge status-{match.status.toLowerCase()}">
                  {match.status}
                </div>
              </div>

              <div className="songs-comparison">
                <div className="song-info">
                  <Music size={20} />
                  <div>
                    <h3>{match.originalSong.title}</h3>
                    <p>by {match.originalSong.artist.name}</p>
                    <span className="label">Original Upload</span>
                  </div>
                </div>

                <div className="divider">vs</div>

                <div className="song-info">
                  <Music size={20} />
                  <div>
                    <h3>{match.duplicateSong.title}</h3>
                    <p>by {match.duplicateSong.artist.name}</p>
                    <span className="label">New Upload</span>
                  </div>
                </div>
              </div>

              <div className="match-details">
                <span>
                  📊 <strong>{match.matchingLandmarks}</strong> matching landmarks
                </span>
                <span>
                  📅 Detected {new Date(match.createdAt).toLocaleDateString()}
                </span>
              </div>

              {selectedMatch?.id === match.id && (
                <div className="review-panel">
                  <h4>Review Actions</h4>

                  <div className="audio-players">
                    <div className="player-section">
                      <h5>Original Song</h5>
                      <audio controls src={match.originalSong.audioUrl} className="audio-player">
                        Your browser does not support audio playback.
                      </audio>
                    </div>

                    <div className="player-section">
                      <h5>New Upload</h5>
                      <audio controls src={match.duplicateSong.audioUrl} className="audio-player">
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  </div>

                  <div className="notes-section">
                    <label htmlFor="reviewNotes">Review Notes (Optional)</label>
                    <textarea
                      id="reviewNotes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add any notes about this decision..."
                      rows={3}
                      disabled={processing}
                    />
                  </div>

                  <div className="action-buttons">
                    <button
                      onClick={() => updateMatchStatus(match.id, 'CONFIRMED_DUPLICATE', 'Exact duplicate - same recording')}
                      className="btn btn-danger"
                      disabled={processing}
                    >
                      <XCircle size={18} />
                      Confirm Duplicate
                    </button>

                    <button
                      onClick={() => updateMatchStatus(match.id, 'REMIX', 'Different version (remix/cover/live)')}
                      className="btn btn-warning"
                      disabled={processing}
                    >
                      <Music size={18} />
                      Mark as Remix
                    </button>

                    <button
                      onClick={() => updateMatchStatus(match.id, 'FALSE_POSITIVE', 'Different songs - algorithm error')}
                      className="btn btn-success"
                      disabled={processing}
                    >
                      <CheckCircle size={18} />
                      False Positive
                    </button>
                  </div>

                  {processing && (
                    <div className="processing-overlay">
                      <Loader2 className="spinner" />
                      <span>Updating status...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
