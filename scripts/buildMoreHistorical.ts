/**
 * Incremental Historical Data Builder
 * 
 * This script appends MORE historical data to the existing historical.json
 * by fetching older UFC events (using offset).
 * 
 * Usage:
 *   npm run bootstrap:more -- --offset 100 --count 100
 *   
 * This would fetch events 101-200 (the next 100 after the first 100)
 */

import { config } from 'dotenv';
import { fetchHistoricalData } from '../lib/ufcstats';
import { getFighterOrigin, type FighterOrigin } from '../lib/openai';
import { readJson, writeJson } from '../lib/storage';

// Load .env.local
config({ path: '.env.local' });

interface HistoricalFight {
  eventId: string;
  eventName: string;
  eventDate: string;
  fighterA: string;
  fighterB: string;
  isDagestaniA: boolean;
  isDagestaniB: boolean;
  winner: string;
  method: string;
  round: string;
  dagestaniFighter: string;
  result: 'win' | 'loss';
}

async function buildMoreHistoricalData() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let offset = 100; // Default: start after first 100
  let count = 100;  // Default: fetch 100 more
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--offset' && args[i + 1]) {
      offset = parseInt(args[i + 1]);
    }
    if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1]);
    }
  }

  console.log(`\n🔄 INCREMENTAL BOOTSTRAP`);
  console.log(`   Fetching events ${offset + 1} to ${offset + count}\n`);
  console.log('=' .repeat(60) + '\n');

  // Verify OpenAI key is loaded
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    console.error('   Make sure .env.local exists with OPENAI_API_KEY=your_key');
    process.exit(1);
  }

  // Fetch UFC events with offset
  const allFights = await fetchHistoricalData(count, offset);
  
  if (allFights.length === 0) {
    console.log('❌ No fights found in this range');
    return;
  }

  // Load fighter cache
  const fighterCache: Record<string, FighterOrigin> = readJson('fighters.json', {});
  
  // Identify all unique fighters
  const uniqueFighters = new Set<string>();
  allFights.forEach(fight => {
    uniqueFighters.add(fight.fighter1.toLowerCase());
    uniqueFighters.add(fight.fighter2.toLowerCase());
  });

  console.log(`\n👤 Identifying origins for ${uniqueFighters.size} unique fighters...`);
  console.log(`   (${Object.keys(fighterCache).length} already cached)\n`);

  // Identify fighter origins
  let apiCalls = 0;
  for (const fighter of uniqueFighters) {
    if (!fighterCache[fighter]) {
      const origin = await getFighterOrigin(fighter);
      fighterCache[fighter] = origin;
      apiCalls++;
      
      // Rate limit OpenAI calls
      if (apiCalls % 5 === 0) {
        console.log(`   ... processed ${apiCalls} new fighters`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // Save updated cache
  writeJson('fighters.json', fighterCache);
  console.log(`\n✅ Fighter cache updated (${apiCalls} new OpenAI calls)\n`);

  // Filter for Dagestani fights
  const dagestaniFights = allFights.filter(fight => {
    const fighter1Origin = fighterCache[fight.fighter1.toLowerCase()];
    const fighter2Origin = fighterCache[fight.fighter2.toLowerCase()];
    return fighter1Origin?.isDagestani || fighter2Origin?.isDagestani;
  });

  console.log(`\n📊 Results:`);
  console.log(`   Total fights analyzed: ${allFights.length}`);
  console.log(`   Dagestani fights found: ${dagestaniFights.length}\n`);

  if (dagestaniFights.length > 0) {
    // Load existing historical data
    const existingHistorical: HistoricalFight[] = readJson('historical.json', []);
    
    // Build new historical records
    const newHistoricalData = dagestaniFights.map(fight => {
      const fighter1Origin = fighterCache[fight.fighter1.toLowerCase()];
      const fighter2Origin = fighterCache[fight.fighter2.toLowerCase()];
      const isDagestaniA = fighter1Origin?.isDagestani || false;
      const isDagestaniB = fighter2Origin?.isDagestani || false;
      
      // Determine which fighter is Dagestani
      const dagestaniFighter = isDagestaniA ? fight.fighter1 : fight.fighter2;
      
      // Determine result (win/loss)
      const result = fight.winner === dagestaniFighter ? 'win' : 'loss';
      
      return {
        eventId: fight.eventId,
        eventName: fight.eventName,
        eventDate: fight.eventDate,
        fighterA: fight.fighter1,
        fighterB: fight.fighter2,
        isDagestaniA,
        isDagestaniB,
        winner: fight.winner,
        method: fight.method,
        round: 'N/A', // Round data not available from UFCStats scraper
        dagestaniFighter,
        result
      };
    });

    // Check for duplicates based on eventId + fighters
    const existingKeys = new Set(
      existingHistorical.map(f => `${f.eventId}-${f.fighterA}-${f.fighterB}`)
    );
    
    const uniqueNewFights = newHistoricalData.filter(f => {
      const key = `${f.eventId}-${f.fighterA}-${f.fighterB}`;
      return !existingKeys.has(key);
    });

    console.log(`   New unique fights to add: ${uniqueNewFights.length}`);
    
    if (uniqueNewFights.length > 0) {
      console.log('\nNew Dagestani fights:');
      uniqueNewFights.forEach((fight, i) => {
        const isDag1 = fight.isDagestaniA;
        const dagFighter = isDag1 ? fight.fighterA : fight.fighterB;
        const won = fight.winner === dagFighter;
        const result = won ? '✅ WIN' : '❌ LOSS';
        
        console.log(`${i+1}. ${fight.fighterA} vs ${fight.fighterB}`);
        console.log(`   ${result} - ${dagFighter} (${fight.method})`);
        console.log(`   ${fight.eventName} - ${fight.eventDate}\n`);
      });

      // Append to existing historical data
      const updatedHistorical = [...existingHistorical, ...uniqueNewFights];
      writeJson('historical.json', updatedHistorical);
      console.log(`\n💾 Updated historical.json: ${existingHistorical.length} → ${updatedHistorical.length} fights`);

      // Recalculate win rate
      const dagestaniWins = updatedHistorical.filter(fight => {
        const dagFighter = fight.isDagestaniA ? fight.fighterA : fight.fighterB;
        return fight.winner === dagFighter;
      }).length;

      const winRate = (dagestaniWins / updatedHistorical.length) * 100;
      
      const stats = {
        totalFights: updatedHistorical.length,
        wins: dagestaniWins,
        losses: updatedHistorical.length - dagestaniWins,
        winRate: parseFloat(winRate.toFixed(1))
      };

      writeJson('stats.json', stats);
      console.log(`\n📈 Updated Win Rate Statistics:`);
      console.log(`   Wins: ${stats.wins}`);
      console.log(`   Losses: ${stats.losses}`);
      console.log(`   Win Rate: ${stats.winRate}%`);
    } else {
      console.log('\n   No new unique fights to add (all were duplicates)');
    }
  }
  
  console.log(`\n✅ Incremental bootstrap complete!`);
  console.log(`\nTo fetch even more, run:`);
  console.log(`npm run bootstrap:more -- --offset ${offset + count} --count 100\n`);
}

buildMoreHistoricalData().catch(console.error);
