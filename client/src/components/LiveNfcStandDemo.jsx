'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Star, Smartphone, Sparkles, CheckCircle2, Wifi, Zap, ExternalLink, ArrowRight } from 'lucide-react';
import ReviewXpressLogo from '@/components/ReviewXpressLogo';

export default function LiveNfcStandDemo() {
  const [businessName, setBusinessName] = useState('Cafe Oasis Pune');
  const [reviewLink, setReviewLink] = useState('https://g.page/r/example-cafe/review');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [simulatedTap, setSimulatedTap] = useState(false);
  const [phoneTapping, setPhoneTapping] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(reviewLink || 'https://google.com', {
      width: 180,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error(err));
  }, [reviewLink]);

  const triggerNfcTap = () => {
    setPhoneTapping(true);
    setTimeout(() => {
      setPhoneTapping(false);
      setSimulatedTap(true);
    }, 600);

    setTimeout(() => {
      setSimulatedTap(false);
    }, 4500);
  };

  return (
    <div className="relative rounded-3xl p-6 lg:p-10 bg-white/80 backdrop-blur-xl border border-slate-200/90 shadow-2xl overflow-hidden">
      {/* Dynamic atmospheric auras */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-rxgreen-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-rxblue-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rxblue-50 border border-rxblue-200 text-rxblue-700 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-rxblue-600 animate-spin-slow" />
            <span>Live Hardware Customizer &amp; Preview</span>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight font-heading">
              Preview Your Custom <span className="text-gradient-rx">Review Stand</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Watch your actual shop name and Google Maps review link render in real-time on our laser-crafted dual NFC + QR acrylic stand.
            </p>
          </div>


          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Your Business / Brand Name:
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Cafe Oasis, Dr. Sharma Clinic"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rxgreen-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Google Review URL (or Google Maps link):
              </label>
              <input
                type="text"
                value={reviewLink}
                onChange={(e) => setReviewLink(e.target.value)}
                placeholder="https://g.page/r/your-shop/review"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rxblue-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <button
              onClick={triggerNfcTap}
              disabled={phoneTapping}
              className="w-full py-4 px-6 rounded-xl btn-primary-rx font-bold text-sm flex items-center justify-center gap-2.5 active:scale-95 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Simulate 1-Tap NFC Phone Touch</span>
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            </button>
          </div>

          {/* Quick specs pill bar */}
          <div className="flex items-center gap-4 pt-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-rxgreen-600" />
              NTAG213 High-Speed Chip
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-rxblue-600" />
              3mm Cast Acrylic
            </span>
          </div>
        </div>

        {/* Right: Realistic 3D Acrylic Review Stand with Laser Bevel */}
        <div className="lg:col-span-7 flex justify-center relative py-6">
          {/* Subtle desk surface shadow */}
          <div className="absolute bottom-2 w-72 h-8 bg-slate-900/15 rounded-full blur-xl transform scale-x-125 pointer-events-none" />

          {/* Animated Simulated Phone hovering for Tap */}
          {phoneTapping && (
            <div className="absolute z-40 -top-8 animate-bounce transition-all duration-300">
              <div className="w-28 h-52 bg-slate-900 border-4 border-slate-700 rounded-3xl p-2 shadow-2xl flex flex-col items-center justify-between text-white text-[9px] text-center rotate-12">
                <div className="w-8 h-2 bg-slate-700 rounded-full" />
                <div className="space-y-1">
                  <Wifi className="w-6 h-6 text-rxgreen-400 mx-auto animate-pulse" />
                  <p className="font-bold text-rxgreen-300">Tapping NFC...</p>
                </div>
                <div className="w-4 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          )}

          {/* Stand Body */}
          <div className="relative w-76 sm:w-84 rounded-3xl bg-gradient-to-b from-white via-slate-50 to-white p-7 border-2 border-slate-200/90 shadow-stand-shadow text-center transform hover:scale-[1.01] transition-all duration-300">
            {/* Top Glossy Specular Highlight Line */}
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
            
            {/* Top Header: ReviewXpress Branding & NFC Pill */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <ReviewXpressLogo size="sm" showText={false} />
              
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rxblue-50 border border-rxblue-100 text-rxblue-700 text-[10px] font-extrabold tracking-wide">
                <Wifi className="w-3.5 h-3.5 text-rxblue-600 rotate-90" />
                <span>TAP PHONE HERE</span>
              </div>
            </div>

            {/* Google Logo & 5 Stars */}
            <div className="py-4 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-black tracking-tight">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </span>
                <span className="text-slate-800 text-sm font-extrabold tracking-tight">Reviews</span>
              </div>

              {/* 5 Golden Stars */}
              <div className="flex justify-center gap-1.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 filter drop-shadow-sm" />
                ))}
              </div>

              <p className="text-xs text-slate-600 font-semibold tracking-wide">
                Tap with phone or scan QR code
              </p>
            </div>

            {/* Dynamic QR Code inside protective laser border */}
            <div className="my-3 flex justify-center">
              <div className="p-3.5 bg-white rounded-2xl shadow-md border border-slate-200/80 hover:border-rxgreen-400 transition-colors">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="Dynamic QR Code" className="w-32 h-32" />
                ) : (
                  <div className="w-32 h-32 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                    Generating...
                  </div>
                )}
              </div>
            </div>

            {/* Custom Business Name */}
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <p className="text-base font-black text-slate-900 truncate px-2 font-heading">
                {businessName || 'Your Business Name'}
              </p>
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500">
                <span>Powered by</span>
                <span className="font-bold text-slate-900">Review</span>
                <span className="font-extrabold text-[#00E575]">Xpress</span>
                <span>NFC</span>
              </div>
            </div>

            {/* Stand Base Acrylic Block Depth Effect */}
            <div className="absolute -bottom-3 left-6 right-6 h-3 bg-gradient-to-b from-slate-200 to-slate-300 rounded-b-xl border border-t-0 border-slate-300 opacity-90 shadow-sm" />
          </div>

          {/* Interactive Tap Result Popup */}
          {simulatedTap && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-white/95 backdrop-blur-xl border-2 border-rxgreen-500 rounded-3xl p-5 shadow-2xl z-50 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rxgreen-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-rxgreen-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 font-heading">Instant NFC URL Opened!</h4>
                  <p className="text-xs text-rxgreen-700 font-bold">Latency: 0.28 seconds</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-800">
                  Redirecting customer smartphone to:
                </p>
                <div className="p-2 rounded-lg bg-slate-50 text-[11px] font-mono text-slate-700 truncate border border-slate-200">
                  {reviewLink}
                </div>
                <p className="text-[10px] text-slate-400">
                  ✓ Direct 5-Star dialog box pops up automatically on Google Maps
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
