import PageHeader from '@/components/PageHeader';
import FightCard from '@/components/FightCard';
import MinimalNav from '@/components/MinimalNav';
import { loadUpcoming } from '@/lib/dagestan';

export default function UpcomingPage() {
  const upcoming = loadUpcoming();

  return (
    <>
      <MinimalNav />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pb-12">
      <PageHeader
        lines={['Upcoming Dagestani Matches']}
        subtext="At least one fighter is from Dagestan."
      />        {upcoming.length === 0 ? (
          <p className="mt-10 text-center text-slate-400 text-sm">
            No upcoming Dagestani fights detected yet. Check back after the next refresh.
          </p>
        ) : (
          <section className="mt-8 grid gap-4 sm:gap-5">
            {upcoming.map(match => (
              <FightCard key={`${match.eventId}-${match.fighterA}-${match.fighterB}`} match={match} />
            ))}
          </section>
        )}
      </main>
    </>
  );
}
