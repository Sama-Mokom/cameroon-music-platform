'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import type { VerificationItem } from '@/types/admin';
import { ShieldCheck, Clock, User, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import AdminRoute from '@/components/auth/AdminRoute';

function AdminVerificationsContent() {
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPendingVerifications();
      setVerifications(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to load verifications:', error);
      setError(error.response?.data?.message || 'Failed to load verifications');
    } finally {
      setLoading(false);
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading verifications...</p>
        </div>

        <style jsx>{`
          .admin-page {
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

  return (
    <div className="admin-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-top">
            <div>
              <h1>Verification Management</h1>
              <p className="subtitle">Review and approve artist verification requests</p>
            </div>
            <Link href="/dashboard" className="back-link">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <Clock size={24} />
            <div>
              <div className="stat-value">{verifications.length}</div>
              <div className="stat-label">Pending Reviews</div>
            </div>
          </div>
        </div>

        {/* Verifications List */}
        {verifications.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={64} />
            <h3>No Pending Verifications</h3>
            <p>All verification requests have been processed!</p>
          </div>
        ) : (
          <div className="verifications-list">
            <div className="list-header">
              <h2>Pending Verifications ({verifications.length})</h2>
            </div>

            <div className="verification-cards">
              {verifications.map((verification) => (
                <Link
                  key={verification.id}
                  href={`/admin/verifications/${verification.id}`}
                  className="verification-card"
                >
                  <div className="card-avatar">
                    {verification.artistProfile.avatarUrl ? (
                      <img
                        src={verification.artistProfile.avatarUrl}
                        alt={verification.artistProfile.stageName}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        <User size={32} />
                      </div>
                    )}
                  </div>

                  <div className="card-content">
                    <div className="card-main">
                      <div>
                        <h3>{verification.artistProfile.stageName}</h3>
                        <p className="card-email">
                          {verification.artistProfile.user.name} • {verification.artistProfile.user.email}
                        </p>
                      </div>
                      <div className="card-meta">
                        <span className="id-type-badge">{getIdTypeLabel(verification.idType)}</span>
                        <span className="card-date">
                          <Clock size={14} />
                          {formatDate(verification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={24} className="card-arrow" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-page {
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

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #A0A0A0;
          font-size: 1.125rem;
        }

        .back-link {
          padding: 0.75rem 1.5rem;
          background: #161616;
          border: 1px solid #2A2A2A;
          border-radius: 8px;
          color: #2FFF8D;
          text-decoration: none;
          font-weight: 600;
          transition: all 200ms;
        }

        .back-link:hover {
          background: #1E1E1E;
          border-color: #2FFF8D;
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: #161616;
          border: 1px solid #2A2A2A;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #2FFF8D;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #A0A0A0;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: #161616;
          border-radius: 12px;
          color: #A0A0A0;
        }

        .empty-state :global(svg) {
          color: #2FFF8D;
          margin-bottom: 1.5rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          color: #FFFFFF;
          margin-bottom: 0.5rem;
        }

        .verifications-list {
          background: #161616;
          border-radius: 12px;
          padding: 2rem;
        }

        .list-header {
          margin-bottom: 1.5rem;
        }

        .list-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2FFF8D;
        }

        .verification-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .verification-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: #0F0F0F;
          border: 1px solid #2A2A2A;
          border-radius: 12px;
          text-decoration: none;
          transition: all 200ms;
        }

        .verification-card:hover {
          border-color: #2FFF8D;
          transform: translateX(4px);
        }

        .card-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .card-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: #161616;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2FFF8D;
        }

        .card-content {
          flex: 1;
        }

        .card-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .card-main h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 0.25rem;
        }

        .card-email {
          color: #A0A0A0;
          font-size: 0.875rem;
        }

        .card-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .id-type-badge {
          background: rgba(47, 255, 141, 0.1);
          color: #2FFF8D;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .card-date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #666;
          font-size: 0.75rem;
        }

        .card-arrow {
          color: #2FFF8D;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .admin-page {
            padding: 1rem;
          }

          h1 {
            font-size: 2rem;
          }

          .header-top {
            flex-direction: column;
          }

          .back-link {
            width: 100%;
            text-align: center;
          }

          .verifications-list {
            padding: 1.5rem;
          }

          .verification-card {
            flex-direction: column;
            text-align: center;
          }

          .card-main {
            flex-direction: column;
            text-align: center;
          }

          .card-meta {
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}

export default function AdminVerificationsPage() {
  return (
    <AdminRoute>
      <AdminVerificationsContent />
    </AdminRoute>
  );
}
