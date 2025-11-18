'use client';

import { X, Music, Play, Trash2 } from 'lucide-react';
import { useAudioPlayerStore } from '@/stores/audio-player-store';
import { formatDuration } from '@/lib/api/songs';
import './queue-panel.css';

export function QueuePanel() {
  const {
    queue,
    queueIndex,
    currentSong,
    isQueueOpen,
    setQueueOpen,
    playFromQueue,
    removeFromQueue,
    clearQueue,
  } = useAudioPlayerStore();

  if (!isQueueOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="queue-overlay"
        onClick={() => setQueueOpen(false)}
      />

      {/* Queue Panel */}
      <div className="queue-panel">
        <div className="queue-header">
          <h2>Queue</h2>
          <div className="queue-header-actions">
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="queue-clear-btn"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setQueueOpen(false)}
              className="queue-close-btn"
              aria-label="Close queue"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="queue-content">
          {queue.length === 0 ? (
            <div className="queue-empty">
              <Music size={64} />
              <p>No songs in queue</p>
              <span>Add songs to start listening</span>
            </div>
          ) : (
            <div className="queue-list">
              {queue.map((song, index) => {
                const isCurrentSong = currentSong?.id === song.id && index === queueIndex;

                return (
                  <div
                    key={`${song.id}-${index}`}
                    className={`queue-item ${isCurrentSong ? 'queue-item-active' : ''}`}
                  >
                    <div className="queue-item-content">
                      <button
                        onClick={() => playFromQueue(index)}
                        className="queue-item-play"
                        aria-label={isCurrentSong ? 'Playing' : 'Play'}
                      >
                        {isCurrentSong ? (
                          <div className="queue-item-playing">
                            <span className="playing-bar"></span>
                            <span className="playing-bar"></span>
                            <span className="playing-bar"></span>
                          </div>
                        ) : (
                          <Play size={16} />
                        )}
                      </button>

                      <div className="queue-item-info">
                        <div className="queue-item-title">{song.title}</div>
                        <div className="queue-item-artist">
                          {song.artist?.name || 'Unknown Artist'}
                        </div>
                      </div>

                      <div className="queue-item-meta">
                        {song.genre && (
                          <span className="queue-item-genre">{song.genre}</span>
                        )}
                        <span className="queue-item-duration">
                          {formatDuration(song.duration)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromQueue(index)}
                        className="queue-item-remove"
                        aria-label="Remove from queue"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
