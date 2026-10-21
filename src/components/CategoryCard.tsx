'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Star, MapPin, Dumbbell, Coffee, Plane, Sparkles, AlertCircle, LayoutGrid } from 'lucide-react';

export interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  image: string;
}

export default function CategoryCard({ id, name, slug, iconName, image }: CategoryCardProps) {
  const getIcon = () => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-[#f5d77f]" />;
      case 'Star':
        return <Star className="w-5 h-5 text-[#f5d77f]" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5 text-[#f5d77f]" />;
      case 'Dumbbell':
        return <Dumbbell className="w-5 h-5 text-[#f5d77f]" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-[#f5d77f]" />;
      case 'Plane':
        return <Plane className="w-5 h-5 text-[#f5d77f]" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#f5d77f]" />;
      case 'AlertCircle':
        return (
          <span className="w-6 h-6 rounded-full border border-[#f5d77f] flex items-center justify-center text-[11px] font-bold text-[#f5d77f]">
            18+
          </span>
        );
      default:
        return <LayoutGrid className="w-5 h-5 text-[#f5d77f]" />;
    }
  };

  return (
    <Link
      href={`/explore?category=${encodeURIComponent(slug)}`}
      className="group relative h-28 sm:h-32 rounded-xl overflow-hidden border border-[#22222d] hover:border-[#d4af37]/60 transition-all duration-300 flex flex-col items-center justify-center p-3 text-center"
    >
      {/* Background Image with Dark Vignette */}
      <img
        src={image}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-45 group-hover:scale-110 transition-all duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/70 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-1.5">
        <div className="p-2 rounded-lg bg-black/40 backdrop-blur-md border border-[#d4af37]/20 group-hover:border-[#d4af37] transition-colors">
          {getIcon()}
        </div>
        <span className="text-xs font-semibold text-white group-hover:text-[#f5d77f] transition-colors tracking-wide">
          {name}
        </span>
      </div>
    </Link>
  );
}

