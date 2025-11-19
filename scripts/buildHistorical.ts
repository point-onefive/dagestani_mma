import { config } from 'dotenv';
import { fetchHistoricalData } from '../lib/ufcstats';
import { getFighterOrigin, type FighterOrigin } from '../lib/openai';
import { readJson, writeJson } from '../lib/storage';

// Load .env.local
config({ path: '.env.local' });

async function buildHistoricalData() {
  console.log('🏗️  Building historical Dagestani fight database...\n');

  // Verify OpenAI key is loaded
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    console.error('   Make sure .env.local exists with OPENAI_API_KEY=your_key');
    process.exit(1);
  }

  // Fetch last 100 UFC events for comprehensive historical data
  const allFights = await fetchHistoricalData(100);
  
  if (allFights.length === 0) {
    console.log('❌ No fights found');
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
    console.log('Dagestani fights:');
    dagestaniFights.forEach((fight, i) => {
      const isDag1 = fighterCache[fight.fighter1.toLowerCase()]?.isDagestani;
      const isDag2 = fighterCache[fight.fighter2.toLowerCase()]?.isDagestani;
      const dagFighter = isDag1 ? fight.fighter1 : fight.fighter2;
      const won = fight.winner === dagFighter;
      const result = won ? '✅ WIN' : '❌ LOSS';
      
      console.log(`${i+1}. ${fight.fighter1} vs ${fight.fighter2}`);
      console.log(`   ${result} - ${dagFighter} (${fight.method})`);
      console.log(`   ${fight.eventName} - ${fight.eventDate}\n`);
    });

    // Build historical.json format
    const historicalData = dagestaniFights.map(fight => {
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

    // Save historical data
    writeJson('historical.json', historicalData);
    console.log(`\n💾 Saved ${historicalData.length} historical fights to data/historical.json`);

    // Calculate win rate
    const dagestaniWins = dagestaniFights.filter(fight => {
      const isDag1 = fighterCache[fight.fighter1.toLowerCase()]?.isDagestani;
      const dagFighter = isDag1 ? fight.fighter1 : fight.fighter2;
      return fight.winner === dagFighter;
    }).length;

    const winRate = (dagestaniWins / dagestaniFights.length) * 100;
    
    const stats = {
      totalFights: dagestaniFights.length,
      wins: dagestaniWins,
      losses: dagestaniFights.length - dagestaniWins,
      winRate: parseFloat(winRate.toFixed(1))
    };

    writeJson('stats.json', stats);
    console.log(`\n📈 Win Rate Statistics:`);
    console.log(`   Wins: ${stats.wins}`);
    console.log(`   Losses: ${stats.losses}`);
    console.log(`   Win Rate: ${stats.winRate}%`);
  }
}

buildHistoricalData().catch(console.error);
