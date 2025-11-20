'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PixelBlast from '@/components/PixelBlast';
import TextType from '@/components/TextType';
import HeroBackground from '@/components/HeroBackground';

export default function HomePage() {
  const [winRate, setWinRate] = useState('74.3');

  useEffect(() => {
    // Fetch the actual win rate from stats API
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.winRate) {
          setWinRate(data.winRate.toFixed(1));
        }
      })
      .catch(err => {
        console.error('Failed to load stats:', err);
      });
  }, []);

  return (
    <HeroBackground>
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-screen">
        {/* PixelBlast with parallax zoom animation - z-20 layer */}
        <div className="absolute inset-0 pointer-events-none opacity-70" style={{ animation: 'heroZoom 18s ease-in-out infinite alternate', zIndex: 20 }}>
          <PixelBlast
            variant="circle"
            pixelSize={6}
            color="#B19EEF"
            patternScale={3}
            patternDensity={1.2}
            pixelSizeJitter={0.5}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.6}
            edgeFade={0.25}
            transparent
          />
        </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-3xl px-4 py-10 flex flex-col items-center text-center"
        style={{ zIndex: 40 }}
      >
        <div className="flex items-center justify-center relative">
          {/* Scanline overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                to bottom,
                rgba(255,255,255,0.06) 0px,
                rgba(255,255,255,0.03) 2px,
                transparent 3px,
                transparent 6px
              )`
            }}
          />
          <TextType
            text={[
              'Welcome to DagStats',
              'Dagestan-Born Fighters',
              'Dominance Quantified',
              'Track Mountain Warriors',
              'Never Miss A Fight',
              `${winRate}% Win Rate`,
              'Data-Driven Intelligence',
            ]}
            typingSpeed={60}
            pauseDuration={2000}
            showCursor={true}
            className="text-3xl sm:text-4xl md:text-5xl font-semibold"
          />
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-3 text-sm sm:text-base text-slate-300 max-w-md leading-relaxed"
        >
          Data-driven insights for sportsbooks.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-sm justify-center"
        >
          <NavButton href="/upcoming" label="Upcoming Fights" />
          <NavButton href="/historical" label="Historical Data" secondary />
        </motion.div>
      </motion.div>
    </main>
    </HeroBackground>
  );
}

function NavButton({
  href,
  label,
  secondary = false,
}: {
  href: string;
  label: string;
  secondary?: boolean;
}) {
  return (
    <Link href={href} className="w-full">
      <motion.button
        whileHover={{ 
          scale: 1.02, 
          y: -1,
          boxShadow: secondary 
            ? '0 0 12px rgba(150, 80, 255, 0.3), 0 0 24px rgba(150, 80, 255, 0.15)'
            : '0 0 12px rgba(150, 80, 255, 0.6), 0 0 24px rgba(150, 80, 255, 0.4)'
        }}
        whileTap={{ scale: 0.98, y: 1 }}
        className={`w-full py-2.5 rounded-lg border text-xs sm:text-sm font-medium shadow-md backdrop-blur transition-all ${
          secondary
            ? 'bg-black/30 border-slate-700/50 text-slate-200 hover:border-purple-500/50'
            : 'bg-purple-500/70 border-purple-400/60 text-white hover:bg-purple-500/80'
        }`}
        style={{
          boxShadow: secondary 
            ? '0 0 6px rgba(150, 80, 255, 0.15)'
            : '0 0 12px rgba(150, 80, 255, 0.4), 0 0 24px rgba(150, 80, 255, 0.25)'
        }}
      >
        {label}
      </motion.button>
    </Link>
  );
}
