'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-[#d4af37] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="border-b border-[#1c1c28] pb-6">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#8c8c9e] mt-2">
            Last Updated: October 2026 • Encrypted Data & Anonymity Standards
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#cbd5e1] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[#f5d77f]">1. Discretion & Privacy Commitment</h2>
            <p>
              Your personal privacy is our foremost priority. Financial billing statements display generic merchant identifiers. We do not sell or monetize personal browsing history or messaging data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[#f5d77f]">2. Media Storage & Delivery Security</h2>
            <p>
              All restricted creator media and personalized private custom content are stored within private, encrypted S3-compatible object vaults. Files are served via authenticated, short-lived delivery tokens.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[#f5d77f]">3. Direct 1-on-1 Messaging</h2>
            <p>
              Private chat between users and creators is restricted exclusively to authorized conversation participants.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

