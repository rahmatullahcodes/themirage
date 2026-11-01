'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Crown,
  Gem,
  MessageSquare,
  Video,
  ShieldCheck,
  Play,
  CheckCircle2,
  Sparkles,
  Flame,
  Star,
  MapPin,
  Dumbbell,
  Coffee,
  Plane,
  Grid,
  Heart,
  UserCheck,
  Compass,
  CreditCard,
  Send,
} from 'lucide-react';
import FeaturedCreatorCard from '@/components/FeaturedCreatorCard';
import SubscribeModal from '@/components/SubscribeModal';

// High quality, stylish model images for featured creators and hero
const HERO_CREATOR_IMG = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80';
const PREVIEW_VIDEO_IMG = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80';
const PROMO_MODEL_IMG = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80';

const FEATURED_CREATORS = [
  {
    id: 'c1',
    name: 'Luna Rae',
    handle: 'luna-rae',
    followers: '128K',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    category: 'Popular',
    isVerified: true,
  },
  {
    id: 'c2',
    name: 'Mia Carter',
    handle: 'mia-carter',
    followers: '95K',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    category: 'Lifestyle',
    isVerified: true,
  },
  {
    id: 'c3',
    name: 'Sophie Lee',
    handle: 'sophie-lee',
    followers: '180K',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    category: 'Cosplay',
    isVerified: true,
  },
  {
    id: 'c4',
    name: 'Zara Khan',
    handle: 'zara-khan',
    followers: '210K',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    category: 'Travel',
    isVerified: true,
  },
  {
    id: 'c5',
    name: 'Emily Rose',
    handle: 'emily-rose',
    followers: '98K',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
    category: 'Fitness',
    isVerified: true,
  },
];

