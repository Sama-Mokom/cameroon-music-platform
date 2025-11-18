import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Song } from '@/types/song';

interface AudioPlayerState {
  // Current playback state
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;

  // Queue management
  queue: Song[];
  queueIndex: number;
  isQueueOpen: boolean;

  // Waveform data
  waveformData: number[];

  // Actions
  play: (song?: Song) => void;
  pause: () => void;
  togglePlay: () => void;
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  seek: (time: number) => void;

  // Queue actions
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playFromQueue: (index: number) => void;
  next: () => void;
  previous: () => void;
  toggleQueue: () => void;
  setQueueOpen: (isOpen: boolean) => void;

  // Waveform
  setWaveformData: (data: number[]) => void;
}

export const useAudioPlayerStore = create<AudioPlayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSong: null,
      isPlaying: false,
      volume: 0.7,
      currentTime: 0,
      duration: 0,
      queue: [],
      queueIndex: -1,
      isQueueOpen: false,
      waveformData: [],

      // Playback actions
      play: (song?: Song) => {
        if (song) {
          set({ currentSong: song, isPlaying: true, currentTime: 0 });
        } else {
          set({ isPlaying: true });
        }
      },

      pause: () => {
        set({ isPlaying: false });
      },

      togglePlay: () => {
        set((state) => ({ isPlaying: !state.isPlaying }));
      },

      setCurrentSong: (song: Song | null) => {
        set({ currentSong: song, currentTime: 0 });
      },

      setIsPlaying: (isPlaying: boolean) => {
        set({ isPlaying });
      },

      setVolume: (volume: number) => {
        set({ volume: Math.max(0, Math.min(1, volume)) });
      },

      setCurrentTime: (time: number) => {
        set({ currentTime: time });
      },

      setDuration: (duration: number) => {
        set({ duration });
      },

      seek: (time: number) => {
        set({ currentTime: time });
      },

      // Queue actions
      addToQueue: (song: Song) => {
        set((state) => {
          // Check if song is already in queue
          const exists = state.queue.some((s) => s.id === song.id);
          if (exists) return state;

          return { queue: [...state.queue, song] };
        });
      },

      removeFromQueue: (index: number) => {
        set((state) => {
          const newQueue = state.queue.filter((_, i) => i !== index);
          let newQueueIndex = state.queueIndex;

          if (index < state.queueIndex) {
            newQueueIndex = state.queueIndex - 1;
          } else if (index === state.queueIndex) {
            newQueueIndex = -1;
          }

          return { queue: newQueue, queueIndex: newQueueIndex };
        });
      },

      clearQueue: () => {
        set({ queue: [], queueIndex: -1 });
      },

      playFromQueue: (index: number) => {
        const state = get();
        const song = state.queue[index];
        if (song) {
          set({ currentSong: song, isPlaying: true, queueIndex: index, currentTime: 0 });
        }
      },

      next: () => {
        const state = get();
        if (state.queue.length === 0) return;

        const nextIndex = state.queueIndex + 1;
        if (nextIndex < state.queue.length) {
          const nextSong = state.queue[nextIndex];
          set({ currentSong: nextSong, queueIndex: nextIndex, currentTime: 0, isPlaying: true });
        } else {
          // Loop to start
          const firstSong = state.queue[0];
          set({ currentSong: firstSong, queueIndex: 0, currentTime: 0, isPlaying: true });
        }
      },

      previous: () => {
        const state = get();
        if (state.queue.length === 0) return;

        // If more than 3 seconds into song, restart it
        if (state.currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }

        const prevIndex = state.queueIndex - 1;
        if (prevIndex >= 0) {
          const prevSong = state.queue[prevIndex];
          set({ currentSong: prevSong, queueIndex: prevIndex, currentTime: 0, isPlaying: true });
        } else {
          // Loop to end
          const lastIndex = state.queue.length - 1;
          const lastSong = state.queue[lastIndex];
          set({ currentSong: lastSong, queueIndex: lastIndex, currentTime: 0, isPlaying: true });
        }
      },

      toggleQueue: () => {
        set((state) => ({ isQueueOpen: !state.isQueueOpen }));
      },

      setQueueOpen: (isOpen: boolean) => {
        set({ isQueueOpen: isOpen });
      },

      // Waveform
      setWaveformData: (data: number[]) => {
        set({ waveformData: data });
      },
    }),
    {
      name: 'audio-player-storage',
      partialize: (state) => ({
        volume: state.volume,
        queue: state.queue,
        queueIndex: state.queueIndex,
        currentSong: state.currentSong,
      }),
    }
  )
);
