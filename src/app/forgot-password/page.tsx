'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Crown, Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#101016] border border-[#262634] rounded-3xl p-8 shadow-2xl relative text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#f5d77f] to-[#aa820a] p-0.5 shadow-gold-sm mb-4">
          <div className="w-full h-full bg-[#0a0a0e] rounded-[14px] flex items-center justify-center">
            <Crown className="w-6 h-6 text-[#f5d77f]" />
          </div>
        </div>

        <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
          Reset Password
        </h2>
        <p className="text-xs text-[#848496] mt-1 mb-6">
          Enter your registered email to receive verification reset instructions.
        </p>

        {submitted ? (
          <div className="py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-950/60 border border-green-500/40 text-green-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Reset Email Dispatched</h4>
            <p className="text-xs text-[#9da3af]">
              If an account matches <span className="text-[#f5d77f]">{email}</span>, a secure password reset link has been dispatched.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 text-xs font-semibold text-[#d4af37] hover:underline"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b2] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#606072] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#161620] border border-[#2b2b3a] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-4">
              <Link href="/login" className="text-xs text-[#848496] hover:text-white inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

