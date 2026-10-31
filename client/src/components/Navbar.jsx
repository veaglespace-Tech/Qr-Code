'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '@/redux/slice/authSlice';

import { ShoppingBag, Shield, Users, User, LogOut, Sparkles, QrCode, Phone, Menu, X } from 'lucide-react';
import ReviewXpressLogo from '@/components/ReviewXpressLogo';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user } = useSelector(state => state.auth);
  const { items, partnerInfo } = useSelector(state => state.cart);
  const { data: settings } = useSelector(state => state.settings);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Do not render consumer storefront navigation inside dashboard consoles
  if (pathname?.startsWith('/superadmin') || pathname?.startsWith('/admin') || pathname?.startsWith('/user')) {
    return null;
  }

  const isBuyPage = pathname?.startsWith('/buy/');
  const totalCartCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <>
      {/* Sticky Partner Referral Banner (Persistent site-wide) */}
      {mounted && partnerInfo && !isBuyPage && (
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white text-xs px-4 py-2 border-b border-purple-800/60 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span suppressHydrationWarning>
                Shopping with Authorized Partner: <strong className="text-amber-300 font-extrabold" suppressHydrationWarning>{partnerInfo.orgName || partnerInfo.name}</strong>
              </span>
              <span className="hidden md:inline text-purple-200 text-[11px] font-semibold bg-purple-800/80 px-2 py-0.5 rounded-full">
                ✨ Verified Partner Store
              </span>
            </div>
            {partnerInfo.linkCode && (
              <Link
                href={`/buy/${partnerInfo.linkCode}`}
                className="text-[11px] font-bold text-purple-950 bg-amber-300 hover:bg-amber-200 px-3 py-1 rounded-lg transition-all flex items-center gap-1 shadow-xs"
              >
                <span>↩ Recommended Product</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Official ReviewXpress Logo */}
            <Link href="/" className="group flex items-center">
              <ReviewXpressLogo size="default" />
            </Link>

            {/* Desktop Navigation Links */}
            {isBuyPage ? (
              <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span suppressHydrationWarning>
                  Exclusive Partner Store:{' '}
                  <strong className="text-purple-700 font-black" suppressHydrationWarning>
                    {mounted ? (partnerInfo?.orgName || 'Official Partner') : 'Official Partner'}
                  </strong>
                </span>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1">
                <Link href="/how-it-works" className="px-3.5 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-all">
                  How It Works
                </Link>
                <Link href="/partner" className="px-3.5 py-2 rounded-xl text-sm font-bold text-amber-800 hover:text-amber-900 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/90 flex items-center gap-1.5 transition-all shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Partner Program ({settings?.defaultCommissionPercent || 15}%)
                </Link>
                <Link href="/contact" className="px-3.5 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-all">
                  Support
                </Link>
              </div>
            )}

            {/* Actions: Role buttons + Cart + Auth */}
            <div className="flex items-center gap-3">
              {isBuyPage && mounted && partnerInfo?.phone && (
                <a
                  href={`tel:${partnerInfo.phone}`}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-purple-600" />
                  <span>Partner Help: {partnerInfo.phone}</span>
                </a>
              )}

              {/* Cart Button: ONLY visible when shopping through a partner link or on checkout flow */}
              {(isBuyPage || pathname === '/cart' || pathname === '/checkout' || (mounted && partnerInfo)) && (
                <Link
                  href="/cart"
                  className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors border border-slate-200"
                  title="View Cart"
                >
                  <ShoppingBag className="w-5 h-5 text-slate-700" />
                  {mounted && totalCartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rxgreen-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                      {totalCartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Logged in User Pill */}
              {user ? (
                <div className="flex items-center gap-2">
                  {user.role === 'SUPERADMIN' && (
                    <Link
                      href="/superadmin/dashboard"
                      className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Shield className="w-3.5 h-3.5 text-purple-700" />
                      Superadmin
                    </Link>
                  )}

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin/dashboard"
                      className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-700" />
                      Partner ({user.referralCode || 'Org'})
                    </Link>
                  )}

                  {user.role === 'USER' && (
                    <Link
                      href="/user/dashboard"
                      className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5 text-purple-700" />
                      My Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/partner/register"
                    className="px-4 py-2.5 rounded-xl text-xs font-black btn-primary-rx shadow-glow-green active:scale-95 transition-all"
                  >
                    Join as Partner
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 font-semibold hover:text-brand-600"
            >
              How It Works
            </Link>
            <Link
              href="/partner"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-amber-800 font-semibold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Refer &amp; Earn (Partner Program)
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 font-semibold hover:text-brand-600"
            >
              Contact Support
            </Link>
            {!user && (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-lg bg-slate-100 text-slate-800 font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/partner/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-lg bg-brand-600 text-white font-bold"
                >
                  Register Partner Free
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
