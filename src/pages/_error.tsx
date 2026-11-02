import React from 'react';
import { NextPageContext } from 'next';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#08080a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{
        maxWidth: '480px',
        backgroundColor: '#111118',
        border: '1px solid #282838',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}>
        <h1 style={{ color: '#d4af37', fontSize: '28px', margin: '0 0 12px', fontWeight: 800 }}>
          {statusCode ? `${statusCode} Error` : 'The Mirage'}
        </h1>
        <p style={{ color: '#9fa3af', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
          {statusCode === 404
            ? 'The requested page or resource could not be found.'
            : 'An unexpected server error occurred. Please try again or return to the platform home.'}
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            backgroundColor: '#d4af37',
            color: '#08080a',
            fontWeight: 700,
            borderRadius: '999px',
            textDecoration: 'none',
            fontSize: '13px',
          }}
        >
          Return to The Mirage
        </Link>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
