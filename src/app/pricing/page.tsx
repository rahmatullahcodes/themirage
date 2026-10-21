'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Heart } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161622] border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-widest">
            Fair & Transparent
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide">
            Simple Pricing. <span className="gold-text-gradient">Maximum Freedom.</span>
          </h1>
          <p className="text-sm text-[#94a3af] leading-relaxed">
            The Mirage empowers creators to own their craft with an industry-leading 85% revenue split, while subscribers enjoy premium exclusive feeds with no hidden fees.
          </p>
        </div>

        {/* 2 Main Comparison Cards: Subscriber vs Creator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Subscriber Card */}
          <div className="p-8 rounded-3xl bg-[#111117] border border-[#22222e] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#181824] border border-[#2a2a3c] flex items-center justify-center text-[#f5d77f]">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">For Fans & Subscribers</h3>
              <p className="text-xs text-[#8c8c9e] leading-relaxed">
                Connect directly with your favourite stars, unlock high-resolution photos and videos, and order custom private requests.
              </p>

              <div className="text-2xl font-bold text-white font-serif pt-2">
                Pay Per Creator
                <span className="text-xs text-[#7c7c90] font-sans font-normal block mt-1">
                  Starting from $4.99 / month • Cancel anytime
                </span>
              </div>

              <ul className="text-xs text-[#cbd5e1] space-y-2.5 pt-4 border-t border-[#1e1e2c]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f]" />
                  Full access to creator&apos;s exclusive subscriber feed
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f]" />
                  Direct 1-on-1 private messaging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f]" />
                  Encrypted private delivery vault
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f]" />
                  Age verification & 100% privacy protection
                </li>
              </ul>
            </div>

            <Link
              href="/explore"
              className="w-full py-3 rounded-xl border border-[#d4af37]/40 hover:border-[#d4af37] text-white text-xs font-bold text-center block transition-all"
            >
              Explore Creators
            </Link>
          </div>

          {/* Creator 85/15 Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#181824] via-[#12121a] to-[#0e0e14] border border-[#d4af37]/50 shadow-gold-glow flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f5d77f] text-[10px] font-bold">
              RECOMMENDED
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#aa820a] flex items-center justify-center text-black shadow-gold-sm">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white">For Content Creators</h3>
              <p className="text-xs text-[#a0a0b5] leading-relaxed">
                Take home the industry&apos;s most rewarding cut with full creative freedom and direct customer monetization.
              </p>

              <div className="pt-2">
                <div className="text-3xl font-black font-serif text-[#f5d77f]">
                  85% Creator Cut
                </div>
                <span className="text-xs text-[#8c8c9e] font-sans font-normal block mt-1">
                  15% Platform Maintenance Fee • No upfront fees
                </span>
              </div>

              <ul className="text-xs text-[#cbd5e1] space-y-2.5 pt-4 border-t border-[#2a2a3e]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f]" />
                  Keep 85% of all subscriptions & custom request tips
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f]" />
                  Set your own monthly prices and custom quotes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f]" />
                  Private S3-compatible content security protection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f]" />
                  Creator studio analytics & verified badge review
                </li>
              </ul>
            </div>

            <Link
              href="/register?role=CREATOR"
              className="w-full py-3.5 rounded-xl gold-button text-xs font-bold text-center block shadow-gold-sm"
            >
              Start Earning as a Creator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

