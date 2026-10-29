export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-xs text-gray-300 leading-relaxed">
      <h1 className="text-3xl font-black text-white">Shipping &amp; Delivery Policy</h1>
      <p className="text-gray-400">Last updated: February 2026</p>

      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white">1. Manufacturing &amp; Dispatch Timeline</h2>
        <p>Because each Review Express stand is individually laser-etched and programmed with your unique Google review URL, orders are manufactured and dispatched within 24 to 48 business hours.</p>

        <h2 className="text-base font-bold text-white">2. Courier Partners &amp; Real-time Tracking</h2>
        <p>All shipments are dispatched via leading express couriers such as Delhivery Express, Blue Dart, and DTDC. Customers receive an SMS/Email containing their live Airway Bill (AWB) number and direct tracking link.</p>

        <h2 className="text-base font-bold text-white">3. Free Shipping</h2>
        <p>Free standard courier shipping applies to all orders above ₹999 across all states and pin codes in India.</p>
      </div>
    </div>
  );
}
