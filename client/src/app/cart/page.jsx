'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart, setReferralCode } from '@/redux/slice/cartSlice';

import { Trash2, ArrowRight, ShoppingBag, Sparkles, ShieldCheck, Tag } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, referralCode, partnerInfo } = useSelector(state => state.cart);
  const { data: settings } = useSelector(state => state.settings);

  const activeRefCode = referralCode || partnerInfo?.referralCode || '';
  const [inputRefCode, setInputRefCode] = useState(activeRefCode);
  const [appliedMsg, setAppliedMsg] = useState(
    partnerInfo?.orgName
      ? `Partner offer active (${partnerInfo.orgName})!`
      : activeRefCode
      ? 'Partner code active!'
      : ''
  );

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gstPercent = (settings && settings.gstEnabled) ? (settings.gstPercent || 18) : 0;
  const gstAmount = Number(((subtotal * gstPercent) / 100).toFixed(2));
  const freeShippingAbove = settings?.freeShippingAbove || 999;
  const shippingFee = subtotal >= freeShippingAbove || items.length === 0 ? 0 : (settings?.standardShippingFee || 60);

  const hasReferral = Boolean((activeRefCode && activeRefCode.trim()) || partnerInfo?.linkCode);
  const discountAmount = hasReferral ? Number((subtotal * 0.05).toFixed(2)) : 0;
  const totalAmount = Number((subtotal + gstAmount + shippingFee - discountAmount).toFixed(2));

  const handleApplyReferral = (e) => {
    e.preventDefault();
    if (!inputRefCode.trim()) return;
    dispatch(setReferralCode(inputRefCode.trim().toUpperCase()));
    setAppliedMsg('Partner Referral applied! Extra 5% customer discount applied.');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
        {partnerInfo ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              You are shopping with partner <strong>{partnerInfo.orgName || partnerInfo.name}</strong>. Add the recommended custom NFC stand to activate your exclusive 5% discount!
            </p>
            {partnerInfo.linkCode && (
              <Link
                href={`/buy/${partnerInfo.linkCode}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-md shadow-purple-600/25"
              >
                <span>View Recommended Stand</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
              You haven&apos;t added any Review Express smart stands or NFC cards yet. Explore our hardware products to boost your business Google reviews.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-md shadow-brand-500/20"
            >
              <span>Browse Smart Stands</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(item => (
            <div
              key={item.id}
              className="glass-card bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                  <div className="text-xs text-brand-600 font-bold">₹{item.price} each</div>
                  {item.businessName && (
                    <div className="text-[11px] text-slate-500">
                      Engraved for: <span className="text-slate-900 font-semibold">{item.businessName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Controls & Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200">
                  <button
                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                    className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                    className="px-2.5 py-1 text-slate-700 hover:bg-slate-200 font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="text-sm font-black text-slate-900 min-w-[70px] text-right">
                  ₹{item.price * item.quantity}
                </div>

                <button
                  onClick={() => dispatch(removeFromCart(item.id))}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Partner Referral Box */}
          <div className="glass-panel bg-white rounded-2xl p-5 border border-slate-200 space-y-3 shadow-sm">
            {partnerInfo ? (
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                    {(partnerInfo.orgName || partnerInfo.name).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-black text-purple-950">
                      Partner Offer Active: {partnerInfo.orgName || partnerInfo.name}
                    </p>
                    <p className="text-[11px] text-purple-700 font-semibold">
                      5% Partner discount automatically applied to your cart!
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200 self-start sm:self-auto">
                  {partnerInfo.referralCode || partnerInfo.linkCode}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Partner / Affiliate Referral Code
                </div>
                <p className="text-xs text-slate-600">
                  Have a referral code from a partner or organization? Enter it below to unlock an extra 5% instant discount!
                </p>
                <form onSubmit={handleApplyReferral} className="flex gap-2">
                  <input
                    type="text"
                    value={inputRefCode}
                    onChange={(e) => setInputRefCode(e.target.value)}
                    placeholder="e.g. TECHHUB15"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs uppercase font-mono focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors"
                  >
                    Apply
                  </button>
                </form>
                {appliedMsg && (
                  <p className="text-xs text-emerald-700 font-bold">{appliedMsg}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 glass-panel bg-white rounded-2xl p-6 border border-slate-200 space-y-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
            </div>

            {hasReferral && (
              <div className="flex justify-between text-emerald-700">
                <span className="flex items-center gap-1 font-semibold">
                  <Tag className="w-3.5 h-3.5" /> Partner Discount (5%):
                </span>
                <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>GST ({gstPercent}%):</span>
              <span className="font-bold text-slate-900">₹{gstAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Delivery Charges:</span>
              <span className="font-bold text-slate-900">
                {shippingFee === 0 ? (
                  <span className="text-emerald-700 uppercase font-bold">Free</span>
                ) : (
                  `₹${shippingFee}`
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Payable:</span>
              <span className="text-xl font-black text-brand-600">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Tax Invoice with HSN Code</span>
            </div>
            <p>Download your GST invoice with input tax credit directly from your dashboard.</p>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-700 hover:to-emerald-600 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
