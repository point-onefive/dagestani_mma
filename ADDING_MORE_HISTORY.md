# Adding More Historical Data

## Current State
- Historical data: 52 fights from last 100 UFC events
- Daily refresh checks: **Last 3 events** only (very efficient)
- Fighter cache: 801 fighters

---

## Option 1: Increase Daily Check Range

**When to use:** You want the daily cron to check more events each day

**How:**
1. Edit `scripts/dailyRefresh.ts` line 76
2. Change from:
   ```typescript
   const recentEvents = await fetchCompletedEvents(3, 0);
   ```
   To:
   ```typescript
   const recentEvents = await fetchCompletedEvents(10, 0);  // Check last 10 events
   ```

**Pros:**
- Catches any fights missed in previous runs
- More resilient to scraping errors

**Cons:**
- Slightly slower daily refresh (still only a few seconds)
- Most events already processed, so minimal extra work

---

## Option 2: One-Time Backfill

**When to use:** You want to go back and collect older historical data

**How:**

### Using Existing Script
```bash
# buildMoreHistorical.ts already exists
# Edit the script to set offset and count
npm run bootstrap:more
```

### Manual Backfill
```bash
# Create a one-time script
npx tsx -e "
import { fetchCompletedEvents, fetchEventFights } from './lib/ufcstats';
import { getFighterOrigin } from './lib/openai';
import { readJson, writeJson } from './lib/storage';

async function backfill() {
  // Fetch events 100-200 (skipping first 100 already collected)
  const events = await fetchCompletedEvents(100, 100);
  
  const historical = readJson('historical.json', []);
  const fighterCache = readJson('fighters.json', {});
  
  const existingFights = new Set(
    historical.map(f => {
      const fighters = [f.fighterA, f.fighterB].sort().join('|');
      return \`\${f.eventId}:\${fighters}\`;
    })
  );
  
  // Process events (same logic as dailyRefresh)
  // ... (copy from checkNewCompletedFights function)
  
  writeJson('historical.json', historical);
  writeJson('fighters.json', fighterCache);
}

backfill();
"
```

---

## Option 3: Simplify to Event-Level Deduplication

**Your suggestion:** If historical sees the event already, skip the entire event.

**Pros:**
- Simpler logic
- Slightly faster (fewer checks)

**Cons:**
- If scraper misses a fight initially, it can never be added
- Less resilient to partial scraping failures

**To implement:**

Edit `scripts/dailyRefresh.ts` line 77-95:

**Current (Fight-Level):**
```typescript
// Create a set of existing fight identifiers
const existingFights = new Set(
  historical.map(f => {
    const fighters = [f.fighterA, f.fighterB].sort().join('|');
    return `${f.eventId}:${fighters}`;
  })
);

for (const event of recentEvents) {
  console.log(`   📋 Checking event: ${event.name}`);
  const fights = await fetchEventFights(event);
  
  for (const fight of fights) {
    const fighters = [fight.fighter1, fight.fighter2].sort().join('|');
    const fightId = `${fight.eventId}:${fighters}`;
    
    if (existingFights.has(fightId)) {
      continue; // Skip this specific fight
    }
    // ... process fight
  }
}
```

**Simplified (Event-Level):**
```typescript
// Create a set of existing event IDs
const existingEventIds = new Set(historical.map(f => f.eventId));

for (const event of recentEvents) {
  // Skip entire event if we've processed it before
  if (existingEventIds.has(event.id)) {
    console.log(`   ⏭️  Already processed: ${event.name}`);
    continue;
  }
  
  console.log(`   📋 New event found: ${event.name}`);
  const fights = await fetchEventFights(event);
  
  for (const fight of fights) {
    // ... process all fights (no fight-level check)
  }
}
```

**My Recommendation:** Keep fight-level deduplication for resilience, but it's your call!

---

## Current Scraping Stats

**Total UFC Events Available:** ~700+ on UFCStats.com

**Your Current Data:**
- Events analyzed: ~100 (from initial bootstrap)
- Fights found: 52 Dagestani fights
- Coverage: Last ~2-3 years

**If you want MORE history:**
- Run `buildMoreHistorical.ts` with offset 100, count 200
- Would go back ~5 years total
- Expect ~100-150 Dagestani fights

---

## Recommendation

**For Production:**
1. Keep current setup (last 3 events daily) ✅
2. Optionally: One-time backfill to get more history
3. Let it run for a few months to build up data naturally

**Daily Refresh Efficiency:**
- Checks 3 events × ~12 fights per event = ~36 fights checked
- Of those, ~33 already in database = skipped
- Only ~3 new fights added per day (if recent event happened)
- **Very fast** (~10 seconds total)
