'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  LogIn,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { MediaThumb } from './PanelUi';
import { getAuthHeaders } from '@/lib/clientAuth';

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
  isOpen?: boolean;
  onClose: () => void;
  onSuccess: (purchasedItem: any) => void;
}

export default function PurchaseContentModal({
  content,
  isOpen = true,
  onClose,
  onSuccess,
}: PurchaseContentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthError, setIsAuthError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pendingPayram, setPendingPayram] = useState<{
    referenceId: string;
    checkoutUrl: string;
    status: string;
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Reset modal feedback when switching posts or reopening
  useEffect(() => {
    setIsSuccess(false);
    setError('');
    setIsAuthError(false);
    setPendingPayram(null);
    setCheckingStatus(false);
  }, [isOpen, content?.id]);

  const verifyPayramPurchase = async (refId: string, quiet = false) => {
    if (!quiet) setCheckingStatus(true);
    try {
      const res = await fetch(`/api/payments/payram/status?referenceId=${encodeURIComponent(refId)}`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok && data?.payment) {
        setPendingPayram((prev) => (prev ? { ...prev, status: data.payment.status } : prev));
        if (data.settled) {
          setPendingPayram(null);
          setIsSuccess(true);
          setTimeout(() => {
            onSuccess({ postId: content?.id });
            onClose();
          }, 1500);
          return true;
        }
        if (data.payment.status === 'CANCELLED' || data.payment.status === 'EXPIRED') {
          setPendingPayram(null);
          setError('Crypto invoice expired or was cancelled. Please initiate a new unlock.');
        }
      }
    } catch {
    } finally {
      if (!quiet) setCheckingStatus(false);
    }
    return false;
  };

  useEffect(() => {
    if (!isOpen || !pendingPayram?.referenceId) return;
    const timer = setInterval(() => {
      verifyPayramPurchase(pendingPayram.referenceId, true);
    }, 3000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pendingPayram?.referenceId]);

  // Close when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !content) return null;

  const handlePurchase = async () => {
    setLoading(true);
    setError('');
    setIsAuthError(false);

    try {
      const authHeaders = getAuthHeaders();

      const res = await fetch('/api/content/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          postId: content.id,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setIsAuthError(true);
        throw new Error(data.error || data.message || 'Please log in or create an account to unlock this content.');
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to complete content purchase');
      }

      if (data.requiresRedirect && data.checkoutUrl && data.referenceId) {
        setPendingPayram({
          referenceId: data.referenceId,
          checkoutUrl: data.checkoutUrl,
          status: data.status || 'OPEN',
        });
        window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
        return;
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

  const safeHandle = content.creatorHandle.replace(/^@/, '');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md bg-[#101016] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black text-left animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#181822] text-[#8e8e9e] hover:text-white hover:bg-[#252536] transition-colors"
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
        ) : pendingPayram ? (
          <div className="py-2 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#f5d77f] uppercase tracking-wider">
              <Loader2 className="w-4 h-4 animate-spin" />
              Awaiting PayRam Crypto Payment
            </div>
            <h3 className="text-lg font-serif font-bold text-white">
              Unlock &quot;{content.title}&quot; (${content.price.toFixed(2)})
            </h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Complete your crypto payment in PayRam (<span className="font-mono text-white">{pendingPayram.referenceId}</span>). Access unlocks automatically here once confirmed.
            </p>
            <div className="p-3 rounded-xl bg-[#151520] border border-[#28283a] flex items-center justify-between text-xs">
              <span className="text-[#8c8c9e]">Invoice Status</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/30 font-bold">
                {pendingPayram.status}
              </span>
            </div>
            <div className="space-y-2.5 pt-1">
              <a
                href={pendingPayram.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open PayRam Payment Page
              </a>
              <button
                type="button"
                disabled={checkingStatus}
                onClick={() => verifyPayramPurchase(pendingPayram.referenceId)}
                className="w-full py-2.5 rounded-xl bg-[#181824] hover:bg-[#222234] border border-[#2f2f40] text-xs font-semibold text-white flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
                {checkingStatus ? 'Checking Status...' : 'I Have Paid — Verify Now'}
              </button>
              <button
                type="button"
                onClick={() => setPendingPayram(null)}
                className="w-full py-2 text-xs text-[#808090] hover:text-white"
              >
                Cancel
              </button>
            </div>
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
                <MediaThumb
                  src={content.thumbnailUrl}
                  mediaType={content.mediaType}
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
            <div className="p-4 rounded-xl bg-[#181824] border border-[#2b2b3d]">
              <div className="flex justify-between items-center text-xs text-[#9da3af]">
                <span>Content Price (One-Time Unlock)</span>
                <span className="text-lg font-bold text-white">${content.price.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                {isAuthError && (
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/login?redirect=/creator/${encodeURIComponent(safeHandle)}`}
                      className="flex-1 py-2 px-3 rounded-lg gold-button text-xs font-bold text-center flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      className="flex-1 py-2 px-3 rounded-lg bg-[#181824] border border-[#303042] hover:border-[#d4af37] text-white text-xs font-semibold text-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handlePurchase}
                disabled={loading}
                className="w-full py-3.5 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-2 disabled:opacity-50"
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

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-transparent hover:bg-[#181822] text-[#9090a0] hover:text-white text-xs font-medium transition-colors text-center"
              >
                Cancel
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
