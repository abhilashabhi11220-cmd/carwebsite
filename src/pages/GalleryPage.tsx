import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Pause, Film, Image as ImageIcon, Sparkles, 
  Calendar, MapPin, ChevronRight, X, Maximize2, ShieldCheck, ArrowRight,
  Volume2, VolumeX, RotateCcw, FastForward, Check
} from 'lucide-react';

interface GalleryPageProps {
  onOpenVipModal: () => void;
}

interface MediaItem {
  id: string;
  title: string;
  category: string;
  description: string;
  src: string;
  isVideo?: boolean;
  videoSrc?: string;
  location: string;
}

const MEDIA_GALLERY: MediaItem[] = [
  {
    id: 'canyon-official-video',
    title: 'Sierra Canyon High-Velocity Run & Scissor Doors (4K Film)',
    category: 'Cinematic Film',
    description: 'Official 4K dynamic footage of the Arancio SVJ carving desert mountain turns, sending dust plumes soaring, and revealing its iconic upward-opening scissor doors.',
    src: '/src/assets/images/canyon_supercar_hero_1790264551849.jpg',
    isVideo: true,
    videoSrc: '/assets/canyon_supercar_video.mp4',
    location: 'Sierra Canyon Pass, 2,100m',
  },
  {
    id: 'scissor-doors-hero',
    title: 'Bespoke Scissor Kinematics Overlook',
    category: 'Scissor Architecture',
    description: 'Iconic upward-opening scissor doors deployed against the golden mountain canyon horizon, displaying the exposed carbon-fiber tub.',
    src: '/src/assets/images/aventador_svj_frame27_1790265181205.jpg',
    location: 'Sierra Canyon Pass, 2,100m',
  },
  {
    id: 'canyon-sprint',
    title: 'High-Velocity Canyon Run',
    category: 'Dynamic Track',
    description: 'Carving through Sierra mountain asphalt at 8,200 RPM, kicking up dust plumes with ALA 2.0 downforce active.',
    src: '/src/assets/images/canyon_supercar_hero_1790264551849.jpg',
    location: 'Sierra Canyon Straightaway',
  },
  {
    id: 'scissor-stationary',
    title: 'Stationary Summit Overlook',
    category: 'Design Masterpiece',
    description: 'Pearlescent orange paintwork paired with black forged Leirion wheels and yellow CCB calipers.',
    src: '/src/assets/images/supercar_scissor_doors_1790264565645.jpg',
    location: 'Canyon Summit Vista',
  },
  {
    id: 'sto-track',
    title: 'Spettacolo STO Track Weapon',
    category: 'V10 Homologation',
    description: 'Featuring an integrated roof air snorkel, aerodynamic shark fin, and high-downforce swan neck rear wing.',
    src: '/src/assets/images/supercar_sto_blue_1790265138339.jpg',
    location: 'Alpine Circuit Road',
  },
  {
    id: 'cockpit-interior',
    title: 'Alcantara Sportivo Cockpit',
    category: 'Interior Craft',
    description: 'Hand-stitched Nero Ade Alcantara with Arancio Q-Citura embroidery, digital TFT telemetry, and carbon bucket seats.',
    src: '/src/assets/images/supercar_cockpit_interior_1790264577730.jpg',
    location: 'Sant’Agata Interior Atelier',
  },
  {
    id: 'v12-engine',
    title: '6.5L Naturally Aspirated V12',
    category: 'Powertrain',
    description: 'Pure 770 CV combustion heart with bronze manifold runners and structural carbon X-brace frame.',
    src: '/src/assets/images/supercar_v12_engine_1790264590707.jpg',
    location: 'Engine Dynamics Testing Facility',
  },
];

const VIDEO_CHAPTERS = [
  { time: 0, label: '00:00 · Canyon Entry Apex', desc: 'Accelerating into the high mountain switchbacks' },
  { time: 2.2, label: '00:02 · Lateral G Sweeper', desc: 'Active aero flaps channeling aerodynamic airflow' },
  { time: 4.8, label: '00:05 · High-Speed Dust Trail', desc: 'Rear diffuser creating negative aerodynamic pressure' },
  { time: 7.0, label: '00:07 · Overlook Braking', desc: 'Carbon-ceramic CCB discs decelerating from 200 km/h' },
  { time: 9.5, label: '00:09 · Scissor Doors Raised', desc: 'Dual upward doors deployed against the canyon sunset' },
];

