'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation, useSendLoginOtpMutation, useVerifyLoginOtpMutation } from '@/redux/api/apiSlice';
import Link from 'next/link';
import {
  Lock,
  Mail,
  Smartphone,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

import ReviewXpressLogo from '@/components/ReviewXpressLogo';

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading: loading, error: rtkError }] = useLoginMutation();
  const [sendLoginOtp, { isLoading: sendingOtp }] = useSendLoginOtpMutation();
  const [verifyLoginOtp, { isLoading: verifyingOtp }] = useVerifyLoginOtpMutation();

  // Tab mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState('password');

  // Password mode states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Math calculation captcha state
  const [captcha, setCaptcha] = useState({ num1: 4, num2: 3 });
  const [captchaInput, setCaptchaInput] = useState('');

  // OTP mode states
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpSentEmail, setOtpSentEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState(1); // 1 = enter identifier, 2 = enter otp
  const [resendCooldown, setResendCooldown] = useState(0);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ num1: n1, num2: n2 });
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRedirect = (user) => {
    if (user.role === 'SUPERADMIN') {
      router.push('/superadmin/dashboard');
    } else if (user.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/user/dashboard');
    }
  };

  // Standard Password Login
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const cleanInput = identifier.trim();
    if (!cleanInput) {
      setFormError('Please enter your email address or mobile number.');
      return;
    }

    if (!password || password.length < 4) {
      setFormError('Please enter your password.');
      return;
    }

    // Verify calculation captcha
    const expected = captcha.num1 + captcha.num2;
    if (parseInt(captchaInput.trim(), 10) !== expected) {
      setFormError(`Incorrect security captcha answer. Please solve ${captcha.num1} + ${captcha.num2}.`);
      generateCaptcha();
      return;
    }

    try {
      const res = await login({ email: cleanInput, password }).unwrap();
      handleRedirect(res.user);
    } catch (err) {
      setFormError(err?.data?.error || err?.message || 'Login failed. Please check your credentials.');
      generateCaptcha();
    }
  };

  // OTP Login: Step 1 (Send OTP)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const cleanInput = (otpIdentifier || identifier).trim();
    if (!cleanInput) {
      setFormError('Please enter your registered email address or mobile number.');
      return;
    }

    try {
      const res = await sendLoginOtp({ identifier: cleanInput }).unwrap();
      setOtpSentEmail(res.email);
      setMaskedEmail(res.maskedEmail || res.email);
      setOtpStep(2);
      setResendCooldown(60);
      setFormSuccess(res.message || `Verification code sent to ${res.maskedEmail || res.email}`);
    } catch (err) {
      setFormError(err?.data?.error || err?.message || 'Failed to send verification code. Please check your details.');
    }
  };

  // OTP Login: Step 2 (Verify OTP & Login)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setFormError('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      const res = await verifyLoginOtp({
        email: otpSentEmail,
        otp: otpCode.trim()
      }).unwrap();
      setFormSuccess('Signed in successfully! Redirecting...');
      handleRedirect(res.user);
    } catch (err) {
      setFormError(err?.data?.error || err?.message || 'Invalid or expired verification code.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block mx-auto mb-1">
          <ReviewXpressLogo size="lg" />
        </Link>
        <p className="text-xs text-slate-500">
          Sign in to access your dashboard, orders, or partner commissions
        </p>
      </div>

      {/* Auth Mode Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setAuthMode('password');
            setFormError('');
            setFormSuccess('');
          }}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === 'password'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Password Login</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMode('otp');
            setFormError('');
            setFormSuccess('');
            if (identifier && !otpIdentifier) {
              setOtpIdentifier(identifier);
            }
          }}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === 'otp'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Login with OTP</span>
        </button>
      </div>

      {/* Success Alert */}
      {formSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Error Alert */}
      {(formError || rtkError) && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span>{formError || rtkError?.data?.error || rtkError?.message || 'Login failed'}</span>
          </div>
        </div>
      )}

      {/* Password Mode Form */}
      {authMode === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="glass-panel bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address or Mobile Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@company.com or 10-digit mobile"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setOtpIdentifier(identifier);
                }}
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Forgot? Use OTP
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick helper tip for customer orders */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
            <span className="font-bold">Ordered recently?</span> If your account was auto-created during checkout, your default password is <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-950">ReviewXpress@123</code>, or sign in directly via <strong>Login with OTP</strong> above.
          </div>

          {/* Security Verification (Math Captcha) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Security Verification</label>
              <button
                type="button"
                onClick={generateCaptcha}
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center justify-center py-2.5 px-3 rounded-xl bg-slate-100 border border-slate-200 select-none font-mono font-bold text-xs text-slate-800 tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                <span>{captcha.num1} + {captcha.num2} = ?</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                required
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Answer"
                className="w-28 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold text-center focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
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
      )}

      {/* OTP Mode Form */}
      {authMode === 'otp' && (
        <div className="glass-panel bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4 shadow-sm">
          {otpStep === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Email Address or Mobile Number
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={otpIdentifier}
                    onChange={(e) => setOtpIdentifier(e.target.value)}
                    placeholder="Enter email or 10-digit mobile"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  We will send a 6-digit login verification code to your registered email.
                </p>
              </div>

              <button
                type="submit"
                disabled={sendingOtp}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                {sendingOtp ? <span>Sending Code...</span> : (
                  <>
                    <span>Send Verification Code (OTP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-600">
                  Verification code sent to <strong className="text-slate-900">{maskedEmail || otpSentEmail}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep(1);
                    setOtpCode('');
                    setFormError('');
                  }}
                  className="text-[11px] text-brand-600 font-bold hover:underline"
                >
                  Change Email or Mobile
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xl font-mono font-black text-center tracking-[0.5em] focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={verifyingOtp || otpCode.length !== 6}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                {verifyingOtp ? <span>Verifying...</span> : (
                  <>
                    <span>Verify & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                {resendCooldown > 0 ? (
                  <span className="text-[11px] text-slate-400">
                    Resend code in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Didn&apos;t receive code? Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-slate-500 space-y-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setFormError('');
                setFormSuccess('');
              }}
              className="text-brand-600 font-bold hover:underline"
            >
              ← Back to Password Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
