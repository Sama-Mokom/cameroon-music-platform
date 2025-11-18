'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { artistApi } from '@/lib/api/artist';
import { ArrowLeft, Upload, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { ArtistProfile } from '@/types/artist';

type IdType = 'national_id' | 'passport' | 'driver_license';

const ID_TYPE_OPTIONS = [
  { value: 'national_id' as IdType, label: 'National ID Card' },
  { value: 'passport' as IdType, label: 'Passport' },
  { value: 'driver_license' as IdType, label: "Driver's License" },
];

export default function VerificationUploadPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [idType, setIdType] = useState<IdType>('national_id');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user is an artist
    if (user?.role !== 'ARTIST') {
      router.push('/dashboard');
      return;
    }

    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await artistApi.getMyProfile();
      setProfile(data);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleIdFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file for ID document');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('ID document file size must be less than 10MB');
      return;
    }

    setIdFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setIdPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelfieFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file for selfie');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Selfie file size must be less than 10MB');
      return;
    }

    setSelfieFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelfiePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idFile || !selfieFile) {
      setError('Please upload both ID document and selfie');
      return;
    }

    try {
      setError(null);
      setUploading(true);

      await artistApi.uploadVerification(idFile, selfieFile, idType);

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to upload verification:', error);
      setError(error.response?.data?.message || 'Failed to upload verification documents');
    } finally {
      setUploading(false);
    }
  };

  const getVerificationStatusBadge = () => {
    if (!profile?.verification) {
      return (
        <div className="status-badge status-none">
          <AlertCircle size={16} />
          <span>Not Verified</span>
        </div>
      );
    }

    switch (profile.verification.status) {
      case 'PENDING':
        return (
          <div className="status-badge status-pending">
            <Loader2 size={16} className="spinner" />
            <span>Pending Review</span>
          </div>
        );
      case 'APPROVED':
        return (
          <div className="status-badge status-approved">
            <CheckCircle size={16} />
            <span>Verified</span>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="status-badge status-rejected">
            <XCircle size={16} />
            <span>Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading verification status...</p>

        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            color: #A0A0A0;
          }

          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #161616;
            border-top-color: #2FFF8D;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If already verified, show success message
  if (profile?.verification?.status === 'APPROVED') {
    return (
      <div className="verification-page">
        <div className="container">
          <div className="page-header">
            <Link href="/dashboard" className="back-link">
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="success-container">
            <CheckCircle size={64} className="success-icon" />
            <h1>You're Already Verified!</h1>
            <p>Your artist account has been verified by our team.</p>
            <Link href="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>

        <style jsx>{`
          .verification-page {
            min-height: 100vh;
            background: #0F0F0F;
            padding: 2rem 1rem;
          }

          .container {
            max-width: 900px;
            margin: 0 auto;
          }

          .page-header {
            margin-bottom: 3rem;
          }

          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #2FFF8D;
            text-decoration: none;
            font-weight: 500;
            transition: transform 200ms;
          }

          .back-link:hover {
            transform: translateX(-4px);
          }

          .success-container {
            text-align: center;
            padding: 4rem 2rem;
            background: #161616;
            border-radius: 12px;
          }

          .success-icon {
            color: #2FFF8D;
            margin-bottom: 2rem;
          }

          h1 {
            color: #FFFFFF;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1rem;
          }

          p {
            color: #A0A0A0;
            font-size: 1.125rem;
            margin-bottom: 2rem;
          }

          .btn-primary {
            display: inline-block;
            background: #2FFF8D;
            color: #0F0F0F;
            padding: 0.875rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: transform 200ms;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="verification-page">
      <div className="container">
        <div className="page-header">
          <Link href="/dashboard" className="back-link">
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <h1>Artist Verification</h1>
          <p className="subtitle">Upload your ID and a selfie to verify your artist account</p>
          {getVerificationStatusBadge()}
        </div>

        {/* Show rejection reason if rejected */}
        {profile?.verification?.status === 'REJECTED' && profile.verification.rejectionReason && (
          <div className="rejection-banner">
            <XCircle size={20} />
            <div>
              <strong>Verification Rejected</strong>
              <p>{profile.verification.rejectionReason}</p>
              <p className="hint">Please re-upload your documents addressing the issues above.</p>
            </div>
          </div>
        )}

        {/* Show pending message */}
        {profile?.verification?.status === 'PENDING' && (
          <div className="pending-banner">
            <Loader2 size={20} className="spinner" />
            <div>
              <strong>Verification Pending</strong>
              <p>Your documents are being reviewed by our team. This usually takes 24-48 hours.</p>
              <p className="hint">You can re-upload if you made a mistake.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="success-banner">
            <CheckCircle size={20} />
            <p>Verification documents uploaded successfully! Redirecting to dashboard...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="verification-form">
          {/* ID Type Selection */}
          <div className="form-section">
            <h2>Select ID Type</h2>
            <div className="id-type-grid">
              {ID_TYPE_OPTIONS.map((option) => (
                <label key={option.value} className={`id-type-option ${idType === option.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="idType"
                    value={option.value}
                    checked={idType === option.value}
                    onChange={(e) => setIdType(e.target.value as IdType)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Document Uploads */}
          <div className="form-section">
            <h2>Upload Documents</h2>
            <div className="upload-grid">
              {/* ID Document */}
              <div className="upload-item">
                <label>ID Document</label>
                <div
                  className="upload-box"
                  onClick={() => !uploading && idInputRef.current?.click()}
                >
                  {idPreview ? (
                    <div className="preview">
                      <img src={idPreview} alt="ID Preview" />
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={32} />
                      <span>Click to upload</span>
                      <span className="hint">Max 10MB • JPG, PNG</span>
                    </div>
                  )}
                </div>
                <input
                  ref={idInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleIdFileSelect}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                <p className="help-text">Clear photo of your {ID_TYPE_OPTIONS.find(o => o.value === idType)?.label}</p>
              </div>

              {/* Selfie */}
              <div className="upload-item">
                <label>Selfie with ID</label>
                <div
                  className="upload-box"
                  onClick={() => !uploading && selfieInputRef.current?.click()}
                >
                  {selfiePreview ? (
                    <div className="preview">
                      <img src={selfiePreview} alt="Selfie Preview" />
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={32} />
                      <span>Click to upload</span>
                      <span className="hint">Max 10MB • JPG, PNG</span>
                    </div>
                  )}
                </div>
                <input
                  ref={selfieInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSelfieFileSelect}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
                <p className="help-text">Hold your ID next to your face</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions">
            <h3>Verification Guidelines</h3>
            <ul>
              <li>Ensure your ID document is clearly visible and not blurred</li>
              <li>All text and photos on the ID must be readable</li>
              <li>Your selfie should clearly show your face and the ID document</li>
              <li>Use good lighting and avoid shadows</li>
              <li>Do not edit or modify the photos</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || !idFile || !selfieFile}
            >
              {uploading ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  <span>Uploading...</span>
                </>
              ) : (
                'Submit for Verification'
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .verification-page {
          min-height: 100vh;
          background: #0F0F0F;
          padding: 2rem 1rem;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 3rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #2FFF8D;
          text-decoration: none;
          font-weight: 500;
          margin-bottom: 1.5rem;
          transition: transform 200ms;
        }

        .back-link:hover {
          transform: translateX(-4px);
        }

        h1 {
          color: #FFFFFF;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #A0A0A0;
          font-size: 1.125rem;
          margin-bottom: 1rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .status-none {
          background: rgba(255, 221, 51, 0.1);
          color: #FFDD33;
        }

        .status-pending {
          background: rgba(47, 255, 141, 0.1);
          color: #2FFF8D;
        }

        .status-approved {
          background: rgba(47, 255, 141, 0.1);
          color: #2FFF8D;
        }

        .status-rejected {
          background: rgba(255, 68, 68, 0.1);
          color: #FF4444;
        }

        .rejection-banner {
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid #FF4444;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          gap: 1rem;
          color: #FF4444;
        }

        .rejection-banner strong {
          display: block;
          margin-bottom: 0.5rem;
        }

        .rejection-banner p {
          margin: 0.25rem 0;
        }

        .rejection-banner .hint {
          color: #FF8888;
          font-size: 0.875rem;
        }

        .pending-banner {
          background: rgba(47, 255, 141, 0.1);
          border: 1px solid #2FFF8D;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          gap: 1rem;
          color: #2FFF8D;
        }

        .pending-banner strong {
          display: block;
          margin-bottom: 0.5rem;
        }

        .pending-banner p {
          margin: 0.25rem 0;
          color: #A0A0A0;
        }

        .pending-banner .hint {
          color: #666;
          font-size: 0.875rem;
        }

        .error-banner {
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid #FF4444;
          border-radius: 8px;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #FF4444;
        }

        .success-banner {
          background: rgba(47, 255, 141, 0.1);
          border: 1px solid #2FFF8D;
          border-radius: 8px;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #2FFF8D;
        }

        .verification-form {
          background: #161616;
          border-radius: 12px;
          padding: 2rem;
        }

        .form-section {
          margin-bottom: 3rem;
        }

        .form-section h2 {
          color: #2FFF8D;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .id-type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .id-type-option {
          position: relative;
          background: #0F0F0F;
          border: 2px solid #333;
          border-radius: 8px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 200ms;
          text-align: center;
        }

        .id-type-option:hover {
          border-color: #2FFF8D;
        }

        .id-type-option.selected {
          border-color: #2FFF8D;
          background: rgba(47, 255, 141, 0.05);
        }

        .id-type-option input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .id-type-option span {
          color: #FFFFFF;
          font-weight: 500;
        }

        .upload-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .upload-item label {
          display: block;
          color: #FFFFFF;
          font-weight: 500;
          margin-bottom: 0.75rem;
        }

        .upload-box {
          aspect-ratio: 4 / 3;
          background: #0F0F0F;
          border: 2px dashed #333;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 200ms;
        }

        .upload-box:hover {
          border-color: #2FFF8D;
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #A0A0A0;
          gap: 0.5rem;
        }

        .upload-placeholder span:first-of-type {
          color: #FFFFFF;
          font-weight: 500;
        }

        .upload-placeholder .hint {
          font-size: 0.875rem;
          color: #666;
        }

        .preview {
          width: 100%;
          height: 100%;
        }

        .preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .help-text {
          color: #A0A0A0;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .instructions {
          background: #0F0F0F;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .instructions h3 {
          color: #FFFFFF;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .instructions ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .instructions li {
          color: #A0A0A0;
          padding-left: 1.5rem;
          position: relative;
          margin-bottom: 0.5rem;
        }

        .instructions li:before {
          content: "•";
          color: #2FFF8D;
          position: absolute;
          left: 0.5rem;
          font-weight: bold;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-secondary {
          background: transparent;
          border: 2px solid #333;
          color: #FFFFFF;
          padding: 0.875rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms;
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: #2FFF8D;
          color: #2FFF8D;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #2FFF8D;
          border: none;
          color: #0F0F0F;
          padding: 0.875rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 200ms;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .verification-page {
            padding: 1rem 0.5rem;
          }

          h1 {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .verification-form {
            padding: 1.5rem;
          }

          .upload-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
