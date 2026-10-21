'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  Sparkles,
  Upload,
  DollarSign,
  Users,
  Eye,
  Image as ImageIcon,
  Video,
  Lock,
  Globe,
  CheckCircle2,
  Send,
  MessageSquare,
  Settings,
  Grid,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { calculateCommission } from '@/lib/commission';
import PanelSidebar from '@/components/PanelSidebar';
import PanelHeader from '@/components/PanelHeader';

export default function CreatorStudioPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Financial Stats
  const earningsGross = 4280.00;
  const commission = calculateCommission(earningsGross, 85);

  // New post form state
  const [postCaption, setPostCaption] = useState('');
  const [postVisibility, setPostVisibility] = useState<'PUBLIC' | 'SUBSCRIBER_ONLY'>('SUBSCRIBER_ONLY');
  const [mediaUrl, setMediaUrl] = useState('');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Monthly Price state
  const [monthlyPrice, setMonthlyPrice] = useState('9.99');
  const [priceSaveSuccess, setPriceSaveSuccess] = useState(false);

  // Custom Content Orders state (Section 13 requirement)
  const [orders, setOrders] = useState([
    {
      id: 'req-201',
      customerName: 'Alex Mercer',
      title: 'Birthday Video Shoutout for Sarah',
      price: 50.00,
      status: 'AWAITING_DELIVERY',
      requestedAt: 'Oct 20, 2026',
    },
    {
      id: 'req-202',
      customerName: 'Marcus Wright',
      title: 'Private Fitness Nutrition Advice Clip',
      price: 35.00,
      status: 'DELIVERED',
      requestedAt: 'Oct 18, 2026',
    },
  ]);

  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [deliveryFileUrl, setDeliveryFileUrl] = useState('');

  // Feed posts
  const [feedPosts, setFeedPosts] = useState([
    {
      id: 'fp-1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      caption: 'Golden hour in Paris. Full photoshoot set live for subscribers! ✨',
      visibility: 'SUBSCRIBER_ONLY',
      likes: 1240,
      date: '2h ago',
    },
    {
      id: 'fp-2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      caption: 'Free preview for everyone. More coming soon!',
      visibility: 'PUBLIC',
      likes: 850,
      date: '1d ago',
    },
  ]);

  // Subscribers
  const subscribers = [
    { id: 's1', name: 'Alex Mercer', handle: '@alexmercer', status: 'ACTIVE', joined: 'Oct 12, 2026', totalSpent: '$85.00' },
    { id: 's2', name: 'Marcus Wright', handle: '@marcus_w', status: 'ACTIVE', joined: 'Oct 14, 2026', totalSpent: '$44.99' },
    { id: 's3', name: 'David Kim', handle: '@david_k', status: 'ACTIVE', joined: 'Oct 16, 2026', totalSpent: '$19.98' },
    { id: 's4', name: 'Liam Vance', handle: '@liamv', status: 'ACTIVE', joined: 'Oct 18, 2026', totalSpent: '$9.99' },
  ];

  const handleDeliverOrder = (orderId: string) => {
    if (!deliveryFileUrl) {
      alert('Please enter or select a private delivery media URL');
      return;
    }
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, status: 'DELIVERED' } : o
      )
    );
    setDeliveringOrderId(null);
    setDeliveryFileUrl('');
    alert('Custom content successfully delivered to customer vault!');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) {
      alert('Please provide a media URL');
      return;
    }
    if (!rightsConfirmed) {
      alert('You must confirm that you possess 100% rights and 18+ model consent for this media.');
      return;
    }

    const newPost = {
      id: `fp-${Date.now()}`,
      type: 'image',
      url: mediaUrl,
      caption: postCaption || 'Exclusive new update',
      visibility: postVisibility,
      likes: 0,
      date: 'Just now',
    };

    setFeedPosts(prev => [newPost, ...prev]);
    setUploadSuccess(true);
    setTimeout(() => {
      setPostCaption('');
      setMediaUrl('');
      setRightsConfirmed(false);
      setUploadSuccess(false);
      setActiveTab('feed');
    }, 1200);
  };

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    setPriceSaveSuccess(true);
    setTimeout(() => setPriceSaveSuccess(false), 2000);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Creator Studio Dashboard';
      case 'upload':
        return 'Publish & Upload Content';
      case 'orders':
        return 'Personalised Paid Requests';
      case 'feed':
        return 'Content Feed Manager';
      case 'earnings':
        return '85% Earnings & Payout Ledger';
      case 'subscribers':
        return 'Active Subscribers & Fans';
      case 'settings':
        return 'Subscription Pricing & Settings';
      default:
        return 'Creator Studio';
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex">
      {/* Sidebar with Toggle Bar */}
      <PanelSidebar
        role="CREATOR"
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        userName="Luna Rae"
        userHandle="@luna-rae"
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <PanelHeader
          title={getTabTitle()}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          role="CREATOR"
        />

        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* 4 Financial & Engagement KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#111117] border border-[#22222e]">
              <div className="flex justify-between items-center text-[#7e7e90] text-xs mb-2">
                <span>Your 85% Earnings</span>
                <DollarSign className="w-4 h-4 text-[#f5d77f]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#f5d77f]">
                ${commission.creatorShare.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#555566] mt-1">
                Gross sales: ${commission.grossAmount.toFixed(2)}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111117] border border-[#22222e]">
              <div className="flex justify-between items-center text-[#7e7e90] text-xs mb-2">
                <span>Active Subscribers</span>
                <Users className="w-4 h-4 text-[#f5d77f]" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">428</div>
              <div className="text-[10px] text-green-400 mt-1">+14 this week</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111117] border border-[#22222e]">
              <div className="flex justify-between items-center text-[#7e7e90] text-xs mb-2">
                <span>Followers Reach</span>
                <Eye className="w-4 h-4 text-[#f5d77f]" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">128.4K</div>
              <div className="text-[10px] text-[#555566] mt-1">Public profile reach</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111117] border border-[#22222e]">
              <div className="flex justify-between items-center text-[#7e7e90] text-xs mb-2">
                <span>Custom Paid Requests</span>
                <Sparkles className="w-4 h-4 text-[#f5d77f]" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">{orders.length}</div>
              <div className="text-[10px] text-[#d4af37] mt-1">
                {orders.filter(o => o.status === 'AWAITING_DELIVERY').length} pending delivery
              </div>
            </div>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#111117] border border-[#232332] space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#f5d77f]" />
                  The Mirage 85/15 Revenue Agreement
                </h3>
                <p className="text-xs text-[#8c8c9e] leading-relaxed">
                  As a creator on The Mirage, you earn <span className="text-[#f5d77f] font-bold">85%</span> of all subscription revenues and custom private commissions. The platform retains a 15% operational fee.
                </p>
                <div className="p-3.5 rounded-xl bg-[#161622] border border-[#262638] text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#848496]">Creator Split:</span>
                    <span className="text-green-400 font-bold">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848496]">Platform Fee:</span>
                    <span className="text-white">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848496]">Current Balance:</span>
                    <span className="text-[#f5d77f] font-bold">${commission.creatorShare.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111117] border border-[#232332] space-y-4">
                <h3 className="text-sm font-bold text-white">Quick Creator Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="p-4 rounded-xl bg-[#161622] hover:bg-[#1c1c2a] border border-[#272738] text-center block transition-colors"
                  >
                    <Upload className="w-5 h-5 text-[#f5d77f] mx-auto mb-1.5" />
                    <span className="text-xs font-semibold text-white block">New Post</span>
                    <span className="text-[10px] text-[#717182]">Photo / Video</span>
                  </button>
                  <Link
                    href="/chat"
                    className="p-4 rounded-xl bg-[#161622] hover:bg-[#1c1c2a] border border-[#272738] text-center block transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-[#f5d77f] mx-auto mb-1.5" />
                    <span className="text-xs font-semibold text-white block">Messages</span>
                    <span className="text-[10px] text-[#717182]">1-on-1 Chat</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Upload New Content */}
          {activeTab === 'upload' && (
            <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#111118] border border-[#252536] space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Create New Feed Post</h3>
                <p className="text-xs text-[#8c8c9e]">
                  Publish content to your public preview feed or restrict it to paying subscribers.
                </p>
              </div>

              {uploadSuccess && (
                <div className="p-3.5 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Post published successfully to your feed!</span>
                </div>
              )}

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                    Content Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPostVisibility('SUBSCRIBER_ONLY')}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        postVisibility === 'SUBSCRIBER_ONLY'
                          ? 'bg-[#181824] border-[#d4af37] text-[#f5d77f]'
                          : 'bg-[#14141e] border-[#252535] text-[#808092]'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      Subscriber-Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostVisibility('PUBLIC')}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        postVisibility === 'PUBLIC'
                          ? 'bg-[#181824] border-[#d4af37] text-[#f5d77f]'
                          : 'bg-[#14141e] border-[#252535] text-[#808092]'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      Public Preview
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                    Media URL (High-Res Image or Video File)
                  </label>
                  <input
                    type="url"
                    required
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or S3 Object URL"
                    className="w-full px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                    Caption & Tags
                  </label>
                  <textarea
                    rows={3}
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    placeholder="Write a message for your subscribers..."
                    className="w-full px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Section 7 Content Rights Confirmation */}
                <div className="flex items-start gap-2 pt-1 text-xs text-[#9090a2]">
                  <input
                    type="checkbox"
                    id="rights"
                    checked={rightsConfirmed}
                    onChange={(e) => setRightsConfirmed(e.target.checked)}
                    className="mt-0.5 accent-[#d4af37]"
                  />
                  <label htmlFor="rights" className="leading-snug">
                    I certify under penalty of perjury that I am 18+, own 100% rights to this media, and hold written consent releases for all depicted individuals.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Publish Post Now
                </button>
              </form>
            </div>
          )}

          {/* Tab 3: Paid Custom Content Orders (Section 13) */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white">
                  Personalised Custom Orders
                </h3>
                <p className="text-xs text-[#8c8c9e]">
                  Private paid requests ordered by subscribers through 1-on-1 chat. Deliver directly to their encrypted vault.
                </p>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-[#111117] border border-[#262636] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{order.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-950/60 text-green-400 border border-green-500/30'
                            : 'bg-[#291f08] text-[#f5d77f] border border-[#d4af37]/40'
                        }`}>
                          {order.status === 'DELIVERED' ? 'Delivered' : 'Awaiting Your Delivery'}
                        </span>
                      </div>
                      <p className="text-xs text-[#8a8a9e]">
                        Customer: <span className="text-white font-medium">{order.customerName}</span> • Agreed Price: <span className="text-[#f5d77f] font-bold">${order.price.toFixed(2)}</span>
                      </p>
                      <p className="text-[10px] text-[#555566]">Requested: {order.requestedAt}</p>
                    </div>

                    <div>
                      {order.status === 'DELIVERED' ? (
                        <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Completed & Paid
                        </span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {deliveringOrderId === order.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="url"
                                value={deliveryFileUrl}
                                onChange={(e) => setDeliveryFileUrl(e.target.value)}
                                placeholder="Private file URL..."
                                className="px-3 py-1.5 bg-[#181824] border border-[#2e2e3e] rounded-lg text-xs text-white"
                              />
                              <button
                                onClick={() => handleDeliverOrder(order.id)}
                                className="px-3 py-1.5 rounded-lg gold-button text-xs font-bold"
                              >
                                Send
                              </button>
                              <button
                                onClick={() => setDeliveringOrderId(null)}
                                className="px-2 py-1.5 text-xs text-[#808090]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setDeliveringOrderId(order.id);
                                setDeliveryFileUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80');
                              }}
                              className="px-4 py-2 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center gap-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Deliver Custom Media
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Content Feed Manager */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">Published Posts ({feedPosts.length})</h3>
                  <p className="text-xs text-[#8c8c9e]">Manage active posts, lock states, and subscriber-only settings.</p>
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-3.5 py-1.5 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {feedPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl bg-[#111117] border border-[#22222e] flex gap-4">
                    <img src={post.url} alt="Post" className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            post.visibility === 'SUBSCRIBER_ONLY'
                              ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/30'
                              : 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                          }`}>
                            {post.visibility === 'SUBSCRIBER_ONLY' ? 'Subscriber-Only' : 'Public'}
                          </span>
                          <span className="text-[10px] text-[#717182]">{post.date}</span>
                        </div>
                        <p className="text-xs text-white truncate">{post.caption}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#717182] pt-2 border-t border-[#1e1e28]">
                        <span className="flex items-center gap-1 text-red-400">
                          <Heart className="w-3.5 h-3.5 fill-current" /> {post.likes}
                        </span>
                        <span className="text-[10px] text-green-400 font-semibold">Active Live</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: 85% Earnings & Reports */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-white">85% Revenue Earnings Breakdown</h3>
                <p className="text-xs text-[#8c8c9e]">Complete transparency: You receive 85% of net revenues from subscriptions and custom requests.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#111118] border border-[#2a2a3a] space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-[#20202e]">
                  <div>
                    <span className="text-xs text-[#848496]">Net Available Balance</span>
                    <div className="text-3xl font-serif font-bold text-[#f5d77f]">
                      ${commission.creatorShare.toFixed(2)}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-950/60 text-green-400 border border-green-500/30 text-xs font-bold">
                    85% Direct Creator Cut
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#161622]">
                    <span className="text-[#848496]">Total Gross Sales:</span>
                    <div className="text-base font-bold text-white mt-1">${earningsGross.toFixed(2)}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#161622]">
                    <span className="text-[#848496]">Your 85% Cut:</span>
                    <div className="text-base font-bold text-green-400 mt-1">${commission.creatorShare.toFixed(2)}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#161622]">
                    <span className="text-[#848496]">Platform 15% Cut:</span>
                    <div className="text-base font-bold text-[#a0a0b2] mt-1">${commission.platformShare.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Subscribers & Fans */}
          {activeTab === 'subscribers' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white">Subscriber List</h3>
                <p className="text-xs text-[#8c8c9e]">Active members currently subscribed to your monthly plan.</p>
              </div>

              <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                    <tr>
                      <th className="py-3 px-4">Subscriber</th>
                      <th className="py-3 px-4">Handle</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4">Total Value</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e28] text-white">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#161622]/40">
                        <td className="py-3.5 px-4 font-bold">{sub.name}</td>
                        <td className="py-3.5 px-4 font-mono text-[#94a3b8]">{sub.handle}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-950/60 text-green-400 border border-green-500/30">
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#717182]">{sub.joined}</td>
                        <td className="py-3.5 px-4 text-[#f5d77f] font-bold">{sub.totalSpent}</td>
                        <td className="py-3.5 px-4">
                          <Link
                            href="/chat"
                            className="px-2.5 py-1 rounded bg-[#181824] hover:bg-[#202030] text-[10px] font-semibold text-white border border-[#2f2f40]"
                          >
                            Chat
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 7: Subscription Pricing */}
          {activeTab === 'settings' && (
            <div className="max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#111118] border border-[#d4af37]/30 space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Crown className="w-4 h-4 text-[#f5d77f]" />
                  Subscription Plan Pricing
                </h3>
                <p className="text-xs text-[#8c8c9e] mt-1">
                  Set your monthly subscription price. Subscribers pay this amount to unlock all your exclusive content.
                </p>
              </div>

              {priceSaveSuccess && (
                <div className="p-3 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Subscription price updated! Fans will now see ${monthlyPrice}/mo.</span>
                </div>
              )}

              <form onSubmit={handleSavePrice} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b2] mb-1">
                    Monthly Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.99"
                    max="99.99"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#181824] border border-[#2d2d3e] rounded-xl text-sm text-white font-bold"
                  />
                  <div className="p-3 rounded-xl bg-[#14141e] border border-[#22222e] text-[11px] text-[#8e8e9e] mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>You Keep (85%):</span>
                      <span className="text-[#f5d77f] font-bold">${((parseFloat(monthlyPrice) || 0) * 0.85).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee (15%):</span>
                      <span>${((parseFloat(monthlyPrice) || 0) * 0.15).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm"
                >
                  Save Monthly Price
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
