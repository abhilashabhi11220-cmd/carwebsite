import React, { useState } from 'react';
import { CarCanvas, SUPERCAR_HOTSPOTS } from '../components/3d/CarCanvas';
import { CarConfig } from '../components/3d/SupercarModel';
import { audioEngine } from '../utils/audioEngine';
import { 
  Volume2, VolumeX, Eye, ArrowRight, Gauge, 
  Wind, Zap, Shield, Sparkles, SlidersHorizontal, Info, X
} from 'lucide-react';

interface ShowroomPageProps {
  config: CarConfig;
  onUpdateConfig: (newConfig: Partial<CarConfig>) => void;
  onNavigate: (page: 'showroom' | 'configurator' | 'aerodynamics' | 'drive' | 'gallery') => void;
  onOpenVipModal: () => void;
}

export const ShowroomPage: React.FC<ShowroomPageProps> = ({
  config,
  onUpdateConfig,
  onNavigate,
  onOpenVipModal,
}) => {
  const [cameraPreset, setCameraPreset] = useState<
    'front-quarter' | 'profile' | 'rear-quarter' | 'top' | 'scissor' | 'cockpit'
  >('front-quarter');
  const [activeHotspot, setActiveHotspot] = useState<(typeof SUPERCAR_HOTSPOTS)[0] | null>(null);
  const [isAudioRunning, setIsAudioRunning] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [revCounter, setRevCounter] = useState(0);

  const toggleDoors = () => {
    const nextDoorState = config.doorAngle > 0.5 ? 0 : 1;
    audioEngine.playScissorDoorSound();
    onUpdateConfig({ doorAngle: nextDoorState });
    if (nextDoorState === 1 && cameraPreset === 'front-quarter') {
      setCameraPreset('scissor');
    }
  };

  const toggleAudio = () => {
    if (audioEngine.getIsRunning()) {
      audioEngine.stopEngine();
      setIsAudioRunning(false);
    } else {
      audioEngine.startEngine();
      setIsAudioRunning(true);
    }
  };

  const handleRevEngine = () => {
    audioEngine.revEngine(7800);
    setRevCounter((prev) => prev + 1);
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-4.5rem)] flex flex-col justify-between overflow-hidden">
      {/* 3D Supercar Viewport */}
      <div className="absolute inset-0 z-0">
        <CarCanvas
          config={config}
          cameraPreset={cameraPreset}
          autoRotate={autoRotate}
          activeHotspotId={activeHotspot?.id || null}
          onSelectHotspot={(spot) => {
            setActiveHotspot(spot);
            if (spot) {
              if (spot.id === 'scissor-doors') setCameraPreset('scissor');
              if (spot.id === 'rear-wing') setCameraPreset('rear-quarter');
              if (spot.id === 'v12-engine') setCameraPreset('top');
              if (spot.id === 'aero-splitter') setCameraPreset('front-quarter');
            }
          }}
        />
      </div>

      {/* Top Overlay Info & Camera Angle Controls */}
      <div className="relative z-10 pt-6 px-4 md:px-8 max-w-7xl mx-auto w-full pointer-events-none flex flex-col md:flex-row justify-between items-start gap-4">
        {/* Title & Badge */}
        <div className="pointer-events-auto max-w-md">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#ff5500]">
            <span>6.5L V12 Superveloce Jota</span>
            <span aria-hidden="true">·</span>
            <span>Sant’Agata Purebred</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white uppercase font-display mt-1 drop-shadow-md">
            Spettacolo SVJ
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed drop-shadow">
            Aerodinamica Lamborghini Attiva 2.0 with active scissor doors and naturally aspirated V12 acoustics.
          </p>
        </div>

        {/* Camera Preset Toolbar */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 p-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
          <button
            type="button"
            onClick={() => setCameraPreset('front-quarter')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              cameraPreset === 'front-quarter'
                ? 'bg-[#ff5500] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Front 3/4
          </button>
          <button
            type="button"
            onClick={() => {
              setCameraPreset('scissor');
              if (config.doorAngle === 0) onUpdateConfig({ doorAngle: 1 });
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              cameraPreset === 'scissor'
                ? 'bg-[#ff5500] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Scissor Doors
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('rear-quarter')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              cameraPreset === 'rear-quarter'
                ? 'bg-[#ff5500] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Rear Wing
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('profile')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              cameraPreset === 'profile'
                ? 'bg-[#ff5500] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Side Profile
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('cockpit')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              cameraPreset === 'cockpit'
                ? 'bg-[#ff5500] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Cockpit
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1.5 text-xs rounded-lg flex items-center gap-1 transition-all ${
              autoRotate ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Auto-rotate turntable"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">360°</span>
          </button>
        </div>
      </div>

      {/* Selected Hotspot Detail Card (Floating overlay) */}
      {activeHotspot && (
        <div className="relative z-20 mx-4 md:mx-8 max-w-md pointer-events-auto bg-[#11141d]/90 backdrop-blur-xl border border-white/15 p-4 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-pulse" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                {activeHotspot.name}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setActiveHotspot(null)}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {activeHotspot.description}
          </p>
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Inspected Component</span>
            <button
              type="button"
              onClick={() => onNavigate('aerodynamics')}
              className="text-[#ff5500] hover:text-[#ff6a1a] font-medium flex items-center gap-1"
            >
              <span>Explore Aero Specs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Control Bar & Performance Metric Ticker */}
      <div className="relative z-10 pb-6 px-4 md:px-8 max-w-7xl mx-auto w-full pointer-events-none">
        <div className="bg-[#0b0d14]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 pointer-events-auto shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Key Metric Ticker with Tabular Numerals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full lg:w-auto text-center sm:text-left">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Power</div>
              <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums">
                770 <span className="text-xs text-[#ff5500] font-sans font-semibold">CV / 759 HP</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">0 - 100 km/h</div>
              <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums">
                2.8 <span className="text-xs text-slate-400 font-sans">sec</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Max Velocity</div>
              <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums">
                &gt; 352 <span className="text-xs text-slate-400 font-sans">km/h</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Max Torque</div>
              <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums">
                720 <span className="text-xs text-slate-400 font-sans">Nm @ 6750 rpm</span>
              </div>
            </div>
          </div>

          {/* Real-Time Interactive Car Actuators */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
            {/* Scissor Doors Toggle */}
            <button
              type="button"
              onClick={toggleDoors}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all ${
                config.doorAngle > 0.5
                  ? 'bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/25'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{config.doorAngle > 0.5 ? 'Close Scissor Doors' : 'Open Scissor Doors'}</span>
            </button>

            {/* Headlights Toggle */}
            <button
              type="button"
              onClick={() => onUpdateConfig({ headlightsOn: !config.headlightsOn })}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                config.headlightsOn ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{config.headlightsOn ? 'Y-LEDs On' : 'Lights Off'}</span>
            </button>

            {/* V12 Audio Engine & Rev Throttle */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleAudio}
                className={`p-2 text-xs rounded-lg transition-colors ${
                  isAudioRunning ? 'bg-[#ff5500] text-white' : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
                title={isAudioRunning ? 'Mute V12 Audio' : 'Start V12 Audio'}
              >
                {isAudioRunning ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleRevEngine}
                className="px-3 py-2 text-xs font-semibold bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg transition-colors active:scale-95 flex items-center gap-1"
                title="Rev 6.5L Naturally Aspirated V12"
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Rev V12</span>
              </button>
            </div>

            {/* Primary Page Link CTAs */}
            <button
              type="button"
              onClick={() => onNavigate('configurator')}
              className="px-4 py-2 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 rounded-lg transition-all flex items-center gap-1.5 shadow-md whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Customize 3D</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('drive')}
              className="px-4 py-2 text-xs font-semibold bg-[#ff5500] hover:bg-[#ff661a] text-white rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-[#ff5500]/25 whitespace-nowrap"
            >
              <span>Drive Canyon</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
