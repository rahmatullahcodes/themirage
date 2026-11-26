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
  Download,
  UserMinus,
  Trash2,
  Info,
  Upload,
  Loader2,
} from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';
import PanelHeader from '@/components/PanelHeader';
import { ActionIconBtn, PanelModal, ConfirmActionModal, MediaThumb } from '@/components/PanelUi';
import { fetchCurrentSessionUser, getAuthHeaders } from '@/lib/clientAuth';

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
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; username: string; email: string; role: string; avatar?: string; ageVerified?: boolean } | null>(null);

  // Vault / My Purchases state
  const [vaultItems, setVaultItems] = useState<PurchasedItem[]>([]);
  const [vaultLoading, setVaultLoading] = useState(true);
  const [vaultFilter, setVaultFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [activeMediaModal, setActiveMediaModal] = useState<PurchasedItem | null>(null);

  // Subscriptions, Follows, Billing, Profile state loaded from backend APIs
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [followed, setFollowed] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txFilter, setTxFilter] = useState<'ALL' | 'SUBSCRIPTION' | 'INDIVIDUAL_CONTENT' | 'CUSTOM_CONTENT'>('ALL');
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileAgeVerified, setProfileAgeVerified] = useState(true);
  const [profileSaved, setProfileSaved] = useState(false);

  // Detail & Confirmation Modals
  const [viewSubModal, setViewSubModal] = useState<any | null>(null);
  const [viewInvoiceModal, setViewInvoiceModal] = useState<any | null>(null);
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    confirmTone?: 'danger' | 'gold';
    onConfirm: () => Promise<void>;
  } | null>(null);

  const showToast = (msg: string) => {
    setDashboardNotice(msg);
    setTimeout(() => setDashboardNotice(null), 3500);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const sessionUser = await fetchCurrentSessionUser();
      if (!active) return;
      if (!sessionUser) {
        router.replace('/login?redirect=/dashboard');
        return;
      }
      if (sessionUser.role === 'CREATOR') {
        router.replace('/creator-studio');
        return;
      }
      if (sessionUser.role === 'ADMIN') {
        router.replace('/admin');
        return;
      }
      setUser(sessionUser);
      setProfileName(sessionUser.name || '');
      setProfileBio(sessionUser.bio || '');
      setProfileAvatar(sessionUser.avatar || '');
      setProfileAgeVerified(Boolean(sessionUser.ageVerified));
      setAuthChecked(true);
      loadAllDashboardData();
    })();
    return () => {
      active = false;
    };
  }, [router]);

  // Global Escape key listener to close media viewer modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMediaModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadAllDashboardData = async () => {
    setVaultLoading(true);
    try {
      const headers = getAuthHeaders();

      const [purchRes, subRes, folRes, txRes, profRes] = await Promise.all([
        fetch('/api/user/purchases', { headers, cache: 'no-store' }),
        fetch('/api/user/subscriptions', { headers, cache: 'no-store' }),
        fetch('/api/user/follows', { headers, cache: 'no-store' }),
        fetch('/api/user/transactions', { headers, cache: 'no-store' }),
        fetch('/api/user/profile', { headers, cache: 'no-store' }),
      ]);

      if ([purchRes, subRes, folRes, txRes, profRes].some((r) => r.status === 401)) {
        router.replace('/login?redirect=/dashboard');
        return;
      }

      if (purchRes.ok) {
        const data = await purchRes.json();
        if (data.success && Array.isArray(data.purchases)) {
          setVaultItems(data.purchases);
        }
      }
      if (subRes.ok) {
        const sData = await subRes.json();
        if (sData.success && Array.isArray(sData.subscriptions)) {
          setSubscriptions(
            sData.subscriptions.map((s: any) => ({
              id: s.id,
              creatorName: s.creatorName,
              creatorHandle: s.creatorHandle,
              avatar: s.creatorAvatar,
              price: s.price,
              status: s.status,
              nextBilling: s.nextBilling,
            }))
          );
        }
      }
      if (folRes.ok) {
        const fData = await folRes.json();
        if (fData.success && Array.isArray(fData.follows)) {
          setFollowed(
            fData.follows.map((f: any) => ({
              id: f.id,
              name: f.creatorName,
              handle: f.creatorHandle,
              avatar: f.creatorAvatar,
              price: f.price,
            }))
          );
        }
      }
      if (txRes.ok) {
        const tData = await txRes.json();
        if (tData.success && Array.isArray(tData.transactions)) {
          setTransactions(
            tData.transactions.map((t: any) => ({
              id: t.transactionReference || t.id,
              rawId: t.id,
              type: t.type,
              creatorName: t.creatorName || 'Creator',
              postTitle: t.postTitle || '',
              description: t.postTitle ? `${t.creatorName || 'Creator'} - ${t.postTitle}` : `${t.creatorName || 'Creator'} - ${t.type}`,
              amount: t.grossAmount,
              creatorShare: t.creatorShare,
              platformShare: t.platformShare,
              paymentGateway: t.paymentGateway || 'MIRAGE_PAY',
              gatewayReference: t.gatewayReference || '',
              status: t.status,
              date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
            }))
          );
        }
      }
      if (profRes.ok) {
        const pData = await profRes.json();
        if (pData.success && pData.user) {
          setUser((prev) => ({
            id: pData.user.id,
            name: pData.user.name,
            username: pData.user.username,
            email: pData.user.email,
            role: pData.user.role || prev?.role || 'SUBSCRIBER',
            avatar: pData.user.avatar || '',
            ageVerified: Boolean(pData.user.ageVerified),
          }));
          setProfileName(pData.user.name || '');
          setProfileBio(pData.user.bio || '');
          setProfileAvatar(pData.user.avatar || '');
          setProfileAgeVerified(Boolean(pData.user.ageVerified));
        }
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setVaultLoading(false);
    }
  };

  const handleUnfollow = async (creatorHandle: string, creatorName?: string) => {
    setFollowed(prev => prev.filter(c => c.handle !== creatorHandle));
    try {
      await fetch(`/api/user/follows?handle=${encodeURIComponent(creatorHandle)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      showToast(`Unfollowed ${creatorName || creatorHandle}`);
    } catch (e) {}
  };

  const handleCancelSubscription = async (subId: string, creatorName?: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== subId));
    try {
      await fetch('/api/user/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          subscriptionId: subId,
          action: 'CANCEL',
        }),
      });
      showToast(`Subscription to ${creatorName || 'creator'} cancelled`);
    } catch (e) {}
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          name: profileName,
          bio: profileBio,
          avatar: profileAvatar,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const updatedUser = { ...user, name: data.user.name, avatar: data.user.avatar || profileAvatar };
        setUser(updatedUser);
        localStorage.setItem('mirage_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('mirage_auth_changed'));
        setProfileSaved(true);
        showToast('Profile details updated & synced!');
        setTimeout(() => setProfileSaved(false), 2500);
      }
    } catch (err) {}
  };

  const filteredVault = vaultItems.filter(item => {
    if (vaultFilter === 'ALL') return true;
    return item.mediaType === vaultFilter;
  });

  const filteredTransactions = transactions.filter(t => {
    if (txFilter === 'ALL') return true;
    return t.type === txFilter;
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

  if (!authChecked || !user) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-[#d4af37] text-sm">
        Verifying your account session...
      </div>
    );
  }

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
        userName={user?.name || 'Member'}
        userHandle={`@${user?.username || 'member'}`}
        userAvatar={profileAvatar || user?.avatar}
        badges={{
          subscriptions: subscriptions.length > 0 ? `${subscriptions.length} Active` : '0',
          purchases: String(vaultItems.length),
          followed: String(followed.length),
        }}
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
          {dashboardNotice && (
            <div className="p-3.5 rounded-xl bg-green-950/70 border border-green-500/40 text-green-300 text-xs flex items-center gap-2 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>{dashboardNotice}</span>
            </div>
          )}

          {/* Welcome User Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#101016] border border-[#22222e] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#f5d77f] to-[#aa820a] p-0.5 shadow-gold-sm flex-shrink-0 overflow-hidden">
                {(profileAvatar || user?.avatar) ? (
                  <img
                    src={profileAvatar || user?.avatar}
                    alt={user?.name || 'Member'}
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0a0a0e] rounded-[14px] flex items-center justify-center">
                    <Crown className="w-8 h-8 text-[#f5d77f]" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Welcome back, {user?.name || 'Member'}
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

              {subscriptions.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-[#111117] border border-[#232330] space-y-3">
                  <Crown className="w-8 h-8 text-[#d4af37]/60 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Active Subscriptions</h4>
                  <p className="text-xs text-[#7e7e90] max-w-sm mx-auto">
                    You don&apos;t have any active monthly memberships yet. Discover creators and unlock exclusive subscriber feeds.
                  </p>
                  <Link
                    href="/explore"
                    className="inline-block mt-2 px-5 py-2 rounded-full gold-button text-xs font-bold shadow-gold-sm"
                  >
                    Explore Creators
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#111117] border border-[#232330] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={sub.avatar}
                          alt={sub.creatorName}
                          className="w-12 h-12 rounded-full object-cover border border-[#d4af37]/40 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                            {sub.creatorName}
                            <CheckCircle2 className="w-3.5 h-3.5 fill-[#d4af37] text-black flex-shrink-0" />
                          </h4>
                          <p className="text-xs text-[#7e7e90]">
                            ${sub.price.toFixed(2)} / month • <span className="text-green-400 font-medium">Active</span>
                          </p>
                          <p className="text-[10px] text-[#555566] mt-0.5">
                            Renews on {sub.nextBilling}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <ActionIconBtn
                          icon={Info}
                          label="View Subscription Details"
                          tone="neutral"
                          onClick={() => setViewSubModal(sub)}
                        />
                        <ActionIconBtn
                          icon={MessageSquare}
                          label="Message Creator"
                          tone="gold"
                          href={`/chat?creator=${encodeURIComponent(sub.creatorHandle)}`}
                        />
                        <ActionIconBtn
                          icon={Eye}
                          label="View Creator Feed"
                          tone="neutral"
                          href={`/creator/${sub.creatorHandle}`}
                        />
                        <ActionIconBtn
                          icon={Trash2}
                          label="Cancel Subscription"
                          tone="danger"
                          onClick={() =>
                            setConfirmModal({
                              title: `Cancel Subscription to ${sub.creatorName}?`,
                              description: `Your $${Number(sub.price || 0).toFixed(2)}/mo recurring membership will be cancelled.`,
                              confirmLabel: 'Cancel Subscription',
                              confirmTone: 'danger',
                              onConfirm: () => handleCancelSubscription(sub.id, sub.creatorName),
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                        <MediaThumb
                          src={item.thumbnailUrl}
                          fallbackSrc={item.accessUrl}
                          mediaType={item.mediaType}
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
                          <ActionIconBtn
                            icon={User}
                            label={`Visit ${item.creatorName}`}
                            tone="neutral"
                            href={`/creator/${item.creatorHandle}`}
                          />
                          <a
                            href={item.accessUrl}
                            download={item.title}
                            title="Download Media"
                            aria-label="Download Media"
                            className="p-2 rounded-lg bg-[#181824] hover:bg-[#222234] border border-[#2f2f40] text-[#cbd5e1] hover:text-white inline-flex items-center justify-center"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <ActionIconBtn
                            icon={ExternalLink}
                            label="Open Original Media URL"
                            tone="gold"
                            href={item.accessUrl}
                            external
                          />
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

              {followed.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-[#111117] border border-[#232330] space-y-3">
                  <Heart className="w-8 h-8 text-[#d4af37]/60 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No Followed Creators</h4>
                  <p className="text-xs text-[#7e7e90] max-w-sm mx-auto">
                    You aren&apos;t following any creators yet. Follow creators you like to save them here.
                  </p>
                  <Link
                    href="/explore"
                    className="inline-block mt-2 px-5 py-2 rounded-full gold-button text-xs font-bold shadow-gold-sm"
                  >
                    Discover Creators
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {followed.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl bg-[#111117] border border-[#232330] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                          <div className="text-xs font-bold text-white">{c.name}</div>
                          <div className="text-[11px] text-[#717182]">${c.price.toFixed(2)} / mo</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ActionIconBtn
                          icon={Eye}
                          label="View Creator Profile"
                          tone="neutral"
                          href={`/creator/${c.handle}`}
                        />
                        <ActionIconBtn
                          icon={Crown}
                          label="Subscribe to Creator"
                          tone="gold"
                          href={`/creator/${c.handle}`}
                        />
                        <ActionIconBtn
                          icon={UserMinus}
                          label="Unfollow Creator"
                          tone="danger"
                          onClick={() =>
                            setConfirmModal({
                              title: `Unfollow ${c.name}?`,
                              description: `Remove ${c.name} (@${c.handle}) from your followed creators list.`,
                              confirmLabel: 'Unfollow',
                              confirmTone: 'danger',
                              onConfirm: () => handleUnfollow(c.handle, c.name),
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Billing & Invoices */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">Billing & Payment Invoices ({filteredTransactions.length})</h3>
                  <p className="text-xs text-[#8c8c9e]">Complete record of all subscriptions, individual PPV media purchases, and custom requests.</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#12121a] border border-[#222230] text-xs">
                  {(['ALL', 'SUBSCRIPTION', 'INDIVIDUAL_CONTENT', 'CUSTOM_CONTENT'] as const).map((tKey) => (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setTxFilter(tKey)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        txFilter === tKey ? 'gold-button text-black font-bold' : 'text-[#8c8c9e] hover:text-white'
                      }`}
                    >
                      {tKey === 'ALL' ? 'All' : tKey === 'SUBSCRIPTION' ? 'Subscriptions' : tKey === 'INDIVIDUAL_CONTENT' ? 'PPV Media' : 'Custom Orders'}
                    </button>
                  ))}
                </div>
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
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e28] text-white">
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#717182]">
                          No billing invoices found in this category.
                        </td>
                      </tr>
                    )}
                    {filteredTransactions.map((tx) => (
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
                          <span className={tx.status === 'SUCCESS' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#777788]">{tx.date}</td>
                        <td className="py-3.5 px-4">
                          <ActionIconBtn icon={Eye} label="View Billing Invoice" tone="gold" onClick={() => setViewInvoiceModal(tx)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Account Settings */}
          {activeTab === 'settings' && (
            <form
              onSubmit={handleSaveProfile}
              className="max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#111118] border border-[#232332] space-y-4"
            >
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#f5d77f]" />
                Account Profile & Privacy
              </h3>
              {profileSaved && (
                <div className="p-3 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Profile updated and synced to server!
                </div>
              )}
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#161622] border border-[#282838]">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#101018] border border-[#d4af37]/50 flex items-center justify-center flex-shrink-0">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt={profileName || 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-[#d4af37]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span className="text-[#9da3af] font-semibold block">Profile Photo</span>
                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#1c1c2a] hover:bg-[#252538] border border-[#d4af37]/40 text-[11px] font-bold text-[#f5d77f] inline-flex items-center gap-1.5">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (!file || !user) return;
                            setUploadingAvatar(true);
                            try {
                              const fd = new FormData();
                              fd.append('file', file);
                              const upRes = await fetch('/api/upload', { method: 'POST', headers: getAuthHeaders(), body: fd });
                              const upData = await upRes.json();
                              if (upRes.ok && upData?.url) {
                                setProfileAvatar(upData.url);
                                const profPatch = await fetch('/api/user/profile', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                                  body: JSON.stringify({ avatar: upData.url }),
                                });
                                const pJson = await profPatch.json();
                                if (profPatch.ok && pJson?.user) {
                                  const nextU = { ...user, avatar: upData.url };
                                  setUser(nextU);
                                  localStorage.setItem('mirage_user', JSON.stringify(nextU));
                                  window.dispatchEvent(new Event('mirage_auth_changed'));
                                  showToast('Profile photo uploaded & saved!');
                                }
                              } else {
                                showToast(upData?.message || 'Upload failed');
                              }
                            } catch {
                              showToast('Photo upload failed');
                            } finally {
                              setUploadingAvatar(false);
                            }
                          }}
                        />
                        {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                      </label>
                      <input
                        type="text"
                        value={profileAvatar}
                        onChange={(e) => setProfileAvatar(e.target.value)}
                        placeholder="Or image URL..."
                        className="flex-1 min-w-[120px] px-2.5 py-1.5 rounded-lg bg-[#101018] border border-[#282838] text-[11px] text-white"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[#717182] block mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#161622] border border-[#282838] text-white font-semibold focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-[#717182] block mb-1">Email Address</label>
                  <div className="p-2.5 rounded-xl bg-[#161622]/70 text-[#94a3b8] font-semibold">
                    {user?.email || 'Loading account email...'}
                  </div>
                </div>
                <div>
                  <label className="text-[#717182] block mb-1">Bio</label>
                  <textarea
                    rows={2}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Short member bio..."
                    className="w-full p-2.5 rounded-xl bg-[#161622] border border-[#282838] text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <span className="text-[#717182] block mb-1">Age Verification Status</span>
                  <div className={`p-2.5 rounded-xl bg-[#161622] font-semibold flex items-center gap-1.5 ${
                    profileAgeVerified ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {profileAgeVerified ? '18+ Verified Consent on File' : 'Age Verification Pending'}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl gold-button text-xs font-bold shadow-gold-sm"
              >
                Save Account Changes
              </button>
            </form>
          )}
        </main>
      </div>

      {/* In-App Media Viewer Modal */}
      {activeMediaModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveMediaModal(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-[#0e0e14] border border-[#d4af37]/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] cursor-default"
          >
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
            <div className="p-4 border-t border-[#1c1c28] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#8c8c9e] bg-[#12121a]">
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

      {/* View Subscription Details Modal */}
      <PanelModal
        open={Boolean(viewSubModal)}
        title={viewSubModal?.creatorName || 'Subscription Details'}
        subtitle={viewSubModal ? `@${viewSubModal.creatorHandle} • Active Membership` : undefined}
        onClose={() => setViewSubModal(null)}
      >
        {viewSubModal && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#161622] space-y-2 border border-[#2a2a3b]">
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Creator</span><span className="font-bold text-white">{viewSubModal.creatorName}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Monthly Rate</span><span className="font-bold text-[#f5d77f]">${Number(viewSubModal.price || 0).toFixed(2)} / month</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Status</span><span className="text-green-400 font-bold">{viewSubModal.status}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Next Billing</span><span className="text-white">{viewSubModal.nextBilling}</span></div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/creator/${viewSubModal.creatorHandle}`}
                className="flex-1 py-2.5 rounded-xl gold-button text-center font-bold"
              >
                View Creator Feed
              </Link>
              <Link
                href={`/chat?creator=${encodeURIComponent(viewSubModal.creatorHandle)}`}
                className="flex-1 py-2.5 rounded-xl bg-[#181824] border border-[#2e2e40] text-center font-semibold text-white"
              >
                Message Creator
              </Link>
            </div>
          </div>
        )}
      </PanelModal>

      {/* View Billing Invoice Modal */}
      <PanelModal
        open={Boolean(viewInvoiceModal)}
        title="Payment Invoice & Receipt"
        subtitle={viewInvoiceModal?.id}
        onClose={() => setViewInvoiceModal(null)}
      >
        {viewInvoiceModal && (
          <div className="p-4 rounded-2xl bg-[#161622] space-y-2 text-xs border border-[#2a2a3b]">
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Reference</span><span className="font-mono text-[#d4af37]">{viewInvoiceModal.id}</span></div>
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Type</span><span className="font-bold text-white">{viewInvoiceModal.type}</span></div>
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Creator</span><span className="text-[#f5d77f] font-semibold">{viewInvoiceModal.creatorName}</span></div>
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Description</span><span className="text-white">{viewInvoiceModal.description}</span></div>
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Amount Paid</span><span className="font-bold text-white">${Number(viewInvoiceModal.amount || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Gateway</span><span className="font-mono text-[#94a3b8]">{viewInvoiceModal.paymentGateway}</span></div>
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Status</span><span className={viewInvoiceModal.status === 'SUCCESS' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{viewInvoiceModal.status}</span></div>
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Date</span><span className="text-[#94a3b8]">{viewInvoiceModal.date}</span></div>
          </div>
        )}
      </PanelModal>

      {/* Shared Confirmation Modal */}
      <ConfirmActionModal
        open={Boolean(confirmModal)}
        title={confirmModal?.title || 'Confirm Action'}
        description={confirmModal?.description || ''}
        confirmLabel={confirmModal?.confirmLabel || 'Confirm'}
        confirmTone={confirmModal?.confirmTone || 'danger'}
        busy={confirmBusy}
        onClose={() => !confirmBusy && setConfirmModal(null)}
        onConfirm={async () => {
          if (!confirmModal) return;
          setConfirmBusy(true);
          try {
            await confirmModal.onConfirm();
          } finally {
            setConfirmBusy(false);
            setConfirmModal(null);
          }
        }}
      />
    </div>
  );
}
