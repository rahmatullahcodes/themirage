'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function ContentPolicyPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-[#d4af37] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="border-b border-[#1c1c28] pb-6">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Content & Safety Policy
          </h1>
          <p className="text-xs text-[#8c8c9e] mt-2">
            Creator Rights, 18+ Verification & Moderation Guidelines
          </p>
        </div>

        <div className="space-y-6 text-sm text-[#cbd5e1] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[#f5d77f]">1. Creator Rights & Model Consents</h2>
            <p>
              Creators must possess 100% legal rights, ownership, and written adult model releases for all images, audio, and video uploaded to The Mirage. Uploading non-consensual content or third-party copyrighted material without authorization results in immediate account termination.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[#f5d77f]">2. Zero Tolerance for Prohibited Content</h2>
            <p>
              The Mirage strictly prohibits:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#a0a0b2]">
              <li>Any content depicting or involving individuals under 18 years of age.</li>
              <li>Non-consensual imagery or revenge content.</li>
              <li>Violence, hate speech, or harassment.</li>
              <li>Unlicensed distribution of private custom orders.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-serif font-bold text-[#f5d77f]">3. Moderation & Takedown Queue</h2>
            <p>
              Reported content is triaged 24/7 by our admin moderation panel. Valid violations are removed promptly and violators are permanently suspended.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

