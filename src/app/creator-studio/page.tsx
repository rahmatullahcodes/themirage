'use client';

import React, { useState, useEffect } from 'react';
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
  CreditCard,
  Edit2,
  Archive,
  Filter,
  Check,
  AlertCircle,
} from 'lucide-react';
import { calculateCommission } from '@/lib/commission';
import PanelSidebar from '@/components/PanelSidebar';
import PanelHeader from '@/components/PanelHeader';

export default function CreatorStudioPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Upload Form State (Section 2 & 3 Requirements)
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [postTitle, setPostTitle] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [postVisibility, setPostVisibility] = useState<'PUBLIC' | 'SUBSCRIBER_ONLY' | 'PURCHASE_ONLY'>('PURCHASE_ONLY');
  const [postStatus, setPostStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [postPrice, setPostPrice] = useState('15.00');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Editing existing post price/status
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState('');

  // Monthly Price state
  const [monthlyPrice, setMonthlyPrice] = useState('9.99');
  const [priceSaveSuccess, setPriceSaveSuccess] = useState(false);

  // Custom Content Orders state
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

  // Feed posts (including individual paid content)
  const [feedPosts, setFeedPosts] = useState([
    {
      id: 'fp-1',
      type: 'image' as const,
      title: 'Luxury Villa Sunset Photoshoot (4K Set)',
      url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
      caption: 'Ultra high-definition exclusive studio photoshoot in Monaco.',
      visibility: 'PURCHASE_ONLY' as const,
      price: 15.00,
      status: 'PUBLISHED' as const,
      likes: 4610,
      date: '1 day ago',
    },
    {
      id: 'fp-2',
      type: 'video' as const,
      title: 'Paris Runway Fashion Week 4K Cinematic Film',
      url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
      caption: 'Full 18-minute backstage runway documentary & commentary.',
      visibility: 'PURCHASE_ONLY' as const,
      price: 24.99,
      status: 'PUBLISHED' as const,
      likes: 6120,
      date: '2 days ago',
    },
    {
      id: 'fp-3',
      type: 'image' as const,
      title: 'Backstage Photoshoot',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      caption: 'Exclusive backstage photoshoot session. Live for subscribers!',
      visibility: 'SUBSCRIBER_ONLY' as const,
      price: 0,
      status: 'PUBLISHED' as const,
      likes: 3820,
      date: '3 days ago',
    },
    {
      id: 'fp-4',
      type: 'image' as const,
      title: 'Paris Golden Hour Preview',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      caption: 'Free preview for everyone. Feeling grateful for all the love!',
      visibility: 'PUBLIC' as const,
      price: 0,
      status: 'PUBLISHED' as const,
      likes: 1240,
      date: '5 days ago',
    },
  ]);

  // Earnings Breakdown State (Section 7 Requirement)
  const [revenueFilter, setRevenueFilter] = useState<'ALL' | 'SUBSCRIPTIONS' | 'INDIVIDUAL' | 'CUSTOM'>('ALL');

  const subscriptionGross = 2840.00;
  const individualContentGross = 1280.00;
  const customOrdersGross = 160.00;
  const totalGross = subscriptionGross + individualContentGross + customOrdersGross;

  const totalCommission = calculateCommission(totalGross, 85);
  const subCommission = calculateCommission(subscriptionGross, 85);
  const indCommission = calculateCommission(individualContentGross, 85);
  const custCommission = calculateCommission(customOrdersGross, 85);

  const individualSalesOrders = [
    {
      ref: 'MIRAGE_PAY_99182',
      title: 'Luxury Villa Sunset Photoshoot (4K Set)',
      mediaType: 'IMAGE',
      buyer: 'alexmercer',
      gross: 15.00,
      creatorShare: 12.75, // 85%
      date: 'Oct 22, 2026',
      status: 'SUCCESS',
    },
    {
      ref: 'MIRAGE_PAY_88310',
      title: 'Paris Runway Fashion Week 4K Cinematic Film',
      mediaType: 'VIDEO',
      buyer: 'marcus_w',
      gross: 24.99,
      creatorShare: 21.24, // 85%
      date: 'Oct 21, 2026',
      status: 'SUCCESS',
    },
    {
      ref: 'MIRAGE_PAY_77491',
      title: 'Luxury Villa Sunset Photoshoot (4K Set)',
      mediaType: 'IMAGE',
      buyer: 'david_k',
      gross: 15.00,
      creatorShare: 12.75, // 85%
      date: 'Oct 20, 2026',
      status: 'SUCCESS',
    },
    {
      ref: 'MIRAGE_PAY_66238',
      title: 'Paris Runway Fashion Week 4K Cinematic Film',
      mediaType: 'VIDEO',
      buyer: 'liamv',
      gross: 24.99,
      creatorShare: 21.24, // 85%
      date: 'Oct 19, 2026',
      status: 'SUCCESS',
    },
  ];

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
    setUploadError('');

    if (!mediaUrl) {
      setUploadError('Please provide a media URL');
      return;
    }
    if (!rightsConfirmed) {
      setUploadError('You must confirm 100% rights and 18+ model consent.');
      return;
    }

    const price = postVisibility === 'PURCHASE_ONLY' ? parseFloat(postPrice) || 9.99 : 0;

    const newPost = {
      id: `fp-${Date.now()}`,
      type: mediaType,
      title: postTitle || (mediaType === 'VIDEO' ? 'Exclusive Video' : 'Exclusive Photo Set'),
      url: mediaUrl,
      caption: postCaption || 'Exclusive new update',
      visibility: postVisibility,
      price,
      status: postStatus,
      likes: 0,
      date: 'Just now',
    };

    setFeedPosts(prev => [newPost, ...prev]);
    setUploadSuccess(true);
    setTimeout(() => {
      setPostTitle('');
      setPostCaption('');
      setMediaUrl('');
      setThumbnailUrl('');
      setRightsConfirmed(false);
      setUploadSuccess(false);
      setActiveTab('feed');
    }, 1200);
  };

  const handleUpdatePrice = (postId: string) => {
    const p = parseFloat(editPriceInput);
    if (isNaN(p) || p <= 0) {
      alert('Please enter a valid price amount');
      return;
    }
    setFeedPosts(prev =>
      prev.map(post =>
        post.id === postId ? { ...post, price: p } : post
      )
    );
    setEditingPostId(null);
    setEditPriceInput('');
  };

  const handleToggleStatus = (postId: string) => {
    setFeedPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const nextStatus = post.status === 'PUBLISHED' ? ('DRAFT' as const) : ('PUBLISHED' as const);
          return { ...post, status: nextStatus };
        }
        return post;
      })
    );
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Creator Studio Dashboard';
      case 'upload':
        return 'Publish Individual Paid Media & Feed';
      case 'orders':
        return 'Personalised Paid Requests';
      case 'feed':
        return 'Content Feed & Price Manager';
      case 'earnings':
        return '85% Sales & Earnings Ledger';
      case 'subscribers':
        return 'Active Subscribers & Fans';
      case 'settings':
        return 'Subscription Pricing & Settings';
      default:
        return 'Creator Studio';
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex selection:bg-[#d4af37]/30 selection:text-white">
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
                <span>Total 85% Net Earnings</span>
                <DollarSign className="w-4 h-4 text-[#f5d77f]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#f5d77f]">
                ${totalCommission.creatorShare.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#555566] mt-1">
                Gross sales: ${totalCommission.grossAmount.toFixed(2)}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111117] border border-[#22222e]">
              <div className="flex justify-between items-center text-[#7e7e90] text-xs mb-2">
                <span>Individual Paid Sales</span>
                <CreditCard className="w-4 h-4 text-[#f5d77f]" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">
                ${indCommission.creatorShare.toFixed(2)}
              </div>
              <div className="text-[10px] text-green-400 mt-1">
                {individualSalesOrders.length} pay-per-view orders
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111117] border border-[#22222e]">
              <div className="flex justify-between items-center text-[#7e7e90] text-xs mb-2">
                <span>Active Subscribers</span>
                <Users className="w-4 h-4 text-[#f5d77f]" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">428</div>
              <div className="text-[10px] text-[#555566] mt-1">${subCommission.creatorShare.toFixed(2)} net recurring</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111117] border border-[#22222e]">
              <div className="flex justify-between items-center text-[#7e7e90] text-xs mb-2">
                <span>Custom Paid Requests</span>
                <Sparkles className="w-4 h-4 text-[#f5d77f]" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">{orders.length}</div>
              <div className="text-[10px] text-[#d4af37] mt-1">
                ${custCommission.creatorShare.toFixed(2)} net delivered
              </div>
            </div>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Actions Card */}
              <div className="p-6 rounded-2xl bg-[#111117] border border-[#22222e] space-y-4">
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#f5d77f]" />
                  Monetize Your Content
                </h3>
                <p className="text-xs text-[#8c8c9e] leading-relaxed">
                  Upload individual exclusive photos and 4K videos for direct sale, or publish subscriber-only moments to your recurring members.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setPostVisibility('PURCHASE_ONLY');
                      setActiveTab('upload');
                    }}
                    className="py-3 px-4 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-4 h-4" />
                    Sell Paid Image/Video
                  </button>
                  <button
                    onClick={() => {
                      setPostVisibility('SUBSCRIBER_ONLY');
                      setActiveTab('upload');
                    }}
                    className="py-3 px-4 rounded-xl bg-[#181824] hover:bg-[#202030] text-white border border-[#2c2c3c] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Crown className="w-4 h-4 text-[#f5d77f]" />
                    Post to Subscribers
                  </button>
                </div>
              </div>

              {/* Commission Summary Card */}
              <div className="p-6 rounded-2xl bg-[#111117] border border-[#22222e] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif font-bold text-white">The Mirage 85/15 Agreement</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 px-2 py-0.5 rounded-full bg-green-950/40 border border-green-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#8c8c9e] leading-relaxed">
                  You earn an industry-leading <strong className="text-white">85% of net revenues</strong> from all individual content purchases, subscriptions, and custom commissions.
                </p>
                <div className="p-3.5 rounded-xl bg-[#161622] flex items-center justify-between text-xs">
                  <span className="text-[#9fa3af]">Next Payout Cycle:</span>
                  <span className="text-[#f5d77f] font-semibold">Every Friday (Recorded Ledger)</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Upload Individual Paid Media & Feed (Sections 2 & 3 Requirements) */}
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#111118] border border-[#252536] space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-white">
                  Publish New Media (Photos & Videos)
                </h3>
                <p className="text-xs text-[#8c8c9e]">
                  Sell individual uncompressed images/videos independently or post to your subscriber feed.
                </p>
              </div>

              {uploadSuccess && (
                <div className="p-3.5 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Content uploaded and published successfully! Viewable in Content Manager.</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleCreatePost} className="space-y-4">
                {/* Media Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                    1. Media Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMediaType('IMAGE')}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        mediaType === 'IMAGE'
                          ? 'bg-[#181824] border-[#d4af37] text-[#f5d77f]'
                          : 'bg-[#14141e] border-[#252535] text-[#808092]'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      Individual Photo Set
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaType('VIDEO')}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        mediaType === 'VIDEO'
                          ? 'bg-[#181824] border-[#d4af37] text-[#f5d77f]'
                          : 'bg-[#14141e] border-[#252535] text-[#808092]'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      Individual Video (4K)
                    </button>
                  </div>
                </div>

                {/* Content Visibility & Monetization Model */}
                <div>
                  <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                    2. Monetization & Access Model
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPostVisibility('PURCHASE_ONLY')}
                      className={`py-2.5 px-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                        postVisibility === 'PURCHASE_ONLY'
                          ? 'bg-[#1e1a12] border-[#d4af37] text-[#f5d77f]'
                          : 'bg-[#14141e] border-[#252535] text-[#808092]'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Individual Paid (PPV)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPostVisibility('SUBSCRIBER_ONLY')}
                      className={`py-2.5 px-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                        postVisibility === 'SUBSCRIBER_ONLY'
                          ? 'bg-[#181824] border-[#d4af37] text-[#f5d77f]'
                          : 'bg-[#14141e] border-[#252535] text-[#808092]'
                      }`}
                    >
                      <Crown className="w-4 h-4" />
                      <span>Subscriber-Only</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPostVisibility('PUBLIC')}
                      className={`py-2.5 px-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                        postVisibility === 'PUBLIC'
                          ? 'bg-[#181824] border-[#d4af37] text-[#f5d77f]'
                          : 'bg-[#14141e] border-[#252535] text-[#808092]'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span>Free Preview</span>
                    </button>
                  </div>
                </div>

                {/* Individual Price Setting (When PURCHASE_ONLY) */}
                {postVisibility === 'PURCHASE_ONLY' && (
                  <div className="p-4 rounded-2xl bg-[#181824] border border-[#d4af37]/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-white">
                        Individual Content Price (USD)
                      </label>
                      <span className="text-[11px] text-[#f5d77f]">
                        You receive 85% ($
                        {((parseFloat(postPrice || '0') * 85) / 100).toFixed(2)})
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#7e7e90] font-bold">$</span>
                      <input
                        type="number"
                        step="0.50"
                        min="0.99"
                        max="299.00"
                        value={postPrice}
                        onChange={(e) => setPostPrice(e.target.value)}
                        placeholder="15.00"
                        className="w-full pl-8 pr-4 py-2.5 bg-[#12121a] border border-[#2e2e40] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <p className="text-[10px] text-[#78788c]">
                      Fans can unlock this media permanently without an ongoing subscription.
                    </p>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                    Content Title
                  </label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. Monaco Sunset Villa Exclusive Photoshoot"
                    className="w-full px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Media URL */}
                <div>
                  <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                    Original High-Resolution Media File URL (Protected)
                  </label>
                  <input
                    type="url"
                    required
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or S3 Bucket Object URL"
                    className="w-full px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                  <p className="text-[10px] text-[#717182] mt-1">
                    Non-buyers will never receive this URL directly; only buyers are authorized by the backend.
                  </p>
                </div>

                {/* Video Thumbnail (Optional / for Videos) */}
                {mediaType === 'VIDEO' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                      Video Poster / Thumbnail Preview URL
                    </label>
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... poster thumbnail"
                      className="w-full px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                )}

                {/* Caption */}
                <div>
                  <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                    Description & Backstory
                  </label>
                  <textarea
                    rows={2}
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    placeholder="Describe what makes this shoot or video exclusive..."
                    className="w-full px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Publication Status (Draft vs Published) */}
                <div>
                  <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                    Publication Status
                  </label>
                  <select
                    value={postStatus}
                    onChange={(e) => setPostStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="PUBLISHED">Published (Immediately Available)</option>
                    <option value="DRAFT">Draft (Save Without Publishing)</option>
                  </select>
                </div>

                {/* 18+ Rights Declaration Checkbox */}
                <div className="flex items-start gap-2 pt-2 text-xs text-[#9090a2]">
                  <input
                    type="checkbox"
                    id="rights"
                    checked={rightsConfirmed}
                    onChange={(e) => setRightsConfirmed(e.target.checked)}
                    className="mt-0.5 accent-[#d4af37]"
                  />
                  <label htmlFor="rights" className="leading-snug">
                    I certify under penalty of perjury that I am 18+, possess 100% legal ownership of this media, and hold signed 18+ model consent releases for all depicted individuals.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {postStatus === 'PUBLISHED' ? 'Publish for Sale Now' : 'Save as Draft'}
                </button>
              </form>
            </div>
          )}

          {/* Tab 3: Custom Content Requests (Section 13) */}
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

          {/* Tab 4: Content Feed & Price Manager (Section 2 & 3 Requirement) */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">Content Manager ({feedPosts.length} Items)</h3>
                  <p className="text-xs text-[#8c8c9e]">Manage individual pricing, draft/published status, and visibility.</p>
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-3.5 py-1.5 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload New Media
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {feedPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl bg-[#111117] border border-[#22222e] flex flex-col justify-between gap-3 shadow-lg">
                    <div className="flex gap-4">
                      <img src={post.url} alt={post.title} className="w-24 h-24 rounded-xl object-cover flex-shrink-0 bg-black" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          {post.visibility === 'PURCHASE_ONLY' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1e1a12] text-[#f5d77f] border border-[#d4af37]/40">
                              ${post.price.toFixed(2)} Pay-Per-View
                            </span>
                          ) : post.visibility === 'SUBSCRIBER_ONLY' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#181824] text-[#9da3af] border border-[#3b3b50]">
                              Subscriber-Only
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-950/60 text-green-400 border border-green-500/30">
                              Free Preview
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            post.status === 'PUBLISHED'
                              ? 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}>
                            {post.status}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white truncate">{post.title}</h4>
                        <p className="text-[11px] text-[#8e8e9e] line-clamp-2 mt-0.5">{post.caption}</p>
                      </div>
                    </div>

                    {/* Quick Edit Price / Status controls */}
                    <div className="flex items-center justify-between text-xs text-[#717182] pt-2 border-t border-[#1e1e28]">
                      {editingPostId === post.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="number"
                            step="0.50"
                            value={editPriceInput}
                            onChange={(e) => setEditPriceInput(e.target.value)}
                            placeholder="New Price..."
                            className="w-24 px-2 py-1 bg-[#181824] border border-[#d4af37]/50 rounded-lg text-xs text-white"
                          />
                          <button
                            onClick={() => handleUpdatePrice(post.id)}
                            className="p-1 rounded-md bg-[#d4af37] text-black font-bold"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPostId(null)}
                            className="p-1 rounded-md bg-[#252535] text-[#9fa3af]"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {post.visibility === 'PURCHASE_ONLY' && (
                              <button
                                onClick={() => {
                                  setEditingPostId(post.id);
                                  setEditPriceInput(post.price.toString());
                                }}
                                className="flex items-center gap-1 text-[11px] text-[#d4af37] hover:underline"
                              >
                                <Edit2 className="w-3 h-3" /> Edit Price
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleStatus(post.id)}
                              className="text-[11px] text-[#9fa3af] hover:text-white transition-colors"
                            >
                              {post.status === 'PUBLISHED' ? 'Set as Draft' : 'Publish'}
                            </button>
                          </div>
                          <span className="text-[10px] text-[#555566]">{post.date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: 85% Earnings & Reports (Section 7 Requirement) */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">85% Revenue Earnings Breakdown</h3>
                  <p className="text-xs text-[#8c8c9e]">Complete transparency: You receive 85% of net revenues from subscriptions, individual sales, and custom requests.</p>
                </div>

                {/* Revenue Type Filter */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#161622] border border-[#2b2b3a] text-xs">
                  <Filter className="w-3.5 h-3.5 text-[#d4af37] ml-2" />
                  <button
                    onClick={() => setRevenueFilter('ALL')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      revenueFilter === 'ALL' ? 'bg-[#d4af37] text-black font-bold' : 'text-[#8e8e9e] hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setRevenueFilter('INDIVIDUAL')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      revenueFilter === 'INDIVIDUAL' ? 'bg-[#d4af37] text-black font-bold' : 'text-[#8e8e9e] hover:text-white'
                    }`}
                  >
                    Individual Content
                  </button>
                  <button
                    onClick={() => setRevenueFilter('SUBSCRIPTIONS')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      revenueFilter === 'SUBSCRIPTIONS' ? 'bg-[#d4af37] text-black font-bold' : 'text-[#8e8e9e] hover:text-white'
                    }`}
                  >
                    Subscriptions
                  </button>
                </div>
              </div>

              {/* 3 Segregated Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Subscription Revenue */}
                <div className="p-5 rounded-2xl bg-[#111117] border border-[#22222e] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8e8e9e]">
                    <span>Subscription Revenue</span>
                    <Crown className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-white">
                    ${subCommission.creatorShare.toFixed(2)}
                    <span className="text-xs text-[#6e6e80] font-sans font-normal"> (85% net)</span>
                  </div>
                  <p className="text-[11px] text-[#717182]">Gross: ${subscriptionGross.toFixed(2)} • 428 Members</p>
                </div>

                {/* 2. Individual Content Sales (Section 7 Requirement) */}
                <div className="p-5 rounded-2xl bg-[#111117] border border-[#d4af37]/40 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#f5d77f]">
                    <span className="font-bold">Individual Paid Content</span>
                    <CreditCard className="w-4 h-4 text-[#f5d77f]" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-[#f5d77f]">
                    ${indCommission.creatorShare.toFixed(2)}
                    <span className="text-xs text-[#a0821e] font-sans font-normal"> (85% net)</span>
                  </div>
                  <p className="text-[11px] text-[#717182]">Gross: ${individualContentGross.toFixed(2)} • {individualSalesOrders.length} Paid Purchases</p>
                </div>

                {/* 3. Custom Content Requests */}
                <div className="p-5 rounded-2xl bg-[#111117] border border-[#22222e] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8e8e9e]">
                    <span>Custom Requests</span>
                    <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-white">
                    ${custCommission.creatorShare.toFixed(2)}
                    <span className="text-xs text-[#6e6e80] font-sans font-normal"> (85% net)</span>
                  </div>
                  <p className="text-[11px] text-[#717182]">Gross: ${customOrdersGross.toFixed(2)} • 2 Delivered Clips</p>
                </div>
              </div>

              {/* Individual Content Sales Orders Ledger Table */}
              <div className="p-6 rounded-2xl bg-[#111118] border border-[#232330] space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-white">
                    Individual Content Sales Ledger (Pay-Per-View)
                  </h4>
                  <span className="text-xs text-[#d4af37] font-semibold">
                    Configured Split: 85% Creator / 15% Platform
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                      <tr>
                        <th className="py-3 px-4">Order Reference</th>
                        <th className="py-3 px-4">Content Title</th>
                        <th className="py-3 px-4">Media</th>
                        <th className="py-3 px-4">Buyer</th>
                        <th className="py-3 px-4">Price Paid</th>
                        <th className="py-3 px-4">Your 85% Net</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e28] text-white">
                      {individualSalesOrders.map((sale) => (
                        <tr key={sale.ref} className="hover:bg-[#161622]/40">
                          <td className="py-3.5 px-4 font-mono text-[#d4af37] font-semibold">{sale.ref}</td>
                          <td className="py-3.5 px-4 font-bold">{sale.title}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#181824] border border-[#2b2b3d]">
                              {sale.mediaType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#94a3b8]">@{sale.buyer}</td>
                          <td className="py-3.5 px-4 font-bold">${sale.gross.toFixed(2)}</td>
                          <td className="py-3.5 px-4 font-bold text-green-400">${sale.creatorShare.toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-[#717182]">{sale.date}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-950/60 text-green-400 border border-green-500/30">
                              {sale.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-[#6e6e80] pt-2 border-t border-[#1c1c28]">
                  * Withdrawable balances are processed on weekly scheduled payout batches subject to identity verification.
                </p>
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
                        <td className="py-3.5 px-4 font-bold text-[#f5d77f]">{sub.totalSpent}</td>
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/chat?creator=${encodeURIComponent(sub.handle)}`}
                            className="text-xs text-[#d4af37] hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Message
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 7: Monthly Subscription Pricing & Settings */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#111118] border border-[#252536] space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Subscription Pricing</h3>
                <p className="text-xs text-[#8c8c9e]">
                  Configure your non-tiered monthly subscription price. Standard pricing ranges between $4.99 and $49.99/mo.
                </p>
              </div>

              {priceSaveSuccess && (
                <div className="p-3.5 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Monthly price updated successfully!</span>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); setPriceSaveSuccess(true); setTimeout(() => setPriceSaveSuccess(false), 2000); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                    Monthly Subscription Price (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#7e7e90] font-bold">$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="4.99"
                      max="99.99"
                      value={monthlyPrice}
                      onChange={(e) => setMonthlyPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#181824] border border-[#2b2b3c] space-y-2 text-xs text-[#9da3af]">
                  <div className="flex justify-between">
                    <span>Subscriber Pays:</span>
                    <span className="font-bold text-white">${parseFloat(monthlyPrice || '0').toFixed(2)}/mo</span>
                  </div>
                  <div className="flex justify-between text-green-400 font-semibold">
                    <span>Your 85% Cut:</span>
                    <span>${((parseFloat(monthlyPrice || '0') * 85) / 100).toFixed(2)}/mo</span>
                  </div>
                  <div className="flex justify-between text-[#7c7c90]">
                    <span>Platform 15% Cut:</span>
                    <span>${((parseFloat(monthlyPrice || '0') * 15) / 100).toFixed(2)}/mo</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm"
                >
                  Save Subscription Price
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
