'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Crown,
  CheckCircle2,
  Lock,
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  Grid,
  Image as ImageIcon,
  Video,
  Info,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import SubscribeModal from '@/components/SubscribeModal';

interface PostItem {
  id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  caption: string;
  isLocked: boolean;
  likes: number;
  date: string;
}

function CreatorProfileContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const handle = params.handle as string;

  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'videos' | 'about'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  // Check URL parameter for auto opening subscribe modal
  useEffect(() => {
    if (searchParams.get('subscribe') === 'true') {
      setShowSubscribeModal(true);
    }
  }, [searchParams]);

  // Demo creator data based on handle
  const creator = {
    id: `creator-${handle}`,
    name: handle === 'luna-rae' ? 'Luna Rae' : handle.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    handle: `@${handle}`,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80',
    bio: 'Fashion model, fitness enthusiast and creative visual storyteller. Sharing my exclusive lifestyle, behind the scenes, and direct chat moments with you.',
    isVerified: true,
    monthlyPrice: 9.99,
    followersCount: '128K',
    postsCount: 46,
    likesCount: '340K',
    category: 'Lifestyle',
  };

  const [posts, setPosts] = useState<PostItem[]>([
    {
      id: 'p1',
      type: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      caption: 'Golden hour mood in Paris. Feeling grateful for all the love on The Mirage! ✨',
      isLocked: false,
      likes: 1240,
      date: '2 hours ago',
    },
    {
      id: 'p2',
      type: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      caption: 'Exclusive backstage photoshoot session. Unlock to view full set.',
      isLocked: !isSubscribed,
      likes: 3820,
      date: '1 day ago',
    },
    {
      id: 'p3',
      type: 'video',
      mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      caption: 'Private training workout routine & morning vlog 🖤',
      isLocked: !isSubscribed,
      likes: 2190,
      date: '3 days ago',
    },
    {
      id: 'p4',
      type: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
      caption: 'Midnight aesthetics in luxury suite. Subscribers only.',
      isLocked: !isSubscribed,
      likes: 5410,
      date: '5 days ago',
    },
  ]);

  const handleSubscribeSuccess = () => {
    setIsSubscribed(true);
    setPosts(prev => prev.map(p => ({ ...p, isLocked: false })));
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-20">
      {/* Subscribe Modal */}
      <SubscribeModal
        creator={{
          id: creator.id,
          name: creator.name,
          handle: creator.handle,
          price: creator.monthlyPrice,
        }}
        onClose={() => setShowSubscribeModal(false)}
        onSuccess={handleSubscribeSuccess}
      />

      {/* Banner Container */}
      <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-[#121218]">
        <img
          src={creator.banner}
          alt={creator.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-black/30" />
      </div>

      {/* Profile Header Details */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 sm:-mt-24 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1c1c28]">
          {/* Avatar & Identifiers */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-br from-[#d4af37] via-[#f5d77f] to-[#aa820a] shadow-gold-glow flex-shrink-0">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-full h-full object-cover rounded-full"
              />
              <span className="absolute bottom-2 right-2 p-1.5 rounded-full bg-[#0a0a0e] text-[#f5d77f] border border-[#d4af37]/40 shadow-md">
                <Crown className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
                  {creator.name}
                </h1>
                {creator.isVerified && (
                  <CheckCircle2 className="w-5 h-5 fill-[#d4af37] text-black" />
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-[#8a8a9e]">
                <span>{creator.handle}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full bg-[#161622] text-[#f5d77f] border border-[#d4af37]/20 font-medium">
                  {creator.category}
                </span>
              </div>

              {/* Stats badges */}
              <div className="flex items-center justify-center sm:justify-start gap-5 pt-2 text-xs">
                <div>
                  <span className="font-bold text-white text-sm">{creator.followersCount}</span>
                  <span className="text-[#6c6c80] ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-white text-sm">{creator.postsCount}</span>
                  <span className="text-[#6c6c80] ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-bold text-white text-sm">{creator.likesCount}</span>
                  <span className="text-[#6c6c80] ml-1">Likes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold border transition-all ${
                isFollowing
                  ? 'bg-[#1a1a24] border-[#38384a] text-white'
                  : 'bg-transparent border-[#d4af37]/50 text-[#f5d77f] hover:bg-[#d4af37]/10'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>

            <Link
              href={`/chat?creator=${encodeURIComponent(handle)}`}
              className="p-2.5 rounded-full bg-[#12121a] border border-[#262636] text-[#cbd5e1] hover:text-[#f5d77f] hover:border-[#d4af37]/40 transition-colors"
              title="Send Message"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Profile link copied to clipboard!');
                }
              }}
              className="p-2.5 rounded-full bg-[#12121a] border border-[#262636] text-[#cbd5e1] hover:text-white transition-colors"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Subscribe Gold CTA */}
            {isSubscribed ? (
              <span className="px-6 py-2.5 rounded-full bg-[#122416] border border-green-500/40 text-green-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Subscribed
              </span>
            ) : (
              <button
                onClick={() => setShowSubscribeModal(true)}
                className="px-7 py-2.5 rounded-full gold-button text-xs font-bold shadow-gold-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Subscribe ${creator.monthlyPrice.toFixed(2)}/mo
              </button>
            )}
          </div>
        </div>

        {/* Bio & Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Feed & Tabs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Feed Navigation Tabs */}
            <div className="flex border-b border-[#1c1c28] gap-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'posts'
                    ? 'border-[#d4af37] text-white'
                    : 'border-transparent text-[#7c7c8e] hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
                Posts ({creator.postsCount})
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'photos'
                    ? 'border-[#d4af37] text-white'
                    : 'border-transparent text-[#7c7c8e] hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Photos
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'videos'
                    ? 'border-[#d4af37] text-white'
                    : 'border-transparent text-[#7c7c8e] hover:text-white'
                }`}
              >
                <Video className="w-4 h-4" />
                Videos
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'about'
                    ? 'border-[#d4af37] text-white'
                    : 'border-transparent text-[#7c7c8e] hover:text-white'
                }`}
              >
                <Info className="w-4 h-4" />
                About
              </button>
            </div>

            {/* Posts Stream */}
            {activeTab === 'about' ? (
              <div className="p-6 rounded-2xl bg-[#101016] border border-[#22222e] space-y-4">
                <h3 className="text-base font-serif font-bold text-white">About {creator.name}</h3>
                <p className="text-sm text-[#9da3af] leading-relaxed">{creator.bio}</p>
                <div className="pt-4 border-t border-[#1c1c28] flex items-center gap-4 text-xs text-[#717182]">
                  <Calendar className="w-4 h-4" />
                  <span>Joined The Mirage Creator Network in 2026</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl bg-[#101016] border border-[#20202a] overflow-hidden"
                  >
                    {/* Post Top Bar */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#d4af37]/40"
                        />
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-1">
                            {creator.name}
                            <CheckCircle2 className="w-3.5 h-3.5 fill-[#d4af37] text-black" />
                          </div>
                          <span className="text-[11px] text-[#717182]">{post.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Post Media Area (Locked or Unlocked) */}
                    <div className="relative aspect-video w-full bg-[#14141e] overflow-hidden flex items-center justify-center">
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className={`w-full h-full object-cover ${
                          post.isLocked ? 'blur-2xl scale-110 opacity-40' : ''
                        }`}
                      />

                      {/* Locked Overlay */}
                      {post.isLocked && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#1b1b24] border border-[#d4af37]/40 flex items-center justify-center text-[#f5d77f] shadow-gold-sm">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-serif font-bold text-white">
                              Subscriber-Only Exclusive
                            </h4>
                            <p className="text-xs text-[#8c8c9e] max-w-sm mt-1">
                              Subscribe to {creator.name} to unlock full access to this post and all exclusive media.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowSubscribeModal(true)}
                            className="px-6 py-2.5 rounded-full gold-button text-xs font-bold shadow-gold-sm"
                          >
                            Subscribe for ${creator.monthlyPrice.toFixed(2)}/mo
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Caption & Interactions */}
                    <div className="p-4 space-y-3">
                      <p className="text-xs sm:text-sm text-[#cbd5e1]">{post.caption}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1c1c28] text-xs text-[#717182]">
                        <button
                          onClick={() => {
                            setPosts(prev =>
                              prev.map(p =>
                                p.id === post.id ? { ...p, likes: p.likes + 1 } : p
                              )
                            );
                          }}
                          className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-red-400" />
                          <span>{post.likes}</span>
                        </button>
                        <span className="text-[11px] text-[#555566]">Exclusive on The Mirage</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Creator Info & Custom Request Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Subscription Box */}
            <div className="p-5 rounded-2xl bg-[#111118] border border-[#282836] space-y-4">
              <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#f5d77f]" />
                Subscription Plan
              </h3>
              <div className="text-2xl font-bold font-serif text-white">
                ${creator.monthlyPrice.toFixed(2)}
                <span className="text-xs text-[#7c7c90] font-normal font-sans"> / month</span>
              </div>
              <ul className="text-xs text-[#9fa3af] space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f5d77f]" />
                  Full access to all exclusive posts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f5d77f]" />
                  Direct 1-on-1 private messaging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f5d77f]" />
                  Custom personalised content requests
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f5d77f]" />
                  Cancel subscription anytime
                </li>
              </ul>
              <button
                onClick={() => setShowSubscribeModal(true)}
                className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm"
              >
                {isSubscribed ? 'Manage Subscription' : `Subscribe for $${creator.monthlyPrice.toFixed(2)}`}
              </button>
            </div>

            {/* Custom Content Request CTA Box (Section 13 requirement) */}
            <div className="p-5 rounded-2xl bg-[#13131c] border border-[#d4af37]/30 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f5d77f]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Personalised Content
                </h4>
              </div>
              <p className="text-xs text-[#8e8ea0] leading-relaxed">
                Want a custom photo set, personalised video shoutout, or unique private commission from {creator.name}?
              </p>
              <Link
                href={`/chat?creator=${encodeURIComponent(handle)}&requestCustom=true`}
                className="block text-center py-2.5 rounded-xl bg-[#1d1d28] hover:bg-[#252536] text-[#f5d77f] border border-[#d4af37]/30 text-xs font-semibold transition-colors"
              >
                Request Custom Content
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-[#d4af37]">
          Loading Profile...
        </div>
      }
    >
      <CreatorProfileContent />
    </Suspense>
  );
}

