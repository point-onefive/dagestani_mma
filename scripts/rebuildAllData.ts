// scripts/rebuildAllData.ts
// Complete rebuild of fighter cache and historical data with improved OpenAI prompt

import { readJson, writeJson } from '../lib/storage';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function rebuildData() {
  console.log('🔄 COMPLETE DATA REBUILD');
  console.log('='.repeat(60));
  console.log('\nThis will:');
  console.log('  1. Delete the entire fighters.json cache (801 fighters)');
  console.log('  2. Delete historical.json (35 fights)');
  console.log('  3. Re-run the refresh to rebuild everything with the new prompt');
  console.log('\n⚠️  WARNING: This will use OpenAI API credits to re-classify fighters');
  console.log('   Estimated cost: ~$0.80 - $2.00 depending on usage\n');

  const answer = await question('Are you sure you want to proceed? (yes/no): ');
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Rebuild cancelled.');
    rl.close();
    return;
  }

  console.log('\n🗑️  Deleting fighters.json cache...');
  writeJson('fighters.json', {});
  
  console.log('🗑️  Deleting historical.json...');
  writeJson('historical.json', []);
  
  console.log('🗑️  Resetting stats.json...');
  writeJson('stats.json', {
    totalFights: 0,
    wins: 0,
    losses: 0,
    winRate: 0
  });

  console.log('\n✅ All data cleared!');
  console.log('\n📋 Next steps:');
  console.log('   1. Run: npm run refresh');
  console.log('   2. This will rebuild everything with the improved OpenAI prompt');
  console.log('   3. Monitor the output for any classification errors');
  console.log('\n💡 The refresh will take several minutes due to API calls.');
  
  rl.close();
}

rebuildData();
