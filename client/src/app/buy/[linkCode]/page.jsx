'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResolveProductLinkQuery } from '@/redux/api/apiSlice';
import {
  ShoppingCart,
  Star,
  CheckCircle2,
  Shield,
  Truck,
  Building2,
  Phone,
  ChevronRight,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Award,
  Package
} from 'lucide-react';
import Link from 'next/link';

export default function BuyPage({ params }) {
  const { linkCode } = use(params);
  const router = useRouter();

  const { data, isLoading, isError, error } = useResolveProductLinkQuery(linkCode);
  const [imgError, setImgError] = useState(false);

  // Store linkCode + linkId in sessionStorage so checkout can read it
  useEffect(() => {
    if (data?.success) {
      sessionStorage.setItem('partnerLinkCode', linkCode);
      sessionStorage.setItem('partnerLinkId', data.linkId);
      sessionStorage.setItem('partnerAdminId', data.partner.id);
      sessionStorage.setItem('partnerReferralCode', data.partner.referralCode || '');
    }
  }, [data, linkCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-300 text-sm">Loading product...</p>
      </div>
    );
  }

  if (isError) {
    const msg = error?.data?.error || 'Invalid or expired referral link.';
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">Link Not Found</h1>
          <p className="text-slate-400 text-sm max-w-sm">{msg}</p>
        </div>
        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm underline">
          Go to Homepage
        </Link>
      </div>
    );
  }

  const { product, partner } = data;
  let features = [];
  let specs = [];
  try { features = JSON.parse(product.features || '[]'); } catch {}
  try { specs = JSON.parse(product.specs || '[]'); } catch {}

  const handleBuyNow = () => {
    // Redirect to checkout with product slug
    router.push(`/checkout?product=${product.slug}&ref=${linkCode}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Partner branding bar */}
      <div className="bg-[#090d16] text-white px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
              {(partner.orgName || partner.name).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-slate-400">Exclusive offer from</p>
              <p className="text-sm font-semibold">{partner.orgName || partner.name}</p>
            </div>
          </div>
          {partner.phone && (
            <a
              href={`tel:${partner.phone}`}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
            >
              <Phone className="w-3.5 h-3.5" />
              {partner.phone}
            </a>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT: Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              {product.image && !imgError ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Package className="w-24 h-24 text-slate-300" />
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: 'Secure Payment', color: 'text-blue-500' },
                { icon: Truck, label: 'Fast Delivery', color: 'text-green-500' },
                { icon: Award, label: 'Premium Quality', color: 'text-purple-500' }
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center gap-1.5 text-center">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-xs text-slate-600 font-medium leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Product details */}
          <div className="space-y-5">
            {/* Badge */}
            {product.badge && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-100 text-purple-700">
                <Zap className="w-3 h-3" />
                {product.badge}
              </span>
            )}

            {/* Title */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">{product.title}</h1>
              {product.subtitle && (
                <p className="text-slate-500 mt-1.5 text-sm">{product.subtitle}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i <= Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600 font-medium">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviewsCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-slate-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-lg">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Key Features</p>
                <ul className="space-y-1.5">
                  {features.slice(0, 5).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-base transition-all shadow-lg shadow-purple-200"
              >
                <ShoppingCart className="w-5 h-5" />
                Buy Now — ₹{product.price.toLocaleString('en-IN')}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-slate-400">
                GST & shipping calculated at checkout
              </p>
            </div>

            {/* Specs */}
            {specs.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Specifications</p>
                <div className="divide-y divide-slate-100">
                  {specs.map((s, i) => (
                    <div key={i} className="flex justify-between py-2 text-xs">
                      <span className="text-slate-500 font-medium">{s.key || s.label || s.name}</span>
                      <span className="text-slate-800 font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="border-t border-slate-200 py-6 mt-8">
        <p className="text-center text-xs text-slate-400">
          This exclusive link was shared by <strong>{partner.orgName || partner.name}</strong>. 
          Your purchase supports them directly.
        </p>
      </div>
    </div>
  );
}

