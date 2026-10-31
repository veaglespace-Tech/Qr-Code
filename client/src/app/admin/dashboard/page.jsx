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
import { useDebounce } from '@/hooks/useDebounce';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  IndianRupee,
  Users,
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
  Zap,
  Star,
  Info
} from 'lucide-react';
import QRCode from 'qrcode';
import Link from 'next/link';

// Safe parsers for specifications & features
function parseSpecs(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) {
      return parsed.map((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          const key = item.key || item.label || item.name || Object.keys(item)[0] || `Spec #${idx + 1}`;
          const value = item.value || Object.values(item)[0] || '';
          return { key, value };
        }
        return { key: `Spec #${idx + 1}`, value: String(item) };
      });
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.entries(parsed).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }));
    }
    return [];
  } catch {
    return [];
  }
}

function parseFeatures(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return parsed.map(String);
    if (typeof parsed === 'object' && parsed !== null) return Object.values(parsed).map(String);
    return [String(parsed)];
  } catch {
    return [];
  }
}

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
  const [orderSearch, setOrderSearch] = useState('');
  const debouncedOrderSearch = useDebounce(orderSearch, 300);
  const [customerSearch, setCustomerSearch] = useState('');
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);

  // Product detail view modal (Read-only)
  const [viewingProduct, setViewingProduct] = useState(null);
  const [productQrModalUrl, setProductQrModalUrl] = useState('');

  useEffect(() => {
    if (viewingProduct?.link?.linkCode) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://reviewexpress.in';
      const linkUrl = `${baseUrl}/buy/${viewingProduct.link.linkCode}`;
      QRCode.toDataURL(linkUrl, { width: 300, margin: 1.5, color: { dark: '#090d16', light: '#ffffff' } })
        .then(setProductQrModalUrl)
        .catch(() => setProductQrModalUrl(''));
    } else {
      setProductQrModalUrl('');
    }
  }, [viewingProduct]);

  const referralCode = stats?.partner?.referralCode || user?.referralCode || 'PARTNER';

  // Payout request modal states
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutMsg, setPayoutMsg] = useState('');
  const [payoutError, setPayoutError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Alerts
  const [notice, setNotice] = useState({ text: '', isError: false });
  const triggerNotice = (text, isError = false) => {
    setNotice({ text, isError });
    setTimeout(() => setNotice({ text: '', isError: false }), 4500);
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        refetch ? refetch() : Promise.resolve(),
        refetchLinks ? refetchLinks() : Promise.resolve()
      ]);
      triggerNotice('Dashboard data refreshed successfully!', false);
    } catch (err) {
      triggerNotice('Failed to refresh data. Please try again.', true);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Robust universal copy to clipboard with fallback
  const handleCopyLink = async (url, code) => {
    if (!url) return;
    let copied = false;

    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        copied = true;
      } catch (err) {
        console.warn('Clipboard writeText failed, trying textarea fallback', err);
      }
    }

    if (!copied && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        copied = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
    }

    setCopiedLinkCode(code);
    triggerNotice('Product link copied to clipboard!');
    setTimeout(() => setCopiedLinkCode(''), 2500);
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
  const referredCustomers = stats?.referredCustomers || [];

  const filteredOrders = useMemo(() => {
    if (!debouncedOrderSearch.trim()) return recentOrders;
    const q = debouncedOrderSearch.toLowerCase();
    return recentOrders.filter(o =>
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customerName?.toLowerCase().includes(q) ||
      o.businessName?.toLowerCase().includes(q)
    );
  }, [recentOrders, debouncedOrderSearch]);

  const filteredCustomers = useMemo(() => {
    if (!debouncedCustomerSearch.trim()) return referredCustomers;
    const q = debouncedCustomerSearch.toLowerCase();
    return referredCustomers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  }, [referredCustomers, debouncedCustomerSearch]);

  const navItems = [
    { id: 'overview', label: 'Overview & Earnings', icon: LayoutDashboard },
    { id: 'products', label: 'My Product Links', icon: Link2 },
    { id: 'orders', label: 'Referred Orders', icon: Package, badge: recentOrders.length },
    { id: 'customers', label: 'Referred Customers', icon: Users, badge: referredCustomers.length },
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
                {activeTab === 'products' && 'Product Catalog & Referral Links'}
                {activeTab === 'orders' && 'Referred Customer Orders'}
                {activeTab === 'customers' && 'Referred Customer Accounts'}
                {activeTab === 'payouts' && 'Commission Balances & Withdrawals'}
                {activeTab === 'profile' && 'Organization Profile & Bank Information'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-60 flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
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

              {/* Product Catalog Direct Links Banner */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 border border-purple-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
                    <Zap className="w-3.5 h-3.5 text-purple-600" /> Per-Product Referral System
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Generate Exclusive Purchase Links for Specific Products
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Browse our full hardware catalog, view complete technical specifications and images, and generate unique tracking links to share with clients. You earn <strong>{stats?.partner?.commissionPercent || 15}%</strong> on every purchase.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/25 shrink-0 transition-all hover:scale-[1.02]"
                >
                  <Package className="w-4 h-4" />
                  <span>View Product Catalog ({linksData?.items?.length || 0})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
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

          {/* ================= TAB: MY PRODUCT LINKS (READ-ONLY CATALOG) ================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Header Info Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Official Hardware Catalog & Per-Product Links</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      View complete specifications and generate unique tracking links. Customers who land on your link see <strong>only that specific product</strong>.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Your Commission</span>
                  <span className="text-sm font-black text-purple-700">{stats?.partner?.commissionPercent || 15}% per sale</span>
                </div>
              </div>

              {linksLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(linksData?.items || []).map(({ product, link }) => {
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://reviewexpress.in';
                    const linkUrl = link ? `${baseUrl}/buy/${link.linkCode}` : null;
                    const commissionAmount = (((product.price || 0) * (stats?.partner?.commissionPercent || 15)) / 100).toFixed(0);

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-200 transition-all overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          {/* Image & Badge */}
                          <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden group">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-400">
                                <Package className="w-12 h-12" />
                              </div>
                            )}

                            {product.badge && (
                              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                                {product.badge}
                              </span>
                            )}

                            {link && (
                              <span
                                className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                                  link.isActive ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                }`}
                              >
                                {link.isActive ? 'Link Active' : 'Paused'}
                              </span>
                            )}
                          </div>

                          {/* Body Content */}
                          <div className="p-5 space-y-3.5">
                            {/* Title & Subtitle */}
                            <div>
                              <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">{product.title}</h4>
                              {product.subtitle && (
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{product.subtitle}</p>
                              )}
                            </div>

                            {/* Price & Partner Earnings */}
                            <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xl font-black text-slate-900">₹{product.price?.toLocaleString('en-IN')}</span>
                                  {product.originalPrice > product.price && (
                                    <span className="text-xs text-slate-400 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400">MRP Tax Inclusive</span>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-purple-600 block">Your Commission</span>
                                <span className="text-sm font-black text-purple-700">₹{commissionAmount}</span>
                              </div>
                            </div>

                            {/* Short Description */}
                            {product.description && (
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                            )}

                            {/* View Full Product Details Button */}
                            <button
                              onClick={() => setViewingProduct({ product, link })}
                              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Specs & Full Description</span>
                            </button>
                          </div>
                        </div>

                        {/* Link & Action Footer */}
                        <div className="p-5 pt-0 space-y-3">
                          {link ? (
                            <div className="space-y-2.5 pt-3 border-t border-slate-100">
                              {/* Link URL Display with Click-to-Copy */}
                              <div
                                onClick={() => handleCopyLink(linkUrl, link.linkCode)}
                                className="flex items-center gap-2 bg-purple-50/60 hover:bg-purple-100/60 rounded-xl px-3 py-2 border border-purple-200/80 cursor-pointer transition-colors group"
                                title="Click to copy link"
                              >
                                <Globe className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                <span className="text-[11px] text-purple-950 truncate flex-1 font-mono font-medium select-all">
                                  {linkUrl}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyLink(linkUrl, link.linkCode);
                                  }}
                                  className="shrink-0 px-2 py-1 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white transition-all text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                                  title="Copy URL"
                                >
                                  {copiedLinkCode === link.linkCode ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-500" />
                                      <span className="text-emerald-600">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Stats and Code */}
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span className="flex items-center gap-1 font-semibold text-slate-700">
                                  <TrendingUp className="w-3 h-3 text-purple-500" />
                                  {link.clickCount || 0} visits
                                </span>
                                <span className="font-mono text-slate-400 text-[10px]">{link.linkCode}</span>
                              </div>

                              {/* WhatsApp & Toggle Action Buttons */}
                              <div className="flex gap-2">
                                <a
                                  href={`https://wa.me/?text=${encodeURIComponent(
                                    `Check out this smart hardware: ${product.title} - ${linkUrl}`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white transition-colors shadow-2xs"
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
                                  className={`px-3 flex items-center justify-center gap-1 text-xs font-semibold py-2 rounded-xl border transition-colors ${
                                    link.isActive
                                      ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                  }`}
                                  title={link.isActive ? 'Pause Link' : 'Activate Link'}
                                >
                                  {link.isActive ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                                  <span>{link.isActive ? 'Active' : 'Paused'}</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              disabled={generatingLinkId === product.id}
                              onClick={async () => {
                                setGeneratingLinkId(product.id);
                                try {
                                  await generateProductLink({ productId: product.id }).unwrap();
                                  refetchLinks();
                                  triggerNotice('Product referral link generated successfully!');
                                } catch (err) {
                                  triggerNotice(err?.data?.error || 'Failed to generate link', true);
                                } finally {
                                  setGeneratingLinkId(null);
                                }
                              }}
                              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-60"
                            >
                              {generatingLinkId === product.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Link2 className="w-4 h-4" />
                              )}
                              <span>{generatingLinkId === product.id ? 'Generating...' : 'Generate My Referral Link'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(linksData?.items || []).length === 0 && (
                    <div className="col-span-3 text-center py-20 text-slate-400 text-sm">
                      No products available in catalog. Superadmin has not added any hardware SKUs yet.
                    </div>
                  )}
                </div>
              )}
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

          {/* ================= TAB 3.5: REFERRED CUSTOMERS ================= */}
          {activeTab === 'customers' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Referred Customer Directory ({referredCustomers.length})</h3>
                  <p className="text-xs text-slate-400">Clients who placed orders using your partner storefront links or referral code</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search by client name, email..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                  />
                  {customerSearch && (
                    <button
                      onClick={() => setCustomerSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Joined On</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4">Total Spent</th>
                      <th className="py-3 px-4">Commission Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          {debouncedCustomerSearch ? 'No clients matched your search query.' : 'No referred customers yet. Share your product links to start acquiring clients!'}
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map(cust => (
                        <tr key={cust.id} className="hover:bg-purple-50/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                                {cust.name?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                              <span className="font-bold text-slate-900">{cust.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-slate-800">{cust.email}</p>
                            <p className="text-[11px] text-slate-400">{cust.phone || '—'}</p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(cust.joinedAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 whitespace-nowrap">
                            ₹{cust.totalSpent}
                          </td>
                          <td className="py-3.5 px-4 font-black text-emerald-700 whitespace-nowrap">
                            ₹{cust.commissionGenerated}
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

      {/* ================= READ-ONLY PRODUCT DETAILS MODAL ================= */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Product Hardware Specification</h3>
                  <p className="text-[11px] text-slate-500">Read-only partner reference</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                  Read Only
                </span>
                <button
                  onClick={() => setViewingProduct(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {/* Product Top Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left: Image */}
                <div className="md:col-span-5 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square flex items-center justify-center">
                  {viewingProduct.product.image ? (
                    <img
                      src={viewingProduct.product.image}
                      alt={viewingProduct.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-slate-300" />
                  )}
                </div>

                {/* Right: Info, Price & Commission */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    {viewingProduct.product.badge && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider mb-2">
                        {viewingProduct.product.badge}
                      </span>
                    )}
                    <h2 className="text-xl font-black text-slate-900 leading-tight">
                      {viewingProduct.product.title}
                    </h2>
                    {viewingProduct.product.subtitle && (
                      <p className="text-xs text-slate-500 mt-1">{viewingProduct.product.subtitle}</p>
                    )}
                  </div>

                  {/* Rating & Stock */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{viewingProduct.product.rating || 4.9}</span>
                    </div>
                    <span className="text-slate-400">({viewingProduct.product.reviewsCount || 120} client reviews)</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg font-bold border border-emerald-200">
                      In Stock ({viewingProduct.product.stock || 100})
                    </span>
                  </div>

                  {/* Price Cards */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Price</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg font-black text-slate-900">
                          ₹{viewingProduct.product.price?.toLocaleString('en-IN')}
                        </span>
                        {viewingProduct.product.originalPrice > viewingProduct.product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{viewingProduct.product.originalPrice?.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border-l border-slate-200 pl-3">
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                        Your Commission ({stats?.partner?.commissionPercent || 15}%)
                      </span>
                      <span className="text-lg font-black text-purple-700 mt-0.5 block">
                        ₹{(((viewingProduct.product.price || 0) * (stats?.partner?.commissionPercent || 15)) / 100).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {viewingProduct.product.description && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Description</span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {viewingProduct.product.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Features */}
              {(() => {
                const features = parseFeatures(viewingProduct.product.features);
                if (!features || features.length === 0) return null;
                return (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-900 block">Product Features</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Technical Specifications */}
              {(() => {
                const specs = parseSpecs(viewingProduct.product.specs);
                if (!specs || specs.length === 0) return null;
                return (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-900 block">Technical Specifications</span>
                    <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                      {specs.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 text-xs bg-white hover:bg-slate-50">
                          <span className="text-slate-500 font-medium">{s.key}</span>
                          <span className="text-slate-900 font-bold">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Referral Link & QR inside Modal */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-purple-600" />
                  Your Exclusive Referral Link for this SKU
                </span>

                {viewingProduct.link ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {productQrModalUrl && (
                      <div className="p-2 bg-white rounded-xl border border-purple-200 shrink-0">
                        <img src={productQrModalUrl} alt="Product Link QR" className="w-24 h-24 rounded-lg" />
                      </div>
                    )}
                    <div className="flex-1 w-full space-y-2">
                      <div
                        onClick={() => {
                          const url = typeof window !== 'undefined' ? `${window.location.origin}/buy/${viewingProduct.link.linkCode}` : '';
                          handleCopyLink(url, viewingProduct.link.linkCode);
                        }}
                        className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-purple-200 cursor-pointer hover:border-purple-300 transition-colors"
                        title="Click to copy link"
                      >
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-800 font-mono font-medium truncate flex-1 select-all">
                          {typeof window !== 'undefined' ? `${window.location.origin}/buy/${viewingProduct.link.linkCode}` : `/buy/${viewingProduct.link.linkCode}`}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const url = typeof window !== 'undefined' ? `${window.location.origin}/buy/${viewingProduct.link.linkCode}` : '';
                            handleCopyLink(url, viewingProduct.link.linkCode);
                          }}
                          className="shrink-0 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          {copiedLinkCode === viewingProduct.link.linkCode ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `Check out this smart hardware: ${viewingProduct.product.title} - ${typeof window !== 'undefined' ? `${window.location.origin}/buy/${viewingProduct.link.linkCode}` : ''}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share on WhatsApp</span>
                        </a>

                        {productQrModalUrl && (
                          <a
                            href={productQrModalUrl}
                            download={`QR-${viewingProduct.link.linkCode}.png`}
                            className="py-2 px-3 rounded-xl bg-white border border-purple-200 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download QR</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-purple-200">
                    <p className="text-xs text-slate-600">You haven't generated a link for this product yet.</p>
                    <button
                      disabled={generatingLinkId === viewingProduct.product.id}
                      onClick={async () => {
                        setGeneratingLinkId(viewingProduct.product.id);
                        try {
                          const res = await generateProductLink({ productId: viewingProduct.product.id }).unwrap();
                          refetchLinks();
                          setViewingProduct(prev => ({ ...prev, link: res.link }));
                          triggerNotice('Referral link generated successfully!');
                        } catch (err) {
                          triggerNotice(err?.data?.error || 'Failed to generate link', true);
                        } finally {
                          setGeneratingLinkId(null);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      {generatingLinkId === viewingProduct.product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                      <span>Generate Link</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-400">ReviewXpress Verified Hardware SKU</span>
              <button
                onClick={() => setViewingProduct(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
