import React, { useState } from 'react';
import { X, Check, ShieldCheck, Calendar, Phone, Mail, User, MapPin } from 'lucide-react';
import { CarConfig } from '../3d/SupercarModel';

interface VipModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CarConfig;
  calculatedPrice: number;
}

export const VipModal: React.FC<VipModalProps> = ({
  isOpen,
  onClose,
  config,
  calculatedPrice,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryLocation: 'Sant’Agata Bolognese (Factory VIP Handover)',
    preferredDate: '',
    bespokeNotes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-xl bg-[#0e1017] border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent glow banner */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff5500] via-amber-400 to-[#ff5500]" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#ff5500]/10 border border-[#ff5500]/30 flex items-center justify-center text-[#ff5500]">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight font-display text-white">
              Bespoke Allocation Reserved
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="text-white font-medium">{formData.name}</span>. An executive concierge specialist will contact you at <span className="text-[#ff5500]">{formData.email}</span> within 24 hours to finalize your build dossier and factory delivery schedule.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#ff5500] hover:bg-[#ff661a] text-white font-semibold text-sm rounded-lg transition-colors"
              >
                Return to Experience
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-[#ff5500] font-semibold">
                Private Commission
              </span>
              <h2 className="text-2xl font-bold tracking-tight font-display text-white mt-1">
                Order Your Spettacolo V12
              </h2>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span>Color: {config.bodyColor.toUpperCase()}</span>
                <span aria-hidden="true">·</span>
                <span>Finish: {config.finishType.toUpperCase()}</span>
                <span aria-hidden="true">·</span>
                <span className="text-white font-semibold tabular-nums">
                  ${calculatedPrice.toLocaleString()} USD
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contessa / Lord / First &amp; Last Name"
                    className="w-full pl-9 pr-3 py-2 bg-[#161922] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@prestige.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#161922] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className="w-full pl-9 pr-3 py-2 bg-[#161922] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Delivery Concierge
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={formData.deliveryLocation}
                      onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-[#161922] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors appearance-none"
                    >
                      <option>Sant’Agata Bolognese (Factory VIP Handover)</option>
                      <option>Beverly Hills Atelier, CA</option>
                      <option>Monaco Port VIP Terminal</option>
                      <option>Dubai DIFC Flagship</option>
                      <option>Tokyo Ginza Private Salon</option>
                      <option>Private Air Freight (Direct to Residence)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Handover Quarter
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      placeholder="Q3 2026 / Q4 2026"
                      className="w-full pl-9 pr-3 py-2 bg-[#161922] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Bespoke Ad Personam Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.bespokeNotes}
                  onChange={(e) => setFormData({ ...formData, bespokeNotes: e.target.value })}
                  placeholder="Custom family crest embossing on headrests, personalized carbon treadplates..."
                  className="w-full px-3 py-2 bg-[#161922] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#ff5500] transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Confidential VIP Concierge</span>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-xs font-semibold text-white bg-[#ff5500] hover:bg-[#ff661a] rounded-lg transition-colors shadow-lg shadow-[#ff5500]/25"
                  >
                    Confirm Commission Request
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
