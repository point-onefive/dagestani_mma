// components/FightCard.tsx
'use client';

import { motion } from 'framer-motion';
import type { UpcomingMatch } from '@/lib/dagestan';

export default function FightCard({ match }: { match: UpcomingMatch }) {
  const dagLabelA = match.isDagestaniA ? 'DAG' : '';
  const dagLabelB = match.isDagestaniB ? 'DAG' : '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className="bg-slate-900/60 border border-slate-700/80 rounded-xl p-4 sm:p-5 flex flex-col gap-3"
    >
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {new Date(match.eventDate).toLocaleString()} • {match.eventName}
      </div>
      <div className="flex items-center justify-between gap-3 text-sm sm:text-base">
        <div className="flex-1 text-left">
          <p className="font-semibold text-slate-100">
            {match.fighterA}{' '}
            {dagLabelA && (
              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                {dagLabelA}
              </span>
            )}
          </p>
        </div>
        <span className="text-xs sm:text-sm text-slate-400 mx-2">vs</span>
        <div className="flex-1 text-right">
          <p className="font-semibold text-slate-100">
            {match.fighterB}{' '}
            {dagLabelB && (
              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                {dagLabelB}
              </span>
            )}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
