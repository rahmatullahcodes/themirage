'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Crown, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      localStorage.setItem('mirage_token', data.token);
      localStorage.setItem('mirage_user', JSON.stringify(data.user));

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.role === 'CREATOR') {
        router.push('/creator-studio');
      } else {
        router.push(redirectPath);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#101016] border border-[#262634] rounded-3xl p-8 shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#f5d77f] to-[#aa820a] p-0.5 shadow-gold-sm mb-3">
            <div className="w-full h-full bg-[#0a0a0e] rounded-[14px] flex items-center justify-center">
              <Crown className="w-6 h-6 text-[#f5d77f]" />
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            Welcome to <span className="gold-text-gradient">The Mirage</span>
          </h2>
          <p className="text-xs text-[#848496] mt-1">
            Sign in to access your subscriptions and messages
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-[#a0a0b2]">
                Password
              </label>
              <Link href="/forgot-password" className="text-[11px] text-[#d4af37] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#606072] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#161620] border border-[#2b2b3a] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#1c1c28]">
          <span className="text-[11px] text-[#636375] block text-center mb-2 font-medium">
            Quick Demo Login:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setEmail('subscriber@themirage.vip');
                setPassword('password123');
              }}
              className="py-1.5 px-2 rounded-lg bg-[#151520] border border-[#252535] text-[10px] text-[#9a9ab0] hover:text-[#f5d77f] hover:border-[#d4af37]/40"
            >
              Subscriber
            </button>
            <button
              onClick={() => {
                setEmail('creator@themirage.vip');
                setPassword('password123');
              }}
              className="py-1.5 px-2 rounded-lg bg-[#151520] border border-[#252535] text-[10px] text-[#9a9ab0] hover:text-[#f5d77f] hover:border-[#d4af37]/40"
            >
              Creator
            </button>
            <button
              onClick={() => {
                setEmail('admin@themirage.vip');
                setPassword('password123');
              }}
              className="py-1.5 px-2 rounded-lg bg-[#151520] border border-[#252535] text-[10px] text-[#9a9ab0] hover:text-[#f5d77f] hover:border-[#d4af37]/40"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-[#7c7c90]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#f5d77f] font-semibold hover:underline">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08080a] flex items-center justify-center text-[#d4af37]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
