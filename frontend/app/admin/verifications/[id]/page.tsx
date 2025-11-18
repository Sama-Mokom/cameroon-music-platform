'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import type { VerificationDetailResponse } from '@/types/admin';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, User, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import AdminRoute from '@/components/auth/AdminRoute';

function VerificationDetailContent() {
  const router = useRouter();
  const params = useParams();
  const verificationId = params?.id as string;

  const [verification, setVerification] = useState<VerificationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (verificationId) {
      loadVerification();
    }
  }, [verificationId]);

  const loadVerification = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getVerificationById(verificationId);
      setVerification(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to load verification:', error);
      setError(error.response?.data?.message || 'Failed to load verification details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!verification) return;

    if (!confirm('Are you sure you want to approve this verification?')) return;

    try {
      setProcessing(true);
      setError(null);
      await adminApi.approveVerification(verification.id);

      // Redirect back to queue
      router.push('/admin/verifications');
    } catch (error: any) {
      console.error('Failed to approve verification:', error);
      setError(error.response?.data?.message || 'Failed to approve verification');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!verification || !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      await adminApi.rejectVerification(verification.id, { rejectionReason });

      // Redirect back to queue
      router.push('/admin/verifications');
    } catch (error: any) {
      console.error('Failed to reject verification:', error);
      setError(error.response?.data?.message || 'Failed to reject verification');
    } finally {
      setProcessing(false);
      setShowRejectModal(false);
    }
  };

  const getIdTypeLabel = (idType: string) => {
    const labels: Record<string, string> = {
      national_id: 'National ID',
      passport: 'Passport',
      driver_license: "Driver's License",
    };
    return labels[idType] || idType;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading verification details...</p>
        </div>

        <style jsx>{`
          .detail-page {
            min-height: 100vh;
            background: #0F0F0F;
            padding: 2rem;
          }

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

  if (!verification) {
    return (
      <div className="detail-page">
        <div className="error-container">
          <AlertCircle size={64} />
          <h2>Verification Not Found</h2>
          <Link href="/admin/verifications" className="back-btn">
            Back to Verifications
          </Link>
        </div>

        <style jsx>{`
          .detail-page {
            min-height: 100vh;
            background: #0F0F0F;
            padding: 2rem;
          }

          .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            color: #A0A0A0;
            text-align: center;
          }

          .error-container :global(svg) {
            color: #FF4444;
            margin-bottom: 1.5rem;
          }

          .error-container h2 {
            color: #FFFFFF;
            font-size: 1.5rem;
            margin-bottom: 2rem;
          }

          .back-btn {
            padding: 0.75rem 2rem;
            background: #2FFF8D;
            color: #0F0F0F;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <Link href="/admin/verifications" className="back-link">
            <ArrowLeft size={20} />
            <span>Back to Queue</span>
          </Link>
          <h1>Verification Review</h1>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Artist Info Card */}
        <div className="info-card">
          <div className="card-header">
            <h2>Artist Information</h2>
          </div>
          <div className="card-body">
            <div className="artist-info">
              <div className="avatar-large">
                {verification.artistProfile.avatarUrl ? (
                  <img
                    src={verification.artistProfile.avatarUrl}
                    alt={verification.artistProfile.stageName}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={48} />
                  </div>
                )}
              </div>
              <div>
                <h3>{verification.artistProfile.stageName}</h3>
                <p className="user-name">{verification.artistProfile.user.name}</p>
                <p className="user-email">{verification.artistProfile.user.email}</p>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <FileText size={20} />
                <div>
                  <span className="info-label">ID Type</span>
                  <span className="info-value">{getIdTypeLabel(verification.idType)}</span>
                </div>
              </div>
              <div className="info-item">
                <Calendar size={20} />
                <div>
                  <span className="info-label">Submitted</span>
                  <span className="info-value">{formatDate(verification.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="documents-section">
          <h2>Uploaded Documents</h2>
          <p className="section-subtitle">Review the uploaded ID document and selfie carefully</p>

          <div className="documents-grid">
            <div className="document-card">
              <div className="document-label">ID Document</div>
              <div className="document-image">
                <img src={verification.idFileUrl} alt="ID Document" />
              </div>
              <a
                href={verification.idFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="view-full"
              >
                View Full Size
              </a>
            </div>

            <div className="document-card">
              <div className="document-label">Selfie with ID</div>
              <div className="document-image">
                <img src={verification.selfieFileUrl} alt="Selfie with ID" />
              </div>
              <a
                href={verification.selfieFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="view-full"
              >
                View Full Size
              </a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="actions-section">
          <button
            onClick={() => setShowRejectModal(true)}
            className="btn-reject"
            disabled={processing}
          >
            <XCircle size={20} />
            <span>Reject Verification</span>
          </button>
          <button
            onClick={handleApprove}
            className="btn-approve"
            disabled={processing}
          >
            <CheckCircle size={20} />
            <span>{processing ? 'Processing...' : 'Approve Verification'}</span>
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => !processing && setShowRejectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Verification</h3>
            <p>Please provide a reason for rejecting this verification:</p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., ID document is not clear, selfie doesn't match ID, etc."
              rows={4}
              disabled={processing}
            />

            <div className="modal-actions">
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-cancel"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="btn-reject-confirm"
                disabled={processing || !rejectionReason.trim()}
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .detail-page {
          min-height: 100vh;
          background: #0F0F0F;
          color: #FFFFFF;
          padding: 2rem;
        }

        .container {
          max-width: 1200px;
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
          font-size: 2.5rem;
          font-weight: 700;
          color: #FFFFFF;
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

        .info-card {
          background: #161616;
          border-radius: 12px;
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .card-header {
          padding: 1.5rem;
          border-bottom: 1px solid #2A2A2A;
        }

        .card-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2FFF8D;
        }

        .card-body {
          padding: 2rem;
        }

        .artist-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #2A2A2A;
        }

        .avatar-large {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .avatar-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: #0F0F0F;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2FFF8D;
        }

        .artist-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 0.25rem;
        }

        .user-name {
          color: #A0A0A0;
          font-size: 1rem;
        }

        .user-email {
          color: #666;
          font-size: 0.875rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          color: #2FFF8D;
        }

        .info-item > div {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-label {
          color: #A0A0A0;
          font-size: 0.875rem;
        }

        .info-value {
          color: #FFFFFF;
          font-weight: 600;
        }

        .documents-section {
          margin-bottom: 3rem;
        }

        .documents-section h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          color: #A0A0A0;
          margin-bottom: 2rem;
        }

        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .document-card {
          background: #161616;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .document-label {
          font-weight: 600;
          color: #2FFF8D;
          margin-bottom: 1rem;
        }

        .document-image {
          aspect-ratio: 4 / 3;
          background: #0F0F0F;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .document-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .view-full {
          display: inline-block;
          color: #2FFF8D;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .view-full:hover {
          text-decoration: underline;
        }

        .actions-section {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 2rem;
          background: #161616;
          border-radius: 12px;
        }

        .btn-reject,
        .btn-approve {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms;
        }

        .btn-reject {
          background: transparent;
          border: 2px solid #FF4444;
          color: #FF4444;
        }

        .btn-reject:hover:not(:disabled) {
          background: rgba(255, 68, 68, 0.1);
        }

        .btn-approve {
          background: #2FFF8D;
          color: #0F0F0F;
        }

        .btn-approve:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(47, 255, 141, 0.3);
        }

        .btn-reject:disabled,
        .btn-approve:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 15, 15, 0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal {
          background: #161616;
          border: 2px solid #FF4444;
          border-radius: 16px;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
        }

        .modal h3 {
          font-size: 1.5rem;
          color: #FFFFFF;
          margin-bottom: 0.5rem;
        }

        .modal p {
          color: #A0A0A0;
          margin-bottom: 1.5rem;
        }

        .modal textarea {
          width: 100%;
          padding: 1rem;
          background: #0F0F0F;
          border: 1px solid #2A2A2A;
          border-radius: 8px;
          color: #FFFFFF;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
          margin-bottom: 1.5rem;
        }

        .modal textarea:focus {
          outline: none;
          border-color: #2FFF8D;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .btn-cancel,
        .btn-reject-confirm {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms;
        }

        .btn-cancel {
          background: transparent;
          border: 2px solid #2A2A2A;
          color: #A0A0A0;
        }

        .btn-cancel:hover:not(:disabled) {
          border-color: #2FFF8D;
          color: #FFFFFF;
        }

        .btn-reject-confirm {
          background: #FF4444;
          color: #FFFFFF;
        }

        .btn-reject-confirm:hover:not(:disabled) {
          background: #FF2222;
        }

        .btn-cancel:disabled,
        .btn-reject-confirm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .detail-page {
            padding: 1rem;
          }

          h1 {
            font-size: 2rem;
          }

          .documents-grid {
            grid-template-columns: 1fr;
          }

          .actions-section {
            flex-direction: column-reverse;
          }

          .btn-reject,
          .btn-approve {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default function VerificationDetailPage() {
  return (
    <AdminRoute>
      <VerificationDetailContent />
    </AdminRoute>
  );
}
