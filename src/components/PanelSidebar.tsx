'use client';

import React from 'react';
import Link from 'next/link';
import {
  Crown,
  LayoutDashboard,
  Users,
  CreditCard,
  AlertTriangle,
  Settings,
  Upload,
  Sparkles,
  Grid,
  DollarSign,
  Heart,
  Lock,
  MessageSquare,
  Globe,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sliders,
  Activity,
  Compass,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface PanelSidebarProps {
  role: 'ADMIN' | 'CREATOR' | 'SUBSCRIBER';
  activeTab: string;
  onSelectTab: (id: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  userName?: string;
  userHandle?: string;
}

export default function PanelSidebar({
  role,
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  userName = 'User',
  userHandle = '@user',
}: PanelSidebarProps) {
  // Navigation menus based on user role
  const adminNav: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'creators', label: 'Creators & Verification', icon: Crown, badge: '4', badgeColor: 'bg-[#d4af37]/20 text-[#f5d77f]' },
    { id: 'users', label: 'User Accounts', icon: Users, badge: 'Active', badgeColor: 'bg-green-950/60 text-green-400' },
    { id: 'transactions', label: 'Transactions & Split', icon: CreditCard, badge: '85/15', badgeColor: 'bg-[#181826] text-[#cbd5e1]' },
    { id: 'moderation', label: 'Content Moderation', icon: AlertTriangle, badge: '2', badgeColor: 'bg-yellow-950/60 text-yellow-400' },
    { id: 'settings', label: 'Commission Config', icon: Sliders },
  ];

  const creatorNav: NavItem[] = [
    { id: 'overview', label: 'Studio Overview', icon: LayoutDashboard },
    { id: 'upload', label: 'Publish New Post', icon: Upload, badge: 'New', badgeColor: 'bg-[#d4af37]/20 text-[#f5d77f]' },
    { id: 'orders', label: 'Custom Requests', icon: Sparkles, badge: 'Pending', badgeColor: 'bg-yellow-950/60 text-yellow-400' },
    { id: 'feed', label: 'Content Manager', icon: Grid },
    { id: 'earnings', label: '85% Earnings & Reports', icon: DollarSign, badge: '$3,638', badgeColor: 'bg-green-950/60 text-green-400' },
    { id: 'subscribers', label: 'Subscribers & Fans', icon: Users, badge: '428', badgeColor: 'bg-[#181826] text-white' },
    { id: 'settings', label: 'Subscription Price', icon: Settings },
  ];

  const subscriberNav: NavItem[] = [
    { id: 'subscriptions', label: 'My Subscriptions', icon: Crown, badge: '2 Active', badgeColor: 'bg-green-950/60 text-green-400' },
    { id: 'purchases', label: 'Private Content Vault', icon: Lock, badge: 'Protected', badgeColor: 'bg-[#d4af37]/20 text-[#f5d77f]' },
    { id: 'followed', label: 'Followed Creators', icon: Heart },
    { id: 'transactions', label: 'Billing & Invoices', icon: CreditCard },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  const currentNav = role === 'ADMIN' ? adminNav : role === 'CREATOR' ? creatorNav : subscriberNav;

  const panelBadge =
    role === 'ADMIN'
      ? { title: 'Admin Portal', color: 'border-red-500/40 text-red-400 bg-red-950/30' }
      : role === 'CREATOR'
      ? { title: 'Creator Studio', color: 'border-[#d4af37]/40 text-[#f5d77f] bg-[#d4af37]/10' }
      : { title: 'Subscriber Vault', color: 'border-blue-500/40 text-blue-400 bg-blue-950/30' };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0b0b10] border-r border-[#1e1e28] transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand & Toggle Header */}
        <div className="h-20 px-4 flex items-center justify-between border-b border-[#1c1c28]">
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
            {!collapsed ? (
              <div className="flex flex-col gap-1 min-w-0">
                <img
                  src="/assets/the_mirage_logo.png"
                  alt="The Mirage"
                  className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
                />
                <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border w-fit ${panelBadge.color}`}>
                  {panelBadge.title}
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#0e0e14] border border-[#d4af37]/40 flex items-center justify-center p-1 shadow-gold-sm flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src="/assets/the_mirage_logo.png"
                  alt="The Mirage"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </Link>

          {/* Desktop Toggle Bar Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg bg-[#14141e] hover:bg-[#1a1a26] text-[#8e8e9e] hover:text-white border border-[#272738] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card */}
        <div className={`p-4 border-b border-[#1c1c28] ${collapsed ? 'text-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#aa820a] p-0.5 flex-shrink-0 shadow-gold-sm">
              <div className="w-full h-full bg-[#121218] rounded-full flex items-center justify-center text-xs font-bold text-[#f5d77f]">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">{userName}</div>
                <div className="text-[11px] text-[#717182] truncate">{userHandle}</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 text-white border border-[#d4af37]/40 shadow-gold-sm'
                    : 'text-[#8a8a9e] hover:text-white hover:bg-[#151520]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-[#f5d77f]' : 'text-[#717182] group-hover:text-white'
                  }`}
                />

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between text-left truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor || 'bg-[#1e1e2c] text-[#cbd5e1]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Portal Jump / Footer Actions */}
        <div className="p-3 border-t border-[#1c1c28] space-y-2">
          <Link
            href="/chat"
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8a8a9e] hover:text-white hover:bg-[#151520] transition-colors"
            title="1-on-1 Messages"
          >
            <MessageSquare className="w-4 h-4 text-[#d4af37] flex-shrink-0" />
            {!collapsed && <span className="truncate">Direct Messages</span>}
          </Link>

          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8a8a9e] hover:text-white hover:bg-[#151520] transition-colors"
            title="Public Homepage"
          >
            <Globe className="w-4 h-4 text-[#8a8a9e] flex-shrink-0" />
            {!collapsed && <span className="truncate">Public Homepage</span>}
          </Link>

          <button
            onClick={() => {
              localStorage.removeItem('mirage_token');
              localStorage.removeItem('mirage_user');
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/30 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

