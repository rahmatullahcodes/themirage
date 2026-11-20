'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, CheckCircle, Shield, CreditCard, Sparkles, AlertCircle, LogIn } from 'lucide-react';

interface SubscribeModalProps {
  creator: {
    id: string;
    name: string;
    handle: string;
    price: number;
  } | null;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SubscribeModal({
  creator,
  isOpen = true,
  onClose,
  onSuccess,
}: SubscribeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthError, setIsAuthError] = useState(false);
  const [success, setSuccess] = useState(false);

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

  if (!isOpen || !creator) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    setIsAuthError(false);

    try {
      const token = localStorage.getItem('mirage_token');
      if (!token) {
        setIsAuthError(true);
        setError('Please log in or create an account to subscribe.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          creatorId: creator.id,
          amount: creator.price,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete checkout');
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Checkout error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const safeHandle = creator.handle.replace(/^@/, '');

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
        className="relative w-full max-w-md bg-[#0f0f16] border border-[#d4af37]/40 rounded-2xl p-6 shadow-2xl text-left animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close (X) Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#888899] hover:text-white bg-[#191924] hover:bg-[#252536] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1b261b] border border-green-500/40 flex items-center justify-center text-green-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white">Subscription Active!</h3>
            <p className="text-sm text-[#94a3b8]">
              You now have full access to <span className="text-[#f5d77f] font-semibold">{creator.name}</span>&apos;s exclusive subscriber-only feed and direct messaging.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <img
                src="/assets/the_mirage_logo.png"
                alt="The Mirage"
                className="h-7 w-auto object-contain"
              />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#d4af37] px-2.5 py-0.5 rounded-full bg-[#181824] border border-[#d4af37]/30">
                Premium
              </span>
            </div>

            <h3 className="text-xl font-serif font-bold text-white mb-1">
              Subscribe to {creator.name}
            </h3>
            <p className="text-xs text-[#8c8c9e] mb-6">
              Unlock exclusive posts, high-res photos, behind-the-scenes clips, and 1-on-1 text chat.
            </p>

            {/* Pricing Summary Box */}
            <div className="bg-[#151520] border border-[#272736] rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#a3a3b5]">Monthly Subscription</span>
                <span className="text-base font-bold text-white">${creator.price.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex flex-col gap-2">
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

            {/* Secure Payment Guarantee */}
            <div className="flex items-center gap-2 text-xs text-[#88889a] mb-6">
              <Shield className="w-4 h-4 text-[#d4af37]" />
              <span>256-bit encrypted simulated sandbox payment. Cancel anytime.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 rounded-xl gold-button text-sm font-bold shadow-gold-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                {loading ? 'Processing...' : `Confirm & Pay $${creator.price.toFixed(2)} / month`}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-transparent hover:bg-[#181822] text-[#9090a0] hover:text-white text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
