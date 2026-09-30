import React, { useState } from 'react';
import { CarCanvas } from '../components/3d/CarCanvas';
import { CarConfig } from '../components/3d/SupercarModel';
import { 
  Wind, Gauge, Zap, Compass, Activity, ShieldCheck, 
  ArrowRight, Cpu, ChevronRight 
} from 'lucide-react';

interface AerodynamicsPageProps {
  config: CarConfig;
  onNavigate: (page: 'showroom' | 'configurator' | 'aerodynamics' | 'drive' | 'gallery') => void;
  onOpenVipModal: () => void;
}

export const AerodynamicsPage: React.FC<AerodynamicsPageProps> = ({
  config,
  onNavigate,
  onOpenVipModal,
}) => {
  const [windMode, setWindMode] = useState<'downforce' | 'lowdrag' | 'vectoring'>('downforce');
  const [selectedTech, setSelectedTech] = useState<'v12' | 'ala' | 'chassis' | 'ccb'>('ala');

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#090a0f] text-slate-100 pb-16">
      {/* 3D Wind Tunnel Interactive Header */}
      <div className="relative w-full h-[58vh] bg-[#07080c] overflow-hidden border-b border-white/10">
        <CarCanvas
          config={config}
          showWindTunnel={true}
          windTunnelMode={windMode}
          cameraPreset="front-quarter"
          autoRotate={false}
        />

        {/* Top Floating Header overlay */}
        <div className="absolute top-6 left-6 right-6 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pointer-events-none">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#ff5500] font-semibold">
              <Wind className="w-4 h-4" />
              <span>Aerodinamica Lamborghini Attiva 2.0</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-tight text-white font-display mt-1">
              Active Aero &amp; Wind Tunnel
            </h1>
          </div>

          {/* Mode Selector Buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-black/70 backdrop-blur-md border border-white/15 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setWindMode('downforce')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                windMode === 'downforce' ? 'bg-[#ff5500] text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Max Downforce (490 kg)</span>
            </button>
            <button
              type="button"
              onClick={() => setWindMode('lowdrag')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                windMode === 'lowdrag' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Low Drag (Top Speed)</span>
            </button>
            <button
              type="button"
              onClick={() => setWindMode('vectoring')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                windMode === 'vectoring' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Aero Vectoring (Cornering)</span>
            </button>
          </div>
        </div>

        {/* Real-time Wind Tunnel Telemetry Overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-black/75 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl text-xs">
            <div>
              <span className="text-slate-400">Total Downforce @ 300 km/h: </span>
              <span className="text-white font-mono font-bold tabular-nums">
                {windMode === 'downforce' ? '490 kg' : windMode === 'lowdrag' ? '180 kg' : '365 kg'}
              </span>
            </div>
            <span className="text-slate-600">·</span>
            <div>
              <span className="text-slate-400">Drag Coefficient (Cd): </span>
              <span className="text-[#ff5500] font-mono font-bold tabular-nums">
                {windMode === 'downforce' ? '0.44' : windMode === 'lowdrag' ? '0.33' : '0.38'}
              </span>
            </div>
            <span className="text-slate-600">·</span>
            <div>
              <span className="text-slate-400">Actuation Latency: </span>
              <span className="text-emerald-400 font-mono font-bold tabular-nums">&lt; 500 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Deep Dive Sections */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-[#ff5500] font-semibold">
            Engineering Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white font-display mt-1">
            Pure Naturally Aspirated Mastery
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mt-2 leading-relaxed">
            The Spettacolo SVJ unites extreme carbon-fiber aerodynamics, high-revving V12 acoustics, and race-bred pushrod magnetorheological suspension.
          </p>
        </div>

        {/* 4-Tab Component Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { id: 'ala', title: 'ALA 2.0 System', subtitle: 'Active Aerodynamics' },
            { id: 'v12', title: '6.5L V12 Engine', subtitle: '770 CV Naturally Aspirated' },
            { id: 'chassis', title: 'Carbon Monocoque', subtitle: 'Torsional Rigidity' },
            { id: 'ccb', title: 'CCB Brakes & ISR', subtitle: 'Track Stopping Power' },
          ].map((item) => {
            const isSelected = selectedTech === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedTech(item.id as typeof selectedTech)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#ff5500] bg-[#ff5500]/10 ring-1 ring-[#ff5500]/30'
                    : 'border-white/10 hover:border-white/25 bg-[#10131c]'
                }`}
              >
                <div className="text-sm font-bold text-white font-display uppercase tracking-wide">
                  {item.title}
                </div>
                <div className="text-xs text-slate-400 mt-1">{item.subtitle}</div>
              </button>
            );
          })}
        </div>

        {/* Detailed Breakdown Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#10131c] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl items-center">
          {/* Left / Info Column */}
          <div className="lg:col-span-7 space-y-6">
            {selectedTech === 'ala' && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#ff5500] uppercase tracking-wider">
                  <Wind className="w-4 h-4" />
                  <span>Patented Active Aerodynamic Channels</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white font-display">
                  Aerodinamica Lamborghini Attiva 2.0
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  The ALA 2.0 system incorporates redesigned air intakes and aero channels. The system actively varies aerodynamic load to achieve either high downforce or low drag, depending on dynamic driving conditions. Electronically actuated motors open or close active flaps in the front splitter and in the engine hood.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-slate-400">Downforce Gain</div>
                    <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">+40%</div>
                    <div className="text-[11px] text-slate-500">Over SV Base Model</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Response Speed</div>
                    <div className="text-xl font-bold text-[#ff5500] font-mono tabular-nums mt-1">0.4 sec</div>
                    <div className="text-[11px] text-slate-500">Micro-Actuator Flaps</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Aero Balance</div>
                    <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">43 : 57</div>
                    <div className="text-[11px] text-slate-500">Front to Rear Ratio</div>
                  </div>
                </div>
              </div>
            )}

            {selectedTech === 'v12' && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#ff5500] uppercase tracking-wider">
                  <Gauge className="w-4 h-4" />
                  <span>Naturally Aspirated Benchmark</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white font-display">
                  6.5-Liter 60° Naturally Aspirated V12
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  With 770 CV delivered at 8,500 rpm and 720 Nm of torque at 6,750 rpm, the V12 power plant features titanium intake valves, modified intake runners, and a lightweight exhaust system that delivers an emotional, high-frequency sound curve.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-slate-400">Displacement</div>
                    <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">6,498 cc</div>
                    <div className="text-[11px] text-slate-500">Dry Sump Lubrication</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Specific Output</div>
                    <div className="text-xl font-bold text-[#ff5500] font-mono tabular-nums mt-1">118.5 CV/L</div>
                    <div className="text-[11px] text-slate-500">Highest for Series V12</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Redline RPM</div>
                    <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">8,700 RPM</div>
                    <div className="text-[11px] text-slate-500">Electronic Limiter</div>
                  </div>
                </div>
              </div>
            )}

            {selectedTech === 'chassis' && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#ff5500] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Carbon Fiber Tub Architecture</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white font-display">
                  Full Carbon Fiber Monocoque
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Single-piece passenger carbon cell combined with front and rear aluminum subframes guarantees exceptional passenger safety, minimal chassis flex, and an extraordinary torsional stiffness of 35,000 Nm per degree of deflection.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-slate-400">Dry Weight</div>
                    <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">1,525 kg</div>
                    <div className="text-[11px] text-slate-500">Weight-to-Power 1.98 kg/CV</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Torsional Rigidity</div>
                    <div className="text-xl font-bold text-[#ff5500] font-mono tabular-nums mt-1">35,000 Nm</div>
                    <div className="text-[11px] text-slate-500">Per Degree Deflection</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Weight Distribution</div>
                    <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">43% / 57%</div>
                    <div className="text-[11px] text-slate-500">Front / Rear Split</div>
                  </div>
                </div>
              </div>
            )}

            {selectedTech === 'ccb' && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#ff5500] uppercase tracking-wider">
                  <Activity className="w-4 h-4" />
                  <span>Motorsport Grade Deceleration</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white font-display">
                  CCB Carbon Ceramics &amp; 7-Speed ISR
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Dual hydraulic circuit braking system with 6-piston front and 4-piston rear monobloc calipers, operating in concert with Independent Shifting Rods (ISR) transmission that shifts gears in an astonishing 50 milliseconds.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-slate-400">Front Discs</div>
                    <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">400 x 38mm</div>
                    <div className="text-[11px] text-slate-500">Carbon Ceramic Rotors</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">100 - 0 km/h</div>
                    <div className="text-xl font-bold text-[#ff5500] font-mono tabular-nums mt-1">30.0 m</div>
                    <div className="text-[11px] text-slate-500">Stopping Distance</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Gear Shift Latency</div>
                    <div className="text-xl font-bold text-white font-mono tabular-nums mt-1">50 ms</div>
                    <div className="text-[11px] text-slate-500">ISR Dual Rod Actuation</div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('drive')}
                className="px-5 py-2.5 bg-[#ff5500] hover:bg-[#ff661a] text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-[#ff5500]/25"
              >
                <span>Test Drive in Canyon</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onOpenVipModal}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-colors border border-white/10"
              >
                Request Technical Dossier
              </button>
            </div>
          </div>

          {/* Right / Visual Column */}
          <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-[4/3]">
            <img
              src="/src/assets/images/supercar_v12_engine_1790264590707.jpg"
              alt="Naturally aspirated V12 engine mechanical details"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <div className="text-xs text-white">
                <span className="font-semibold text-[#ff5500]">Sant’Agata Assembly: </span>
                <span>Titanium manifold runners with structural carbon reinforcement.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
