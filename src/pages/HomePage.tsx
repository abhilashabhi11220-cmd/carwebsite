import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SUPERCAR_MODELS } from '../data/carData';
import { audioEngine } from '../utils/audioEngine';
import { 
  Volume2, VolumeX, ArrowRight, Gauge, Wind, Zap, 
  Shield, Sparkles, SlidersHorizontal, Eye, ChevronRight, Check,
  Play, Pause, Film, Gamepad2
} from 'lucide-react';

interface HomePageProps {
  onOpenVipModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenVipModal }) => {
  const [mediaMode, setMediaMode] = useState<'video' | 'photo'>('video');
  const [selectedView, setSelectedView] = useState<'scissor' | 'canyon' | 'cockpit' | 'engine'>('scissor');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const viewImages = {
    scissor: '/src/assets/images/aventador_svj_frame27_1790265181205.jpg',
    canyon: '/src/assets/images/canyon_supercar_hero_1790264551849.jpg',
    cockpit: '/src/assets/images/supercar_cockpit_interior_1790264577730.jpg',
    engine: '/src/assets/images/supercar_v12_engine_1790264590707.jpg',
  };

  const hotspots = [
    {
      id: 'scissor-doors',
      label: 'Bespoke Scissor Doors',
      x: '38%',
      y: '30%',
      desc: 'Upward-opening doors on forged lightweight alloy hinges revealing the full carbon-fiber monocoque sill.',
    },
    {
      id: 'splitter',
      label: 'ALA 2.0 Front Splitter',
      x: '28%',
      y: '72%',
      desc: 'Active aerodynamic flaps actively channel airflow beneath the carbon chassis or over the front bumper in 500ms.',
    },
    {
      id: 'wheels',
      label: 'Forged Leirion 21" Wheels',
      x: '46%',
      y: '72%',
      desc: 'Forged lightweight monobloc wheels clamping 400mm carbon ceramic ventilated brake discs with 6-piston calipers.',
    },
    {
      id: 'wing',
      label: 'Active Aero Carbon Wing',
      x: '76%',
      y: '48%',
      desc: 'Integrated ALA 2.0 rear wing with internal micro-actuated air ducts providing active aero vectoring.',
    },
  ];

  const handleRev = () => {
    audioEngine.revEngine(8200);
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsVideoMuted(videoRef.current.muted);
  };

  return (
    <div className="w-full bg-[#090a0f] text-slate-100">
      {/* Grand Hero Section with Video / Scissor Door Car */}
      <section className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-white/10">
        {/* Background Supercar Video or Image */}
        <div className="absolute inset-0 z-0 bg-black">
          {mediaMode === 'video' ? (
            <video
              ref={videoRef}
              src="/assets/canyon_supercar_video.mp4"
              autoPlay
              loop
              muted={isVideoMuted}
              playsInline
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <img
              src={viewImages[selectedView]}
              alt="Spettacolo SVJ Arancio Supercar with Scissor Doors Open"
              className="w-full h-full object-cover object-center transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-black/25 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent" />
        </div>

        {/* Hotspots layer (only when in photo scissor view) */}
        {mediaMode === 'photo' && selectedView === 'scissor' && (
          <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
            {hotspots.map((spot) => (
              <div
                key={spot.id}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: spot.x, top: spot.y }}
              >
                <button
                  type="button"
                  onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    activeHotspot === spot.id
                      ? 'bg-[#ff5500] text-white scale-125 ring-4 ring-[#ff5500]/40'
                      : 'bg-black/80 text-[#ff5500] border border-[#ff5500] hover:scale-110 shadow-lg'
                  }`}
                  title={spot.label}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                </button>

                {activeHotspot === spot.id && (
                  <div className="absolute left-9 top-1/2 -translate-y-1/2 w-64 bg-[#0e111a]/95 backdrop-blur-xl border border-white/20 p-3 rounded-xl shadow-2xl z-20 text-xs animate-in fade-in duration-200">
                    <div className="font-bold text-[#ff5500] font-display uppercase tracking-wide">
                      {spot.label}
                    </div>
                    <p className="text-slate-300 mt-1 leading-relaxed">{spot.desc}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Top Hero Text */}
        <div className="relative z-10 pt-10 px-4 md:px-12 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5500]/15 border border-[#ff5500]/30 text-xs font-semibold text-[#ff5500] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sant’Agata V12 Flagship · Scissor Doors Purebred</span>
              </div>

              {mediaMode === 'video' && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[11px] font-mono font-bold text-rose-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  <span>4K Canyon Reel</span>
                </div>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-white font-display leading-[0.95]">
              Spettacolo <span className="text-[#ff5500]">SVJ</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 max-w-xl font-normal leading-relaxed drop-shadow">
              Patented Aerodinamica Lamborghini Attiva (ALA 2.0), upward-opening scissor doors, and an uninhibited 770 CV naturally aspirated V12 engine.
            </p>

            {/* Quick CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/configurator"
                className="px-6 py-3 bg-[#ff5500] hover:bg-[#ff661a] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-[#ff5500]/30 flex items-center gap-2"
              >
                <span>Customize This Car</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMediaMode('video');
                  if (videoRef.current) {
                    videoRef.current.play();
                    setIsVideoPlaying(true);
                  }
                }}
                className={`px-5 py-3 border font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                  mediaMode === 'video'
                    ? 'bg-white/20 border-white/40 text-white'
                    : 'bg-black/60 hover:bg-black/80 border-white/20 text-slate-200'
                }`}
              >
                <Film className="w-4 h-4 text-[#ff5500]" />
                <span>Watch 4K Video</span>
              </button>

              <Link
                to="/game"
                className="px-6 py-3 bg-cyan-600/90 hover:bg-cyan-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-600/25 flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Play Canyon Rush</span>
              </Link>

              <button
                type="button"
                onClick={handleRev}
                className="px-4 py-3 bg-rose-600/90 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 active:scale-95"
                title="Rev Naturally Aspirated V12 to 8,200 RPM"
              >
                <Gauge className="w-4 h-4" />
                <span>Rev V12</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Hero Bar: Video / Photo Switcher & Performance Telemetry */}
        <div className="relative z-10 pb-8 px-4 md:px-12 max-w-7xl mx-auto w-full">
          <div className="bg-[#0b0e17]/85 backdrop-blur-xl border border-white/15 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Media Mode & Perspective Tabs */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Toggle Video vs High-Res Stills */}
              <div className="p-1 bg-black/60 rounded-xl border border-white/15 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMediaMode('video')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    mediaMode === 'video'
                      ? 'bg-[#ff5500] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Cinematic Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaMode('photo')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    mediaMode === 'photo'
                      ? 'bg-[#ff5500] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Photo Angles</span>
                </button>
              </div>

              {/* Video Play / Mute Controls */}
              {mediaMode === 'video' && (
                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/15">
                  <button
                    type="button"
                    onClick={toggleVideoPlay}
                    className="p-1.5 text-xs rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                    title={isVideoPlaying ? 'Pause Video' : 'Play Video'}
                  >
                    {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleVideoMute}
                    className="p-1.5 text-xs rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                    title={isVideoMuted ? 'Unmute Video Audio' : 'Mute Video Audio'}
                  >
                    {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Angle buttons (active in photo mode) */}
              {mediaMode === 'photo' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedView('scissor')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedView === 'scissor'
                        ? 'bg-[#ff5500] text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    Scissor Doors
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedView('canyon')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedView === 'canyon'
                        ? 'bg-[#ff5500] text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    Canyon Run
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedView('cockpit')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedView === 'cockpit'
                        ? 'bg-[#ff5500] text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    Cockpit
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedView('engine')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedView === 'engine'
                        ? 'bg-[#ff5500] text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    V12 Engine
                  </button>
                </div>
              )}
            </div>

            {/* Performance Metric Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full lg:w-auto text-center sm:text-left border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0">
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Power Output</div>
                <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums">
                  770 <span className="text-xs text-[#ff5500] font-sans">CV</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">0 - 100 KM/H</div>
                <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums">
                  2.8 <span className="text-xs text-slate-400 font-sans">sec</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Top Velocity</div>
                <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums">
                  &gt; 352 <span className="text-xs text-slate-400 font-sans">km/h</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Downforce @ 300km/h</div>
                <div className="text-xl md:text-2xl font-bold text-[#ff5500] font-mono tabular-nums">
                  490 <span className="text-xs text-slate-400 font-sans">kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 1: The Iconic Scissor Doors & Carbon Architecture */}
      <section className="py-20 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs uppercase tracking-widest text-[#ff5500] font-semibold">
              Distinctive Engineering
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white font-display">
              Upward-Opening Scissor Doors
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              First introduced to the automotive world by Marcello Gandini on the legendary Countach LP400, the upward-opening scissor door remains the definitive design hallmark of our flagship V12 supercars.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Engineered on forged aerospace-grade aluminum hinges, the doors swing open effortlessly while exposing the raw carbon-fiber weave of the central monocoque tub.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="p-3.5 rounded-xl bg-[#11141f] border border-white/10">
                <div className="text-xs text-slate-400 uppercase">Hinge Construction</div>
                <div className="text-base font-bold text-white mt-1">Forged Alloy Pivot</div>
                <div className="text-xs text-[#ff5500] mt-0.5">Hydraulic strut dampened</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#11141f] border border-white/10">
                <div className="text-xs text-slate-400 uppercase">Monocoque Cell</div>
                <div className="text-base font-bold text-white mt-1">Full Twill Carbon</div>
                <div className="text-xs text-emerald-400 mt-0.5">35,000 Nm/° Rigidity</div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/performance"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#ff5500] hover:text-[#ff6a1a] uppercase tracking-wider"
              >
                <span>Read ALA 2.0 Technical Dossier</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl group">
              <img
                src="/src/assets/images/aventador_svj_frame27_1790265181205.jpg"
                alt="Orange supercar with open scissor doors on canyon asphalt"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-xs text-white">
                  <span className="font-semibold text-[#ff5500]">Canyon Overlook: </span>
                  <span>Arancio Atlas paintwork with black forged aero components.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Explore the Dedicated Pages */}
      <section className="py-16 px-4 md:px-12 max-w-7xl mx-auto border-t border-white/10">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-[#ff5500] font-semibold">
            Digital Experience
          </span>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-white font-display mt-1">
            Navigate the Spettacolo Platform
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Explore dedicated sections engineered for automotive enthusiasts and bespoke commissioners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/models"
            className="group p-6 rounded-2xl bg-[#11141f] border border-white/10 hover:border-[#ff5500]/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#ff5500]/10 border border-[#ff5500]/30 flex items-center justify-center text-[#ff5500] mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
                1. Models Fleet
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Compare the V12 Spettacolo SVJ against the track-homologated Spettacolo STO V10.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-[#ff5500] group-hover:translate-x-1 transition-transform">
              <span>View Models</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            to="/configurator"
            className="group p-6 rounded-2xl bg-[#11141f] border border-white/10 hover:border-[#ff5500]/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#ff5500]/10 border border-[#ff5500]/30 flex items-center justify-center text-[#ff5500] mb-4">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
                2. Ad Personam Studio
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Select exterior liveries, clearcoat finishes, brake calipers, and download build dossiers.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-[#ff5500] group-hover:translate-x-1 transition-transform">
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            to="/game"
            className="group p-6 rounded-2xl bg-[#11141f] border border-white/10 hover:border-cyan-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
                3. Canyon Rush Arcade
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Drive the orange supercar at 350+ km/h, dodge traffic, collect Nitro, and set high scores.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Play Game</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          <Link
            to="/gallery"
            className="group p-6 rounded-2xl bg-[#11141f] border border-white/10 hover:border-[#ff5500]/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#ff5500]/10 border border-[#ff5500]/30 flex items-center justify-center text-[#ff5500] mb-4">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">
                4. Film &amp; Heritage
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                4K canyon sprint cinema reel, scissor door deployment breakdown, and 60-year V12 lineage.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-[#ff5500] group-hover:translate-x-1 transition-transform">
              <span>View Film Reel</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};
