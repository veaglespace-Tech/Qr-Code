'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  useGetAdminStatsQuery,
  useRequestPayoutMutation,
  useUpdateProfileMutation,
  useGetMyProductLinksQuery,
  useGenerateProductLinkMutation,
  useToggleProductLinkMutation
} from '@/redux/api/apiSlice';
import { logoutUser } from '@/redux/slice/authSlice';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  IndianRupee,
  Share2,
  Copy,
  Check,
  CreditCard,
  Building,
  Sparkles,
  QrCode,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  ExternalLink,
  Store,
  LogOut,
  RefreshCw,
  Search,
  Download,
  Save,
  Loader2,
  ChevronRight,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Link2,
  Globe,
  ToggleLeft,
  ToggleRight,
  Zap
} from 'lucide-react';
import QRCode from 'qrcode';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { data: stats, isLoading: loading, refetch } = useGetAdminStatsQuery();
  const [requestPayout, { isLoading: submittingPayout }] = useRequestPayoutMutation();
  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();

  // Product links
  const { data: linksData, isLoading: linksLoading, refetch: refetchLinks } = useGetMyProductLinksQuery();
  const [generateProductLink, { isLoading: generatingLink }] = useGenerateProductLinkMutation();
  const [toggleProductLink] = useToggleProductLinkMutation();
  const [generatingLinkId, setGeneratingLinkId] = useState(null);
  const [productLinkQrs, setProductLinkQrs] = useState({});
  const [copiedLinkCode, setCopiedLinkCode] = useState('');

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralQrUrl, setReferralQrUrl] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Payout request modal states
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutMsg, setPayoutMsg] = useState('');
  const [payoutError, setPayoutError] = useState('');

  // Alerts
  const [notice, setNotice] = useState({ text: '', isError: false });
  const triggerNotice = (text, isError = false) => {
    setNotice({ text, isError });
    setTimeout(() => setNotice({ text: '', isError: false }), 4500);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
    } catch {}
    window.location.href = '/login';
  };

  // Profile & Bank settings state
  const [profileForm, setProfileForm] = useState({
    name: '',
    orgName: '',
    phone: '',
    upiId: '',
    bankName: '',
    bankAccount: '',
    ifscCode: '',
    bankHolder: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false
  });

  useEffect(() => {
    if (user || stats?.partner) {
      setProfileForm(prev => ({
        ...prev,
        name: stats?.partner?.name || user?.name || '',
        orgName: stats?.partner?.orgName || user?.orgName || '',
        phone: user?.phone || '',
        upiId: stats?.partner?.upiId || user?.upiId || '',
        bankName: stats?.partner?.bankName || user?.bankName || '',
        bankAccount: stats?.partner?.bankAccount || user?.bankAccount || '',
        ifscCode: stats?.partner?.ifscCode || user?.ifscCode || '',
        bankHolder: stats?.partner?.bankHolder || user?.bankHolder || ''
      }));
    }
  }, [stats, user]);

  useEffect(() => {
    if (stats?.partner?.referralCode || user?.referralCode) {
      const code = stats?.partner?.referralCode || user?.referralCode;
      const link = typeof window !== 'undefined'
        ? `${window.location.origin}/?ref=${code}`
        : `http://localhost:3000/?ref=${code}`;

      QRCode.toDataURL(link, { width: 300, margin: 1.5, color: { dark: '#090d16', light: '#ffffff' } })
        .then(url => setReferralQrUrl(url))
        .catch(err => console.error(err));
    }
  }, [stats, user]);

  const referralCode = stats?.partner?.referralCode || user?.referralCode || 'PARTNER';
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${referralCode}`
    : `http://localhost:3000/?ref=${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Transform your Google Reviews with ReviewXpress Smart NFC & Laser QR acrylic stands! Tap or scan to leave an instant 5-star review. Use my partner link for a special 5% customer discount: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDownloadQr = () => {
    if (!referralQrUrl) return;
    const a = document.createElement('a');
    a.href = referralQrUrl;
    a.download = `ReviewXpress-Partner-${referralCode}-QR.png`;
    a.click();
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    setPayoutError('');
    setPayoutMsg('');

    try {
      const res = await requestPayout({
        amount: payoutAmount,
        notes: payoutNotes
      }).unwrap();

      if (res.success) {
        setPayoutMsg(res.message || 'Withdrawal request submitted for Superadmin review!');
        setPayoutAmount('');
        setPayoutNotes('');
        refetch();
        setTimeout(() => {
          setPayoutModalOpen(false);
          setPayoutMsg('');
        }, 2200);
      }
    } catch (err) {
      setPayoutError(err?.data?.error || err?.message || 'Failed to submit withdrawal request');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      triggerNotice('New password and confirmation password do not match', true);
      return;
    }
    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      triggerNotice('New password must be at least 6 characters long', true);
      return;
    }

    try {
      const payload = {
        name: profileForm.name,
        orgName: profileForm.orgName,
        phone: profileForm.phone,
        upiId: profileForm.upiId,
        bankName: profileForm.bankName,
        bankAccount: profileForm.bankAccount,
        ifscCode: profileForm.ifscCode,
        bankHolder: profileForm.bankHolder
      };
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }

      const res = await updateProfile(payload).unwrap();
      if (res.success) {
        triggerNotice(res.message || 'Organization profile and payout details saved successfully!', false);
        refetch();
        setProfileForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (err) {
      triggerNotice(err?.data?.error || err?.message || 'Failed to update profile', true);
    }
  };

  const metrics = stats?.metrics || {
    totalReferredOrders: 0,
    successfulOrders: 0,
    totalSalesVolume: 0,
    totalCommissionEarned: 0,
    totalPaidOut: 0,
    availableBalance: 0,
    minPayoutAmount: 500,
    pendingPayoutRequests: 0
  };

  const recentOrders = stats?.recentOrders || [];

  const filteredOrders = useMemo(() => {
    if (!orderSearch.trim()) return recentOrders;
    const q = orderSearch.toLowerCase();
    return recentOrders.filter(o =>
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.businessName?.toLowerCase().includes(q)
    );
  }, [recentOrders, orderSearch]);

  const navItems = [
    { id: 'overview', label: 'Overview & Earnings', icon: LayoutDashboard },
    { id: 'products', label: 'My Product Links', icon: Link2 },
    { id: 'referrals', label: 'Marketing Link & QR', icon: Share2 },
    { id: 'orders', label: 'Referred Orders', icon: Package, badge: recentOrders.length },
    { id: 'payouts', label: 'Withdrawals & Balances', icon: IndianRupee },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-300 text-sm font-medium">Loading Organization Partner Console...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ================= UNIFIED MODERN SAAS SIDEBAR ================= */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-[#090d16] text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Building className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base tracking-tight">ReviewXpress</span>
                <span className="text-[9px] uppercase font-extrabold tracking-widest bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                  Partner
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Organization Console</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Partner Navigation
            </span>
            <nav className="mt-2 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge !== null && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Partner Referral Code Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Promo Code
            </span>
            <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-slate-800">
              <span className="font-mono font-black text-purple-400 text-sm tracking-wide">{referralCode}</span>
              <button
                onClick={handleCopyLink}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Commission: <strong className="text-white">{stats?.partner?.commissionPercent || 15}%</strong> per sale
            </p>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-800/80 space-y-2 bg-[#060910]">
          <Link
            href="/shop"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Browse Hardware Store</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                setActiveTab('profile');
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-2.5 overflow-hidden text-left transition-all p-1.5 -ml-1.5 rounded-xl group flex-1 mr-1 ${
                activeTab === 'profile' ? 'bg-purple-600/20 border border-purple-500/40 text-purple-200' : 'hover:bg-white/5'
              }`}
              title="Click to view & edit Profile"
            >
              <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:border-purple-400">
                {(stats?.partner?.orgName || user?.orgName || user?.name || 'P')[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                  {stats?.partner?.orgName || user?.orgName || user?.name || 'Partner Admin'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT PANE ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between flex-shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight capitalize">
                {activeTab === 'overview' && 'Partner Overview & Performance'}
                {activeTab === 'products' && 'My Product Referral Links'}
                {activeTab === 'referrals' && 'Marketing Link & Counter QR Code'}
                {activeTab === 'orders' && 'Referred Customer Orders'}
                {activeTab === 'payouts' && 'Commission Balances & Withdrawals'}
                {activeTab === 'profile' && 'Organization Profile & Bank Information'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors"
              title="Logout of session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              onClick={() => setPayoutModalOpen(true)}
              disabled={metrics.availableBalance < metrics.minPayoutAmount}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 disabled:opacity-50 transition-all"
            >
              <IndianRupee className="w-4 h-4" />
              <span>Withdraw ₹{metrics.availableBalance}</span>
            </button>
          </div>
        </header>

        {/* Global Toast Notice */}
        {notice.text && (
          <div className={`mx-4 sm:mx-8 mt-4 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            notice.isError
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}>
            {notice.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{notice.text}</span>
          </div>
        )}

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Sales Volume</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">₹{metrics.totalSalesVolume}</div>
                  <p className="text-[11px] text-slate-500">From {metrics.successfulOrders} successful client purchases</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Earned</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-indigo-600">₹{metrics.totalCommissionEarned}</div>
                  <p className="text-[11px] text-slate-500">At {stats?.partner?.commissionPercent || 15}% commission rate</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Available Balance</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-600">₹{metrics.availableBalance}</div>
                  <p className="text-[11px] text-slate-500">Ready for instant withdrawal request</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Disbursed</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">₹{metrics.totalPaidOut}</div>
                  <p className="text-[11px] text-slate-500">Pending payouts: ₹{metrics.pendingPayoutRequests}</p>
                </div>
              </div>

              {/* Quick Referral Link Sharing Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 border border-purple-100 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Partner Commission Code: {referralCode}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Earn {stats?.partner?.commissionPercent || 15}% commission on every smart stand sold
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                    Share your unique link with local shops, clinics, salons, and restaurants. Customers get an instant <strong>5% discount</strong> and you get credited automatically upon order delivery.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                    <div className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono text-xs truncate shadow-2xs">
                      {referralLink}
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-2">
                  {referralQrUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={referralQrUrl} alt="Referral QR" className="w-32 h-32 rounded-xl bg-white p-1 border border-slate-200" />
                  ) : (
                    <div className="w-32 h-32 bg-slate-100 rounded-xl animate-pulse" />
                  )}
                  <button
                    onClick={handleDownloadQr}
                    className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Scanner QR
                  </button>
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Recent Referred Orders</h3>
                    <p className="text-xs text-slate-400">Latest customer purchases tagged to your partner code</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs divide-y divide-slate-100">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Order #</th>
                        <th className="py-2.5 px-3">Customer / Business</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Subtotal</th>
                        <th className="py-2.5 px-3">Your Commission</th>
                        <th className="py-2.5 px-3">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No referral orders yet. Share your link to start generating earnings!
                          </td>
                        </tr>
                      ) : (
                        recentOrders.slice(0, 5).map(o => (
                          <tr key={o.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-slate-900 block">{o.customerName}</span>
                              <span className="text-[11px] text-slate-400">{o.businessName || 'Direct'}</span>
                            </td>
                            <td className="py-3 px-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                            <td className="py-3 px-3 font-bold text-slate-900">₹{o.subtotal}</td>
                            <td className="py-3 px-3 font-black text-purple-700">
                              ₹{o.adminCommissionAmount} ({o.adminCommissionPercent}%)
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {o.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: MY PRODUCT LINKS ================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-purple-50 border border-purple-100 flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-purple-900">Unique Per-Product Referral Links</p>
                  <p className="text-xs text-purple-700 mt-1">
                    Each product gets a unique shareable link assigned to you. When a customer lands on your link, they see <strong>only that product</strong> and can purchase it. Your commission is automatically tracked.
                  </p>
                </div>
              </div>

              {linksLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {(linksData?.items || []).map(({ product, link }) => {
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com';
                    const linkUrl = link ? `${baseUrl}/buy/${link.linkCode}` : null;

                    return (
                      <div key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        {/* Product header */}
                        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                          {product.image ? (
                            <img src={product.image} alt={product.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5 text-purple-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{product.title}</p>
                            <p className="text-xs text-slate-500">₹{product.price.toLocaleString('en-IN')}</p>
                          </div>
                          {link && (
                            <span className={`ml-auto shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${link.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {link.isActive ? 'Active' : 'Paused'}
                            </span>
                          )}
                        </div>

                        {/* Link section */}
                        <div className="p-4 space-y-3">
                          {link ? (
                            <>
                              {/* Link URL display */}
                              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="text-xs text-slate-600 truncate flex-1 font-mono">{linkUrl}</span>
                                <button
                                  onClick={() => {
                                    navigator?.clipboard?.writeText(linkUrl);
                                    setCopiedLinkCode(link.linkCode);
                                    setTimeout(() => setCopiedLinkCode(''), 2000);
                                  }}
                                  className="shrink-0 text-purple-600 hover:text-purple-800"
                                >
                                  {copiedLinkCode === link.linkCode ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              {/* Stats row */}
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {link.clickCount || 0} clicks
                                </span>
                                <span className="font-mono text-slate-400">{link.linkCode}</span>
                              </div>

                              {/* Action buttons */}
                              <div className="flex gap-2">
                                <a
                                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this product: ${linkUrl}`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                  WhatsApp
                                </a>
                                <button
                                  onClick={async () => {
                                    try {
                                      await toggleProductLink(link.id).unwrap();
                                      refetchLinks();
                                    } catch {}
                                  }}
                                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-xl transition-colors border ${link.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                                >
                                  {link.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                                  {link.isActive ? 'Pause' : 'Activate'}
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              disabled={generatingLinkId === product.id}
                              onClick={async () => {
                                setGeneratingLinkId(product.id);
                                try {
                                  await generateProductLink({ productId: product.id }).unwrap();
                                  refetchLinks();
                                } catch (err) {
                                  triggerNotice(err?.data?.error || 'Failed to generate link', true);
                                } finally {
                                  setGeneratingLinkId(null);
                                }
                              }}
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                            >
                              {generatingLinkId === product.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Link2 className="w-3.5 h-3.5" />
                              )}
                              {generatingLinkId === product.id ? 'Generating...' : 'Generate My Referral Link'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(linksData?.items || []).length === 0 && (
                    <div className="col-span-2 text-center py-20 text-slate-400 text-sm">
                      No products available yet. Superadmin needs to add products first.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: REFERRAL TOOLS & QR ================= */}
          {activeTab === 'referrals' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Your Dedicated Affiliate Link</h3>
                    <p className="text-xs text-slate-400">Share with merchants to automatically earn commissions on their orders.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Direct Web Storefront URL:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 space-y-2">
                    <h4 className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" /> How It Works for Your Clients:
                    </h4>
                    <ul className="space-y-1 list-disc pl-4 text-slate-700 text-[11px]">
                      <li>When shop owners click your link, our system cookies their session for 30 days.</li>
                      <li>They receive an automated <strong>5% partner discount</strong> at checkout.</li>
                      <li>You earn a guaranteed <strong>{stats?.partner?.commissionPercent || 15}%</strong> commission on every stand ordered.</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleShareWhatsApp}
                      className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Broadcast to WhatsApp Business Contacts</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">In-Person Counter QR Code</h3>
                    <p className="text-xs text-slate-400">Print or present on mobile for instant ordering</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                    {referralQrUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={referralQrUrl} alt="Referral QR Code" className="w-52 h-52 mx-auto rounded-xl bg-white p-2 shadow-sm" />
                    ) : (
                      <div className="w-52 h-52 bg-slate-200 rounded-xl mx-auto" />
                    )}
                  </div>

                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Code: <strong className="font-mono text-slate-900">{referralCode}</strong>
                  </p>

                  <button
                    onClick={handleDownloadQr}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download High-Res QR Image</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: REFERRED ORDERS ================= */}
          {activeTab === 'orders' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Referred Customer Purchases</h3>
                  <p className="text-xs text-slate-400">All orders placed using your referral code or direct link</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order # or client..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer / Shop</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Order Subtotal</th>
                      <th className="py-3 px-4">Your Cut</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No orders matched your search.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{order.customerName}</p>
                            <p className="text-[11px] text-slate-500">{order.businessName || 'Direct Purchase'}</p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">₹{order.subtotal}</td>
                          <td className="py-3.5 px-4 font-black text-purple-700 whitespace-nowrap">
                            ₹{order.adminCommissionAmount} ({order.adminCommissionPercent}%)
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                              {order.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 4: WITHDRAWALS & PAYOUTS ================= */}
          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Available For Withdrawal</span>
                  <div className="text-3xl font-black text-emerald-600">₹{metrics.availableBalance}</div>
                  <p className="text-[11px] text-slate-500">Minimum withdrawal: ₹{metrics.minPayoutAmount}</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Total Transferred</span>
                  <div className="text-3xl font-black text-slate-900">₹{metrics.totalPaidOut}</div>
                  <p className="text-[11px] text-slate-500">Successfully sent via IMPS / UPI</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-400">Ready to Cash Out?</span>
                    <p className="text-[11px] text-slate-500 mt-1">Processed within 24-48 hours to registered bank/UPI.</p>
                  </div>
                  <button
                    onClick={() => setPayoutModalOpen(true)}
                    disabled={metrics.availableBalance < metrics.minPayoutAmount}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 disabled:opacity-50 transition-all"
                  >
                    Submit Withdrawal Request
                  </button>
                </div>
              </div>

              {/* Registered Destination Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-600" />
                    <span>Your Active Payout Destination</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="text-xs font-bold text-purple-600 hover:underline"
                  >
                    Edit Bank / UPI Details
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">UPI ID:</span>
                    <span className="font-mono font-bold text-emerald-600">{profileForm.upiId || 'Not configured'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Bank Account:</span>
                    <span className="font-bold text-slate-900">
                      {profileForm.bankAccount ? `${profileForm.bankAccount} (${profileForm.bankName || 'Bank'})` : 'Not configured'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">IFSC Code:</span>
                    <span className="font-mono font-bold text-slate-800">{profileForm.ifscCode || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Account Holder:</span>
                    <span className="font-bold text-slate-900">{profileForm.bankHolder || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: ORGANIZATION PROFILE & BANK ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-5xl">
              {/* Profile Header Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-purple-600/20 flex items-center justify-center">
                    <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center text-white font-black text-2xl">
                      {(stats?.partner?.orgName || user?.orgName || user?.name || 'P')[0]?.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">
                        {stats?.partner?.orgName || user?.orgName || 'Organization Partner'}
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                        Affiliate Partner
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Contact: <strong>{stats?.partner?.name || user?.name}</strong> • {user?.email}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                      <span>Referral Code: <strong className="font-mono text-purple-700 font-bold">{referralCode}</strong></span>
                      <span>•</span>
                      <span>Commission: <strong className="text-slate-700">{stats?.partner?.commissionPercent || 15}%</strong></span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active &amp; Approved
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Verified Partner
                  </span>
                </div>
              </div>

              {/* Profile, Bank & Password Form */}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Column 1: Organization & Contact Info */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Building className="w-5 h-5 text-purple-600" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Organization &amp; Contact Info</h4>
                        <p className="text-[11px] text-slate-400">Update your agency identity and phone number</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Organization / Agency Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.orgName}
                          onChange={(e) => setProfileForm({ ...profileForm, orgName: e.target.value })}
                          placeholder="e.g. Veagle Space Digital"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-purple-500 focus:outline-hidden transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Contact Person Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="e.g. Vinay Patel"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-purple-500 focus:outline-hidden transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-purple-500 focus:outline-hidden transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Registered Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            readOnly
                            disabled
                            value={user?.email || ''}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold cursor-not-allowed"
                          />
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Partner email is linked to your commission account and cannot be modified directly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Bank & UPI Destination */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Payout Destination (Bank &amp; UPI)</h4>
                        <p className="text-[11px] text-slate-400">Withdrawals are directly sent to these coordinates</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          UPI ID (Fastest Settlement)
                        </label>
                        <input
                          type="text"
                          value={profileForm.upiId}
                          onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })}
                          placeholder="e.g. business@okaxis or 9876543210@upi"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:border-purple-500 focus:outline-hidden transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Bank Name</label>
                          <input
                            type="text"
                            value={profileForm.bankName}
                            onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                            placeholder="e.g. HDFC Bank"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-purple-500 focus:outline-hidden transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">IFSC Code</label>
                          <input
                            type="text"
                            value={profileForm.ifscCode}
                            onChange={(e) => setProfileForm({ ...profileForm, ifscCode: e.target.value.toUpperCase() })}
                            placeholder="e.g. HDFC0001234"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono uppercase focus:bg-white focus:border-purple-500 focus:outline-hidden transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Bank Account Number</label>
                        <input
                          type="text"
                          value={profileForm.bankAccount}
                          onChange={(e) => setProfileForm({ ...profileForm, bankAccount: e.target.value })}
                          placeholder="9 to 18 digits"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:border-purple-500 focus:outline-hidden transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Holder Name</label>
                        <input
                          type="text"
                          value={profileForm.bankHolder}
                          onChange={(e) => setProfileForm({ ...profileForm, bankHolder: e.target.value })}
                          placeholder="Name exactly as printed on passbook"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-purple-500 focus:outline-hidden transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Lock className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Security &amp; Password Update</h4>
                      <p className="text-[11px] text-slate-400">Leave blank if you do not want to change your partner password</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
                      <div className="relative">
                        <input
                          type={profileForm.showCurrentPassword ? 'text' : 'password'}
                          value={profileForm.currentPassword}
                          onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                          placeholder="Current password"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-purple-500 focus:outline-hidden transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setProfileForm(p => ({ ...p, showCurrentPassword: !p.showCurrentPassword }))}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {profileForm.showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                      <div className="relative">
                        <input
                          type={profileForm.showNewPassword ? 'text' : 'password'}
                          value={profileForm.newPassword}
                          onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                          placeholder="Min 6 characters"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-purple-500 focus:outline-hidden transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setProfileForm(p => ({ ...p, showNewPassword: !p.showNewPassword }))}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {profileForm.showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        placeholder="Re-type new password"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-purple-500 focus:outline-hidden transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{savingProfile ? 'Saving Details...' : 'Save Profile & Payout Information'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: WITHDRAWAL REQUEST ================= */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-purple-600" />
                <span>Request Commission Withdrawal</span>
              </h3>
              <button onClick={() => setPayoutModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span>Available Balance:</span>
                <span className="font-bold text-emerald-600">₹{metrics.availableBalance}</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Withdrawal:</span>
                <span>₹{metrics.minPayoutAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Payout Destination:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">
                  {profileForm.upiId || profileForm.bankAccount || 'Not configured'}
                </span>
              </div>
            </div>

            {payoutError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{payoutError}</span>
              </div>
            )}

            {payoutMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{payoutMsg}</span>
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Withdrawal Amount (₹) *
                </label>
                <input
                  type="number"
                  min={metrics.minPayoutAmount}
                  max={metrics.availableBalance}
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder={`Min ₹${metrics.minPayoutAmount}`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Specific UPI or IMPS details:
                </label>
                <textarea
                  rows={2}
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. Please transfer to GPay UPI: agency@okaxis"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout || metrics.availableBalance < metrics.minPayoutAmount}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs disabled:opacity-50 shadow-md shadow-purple-600/30 transition-all"
                >
                  {submittingPayout ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
