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
} from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';
import PanelHeader from '@/components/PanelHeader';

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; username: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mirage_user');
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      setUser({
        id: 'usr-1',
        name: 'Alex Mercer',
        username: 'alexmercer',
        email: 'subscriber@themirage.vip',
        role: 'SUBSCRIBER',
      });
    }
  }, []);

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

  // Demo purchased private content (Section 13 & 16)
  const purchases = [
    {
      id: 'pur-1',
      title: 'Custom VIP Video Shoutout & Q&A',
      creatorName: 'Luna Rae',
      creatorHandle: 'luna-rae',
      amount: 45.00,
      deliveredAt: 'Oct 20, 2026',
      mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      downloadUrl: '#',
    },
    {
      id: 'pur-2',
      title: 'Private Exclusive High-Res Set (6 Photos)',
      creatorName: 'Sophie Lee',
      creatorHandle: 'sophie-lee',
      amount: 25.00,
      deliveredAt: 'Oct 15, 2026',
      mediaUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      downloadUrl: '#',
    },
  ];

  // Demo followed creators
  const followed = [
    { id: 'f1', name: 'Mia Carter', handle: 'mia-carter', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', price: 7.99 },
    { id: 'f2', name: 'Zara Khan', handle: 'zara-khan', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', price: 12.99 },
  ];

  // Transaction history
  const transactions = [
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
      id: 'tx-1003',
      type: 'SUBSCRIPTION',
      description: 'Sophie Lee Monthly Subscription',
      amount: 9.99,
      status: 'SUCCESS',
      date: 'Oct 18, 2026',
    },
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'subscriptions':
        return 'Active Creator Subscriptions';
      case 'purchases':
        return 'Private Content Vault';
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
                  The Mirage Subscriber Vault | Encrypted Access to Private Feeds
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

          {/* Tab 2: Purchases Private Vault (Section 13 & 16) */}
          {activeTab === 'purchases' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white">
                  Private Delivered Content Vault ({purchases.length})
                </h3>
                <p className="text-xs text-[#8c8c9e]">
                  Personalised videos, bespoke photo sets, and shoutouts ordered exclusively for you via 1-on-1 chat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {purchases.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#111117] border border-[#d4af37]/30 flex flex-col justify-between gap-4"
                  >
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#181824] relative">
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-bold text-[#f5d77f] border border-[#d4af37]/40">
                        Delivered & Verified
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-[#8c8c9e] mt-1">
                        Creator: <span className="text-[#f5d77f]">{item.creatorName}</span> • Paid: ${item.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-[#555566]">Delivered on {item.deliveredAt}</p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#1c1c28]">
                      <a
                        href={item.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center py-2 rounded-lg gold-button text-xs font-bold"
                      >
                        View Full Quality Media
                      </a>
                    </div>
                  </div>
                ))}
              </div>
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
                <p className="text-xs text-[#8c8c9e]">Complete record of all subscription checkouts and custom request purchases.</p>
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
                          <span className="px-2 py-0.5 rounded-full bg-[#181826] text-[#f5d77f] border border-[#d4af37]/20 text-[10px]">
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
    </div>
  );
}
