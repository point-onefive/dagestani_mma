import PageHeader from '@/components/PageHeader';
import HistoricalRow from '@/components/HistoricalRow';
import StatBox from '@/components/StatBox';
import MinimalNav from '@/components/MinimalNav';
import { loadHistorical, loadStats } from '@/lib/dagestan';

export default function HistoricalPage() {
  const historical = loadHistorical();
  const stats = loadStats();

  // Sort by date descending (most recent first)
  const sortedHistorical = [...historical].sort((a, b) => 
    b.eventDate.localeCompare(a.eventDate)
  );

  // Count distinct matches
  const distinctMatchCount = historical.length;

  // Find the earliest date from historical matches
  const earliestDate = historical.length > 0 
    ? historical.reduce((earliest, match) => 
        match.eventDate < earliest ? match.eventDate : earliest, 
        historical[0].eventDate
      )
    : undefined;

  return (
    <>
      <MinimalNav />
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 pb-12">
        <PageHeader
          lines={['Historical Dagestani Matches']}
          subtext="Results with running win rate."
        />
        <StatBox stats={stats} earliestDate={earliestDate} matchCount={distinctMatchCount} />

      {historical.length === 0 ? (
        <p className="mt-10 text-center text-slate-400 text-sm">
          No historical Dagestani fights recorded yet. Run the refresh script to bootstrap data.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-purple-500/30 bg-black/40">
          <table className="min-w-full text-left">
            <thead className="bg-black/60 text-[11px] sm:text-xs uppercase text-slate-400 border-b border-purple-500/30">
              <tr>
                <th className="py-2 px-2 sm:px-3">Result</th>
                <th className="py-2 px-2 sm:px-3">Event</th>
                <th className="py-2 px-2 sm:px-3">Date</th>
                <th className="py-2 px-2 sm:px-3">Fighter A</th>
                <th className="py-2 px-2 sm:px-3">Fighter B</th>
                <th className="py-2 px-2 sm:px-3">Winner</th>
                <th className="py-2 px-2 sm:px-3">Method</th>
                <th className="py-2 px-2 sm:px-3">Round</th>
                <th className="py-2 px-2 sm:px-3">Dagestani</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10">
              {sortedHistorical.map(m => (
                <HistoricalRow
                  key={`${m.eventId}-${m.fighterA}-${m.fighterB}`}
                  match={m}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      </main>
    </>
  );
}
