'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, ChevronRight, Bell, Shield, Sparkles, Crown } from 'lucide-react';

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileSidebar: () => void;
  role: 'ADMIN' | 'CREATOR' | 'SUBSCRIBER';
}

export default function PanelHeader({
  title,
  subtitle,
  onOpenMobileSidebar,
  role,
}: PanelHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-20 bg-[#08080a]/90 backdrop-blur-md border-b border-[#1c1c28] px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle Bar & Breadcrumb Title */}
      <div className="flex items-center gap-3">
        {/* Toggle Bar Button for Mobile */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-[#14141e] border border-[#272738] text-[#94a3b8] hover:text-white"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#717182] font-medium">
            <Link href="/" className="inline-flex items-center">
              <img
                src="/assets/the_mirage_logo.png"
                alt="The Mirage"
                className="h-4 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            </Link>
            <ChevronRight className="w-3 h-3 text-[#555568]" />
            <span className="text-[#d4af37] font-semibold">
              {role === 'ADMIN' ? 'Administration' : role === 'CREATOR' ? 'Creator Studio' : 'Subscriber Portal'}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Status Pill & Controls */}
      <div className="flex items-center gap-3">
        {role !== 'SUBSCRIBER' && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111118] border border-[#232332] text-xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[#a0a0b2] text-[11px] font-medium">
              {role === 'ADMIN' ? (
                <>Commission Rule: <strong className="text-[#f5d77f]">85/15 Active</strong></>
              ) : (
                <>Creator Revenue: <strong className="text-[#f5d77f]">85% Active</strong></>
              )}
            </span>
          </div>
        )}

        <Link
          href="/chat"
          className="p-2.5 rounded-xl bg-[#12121a] hover:bg-[#181824] border border-[#262638] text-[#94a3b8] hover:text-[#f5d77f] transition-colors relative"
          title="Direct Chat"
        >
          <span className="w-2 h-2 bg-[#d4af37] rounded-full absolute top-1.5 right-1.5"></span>
          <Bell className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}

