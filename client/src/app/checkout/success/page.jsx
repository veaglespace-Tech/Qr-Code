'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGetOrderByIdQuery } from '@/redux/api/apiSlice';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, Sparkles, Truck, Printer } from 'lucide-react';
import TaxInvoiceModal from '@/components/TaxInvoiceModal';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { data: orderData } = useGetOrderByIdQuery(orderId, { skip: !orderId });
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
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Payment Confirmed via PayU
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

          <div className="pt-2 border-t border-slate-100">
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
          settings={null}
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
