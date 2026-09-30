import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wind, Gauge, Zap, Compass, Activity, ShieldCheck, 
  ArrowRight, Cpu, Layers, CheckCircle2 
} from 'lucide-react';

interface PerformancePageProps {
  onOpenVipModal: () => void;
}

export const PerformancePage: React.FC<PerformancePageProps> = ({ onOpenVipModal }) => {
  const [activeAeroMode, setActiveAeroMode] = useState<'downforce' | 'lowdrag' | 'vectoring'>('downforce');
  const [activeTechTab, setActiveTechTab] = useState<'ala' | 'v12' | 'chassis' | 'brakes'>('ala');

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#090a0f] text-slate-100 pb-20">
      {/* Header Banner */}
      <section className="pt-12 pb-8 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-widest text-[#ff5500] font-semibold">
            Aerodinamica Lamborghini Attiva 2.0
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white font-display mt-1">
            Aerodynamics &amp; Engineering
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Patented active flaps, titanium intake manifolds, and a carbon-fiber monocoque passenger cell designed to conquer the world’s most demanding asphalt.
          </p>
        </div>
      </section>

      {/* Aerodynamic Simulation Showcase */}
      <section className="px-4 md:px-12 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#0e111a] shadow-2xl p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Column */}
            <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-white/10 aspect-[16/9] bg-black">
              <img
                src="/src/assets/images/aventador_svj_frame27_1790265181205.jpg"
                alt="ALA 2.0 Aerodynamics on Canyon Pass"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Dynamic Vector Overlay based on active mode */}
              <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                <div className="w-full flex items-center justify-between text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-[#ff5500]">
                    Front Splitter Flaps: {activeAeroMode === 'downforce' ? 'CLOSED (High Downforce)' : 'OPEN (Low Drag)'}
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-cyan-400">
                    Rear Wing Ducts: {activeAeroMode === 'vectoring' ? 'SPLIT (Aero Vectoring)' : activeAeroMode === 'downforce' ? 'SEALED' : 'VENTED'}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-xs text-white">
                <div>
                  <div className="text-[11px] text-slate-400">Current Wind Tunnel Simulation</div>
                  <div className="font-bold font-display uppercase text-sm text-[#ff5500]">
                    {activeAeroMode === 'downforce'
                      ? 'Maximum Downforce Setup (490 kg @ 300 km/h)'
                      : activeAeroMode === 'lowdrag'
                      ? 'Low Drag Velocity Mode (Cd 0.33)'
                      : 'Active Aero Vectoring (High Speed Cornering)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Mode Controls & Telemetry Column */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs text-[#ff5500] uppercase font-semibold tracking-wider">
                  Active Control Mode
                </span>
                <h2 className="text-2xl font-bold uppercase text-white font-display mt-1">
                  ALA 2.0 Dynamic Actuation
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Electric micro-actuators open or close active flaps in less than 500 milliseconds, optimizing air resistance according to real-time throttle, steering angle, and braking demand.
                </p>
              </div>

              {/* 3 Simulation Modes */}
              <div className="space-y-2.5">
                {[
                  {
                    id: 'downforce',
                    title: 'Max Downforce Mode',
                    desc: 'Flaps closed, generating 490 kg of downforce for maximum cornering traction.',
                    stat: '490 kg Downforce',
                  },
                  {
                    id: 'lowdrag',
                    title: 'Low Drag High-Speed Mode',
                    desc: 'Front and rear ducts vented to minimize drag for top speed acceleration over 352 km/h.',
                    stat: 'Cd 0.33 Drag',
                  },
                  {
                    id: 'vectoring',
                    title: 'Aero Vectoring Mode',
                    desc: 'Differential flap opening between left and right channels to eliminate steering roll.',
                    stat: '0.4s Latency',
                  },
                ].map((mode) => {
                  const isSelected = activeAeroMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setActiveAeroMode(mode.id as typeof activeAeroMode)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#ff5500] bg-[#ff5500]/15 ring-1 ring-[#ff5500]/30'
                          : 'border-white/10 hover:border-white/20 bg-black/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-display uppercase">
                          {mode.title}
                        </span>
                        <span className="text-xs font-mono text-[#ff5500] font-semibold">
                          {mode.stat}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{mode.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Pillars Tabs */}
      <section className="mt-20 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { id: 'ala', title: 'ALA 2.0 Aerodynamics', subtitle: 'Patented Active Flaps' },
            { id: 'v12', title: 'Naturally Aspirated V12', subtitle: '770 CV @ 8,500 RPM' },
            { id: 'chassis', title: 'Carbon Monocoque', subtitle: 'Full Passenger Tub' },
            { id: 'brakes', title: 'CCB Brakes & Magnetics', subtitle: 'Carbon Ceramics & Pushrod' },
          ].map((tab) => {
            const isSelected = activeTechTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTechTab(tab.id as typeof activeTechTab)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#ff5500] bg-[#ff5500]/10 ring-1 ring-[#ff5500]/30'
                    : 'border-white/10 hover:border-white/20 bg-[#0e111a]'
                }`}
              >
                <div className="text-sm font-bold text-white font-display uppercase tracking-wide">
                  {tab.title}
                </div>
                <div className="text-xs text-slate-400 mt-1">{tab.subtitle}</div>
              </button>
            );
          })}
        </div>

        {/* Tab Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#0e111a] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl items-center">
          <div className="lg:col-span-7 space-y-5">
            {activeTechTab === 'ala' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-[#ff5500] uppercase tracking-wider">
                  Active Aero Mastery
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  Aerodinamica Lamborghini Attiva (ALA 2.0)
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Incorporating redesigned air channels and electric micro-motors, ALA 2.0 varies aerodynamic load to optimize stability or speed depending on dynamic driving situations. The active flaps in the front splitter and rear engine hood coordinate instantaneously with the Lamborghini Dinamica Veicolo Attiva 2.0 (LDVA) central brain.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-slate-400">Downforce Increase</div>
                    <div className="text-xl font-bold text-white font-mono mt-1">+40%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Actuation Time</div>
                    <div className="text-xl font-bold text-[#ff5500] font-mono mt-1">&lt; 0.5s</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Aero Distribution</div>
                    <div className="text-xl font-bold text-white font-mono mt-1">43 : 57</div>
                  </div>
                </div>
              </div>
            )}

            {activeTechTab === 'v12' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-[#ff5500] uppercase tracking-wider">
                  Naturally Aspirated Heart
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  6.5-Liter 60° Naturally Aspirated V12
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Generating 770 CV at 8,500 rpm with a specific output of 118.5 CV per liter. Titanium intake valves, optimized dry-sump lubrication, and modified intake runners provide immediate throttle response and a mechanical symphony with zero turbo lag.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-slate-400">Displacement</div>
                    <div className="text-xl font-bold text-white font-mono mt-1">6,498 cc</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Redline RPM</div>
                    <div className="text-xl font-bold text-[#ff5500] font-mono mt-1">8,700 RPM</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Peak Torque</div>
                    <div className="text-xl font-bold text-white font-mono mt-1">720 Nm</div>
                  </div>
                </div>
              </div>
            )}

            {activeTechTab === 'chassis' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-[#ff5500] uppercase tracking-wider">
                  Structural Rigidity
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  Single-Piece Carbon Monocoque Tub
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  The carbon-fiber monocoque provides extreme occupant protection, minimal torsional deflection, and lightweight structural integrity with a dry curb weight of just 1,525 kg, achieving an exceptional weight-to-power ratio of 1.98 kg/CV.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-slate-400">Torsional Rigidity</div>
                    <div className="text-xl font-bold text-white font-mono mt-1">35,000 Nm/°</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Power-to-Weight</div>
                    <div className="text-xl font-bold text-[#ff5500] font-mono mt-1">1.98 kg/CV</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Subframes</div>
                    <div className="text-xl font-bold text-white font-mono mt-1">Alloy Forged</div>
                  </div>
                </div>
              </div>
            )}

            {activeTechTab === 'brakes' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-[#ff5500] uppercase tracking-wider">
                  Motorsport Braking
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  CCB Carbon Ceramic Rotors &amp; ISR Shifter
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Dual hydraulic circuit braking system with 6-piston front monobloc calipers clamping 400x38mm ventilated carbon-ceramic discs, operating in tandem with Independent Shifting Rods (ISR) transmission shifting gears in 50ms.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs text-slate-400">100 - 0 km/h</div>
                    <div className="text-xl font-bold text-[#ff5500] font-mono mt-1">30.0 m</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Shift Speed</div>
                    <div className="text-xl font-bold text-white font-mono mt-1">50 ms</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Front Rotors</div>
                    <div className="text-xl font-bold text-white font-mono mt-1">400 x 38mm</div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 flex items-center gap-3">
              <Link
                to="/configurator"
                className="px-5 py-2.5 bg-[#ff5500] hover:bg-[#ff661a] text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-[#ff5500]/25 flex items-center gap-1.5"
              >
                <span>Configure This Powertrain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={onOpenVipModal}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-colors border border-white/10"
              >
                Inquire With Engineering Team
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] bg-black">
            <img
              src="/src/assets/images/supercar_v12_engine_1790264590707.jpg"
              alt="6.5L V12 Naturally Aspirated Engine Bay"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <div className="text-xs text-white">
                <span className="font-semibold text-[#ff5500]">Engine Craftsmanship: </span>
                <span>Naturally aspirated 60° V12 with carbon structural brace.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
