'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Heart,
  CreditCard,
  MessageSquare,
  Lock,
  Clock,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Calendar,
  LogOut,
  ExternalLink,
  Settings,
  Shield,
  User,
  Play,
  Image as ImageIcon,
  Video,
  X,
  Eye,
  Filter,
} from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';
import PanelHeader from '@/components/PanelHeader';

interface PurchasedItem {
  id: string;
  postId?: string;
  title: string;
  creatorName: string;
  creatorHandle: string;
  price: number;
  mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO';
  accessUrl: string;
  thumbnailUrl: string;
  purchasedAt: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; username: string; email: string; role: string } | null>(null);

  // Vault / My Purchases state
  const [vaultItems, setVaultItems] = useState<PurchasedItem[]>([]);
  const [vaultLoading, setVaultLoading] = useState(true);
  const [vaultFilter, setVaultFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [activeMediaModal, setActiveMediaModal] = useState<PurchasedItem | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mirage_user');
    let currentUser = {
      id: 'usr-1',
      name: 'Alex Mercer',
      username: 'alexmercer',
      email: 'subscriber@themirage.vip',
      role: 'SUBSCRIBER',
    };
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
      } catch (e) {}
    }
    setUser(currentUser);
    fetchPurchases(currentUser.id);
  }, []);

  const fetchPurchases = async (userId: string) => {
    setVaultLoading(true);
    try {
      const res = await fetch(`/api/user/purchases?userId=${userId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.purchases)) {
        // Also combine with initial custom delivered orders for complete vault
        const combined = [
          ...data.purchases,
          {
            id: 'pur-custom-1',
            title: 'Custom VIP Video Shoutout & Q&A',
            creatorName: 'Luna Rae',
            creatorHandle: 'luna-rae',
            price: 45.00,
            mediaType: 'VIDEO' as const,
            accessUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
            purchasedAt: '2026-10-20T14:10:00Z',
          },
        ];
        setVaultItems(combined);
      }
    } catch (e) {
      console.error('Failed to load purchases:', e);
    } finally {
      setVaultLoading(false);
    }
  };

  // Demo active subscriptions
  const subscriptions = [
    {
      id: 'sub-1',
      creatorName: 'Luna Rae',
      creatorHandle: 'luna-rae',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      price: 9.99,
      status: 'ACTIVE',
      nextBilling: 'November 21, 2026',
    },
    {
      id: 'sub-2',
      creatorName: 'Sophie Lee',
      creatorHandle: 'sophie-lee',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      price: 9.99,
      status: 'ACTIVE',
      nextBilling: 'November 18, 2026',
    },
  ];

  // Demo followed creators
  const followed = [
    { id: 'f1', name: 'Mia Carter', handle: 'mia-carter', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', price: 7.99 },
    { id: 'f2', name: 'Zara Khan', handle: 'zara-khan', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', price: 12.99 },
  ];

  // Transaction history with PPV Individual content
  const transactions = [
    {
      id: 'tx-1003',
      type: 'INDIVIDUAL_CONTENT',
      description: 'Luna Rae - Private Sunset Mirage Collection #1',
      amount: 15.00,
      status: 'SUCCESS',
      date: 'Oct 25, 2026',
    },
    {
      id: 'tx-1001',
      type: 'SUBSCRIPTION',
      description: 'Luna Rae Monthly Subscription',
      amount: 9.99,
      status: 'SUCCESS',
      date: 'Oct 21, 2026',
    },
    {
      id: 'tx-1002',
      type: 'CUSTOM_CONTENT',
      description: 'Luna Rae - Personalised VIP Video Request',
      amount: 45.00,
      status: 'SUCCESS',
      date: 'Oct 20, 2026',
    },
    {
      id: 'tx-1004',
      type: 'SUBSCRIPTION',
      description: 'Sophie Lee Monthly Subscription',
      amount: 9.99,
      status: 'SUCCESS',
      date: 'Oct 18, 2026',
    },
  ];

  const filteredVault = vaultItems.filter(item => {
    if (vaultFilter === 'ALL') return true;
    return item.mediaType === vaultFilter;
  });

  const getTabTitle = () => {
    switch (activeTab) {
      case 'subscriptions':
        return 'Active Creator Subscriptions';
      case 'purchases':
        return 'My Purchases & Private Vault';
      case 'followed':
        return 'Followed Creators';
      case 'transactions':
        return 'Billing & Invoices';
      case 'settings':
        return 'Account & Privacy Settings';
      default:
        return 'Subscriber Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex">
      {/* Sidebar with Toggle Bar */}
      <PanelSidebar
        role="SUBSCRIBER"
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        userName={user?.name || 'Alex Mercer'}
        userHandle={`@${user?.username || 'alexmercer'}`}
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
          role="SUBSCRIBER"
        />

        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Welcome User Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#101016] border border-[#22222e] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#f5d77f] to-[#aa820a] p-0.5 shadow-gold-sm flex-shrink-0">
                <div className="w-full h-full bg-[#0a0a0e] rounded-[14px] flex items-center justify-center">
                  <Crown className="w-8 h-8 text-[#f5d77f]" />
                </div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Welcome back, {user?.name || 'Alex Mercer'}
                </h2>
                <p className="text-xs text-[#8c8c9e] mt-0.5">
                  The Mirage Subscriber Vault | Encrypted Access to Private Feeds & Individual Media
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/explore"
                className="px-5 py-2.5 rounded-full gold-button text-xs font-bold shadow-gold-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Explore Creators
              </Link>
              <Link
                href="/chat"
                className="px-4 py-2.5 rounded-full bg-[#181824] border border-[#2e2e3e] text-xs font-semibold text-white hover:border-[#d4af37] flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#d4af37]" />
                Messages
              </Link>
            </div>
          </div>

          {/* Tab 1: Subscriptions */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white">Your Active Subscriptions ({subscriptions.length})</h3>
                <p className="text-xs text-[#8c8c9e]">Enjoy unrestricted access to all subscriber-only posts, photos, and live chat.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-[#111117] border border-[#232330] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={sub.avatar}
                        alt={sub.creatorName}
                        className="w-12 h-12 rounded-full object-cover border border-[#d4af37]/40 flex-shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {sub.creatorName}
                          <CheckCircle2 className="w-3.5 h-3.5 fill-[#d4af37] text-black" />
                        </h4>
                        <p className="text-xs text-[#7e7e90]">
                          ${sub.price.toFixed(2)} / month • <span className="text-green-400 font-medium">Active</span>
                        </p>
                        <p className="text-[10px] text-[#555566] mt-0.5">
                          Renews on {sub.nextBilling}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/creator/${sub.creatorHandle}`}
                        className="px-3.5 py-1.5 rounded-lg bg-[#181822] border border-[#2b2b3a] text-xs font-semibold text-white hover:border-[#d4af37]"
                      >
                        View Feed
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: My Purchases & Private Content Vault */}
          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#d4af37]" />
                    My Purchases & Private Vault ({vaultItems.length})
                  </h3>
                  <p className="text-xs text-[#8c8c9e]">
                    Your permanently unlocked individual photos, 4K videos, and custom ordered media.
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-2 bg-[#12121a] p-1 rounded-xl border border-[#222230] text-xs">
                  <button
                    onClick={() => setVaultFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      vaultFilter === 'ALL'
                        ? 'gold-button text-black font-bold shadow-gold-sm'
                        : 'text-[#8c8c9e] hover:text-white'
                    }`}
                  >
                    All ({vaultItems.length})
                  </button>
                  <button
                    onClick={() => setVaultFilter('IMAGE')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      vaultFilter === 'IMAGE'
                        ? 'gold-button text-black font-bold shadow-gold-sm'
                        : 'text-[#8c8c9e] hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    Photos
                  </button>
                  <button
                    onClick={() => setVaultFilter('VIDEO')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      vaultFilter === 'VIDEO'
                        ? 'gold-button text-black font-bold shadow-gold-sm'
                        : 'text-[#8c8c9e] hover:text-white'
                    }`}
                  >
                    <Video className="w-3 h-3" />
                    Videos
                  </button>
                </div>
              </div>

              {vaultLoading ? (
                <div className="p-12 text-center text-xs text-[#8e8e9e] bg-[#111117] rounded-2xl border border-[#222230]">
                  Loading your private vault...
                </div>
              ) : filteredVault.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#111117] border border-[#222230] space-y-3">
                  <Lock className="w-8 h-8 text-[#d4af37]/60 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No items found in this category</h4>
                  <p className="text-xs text-[#7e7e90] max-w-sm mx-auto">
                    You haven't unlocked any individual content in this category yet. Explore creator profiles to purchase exclusive media.
                  </p>
                  <Link
                    href="/explore"
                    className="inline-block mt-2 px-4 py-2 rounded-full gold-button text-xs font-bold shadow-gold-sm"
                  >
                    Browse Creator Exclusives
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredVault.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-2xl bg-[#111117] border border-[#232330] hover:border-[#d4af37]/40 transition-all flex flex-col justify-between overflow-hidden shadow-lg"
                    >
                      {/* Media Thumbnail Container */}
                      <div className="relative aspect-video w-full bg-[#181824] overflow-hidden">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-black/80 border border-[#d4af37]/40 text-[10px] font-bold text-[#f5d77f] flex items-center gap-1">
                            {item.mediaType === 'VIDEO' ? (
                              <Video className="w-3 h-3 text-[#d4af37]" />
                            ) : (
                              <ImageIcon className="w-3 h-3 text-[#d4af37]" />
                            )}
                            {item.mediaType === 'VIDEO' ? '4K Video' : 'HQ Photo'}
                          </span>
                        </div>

                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-green-950/80 border border-green-500/40 text-[10px] font-semibold text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Unlocked
                        </span>

                        {/* Play / View Button Overlay */}
                        <button
                          onClick={() => setActiveMediaModal(item)}
                          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#d4af37]/90 text-black flex items-center justify-center hover:scale-110 transition-transform shadow-gold-sm opacity-90 group-hover:opacity-100"
                        >
                          {item.mediaType === 'VIDEO' ? (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Content details */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#f5d77f] transition-colors">
                            {item.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-[#8c8c9e] mt-1.5">
                            <span className="flex items-center gap-1">
                              By <Link href={`/creator/${item.creatorHandle}`} className="text-[#f5d77f] hover:underline font-semibold">{item.creatorName}</Link>
                            </span>
                            <span className="font-bold text-white">${item.price.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#1c1c28] flex items-center justify-between gap-2">
                          <button
                            onClick={() => setActiveMediaModal(item)}
                            className="flex-1 py-2 px-3 rounded-xl gold-button text-xs font-bold flex items-center justify-center gap-1.5 shadow-gold-sm"
                          >
                            {item.mediaType === 'VIDEO' ? (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                Play Video
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                View High-Res
                              </>
                            )}
                          </button>
                          <a
                            href={item.accessUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-[#161622] hover:bg-[#1e1e2d] border border-[#2b2b3a] text-[#8e8e9e] hover:text-white"
                            title="Open original media URL"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Followed Creators */}
          {activeTab === 'followed' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white">Followed Creators ({followed.length})</h3>
                <p className="text-xs text-[#8c8c9e]">Creators you are following for free updates and announcements.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followed.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-[#111117] border border-[#232330] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold text-white">{c.name}</div>
                        <div className="text-[11px] text-[#717182]">${c.price.toFixed(2)} / mo</div>
                      </div>
                    </div>
                    <Link
                      href={`/creator/${c.handle}`}
                      className="px-3 py-1.5 rounded-lg gold-button text-xs font-bold shadow-gold-sm"
                    >
                      Subscribe
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Billing & Invoices */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white">Billing & Payment Invoices</h3>
                <p className="text-xs text-[#8c8c9e]">Complete record of all subscriptions, individual PPV media purchases, and custom requests.</p>
              </div>
              <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                    <tr>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e28] text-white">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#161622]/50">
                        <td className="py-3.5 px-4 font-mono text-[#a3a3b5]">{tx.id}</td>
                        <td className="py-3.5 px-4 font-medium">{tx.description}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
                            tx.type === 'INDIVIDUAL_CONTENT'
                              ? 'bg-[#d4af37]/15 text-[#f5d77f] border-[#d4af37]/30'
                              : tx.type === 'CUSTOM_CONTENT'
                              ? 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                              : 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold">${tx.amount.toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-green-400 font-semibold">{tx.status}</span>
                        </td>
                        <td className="py-3.5 px-4 text-[#777788]">{tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Account Settings */}
          {activeTab === 'settings' && (
            <div className="max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#111118] border border-[#232332] space-y-4">
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#f5d77f]" />
                Account Profile & Privacy
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#717182] block mb-1">Display Name</span>
                  <div className="p-2.5 rounded-xl bg-[#161622] text-white font-semibold">{user?.name || 'Alex Mercer'}</div>
                </div>
                <div>
                  <span className="text-[#717182] block mb-1">Email Address</span>
                  <div className="p-2.5 rounded-xl bg-[#161622] text-white font-semibold">{user?.email || 'subscriber@themirage.vip'}</div>
                </div>
                <div>
                  <span className="text-[#717182] block mb-1">Age Verification Status</span>
                  <div className="p-2.5 rounded-xl bg-[#161622] text-green-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 18+ Verified Consent on File
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* In-App Media Viewer Modal */}
      {activeMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-[#0e0e14] border border-[#d4af37]/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#1c1c28] flex items-center justify-between bg-[#12121a]">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">{activeMediaModal.title}</h3>
                <p className="text-xs text-[#8c8c9e]">
                  Creator: <span className="text-[#f5d77f]">{activeMediaModal.creatorName}</span> • Unlocked Private Content
                </p>
              </div>
              <button
                onClick={() => setActiveMediaModal(null)}
                className="w-8 h-8 rounded-full bg-[#1c1c26] hover:bg-[#252536] flex items-center justify-center text-[#8e8e9e] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Media Display Area */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black">
              {activeMediaModal.mediaType === 'VIDEO' ? (
                <video
                  src={activeMediaModal.accessUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[65vh] rounded-xl object-contain bg-black shadow-lg"
                />
              ) : (
                <img
                  src={activeMediaModal.accessUrl}
                  alt={activeMediaModal.title}
                  className="w-full max-h-[65vh] rounded-xl object-contain shadow-lg"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1c1c28] flex items-center justify-between text-xs text-[#8c8c9e] bg-[#12121a]">
              <span>Purchased on {new Date(activeMediaModal.purchasedAt).toLocaleDateString()}</span>
              <a
                href={activeMediaModal.accessUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl gold-button text-black font-bold flex items-center gap-1.5 shadow-gold-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Original in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
