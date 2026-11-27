'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Clock, AlertCircle, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
import { getAuthHeaders } from '@/lib/clientAuth';

function CheckoutStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const referenceId = (
    searchParams?.get('ref') ||
    searchParams?.get('referenceId') ||
    searchParams?.get('reference_id') ||
    ''
  ).trim();
  const redirectTarget = searchParams?.get('redirect') || '/dashboard';

  const [status, setStatus] = useState<'LOADING' | 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'OVER_FILLED' | 'CANCELLED' | 'EXPIRED' | 'ERROR'>('LOADING');
  const [message, setMessage] = useState('Checking your PayRam crypto invoice status...');
  const [payment, setPayment] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    if (!referenceId) {
      setStatus('ERROR');
      setMessage('Missing payment reference ID.');
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(`/api/payments/payram/status?referenceId=${encodeURIComponent(referenceId)}`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('ERROR');
        setMessage(data?.message || 'Unable to inspect payment invoice.');
        return;
      }
      setPayment(data.payment);
      const nextStatus = data.payment?.status || 'OPEN';
      setStatus(nextStatus);
      if (data.settled || nextStatus === 'FILLED' || nextStatus === 'OVER_FILLED') {
        setMessage('Payment confirmed on-chain! Your access has been unlocked.');
      } else if (nextStatus === 'CANCELLED' || nextStatus === 'EXPIRED') {
        setMessage('This crypto invoice expired or was cancelled.');
      } else if (nextStatus === 'PARTIALLY_FILLED') {
        setMessage('Partial payment detected. Please finish sending the remaining amount in PayRam.');
      } else {
        setMessage('Waiting for PayRam blockchain confirmation...');
      }
    } catch {
      setStatus('ERROR');
      setMessage('Network error verifying payment status.');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceId]);

  useEffect(() => {
    if (status !== 'OPEN' && status !== 'PARTIALLY_FILLED') return;
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, referenceId]);

  const isDone = status === 'FILLED' || status === 'OVER_FILLED';
  const isFailed = status === 'CANCELLED' || status === 'EXPIRED' || status === 'ERROR';

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#101016] border border-[#d4af37]/35 p-6 sm:p-8 shadow-2xl space-y-5 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#161622] border border-[#2a2a3b] flex items-center justify-center">
          {isDone ? (
            <CheckCircle2 className="w-7 h-7 text-green-400" />
          ) : isFailed ? (
            <AlertCircle className="w-7 h-7 text-red-400" />
          ) : (
            <Clock className="w-7 h-7 text-[#f5d77f] animate-pulse" />
          )}
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-serif font-bold text-white">
            {isDone ? 'Payment Confirmed' : isFailed ? 'Payment Not Completed' : 'Confirming Crypto Payment'}
          </h1>
          <p className="text-xs text-[#94a3b8] leading-relaxed">{message}</p>
        </div>

        {payment && (
          <div className="p-3.5 rounded-2xl bg-[#151520] border border-[#262638] text-xs space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-[#7c7c90]">Reference</span>
              <span className="font-mono text-white">{payment.payramReferenceId || payment.invoiceId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7c7c90]">Amount</span>
              <span className="font-bold text-[#f5d77f]">${Number(payment.amountInUSD || 0).toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7c7c90]">Status</span>
              <span className="font-bold text-white">{payment.status}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {isDone ? (
            <button
              type="button"
              onClick={() => router.push(redirectTarget)}
              className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-1.5"
            >
              Continue to Content
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={checkStatus}
              disabled={checking}
              className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh Status
            </button>
          )}
          <Link href="/" className="text-xs text-[#8c8c9e] hover:text-white py-2">
            Back to The Mirage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-[#d4af37]">
          Checking checkout status...
        </div>
      }
    >
      <CheckoutStatusContent />
    </Suspense>
  );
}
