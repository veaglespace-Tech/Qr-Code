'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { data: settings } = useSelector(state => state.settings);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', phone: '', email: '', message: '' });
  };

  const openWhatsApp = () => {
    const num = settings?.whatsappNumber || '919876543210';
    window.open(`https://api.whatsapp.com/send?phone=${num}&text=Hello%20Review%20Express,%20I%20am%20interested%20in%20smart%20review%20stands`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Get in Touch with Review Express
        </h1>
        <p className="text-sm text-slate-600">
          Have queries about bulk orders, custom company branding, or partner organization onboarding?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-5 glass-panel bg-white rounded-3xl p-8 border border-slate-200 space-y-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">Direct Assistance</h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Call / Helpline</p>
                <a href={`tel:${settings?.supportPhone}`} className="text-slate-600 hover:text-brand-600">
                  {settings?.supportPhone || '+91 98765 43210'}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Official Email</p>
                <a href={`mailto:${settings?.supportEmail}`} className="text-slate-600 hover:text-brand-600">
                  {settings?.supportEmail || 'support@reviewexpress.in'}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Headquarters</p>
                <p className="text-slate-600">{settings?.address || 'Tech Hub Towers, Pune, Maharashtra'}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={openWhatsApp}
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp Directly</span>
            </button>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 glass-panel bg-white rounded-3xl p-8 border border-slate-200 space-y-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">Send Us a Quick Enquiry</h3>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Thank You! Your message was received.</h4>
              <p className="text-xs text-slate-600">Our support specialist will connect with you via phone / WhatsApp shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message / Requirements *</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How many stands do you need? Custom logo requirement?"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Enquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
