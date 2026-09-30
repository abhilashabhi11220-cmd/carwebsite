import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Sliders, Wind, Film, Gamepad2 } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors ${
      isActive ? 'text-[#ff5500]' : 'text-slate-400 hover:text-white'
    }`;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090a0f]/95 backdrop-blur-xl border-t border-white/10 px-1 py-1.5 flex justify-around items-center">
      <NavLink to="/" end className={linkClass}>
        <Home className="w-4 h-4 mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/models" className={linkClass}>
        <Grid className="w-4 h-4 mb-0.5" />
        <span>Fleet</span>
      </NavLink>

      <NavLink to="/configurator" className={linkClass}>
        <Sliders className="w-4 h-4 mb-0.5" />
        <span>Custom</span>
      </NavLink>

      <NavLink to="/game" className={linkClass}>
        <Gamepad2 className="w-4 h-4 mb-0.5 text-[#ff5500]" />
        <span className="text-[#ff5500] font-bold">Game</span>
      </NavLink>

      <NavLink to="/performance" className={linkClass}>
        <Wind className="w-4 h-4 mb-0.5" />
        <span>Aero</span>
      </NavLink>

      <NavLink to="/gallery" className={linkClass}>
        <Film className="w-4 h-4 mb-0.5" />
        <span>Film</span>
      </NavLink>
    </nav>
  );
};
