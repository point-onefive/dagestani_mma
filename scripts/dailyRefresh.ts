/**
 * Daily Refresh Script
 * 
 * This script should run daily (e.g., via cron) to:
 * 1. Fetch upcoming UFC events from ESPN API
 * 2. Move completed events from upcoming → historical
 * 3. Add new upcoming Dagestani fights
 * 4. Recalculate win rate stats
 * 
 * Run with: npm run refresh
 * Schedule with cron: 0 6 * * * cd /path/to/dagestani_mma && npm run refresh
 */

import { config } from 'dotenv';
import { fetchEvents, fetchEventDetails } from '../lib/espn';
import { getFighterOrigin, type FighterOrigin } from '../lib/openai';
import { readJson, writeJson, saveLastRefreshTimestamp } from '../lib/storage';
import { fetchCompletedEvents, fetchEventFights } from '../lib/ufcstats';

// Load environment variables
config({ path: '.env.local' });

interface UpcomingFight {
  eventId: string;
  eventName: string;
  eventDate: string;
  fighterA: string;
  fighterB: string;
  isDagestaniA: boolean;
  isDagestaniB: boolean;
  countryA?: string;
  countryB?: string;
}

interface HistoricalFight extends UpcomingFight {
  winner: string;
  method: string;
  round: string;
  dagestaniFighter: string;
  result: 'win' | 'loss';
}

interface Stats {
  totalFights: number;
  wins: number;
  losses: number;
  winRate: number;
}

async function dailyRefresh() {
  console.log('\n🔄 DAILY REFRESH - ' + new Date().toISOString());
  console.log('=' .repeat(60) + '\n');

  // Step 1: Check UFCStats for newly completed events (last 3 events only)
  await checkNewCompletedFights();

  // Step 2: Fetch new upcoming events from ESPN
  await updateUpcomingFights();

  // Step 3: Recalculate statistics
  await recalculateStats();

  // Save timestamp of successful refresh
  const timestamp = new Date().toISOString();
  saveLastRefreshTimestamp(timestamp);

  console.log('\n✅ Daily refresh complete!');
  console.log(`⏰ Last refresh: ${new Date(timestamp).toLocaleString()}\n`);
}

/**
 * Check UFCStats.com for newly completed events (last 3 events)
 * and add any new Dagestani fights to historical data
 */
