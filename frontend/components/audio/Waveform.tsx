'use client';

import { useEffect, useRef } from 'react';

interface WaveformProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function Waveform({ currentTime, duration, onSeek }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Generate waveform bars
    const barCount = 100;
    const barWidth = rect.width / barCount;
    const barGap = 1;

    for (let i = 0; i < barCount; i++) {
      // Generate random height for visualization (in real app, use actual audio data)
      const height = (Math.random() * 0.5 + 0.3) * rect.height;
      const x = i * barWidth;
      const y = (rect.height - height) / 2;

      // Determine if this bar is in the played section
      const progress = duration > 0 ? currentTime / duration : 0;
      const isPlayed = i < barCount * progress;

      ctx.fillStyle = isPlayed ? '#1DB954' : '#333333';
      ctx.fillRect(x, y, barWidth - barGap, height);
    }
  }, [currentTime, duration]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !duration) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    onSeek(newTime);
  };

  return (
    <canvas
      ref={canvasRef}
      className="player-waveform"
      onClick={handleClick}
      style={{ width: '100%', height: '50px', cursor: 'pointer' }}
    />
  );
}
