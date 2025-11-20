// components/FightCard.tsx
'use client';

import { motion } from 'framer-motion';
import type { UpcomingMatch } from '@/lib/dagestan';
import { getCountryCode } from '@/lib/countryUtils';
import ElectricBorder from './ElectricBorder';
import DecryptedText from './DecryptedText';
import DramaticVS from './DramaticVS';

export default function FightCard({ match }: { match: UpcomingMatch }) {
  const labelA = match.isDagestaniA ? 'DAG' : getCountryCode(match.countryA);
  const labelB = match.isDagestaniB ? 'DAG' : getCountryCode(match.countryB);

  // Split event name into bold and regular parts
  const eventParts = match.eventName.split(':');
  const eventTitle = eventParts[0];
  const eventSubtitle = eventParts.length > 1 ? eventParts.slice(1).join(':') : null;

  return (
    <ElectricBorder
      color="#a855f7"
      speed={0.8}
      chaos={0.4}
      thickness={2}
      style={{ borderRadius: '0.75rem' }}
    >
      <motion.article
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-purple-500/10 rounded-xl p-4 sm:p-5 flex flex-col gap-3 hover:bg-purple-500/15 transition-all shadow-md shadow-purple-500/5"
      >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-purple-400/20">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md">
            <svg className="w-3.5 h-3.5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold text-slate-900">
              {new Date(match.eventDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>
        <div className="text-xs uppercase tracking-wide">
          <span className="font-bold text-white">{eventTitle}</span>
          {eventSubtitle && <span className="font-medium text-slate-300">:{eventSubtitle}</span>}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className={`text-lg sm:text-2xl font-semibold ${match.isDagestaniA ? 'text-slate-100' : 'text-purple-300'}`}>
            <DecryptedText 
              text={match.fighterA} 
              animateOn="view"
              speed={30}
              maxIterations={93}
            />
          </p>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs border font-bold ${match.isDagestaniA ? 'bg-purple-500/30 text-purple-200 border-purple-400/60' : 'bg-slate-500/20 text-slate-300 border-slate-400/40'}`}>
            {labelA}
          </span>
        </div>
        
        <DramaticVS />
        
        <div className="flex items-center justify-end gap-2">
          <p className={`text-lg sm:text-2xl font-semibold ${match.isDagestaniB ? 'text-slate-100' : 'text-purple-300'}`}>
            <DecryptedText 
              text={match.fighterB} 
              animateOn="view"
              speed={30}
              maxIterations={93}
            />
          </p>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs border font-bold ${match.isDagestaniB ? 'bg-purple-500/30 text-purple-200 border-purple-400/60' : 'bg-slate-500/20 text-slate-300 border-slate-400/40'}`}>
            {labelB}
          </span>
        </div>
      </div>
    </motion.article>
    </ElectricBorder>
  );
}
