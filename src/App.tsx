/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TopBar } from './components/layout/TopBar';
import { MobileNav } from './components/layout/MobileNav';
import { HomePage } from './pages/HomePage';
import { ModelsPage } from './pages/ModelsPage';
import { ConfiguratorPage } from './pages/ConfiguratorPage';
import { PerformancePage } from './pages/PerformancePage';
import { GalleryPage } from './pages/GalleryPage';
import { GamePage } from './pages/GamePage';
import { CommissionPage } from './pages/CommissionPage';
import { VipModal } from './components/common/VipModal';

export default function App() {
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  const carConfig = {
    bodyColor: '#f95700',
    finishType: 'metallic' as const,
    wheelColor: '#18181b',
    caliperColor: '#f97316',
    aeroPackage: 'svj' as const,
    doorAngle: 1,
    headlightsOn: true,
    highBeamsOn: false,
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col selection:bg-[#ff5500] selection:text-white pb-14 md:pb-0">
        {/* Navigation TopBar with real router links */}
        <TopBar onOpenVipModal={() => setIsVipModalOpen(true)} />

        {/* Real Route Mapping */}
        <main className="flex-1 relative flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage onOpenVipModal={() => setIsVipModalOpen(true)} />} />
            <Route path="/models" element={<ModelsPage onOpenVipModal={() => setIsVipModalOpen(true)} />} />
            <Route path="/configurator" element={<ConfiguratorPage onOpenVipModal={() => setIsVipModalOpen(true)} />} />
            <Route path="/performance" element={<PerformancePage onOpenVipModal={() => setIsVipModalOpen(true)} />} />
            <Route path="/gallery" element={<GalleryPage onOpenVipModal={() => setIsVipModalOpen(true)} />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/commission" element={<CommissionPage />} />
            {/* Fallback to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Mobile Navigation Bar */}
        <MobileNav />

        {/* VIP Inquiry Modal */}
        <VipModal
          isOpen={isVipModalOpen}
          onClose={() => setIsVipModalOpen(false)}
          config={carConfig}
          calculatedPrice={517770}
        />
      </div>
    </Router>
  );
}
