'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import PixelBlast from '@/components/PixelBlast';
import TextType from '@/components/TextType';

export default function HomePage() {
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
        <TextType
          text={['Dagestan UFC Tracker', 'Dagestani Dominance, Quantified.']}
          typingSpeed={70}
          pauseDuration={1400}
          showCursor={true}
          className="text-3xl sm:text-4xl md:text-5xl font-semibold"
        />
        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl">
          Automatically tracks upcoming and historical UFC fights involving
          Dagestani fighters, and calculates their running win rate over time.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <NavButton href="/upcoming" label="Upcoming Matches" />
          <NavButton href="/historical" label="Historical Matches" secondary />
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
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97, y: 1 }}
        className={`w-full py-3 rounded-xl border text-sm sm:text-base font-medium shadow-lg backdrop-blur ${
          secondary
            ? 'bg-black/40 border-slate-600 text-slate-100'
            : 'bg-purple-500/80 border-purple-400 text-white'
        }`}
      >
        {label}
      </motion.button>
    </Link>
  );
}
