'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { addToCart, setReferralCode, setPartnerInfo } from '@/redux/slice/cartSlice';
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

// Safe parsers for specifications & features
function parseSpecs(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) {
      return parsed.map((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          const key = item.key || item.label || item.name || Object.keys(item)[0] || `Spec #${idx + 1}`;
          const value = item.value || Object.values(item)[0] || '';
          return { key, value };
        }
        return { key: `Spec #${idx + 1}`, value: String(item) };
      });
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.entries(parsed).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }));
    }
    return [];
  } catch {
    return [];
  }
}

function parseFeatures(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return parsed.map(String);
    if (typeof parsed === 'object' && parsed !== null) return Object.values(parsed).map(String);
    return [String(parsed)];
  } catch {
    return [];
  }
}

export default function BuyPage(props) {
  const routeParams = useParams();
  const linkCode = routeParams?.linkCode || props?.params?.linkCode;
  const router = useRouter();
  const dispatch = useDispatch();

  const { data, isLoading, isError, error } = useResolveProductLinkQuery(linkCode, { skip: !linkCode });
  const [imgError, setImgError] = useState(false);
  const [buying, setBuying] = useState(false);

  // Store partner information in Redux, sessionStorage, localStorage and cookie
  useEffect(() => {
    if (data?.success && data?.partner) {
      const partnerPayload = {
        linkCode,
        partnerId: data.partner.id,
        orgName: data.partner.orgName || data.partner.name,
        name: data.partner.name,
        referralCode: data.partner.referralCode || '',
        phone: data.partner.phone || '',
        productSlug: data.product.slug,
        productTitle: data.product.title
      };

      dispatch(setPartnerInfo(partnerPayload));
      if (data.partner.referralCode) {
        dispatch(setReferralCode(data.partner.referralCode));
      }

      sessionStorage.setItem('partnerLinkCode', linkCode);
      sessionStorage.setItem('partnerLinkId', data.linkId);
      sessionStorage.setItem('partnerAdminId', data.partner.id);
      sessionStorage.setItem('partnerReferralCode', data.partner.referralCode || '');
      sessionStorage.setItem('partnerOrgName', data.partner.orgName || data.partner.name);
    }
  }, [data, linkCode, dispatch]);

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
  const features = parseFeatures(product.features);
  const specs = parseSpecs(product.specs);

  const handleBuyNow = () => {
    setBuying(true);

    // 1. Dispatch addToCart to add this exact product into the user's cart
    dispatch(addToCart({
      product,
      quantity: 1,
      customization: {
        partnerLinkCode: linkCode,
        referralCode: partner.referralCode || ''
      }
    }));

    // 2. Dispatch referral attribution
    if (partner.referralCode) {
      dispatch(setReferralCode(partner.referralCode));
    }
    dispatch(setPartnerInfo({
      linkCode,
      partnerId: partner.id,
      orgName: partner.orgName || partner.name,
      name: partner.name,
      referralCode: partner.referralCode || '',
      phone: partner.phone || '',
      productSlug: product.slug,
      productTitle: product.title
    }));

    // 3. Immediately redirect to checkout with cart loaded
    router.push(`/checkout?ref=${encodeURIComponent(linkCode)}`);
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
                disabled={buying}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-base transition-all shadow-lg shadow-purple-600/30 disabled:opacity-70 cursor-pointer"
              >
                {buying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Proceeding to Checkout...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Order Now — ₹{product.price.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  100% Secure Checkout
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  Free Express Delivery
                </span>
                <span>•</span>
                <span className="text-purple-600 font-bold">
                  Official Partner Store
                </span>
              </div>
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

