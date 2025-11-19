import UpcomingClient from './UpcomingClient';
import { loadUpcoming, getUpcomingLastRefresh } from '@/lib/dagestan';

export default function UpcomingPage() {
  const upcoming = loadUpcoming();
  const lastRefresh = getUpcomingLastRefresh();

  return <UpcomingClient upcoming={upcoming} lastRefresh={lastRefresh} />;
}
