/**
 * Update stats.json with comprehensive metrics
 */

import { readJson, writeJson } from '../lib/storage';
import type { DagestanStats, HistoricalMatch } from '../lib/dagestan';

async function updateStats() {
  console.log('📊 Updating comprehensive statistics...\n');

  // Load data
  const historical: HistoricalMatch[] = readJson('historical.json', []);
  const fighterCache: Record<string, any> = readJson('fighters.json', {});

  // Calculate Dagestani fight stats
  const wins = historical.filter(m => m.result === 'win').length;
  const losses = historical.filter(m => m.result === 'loss').length;
  const total = historical.length;
  const winRate = total > 0 ? parseFloat(((wins / total) * 100).toFixed(1)) : 0;

  // Count total unique fighters analyzed
  const totalFighters = Object.keys(fighterCache).length;

  // Count Dagestani fighters
  const dagestaniFighters = Object.values(fighterCache).filter(
    f => f.isDagestani === true
  ).length;

  // For total fights analyzed, we need to estimate from all processed events
  // We can approximate this by counting unique event IDs across historical data
  const uniqueEvents = new Set(historical.map(h => h.eventId));
  
  // Average fights per UFC event is approximately 11-13
  const avgFightsPerEvent = 12;
  const totalFightsAnalyzed = uniqueEvents.size * avgFightsPerEvent;

  const stats: DagestanStats = {
    wins,
    losses,
    total,
    winRate,
    totalFightsAnalyzed,
    totalFighters,
    dagestaniFighters
  };

  writeJson('stats.json', stats);

  console.log('✅ Stats updated successfully!\n');
  console.log(`   Dagestani Win Rate: ${winRate}%`);
  console.log(`   Dagestani Fights: ${total} (${wins}W / ${losses}L)`);
  console.log(`   Total Fights Analyzed: ~${totalFightsAnalyzed.toLocaleString()}`);
  console.log(`   Total Fighters Analyzed: ${totalFighters.toLocaleString()}`);
  console.log(`   Dagestani Fighters Identified: ${dagestaniFighters}\n`);
}

updateStats().catch(console.error);
