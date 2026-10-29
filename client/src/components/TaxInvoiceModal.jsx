'use client';

import { useState } from 'react';
import { X, Printer, Download, ShieldCheck, Loader2, Check } from 'lucide-react';
import ReviewXpressLogo from '@/components/ReviewXpressLogo';

export default function TaxInvoiceModal({ order, settings, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!order) return null;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      // Dynamically load html2pdf if not already in document
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = () => {
            const fallbackScript = document.createElement('script');
            fallbackScript.src = 'https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';
            fallbackScript.onload = resolve;
            fallbackScript.onerror = reject;
            document.head.appendChild(fallbackScript);
          };
          document.head.appendChild(script);
        });
      }

      const element = document.getElementById('invoice-printable');
      const opt = {
        margin: [6, 6, 6, 6],
        filename: `Tax-Invoice-${order.orderNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await window.html2pdf().from(element).set(opt).save();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.warn('Direct PDF download fallback to clean print window:', err);
      handlePrint();
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-printable');
    if (!printContent) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tax Invoice - ${order.orderNumber}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background: white;
                color: #111;
                margin: 0;
                padding: 24px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.focus();
                window.print();
                setTimeout(() => window.close(), 1200);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const gstPercent = order.gstPercent || 18.0;
  const halfGst = (gstPercent / 2).toFixed(1);
  const cgstAmount = ((order.gstAmount || 0) / 2).toFixed(2);
  const sgstAmount = ((order.gstAmount || 0) / 2).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col">
        {/* Top Control Bar (Sticky & Always Visible at top of modal) */}
        <div className="sticky top-0 z-30 bg-slate-100/95 backdrop-blur-md px-6 py-3.5 border-b flex items-center justify-between no-print shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>OFFICIAL GST TAX INVOICE (ORIGINAL FOR RECIPIENT)</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Direct PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all disabled:opacity-75"
              title="Download Tax-Invoice.pdf file directly to your PC/Phone"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div id="invoice-printable" className="p-8 space-y-6 text-xs text-gray-800">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div>
              <div className="mb-2">
                <ReviewXpressLogo size="default" />
              </div>
              <p className="text-gray-600 font-medium">Smart NFC &amp; QR Review Systems</p>
              <p className="text-gray-500 mt-1 max-w-xs">{settings?.address || 'Tech Hub Towers, Pune, Maharashtra'}</p>
              <p className="text-gray-700 mt-1">
                <strong>GSTIN:</strong> {settings?.gstNumber || '27AABCR1234F1Z8'}
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong> {settings?.supportEmail || 'support@reviewexpress.in'}
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded border">
                TAX INVOICE
              </span>
              <p className="font-mono text-sm font-bold text-gray-900 pt-1">
                Inv No: {order.orderNumber}
              </p>
              <p className="text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              <p className="text-gray-500">Place of Supply: Maharashtra (27)</p>
            </div>
          </div>

          {/* Billed To */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">BILLED TO (CUSTOMER):</p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{order.customerName}</p>
              {order.businessName && (
                <p className="text-emerald-700 font-semibold">{order.businessName}</p>
              )}
              <p className="text-gray-600">{order.addressLine}, {order.city}, {order.state} - {order.pincode}</p>
              <p className="text-gray-600">Phone: {order.customerPhone}</p>
              <p className="text-gray-600">Email: {order.customerEmail}</p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-500 uppercase">PAYMENT &amp; SHIPPING:</p>
              <p className="text-gray-700 mt-0.5">Mode: <span className="font-semibold">{order.paymentMethod}</span></p>
              <p className="text-gray-700">Txn Ref: <span className="font-mono">{order.payuTxnId || 'N/A'}</span></p>
              <p className="text-gray-700">Courier: <span className="font-semibold">{order.courierName || 'Delhivery Express'}</span></p>
              {order.trackingId && (
                <p className="text-gray-700 font-mono">AWB: {order.trackingId}</p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-[11px] font-bold uppercase">
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">HSN</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Rate</th>
                <th className="py-2.5 px-3 text-right">Taxable Amt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items && order.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 px-3">
                    <p className="font-bold text-gray-900">{item.title}</p>
                    {order.businessName && (
                      <p className="text-[10px] text-gray-500">Custom laser engraved &amp; encoded</p>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-600">{settings?.hsnCode || '852352'}</td>
                  <td className="py-3 px-3 text-center font-bold">{item.quantity}</td>
                  <td className="py-3 px-3 text-right">₹{item.price}</td>
                  <td className="py-3 px-3 text-right font-bold">₹{item.total || item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tax Breakdown */}
          <div className="border-t pt-4 flex justify-between items-start">
            <div className="text-[11px] text-gray-500 space-y-1 max-w-xs">
              <p className="font-bold text-gray-700">Terms &amp; Declarations:</p>
              <p>1. We declare that this invoice shows actual price of the goods described.</p>
              <p>2. Electronic chip products carry a 1-year replacement warranty.</p>
            </div>

            <div className="w-64 space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal (Taxable):</span>
                <span className="font-semibold text-gray-900">₹{order.subtotal?.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-semibold">-₹{order.discountAmount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>CGST ({halfGst}%):</span>
                <span>₹{cgstAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST ({halfGst}%):</span>
                <span>₹{sgstAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              <div className="pt-2 border-t flex justify-between text-sm font-black text-gray-900">
                <span>Total Invoice Value:</span>
                <span className="text-base text-emerald-700">₹{order.finalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signoff */}
          <div className="pt-6 border-t flex justify-between items-end text-center">
            <div className="text-left text-[10px] text-gray-500">
              <p>This is a computer-generated tax invoice.</p>
            </div>
            <div className="space-y-2 text-right">
              <p className="text-[10px] text-gray-500">For Review Express</p>
              <div className="h-8" />
              <p className="font-bold text-gray-900 border-t pt-1">Authorized Signatory</p>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar for instant one-click download */}
        <div className="bg-slate-50 px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <p className="text-[11px] text-slate-500">Official GST 18% Compliant Tax Invoice</p>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-75"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Invoice</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-200"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
