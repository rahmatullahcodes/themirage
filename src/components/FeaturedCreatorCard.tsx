'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, CheckCircle2 } from 'lucide-react';

export interface CreatorCardProps {
  id: string;
  name: string;
  handle: string;
  followers: string;
  price: number;
  image: string;
  isVerified?: boolean;
  category?: string;
  onSubscribeClick?: (creator: { id: string; name: string; handle: string; price: number }) => void;
}

export default function FeaturedCreatorCard({
  id,
  name,
  handle,
  followers,
  price,
  image,
  isVerified = true,
  category = 'Popular',
  onSubscribeClick,
}: CreatorCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group relative flex flex-col bg-[#111116] border border-[#22222c] hover:border-[#d4af37]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-card-dark hover:-translate-y-1">
      {/* Top Media Portrait Container */}
      <Link href={`/creator/${handle}`} className="relative block aspect-[4/5] w-full overflow-hidden bg-[#161620]">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-black/20" />

        {/* Floating Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLiked(!liked);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
            liked
              ? 'bg-red-500/80 text-white'
              : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
          }`}
          aria-label="Save creator"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        </button>

        {/* Category tag badge */}
        <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/20">
          {category}
        </span>
      </Link>

      {/* Info & Subscribe Action */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <Link href={`/creator/${handle}`} className="flex items-center gap-1.5 group/name">
            <h4 className="font-serif font-bold text-white text-base tracking-wide group-hover/name:text-[#f5d77f] transition-colors truncate">
              {name}
            </h4>
            {isVerified && (
              <span className="text-[#d4af37] flex-shrink-0" title="Verified Creator">
                <CheckCircle2 className="w-4 h-4 fill-[#d4af37] text-black" />
              </span>
            )}
          </Link>
          <p className="text-xs text-[#848496] mt-0.5 font-normal">
            {followers} followers
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold text-white mb-2.5">
            <span className="text-[#f5d77f] font-bold">${price.toFixed(2)}</span>
            <span className="text-[#848496] text-xs font-normal"> / month</span>
          </div>

          <button
            onClick={() => {
              if (onSubscribeClick) {
                onSubscribeClick({ id, name, handle, price });
              } else {
                window.location.href = `/creator/${handle}?subscribe=true`;
              }
            }}
            className="w-full py-2.5 rounded-xl gold-button text-xs font-bold tracking-wide shadow-gold-sm flex items-center justify-center gap-1"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}

