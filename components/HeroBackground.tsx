'use client';

import { ReactNode } from 'react';

interface HeroBackgroundProps {
  children: ReactNode;
}

export default function HeroBackground({ children }: HeroBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Layer 1: Cinematic landscape background with zoom animation (z-0) */}
      <div 
        className="absolute inset-0 bg-[url('/enhancements/landscape-1.png')] bg-cover bg-center hero-zoom"
        style={{
          willChange: 'transform',
          zIndex: 0,
        }}
      />

      {/* Layer 2: Deeper cinematic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80 pointer-events-none" />

      {/* Layer 3: Atmospheric haze layer (z-10) */}
      <div 
        className="absolute inset-0 pointer-events-none animate-fade-in"
        style={{ zIndex: 10 }}
      >
        <img
          src="/enhancements/landscape-haze.png"
          alt=""
          className="w-full h-full object-cover opacity-12 md:opacity-12 sm:opacity-8"
          style={{
            animation: 'fadeIn 0.8s ease-out',
          }}
        />
      </div>

      {/* Layer 4: Bottom fog layer for atmospheric depth */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />

      {/* Layer 5 & 6: Content layer (PixelBlast z-20 + hero text z-30) */}
      <div className="relative" style={{ zIndex: 30 }}>
        {children}
      </div>
    </div>
  );
}
