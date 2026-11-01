'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Boundary Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#111118] border border-[#262635] rounded-3xl p-8 text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-serif font-bold text-white">Something went wrong</h2>
        <p className="text-xs text-[#8c8c9e] leading-relaxed">
          {error?.message ||
            'An unexpected error occurred while loading this page. You can try refreshing or navigate back to the portal.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-[#181824] border border-[#2d2d3e] text-xs font-semibold text-white hover:border-[#d4af37] flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5 text-[#d4af37]" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}

