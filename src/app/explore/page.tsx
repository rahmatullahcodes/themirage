'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, Flame, Star, MapPin, Dumbbell, Coffee, Plane, Sparkles, Grid } from 'lucide-react';
import FeaturedCreatorCard from '@/components/FeaturedCreatorCard';
import SubscribeModal from '@/components/SubscribeModal';

const ALL_CREATORS = [
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
  {
    id: 'c6',
    name: 'Aria Vance',
    handle: 'aria-vance',
    followers: '142K',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
    category: 'New',
    isVerified: true,
  },
  {
    id: 'c7',
    name: 'Chloe Bennett',
    handle: 'chloe-bennett',
    followers: '88K',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
    category: 'Nearby',
    isVerified: false,
  },
  {
    id: 'c8',
    name: 'Elena Rostova',
    handle: 'elena-rostova',
    followers: '230K',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    category: 'Mature',
    isVerified: true,
  },
];

const CATEGORIES_LIST = [
  'All',
  'Popular',
  'New',
  'Nearby',
  'Fitness',
  'Lifestyle',
  'Travel',
  'Cosplay',
  'Mature',
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'All';
  const initialQuery = searchParams?.get('q') || '';

  const [activeCategory, setActiveCategory] = useState(
    initialCategory.toLowerCase() === 'all' ? 'All' : initialCategory
  );
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('popular');
  const [selectedCreator, setSelectedCreator] = useState<{
    id: string;
    name: string;
    handle: string;
    price: number;
  } | null>(null);

  useEffect(() => {
    const cat = searchParams?.get('category');
    if (cat) {
      const match = CATEGORIES_LIST.find((c) => c.toLowerCase() === cat.toLowerCase());
      if (match) setActiveCategory(match);
    }
  }, [searchParams]);

  const filteredCreators = ALL_CREATORS.filter((c) => {
    const matchesCategory =
      activeCategory === 'All' || c.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-10">
      <SubscribeModal
        creator={selectedCreator}
        onClose={() => setSelectedCreator(null)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Explore <span className="gold-text-gradient">Creators</span>
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Discover verified talent, exclusive feeds, and personalised content creators.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, handle, or style..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#121217] border border-[#272736] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-[#d4af37]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort creators by"
              className="bg-[#121217] border border-[#272736] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Recently Joined</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? 'gold-button shadow-gold-sm'
                  : 'bg-[#121218] border border-[#22222e] text-[#94a3b8] hover:text-white hover:border-[#d4af37]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredCreators.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredCreators.map((creator) => (
              <FeaturedCreatorCard
                key={creator.id}
                {...creator}
                onSubscribeClick={(c) => setSelectedCreator(c)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-[#717182]">
            <p className="text-base">No creators found matching your criteria.</p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-[#d4af37] underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08080a] flex items-center justify-center text-[#d4af37]">Loading...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
