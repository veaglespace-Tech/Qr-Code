'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useGetOrdersQuery } from '@/redux/api/apiSlice';
import { logoutUser } from '@/redux/slice/authSlice';
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
  Download
} from 'lucide-react';
import ReviewXpressLogo from '@/components/ReviewXpressLogo';
import TaxInvoiceModal from '@/components/TaxInvoiceModal';

export default function UserOrdersDashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { data: settings } = useSelector(state => state.settings);
  const { data: ordersData, isLoading: loading, refetch } = useGetOrdersQuery();

  const orders = useMemo(() => ordersData?.orders || [], [ordersData]);

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'customizations' | 'invoices' | 'profile'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedLink, setCopiedLink] = useState('');
  const [qrCodeUrls, setQrCodeUrls] = useState({});

  // Generate QR code data URLs for ordered stands
  useEffect(() => {
    orders.forEach(order => {
      const link = order.googleReviewLink;
      if (link && !qrCodeUrls[order.id]) {
        QRCode.toDataURL(link, {
          width: 320,
          margin: 1.5,
          color: {
            dark: '#0f172a',
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

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/login');
  };

  const copyToClipboard = (text, key) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(key);
      setTimeout(() => setCopiedLink(''), 2500);
    }
  };

  // KPI Calculations
  const totalOrders = orders.length;
  const inProgressOrders = orders.filter(o => o.orderStatus === 'customizing' || o.orderStatus === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);

  // Filtered orders for tab 1
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.city?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'IN_PROGRESS' && (order.orderStatus === 'customizing' || order.orderStatus === 'pending')) ||
        (statusFilter === 'SHIPPED' && order.orderStatus === 'shipped') ||
        (statusFilter === 'DELIVERED' && order.orderStatus === 'delivered');

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

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
    { id: 'customizations', label: 'Laser Stands & QR', icon: QrCode },
    { id: 'invoices', label: 'GST Tax Invoices', icon: FileText, badge: totalOrders > 0 ? totalOrders : null },
    { id: 'profile', label: 'Profile & Addresses', icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#090d16] text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ReviewXpressLogo size="default" />
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
            Customer
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SaaS Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-72 bg-[#090d16] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand & Portal Header */}
          <div className="p-5 border-b border-slate-800/80">
            <Link href="/" className="inline-block group mb-3">
              <ReviewXpressLogo size="default" />
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Customer Portal
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified Client
              </span>
            </div>
          </div>

          {/* Customer Profile Card */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-500/20 flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || 'Customer'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'customer@reviewxpress.in'}
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1.5 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-2 pt-1">
              Customer Hub
            </div>
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 font-extrabold translate-x-1'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions & Links */}
          <div className="p-3 border-t border-slate-800/80 space-y-1.5">
            <Link
              href="/shop"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Order More Hardware</span>
            </Link>

            <Link
              href="/"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>Back to Storefront</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main SaaS Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {activeTab === 'orders' && 'My Orders & Live Courier Tracking'}
              {activeTab === 'customizations' && 'Laser Engraved Stands & QR Previews'}
              {activeTab === 'invoices' && 'Official GST Tax Invoices'}
              {activeTab === 'profile' && 'Customer Account & Saved Addresses'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'orders' && 'Monitor NFC hardware encoding, packaging, and real-time courier shipping progress'}
              {activeTab === 'customizations' && 'View your custom engraved business nameplates, encoded links, and downloadable QR assets'}
              {activeTab === 'invoices' && 'Download certified 18% GST tax invoices with HSN/SAC codes for accounting write-offs'}
              {activeTab === 'profile' && 'Manage your verified customer profile and delivery address book'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/shop"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buy More Stands</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <div className="p-6 space-y-6 max-w-7xl">
          {/* TAB 1: MY ORDERS & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* KPI Metrics Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">Total Orders</span>
                    <Package className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{totalOrders}</div>
                  <p className="text-[11px] text-slate-500">All hardware orders placed</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">In Production / Transit</span>
                    <Truck className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-amber-600">{inProgressOrders}</div>
                  <p className="text-[11px] text-slate-500">NFC chip encoding &amp; courier</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">Delivered &amp; Active</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600">{deliveredOrders}</div>
                  <p className="text-[11px] text-slate-500">Collecting live reviews</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold">Total Investment</span>
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">₹{totalSpent.toLocaleString('en-IN')}</div>
                  <p className="text-[11px] text-slate-500">Includes 18% GST &amp; courier</p>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by Order #, Business Name, City or AWB Tracking..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
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
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              {loading ? (
                <div className="py-20 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
                  <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-500 text-xs font-medium">Fetching your orders from database...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-slate-200 shadow-sm">
                  <Package className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">No Orders Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery
                      ? 'No orders match your search query. Try clearing the search filter.'
                      : "You haven't placed any ReviewXpress orders yet. Explore our custom NFC stands to start collecting reviews!"}
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20"
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
                      className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6 shadow-sm hover:border-brand-500/30 transition-all"
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
                              Payment: {order.paymentStatus}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                order.orderStatus === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                  : order.orderStatus === 'shipped'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-300'
                                  : 'bg-amber-50 text-amber-700 border border-amber-300'
                              }`}
                            >
                              Status: {order.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 border border-slate-200 transition-colors shadow-sm"
                          >
                            <Printer className="w-3.5 h-3.5 text-brand-600" />
                            <span>Download GST Invoice</span>
                          </button>
                        </div>
                      </div>

                      {/* Purchased Hardware & Laser Engraving Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Products */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-brand-600" />
                            Hardware Items ({order.items?.length || 1}):
                          </h4>
                          <div className="space-y-2">
                            {order.items &&
                              order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                                >
                                  <div className="space-y-0.5">
                                    <p className="font-bold text-slate-900 text-xs">{item.title}</p>
                                    <p className="text-[11px] text-slate-500">
                                      Qty: {item.quantity} × ₹{item.price}
                                    </p>
                                  </div>
                                  <span className="font-bold text-xs text-slate-900">
                                    ₹{item.total || item.price * item.quantity}
                                  </span>
                                </div>
                              ))}
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-slate-100">
                            <span>Total Paid (Incl. 18% GST &amp; Shipping):</span>
                            <span className="text-base font-black text-brand-600">
                              ₹{order.finalAmount}
                            </span>
                          </div>
                        </div>

                        {/* Laser Engraving & Destination */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            NFC Programming &amp; Engraving Details:
                          </h4>
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Business Laser Print:</span>
                              <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {order.businessName || order.customerName}
                              </span>
                            </div>

                            {order.googleReviewLink && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 whitespace-nowrap">Review Link:</span>
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <a
                                    href={order.googleReviewLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-brand-600 hover:underline flex items-center gap-1 font-mono text-[11px] truncate max-w-[200px]"
                                  >
                                    <span className="truncate">{order.googleReviewLink}</span>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  </a>
                                  <button
                                    onClick={() => copyToClipboard(order.googleReviewLink, `order-${order.id}`)}
                                    className="p-1 rounded hover:bg-slate-200 text-slate-500"
                                    title="Copy review URL"
                                  >
                                    {copiedLink === `order-${order.id}` ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-start pt-1 border-t border-slate-200/60">
                              <span className="text-slate-500">Delivery Address:</span>
                              <span className="text-right text-slate-700 max-w-[240px] font-medium leading-tight">
                                {order.addressLine}, {order.city}, {order.state} - {order.pincode}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Live Courier Tracking Timeline */}
                      <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-emerald-600" /> Real-time Courier Tracking Progression
                          </h4>

                          {order.trackingId ? (
                            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                              <span>Courier: <strong className="text-slate-900">{order.courierName || 'Delhivery Express'}</strong></span>
                              <span>•</span>
                              <span>AWB Tracking: <strong className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{order.trackingId}</strong></span>
                              {order.trackingUrl && (
                                <a
                                  href={order.trackingUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-brand-600 hover:underline inline-flex items-center gap-1 font-bold pl-1"
                                >
                                  <span>Track Live</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">
                              Courier AWB assigned upon dispatch from fulfillment center
                            </span>
                          )}
                        </div>

                        {/* 4-Step Progression Stepper */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          {[
                            {
                              step: 1,
                              label: 'Order Confirmed',
                              desc: 'Payment received & verified'
                            },
                            {
                              step: 2,
                              label: 'Laser Print & NFC Coding',
                              desc: 'NTAG chip programmed with URL'
                            },
                            {
                              step: 3,
                              label: 'Shipped via Courier',
                              desc: order.courierName || 'Delhivery / Blue Dart Express'
                            },
                            {
                              step: 4,
                              label: 'Delivered & Active',
                              desc: 'Live on your retail counter'
                            }
                          ].map((step, sIdx) => {
                            const isDone =
                              sIdx === 0 ||
                              (sIdx === 1 && (order.orderStatus === 'customizing' || order.orderStatus === 'shipped' || order.orderStatus === 'delivered')) ||
                              (sIdx === 2 && (order.orderStatus === 'shipped' || order.orderStatus === 'delivered')) ||
                              (sIdx === 3 && order.orderStatus === 'delivered');

                            const isCurrent =
                              (sIdx === 0 && order.orderStatus === 'pending') ||
                              (sIdx === 1 && order.orderStatus === 'customizing') ||
                              (sIdx === 2 && order.orderStatus === 'shipped') ||
                              (sIdx === 3 && order.orderStatus === 'delivered');

                            return (
                              <div
                                key={sIdx}
                                className={`p-3.5 rounded-xl border text-xs space-y-1 transition-all ${
                                  isDone
                                    ? isCurrent
                                      ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 text-slate-900 shadow-sm'
                                      : 'bg-emerald-50 border-emerald-300 text-slate-900'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  )}
                                  <span className="font-bold">{step.label}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 pl-6">{step.desc}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STAND LASER ENGRAVINGS & QR PREVIEWS */}
          {activeTab === 'customizations' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-brand-600" />
                  <span>Custom Stand Hardware &amp; QR Asset Preview</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every ReviewXpress stand is precision laser-cut and permanently programmed with your verified Google Business Profile URL. Below you can preview your stand layout and download high-resolution QR codes for counter cards, table-tents, or flyers.
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-slate-200 shadow-sm">
                  <QrCode className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">No Stands Programmed Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Place an order with your business name and Google Review link to see your interactive 3D stand engraving preview here.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Order Customized Stand</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {orders.map(order => {
                    const qrUrl = qrCodeUrls[order.id];
                    const businessName = order.businessName || order.customerName || 'Your Business Name';

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between"
                      >
                        {/* Stand Mockup Card */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="font-mono text-xs font-bold text-slate-500">
                                {order.orderNumber}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900">
                                {order.items?.[0]?.title || 'Smart NFC Review Stand'}
                              </h4>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              NTAG213 Active
                            </span>
                          </div>

                          {/* Visual Acrylic Mockup Preview */}
                          <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-white text-center border border-slate-800 shadow-xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                            <div className="relative z-10 space-y-4">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-white/10">
                                <Sparkles className="w-3 h-3" />
                                <span>Laser Engraved Nameplate</span>
                              </div>

                              <div className="py-2">
                                <p className="text-lg font-black tracking-tight text-white drop-shadow-sm uppercase">
                                  {businessName}
                                </p>
                                <p className="text-[11px] text-slate-400 font-medium mt-1">
                                  Tap NFC Phone or Scan QR to Leave a 5★ Review
                                </p>
                              </div>

                              {/* QR Code Container */}
                              <div className="w-36 h-36 bg-white p-3 rounded-2xl mx-auto shadow-2xl flex items-center justify-center">
                                {qrUrl ? (
                                  <img
                                    src={qrUrl}
                                    alt={`QR for ${businessName}`}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                                )}
                              </div>

                              <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono">
                                <span className="flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Direct Google Link
                                </span>
                                <span>•</span>
                                <span>Tap &amp; Review</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stand Controls & Download */}
                        <div className="space-y-3 pt-2">
                          {order.googleReviewLink && (
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                              <span className="text-slate-500 text-[11px] font-bold">Target Review URL:</span>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[11px] text-brand-700 truncate">
                                  {order.googleReviewLink}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(order.googleReviewLink, `stand-${order.id}`)}
                                  className="p-1 rounded hover:bg-slate-200 text-slate-600"
                                  title="Copy URL"
                                >
                                  {copiedLink === `stand-${order.id}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            {qrUrl && (
                              <a
                                href={qrUrl}
                                download={`ReviewXpress-QR-${businessName.replace(/\s+/g, '-')}.png`}
                                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
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
                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <span>Test Link</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GST TAX INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-600" />
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
                <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-slate-200 shadow-sm">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">No Invoices Available</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Once you make a purchase, tax invoices will appear here ready for one-click PDF download.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold border border-brand-200 transition-colors shadow-sm"
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

          {/* TAB 4: CUSTOMER PROFILE & ADDRESS BOOK */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Account Details Card */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-brand-500/20">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{user?.name || 'Customer'}</h3>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Active Verified Client
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Registered Email</span>
                      <span className="font-bold text-slate-900">{user?.email || 'N/A'}</span>
                    </div>
                    {user?.phone && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                        <span className="font-bold text-slate-900">{user.phone}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 block text-[11px]">Security Role</span>
                      <span className="font-bold text-slate-900">{user?.role || 'CUSTOMER'}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-2 border border-red-200 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out of Dashboard</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Address Book */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>Saved Delivery Addresses</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Addresses utilized for dispatching physical NFC hardware packages.
                  </p>

                  {uniqueAddresses.length === 0 ? (
                    <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      No shipping address recorded yet. Addresses are saved automatically when placing an order.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {uniqueAddresses.map((addr, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{addr.name || 'Recipient'}</span>
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

                  {/* Customer Support Notice */}
                  <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-200/80 text-xs text-brand-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                    <div className="space-y-0.5">
                      <p className="font-bold flex items-center gap-1.5 text-brand-900">
                        <ShieldCheck className="w-4 h-4 text-brand-600" />
                        Need to update your Google Review Link or Shipping Details?
                      </p>
                      <p className="text-[11px] text-brand-800/80">
                        Our fulfillment team is ready on WhatsApp to assist with hardware reconfiguration.
                      </p>
                    </div>
                    <Link
                      href="/contact"
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs whitespace-nowrap shadow-sm text-center"
                    >
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

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