const HERITAGE_TIMELINE = [
  {
    year: '1966',
    model: 'Miura P400',
    stat: '350 CV · Transverse V12',
    desc: 'The birth of the mid-engine supercar archetype. Marcello Gandini’s timeless aerodynamic masterpiece.',
  },
  {
    year: '1974',
    model: 'Countach LP400',
    stat: '375 CV · Scissor Doors Pioneer',
    desc: 'Introduced the world to upward-opening scissor doors, geometric wedge architecture, and longitudinal V12 layout.',
  },
  {
    year: '1990',
    model: 'Diablo VT',
    stat: '492 CV · First AWD Supercar',
    desc: 'Broke the 200 mph threshold with visceral roar and revolutionary viscous-traction all-wheel drive.',
  },
  {
    year: '2001',
    model: 'Murciélago LP670-4 SV',
    stat: '670 CV · SuperVeloce Carbon',
    desc: 'Aggressive carbon-fiber composite diet and batwing active air intakes engineered for top-speed stability.',
  },
  {
    year: '2018',
    model: 'Aventador SVJ',
    stat: '770 CV · 6:44.97 Nürburgring Record',
    desc: 'Reigned as the fastest production car on the Nürburgring Nordschleife powered by patented ALA 2.0 active aerodynamics.',
  },
  {
    year: '2024+',
    model: 'Revuelto',
    stat: '1,015 CV · V12 HPEV Hybrid',
    desc: 'The new dawn uniting naturally aspirated 6.5L V12 with triple electric torque vectoring motors.',
  },
];

