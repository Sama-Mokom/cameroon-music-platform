'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  currentImage?: string | null;
  onUpload: (file: File) => Promise<void>;
  aspectRatio?: string; // e.g., "1:1" for avatar, "4:1" for cover
  maxSizeMB?: number;
  recommended?: string; // e.g., "200x200px recommended"
}

export default function ImageUpload({
  label,
  currentImage,
  onUpload,
  aspectRatio = '1:1',
  maxSizeMB = 5,
  recommended,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      setUploading(true);
      await onUpload(file);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="image-upload">
      <div className="upload-header">
        <label>{label}</label>
        {recommended && <span className="recommended">{recommended}</span>}
      </div>

      <div
        className="upload-container"
        style={{ aspectRatio }}
        onClick={preview ? undefined : handleClick}
      >
        {preview ? (
          <div className="preview">
            <img src={preview} alt="Preview" />
            {!uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="remove-btn"
              >
                <X size={20} />
              </button>
            )}
            {uploading && (
              <div className="uploading-overlay">
                <Loader2 size={32} className="spinner" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="upload-placeholder">
            <Upload size={32} />
            <span className="upload-text">Click to upload</span>
            <span className="hint">Max {maxSizeMB}MB • JPG, PNG, WebP</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={uploading}
      />

      {error && <div className="error">{error}</div>}

      <style jsx>{`
        .image-upload {
          margin-bottom: 2rem;
        }

        .upload-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        label {
          color: #FFFFFF;
          font-weight: 500;
          font-size: 1rem;
        }

        .recommended {
          color: #A0A0A0;
          font-size: 0.875rem;
        }

        .upload-container {
          position: relative;
          background: #161616;
          border: 2px dashed #333;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 200ms;
        }

        .upload-container:hover {
          border-color: #2FFF8D;
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 2rem;
          color: #A0A0A0;
          gap: 0.5rem;
        }

        .upload-text {
          font-size: 1rem;
          color: #FFFFFF;
          font-weight: 500;
        }

        .hint {
          font-size: 0.875rem;
          color: #666;
        }

        .preview {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: background 200ms;
          z-index: 10;
        }

        .remove-btn:hover {
          background: rgba(255, 68, 68, 0.9);
        }

        .uploading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 15, 15, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #2FFF8D;
          font-weight: 500;
        }

        .uploading-overlay .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error {
          color: #FF4444;
          margin-top: 0.5rem;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .upload-placeholder {
            padding: 1.5rem;
          }

          .upload-text {
            font-size: 0.9375rem;
          }
        }
      `}</style>
    </div>
  );
}
