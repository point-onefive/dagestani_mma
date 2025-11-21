'use client';

import { ReactNode, useRef } from 'react';
import Image from 'next/image';
import { useHeroParallax } from '@/hooks/useHeroParallax';

interface HeroBackgroundProps {
  children: ReactNode;
  gridContent?: ReactNode;
}

export default function HeroBackground({ children, gridContent }: HeroBackgroundProps) {
  const bgRef = useRef<HTMLDivElement>(null);
  const hazeRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useHeroParallax({
    backgroundRef: bgRef,
    hazeRef: hazeRef,
    gridRef: gridRef,
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Layer 1: Cinematic landscape background with parallax wrapper + zoom animation (z-0) */}
      <div 
        ref={bgRef}
        className="absolute inset-0 pointer-events-none"
        style={{ 
          zIndex: 0,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden' as const,
        }}
      >
        <div
          className="absolute inset-0 hero-zoom"
          style={{
            backgroundImage: "url('/enhancements/landscape-1.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>

      {/* Layer 2: Deeper cinematic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80 pointer-events-none" style={{ zIndex: 5 }} />

      {/* Layer 3: Atmospheric haze layer with parallax wrapper (z-10) */}
      <div 
        ref={hazeRef}
        className="absolute inset-0 pointer-events-none"
        style={{ 
          zIndex: 10,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden' as const,
        }}
      >
        <div className="absolute inset-0">
          <Image
            src="/enhancements/landscape-haze.png"
            alt=""
            fill
            className="object-cover opacity-12 md:opacity-12 sm:opacity-8"
            priority
          />
        </div>
      </div>

      {/* Layer 4: Bottom fog layer for atmospheric depth */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none md:h-64" style={{ zIndex: 15 }} />

      {/* Layer 4.5: Octagon glow ring (z-16) - subtle atmospheric halo */}
      <div 
        className="absolute pointer-events-none ring-pulse"
        style={{ 
          zIndex: 16,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -42%) scale(1.2)',
          width: '80%',
          maxWidth: '1200px',
          aspectRatio: '1/1'
        }}
      >
        <Image
          src="/enhancements/octagon-outline.png"
          alt=""
          fill
          className="object-contain"
          style={{ 
            opacity: 0.21,
            filter: 'blur(40px)',
            mixBlendMode: 'overlay'
          }}
          priority
        />
      </div>

      {/* Layer 5: PixelBlast grid with parallax (z-20) */}
      <div 
        ref={gridRef} 
        className="absolute inset-0 pointer-events-none opacity-70" 
        style={{ 
          zIndex: 20,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden' as const,
        }}
      >
        {gridContent}
      </div>

      {/* Layer 6: Content layer (hero text z-30) */}
      <div className="relative" style={{ zIndex: 30 }}>
        {children}
      </div>
    </div>
  );
}
