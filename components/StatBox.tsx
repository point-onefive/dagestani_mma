// components/StatBox.tsx
'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import type { DagestanStats } from '@/lib/dagestan';

export default function StatBox({ stats }: { stats: DagestanStats }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 18 });
  const percentText = useTransform(spring, value => `${value.toFixed(1)}%`);

  useEffect(() => {
    mv.set(stats.winRate);
  }, [stats.winRate, mv]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 w-full max-w-md mx-auto rounded-2xl border border-slate-700 bg-slate-950/70 p-5 sm:p-6 shadow-lg"
    >
      <div className="text-xs uppercase tracking-wide text-slate-400">
        Historical Win Rate
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <motion.span className="text-3xl sm:text-4xl font-semibold text-emerald-300">
          {percentText}
        </motion.span>
        <span className="text-xs sm:text-sm text-slate-400">
          {stats.wins} wins / {stats.losses} losses ({stats.total} fights)
        </span>
      </div>
      <p className="mt-3 text-[11px] sm:text-xs text-slate-500">
        Based on all completed fights in the historical Dagestani matches table.
        New fights are appended automatically after each refresh.
      </p>
    </motion.div>
  );
}
