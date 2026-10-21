'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Shield, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-[#d4af37] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="border-b border-[#1c1c28] pb-6">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-[#8c8c9e] mt-2">
            Last Updated: October 2026 • The Mirage Platform Agreement
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#cbd5e1] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[#f5d77f]">1. Acceptance of Terms & 18+ Age Requirement</h2>
            <p>
              By accessing or using The Mirage, you certify that you are at least 18 years of age (or the legal age of majority in your jurisdiction). Access by minors is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[#f5d77f]">2. Creator Subscriptions & Content Access</h2>
            <p>
              Subscribers obtain non-exclusive, revocable personal viewing access to creator feeds for the duration of an active subscription. Content is protected by digital intellectual property laws and must not be recorded, leaked, or redistributed.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[#f5d77f]">3. 85/15 Creator Revenue Agreement</h2>
            <p>
              The Mirage operates under an 85% Creator / 15% Platform commission split. Creators receive 85% of net revenues generated through subscriptions and approved personalized content commissions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[#f5d77f]">4. Personalized Custom Content Orders</h2>
            <p>
              Custom content requests conducted via 1-on-1 chat represent bespoke personal agreements between the creator and the requesting subscriber. All private delivery occurs through encrypted storage vaults.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

