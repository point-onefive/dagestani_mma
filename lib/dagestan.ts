// lib/dagestan.ts
import { getFighterOrigin } from './openai';
import { RawEventWithCard, RawEvent } from './espn';
import { readJson, writeJson } from './storage';

export type UpcomingMatch = {
  eventId: string;
  eventName: string;
  eventDate: string;
  fighterA: string;
  fighterB: string;
  isDagestaniA: boolean;
  isDagestaniB: boolean;
};

export type HistoricalMatch = {
  eventId: string;
  eventName: string;
  eventDate: string;
  fighterA: string;
  fighterB: string;
  winner: string;
  method: string;
  round: string;
  isDagestaniA: boolean;
  isDagestaniB: boolean;
  dagestaniFighter: string;
  result: 'win' | 'loss';
};

export type DagestanStats = {
  wins: number;
  losses: number;
  total: number;
  winRate: number;
};

const UPCOMING_FILE = 'upcoming.json';
const HISTORICAL_FILE = 'historical.json';
const STATS_FILE = 'stats.json';

export function loadUpcoming(): UpcomingMatch[] {
  return readJson<UpcomingMatch[]>(UPCOMING_FILE, []);
}

export function saveUpcoming(data: UpcomingMatch[]) {
  writeJson(UPCOMING_FILE, data);
}

export function loadHistorical(): HistoricalMatch[] {
  return readJson<HistoricalMatch[]>(HISTORICAL_FILE, []);
}

export function saveHistorical(data: HistoricalMatch[]) {
  writeJson(HISTORICAL_FILE, data);
}

export function loadStats(): DagestanStats {
  return readJson<DagestanStats>(STATS_FILE, {
    wins: 0,
    losses: 0,
    total: 0,
    winRate: 0,
  });
}

export function saveStats(stats: DagestanStats) {
  writeJson(STATS_FILE, stats);
}

export function recomputeStats(historical: HistoricalMatch[]): DagestanStats {
  let wins = 0;
  let losses = 0;

  for (const match of historical) {
    if (match.result === 'win') wins += 1;
    else if (match.result === 'loss') losses += 1;
  }

  const total = wins + losses;
  const winRate = total === 0 ? 0 : wins / total;

  const stats: DagestanStats = { wins, losses, total, winRate };
  saveStats(stats);
  console.log(`📊 Stats updated: ${wins}W - ${losses}L (${(winRate * 100).toFixed(1)}%)`);
  return stats;
}

type CategorizedEvents = {
  upcomingEvents: RawEvent[];
  completedEvents: RawEvent[];
};

export function categorizeEvents(events: RawEvent[]): CategorizedEvents {
  const upcomingEvents: RawEvent[] = [];
  const completedEvents: RawEvent[] = [];

  for (const e of events) {
    const status = (e.status || '').toLowerCase();
    if (status.includes('post') || status.includes('final') || status.includes('complete')) {
      completedEvents.push(e);
    } else {
      upcomingEvents.push(e);
    }
  }

  console.log(`📋 Categorized: ${upcomingEvents.length} upcoming, ${completedEvents.length} completed`);
  return { upcomingEvents, completedEvents };
}

function makeHistoricalKey(m: HistoricalMatch) {
  return `${m.eventId}:${m.fighterA}:${m.fighterB}`;
}

export function existingHistoricalKeys(historical: HistoricalMatch[]): Set<string> {
  const keys = new Set<string>();
  for (const m of historical) keys.add(makeHistoricalKey(m));
  return keys;
}

export async function buildUpcomingFromEvents(
  detailedEvents: RawEventWithCard[]
): Promise<UpcomingMatch[]> {
  const results: UpcomingMatch[] = [];
  console.log(`🔨 Building upcoming table from ${detailedEvents.length} events...`);

  for (const ev of detailedEvents) {
    for (const f of ev.fights) {
      const status = (f.status || '').toLowerCase();
      if (status.includes('post') || status.includes('final') || status.includes('complete')) continue;
      if (f.competitors.length < 2) continue;

      const [c1, c2] = f.competitors;
      if (!c1.name || !c2.name) continue;

      const originA = await getFighterOrigin(c1.name);
      const originB = await getFighterOrigin(c2.name);

      const isDagA = originA.isDagestani;
      const isDagB = originB.isDagestani;
      if (!isDagA && !isDagB) continue;

      results.push({
        eventId: ev.id,
        eventName: ev.name,
        eventDate: ev.date,
        fighterA: c1.name,
        fighterB: c2.name,
        isDagestaniA: isDagA,
        isDagestaniB: isDagB,
      });
    }
  }

  results.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  saveUpcoming(results);
  console.log(`✓ Saved ${results.length} upcoming Dagestani matches`);
  return results;
}

export async function appendHistoricalFromEvents(
  detailedEvents: RawEventWithCard[],
  existing: HistoricalMatch[]
): Promise<HistoricalMatch[]> {
  const existingKeys = existingHistoricalKeys(existing);
  const newItems: HistoricalMatch[] = [];
  console.log(`🔨 Processing ${detailedEvents.length} events for historical data...`);

  for (const ev of detailedEvents) {
    for (const f of ev.fights) {
      const status = (f.status || '').toLowerCase();
      if (!(status.includes('post') || status.includes('final') || status.includes('complete'))) continue;
      if (f.competitors.length < 2) continue;

      const [c1, c2] = f.competitors;
      if (!c1.name || !c2.name) continue;

      const originA = await getFighterOrigin(c1.name);
      const originB = await getFighterOrigin(c2.name);

      const isDagA = originA.isDagestani;
      const isDagB = originB.isDagestani;
      if (!isDagA && !isDagB) continue;

      const winnerName = f.competitors.find(c => c.winner)?.name || '';

      const dagestaniFighter = isDagA ? c1.name : c2.name;
      const result: 'win' | 'loss' =
        winnerName === dagestaniFighter ? 'win' : 'loss';

      const item: HistoricalMatch = {
        eventId: ev.id,
        eventName: ev.name,
        eventDate: ev.date,
        fighterA: c1.name,
        fighterB: c2.name,
        winner: winnerName,
        method: f.method || '',
        round: f.round || '',
        isDagestaniA: isDagA,
        isDagestaniB: isDagB,
        dagestaniFighter,
        result,
      };

      const key = makeHistoricalKey(item);
      if (existingKeys.has(key)) continue;

      existingKeys.add(key);
      newItems.push(item);
    }
  }

  console.log(`✓ Found ${newItems.length} new historical Dagestani fights`);

  const combined = [...existing, ...newItems];
  combined.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  saveHistorical(combined);
  recomputeStats(combined);

  return combined;
}
