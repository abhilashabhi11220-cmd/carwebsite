import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SUPERCAR_MODELS, SupercarModel } from '../data/carData';
import { ArrowRight, Gauge, Wind, Zap, Shield, Check, SlidersHorizontal } from 'lucide-react';

interface ModelsPageProps {
  onOpenVipModal: () => void;
}

export const ModelsPage: React.FC<ModelsPageProps> = ({ onOpenVipModal }) => {
  const [activeModelId, setActiveModelId] = useState<'svj' | 'sto'>('svj');
  const activeCar = SUPERCAR_MODELS.find((m) => m.id === activeModelId) || SUPERCAR_MODELS[0];

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#090a0f] text-slate-100 pb-20">
      {/* Header */}
      <section className="pt-12 pb-8 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-widest text-[#ff5500] font-semibold">
            Sant’Agata Supercar Fleet
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white font-display mt-1">
            Choose Your Machine
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            From the naturally aspirated 6.5L V12 flagship with scissor doors to the circuit-homologated V10 track weapon with roof air snorkel and shark fin.
          </p>
        </div>

        {/* Model Tabs */}
        <div className="flex items-center gap-3 mt-8 border-b border-white/10 pb-4">
          {SUPERCAR_MODELS.map((car) => {
            const isSelected = activeModelId === car.id;
            return (
              <button
                key={car.id}
                type="button"
                onClick={() => setActiveModelId(car.id as 'svj' | 'sto')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/25'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <span>{car.name}</span>
                <span className="text-[10px] opacity-75">({car.id === 'svj' ? 'V12' : 'V10'})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Hero Showcase of Active Selected Model */}
      <section className="px-4 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0e111a] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
          {/* Visual Column */}
          <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-white/15 aspect-[16/10] bg-black group">
            <img
              src={activeCar.primaryImage}
              alt={activeCar.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 bg-black/70 backdrop-blur-md border border-white/15 rounded-lg text-xs font-semibold text-[#ff5500] uppercase font-display">
                {activeCar.badge}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-xs text-white">
              <div>
                <div className="font-bold font-display uppercase text-sm">{activeCar.name}</div>
                <div className="text-slate-300">{activeCar.subtitle}</div>
              </div>
              <div className="font-mono font-bold text-base text-[#ff5500]">
                ${activeCar.basePrice.toLocaleString()} USD
              </div>
            </div>
          </div>

          {/* Specs & Description Column */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="text-xs text-[#ff5500] font-semibold uppercase tracking-wider">
                Vehicle Overview
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold uppercase text-white font-display mt-1">
                {activeCar.name}
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {activeCar.description}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                <span className="text-slate-400">Powertrain Engine</span>
                <span className="text-white font-mono font-bold">{activeCar.engine}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                <span className="text-slate-400">Total Power</span>
                <span className="text-[#ff5500] font-mono font-bold">{activeCar.power}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                <span className="text-slate-400">0 - 100 km/h</span>
                <span className="text-white font-mono font-bold">{activeCar.acceleration}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                <span className="text-slate-400">Top Track Velocity</span>
                <span className="text-white font-mono font-bold">{activeCar.topSpeed}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/10 text-xs">
                <span className="text-slate-400">Door Kinematics</span>
                <span className="text-white font-medium">{activeCar.doorsType}</span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                to="/configurator"
                className="px-5 py-2.5 bg-[#ff5500] hover:bg-[#ff661a] text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-[#ff5500]/25 flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Configure in Studio</span>
              </Link>

              <button
                type="button"
                onClick={onOpenVipModal}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-colors border border-white/10"
              >
                Request Allocation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Comparison Table */}
      <section className="mt-20 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-[#ff5500] font-semibold">
            Head-to-Head Comparison
          </span>
          <h3 className="text-2xl font-bold uppercase tracking-tight text-white font-display mt-1">
            Technical Benchmark
          </h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0e111a]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 font-semibold text-slate-300 uppercase">Specification</th>
                <th className="p-4 font-bold text-[#ff5500] uppercase font-display">Spettacolo SVJ (V12)</th>
                <th className="p-4 font-bold text-cyan-400 uppercase font-display">Spettacolo STO (V10)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-4 text-slate-400">Aspirated Displacement</td>
                <td className="p-4 font-mono text-white font-semibold">6.5 Liters (6,498 cc)</td>
                <td className="p-4 font-mono text-white font-semibold">5.2 Liters (5,204 cc)</td>
              </tr>
              <tr>
                <td className="p-4 text-slate-400">Cylinder Architecture</td>
                <td className="p-4 font-mono text-white">V12 60° Dry Sump</td>
                <td className="p-4 font-mono text-white">V10 90° Dry Sump</td>
              </tr>
              <tr>
                <td className="p-4 text-slate-400">Maximum Horsepower</td>
                <td className="p-4 font-mono font-bold text-[#ff5500]">770 CV (759 hp) @ 8,500 rpm</td>
                <td className="p-4 font-mono font-bold text-cyan-400">640 CV (631 hp) @ 8,000 rpm</td>
              </tr>
              <tr>
                <td className="p-4 text-slate-400">0 - 100 km/h (0 - 62 mph)</td>
                <td className="p-4 font-mono font-bold text-white">2.8 seconds</td>
                <td className="p-4 font-mono font-bold text-white">3.0 seconds</td>
              </tr>
              <tr>
                <td className="p-4 text-slate-400">Top Speed</td>
                <td className="p-4 font-mono text-white">&gt; 352 km/h (219 mph)</td>
                <td className="p-4 font-mono text-white">310 km/h (193 mph)</td>
              </tr>
              <tr>
                <td className="p-4 text-slate-400">Aerodynamic Downforce</td>
                <td className="p-4 font-mono text-white">490 kg @ 300 km/h (ALA 2.0)</td>
                <td className="p-4 font-mono text-white">420 kg @ 280 km/h (Shark Fin)</td>
              </tr>
              <tr>
                <td className="p-4 text-slate-400">Doors Kinematics</td>
                <td className="p-4 text-white font-semibold">Upward Scissor Doors</td>
                <td className="p-4 text-white">Lightweight Conventional</td>
              </tr>
              <tr>
                <td className="p-4 text-slate-400">Base Price (MSRP)</td>
                <td className="p-4 font-mono font-bold text-[#ff5500]">$517,770 USD</td>
                <td className="p-4 font-mono font-bold text-cyan-400">$334,500 USD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
