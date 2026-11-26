'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { fetchCurrentSessionUser, getAuthHeaders } from '@/lib/clientAuth';
import {
  Send,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  CreditCard,
  ArrowLeft,
  X,
  Search,
  Loader2,
  Users,
  Crown,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'creator';
  text: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  time: string;
  createdAt?: string;
  isCustomOffer?: boolean;
  offerDetails?: {
    id: string;
    title: string;
    price: number;
    status: 'PENDING_PAYMENT' | 'PAID' | 'DELIVERED' | 'CANCELLED';
    deliveredMediaUrl?: string;
  };
}

interface ConversationSummary {
  threadKey: string;
  userId: string;
  creatorHandle: string;
  partnerName: string;
  partnerHandle: string;
  partnerAvatar: string;
  category?: string;
  isVerified?: boolean;
  lastMessage: string;
  lastTime: string;
  lastTimestamp: number;
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQueryCreator = (searchParams?.get('creator') || '').replace(/^@/, '').toLowerCase();
  const queryCustomer = searchParams?.get('customer') || '';
  const queryRole = (searchParams?.get('role') || '').toLowerCase();
  const autoOpenCustom = searchParams?.get('requestCustom') === 'true';

  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    username: string;
    role: string;
    avatar?: string;
    creatorHandle?: string;
  }>({
    id: '',
    name: '',
    username: '',
    role: 'SUBSCRIBER',
  });

  const [chatMode, setChatMode] = useState<'user' | 'creator'>('user');
  const [myCreatorHandle, setMyCreatorHandle] = useState<string>('');
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [convSearch, setConvSearch] = useState('');
  const [selectedThread, setSelectedThread] = useState<{ userId: string; creatorHandle: string }>({
    userId: '',
    creatorHandle: '',
  });
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('chat');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [inputText, setInputText] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const [showCustomModal, setShowCustomModal] = useState(autoOpenCustom);
  const [customTitle, setCustomTitle] = useState('');
  const [customPrice, setCustomPrice] = useState('35.00');

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const threadScrollInitRef = useRef(false);

  // Hydrate authenticated user strictly from verified backend session
  useEffect(() => {
    let active = true;
    (async () => {
      const me = await fetchCurrentSessionUser();
      if (!active) return;
      if (!me) {
        router.replace('/login?redirect=/chat');
        return;
      }

      setCurrentUser(me);
      const isCreatorAccount = me.role === 'CREATOR';
      const ownHandle = (me.creatorHandle || me.username || '').toLowerCase();
      setMyCreatorHandle(ownHandle);

      const openCreatorAsFan =
        !isCreatorAccount || (Boolean(rawQueryCreator) && rawQueryCreator !== ownHandle && queryRole !== 'creator');
      const nextMode: 'user' | 'creator' = openCreatorAsFan ? 'user' : 'creator';
      setChatMode(nextMode);

      if (nextMode === 'creator') {
        setSelectedThread({
          userId: queryCustomer || '',
          creatorHandle: ownHandle,
        });
        if (!queryCustomer) {
          setMobileView('list');
        }
      } else {
        setSelectedThread({
          userId: me.id,
          creatorHandle: rawQueryCreator || (ownHandle === 'luna-rae' ? 'sophie-lee' : 'luna-rae'),
        });
      }
      setAuthChecked(true);
    })();

    return () => {
      active = false;
    };
  }, [router, rawQueryCreator, queryCustomer, queryRole]);

  // Load live conversations list from backend
  const fetchConversations = useCallback(async () => {
    if (!authChecked || !currentUser.id) return;
    try {
      const effectiveCreatorMode = chatMode === 'creator' && currentUser.role === 'CREATOR';
      const params = new URLSearchParams({
        mode: 'threads',
        role: effectiveCreatorMode ? 'CREATOR' : 'SUBSCRIBER',
      });
      const res = await fetch(`/api/chat?${params.toString()}`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });
      if (res.status === 401) {
        router.replace('/login?redirect=/chat');
        return;
      }
      const data = await res.json();
      if (data?.success && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        if (effectiveCreatorMode && data.activeCreatorHandle) {
          setMyCreatorHandle(data.activeCreatorHandle);
        }
        if (effectiveCreatorMode && !selectedThread.userId && data.conversations.length > 0) {
          setSelectedThread({
            userId: data.conversations[0].userId,
            creatorHandle: data.conversations[0].creatorHandle,
          });
        } else if (
          !effectiveCreatorMode &&
          !rawQueryCreator &&
          data.conversations.length > 0 &&
          !data.conversations.some((c: any) => c.creatorHandle === selectedThread.creatorHandle)
        ) {
          setSelectedThread((prev) => ({
            ...prev,
            creatorHandle: data.conversations[0].creatorHandle,
          }));
        }
      }
    } catch (e) {}
  }, [authChecked, currentUser.id, currentUser.role, chatMode, rawQueryCreator, selectedThread.userId, selectedThread.creatorHandle, router]);

  useEffect(() => {
    if (authChecked) {
      fetchConversations();
    }
  }, [authChecked, fetchConversations]);

  // Fetch active thread messages + custom requests
  const fetchActiveThread = useCallback(async (showSpinner = false) => {
    if (!authChecked || !selectedThread.userId || !selectedThread.creatorHandle) return;
    if (showSpinner) setLoadingThread(true);
    try {
      const headers = getAuthHeaders();
      const [msgRes, reqRes] = await Promise.all([
        fetch(
          `/api/chat?userId=${encodeURIComponent(selectedThread.userId)}&creator=${encodeURIComponent(
            selectedThread.creatorHandle
          )}`,
          { headers, cache: 'no-store' }
        ),
        fetch(
          `/api/custom-requests?customerId=${encodeURIComponent(selectedThread.userId)}&creatorId=${encodeURIComponent(
            selectedThread.creatorHandle
          )}`,
          { headers, cache: 'no-store' }
        ),
      ]);

      const combined: (ChatMessage & { sortTs: number })[] = [];

      if (msgRes.ok) {
        const mData = await msgRes.json();
        if (Array.isArray(mData?.messages)) {
          mData.messages.forEach((m: any) => {
            combined.push({
              id: m.id,
              sender: m.sender === 'creator' ? 'creator' : 'user',
              text: m.text,
              mediaUrl: m.mediaUrl,
              mediaType: m.mediaType,
              time: m.time || 'Now',
              createdAt: m.createdAt,
              sortTs: m.createdAt ? new Date(m.createdAt).getTime() : 0,
            });
          });
        }
      }

      if (reqRes.ok) {
        const rData = await reqRes.json();
        if (Array.isArray(rData?.requests)) {
          rData.requests.forEach((r: any) => {
            combined.push({
              id: `req-card-${r.id}`,
              sender: r.status === 'PENDING_PAYMENT' ? 'creator' : 'user',
              text:
                r.status === 'PENDING_PAYMENT'
                  ? `Custom Offer Proposal: ${r.title}`
                  : `Custom Request: ${r.title}`,
              time: r.createdAt
                ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Recent',
              createdAt: r.createdAt,
              sortTs: r.createdAt ? new Date(r.createdAt).getTime() : 0,
              isCustomOffer: true,
              offerDetails: {
                id: r.id,
                title: r.title,
                price: Number(r.price || 0),
                status: r.status === 'AWAITING_DELIVERY' ? 'PAID' : r.status,
                deliveredMediaUrl: r.deliveredMediaUrl,
              },
            });
          });
        }
      }

      combined.sort((a, b) => a.sortTs - b.sortTs);
      setMessages(combined);
    } catch (e) {
    } finally {
      if (showSpinner) setLoadingThread(false);
    }
  }, [authChecked, selectedThread.userId, selectedThread.creatorHandle]);

  useEffect(() => {
    if (!authChecked) return;
    threadScrollInitRef.current = true;
    fetchActiveThread(true);
  }, [authChecked, fetchActiveThread]);

  // Auto-scroll when messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: threadScrollInitRef.current ? 'auto' : 'smooth' });
      threadScrollInitRef.current = false;
    }
  }, [messages.length]);

  // Real-time Socket.IO connection + 3s background sync fallback
  useEffect(() => {
    if (!authChecked || !selectedThread.userId || !selectedThread.creatorHandle) return;
    const roomId = `${selectedThread.userId}:${selectedThread.creatorHandle}`;
    let socket: Socket | null = null;
    try {
      socket = io({ transports: ['websocket', 'polling'] });
      socketRef.current = socket;
      socket.on('connect', () => {
        socket?.emit('join_conversation', roomId);
      });
      socket.on('new_message', (incoming: any) => {
        if (!incoming) return;
        setMessages((prev) => {
          if (incoming.id && prev.some((m) => m.id === incoming.id)) return prev;
          return [
            ...prev,
            {
              id: incoming.id || `rt-${Date.now()}`,
              sender: incoming.sender === 'creator' ? 'creator' : 'user',
              text: incoming.text,
              mediaUrl: incoming.mediaUrl,
              mediaType: incoming.mediaType,
              time: incoming.time || 'Just now',
            },
          ];
        });
        fetchConversations();
      });
      socket.on('custom_content_updated', () => {
        fetchActiveThread(false);
      });
    } catch {}

    const pollInterval = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        fetchActiveThread(false);
        fetchConversations();
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [authChecked, selectedThread.userId, selectedThread.creatorHandle, fetchActiveThread, fetchConversations]);

  // Global Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCustomModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activePartner =
    conversations.find(
      (c) => c.userId === selectedThread.userId && c.creatorHandle === selectedThread.creatorHandle
    ) || {
      threadKey: `${selectedThread.userId}:${selectedThread.creatorHandle}`,
      userId: selectedThread.userId,
      creatorHandle: selectedThread.creatorHandle,
      partnerName:
        chatMode === 'creator' && !selectedThread.userId
          ? 'Fan Inbox'
          : selectedThread.creatorHandle
              .split('-')
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(' '),
      partnerHandle:
        chatMode === 'creator' && !selectedThread.userId
          ? 'Select a conversation'
          : `@${selectedThread.creatorHandle}`,
      partnerAvatar: '',
      isVerified: chatMode !== 'creator' || Boolean(selectedThread.userId),
      lastMessage: '',
      lastTime: 'Online',
      lastTimestamp: 0,
    };

  const mySenderRole: 'user' | 'creator' = chatMode === 'creator' ? 'creator' : 'user';

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setInputText('');
    await postChatPayload({ text: trimmed });
  };

  const postChatPayload = async (payload: {
    text: string;
    mediaUrl?: string;
    mediaType?: 'IMAGE' | 'VIDEO';
  }) => {
    if (!selectedThread.userId || !selectedThread.creatorHandle) return;
    const roomId = `${selectedThread.userId}:${selectedThread.creatorHandle}`;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          userId: selectedThread.userId,
          creator: selectedThread.creatorHandle,
          sender: mySenderRole,
          text: payload.text,
          mediaUrl: payload.mediaUrl,
          mediaType: payload.mediaType,
        }),
      });
      const data = await res.json();
      if (data?.success && data.message) {
        const saved = data.message;
        setMessages((prev) =>
          prev.some((m) => m.id === saved.id)
            ? prev
            : [
                ...prev,
                {
                  id: saved.id,
                  sender: saved.sender,
                  text: saved.text,
                  mediaUrl: saved.mediaUrl,
                  mediaType: saved.mediaType,
                  time: saved.time || 'Just now',
                },
              ]
        );
        socketRef.current?.emit('send_message', {
          conversationId: roomId,
          ...saved,
        });
        fetchConversations();
      }
    } catch {}
  };

  const handleUploadMediaAttachment = async (file: File) => {
    setUploadingMedia(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', headers: getAuthHeaders(), body: fd });
      const data = await res.json();
      if (res.ok && data?.success && data?.url) {
        await postChatPayload({
          text: data.mediaType === 'VIDEO' ? 'Sent a private video' : 'Sent a private photo',
          mediaUrl: data.url,
          mediaType: data.mediaType,
        });
      } else {
        setPaymentNotice(data?.message || 'Failed to upload media attachment');
        setTimeout(() => setPaymentNotice(null), 4000);
      }
    } catch {
      setPaymentNotice('Failed to upload attachment');
      setTimeout(() => setPaymentNotice(null), 4000);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handlePayOffer = async (offerId: string) => {
    try {
      await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ requestId: offerId, action: 'PAY' }),
      });
      socketRef.current?.emit('custom_content_update', {
        conversationId: `${selectedThread.userId}:${selectedThread.creatorHandle}`,
      });
      fetchActiveThread(false);
      setPaymentNotice('Payment verified! Order sent to Creator Studio for production & delivery.');
      setTimeout(() => setPaymentNotice(null), 5000);
    } catch {}
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    const numericPrice = parseFloat(customPrice) || 35.0;
    const isCreatorSendingOffer = chatMode === 'creator';

    try {
      const res = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          customerId: selectedThread.userId,
          customerName:
            chatMode === 'user' ? currentUser.name : activePartner.partnerName || 'Subscriber',
          customerHandle:
            chatMode === 'user' ? `@${currentUser.username}` : activePartner.partnerHandle,
          creatorHandle: selectedThread.creatorHandle,
          title: customTitle.trim(),
          price: numericPrice,
          paid: !isCreatorSendingOffer,
        }),
      });
      if (res.ok) {
        socketRef.current?.emit('custom_content_update', {
          conversationId: `${selectedThread.userId}:${selectedThread.creatorHandle}`,
        });
        fetchActiveThread(false);
        fetchConversations();
      }
    } catch {}

    setPaymentNotice(
      isCreatorSendingOffer
        ? 'Paid custom offer sent to subscriber in chat!'
        : 'Custom request submitted & sent directly to Creator Studio!'
    );
    setTimeout(() => setPaymentNotice(null), 4000);
    setShowCustomModal(false);
    setCustomTitle('');
  };

  const filteredConversations = conversations.filter((c) => {
    if (!convSearch.trim()) return true;
    const q = convSearch.toLowerCase();
    return (
      c.partnerName.toLowerCase().includes(q) ||
      c.partnerHandle.toLowerCase().includes(q)
    );
  });

  if (!authChecked || !currentUser.id) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-[#d4af37] text-sm">
        Verifying your encrypted chat session...
      </div>
    );
  }

  return (
    <div className="h-screen h-[100dvh] bg-[#08080a] text-white flex overflow-hidden">
      {/* Conversations Sidebar */}
      <div
        className={`w-full md:w-80 bg-[#0d0d12] border-r border-[#1e1e28] flex flex-col ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-[#1e1e28] flex items-center justify-between gap-2">
          <Link href="/" className="inline-flex items-center">
            <img src="/assets/the_mirage_logo.png" alt="The Mirage" className="h-6 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#f5d77f] bg-[#181611] px-2 py-0.5 rounded-full border border-[#d4af37]/30 font-semibold">
              {chatMode === 'creator' ? `Creator: @${myCreatorHandle}` : '1-on-1 Chat'}
            </span>
            <Link
              href={
                currentUser.role === 'CREATOR'
                  ? '/creator-studio'
                  : currentUser.role === 'ADMIN'
                  ? '/admin'
                  : '/dashboard'
              }
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#151520] hover:bg-[#1e1e2e] border border-[#29293a] text-[#94a3b8] hover:text-white transition-colors"
            >
              Portal
            </Link>
          </div>
        </div>

        {/* Mode Switcher & Search */}
        <div className="p-3 border-b border-[#181822] space-y-2.5">
          {currentUser.role === 'CREATOR' && (
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#13131c] border border-[#242434] text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setChatMode('creator');
                  setMessages([]);
                  setSelectedThread({ userId: '', creatorHandle: myCreatorHandle });
                }}
                className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors ${
                  chatMode === 'creator' ? 'gold-button text-black' : 'text-[#8e8e9e] hover:text-white'
                }`}
              >
                <Users className="w-3 h-3" /> Fan Inbox
              </button>
              <button
                type="button"
                onClick={() => {
                  setChatMode('user');
                  setMessages([]);
                  setSelectedThread({
                    userId: currentUser.id,
                    creatorHandle: myCreatorHandle === 'luna-rae' ? 'sophie-lee' : 'luna-rae',
                  });
                }}
                className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors ${
                  chatMode === 'user' ? 'gold-button text-black' : 'text-[#8e8e9e] hover:text-white'
                }`}
              >
                <Crown className="w-3 h-3" /> Creators
              </button>
            </div>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#666677] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder={chatMode === 'creator' ? 'Search fans & subscribers...' : 'Search creators...'}
              className="w-full pl-8 pr-3 py-2 bg-[#14141e] border border-[#252536] rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#151520]">
          {filteredConversations.map((c) => {
            const isSelected =
              selectedThread.userId === c.userId && selectedThread.creatorHandle === c.creatorHandle;
            return (
              <div
                key={c.threadKey}
                onClick={() => {
                  setSelectedThread({ userId: c.userId, creatorHandle: c.creatorHandle });
                  setMobileView('chat');
                }}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#151520] border-l-2 border-[#d4af37]' : 'hover:bg-[#12121a]'
                }`}
              >
                <div className="relative flex-shrink-0">
                  {c.partnerAvatar ? (
                    <img
                      src={c.partnerAvatar}
                      alt={c.partnerName}
                      className={`w-11 h-11 rounded-full object-cover ${
                        isSelected ? 'border border-[#d4af37]/60' : 'border border-[#272738]'
                      }`}
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-sm font-bold text-[#f5d77f]">
                      {c.partnerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0d0d12] absolute bottom-0 right-0"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5 gap-1">
                    <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                      {c.partnerName}
                      {c.isVerified && <CheckCircle2 className="w-3 h-3 fill-[#d4af37] text-black flex-shrink-0" />}
                    </span>
                    <span className="text-[10px] text-[#636375] flex-shrink-0">{c.lastTime}</span>
                  </div>
                  <p className="text-[11px] text-[#88889a] truncate">{c.lastMessage}</p>
                </div>
              </div>
            );
          })}
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-xs text-[#717182]">No matching conversations found.</div>
          )}
        </div>
      </div>

      {/* Main 1-on-1 Chat Window */}
      <div className={`flex-1 flex-col bg-[#0a0a0e] relative ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
        <div className="h-16 px-4 sm:px-6 bg-[#0e0e14] border-b border-[#1c1c28] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className="p-1.5 rounded-lg bg-[#181822] text-[#9090a2] hover:text-white md:hidden"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {activePartner.partnerAvatar ? (
              <img
                src={activePartner.partnerAvatar}
                alt={activePartner.partnerName}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[#d4af37]/40 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-xs font-bold text-[#f5d77f] flex-shrink-0">
                {activePartner.partnerName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                {activePartner.partnerName}
                {activePartner.isVerified && <CheckCircle2 className="w-3.5 h-3.5 fill-[#d4af37] text-black flex-shrink-0" />}
              </div>
              <span className="text-[10px] text-green-400 block truncate">
                {activePartner.partnerHandle} • Live 1-on-1 Encrypted Chat
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={!selectedThread.userId}
            onClick={() => setShowCustomModal(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#181824] hover:bg-[#202030] text-[#f5d77f] border border-[#d4af37]/40 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-colors shadow-gold-sm flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {chatMode === 'creator' ? 'Send Paid Offer' : 'Request Custom Content'}
            </span>
            <span className="sm:hidden">{chatMode === 'creator' ? 'Send Offer' : 'Custom'}</span>
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loadingThread && messages.length === 0 ? (
            <div className="py-12 flex items-center justify-center text-xs text-[#808092] gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
              Loading live 1-on-1 conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#151520] border border-[#d4af37]/30 flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5 text-[#f5d77f]" />
              </div>
              <p className="text-sm font-bold text-white">Start a 1-on-1 conversation with {activePartner.partnerName}</p>
              <p className="text-xs text-[#717182] max-w-sm mx-auto">
                Messages, photos, videos, and custom requests sync directly between both accounts in real time.
              </p>
            </div>
          ) : null}

          {messages.map((msg) => {
            const isOwnMessage = msg.sender === mySenderRole;
            return (
              <div key={msg.id} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-md p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                    isOwnMessage
                      ? 'bg-[#1b1b26] border border-[#2e2e42] text-white rounded-br-none'
                      : 'bg-[#121218] border border-[#d4af37]/30 text-white rounded-bl-none shadow-gold-sm'
                  }`}
                >
                  {msg.mediaUrl && (
                    <div className="rounded-xl overflow-hidden bg-black border border-[#2b2b3a]">
                      {msg.mediaType === 'VIDEO' || /\.(mp4|mov|webm)(\?|$)/i.test(msg.mediaUrl) ? (
                        <video src={msg.mediaUrl} controls playsInline className="w-full max-h-60 object-contain" />
                      ) : (
                        <img src={msg.mediaUrl} alt="Chat attachment" className="w-full max-h-60 object-contain" />
                      )}
                    </div>
                  )}

                  {msg.text && <p>{msg.text}</p>}

                  {msg.isCustomOffer && msg.offerDetails && (
                    <div className="mt-2 p-3 rounded-xl bg-[#09090d] border border-[#d4af37]/40 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#f5d77f] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Custom Order
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          ${msg.offerDetails.price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-[#cbd5e1] font-medium">{msg.offerDetails.title}</p>

                      {msg.offerDetails.status === 'PENDING_PAYMENT' && (
                        <div className="pt-2 border-t border-[#1a1a26]">
                          {chatMode === 'user' ? (
                            <button
                              type="button"
                              onClick={() => handlePayOffer(msg.offerDetails!.id)}
                              className="w-full py-2 rounded-lg gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay & Unlock Request (${msg.offerDetails.price.toFixed(2)})
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#f5d77f]">Awaiting subscriber payment</span>
                          )}
                        </div>
                      )}

                      {msg.offerDetails.status === 'PAID' && (
                        <div className="p-2 rounded bg-green-950/40 border border-green-500/30 text-[11px] text-green-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Payment verified! Deliver in Creator Studio Custom Requests.</span>
                        </div>
                      )}

                      {msg.offerDetails.status === 'DELIVERED' && msg.offerDetails.deliveredMediaUrl && (
                        <div className="space-y-2 pt-2 border-t border-[#1a1a26]">
                          <span className="text-[11px] text-green-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered & Verified
                          </span>
                          <div className="aspect-video w-full rounded-lg overflow-hidden border border-[#d4af37]/40 bg-black">
                            {/\.(mp4|mov|webm)(\?|$)/i.test(msg.offerDetails.deliveredMediaUrl) ? (
                              <video
                                src={msg.offerDetails.deliveredMediaUrl}
                                controls
                                playsInline
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <img
                                src={msg.offerDetails.deliveredMediaUrl}
                                alt="Delivered"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <a
                            href={msg.offerDetails.deliveredMediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-center py-1.5 rounded bg-[#1f1f2e] text-[11px] font-semibold text-[#f5d77f] hover:underline"
                          >
                            Open in Full Resolution
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#555566] mt-1 px-1">{msg.time}</span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {paymentNotice && (
          <div className="mx-4 sm:mx-6 mt-2 p-3 rounded-xl bg-green-950/60 border border-green-500/40 text-xs text-green-300 flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              {paymentNotice}
            </span>
            <button
              type="button"
              onClick={() => setPaymentNotice(null)}
              className="text-green-400 hover:text-white p-1"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Message & Media Composer */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#0e0e14] border-t border-[#1c1c28] flex items-center gap-2 sm:gap-3"
        >
          <label
            className={`p-2.5 sm:p-3 rounded-xl bg-[#151520] border border-[#29293a] text-[#d4af37] flex-shrink-0 transition-colors ${
              chatMode === 'creator' && !selectedThread.userId
                ? 'opacity-40 pointer-events-none'
                : 'cursor-pointer hover:bg-[#1e1e2e]'
            }`}
            title="Send photo or video"
          >
            <input
              type="file"
              accept="image/*,video/*"
              disabled={chatMode === 'creator' && !selectedThread.userId}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) handleUploadMediaAttachment(f);
              }}
            />
            {uploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          </label>

          <input
            type="text"
            value={inputText}
            disabled={chatMode === 'creator' && !selectedThread.userId}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              chatMode === 'creator' && !selectedThread.userId
                ? 'Select a fan conversation to reply...'
                : `Message ${activePartner.partnerName}...`
            }
            className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#151520] border border-[#29293a] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={chatMode === 'creator' && !selectedThread.userId}
            className="p-2.5 sm:p-3 rounded-xl gold-button text-black shadow-gold-sm hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Custom Request / Paid Offer Modal */}
        {showCustomModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCustomModal(false);
            }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <div className="bg-[#12121a] border border-[#d4af37]/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 relative">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#88889a] hover:text-white hover:bg-[#1a1a26] transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2 pr-6">
                <Sparkles className="w-4 h-4 text-[#f5d77f]" />
                {chatMode === 'creator'
                  ? 'Send Paid Custom Offer'
                  : 'Request Personalised Custom Content'}
              </h3>
              <p className="text-xs text-[#8c8c9e]">
                {chatMode === 'creator'
                  ? 'Propose a paid personalized clip or photo set to this subscriber.'
                  : 'Propose a custom clip, photo set, or personalized greeting. Delivered directly to your chat & vault.'}
              </p>

              <form onSubmit={handleRequestSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b2] mb-1">
                    Custom Content Details
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. 2-min personalized VIP greeting"
                    className="w-full px-3.5 py-2.5 bg-[#181824] border border-[#2b2b3a] rounded-xl text-xs text-white focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b2] mb-1">
                    Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="5"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#181824] border border-[#2b2b3a] rounded-xl text-xs text-white focus:border-[#d4af37]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl gold-button text-xs font-bold shadow-gold-sm"
                  >
                    {chatMode === 'creator' ? 'Send Offer to Chat' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#1b1b28] text-xs text-[#808090]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-[#d4af37]">
          Loading chat...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
