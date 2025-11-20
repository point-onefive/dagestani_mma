import HistoricalClient from './HistoricalClient';
import { loadHistorical, loadStats, getHistoricalLastRefresh } from '@/lib/dagestan';

// Force static generation at build time and revalidate every hour
export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour in seconds

export default function HistoricalPage() {
  const historical = loadHistorical();
  const stats = loadStats();
  const lastRefresh = getHistoricalLastRefresh();

  return (
    <HistoricalClient 
      historical={historical} 
      stats={stats} 
      lastRefresh={lastRefresh} 
    />
  );
}
