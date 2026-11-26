'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  Crown,
  CreditCard,
  AlertTriangle,
  Settings,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  DollarSign,
  TrendingUp,
  Search,
  RotateCcw,
  Clock,
  Activity,
  ArrowRight,
  Filter,
  Check,
  Grid,
  Image as ImageIcon,
  Video,
  Archive,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';
import PanelHeader from '@/components/PanelHeader';

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [confirmRefundTxId, setConfirmRefundTxId] = useState<string | null>(null);

  const [adminUser, setAdminUser] = useState({
    name: 'Super Admin',
    handle: 'admin@themirage.vip',
  });

  // Live Commission Config
  const [creatorCommission, setCreatorCommission] = useState(85);
  const [platformCommission, setPlatformCommission] = useState(15);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live Platform Metrics
  const [metrics, setMetrics] = useState({
    subscriptionVolume: 0,
    ppvContentVolume: 0,
    customRequestsVolume: 0,
    totalGross: 0,
    totalCreatorNet: 0,
    totalPlatformCut: 0,
    activeUsersCount: 0,
    totalUsersCount: 0,
    totalCreatorsCount: 0,
    pendingReportsCount: 0,
  });

  // Live Entities from Backend Store
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [creators, setCreators] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Catalog state
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogStatusFilter, setCatalogStatusFilter] = useState('ALL');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState('ALL');

  // Transactions filters
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('ALL');

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mirage_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) {
          setAdminUser({
            name: u.name,
            handle: u.email || `@${u.username || 'admin'}`,
          });
        }
      }
    } catch (e) {}

    loadAdminOverview();
  }, []);

  const loadAdminOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await fetch('/api/admin/overview', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        if (data.metrics) setMetrics(data.metrics);
        if (Array.isArray(data.users)) setUsers(data.users);
        if (Array.isArray(data.creators)) setCreators(data.creators);
        if (Array.isArray(data.transactions)) setTransactions(data.transactions);
        if (Array.isArray(data.reports)) setReports(data.reports);
        if (data.settings) {
          setCreatorCommission(data.settings.creatorCommissionPercent);
          setPlatformCommission(data.settings.platformCommissionPercent);
        }
      }
    } catch (e) {
      console.error('Failed to load admin overview:', e);
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [catalogStatusFilter, catalogTypeFilter]);

  const fetchCatalog = async () => {
    setCatalogLoading(true);
    try {
      const res = await fetch(`/api/admin/catalog?status=${catalogStatusFilter}&mediaType=${catalogTypeFilter}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.catalog)) {
        setCatalogItems(data.catalog);
      }
    } catch (e) {
      console.error('Failed to fetch catalog:', e);
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleUpdatePostStatus = async (postId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCatalogItems(prev =>
          prev.map(item => (item.id === postId ? { ...item, status: newStatus } : item))
        );
        showToast(`Catalog item updated to ${newStatus}`);
      }
    } catch (e) {
      console.error('Failed to change status:', e);
    }
  };

  const handleToggleVerification = async (creatorId: string) => {
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId }),
      });
      const data = await res.json();
      if (data.success && data.creator) {
        setCreators(prev =>
          prev.map(c => (c.id === creatorId ? { ...c, isVerified: data.creator.isVerified } : c))
        );
        showToast(
          data.creator.isVerified
            ? `Verified badge granted to ${data.creator.name}`
            : `Verified badge revoked for ${data.creator.name}`
        );
      }
    } catch (e) {
      console.error('Failed to toggle creator verification:', e);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const nextStatus = target.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, status: data.user.status } : u))
        );
        showToast(`Account ${target.name} updated to ${nextStatus}`);
      }
    } catch (e) {
      console.error('Failed to update user status:', e);
    }
  };

  const handleIssueRefund = async (txId: string) => {
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmRefundTxId(null);
        showToast(`Refund processed for transaction ${txId}. Platform metrics updated.`);
        loadAdminOverview();
      }
    } catch (e) {
      console.error('Failed to refund transaction:', e);
    }
  };

  const handleReportDecision = async (reportId: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.map(r => (r.id === reportId ? { ...r, status } : r)));
        showToast(`Report ${reportId} marked as ${status}`);
      }
    } catch (e) {
      console.error('Failed to update report:', e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorCommissionPercent: creatorCommission }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
        showToast(`Commission split updated to ${creatorCommission}% / ${platformCommission}%`);
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  });

  const filteredTx = transactions.filter(t => {
    const ref = (t.transactionReference || '').toLowerCase();
    const user = (t.userName || '').toLowerCase();
    const creator = (t.creatorName || '').toLowerCase();
    const q = txSearch.toLowerCase();
    const matchesSearch = ref.includes(q) || user.includes(q) || creator.includes(q);
    const matchesType = txTypeFilter === 'ALL' || t.type === txTypeFilter;
    return matchesSearch && matchesType;
  });

  const formatDate = (iso: string) => {
    if (!iso) return 'Recently';
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Administration Dashboard';
      case 'creators':
        return 'Creator Management & Verification';
      case 'catalog':
        return 'Content Catalog & PPV Media Moderation';
      case 'users':
        return 'User Accounts & Access Permissions';
      case 'transactions':
        return `Transactions & ${creatorCommission}/${platformCommission} Commission Ledger`;
      case 'moderation':
        return 'Content Moderation & Review Queue';
      case 'settings':
        return 'Platform Commission Configuration';
      default:
        return 'Administration Panel';
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex">
      {/* Sidebar with Toggle Bar */}
      <PanelSidebar
        role="ADMIN"
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        userName={adminUser.name}
        userHandle={adminUser.handle}
        badges={{
          creators: String(creators.length),
          users: String(users.length),
          transactions: `${creatorCommission}/${platformCommission}`,
          moderation: String(reports.filter(r => r.status === 'PENDING').length || 0),
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
          role="ADMIN"
        />

        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Action Toast */}
          {actionNotice && (
            <div className="p-3.5 rounded-xl bg-green-950/70 border border-green-500/40 text-green-300 text-xs flex items-center justify-between shadow-lg">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                {actionNotice}
              </span>
            </div>
          )}

          {/* Segregated Live Financial & Platform KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#101016] border border-[#20202c]">
              <div className="flex justify-between text-xs text-[#7e7e90] mb-2">
                <span>Total Gross Volume</span>
                <DollarSign className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">${metrics.totalGross.toFixed(2)}</div>
              <div className="text-[10px] text-green-400 mt-1">
                Platform {platformCommission}%: ${metrics.totalPlatformCut.toFixed(2)}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#101016] border border-[#20202c]">
              <div className="flex justify-between text-xs text-[#7e7e90] mb-2">
                <span>Subscriptions Volume</span>
                <Crown className="w-4 h-4 text-[#f5d77f]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#f5d77f]">
                ${metrics.subscriptionVolume.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#8e8e9e] mt-1">
                {metrics.totalCreatorsCount} Creators • {metrics.totalUsersCount} Users
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#101016] border border-[#20202c]">
              <div className="flex justify-between text-xs text-[#7e7e90] mb-2">
                <span>Individual Content (PPV)</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">
                ${metrics.ppvContentVolume.toFixed(2)}
              </div>
              <div className="text-[10px] text-purple-400 mt-1">
                Custom Orders: ${metrics.customRequestsVolume.toFixed(2)}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#101016] border border-[#20202c]">
              <div className="flex justify-between text-xs text-[#7e7e90] mb-2">
                <span>Creator Net Payouts ({creatorCommission}%)</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-green-400">${metrics.totalCreatorNet.toFixed(2)}</div>
              <div className="text-[10px] text-[#555566] mt-1">Audited real-time split</div>
            </div>
          </div>

          {/* Tab 1: Live Overview & Audit Logs */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#111117] border border-[#232330] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#f5d77f]" />
                    Recent Platform Events
                  </h3>
                  <button
                    type="button"
                    onClick={loadAdminOverview}
                    className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingOverview ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="p-3 rounded-xl bg-[#161622] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Sparkles className="w-4 h-4 text-[#f5d77f] flex-shrink-0" />
                        <span className="truncate">
                          {tx.type}: <strong>{tx.userName}</strong> → {tx.creatorName || 'Creator'} (${tx.grossAmount.toFixed(2)})
                        </span>
                      </div>
                      <span className="text-[10px] text-[#6e6e80] flex-shrink-0">{formatDate(tx.createdAt)}</span>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-[#717182]">No transactions recorded yet.</p>
                  )}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111117] border border-[#232330] space-y-4">
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#f5d77f]" />
                  Financial Health & {creatorCommission}/{platformCommission} Integrity
                </h3>
                <p className="text-xs text-[#8c8c9e] leading-relaxed">
                  All user registrations, creator signups, monthly subscriptions, custom content requests, and PPV purchases sync directly with the persistent backend ledger.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#161622] text-center">
                    <div className="text-xl font-bold font-serif text-[#f5d77f]">{creatorCommission}.0%</div>
                    <span className="text-[10px] text-[#808092]">Creator Allocation</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#161622] text-center">
                    <div className="text-xl font-bold font-serif text-white">{platformCommission}.0%</div>
                    <span className="text-[10px] text-[#808092]">Platform Cut</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Creators & Verification */}
          {activeTab === 'creators' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">Creator Verification & Status ({creators.length})</h3>
                  <p className="text-xs text-[#8c8c9e]">Grant or revoke official verification checkmarks and inspect real creator earnings.</p>
                </div>
                <button
                  type="button"
                  onClick={loadAdminOverview}
                  className="px-3 py-1.5 rounded-lg bg-[#161622] border border-[#2b2b3a] text-xs text-[#f5d77f] flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
              <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                    <tr>
                      <th className="py-3 px-4">Creator</th>
                      <th className="py-3 px-4">Handle</th>
                      <th className="py-3 px-4">Monthly Price</th>
                      <th className="py-3 px-4">Active Subscribers</th>
                      <th className="py-3 px-4">Net Earnings</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e28] text-white">
                    {creators.map((c) => (
                      <tr key={c.id} className="hover:bg-[#161622]/40">
                        <td className="py-3.5 px-4 font-bold flex items-center gap-1.5">
                          {c.name}
                          {c.isVerified && <CheckCircle2 className="w-3.5 h-3.5 fill-[#d4af37] text-black" />}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#94a3b8]">@{c.handle}</td>
                        <td className="py-3.5 px-4">${Number(c.monthlyPrice || 0).toFixed(2)}/mo</td>
                        <td className="py-3.5 px-4">{c.subscribers || 0}</td>
                        <td className="py-3.5 px-4 text-[#f5d77f] font-semibold">${Number(c.earnings || 0).toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.isVerified
                              ? 'bg-green-950/60 text-green-400 border border-green-500/30'
                              : 'bg-[#201d15] text-[#8e8e9e] border border-[#353020]'
                          }`}>
                            {c.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleVerification(c.id)}
                            className="px-3 py-1 rounded-lg bg-[#181824] hover:bg-[#202030] text-[11px] text-[#cbd5e1] border border-[#2f2f40]"
                          >
                            {c.isVerified ? 'Revoke Badge' : 'Grant Verified'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Content Catalog & PPV Media Moderation */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <Grid className="w-4 h-4 text-[#d4af37]" />
                    Creator Content Catalog ({catalogItems.length})
                  </h3>
                  <p className="text-xs text-[#8c8c9e]">
                    Inspect all creator posts, photos, 4K videos, PPV pricing, and moderate publication states.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#12121a] p-1.5 rounded-xl border border-[#222230] text-xs">
                  <select
                    value={catalogStatusFilter}
                    onChange={(e) => setCatalogStatusFilter(e.target.value)}
                    className="bg-[#181824] border border-[#282838] rounded-lg px-2.5 py-1 text-white text-xs"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>

                  <select
                    value={catalogTypeFilter}
                    onChange={(e) => setCatalogTypeFilter(e.target.value)}
                    className="bg-[#181824] border border-[#282838] rounded-lg px-2.5 py-1 text-white text-xs"
                  >
                    <option value="ALL">All Types</option>
                    <option value="IMAGE">Photos</option>
                    <option value="VIDEO">Videos</option>
                  </select>
                </div>
              </div>

              {catalogLoading ? (
                <div className="p-12 text-center text-xs text-[#8e8e9e] bg-[#111117] rounded-2xl border border-[#222230]">
                  Loading content catalog...
                </div>
              ) : (
                <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                      <tr>
                        <th className="py-3 px-4">Media</th>
                        <th className="py-3 px-4">Title & Details</th>
                        <th className="py-3 px-4">Creator</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Visibility</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Sales</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Moderation Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e28] text-white">
                      {catalogItems.map((post) => (
                        <tr key={post.id} className="hover:bg-[#161622]/40">
                          <td className="py-3 px-4">
                            <div className="w-14 h-10 rounded-lg overflow-hidden bg-black/60 relative border border-[#2b2b3a]">
                              <img
                                src={post.thumbnailUrl || post.mediaUrl}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-bold text-white truncate">{post.title}</div>
                            <div className="text-[10px] text-[#717182] truncate">{post.caption}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-white">{post.creatorName}</div>
                            <div className="text-[10px] text-[#d4af37]">@{post.creatorHandle}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-[#181826] text-[10px] font-semibold text-[#cbd5e1] border border-[#2b2b3a] inline-flex items-center gap-1">
                              {post.mediaType === 'VIDEO' ? (
                                <Video className="w-3 h-3 text-[#d4af37]" />
                              ) : (
                                <ImageIcon className="w-3 h-3 text-[#d4af37]" />
                              )}
                              {post.mediaType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              post.visibility === 'PURCHASE_ONLY'
                                ? 'bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40'
                                : post.visibility === 'SUBSCRIBER_ONLY'
                                ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                                : 'bg-green-950/60 text-green-300 border border-green-500/30'
                            }`}>
                              {post.visibility === 'PURCHASE_ONLY' ? 'PAID PPV' : post.visibility}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            {post.price > 0 ? `$${post.price.toFixed(2)}` : 'Included'}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-green-400">
                            {post.salesCount || 0}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              post.status === 'PUBLISHED'
                                ? 'bg-green-950/60 text-green-400 border border-green-500/30'
                                : post.status === 'DRAFT'
                                ? 'bg-yellow-950/60 text-yellow-400 border border-yellow-500/30'
                                : 'bg-red-950/60 text-red-400 border border-red-500/30'
                            }`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {post.status !== 'PUBLISHED' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePostStatus(post.id, 'PUBLISHED')}
                                  className="px-2 py-1 rounded bg-[#181824] hover:bg-[#202030] text-[10px] text-green-400 border border-green-500/30 font-semibold"
                                >
                                  Publish
                                </button>
                              )}
                              {post.status !== 'ARCHIVED' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePostStatus(post.id, 'ARCHIVED')}
                                  className="px-2 py-1 rounded bg-[#201c18] hover:bg-[#2c241c] text-[10px] text-yellow-400 border border-yellow-500/30 font-semibold"
                                >
                                  Archive
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleUpdatePostStatus(post.id, 'ARCHIVED')}
                                className="px-2 py-1 rounded bg-[#251515] hover:bg-[#321b1b] text-[10px] text-red-400 border border-red-500/30 font-semibold"
                              >
                                Takedown
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Real Registered User Accounts */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">
                    Registered User Accounts ({users.length})
                  </h3>
                  <p className="text-xs text-[#8c8c9e]">
                    Live registry of all registered Subscribers, Creators, and Admins.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#666677] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search name, email, role..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#161622] border border-[#282838] rounded-xl text-xs text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={loadAdminOverview}
                    className="px-3 py-1.5 rounded-xl bg-[#161622] border border-[#282838] text-xs text-[#f5d77f] flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e28] text-white">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#161622]/40">
                        <td className="py-3.5 px-4 font-bold">
                          <div>{u.name}</div>
                          <div className="text-[10px] font-mono text-[#717182]">@{u.username}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[#8a8a9e]">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-[#181826] text-[#d4af37] border border-[#d4af37]/20 text-[10px]">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold ${
                            u.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#717182]">{formatDate(u.createdAt)}</td>
                        <td className="py-3.5 px-4">
                          {u.role !== 'ADMIN' ? (
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u.id)}
                              className="px-3 py-1 rounded-lg bg-[#181824] hover:bg-[#202030] text-[11px] text-[#cbd5e1] border border-[#2f2f40]"
                            >
                              {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#5c5c70]">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Real Transactions Ledger & Refund Admin */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">
                    Financial Transactions & Audit Ledger ({filteredTx.length})
                  </h3>
                  <p className="text-xs text-[#8c8c9e]">
                    Inspect real-time {creatorCommission}/{platformCommission} commission cuts and issue administrative refunds.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={txTypeFilter}
                    onChange={(e) => setTxTypeFilter(e.target.value)}
                    className="bg-[#161622] border border-[#282838] rounded-xl px-3 py-1.5 text-xs text-white"
                  >
                    <option value="ALL">All Types</option>
                    <option value="INDIVIDUAL_CONTENT">Individual Content (PPV)</option>
                    <option value="SUBSCRIPTION">Subscriptions</option>
                    <option value="CUSTOM_CONTENT">Custom Content</option>
                  </select>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#666677] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      placeholder="Search reference, user..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#161622] border border-[#282838] rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                    <tr>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Creator</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Gross</th>
                      <th className="py-3 px-4">Creator Net</th>
                      <th className="py-3 px-4">Platform Cut</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e28] text-white">
                    {filteredTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#161622]/40">
                        <td className="py-3.5 px-4 font-mono text-[#a0a0b2]">{tx.transactionReference}</td>
                        <td className="py-3.5 px-4 font-medium">{tx.userName}</td>
                        <td className="py-3.5 px-4 text-[#f5d77f] font-semibold">{tx.creatorName || 'Creator'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            tx.type === 'INDIVIDUAL_CONTENT'
                              ? 'bg-[#d4af37]/15 text-[#f5d77f] border-[#d4af37]/30'
                              : tx.type === 'CUSTOM_CONTENT'
                              ? 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                              : 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold">${Number(tx.grossAmount).toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-green-400 font-semibold">${Number(tx.creatorShare).toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-[#a0a0b2]">${Number(tx.platformShare).toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === 'SUCCESS' ? 'text-green-400 bg-green-950/60' : 'text-red-400 bg-red-950/60'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {tx.status === 'SUCCESS' ? (
                            confirmRefundTxId === tx.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleIssueRefund(tx.id)}
                                  className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmRefundTxId(null)}
                                  className="px-2 py-1 rounded bg-[#222230] text-[#94a3b8] text-[10px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmRefundTxId(tx.id)}
                                className="px-2.5 py-1 rounded bg-[#251515] hover:bg-[#301818] text-red-400 border border-red-500/30 text-[10px] font-bold flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Refund
                              </button>
                            )
                          ) : (
                            <span className="text-[10px] text-[#606070]">Refunded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Content Moderation */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-white">Reported Content Queue ({reports.length})</h3>
                <p className="text-xs text-[#8c8c9e]">Review copyright, consent, or violation reports submitted by users or automated gates.</p>
              </div>
              <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                    <tr>
                      <th className="py-3 px-4">Report ID</th>
                      <th className="py-3 px-4">Reporter</th>
                      <th className="py-3 px-4">Target Post</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Moderation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e28] text-white">
                    {reports.map((r) => (
                      <tr key={r.id} className="hover:bg-[#161622]/40">
                        <td className="py-3.5 px-4 font-mono text-[#94a3b8]">{r.id}</td>
                        <td className="py-3.5 px-4 font-medium">{r.reporterName}</td>
                        <td className="py-3.5 px-4">{r.postTitle}</td>
                        <td className="py-3.5 px-4 text-yellow-400">{r.reason}</td>
                        <td className="py-3.5 px-4 font-bold">{r.status}</td>
                        <td className="py-3.5 px-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReportDecision(r.id, 'RESOLVED')}
                            className="px-2.5 py-1 rounded bg-[#181824] text-[10px] text-green-400 border border-green-500/30"
                          >
                            Approve Post
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReportDecision(r.id, 'DISMISSED')}
                            className="px-2.5 py-1 rounded bg-[#251515] text-[10px] text-red-400 border border-red-500/30"
                          >
                            Dismiss / Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 6: Commission Settings */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#111118] border border-[#d4af37]/40 space-y-6">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#f5d77f]" />
                Platform Commission Rules (Requirement 2 & 17)
              </h3>
              <p className="text-xs text-[#8c8c9e] leading-relaxed">
                Configure the live platform revenue distribution dynamically. This persists on the backend and applies to every new subscription, custom order, and PPV sale.
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#8e8e9e] block mb-1.5">
                    Creator Commission Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="95"
                    value={creatorCommission}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCreatorCommission(val);
                      setPlatformCommission(100 - val);
                    }}
                    className="w-full px-4 py-2.5 bg-[#161622] border border-[#29293a] rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8e8e9e] block mb-1.5">
                    Platform Retained Percentage (%)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={platformCommission}
                    className="w-full px-4 py-2.5 bg-[#161622]/50 border border-[#29293a] rounded-xl text-[#777788] font-bold cursor-not-allowed"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#161622] border border-[#2b2b3a] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#808092]">Example $100.00 Gross Sale</span>
                    <span className="text-white font-mono font-bold">$100.00</span>
                  </div>
                  <div className="flex justify-between text-[#f5d77f]">
                    <span>Creator Net Payout ({creatorCommission}%)</span>
                    <span className="font-mono font-bold">${creatorCommission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Platform Retained ({platformCommission}%)</span>
                    <span className="font-mono font-bold">${platformCommission.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Commission Changes
                </button>

                {savedSuccess && (
                  <div className="p-3 rounded-xl bg-green-950/60 border border-green-500/40 text-green-400 text-xs text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Commission configuration successfully saved & persisted to backend!
                  </div>
                )}
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
