'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { useGetOrderByIdQuery } from '@/redux/api/apiSlice';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, Sparkles, Truck, Printer } from 'lucide-react';
import TaxInvoiceModal from '@/components/TaxInvoiceModal';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { data: orderData } = useGetOrderByIdQuery(orderId, { skip: !orderId });
  const { data: settings } = useSelector(state => state.settings);
  const order = orderData?.order || null;
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      {/* Celebration Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          {order?.paymentMethod?.includes('Cash') || order?.paymentMethod?.includes('COD')
            ? 'Cash on Delivery (COD) Registered'
            : 'Payment Confirmed via PayU'}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Congratulations! Your Review Express Order is Confirmed
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Thank you for choosing Review Express. Our technical team is now laser-printing and encoding your custom NFC stand.
        </p>
      </div>

      {order && (
        <div className="glass-panel bg-white rounded-2xl p-6 border border-slate-200 text-left space-y-4 max-w-md mx-auto shadow-sm">
          <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-100">
            <span className="text-slate-500">Order Number:</span>
            <span className="font-mono font-bold text-brand-600">{order.orderNumber}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Total Paid:</span>
            <span className="font-black text-slate-900 text-base">₹{order.finalAmount}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Customized For:</span>
            <span className="font-bold text-slate-900">{order.businessName || order.customerName}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Courier Partner:</span>
            <span className="font-bold text-brand-700">{order.courierName || 'Delhivery Express'}</span>
          </div>

          {order.trackingId && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Tracking AWB:</span>
              <span className="font-mono font-bold text-emerald-700">{order.trackingId}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="p-3.5 rounded-xl bg-purple-50/90 border border-purple-200 text-[11px] text-purple-950 flex flex-col gap-1.5 text-left">
              <div className="flex items-center gap-1.5 font-bold text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Customer Account Activated</span>
              </div>
              <p className="text-purple-800 leading-relaxed">
                Your account is ready for <strong>{order.customerEmail}</strong>. You can sign in anytime using your email/mobile and default password <code className="bg-purple-100 px-1.5 py-0.5 rounded text-purple-950 font-bold font-mono">ReviewXpress@123</code> (or use <strong>Forgot Password?</strong> anytime to set your own password).
              </p>
            </div>

            <button
              onClick={() => setShowInvoice(true)}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Official GST Tax Invoice (PDF)</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/user/orders"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order &amp; Courier Status</span>
        </Link>

        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Back to Home</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {showInvoice && order && (
        <TaxInvoiceModal
          order={order}
          settings={settings}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading order status...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
