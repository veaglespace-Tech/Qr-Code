'use client';

import { useState } from 'react';
import { useGetProductsQuery } from '@/redux/api/apiSlice';
import ProductCard from '@/components/ProductCard';
import { Search, Sparkles, ShieldCheck, Zap, Truck } from 'lucide-react';

export default function ShopPage() {
  const { data: productsData, isLoading: loading } = useGetProductsQuery();
  const products = productsData?.products || [];
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          p.description?.toLowerCase().includes(search.toLowerCase());
    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'stands') return matchesSearch && p.title.toLowerCase().includes('stand');
    if (selectedCategory === 'cards') return matchesSearch && p.title.toLowerCase().includes('card');
    if (selectedCategory === 'plates') return matchesSearch && p.title.toLowerCase().includes('plate');
    if (selectedCategory === 'stickers') return matchesSearch && p.title.toLowerCase().includes('sticker');
    return matchesSearch;
  });

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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rxgreen-500 shadow-xs"
            />
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
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
