'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
  Mic,
  MicOff
} from 'lucide-react';
import { useAudioPlayerStore } from '@/stores/audio-player-store';
import { useVoiceControl, VoiceCommand } from '@/hooks/useVoiceControl';
import { useAuthStore } from '@/stores/auth-store';
import { trackSongPlay } from '@/lib/api/statistics';
import { Waveform } from './Waveform';
import './audio-player.css';

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.7);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [playTracked, setPlayTracked] = useState(false); // Track if we've already counted this play
  const playTrackingRef = useRef<{ songId: string | null; tracked: boolean }>({ songId: null, tracked: false });

  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    seek,
    next,
    previous,
    togglePlay,
    toggleQueue,
    pause,
    play,
    addToQueue,
  } = useAudioPlayerStore();

  const { isAuthenticated } = useAuthStore();

  // Voice command handler
  const handleVoiceCommand = (command: VoiceCommand) => {
    setVoiceMessage(`Command: "${command}"`);

    switch (command) {
      case 'play':
        if (!isPlaying) {
          if (currentSong) {
            play();
          } else {
            setVoiceMessage('No song selected. Please select a song first.');
          }
        }
        break;

      case 'pause':
        if (isPlaying) {
          pause();
        }
        break;

      case 'stop':
        pause();
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          setCurrentTime(0);
        }
        break;

      case 'next':
        if (queue.length > 0) {
          next();
        } else {
          setVoiceMessage('Queue is empty. Add songs to queue first.');
        }
        break;

      case 'add to queue':
        if (currentSong) {
          addToQueue(currentSong);
          setVoiceMessage(`Added "${currentSong.title}" to queue`);
        } else {
          setVoiceMessage('No song playing. Cannot add to queue.');
        }
        break;
    }

    // Clear message after 3 seconds
    setTimeout(() => setVoiceMessage(null), 3000);
  };

  // Voice control hook
  const { isListening, isSupported, toggleListening } = useVoiceControl({
    onCommand: handleVoiceCommand,
    onError: (error) => {
      setVoiceMessage(error);
      setTimeout(() => setVoiceMessage(null), 4000);
    },
  });

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Playback error:', error);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, setIsPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle song changes
  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.load();

      // Reset play tracking for new song
      playTrackingRef.current = { songId: currentSong.id, tracked: false };

      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Playback error:', error);
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentSong, isPlaying, setIsPlaying]);

  // Handle seeking
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 1) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Update current time
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);

      // Track play after 30 seconds or 50% of duration (whichever comes first)
      const currentTime = audioRef.current.currentTime;
      const songDuration = audioRef.current.duration;

      if (
        isAuthenticated &&
        currentSong &&
        !playTrackingRef.current.tracked &&
        playTrackingRef.current.songId === currentSong.id &&
        songDuration > 0 &&
        (currentTime >= 30 || currentTime >= songDuration * 0.5)
      ) {
        // Track the play
        playTrackingRef.current.tracked = true;
        trackSongPlay(currentSong.id).catch((error) => {
          console.error('Failed to track play:', error);
        });
      }
    }
  };

  // Update duration
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle song end
  const handleEnded = () => {
    if (queue.length > 0) {
      next();
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Handle seek bar click
  const handleSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    seek(newTime);
  };

  // Handle volume toggle
  const handleVolumeToggle = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if no song
  if (!currentSong) {
    return null;
  }

  return (
    <div className="audio-player-container">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={(e) => {
          console.error('Audio error:', e);
          setIsPlaying(false);
        }}
      />

      {/* Voice Control Message */}
      {voiceMessage && (
        <div className="voice-message">
          {voiceMessage}
        </div>
      )}

      <div className="audio-player">
        {/* Song Info */}
        <div className="player-song-info">
          <div className="player-song-icon">
            <ListMusic size={24} />
          </div>
          <div className="player-song-details">
            <div className="player-song-title">{currentSong.title}</div>
            <div className="player-song-artist">{currentSong.artist?.name || 'Unknown Artist'}</div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="player-controls-section">
          <div className="player-controls">
            <button
              onClick={previous}
              className="player-btn"
              disabled={queue.length === 0}
              aria-label="Previous"
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={togglePlay}
              className="player-btn player-btn-play"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <button
              onClick={next}
              className="player-btn"
              disabled={queue.length === 0}
              aria-label="Next"
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* Waveform and Seek Bar */}
          <div className="player-progress-section">
            <span className="player-time">{formatTime(currentTime)}</span>

            <div className="player-seek-container">
              <Waveform
                currentTime={currentTime}
                duration={duration}
                onSeek={seek}
              />
              <div
                className="player-seek-bar"
                onClick={handleSeekBarClick}
              >
                <div
                  className="player-seek-progress"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>

            <span className="player-time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume, Voice Control, and Queue */}
        <div className="player-right-controls">
          {/* Voice Control Button */}
          {isSupported && (
            <button
              onClick={toggleListening}
              className={`player-btn player-voice-btn ${isListening ? 'listening' : ''}`}
              aria-label={isListening ? 'Stop listening' : 'Start voice control'}
              title="Voice commands: play, pause, stop, next, add to queue"
            >
              {isListening ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
          )}

          <div className="player-volume-control">
            <button
              onClick={handleVolumeToggle}
              className="player-btn"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="player-volume-slider"
              aria-label="Volume"
            />
          </div>

          <button
            onClick={toggleQueue}
            className="player-btn player-queue-btn"
            aria-label="Toggle Queue"
          >
            <ListMusic size={20} />
            {queue.length > 0 && (
              <span className="player-queue-count">{queue.length}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
