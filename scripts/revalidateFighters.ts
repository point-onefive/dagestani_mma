// scripts/revalidateFighters.ts
// Re-check fighter origins with improved OpenAI prompts

import { getFighterOrigin } from '../lib/openai';
import { readJson, writeJson } from '../lib/storage';

async function revalidateFighters() {
  console.log('🔄 Revalidating fighter origins...\n');

  const cache = readJson('fighters.json', {});
  const fighters = Object.keys(cache);

  console.log(`Found ${fighters.length} fighters in cache\n`);

  // Fighters to specifically recheck based on your concerns
  const priorityFighters = [
    'Abdul-Rakhman Yakhyaev',
    'Tagir Ulanbekov',
    'Saygid Izagakhmaev'
  ];

  console.log('Priority fighters to revalidate:');
  for (const name of priorityFighters) {
    const key = name.toLowerCase();
    if (cache[key]) {
      console.log(`  - ${name}: Currently ${cache[key].country} (${cache[key].state || 'no state'}) - Dagestani: ${cache[key].isDagestani}`);
    } else {
      console.log(`  - ${name}: NOT IN CACHE`);
    }
  }

  console.log('\n❓ Do you want to:');
  console.log('1. Revalidate ONLY priority fighters');
  console.log('2. Revalidate ALL fighters (costs more API calls)');
  console.log('3. Delete cache entries for priority fighters and re-fetch');
  console.log('\nFor now, run option 3 (delete & re-fetch priority fighters):\n');

  // Option 3: Delete priority fighters from cache
  for (const name of priorityFighters) {
    const key = name.toLowerCase();
    if (cache[key]) {
      console.log(`🗑️  Deleting cache for: ${name}`);
      delete cache[key];
    }
  }

  writeJson('fighters.json', cache);
  console.log('\n✅ Cache entries deleted. Run refresh again to re-fetch with new prompt.');
  
  console.log('\n📋 To manually verify, check these fighter origins:');
  console.log('  - Abdul-Rakhman Yakhyaev: Should be TURKEY (not Dagestan)');
  console.log('  - Tagir Ulanbekov: Should be RUSSIA, Dagestan (IS Dagestani)');
  console.log('  - Saygid Izagakhmaev: Should be RUSSIA, Dagestan (IS Dagestani)');
}

revalidateFighters();
