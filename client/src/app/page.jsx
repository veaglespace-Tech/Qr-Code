'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Smartphone,
  QrCode,
  ShieldCheck,
  TrendingUp,
  Star,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Clock,
  HelpCircle,
  ChevronDown,
  Building2,
  Utensils,
  Stethoscope,
  Scissors,
  Car,
  Hotel,
  DollarSign,
  HeartHandshake
} from 'lucide-react';
import LiveNfcStandDemo from '@/components/LiveNfcStandDemo';

export default function HomePage() {

  // ROI Calculator states
  const [dailyFootfall, setDailyFootfall] = useState(80);
  const [ticketSize, setTicketSize] = useState(600);

  // Calculated metrics
  const monthlyReviews = Math.round(dailyFootfall * 30 * 0.14);
  const estimatedNewCustomers = Math.round(monthlyReviews * 1.8);
  const estimatedRevenueUplift = estimatedNewCustomers * ticketSize;

  // FAQ state
  const [openFaq, setOpenFaq] = useState(0);

  const businessTypes = [
    { name: 'Cafes & Restaurants', icon: Utensils, stat: '+180 Reviews/mo', color: 'from-amber-500/10 to-orange-500/10 text-orange-600 border-orange-200' },
    { name: 'Doctors & Clinics', icon: Stethoscope, stat: '+120 Reviews/mo', color: 'from-blue-500/10 to-cyan-500/10 text-blue-600 border-blue-200' },
    { name: 'Salons & Spas', icon: Scissors, stat: '+140 Reviews/mo', color: 'from-pink-500/10 to-rose-500/10 text-pink-600 border-pink-200' },
    { name: 'Car Care & Garages', icon: Car, stat: '+90 Reviews/mo', color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200' },
    { name: 'Hotels & Resorts', icon: Hotel, stat: '+250 Reviews/mo', color: 'from-purple-500/10 to-indigo-500/10 text-purple-600 border-purple-200' },
  ];

  const faqs = [
    {
      q: 'Does it work with both iPhone and Android without installing any app?',
      a: 'Yes, 100%! All modern smartphones have built-in native NFC readers (iPhone XR and newer, and almost all Android phones). Customers simply touch the stand with their phone or scan the laser-etched QR code. No app or password required.'
    },
    {
      q: 'Are there any recurring monthly or annual subscription fees?',
      a: 'No recurring fees whatsoever! You pay once for the hardware stand or card, and you own it forever with lifetime validity and lifetime Google review collection.'
    },
    {
      q: 'How does it open the direct 5-star Google review window?',
      a: 'We program each NFC chip and QR code with your dedicated Google Place review URL. When tapped, it bypasses the search step and immediately triggers the Google Maps rating dialogue box.'
    },
    {
      q: 'Can I claim GST Input Tax Credit on my purchase?',
      a: 'Absolutely. We provide an official GST Tax Invoice (HSN code 852352) with 18% GST breakdown so your business can claim full input tax credit.'
    },
    {
      q: 'How long does custom laser engraving and delivery take?',
      a: 'Every stand is custom laser-crafted and chip-encoded within 24 to 48 business hours. We provide free express courier delivery across India (Blue Dart / Delhivery) with live tracking.'
    }
  ];

  return (
    <div className="space-y-28 pb-24 bg-ambient-pattern">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background Atmosphere Radiant Auras */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] aura-glow-blue pointer-events-none -z-10" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] aura-glow-green pointer-events-none -z-10" />

        <div className="text-center max-w-4xl mx-auto space-y-7">
          {/* Top Floating Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 border border-slate-200/90 text-slate-800 text-xs sm:text-sm font-extrabold shadow-sm hover:border-rxgreen-400 transition-colors">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rxgreen-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rxgreen-500" />
            </span>
            <span className="font-heading tracking-wide uppercase text-[11px] sm:text-xs">
              Offered by Veagle Space Technology Pvt. Ltd. • Simple • Fast • Convenient
            </span>
            <Zap className="w-3.5 h-3.5 text-rxgreen-600 fill-rxgreen-500" />
          </div>

          {/* Main Power Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] font-heading">
            Make Google Reviews Easier with{' '}
            <span className="text-gradient-rx">
              ReviewXpress
            </span>
          </h1>

          {/* High-Converting Subtext */}
          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            ReviewXpress helps businesses make it easier for customers to access their Google Review page through a simple QR code &amp; 1-tap NFC stand. <strong className="text-slate-900 font-bold">No searching. No unnecessary steps.</strong>
          </p>

          {/* Action Button Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/partner"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl btn-primary-rx font-black text-base flex items-center justify-center gap-3 shadow-glow-green active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Partner Program &amp; Org Login</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </Link>

            <Link
              href="/how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl btn-secondary-rx font-extrabold text-base flex items-center justify-center gap-2.5 active:scale-95 transition-all"
            >
              <span>How It Works</span>
            </Link>
          </div>

          {/* Trust Highlights Checklist */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-700 max-w-3xl mx-auto border-t border-slate-200/80">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rxgreen-600 flex-shrink-0" />
              <span>No App Required</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rxgreen-600 flex-shrink-0" />
              <span>Lifetime Chip Validity</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rxblue-600 flex-shrink-0" />
              <span>100% Waterproof Acrylic</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-rxgreen-600 flex-shrink-0" />
              <span>GST Input Credit Ready</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Acrylic Stand Simulator */}
        <div className="mt-16">
          <LiveNfcStandDemo />
        </div>
      </section>

      {/* 2. SOCIAL PROOF STATS COUNTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 border border-slate-200/80 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100 shadow-sm">
          <div className="space-y-1.5 pt-4 lg:pt-0">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              18,500<span className="text-[#00E575]">+</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Smart Stands Shipped Across India
            </p>
          </div>

          <div className="space-y-1.5 pt-4 lg:pt-0">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              10X<span className="text-rxblue-600"> Faster</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Google Review Velocity
            </p>
          </div>

          <div className="space-y-1.5 pt-4 lg:pt-0">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              4.9<span className="text-amber-500"> ★</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Average Store Rating Reached
            </p>
          </div>

          <div className="space-y-1.5 pt-4 lg:pt-0">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              0.28<span className="text-[#00E575]">s</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Instant NFC Tap Response
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (SIMPLE 3-STEP PROCESS - EXACT FROM PDF PAGE 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rxgreen-100 text-rxgreen-800 text-xs font-extrabold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Simple 3-Step Process
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight">
            How It Works: Simple 3-Step Process
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            No searching. No unnecessary steps. Direct 5-star Google review in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 01 - SCAN */}
          <div className="glass-card p-8 rounded-3xl border border-slate-200/90 relative space-y-4 shadow-sm hover:border-rxblue-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-rxblue-100 text-rxblue-800 text-xs font-black uppercase tracking-wider">
                Step 01
              </span>
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 font-heading tracking-tight">
              SCAN
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Scan the ReviewXpress QR code with your phone (or gently tap with 1-Tap NFC).
            </p>
            <div className="text-xs font-bold text-rxblue-700 flex items-center gap-1 pt-3 border-t border-slate-100">
              <span>Instant camera or tap trigger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 02 - OPEN */}
          <div className="glass-card p-8 rounded-3xl border-2 border-rxgreen-400 relative space-y-4 shadow-glow-green/15 hover:border-rxgreen-500 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-rxgreen-500 text-white text-xs font-black uppercase tracking-wider shadow-xs">
                Step 02
              </span>
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 font-heading tracking-tight">
              OPEN
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Phone opens the official Google Review page instantly with zero typing.
            </p>
            <div className="text-xs font-bold text-rxgreen-700 flex items-center gap-1 pt-3 border-t border-slate-100">
              <span>Bypasses search, maps &amp; ads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 03 - REVIEW */}
          <div className="glass-card p-8 rounded-3xl border border-slate-200/90 relative space-y-4 shadow-sm hover:border-amber-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider">
                Step 03
              </span>
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 font-heading tracking-tight">
              REVIEW
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Submit your 5-star feedback and details in seconds.
            </p>
            <div className="text-xs font-bold text-amber-700 flex items-center gap-1 pt-3 border-t border-slate-100">
              <span>Published live to Google Maps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. INDUSTRY SOLUTIONS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight">
            Tailored For Every Walk-in Business
          </h2>
          <p className="text-sm text-slate-600">
            Proven to boost local Google Maps search ranking for shops across India
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {businessTypes.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md text-center space-y-3 transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${b.color} border flex items-center justify-center mx-auto`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">{b.name}</h4>
                  <p className="text-xs font-extrabold text-rxgreen-700 mt-1">{b.stat}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. LIVE ROI & REVENUE CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 lg:p-12 border border-slate-200/90 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl mb-8 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-rxgreen-700">
              Interactive ROI Forecaster
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight">
              Calculate Your 90-Day Revenue Uplift
            </h2>
            <p className="text-sm text-slate-600">
              Businesses with 100+ 5-star Google reviews rank on the #1 Local Google 3-Pack, driving 35% more footfall.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Sliders */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-800">Average Daily Walk-in Customers:</span>
                  <span className="text-lg font-black text-rxblue-600 font-heading">{dailyFootfall} customers/day</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="400"
                  step="10"
                  value={dailyFootfall}
                  onChange={(e) => setDailyFootfall(Number(e.target.value))}
                  className="w-full accent-rxblue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-800">Average Order / Bill Value (₹):</span>
                  <span className="text-lg font-black text-rxgreen-600 font-heading">₹{ticketSize}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="100"
                  value={ticketSize}
                  onChange={(e) => setTicketSize(Number(e.target.value))}
                  className="w-full accent-rxgreen-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-rxgreen-600 flex-shrink-0" />
                <span>
                  Calculation based on verified 14% NFC tap conversion benchmark across 1,200+ partner outlets in India.
                </span>
              </div>
            </div>

            {/* Results Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-850 text-white rounded-3xl p-8 space-y-6 shadow-2xl">
              <div className="space-y-1">
                <span className="text-xs uppercase font-extrabold tracking-wider text-rxgreen-400">
                  Estimated Monthly Impact
                </span>
                <div className="text-4xl font-black text-white font-heading">
                  +{monthlyReviews} <span className="text-amber-400 text-3xl font-bold">Reviews/mo</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">New Google Search Visitors:</span>
                  <span className="font-bold text-white">~{estimatedNewCustomers} customers</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Est. Additional Monthly Revenue:</span>
                  <span className="text-lg font-black text-rxgreen-400 font-heading">
                    +₹{estimatedRevenueUplift.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Link
                href="/partner"
                className="w-full py-3.5 px-4 rounded-xl btn-primary-rx text-xs font-black flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Join Partner Program &amp; Earn 20%</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ENTERPRISE HARDWARE TECHNOLOGY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-purple-600" /> High-Performance Smart Hardware
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight">
            ReviewXpress Smart Hardware Lineup
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Engineered with high-frequency NTAG213 chips, UV laser precision print, and zero recurring fees.
            Exclusively distributed across India through our Certified Partner Network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Acrylic Smart Stand */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 hover:border-purple-300 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Custom Acrylic NFC Stand</h3>
                <p className="text-xs text-purple-700 font-bold mt-0.5">Most Popular for Billing Counters</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Premium 3mm cast acrylic counter stand. Built-in instant tap NFC chip + high-resolution laser-printed QR code personalized with your business logo.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NTAG213 High-Sensitivity NFC</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Waterproof &amp; Scratch Resistant</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero Batteries / Lifetime Validity</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-2 rounded-xl border border-purple-200 text-center">
                🔒 Available Exclusively via Partner Direct Link
              </div>
            </div>
          </div>

          {/* Card 2: Executive NFC Review Card */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 hover:border-purple-300 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Executive Pocket NFC Card</h3>
                <p className="text-xs text-blue-700 font-bold mt-0.5">Best for Managers &amp; Field Staff</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Matte PVC smart review card designed for sales executives, service managers, real estate consultants, and on-field team members.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Compact Wallet-Fit PVC Design</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant Tap on iPhone &amp; Android</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct 5-Star Review Box Trigger</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-2 rounded-xl border border-purple-200 text-center">
                🔒 Available Exclusively via Partner Direct Link
              </div>
            </div>
          </div>

          {/* Card 3: Metal Countertop Plate */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 hover:border-purple-300 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Metal-Touch Luxury Plate</h3>
                <p className="text-xs text-amber-700 font-bold mt-0.5">For Boutique Hotels &amp; Fine Dining</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Brushed metallic finish luxury counter plate for high-end boutique hotels, luxury showrooms, dental studios, and fine dining.
              </p>
              <ul className="space-y-2 text-xs text-slate-700 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Brushed Metal Luxury Aesthetic</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Anti-Interference Metal Shielding</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Heavy-Duty Permanent Counter Grip</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-2 rounded-xl border border-purple-200 text-center">
                🔒 Available Exclusively via Partner Direct Link
              </div>
            </div>
          </div>
        </div>

        {/* Partner Program Banner */}
        <div className="mt-12 p-7 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Partner Distribution Model</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-white">
              Want to Distribute ReviewXpress to Businesses in Your City?
            </h4>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
              Agencies, POS providers, digital marketers, and freelancers earn flat 20% commission on every device sold, with dedicated branded storefront links.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/partner/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow-md transition-all text-center"
            >
              Register as Partner (Free)
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-purple-800/80 hover:bg-purple-800 text-white font-bold text-xs border border-purple-700/80 transition-all text-center"
            >
              Partner / Org Login
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEW WORKFLOW COMPARISON (FROM PDF PAGE 3) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-xs font-black uppercase tracking-wider">
            Customer Review Workflow Comparison
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight">
            Traditional Process <span className="text-rose-500">VS</span> ReviewXpress
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            <strong className="text-slate-900">One scan. Direct access. Less effort.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Traditional Process */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-rose-200/90 shadow-sm space-y-6 relative flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <span className="text-xs font-black text-rose-600 uppercase tracking-widest">
                  Traditional Process
                </span>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  95% Drop-off Friction
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 font-heading">
                Multi-Step Friction (Customers Give Up)
              </h3>

              <div className="space-y-4 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <div className="w-7 h-7 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">1. Search Business</h4>
                    <p className="text-xs text-slate-600">Customer opens browser or Google Maps and manually types your exact business name.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <div className="w-7 h-7 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">2. Find Profile in Search Results</h4>
                    <p className="text-xs text-slate-600">Must filter past competitor ads, sponsored listings, and other businesses with similar names.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <div className="w-7 h-7 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">3. Open Reviews Tab</h4>
                    <p className="text-xs text-slate-600">Customer scrolls down the profile, searches for the Reviews tab, and clicks write review.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <div className="w-7 h-7 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">4. Write Review</h4>
                    <p className="text-xs text-slate-600">Too tedious and time-consuming. Vast majority of customers close the app without posting.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold text-center border border-rose-200 mt-4">
              ❌ Too many unnecessary steps. High customer drop-off.
            </div>
          </div>

          {/* With ReviewXpress */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-50/60 via-white to-blue-50/40 border-2 border-rxgreen-400 shadow-xl space-y-6 relative flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <span className="text-xs font-black text-rxgreen-700 uppercase tracking-widest">
                  With ReviewXpress
                </span>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-rxgreen-500 text-white shadow-xs">
                  One Scan • Direct Access
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 font-heading">
                One scan. Direct access. Less effort.
              </h3>

              <div className="space-y-4 pt-1">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-rxblue-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">SCAN</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Customer scans the ReviewXpress QR code or taps phone on the counter stand.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-rxgreen-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">OPEN</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Phone opens the official Google Review page instantly on their screen.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">REVIEW</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Submit your 5-star feedback and details in seconds. Live on Google Maps!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center shadow-md mt-4">
              ✅ No searching. No unnecessary steps. Maximum review conversion!
            </div>
          </div>
        </div>
      </section>

      {/* 8. QR CODE TOUCHPOINTS (FROM PDF PAGE 2 & 4) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-rxblue-800 text-xs font-extrabold uppercase tracking-wider">
            QR Code Touchpoints
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight">
            Deploy Across All Customer Touchpoints
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Seamlessly integrate ReviewXpress QR codes &amp; NFC stands at key customer interaction points
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: 'Reception', desc: 'Hotel front desks & clinics', icon: '🛎️' },
            { title: 'Billing Counters', desc: 'POS checkout & cash desks', icon: '💳' },
            { title: 'Tables', desc: 'Dining & cafe tables', icon: '🍽️' },
            { title: 'Packaging', desc: 'Takeaway bags & delivery parcels', icon: '📦' },
            { title: 'Visiting Cards', desc: 'Smart NFC business cards', icon: '📇' },
            { title: 'Standees', desc: 'Store entrance displays & banners', icon: '🪧' },
          ].map((tp, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-2 hover:border-rxblue-400 hover:shadow-md transition-all">
              <span className="text-3xl block">{tp.icon}</span>
              <h4 className="text-sm font-bold text-slate-900 font-heading">{tp.title}</h4>
              <p className="text-[11px] text-slate-500">{tp.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. WHY CHOOSE REVIEWXPRESS? & KEY BENEFITS (FROM PDF PAGE 4) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 lg:p-12 border border-slate-200/90 shadow-xl space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-rxgreen-700">
              Key Benefits &amp; Use Cases
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight">
              Why Choose ReviewXpress?
            </h2>
            <p className="text-base text-slate-700 font-bold">
              Boost Your Business with Simplified Review Access
            </p>
          </div>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rxblue-100 text-rxblue-700 flex items-center justify-center font-bold text-lg">
                ⚡
              </div>
              <h4 className="text-base font-bold text-slate-900 font-heading">Instant QR Access</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct instant link to your official Google Review page with no manual searching or typing required.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rxgreen-100 text-rxgreen-700 flex items-center justify-center font-bold text-lg">
                📈
              </div>
              <h4 className="text-base font-bold text-slate-900 font-heading">Higher Review Conversion</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simplifies the review process, leading to more submitted 5-star feedback and positive ratings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                📍
              </div>
              <h4 className="text-base font-bold text-slate-900 font-heading">Easy Touchpoint Deployment</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamlessly integrate QR codes at customer interaction points like billing counters and cafes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                🏢
              </div>
              <h4 className="text-base font-bold text-slate-900 font-heading">Multi-Industry Support</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tailored solutions for different sectors to boost visibility and customer feedback.
              </p>
            </div>
          </div>

          {/* 4 Key Benefits for Businesses Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">1</div>
              <span>Simple QR-based solution</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">2</div>
              <span>Easier access to Google Review page</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">3</div>
              <span>Easy to deploy at touchpoints</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">4</div>
              <span>Suitable for every business type</span>
            </div>
          </div>

          {/* Where it can be used banner */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white text-center space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-rxgreen-400">
              WHERE IT CAN BE USED
            </span>
            <p className="text-xs sm:text-sm font-black tracking-wider leading-relaxed text-slate-100">
              RESTAURANTS • HOTELS • SALONS • CLINICS • RETAIL • REAL ESTATE • AUTO DEALERS • GYMS • HOSPITALS &amp; MORE...
            </p>
          </div>
        </div>
      </section>

      {/* 8. PARTNER PROGRAM CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-8 lg:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider">
              Earn 15% – 20% Passive Commission
            </span>
            <h3 className="text-3xl sm:text-4xl font-black font-heading tracking-tight">
              Join The ReviewXpress Partner Program
            </h3>
            <p className="text-sm text-amber-50 leading-relaxed font-normal">
              Register your organization for free. Refer local shops, cafes, dentists, and retail outlets with your unique affiliate QR code. Earn recurring commission deposited straight to your Bank or UPI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <Link
              href="/partner/register"
              className="px-8 py-4 rounded-xl bg-white text-slate-900 font-black text-sm hover:bg-slate-100 shadow-lg active:scale-95 transition-all text-center"
            >
              Register Free as Partner
            </Link>
            <Link
              href="/partner"
              className="px-8 py-4 rounded-xl bg-amber-700/40 border border-white/30 text-white font-bold text-sm hover:bg-amber-700/60 transition-all text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-black text-slate-900 font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Everything you need to know about ReviewXpress NFC hardware
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl border border-slate-200 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-rxgreen-600' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
