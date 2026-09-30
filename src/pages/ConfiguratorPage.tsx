import React, { useState } from 'react';
import { PAINT_COLORS, CALIPER_COLORS } from '../data/carData';
import { 
  Check, Sliders, Palette, Disc, Shield, Sparkles, 
  Copy, Download, ExternalLink, RefreshCw, Zap, Eye
} from 'lucide-react';

interface ConfiguratorPageProps {
  onOpenVipModal: () => void;
}

export const ConfiguratorPage: React.FC<ConfiguratorPageProps> = ({ onOpenVipModal }) => {
  const [selectedModel, setSelectedModel] = useState<'svj' | 'sto'>('svj');
  const [selectedColor, setSelectedColor] = useState(PAINT_COLORS[0]);
  const [finishType, setFinishType] = useState<'metallic' | 'gloss' | 'matte' | 'carbon'>('metallic');
  const [selectedCaliper, setSelectedCaliper] = useState(CALIPER_COLORS[0]);
  const [aeroPackage, setAeroPackage] = useState<'svj' | 'track' | 'touring'>('svj');
  const [activeTab, setActiveTab] = useState<'paint' | 'wheels' | 'aero' | 'interior'>('paint');
  const [copiedCode, setCopiedCode] = useState(false);
  const [previewView, setPreviewView] = useState<'scissor' | 'canyon' | 'cockpit'>('scissor');

  // Base price
  const basePrice = selectedModel === 'svj' ? 517770 : 334500;
  let totalAddons = selectedColor.price + selectedCaliper.price;

  if (finishType === 'matte') totalAddons += 14500;
  if (finishType === 'gloss') totalAddons += 6800;
  if (finishType === 'carbon') totalAddons += 38000;
  if (aeroPackage === 'svj') totalAddons += 22000;
  if (aeroPackage === 'track') totalAddons += 34500;

  const calculatedPrice = basePrice + totalAddons;
  const buildCode = `${selectedModel.toUpperCase()}-${selectedColor.name.split(' ')[0].toUpperCase()}-${finishType.toUpperCase()}-${aeroPackage.toUpperCase()}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(buildCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleReset = () => {
    setSelectedColor(PAINT_COLORS[0]);
    setFinishType('metallic');
    setSelectedCaliper(CALIPER_COLORS[0]);
    setAeroPackage('svj');
  };

  const imageSrc =
    selectedModel === 'sto'
      ? '/src/assets/images/supercar_sto_blue_1790265138339.jpg'
      : previewView === 'scissor'
      ? '/src/assets/images/aventador_svj_frame27_1790265181205.jpg'
      : previewView === 'canyon'
      ? '/src/assets/images/canyon_supercar_hero_1790264551849.jpg'
      : '/src/assets/images/supercar_cockpit_interior_1790264577730.jpg';

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] flex flex-col lg:flex-row bg-[#08090d] text-slate-100">
      {/* Studio Visual Canvas (Left/Center 65%) */}
      <div className="relative flex-1 min-h-[45vh] lg:min-h-[calc(100vh-4.5rem)] bg-black overflow-hidden flex flex-col justify-between p-4 md:p-8 border-b lg:border-b-0 lg:border-r border-white/10">
        {/* Background Showcase Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={imageSrc}
            alt="Spettacolo Supercar Studio View"
            className="w-full h-full object-cover object-center transition-all duration-500"
            style={{
              // Subtle CSS tint filter to reflect selected paint color if not default
              filter:
                selectedColor.hex !== '#f95700' && selectedModel === 'svj'
                  ? `hue-rotate(${
                      selectedColor.hex === '#f59e0b'
                        ? '-20deg'
                        : selectedColor.hex === '#22c55e'
                        ? '100deg'
                        : selectedColor.hex === '#0284c7'
                        ? '180deg'
                        : selectedColor.hex === '#ef4444'
                        ? '-40deg'
                        : '0deg'
                    })`
                  : undefined,
            }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Top Controls: Model Switcher & Camera View Selector */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          {/* Model Selector Pill */}
          <div className="flex items-center gap-1 p-1 bg-black/70 backdrop-blur-md rounded-xl border border-white/15 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedModel('svj')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                selectedModel === 'svj' ? 'bg-[#ff5500] text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Spettacolo SVJ (V12)
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('sto')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                selectedModel === 'sto' ? 'bg-cyan-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Spettacolo STO (V10)
            </button>
          </div>

          {/* View Perspective Selector */}
          {selectedModel === 'svj' && (
            <div className="flex items-center gap-1 p-1 bg-black/70 backdrop-blur-md rounded-xl border border-white/15 text-xs">
              <button
                type="button"
                onClick={() => setPreviewView('scissor')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  previewView === 'scissor' ? 'bg-white/20 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Scissor Doors
              </button>
              <button
                type="button"
                onClick={() => setPreviewView('canyon')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  previewView === 'canyon' ? 'bg-white/20 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Canyon Asphalt
              </button>
              <button
                type="button"
                onClick={() => setPreviewView('cockpit')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  previewView === 'cockpit' ? 'bg-white/20 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cockpit
              </button>
            </div>
          )}
        </div>

        {/* Bottom HUD: Selected Livery Specs Banner */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 bg-black/70 backdrop-blur-xl border border-white/15 p-3.5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-full border border-white/40 shadow-inner"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <div>
              <span className="text-xs text-slate-400">Selected Specification: </span>
              <span className="text-xs font-bold text-white font-display">
                {selectedColor.name} · {finishType.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-300">
            <span className="text-slate-400">Aero: </span>
            <span className="font-semibold text-[#ff5500] uppercase">{aeroPackage}</span>
          </div>
        </div>
      </div>

      {/* Atelier Configuration Sidebar (Right 35%) */}
      <div className="w-full lg:w-[460px] bg-[#0d0f17] flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#ff5500]">
                Bespoke Atelier
              </span>
              <h2 className="text-xl font-bold text-white font-display uppercase tracking-tight">
                Ad Personam Studio
              </h2>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
              title="Reset configuration to canonical defaults"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-black/50 rounded-xl border border-white/5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('paint')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'paint' ? 'bg-[#ff5500] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Paint</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wheels')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'wheels' ? 'bg-[#ff5500] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>Calipers</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('aero')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'aero' ? 'bg-[#ff5500] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Aero</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('interior')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'interior' ? 'bg-[#ff5500] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interior</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 space-y-6 flex-1">
          {/* Paint Tab */}
          {activeTab === 'paint' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2.5">
                  Exterior Body Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {PAINT_COLORS.map((col) => {
                    const isSelected = selectedColor.hex === col.hex;
                    return (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={`group relative p-2 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
                          isSelected
                            ? 'border-[#ff5500] bg-white/5 ring-2 ring-[#ff5500]/30'
                            : 'border-white/10 hover:border-white/30 bg-black/20'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-full shadow-inner border border-white/20 flex items-center justify-center transition-transform group-hover:scale-105"
                          style={{ backgroundColor: col.hex }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                        </div>
                        <span className="text-[11px] font-medium text-slate-200 line-clamp-1">
                          {col.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2.5">
                  Clearcoat Sheen Finish
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'metallic', name: 'Metallic Pearl', desc: 'Deep liquid shine with micro-flakes', price: 'Standard' },
                    { id: 'gloss', name: 'High Gloss Mirror', desc: 'Ultra-reflective glass clearcoat', price: '+$6,800' },
                    { id: 'matte', name: 'Silk Satin Matte', desc: 'Anti-glare stealth finish', price: '+$14,500' },
                    { id: 'carbon', name: 'Exposed Twill Carbon', desc: 'Raw structural carbon weave', price: '+$38,000' },
                  ].map((fin) => {
                    const isSelected = finishType === fin.id;
                    return (
                      <button
                        key={fin.id}
                        type="button"
                        onClick={() => setFinishType(fin.id as typeof finishType)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#ff5500] bg-[#ff5500]/10'
                            : 'border-white/10 hover:border-white/20 bg-black/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{fin.name}</span>
                          <span className="text-[11px] text-[#ff5500] font-mono">{fin.price}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{fin.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Calipers Tab */}
          {activeTab === 'wheels' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Monobloc CCB Brake Caliper Finish
              </label>
              <div className="space-y-2.5">
                {CALIPER_COLORS.map((cal) => {
                  const isSelected = selectedCaliper.hex === cal.hex;
                  return (
                    <button
                      key={cal.hex}
                      type="button"
                      onClick={() => setSelectedCaliper(cal)}
                      className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-[#ff5500] bg-[#ff5500]/10'
                          : 'border-white/10 hover:border-white/20 bg-black/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg border border-white/20 shadow"
                          style={{ backgroundColor: cal.hex }}
                        />
                        <span className="text-xs font-medium text-white">{cal.name}</span>
                      </div>
                      <span className="text-xs text-[#ff5500] font-mono tabular-nums">
                        {cal.price === 0 ? 'Included' : `+$${cal.price.toLocaleString()}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Aero Tab */}
          {activeTab === 'aero' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Aerodynamic Package
              </label>
              {[
                {
                  id: 'svj',
                  title: 'ALA 2.0 Full Carbon System',
                  desc: 'Includes active dual-channel rear wing, front splitter with internal micro-actuators, and forged carbon endplates.',
                  price: '+$22,000',
                },
                {
                  id: 'track',
                  title: 'Corsa Extreme Track Downforce',
                  desc: 'High angle-of-attack circuit wing with dual dive canards on front fascia for maximum lateral canyon grip.',
                  price: '+$34,500',
                },
                {
                  id: 'touring',
                  title: 'Touring High-Speed Profile',
                  desc: 'Low-drag profile with flush carbon underbody diffuser for maximum top-speed grand touring.',
                  price: 'Included',
                },
              ].map((pack) => {
                const isSelected = aeroPackage === pack.id;
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setAeroPackage(pack.id as typeof aeroPackage)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#ff5500] bg-[#ff5500]/10'
                        : 'border-white/10 hover:border-white/20 bg-black/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white font-display uppercase tracking-wide">
                        {pack.title}
                      </span>
                      <span className="text-xs font-mono text-[#ff5500] font-semibold">
                        {pack.price}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{pack.desc}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Interior Tab */}
          {activeTab === 'interior' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Cockpit Alcantara &amp; Carbon Upholstery
              </label>
              {[
                {
                  name: 'Nero Ade + Arancio Q-Citura',
                  desc: 'Full black Alcantara with matching orange diamond cross-stitching and 12 o’clock racing stripe.',
                  price: 'Included',
                },
                {
                  name: 'Nero Ade + Giallo Taurus',
                  desc: 'Monochrome Alcantara with precision yellow embroidery and matte carbon center tunnel.',
                  price: '+$4,500',
                },
                {
                  name: 'Bianco Leda Full Leather',
                  desc: 'Italian full-grain semi-aniline white leather with heated carbon sport monocoque bucket seats.',
                  price: '+$8,400',
                },
              ].map((int) => (
                <div key={int.name} className="p-4 rounded-xl border border-white/10 bg-black/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{int.name}</span>
                    <span className="text-xs font-mono text-[#ff5500]">{int.price}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{int.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Summary & Action CTAs */}
        <div className="p-6 border-t border-white/10 bg-black/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Total Commission MSRP</span>
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                ${calculatedPrice.toLocaleString()}{' '}
                <span className="text-xs text-slate-400 font-sans font-normal">USD</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedCode ? 'Code Copied!' : buildCode}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                const specText = `SPETTACOLO BESPOKE DOSSIER\nModel: ${selectedModel.toUpperCase()}\nBuild Code: ${buildCode}\nColor: ${selectedColor.name}\nFinish: ${finishType}\nCaliper: ${selectedCaliper.name}\nAero: ${aeroPackage}\nTotal MSRP: $${calculatedPrice.toLocaleString()} USD`;
                const blob = new Blob([specText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Spettacolo_Build_${buildCode}.txt`;
                a.click();
              }}
              className="py-2.5 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Spec Sheet</span>
            </button>

            <button
              type="button"
              onClick={onOpenVipModal}
              className="py-2.5 px-4 rounded-xl bg-[#ff5500] hover:bg-[#ff661a] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#ff5500]/25"
            >
              <span>Reserve Allocation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
