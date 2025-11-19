Awesome, let’s just build this thing.
Below is a **full project skeleton + all the core code** you asked for.

You can copy-paste file by file into a fresh Next.js + TS + Tailwind app.

---

## 0. Folder skeleton

After `npx create-next-app@latest --typescript --tailwind dagestan-ufc`, you want something like:

```text
dagestan-ufc/
  app/
    layout.tsx
    page.tsx
    upcoming/
      page.tsx
    historical/
      page.tsx
  components/
    PixelBlast.tsx         // (you already have this code)
    TextType.tsx           // (you already have this code)
    PageHeader.tsx
    FightCard.tsx
    HistoricalRow.tsx
    StatBox.tsx
  lib/
    storage.ts
    openai.ts
    espn.ts
    dagestan.ts
  data/
    fighters.json
    upcoming.json
    historical.json
    stats.json
  scripts/
    refresh.ts
  tailwind.config.ts
  postcss.config.js
  tsconfig.json
  package.json
  context.md               // your big spec file
```

---

## 1. `lib/storage.ts` – JSON read/write helpers

```ts
// lib/storage.ts
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getDataPath(fileName: string) {
  ensureDataDir();
  return path.join(DATA_DIR, fileName);
}

export function readJson<T>(fileName: string, fallback: T): T {
  try {
    const filePath = getDataPath(fileName);
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(fileName: string, data: T) {
  const filePath = getDataPath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
```

---

## 2. `lib/openai.ts` – country of origin + Dagestan flag

```ts
// lib/openai.ts
import OpenAI from 'openai';
import { readJson, writeJson } from './storage';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type FighterOrigin = {
  name: string;
  country: string;
  isDagestani: boolean;
};

type FighterCache = Record<string, FighterOrigin>;

const FIGHTERS_FILE = 'fighters.json';

function loadCache(): FighterCache {
  return readJson<FighterCache>(FIGHTERS_FILE, {});
}

function saveCache(cache: FighterCache) {
  writeJson(FIGHTERS_FILE, cache);
}

export async function getFighterOrigin(name: string): Promise<FighterOrigin> {
  const cache = loadCache();
  const key = name.trim().toLowerCase();

  if (cache[key]) return cache[key];

  if (!process.env.OPENAI_API_KEY) {
    // Failsafe: if no key, just mark unknown
    const fallback: FighterOrigin = {
      name,
      country: 'Unknown',
      isDagestani: false,
    };
    cache[key] = fallback;
    saveCache(cache);
    return fallback;
  }

  const prompt = `
Given the professional MMA fighter name "${name}", answer ONLY with JSON:

{
  "country": "<country name>",
  "isDagestani": true or false
}

If you are not sure, use:
{
  "country": "Unknown",
  "isDagestani": false
}
`;

  const completion = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt,
    response_format: { type: 'json_object' },
  });

  const raw = completion.output[0].content[0].text ?? '{}';
  let parsed: { country?: string; isDagestani?: boolean } = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  const origin: FighterOrigin = {
    name,
    country: parsed.country || 'Unknown',
    isDagestani: !!parsed.isDagestani,
  };

  cache[key] = origin;
  saveCache(cache);
  return origin;
}
```

---

## 3. `lib/espn.ts` – ESPN fetch + parsing

This uses the endpoint pattern you described. You may need to tweak field names after you inspect actual JSON in dev tools, but the structure is ready.

