'use client';

import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/slice/cartSlice';

import { Star, ShoppingBag, ArrowRight, Zap, Check } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="glass-card bg-white rounded-3xl overflow-hidden flex flex-col group relative border border-slate-200/90 hover:border-rxgreen-400 transition-all duration-300 shadow-premium-card hover:shadow-premium-hover">
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide bg-slate-900 text-white shadow-md flex items-center gap-1.5 border border-slate-700/50">
          <Zap className="w-3 h-3 text-rxgreen-400 fill-rxgreen-400" />
          <span>{product.badge}</span>
        </div>
      )}

      {/* Image or PDF container */}
      <Link href={`/product/${product.slug}`} className="relative h-60 overflow-hidden bg-slate-50 block border-b border-slate-100">
        {product.image && (product.image.toLowerCase().endsWith('.pdf') || product.image.includes('.pdf')) ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-slate-100 p-4 text-center group-hover:scale-105 transition-transform duration-500">
            <span className="text-5xl block mb-2">📄</span>
            <span className="text-xs font-black text-rose-700 uppercase tracking-wider">PDF Specification / Stand</span>
            <span className="text-[11px] text-slate-500 font-medium mt-1">Tap to View Product Details</span>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgSrc}
            alt={product.title}
            onError={() => setImgSrc('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80')}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Rating */}
          <div className="flex items-center gap-2 text-xs text-amber-500">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-extrabold text-slate-800">{product.rating || '4.9'}</span>
            <span className="text-slate-400 text-[11px]">({product.reviewsCount || 100}+ reviews)</span>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-lg font-black text-slate-900 group-hover:text-rxblue-600 transition-colors line-clamp-2 font-heading">
              {product.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.subtitle || product.description}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-heading">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through font-semibold">₹{product.originalPrice}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {discountPercent > 0 && (
                <span className="text-[11px] font-black text-rxgreen-700 bg-rxgreen-100 px-2 py-0.5 rounded-full">
                  {discountPercent}% OFF
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-medium">+18% GST</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickAdd}
              className={`p-3 rounded-xl border transition-all ${
                added
                  ? 'bg-rxgreen-500 border-rxgreen-500 text-white shadow-md'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-900 hover:border-slate-900 hover:text-white'
              }`}
              title="Add to Cart"
            >
              {added ? <Check className="w-4 h-4 stroke-[3]" /> : <ShoppingBag className="w-4 h-4" />}
            </button>
            <Link
              href={`/product/${product.slug}`}
              className="px-4 py-3 rounded-xl btn-primary-rx text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
