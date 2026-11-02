import React from 'react';
import Link from 'next/link';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center p-6 selection:bg-[#d4af37]/30 selection:text-white">
      <div className="max-w-md w-full bg-[#111118] border border-[#262635] rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#1a1710] border border-[#d4af37]/40 text-[#f5d77f] mx-auto flex items-center justify-center shadow-gold-sm">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div>
          <span className="text-[11px] uppercase font-bold tracking-[0.25em] text-[#d4af37]">
            404 • Page Not Found
          </span>
          <h1 className="text-2xl font-serif font-black text-white mt-1">
            Lost in The Mirage
          </h1>
          <p className="text-xs text-[#8c8c9e] mt-2 leading-relaxed">
            The creator profile or page you are looking for doesn&apos;t exist, has moved, or the link may be outdated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>
          <Link
            href="/creators"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#181824] border border-[#2d2d3e] text-xs font-semibold text-white hover:border-[#d4af37] flex items-center justify-center gap-1.5 transition-colors"
          >
            Explore Creators
          </Link>
        </div>
      </div>
    </div>
  );
}
