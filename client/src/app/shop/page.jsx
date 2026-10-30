'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';

// ⚠️ Direct shop access is disabled.
// Customers must use a partner referral link (/buy/[linkCode]) to view & purchase products.
// Only SUPERADMIN and ADMIN can access /shop for inventory management.

export default function ShopPage() {
  const router = useRouter();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    // Allow admins and superadmins to view shop
    if (user?.role === 'SUPERADMIN' || user?.role === 'ADMIN') return;
    // Everyone else → redirect to homepage
    router.replace('/');
  }, [user, router]);

  if (user?.role === 'SUPERADMIN' || user?.role === 'ADMIN') {
    // Render minimal admin product view
    return <AdminShopView />;
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      <p className="text-slate-400 text-sm">Redirecting...</p>
    </div>
  );
}

// Simple admin-only shop view
import { useState, useMemo } from 'react';
import { useGetProductsQuery } from '@/redux/api/apiSlice';
import { useDebounce } from '@/hooks/useDebounce';
import ProductCard from '@/components/ProductCard';
import { Search, Sparkles, ShieldCheck, Zap, Truck, X } from 'lucide-react';

function AdminShopView() {
  const { data: productsData, isLoading: loading } = useGetProductsQuery();
  const products = productsData?.products || [];
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Only display active products in public shop
      if (p.isActive === false) return false;

      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch = !q ||
                            p.title?.toLowerCase().includes(q) ||
                            p.description?.toLowerCase().includes(q) ||
                            p.subtitle?.toLowerCase().includes(q);

      if (selectedCategory === 'all') return matchesSearch;
      if (selectedCategory === 'stands') return matchesSearch && p.title.toLowerCase().includes('stand');
      if (selectedCategory === 'cards') return matchesSearch && p.title.toLowerCase().includes('card');
      if (selectedCategory === 'plates') return matchesSearch && p.title.toLowerCase().includes('plate');
      if (selectedCategory === 'stickers') return matchesSearch && p.title.toLowerCase().includes('sticker');
      return matchesSearch;
    });
  }, [products, debouncedSearch, selectedCategory]);

  // Strictly sort by public displayOrder (1st, 2nd, 3rd, 4th...)
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.id - b.id;
    });
  }, [filteredProducts]);

  return (
    <div className="bg-ambient-pattern min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rxgreen-100 text-rxgreen-800 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-rxgreen-600" /> Direct Manufacturer Hardware
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">
            Smart NFC &amp; QR Review Hardware
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Laser-etched acrylic stands, executive PVC tap cards, and heavy-duty metal counter plates. Each item comes pre-programmed with your business review link and includes a downloadable GST tax invoice.
          </p>

          <div className="flex items-center gap-6 pt-2 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-rxblue-600" />
              Free Express Courier Across India
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-rxgreen-600" />
              18% GST Input Credit Included
            </span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'All Products' },
              { id: 'stands', label: 'Acrylic Stands' },
              { id: 'cards', label: 'Tap Cards' },
              { id: 'plates', label: 'Counter Plates' },
              { id: 'stickers', label: 'Window Stickers' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stand, card..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rxgreen-500 shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-rxgreen-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm font-semibold">Loading catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center space-y-3 border border-slate-200">
            <p className="text-base font-bold text-slate-800">No products match your search.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('all'); }}
              className="text-xs font-extrabold text-rxblue-600 hover:underline"
            >
              Clear filters and show all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
