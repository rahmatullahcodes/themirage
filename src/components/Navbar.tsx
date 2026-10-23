'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Crown,
  LogOut,
  LayoutDashboard,
  Shield,
  Sparkles,
  MessageSquare,
  Bell,
  CheckCircle2,
  Menu,
  X,
  CreditCard,
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string; role: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 'n1',
      title: 'Subscription Active',
      desc: 'You have full access to Luna Rae exclusive feed.',
      time: '10m ago',
      type: 'sub',
    },
    {
      id: 'n2',
      title: 'Custom Order Delivered',
      desc: 'Luna Rae delivered your 2-min VIP birthday clip.',
      time: '1h ago',
      type: 'order',
    },
    {
      id: 'n3',
      title: 'New Message',
      desc: 'Luna Rae sent you a new direct message.',
      time: '2h ago',
      type: 'chat',
    },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('mirage_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mirage_token');
    localStorage.removeItem('mirage_user');
    setUser(null);
    router.push('/');
    window.location.reload();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#08080a]/90 backdrop-blur-md border-b border-[#22222a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group">
          <img
            src="/assets/the_mirage_logo.png"
            alt="The Mirage"
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-white hover:text-[#d4af37] transition-colors">
            Home
          </Link>
          <Link href="/explore" className="text-sm font-medium text-[#94a3b8] hover:text-[#d4af37] transition-colors">
            Explore
          </Link>
          <Link href="/creators" className="text-sm font-medium text-[#94a3b8] hover:text-[#d4af37] transition-colors">
            Creators
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-[#94a3b8] hover:text-[#d4af37] transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium text-[#94a3b8] hover:text-[#d4af37] transition-colors">
            About
          </Link>
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs relative mx-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#64748b]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators, tags..."
            className="w-full pl-10 pr-4 py-2 bg-[#121217] border border-[#2a2a36] rounded-full text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
          />
        </form>

        {/* Right CTA / Auth Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 relative">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-full bg-[#14141a] border border-[#2a2a36] text-[#94a3b8] hover:text-[#f5d77f] hover:border-[#d4af37]/40 transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#d4af37] rounded-full"></span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-[#12121a] border border-[#d4af37]/40 rounded-2xl p-4 shadow-2xl z-50 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#20202e]">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Notifications
                      </span>
                      <span className="text-[10px] text-[#f5d77f] font-semibold">3 Unread</span>
                    </div>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-[#171722] hover:bg-[#1d1d2b] transition-colors">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-bold text-white">{n.title}</span>
                            <span className="text-[10px] text-[#717182]">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-[#94a3b8]">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Button */}
              <Link
                href="/chat"
                className="p-2.5 rounded-full bg-[#14141a] border border-[#2a2a36] text-[#94a3b8] hover:text-[#f5d77f] hover:border-[#d4af37]/40 transition-colors relative"
                title="Direct Messages"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#d4af37] rounded-full animate-pulse"></span>
              </Link>

              {user.role === 'CREATOR' && (
                <Link
                  href="/creator-studio"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#1b1b24] border border-[#d4af37]/40 text-[#f5d77f] hover:bg-[#d4af37]/10 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Studio
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#201515] border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}

              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[#16161d] border border-[#2e2e3c] text-white hover:border-[#d4af37] transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#d4af37]" />
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-xs text-[#94a3b8] hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-semibold rounded-full text-white bg-[#14141a] border border-[#2a2a36] hover:border-[#d4af37]/60 hover:text-[#f5d77f] transition-all"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 text-sm font-semibold rounded-full gold-button shadow-gold-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#94a3b8] hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0e0e13] border-b border-[#262633] px-4 pt-2 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators..."
              className="w-full px-4 py-2 bg-[#16161e] border border-[#2a2a38] rounded-lg text-sm text-white"
            />
          </form>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-2 text-white font-medium hover:text-[#d4af37]"
          >
            Home
          </Link>
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-2 text-[#94a3b8] font-medium hover:text-[#d4af37]"
          >
            Explore
          </Link>
          <Link
            href="/creators"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-2 text-[#94a3b8] font-medium hover:text-[#d4af37]"
          >
            Creators
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-2 text-[#94a3b8] font-medium hover:text-[#d4af37]"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm py-2 text-[#94a3b8] font-medium hover:text-[#d4af37]"
          >
            About
          </Link>

          <div className="pt-4 border-t border-[#20202a] flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-center text-sm font-semibold rounded-lg bg-[#1a1a24] text-white"
                >
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-center text-sm font-semibold rounded-lg text-red-400 bg-[#251515]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-center text-sm font-semibold rounded-lg border border-[#2e2e3c] text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-center text-sm font-semibold rounded-lg gold-button"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
