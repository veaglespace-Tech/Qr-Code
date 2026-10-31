'use client';

import Link from 'next/link';
import { Wifi, CheckCircle2, ArrowRight, ShieldCheck, QrCode, Zap } from 'lucide-react';
import LiveNfcStandDemo from '@/components/LiveNfcStandDemo';

export default function HowItWorksPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-rxblue-800 text-xs font-bold">
          <Zap className="w-3.5 h-3.5 text-rxblue-600" /> Offered by Veagle Space Technology Pvt. Ltd.
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight font-heading">
          Make Google Reviews Easier: Simple 3-Step Process
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
          ReviewXpress helps businesses make it easier for customers to access their Google Review page through a simple QR code &amp; 1-tap NFC stand. <strong className="text-slate-900">No searching. No unnecessary steps.</strong>
        </p>
      </div>

      {/* 3-Step Visual Cards (From PDF Page 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm text-center">
          <span className="px-3 py-1 rounded-full bg-rxblue-100 text-rxblue-800 text-xs font-black uppercase tracking-wider">
            Step 01
          </span>
          <div className="text-4xl my-2">📱</div>
          <h3 className="text-2xl font-black text-slate-900 font-heading">SCAN</h3>
          <p className="text-sm text-slate-600">Scan the ReviewXpress QR code with your phone (or tap with 1-Tap NFC).</p>
        </div>

        <div className="glass-card p-8 rounded-3xl border-2 border-rxgreen-400 space-y-4 shadow-glow-green/15 text-center">
          <span className="px-3 py-1 rounded-full bg-rxgreen-500 text-white text-xs font-black uppercase tracking-wider shadow-xs">
            Step 02
          </span>
          <div className="text-4xl my-2">⚡</div>
          <h3 className="text-2xl font-black text-slate-900 font-heading">OPEN</h3>
          <p className="text-sm text-slate-600">Phone opens the official Google Review page instantly with zero typing.</p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm text-center">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider">
            Step 03
          </span>
          <div className="text-4xl my-2">⭐</div>
          <h3 className="text-2xl font-black text-slate-900 font-heading">REVIEW</h3>
          <p className="text-sm text-slate-600">Submit your 5-star feedback and details in seconds live on Google Maps.</p>
        </div>
      </div>

      {/* Customer Review Comparison */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Why It Works</span>
          <h2 className="text-3xl font-black text-slate-900 font-heading">
            Traditional Process vs ReviewXpress
          </h2>
          <p className="text-sm font-bold text-slate-700">One scan. Direct access. No wasted time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card bg-white rounded-3xl p-8 border border-red-200 space-y-4 shadow-sm">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider block pb-2 border-b border-red-100">
              ❌ Traditional Way (Most Customers Give Up)
            </span>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>1. Search:</strong> Customer has to manually search your shop name on Google</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>2. Scroll:</strong> Scroll through ads and similar-sounding businesses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>3. Find Reviews:</strong> Search for the reviews section on your profile</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>4. Leave Review:</strong> Too many steps — most customers close the phone</span>
              </li>
            </ul>
          </div>

          <div className="glass-panel bg-gradient-to-br from-emerald-50/70 to-blue-50/50 rounded-3xl p-8 border-2 border-emerald-300 space-y-4 shadow-sm">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block pb-2 border-b border-emerald-200">
              ✅ With ReviewXpress (Fast &amp; Simple)
            </span>
            <ul className="space-y-3 text-sm text-slate-800 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span><strong>1. TAP or SCAN:</strong> Customer taps their phone or scans the QR code</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span><strong>2. OPENS INSTANTLY:</strong> Your official Google review page opens directly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span><strong>3. REVIEW SUBMITTED:</strong> Customer gives 5 stars and submits in 5 seconds</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <LiveNfcStandDemo />

      {/* Hardware Specs Breakdown */}
      <div className="glass-panel bg-white rounded-3xl p-8 lg:p-12 border border-slate-200 space-y-8 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 text-center">Built for Heavy-Duty Counter Environments</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <Wifi className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Original NXP NTAG213 Chip</h4>
            <p className="text-xs text-slate-500">High-gain antenna responds within 0.3s through smartphone cases up to 4cm away.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Cast Optical Acrylic</h4>
            <p className="text-xs text-slate-500">Waterproof, sanitiser-proof, and UV resistant. Permanent diamond-cut polished bevel edge.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <QrCode className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Dual Universal Compatibility</h4>
            <p className="text-xs text-slate-500">NFC handles modern smartphones; high-contrast QR code handles all remaining devices.</p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link
            href="/partner"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20"
          >
            <span>Explore Partner Program (20% Commission)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
