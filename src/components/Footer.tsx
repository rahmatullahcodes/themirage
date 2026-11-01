'use client';

import React from 'react';
import Link from 'next/link';
import { Crown } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#060608] border-t border-[#1a1a22] text-[#8e8e9e] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/" className="flex items-center group">
              <img
                src="/assets/the_mirage_logo.png"
                alt="The Mirage"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <span className="hidden sm:inline text-[#3a3a48]">|</span>
            <span className="text-xs text-[#717182] font-normal">
              Your Freedom. Your Content. Your Community.
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-[#9da3af]">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">
              Home
            </Link>
            <Link href="/explore" className="hover:text-[#d4af37] transition-colors">
              Explore
            </Link>
            <Link href="/creators" className="hover:text-[#d4af37] transition-colors">
              Creators
            </Link>
            <Link href="/pricing" className="hover:text-[#d4af37] transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-[#d4af37] transition-colors">
              Blog
            </Link>
            <Link href="/about" className="hover:text-[#d4af37] transition-colors">
              Support
            </Link>
          </div>

          {/* Social Icons & 18+ Age Badge */}
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#888899] hover:text-[#d4af37] transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#888899] hover:text-[#d4af37] transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#888899] hover:text-[#d4af37] transition-colors"
              aria-label="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* 18+ badge clickable to test/reopen age gate */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('open_age_gate'));
                }
              }}
              title="Click to view 18+ Age Verification Declaration"
              className="w-6 h-6 rounded-full border border-[#888899] hover:border-[#d4af37] hover:text-[#d4af37] flex items-center justify-center text-[10px] font-bold text-white tracking-tighter transition-colors cursor-pointer"
            >
              18+
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#16161f] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#5c5c6e] gap-4">
          <p>© 2026 The Mirage. All rights reserved. Creator First Platform.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/content-policy" className="hover:text-white transition-colors">
              Content Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

