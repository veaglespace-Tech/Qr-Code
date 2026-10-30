'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useGetOrdersQuery, useUpdateProfileMutation } from '@/redux/api/apiSlice';
import { logoutUser } from '@/redux/slice/authSlice';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ExternalLink,
  QrCode,
  ShoppingBag,
  Store,
  LogOut,
  Menu,
  X,
  Search,
  RefreshCw,
  Copy,
  Check,
  Building,
  User,
  MapPin,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  FileText,
  Phone,
  Mail,
  Download,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  AlertCircle,
  IndianRupee,
  Shield
} from 'lucide-react';
import ReviewXpressLogo from '@/components/ReviewXpressLogo';
import TaxInvoiceModal from '@/components/TaxInvoiceModal';

export default function UserDashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { data: settings } = useSelector(state => state.settings);
  const { data: ordersData, isLoading: loading, refetch } = useGetOrdersQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  const orders = useMemo(() => ordersData?.orders || [], [ordersData]);

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'hardware' | 'invoices' | 'profile'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedLink, setCopiedLink] = useState('');
  const [qrCodeUrls, setQrCodeUrls] = useState({});

  // Alerts
  const [notice, setNotice] = useState({ text: '', isError: false });
  const triggerNotice = (text, isError = false) => {
    setNotice({ text, isError });
    setTimeout(() => setNotice({ text: '', isError: false }), 4500);
  };

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false
  });

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Generate QR code data URLs for ordered stands
  useEffect(() => {
    orders.forEach(order => {
      const link = order.googleReviewLink;
      if (link && !qrCodeUrls[order.id]) {
        QRCode.toDataURL(link, {
          width: 320,
          margin: 1.5,
          color: {
            dark: '#090d16',
            light: '#ffffff'
          }
        })
          .then(url => {
            setQrCodeUrls(prev => ({ ...prev, [order.id]: url }));
          })
          .catch(err => {
            console.error('Failed to generate stand QR:', err);
          });
      }
    });
  }, [orders, qrCodeUrls]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
    } catch {}
    window.location.href = '/login';
  };

  const copyToClipboard = async (text, key) => {
    if (!text) return;
    let copied = false;

    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (err) {
        console.warn('Clipboard writeText failed, using fallback', err);
      }
    }

    if (!copied && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
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

    setCopiedLink(key);
    setTimeout(() => setCopiedLink(''), 2500);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      triggerNotice('New password and confirm password do not match', true);
      return;
    }
    if (profileForm.newPassword && profileForm.newPassword.length < 6) {
      triggerNotice('New password must be at least 6 characters long', true);
      return;
    }

    try {
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone
      };
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }
      const res = await updateProfile(payload).unwrap();
      if (res.success) {
        triggerNotice(res.message || 'Profile updated successfully!', false);
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

  // KPI Calculations
  const totalOrders = orders.length;
  const inProgressOrders = orders.filter(o => o.orderStatus === 'customizing' || o.orderStatus === 'shipped' || o.orderStatus === 'pending').length;
  const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);

  // Filtered orders for tab 1
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const q = debouncedSearchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        order.orderNumber?.toLowerCase().includes(q) ||
        order.businessName?.toLowerCase().includes(q) ||
        order.trackingId?.toLowerCase().includes(q) ||
        order.city?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'IN_PROGRESS' && (order.orderStatus === 'customizing' || order.orderStatus === 'pending')) ||
        (statusFilter === 'SHIPPED' && order.orderStatus === 'shipped') ||
        (statusFilter === 'DELIVERED' && order.orderStatus === 'delivered');

      return matchesSearch && matchesStatus;
    });
  }, [orders, debouncedSearchQuery, statusFilter]);

  // Unique delivery addresses extracted from orders
  const uniqueAddresses = useMemo(() => {
    const list = [];
    const seen = new Set();
    orders.forEach(o => {
      if (o.addressLine) {
        const key = `${o.addressLine}-${o.city}-${o.pincode}`.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            name: o.customerName,
            phone: o.customerPhone,
            address: o.addressLine,
            city: o.city,
            state: o.state,
            pincode: o.pincode,
            orderRef: o.orderNumber
          });
        }
      }
    });
    return list;
  }, [orders]);

  const navItems = [
    { id: 'orders', label: 'My Orders & Tracking', icon: Package, badge: totalOrders > 0 ? totalOrders : null },
    { id: 'hardware', label: 'Smart Stands & QR Codes', icon: QrCode },
    { id: 'invoices', label: 'GST Tax Invoices', icon: FileText, badge: totalOrders > 0 ? totalOrders : null },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-300 text-sm font-medium">Loading ReviewXpress Customer Console...</p>
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
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base tracking-tight">ReviewXpress</span>
                <span className="text-[9px] uppercase font-extrabold tracking-widest bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                  Client
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Customer Portal</p>
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
              Customer Hub
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

          {/* Quick Hardware Store Order Box */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Smart Review Hardware
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Equip more counters, checkout registers, or tables with 1-tap Google NFC review stands.
            </p>
            <Link
              href="/shop"
              className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order More Stands</span>
            </Link>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-800/80 space-y-2 bg-[#060910]">
          <Link
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Back to Storefront</span>
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
                {user?.name?.[0]?.toUpperCase() || 'C'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                  {user?.name || 'Customer'}
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
                {activeTab === 'orders' && 'My Orders & Real-time Courier Tracking'}
                {activeTab === 'hardware' && 'Smart Review Stands & Laser QR Codes'}
                {activeTab === 'invoices' && 'Official 18% GST Tax Invoices'}
                {activeTab === 'profile' && 'Customer Profile & Security Settings'}
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

            <Link
              href="/shop"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buy More Stands</span>
            </Link>
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
          {/* ================= TAB 1: ORDERS & TRACKING ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{totalOrders}</div>
                  <p className="text-[11px] text-slate-500">All hardware packages ordered</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">In Production / Transit</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-indigo-600">{inProgressOrders}</div>
                  <p className="text-[11px] text-slate-500">NFC encoding &amp; courier delivery</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Delivered &amp; Active</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-600">{deliveredOrders}</div>
                  <p className="text-[11px] text-slate-500">Collecting live 5-star reviews</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Investment</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">₹{totalSpent.toLocaleString('en-IN')}</div>
                  <p className="text-[11px] text-slate-500">Includes 18% GST tax &amp; courier</p>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by Order #, Business Name, City or Tracking AWB..."
                    className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: 'ALL', label: 'All Orders' },
                    { id: 'IN_PROGRESS', label: 'In Production / Transit' },
                    { id: 'SHIPPED', label: 'Shipped' },
                    { id: 'DELIVERED', label: 'Delivered' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === tab.id
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-slate-200 shadow-xs">
                  <Package className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">No Orders Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery
                      ? 'No orders match your search query. Try clearing the search filter.'
                      : "You haven't placed any ReviewXpress orders yet. Explore our custom NFC stands to start collecting reviews!"}
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/30"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Browse Hardware Catalog</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredOrders.map(order => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6 shadow-xs hover:border-purple-300 transition-all"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono font-bold text-slate-900 text-base">
                              {order.orderNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                order.paymentStatus === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {order.paymentStatus === 'paid' ? 'Paid via PayU' : 'Payment Pending'}
                            </span>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                              {order.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5 text-purple-600" />
                            <span>GST Invoice</span>
                          </button>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                            <span className="text-base font-black text-slate-900">
                              ₹{order.finalAmount}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items & Shipping Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Custom Hardware Details
                          </h4>
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-bold text-slate-900 text-xs">
                                  Laser Engraved Business: <span className="text-purple-700">{order.businessName || 'ReviewXpress Stand'}</span>
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Review URL: <span className="font-mono text-slate-600">{order.googleReviewLink || 'Programmed on delivery'}</span>
                                </p>
                              </div>
                              {order.googleReviewLink && (
                                <button
                                  onClick={() => copyToClipboard(order.googleReviewLink, order.id)}
                                  className="text-[11px] text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 ml-2"
                                >
                                  {copiedLink === order.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedLink === order.id ? 'Copied' : 'Copy Link'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-5 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Shipping Destination &amp; Tracking
                          </h4>
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                            <p className="text-slate-800 font-semibold">{order.customerName}</p>
                            <p className="text-slate-500 text-[11px] leading-relaxed">
                              {order.addressLine}, {order.city}, {order.state} - {order.pincode}
                            </p>
                            {order.trackingId && (
                              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                                <div>
                                  <span className="text-[10px] text-slate-400 block">{order.courierName || 'Courier'}:</span>
                                  <span className="font-mono font-bold text-slate-800">{order.trackingId}</span>
                                </div>
                                {order.trackingUrl && (
                                  <a
                                    href={order.trackingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold flex items-center gap-1 border border-purple-200"
                                  >
                                    <span>Track</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: SMART STANDS & QR CODES ================= */}
          {activeTab === 'hardware' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-purple-600" />
                    <span>Your Laser-Engraved Smart Stands &amp; High-Res QR Assets</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Dual NFC + QR Hardware
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Download digital QR code assets for your ordered ReviewXpress stands. You can print them on menus, counter posters, bills, or marketing flyers.
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-slate-200 shadow-xs">
                  <QrCode className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">No Custom Stands Configured</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Once you order custom acrylic stands with your Google Place link, your digital QR codes will appear here ready for one-click PNG download.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orders.map(order => {
                    const qrUrl = qrCodeUrls[order.id];
                    const businessName = order.businessName || 'Review Stand';

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs text-center flex flex-col justify-between hover:border-purple-300 transition-all"
                      >
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                            Order #{order.orderNumber}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 mt-1">{businessName}</h4>
                          <p className="text-xs text-slate-500">{order.city || 'India'}</p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-block mx-auto">
                          {qrUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={qrUrl} alt={businessName} className="w-44 h-44 mx-auto rounded-xl bg-white p-2 shadow-xs" />
                          ) : (
                            <div className="w-44 h-44 bg-slate-200 rounded-xl mx-auto flex items-center justify-center text-xs text-slate-500">
                              {order.googleReviewLink ? 'Generating QR...' : 'Link Pending'}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {qrUrl && (
                            <a
                              href={qrUrl}
                              download={`ReviewXpress-QR-${businessName.replace(/\s+/g, '-')}.png`}
                              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download QR (PNG)</span>
                            </a>
                          )}
                          {order.googleReviewLink && (
                            <a
                              href={order.googleReviewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <span>Test Google Review Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: GST TAX INVOICES ================= */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span>Official Tax Invoices &amp; Accounting Receipts</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    18% Input Tax Credit Eligible
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  All ReviewXpress orders are issued by Veagle Space Technology Pvt. Ltd. with valid GST registration numbers, HSN code 852352 (NFC Smart Cards / Stands), and complete digital audit trails.
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-slate-200 shadow-xs">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">No Invoices Available</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Once you make a purchase, tax invoices will appear here ready for one-click PDF download.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-6 py-4">Invoice #</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Billed Business</th>
                          <th className="px-6 py-4">Tax Breakdown</th>
                          <th className="px-6 py-4">Total Paid</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Download</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map(order => {
                          const gross = Number(order.finalAmount) || 0;
                          const net = Math.round(gross / 1.18);
                          const gstAmount = gross - net;

                          return (
                            <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-6 py-4 font-mono font-bold text-slate-900">
                                INV-{order.orderNumber}
                              </td>
                              <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-800">
                                {order.businessName || order.customerName || 'Customer'}
                              </td>
                              <td className="px-6 py-4 text-slate-500">
                                <div>Net: ₹{net}</div>
                                <div className="text-[10px] text-slate-400">GST (18%): ₹{gstAmount}</div>
                              </td>
                              <td className="px-6 py-4 font-black text-slate-900 text-sm">
                                ₹{gross}
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                                  {order.paymentStatus || 'Paid'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => setSelectedInvoiceOrder(order)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 transition-colors shadow-xs"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>PDF Invoice</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: CUSTOMER PROFILE & SECURITY ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-5xl">
              {/* Profile Header Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-purple-600/20 flex items-center justify-center">
                    <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center text-white font-black text-2xl">
                      {user?.name?.[0]?.toUpperCase() || 'C'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{user?.name || 'Customer'}</h3>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                        Verified Client
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'N/A'}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                      <span>Role: <strong className="text-slate-700">CUSTOMER</strong></span>
                      <span>•</span>
                      <span>Total Orders: <strong className="text-slate-700">{totalOrders}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Account Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Customer Account
                  </span>
                </div>
              </div>

              {/* Profile & Security Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Contact Details */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <User className="w-5 h-5 text-purple-600" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Personal Information</h4>
                        <p className="text-[11px] text-slate-400">Manage your name and phone number for parcel delivery</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="e.g. Amit Sharma"
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
                          Email address is used for order confirmations and tax invoices.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security & Password Management */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Lock className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Security &amp; Password</h4>
                        <p className="text-[11px] text-slate-400">Leave blank if you do not want to change your password</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Current Password
                        </label>
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
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={profileForm.showNewPassword ? 'text' : 'password'}
                            value={profileForm.newPassword}
                            onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                            placeholder="Enter new password (min 6 chars)"
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
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Confirm New Password
                        </label>
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
                </div>

                {/* Saved Delivery Addresses strip */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Saved Delivery Addresses</h4>
                      <p className="text-[11px] text-slate-400">Used for courier shipping across India</p>
                    </div>
                  </div>

                  {uniqueAddresses.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No delivery address recorded yet. Addresses are saved automatically when ordering hardware stands.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {uniqueAddresses.map((addr, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{addr.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">Order #{addr.orderRef}</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            {addr.address}, {addr.city}, {addr.state} - <strong className="text-slate-800">{addr.pincode}</strong>
                          </p>
                          {addr.phone && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{addr.phone}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isUpdatingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isUpdatingProfile ? 'Saving Details...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <TaxInvoiceModal
          order={selectedInvoiceOrder}
          settings={settings}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
