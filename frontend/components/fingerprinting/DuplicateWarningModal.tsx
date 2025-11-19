'use client';

import { X, AlertTriangle, Music, TrendingUp } from 'lucide-react';
import { DuplicateMatch } from '@/types/fingerprint';
import './DuplicateWarningModal.css';

interface DuplicateWarningModalProps {
  duplicates: DuplicateMatch[];
  uploadedSongTitle: string;
  onClose: () => void;
  onProceed: () => void;
}

export default function DuplicateWarningModal({
  duplicates,
  uploadedSongTitle,
  onClose,
  onProceed,
}: DuplicateWarningModalProps) {
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 95) return '#FF4D4D'; // High - Red
    if (similarity >= 85) return '#FFDD00'; // Medium - Yellow
    return '#2FFF8D'; // Low - Green
  };

  const getSimilarityLevel = (similarity: number) => {
    if (similarity >= 95) return 'Very High';
    if (similarity >= 85) return 'High';
    return 'Medium';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="warning-icon">
            <AlertTriangle size={48} />
          </div>
          <h2>Potential Duplicate Detected</h2>
          <p>
            We found <strong>{duplicates.length}</strong> similar song{duplicates.length > 1 ? 's' : ''} already in our database
          </p>
        </div>

        <div className="uploaded-song-info">
          <Music size={20} />
          <div>
            <h3>Your Upload:</h3>
            <p>{uploadedSongTitle}</p>
          </div>
        </div>

        <div className="duplicates-list">
          <h4>Similar Songs Found:</h4>
          {duplicates.map((match, index) => (
            <div key={index} className="duplicate-item">
              <div className="duplicate-info">
                <Music size={18} />
                <div>
                  <strong>{match.title}</strong>
                  <span className="artist">by {match.artistName}</span>
                </div>
              </div>
              <div
                className="similarity-badge"
                style={{ backgroundColor: getSimilarityColor(match.similarity) }}
              >
                <TrendingUp size={16} />
                {match.similarity.toFixed(1)}%
                <span className="similarity-level">{getSimilarityLevel(match.similarity)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="warning-message">
          <p>
            <strong>What does this mean?</strong>
          </p>
          <p>
            Our audio fingerprinting system detected similarities between your upload and existing songs.
            This could mean:
          </p>
          <ul>
            <li>You&apos;re re-uploading a song that already exists</li>
            <li>Another artist uploaded a similar sounding song</li>
            <li>It&apos;s a cover, remix, or different version</li>
          </ul>
          <p>
            An admin will review this match to verify. Your song has been uploaded successfully and is already available.
          </p>
        </div>

        <div className="modal-actions">
          <button onClick={onProceed} className="btn btn-primary">
            Got It - Continue
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            View My Songs
          </button>
        </div>
      </div>
    </div>
  );
}
