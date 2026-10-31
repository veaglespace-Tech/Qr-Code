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
  useReorderProductsMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useUpdatePayoutStatusMutation,
  useUpdateProfileMutation
} from '@/redux/api/apiSlice';
import { useDebounce } from '@/hooks/useDebounce';
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
  EyeOff,
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
  UserX,
  User,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  SlidersHorizontal,
  Layers,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import ReviewXpressLogo from '@/components/ReviewXpressLogo';

export default function SuperadminDashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [activeTab, setActiveTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Orders search & debounce
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedOrderSearch = useDebounce(searchTerm, 300);
  const [orderFilter, setOrderFilter] = useState('all');

  // Product Search, Filter & Ordering states
  const [productSearch, setProductSearch] = useState('');
  const debouncedProductSearch = useDebounce(productSearch, 300);
  const [productStatusFilter, setProductStatusFilter] = useState('all'); // 'all' | 'active' | 'paused' | 'low_stock'
  const [productSortBy, setProductSortBy] = useState('displayOrder'); // 'displayOrder' | 'price_asc' | 'price_desc' | 'rating' | 'stock'

  // Admin & User search with debounce
  const [adminSearch, setAdminSearch] = useState('');
  const debouncedAdminSearch = useDebounce(adminSearch, 300);

  const [userSearch, setUserSearch] = useState('');
  const debouncedUserSearch = useDebounce(userSearch, 300);

  // RTK Query endpoints
  const { data: anaData, isLoading: anaLoading, refetch: refetchAna } = useGetAnalyticsQuery();
  const { data: ordData, isLoading: ordLoading, refetch: refetchOrd } = useGetOrdersQuery();
  const { data: prodData, isLoading: prodLoading, refetch: refetchProd } = useGetProductsQuery();
  const { data: setData, isLoading: setInitLoading, refetch: refetchSet } = useGetSettingsQuery();
  const { data: admData, isLoading: admLoading, refetch: refetchAdm } = useGetAllAdminsQuery();
  const { data: usrData, isLoading: usrLoading, refetch: refetchUsr } = useGetAllUsersQuery();
  const { data: payData, isLoading: payLoading, refetch: refetchPay } = useGetAllPayoutsQuery();

  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();
  const [createProduct, { isLoading: isCreatingProduct }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [reorderProducts, { isLoading: isReorderingProducts }] = useReorderProductsMutation();
  const [updateAdmin] = useUpdateAdminMutation();
  const [deleteAdmin] = useDeleteAdminMutation();
  const [updatePayoutStatus] = useUpdatePayoutStatusMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

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

  const handleUpdateProfile = async (e) => {
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
        triggerNotice(res.message || 'Superadmin profile updated successfully!');
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

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
    } catch {}
    window.location.href = '/login';
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
    features: '',
    isActive: true,
    displayOrder: 1
  });

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminCommissionInput, setAdminCommissionInput] = useState(15);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Filtered orders with debounced search
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = !debouncedOrderSearch.trim() ||
        order.orderNumber?.toLowerCase().includes(debouncedOrderSearch.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(debouncedOrderSearch.toLowerCase()) ||
        order.customerPhone?.toLowerCase().includes(debouncedOrderSearch.toLowerCase()) ||
        order.businessName?.toLowerCase().includes(debouncedOrderSearch.toLowerCase());

      if (orderFilter === 'all') return matchSearch;
      if (orderFilter === 'paid') return matchSearch && order.paymentStatus === 'paid';
      if (orderFilter === 'pending') return matchSearch && order.paymentStatus === 'pending';
      return matchSearch && order.orderStatus === orderFilter;
    });
  }, [orders, debouncedOrderSearch, orderFilter]);

  // Filtered & Sorted Products with debounced search
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search filter
    if (debouncedProductSearch.trim()) {
      const q = debouncedProductSearch.toLowerCase().trim();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.subtitle?.toLowerCase().includes(q) ||
        p.badge?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (productStatusFilter === 'active') {
      list = list.filter(p => p.isActive !== false);
    } else if (productStatusFilter === 'paused') {
      list = list.filter(p => p.isActive === false);
    } else if (productStatusFilter === 'low_stock') {
      list = list.filter(p => (p.stock || 0) < 20);
    }

    // Sorting
    if (productSortBy === 'price_asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (productSortBy === 'price_desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (productSortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (productSortBy === 'stock') {
      list.sort((a, b) => (a.stock || 0) - (b.stock || 0));
    } else {
      // Default: displayOrder
      list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }

    return list;
  }, [products, debouncedProductSearch, productStatusFilter, productSortBy]);

  // Filtered Admins with debounced search
  const filteredAdmins = useMemo(() => {
    if (!debouncedAdminSearch.trim()) return admins;
    const q = debouncedAdminSearch.toLowerCase().trim();
    return admins.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.orgName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.phone?.toLowerCase().includes(q) ||
      a.referralCode?.toLowerCase().includes(q)
    );
  }, [admins, debouncedAdminSearch]);

  // Filtered Users with debounced search
  const filteredUsers = useMemo(() => {
    if (!debouncedUserSearch.trim()) return users;
    const q = debouncedUserSearch.toLowerCase().trim();
    return users.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.businessName?.toLowerCase().includes(q)
    );
  }, [users, debouncedUserSearch]);

  // Product Reordering: Move Up / Down
  const handleMoveProductOrder = async (prodId, direction) => {
    const sorted = [...products].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.id - b.id);
    const idx = sorted.findIndex(p => p.id === prodId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const newProducts = [...sorted];
    const temp = newProducts[idx];
    newProducts[idx] = newProducts[targetIdx];
    newProducts[targetIdx] = temp;

    const payload = newProducts.map((p, i) => ({ id: p.id, displayOrder: i + 1 }));
    try {
      await reorderProducts({ orders: payload }).unwrap();
      refetchProd();
      triggerNotice(`Product moved to Public View Position #${targetIdx + 1}!`);
    } catch {
      triggerNotice('Failed to update product order', true);
    }
  };

  // Set explicit Public View position number (e.g. 1st, 2nd, 3rd, 4th...)
  const handleSetProductPosition = async (prodId, newPosition) => {
    const targetPos = parseInt(newPosition);
    if (isNaN(targetPos) || targetPos < 1) return;

    const sorted = [...products].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.id - b.id);
    const currentIdx = sorted.findIndex(p => p.id === prodId);
    if (currentIdx === -1) return;

    const [movedItem] = sorted.splice(currentIdx, 1);
    const insertIdx = Math.max(0, Math.min(targetPos - 1, sorted.length));
    sorted.splice(insertIdx, 0, movedItem);

    const payload = sorted.map((p, i) => ({ id: p.id, displayOrder: i + 1 }));
    try {
      await reorderProducts({ orders: payload }).unwrap();
      refetchProd();
      triggerNotice(`Product set to Public View Position #${insertIdx + 1}!`);
    } catch {
      triggerNotice('Failed to update public view position', true);
    }
  };

  // Product Pause / Unpause toggle
  const handleToggleProductStatus = async (prod) => {
    try {
      const newActive = prod.isActive === false ? true : false;
      await updateProduct({ id: prod.id, isActive: newActive }).unwrap();
      refetchProd();
      triggerNotice(`Product "${prod.title}" ${newActive ? 'Resumed (Active)' : 'Paused (Hidden from shop)'}`);
    } catch {
      triggerNotice('Failed to update product status', true);
    }
  };

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
    { id: 'analytics', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package, badge: orders.length },
    { id: 'products', label: 'Products', icon: Sparkles, badge: products.length },
    { id: 'admins', label: 'Partners', icon: Building, badge: admins.length },
    { id: 'users', label: 'Customers', icon: UserCheck, badge: users.length },
    { id: 'payouts', label: 'Payout Requests', icon: IndianRupee, badge: payouts.filter(p => p.status === 'pending').length || null, badgeColor: 'bg-amber-500' },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-300 text-sm font-medium">Loading Super Admin Dashboard...</p>
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
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Super Admin</p>
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
              Menu
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
              <span>View Website / Shop</span>
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
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">{user?.name || 'Superadmin'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@reviewexpress.in'}</p>
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
                {activeTab === 'analytics' && 'Overview & Analytics'}
                {activeTab === 'orders' && 'Orders & Courier Tracking'}
                {activeTab === 'products' && 'Product Catalog'}
                {activeTab === 'admins' && 'Partners & Affiliates'}
                {activeTab === 'users' && 'Customers Directory'}
                {activeTab === 'payouts' && 'Partner Payout Requests'}
                {activeTab === 'settings' && 'Payment & Tax Settings'}
                {activeTab === 'profile' && 'Profile & Security'}
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
                triggerNotice('Data refreshed successfully!');
              }}
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
                    features: '',
                    isActive: true,
                    displayOrder: products.length + 1
                  });
                  setProductModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Product</span>
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
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      ₹
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">₹{analytics.totalRevenue}</div>
                  <p className="text-[11px] text-slate-500 font-medium">{analytics.paidOrdersCount} successful paid orders</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total GST Collected</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      %
                    </div>
                  </div>
                  <div className="text-3xl font-black text-blue-700">₹{analytics.totalGstCollected}</div>
                  <p className="text-[11px] text-slate-500 font-medium">18% GST collected on orders</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Partner Commissions</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-amber-700">₹{analytics.totalAdminCommissions}</div>
                  <p className="text-[11px] text-slate-500 font-medium">Total partner commissions earned</p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Platform Earnings</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-purple-700">₹{analytics.netPlatformProfit}</div>
                  <p className="text-[11px] text-slate-500 font-medium">Net profit after GST &amp; commissions</p>
                </div>
              </div>

              {/* Stakeholders summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div
                  onClick={() => setActiveTab('admins')}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Registered Partners</span>
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
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Customers</span>
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
                    <span className="text-xs font-bold text-slate-400 uppercase">Products in Store</span>
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
                    <h3 className="font-bold text-slate-900 text-sm">Recent Orders</h3>
                    <p className="text-xs text-slate-400">Latest customer purchases</p>
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
                        <th className="py-2.5 px-3">Customer &amp; Business</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Payment Status</th>
                        <th className="py-2.5 px-3">Delivery Status</th>
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
                      <th className="py-3 px-4">Customer &amp; Custom Name</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Delivery Status</th>
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
                                Custom Name: &ldquo;{order.businessName}&rdquo;
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
            <div className="space-y-5">
              {/* Product Search, Filter & Sort Toolbar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  {/* Search input with Debounce */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products by title, subtitle, badge, slug..."
                      className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all"
                    />
                    {productSearch && (
                      <button
                        onClick={() => setProductSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Right side: Sort Dropdown & Add Button */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px] font-bold text-slate-600">Sort:</span>
                      <select
                        value={productSortBy}
                        onChange={(e) => setProductSortBy(e.target.value)}
                        className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                      >
                        <option value="displayOrder">Display Order (Storefront)</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating">Customer Rating</option>
                        <option value="stock">Stock Available</option>
                      </select>
                    </div>

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
                          features: '',
                          isActive: true,
                          displayOrder: products.length + 1
                        });
                        setProductModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>

                {/* Filter Badges / Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
                  {[
                    { id: 'all', label: 'All Products', count: products.length },
                    { id: 'active', label: 'Active in Store', count: products.filter(p => p.isActive !== false).length },
                    { id: 'paused', label: 'Paused / Hidden', count: products.filter(p => p.isActive === false).length },
                    { id: 'low_stock', label: 'Low Stock (<20)', count: products.filter(p => (p.stock || 0) < 20).length },
                  ].map(filter => {
                    const isSelected = productStatusFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setProductStatusFilter(filter.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>{filter.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {filter.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notice banner for ordering */}
              {productSortBy === 'displayOrder' && !debouncedProductSearch.trim() && productStatusFilter === 'all' && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 shadow-2xs">
                  <Globe className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>
                    <strong>Public Store Display Order (पब्लिक व्ह्यू क्रमवारी):</strong> ग्राहकांना हार्डवेअर शॉप पेजवर कोणता प्रॉडक्ट कितव्या नंबरला दाखवायचा (No. 1, No. 2, No. 3...) ते खालील <strong>Public View Position</strong> ड्रॉपडाउन किंवा <strong>⬆️ ⬇️</strong> बटणाने लगेच बदलू शकता.
                  </span>
                </div>
              )}

              {/* Product Cards Grid */}
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-2">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">No products matched your criteria</h4>
                  <p className="text-xs text-slate-400">Try adjusting your search query or status filter.</p>
                  <button
                    onClick={() => { setProductSearch(''); setProductStatusFilter('all'); }}
                    className="mt-2 text-xs font-bold text-purple-600 hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((prod, idx) => {
                    const isPaused = prod.isActive === false;
                    return (
                      <div
                        key={prod.id}
                        className={`p-5 rounded-2xl bg-white border shadow-xs space-y-4 transition-all flex flex-col justify-between ${
                          isPaused
                            ? 'border-amber-200/80 bg-slate-50/40 opacity-90'
                            : 'border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Image & Badges */}
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
                                className={`w-full h-full object-cover transition-transform duration-300 ${isPaused ? 'grayscale-50' : ''}`}
                              />
                            )}

                            {/* Display Order Sequence Badge */}
                            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/95 text-white text-[11px] font-bold shadow-md flex items-center gap-1.5 backdrop-blur-xs border border-white/10">
                              <Globe className="w-3 h-3 text-purple-400" />
                              <span>Public View: <strong className="text-amber-300 font-black">No. {prod.displayOrder || (idx + 1)}</strong></span>
                            </span>

                            {/* Active / Paused Badge */}
                            <span className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1 ${
                              isPaused
                                ? 'bg-amber-500 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}>
                              {isPaused ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                              {isPaused ? 'Paused' : 'Active'}
                            </span>

                            {prod.badge && (
                              <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-purple-600/95 text-white text-[10px] font-bold shadow-xs">
                                {prod.badge}
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{prod.title}</h4>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{prod.subtitle || prod.description}</p>
                          </div>

                          {/* Price & Stock */}
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-slate-900">₹{prod.price}</span>
                            {prod.originalPrice > prod.price && (
                              <span className="text-xs text-slate-400 line-through">₹{prod.originalPrice}</span>
                            )}
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ml-auto ${
                              (prod.stock || 0) < 20
                                ? 'text-rose-700 bg-rose-50 border border-rose-200'
                                : 'text-emerald-700 bg-emerald-50'
                            }`}>
                              Stock: {prod.stock || 100} units
                            </span>
                          </div>
                        </div>

                        {/* Order Reordering & Controls */}
                        <div className="space-y-2.5 pt-3 border-t border-slate-100">
                          {/* Dedicated Public View Position Selector */}
                          <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-purple-700" />
                                <span className="text-xs font-black text-slate-800">Public View Position:</span>
                              </div>
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                No. {prod.displayOrder || (idx + 1)} on Store
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">दिसणार:</span>
                              <select
                                value={prod.displayOrder || (idx + 1)}
                                onChange={(e) => handleSetProductPosition(prod.id, e.target.value)}
                                disabled={isReorderingProducts}
                                className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-purple-300 text-xs font-bold text-slate-900 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer"
                              >
                                {products.map((_, i) => (
                                  <option key={i + 1} value={i + 1}>
                                    No. {i + 1} {i === 0 ? '🏆 (1st - Top on Shop & Home)' : i === 1 ? '(2nd on Shop)' : i === 2 ? '(3rd on Shop)' : `(${i + 1}th on Shop)`}
                                  </option>
                                ))}
                              </select>

                              {/* Quick Up/Down nudgers */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleMoveProductOrder(prod.id, 'up')}
                                  disabled={idx === 0 || isReorderingProducts}
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-purple-100 text-slate-700 hover:text-purple-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                  title="Move up 1 position in public view"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveProductOrder(prod.id, 'down')}
                                  disabled={idx === filteredProducts.length - 1 || isReorderingProducts}
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-purple-100 text-slate-700 hover:text-purple-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                  title="Move down 1 position in public view"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Pause / Resume Button & Status */}
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <span className="text-[11px] font-bold text-slate-500">
                              Status: <span className={isPaused ? 'text-amber-600 font-black' : 'text-emerald-600 font-black'}>{isPaused ? 'Paused (Hidden)' : 'Active (Live)'}</span>
                            </span>
                            <button
                              onClick={() => handleToggleProductStatus(prod)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                isPaused
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                              }`}
                              title={isPaused ? 'Resume selling in storefront' : 'Pause selling and hide from storefront'}
                            >
                              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                              <span>{isPaused ? 'Resume' : 'Pause'}</span>
                            </button>
                          </div>

                          {/* Edit & Delete Action Buttons */}
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
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
                                  features: prod.features || '',
                                  isActive: prod.isActive !== false,
                                  displayOrder: prod.displayOrder || idx + 1
                                });
                                setProductModalOpen(true);
                              }}
                              className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit SKU</span>
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: PARTNER ADMINS ================= */}
          {activeTab === 'admins' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Affiliate Partners</h3>
                    <p className="text-xs text-slate-400">Click any partner to view details, change commission %, or manage access.</p>
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

                {/* Debounced Search Input */}
                <div className="relative max-w-md pt-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search by partner name, organization, or referral code..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all"
                  />
                  {adminSearch && (
                    <button
                      onClick={() => setAdminSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Partner / Organization</th>
                      <th className="py-3 px-4">Referral Code</th>
                      <th className="py-3 px-4">Commission %</th>
                      <th className="py-3 px-4">Paid Orders</th>
                      <th className="py-3 px-4">Total Sales</th>
                      <th className="py-3 px-4">Commission Earned</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          {debouncedAdminSearch ? 'No partners matched your search query.' : 'No partner organizations registered yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredAdmins.map(adm => (
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
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Customer Directory</h3>
                    <p className="text-xs text-slate-400">All registered customer accounts and their orders.</p>
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

                {/* Debounced Search Input */}
                <div className="relative max-w-md pt-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by customer name, email, phone..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all"
                  />
                  {userSearch && (
                    <button
                      onClick={() => setUserSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Referred By</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4">Total Spent</th>
                      <th className="py-3 px-4">Joined On</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          {debouncedUserSearch ? 'No customer accounts matched your search query.' : 'No customer accounts found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(usr => (
                        <tr
                          key={usr.id}
                          onClick={() => router.push(`/superadmin/customers/${usr.id}`)}
                          className="hover:bg-purple-50/60 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                                {usr.name?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                              <p className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{usr.name}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-slate-800">{usr.email}</p>
                            <p className="text-[11px] text-slate-500">{usr.phone || '—'}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            {usr.referredBy ? (
                              <div className="space-y-0.5">
                                <p className="font-bold text-amber-800">{usr.referredBy.name}</p>
                                {usr.referredBy.referralCode && (
                                  <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
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
                            <Link
                              href={`/superadmin/customers/${usr.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Page</span>
                            </Link>
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
                <h3 className="font-bold text-slate-900 text-base">Partner Payout Requests</h3>
                <p className="text-xs text-slate-400">Review, approve, and record bank transfers or UPI payouts to partners.</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="py-3 px-4">Partner</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Bank / UPI Details</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">UTR / Ref #</th>
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
                      <h4 className="font-bold text-slate-900 text-sm">PayU Payment Gateway</h4>
                      <p className="text-[11px] text-slate-400">API credentials for PayU online payments</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PayU Environment Mode</label>
                    <select
                      value={siteSettings.payuMode || 'test'}
                      onChange={(e) => setSiteSettings({ ...siteSettings, payuMode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white"
                    >
                      <option value="test">Test Mode (test.payu.in)</option>
                      <option value="live">Live Mode (secure.payu.in)</option>
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
                      <h4 className="font-bold text-slate-900 text-sm">GST Tax Invoicing</h4>
                      <p className="text-[11px] text-slate-400">Automatic CGST &amp; SGST calculation on orders</p>
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
                      placeholder="e.g. 27AAECV8237P1Z5"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono uppercase focus:bg-white"
                    />
                  </div>
                </div>

                {/* Delivery & Shipping Rules */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Shipping &amp; Delivery Charges</h4>
                      <p className="text-[11px] text-slate-400">Free shipping rules and delivery charges</p>
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
                      <h4 className="font-bold text-slate-900 text-sm">Company &amp; Contact Information</h4>
                      <p className="text-[11px] text-slate-400">Details shown on tax invoices, website footer, and contact page</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company / Site Name</label>
                      <input
                        type="text"
                        value={siteSettings.siteName || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                        placeholder="e.g. Veagle Space Technology Pvt. Ltd."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Default Partner Commission (%)</label>
                      <input
                        type="number"
                        value={siteSettings.defaultCommissionPercent || 15}
                        onChange={(e) => setSiteSettings({ ...siteSettings, defaultCommissionPercent: parseFloat(e.target.value) })}
                        placeholder="15"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Official Registered Office Address</label>
                    <textarea
                      rows={2}
                      value={siteSettings.address || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                      placeholder="e.g. 'Kudale Patil Tower', Office No. 207, Vadgaon Budruk, Pune, Maharashtra 411041"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Support Phone</label>
                      <input
                        type="text"
                        value={siteSettings.supportPhone || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, supportPhone: e.target.value })}
                        placeholder="+91 8237999101"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
                      <input
                        type="email"
                        value={siteSettings.supportEmail || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                        placeholder="info@veaglespace.com"
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
                      placeholder="e.g. Simple • Fast • Convenient Google Review Hardware by Veagle Space Technology"
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

          {/* ================= TAB 8: SUPERADMIN PROFILE & SECURITY ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-5xl">
              {/* Profile Header Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-purple-600/20 flex items-center justify-center">
                    <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center text-white font-black text-2xl">
                      {user?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{user?.name || 'Superadmin'}</h3>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                        Administrator
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'admin@reviewexpress.in'}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                      <span>Role: <strong className="text-slate-700">SUPERADMIN</strong></span>
                      <span>•</span>
                      <span>Account ID: <strong className="text-slate-700">#{user?.id}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active &amp; Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Super Admin Access
                  </span>
                </div>
              </div>

              {/* Profile & Security Edit Form */}
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Contact Details */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <UserCheck className="w-5 h-5 text-purple-600" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Personal Information</h4>
                        <p className="text-[11px] text-slate-400">Manage your name and administrator contact</p>
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
                          placeholder="e.g. Abhijeet Ambhore"
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
                          Email Address
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
                          Administrator email address cannot be changed directly.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Assigned Role
                        </label>
                        <input
                          type="text"
                          readOnly
                          disabled
                          value="SUPERADMIN"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-purple-700 text-xs font-bold cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security & Password Management */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Lock className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Change Password</h4>
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
                            placeholder="Enter your current password"
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
                            placeholder="Enter new strong password (min 6 chars)"
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
                          placeholder="Re-type new password to confirm"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-purple-500 focus:outline-hidden transition-all"
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <p className="text-[11px] font-bold text-slate-700">Password Requirements:</p>
                        <ul className="text-[10px] text-slate-500 list-disc list-inside space-y-0.5">
                          <li>Minimum 6 characters in length</li>
                          <li>Must match the confirmation password exactly</li>
                          <li>Current password required for cryptographic verification</li>
                        </ul>
                      </div>
                    </div>
                  </div>
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
                    <span>{isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
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
                <span>{editingProduct ? 'Edit Product' : 'Add New Product'}</span>
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

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Public View Position (कित्यव्या नंबरवर दिसेल?) *</span>
                    <span className="text-[10px] text-purple-700 font-bold">1 = सर्वात वर</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={products.length + 5}
                    value={productForm.displayOrder ?? 1}
                    onChange={(e) => setProductForm({ ...productForm, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-black focus:bg-white focus:border-purple-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">पब्लिक शॉप पेज आणि होमपेजवर कितव्या नंबरला दिसेल ते नंबर टाका (उदा. 1, 2, 3...)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Visibility Status</label>
                  <select
                    value={productForm.isActive ? 'active' : 'paused'}
                    onChange={(e) => setProductForm({ ...productForm, isActive: e.target.value === 'active' })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:bg-white"
                  >
                    <option value="active">Active (Visible in Store)</option>
                    <option value="paused">Paused (Hidden from Store)</option>
                  </select>
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Commission Percentage (%) for {editingAdmin.orgName || editingAdmin.name}
                </label>
                
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={adminCommissionInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        setAdminCommissionInput(val);
                      }
                    }}
                    placeholder="Enter commission rate (e.g. 15, 20)"
                    autoFocus
                    className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-50 border-2 border-purple-200 text-slate-900 text-xl font-black focus:bg-white focus:border-purple-600 focus:outline-none transition-all shadow-inner"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 font-black text-lg">%</span>
                </div>

                {/* Quick Select Buttons */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick:</span>
                  {[5, 10, 15, 20, 25, 30].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setAdminCommissionInput(pct.toString())}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        Number(adminCommissionInput) === pct
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500 mt-2">
                  This partner will earn <strong>{adminCommissionInput || 0}%</strong> on every referred customer order.
                </p>
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
