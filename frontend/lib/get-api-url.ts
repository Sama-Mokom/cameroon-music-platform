// Helper to get the correct API URL based on environment
export function getApiUrl(): string {
  // In browser, check if we're accessing via network IP
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // If accessing via network IP (not localhost), use that IP for API
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:4000`;
    }
  }

  // Default to localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}
