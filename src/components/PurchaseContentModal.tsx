'use client';

import React, { useState } from 'react';
import {
  Lock,
  Sparkles,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  X,
  CreditCard,
  Image as ImageIcon,
  Video,
  ShieldCheck,
} from 'lucide-react';

interface PurchaseContentModalProps {
  content: {
    id: string;
    title: string;
    creatorName: string;
    creatorHandle: string;
    price: number;
    mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO';
    thumbnailUrl: string;
  } | null;
  onClose: () => void;
  onSuccess: (purchasedItem: any) => void;
}

export default function PurchaseContentModal({
  content,
  onClose,
  onSuccess,
}: PurchaseContentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!content) return null;

  const handlePurchase = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('mirage_token');
      const res = await fetch('/api/content/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ postId: content.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete content purchase');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(data.purchase);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Payment processing error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#101016] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#181822] text-[#8e8e9e] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1b261b] border border-green-500/40 flex items-center justify-center text-green-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">Payment Successful!</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              You have permanently unlocked <span className="text-[#f5d77f] font-semibold">{content.title}</span>. It is now saved in your <strong>My Purchases</strong> library.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with Brand Logo and Badge */}
            <div className="flex items-center justify-between border-b border-[#22222e] pb-4">
              <img
                src="/assets/the_mirage_logo.png"
                alt="The Mirage"
                className="h-7 w-auto object-contain"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] px-2.5 py-0.5 rounded-full bg-[#181824] border border-[#d4af37]/30">
                Pay-Per-View Unlock
              </span>
            </div>

            {/* Content Preview Snapshot */}
            <div className="flex gap-4 items-center p-3 rounded-2xl bg-[#14141e] border border-[#262638]">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0">
                <img
                  src={content.thumbnailUrl}
                  alt={content.title}
                  className="w-full h-full object-cover filter blur-[2px] opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Lock className="w-6 h-6 text-[#f5d77f]" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] text-[#d4af37] font-semibold mb-0.5">
                  {content.mediaType === 'VIDEO' ? (
                    <>
                      <Video className="w-3.5 h-3.5" /> Premium Video
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5" /> High-Res Photo Set
                    </>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white truncate" title={content.title}>
                  {content.title}
                </h4>
                <p className="text-xs text-[#8e8e9e] mt-0.5">By {content.creatorName}</p>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-[#181824] border border-[#2b2b3d] space-y-2">
              <div className="flex justify-between items-center text-xs text-[#9da3af]">
                <span>Content Price (One-Time Unlock)</span>
                <span className="text-lg font-bold text-white">${content.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-[#717182] pt-2 border-t border-[#232332]">
                <span>Creator Earnings Split</span>
                <span className="text-[#f5d77f] font-medium">85% to Creator</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full py-3.5 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-pulse">Processing Payment...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Unlock Now for ${content.price.toFixed(2)}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#6e6e80]">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span>Encrypted 256-bit secure checkout • Permanent library access</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

