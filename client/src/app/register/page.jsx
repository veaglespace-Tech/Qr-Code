'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/slice/authSlice';

import { useRegisterMutation } from '@/redux/api/apiSlice';
import Link from 'next/link';
import { ArrowRight, AlertCircle } from 'lucide-react';
import ReviewXpressLogo from '@/components/ReviewXpressLogo';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [register, { isLoading: loading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    orgName: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Please enter your full name (minimum 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number.';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone.slice(-10))) {
      errs.phone = 'Mobile number should start with 6, 7, 8, or 9.';
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validate()) {
      setErrorMsg('Please correct the highlighted errors.');
      return;
    }

    try {
      const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: cleanPhone,
        orgName: formData.orgName.trim(),
        role: 'USER'
      }).unwrap();

      if (res.success) {
        dispatch(setUser(res.user));
        router.push('/user/orders');
      }
    } catch (err) {
      setErrorMsg(err?.data?.error || err?.message || 'Registration failed');
    }
  };


  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block mx-auto mb-1">
          <ReviewXpressLogo size="lg" />
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Customer Account</h1>
        <p className="text-xs text-slate-500">Track your ReviewXpress hardware orders and download tax invoices</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="glass-panel bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Rahul Patil"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
              fieldErrors.name
                ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
            }`}
          />
          {fieldErrors.name && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Business / Store Name</label>
          <input
            type="text"
            name="orgName"
            value={formData.orgName}
            onChange={handleChange}
            placeholder="e.g. Patil Orthopedic Clinic"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="rahul@gmail.com"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
              fieldErrors.email
                ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
            }`}
          />
          {fieldErrors.email && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (10 Digits) *</label>
          <input
            type="tel"
            name="phone"
            maxLength={13}
            value={formData.phone}
            onChange={handleChange}
            placeholder="9876543210"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
              fieldErrors.phone
                ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
            }`}
          />
          {fieldErrors.phone && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.phone}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Create Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
              fieldErrors.password
                ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
            }`}
          />
          {fieldErrors.password && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.password}</p>}
        </div>


        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 pt-2"
        >
          {loading ? <span>Creating Account...</span> : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
