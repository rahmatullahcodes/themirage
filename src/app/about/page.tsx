'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Shield, Sparkles, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-white py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Brand Showcase with official logo banner */}
        <div className="text-center space-y-4">
          <div className="max-w-md mx-auto mb-6 p-2 rounded-2xl bg-[#0f0f15] border border-[#d4af37]/30 shadow-gold-sm">
            <img
              src="/assets/the_mirage_logo.png"
              alt="The Mirage Official Logo"
              className="w-full h-auto object-contain"
            />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-wide">
            Real People. Exclusive Content. <span className="gold-text-gradient">Your World.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#94a3af] max-w-2xl mx-auto leading-relaxed">
            The Mirage is a modern, luxury creator ecosystem designed to connect influential creators with dedicated fans in an elevated, black-and-gold aesthetic.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#111117] border border-[#22222e] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#181824] flex items-center justify-center text-[#f5d77f]">
              <Crown className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-white">Higher Earning Potential</h3>
            <p className="text-xs text-[#8c8c9e] leading-relaxed">
              We believe creators should keep the overwhelming majority of the value they generate. Our creator-first model allows creators to thrive with higher earning potential and sustainable income.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111117] border border-[#22222e] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#181824] flex items-center justify-center text-[#f5d77f]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-white">Privacy & Safety First</h3>
            <p className="text-xs text-[#8c8c9e] leading-relaxed">
              Robust age-declaration controls, encrypted 1-on-1 direct messaging, private S3 object vaults, and verified creator badges keep everyone secure.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111117] border border-[#22222e] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#181824] flex items-center justify-center text-[#f5d77f]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-white">Personalised Commissions</h3>
            <p className="text-xs text-[#8c8c9e] leading-relaxed">
              Subscribers can order custom clips, personalized greetings, and bespoke media directly in the chat with verified delivery and private storage.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#14141e] via-[#1a1a26] to-[#14141e] border border-[#d4af37]/40 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Ready to Experience The Mirage?
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3af] max-w-lg mx-auto">
            Join thousands of active creators and subscribers in the next generation of creator subscription platforms.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="px-8 py-3 rounded-full gold-button text-xs font-bold shadow-gold-sm flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

