'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Crown, Lock, Mail, User, Sparkles, ArrowRight, AlertCircle, Heart } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams?.get('role') === 'CREATOR' ? 'CREATOR' : 'SUBSCRIBER';

  const [role, setRole] = useState<'SUBSCRIBER' | 'CREATOR'>(initialRole);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('9.99');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams?.get('role') === 'CREATOR') {
      setRole('CREATOR');
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          role,
          monthlyPrice: role === 'CREATOR' ? parseFloat(monthlyPrice) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('mirage_token', data.token);
      localStorage.setItem('mirage_user', JSON.stringify(data.user));

      if (data.user.role === 'CREATOR') {
        router.push('/creator-studio');
      } else {
        router.push('/explore');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-[#101016] border border-[#262634] rounded-3xl p-8 shadow-2xl relative">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-3 group">
            <img
              src="/assets/the_mirage_logo.png"
              alt="The Mirage"
              className="h-14 w-auto mx-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
          <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
            Join <span className="gold-text-gradient">The Mirage</span>
          </h2>
          <p className="text-xs text-[#848496] mt-1">
            Real People. Exclusive Content. Your World.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#161622] rounded-2xl border border-[#262636] mb-6">
          <button
            type="button"
            onClick={() => setRole('SUBSCRIBER')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'SUBSCRIBER'
                ? 'gold-button shadow-gold-sm'
                : 'text-[#888899] hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            I Want to Subscribe
          </button>
          <button
            type="button"
            onClick={() => setRole('CREATOR')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'CREATOR'
                ? 'gold-button shadow-gold-sm'
                : 'text-[#888899] hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Become a Creator (85%)
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#a0a0b2] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#606072] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mia Carter"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#161620] border border-[#2b2b3a] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a0a0b2] mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="text-[#606072] text-sm absolute left-3.5 top-1/2 -translate-y-1/2 font-mono">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="miacarter"
                  className="w-full pl-8 pr-4 py-2.5 bg-[#161620] border border-[#2b2b3a] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          </div>

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
            <label className="block text-xs font-semibold text-[#a0a0b2] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#606072] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-[#161620] border border-[#2b2b3a] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {role === 'CREATOR' && (
            <div className="p-4 rounded-xl bg-[#14141e] border border-[#d4af37]/30 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#f5d77f]">
                  Monthly Subscription Price ($ USD)
                </label>
                <span className="text-[11px] text-[#9090a0]">You keep 85%</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="1.99"
                max="99.99"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                className="w-full px-4 py-2 bg-[#1b1b26] border border-[#2d2d3e] rounded-lg text-sm text-white font-bold"
              />
              <p className="text-[10px] text-[#78788a]">
                Standard platform revenue split: 85% creator earnings, 15% platform commission.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 text-xs text-[#7e7e90]">
            <input type="checkbox" required id="terms" className="accent-[#d4af37]" />
            <label htmlFor="terms">
              I am 18+ and accept the{' '}
              <Link href="/terms" className="text-[#f5d77f] underline">Terms</Link> &{' '}
              <Link href="/content-policy" className="text-[#f5d77f] underline">Content Policy</Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gold-button text-xs font-bold shadow-gold-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-[#7c7c90]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#f5d77f] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08080a] flex items-center justify-center text-[#d4af37]">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
