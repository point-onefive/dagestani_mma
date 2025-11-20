import UpcomingClient from './UpcomingClient';
import { loadUpcoming, getUpcomingLastRefresh } from '@/lib/dagestan';

// Force static generation at build time and revalidate every hour
export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour in seconds

export default function UpcomingPage() {
  const upcoming = loadUpcoming();
  const lastRefresh = getUpcomingLastRefresh();

  return <UpcomingClient upcoming={upcoming} lastRefresh={lastRefresh} />;
}
