'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { updateLocalSettings } from '@/redux/slice/settingsSlice';
import { logoutUser } from '@/redux/slice/authSlice';
import {
  useGetAnalyticsQuery,
  useGetOrdersQuery,
  useGetProductsQuery,
  useGetSettingsQuery,
  useGetAllAdminsQuery,
  useGetAdminByIdQuery,
  useGetAllUsersQuery,
  useGetAllPayoutsQuery,
  useUpdateSettingsMutation,
  useUpdateOrderMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useUpdatePayoutStatusMutation
} from '@/redux/api/apiSlice';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Settings,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Truck,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  Search,
  Filter,
  ExternalLink,
  Shield,
  LogOut,
  Menu,
  Store,
  Clock,
  IndianRupee,
  CreditCard,
  FileText,
  UserCheck,
  Building,
  Sliders,
  ChevronRight,
  Eye,
  RefreshCw,
  Lock,
  Unlock,
  Phone,
  Mail,
  MapPin,
  Copy,
  Check,
  ArrowLeft,
  Banknote,
  TrendingDown,
  UserX
} from 'lucide-react';
import Link from 'next/link';
import ReviewXpressLogo from '@/components/ReviewXpressLogo';

export default function SuperadminDashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');

  // RTK Query endpoints
  const { data: anaData, isLoading: anaLoading, refetch: refetchAna } = useGetAnalyticsQuery();
  const { data: ordData, isLoading: ordLoading, refetch: refetchOrd } = useGetOrdersQuery();
  const { data: prodData, isLoading: prodLoading, refetch: refetchProd } = useGetProductsQuery();
  const { data: setData, isLoading: setInitLoading, refetch: refetchSet } = useGetSettingsQuery();
  const { data: admData, isLoading: admLoading, refetch: refetchAdm } = useGetAllAdminsQuery();
  const { data: usrData, isLoading: usrLoading, refetch: refetchUsr } = useGetAllUsersQuery();
  const { data: payData, isLoading: payLoading, refetch: refetchPay } = useGetAllPayoutsQuery();

  // Customer detail drawer
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();
  const [createProduct, { isLoading: isCreatingProduct }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateAdmin] = useUpdateAdminMutation();
  const [deleteAdmin] = useDeleteAdminMutation();
  const [updatePayoutStatus] = useUpdatePayoutStatusMutation();

  const analytics = anaData?.analytics || null;
  const orders = ordData?.orders || [];
  const products = prodData?.products || [];
  const admins = admData?.admins || [];
  const users = usrData?.users || [];
  const payouts = payData?.payouts || [];

  const [siteSettings, setSiteSettings] = useState({});

  useEffect(() => {
    if (setData?.settings) {
      setSiteSettings(setData.settings);
    }
  }, [setData]);

  const loading = anaLoading && ordLoading && prodLoading;

  // Alerts
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const triggerNotice = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setStatusMsg(msg);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  // Quick Block/Unblock Partner from table
  const handleBlockUnblock = async (partner) => {
    const newStatus = partner.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'inactive' ? 'block' : 'unblock';
    if (!confirm(`Are you sure you want to ${action} partner "${partner.orgName || partner.name}"?`)) return;
    try {
      await updateAdmin({ id: partner.id, status: newStatus }).unwrap();
      triggerNotice(`Partner ${action === 'block' ? 'blocked' : 'unblocked'} successfully.`);
      refetchAdm();
    } catch (err) {
      triggerNotice('Failed to update partner status', true);
    }
  };

  // Modals state
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [trackingForm, setTrackingForm] = useState({
    orderStatus: 'shipped',
    courierName: 'Delhivery Express',
    trackingId: '',
    trackingUrl: 'https://www.delhivery.com/tracking'
  });

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    subtitle: '',
    price: '',
    originalPrice: '',
    badge: 'Trending',
    stock: 100,
    image: '',
    description: '',
    features: ''
  });

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminCommissionInput, setAdminCommissionInput] = useState(15);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch =
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.businessName?.toLowerCase().includes(searchTerm.toLowerCase());

      if (orderFilter === 'all') return matchSearch;
      if (orderFilter === 'paid') return matchSearch && order.paymentStatus === 'paid';
      if (orderFilter === 'pending') return matchSearch && order.paymentStatus === 'pending';
      return matchSearch && order.orderStatus === orderFilter;
    });
  }, [orders, searchTerm, orderFilter]);

  // Upload Photo / PDF to backend
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result;
      setUploadingImage(true);
      try {
        const res = await uploadProductImage({
          image: base64,
          fileName: file.name
        }).unwrap();

        if (res.success && res.url) {
          setProductForm(prev => ({ ...prev, image: res.url }));
          triggerNotice(`File uploaded successfully!`);
        }
      } catch (err) {
        console.error('File upload failed:', err);
        alert('Failed to upload file. You can paste an image URL directly.');
      } finally {
        setUploadingImage(false);
      }
    };
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await updateSettings(siteSettings).unwrap();
      if (res.success) {
        triggerNotice('Platform & GST settings updated successfully!');
        dispatch(updateLocalSettings(res.settings));
      }
    } catch (err) {
      triggerNotice('Failed to update settings', true);
    }
  };

  // Update Tracking & Courier
  const handleUpdateTracking = async (e) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    try {
      const res = await updateOrder({
        id: trackingModalOrder.id,
        ...trackingForm
      }).unwrap();
      if (res.success) {
        triggerNotice(`Order ${trackingModalOrder.orderNumber} fulfillment updated!`);
        setTrackingModalOrder(null);
      }
    } catch (err) {
      triggerNotice('Failed to update tracking', true);
    }
  };

  // Add or Edit Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct({
          id: editingProduct.id,
          ...productForm
        }).unwrap();
        triggerNotice('Product details updated successfully!');
      } else {
        await createProduct(productForm).unwrap();
        triggerNotice('New hardware product published!');
      }
      setProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      triggerNotice(err?.data?.error || err?.message || 'Failed to save product', true);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id).unwrap();
      triggerNotice('Product removed from catalog');
    } catch (err) {
      triggerNotice('Failed to delete product', true);
    }
  };

  // Update Admin Commission %
  const handleSaveAdminCommission = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;
    try {
      await updateAdmin({
        id: editingAdmin.id,
        commissionPercent: Number(adminCommissionInput)
      }).unwrap();
      triggerNotice(`Partner ${editingAdmin.name} commission updated to ${adminCommissionInput}%!`);
      setEditingAdmin(null);
    } catch (err) {
      triggerNotice('Failed to update partner commission', true);
    }
  };

  // Payout Status Approval
  const handlePayoutAction = async (payoutId, status) => {
    const paymentRef = prompt(`Enter Payment Reference / IMPS UTR for ${status}:`, 'IMPS-TXN-' + Math.floor(100000 + Math.random() * 900000));
    if (!paymentRef && status === 'approved') return;

    try {
      await updatePayoutStatus({
        id: payoutId,
        status,
        paymentRef,
        notes: `Processed by Superadmin on ${new Date().toLocaleDateString('en-IN')}`
      }).unwrap();
      triggerNotice(`Payout marked as ${status}`);
    } catch (err) {
      triggerNotice('Failed to update payout', true);
    }
  };

  const navItems = [
    { id: 'analytics', label: 'Overview & Analytics', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders & Tracking', icon: Package, badge: orders.length },
    { id: 'products', label: 'Hardware Catalog', icon: Sparkles, badge: products.length },
    { id: 'admins', label: 'Partner Program', icon: Building, badge: admins.length },
    { id: 'users', label: 'Customers Directory', icon: UserCheck, badge: users.length },
    { id: 'payouts', label: 'Affiliate Payouts', icon: IndianRupee, badge: payouts.filter(p => p.status === 'pending').length || null, badgeColor: 'bg-amber-500' },
    { id: 'settings', label: 'Gateway & GST Settings', icon: Sliders },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-300 text-sm font-medium">Loading ReviewXpress Superadmin Console...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* SIDEBAR BACKDROP FOR MOBILE */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ================= MODERN SAAS SIDEBAR ================= */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-[#090d16] text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base tracking-tight">ReviewXpress</span>
                <span className="text-[9px] uppercase font-extrabold tracking-widest bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                  Master
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Superadmin Control Suite</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Navigation Menu
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
                            : item.badgeColor
                            ? `${item.badgeColor} text-white`
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

          {/* Quick Platform Status */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> MySQL 8.0
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">PayU Mode:</span>
              <span className="font-bold text-purple-300 uppercase">
                {siteSettings.payuMode || 'Test'} Mode
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">GST Billing:</span>
              <span className="font-bold text-slate-200">
                {siteSettings.gstEnabled ? `${siteSettings.gstPercent || 18}% Active` : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Profile & Store link */}
        <div className="p-3.5 border-t border-slate-800/80 space-y-2 bg-[#060910]">
          <Link
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>View Public Storefront</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Superadmin'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@reviewexpress.in'}</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(logoutUser())}
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
                {activeTab === 'analytics' && 'Platform Overview & Financial Analytics'}
                {activeTab === 'orders' && 'Customer Orders & Courier Fulfillment'}
                {activeTab === 'products' && 'Smart NFC Hardware Product Catalog'}
                {activeTab === 'admins' && 'Affiliate Organizations & Partner Admins'}
                {activeTab === 'users' && 'Registered Customers Directory'}
                {activeTab === 'payouts' && 'Partner Commission Withdrawal Payouts'}
                {activeTab === 'settings' && 'Global Payment Gateway & GST Settings'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                refetchAna();
                refetchOrd();
                refetchProd();
                refetchSet();
                refetchAdm();
                refetchUsr();
                refetchPay();
                triggerNotice('Data refreshed from MySQL database!');
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {activeTab === 'products' && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    title: '',
                    subtitle: '',
                    price: '',
                    originalPrice: '',
                    badge: 'Trending',
                    stock: 100,
                    image: '',
                    description: '',
                    features: ''
                  });
                  setProductModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Hardware SKU</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Toast Alerts */}
        {statusMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
            <button onClick={() => setStatusMsg('')} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* ================= TAB 1: ANALYTICS & OVERVIEW ================= */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Gross Sales</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      ₹
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">₹{analytics.totalRevenue}</div>
                  <p className="text-[11px] text-slate-500 font-medium">{analytics.paidOrdersCount} Paid Orders Confirmed</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">GST Tax Collected</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      %
                    </div>
                  </div>
                  <div className="text-3xl font-black text-blue-700">₹{analytics.totalGstCollected}</div>
                  <p className="text-[11px] text-slate-500 font-medium">CGST + SGST (Official Invoices)</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Partner Commissions</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-amber-700">₹{analytics.totalAdminCommissions}</div>
                  <p className="text-[11px] text-slate-500 font-medium">Disbursed: ₹{analytics.totalPaidOut}</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Platform Margin</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-purple-700">₹{analytics.netPlatformProfit}</div>
                  <p className="text-[11px] text-slate-500 font-medium">Clean Earnings After Tax &amp; Commission</p>
                </div>
              </div>

              {/* Stakeholders summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div
                  onClick={() => setActiveTab('admins')}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Affiliate Partners</span>
                    <div className="text-2xl font-black text-slate-900">{analytics.partnersCount} Orgs</div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                    <Building className="w-6 h-6" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('users')}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Customer Base</span>
                    <div className="text-2xl font-black text-slate-900">{analytics.customersCount} Users</div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('products')}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Catalog Products</span>
                    <div className="text-2xl font-black text-slate-900">{analytics.productsCount} SKUs</div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Recent Platform Orders</h3>
                    <p className="text-xs text-slate-400">Latest customer purchases across India</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-y border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Order #</th>
                        <th className="py-2.5 px-3">Customer / Store</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-900 block">{o.customerName}</span>
                            <span className="text-[11px] text-slate-400">{o.businessName || o.customerPhone}</span>
                          </td>
                          <td className="py-3 px-3 font-black text-slate-900">₹{o.finalAmount}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold uppercase">
                              {o.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: ORDERS MANAGEMENT ================= */}
          {activeTab === 'orders' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search orders by number, customer, phone..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {[
                    { id: 'all', label: 'All Orders' },
                    { id: 'placed', label: 'Placed' },
                    { id: 'customizing', label: 'Customizing' },
                    { id: 'shipped', label: 'Shipped' },
                    { id: 'delivered', label: 'Delivered' },
                    { id: 'paid', label: 'Paid' },
                    { id: 'pending', label: 'Pending Payment' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                        orderFilter === f.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer &amp; Engraving</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Fulfillment</th>
                      <th className="py-3 px-4">Courier &amp; AWB</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No orders matched your search or filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{order.customerName}</p>
                            <p className="text-[11px] text-slate-500">{order.customerPhone}</p>
                            {order.businessName && (
                              <p className="text-[10px] text-purple-700 font-semibold mt-0.5">
                                Engrave: &ldquo;{order.businessName}&rdquo;
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 whitespace-nowrap">
                            ₹{order.finalAmount}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {order.paymentStatus}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">{order.paymentMethod}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold uppercase">
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-900">{order.courierName || 'Unassigned'}</p>
                            <p className="font-mono text-[11px] text-emerald-700">{order.trackingId || 'No AWB yet'}</p>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                setTrackingModalOrder(order);
                                setTrackingForm({
                                  orderStatus: order.orderStatus || 'shipped',
                                  courierName: order.courierName || 'Delhivery Express',
                                  trackingId: order.trackingId || '',
                                  trackingUrl: order.trackingUrl || 'https://www.delhivery.com/tracking'
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Update Tracking</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3: PRODUCTS CATALOG ================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(prod => (
                  <div
                    key={prod.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-purple-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative h-48 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                        {prod.image && (prod.image.toLowerCase().endsWith('.pdf') || prod.image.includes('.pdf')) ? (
                          <div className="text-center p-4">
                            <span className="text-5xl block mb-2">📄</span>
                            <span className="text-xs font-bold text-rose-700 uppercase">PDF Document</span>
                          </div>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={prod.image || 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80'}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {prod.badge && (
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-slate-900/90 text-white text-[10px] font-bold shadow-xs">
                            {prod.badge}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{prod.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{prod.subtitle || prod.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900">₹{prod.price}</span>
                        {prod.originalPrice > prod.price && (
                          <span className="text-xs text-slate-400 line-through">₹{prod.originalPrice}</span>
                        )}
                        <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded ml-auto">
                          Stock: {prod.stock || 100} units
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setProductForm({
                            title: prod.title || '',
                            subtitle: prod.subtitle || '',
                            price: prod.price || '',
                            originalPrice: prod.originalPrice || '',
                            badge: prod.badge || '',
                            stock: prod.stock || 100,
                            image: prod.image || '',
                            description: prod.description || '',
                            features: prod.features || ''
                          });
                          setProductModalOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Product</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: PARTNER ADMINS ================= */}
          {activeTab === 'admins' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Affiliate Organizations &amp; Marketing Partners</h3>
                    <p className="text-xs text-slate-400">Click any partner row to view full details, edit, block/unblock, or delete.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                      {admins.length} Active Partners
                    </span>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                      {admins.filter(a => a.status === 'inactive').length} Blocked
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Organization / Contact</th>
                      <th className="py-3 px-4">Referral Code</th>
                      <th className="py-3 px-4">Commission %</th>
                      <th className="py-3 px-4">Orders</th>
                      <th className="py-3 px-4">Gross Revenue</th>
                      <th className="py-3 px-4">Commission Earned</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {admins.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">No partner organizations registered yet.</td>
                      </tr>
                    ) : (
                      admins.map(adm => (
                        <tr
                          key={adm.id}
                          onClick={() => router.push(`/superadmin/partners/${adm.id}`)}
                          className="hover:bg-purple-50/60 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{adm.orgName || adm.name}</p>
                            <p className="text-[11px] text-slate-500">{adm.email}</p>
                            {adm.phone && <p className="text-[11px] text-slate-400">{adm.phone}</p>}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              {adm.referralCode}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900">{adm.commissionPercent}%</td>
                          <td className="py-3.5 px-4 font-bold">{adm.stats?.paidOrders || 0} paid</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">₹{adm.stats?.totalSales || 0}</td>
                          <td className="py-3.5 px-4 font-black text-amber-700">₹{adm.stats?.totalCommission || 0}</td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                              adm.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {adm.status === 'active' ? '● Active' : '● Blocked'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/superadmin/partners/${adm.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View Page</span>
                              </Link>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleBlockUnblock(adm); }}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 ${
                                  adm.status === 'active'
                                    ? 'bg-red-50 hover:bg-red-100 text-red-700'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {adm.status === 'active' ? 'Block' : 'Unblock'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 5: CUSTOMER DIRECTORY ================= */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Registered Customer Accounts</h3>
                    <p className="text-xs text-slate-400">Directory of all client accounts with referral source, total spend, and order history.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                      {users.length} Total Customers
                    </span>
                    <span className="font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                      {users.filter(u => u.referredBy).length} via Partners
                    </span>
                    <span className="font-bold px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
                      {users.filter(u => !u.referredBy).length} Direct
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Click-to-Detail Drawer */}
              {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex justify-end">
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />
                  <div className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden">
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                          {selectedCustomer.name?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <h2 className="font-black text-slate-900 text-base">{selectedCustomer.name}</h2>
                          <p className="text-xs text-slate-500">{selectedCustomer.email}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedCustomer(null)} className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Customer Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                          <span className="text-slate-400 text-[11px]">Phone</span>
                          <p className="font-bold text-slate-900">{selectedCustomer.phone || 'Not provided'}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                          <span className="text-slate-400 text-[11px]">Member Since</span>
                          <p className="font-bold text-slate-900">{new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                          <span className="text-slate-400 text-[11px]">Total Orders</span>
                          <p className="font-black text-slate-900 text-lg">{selectedCustomer.totalOrders}</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-0.5">
                          <span className="text-slate-400 text-[11px]">Total Spent</span>
                          <p className="font-black text-emerald-700 text-lg">₹{selectedCustomer.totalSpent?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {/* Referral Source */}
                      <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                        selectedCustomer.referredBy
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                        <h4 className="font-black text-slate-900 flex items-center gap-2">
                          {selectedCustomer.referredBy ? (
                            <><Sparkles className="w-4 h-4 text-amber-500" /> Referred via Partner Program</>
                          ) : (
                            <><UserCheck className="w-4 h-4 text-slate-500" /> Direct Customer (No Referral)</>
                          )}
                        </h4>
                        {selectedCustomer.referredBy ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Partner Organization:</span>
                              <span className="font-bold text-amber-800">{selectedCustomer.referredBy.name}</span>
                            </div>
                            {selectedCustomer.referredBy.referralCode && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">Referral Code Used:</span>
                                <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                  {selectedCustomer.referredBy.referralCode}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Partner Email:</span>
                              <span className="font-bold text-slate-700">{selectedCustomer.referredBy.email}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-500">This customer registered or purchased without using any partner referral code.</p>
                        )}
                      </div>

                      {/* Recent Orders */}
                      {selectedCustomer.recentOrders?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-600" /> Recent Orders
                          </h4>
                          <div className="space-y-2">
                            {selectedCustomer.recentOrders.map(o => (
                              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                                <div>
                                  <p className="font-mono font-bold text-slate-900">{o.orderNumber}</p>
                                  {o.businessName && <p className="text-[11px] text-purple-700">Engrave: {o.businessName}</p>}
                                  <p className="text-[11px] text-slate-400">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                                </div>
                                <div className="text-right space-y-1">
                                  <p className="font-black text-slate-900">₹{o.finalAmount}</p>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                    o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>{o.paymentStatus}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Referred By (Partner / Code)</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4">Total Spent</th>
                      <th className="py-3 px-4">Member Since</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">No customer accounts found.</td>
                      </tr>
                    ) : (
                      users.map(usr => (
                        <tr
                          key={usr.id}
                          onClick={() => setSelectedCustomer(usr)}
                          className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                                {usr.name?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                              <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{usr.name}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <p>{usr.email}</p>
                            <p className="text-[11px] text-slate-500">{usr.phone || '—'}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            {usr.referredBy ? (
                              <div className="space-y-0.5">
                                <p className="font-bold text-amber-800">{usr.referredBy.name}</p>
                                {usr.referredBy.referralCode && (
                                  <span className="font-mono text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                    {usr.referredBy.referralCode}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Direct / Organic</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold">{usr.totalOrders}</td>
                          <td className="py-3.5 px-4 font-black text-emerald-700">₹{usr.totalSpent}</td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(usr.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedCustomer(usr); }}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-[11px] flex items-center gap-1 ml-auto"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 6: PAYOUTS ================= */}
          {activeTab === 'payouts' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Partner Commission Withdrawal Requests</h3>
                <p className="text-xs text-slate-400">Review and approve bank IMPS or UPI transfers for affiliate earnings.</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="py-3 px-4">Partner</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Destination Details</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">UTR Reference</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {payouts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No withdrawal requests found.
                        </td>
                      </tr>
                    ) : (
                      payouts.map(pay => (
                        <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{pay.admin?.orgName || pay.admin?.name}</p>
                            <p className="text-[11px] text-slate-500">{pay.admin?.email}</p>
                          </td>
                          <td className="py-3.5 px-4 font-black text-amber-700 text-sm">₹{pay.amount}</td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(pay.requestedAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-[11px]">
                            {pay.admin?.upiId ? (
                              <span className="font-mono text-emerald-700 font-bold">UPI: {pay.admin.upiId}</span>
                            ) : (
                              <span>A/C: {pay.admin?.bankAccount} ({pay.admin?.bankName})</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              pay.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                              pay.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {pay.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{pay.paymentRef || '—'}</td>
                          <td className="py-3.5 px-4 text-right">
                            {pay.status === 'pending' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handlePayoutAction(pay.id, 'approved')}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handlePayoutAction(pay.id, 'rejected')}
                                  className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px]"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 7: SETTINGS ================= */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PayU Gateway Settings */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">PayU Payment Gateway Integration</h4>
                      <p className="text-[11px] text-slate-400">Dynamic SHA512 hash verification keys</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PayU Environment Mode</label>
                    <select
                      value={siteSettings.payuMode || 'test'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, payuMode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white"
                    >
                      <option value="test">Sandbox / Test Gateway (test.payu.in)</option>
                      <option value="live">Live Production Gateway (secure.payu.in)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Merchant Key</label>
                    <input
                      type="text"
                      value={siteSettings.payuMerchantKey || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, payuMerchantKey: e.target.value })}
                      placeholder="e.g. GKJE3Z"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Merchant Salt</label>
                    <input
                      type="password"
                      value={siteSettings.payuMerchantSalt || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, payuMerchantSalt: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white"
                    />
                  </div>
                </div>

                {/* GST Tax & Invoicing */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Official GST Tax Invoicing</h4>
                      <p className="text-[11px] text-slate-400">Automated CGST/SGST tax invoices</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Enable GST Tax on Orders</span>
                      <span className="text-[11px] text-slate-500">Automatically adds GST to checkout total</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(siteSettings.gstEnabled)}
                      onChange={(e) => setSiteSettings({ ...siteSettings, gstEnabled: e.target.checked })}
                      className="w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">GST Percentage (%)</label>
                      <input
                        type="number"
                        value={siteSettings.gstPercent || 18}
                        onChange={(e) => setSiteSettings({ ...siteSettings, gstPercent: parseFloat(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">HSN / SAC Code</label>
                      <input
                        type="text"
                        value={siteSettings.hsnCode || '852352'}
                        onChange={(e) => setSiteSettings({ ...siteSettings, hsnCode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official GSTIN Number</label>
                    <input
                      type="text"
                      value={siteSettings.gstNumber || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, gstNumber: e.target.value })}
                      placeholder="e.g. 27AABCR1234F1Z8"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono uppercase focus:bg-white"
                    />
                  </div>
                </div>

                {/* Delivery & Shipping Rules */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Delivery &amp; Courier Fees</h4>
                      <p className="text-[11px] text-slate-400">Shipping thresholds across India</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Free Shipping Above (₹)</label>
                      <input
                        type="number"
                        value={siteSettings.freeShippingAbove || 999}
                        onChange={(e) => setSiteSettings({ ...siteSettings, freeShippingAbove: parseFloat(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Standard Delivery Fee (₹)</label>
                      <input
                        type="number"
                        value={siteSettings.standardShippingFee || 60}
                        onChange={(e) => setSiteSettings({ ...siteSettings, standardShippingFee: parseFloat(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Brand Settings */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Store className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Brand &amp; Support Contact</h4>
                      <p className="text-[11px] text-slate-400">Support channels shown across website</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Support Phone / WhatsApp</label>
                      <input
                        type="text"
                        value={siteSettings.supportPhone || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, supportPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
                      <input
                        type="email"
                        value={siteSettings.supportEmail || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Top Announcement Banner</label>
                    <input
                      type="text"
                      value={siteSettings.announcementBanner || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, announcementBanner: e.target.value })}
                      placeholder="e.g. Free Express Shipping on Orders Above ₹999!"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingSettings}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdatingSettings ? 'Saving Settings...' : 'Save All Settings'}</span>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      {/* ================= MODAL: TRACKING / FULFILLMENT ================= */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-600" />
                <span>Update Courier: {trackingModalOrder.orderNumber}</span>
              </h3>
              <button onClick={() => setTrackingModalOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTracking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fulfillment Status</label>
                <select
                  value={trackingForm.orderStatus}
                  onChange={(e) => setTrackingForm({ ...trackingForm, orderStatus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white font-bold"
                >
                  <option value="placed">Placed / In Queue</option>
                  <option value="customizing">Customizing NFC &amp; Laser Print</option>
                  <option value="shipped">Dispatched with Courier (Shipped)</option>
                  <option value="delivered">Delivered Successfully</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Courier Partner Name</label>
                <input
                  type="text"
                  value={trackingForm.courierName}
                  onChange={(e) => setTrackingForm({ ...trackingForm, courierName: e.target.value })}
                  placeholder="e.g. Delhivery Express, Blue Dart"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tracking AWB Number</label>
                <input
                  type="text"
                  value={trackingForm.trackingId}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingId: e.target.value })}
                  placeholder="e.g. DLHV-849201948"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tracking URL</label>
                <input
                  type="text"
                  value={trackingForm.trackingUrl}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingUrl: e.target.value })}
                  placeholder="https://www.delhivery.com/tracking"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingOrder}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20"
                >
                  {isUpdatingOrder ? 'Updating...' : 'Save Tracking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl p-6 border border-slate-200 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{editingProduct ? 'Edit Hardware Product' : 'Add New Hardware SKU'}</span>
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Smart NFC Google Review Stand"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={productForm.subtitle}
                    onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                    placeholder="e.g. Best-seller for billing counters"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="1199"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    placeholder="1999"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    placeholder="Trending, Best Seller"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                  />
                </div>

                {/* Upload Image / PDF */}
                <div className="col-span-2 space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">Product Image or PDF Specification</label>
                    <span className="text-[10px] text-slate-400">Cloud Storage / Direct URL</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center relative flex-shrink-0">
                      {productForm.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={productForm.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleImageFileUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                        <div className="py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs">
                          {uploadingImage ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                              <span>Uploading to Cloud...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-purple-600" />
                              <span>Select Image from Device</span>
                            </>
                          )}
                        </div>
                      </label>
                      <input
                        type="text"
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        placeholder="Or paste direct image URL (https://...)"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Key Features (One per line)</label>
                  <textarea
                    rows={2}
                    value={productForm.features}
                    onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                    placeholder="Instant 1-Tap NFC&#10;Dynamic Laser QR Code"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProduct || isUpdatingProduct}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20"
                >
                  {isCreatingProduct || isUpdatingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADJUST COMMISSION ================= */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Commission Rate: {editingAdmin.orgName || editingAdmin.name}
              </h3>
              <button onClick={() => setEditingAdmin(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminCommission} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Commission Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="0.5"
                  value={adminCommissionInput}
                  onChange={(e) => setAdminCommissionInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">This partner will earn {adminCommissionInput}% on every sale.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                >
                  Update Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
