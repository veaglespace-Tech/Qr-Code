'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/redux/api/apiSlice';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

import ReviewXpressLogo from '@/components/ReviewXpressLogo';

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading: loading, error: rtkError }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setFormError('Please enter your password.');
      return;
    }

    try {
      const res = await login({ email: email.trim().toLowerCase(), password }).unwrap();
      const user = res.user;
      if (user.role === 'SUPERADMIN') {
        router.push('/superadmin/dashboard');
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/orders');
      }
    } catch (err) {
      setFormError(err?.data?.error || err?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block mx-auto mb-1">
          <ReviewXpressLogo size="lg" />
        </Link>
        <p className="text-xs text-slate-500">
          Sign in to access your dashboard, orders, or partner commissions
        </p>
      </div>


      {(formError || rtkError) && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{formError || rtkError?.data?.error || rtkError?.message || 'Login failed'}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-slate-700">Password</label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? <span>Signing In...</span> : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-slate-500 space-y-2 border-t border-slate-100">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-600 font-bold hover:underline">
              Create Customer Account
            </Link>
          </p>
          <p>
            Want to earn commissions?{' '}
            <Link href="/partner/register" className="text-amber-800 font-bold hover:underline">
              Register Organization Partner Free
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
