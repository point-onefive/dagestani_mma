// components/StatBox.tsx
'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import type { DagestanStats } from '@/lib/dagestan';
import ElectricBorder from './ElectricBorder';

interface StatBoxProps {
  stats: DagestanStats;
  earliestDate?: string;
  matchCount?: number;
}

export default function StatBox({ stats, earliestDate, matchCount }: StatBoxProps) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 18 });
  const percentText = useTransform(spring, value => `${value.toFixed(1)}%`);

  useEffect(() => {
    mv.set(stats.winRate);
  }, [stats.winRate, mv]);

  const formattedDate = earliestDate 
    ? new Date(earliestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  const displayMatchCount = matchCount ?? stats.total;
  const displayLookbackDate = formattedDate;

  return (
    <ElectricBorder
      color="#a855f7"
      speed={0.6}
      chaos={0.3}
      thickness={2}
      style={{ borderRadius: '1rem' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 w-full max-w-lg mx-auto rounded-2xl p-6 sm:p-8 relative"
      >
      <div className="text-xs uppercase tracking-wide text-slate-400 text-center mb-3">
        Historical Win Rate
      </div>
      <div className="flex flex-col items-center gap-2 relative">
        <motion.span 
          className="text-5xl sm:text-6xl font-bold text-purple-300"
          style={{
            textShadow: '0 0 20px rgba(190,120,255,0.5)'
          }}
        >
          {percentText}
        </motion.span>
        <span className="text-sm sm:text-base text-slate-300">
          {stats.wins} wins / {stats.losses} losses
        </span>
      </div>
      <div className="mt-5 pt-4 border-t border-purple-500/20">
        <div className="grid gap-2 text-xs sm:text-sm">
          <div className="flex justify-between items-center px-2">
            <span className="text-slate-400">Dagestani fights analyzed:</span>
            <span className="text-white font-bold">{displayMatchCount}</span>
          </div>
          <div className="flex justify-between items-center px-2">
            <span className="text-slate-400">Max lookback date:</span>
            <span className="text-white font-bold">{displayLookbackDate}</span>
          </div>
          <div className="flex justify-between items-center px-2">
            <span className="text-slate-400">Auto-refresh:</span>
            <span className="text-white font-bold">Daily</span>
          </div>
        </div>
      </div>
    </motion.div>
    </ElectricBorder>
  );
}
