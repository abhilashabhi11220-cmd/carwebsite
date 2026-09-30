import React, { useState } from 'react';
import { CanyonDriveCanvas } from '../components/3d/CanyonDriveCanvas';
import { CarConfig } from '../components/3d/SupercarModel';
import { 
  Gauge, Compass, Sun, Moon, Sunset, Play, RotateCcw, 
  Volume2, VolumeX, Shield, ArrowRight 
} from 'lucide-react';

interface CanyonDrivePageProps {
  carConfig: CarConfig;
  onNavigate: (page: 'showroom' | 'configurator' | 'aerodynamics' | 'drive' | 'gallery') => void;
  onOpenVipModal: () => void;
}

export const CanyonDrivePage: React.FC<CanyonDrivePageProps> = ({
  carConfig,
  onNavigate,
  onOpenVipModal,
}) => {
  const [timeOfDay, setTimeOfDay] = useState<'sunset' | 'noon' | 'night'>('sunset');
  const [telemetry, setTelemetry] = useState({
    speedKmh: 0,
    rpm: 800,
    gear: 'N',
    lateralG: 0,
    throttle: 0,
  });

  return (
    <div className="relative w-full h-[calc(100vh-4.5rem)] bg-[#090a0f] overflow-hidden flex flex-col justify-between">
      {/* 3D Canyon Drive Canvas */}
      <div className="absolute inset-0 z-0">
        <CanyonDriveCanvas
          carConfig={carConfig}
          timeOfDay={timeOfDay}
          onTelemetryUpdate={setTelemetry}
        />
      </div>

      {/* Top HUD: Time of Day Selector & Experience Header */}
      <div className="relative z-10 pt-4 px-4 md:px-8 max-w-7xl mx-auto w-full pointer-events-none flex flex-wrap items-center justify-between gap-4">
        <div className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#ff5500] uppercase tracking-wider">
            <span>Dynamic Canyon Run</span>
            <span aria-hidden="true">·</span>
            <span>Real-time WebGL Physics</span>
          </div>
          <div className="text-sm font-bold text-white font-display uppercase tracking-wide">
            Sierra Canyon High-Speed Pass
          </div>
        </div>

        {/* Time of day selector */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
          <button
            type="button"
            onClick={() => setTimeOfDay('sunset')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              timeOfDay === 'sunset' ? 'bg-[#ff5500] text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sunset className="w-3.5 h-3.5" />
            <span>Golden Sunset (Video)</span>
          </button>
          <button
            type="button"
            onClick={() => setTimeOfDay('noon')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              timeOfDay === 'noon' ? 'bg-[#ff5500] text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>High Desert Noon</span>
          </button>
          <button
            type="button"
            onClick={() => setTimeOfDay('night')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              timeOfDay === 'night' ? 'bg-[#ff5500] text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Midnight Canyon</span>
          </button>
        </div>
      </div>

      {/* Bottom HUD: Digital Instrument Gauge Cluster */}
      <div className="relative z-10 pb-6 px-4 md:px-8 max-w-5xl mx-auto w-full pointer-events-none">
        <div className="bg-[#0a0c12]/85 backdrop-blur-xl border border-white/15 rounded-2xl p-4 md:p-5 shadow-2xl pointer-events-auto">
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Speedometer (Left 4 cols) */}
            <div className="col-span-12 sm:col-span-4 flex items-baseline gap-2 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0">
              <span className="text-4xl md:text-5xl font-black text-white font-mono tabular-nums tracking-tighter">
                {telemetry.speedKmh}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#ff5500] uppercase font-display">KM / H</span>
                <span className="text-[10px] text-slate-400">
                  {Math.round(telemetry.speedKmh * 0.621371)} MPH
                </span>
              </div>
            </div>

            {/* Tachometer RPM & Shift Lights (Center 5 cols) */}
            <div className="col-span-12 sm:col-span-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 uppercase">Engine Speed:</span>
                  <span className="text-white font-bold tabular-nums">{telemetry.rpm} RPM</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 text-[10px]">GEAR:</span>
                  <span className="px-2 py-0.5 bg-[#ff5500] text-white font-black rounded text-xs font-mono">
                    {telemetry.gear}
                  </span>
                </div>
              </div>

              {/* Sequential RPM Bar */}
              <div className="w-full bg-black/60 rounded-full h-3.5 p-0.5 border border-white/10 overflow-hidden flex items-center">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    telemetry.rpm > 7500
                      ? 'bg-rose-500 animate-pulse'
                      : telemetry.rpm > 5500
                      ? 'bg-amber-400'
                      : 'bg-[#ff5500]'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(5, (telemetry.rpm / 8500) * 100))}%`,
                  }}
                />
              </div>

              {/* RPM scale markers */}
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1k</span>
                <span>3k</span>
                <span>5k</span>
                <span>7k</span>
                <span className="text-rose-400 font-bold">8.5k RED</span>
              </div>
            </div>

            {/* Lateral G & Actions (Right 3 cols) */}
            <div className="col-span-12 sm:col-span-3 flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0">
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400">Lateral Load</div>
                <div className="text-lg font-bold text-white font-mono tabular-nums">
                  {telemetry.lateralG > 0 ? `+${telemetry.lateralG}` : telemetry.lateralG} G
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('configurator')}
                className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                title="Customize this car"
              >
                Atelier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
