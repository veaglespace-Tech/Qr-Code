'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  Sparkles,
  DollarSign,
  Share2,
  Users,
  ArrowRight
} from 'lucide-react';

export default function PartnerProgramPage() {
  const { data: settings } = useSelector(state => state.settings);
  const commissionRate = settings?.defaultCommissionPercent || 15;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> High-Paying Affiliate &amp; Organization Program
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight font-heading">
          Partner with ReviewXpress &amp; Earn{' '}
          <span className="text-gradient-gold">{commissionRate}% – 20% Commission</span>
        </h1>
        <p className="text-base text-slate-600 leading-relaxed font-normal">
          Recommend smart NFC + QR Google review stands to local cafes, restaurants, clinics, hotels, and retail stores. When they order through your link, you get paid directly to your bank account or UPI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/partner/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <span>Register as Partner (100% Free)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm flex items-center justify-center shadow-sm"
          >
            <span>Partner Login</span>
          </Link>
        </div>
      </div>

      {/* 3 Pillars of Earning */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card bg-white rounded-2xl p-7 space-y-4 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Share2 className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">1. Get Your Unique Link</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Free instant registration. Get your personal affiliate link and dynamic QR code ready for sharing on WhatsApp, Instagram, or in person.
          </p>
        </div>

        <div className="glass-card bg-white rounded-2xl p-7 space-y-4 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">2. Businesses Order</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Customers receive an instant 5% bonus discount by using your link or code. ReviewXpress takes care of laser printing, chip programming, and courier shipping.
          </p>
        </div>

        <div className="glass-card bg-white rounded-2xl p-7 space-y-4 border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">3. Get Direct Bank Payouts</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Earn {commissionRate}% commission on product value. Request payout anytime directly to your UPI ID or IMPS bank account with transparent live dashboard tracking.
          </p>
        </div>
      </div>

      {/* Example Earning Calculation */}
      <div className="glass-panel bg-white rounded-3xl p-8 lg:p-12 border border-amber-200 space-y-6 shadow-sm">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900">How much can you earn?</h2>
          <p className="text-xs text-slate-500">Example monthly earnings based on average 3 stands per business client</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center">
          <div className="p-6 rounded-2xl bg-slate-50 space-y-2 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">10 Clients Referred</span>
            <div className="text-3xl font-black text-slate-900">₹5,400+</div>
            <p className="text-xs text-amber-700 font-bold">Side Income / Freelancer</p>
          </div>

          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 space-y-2">
            <span className="text-xs font-bold text-amber-900 uppercase">50 Clients Referred</span>
            <div className="text-3xl font-black text-amber-800">₹27,000+</div>
            <p className="text-xs text-amber-800 font-bold">Marketing Agency / Consultant</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 space-y-2 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">150 Clients Referred</span>
            <div className="text-3xl font-black text-slate-900">₹81,000+</div>
            <p className="text-xs text-emerald-700 font-bold">Full Organization Distributor</p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link
            href="/partner/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20"
          >
            <span>Start Earning Now &rarr; Register Free</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
