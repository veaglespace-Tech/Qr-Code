'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/slice/authSlice';
import {
  useRegisterMutation,
  useSendPartnerOtpMutation,
  useVerifyPartnerOtpMutation
} from '@/redux/api/apiSlice';
import Link from 'next/link';
import {
  Sparkles,
  Building,
  ArrowRight,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  MailCheck,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Check,
  Lock,
  Loader2,
  Mail
} from 'lucide-react';
import ReviewXpressLogo from '@/components/ReviewXpressLogo';

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', 'yopmail.fr', '10minutemail.com', 'trashmail.com', 'sharklasers.com',
  'dispostable.com', 'test.com', 'example.com', 'fake.com', 'dummy.com', 'sample.com',
  'asdf.com', 'xyz.com', 'burnermail.io', 'inboxkitten.com', 'mohmal.com'
]);

export default function PartnerRegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [register, { isLoading: loading }] = useRegisterMutation();
  const [sendPartnerOtp, { isLoading: sendingOtp }] = useSendPartnerOtpMutation();
  const [verifyPartnerOtp, { isLoading: verifyingOtp }] = useVerifyPartnerOtpMutation();

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

  // Email verification state
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpNotice, setOtpNotice] = useState({ text: '', isError: false });

  // Resend OTP countdown
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Reset verification if user changes email
    if (name === 'email') {
      setEmailVerified(false);
      setOtpSent(false);
      setOtpCode('');
      setOtpNotice({ text: '', isError: false });
    }

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmailFormat = (email) => {
    if (!email || !email.trim()) return 'Email address is required.';
    const clean = email.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(clean)) return 'Please enter a valid email format (e.g. name@company.com).';

    const parts = clean.split('@');
    if (parts.length !== 2) return 'Invalid email structure.';
    const [local, domain] = parts;

    if (!domain || domain.split('.').length < 2) return 'Domain must include a valid extension (e.g. .com, .in).';

    if (DISPOSABLE_DOMAINS.has(domain)) {
      return 'Temporary or fake email domains are not accepted. Use official email.';
    }

    const blockedLocal = ['test', 'asdf', 'fake', 'dummy', 'temp', 'admin', 'user', '12345'];
    if (blockedLocal.includes(local)) {
      return 'Placeholder usernames (e.g. test, fake) are not accepted.';
    }

    return null;
  };

  const handleSendOtp = async () => {
    setOtpNotice({ text: '', isError: false });
    const err = validateEmailFormat(formData.email);
    if (err) {
      setFieldErrors(prev => ({ ...prev, email: err }));
      return;
    }

    try {
      const res = await sendPartnerOtp({
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim() || formData.orgName.trim()
      }).unwrap();

      if (res.success) {
        setOtpSent(true);
        setOtpTimer(60);
        setOtpNotice({
          text: res.message || `6-digit verification code sent to ${formData.email}!`,
          isError: false
        });
        if (res.devOtp) {
          setOtpCode(res.devOtp); // Auto-fill for convenience in test environment
        }
      }
    } catch (apiErr) {
      setOtpNotice({
        text: apiErr?.data?.error || apiErr?.message || 'Failed to send verification code. Please check email address.',
        isError: true
      });
    }
  };

  const handleVerifyOtp = async () => {
    setOtpNotice({ text: '', isError: false });
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpNotice({ text: 'Please enter the 6-digit verification code.', isError: true });
      return;
    }

    try {
      const res = await verifyPartnerOtp({
        email: formData.email.trim().toLowerCase(),
        otp: otpCode.trim()
      }).unwrap();

      if (res.success) {
        setEmailVerified(true);
        setOtpSent(false);
        setOtpNotice({ text: 'Official Partner Email Verified Successfully! ✓', isError: false });
      }
    } catch (apiErr) {
      setOtpNotice({
        text: apiErr?.data?.error || apiErr?.message || 'Incorrect verification code. Please check and try again.',
        isError: true
      });
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

    const emailErr = validateEmailFormat(formData.email);
    if (emailErr) {
      errs.email = emailErr;
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

    if (!emailVerified) {
      setErrorMsg('Email verification required! Please verify your official email with the 6-digit OTP code before completing registration.');
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Official Organization Partner Program</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Register Your Organization</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Start earning guaranteed 20% commission on ReviewXpress smart stands with custom referral product links.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="glass-panel bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6 shadow-sm">
        {/* Organization & Contact info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-purple-600" /> Organization &amp; Account Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Agency / Business Name *</label>
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

            {/* Email Address with Verification */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Official Email Address (Requires Verification) *
                </label>
                {emailVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    disabled={emailVerified}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="partner@company.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                      emailVerified
                        ? 'bg-emerald-50/50 border-emerald-300 font-bold text-slate-800'
                        : fieldErrors.email
                          ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                          : 'bg-slate-50 border-slate-200 focus:border-amber-500 focus:bg-white'
                    }`}
                  />
                </div>

                {!emailVerified ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpTimer > 0}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-60 shrink-0 cursor-pointer"
                  >
                    {sendingOtp ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : otpTimer > 0 ? (
                      <span>Resend in {otpTimer}s</span>
                    ) : (
                      <>
                        <MailCheck className="w-3.5 h-3.5" />
                        <span>{otpSent ? 'Resend OTP' : 'Verify Email (Send OTP)'}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEmailVerified(false);
                      setOtpSent(false);
                      setOtpNotice({ text: '', isError: false });
                    }}
                    className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 underline transition-colors shrink-0"
                  >
                    Change Email
                  </button>
                )}
              </div>

              {fieldErrors.email && <p className="text-[11px] text-red-600 mt-1">{fieldErrors.email}</p>}

              {/* OTP Notification / Feedback */}
              {otpNotice.text && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    otpNotice.isError
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-purple-50 text-purple-900 border border-purple-200'
                  }`}
                >
                  {otpNotice.isError ? (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 shrink-0 text-purple-600" />
                  )}
                  <span>{otpNotice.text}</span>
                </div>
              )}

              {/* OTP Entry Box */}
              {otpSent && !emailVerified && (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-purple-700" />
                      Enter 6-Digit Verification Code
                    </span>
                    <span className="text-[11px] text-purple-700 font-medium">Valid for 10 min</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-36 px-4 py-2.5 rounded-xl bg-white border border-purple-300 text-purple-950 text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-purple-600 shadow-xs"
                    />

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otpCode.length !== 6}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {verifyingOtp ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
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
          disabled={loading || !emailVerified}
          className={`w-full py-4 rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
            emailVerified
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20 hover:scale-[1.01] cursor-pointer'
              : 'bg-slate-400 cursor-not-allowed opacity-75'
          }`}
        >
          {loading ? (
            <span>Creating Partner Account...</span>
          ) : !emailVerified ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Verify Email to Complete Registration</span>
            </>
          ) : (
            <>
              <span>Complete Verified Registration &amp; Get Referral Code</span>
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
