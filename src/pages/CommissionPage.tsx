import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Calendar, Phone, Mail, User, MapPin, 
  Check, ArrowRight, Sparkles, Building, Globe 
} from 'lucide-react';

export const CommissionPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    model: 'Spettacolo SVJ (6.5L Naturally Aspirated V12)',
    deliveryLocation: 'Sant’Agata Bolognese (Factory VIP Handover)',
    timeframe: 'Q3 2026',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#090a0f] text-slate-100 pb-20">
      {/* Header */}
      <section className="pt-12 pb-8 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-widest text-[#ff5500] font-semibold">
            Ad Personam Private Commission
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white font-display mt-1">
            Reserve Your Allocation
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Secure an exclusive production slot with factory-direct handover at the Sant’Agata Bolognese headquarters or certified white-glove global delivery.
          </p>
        </div>
      </section>

      {/* Main Commission Form & Highlights */}
      <section className="px-4 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Card (7 cols) */}
          <div className="lg:col-span-7 bg-[#0e111a] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#ff5500]/15 border border-[#ff5500]/40 flex items-center justify-center text-[#ff5500]">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-display text-white">
                  Commission Allocation Dossier Received
                </h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-white font-medium">{formData.name}</span>. An executive concierge specialist will contact you at <span className="text-[#ff5500] font-mono">{formData.email}</span> within 24 hours with your preliminary build allocation slot and factory consultation schedule.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                  <Link
                    to="/"
                    className="px-6 py-2.5 bg-[#ff5500] hover:bg-[#ff661a] text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-[#ff5500]/25"
                  >
                    Return to Overview
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    Client Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Lord / Lady / Full Name"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#151924] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="client@sanctuary.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#151924] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      Phone / WhatsApp Concierge
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 019-2834"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#151924] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      Requested Vehicle Model
                    </label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#151924] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                    >
                      <option>Spettacolo SVJ (6.5L Naturally Aspirated V12)</option>
                      <option>Spettacolo STO (5.2L High-Revving V10)</option>
                      <option>Spettacolo SVJ Roadster (Carbon Open-Top)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                      Delivery Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={formData.deliveryLocation}
                        onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#151924] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                      >
                        <option>Sant’Agata Bolognese (Factory VIP Handover)</option>
                        <option>Beverly Hills Atelier, California</option>
                        <option>Monaco Port VIP Terminal</option>
                        <option>Dubai DIFC Flagship Salon</option>
                        <option>Tokyo Ginza Private Salon</option>
                        <option>Private Air Freight to Residence</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    Ad Personam Bespoke Requests (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Custom paint-to-sample matching, personalized carbon treadplates, embroidered initials..."
                    className="w-full px-3.5 py-2.5 bg-[#151924] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Strictly Confidential VIP Atelier</span>
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#ff5500] hover:bg-[#ff661a] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#ff5500]/30"
                  >
                    Submit Commission
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Handover Highlights Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-black aspect-[16/10] relative">
              <img
                src="/src/assets/images/aventador_svj_frame27_1790265181205.jpg"
                alt="Orange supercar with scissor doors on canyon pass"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                <div className="text-xs text-white">
                  <div className="font-bold text-[#ff5500]">Factory Handover Protocol</div>
                  <div className="text-slate-300">Sant’Agata Bolognese delivery suite with personal test driver.</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e111a] border border-white/10 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase font-display tracking-wide">
                VIP Commission Privileges
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" />
                  <span>Private factory tour of the V12 monocoque and engine assembly lines.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" />
                  <span>Personal consultation with the head of Ad Personam exterior design.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" />
                  <span>Commemorative leather-bound specification dossier and titanium key box.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#ff5500] shrink-0 mt-0.5" />
                  <span>Track test shake-down alongside official Lamborghini Squadra Corse driver.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
