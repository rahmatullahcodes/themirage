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
  Edit2,
  Trash2,
  BadgeCheck,
  ShieldOff,
  UserX,
  UserCheck,
  Ban,
  ExternalLink,
} from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';
import PanelHeader from '@/components/PanelHeader';
import { ActionIconBtn, PanelModal, ConfirmActionModal } from '@/components/PanelUi';

const CREATOR_CATEGORIES = ['Popular', 'New', 'Nearby', 'Fitness', 'Lifestyle', 'Fetish', 'Cosplay', 'Mature'];

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Detail, Edit & Confirm Modal states
  const [viewCreator, setViewCreator] = useState<any | null>(null);
  const [editCreatorForm, setEditCreatorForm] = useState<any | null>(null);
  const [viewPost, setViewPost] = useState<any | null>(null);
  const [editPostForm, setEditPostForm] = useState<any | null>(null);
  const [viewUser, setViewUser] = useState<any | null>(null);
  const [editUserForm, setEditUserForm] = useState<any | null>(null);
  const [viewTx, setViewTx] = useState<any | null>(null);
  const [viewReport, setViewReport] = useState<any | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    confirmTone?: 'danger' | 'gold';
    onConfirm: () => Promise<void>;
  } | null>(null);

  const [adminUser, setAdminUser] = useState({
    name: 'Administrator',
    handle: 'admin',
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
        if (Array.isArray(data.users)) {
          setUsers(data.users);
          try {
            if (!localStorage.getItem('mirage_user')) {
              const adminRec = data.users.find((u: any) => u.role === 'ADMIN');
              if (adminRec) {
                setAdminUser({ name: adminRec.name, handle: adminRec.email || `@${adminRec.username}` });
              }
            }
          } catch {}
        }
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

  const handleSaveCatalogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPostForm) return;
    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: editPostForm.id,
          updates: {
            title: editPostForm.title,
            caption: editPostForm.caption,
            visibility: editPostForm.visibility,
            price: Number(editPostForm.price || 0),
            status: editPostForm.status,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.post) {
        setCatalogItems(prev => prev.map(item => (item.id === editPostForm.id ? { ...item, ...data.post } : item)));
        setEditPostForm(null);
        showToast(`Post "${data.post.title}" updated`);
      } else {
        showToast(data?.message || 'Failed to update post');
      }
    } catch (err) {
      showToast('Failed to update post');
    }
  };

  const handleDeleteCatalogPost = async (postId: string) => {
    try {
      const res = await fetch(`/api/admin/catalog?postId=${encodeURIComponent(postId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCatalogItems(prev => prev.filter(p => p.id !== postId));
        showToast('Catalog item deleted permanently');
        loadAdminOverview();
      } else {
        showToast(data?.message || 'Failed to delete item');
      }
    } catch (err) {
      showToast('Failed to delete catalog item');
    }
  };

  const handleToggleVerification = async (creatorId: string) => {
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, action: 'TOGGLE_VERIFY' }),
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

  const handleSaveCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCreatorForm) return;
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: editCreatorForm.id,
          name: editCreatorForm.name,
          handle: editCreatorForm.handle,
          category: editCreatorForm.category,
          monthlyPrice: Number(editCreatorForm.monthlyPrice),
          bio: editCreatorForm.bio,
          isVerified: Boolean(editCreatorForm.isVerified),
          status: editCreatorForm.status,
        }),
      });
      const data = await res.json();
      if (data.success && data.creator) {
        setCreators(prev => prev.map(c => (c.id === editCreatorForm.id ? { ...c, ...data.creator } : c)));
        setEditCreatorForm(null);
        showToast(`Creator "${data.creator.name}" updated`);
        loadAdminOverview();
      } else {
        showToast(data?.message || 'Failed to update creator');
      }
    } catch (err) {
      showToast('Failed to update creator');
    }
  };

  const handleDeleteCreator = async (creatorId: string) => {
    try {
      const res = await fetch(`/api/admin/creators?creatorId=${encodeURIComponent(creatorId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCreators(prev => prev.filter(c => c.id !== creatorId));
        showToast('Creator profile removed');
        loadAdminOverview();
        fetchCatalog();
      } else {
        showToast(data?.message || 'Failed to delete creator');
      }
    } catch (err) {
      showToast('Failed to delete creator');
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

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserForm) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUserForm),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers(prev => prev.map(u => (u.id === editUserForm.userId ? { ...u, ...data.user } : u)));
        setEditUserForm(null);
        showToast(`Account "${data.user.name}" updated`);
        loadAdminOverview();
      } else {
        showToast(data?.message || 'Failed to update user');
      }
    } catch (err) {
      showToast('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        showToast('User account deleted');
        loadAdminOverview();
      } else {
        showToast(data?.message || 'Cannot delete user');
      }
    } catch (err) {
      showToast('Failed to delete user');
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
        showToast(`Refund processed for transaction ${txId}. Platform metrics updated.`);
        loadAdminOverview();
      }
    } catch (e) {
      console.error('Failed to refund transaction:', e);
    }
  };

  const handleDeleteTx = async (txId: string) => {
    try {
      const res = await fetch(`/api/admin/transactions?txId=${encodeURIComponent(txId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTransactions(prev => prev.filter(t => t.id !== txId));
        showToast('Transaction record deleted');
        loadAdminOverview();
      }
    } catch (err) {
      showToast('Failed to delete transaction');
    }
  };

  const handleReportDecision = async (reportId: string, status: 'RESOLVED' | 'DISMISSED', postAction?: 'PUBLISHED' | 'ARCHIVED') => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status, postAction }),
      });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.map(r => (r.id === reportId ? { ...r, status } : r)));
        if (postAction) fetchCatalog();
        showToast(
          postAction === 'ARCHIVED'
            ? `Report resolved & violating post taken down`
            : `Report dismissed & post approved`
        );
      }
    } catch (e) {
      console.error('Failed to update report:', e);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/admin/reports?reportId=${encodeURIComponent(reportId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.filter(r => r.id !== reportId));
        showToast('Moderation report deleted');
        loadAdminOverview();
      }
    } catch (err) {
      showToast('Failed to delete report');
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
          statusLabel={`Commission Rule: ${creatorCommission}/${platformCommission} Active`}
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
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-[#6e6e80]">{formatDate(tx.createdAt)}</span>
                        <ActionIconBtn icon={Eye} label="View Transaction Receipt" tone="gold" onClick={() => setViewTx(tx)} />
                      </div>
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
                        <td className="py-3.5 px-4 font-bold">
                          <div className="flex items-center gap-2">
                            {c.avatar && <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover border border-[#d4af37]/40" />}
                            <span>{c.name}</span>
                            {c.isVerified && <CheckCircle2 className="w-3.5 h-3.5 fill-[#d4af37] text-black flex-shrink-0" />}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[#94a3b8]">@{c.handle}</div>
                          <div className="text-[10px] text-[#d4af37]">{c.category}</div>
                        </td>
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
                          <div className="flex items-center gap-1.5">
                            <ActionIconBtn icon={Eye} label="View Creator Profile" tone="neutral" onClick={() => setViewCreator(c)} />
                            <ActionIconBtn
                              icon={Edit2}
                              label="Edit Creator"
                              tone="gold"
                              onClick={() =>
                                setEditCreatorForm({
                                  id: c.id,
                                  name: c.name,
                                  handle: c.handle,
                                  category: c.category || 'Popular',
                                  monthlyPrice: String(c.monthlyPrice || 9.99),
                                  bio: c.bio || '',
                                  isVerified: Boolean(c.isVerified),
                                  status: c.status || 'ACTIVE',
                                })
                              }
                            />
                            <ActionIconBtn
                              icon={c.isVerified ? ShieldOff : BadgeCheck}
                              label={c.isVerified ? 'Revoke Verified Badge' : 'Grant Verified Badge'}
                              tone={c.isVerified ? 'amber' : 'green'}
                              onClick={() => handleToggleVerification(c.id)}
                            />
                            <ActionIconBtn
                              icon={Trash2}
                              label="Delete Creator"
                              tone="danger"
                              onClick={() =>
                                setConfirmModal({
                                  title: `Delete Creator "${c.name}"?`,
                                  description: `This permanently removes @${c.handle} and all of their posts from The Mirage catalog.`,
                                  confirmLabel: 'Delete Creator',
                                  confirmTone: 'danger',
                                  onConfirm: () => handleDeleteCreator(c.id),
                                })
                              }
                            />
                          </div>
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
                              <ActionIconBtn icon={Eye} label="Preview Media & Details" tone="neutral" onClick={() => setViewPost(post)} />
                              <ActionIconBtn
                                icon={Edit2}
                                label="Edit Catalog Item"
                                tone="gold"
                                onClick={() =>
                                  setEditPostForm({
                                    id: post.id,
                                    title: post.title,
                                    caption: post.caption || '',
                                    visibility: post.visibility,
                                    price: String(post.price || 0),
                                    status: post.status,
                                  })
                                }
                              />
                              <ActionIconBtn
                                icon={post.status === 'PUBLISHED' ? Archive : CheckCircle2}
                                label={post.status === 'PUBLISHED' ? 'Archive / Takedown Post' : 'Publish Post'}
                                tone={post.status === 'PUBLISHED' ? 'amber' : 'green'}
                                onClick={() => handleUpdatePostStatus(post.id, post.status === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED')}
                              />
                              <ActionIconBtn
                                icon={Trash2}
                                label="Delete Post Permanently"
                                tone="danger"
                                onClick={() =>
                                  setConfirmModal({
                                    title: `Delete "${post.title}"?`,
                                    description: 'This permanently deletes this media post from the platform catalog.',
                                    confirmLabel: 'Delete Post',
                                    confirmTone: 'danger',
                                    onConfirm: () => handleDeleteCatalogPost(post.id),
                                  })
                                }
                              />
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
                          <div className="flex items-center gap-1.5">
                            <ActionIconBtn icon={Eye} label="View User Details" tone="neutral" onClick={() => setViewUser(u)} />
                            <ActionIconBtn
                              icon={Edit2}
                              label="Edit User Account"
                              tone="gold"
                              onClick={() =>
                                setEditUserForm({
                                  userId: u.id,
                                  name: u.name,
                                  username: u.username,
                                  email: u.email,
                                  role: u.role,
                                  status: u.status,
                                  bio: u.bio || '',
                                })
                              }
                            />
                            {u.role !== 'ADMIN' ? (
                              <>
                                <ActionIconBtn
                                  icon={u.status === 'ACTIVE' ? UserX : UserCheck}
                                  label={u.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                                  tone={u.status === 'ACTIVE' ? 'amber' : 'green'}
                                  onClick={() => handleToggleUserStatus(u.id)}
                                />
                                <ActionIconBtn
                                  icon={Trash2}
                                  label="Delete User Account"
                                  tone="danger"
                                  onClick={() =>
                                    setConfirmModal({
                                      title: `Delete Account "${u.name}"?`,
                                      description: `Removes ${u.email} (${u.role}) and clears associated subscriptions/follows permanently.`,
                                      confirmLabel: 'Delete User',
                                      confirmTone: 'danger',
                                      onConfirm: () => handleDeleteUser(u.id),
                                    })
                                  }
                                />
                              </>
                            ) : (
                              <span className="text-[10px] text-[#5c5c70] pl-1">Protected</span>
                            )}
                          </div>
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
                          <div className="flex items-center gap-1.5">
                            <ActionIconBtn icon={Eye} label="View Transaction Invoice" tone="neutral" onClick={() => setViewTx(tx)} />
                            {tx.status === 'SUCCESS' && (
                              <ActionIconBtn
                                icon={RotateCcw}
                                label="Issue Refund"
                                tone="amber"
                                onClick={() =>
                                  setConfirmModal({
                                    title: `Issue Refund for ${tx.transactionReference}?`,
                                    description: `Refund $${Number(tx.grossAmount).toFixed(2)} to ${tx.userName} and deduct from net ledger totals.`,
                                    confirmLabel: 'Confirm Refund',
                                    confirmTone: 'danger',
                                    onConfirm: () => handleIssueRefund(tx.id),
                                  })
                                }
                              />
                            )}
                            <ActionIconBtn
                              icon={Trash2}
                              label="Delete Transaction Record"
                              tone="danger"
                              onClick={() =>
                                setConfirmModal({
                                  title: `Delete Transaction ${tx.transactionReference}?`,
                                  description: 'Removes this ledger record permanently from administrative records.',
                                  confirmLabel: 'Delete Record',
                                  confirmTone: 'danger',
                                  onConfirm: () => handleDeleteTx(tx.id),
                                })
                              }
                            />
                          </div>
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
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <ActionIconBtn icon={Eye} label="Inspect Report & Post" tone="neutral" onClick={() => setViewReport(r)} />
                            <ActionIconBtn
                              icon={CheckCircle2}
                              label="Approve Post & Dismiss Report"
                              tone="green"
                              onClick={() => handleReportDecision(r.id, 'DISMISSED', 'PUBLISHED')}
                            />
                            <ActionIconBtn
                              icon={Ban}
                              label="Takedown Post & Resolve Report"
                              tone="amber"
                              onClick={() => handleReportDecision(r.id, 'RESOLVED', 'ARCHIVED')}
                            />
                            <ActionIconBtn
                              icon={Trash2}
                              label="Delete Report"
                              tone="danger"
                              onClick={() =>
                                setConfirmModal({
                                  title: `Delete Report ${r.id}?`,
                                  description: `Remove moderation report regarding "${r.postTitle}".`,
                                  confirmLabel: 'Delete Report',
                                  confirmTone: 'danger',
                                  onConfirm: () => handleDeleteReport(r.id),
                                })
                              }
                            />
                          </div>
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

      {/* View Creator Modal */}
      <PanelModal
        open={Boolean(viewCreator)}
        title={viewCreator?.name || 'Creator Profile'}
        subtitle={viewCreator ? `@${viewCreator.handle} • ${viewCreator.category}` : undefined}
        onClose={() => setViewCreator(null)}
      >
        {viewCreator && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              {viewCreator.avatar && (
                <img src={viewCreator.avatar} alt={viewCreator.name} className="w-16 h-16 rounded-2xl object-cover border border-[#d4af37]/50" />
              )}
              <div className="space-y-1">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  {viewCreator.name}
                  {viewCreator.isVerified && <CheckCircle2 className="w-4 h-4 fill-[#d4af37] text-black" />}
                </div>
                <div className="text-[#8e8e9e]">{viewCreator.bio || 'No bio entered yet.'}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-[#161622] text-center">
                <div className="text-[#f5d77f] font-bold">${Number(viewCreator.monthlyPrice || 0).toFixed(2)}</div>
                <div className="text-[10px] text-[#717182]">Monthly Price</div>
              </div>
              <div className="p-3 rounded-xl bg-[#161622] text-center">
                <div className="text-white font-bold">{viewCreator.subscribers || 0}</div>
                <div className="text-[10px] text-[#717182]">Subscribers</div>
              </div>
              <div className="p-3 rounded-xl bg-[#161622] text-center">
                <div className="text-green-400 font-bold">${Number(viewCreator.earnings || 0).toFixed(2)}</div>
                <div className="text-[10px] text-[#717182]">Net Earnings</div>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#1c1c28]">
              <Link
                href={`/creator/${viewCreator.handle}`}
                className="flex-1 py-2.5 rounded-xl gold-button text-center font-bold flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Public Profile
              </Link>
              <Link
                href={`/creator-studio?creator=${encodeURIComponent(viewCreator.handle)}`}
                className="flex-1 py-2.5 rounded-xl bg-[#181824] border border-[#2e2e40] text-center font-semibold text-white hover:border-[#d4af37]"
              >
                Open in Studio
              </Link>
            </div>
          </div>
        )}
      </PanelModal>

      {/* Edit Creator Modal */}
      <PanelModal
        open={Boolean(editCreatorForm)}
        title={`Edit Creator: ${editCreatorForm?.name || ''}`}
        onClose={() => setEditCreatorForm(null)}
      >
        {editCreatorForm && (
          <form onSubmit={handleSaveCreator} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editCreatorForm.name}
                  onChange={(e) => setEditCreatorForm({ ...editCreatorForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Handle</label>
                <input
                  type="text"
                  required
                  value={editCreatorForm.handle}
                  onChange={(e) => setEditCreatorForm({ ...editCreatorForm, handle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Category</label>
                <select
                  value={editCreatorForm.category}
                  onChange={(e) => setEditCreatorForm({ ...editCreatorForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                >
                  {CREATOR_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Monthly Price ($)</label>
                <input
                  type="number"
                  step="0.50"
                  min="1"
                  required
                  value={editCreatorForm.monthlyPrice}
                  onChange={(e) => setEditCreatorForm({ ...editCreatorForm, monthlyPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[#8e8e9e] mb-1">Bio</label>
              <textarea
                rows={2}
                value={editCreatorForm.bio}
                onChange={(e) => setEditCreatorForm({ ...editCreatorForm, bio: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={editCreatorForm.isVerified}
                  onChange={(e) => setEditCreatorForm({ ...editCreatorForm, isVerified: e.target.checked })}
                  className="accent-[#d4af37]"
                />
                <span>Verified Creator Badge</span>
              </label>
              <select
                value={editCreatorForm.status}
                onChange={(e) => setEditCreatorForm({ ...editCreatorForm, status: e.target.value })}
                className="px-3 py-1.5 rounded-lg bg-[#161622] border border-[#2b2b3c] text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl gold-button font-bold">
              Save Creator Changes
            </button>
          </form>
        )}
      </PanelModal>

      {/* View Catalog Post Modal */}
      <PanelModal
        open={Boolean(viewPost)}
        title={viewPost?.title || 'Media Preview'}
        subtitle={viewPost ? `By ${viewPost.creatorName} (@${viewPost.creatorHandle}) • ${viewPost.status}` : undefined}
        onClose={() => setViewPost(null)}
        maxWidthClass="max-w-2xl"
      >
        {viewPost && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl overflow-hidden bg-black border border-[#2b2b3a]">
              {viewPost.mediaType === 'VIDEO' ? (
                <video src={viewPost.mediaUrl} poster={viewPost.thumbnailUrl} controls playsInline className="w-full max-h-[55vh] object-contain" />
              ) : (
                <img src={viewPost.mediaUrl || viewPost.thumbnailUrl} alt={viewPost.title} className="w-full max-h-[55vh] object-contain" />
              )}
            </div>
            <p className="text-[#cbd5e1]">{viewPost.caption || 'No caption'}</p>
            <div className="flex flex-wrap justify-between gap-2 p-3 rounded-xl bg-[#161622] text-[11px] text-[#94a3b8]">
              <span>Visibility: <strong className="text-white">{viewPost.visibility}</strong></span>
              <span>Price: <strong className="text-[#f5d77f]">{viewPost.price > 0 ? `$${viewPost.price.toFixed(2)}` : 'Included'}</strong></span>
              <span>Sales: <strong className="text-green-400">{viewPost.salesCount || 0}</strong></span>
            </div>
          </div>
        )}
      </PanelModal>

      {/* Edit Catalog Post Modal */}
      <PanelModal
        open={Boolean(editPostForm)}
        title="Edit Catalog Media"
        onClose={() => setEditPostForm(null)}
      >
        {editPostForm && (
          <form onSubmit={handleSaveCatalogPost} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#8e8e9e] mb-1">Title</label>
              <input
                type="text"
                required
                value={editPostForm.title}
                onChange={(e) => setEditPostForm({ ...editPostForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
              />
            </div>
            <div>
              <label className="block text-[#8e8e9e] mb-1">Caption</label>
              <textarea
                rows={2}
                value={editPostForm.caption}
                onChange={(e) => setEditPostForm({ ...editPostForm, caption: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Visibility</label>
                <select
                  value={editPostForm.visibility}
                  onChange={(e) => setEditPostForm({ ...editPostForm, visibility: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                >
                  <option value="PURCHASE_ONLY">Paid PPV</option>
                  <option value="SUBSCRIBER_ONLY">Subscriber-Only</option>
                  <option value="PUBLIC">Public</option>
                </select>
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  disabled={editPostForm.visibility !== 'PURCHASE_ONLY'}
                  value={editPostForm.price}
                  onChange={(e) => setEditPostForm({ ...editPostForm, price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white disabled:opacity-40"
                />
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Status</label>
                <select
                  value={editPostForm.status}
                  onChange={(e) => setEditPostForm({ ...editPostForm, status: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                >
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl gold-button font-bold">
              Save Post Changes
            </button>
          </form>
        )}
      </PanelModal>

      {/* View User Modal */}
      <PanelModal
        open={Boolean(viewUser)}
        title={viewUser?.name || 'User Account'}
        subtitle={viewUser ? `@${viewUser.username} • ${viewUser.role}` : undefined}
        onClose={() => setViewUser(null)}
      >
        {viewUser && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-[#161622]">
              <div><span className="text-[#717182] block">Email</span><span className="text-white font-medium">{viewUser.email}</span></div>
              <div><span className="text-[#717182] block">Account Status</span><span className={viewUser.status === 'ACTIVE' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{viewUser.status}</span></div>
              <div><span className="text-[#717182] block">User ID</span><span className="font-mono text-[#cbd5e1]">{viewUser.id}</span></div>
              <div><span className="text-[#717182] block">Joined</span><span className="text-[#cbd5e1]">{formatDate(viewUser.createdAt)}</span></div>
            </div>
            <div className="p-3 rounded-xl bg-[#161622]">
              <span className="text-[#717182] block mb-1">Bio</span>
              <p className="text-[#cbd5e1]">{viewUser.bio || 'No bio provided.'}</p>
            </div>
          </div>
        )}
      </PanelModal>

      {/* Edit User Modal */}
      <PanelModal
        open={Boolean(editUserForm)}
        title={`Edit User: ${editUserForm?.name || ''}`}
        onClose={() => setEditUserForm(null)}
      >
        {editUserForm && (
          <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={editUserForm.username}
                  onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[#8e8e9e] mb-1">Email</label>
              <input
                type="email"
                required
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Role</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                >
                  <option value="SUBSCRIBER">SUBSCRIBER</option>
                  <option value="CREATOR">CREATOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Status</label>
                <select
                  value={editUserForm.status}
                  onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl gold-button font-bold">
              Save Account Changes
            </button>
          </form>
        )}
      </PanelModal>

      {/* View Transaction Invoice Modal */}
      <PanelModal
        open={Boolean(viewTx)}
        title="Transaction Receipt & Split"
        subtitle={viewTx?.transactionReference}
        onClose={() => setViewTx(null)}
      >
        {viewTx && (
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-[#161622] space-y-2 border border-[#2a2a3b]">
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Type</span><span className="font-bold text-white">{viewTx.type}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Buyer</span><span className="text-white">{viewTx.userName}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Creator</span><span className="text-[#f5d77f] font-semibold">{viewTx.creatorName || 'Creator'}</span></div>
              {viewTx.postTitle && <div className="flex justify-between"><span className="text-[#8e8e9e]">Item</span><span className="text-white">{viewTx.postTitle}</span></div>}
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Gross Total</span><span className="font-bold text-white">${Number(viewTx.grossAmount).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Creator Net</span><span className="font-bold text-green-400">${Number(viewTx.creatorShare).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Platform Cut</span><span className="text-[#cbd5e1]">${Number(viewTx.platformShare).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Gateway / Ref</span><span className="font-mono text-[#94a3b8]">{viewTx.paymentGateway} • {viewTx.gatewayReference}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Status</span><span className={viewTx.status === 'SUCCESS' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{viewTx.status}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Timestamp</span><span className="text-[#94a3b8]">{formatDate(viewTx.createdAt)}</span></div>
            </div>
          </div>
        )}
      </PanelModal>

      {/* View Report Modal */}
      <PanelModal
        open={Boolean(viewReport)}
        title={`Moderation Report: ${viewReport?.id || ''}`}
        subtitle={viewReport?.postTitle}
        onClose={() => setViewReport(null)}
      >
        {viewReport && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#161622] space-y-2 border border-[#2a2a3b]">
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Reporter</span><span className="text-white font-semibold">{viewReport.reporterName}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Target Post</span><span className="text-white">{viewReport.postTitle}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Reason</span><span className="text-yellow-400 font-semibold">{viewReport.reason}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Status</span><span className="font-bold text-white">{viewReport.status}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Date</span><span className="text-[#94a3b8]">{formatDate(viewReport.createdAt)}</span></div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleReportDecision(viewReport.id, 'DISMISSED', 'PUBLISHED');
                  setViewReport(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 font-bold"
              >
                Approve Post & Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  handleReportDecision(viewReport.id, 'RESOLVED', 'ARCHIVED');
                  setViewReport(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 font-bold"
              >
                Takedown Post
              </button>
            </div>
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
