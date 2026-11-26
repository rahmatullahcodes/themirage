'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Sparkles,
  DollarSign,
  Lock,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  Shield,
  CreditCard,
  Crown,
  ChevronLeft,
  ArrowLeft,
  X,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'creator';
  text: string;
  time: string;
  isCustomOffer?: boolean;
  offerDetails?: {
    id: string;
    title: string;
    price: number;
    status: 'PENDING_PAYMENT' | 'PAID' | 'DELIVERED';
    deliveredMediaUrl?: string;
  };
}

function ChatContent() {
  const searchParams = useSearchParams();
  const rawQueryCreator = searchParams?.get('creator') || 'luna-rae';
  const queryCreator = rawQueryCreator.replace(/^@/, '').toLowerCase();
  const autoOpenCustom = searchParams?.get('requestCustom') === 'true';

  const [activeConversation, setActiveConversation] = useState(queryCreator);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('chat');

  const CONVERSATION_CREATORS: Record<string, { name: string; avatar: string; handle: string }> = {
    'luna-rae': {
      name: 'Luna Rae',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      handle: '@luna-rae',
    },
    'mia-carter': {
      name: 'Mia Carter',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      handle: '@mia-carter',
    },
    'sophie-lee': {
      name: 'Sophie Lee',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
      handle: '@sophie-lee',
    },
    'zara-khan': {
      name: 'Zara Khan',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      handle: '@zara-khan',
    },
    'emily-rose': {
      name: 'Emily Rose',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
      handle: '@emily-rose',
    },
  };

  const activeCreator = CONVERSATION_CREATORS[activeConversation] || {
    name: activeConversation.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    handle: `@${activeConversation}`,
  };

  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  const [messagesByCreator, setMessagesByCreator] = useState<Record<string, ChatMessage[]>>({
    'luna-rae': [
      {
        id: 'm1',
        sender: 'creator',
        text: 'Hey! Thanks for joining my Mirage channel! Let me know if you want any custom clips or have questions ✨',
        time: '11:42 AM',
      },
      {
        id: 'm2',
        sender: 'user',
        text: 'Hi Luna! Loving your posts. Can I get a personalized birthday video greeting?',
        time: '11:45 AM',
      },
      {
        id: 'm3',
        sender: 'creator',
        text: 'Absolutely! I can film a 2-minute personalized video greeting for you today with a personal message.',
        time: '11:46 AM',
        isCustomOffer: true,
        offerDetails: {
          id: 'off-101',
          title: '2-Minute Personalized VIP Video Greeting',
          price: 35.00,
          status: 'PENDING_PAYMENT',
        },
      },
    ],
    'mia-carter': [
      {
        id: 'mia-m1',
        sender: 'creator',
        text: 'Welcome to my private chat! Thank you for supporting my Malibu shoots — new lifestyle video coming Friday ✨',
        time: 'Yesterday',
      },
    ],
  });

  const messages = messagesByCreator[activeConversation] || [
    {
      id: `init-${activeConversation}`,
      sender: 'creator',
      text: `Hey! Welcome to my private Mirage chat. Feel free to message me or send a custom request ✨`,
      time: 'Now',
    },
  ];

  const updateCurrentMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessagesByCreator((prevMap) => {
      const currentList = prevMap[activeConversation] || [
        {
          id: `init-${activeConversation}`,
          sender: 'creator',
          text: `Hey! Welcome to my private Mirage chat. Feel free to message me or send a custom request ✨`,
          time: 'Now',
        },
      ];
      return {
        ...prevMap,
        [activeConversation]: updater(currentList),
      };
    });
  };

  const [inputText, setInputText] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(autoOpenCustom);
  const [customTitle, setCustomTitle] = useState('');
  const [customPrice, setCustomPrice] = useState('35.00');

  // Synchronize URL query parameters (?creator=...&requestCustom=true) when navigating while already mounted
  useEffect(() => {
    const c = searchParams?.get('creator');
    if (c) {
      setActiveConversation(c.replace(/^@/, '').toLowerCase());
      setMobileView('chat');
    }
    if (searchParams?.get('requestCustom') === 'true') {
      setShowCustomModal(true);
    }
  }, [searchParams]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const targetConv = activeConversation;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: inputText,
      time: 'Just now',
    };

    updateCurrentMessages(prev => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      setMessagesByCreator((prevMap) => ({
        ...prevMap,
        [targetConv]: [
          ...(prevMap[targetConv] || []),
          {
            id: `m-reply-${Date.now()}`,
            sender: 'creator',
            text: 'Got it! Working on that for you right away 🖤',
            time: 'Just now',
          },
        ],
      }));
    }, 1500);
  };

  // Global Escape key listener to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCustomModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePayOffer = (offerId: string) => {
    const targetConv = activeConversation;
    updateCurrentMessages(prev =>
      prev.map(msg => {
        if (msg.offerDetails && msg.offerDetails.id === offerId) {
          return {
            ...msg,
            offerDetails: {
              ...msg.offerDetails,
              status: 'PAID',
            },
          };
        }
        return msg;
      })
    );

    setPaymentNotice('Payment verified! The creator has been notified to produce and upload your personalized content.');
    setTimeout(() => setPaymentNotice(null), 5000);

    setTimeout(() => {
      setMessagesByCreator((prevMap) => ({
        ...prevMap,
        [targetConv]: (prevMap[targetConv] || []).map(msg => {
          if (msg.offerDetails && msg.offerDetails.id === offerId) {
            return {
              ...msg,
              offerDetails: {
                ...msg.offerDetails,
                status: 'DELIVERED',
                deliveredMediaUrl:
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
              },
            };
          }
          return msg;
        }),
      }));
    }, 3000);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle) return;

    const newOfferMsg: ChatMessage = {
      id: `m-cust-${Date.now()}`,
      sender: 'user',
      text: `[Custom Request Proposal]: ${customTitle}`,
      time: 'Just now',
      isCustomOffer: true,
      offerDetails: {
        id: `off-${Date.now()}`,
        title: customTitle,
        price: parseFloat(customPrice) || 30.0,
        status: 'PENDING_PAYMENT',
      },
    };

    updateCurrentMessages(prev => [...prev, newOfferMsg]);
    setShowCustomModal(false);
    setCustomTitle('');
  };

  return (
    <div className="h-screen bg-[#08080a] text-white flex overflow-hidden">
      <div className={`w-full md:w-80 bg-[#0d0d12] border-r border-[#1e1e28] flex flex-col ${
        mobileView === 'chat' ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-[#1e1e28] flex items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <img
              src="/assets/the_mirage_logo.png"
              alt="The Mirage"
              className="h-6 w-auto object-contain"
            />
          </Link>
          <span className="text-[10px] text-[#808092] bg-[#161622] px-2 py-0.5 rounded-full border border-[#272736]">
            Encrypted 1-on-1
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#151520]">
          {Object.entries(CONVERSATION_CREATORS).map(([slug, creatorInfo]) => {
            const thread = messagesByCreator[slug] || [];
            const lastMsg = thread[thread.length - 1];
            const isSelected = activeConversation === slug;
            return (
              <div
                key={slug}
                onClick={() => {
                  setActiveConversation(slug);
                  setMobileView('chat');
                }}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#151520] border-l-2 border-[#d4af37]' : 'hover:bg-[#12121a]'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={creatorInfo.avatar}
                    alt={creatorInfo.name}
                    className={`w-12 h-12 rounded-full object-cover ${isSelected ? 'border border-[#d4af37]/40' : ''}`}
                  />
                  <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-[#0d0d12] absolute bottom-0 right-0"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-bold text-white truncate">{creatorInfo.name}</span>
                    <span className="text-[10px] text-[#636375]">{lastMsg?.time || 'Online'}</span>
                  </div>
                  <p className="text-[11px] text-[#88889a] truncate">
                    {lastMsg?.text || `Direct chat with ${creatorInfo.name}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`flex-1 flex-col bg-[#0a0a0e] relative ${
        mobileView === 'list' ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="h-16 px-4 sm:px-6 bg-[#0e0e14] border-b border-[#1c1c28] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileView('list')}
              className="p-1.5 rounded-lg bg-[#181822] text-[#9090a2] hover:text-white md:hidden"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <img
              src={activeCreator.avatar}
              alt={activeCreator.name}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-[#d4af37]/40"
            />
            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                {activeCreator.name}
                <CheckCircle2 className="w-3.5 h-3.5 fill-[#d4af37] text-black" />
              </div>
              <span className="text-[10px] text-green-400">Online & Verified</span>
            </div>
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#181824] hover:bg-[#202030] text-[#f5d77f] border border-[#d4af37]/40 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-colors shadow-gold-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Request</span> Custom Content
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-md p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#1b1b26] border border-[#2e2e42] text-white rounded-br-none'
                    : 'bg-[#121218] border border-[#d4af37]/30 text-white rounded-bl-none shadow-gold-sm'
                }`}
              >
                <p>{msg.text}</p>

                {msg.isCustomOffer && msg.offerDetails && (
                  <div className="mt-3 p-3 sm:p-3.5 rounded-xl bg-[#09090d] border border-[#d4af37]/40 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#f5d77f] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Custom Order Offer
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        ${msg.offerDetails.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-[#cbd5e1] font-medium">
                      {msg.offerDetails.title}
                    </p>

                    {msg.offerDetails.status === 'PENDING_PAYMENT' && (
                      <div className="pt-2 border-t border-[#1a1a26]">
                        {msg.sender === 'creator' ? (
                          <button
                            onClick={() => handlePayOffer(msg.offerDetails!.id)}
                            className="w-full py-2 rounded-lg gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay & Unlock Request (${msg.offerDetails.price.toFixed(2)})
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#808092]">Awaiting creator confirmation</span>
                        )}
                      </div>
                    )}

                    {msg.offerDetails.status === 'PAID' && (
                      <div className="p-2 rounded bg-green-950/40 border border-green-500/30 text-[11px] text-green-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Payment verified! Creator is preparing delivery.</span>
                      </div>
                    )}

                    {msg.offerDetails.status === 'DELIVERED' && (
                      <div className="space-y-2 pt-2 border-t border-[#1a1a26]">
                        <span className="text-[11px] text-green-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered & Verified
                        </span>
                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-[#d4af37]/40 relative">
                          <img
                            src={msg.offerDetails.deliveredMediaUrl}
                            alt="Delivered"
                            className="w-full h-full object-cover"
                          />
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
          ))}
        </div>

        {paymentNotice && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-green-950/60 border border-green-500/40 text-xs text-green-300 flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              {paymentNotice}
            </span>
            <button
              onClick={() => setPaymentNotice(null)}
              className="text-green-400 hover:text-white p-1"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 bg-[#0e0e14] border-t border-[#1c1c28] flex items-center gap-2 sm:gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Type your message to ${activeCreator.name}...`}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#151520] border border-[#29293a] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
          />
          <button
            type="submit"
            className="p-2.5 sm:p-3 rounded-xl gold-button text-black shadow-gold-sm hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

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
                Request Personalised Custom Content
              </h3>
              <p className="text-xs text-[#8c8c9e]">
                Propose a custom clip, photo set, or personalized greeting. The creator will review and deliver directly to your chat.
              </p>

              <form onSubmit={handleRequestSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b2] mb-1">
                    What would you like?
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. 2-min Birthday Greeting mentioning my name"
                    className="w-full px-3.5 py-2.5 bg-[#181824] border border-[#2b2b3a] rounded-xl text-xs text-white focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a0a0b2] mb-1">
                    Offered Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="10"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#181824] border border-[#2b2b3a] rounded-xl text-xs text-white focus:border-[#d4af37]"
                  />
                  <span className="text-[10px] text-[#636375] mt-1 block">
                    Your request and offered budget will be delivered directly to the creator.
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl gold-button text-xs font-bold shadow-gold-sm"
                  >
                    Send Proposal
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
    <Suspense fallback={<div className="h-[calc(100vh-80px)] bg-[#08080a] flex items-center justify-center text-[#d4af37]">Loading Chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
