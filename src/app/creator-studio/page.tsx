'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Loader2,
  ExternalLink,
  X,
  UserCheck,
  Trash2,
  Play,
} from 'lucide-react';
import { calculateCommission } from '@/lib/commission';
import PanelSidebar from '@/components/PanelSidebar';
import PanelHeader from '@/components/PanelHeader';
import { ActionIconBtn, PanelModal, ConfirmActionModal, MediaThumb, ImageAssetInput } from '@/components/PanelUi';
import { fetchCurrentSessionUser, getAuthHeaders, ClientSessionUser } from '@/lib/clientAuth';

const CREATOR_CATEGORIES = ['Popular', 'New', 'Nearby', 'Fitness', 'Lifestyle', 'Fetish', 'Cosplay', 'Mature'];

export default function CreatorStudioPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<ClientSessionUser | null>(null);
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'forbidden'>('loading');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [creatorUser, setCreatorUser] = useState({
    id: '',
    name: '',
    username: '',
  });
  const [studioNotice, setStudioNotice] = useState<string | null>(null);

  const authHeaders = () => getAuthHeaders();
  const authJsonHeaders = () => ({ 'Content-Type': 'application/json', ...getAuthHeaders() });

  const showToast = (msg: string) => {
    setStudioNotice(msg);
    setTimeout(() => setStudioNotice(null), 3500);
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const me = await fetchCurrentSessionUser();
      if (!active) return;
      if (!me) {
        router.replace('/login?redirect=/creator-studio');
        return;
      }
      setSessionUser(me);
      if (me.role !== 'CREATOR') {
        setAuthState('forbidden');
        return;
      }

      const ownHandle = me.creatorHandle || me.username;
      const ownId = me.creatorId || me.id;
      setCreatorUser({ id: ownId, name: me.name, username: ownHandle });
      setAuthState('authorized');

      try {
        const res = await fetch(`/api/creators?handle=${encodeURIComponent(ownHandle)}`, { cache: 'no-store' });
        const data = await res.json();
        const own = Array.isArray(data?.creators) ? data.creators[0] : null;
        if (active && own) {
          setProfileName(own.name || me.name);
          setProfileCategory(own.category === 'Travel' ? 'Fetish' : own.category || 'Popular');
          setProfileBio(own.bio || '');
          setProfileAvatar(own.avatar || me.avatar || '');
          setProfileBanner(own.banner || '');
          if (own.monthlyPrice) setMonthlyPrice(String(own.monthlyPrice));
        }
      } catch (err) {
        console.error('Failed to load creator profile:', err);
      }

      if (active) {
        loadAllStudioData(ownHandle);
      }
    })();

    return () => {
      active = false;
    };
  }, [router]);

  // Upload Form State (Section 2 & 3 Requirements)
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [postTitle, setPostTitle] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [postVisibility, setPostVisibility] = useState<'PUBLIC' | 'SUBSCRIBER_ONLY' | 'PURCHASE_ONLY'>('PURCHASE_ONLY');
  const [isPublicPreview, setIsPublicPreview] = useState(false);
  const [postStatus, setPostStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [postPrice, setPostPrice] = useState('15.00');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

  // Editing existing post price/status
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState('');

  // Profile & Monthly Subscription Settings state
  const [profileName, setProfileName] = useState('Luna Rae');
  const [profileCategory, setProfileCategory] = useState('Popular');
  const [profileBio, setProfileBio] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileBanner, setProfileBanner] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('9.99');
  const [priceSaveSuccess, setPriceSaveSuccess] = useState(false);

  // Live Custom Content Orders state
  const [orders, setOrders] = useState<any[]>([]);

  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [deliveryFileUrl, setDeliveryFileUrl] = useState('');

  const uploadMediaFile = async (
    file: File,
    slot: 'media' | 'thumbnail' | 'delivery' | 'avatar' | 'banner'
  ): Promise<{ url: string; mediaType: 'IMAGE' | 'VIDEO'; originalName: string } | null> => {
    setUploadingSlot(slot);
    if (slot === 'media') setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: formData });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.url) {
        const msg = data?.message || 'File upload failed. Supported: JPG, PNG, WEBP, GIF, MP4, MOV, WEBM.';
        if (slot === 'media') setUploadError(msg);
        else showToast(msg);
        return null;
      }
      showToast(`${data.originalName || 'File'} uploaded successfully!`);
      return data;
    } catch (err) {
      const msg = 'Upload failed. Check file size (max 100MB) and try again.';
      if (slot === 'media') setUploadError(msg);
      else showToast(msg);
      return null;
    } finally {
      setUploadingSlot(null);
    }
  };

  // Feed posts (loaded from /api/content/posts?studio=true)
  interface CreatorFeedPost {
    id: string;
    type: 'image' | 'video' | 'IMAGE' | 'VIDEO';
    title: string;
    url: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    caption: string;
    visibility: 'PUBLIC' | 'SUBSCRIBER_ONLY' | 'PURCHASE_ONLY';
    isPublicPreview?: boolean;
    price: number;
    status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
    likes: number;
    salesCount?: number;
    date: string;
  }

  const [feedPosts, setFeedPosts] = useState<CreatorFeedPost[]>([]);

  // Studio Action Modals (View / Edit / Delete)
  const [viewPostModal, setViewPostModal] = useState<CreatorFeedPost | null>(null);
  const [editPostForm, setEditPostForm] = useState<{
    id: string;
    title: string;
    caption: string;
    visibility: 'PUBLIC' | 'SUBSCRIBER_ONLY' | 'PURCHASE_ONLY';
    price: string;
    status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
    mediaUrl: string;
    thumbnailUrl: string;
  } | null>(null);
  const [viewOrderModal, setViewOrderModal] = useState<any | null>(null);
  const [editOrderForm, setEditOrderForm] = useState<{
    id: string;
    title: string;
    description: string;
    price: string;
  } | null>(null);
  const [viewSaleModal, setViewSaleModal] = useState<any | null>(null);
  const [viewSubscriberModal, setViewSubscriberModal] = useState<any | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    confirmTone?: 'danger' | 'gold';
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Live Earnings Breakdown State
  const [revenueFilter, setRevenueFilter] = useState<'ALL' | 'SUBSCRIPTIONS' | 'INDIVIDUAL' | 'CUSTOM'>('ALL');
  const [commissionSplit, setCommissionSplit] = useState({ creatorPercent: 85, platformPercent: 15 });
  const [earningsSummary, setEarningsSummary] = useState({
    subscriptions: { count: 0, grossAmount: 0, creatorNet: 0, platformShare: 0 },
    individualContent: { count: 0, grossAmount: 0, creatorNet: 0, platformShare: 0 },
    customRequests: { count: 0, grossAmount: 0, creatorNet: 0, platformShare: 0 },
    totals: { totalGross: 0, totalCreatorNet: 0, totalPlatformCut: 0 },
    activeSubscribersCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  const loadAllStudioData = async (targetHandle: string) => {
    try {
      const headers = authHeaders();
      const [postsRes, earningsRes, ordersRes] = await Promise.all([
        fetch(`/api/content/posts?handle=${encodeURIComponent(targetHandle)}&studio=true`, { headers, cache: 'no-store' }),
        fetch(`/api/creator/earnings?creatorId=${encodeURIComponent(targetHandle)}`, { headers, cache: 'no-store' }),
        fetch(`/api/custom-requests?creatorId=${encodeURIComponent(targetHandle)}`, { headers, cache: 'no-store' }),
      ]);

      if (postsRes.ok) {
        const json = await postsRes.json();
        if (json?.posts && Array.isArray(json.posts)) {
          setFeedPosts(
            json.posts.map((p: any) => ({
              id: p.id,
              type: p.mediaType,
              title: p.title,
              url: p.thumbnailUrl || p.mediaUrl,
              mediaUrl: p.mediaUrl || p.thumbnailUrl,
              thumbnailUrl: p.thumbnailUrl || p.mediaUrl,
              caption: p.caption,
              visibility: p.visibility,
              isPublicPreview: Boolean(p.isPublicPreview),
              price: p.price || 0,
              status: p.status || 'PUBLISHED',
              likes: p.likeCount || 0,
              salesCount: p.salesCount || 0,
              date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
            }))
          );
        }
      }

      if (earningsRes.ok) {
        const eJson = await earningsRes.json();
        const e = eJson?.earnings;
        if (e) {
          setEarningsSummary({
            subscriptions: e.subscriptions || { count: 0, grossAmount: 0, creatorNet: 0, platformShare: 0 },
            individualContent: e.individualContent || { count: 0, grossAmount: 0, creatorNet: 0, platformShare: 0 },
            customRequests: e.customRequests || { count: 0, grossAmount: 0, creatorNet: 0, platformShare: 0 },
            totals: e.totals || { totalGross: 0, totalCreatorNet: 0, totalPlatformCut: 0 },
            activeSubscribersCount: e.activeSubscribersCount ?? 0,
          });
          if (Array.isArray(e.recentTransactions)) setRecentTransactions(e.recentTransactions);
          if (Array.isArray(e.subscribersList)) setSubscribers(e.subscribersList);
          if (e.creatorProfile?.monthlyPrice) setMonthlyPrice(String(e.creatorProfile.monthlyPrice));
          if (e.settings) {
            setCommissionSplit({
              creatorPercent: e.settings.creatorCommissionPercent || 85,
              platformPercent: e.settings.platformCommissionPercent || 15,
            });
          }
        }
      }

      if (ordersRes.ok) {
        const oJson = await ordersRes.json();
        if (Array.isArray(oJson?.requests)) {
          setOrders(oJson.requests);
        }
      }
    } catch (e) {
      console.error('Error loading Creator Studio data:', e);
    }
  };

  const subscriptionGross = earningsSummary.subscriptions.grossAmount;
  const individualContentGross = earningsSummary.individualContent.grossAmount;
  const customOrdersGross = earningsSummary.customRequests.grossAmount;

  const totalCommission = {
    grossAmount: earningsSummary.totals.totalGross,
    creatorShare: earningsSummary.totals.totalCreatorNet,
  };
  const subCommission = { creatorShare: earningsSummary.subscriptions.creatorNet };
  const indCommission = { creatorShare: earningsSummary.individualContent.creatorNet };
  const custCommission = { creatorShare: earningsSummary.customRequests.creatorNet };

  const filteredLedgerTxs = recentTransactions.filter((tx) => {
    if (revenueFilter === 'INDIVIDUAL') return tx.type === 'INDIVIDUAL_CONTENT';
    if (revenueFilter === 'SUBSCRIPTIONS') return tx.type === 'SUBSCRIPTION';
    if (revenueFilter === 'CUSTOM') return tx.type === 'CUSTOM_CONTENT';
    return true;
  });

  // Calculate current public profile preview counts (max 3 photos, max 2 videos)
  const previewPhotosCount = feedPosts.filter(
    p => (p.type === 'image' || p.type === 'IMAGE') && p.isPublicPreview && p.status === 'PUBLISHED'
  ).length;
  const previewVideosCount = feedPosts.filter(
    p => (p.type === 'video' || p.type === 'VIDEO') && p.isPublicPreview && p.status === 'PUBLISHED'
  ).length;

  const handleDeliverOrder = async (orderId: string) => {
    if (!deliveryFileUrl.trim()) {
      showToast('Please enter a private delivery media URL');
      return;
    }
    try {
      const res = await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          requestId: orderId,
          action: 'DELIVER',
          deliveredMediaUrl: deliveryFileUrl.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'DELIVERED', deliveredMediaUrl: deliveryFileUrl.trim() } : o)));
        setDeliveringOrderId(null);
        setDeliveryFileUrl('');
        showToast('Custom content delivered & unlocked in customer vault!');
      } else {
        showToast(data?.message || 'Failed to deliver custom order');
      }
    } catch (e) {
      showToast('Failed to deliver custom order');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (!mediaUrl.trim()) {
      setUploadError('Please upload a photo/video from your device or enter a media URL.');
      return;
    }
    if (!rightsConfirmed) {
      setUploadError('You must confirm 100% rights and 18+ model consent.');
      return;
    }

    // Preview Limits Validation (max 3 photos, max 2 videos)
    if (isPublicPreview) {
      if (mediaType === 'IMAGE' && previewPhotosCount >= 3) {
        setUploadError('Limit reached: Maximum 3 public preview photos allowed per creator. Please unmark an existing preview photo first.');
        return;
      }
      if (mediaType === 'VIDEO' && previewVideosCount >= 2) {
        setUploadError('Limit reached: Maximum 2 public preview videos allowed per creator. Please unmark an existing preview video first.');
        return;
      }
    }

    const price = (!isPublicPreview && postVisibility === 'PURCHASE_ONLY') ? parseFloat(postPrice) || 9.99 : 0;

    const newPost: CreatorFeedPost = {
      id: `fp-${Date.now()}`,
      type: mediaType,
      title: postTitle || (mediaType === 'VIDEO' ? 'Exclusive Video' : 'Exclusive Photo Set'),
      url: mediaUrl,
      caption: postCaption || 'Exclusive new update',
      visibility: isPublicPreview ? 'PUBLIC' : postVisibility,
      isPublicPreview: Boolean(isPublicPreview),
      price,
      status: postStatus,
      likes: 0,
      date: 'Just now',
    };

    // Persist to backend contentStore
    try {
      const res = await fetch('/api/content/posts', {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          creatorId: creatorUser.id,
          creatorHandle: creatorUser.username,
          creatorName: creatorUser.name,
          title: newPost.title,
          caption: newPost.caption,
          mediaType,
          mediaUrl,
          thumbnailUrl: thumbnailUrl || mediaUrl,
          visibility: newPost.visibility,
          isPublicPreview: newPost.isPublicPreview,
          status: postStatus,
          price,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.post) {
        setUploadError(data?.message || 'Failed to publish post. Please try again.');
        return;
      }
      setFeedPosts(prev => [
        {
          id: data.post.id,
          type: data.post.mediaType,
          title: data.post.title,
          url: data.post.thumbnailUrl || data.post.mediaUrl,
          mediaUrl: data.post.mediaUrl || data.post.thumbnailUrl,
          thumbnailUrl: data.post.thumbnailUrl || data.post.mediaUrl,
          caption: data.post.caption,
          visibility: data.post.visibility,
          isPublicPreview: Boolean(data.post.isPublicPreview),
          price: data.post.price || 0,
          status: data.post.status,
          likes: 0,
          salesCount: 0,
          date: 'Just now',
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Failed to sync new post to backend:', err);
      setUploadError('Network error while publishing post. Please try again.');
      return;
    }

    setUploadSuccess(true);
    setTimeout(() => {
      setPostTitle('');
      setPostCaption('');
      setMediaUrl('');
      setThumbnailUrl('');
      setIsPublicPreview(false);
      setRightsConfirmed(false);
      setUploadSuccess(false);
      setActiveTab('feed');
    }, 1200);
  };

  const handleTogglePreview = async (postId: string) => {
    const target = feedPosts.find(p => p.id === postId);
    if (!target) return;

    if (target.isPublicPreview) {
      setFeedPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, isPublicPreview: false } : p
        )
      );
      try {
        const res = await fetch('/api/content/posts', {
          method: 'PATCH',
          headers: authJsonHeaders(),
          body: JSON.stringify({
            postId,
            creatorId: creatorUser.id,
            updates: { isPublicPreview: false },
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          setFeedPosts(prev =>
            prev.map(p =>
              p.id === postId ? { ...p, isPublicPreview: true } : p
            )
          );
          showToast(data?.message || 'Failed to update preview setting');
        }
      } catch {
        setFeedPosts(prev =>
          prev.map(p =>
            p.id === postId ? { ...p, isPublicPreview: true } : p
          )
        );
        showToast('Network error updating preview setting');
      }
    } else {
      const isVid = target.type === 'video' || target.type === 'VIDEO';
      if (!isVid && previewPhotosCount >= 3) {
        showToast('Limit reached: Max 3 public preview photos allowed. Unmark one first.');
        return;
      }
      if (isVid && previewVideosCount >= 2) {
        showToast('Limit reached: Max 2 public preview videos allowed. Unmark one first.');
        return;
      }
      const prevVisibility = target.visibility;
      setFeedPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, isPublicPreview: true, visibility: 'PUBLIC' } : p
        )
      );
      try {
        const res = await fetch('/api/content/posts', {
          method: 'PATCH',
          headers: authJsonHeaders(),
          body: JSON.stringify({
            postId,
            creatorId: creatorUser.id,
            updates: { isPublicPreview: true, visibility: 'PUBLIC' },
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          setFeedPosts(prev =>
            prev.map(p =>
              p.id === postId ? { ...p, isPublicPreview: false, visibility: prevVisibility } : p
            )
          );
          showToast(data?.message || 'Could not mark post as preview');
        }
      } catch {
        setFeedPosts(prev =>
          prev.map(p =>
            p.id === postId ? { ...p, isPublicPreview: false, visibility: prevVisibility } : p
          )
        );
        showToast('Network error updating preview');
      }
    }
  };

  const handleUpdatePrice = async (postId: string) => {
    const target = feedPosts.find(p => p.id === postId);
    const p = parseFloat(editPriceInput);
    if (isNaN(p) || p <= 0) {
      showToast('Please enter a valid price amount');
      return;
    }
    const previousPrice = target?.price ?? 0;
    setFeedPosts(prev =>
      prev.map(post =>
        post.id === postId ? { ...post, price: p } : post
      )
    );
    setEditingPostId(null);
    setEditPriceInput('');

    try {
      const res = await fetch('/api/content/posts', {
        method: 'PATCH',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          postId,
          creatorId: creatorUser.id,
          updates: { price: p },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setFeedPosts(prev =>
          prev.map(post =>
            post.id === postId ? { ...post, price: previousPrice } : post
          )
        );
        showToast(data?.message || 'Failed to update price');
      } else {
        showToast(`Price updated to $${p.toFixed(2)}`);
      }
    } catch {
      setFeedPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, price: previousPrice } : post
        )
      );
      showToast('Network error updating price');
    }
  };

  const handleToggleStatus = async (postId: string) => {
    const target = feedPosts.find(p => p.id === postId);
    if (!target) return;
    const prevStatus = target.status;
    const nextStatus = target.status === 'PUBLISHED' ? ('DRAFT' as const) : ('PUBLISHED' as const);

    setFeedPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          return { ...post, status: nextStatus };
        }
        return post;
      })
    );

    try {
      const res = await fetch('/api/content/posts', {
        method: 'PATCH',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          postId,
          creatorId: creatorUser.id,
          updates: { status: nextStatus },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setFeedPosts(prev =>
          prev.map(post => (post.id === postId ? { ...post, status: prevStatus } : post))
        );
        showToast(data?.message || 'Failed to update status');
      }
    } catch {
      setFeedPosts(prev =>
        prev.map(post => (post.id === postId ? { ...post, status: prevStatus } : post))
      );
      showToast('Network error updating status');
    }
  };

  const handleSaveEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPostForm) return;
    try {
      const res = await fetch('/api/content/posts', {
        method: 'PATCH',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          postId: editPostForm.id,
          creatorId: creatorUser.id,
          updates: {
            title: editPostForm.title.trim(),
            caption: editPostForm.caption,
            visibility: editPostForm.visibility,
            price: editPostForm.visibility === 'PURCHASE_ONLY' ? Number(editPostForm.price || 0) : 0,
            status: editPostForm.status,
            mediaUrl: editPostForm.mediaUrl.trim(),
            thumbnailUrl: editPostForm.thumbnailUrl.trim() || editPostForm.mediaUrl.trim(),
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.post) {
        setFeedPosts(prev =>
          prev.map(p =>
            p.id === editPostForm.id
              ? {
                  ...p,
                  title: data.post.title,
                  caption: data.post.caption,
                  visibility: data.post.visibility,
                  price: data.post.price || 0,
                  status: data.post.status,
                  url: data.post.thumbnailUrl || data.post.mediaUrl,
                  mediaUrl: data.post.mediaUrl,
                  thumbnailUrl: data.post.thumbnailUrl,
                }
              : p
          )
        );
        setEditPostForm(null);
        showToast(`Post "${data.post.title}" updated successfully!`);
      } else {
        showToast(data?.message || 'Failed to update post');
      }
    } catch (err) {
      showToast('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(
        `/api/content/posts?postId=${encodeURIComponent(postId)}`,
        { method: 'DELETE', headers: authHeaders() }
      );
      const data = await res.json();
      if (data.success) {
        setFeedPosts(prev => prev.filter(p => p.id !== postId));
        showToast('Post deleted permanently');
      } else {
        showToast(data?.message || 'Failed to delete post');
      }
    } catch (err) {
      showToast('Failed to delete post');
    }
  };

  const handleSaveEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrderForm) return;
    try {
      const res = await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          requestId: editOrderForm.id,
          action: 'UPDATE',
          title: editOrderForm.title.trim(),
          description: editOrderForm.description.trim(),
          price: Number(editOrderForm.price),
        }),
      });
      const data = await res.json();
      if (data.success && data.request) {
        setOrders(prev => prev.map(o => (o.id === editOrderForm.id ? { ...o, ...data.request } : o)));
        setEditOrderForm(null);
        showToast(`Custom order "${data.request.title}" updated!`);
      } else {
        showToast(data?.message || 'Failed to update order');
      }
    } catch (err) {
      showToast('Failed to update custom order');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/custom-requests?requestId=${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        showToast('Custom order removed');
      } else {
        showToast(data?.message || 'Failed to delete custom order');
      }
    } catch (err) {
      showToast('Failed to delete custom order');
    }
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
        return `${commissionSplit.creatorPercent}% Sales & Earnings Ledger`;
      case 'subscribers':
        return 'Active Subscribers & Fans';
      case 'settings':
        return 'Profile, Cover & Subscription Settings';
      default:
        return 'Creator Studio';
    }
  };

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-[#d4af37] text-sm">
        Verifying your Creator Studio session...
      </div>
    );
  }

  if (authState === 'forbidden') {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-[#111117] border border-[#d4af37]/40 text-center space-y-4">
          <Crown className="w-10 h-10 text-[#f5d77f] mx-auto" />
          <h2 className="text-lg font-serif font-bold text-white">Creator Account Required</h2>
          <p className="text-xs text-[#94a3b8]">
            You are signed in as <span className="text-white font-semibold">{sessionUser?.name}</span> ({sessionUser?.role}). Only authenticated creators can access their own Creator Studio.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              href={sessionUser?.role === 'ADMIN' ? '/admin' : '/dashboard'}
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
        userName={creatorUser.name}
        userHandle={`@${creatorUser.username}`}
        userAvatar={profileAvatar}
        chatHref={`/chat?role=creator&creator=${encodeURIComponent(creatorUser.username)}`}
        badges={{
          orders: String(orders.filter(o => o.status !== 'DELIVERED').length || 0),
          feed: String(feedPosts.length),
          earnings: `$${totalCommission.creatorShare.toFixed(0)}`,
          subscribers: String(earningsSummary.activeSubscribersCount),
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
          role="CREATOR"
          statusLabel={`Creator Revenue: ${commissionSplit.creatorPercent}% Active`}
        />

        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {studioNotice && (
            <div className="p-3.5 rounded-xl bg-green-950/70 border border-green-500/40 text-green-300 text-xs flex items-center gap-2 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>{studioNotice}</span>
            </div>
          )}

          {/* Verified Creator Account Identity Banner (with Cover Pic + Quick Profile Edit) */}
          <div className="rounded-2xl bg-[#111118] border border-[#262638] overflow-hidden">
            <div className="relative h-24 sm:h-28 w-full bg-gradient-to-r from-[#191625] via-[#211b10] to-[#12121b]">
              {profileBanner && (
                <img src={profileBanner} alt="Creator cover banner" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-[#111118]/35 to-transparent" />
            </div>
            <div className="px-4 pb-4 sm:px-5 sm:pb-4 -mt-7 relative flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex items-end gap-3 min-w-0">
                {profileAvatar ? (
                  <img
                    src={profileAvatar}
                    alt={creatorUser.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#d4af37] bg-[#101018] flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#161622] border-2 border-[#d4af37] flex items-center justify-center text-lg font-bold text-[#f5d77f] flex-shrink-0">
                    {creatorUser.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 pb-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#f5d77f] font-bold">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Verified Creator Studio</span>
                  </div>
                  <p className="text-sm sm:text-base font-serif font-bold text-white truncate">
                    {creatorUser.name} <span className="text-xs font-sans font-normal text-[#8d8ea0]">(@{creatorUser.username})</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="px-3 py-2 rounded-xl bg-[#181826] hover:bg-[#222234] border border-[#d4af37]/40 text-xs font-semibold text-[#f5d77f] flex items-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Edit Photo & Cover
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="px-3.5 py-2 rounded-xl gold-button text-xs font-bold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Media
                </button>
                <Link
                  href={`/creator/${creatorUser.username}`}
                  className="px-3 py-2 rounded-xl bg-[#161622] hover:bg-[#1e1e2e] border border-[#2d2d40] text-xs font-semibold text-[#cbd5e1] flex items-center gap-1.5 transition-colors"
                >
                  <span>View Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#f5d77f]" />
                </Link>
              </div>
            </div>
          </div>

          {/* 4 Financial & Engagement KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#111117] border border-[#22222e]">
              <div className="flex justify-between items-center text-[#7e7e90] text-xs mb-2">
                <span>Total {commissionSplit.creatorPercent}% Net Earnings</span>
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
                {earningsSummary.individualContent.count} pay-per-view orders
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111117] border border-[#22222e]">
              <div className="flex justify-between items-center text-[#7e7e90] text-xs mb-2">
                <span>Active Subscribers</span>
                <Users className="w-4 h-4 text-[#f5d77f]" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">{earningsSummary.activeSubscribersCount}</div>
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
                  <h3 className="text-base font-serif font-bold text-white">
                    The Mirage {commissionSplit.creatorPercent}/{commissionSplit.platformPercent} Agreement
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 px-2 py-0.5 rounded-full bg-green-950/40 border border-green-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#8c8c9e] leading-relaxed">
                  You earn an industry-leading <strong className="text-white">{commissionSplit.creatorPercent}% of net revenues</strong> from all individual content purchases, subscriptions, and custom commissions.
                </p>
                <div className="p-3.5 rounded-xl bg-[#161622] flex items-center justify-between text-xs">
                  <span className="text-[#9fa3af]">Platform Revenue Cut:</span>
                  <span className="text-[#f5d77f] font-semibold">
                    {commissionSplit.platformPercent}% Platform / Weekly Payout Ledger
                  </span>
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
                  <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                        You receive {commissionSplit.creatorPercent}% ($
                        {((parseFloat(postPrice || '0') * commissionSplit.creatorPercent) / 100).toFixed(2)})
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
                    placeholder="e.g. Behind the Scenes Midnight Shoot"
                    className="w-full px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Direct Device Upload + Optional URL Fallback */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[#9da3af]">
                      3. Upload Photo or Video File
                    </label>
                    {mediaUrl && (
                      <button
                        type="button"
                        onClick={() => setMediaUrl('')}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Clear File
                      </button>
                    )}
                  </div>

                  <label className="block cursor-pointer rounded-2xl bg-[#161622] hover:bg-[#1b1b29] border-2 border-dashed border-[#d4af37]/45 hover:border-[#d4af37] p-5 text-center transition-colors">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (!file) return;
                        const uploaded = await uploadMediaFile(file, 'media');
                        if (uploaded) {
                          setMediaUrl(uploaded.url);
                          setMediaType(uploaded.mediaType);
                          if (!postTitle.trim()) {
                            const cleanTitle = uploaded.originalName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
                            if (cleanTitle) setPostTitle(cleanTitle);
                          }
                        }
                      }}
                    />
                    <div className="flex flex-col items-center gap-2">
                      {uploadingSlot === 'media' ? (
                        <>
                          <Loader2 className="w-7 h-7 text-[#f5d77f] animate-spin" />
                          <span className="text-xs font-bold text-[#f5d77f]">Uploading media to vault...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-11 h-11 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-[#f5d77f]" />
                          </div>
                          <span className="text-sm font-bold text-white">
                            {mediaUrl ? 'Tap to Replace Uploaded Photo / Video' : 'Tap to Choose Photo or Video from Device'}
                          </span>
                          <span className="text-[11px] text-[#8d8ea0]">
                            Supports Phone Gallery / Camera / Files • JPG, PNG, WEBP, GIF, MP4, MOV, WEBM (Max 100MB)
                          </span>
                        </>
                      )}
                    </div>
                  </label>

                  {/* Live Uploaded Media Preview */}
                  {mediaUrl && (
                    <div className="rounded-2xl overflow-hidden bg-black border border-[#2b2b3c]">
                      {mediaType === 'VIDEO' ? (
                        <video src={mediaUrl} controls playsInline muted className="w-full max-h-64 object-contain bg-black" />
                      ) : (
                        <MediaThumb src={mediaUrl} alt="Uploaded preview" className="w-full max-h-64 object-contain bg-black" />
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-medium text-[#7e7e90] mb-1">
                      Or Paste Direct Media URL (Optional if uploaded above)
                    </label>
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="/api/uploads/... or https://..."
                      className="w-full px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <p className="text-[10px] text-[#717182]">
                    Non-buyers will never receive protected media URLs directly; only buyers are authorized by the backend.
                  </p>
                </div>

                {/* Video Thumbnail (Optional / for Videos) */}
                {mediaType === 'VIDEO' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#9da3af]">
                      Video Poster / Thumbnail Preview (Optional)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-[#181824] hover:bg-[#222232] border border-[#d4af37]/40 text-xs font-bold text-[#f5d77f] flex items-center justify-center gap-1.5 flex-shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            e.target.value = '';
                            if (!file) return;
                            const uploaded = await uploadMediaFile(file, 'thumbnail');
                            if (uploaded) setThumbnailUrl(uploaded.url);
                          }}
                        />
                        {uploadingSlot === 'thumbnail' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5" />
                        )}
                        Upload Thumbnail
                      </label>
                      <input
                        type="text"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder="Optional image URL or /api/uploads/..."
                        className="flex-1 px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
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

                {/* Public Profile Preview Selector (Section 7 Requirement) */}
                <div className="p-4 rounded-2xl bg-[#151520] border border-[#2d2d40] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#f5d77f]" />
                      <span>Public Profile Preview</span>
                    </label>
                    <span className="text-[11px] font-mono text-[#f5d77f] bg-black/40 px-2.5 py-0.5 rounded-full border border-[#d4af37]/30">
                      Photos: {previewPhotosCount}/3 • Videos: {previewVideosCount}/2
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="publicPreview"
                      checked={isPublicPreview}
                      onChange={(e) => setIsPublicPreview(e.target.checked)}
                      className="mt-1 accent-[#d4af37] w-4 h-4"
                    />
                    <label htmlFor="publicPreview" className="text-xs text-[#cbd5e1] leading-relaxed cursor-pointer">
                      <strong className="text-white">Mark as Public Profile Preview</strong>
                      <span className="block text-[11px] text-[#8e8e9e] mt-0.5">
                        Feature this media in your public profile preview grid for visitors to view before subscribing (max 3 photos & 2 videos per creator).
                      </span>
                    </label>
                  </div>
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

              {orders.length === 0 && (
                <div className="p-8 rounded-2xl bg-[#111117] border border-[#262636] text-center text-xs text-[#8a8a9e]">
                  No custom content orders yet. Orders submitted by fans in 1-on-1 chat will appear here.
                </div>
              )}
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
                      <p className="text-[10px] text-[#555566]">
                        Requested: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5">
                        <ActionIconBtn icon={Eye} label="View Order Details" tone="neutral" onClick={() => setViewOrderModal(order)} />
                        {order.status !== 'DELIVERED' && (
                          <ActionIconBtn
                            icon={Edit2}
                            label="Edit Order Details"
                            tone="gold"
                            onClick={() =>
                              setEditOrderForm({
                                id: order.id,
                                title: order.title || '',
                                description: order.description || '',
                                price: String(order.price || 35),
                              })
                            }
                          />
                        )}
                        <ActionIconBtn
                          icon={Trash2}
                          label="Delete Custom Order"
                          tone="danger"
                          onClick={() =>
                            setConfirmModal({
                              title: `Delete Order "${order.title}"?`,
                              description: `Remove this custom order from ${order.customerName}.`,
                              confirmLabel: 'Delete Order',
                              confirmTone: 'danger',
                              onConfirm: () => handleDeleteOrder(order.id),
                            })
                          }
                        />
                      </div>
                      {order.status === 'DELIVERED' ? (
                        <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Completed & Paid
                        </span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {deliveringOrderId === order.id ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#222232] border border-[#d4af37]/40 text-[11px] font-bold text-[#f5d77f] flex items-center gap-1">
                                <input
                                  type="file"
                                  accept="image/*,video/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    e.target.value = '';
                                    if (!file) return;
                                    const uploaded = await uploadMediaFile(file, 'delivery');
                                    if (uploaded) setDeliveryFileUrl(uploaded.url);
                                  }}
                                />
                                {uploadingSlot === 'delivery' ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5" />
                                )}
                                Upload
                              </label>
                              <input
                                type="text"
                                value={deliveryFileUrl}
                                onChange={(e) => setDeliveryFileUrl(e.target.value)}
                                placeholder="Upload file or paste URL..."
                                className="flex-1 min-w-[160px] px-3 py-1.5 bg-[#181824] border border-[#2e2e3e] rounded-lg text-xs text-white"
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
                                setDeliveryFileUrl('');
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
                    <div className="flex gap-3 sm:gap-4">
                      <MediaThumb
                        src={post.thumbnailUrl || post.url}
                        fallbackSrc={post.mediaUrl || post.url}
                        mediaType={post.type}
                        alt={post.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0 bg-black"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          {post.isPublicPreview && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#292212] text-[#f5d77f] border border-[#d4af37]/60 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#f5d77f]" />
                              Public Profile Preview
                            </span>
                          )}

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
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <ActionIconBtn icon={Eye} label="Preview Media" tone="neutral" onClick={() => setViewPostModal(post)} />
                            <ActionIconBtn
                              icon={Edit2}
                              label="Edit Post Details & Price"
                              tone="gold"
                              onClick={() =>
                                setEditPostForm({
                                  id: post.id,
                                  title: post.title,
                                  caption: post.caption || '',
                                  visibility: post.visibility,
                                  price: String(post.price || 0),
                                  status: post.status,
                                  mediaUrl: post.mediaUrl || post.url,
                                  thumbnailUrl: post.thumbnailUrl || post.url,
                                })
                              }
                            />
                            <ActionIconBtn
                              icon={post.status === 'PUBLISHED' ? Archive : CheckCircle2}
                              label={post.status === 'PUBLISHED' ? 'Set as Draft' : 'Publish Post'}
                              tone={post.status === 'PUBLISHED' ? 'amber' : 'green'}
                              onClick={() => handleToggleStatus(post.id)}
                            />
                            <ActionIconBtn
                              icon={Sparkles}
                              label={post.isPublicPreview ? 'Remove from Public Preview' : 'Feature as Public Preview'}
                              tone={post.isPublicPreview ? 'gold' : 'neutral'}
                              onClick={() => handleTogglePreview(post.id)}
                            />
                            <ActionIconBtn
                              icon={Trash2}
                              label="Delete Post"
                              tone="danger"
                              onClick={() =>
                                setConfirmModal({
                                  title: `Delete "${post.title}"?`,
                                  description: 'This permanently deletes the media post from your studio and public feed.',
                                  confirmLabel: 'Delete Post',
                                  confirmTone: 'danger',
                                  onConfirm: () => handleDeletePost(post.id),
                                })
                              }
                            />
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

          {/* Tab 5: Earnings & Reports */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-serif font-bold text-white">
                    {commissionSplit.creatorPercent}% Revenue Earnings Breakdown
                  </h3>
                  <p className="text-xs text-[#8c8c9e]">
                    Complete transparency: You receive {commissionSplit.creatorPercent}% of net revenues from subscriptions, individual sales, and custom requests.
                  </p>
                </div>

                {/* Revenue Type Filter */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#161622] border border-[#2b2b3a] text-xs">
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
                  <button
                    onClick={() => setRevenueFilter('CUSTOM')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      revenueFilter === 'CUSTOM' ? 'bg-[#d4af37] text-black font-bold' : 'text-[#8e8e9e] hover:text-white'
                    }`}
                  >
                    Custom Orders
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
                    <span className="text-xs text-[#6e6e80] font-sans font-normal"> ({commissionSplit.creatorPercent}% net)</span>
                  </div>
                  <p className="text-[11px] text-[#717182]">Gross: ${subscriptionGross.toFixed(2)} • {earningsSummary.activeSubscribersCount} Active Members</p>
                </div>

                {/* 2. Individual Content Sales */}
                <div className="p-5 rounded-2xl bg-[#111117] border border-[#d4af37]/40 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#f5d77f]">
                    <span className="font-bold">Individual Paid Content</span>
                    <CreditCard className="w-4 h-4 text-[#f5d77f]" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-[#f5d77f]">
                    ${indCommission.creatorShare.toFixed(2)}
                    <span className="text-xs text-[#a0821e] font-sans font-normal"> ({commissionSplit.creatorPercent}% net)</span>
                  </div>
                  <p className="text-[11px] text-[#717182]">Gross: ${individualContentGross.toFixed(2)} • {earningsSummary.individualContent.count} Paid Purchases</p>
                </div>

                {/* 3. Custom Content Requests */}
                <div className="p-5 rounded-2xl bg-[#111117] border border-[#22222e] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8e8e9e]">
                    <span>Custom Requests</span>
                    <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <div className="text-2xl font-bold font-serif text-white">
                    ${custCommission.creatorShare.toFixed(2)}
                    <span className="text-xs text-[#6e6e80] font-sans font-normal"> ({commissionSplit.creatorPercent}% net)</span>
                  </div>
                  <p className="text-[11px] text-[#717182]">Gross: ${customOrdersGross.toFixed(2)} • {earningsSummary.customRequests.count} Paid Orders</p>
                </div>
              </div>

              {/* Sales Orders Ledger Table */}
              <div className="p-6 rounded-2xl bg-[#111118] border border-[#232330] space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-white">
                    Sales & Commission Ledger ({filteredLedgerTxs.length})
                  </h4>
                  <span className="text-xs text-[#d4af37] font-semibold">
                    Configured Split: {commissionSplit.creatorPercent}% Creator / {commissionSplit.platformPercent}% Platform
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#161622] text-[#8e8e9e] border-b border-[#232330]">
                      <tr>
                        <th className="py-3 px-4">Order Reference</th>
                        <th className="py-3 px-4">Content / Description</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Buyer</th>
                        <th className="py-3 px-4">Price Paid</th>
                        <th className="py-3 px-4">Your {commissionSplit.creatorPercent}% Net</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e28] text-white">
                      {filteredLedgerTxs.map((sale) => (
                        <tr key={sale.id} className="hover:bg-[#161622]/40">
                          <td className="py-3.5 px-4 font-mono text-[#d4af37] font-semibold">{sale.transactionReference}</td>
                          <td className="py-3.5 px-4 font-bold">{sale.postTitle || sale.type}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#181824] border border-[#2b2b3d]">
                              {sale.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#94a3b8]">{sale.userName}</td>
                          <td className="py-3.5 px-4 font-bold">${Number(sale.grossAmount).toFixed(2)}</td>
                          <td className="py-3.5 px-4 font-bold text-green-400">${Number(sale.creatorShare).toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-[#717182]">
                            {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-950/60 text-green-400 border border-green-500/30">
                              {sale.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <ActionIconBtn icon={Eye} label="View Sale Receipt" tone="gold" onClick={() => setViewSaleModal(sale)} />
                          </td>
                        </tr>
                      ))}
                      {filteredLedgerTxs.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-[#717182]">
                            No sales recorded in this category yet.
                          </td>
                        </tr>
                      )}
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
                          <div className="flex items-center gap-1.5">
                            <ActionIconBtn icon={Eye} label="View Subscriber Details" tone="neutral" onClick={() => setViewSubscriberModal(sub)} />
                            <ActionIconBtn
                              icon={MessageSquare}
                              label={`Chat with ${sub.name}`}
                              tone="gold"
                              href={
                                sub.userId
                                  ? `/chat?role=creator&customer=${encodeURIComponent(sub.userId)}`
                                  : '/chat?role=creator'
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

          {/* Tab 7: Creator Profile & Subscription Settings */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#111118] border border-[#252536] space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Creator Profile & Subscription Pricing</h3>
                <p className="text-xs text-[#8c8c9e]">
                  Update display name, category, bio, profile photos, and non-tiered monthly pricing for @{creatorUser.username}.
                </p>
              </div>

              {priceSaveSuccess && (
                <div className="p-3.5 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Creator profile & pricing updated successfully!</span>
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const numericPrice = parseFloat(monthlyPrice);
                  if (!Number.isFinite(numericPrice) || numericPrice < 1) {
                    showToast('Monthly subscription price must be at least $1.00');
                    return;
                  }
                  try {
                    const res = await fetch('/api/creators', {
                      method: 'PATCH',
                      headers: authJsonHeaders(),
                      body: JSON.stringify({
                        handle: creatorUser.username,
                        name: profileName.trim(),
                        category: profileCategory,
                        bio: profileBio.trim(),
                        avatar: profileAvatar.trim(),
                        banner: profileBanner.trim(),
                        monthlyPrice: numericPrice,
                      }),
                    });
                    const data = await res.json();
                    if (res.ok && data?.creator) {
                      setCreatorUser((prev) => ({ ...prev, name: data.creator.name }));
                      try {
                        const raw = localStorage.getItem('mirage_user');
                        if (raw) {
                          const parsed = JSON.parse(raw);
                          if (parsed.id === data.creator.userId || parsed.username === data.creator.handle) {
                            localStorage.setItem(
                              'mirage_user',
                              JSON.stringify({
                                ...parsed,
                                name: data.creator.name,
                                avatar: data.creator.avatar,
                                banner: data.creator.banner,
                              })
                            );
                            window.dispatchEvent(new Event('mirage_auth_changed'));
                          }
                        }
                      } catch {}
                      setPriceSaveSuccess(true);
                      setTimeout(() => setPriceSaveSuccess(false), 2500);
                      showToast(`Profile & cover saved for ${data.creator.name} ($${numericPrice.toFixed(2)}/mo)`);
                    } else {
                      showToast(data?.message || 'Failed to save profile & pricing');
                    }
                  } catch {
                    showToast('Network error while saving profile settings');
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                      Profile Category
                    </label>
                    <select
                      value={profileCategory}
                      onChange={(e) => setProfileCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      {CREATOR_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                    Bio / Tagline
                  </label>
                  <textarea
                    rows={2}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#161622] border border-[#2b2b3c] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ImageAssetInput
                    label="Profile Photo (Avatar)"
                    variant="avatar"
                    value={profileAvatar}
                    onChange={setProfileAvatar}
                    onUploaded={async (url) => {
                      const res = await fetch('/api/creators', {
                        method: 'PATCH',
                        headers: authJsonHeaders(),
                        body: JSON.stringify({ handle: creatorUser.username, avatar: url }),
                      });
                      const d = await res.json();
                      if (res.ok && d?.creator) {
                        try {
                          const raw = localStorage.getItem('mirage_user');
                          if (raw) {
                            const parsed = JSON.parse(raw);
                            localStorage.setItem('mirage_user', JSON.stringify({ ...parsed, avatar: url }));
                            window.dispatchEvent(new Event('mirage_auth_changed'));
                          }
                        } catch {}
                        showToast('Profile avatar uploaded & saved!');
                      } else {
                        showToast(d?.message || 'Failed to save avatar');
                      }
                    }}
                    onError={(msg) => showToast(msg)}
                  />

                  <ImageAssetInput
                    label="Cover Banner Image (Cover Pic)"
                    variant="banner"
                    value={profileBanner}
                    onChange={setProfileBanner}
                    onUploaded={async (url) => {
                      const res = await fetch('/api/creators', {
                        method: 'PATCH',
                        headers: authJsonHeaders(),
                        body: JSON.stringify({ handle: creatorUser.username, banner: url }),
                      });
                      const d = await res.json();
                      if (res.ok && d?.creator) {
                        try {
                          const raw = localStorage.getItem('mirage_user');
                          if (raw) {
                            const parsed = JSON.parse(raw);
                            localStorage.setItem('mirage_user', JSON.stringify({ ...parsed, banner: url }));
                            window.dispatchEvent(new Event('mirage_auth_changed'));
                          }
                        } catch {}
                        showToast('Cover banner uploaded & saved!');
                      } else {
                        showToast(d?.message || 'Failed to save cover banner');
                      }
                    }}
                    onError={(msg) => showToast(msg)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9da3af] mb-1.5">
                    Monthly Subscription Price (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#7e7e90] font-bold">$</span>
                    <input
                      type="number"
                      step="0.50"
                      min="1"
                      max="199.99"
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
                    <span>Your {commissionSplit.creatorPercent}% Cut:</span>
                    <span>${((parseFloat(monthlyPrice || '0') * commissionSplit.creatorPercent) / 100).toFixed(2)}/mo</span>
                  </div>
                  <div className="flex justify-between text-[#7c7c90]">
                    <span>Platform {commissionSplit.platformPercent}% Cut:</span>
                    <span>${((parseFloat(monthlyPrice || '0') * commissionSplit.platformPercent) / 100).toFixed(2)}/mo</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm"
                >
                  Save Profile & Pricing
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Preview Studio Media Modal */}
      <PanelModal
        open={Boolean(viewPostModal)}
        title={viewPostModal?.title || 'Media Preview'}
        subtitle={viewPostModal ? `${viewPostModal.type} • ${viewPostModal.status}` : undefined}
        onClose={() => setViewPostModal(null)}
        maxWidthClass="max-w-2xl"
      >
        {viewPostModal && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl overflow-hidden bg-black border border-[#2b2b3a]">
              {(viewPostModal.type === 'VIDEO' || viewPostModal.type === 'video') ? (
                <video
                  src={viewPostModal.mediaUrl || viewPostModal.url}
                  poster={viewPostModal.thumbnailUrl}
                  controls
                  playsInline
                  className="w-full max-h-[55vh] object-contain"
                />
              ) : (
                <img
                  src={viewPostModal.mediaUrl || viewPostModal.url}
                  alt={viewPostModal.title}
                  className="w-full max-h-[55vh] object-contain"
                />
              )}
            </div>
            <p className="text-[#cbd5e1]">{viewPostModal.caption || 'No caption'}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#161622] text-center">
              <div><span className="text-[#717182] block">Visibility</span><strong className="text-white">{viewPostModal.visibility}</strong></div>
              <div><span className="text-[#717182] block">Price</span><strong className="text-[#f5d77f]">{viewPostModal.price > 0 ? `$${viewPostModal.price.toFixed(2)}` : 'Included'}</strong></div>
              <div><span className="text-[#717182] block">Sales</span><strong className="text-green-400">{viewPostModal.salesCount || 0}</strong></div>
            </div>
          </div>
        )}
      </PanelModal>

      {/* Edit Studio Post Modal */}
      <PanelModal
        open={Boolean(editPostForm)}
        title="Edit Content Details"
        onClose={() => setEditPostForm(null)}
      >
        {editPostForm && (
          <form onSubmit={handleSaveEditPost} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#8e8e9e] mb-1">Content Title</label>
              <input
                type="text"
                required
                value={editPostForm.title}
                onChange={(e) => setEditPostForm({ ...editPostForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
              />
            </div>
            <div>
              <label className="block text-[#8e8e9e] mb-1">Caption / Description</label>
              <textarea
                rows={2}
                value={editPostForm.caption}
                onChange={(e) => setEditPostForm({ ...editPostForm, caption: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[#8e8e9e] mb-1">Access Model</label>
                <select
                  value={editPostForm.visibility}
                  onChange={(e) => setEditPostForm({ ...editPostForm, visibility: e.target.value as any })}
                  className="w-full px-2.5 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                >
                  <option value="PURCHASE_ONLY">Paid PPV</option>
                  <option value="SUBSCRIBER_ONLY">Subscriber-Only</option>
                  <option value="PUBLIC">Free Preview</option>
                </select>
              </div>
              <div>
                <label className="block text-[#8e8e9e] mb-1">PPV Price ($)</label>
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
                  onChange={(e) => setEditPostForm({ ...editPostForm, status: e.target.value as any })}
                  className="w-full px-2.5 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                >
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[#8e8e9e] mb-1">Media URL / File</label>
              <div className="flex gap-2">
                <label className="cursor-pointer px-3 py-2 rounded-xl bg-[#181824] border border-[#d4af37]/40 text-[#f5d77f] font-bold flex items-center gap-1 flex-shrink-0">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      const uploaded = await uploadMediaFile(file, 'media');
                      if (uploaded) setEditPostForm({ ...editPostForm, mediaUrl: uploaded.url });
                    }}
                  />
                  <Upload className="w-3.5 h-3.5" /> Replace
                </label>
                <input
                  type="text"
                  value={editPostForm.mediaUrl}
                  onChange={(e) => setEditPostForm({ ...editPostForm, mediaUrl: e.target.value })}
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl gold-button font-bold">
              Save Post Changes
            </button>
          </form>
        )}
      </PanelModal>

      {/* View Custom Order Details Modal */}
      <PanelModal
        open={Boolean(viewOrderModal)}
        title={viewOrderModal?.title || 'Custom Order'}
        subtitle={viewOrderModal ? `Customer: ${viewOrderModal.customerName} (${viewOrderModal.customerHandle || '@fan'})` : undefined}
        onClose={() => setViewOrderModal(null)}
      >
        {viewOrderModal && (
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-[#161622] space-y-2 border border-[#2a2a3b]">
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Order ID</span><span className="font-mono text-[#cbd5e1]">{viewOrderModal.id}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Price</span><span className="font-bold text-[#f5d77f]">${Number(viewOrderModal.price || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Status</span><span className="font-bold text-white">{viewOrderModal.status}</span></div>
            </div>
            <div className="p-3 rounded-xl bg-[#161622]">
              <span className="text-[#717182] block mb-1">Request Instructions</span>
              <p className="text-[#cbd5e1]">{viewOrderModal.description || viewOrderModal.title}</p>
            </div>
            {viewOrderModal.deliveredMediaUrl && (
              <div className="rounded-xl overflow-hidden bg-black border border-[#2b2b3a]">
                {/\.(mp4|mov|webm)(\?|$)/i.test(viewOrderModal.deliveredMediaUrl) ? (
                  <video src={viewOrderModal.deliveredMediaUrl} controls playsInline className="w-full max-h-56 object-contain" />
                ) : (
                  <img src={viewOrderModal.deliveredMediaUrl} alt="Delivered" className="w-full max-h-56 object-contain" />
                )}
              </div>
            )}
          </div>
        )}
      </PanelModal>

      {/* Edit Custom Order Modal */}
      <PanelModal
        open={Boolean(editOrderForm)}
        title="Edit Custom Order"
        onClose={() => setEditOrderForm(null)}
      >
        {editOrderForm && (
          <form onSubmit={handleSaveEditOrder} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#8e8e9e] mb-1">Order Title</label>
              <input
                type="text"
                required
                value={editOrderForm.title}
                onChange={(e) => setEditOrderForm({ ...editOrderForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
              />
            </div>
            <div>
              <label className="block text-[#8e8e9e] mb-1">Description</label>
              <textarea
                rows={2}
                value={editOrderForm.description}
                onChange={(e) => setEditOrderForm({ ...editOrderForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
              />
            </div>
            <div>
              <label className="block text-[#8e8e9e] mb-1">Agreed Price ($)</label>
              <input
                type="number"
                step="0.50"
                min="5"
                required
                value={editOrderForm.price}
                onChange={(e) => setEditOrderForm({ ...editOrderForm, price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161622] border border-[#2b2b3c] text-white"
              />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl gold-button font-bold">
              Save Order Changes
            </button>
          </form>
        )}
      </PanelModal>

      {/* View Sale Receipt Modal */}
      <PanelModal
        open={Boolean(viewSaleModal)}
        title="Creator Sale Receipt"
        subtitle={viewSaleModal?.transactionReference}
        onClose={() => setViewSaleModal(null)}
      >
        {viewSaleModal && (
          <div className="space-y-2 p-4 rounded-2xl bg-[#161622] text-xs border border-[#2a2a3b]">
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Item</span><span className="font-bold text-white">{viewSaleModal.postTitle || viewSaleModal.type}</span></div>
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Buyer</span><span className="text-white">{viewSaleModal.userName}</span></div>
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Gross Sale</span><span className="font-bold text-white">${Number(viewSaleModal.grossAmount).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Your {commissionSplit.creatorPercent}% Net</span><span className="font-bold text-green-400">${Number(viewSaleModal.creatorShare).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Platform {commissionSplit.platformPercent}% Fee</span><span className="text-[#cbd5e1]">${Number(viewSaleModal.platformShare).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-[#8e8e9e]">Status</span><span className="font-bold text-green-400">{viewSaleModal.status}</span></div>
          </div>
        )}
      </PanelModal>

      {/* View Subscriber Details Modal */}
      <PanelModal
        open={Boolean(viewSubscriberModal)}
        title={viewSubscriberModal?.name || 'Subscriber'}
        subtitle={viewSubscriberModal?.handle}
        onClose={() => setViewSubscriberModal(null)}
      >
        {viewSubscriberModal && (
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-[#161622] space-y-2 border border-[#2a2a3b]">
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Status</span><span className="text-green-400 font-bold">{viewSubscriberModal.status}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Joined Date</span><span className="text-white">{viewSubscriberModal.joined}</span></div>
              <div className="flex justify-between"><span className="text-[#8e8e9e]">Total Lifetime Value</span><span className="font-bold text-[#f5d77f]">{viewSubscriberModal.totalSpent}</span></div>
            </div>
            <Link
              href={`/chat?creator=${encodeURIComponent(creatorUser.username)}`}
              className="w-full py-2.5 rounded-xl gold-button font-bold flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Open Studio Direct Chat
            </Link>
          </div>
        )}
      </PanelModal>

      {/* Shared Confirmation Modal */}
      <ConfirmActionModal
        open={Boolean(confirmModal)}
        title={confirmModal?.title || 'Confirm Action'}
        description={confirmModal?.description || ''}
        confirmLabel={confirmModal?.confirmLabel || 'Delete'}
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
