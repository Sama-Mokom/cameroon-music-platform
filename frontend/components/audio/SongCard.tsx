'use client';

import { Play, Plus, Music } from 'lucide-react';
import { Song } from '@/types/song';
import { useAudioPlayerStore } from '@/stores/audio-player-store';
import { formatDuration } from '@/lib/api/songs';
import './song-card.css';

interface SongCardProps {
  song: Song;
}

export function SongCard({ song }: SongCardProps) {
  const { currentSong, isPlaying, play, addToQueue } = useAudioPlayerStore();

  const isCurrentSong = currentSong?.id === song.id;

  const handlePlay = () => {
    if (isCurrentSong && isPlaying) {
      // If this song is currently playing, don't restart it
      return;
    }
    play(song);
    // Also add to queue if not already there
    addToQueue(song);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
  };

  return (
    <div
      className={`song-card ${isCurrentSong && isPlaying ? 'song-card-playing' : ''}`}
      onClick={handlePlay}
    >
      <div className="song-card-image">
        <div className="song-card-placeholder">
          <Music size={32} />
        </div>

        {/* Play button overlay on hover */}
        <div className="song-card-overlay">
          <button
            className="song-card-play-btn"
            aria-label="Play song"
          >
            <Play size={24} fill="currentColor" />
          </button>
        </div>

        {/* Playing indicator */}
        {isCurrentSong && isPlaying && (
          <div className="song-card-playing-indicator">
            <span className="playing-bar"></span>
            <span className="playing-bar"></span>
            <span className="playing-bar"></span>
          </div>
        )}
      </div>

      <div className="song-card-content">
        <h3 className="song-card-title">{song.title}</h3>
        <p className="song-card-artist">{song.artist?.name || 'Unknown Artist'}</p>

        <div className="song-card-meta">
          {song.genre && (
            <span className="song-card-genre">{song.genre}</span>
          )}
          <span className="song-card-duration">{formatDuration(song.duration)}</span>
        </div>
      </div>

      <button
        className="song-card-add-btn"
        onClick={handleAddToQueue}
        aria-label="Add to queue"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
