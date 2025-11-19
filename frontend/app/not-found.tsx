import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1rem',
      textAlign: 'center',
      background: '#0D0D0D',
      color: '#FFFFFF'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Page Not Found</h2>
      <p style={{ marginBottom: '2rem', color: '#B3B3B3' }}>
        The page you are looking for does not exist.
      </p>
      <Link
        href="/dashboard"
        style={{
          padding: '0.75rem 1.5rem',
          background: '#2FFF8D',
          color: '#0D0D0D',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600'
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