```ts
// lib/espn.ts
import 'server-only';

export type RawEvent = {
  id: string;
  name: string;
  date: string;
  status: string; // e.g. "pre", "post"
  // ...other fields, we only care about basics
};

export type RawFight = {
  id: string;
  competitors: {
    name: string;
    winner?: boolean;
  }[];
  status: string; // "pre" or "post"
  method?: string;
  round?: string;
};

export type RawEventWithCard = {
  id: string;
  name: string;
  date: string;
  fights: RawFight[];
};

const BASE = 'https://site.web.api.espn.com/apis/fights/ufc';

export async function fetchEvents(): Promise<RawEvent[]> {
  const res = await fetch(`${BASE}/events`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch events from ESPN');
  const data = await res.json();

  // You may need to inspect the shape and adjust this mapping
  const events: RawEvent[] = (data.events || []).map((e: any) => ({
    id: String(e.id),
    name: e.name || e.shortName || '',
    date: e.date || e.startDate || '',
    status: e.status?.type?.name || e.status || 'unknown',
  }));

  return events;
}

export async function fetchEventDetails(eventId: string): Promise<RawEventWithCard> {
  const res = await fetch(`${BASE}/event/${eventId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch event ${eventId}`);
  const data = await res.json();

  const fights: RawFight[] = (data.fights || data.cards || []).map((f: any) => {
    const competitors = (f.competitors || f.matchup || []).map((c: any) => ({
      name: c.athlete?.displayName || c.displayName || c.name || '',
      winner: c.winner === true,
    }));
    return {
      id: String(f.id),
      competitors,
      status: f.status?.type?.name || f.status || 'unknown',
      method: f.method?.text || f.method || '',
      round: f.round ? String(f.round) : '',
    };
  });

  return {
    id: String(data.id),
    name: data.name || data.shortName || '',
    date: data.date || data.startDate || '',
    fights,
  };
}
```

---

## 4. `lib/dagestan.ts` – logic to build upcoming & historical tables

```ts
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
  winRate: number; // 0–1
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
    if (status.includes('post') || status.includes('final')) {
      completedEvents.push(e);
    } else {
      upcomingEvents.push(e);
    }
  }

  return { upcomingEvents, completedEvents };
}

// Helper to uniquely identify a fight in historical store
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

  for (const ev of detailedEvents) {
    for (const f of ev.fights) {
      // Consider only future / non-completed
      const status = (f.status || '').toLowerCase();
      if (status.includes('post') || status.includes('final')) continue;
      if (f.competitors.length < 2) continue;

      const [c1, c2] = f.competitors;
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

  // sort by date (string sort should be fine if ISO, otherwise tweak)
  results.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  saveUpcoming(results);
  return results;
}

export async function appendHistoricalFromEvents(
  detailedEvents: RawEventWithCard[],
  existing: HistoricalMatch[]
): Promise<HistoricalMatch[]> {
  const existingKeys = existingHistoricalKeys(existing);
  const newItems: HistoricalMatch[] = [];

  for (const ev of detailedEvents) {
    for (const f of ev.fights) {
      const status = (f.status || '').toLowerCase();
      if (!(status.includes('post') || status.includes('final'))) continue;
      if (f.competitors.length < 2) continue;

      const [c1, c2] = f.competitors;
      const originA = await getFighterOrigin(c1.name);
      const originB = await getFighterOrigin(c2.name);

      const isDagA = originA.isDagestani;
      const isDagB = originB.isDagestani;
      if (!isDagA && !isDagB) continue;

      const winnerName =
        f.competitors.find(c => c.winner)?.name || '';

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

  const combined = [...existing, ...newItems];
  combined.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  saveHistorical(combined);
  recomputeStats(combined);

  return combined;
}
```

---

## 5. `data/*.json` – empty starting files

```json
// data/fighters.json
{}
```

```json
// data/upcoming.json
[]
```

```json
// data/historical.json
[]
```

```json
// data/stats.json
{
  "wins": 0,
  "losses": 0,
  "total": 0,
  "winRate": 0
}
```

---

## 6. `scripts/refresh.ts` – cron-like updater (+ one-time backfill)

You can run this manually (`npx tsx scripts/refresh.ts`) or wire it to a GitHub Action / cron later.

```ts
// scripts/refresh.ts
/* eslint-disable no-console */
import 'dotenv/config';
import { fetchEvents, fetchEventDetails } from '../lib/espn';
import {
  categorizeEvents,
  buildUpcomingFromEvents,
  appendHistoricalFromEvents,
  loadHistorical,
} from '../lib/dagestan';

async function main() {
  console.log('Dagestan UFC refresh started…');

  const events = await fetchEvents();
  const { upcomingEvents, completedEvents } = categorizeEvents(events);

  // 1) Build upcoming table
  const upcomingDetails = await Promise.all(
    upcomingEvents.map(e => fetchEventDetails(e.id))
  );
  await buildUpcomingFromEvents(upcomingDetails);
  console.log(`Updated upcoming table with ${upcomingDetails.length} events.`);

  // 2) Historical backfill + incremental updates
  const currentHistorical = loadHistorical();

  // One-time bootstrap: if empty, only take last X completed events (e.g. 5)
  let completedSubset = completedEvents;
  if (currentHistorical.length === 0) {
    const bootstrapCount = 5;
    completedSubset = completedEvents.slice(-bootstrapCount);
    console.log(
      `Historical table empty, running one-time bootstrap for last ${bootstrapCount} completed events…`
    );
  } else {
    console.log(
      `Historical table has ${currentHistorical.length} fights, appending new ones if any…`
    );
  }

  const completedDetails = await Promise.all(
    completedSubset.map(e => fetchEventDetails(e.id))
  );
  await appendHistoricalFromEvents(completedDetails, currentHistorical);

  console.log('Dagestan UFC refresh finished.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
```

---

## 7. Layout + Landing page

### `app/layout.tsx`

```tsx
// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dagestan UFC Tracker',
  description: 'Tracks upcoming & historical Dagestani UFC fights and win rate.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-slate-100 min-h-screen">
        <div className="min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
```

### `components/PageHeader.tsx`

```tsx
// components/PageHeader.tsx
'use client';

import TextType from './TextType';

type PageHeaderProps = {
  lines: string[];
  subtext?: string;
};

export default function PageHeader({ lines, subtext }: PageHeaderProps) {
  return (
    <header className="w-full max-w-4xl mx-auto pt-8 px-4 text-center">
      <TextType
        text={lines}
        typingSpeed={70}
        pauseDuration={1200}
        showCursor={true}
        className="text-3xl sm:text-4xl md:text-5xl font-semibold"
      />
      {subtext && (
        <p className="mt-4 text-sm sm:text-base text-slate-400">
          {subtext}
        </p>
      )}
    </header>
  );
}
```

### `app/page.tsx` – hero with PixelBlast + buttons

```tsx
// app/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import PixelBlast from '@/components/PixelBlast';
import TextType from '@/components/TextType';

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-80">
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl px-4 py-10 flex flex-col items-center text-center">
        <TextType
          text={['Dagestan UFC Tracker', 'Dagestani Dominance, Quantified.']}
          typingSpeed={70}
          pauseDuration={1400}
          showCursor={true}
          className="text-3xl sm:text-4xl md:text-5xl font-semibold"
        />
        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl">
          Automatically tracks upcoming and historical UFC fights involving
          Dagestani fighters, and calculates their running win rate over time.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <NavButton href="/upcoming" label="Upcoming Matches" />
          <NavButton href="/historical" label="Historical Matches" secondary />
        </div>
      </div>
    </main>
  );
}

function NavButton({
  href,
  label,
  secondary = false,
}: {
  href: string;
  label: string;
  secondary?: boolean;
}) {
  return (
    <Link href={href} className="w-full">
      <motion.button
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97, y: 1 }}
        className={`w-full py-3 rounded-xl border text-sm sm:text-base font-medium shadow-lg backdrop-blur
        ${
          secondary
            ? 'bg-black/40 border-slate-600 text-slate-100'
            : 'bg-purple-500/80 border-purple-400 text-white'
        }`}
      >
        {label}
      </motion.button>
    </Link>
  );
}
```

---

## 8. Upcoming Matches UI

### `components/FightCard.tsx`

```tsx
// components/FightCard.tsx
'use client';

import { motion } from 'framer-motion';
import type { UpcomingMatch } from '@/lib/dagestan';

export default function FightCard({ match }: { match: UpcomingMatch }) {
  const dagLabelA = match.isDagestaniA ? 'DAG' : '';
  const dagLabelB = match.isDagestaniB ? 'DAG' : '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className="bg-slate-900/60 border border-slate-700/80 rounded-xl p-4 sm:p-5 flex flex-col gap-3"
    >
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {new Date(match.eventDate).toLocaleString()} • {match.eventName}
      </div>
      <div className="flex items-center justify-between gap-3 text-sm sm:text-base">
        <div className="flex-1 text-left">
          <p className="font-semibold text-slate-100">
            {match.fighterA}{' '}
            {dagLabelA && (
              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                {dagLabelA}
              </span>
            )}
          </p>
        </div>
        <span className="text-xs sm:text-sm text-slate-400 mx-2">vs</span>
        <div className="flex-1 text-right">
          <p className="font-semibold text-slate-100">
            {match.fighterB}{' '}
            {dagLabelB && (
              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                {dagLabelB}
              </span>
            )}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
```

### `app/upcoming/page.tsx`

```tsx
// app/upcoming/page.tsx
import PageHeader from '@/components/PageHeader';
import FightCard from '@/components/FightCard';
import { loadUpcoming } from '@/lib/dagestan';

export default function UpcomingPage() {
  const upcoming = loadUpcoming(); // server-side read

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4 pb-12">
      <PageHeader
        lines={['Upcoming Dagestani Matches']}
        subtext="Future UFC bouts where at least one fighter is from Dagestan."
      />

      {upcoming.length === 0 ? (
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
  );
}
```

---

## 9. Historical UI + Win Rate

### `components/HistoricalRow.tsx`

```tsx
// components/HistoricalRow.tsx
import type { HistoricalMatch } from '@/lib/dagestan';

export default function HistoricalRow({ match }: { match: HistoricalMatch }) {
  const isWin = match.result === 'win';

  return (
    <tr className="border-b border-slate-800/80 text-xs sm:text-sm">
      <td className="py-2 pr-2 text-slate-400">
        {new Date(match.eventDate).toLocaleDateString()}
      </td>
      <td className="py-2 pr-2 text-slate-200">{match.eventName}</td>
      <td className="py-2 pr-2 text-slate-100">{match.fighterA}</td>
      <td className="py-2 pr-2 text-slate-100">{match.fighterB}</td>
      <td className="py-2 pr-2 text-emerald-300">{match.winner}</td>
      <td className="py-2 pr-2 text-slate-300">{match.method}</td>
      <td className="py-2 pr-2 text-slate-300">{match.round}</td>
      <td className="py-2 pr-2 text-slate-200">{match.dagestaniFighter}</td>
      <td className="py-2 pl-2">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
            isWin
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40'
              : 'bg-rose-500/10 text-rose-300 border border-rose-400/40'
          }`}
        >
          {isWin ? 'WIN' : 'LOSS'}
        </span>
      </td>
    </tr>
  );
}
```

### `components/StatBox.tsx`

```tsx
// components/StatBox.tsx
'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import type { DagestanStats } from '@/lib/dagestan';

