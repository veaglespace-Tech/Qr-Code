'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, Clock, Building2, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  const { data: settings } = useSelector(state => state.settings);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: 'Inquiry about Smart NFC Stands', message: '' });

  const supportEmail = settings?.supportEmail || 'info@veaglespace.com';
  const supportPhone = settings?.supportPhone || '+91 8237999101';
  const whatsappNumber = settings?.whatsappNumber || '918237999101';
  const officeAddress = settings?.address || "'Kudale Patil Tower', Office No. 207, 2nd Floor, Jadhav Nagar, Near Shiv Temple, Vadgaon Budruk, Pune, Maharashtra 411041";

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', phone: '', email: '', subject: 'Inquiry about Smart NFC Stands', message: '' });
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(`Hello ${settings?.siteName || 'Veagle Space Technology'}, I am interested in ReviewXpress Smart NFC & QR Google Review stands.`);
    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" /> {settings?.siteName || 'Veagle Space Technology'} Support
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Get in Touch with Us
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Have questions about hardware specifications, custom laser branding, or bulk orders? Our support team is here to help you scale your business ratings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Real Contact Info Cards */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 space-y-6 shadow-xs">
            <div>
              <h3 className="text-lg font-black text-slate-900">Direct Contact Details</h3>
              <p className="text-xs text-slate-400 mt-1">Official communication channels for {settings?.siteName || 'Veagle Space Technology Pvt. Ltd.'}</p>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5 hover:border-purple-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Email Us</span>
                  <a href={`mailto:${supportEmail}`} className="text-sm font-bold text-slate-900 hover:text-purple-600 truncate block">
                    {supportEmail}
                  </a>
                  <span className="text-[11px] text-slate-500 mt-0.5 block flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-500" /> Available 24/7
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5 hover:border-purple-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Call Support</span>
                  <a href={`tel:${supportPhone}`} className="text-sm font-black text-slate-900 hover:text-purple-600 block">
                    {supportPhone}
                  </a>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Mon - Sat, 10:00 AM - 7:00 PM
                  </span>
                </div>
              </div>

              {/* Office Address */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5 hover:border-purple-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Visit Office</span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed mt-0.5">
                    {officeAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick Button */}
            <div className="pt-2">
              <button
                onClick={openWhatsApp}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on Official WhatsApp Directly</span>
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Usually responds within 15 minutes during office hours
              </p>
            </div>
          </div>

          {/* RIGHT: Send a Message Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 space-y-5 shadow-xs">
            <div>
              <h3 className="text-lg font-black text-slate-900">Send Us a Direct Message</h3>
              <p className="text-xs text-slate-400 mt-1">Leave your contact details and requirements. Our support team will get back to you promptly.</p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 my-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Thank You! Your Enquiry Was Received.</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Our customer success executive from {settings?.siteName || 'Veagle Space Technology'} will contact you via phone / WhatsApp shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject / Requirement</label>
                    <input
                      type="text"
                      placeholder="Bulk Order / Custom Branding / Query"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">How Can We Help You? *</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your business, quantity of review stands needed, or any questions you have..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Support</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
