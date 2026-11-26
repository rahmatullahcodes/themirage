'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import FeaturedCreatorCard from '@/components/FeaturedCreatorCard';

export default function CreatorsDirectoryPage() {
  const [search, setSearch] = useState('');
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
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCreators(false));
  }, []);

  const filtered = creatorsList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.handle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-12">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Creators <span className="gold-text-gradient">Directory</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8c8c9e] mt-1">
              Browse top verified talents and join their exclusive circles on The Mirage.
            </p>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606072]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creators..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#14141e] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {loadingCreators ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-[#111116] border border-[#22222c] animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((creator) => (
              <FeaturedCreatorCard
                key={creator.id}
                {...creator}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-[#717182]">
            <p className="text-base">No creators found matching &quot;{search}&quot;.</p>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="mt-3 text-xs text-[#d4af37] underline cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

