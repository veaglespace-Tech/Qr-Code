'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { QrCode, Phone, Mail, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

import ReviewXpressLogo from '@/components/ReviewXpressLogo';

export default function Footer() {
  const pathname = usePathname();
  const { data: settings } = useSelector(state => state.settings);

  // Do not render marketing footer on dashboards (superadmin, admin, user)
  if (pathname?.startsWith('/superadmin') || pathname?.startsWith('/admin') || pathname?.startsWith('/user')) {
    return null;
  }


  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <ReviewXpressLogo size="default" />
            </Link>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200/80 text-[11px] font-bold text-rxblue-700">
              <span>Offered By: <strong>Veagle Space Technology Pvt. Ltd.</strong></span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              <strong>Make Google Reviews Easier</strong> — Simple • Fast • Convenient. Helping businesses boost 5-star ratings across customer touchpoints with 1-tap NFC &amp; Smart QR stands.
            </p>
            <div className="space-y-2 text-xs text-slate-600 pt-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>GST Registered: <strong className="text-slate-800">{settings?.gstNumber || '27AABCR1234F1Z8'}</strong> (HSN: {settings?.hsnCode || '852352'})</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="line-clamp-2">{settings?.address || "'Kudale Patil Tower', Office No. 207, Vadgaon Budruk, Pune, Maharashtra 411041"}</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-slate-900 text-sm font-bold mb-4 tracking-wider uppercase">Smart Hardware</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-slate-500">Custom Acrylic NFC Stand</span></li>
              <li><span className="text-slate-500">Executive Pocket NFC Card</span></li>
              <li><span className="text-slate-500">Metal Countertop Plate</span></li>
              <li><Link href="/how-it-works" className="hover:text-brand-600 transition-colors">How NFC &amp; QR Works</Link></li>
              <li><Link href="/partner" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">Partner Storefronts (20%)</Link></li>
            </ul>
          </div>

          {/* Partner & Refer */}
          <div>
            <h4 className="text-amber-800 text-sm font-bold mb-4 tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" /> Partner Program
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/partner" className="hover:text-brand-600 transition-colors">Refer &amp; Earn Program</Link></li>
              <li><Link href="/partner/register" className="hover:text-brand-600 transition-colors">Register as Organization</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-brand-600 transition-colors">Partner Dashboard</Link></li>
              <li><span className="text-brand-600 font-semibold">Earn {settings?.defaultCommissionPercent || 15}% on every order!</span></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-slate-900 text-sm font-bold mb-4 tracking-wider uppercase">Contact &amp; Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-600 shrink-0" />
                <a href={`tel:${settings?.supportPhone || '+918237999101'}`} className="hover:text-brand-600">{settings?.supportPhone || '+91 8237999101'}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-600 shrink-0" />
                <a href={`mailto:${settings?.supportEmail || 'info@veaglespace.com'}`} className="hover:text-brand-600">{settings?.supportEmail || 'info@veaglespace.com'}</a>
              </li>
              <li className="pt-2"><Link href="/policies/terms" className="hover:text-brand-600 text-xs">Terms &amp; Conditions</Link></li>
              <li><Link href="/policies/privacy" className="hover:text-brand-600 text-xs">Privacy Policy</Link></li>
              <li><Link href="/policies/shipping" className="hover:text-brand-600 text-xs">Shipping &amp; Delivery</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 text-center text-xs text-slate-500">
          <p>Designed &amp; Developed by <strong className="text-slate-800 font-bold">Veagle Space Technology Pvt. Ltd.</strong> | © 2026 All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
