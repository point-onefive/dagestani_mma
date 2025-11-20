'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PixelBlast from '@/components/PixelBlast';
import TextType from '@/components/TextType';

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
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-80">
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

      <div className="relative z-10 w-full max-w-3xl px-4 py-10 flex flex-col items-center text-center">
        <div className="flex items-center justify-center">
          <TextType
            text={[
              'Welcome to DagStats',
              'Dagestan Born Fighters',
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
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-md leading-relaxed">
          Data-driven insights for sportsbooks.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-sm justify-center">
          <NavButton href="/upcoming" label="Upcoming Fights" />
          <NavButton href="/historical" label="Historical Data" secondary />
        </div>
      </div>
    </main>
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
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98, y: 1 }}
        className={`w-full py-2.5 rounded-lg border text-xs sm:text-sm font-medium shadow-md backdrop-blur transition-all ${
          secondary
            ? 'bg-black/30 border-slate-700/50 text-slate-200 hover:border-slate-600'
            : 'bg-purple-500/70 border-purple-400/60 text-white hover:bg-purple-500/80'
        }`}
      >
        {label}
      </motion.button>
    </Link>
  );
}
