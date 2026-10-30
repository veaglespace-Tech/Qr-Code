'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '@/redux/slice/cartSlice';
import { useCreateOrderMutation } from '@/redux/api/apiSlice';
import {
  CreditCard,
  Lock,
  ArrowRight,
  Building,
  Smartphone,
  AlertCircle,
  ShieldCheck,
  Truck
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  const { items, referralCode } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const { data: settings } = useSelector(state => state.settings);

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    businessName: items[0]?.businessName || '',
    googleReviewLink: items[0]?.googleReviewLink || '',
    address: '',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411004'
  });

  const [paymentMode, setPaymentMode] = useState('payu');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gstPercent = (settings && settings.gstEnabled) ? (settings.gstPercent || 18) : 0;
  const gstAmount = Number(((subtotal * gstPercent) / 100).toFixed(2));
  const freeShippingAbove = settings?.freeShippingAbove || 999;
  const shippingFee = subtotal >= freeShippingAbove || items.length === 0 ? 0 : (settings?.standardShippingFee || 60);

  const hasReferral = Boolean(referralCode && referralCode.trim());
  const discountAmount = hasReferral ? Number((subtotal * 0.05).toFixed(2)) : 0;
  const finalAmount = Number((subtotal + gstAmount + shippingFee - discountAmount).toFixed(2));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (minimum 2 characters).';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone.slice(-10))) {
      newErrors.phone = 'Mobile number should start with 6, 7, 8, or 9.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address for your official tax invoice.';
    }

    if (!formData.address.trim() || formData.address.trim().length < 6) {
      newErrors.address = 'Please enter your complete street address / shop location.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Please enter your city.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Please enter your state.';
    }

    const pin = formData.pincode.replace(/\D/g, '');
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      newErrors.pincode = 'Please enter a valid 6-digit Indian PIN code.';
    }

    if (formData.googleReviewLink && formData.googleReviewLink.trim()) {
      const link = formData.googleReviewLink.trim();
      if (!/^https?:\/\//i.test(link) && !link.includes('g.page') && !link.includes('goo.gl')) {
        newErrors.googleReviewLink = 'Please enter a valid URL (e.g. https://g.page/r/... or https://maps.app.goo.gl/...).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorMsg('Please correct the highlighted errors in your order form.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const isCOD = paymentMode === 'cod';
      const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);

      const payload = {
        items,
        customerDetails: {
          ...formData,
          phone: cleanPhone
        },
        referralCode: referralCode || '',
        partnerLinkCode: (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('partnerLinkCode') : '') || '',
        paymentMethod: isCOD ? 'cod' : 'payu'
      };

      const res = await createOrder(payload).unwrap();

      if (res.success) {
        dispatch(clearCart());

        if (isCOD) {
          router.push(`/checkout/success?orderId=${res.order.id}`);
        } else {
          const payu = res.payuPayload;
          if (!payu || !payu.actionUrl) {
            router.push(`/checkout/success?orderId=${res.order.id}`);
            return;
          }

          const form = document.createElement('form');
          form.method = 'POST';
          form.action = payu.actionUrl;

          for (const key in payu) {
            if (key !== 'actionUrl' && payu[key] !== undefined && payu[key] !== null) {
              const hiddenField = document.createElement('input');
              hiddenField.type = 'hidden';
              hiddenField.name = key;
              hiddenField.value = payu[key];
              form.appendChild(hiddenField);
            }
          }

          document.body.appendChild(form);
          form.submit();
        }
      }
    } catch (err) {
      setErrorMsg(err?.data?.error || err?.message || 'Failed to place order. Please check details and try again.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Add Review Express stands or cards before checking out.</p>
        <button
          onClick={() => router.push('/shop')}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md shadow-brand-500/25"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Secured Official Checkout</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout &amp; Delivery Details</h1>
        <p className="text-xs text-slate-500">
          Enter your delivery destination and stand customization details. GST tax invoice generated instantly.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact Details Card */}
          <div className="glass-panel bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" /> 1. Customer Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Amit Sharma"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                    errors.name
                      ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                      : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (10 Digits) *</label>
                <input
                  type="tel"
                  name="phone"
                  maxLength={13}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                    errors.phone
                      ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                      : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (For Tax Invoice &amp; Tracking) *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="amit@cafeoasis.in"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                    errors.email
                      ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                      : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
                  }`}
                />
                {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Stand Customization Card */}
          <div className="glass-panel bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" /> 2. Laser Printing &amp; NFC Encoding
              </h3>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Free Complimentary Customization
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Store Name on Stand:
                </label>
                <input
                  type="text"
                  name="businessName"
                  maxLength={50}
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Cafe Oasis - FC Road Pune"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Laser engraved directly onto acrylic base. Leave empty if you want a blank universal stand.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Maps Review URL / Short Link:
                </label>
                <input
                  type="text"
                  name="googleReviewLink"
                  value={formData.googleReviewLink}
                  onChange={handleChange}
                  placeholder="https://g.page/r/your-shop/review"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                    errors.googleReviewLink
                      ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                      : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
                  }`}
                />
                {errors.googleReviewLink ? (
                  <p className="text-[11px] text-red-600 mt-1">{errors.googleReviewLink}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Pre-programmed into NFC chip and generated on QR code. (You can also update this later after receiving the hardware).
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="glass-panel bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" /> 3. Shipping Delivery Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address / Shop Location *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Shop No. 12, Ground Floor, Near Main Market"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                    errors.address
                      ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                      : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
                  }`}
                />
                {errors.address && <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                    errors.city
                      ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                      : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
                  }`}
                />
                {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                    errors.state
                      ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                      : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
                  }`}
                />
                {errors.state && <p className="text-[11px] text-red-600 mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code (6 Digits) *</label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="411004"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:outline-none transition-colors ${
                    errors.pincode
                      ? 'bg-red-50/40 border-red-400 focus:border-red-500'
                      : 'bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white'
                  }`}
                />
                {errors.pincode && <p className="text-[11px] text-red-600 mt-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Method Selector Card */}
          <div className="glass-panel bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Select Payment Method
            </h3>

            <div className="space-y-3">
              {/* Option 1: PayU Payment Gateway */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMode === 'payu'
                    ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  value="payu"
                  checked={paymentMode === 'payu'}
                  onChange={() => setPaymentMode('payu')}
                  className="mt-1 accent-emerald-600"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Online Payment via PayU</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Instant UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards (Visa, RuPay, Mastercard) &amp; NetBanking.
                  </p>
                </div>
              </label>

              {/* Option 2: Cash on Delivery */}
              <label
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMode === 'cod'
                    ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  value="cod"
                  checked={paymentMode === 'cod'}
                  onChange={() => setPaymentMode('cod')}
                  className="mt-1 accent-emerald-600"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Cash / Pay on Delivery (COD)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pay securely in cash or via mobile UPI QR scan upon courier delivery at your shop.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="glass-panel bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-slate-500 font-normal">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>

              {hasReferral && (
                <div className="flex justify-between text-emerald-700 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <span className="font-medium">Partner Referral Code ({referralCode}):</span>
                  <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>GST Tax ({gstPercent}%):</span>
                <span className="font-bold text-slate-900">₹{gstAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Express Courier Shipping:</span>
                <span className="font-bold text-emerald-700">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-2xl font-black text-brand-600">₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isCreatingOrder}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {loading || isCreatingOrder ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>{paymentMode === 'cod' ? 'Confirm Cash on Delivery Order' : `Pay ₹${finalAmount.toFixed(2)} Securely`}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted 256-bit SSL transaction</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
