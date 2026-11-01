import React from 'react';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
  message?: string;
}

function CustomError({ statusCode, message }: ErrorProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#08080a',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#111118',
          border: '1px solid #282838',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: '#f5d77f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          {statusCode || '!'}
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 10px' }}>
          {statusCode === 404 ? 'Page Not Found' : 'Something Went Wrong'}
        </h2>
        <p style={{ fontSize: '13px', color: '#8c8c9e', lineHeight: 1.6, margin: '0 0 24px' }}>
          {message ||
            (statusCode === 404
              ? 'The requested page could not be located in The Mirage portal.'
              : 'An unexpected application error occurred. Please try again.')}
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            backgroundColor: '#d4af37',
            color: '#08080a',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '999px',
            textDecoration: 'none',
            letterSpacing: '0.05em',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
          }}
        >
          Return to The Mirage
        </a>
      </div>
    </div>
  );
}

CustomError.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default CustomError;

