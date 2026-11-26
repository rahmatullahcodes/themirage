'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Plus,
  Upload,
  Loader2,
} from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';
import PanelHeader from '@/components/PanelHeader';
import { ActionIconBtn, PanelModal, ConfirmActionModal, MediaThumb } from '@/components/PanelUi';
import { fetchCurrentSessionUser, getAuthHeaders, ClientSessionUser } from '@/lib/clientAuth';

const CREATOR_CATEGORIES = ['Popular', 'New', 'Nearby', 'Fitness', 'Lifestyle', 'Fetish', 'Cosplay', 'Mature'];

export default function AdminPanelPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<ClientSessionUser | null>(null);
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'forbidden'>('loading');
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
  const [createUserForm, setCreateUserForm] = useState<any | null>(null);
  const [createCreatorForm, setCreateCreatorForm] = useState<any | null>(null);
  const [editOrderForm, setEditOrderForm] = useState<any | null>(null);
  const [deliverOrderModal, setDeliverOrderModal] = useState<any | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [ordersSubTab, setOrdersSubTab] = useState<'orders' | 'subscriptions'>('orders');
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
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);

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

  const authHeaders = () => getAuthHeaders();
  const authJsonHeaders = () => ({ 'Content-Type': 'application/json', ...getAuthHeaders() });

  useEffect(() => {
    let active = true;
    (async () => {
      const me = await fetchCurrentSessionUser();
      if (!active) return;
      if (!me) {
        router.replace('/login?redirect=/admin');
        return;
      }
      setSessionUser(me);
      if (me.role !== 'ADMIN') {
        setAuthState('forbidden');
        return;
      }
      setAdminUser({
        name: me.name,
        handle: me.email || `@${me.username || 'admin'}`,
      });
      setAuthState('authorized');
      loadAdminOverview();
    })();
    return () => {
      active = false;
    };
  }, [router]);

  const loadAdminOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: authHeaders(),
        cache: 'no-store',
      });
      if (res.status === 401) {
        router.replace('/login?redirect=/admin');
        return;
      }
      if (res.status === 403) {
        setAuthState('forbidden');
        return;
      }
      const data = await res.json();
      if (data.success) {
        if (data.metrics) setMetrics(data.metrics);
        if (Array.isArray(data.users)) setUsers(data.users);
        if (Array.isArray(data.creators)) setCreators(data.creators);
        if (Array.isArray(data.transactions)) setTransactions(data.transactions);
        if (Array.isArray(data.reports)) setReports(data.reports);
        if (Array.isArray(data.customRequests)) setCustomOrders(data.customRequests);
        if (Array.isArray(data.subscriptions)) setSubscriptionsList(data.subscriptions);
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
    if (authState === 'authorized') {
      fetchCatalog();
    }
  }, [authState, catalogStatusFilter, catalogTypeFilter]);

  const fetchCatalog = async () => {
    setCatalogLoading(true);
    try {
      const res = await fetch(`/api/admin/catalog?status=${catalogStatusFilter}&mediaType=${catalogTypeFilter}`, {
        headers: authHeaders(),
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
        headers: authJsonHeaders(),
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
        headers: authJsonHeaders(),
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
      const res = await fetch(`/api/admin/catalog?postId=${encodeURIComponent(postId)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
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
        headers: authJsonHeaders(),
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

  const handleUploadAsset = async (
    file: File,
    fieldKey: string,
    onSuccess: (url: string) => void
  ) => {
    setUploadingField(fieldKey);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data?.success && data?.url) {
        onSuccess(data.url);
        showToast('Media uploaded successfully');
      } else {
        showToast(data?.message || 'Upload failed');
      }
    } catch {
      showToast('Network error during upload');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCreatorForm) return;
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'PATCH',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          creatorId: editCreatorForm.id,
          name: editCreatorForm.name,
          handle: editCreatorForm.handle,
          category: editCreatorForm.category,
          monthlyPrice: Number(editCreatorForm.monthlyPrice),
          bio: editCreatorForm.bio,
          avatar: editCreatorForm.avatar,
          banner: editCreatorForm.banner,
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

  const handleCreateCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createCreatorForm) return;
    try {
      const res = await fetch('/api/admin/creators', {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          name: createCreatorForm.name,
          handle: createCreatorForm.handle,
          email: createCreatorForm.email,
          password: createCreatorForm.password,
          category: createCreatorForm.category,
          monthlyPrice: Number(createCreatorForm.monthlyPrice || 9.99),
          bio: createCreatorForm.bio,
          avatar: createCreatorForm.avatar,
          banner: createCreatorForm.banner,
          isVerified: Boolean(createCreatorForm.isVerified),
          status: createCreatorForm.status || 'ACTIVE',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.creator) {
        setCreateCreatorForm(null);
        showToast(`Creator "${data.creator.name}" created`);
        loadAdminOverview();
      } else {
        showToast(data?.message || 'Failed to create creator');
      }
    } catch {
      showToast('Failed to create creator');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUserForm) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify(createUserForm),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCreateUserForm(null);
        showToast(`Account "${data.user.name}" created (${data.user.role})`);
        loadAdminOverview();
      } else {
        showToast(data?.message || 'Failed to create user account');
      }
    } catch {
      showToast('Failed to create user account');
    }
  };

  const handleSaveCustomOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrderForm) return;
    try {
      const res = await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          requestId: editOrderForm.id,
          action: 'UPDATE',
          title: editOrderForm.title,
          description: editOrderForm.description,
          price: Number(editOrderForm.price),
          status: editOrderForm.status,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.request) {
        setCustomOrders(prev => prev.map(o => (o.id === editOrderForm.id ? data.request : o)));
        setEditOrderForm(null);
        showToast(`Order "${data.request.title}" updated`);
        loadAdminOverview();
      } else {
        showToast(data?.message || 'Failed to update custom order');
      }
    } catch {
      showToast('Failed to update custom order');
    }
  };

  const handleDeliverCustomOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverOrderModal) return;
    try {
      const res = await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          requestId: deliverOrderModal.id,
          action: 'DELIVER',
          deliveredMediaUrl: deliverOrderModal.deliveredMediaUrl,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.request) {
        setCustomOrders(prev => prev.map(o => (o.id === deliverOrderModal.id ? data.request : o)));
        setDeliverOrderModal(null);
        showToast(`Order "${data.request.title}" delivered to buyer vault`);
        loadAdminOverview();
      } else {
        showToast(data?.message || 'Failed to deliver custom order');
      }
    } catch {
      showToast('Failed to deliver custom order');
    }
  };

  const handleCancelCustomOrder = async (requestId: string) => {
    try {
      const res = await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: authJsonHeaders(),
        body: JSON.stringify({ requestId, action: 'CANCEL' }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.request) {
        setCustomOrders(prev => prev.map(o => (o.id === requestId ? data.request : o)));
        showToast('Custom order cancelled');
      } else {
        showToast(data?.message || 'Failed to cancel order');
      }
    } catch {
      showToast('Failed to cancel order');
    }
  };

  const handleDeleteCustomOrder = async (requestId: string) => {
    try {
      const res = await fetch(`/api/custom-requests?requestId=${encodeURIComponent(requestId)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomOrders(prev => prev.filter(o => o.id !== requestId));
        showToast('Custom order deleted');
      } else {
        showToast(data?.message || 'Failed to delete order');
      }
    } catch {
      showToast('Failed to delete order');
    }
  };

  const handleToggleSubStatus = async (subscriptionId: string, nextStatus: 'ACTIVE' | 'CANCELLED') => {
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: authJsonHeaders(),
        body: JSON.stringify({ subscriptionId, status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.subscription) {
        setSubscriptionsList(prev => prev.map(s => (s.id === subscriptionId ? data.subscription : s)));
        showToast(`Subscription updated to ${nextStatus}`);
        loadAdminOverview();
      } else {
        showToast(data?.message || 'Failed to update subscription');
      }
    } catch {
      showToast('Failed to update subscription');
    }
  };

  const handleDeleteSub = async (subscriptionId: string) => {
    try {
      const res = await fetch(`/api/admin/subscriptions?subscriptionId=${encodeURIComponent(subscriptionId)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscriptionsList(prev => prev.filter(s => s.id !== subscriptionId));
        showToast('Subscription record removed');
        loadAdminOverview();
      } else {
        showToast(data?.message || 'Failed to remove subscription');
      }
    } catch {
      showToast('Failed to remove subscription');
    }
  };

  const handleDeleteCreator = async (creatorId: string) => {
    try {
      const res = await fetch(`/api/admin/creators?creatorId=${encodeURIComponent(creatorId)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
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
        headers: authJsonHeaders(),
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
        headers: authJsonHeaders(),
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
      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
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
        headers: authJsonHeaders(),
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
      const res = await fetch(`/api/admin/transactions?txId=${encodeURIComponent(txId)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
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
        headers: authJsonHeaders(),
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
      const res = await fetch(`/api/admin/reports?reportId=${encodeURIComponent(reportId)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
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
        headers: authJsonHeaders(),
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
      case 'orders':
        return 'Custom Orders & Active Subscriptions';
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

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-[#d4af37] text-sm">
        Verifying administrator session...
      </div>
    );
  }

  if (authState === 'forbidden') {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-[#111117] border border-red-500/40 text-center space-y-4">
          <ShieldOff className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-serif font-bold text-white">Administrator Access Required</h2>
          <p className="text-xs text-[#94a3b8]">
            You are currently signed in as <span className="text-white font-semibold">{sessionUser?.name}</span> ({sessionUser?.role}). Only authorized platform administrators can view this portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              href={sessionUser?.role === 'CREATOR' ? '/creator-studio' : '/dashboard'}
              className="flex-1 py-2.5 rounded-xl gold-button text-xs font-bold text-center"
            >
              Go to My Portal
            </Link>
            <Link
              href="/"
              className="flex-1 py-2.5 rounded-xl bg-[#181824] border border-[#2c2c3c] text-xs font-semibold text-white text-center"
            >
              Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          orders: String(customOrders.length),
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">Creator Verification & Status ({creators.length})</h3>
                  <p className="text-xs text-[#8c8c9e]">Create profiles, upload avatars/banners, toggle verification checkmarks, and suspend or audit creators.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() =>
                      setCreateCreatorForm({
                        name: '',
                        handle: '',
                        email: '',
                        password: '',
                        category: 'Popular',
                        monthlyPrice: '9.99',
                        bio: '',
                        avatar: '',
                        banner: '',
                        isVerified: true,
                        status: 'ACTIVE',
                      })
                    }
                    className="px-3.5 py-1.5 rounded-lg gold-button text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Creator
                  </button>
                  <button
                    type="button"
                    onClick={loadAdminOverview}
                    className="px-3 py-1.5 rounded-lg bg-[#161622] border border-[#2b2b3a] text-xs text-[#f5d77f] flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </div>
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
                                  avatar: c.avatar || '',
                                  banner: c.banner || '',
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

                <div className="flex flex-wrap items-center gap-2 bg-[#12121a] p-1.5 rounded-xl border border-[#222230] text-xs w-full sm:w-auto">
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
                              <MediaThumb
                                src={post.thumbnailUrl}
                                fallbackSrc={post.mediaUrl}
                                mediaType={post.mediaType}
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

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 min-w-[160px] sm:w-64">
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
                    onClick={() =>
                      setCreateUserForm({
                        name: '',
                        username: '',
                        email: '',
                        password: '',
                        role: 'SUBSCRIBER',
                        bio: '',
                        status: 'ACTIVE',
                      })
                    }
                    className="px-3 py-1.5 rounded-xl gold-button text-xs font-bold flex items-center gap-1 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add User
                  </button>
                  <button
                    type="button"
                    onClick={loadAdminOverview}
                    className="px-3 py-1.5 rounded-xl bg-[#161622] border border-[#282838] text-xs text-[#f5d77f] flex items-center gap-1"
                    title="Refresh Users"
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

          {/* Tab: Custom Orders & Active Subscriptions */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#f5d77f]" />
                    Custom Orders ({customOrders.length}) & Subscriptions ({subscriptionsList.length})
                  </h3>
                  <p className="text-xs text-[#8c8c9e]">
                    Manage all custom content commissions, deliver vault media, or pause and clean up user subscriptions.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#12121a] p-1 rounded-xl border border-[#222230] text-xs">
                  <button
                    type="button"
                    onClick={() => setOrdersSubTab('orders')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      ordersSubTab === 'orders' ? 'gold-button' : 'text-[#8c8c9e] hover:text-white'
                    }`}
                  >
                    Custom Orders ({customOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrdersSubTab('subscriptions')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      ordersSubTab === 'subscriptions' ? 'gold-button' : 'text-[#8c8c9e] hover:text-white'
                    }`}
                  >
                    Subscriptions ({subscriptionsList.length})
                  </button>
                </div>
              </div>

              {ordersSubTab === 'orders' ? (
                <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                      <tr>
                        <th className="py-3 px-4">Request Title</th>
                        <th className="py-3 px-4">Subscriber</th>
                        <th className="py-3 px-4">Creator</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e28] text-white">
                      {customOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#161622]/40">
                          <td className="py-3.5 px-4 max-w-[240px]">
                            <div className="font-bold truncate">{ord.title}</div>
                            {ord.description && <div className="text-[10px] text-[#717182] truncate">{ord.description}</div>}
                          </td>
                          <td className="py-3.5 px-4 text-[#cbd5e1]">{ord.customerName}</td>
                          <td className="py-3.5 px-4 text-[#f5d77f]">@{ord.creatorHandle}</td>
                          <td className="py-3.5 px-4 font-bold">${Number(ord.price || 0).toFixed(2)}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-green-950/60 text-green-400 border-green-500/30'
                                  : ord.status === 'CANCELLED'
                                  ? 'bg-red-950/60 text-red-400 border-red-500/30'
                                  : 'bg-yellow-950/60 text-yellow-300 border-yellow-500/30'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <ActionIconBtn
                                icon={Edit2}
                                label="Edit Custom Order"
                                tone="gold"
                                onClick={() =>
                                  setEditOrderForm({
                                    id: ord.id,
                                    title: ord.title,
                                    description: ord.description || '',
                                    price: String(ord.price || 35),
                                    status: ord.status,
                                  })
                                }
                              />
                              {ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED' && (
                                <>
                                  <ActionIconBtn
                                    icon={Upload}
                                    label="Upload & Mark Delivered"
                                    tone="green"
                                    onClick={() =>
                                      setDeliverOrderModal({
                                        id: ord.id,
                                        title: ord.title,
                                        deliveredMediaUrl: ord.deliveredMediaUrl || '',
                                      })
                                    }
                                  />
                                  <ActionIconBtn
                                    icon={Ban}
                                    label="Cancel Custom Order"
                                    tone="amber"
                                    onClick={() => handleCancelCustomOrder(ord.id)}
                                  />
                                </>
                              )}
                              <ActionIconBtn
                                icon={Trash2}
                                label="Delete Custom Order"
                                tone="danger"
                                onClick={() =>
                                  setConfirmModal({
                                    title: `Delete Order "${ord.title}"?`,
                                    description: 'Permanently removes this custom request record.',
                                    confirmLabel: 'Delete Order',
                                    confirmTone: 'danger',
                                    onConfirm: () => handleDeleteCustomOrder(ord.id),
                                  })
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {customOrders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-[#717182]">
                            No custom requests recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-[#111117] border border-[#232330] rounded-2xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                      <tr>
                        <th className="py-3 px-4">Subscriber</th>
                        <th className="py-3 px-4">Creator</th>
                        <th className="py-3 px-4">Price / Mo</th>
                        <th className="py-3 px-4">Next Billing</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e28] text-white">
                      {subscriptionsList.map((sub) => (
                        <tr key={sub.id} className="hover:bg-[#161622]/40">
                          <td className="py-3.5 px-4">
                            <div className="font-bold">{sub.userName}</div>
                            <div className="text-[10px] font-mono text-[#717182]">{sub.userHandle}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#f5d77f]">{sub.creatorName}</div>
                            <div className="text-[10px] font-mono text-[#717182]">@{sub.creatorHandle}</div>
                          </td>
                          <td className="py-3.5 px-4 font-bold">${Number(sub.price || 0).toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-[#94a3b8]">{sub.nextBilling || '—'}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                sub.status === 'ACTIVE'
                                  ? 'bg-green-950/60 text-green-400 border-green-500/30'
                                  : 'bg-red-950/60 text-red-400 border-red-500/30'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <ActionIconBtn
                                icon={sub.status === 'ACTIVE' ? Ban : CheckCircle2}
                                label={sub.status === 'ACTIVE' ? 'Cancel Subscription' : 'Reactivate Subscription'}
                                tone={sub.status === 'ACTIVE' ? 'amber' : 'green'}
                                onClick={() =>
                                  handleToggleSubStatus(sub.id, sub.status === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE')
                                }
                              />
                              <ActionIconBtn
                                icon={Trash2}
                                label="Delete Subscription Record"
                                tone="danger"
                                onClick={() =>
                                  setConfirmModal({
                                    title: `Delete Subscription Record?`,
                                    description: `Removes ${sub.userName}'s subscription to ${sub.creatorName} from records.`,
                                    confirmLabel: 'Delete Record',
                                    confirmTone: 'danger',
                                    onConfirm: () => handleDeleteSub(sub.id),
                                  })
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {subscriptionsList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-[#717182]">
                            No subscriptions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#1c1c28]">
              <Link
                href={`/creator/${viewCreator.handle}`}
                className="flex-1 py-2.5 rounded-xl gold-button text-center font-bold flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Public Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  const target = viewCreator;
                  setViewCreator(null);
                  setEditCreatorForm({
                    id: target.id,
                    name: target.name,
                    handle: target.handle,
                    category: target.category,
                    monthlyPrice: String(target.monthlyPrice || 9.99),
                    bio: target.bio || '',
                    avatar: target.avatar || '',
                    banner: target.banner || '',
                    isVerified: Boolean(target.isVerified),
                    status: target.status || 'ACTIVE',
                  });
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#181824] border border-[#2e2e40] text-center font-semibold text-white hover:border-[#d4af37]"
              >
                Edit Creator Details
              </button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Avatar URL or Upload</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... or /api/uploads/..."
                    value={editCreatorForm.avatar || ''}
                    onChange={(e) => setEditCreatorForm({ ...editCreatorForm, avatar: e.target.value })}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                  />
                  <label className="cursor-pointer px-2.5 py-2 rounded-xl bg-[#1d1d2b] border border-[#2b2b3c] hover:border-[#d4af37] text-[#f5d77f] flex items-center gap-1 flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = '';
                        if (f) {
                          handleUploadAsset(f, 'edit-avatar', (url) =>
                            setEditCreatorForm((prev: any) => (prev ? { ...prev, avatar: url } : prev))
                          );
                        }
                      }}
                    />
                    {uploadingField === 'edit-avatar' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Banner URL or Upload</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... or /api/uploads/..."
                    value={editCreatorForm.banner || ''}
                    onChange={(e) => setEditCreatorForm({ ...editCreatorForm, banner: e.target.value })}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                  />
                  <label className="cursor-pointer px-2.5 py-2 rounded-xl bg-[#1d1d2b] border border-[#2b2b3c] hover:border-[#d4af37] text-[#f5d77f] flex items-center gap-1 flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = '';
                        if (f) {
                          handleUploadAsset(f, 'edit-banner', (url) =>
                            setEditCreatorForm((prev: any) => (prev ? { ...prev, banner: url } : prev))
                          );
                        }
                      }}
                    />
                    {uploadingField === 'edit-banner' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  </label>
                </div>
              </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-[#161622]">
              <div><span className="text-[#717182] block">Email</span><span className="text-white font-medium break-all">{viewUser.email}</span></div>
              <div><span className="text-[#717182] block">Account Status</span><span className={viewUser.status === 'ACTIVE' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{viewUser.status}</span></div>
              <div><span className="text-[#717182] block">User ID</span><span className="font-mono text-[#cbd5e1] break-all">{viewUser.id}</span></div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      {/* Create Creator Modal */}
      <PanelModal
        open={Boolean(createCreatorForm)}
        title="Create New Creator Profile"
        subtitle="Creates both authenticated user credentials and public creator profile"
        onClose={() => setCreateCreatorForm(null)}
      >
        {createCreatorForm && (
          <form onSubmit={handleCreateCreator} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={createCreatorForm.name}
                  onChange={(e) => setCreateCreatorForm({ ...createCreatorForm, name: e.target.value })}
                  placeholder="e.g. Nadia Vega"
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Handle</label>
                <input
                  type="text"
                  required
                  value={createCreatorForm.handle}
                  onChange={(e) => setCreateCreatorForm({ ...createCreatorForm, handle: e.target.value })}
                  placeholder="e.g. nadia-vega"
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={createCreatorForm.email}
                  onChange={(e) => setCreateCreatorForm({ ...createCreatorForm, email: e.target.value })}
                  placeholder="nadia@themirage.vip"
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={createCreatorForm.password}
                  onChange={(e) => setCreateCreatorForm({ ...createCreatorForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Category</label>
                <select
                  value={createCreatorForm.category}
                  onChange={(e) => setCreateCreatorForm({ ...createCreatorForm, category: e.target.value })}
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
                  value={createCreatorForm.monthlyPrice}
                  onChange={(e) => setCreateCreatorForm({ ...createCreatorForm, monthlyPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Avatar URL or Upload</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... or upload"
                    value={createCreatorForm.avatar}
                    onChange={(e) => setCreateCreatorForm({ ...createCreatorForm, avatar: e.target.value })}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                  />
                  <label className="cursor-pointer px-2.5 py-2 rounded-xl bg-[#1d1d2b] border border-[#2b2b3c] hover:border-[#d4af37] text-[#f5d77f] flex items-center flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = '';
                        if (f) {
                          handleUploadAsset(f, 'create-avatar', (url) =>
                            setCreateCreatorForm((prev: any) => (prev ? { ...prev, avatar: url } : prev))
                          );
                        }
                      }}
                    />
                    {uploadingField === 'create-avatar' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Banner URL or Upload</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... or upload"
                    value={createCreatorForm.banner}
                    onChange={(e) => setCreateCreatorForm({ ...createCreatorForm, banner: e.target.value })}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                  />
                  <label className="cursor-pointer px-2.5 py-2 rounded-xl bg-[#1d1d2b] border border-[#2b2b3c] hover:border-[#d4af37] text-[#f5d77f] flex items-center flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = '';
                        if (f) {
                          handleUploadAsset(f, 'create-banner', (url) =>
                            setCreateCreatorForm((prev: any) => (prev ? { ...prev, banner: url } : prev))
                          );
                        }
                      }}
                    />
                    {uploadingField === 'create-banner' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[#8e8e9e] mb-1">Bio</label>
              <textarea
                rows={2}
                value={createCreatorForm.bio}
                onChange={(e) => setCreateCreatorForm({ ...createCreatorForm, bio: e.target.value })}
                placeholder="Official Mirage creator bio..."
                className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
              />
            </div>
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={createCreatorForm.isVerified}
                onChange={(e) => setCreateCreatorForm({ ...createCreatorForm, isVerified: e.target.checked })}
                className="accent-[#d4af37]"
              />
              <span>Grant Verified Creator Badge immediately</span>
            </label>
            <button type="submit" className="w-full py-2.5 rounded-xl gold-button font-bold">
              Create Creator Account
            </button>
          </form>
        )}
      </PanelModal>

      {/* Create User Modal */}
      <PanelModal
        open={Boolean(createUserForm)}
        title="Create New User Account"
        subtitle="Provision Subscriber, Creator, or Administrator access directly"
        onClose={() => setCreateUserForm(null)}
      >
        {createUserForm && (
          <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={createUserForm.name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={createUserForm.username}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Role</label>
                <select
                  value={createUserForm.role}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                >
                  <option value="SUBSCRIBER">SUBSCRIBER</option>
                  <option value="CREATOR">CREATOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Initial Status</label>
                <select
                  value={createUserForm.status}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl gold-button font-bold">
              Create User Account
            </button>
          </form>
        )}
      </PanelModal>

      {/* Edit Custom Order Modal */}
      <PanelModal
        open={Boolean(editOrderForm)}
        title={`Edit Custom Order`}
        onClose={() => setEditOrderForm(null)}
      >
        {editOrderForm && (
          <form onSubmit={handleSaveCustomOrder} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#8e8e9e] mb-1">Request Title</label>
              <input
                type="text"
                required
                value={editOrderForm.title}
                onChange={(e) => setEditOrderForm({ ...editOrderForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
              />
            </div>
            <div>
              <label className="block text-[#8e8e9e] mb-1">Description / Brief</label>
              <textarea
                rows={2}
                value={editOrderForm.description}
                onChange={(e) => setEditOrderForm({ ...editOrderForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Price ($)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={editOrderForm.price}
                  onChange={(e) => setEditOrderForm({ ...editOrderForm, price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">Order Status</label>
                <select
                  value={editOrderForm.status}
                  onChange={(e) => setEditOrderForm({ ...editOrderForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                >
                  <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                  <option value="AWAITING_DELIVERY">AWAITING_DELIVERY</option>
                  <option value="PAID">PAID</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl gold-button font-bold">
              Save Custom Order
            </button>
          </form>
        )}
      </PanelModal>

      {/* Deliver Custom Order Modal */}
      <PanelModal
        open={Boolean(deliverOrderModal)}
        title={`Deliver Custom Order`}
        subtitle={deliverOrderModal?.title}
        onClose={() => setDeliverOrderModal(null)}
      >
        {deliverOrderModal && (
          <form onSubmit={handleDeliverCustomOrder} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#8e8e9e] mb-1">Delivery Media URL or Upload File</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="https://... or /api/uploads/..."
                  value={deliverOrderModal.deliveredMediaUrl}
                  onChange={(e) => setDeliverOrderModal({ ...deliverOrderModal, deliveredMediaUrl: e.target.value })}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
                <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#1d1d2b] border border-[#2b2b3c] hover:border-[#d4af37] text-[#f5d77f] flex items-center gap-1 flex-shrink-0">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = '';
                      if (f) {
                        handleUploadAsset(f, 'deliver-order', (url) =>
                          setDeliverOrderModal((prev: any) => (prev ? { ...prev, deliveredMediaUrl: url } : prev))
                        );
                      }
                    }}
                  />
                  {uploadingField === 'deliver-order' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload
                </label>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl gold-button font-bold">
              Mark Delivered & Unlock in Buyer Vault
            </button>
          </form>
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
