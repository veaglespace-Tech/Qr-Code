'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation, useForgotPasswordMutation, useResetPasswordMutation } from '@/redux/api/apiSlice';
import Link from 'next/link';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  X,
  Smartphone
} from 'lucide-react';

import ReviewXpressLogo from '@/components/ReviewXpressLogo';

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading: loading, error: rtkError }] = useLoginMutation();
  const [forgotPassword, { isLoading: sendingResetOtp }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: resettingPassword }] = useResetPasswordMutation();

  // Login form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Math calculation captcha state
  const [captcha, setCaptcha] = useState({ num1: 4, num2: 3 });
  const [captchaInput, setCaptchaInput] = useState('');

  // Forgot Password Modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = identifier, 2 = otp + new password
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
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

  // Standard Login Submit
  const handleLoginSubmit = async (e) => {
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
      setFormError(`Incorrect security verification answer. Please solve ${captcha.num1} + ${captcha.num2}.`);
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

  // Open Forgot Password Modal
  const openForgotPassword = () => {
    setForgotIdentifier(identifier.trim());
    setForgotStep(1);
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setModalError('');
    setModalSuccess('');
    setShowForgotModal(true);
  };

  // Step 1: Send Reset OTP
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    const cleanInput = forgotIdentifier.trim();
    if (!cleanInput) {
      setModalError('Please enter your registered email address or mobile number.');
      return;
    }

    try {
      const res = await forgotPassword({ identifier: cleanInput }).unwrap();
      setResetEmail(res.email);
      setMaskedEmail(res.maskedEmail || res.email);
      setForgotStep(2);
      setResendCooldown(60);
      setModalSuccess(res.message || `Password reset code sent to ${res.maskedEmail || res.email}`);
    } catch (err) {
      setModalError(err?.data?.error || err?.message || 'Could not find account. Please check your details.');
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!resetOtp || resetOtp.trim().length !== 6) {
      setModalError('Please enter the 6-digit reset code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setModalError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setModalError('New password and confirm password do not match.');
      return;
    }

    try {
      const res = await resetPassword({
        email: resetEmail,
        otp: resetOtp.trim(),
        newPassword: newPassword.trim()
      }).unwrap();

      setShowForgotModal(false);
      setFormSuccess(res.message || 'Your password has been reset successfully! You can now sign in.');
      setIdentifier(resetEmail);
      setPassword('');
    } catch (err) {
      setModalError(err?.data?.error || err?.message || 'Failed to reset password. Please check your code.');
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

      {/* Main Login Form */}
      <form onSubmit={handleLoginSubmit} className="glass-panel bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4 shadow-sm">
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
              onClick={openForgotPassword}
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer"
            >
              Forgot Password?
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
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Security Verification (Math Captcha) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-slate-700">Security Verification</label>
            <button
              type="button"
              onClick={generateCaptcha}
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors cursor-pointer"
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {forgotStep === 1 ? 'Reset Your Password' : 'Set New Password'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {forgotStep === 1
                  ? 'Enter your registered email address or 10-digit mobile number. We will send a 6-digit security code to your email.'
                  : `Enter the 6-digit reset code sent to ${maskedEmail || resetEmail} and create your new password.`}
              </p>
            </div>

            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Email or Mobile Number
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="name@company.com or 10-digit mobile"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendingResetOtp}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
                >
                  {sendingResetOtp ? <span>Sending Reset Code...</span> : (
                    <>
                      <span>Send Password Reset Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      6-Digit Security Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep(1);
                        setResetOtp('');
                        setModalError('');
                      }}
                      className="text-[11px] font-semibold text-brand-600 hover:underline"
                    >
                      Change Account
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    autoFocus
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-lg font-mono font-bold text-center tracking-[0.4em] focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resettingPassword || resetOtp.length !== 6 || newPassword.length < 6}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
                >
                  {resettingPassword ? <span>Updating Password...</span> : (
                    <>
                      <span>Update Password & Save</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  {resendCooldown > 0 ? (
                    <span className="text-[11px] text-slate-400">
                      Resend code in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendResetCode}
                      disabled={sendingResetOtp}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      Didn&apos;t receive code? Resend Code
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
