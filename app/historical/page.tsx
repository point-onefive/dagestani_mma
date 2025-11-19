import PageHeader from '@/components/PageHeader';
import HistoricalRow from '@/components/HistoricalRow';
import StatBox from '@/components/StatBox';
import { loadHistorical, loadStats } from '@/lib/dagestan';

export default function HistoricalPage() {
  const historical = loadHistorical();
  const stats = loadStats();

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 pb-12">
      <PageHeader
        lines={['Historical Dagestani Matches']}
        subtext="Completed UFC bouts involving Dagestani fighters, plus their running win rate."
      />

      <StatBox stats={stats} />

      {historical.length === 0 ? (
        <p className="mt-10 text-center text-slate-400 text-sm">
          No historical Dagestani fights recorded yet. Run the refresh script to bootstrap data.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
          <table className="min-w-full text-left">
            <thead className="bg-slate-950/90 text-[11px] sm:text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 px-2 sm:px-3">Date</th>
                <th className="py-2 px-2 sm:px-3">Event</th>
                <th className="py-2 px-2 sm:px-3">Fighter A</th>
                <th className="py-2 px-2 sm:px-3">Fighter B</th>
                <th className="py-2 px-2 sm:px-3">Winner</th>
                <th className="py-2 px-2 sm:px-3">Method</th>
                <th className="py-2 px-2 sm:px-3">Round</th>
                <th className="py-2 px-2 sm:px-3">Dagestani</th>
                <th className="py-2 px-2 sm:px-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {historical.map(m => (
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
  );
}