export const GalleryPage: React.FC<GalleryPageProps> = ({ onOpenVipModal }) => {
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(true);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  // Dedicated Video Player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(12);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(true);
  const [viewMode, setViewMode] = useState<'video' | 'frames'>('video');

  useEffect(() => {
    if (!isPlayingSequence) return;
    const interval = setInterval(() => {
      setSequenceIndex((prev) => (prev + 1) % MEDIA_GALLERY.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlayingSequence]);

  const currentHeroMedia = MEDIA_GALLERY[sequenceIndex];

  // Video time tracking
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const jumpToChapter = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isVideoPlaying) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
    }
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

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsVideoMuted(videoRef.current.muted);
  };

  const toggleSpeed = () => {
    if (!videoRef.current) return;
    const speeds = [1, 1.5, 0.5];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#090a0f] text-slate-100 pb-20">
      {/* Cinematic Media Showcase Hero */}
      <section className="relative w-full h-[60vh] md:h-[70vh] bg-black overflow-hidden">
        {currentHeroMedia.isVideo ? (
          <video
            src="/assets/canyon_supercar_video.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center transform scale-105 transition-all duration-1000"
          />
        ) : (
          <img
            src={currentHeroMedia.src}
            alt={currentHeroMedia.title}
            className="w-full h-full object-cover object-center transition-all duration-1000 transform scale-105"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-black/40 to-black/30" />

        {/* Floating Scrim Info */}
        <div className="absolute bottom-10 left-4 md:left-12 right-4 md:right-12 z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-7xl mx-auto">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ff5500] uppercase tracking-widest">
              <span>{currentHeroMedia.category}</span>
              <span aria-hidden="true">·</span>
              <span>{currentHeroMedia.location}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-white font-display">
              {currentHeroMedia.title}
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed drop-shadow">
              {currentHeroMedia.description}
            </p>
          </div>

          {/* Sequence Controls */}
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setIsPlayingSequence(!isPlayingSequence)}
              className="p-3 bg-[#ff5500] hover:bg-[#ff661a] text-white rounded-xl transition-colors shadow-lg shadow-[#ff5500]/30"
              title={isPlayingSequence ? 'Pause Reel' : 'Play Reel'}
            >
              {isPlayingSequence ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="flex items-center gap-2 overflow-x-auto max-w-[280px] sm:max-w-none">
              {MEDIA_GALLERY.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSequenceIndex(idx);
                    setIsPlayingSequence(false);
                  }}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border shrink-0 transition-all ${
                    idx === sequenceIndex
                      ? 'border-[#ff5500] scale-105 ring-2 ring-[#ff5500]/40'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                  {item.isVideo && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Film className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Official 4K Cinematic Video Player Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 mt-16">
        <div className="rounded-3xl border border-white/15 bg-[#0e111a] p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#ff5500]/15 text-[#ff5500] text-xs font-semibold uppercase tracking-wider border border-[#ff5500]/30">
                  Featured 4K Film
                </span>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  60 FPS Master Direct Video
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white font-display mt-2">
                Supercar Driving on Mountain Road &amp; Scissor Door Reveal
              </h2>
            </div>

            {/* Mode switch */}
            <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('video')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'video'
                    ? 'bg-[#ff5500] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Cinematic Video</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('frames')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'frames'
                    ? 'bg-[#ff5500] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Scissor Door Frame</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Video Screen with Controls */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/15 bg-black group shadow-2xl">
                {viewMode === 'video' ? (
                  <video
                    ref={videoRef}
                    src="/assets/canyon_supercar_video.mp4"
                    autoPlay
                    loop={isLooping}
                    muted={isVideoMuted}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onClick={toggleVideoPlay}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                ) : (
                  <img
                    src="/src/assets/images/aventador_svj_frame27_1790265181205.jpg"
                    alt="Scissor doors deployed on mountain pass"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Video Overlay Watermark / Tag */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
                  <span className="px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-lg text-[11px] font-mono font-bold text-white border border-white/15">
                    {viewMode === 'video' ? '4K CINEMA REEL · CANYON HIGH-SPEED' : 'FRAME-027 · SCISSOR DOORS STOVE OVERLOOK'}
                  </span>
                </div>

                {/* Big Center Play Icon overlay if paused */}
                {viewMode === 'video' && !isVideoPlaying && (
                  <button
                    type="button"
                    onClick={toggleVideoPlay}
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#ff5500]/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-20 cursor-pointer"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </button>
                )}

                {/* Bottom Bar inside Video */}
                {viewMode === 'video' && (
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                    {/* Scrubber Range */}
                    <div className="w-full flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max={duration || 10}
                        step="0.1"
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff5500]"
                      />
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={toggleVideoPlay}
                          className="p-1.5 hover:text-[#ff5500] transition-colors"
                          title={isVideoPlaying ? 'Pause' : 'Play'}
                        >
                          {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={toggleMute}
                          className="p-1.5 hover:text-[#ff5500] transition-colors"
                          title={isVideoMuted ? 'Unmute' : 'Mute'}
                        >
                          {isVideoMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                        </button>

                        <span className="font-mono text-[11px] text-slate-300">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleSpeed}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-mono transition-colors"
                          title="Change Playback Speed"
                        >
                          {playbackSpeed}x
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsLooping(!isLooping)}
                          className={`p-1.5 rounded transition-colors ${isLooping ? 'text-[#ff5500]' : 'text-slate-400'}`}
                          title={isLooping ? 'Loop Enabled' : 'Loop Disabled'}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={handleFullscreen}
                          className="p-1.5 hover:text-[#ff5500] transition-colors"
                          title="Fullscreen"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Timeline Chapters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
                {VIDEO_CHAPTERS.map((ch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setViewMode('video');
                      jumpToChapter(ch.time);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      Math.abs(currentTime - ch.time) < 2
                        ? 'bg-[#ff5500]/15 border-[#ff5500] text-white ring-1 ring-[#ff5500]/30'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="text-[11px] font-bold font-mono text-[#ff5500]">
                      {ch.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {ch.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Telemetry & Story Dossier */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  <span>Scene 1: Dynamic Drive</span>
                  <span className="text-[#ff5500] font-mono">00:00 - 00:06</span>
                </div>
                <div className="text-sm font-bold text-white font-display mt-1">
                  Aerodynamic Downforce &amp; Dust Trails
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  The orange supercar tears along the two-lane mountain highway. With ALA active aero closed, 490 kg of downforce glues the chassis to the tarmac as dust plumes swirl behind the quad diffusers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  <span>Scene 2: Scissor Overlook</span>
                  <span className="text-[#ff5500] font-mono">00:06 - 00:12</span>
                </div>
                <div className="text-sm font-bold text-white font-display mt-1">
                  Iconic Upward Scissor Kinematics
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Coming to a stationary halt overlooking the Sierra canyon pass, the twin doors open smoothly upward at a 65° rake angle, spotlighting the pure carbon-fiber passenger monocoque.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#ff5500]/10 border border-[#ff5500]/30 space-y-2">
                <div className="text-xs font-bold text-[#ff5500] uppercase tracking-wider">
                  Technical Specifications Captured
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Exterior Color:</span>
                    <div className="font-semibold text-white">Arancio Atlas Pearlescent</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Door System:</span>
                    <div className="font-semibold text-white">Forged Scissor Hinges</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Aero System:</span>
                    <div className="font-semibold text-white">ALA 2.0 Active Vectoring</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Audio Note:</span>
                    <div className="font-semibold text-white">Naturally Aspirated V12</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/configurator"
                  className="w-full py-3 bg-[#ff5500] hover:bg-[#ff661a] text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-[#ff5500]/25 flex items-center justify-center gap-2"
                >
                  <span>Configure This Exact Arancio Supercar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to="/game"
                  className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Drive It in Canyon Rush Game</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Media Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#ff5500] font-semibold">
              Master Prints &amp; Video Reels
            </span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white font-display mt-1">
              Automotive Photography &amp; Film Reel
            </h2>
          </div>
          <div className="text-xs text-slate-400">Click any media item to view in high definition</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MEDIA_GALLERY.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#11141d] cursor-pointer shadow-xl transition-all duration-300 hover:border-[#ff5500]/50"
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {item.isVideo && (
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#ff5500] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 ml-0.5" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-[#ff5500] font-medium mb-1.5">
                  <span>{item.category}</span>
                  <span className="text-slate-400">{item.location}</span>
                </div>
                <h3 className="text-lg font-bold text-white font-display group-hover:text-[#ff5500] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* V12 Lineage Heritage Timeline */}
      <section className="max-w-7xl mx-auto px-4 md:px-12 mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#ff5500] font-semibold">
            Sant’Agata Bolognese Lineage
          </span>
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-white font-display mt-2">
            60 Years of V12 Scissor Heritage
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-2">
            Every generation elevated combustion engineering, aerodynamic extremity, and iconic upward-opening scissor doors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HERITAGE_TIMELINE.map((era) => (
            <div
              key={era.model}
              className="p-6 rounded-2xl bg-[#0e111a] border border-white/10 hover:border-[#ff5500]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-[#ff5500] bg-[#ff5500]/10 px-2.5 py-1 rounded-md">
                    {era.year}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{era.stat}</span>
                </div>
                <h3 className="text-xl font-bold text-white font-display uppercase tracking-wide">
                  {era.model}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{era.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Sant’Agata Heritage</span>
                <span className="text-[#ff5500] font-semibold">Historic Archive</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal (Supports Image & Video) */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="flex items-center justify-between text-white z-10">
            <div>
              <div className="text-xs text-[#ff5500] uppercase font-semibold">
                {selectedImage.category}
              </div>
              <div className="text-xl font-bold font-display">{selectedImage.title}</div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            {selectedImage.isVideo ? (
              <div className="max-w-4xl w-full aspect-video rounded-2xl overflow-hidden border border-white/20 bg-black shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                <video
                  src="/assets/canyon_supercar_video.mp4"
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>

          <div className="text-center text-xs text-slate-400 z-10">
            <span>{selectedImage.location}</span>
            <span className="mx-2">·</span>
            <span>{selectedImage.description}</span>
          </div>
        </div>
      )}
    </div>
  );
};
