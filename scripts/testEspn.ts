// scripts/testEspn.ts
/* eslint-disable no-console */
import { fetchEvents, fetchEventDetails } from '../lib/espn';

async function main() {
  console.log('🧪 Testing ESPN API...\n');

  try {
    // Test 1: Fetch events list
    const events = await fetchEvents();
    console.log(`\n✅ Successfully fetched ${events.length} events`);
    
    if (events.length > 0) {
      console.log('\nFirst 3 events:');
      events.slice(0, 3).forEach((e, i) => {
        console.log(`  ${i + 1}. ${e.name} (${e.status}) - ${e.date}`);
      });

      // Test 2: Fetch details for first event
      const firstEvent = events[0];
      console.log(`\n🔍 Fetching details for: ${firstEvent.name}...`);
      const details = await fetchEventDetails(firstEvent.id);
      
      console.log(`\n✅ Event details retrieved:`);
      console.log(`   Name: ${details.name}`);
      console.log(`   Date: ${details.date}`);
      console.log(`   Fights: ${details.fights.length}`);
      
      if (details.fights.length > 0) {
        console.log('\nFirst fight:');
        const fight = details.fights[0];
        console.log(`   Status: ${fight.status}`);
        console.log(`   Competitors: ${fight.competitors.length}`);
        fight.competitors.forEach((c, i) => {
          console.log(`     ${i + 1}. ${c.name}${c.winner ? ' (WINNER)' : ''}`);
        });
        if (fight.method) console.log(`   Method: ${fight.method}`);
        if (fight.round) console.log(`   Round: ${fight.round}`);
      }
    }

    console.log('\n✅ ESPN API test completed successfully!');
  } catch (error) {
    console.error('\n❌ ESPN API test failed:', error);
    process.exit(1);
  }
}

main();
