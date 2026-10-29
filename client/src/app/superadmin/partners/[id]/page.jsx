'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  useGetAdminByIdQuery,
  useUpdateAdminMutation,
  useDeleteAdminMutation
} from '@/redux/api/apiSlice';
import {
  ArrowLeft,
  Building,
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
  QrCode,
  Download,
  Share2,
  RefreshCw,
  X,
  Banknote,
  Lock,
  Unlock,
  Users,
  Clock,
  Sparkles,
  Loader2
} from 'lucide-react';
import ReviewXpressLogo from '@/components/ReviewXpressLogo';

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params?.id;

  const { data: partnerData, isLoading, refetch } = useGetAdminByIdQuery(partnerId, {
    skip: !partnerId
  });
  const [updateAdmin, { isLoading: isSaving }] = useUpdateAdminMutation();
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();

  const partner = partnerData?.admin || null;

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    orgName: '',
    name: '',
    email: '',
    phone: '',
    referralCode: '',
    commissionPercent: 15,
    upiId: '',
    bankName: '',
    bankAccount: '',
    ifscCode: '',
    bankHolder: ''
  });

  // Commission Quick Edit Modal
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);
  const [commissionInput, setCommissionInput] = useState(15);

  // QR Code & Copy Feedback
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [notice, setNotice] = useState({ text: '', isError: false });

  const triggerNotice = (text, isError = false) => {
    setNotice({ text, isError });
    setTimeout(() => setNotice({ text: '', isError: false }), 4000);
  };

  useEffect(() => {
    if (partner) {
      setEditForm({
        orgName: partner.orgName || '',
        name: partner.name || '',
        email: partner.email || '',
        phone: partner.phone || '',
        referralCode: partner.referralCode || '',
        commissionPercent: partner.commissionPercent || 15,
        upiId: partner.upiId || '',
        bankName: partner.bankName || '',
        bankAccount: partner.bankAccount || '',
        ifscCode: partner.ifscCode || '',
        bankHolder: partner.bankHolder || ''
      });
      setCommissionInput(partner.commissionPercent || 15);

      // Generate Referral QR
      if (partner.referralCode) {
        const link = typeof window !== 'undefined'
          ? `${window.location.origin}/?ref=${partner.referralCode}`
          : `https://reviewexpress.in/?ref=${partner.referralCode}`;

        QRCode.toDataURL(link, {
          width: 320,
          margin: 1.5,
          color: { dark: '#090d16', light: '#ffffff' }
        }).then(url => setQrCodeUrl(url)).catch(() => {});
      }
    }
  }, [partner]);

  const copyToClipboard = (text, key) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2500);
    }
  };

  // Block / Unblock Partner
  const handleToggleBlock = async () => {
    if (!partner) return;
    const isCurrentlyActive = partner.status === 'active';
    const action = isCurrentlyActive ? 'block' : 'unblock';
    const newStatus = isCurrentlyActive ? 'inactive' : 'active';

    if (!confirm(`Are you sure you want to ${action} partner "${partner.orgName || partner.name}"?`)) return;

    try {
      await updateAdmin({ id: partner.id, status: newStatus }).unwrap();
      triggerNotice(`Partner account successfully ${action === 'block' ? 'blocked' : 'unblocked'}.`);
      refetch();
    } catch (err) {
      triggerNotice(err?.data?.error || 'Failed to update partner status', true);
    }
  };

  // Delete Partner
  const handleDeletePartner = async () => {
    if (!partner) return;
    const confirmDelete = confirm(
      `⚠️ PERMANENT DELETION:\n\nAre you sure you want to completely delete "${partner.orgName || partner.name}"?\nAll associated referrals will be safely detached.`
    );
    if (!confirmDelete) return;

    try {
      await deleteAdmin(partner.id).unwrap();
      alert('Partner account permanently removed.');
      router.push('/superadmin/dashboard');
    } catch (err) {
      triggerNotice(err?.data?.error || 'Failed to delete partner', true);
    }
  };

  // Save Full Edit Details
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await updateAdmin({
        id: partner.id,
        ...editForm,
        commissionPercent: Number(editForm.commissionPercent)
      }).unwrap();
      triggerNotice('Partner profile and payout settings updated successfully!');
      setEditModalOpen(false);
      refetch();
    } catch (err) {
      triggerNotice(err?.data?.error || 'Failed to update partner details', true);
    }
  };

  // Save Quick Commission Rate
  const handleSaveCommission = async (e) => {
    e.preventDefault();
    try {
      await updateAdmin({
        id: partner.id,
        commissionPercent: Number(commissionInput)
      }).unwrap();
      triggerNotice(`Commission rate updated to ${commissionInput}%!`);
      setCommissionModalOpen(false);
      refetch();
    } catch (err) {
      triggerNotice(err?.data?.error || 'Failed to update commission rate', true);
    }
  };

  const referralLink = partner?.referralCode
    ? (typeof window !== 'undefined' ? `${window.location.origin}/?ref=${partner.referralCode}` : `https://reviewexpress.in/?ref=${partner.referralCode}`)
    : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-300 text-sm font-medium">Loading Organization Partner Profile...</p>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900">Partner Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md">
          The requested organization partner account does not exist or has been deleted.
        </p>
        <Link
          href="/superadmin/dashboard"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Partner Directory</span>
        </Link>
      </div>
    );
  }

  const isBlocked = partner.status === 'inactive' || partner.status === 'blocked';

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
            <span className="hidden sm:inline">Partner Directory</span>
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Superadmin</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">Partners</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900 truncate max-w-[200px]">
              {partner.orgName || partner.name}
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
            <span>Edit Partner</span>
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
                <span>Unblock Partner</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Block Partner</span>
              </>
            )}
          </button>

          <button
            onClick={handleDeletePartner}
            disabled={isDeleting}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
            title="Permanently Delete Partner"
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
        {/* Partner Header Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-purple-600/20 flex-shrink-0">
              {(partner.orgName || partner.name || 'P').charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {partner.orgName || partner.name}
                </h1>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase border flex items-center gap-1.5 ${
                    isBlocked
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                  <span>{isBlocked ? 'Account Blocked' : 'Active Partner'}</span>
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {partner.commissionPercent || 15}% Commission
                </span>
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Contact: <strong className="text-slate-800">{partner.name}</strong></span>
                <span>•</span>
                <span>Email: <strong className="text-slate-800">{partner.email}</strong></span>
                {partner.phone && (
                  <>
                    <span>•</span>
                    <span>Phone: <strong className="text-slate-800">{partner.phone}</strong></span>
                  </>
                )}
                <span>•</span>
                <span>Joined on {new Date(partner.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCommissionModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-2 border border-amber-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Adjust Commission %</span>
            </button>
          </div>
        </div>

        {/* 4 Financial Performance Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">Total Referred Orders</span>
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{partner.stats?.totalOrders || 0}</div>
            <p className="text-[11px] text-slate-500">
              {partner.stats?.paidOrders || 0} successfully paid
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">Gross Revenue Generated</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">
              ₹{(partner.stats?.totalSales || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500">Total subtotal of paid orders</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">Total Commission Earned</span>
              <IndianRupee className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700">
              ₹{(partner.stats?.totalCommission || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500">
              Calculated at {partner.commissionPercent || 15}% rate
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold">Available Wallet Balance</span>
              <CreditCard className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-700">
              ₹{(partner.stats?.walletBalance || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500">
              ₹{(partner.stats?.totalPaidOut || 0).toLocaleString('en-IN')} withdrawn to date
            </p>
          </div>
        </div>

        {/* 2-Column Detailed Profiles: Organization & Referral Setup + Payout Destination */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Organization & Referral Engine */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" />
                  <span>Organization &amp; Affiliate Engine</span>
                </h3>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  CODE: {partner.referralCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Organization Name</span>
                  <span className="font-bold text-slate-900 text-sm">{partner.orgName || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Contact Representative</span>
                  <span className="font-bold text-slate-900 text-sm">{partner.name}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Account Email</span>
                  <span className="font-bold text-slate-900">{partner.email}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Contact Phone</span>
                  <span className="font-bold text-slate-900">{partner.phone || 'Not provided'}</span>
                </div>
              </div>

              {/* Referral Link & Instant Share */}
              {referralLink && (
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900">Partner Referral Link:</span>
                    <span className="text-[10px] text-purple-700 font-bold">5% Customer Auto-Discount</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-purple-200">
                    <span className="font-mono text-[11px] text-purple-900 truncate">
                      {referralLink}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(referralLink, 'ref-link')}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Copy Link"
                      >
                        {copiedKey === 'ref-link' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Order Smart Google Review NFC Stands: ${referralLink}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Live QR Asset Preview */}
            {qrCodeUrl && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs flex items-center gap-1.5 text-purple-300">
                    <QrCode className="w-4 h-4 text-purple-400" />
                    <span>Downloadable Partner QR Asset</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Scan directly to test referral linkage or download high-res PNG for marketing flyers.
                  </p>
                  <a
                    href={qrCodeUrl}
                    download={`ReviewXpress-Partner-QR-${partner.referralCode}.png`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] mt-1 shadow-sm transition-all"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PNG</span>
                  </a>
                </div>
                <div className="w-20 h-20 bg-white p-1 rounded-xl flex-shrink-0 shadow-md">
                  <img src={qrCodeUrl} alt="Referral QR" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Payout & Bank Settlement Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Bank &amp; UPI Settlement Destination</span>
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {partner.upiId ? 'Instant UPI Active' : 'Bank Transfer Active'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* UPI ID */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Primary UPI Virtual ID</span>
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {partner.upiId || 'Not configured'}
                    </span>
                  </div>
                  {partner.upiId && (
                    <button
                      onClick={() => copyToClipboard(partner.upiId, 'upi-id')}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                    >
                      {copiedKey === 'upi-id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Bank Account */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank Name:</span>
                    <span className="font-bold text-slate-900">{partner.bankName || 'Not configured'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {partner.bankAccount ? `•••• •••• ${partner.bankAccount.slice(-4)} (${partner.bankAccount})` : 'Not configured'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IFSC Code:</span>
                    <span className="font-mono font-bold text-purple-700">{partner.ifscCode || 'Not configured'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Holder:</span>
                    <span className="font-bold text-slate-900">{partner.bankHolder || partner.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Summary Card */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span>Withdrawal Summary</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[11px] block">Total Settled / Paid Out:</span>
                  <span className="font-black text-slate-900 text-sm">
                    ₹{(partner.stats?.totalPaidOut || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] block">Pending Settlements:</span>
                  <span className="font-black text-amber-800 text-sm">
                    ₹{(partner.stats?.pendingCommission || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referred Customer Orders Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                <span>Referred Customer Orders</span>
              </h3>
              <p className="text-xs text-slate-500">
                All retail orders transacted using {partner.orgName || partner.name}&apos;s referral code.
              </p>
            </div>
            <span className="font-bold text-xs px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              {partner.referredOrders?.length || 0} Total Orders
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer &amp; Stand Engraving</th>
                  <th className="py-3 px-4">Final Amount</th>
                  <th className="py-3 px-4">Partner Commission</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Order Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {!partner.referredOrders || partner.referredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No referred orders found for this partner yet.
                    </td>
                  </tr>
                ) : (
                  partner.referredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-[11px] text-slate-500">{order.customerPhone}</p>
                        {order.businessName && (
                          <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded">
                            Engraving: {order.businessName}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ₹{order.finalAmount}
                      </td>
                      <td className="py-3.5 px-4 font-black text-amber-700">
                        ₹{order.adminCommissionAmount}{' '}
                        <span className="text-[10px] font-normal text-slate-400">
                          ({order.adminCommissionPercent}%)
                        </span>
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
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-700">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Withdrawal Requests (Payouts) History */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-amber-600" />
                <span>Commission Withdrawal History</span>
              </h3>
              <p className="text-xs text-slate-500">
                Record of payout disbursements requested by this partner.
              </p>
            </div>
            <span className="font-bold text-xs px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              {partner.payouts?.length || 0} Total Requests
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payout ID</th>
                  <th className="py-3 px-4">Requested Amount</th>
                  <th className="py-3 px-4">Date Requested</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Bank / UTR Reference</th>
                  <th className="py-3 px-4">Processed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {!partner.payouts || partner.payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No withdrawal requests recorded for this partner.
                    </td>
                  </tr>
                ) : (
                  partner.payouts.map(pay => (
                    <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        PAY-#{pay.id}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        ₹{pay.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(pay.requestedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            pay.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : pay.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {pay.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {pay.paymentRef || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {pay.processedAt ? new Date(pay.processedAt).toLocaleDateString('en-IN') : 'Pending'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Full Edit Partner Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit Partner Account Details</h3>
                <p className="text-xs text-slate-500">Update organization credentials, commission, and bank payout parameters</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.orgName}
                    onChange={(e) => setEditForm({ ...editForm, orgName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person Name *</label>
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Referral Code *</label>
                  <input
                    type="text"
                    required
                    value={editForm.referralCode}
                    onChange={(e) => setEditForm({ ...editForm, referralCode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-purple-700 font-mono text-xs font-bold focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Commission Rate (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    required
                    value={editForm.commissionPercent}
                    onChange={(e) => setEditForm({ ...editForm, commissionPercent: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bank & Settlement Details */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-amber-700" />
                  <span>Bank &amp; UPI Settlement Configuration</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">UPI ID</label>
                    <input
                      type="text"
                      placeholder="business@okhdfcbank"
                      value={editForm.upiId}
                      onChange={(e) => setEditForm({ ...editForm, upiId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="HDFC Bank / SBI"
                      value={editForm.bankName}
                      onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="1234567890123"
                      value={editForm.bankAccount}
                      onChange={(e) => setEditForm({ ...editForm, bankAccount: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="HDFC0001234"
                      value={editForm.ifscCode}
                      onChange={(e) => setEditForm({ ...editForm, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Bank Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="Legal company or person name"
                      value={editForm.bankHolder}
                      onChange={(e) => setEditForm({ ...editForm, bankHolder: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
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
                  <span>Save All Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Commission Rate Modal */}
      {commissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Adjust Commission Percentage</span>
              </h3>
              <button
                onClick={() => setCommissionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCommission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Commission Percentage (%) for {partner.orgName || partner.name}
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="0.5"
                  required
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base font-black focus:bg-white focus:border-purple-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This partner will earn {commissionInput}% commission on all referred sales.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCommissionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                >
                  Update Commission Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
