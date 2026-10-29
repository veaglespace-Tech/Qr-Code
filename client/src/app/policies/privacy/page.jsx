export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-xs text-gray-300 leading-relaxed">
      <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
      <p className="text-gray-400">Last updated: February 2026</p>

      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
        <p>We collect essential order information including customer name, business details, Google Maps review link, delivery address, and payment confirmation status through PayU.</p>

        <h2 className="text-base font-bold text-white">2. Payment Security</h2>
        <p>All payments are processed securely via PayU India using 256-bit SHA512 hashing encryption. Review Express never stores your bank account, credit card, or UPI PIN credentials.</p>

        <h2 className="text-base font-bold text-white">3. Data Usage</h2>
        <p>Customer information is strictly utilized to program your NFC stand, print high-contrast QR codes, and ship via domestic express couriers.</p>
      </div>
    </div>
  );
}
