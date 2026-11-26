'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import FeaturedCreatorCard from '@/components/FeaturedCreatorCard';

const CATEGORIES_LIST = [
  'All',
  'Popular',
  'New',
  'Nearby',
  'Fitness',
  'Lifestyle',
  'Fetish',
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

  useEffect(() => {
    const cat = searchParams?.get('category');
    if (cat) {
      const match = CATEGORIES_LIST.find((c) => c.toLowerCase() === cat.toLowerCase());
      if (match) setActiveCategory(match);
    }
    const q = searchParams?.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const parseFollowers = (str: string) => {
    const num = parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
    if (str.toUpperCase().includes('M')) return num * 1000000;
    if (str.toUpperCase().includes('K')) return num * 1000;
    return num;
  };

  const [creatorsList, setCreatorsList] = useState<any[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);

  useEffect(() => {
    fetch('/api/creators', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.creators)) {
          setCreatorsList(
            data.creators.map((c: any) => ({
              id: c.id,
              name: c.name,
              handle: c.handle,
              followers: c.followers || '0',
              price: Number(c.monthlyPrice) || 9.99,
              image: c.avatar,
              category: c.category || 'Popular',
              isVerified: Boolean(c.isVerified),
              createdAt: c.createdAt,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCreators(false));
  }, []);

  const filteredCreators = creatorsList.filter((c) => {
    const matchesCategory =
      activeCategory === 'All' || c.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    return parseFollowers(b.followers) - parseFollowers(a.followers);
  });

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-6 sm:py-10">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white">
            Explore <span className="gold-text-gradient">Creators</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">
            Discover verified talent, exclusive feeds, and personalised content creators.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, handle, or style..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#121217] border border-[#272736] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort creators by"
              className="flex-1 md:flex-initial bg-[#121217] border border-[#272736] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
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

        {loadingCreators ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-[#111116] border border-[#22222c] animate-pulse" />
            ))}
          </div>
        ) : filteredCreators.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredCreators.map((creator) => (
              <FeaturedCreatorCard
                key={creator.id}
                {...creator}
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
