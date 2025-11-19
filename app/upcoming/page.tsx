import UpcomingClient from './UpcomingClient';
import { loadUpcoming } from '@/lib/dagestan';

export default function UpcomingPage() {
  const upcoming = loadUpcoming();

  return <UpcomingClient upcoming={upcoming} />;
}
