'use client';

import { useState, useEffect } from 'react';
import { Music, Loader2, AlertCircle } from 'lucide-react';
import { getAllSongs } from '@/lib/api/songs';
import { Song } from '@/types/song';
import { SongCard } from '@/components/audio/SongCard';
import './songs.css';

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllSongs(100, 0); // Get first 100 songs
      setSongs(data.songs);
      setTotal(data.total);
    } catch (err: any) {
      console.error('Error fetching songs:', err);
      setError(err.message || 'Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="songs-page">
        <div className="songs-loading">
          <Loader2 size={48} className="spinner" />
          <p>Loading songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="songs-page">
      <div className="songs-header">
        <div className="songs-header-content">
          <Music size={48} />
          <div>
            <h1>Discover Music</h1>
            <p>{total} {total === 1 ? 'song' : 'songs'} from verified artists</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="songs-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchSongs} className="songs-retry-btn">
            Try Again
          </button>
        </div>
      )}

      {!error && songs.length === 0 ? (
        <div className="songs-empty">
          <Music size={80} />
          <h2>No songs available yet</h2>
          <p>Check back soon for new music from verified artists</p>
        </div>
      ) : (
        <div className="songs-grid">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}
