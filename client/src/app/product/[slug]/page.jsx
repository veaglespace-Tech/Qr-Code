'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/slice/cartSlice';

import { useGetProductBySlugQuery } from '@/redux/api/apiSlice';
import QRCode from 'qrcode';
import {
  Star,
  CheckCircle2,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Wifi,
  ExternalLink
} from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { data: productData, isLoading: loading } = useGetProductBySlugQuery(slug, { skip: !slug });
  const product = productData?.product || null;

  const [quantity, setQuantity] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [googleReviewLink, setGoogleReviewLink] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [added, setAdded] = useState(false);

  // Update dynamic QR Code preview
  useEffect(() => {
    QRCode.toDataURL(googleReviewLink || 'https://google.com', {
      width: 140,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error(err));
  }, [googleReviewLink]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading ReviewXpress product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">The requested product could not be located.</p>
        <button
          onClick={() => router.push('/shop')}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const [customError, setCustomError] = useState('');

  const validateCustomization = () => {
    if (googleReviewLink.trim()) {
      const link = googleReviewLink.trim();
      if (!/^https?:\/\//i.test(link) && !link.includes('g.page') && !link.includes('goo.gl')) {
        setCustomError('Please enter a valid Google review link (must start with https:// or be a Google short link).');
        return false;
      }
    }
    setCustomError('');
    return true;
  };

  const handleAddToCart = () => {
    if (!validateCustomization()) return false;
    dispatch(addToCart({
      product,
      quantity,
      customization: {
        businessName: businessName.trim(),
        googleReviewLink: googleReviewLink.trim()
      }
    }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    return true;
  };

  const handleBuyNow = () => {
    if (handleAddToCart()) {
      router.push('/checkout');
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Product Image & Interactive Live Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-3xl overflow-hidden bg-white border border-slate-200 relative h-[420px] shadow-lg flex items-center justify-center">
            {product.image && (product.image.toLowerCase().endsWith('.pdf') || product.image.includes('.pdf')) ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-slate-100 p-8 text-center">
                <span className="text-6xl block mb-3">📄</span>
                <span className="text-sm font-black text-rose-700 uppercase tracking-wider">Official Product PDF Document</span>
                <p className="text-xs text-slate-500 max-w-sm mt-1">High-resolution vector design, technical specifications and stand layout.</p>
                <a
                  href={product.image}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
                >
                  <span>Open / View Full PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.image}
                alt={product.title}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80'; }}
                className="w-full h-full object-cover"
              />
            )}
            {product.badge && (
              <span className="absolute top-4 left-4 bg-brand-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                {product.badge}
              </span>
            )}
          </div>

          {/* Stand Customizer Card Preview */}
          <div className="glass-card bg-white rounded-2xl p-5 border border-emerald-300 shadow-sm flex items-center gap-5">
            <div className="w-24 h-24 bg-white rounded-xl p-1.5 flex-shrink-0 flex items-center justify-center border border-slate-300 shadow-inner">
              {qrCodeUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrCodeUrl} alt="Live QR Preview" className="w-full h-full object-contain" />
              )}
            </div>
            <div className="space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider flex items-center gap-1">
                <Wifi className="w-3 h-3 rotate-90" /> NFC Encoded &amp; Laser QR
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {businessName || 'Your Business Name'}
              </p>
              <p className="text-slate-500 line-clamp-1 font-mono text-[11px]">
                {googleReviewLink || 'https://g.page/r/your-shop/review'}
              </p>
              <p className="text-emerald-700 font-semibold text-[11px] pt-1">
                ✓ Free laser-engraving &amp; chip programming included
              </p>
            </div>
          </div>
        </div>

        {/* Right: Details & Order Box */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating}</span>
              <span className="text-xs text-slate-500">({product.reviewsCount} verified reviews)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {product.title}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-baseline gap-4">
            <span className="text-3xl font-black text-slate-900">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-slate-400 line-through">₹{product.originalPrice}</span>
            )}
            <span className="text-xs font-bold text-emerald-800 bg-emerald-200 px-2.5 py-1 rounded-lg">
              Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
            <span className="text-xs text-slate-500 ml-auto">+ 18% GST (Tax Invoice)</span>
          </div>

          {/* Customization Inputs Card */}
          <div className="glass-panel bg-white rounded-2xl p-5 border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Free NFC &amp; QR Customization Details:
              </h4>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Laser Engraved &amp; Encoded
              </span>
            </div>

            {customError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{customError}</span>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Business / Brand Name on Stand:
                </label>
                <span className="text-[10px] text-slate-400">{businessName.length}/45 chars</span>
              </div>
              <input
                type="text"
                maxLength={45}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Cafe Oasis - FC Road"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Google Maps Review Link:
                </label>
                {googleReviewLink && (/^https?:\/\//i.test(googleReviewLink) || googleReviewLink.includes('g.page') || googleReviewLink.includes('goo.gl')) && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    ✓ Valid Link Verified
                  </span>
                )}
              </div>
              <input
                type="text"
                value={googleReviewLink}
                onChange={(e) => {
                  setGoogleReviewLink(e.target.value);
                  if (customError) setCustomError('');
                }}
                placeholder="https://g.page/r/your-shop/review"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                  customError
                    ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                    : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
                }`}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Tip: Search your business on Google Maps &rarr; click &ldquo;Ask for reviews&rdquo; &rarr; copy short link.
              </p>
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-slate-700 hover:bg-slate-100 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-1.5 text-slate-700 hover:bg-slate-100 font-bold"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-500 font-medium">Total: ₹{product.price * quantity}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`py-3.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800 shadow-sm'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{added ? 'Added to Cart ✓' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white text-sm font-bold shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Express Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>


          {/* Features checkmarks */}
          {product.features && product.features.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                Product Features:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {product.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specs table */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                Technical Specifications:
              </h4>
              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs bg-white">
                {Object.entries(product.specs).map(([k, v], idx) => (
                  <div key={k} className={`flex justify-between p-2.5 ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                    <span className="text-slate-500">{k}</span>
                    <span className="font-bold text-slate-900">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping highlight */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-[11px] text-slate-600">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <Truck className="w-4 h-4 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-900">Dispatched in 24h</p>
              <p>Blue Dart / Delhivery</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-900">1 Year Warranty</p>
              <p>Chip replacement</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <RotateCcw className="w-4 h-4 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-900">Lifetime Validity</p>
              <p>No subscriptions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