export default function StatBox({ stats }: { stats: DagestanStats }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 18 });
  const percentText = useTransform(spring, value => `${value.toFixed(1)}%`);

  useEffect(() => {
    mv.set(stats.winRate * 100);
  }, [stats.winRate, mv]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 w-full max-w-md mx-auto rounded-2xl border border-slate-700 bg-slate-950/70 p-5 sm:p-6 shadow-lg"
    >
      <div className="text-xs uppercase tracking-wide text-slate-400">
        Historical Win Rate
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <motion.span className="text-3xl sm:text-4xl font-semibold text-emerald-300">
          {percentText}
        </motion.span>
        <span className="text-xs sm:text-sm text-slate-400">
          {stats.wins} wins / {stats.losses} losses ({stats.total} fights)
        </span>
      </div>
      <p className="mt-3 text-[11px] sm:text-xs text-slate-500">
        Based on all completed fights in the historical Dagestani matches table.
        New fights are appended automatically after each refresh.
      </p>
    </motion.div>
  );
}
```

### `app/historical/page.tsx`

```tsx
// app/historical/page.tsx
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
```

---

## 10. What to do next

1. **Create the Next app** (if you haven’t yet).
2. Drop in:

   * `lib/` files
   * `data/` files
   * `scripts/refresh.ts`
   * `components/` files
   * updated `app/` pages
3. Add your existing `PixelBlast.tsx` and `TextType.tsx` into `components/`.
4. Add `OPENAI_API_KEY` to `.env.local`.
5. Run the refresh script once to populate data:

```bash
npx tsx scripts/refresh.ts
```

6. Start dev:

```bash
npm run dev
```

If you want, next step I can do is **tighten the ESPN parsing** once you paste a sample of real ESPN JSON so we can match the exact fields 1:1.
