'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Crown, CheckCircle2, SlidersHorizontal } from 'lucide-react';
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
];

export default function CreatorsDirectoryPage() {
  const [search, setSearch] = useState('');
  const [selectedCreator, setSelectedCreator] = useState<{
    id: string;
    name: string;
    handle: string;
    price: number;
  } | null>(null);

  const filtered = ALL_CREATORS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.handle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-12">
      <SubscribeModal
        creator={selectedCreator}
        onClose={() => setSelectedCreator(null)}
      />

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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((creator) => (
            <FeaturedCreatorCard
              key={creator.id}
              {...creator}
              onSubscribeClick={(c) => setSelectedCreator(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

