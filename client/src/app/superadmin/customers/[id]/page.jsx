'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation
} from '@/redux/api/apiSlice';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  IndianRupee,
  Package,
  TrendingUp,
  Edit,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  Lock,
  Unlock,
  Users,
  Clock,
  Sparkles,
  MapPin,
  Truck,
  Printer,
  Loader2
} from 'lucide-react';
import TaxInvoiceModal from '@/components/TaxInvoiceModal';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id;
  const { data: settings } = useSelector(state => state.settings);

  const { data: userData, isLoading, refetch } = useGetUserByIdQuery(customerId, {
    skip: !customerId
  });
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const customer = userData?.user || null;

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active'
  });

  // Invoice Modal State
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Feedback alerts
  const [notice, setNotice] = useState({ text: '', isError: false });
  const [copiedKey, setCopiedKey] = useState('');

  const triggerNotice = (text, isError = false) => {
    setNotice({ text, isError });
    setTimeout(() => setNotice({ text: '', isError: false }), 4000);
  };

  useEffect(() => {
    if (customer) {
      setEditForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        status: customer.status || 'active'
      });
    }
  }, [customer]);

  const copyToClipboard = (text, key) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2500);
    }
  };

  // Block / Unblock Customer
  const handleToggleBlock = async () => {
    if (!customer) return;
    const isCurrentlyActive = customer.status === 'active';
    const action = isCurrentlyActive ? 'block' : 'unblock';
    const newStatus = isCurrentlyActive ? 'inactive' : 'active';

    if (!confirm(`Are you sure you want to ${action} customer "${customer.name}"?`)) return;

    try {
      await updateUser({ id: customer.id, status: newStatus }).unwrap();
      triggerNotice(`Customer account successfully ${action === 'block' ? 'blocked' : 'unblocked'}.`);
      refetch();
    } catch (err) {
      triggerNotice(err?.data?.error || 'Failed to update customer status', true);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async () => {
    if (!customer) return;
    const confirmDelete = confirm(
      `⚠️ PERMANENT DELETION:\n\nAre you sure you want to delete customer account "${customer.name}"?\nPast order records will remain safely archived for accounting.`
    );
    if (!confirmDelete) return;

    try {
      await deleteUser(customer.id).unwrap();
      alert('Customer account deleted successfully.');
      router.push('/superadmin/dashboard');
    } catch (err) {
      triggerNotice(err?.data?.error || 'Failed to delete customer', true);
    }
  };

  // Save Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ id: customer.id, ...editForm }).unwrap();
      triggerNotice('Customer profile details updated successfully!');
      setEditModalOpen(false);
      refetch();
    } catch (err) {
      triggerNotice(err?.data?.error || 'Failed to update customer', true);
    }
  };

  // Extract unique shipping addresses from customer orders
  const uniqueAddresses = useMemo(() => {
    if (!customer?.orders) return [];
    const list = [];
    const seen = new Set();
    customer.orders.forEach(o => {
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
  }, [customer]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-300 text-sm font-medium">Loading Customer Account Profile...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Customer Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md">
          The requested customer account does not exist or has been removed.
        </p>
        <Link
          href="/superadmin/dashboard"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers Directory</span>
        </Link>
      </div>
    );
  }

  const isBlocked = customer.status === 'inactive' || customer.status === 'blocked';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-purple-600 selection:text-white pb-20">
      {/* Top Breadcrumb & Actions Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/superadmin/dashboard"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Return to Superadmin Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Customers Directory</span>
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Superadmin</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">Customers</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900 truncate max-w-[200px]">
              {customer.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setEditModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-purple-600/20 transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={handleToggleBlock}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              isBlocked
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
            }`}
          >
            {isBlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Unblock Customer</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Block Customer</span>
              </>
            )}
          </button>

          <button
            onClick={handleDeleteCustomer}
            disabled={isDeleting}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
            title="Delete Customer Account"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Notice Alert */}
      {notice.text && (
        <div
          className={`fixed top-16 right-6 z-50 p-4 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border animate-in slide-in-from-top-2 ${
            notice.isError
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {notice.isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Customer Header Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
              {(customer.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {customer.name}
                </h1>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase border flex items-center gap-1.5 ${
                    isBlocked
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                  <span>{isBlocked ? 'Account Blocked' : 'Active Client'}</span>
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Customer Account
                </span>
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Email: <strong className="text-slate-800">{customer.email}</strong></span>
                {customer.phone && (
                  <>
                    <span>•</span>
                    <span>Phone: <strong className="text-slate-800">{customer.phone}</strong></span>
                  </>
                )}
                <span>•</span>
                <span>Member since {new Date(customer.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
              </p>
            </div>
          </div>

          {/* Referral Origin Badge */}
          <div className="flex items-center gap-2">
            {customer.referredBy ? (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Referred by Partner:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/superadmin/partners/${customer.referredBy.id}`}
                    className="font-black text-amber-900 hover:underline flex items-center gap-1"
                  >
                    <span>{customer.referredBy.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  {customer.referredBy.referralCode && (
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white text-purple-700 border border-purple-200">
                      {customer.referredBy.referralCode}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                <span className="text-slate-400 block text-[11px]">Acquisition Source</span>
                <span className="font-bold text-slate-800">Direct / Organic Customer</span>
              </div>
            )}
          </div>
        </div>

        {/* 4 Financial & Order Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">Total Orders Placed</span>
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{customer.stats?.totalOrders || 0}</div>
            <p className="text-[11px] text-slate-500">
              {customer.stats?.paidOrders || 0} paid &amp; verified
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">Total Lifetime Spend</span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">
              ₹{(customer.stats?.totalSpent || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500">Gross revenue including 18% GST</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">Stands Delivered</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">
              {customer.stats?.deliveredOrders || 0}
            </div>
            <p className="text-[11px] text-slate-500">Delivered &amp; active on counters</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">In-Transit / Customizing</span>
              <Truck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-700">
              {customer.stats?.inProgressOrders || 0}
            </div>
            <p className="text-[11px] text-slate-500">In production or shipped</p>
          </div>
        </div>

        {/* 2-Column Overview: Customer Profile & Referral Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Customer Profile Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Customer Contact Profile</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-500">ID: #{customer.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Full Customer Name</span>
                  <span className="font-bold text-slate-900 text-sm">{customer.name}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Primary Phone</span>
                  <span className="font-bold text-slate-900 text-sm">{customer.phone || 'Not provided'}</span>
                </div>
                <div className="col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Registered Email</span>
                    <span className="font-bold text-slate-900">{customer.email}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(customer.email, 'email')}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                  >
                    {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs space-y-1">
              <p className="font-bold text-blue-900">Security &amp; Account Health:</p>
              <p className="text-[11px] text-blue-800">
                Account is verified and authorized for online card &amp; COD orders.
              </p>
            </div>
          </div>

          {/* Column 2: Affiliate & Acquisition Origin */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Affiliate Acquisition Source</span>
                </h3>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    customer.referredBy
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {customer.referredBy ? 'Referred Client' : 'Direct Customer'}
                </span>
              </div>

              {customer.referredBy ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Partner Organization:</span>
                      <Link
                        href={`/superadmin/partners/${customer.referredBy.id}`}
                        className="font-bold text-purple-700 hover:underline flex items-center gap-1"
                      >
                        <span>{customer.referredBy.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Referral Code Used:</span>
                      <span className="font-mono font-bold text-purple-800 bg-white px-2 py-0.5 rounded border border-purple-200">
                        {customer.referredBy.referralCode || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Partner Email:</span>
                      <span className="font-bold text-slate-800">{customer.referredBy.email}</span>
                    </div>

                    {customer.referredBy.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Partner Phone:</span>
                        <span className="font-bold text-slate-800">{customer.referredBy.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
                    <span className="text-slate-400 block text-[11px]">Affiliate Commission Rate:</span>
                    <span className="font-bold text-slate-900">
                      Partner earns {customer.referredBy.commissionPercent || 15}% commission on this customer&apos;s purchases.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 text-xs">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700">Direct Retail Customer</p>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    This customer joined directly from Google Search, direct URL, or social media campaigns without using any partner referral code.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Link Button */}
            {customer.referredBy && (
              <Link
                href={`/superadmin/partners/${customer.referredBy.id}`}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>View Partner Profile &amp; Earnings</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Saved Shipping Addresses */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Saved Shipping &amp; Delivery Addresses</span>
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {uniqueAddresses.length} Addresses Recorded
            </span>
          </div>

          {uniqueAddresses.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No delivery addresses recorded for this customer yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                >
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

        {/* Customer Order History Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                <span>Customer Order History</span>
              </h3>
              <p className="text-xs text-slate-500">
                All hardware orders placed by {customer.name} with live fulfillment &amp; invoice records.
              </p>
            </div>
            <span className="font-bold text-xs px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              {customer.orders?.length || 0} Total Orders
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Laser Engraving &amp; Target Link</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Courier / AWB</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {!customer.orders || customer.orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No orders placed by this customer yet.
                    </td>
                  </tr>
                ) : (
                  customer.orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        {order.businessName ? (
                          <p className="font-bold text-purple-900">
                            Engraving: &ldquo;{order.businessName}&rdquo;
                          </p>
                        ) : (
                          <span className="text-slate-400 italic">No custom engraving</span>
                        )}
                        {order.googleReviewLink && (
                          <a
                            href={order.googleReviewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-600 hover:underline flex items-center gap-1 font-mono text-[10px] truncate max-w-[200px] mt-0.5"
                          >
                            <span className="truncate">{order.googleReviewLink}</span>
                            <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                          </a>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        ₹{order.finalAmount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            order.orderStatus === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.orderStatus === 'shipped'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">
                          {order.courierName || 'Unassigned'}
                        </p>
                        <p className="font-mono text-[11px] text-emerald-700">
                          {order.trackingId || 'No AWB'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Printer className="w-3 h-3 text-purple-600" />
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Customer Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit Customer Account</h3>
                <p className="text-xs text-slate-500">Update verified contact parameters</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-purple-600 focus:outline-none"
                >
                  <option value="active">Active Client</option>
                  <option value="inactive">Blocked / Suspended</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal Integration */}
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
