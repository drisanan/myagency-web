'use client';

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ 
          minHeight: '100vh',
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: 40, 
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#f5f5f5',
        }}>
          <h1 style={{ fontSize: 48, marginBottom: 16, color: '#333' }}>Oops!</h1>
          <h2 style={{ fontSize: 20, fontWeight: 400, color: '#666', marginBottom: 24 }}>
            Something went wrong
          </h2>
          <p style={{ color: '#888', marginBottom: 32, maxWidth: 400 }}>
            We've been notified and are working to fix the issue. 
            Please try again or contact support if the problem persists.
          </p>
          <button 
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 500,
              color: '#fff',
              background: '#2563eb',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}

