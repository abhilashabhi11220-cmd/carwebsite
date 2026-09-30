import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Volume2, VolumeX, ShieldCheck, Gamepad2 } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface TopBarProps {
  onOpenVipModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenVipModal }) => {
  const [isAudioRunning, setIsAudioRunning] = useState(false);

  useEffect(() => {
    setIsAudioRunning(audioEngine.getIsRunning());
  }, []);

  const handleAudioToggle = () => {
    if (audioEngine.getIsRunning()) {
      audioEngine.stopEngine();
      setIsAudioRunning(false);
    } else {
      audioEngine.startEngine();
      setIsAudioRunning(true);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 transition-colors whitespace-nowrap text-sm font-medium ${
      isActive ? 'text-[#ff5500] font-semibold' : 'text-slate-300 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full h-[4.5rem] bg-[#090a0f]/95 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 flex items-center justify-between transition-colors">
      {/* Brand Logo / Wordmark */}
      <Link
        to="/"
        className="text-lg md:text-xl font-bold tracking-tight text-white font-display uppercase hover:text-[#ff5500] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5500]" />
        <span>Spettacolo V12</span>
      </Link>

      {/* Primary Navigation Links with real React Router routing */}
      <nav className="hidden lg:flex items-center gap-6">
        <NavLink to="/" className={navLinkClass} end>
          {({ isActive }) => (
            <>
              <span>Overview</span>
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5500] rounded-full" />}
            </>
          )}
        </NavLink>

        <NavLink to="/models" className={navLinkClass}>
          {({ isActive }) => (
            <>
              <span>Models</span>
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5500] rounded-full" />}
            </>
          )}
        </NavLink>

        <NavLink to="/configurator" className={navLinkClass}>
          {({ isActive }) => (
            <>
              <span>Configurator</span>
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5500] rounded-full" />}
            </>
          )}
        </NavLink>

        <NavLink to="/performance" className={navLinkClass}>
          {({ isActive }) => (
            <>
              <span>Performance</span>
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5500] rounded-full" />}
            </>
          )}
        </NavLink>

        <NavLink to="/gallery" className={navLinkClass}>
          {({ isActive }) => (
            <>
              <span>Film</span>
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5500] rounded-full" />}
            </>
          )}
        </NavLink>

        <NavLink to="/game" className={navLinkClass}>
          {({ isActive }) => (
            <div className="flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-[#ff5500]" />
              <span>Arcade Game</span>
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5500] rounded-full" />}
            </div>
          )}
        </NavLink>

        <NavLink to="/commission" className={navLinkClass}>
          {({ isActive }) => (
            <>
              <span>Commission</span>
              {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5500] rounded-full" />}
            </>
          )}
        </NavLink>
      </nav>

      {/* Sound Controller & Commission Action */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          to="/game"
          className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#ff5500] border border-white/10"
          title="Play Canyon Sprint Game"
        >
          <Gamepad2 className="w-4 h-4" />
        </Link>

        <button
          type="button"
          onClick={handleAudioToggle}
          className={`p-2 rounded-lg text-xs transition-colors ${
            isAudioRunning
              ? 'bg-[#ff5500] text-white shadow-sm shadow-[#ff5500]/30'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
          }`}
          title={isAudioRunning ? 'Mute V12 Engine Sound' : 'Start V12 Engine Audio'}
          aria-label="Toggle V12 Engine Audio"
        >
          {isAudioRunning ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onOpenVipModal}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#ff5500] hover:bg-[#ff661a] rounded-lg transition-all shadow-md shadow-[#ff5500]/25 whitespace-nowrap flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Inquire</span>
        </button>
      </div>
    </header>
  );
};
