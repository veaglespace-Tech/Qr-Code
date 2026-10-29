'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/slice/authSlice';

import { useRegisterMutation } from '@/redux/api/apiSlice';
import Link from 'next/link';
import { Sparkles, Building, ArrowRight, DollarSign, AlertCircle } from 'lucide-react';
import ReviewXpressLogo from '@/components/ReviewXpressLogo';

export default function PartnerRegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [register, { isLoading: loading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    orgName: '',
    bankHolder: '',
    bankAccount: '',
    bankName: '',
    ifscCode: '',
    upiId: ''
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
    if (!formData.orgName.trim() || formData.orgName.trim().length < 2) {
      errs.orgName = 'Please enter organization or business name (min 2 chars).';
    }
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Please enter contact person name.';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number.';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone.slice(-10))) {
      errs.phone = 'Mobile number should start with 6, 7, 8, or 9.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid official email address.';
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (formData.ifscCode && formData.ifscCode.trim()) {
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(formData.ifscCode.trim())) {
        errs.ifscCode = 'Invalid IFSC code format (e.g. HDFC0001234).';
      }
    }
    if (formData.bankAccount && formData.bankAccount.trim()) {
      if (!/^\d{9,18}$/.test(formData.bankAccount.trim().replace(/\s/g, ''))) {
        errs.bankAccount = 'Bank account number must be 9 to 18 digits.';
      }
    }
    if (formData.upiId && formData.upiId.trim()) {
      if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId.trim())) {
        errs.upiId = 'Invalid UPI ID format (e.g. agency@okaxis or 9822012345@upi).';
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validate()) {
      setErrorMsg('Please correct the highlighted errors in your registration form.');
      return;
    }

    try {
      const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: cleanPhone,
        orgName: formData.orgName.trim(),
        role: 'ADMIN',
        bankDetails: {
          bankHolder: formData.bankHolder.trim(),
          bankAccount: formData.bankAccount.trim(),
          bankName: formData.bankName.trim(),
          ifscCode: formData.ifscCode.trim().toUpperCase(),
          upiId: formData.upiId.trim()
        }
      };

      const res = await register(payload).unwrap();
      if (res.success) {
        dispatch(setUser(res.user));
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setErrorMsg(err?.data?.error || err?.message || 'Registration failed. Please try again.');
    }
  };


  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block mx-auto mb-2">
          <ReviewXpressLogo size="lg" />
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> 100% Free Organization Registration
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Join ReviewXpress Partner Program
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Start referring local shops, cafes, clinics, &amp; service businesses. Earn 15% – 20% commission on every ReviewXpress product sold.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="glass-panel bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-sm">
        {/* Org & Contact Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4 text-amber-600" /> Organization &amp; Account Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Organization / Agency / Business Name *
              </label>
              <input
                type="text"
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                placeholder="e.g. Pune Digital Media Agency"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                  fieldErrors.orgName
                    ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                }`}
              />
              {fieldErrors.orgName && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.orgName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Vikram Deshmukh"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                  fieldErrors.name
                    ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                }`}
              />
              {fieldErrors.name && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp Number (10 Digits) *</label>
              <input
                type="tel"
                name="phone"
                maxLength={13}
                value={formData.phone}
                onChange={handleChange}
                placeholder="9822012345"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                  fieldErrors.phone
                    ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                }`}
              />
              {fieldErrors.phone && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="partner@agency.in"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                  fieldErrors.email
                    ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                }`}
              />
              {fieldErrors.email && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>}
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
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                }`}
              />
              {fieldErrors.password && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.password}</p>}
            </div>
          </div>
        </div>

        {/* Bank & Payout info */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Bank / UPI Details for Commission Payouts
            </h3>
            <span className="text-[11px] text-slate-500">Can update later</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">UPI ID (Fastest Transfer)</label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                placeholder="e.g. agency@okaxis or 9822012345@upi"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                  fieldErrors.upiId
                    ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                }`}
              />
              {fieldErrors.upiId && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.upiId}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Account Number</label>
              <input
                type="text"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                placeholder="9 to 18 digit account number"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                  fieldErrors.bankAccount
                    ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                }`}
              />
              {fieldErrors.bankAccount && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.bankAccount}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="e.g. HDFC0001234"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs uppercase focus:outline-none transition-colors ${
                  fieldErrors.ifscCode
                    ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                    : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                }`}
              />
              {fieldErrors.ifscCode && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.ifscCode}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                name="bankHolder"
                value={formData.bankHolder}
                onChange={handleChange}
                placeholder="As per bank passbook"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>
        </div>


        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          {loading ? (
            <span>Creating Partner Account...</span>
          ) : (
            <>
              <span>Complete Free Registration &amp; Get Referral Code</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="text-amber-800 font-bold hover:underline">
            Login to Partner Dashboard
          </Link>
        </p>
      </form>
    </div>
  );
}