async function checkNewCompletedFights() {
  console.log('🔍 Step 1: Checking UFCStats for newly completed fights...\n');

  try {
    // Fetch only the 3 most recent completed events
    const recentEvents = await fetchCompletedEvents(3, 0);
    const historical: HistoricalFight[] = readJson('historical.json', []);
    const fighterCache: Record<string, FighterOrigin> = readJson('fighters.json', {});
    
    // Create a set of existing fight identifiers to avoid duplicates
    // Format: "eventId:fighter1|fighter2" (sorted)
    const existingFights = new Set(
      historical.map(f => {
        const fighters = [f.fighterA, f.fighterB].sort().join('|');
        return `${f.eventId}:${fighters}`;
      })
    );
    
    let newFightsAdded = 0;
    
    for (const event of recentEvents) {
      console.log(`   📋 Checking event: ${event.name}`);
      
      // Fetch fight details
      const fights = await fetchEventFights(event);
      
      let newFightsInEvent = 0;
      
      // Check each fight for Dagestani fighters
      for (const fight of fights) {
        // Create fight identifier to check for duplicates
        const fighters = [fight.fighter1, fight.fighter2].sort().join('|');
        const fightId = `${fight.eventId}:${fighters}`;
        
        // Skip if we've already processed this specific fight
        if (existingFights.has(fightId)) {
          continue;
        }
        
        const fighter1Key = fight.fighter1.toLowerCase();
        const fighter2Key = fight.fighter2.toLowerCase();
        
        // Get or fetch fighter origins
        if (!fighterCache[fighter1Key]) {
          fighterCache[fighter1Key] = await getFighterOrigin(fight.fighter1);
        }
        if (!fighterCache[fighter2Key]) {
          fighterCache[fighter2Key] = await getFighterOrigin(fight.fighter2);
        }
        
        const origin1 = fighterCache[fighter1Key];
        const origin2 = fighterCache[fighter2Key];
        
        // Only add if at least one Dagestani fighter
        if (origin1.isDagestani || origin2.isDagestani) {
          // Determine which fighter is Dagestani
          const dagestaniFighter = origin1.isDagestani ? fight.fighter1 : fight.fighter2;
          
          // Determine result (win/loss)
          const result = fight.winner === dagestaniFighter ? 'win' : 'loss';
          
          const newFight: HistoricalFight = {
            eventId: fight.eventId,
            eventName: fight.eventName,
            eventDate: fight.eventDate,
            fighterA: fight.fighter1,
            fighterB: fight.fighter2,
            isDagestaniA: origin1.isDagestani,
            isDagestaniB: origin2.isDagestani,
            countryA: origin1.country,
            countryB: origin2.country,
            winner: fight.winner,
            method: fight.method,
            round: 'N/A', // Round data not available from UFCStats scraper
            dagestaniFighter,
            result
          };
          
          historical.push(newFight);
          existingFights.add(fightId); // Add to set to prevent duplicates within this run
          newFightsAdded++;
          newFightsInEvent++;
          
          const won = fight.winner === dagestaniFighter;
          console.log(`      ✅ ${dagestaniFighter} ${won ? 'WON' : 'LOST'} vs ${won ? fight.fighter2 : fight.fighter1}`);
        }
      }
      
      if (newFightsInEvent === 0) {
        console.log(`      ℹ️  No new Dagestani fights in this event`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (newFightsAdded > 0) {
      // Save updated data
      writeJson('fighters.json', fighterCache);
      writeJson('historical.json', historical);
      console.log(`\n   💾 Added ${newFightsAdded} new Dagestani fight(s) to historical data\n`);
    } else {
      console.log(`\n   ℹ️  No new Dagestani fights found\n`);
    }
    
  } catch (error) {
    console.error('   ❌ Error checking completed fights:', error);
    console.log('   ⚠️  Continuing with upcoming fights update...\n');
  }
}

/**
 * Move fights from upcoming to historical if their event date has passed
 * and ESPN no longer lists them as upcoming
 */
async function moveCompletedFights() {
  console.log('📦 Step 1: Checking for completed fights...\n');

  const upcoming: UpcomingFight[] = readJson('upcoming.json', []);
  const historical: HistoricalFight[] = readJson('historical.json', []);
  
  const now = new Date();
  const completedFights: UpcomingFight[] = [];
  const stillUpcoming: UpcomingFight[] = [];

  upcoming.forEach(fight => {
    const eventDate = new Date(fight.eventDate);
    if (eventDate < now) {
      completedFights.push(fight);
    } else {
      stillUpcoming.push(fight);
    }
  });

  if (completedFights.length > 0) {
    console.log(`   Found ${completedFights.length} completed fights:`);
    completedFights.forEach(fight => {
      console.log(`   - ${fight.fighterA} vs ${fight.fighterB} (${fight.eventName})`);
    });

    // Note: We can't determine winner from ESPN API easily
    // For now, just mark as completed. User can manually update with results
    // or we'd need to scrape UFCStats.com for these specific fights
    console.log('\n   ⚠️  Winner data not available from ESPN API');
    console.log('   💡 Run bootstrap script to fetch results from UFCStats.com');
    
    // Don't automatically move without winner data
    console.log('   ℹ️  Keeping in upcoming until winner data is available\n');
  } else {
    console.log('   No completed fights to move\n');
  }

  // Update upcoming to only include future fights
  writeJson('upcoming.json', stillUpcoming);
}

/**
 * Fetch upcoming events from ESPN and update upcoming table
 * Also removes fights that are now in historical
 */
async function updateUpcomingFights() {
  console.log('📡 Step 2: Fetching upcoming UFC events from ESPN...\n');

  try {
    const events = await fetchEvents();
    console.log(`   Found ${events.length} upcoming UFC events\n`);

    const fighterCache: Record<string, FighterOrigin> = readJson('fighters.json', {});
    const historical: HistoricalFight[] = readJson('historical.json', []);
    const allUpcomingFights: UpcomingFight[] = [];

    // Create a set of fights that are already in historical
    const historicalFightKeys = new Set(
      historical.map(f => {
        const fighters = [f.fighterA, f.fighterB].sort().join('|');
        return `${f.eventId}:${fighters}`;
      })
    );

    for (const event of events) {
      console.log(`   📋 Processing: ${event.name}`);
      
      const eventCard = await fetchEventDetails(event.id);
      if (!eventCard || !eventCard.fights || eventCard.fights.length === 0) {
        console.log(`      No fights found`);
        continue;
      }

      console.log(`      ${eventCard.fights.length} fights on card`);

      // Process each fight
      for (const fight of eventCard.fights) {
        if (fight.competitors.length !== 2) continue;

        const fighter1 = fight.competitors[0].name;
        const fighter2 = fight.competitors[1].name;
        const fighter1Key = fighter1.toLowerCase();
        const fighter2Key = fighter2.toLowerCase();

        // Check if this fight is already in historical
        const fighters = [fighter1, fighter2].sort().join('|');
        const fightKey = `${event.id}:${fighters}`;
        
        if (historicalFightKeys.has(fightKey)) {
          console.log(`      ⏭️  Skipping (already in historical): ${fighter1} vs ${fighter2}`);
          continue;
        }

        // Get or fetch fighter origins
        if (!fighterCache[fighter1Key]) {
          fighterCache[fighter1Key] = await getFighterOrigin(fighter1);
        }
        if (!fighterCache[fighter2Key]) {
          fighterCache[fighter2Key] = await getFighterOrigin(fighter2);
        }

        const origin1 = fighterCache[fighter1Key];
        const origin2 = fighterCache[fighter2Key];

        // Only include fights with at least one Dagestani fighter
        if (origin1.isDagestani || origin2.isDagestani) {
          allUpcomingFights.push({
            eventId: event.id,
            eventName: event.name,
            eventDate: event.date,
            fighterA: fighter1,
            fighterB: fighter2,
            isDagestaniA: origin1.isDagestani,
            isDagestaniB: origin2.isDagestani,
            countryA: origin1.country,
            countryB: origin2.country
          });

          const dagName = origin1.isDagestani ? fighter1 : fighter2;
          console.log(`      ✅ Dagestani fight: ${dagName}`);
        }
      }
    }

    // Save updated cache and upcoming fights
    writeJson('fighters.json', fighterCache);
    writeJson('upcoming.json', allUpcomingFights);

    console.log(`\n   💾 Saved ${allUpcomingFights.length} upcoming Dagestani fights\n`);
    
  } catch (error) {
    console.error('   ❌ Error fetching upcoming fights from ESPN:', error);
    console.log('   ⚠️  Keeping existing upcoming fights data\n');
    // Don't throw - let the script continue with stats calculation
  }
}

/**
 * Recalculate win rate statistics from historical data
 */
async function recalculateStats() {
  console.log('📊 Step 3: Recalculating statistics...\n');

  const historical: HistoricalFight[] = readJson('historical.json', []);

  if (historical.length === 0) {
    console.log('   No historical data yet\n');
    writeJson('stats.json', {
      totalFights: 0,
      wins: 0,
      losses: 0,
      winRate: 0
    });
    return;
  }

  let wins = 0;
  let losses = 0;

  historical.forEach(fight => {
    const dagFighter = fight.isDagestaniA ? fight.fighterA : fight.fighterB;
    if (fight.winner === dagFighter) {
      wins++;
    } else {
      losses++;
    }
  });

  const stats: Stats = {
    totalFights: historical.length,
    wins,
    losses,
    winRate: parseFloat(((wins / historical.length) * 100).toFixed(1))
  };

  writeJson('stats.json', stats);

  console.log(`   Total Fights: ${stats.totalFights}`);
  console.log(`   Wins: ${stats.wins}`);
  console.log(`   Losses: ${stats.losses}`);
  console.log(`   Win Rate: ${stats.winRate}%\n`);
}

// Run if executed directly
if (require.main === module) {
  dailyRefresh().catch(error => {
    console.error('❌ Error during refresh:', error);
    process.exit(1);
  });
}

export { dailyRefresh };
