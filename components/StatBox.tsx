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
        className="mt-6 w-full max-w-lg mx-auto rounded-2xl bg-black/50 p-6 sm:p-8 shadow-2xl shadow-purple-500/20"
      >
      <div className="text-xs uppercase tracking-wide text-slate-400 text-center mb-3">
        Historical Win Rate
      </div>
      <div className="flex flex-col items-center gap-2">
        <motion.span className="text-5xl sm:text-6xl font-bold text-purple-300">
          {percentText}
        </motion.span>
        <span className="text-sm sm:text-base text-slate-300">
          {stats.wins} wins / {stats.losses} losses
        </span>
      </div>
      <div className="mt-5 pt-4 border-t border-purple-500/20">
        <div className="text-[11px] sm:text-xs text-slate-400 text-center leading-relaxed space-y-1">
          <p>Dagestani matches analyzed: <span className="text-purple-400 font-medium">{displayMatchCount}</span></p>
          <p>Max lookback date: <span className="text-slate-300">{formattedDate}</span></p>
          <p className="text-slate-500">New fights are appended automatically</p>
        </div>
      </div>
    </motion.div>
    </ElectricBorder>
  );
}
