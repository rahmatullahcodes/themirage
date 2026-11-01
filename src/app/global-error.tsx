'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#08080a',
          color: '#ffffff',
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '440px',
              backgroundColor: '#111118',
              border: '1px solid #282838',
              borderRadius: '24px',
              padding: '36px',
            }}
          >
            <h1 style={{ color: '#d4af37', fontSize: '24px', margin: '0 0 12px' }}>The Mirage</h1>
            <p style={{ color: '#8c8c9e', fontSize: '13px', margin: '0 0 24px' }}>
              A critical application error occurred.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '10px 24px',
                backgroundColor: '#d4af37',
                border: 'none',
                borderRadius: '999px',
                color: '#08080a',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

