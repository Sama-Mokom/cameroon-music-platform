'use client';

import { AudioPlayer } from './AudioPlayer';
import { QueuePanel } from './QueuePanel';

export function AudioPlayerLayout() {
  return (
    <>
      <AudioPlayer />
      <QueuePanel />
    </>
  );
}
