/* eslint-disable no-console */
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { fetchEvents, fetchEventDetails } from '../lib/espn';
import {
  categorizeEvents,
  buildUpcomingFromEvents,
  appendHistoricalFromEvents,
  loadHistorical,
} from '../lib/dagestan';

async function main() {
  console.log('🔄 Dagestan UFC refresh started...\n');

  try {
    // Fetch all events from ESPN (this is a free API, no rate limits)
    const events = await fetchEvents();
    const { upcomingEvents, completedEvents } = categorizeEvents(events);

    console.log(`\n📊 Event Summary:`);
    console.log(`   Total events: ${events.length}`);
    console.log(`   Upcoming: ${upcomingEvents.length}`);
    console.log(`   Completed: ${completedEvents.length}\n`);

    // 1) Build upcoming table from all upcoming events
    console.log('🔨 Processing upcoming events...');
    const upcomingDetails = await Promise.all(
      upcomingEvents.map(e => fetchEventDetails(e.id))
    );
    await buildUpcomingFromEvents(upcomingDetails);

    // 2) Handle historical data
    const currentHistorical = loadHistorical();
    let completedToProcess = completedEvents;

    // ONE-TIME BOOTSTRAP: if historical is empty, only process last 5 completed events
    // This conserves OpenAI API calls - we don't need to analyze every UFC event ever
    if (currentHistorical.length === 0) {
      const bootstrapCount = 5;
      completedToProcess = completedEvents.slice(-bootstrapCount);
      console.log(`\n⚠️  Historical table is empty!`);
      console.log(`🔧 Running ONE-TIME bootstrap for last ${bootstrapCount} completed events...`);
      console.log(`   (This saves OpenAI API calls by not analyzing every past UFC event)`);
      console.log(`   Note: OpenAI has limits, so we're being conservative.\n`);
    } else {
      console.log(`\n✓ Historical table has ${currentHistorical.length} fights`);
      console.log(`🔍 Checking for new completed fights...\n`);
    }

    // Process completed events (either bootstrap set or all completed)
    console.log(`🔨 Processing ${completedToProcess.length} completed events...`);
    const completedDetails = await Promise.all(
      completedToProcess.map(e => fetchEventDetails(e.id))
    );
    
    // Rate limiting awareness: Add a small delay between OpenAI calls
    // (The getFighterOrigin function already has caching built in)
    console.log('\n💡 Note: Fighter origins are cached to minimize OpenAI API usage.');
    console.log('   Only new fighters trigger OpenAI calls.\n');
    
    await appendHistoricalFromEvents(completedDetails, currentHistorical);

    // Save timestamp of successful refresh
    const { saveLastRefreshTimestamp } = await import('../lib/storage');
    const timestamp = new Date().toISOString();
    saveLastRefreshTimestamp(timestamp);

    console.log('\n✅ Dagestan UFC refresh completed successfully!');
    console.log(`⏰ Last refresh: ${new Date(timestamp).toLocaleString()}`);
    console.log('\n📁 Data files updated:');
    console.log('   - data/upcoming.json');
    console.log('   - data/historical.json');
    console.log('   - data/fighters.json (cache)');
    console.log('   - data/stats.json');
    console.log('   - data/last-refresh.json');
    
  } catch (error) {
    console.error('\n❌ Refresh failed:', error);
    process.exit(1);
  }
}

main();
