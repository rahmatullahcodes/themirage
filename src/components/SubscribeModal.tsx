'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Shield, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

interface SubscribeModalProps {
  creator: {
    id: string;
    name: string;
    handle: string;
    price: number;
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SubscribeModal({ creator, onClose, onSuccess }: SubscribeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!creator) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('mirage_token');
      if (!token) {
        window.location.href = `/login?redirect=/creator/${creator.handle}`;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0f0f16] border border-[#d4af37]/40 rounded-2xl p-6 shadow-2xl text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#888899] hover:text-white bg-[#191924]"
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
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#a3a3b5]">Monthly Subscription</span>
                <span className="text-base font-bold text-white">${creator.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#6e6e80] pt-2 border-t border-[#20202e]">
                <span>Platform Commission Split</span>
                <span className="text-[#d4af37]">85% to Creator</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
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
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 rounded-xl gold-button text-sm font-bold shadow-gold-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                {loading ? 'Processing...' : `Confirm & Pay $${creator.price.toFixed(2)} / month`}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-transparent hover:bg-[#181822] text-[#9090a0] text-xs font-medium"
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

