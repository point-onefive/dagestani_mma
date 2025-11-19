// components/FightCard.tsx
'use client';

import { motion } from 'framer-motion';
import type { UpcomingMatch } from '@/lib/dagestan';
import { getCountryCode } from '@/lib/countryUtils';

export default function FightCard({ match }: { match: UpcomingMatch }) {
  const labelA = match.isDagestaniA ? 'DAG' : getCountryCode(match.countryA);
  const labelB = match.isDagestaniB ? 'DAG' : getCountryCode(match.countryB);

  return (
    <motion.article
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4 sm:p-5 flex flex-col gap-3 hover:border-purple-400/50 hover:bg-purple-500/15 transition-all shadow-md shadow-purple-500/5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 pb-2 border-b border-purple-400/20">
        <div className="text-xs font-medium text-purple-300">
          {new Date(match.eventDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
        <div className="text-xs text-slate-400">
          {match.eventName}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-slate-100 flex-1">
            {match.fighterA}
          </p>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border font-bold flex-shrink-0 ${match.isDagestaniA ? 'bg-purple-500/30 text-purple-200 border-purple-400/60' : 'bg-slate-500/20 text-slate-300 border-slate-400/40'}`}>
            {labelA}
          </span>
        </div>
        
        <div className="text-center text-xs text-purple-300 font-medium py-1">
          vs
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-slate-100 flex-1">
            {match.fighterB}
          </p>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border font-bold flex-shrink-0 ${match.isDagestaniB ? 'bg-purple-500/30 text-purple-200 border-purple-400/60' : 'bg-slate-500/20 text-slate-300 border-slate-400/40'}`}>
            {labelB}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
