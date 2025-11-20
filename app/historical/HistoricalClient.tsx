'use client';

import { useEffect, useState } from 'react';
import HistoricalRow from '@/components/HistoricalRow';
import StatBox from '@/components/StatBox';
import MinimalNav from '@/components/MinimalNav';
import Footer from '@/components/Footer';
import { setBackgroundState } from '@/lib/transitions';
import type { HistoricalMatch, DagestanStats } from '@/lib/dagestan';

interface HistoricalClientProps {
  historical: HistoricalMatch[];
  stats: DagestanStats;
  lastRefresh: string | null;
}

export default function HistoricalClient({ historical, stats, lastRefresh }: HistoricalClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Set space background on mount
  useEffect(() => {
    setBackgroundState('space');
  }, []);

  // Sort by date descending (most recent first)
  const sortedHistorical = [...historical].sort((a, b) => 
    b.eventDate.localeCompare(a.eventDate)
  );

  // Pagination calculations
  const totalPages = Math.ceil(sortedHistorical.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMatches = sortedHistorical.slice(startIndex, endIndex);

  // Count distinct matches
  const distinctMatchCount = historical.length;

  // Find the earliest date from historical matches
  const earliestDate = historical.length > 0 
    ? historical.reduce((earliest, match) => 
        match.eventDate < earliest ? match.eventDate : earliest, 
        historical[0].eventDate
      )
    : undefined;

  const formatRefreshTime = (isoString: string | null) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      <MinimalNav currentPage="historical" />
      <main className="relative z-20 flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 pb-12">
        <header className="w-full max-w-4xl mx-auto pt-20 sm:pt-24 px-4 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold text-slate-100">
            Historical Dagestani Fights
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400">
            Results for fighters born in Dagestan.
            <br />
            Running win rate below.
          </p>
        </header>
        {lastRefresh && (
          <div className="text-center text-xs text-slate-500 mt-4">
            Last updated: {formatRefreshTime(lastRefresh)}
          </div>
        )}
        <StatBox stats={stats} earliestDate={earliestDate} matchCount={distinctMatchCount} />

      {historical.length === 0 ? (
        <p className="mt-10 text-center text-slate-400 text-sm">
          No historical Dagestani fights recorded yet. Run the refresh script to bootstrap data.
        </p>
      ) : (
        <div className="mt-8 relative">
          {/* Scroll indicator gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/60 to-transparent pointer-events-none z-10 md:hidden" />
          
          <div className="overflow-x-auto rounded-xl border border-purple-500/30 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent min-h-[600px]">
            <table className="min-w-full text-left">
              <thead className="bg-purple-900/40 text-[11px] sm:text-xs uppercase text-purple-200 border-b border-purple-500/30">
              <tr>
                <th className="py-2 px-2 sm:px-3">Result</th>
                <th className="py-2 px-2 sm:px-3">Event</th>
                <th className="py-2 px-2 sm:px-3">Date</th>
                <th className="py-2 px-2 sm:px-3">Fighter A</th>
                <th className="py-2 px-2 sm:px-3">Fighter B</th>
                <th className="py-2 px-2 sm:px-3">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {currentMatches.map((m) => (
                <HistoricalRow
                  key={`${m.eventId}-${m.fighterA}-${m.fighterB}`}
                  match={m}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-purple-900/40 text-purple-200 border border-purple-500/30 hover:bg-purple-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
            >
              Previous
            </button>
            <span className="text-sm text-slate-400 px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-purple-900/40 text-purple-200 border border-purple-500/30 hover:bg-purple-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
            >
              Next
            </button>
          </div>
        )}
        </div>
      )}
      </main>
      <Footer />
    </>
  );
}
