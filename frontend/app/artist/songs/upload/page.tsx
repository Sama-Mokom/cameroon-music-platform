'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Music, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadSong } from '@/lib/api/songs';
import { SongUploadProgress } from '@/types/song';
import { useAuthStore } from '@/stores/auth-store';
import './upload.css';

const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const GENRE_OPTIONS = [
  'Afrobeats',
  'Makossa',
  'Bikutsi',
  'Assiko',
  'Bend Skin',
  'Hip Hop',
  'R&B',
  'Gospel',
  'Jazz',
  'Reggae',
  'Other',
];

export default function SongUploadPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<SongUploadProgress>({
    fileName: '',
    progress: 0,
    status: 'idle',
  });
  const [error, setError] = useState('');
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);

  // Check if artist is verified
  useEffect(() => {
    const checkVerification = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      if (user.role !== 'ARTIST') {
        router.push('/dashboard');
        return;
      }

      // Fetch artist profile to check verification status
      try {
        const { tokens } = useAuthStore.getState();

        if (!tokens?.accessToken) {
          alert('Authentication required. Please login again.');
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/artists/me`, {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch artist profile');
        }

        const profile = await response.json();

        if (!profile.verified) {
          // Redirect to verification page if not verified
          alert('Your artist account must be verified before you can upload songs. Please complete the verification process.');
          router.push('/artist/verification');
          return;
        }

        setIsCheckingVerification(false);
      } catch (err) {
        console.error('Error checking verification:', err);
        setError('Failed to verify artist status. Please try again.');
        setIsCheckingVerification(false);
      }
    };

    checkVerification();
  }, [user, router]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setError('');

    // Validate file type
    if (!ACCEPTED_AUDIO_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload MP3, WAV, or FLAC files only.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 15MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
      return;
    }

    setAudioFile(file);
    setUploadProgress({
      fileName: file.name,
      progress: 0,
      status: 'idle',
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Please enter a song title');
      return;
    }

    if (!audioFile) {
      setError('Please select an audio file to upload');
      return;
    }

    try {
      setUploadProgress((prev) => ({ ...prev, status: 'uploading', progress: 0 }));

      const response = await uploadSong(
        {
          title: title.trim(),
          genre: genre || undefined,
          audioFile,
        },
        (progress) => {
          setUploadProgress((prev) => ({ ...prev, progress }));
        }
      );

      setUploadProgress((prev) => ({ ...prev, status: 'success', progress: 100 }));

      // Redirect to songs list after 2 seconds
      setTimeout(() => {
        router.push('/artist/songs');
      }, 2000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadProgress((prev) => ({ ...prev, status: 'error' }));
      setError(err.message || 'Failed to upload song. Please try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setGenre('');
    setAudioFile(null);
    setUploadProgress({
      fileName: '',
      progress: 0,
      status: 'idle',
    });
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isCheckingVerification) {
    return (
      <div className="upload-container">
        <div className="upload-card">
          <div className="checking-verification">
            <Loader2 size={48} className="spinner" />
            <p>Verifying artist status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <Music size={32} />
          <h1>Upload New Song</h1>
          <p>Share your music with the world</p>
        </div>

        <form onSubmit={handleUpload} className="upload-form">
          {/* Song Title */}
          <div className="form-group">
            <label htmlFor="title">
              Song Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter song title"
              maxLength={200}
              disabled={uploadProgress.status === 'uploading'}
              required
            />
          </div>

          {/* Genre */}
          <div className="form-group">
            <label htmlFor="genre">Genre (Optional)</label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              disabled={uploadProgress.status === 'uploading'}
            >
              <option value="">Select a genre</option>
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload Area */}
          <div className="form-group">
            <label>
              Audio File <span className="required">*</span>
            </label>
            <div
              className={`dropzone ${isDragging ? 'dragging' : ''} ${audioFile ? 'has-file' : ''}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.flac,audio/mpeg,audio/wav,audio/flac"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
                disabled={uploadProgress.status === 'uploading'}
              />

              {!audioFile ? (
                <>
                  <Upload size={48} />
                  <p className="dropzone-text">
                    <strong>Click to upload</strong> or drag and drop
                  </p>
                  <p className="dropzone-hint">MP3, WAV, or FLAC (max 15MB)</p>
                </>
              ) : (
                <>
                  <Music size={48} />
                  <p className="dropzone-text">
                    <strong>{audioFile.name}</strong>
                  </p>
                  <p className="dropzone-hint">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {uploadProgress.status === 'idle' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetForm();
                      }}
                      className="change-file-btn"
                    >
                      Change file
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress.status !== 'idle' && (
            <div className="progress-section">
              <div className="progress-header">
                {uploadProgress.status === 'uploading' && (
                  <>
                    <Loader2 size={20} className="spinner" />
                    <span>Uploading {uploadProgress.fileName}...</span>
                  </>
                )}
                {uploadProgress.status === 'success' && (
                  <>
                    <CheckCircle size={20} className="success-icon" />
                    <span>Upload successful!</span>
                  </>
                )}
                {uploadProgress.status === 'error' && (
                  <>
                    <AlertCircle size={20} className="error-icon" />
                    <span>Upload failed</span>
                  </>
                )}
              </div>

              {uploadProgress.status === 'uploading' && (
                <>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                  <p className="progress-text">{uploadProgress.progress}%</p>
                </>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => router.push('/artist/songs')}
              className="btn-secondary"
              disabled={uploadProgress.status === 'uploading'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploadProgress.status === 'uploading' || !title.trim() || !audioFile}
            >
              {uploadProgress.status === 'uploading' ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  Uploading...
                </>
              ) : (
                'Upload Song'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