const CATEGORIES = [
  { name: 'Popular', slug: 'popular', icon: Flame, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=70' },
  { name: 'New', slug: 'new', icon: Star, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=70' },
  { name: 'Nearby', slug: 'nearby', icon: MapPin, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=70' },
  { name: 'Fitness', slug: 'fitness', icon: Dumbbell, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=70' },
  { name: 'Lifestyle', slug: 'lifestyle', icon: Coffee, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=70' },
  { name: 'Travel', slug: 'travel', icon: Plane, image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=70' },
  { name: 'Cosplay', slug: 'cosplay', icon: Sparkles, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=70' },
  { name: 'Mature', slug: 'mature', isAgeBadge: true, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=70' },
  { name: 'All Categories', slug: 'all', icon: Grid, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=70' },
];

export default function HomePage() {
  const [selectedCreator, setSelectedCreator] = useState<{
    id: string;
    name: string;
    handle: string;
    price: number;
  } | null>(null);

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      {/* Subscribe Checkout Modal */}
      <SubscribeModal
        creator={selectedCreator}
        onClose={() => setSelectedCreator(null)}
      />

      {/* ========================================================
          1. HERO SECTION (Exactly Matching Screenshot)
      ======================================================== */}
      <section className="relative overflow-hidden pt-8 pb-14 border-b border-[#181822]">
        {/* Subtle Ambient Gold Radial Glow */}
        <div className="absolute top-1/4 left-1/3 w-[650px] h-[650px] bg-[#d4af37]/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16161f] border border-[#2b2b3a] w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-ping" />
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#d4af37]">
                  PREMIUM CREATOR PLATFORM
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-serif font-black tracking-tight leading-[1.08] text-white">
                Real Creators.<br />
                <span className="gold-text-gradient">Exclusive Content.</span><br />
                On Your Terms.
              </h1>

              <p className="text-sm sm:text-base text-[#9fa3af] leading-relaxed max-w-lg">
                Join The Mirage and get closer to your favourite creators. Unlock exclusive photos, videos, live streams and more.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/explore"
                  className="px-7 py-3 rounded-full gold-button text-sm font-bold shadow-gold-sm flex items-center gap-2 group"
                >
                  Explore Creators
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/register"
                  className="px-7 py-3 rounded-full bg-[#121218] hover:bg-[#1a1a24] text-white border border-[#2b2b3a] hover:border-[#d4af37]/50 text-sm font-semibold transition-all"
                >
                  Create Account
                </Link>
              </div>

              {/* Platform Statistics Row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#1c1c28]">
                <div>
                  <div className="text-lg sm:text-xl font-bold font-serif text-white">10K+</div>
                  <div className="text-[10px] text-[#717182] uppercase tracking-wider mt-0.5">Active Creators</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold font-serif text-white">100K+</div>
                  <div className="text-[10px] text-[#717182] uppercase tracking-wider mt-0.5">Happy Subscribers</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold font-serif text-white">100%</div>
                  <div className="text-[10px] text-[#717182] uppercase tracking-wider mt-0.5">Secure & Private</div>
                </div>
              </div>
            </div>

            {/* Center Visual Column: Featured Model Portrait */}
            <div className="lg:col-span-4 relative flex items-center justify-center">
              <div className="relative w-full max-w-[370px] aspect-[3/4] rounded-3xl overflow-hidden border border-[#d4af37]/30 shadow-2xl">
                <img
                  src={HERO_CREATOR_IMG}
                  alt="Featured Creator"
                  className="w-full h-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent opacity-80" />

                {/* Script Accent: More Freedom More You */}
                <div className="absolute top-8 right-6 text-right select-none pointer-events-none">
                  <div className="font-serif italic text-base sm:text-lg text-[#f5d77f] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    More Freedom<br />More You ♡
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Features Stack & Video Preview Card */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* Feature 1 */}
              <div className="p-3.5 rounded-2xl bg-[#111117] border border-[#20202c] hover:border-[#d4af37]/40 transition-colors flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#181824] border border-[#2a2a3c] flex items-center justify-center flex-shrink-0 text-[#f5d77f]">
                  <Gem className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Exclusive Content</h4>
                  <p className="text-[11px] text-[#7e7e90]">Only on The Mirage</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-3.5 rounded-2xl bg-[#111117] border border-[#20202c] hover:border-[#d4af37]/40 transition-colors flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#181824] border border-[#2a2a3c] flex items-center justify-center flex-shrink-0 text-[#f5d77f]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Messaging</h4>
                  <p className="text-[11px] text-[#7e7e90]">Chat with your favourite creators</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-3.5 rounded-2xl bg-[#111117] border border-[#20202c] hover:border-[#d4af37]/40 transition-colors flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#181824] border border-[#2a2a3c] flex items-center justify-center flex-shrink-0 text-[#f5d77f]">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live Streams</h4>
                  <p className="text-[11px] text-[#7e7e90]">Real-time interaction</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-3.5 rounded-2xl bg-[#111117] border border-[#20202c] hover:border-[#d4af37]/40 transition-colors flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#181824] border border-[#2a2a3c] flex items-center justify-center flex-shrink-0 text-[#f5d77f]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Safe & Secure</h4>
                  <p className="text-[11px] text-[#7e7e90]">Your privacy is our priority</p>
                </div>
              </div>

              {/* Watch Previews Video Thumbnail Card */}
              <div className="relative rounded-2xl overflow-hidden border border-[#242434] aspect-[16/10] group cursor-pointer shadow-lg">
                <img
                  src={PREVIEW_VIDEO_IMG}
                  alt="Watch Previews"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-white block">Watch Previews</span>
                    <span className="text-[10px] text-[#d4af37]">Discover exclusive clips</span>
                  </div>
                </div>

                {/* Dot / bar indicator */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
                  <span className="w-5 h-1 bg-[#d4af37] rounded-full"></span>
                  <span className="w-1.5 h-1 bg-white/40 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. FEATURED CREATORS & CATEGORIES SPLIT
      ======================================================== */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured Creators (Left 8 Cols) */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
                Featured <span className="gold-text-gradient">Creators</span>
              </h2>
              <Link
                href="/creators"
                className="text-xs font-medium text-[#d4af37] hover:text-[#f5d77f] flex items-center gap-1 group"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {FEATURED_CREATORS.map((creator) => (
                <FeaturedCreatorCard
                  key={creator.id}
                  {...creator}
                  onSubscribeClick={(c) => setSelectedCreator(c)}
                />
              ))}
            </div>
          </div>

          {/* Explore by Category (Right 4 Cols) */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-white tracking-wide">
                Explore by <span className="gold-text-gradient">Category</span>
              </h2>
              <Link
                href="/explore"
                className="text-xs font-medium text-[#d4af37] hover:text-[#f5d77f] flex items-center gap-1 group"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <Link
                    key={cat.slug}
                    href={`/explore?category=${cat.slug}`}
                    className="group relative h-24 rounded-xl overflow-hidden border border-[#22222d] hover:border-[#d4af37]/60 transition-all flex flex-col items-center justify-center p-2 text-center"
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-40 group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/60 to-transparent" />

                    <div className="relative z-10 flex flex-col items-center gap-1">
                      {cat.isAgeBadge ? (
                        <div className="w-7 h-7 rounded-full border border-[#f5d77f] flex items-center justify-center text-[10px] font-bold text-[#f5d77f] bg-black/40">
                          18+
                        </div>
                      ) : IconComponent ? (
                        <div className="p-1.5 rounded-lg bg-black/40 border border-[#d4af37]/20 group-hover:border-[#d4af37] transition-colors">
                          <IconComponent className="w-4 h-4 text-[#f5d77f]" />
                        </div>
                      ) : null}
                      <span className="text-[11px] font-semibold text-white group-hover:text-[#f5d77f] transition-colors truncate max-w-[90px]">
                        {cat.name}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. WHY JOIN THE MIRAGE PROMO BANNER
      ======================================================== */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#121218] via-[#171720] to-[#121218] border border-[#d4af37]/30 p-6 sm:p-8 lg:p-10 shadow-2xl">
          {/* Background Ambient Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#d4af37]/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Circular Model Visual */}
            <div className="lg:col-span-3 flex justify-center lg:justify-start">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-tr from-[#d4af37] via-[#f5d77f] to-[#aa820a] shadow-gold-glow">
                <img
                  src={PROMO_MODEL_IMG}
                  alt="Creator on The Mirage"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            {/* Middle: Why Join The Mirage Bullet Points */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
                Why Join <span className="gold-text-gradient">The Mirage?</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#cbd5e1]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f] flex-shrink-0" />
                  <span>Higher earning potential for creators</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f] flex-shrink-0" />
                  <span>Global audience and exposure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f] flex-shrink-0" />
                  <span>Exclusive and authentic content</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f] flex-shrink-0" />
                  <span>Modern and user-friendly platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f] flex-shrink-0" />
                  <span>Easy and secure payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#f5d77f] flex-shrink-0" />
                  <span>Direct messaging and live streams</span>
                </div>
              </div>
            </div>

            {/* Right: Higher Earning Potential Box and Join Now CTA */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-end gap-4">
              <div className="w-full max-w-xs p-4 rounded-2xl bg-gradient-to-br from-[#1a1a24] to-[#121218] border border-[#d4af37]/40 text-center">
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <Crown className="w-5 h-5 text-[#f5d77f]" />
                  <span className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                    Higher Earning Potential
                  </span>
                </div>
                <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                  Maximize your creator revenue through monthly subscriptions, pay-per-view media, and bespoke private requests.
                </p>
              </div>

              <Link
                href="/register?role=CREATOR"
                className="w-full max-w-xs py-3.5 rounded-full gold-button text-sm font-bold shadow-gold-sm text-center flex items-center justify-center gap-2 group"
              >
                Join Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. HOW IT WORKS BAR (Exactly Like Reference Screenshot)
      ======================================================== */}
      <section className="py-8 bg-[#0a0a0e] border-y border-[#181824]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Title */}
            <h3 className="text-xl font-serif font-bold text-white flex-shrink-0">
              How It Works
            </h3>

            {/* 4 Step Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
              {/* Step 1 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#14141d] border border-[#2b2b3a] flex items-center justify-center text-[#f5d77f] flex-shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">1. Sign Up</div>
                  <div className="text-[11px] text-[#717182]">Create your free account</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#14141d] border border-[#2b2b3a] flex items-center justify-center text-[#f5d77f] flex-shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">2. Explore</div>
                  <div className="text-[11px] text-[#717182]">Find your favourite creators</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#14141d] border border-[#2b2b3a] flex items-center justify-center text-[#f5d77f] flex-shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">3. Subscribe</div>
                  <div className="text-[11px] text-[#717182]">Unlock exclusive content</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#14141d] border border-[#2b2b3a] flex items-center justify-center text-[#f5d77f] flex-shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">4. Connect</div>
                  <div className="text-[11px] text-[#717182]">Chat, like and support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

