/**
 * Migration Script - Add missing fields to historical.json
 * 
 * This one-time script adds the missing fields (round, dagestaniFighter, result)
 * to all existing historical fight records.
 */

import { readJson, writeJson } from '../lib/storage';

interface OldHistoricalFight {
  eventId: string;
  eventName: string;
  eventDate: string;
  fighterA: string;
  fighterB: string;
  isDagestaniA: boolean;
  isDagestaniB: boolean;
  winner: string;
  method: string;
}

interface NewHistoricalFight extends OldHistoricalFight {
  round: string;
  dagestaniFighter: string;
  result: 'win' | 'loss';
}

async function migrateHistoricalData() {
  console.log('\n🔄 MIGRATING HISTORICAL DATA\n');
  console.log('=' .repeat(60) + '\n');

  const oldData: OldHistoricalFight[] = readJson('historical.json', []);
  
  console.log(`📋 Found ${oldData.length} historical fights to migrate\n`);

  const newData: NewHistoricalFight[] = oldData.map((fight, index) => {
    // Determine which fighter is Dagestani
    const dagestaniFighter = fight.isDagestaniA ? fight.fighterA : fight.fighterB;
    
    // Determine result (win/loss)
    const result = fight.winner === dagestaniFighter ? 'win' : 'loss';
    
    console.log(`${index + 1}. ${fight.fighterA} vs ${fight.fighterB}`);
    console.log(`   ${dagestaniFighter} - ${result.toUpperCase()}`);
    console.log(`   ${fight.eventName} (${fight.eventDate})\n`);
    
    return {
      ...fight,
      round: 'N/A', // Round data not available from UFCStats scraper
      dagestaniFighter,
      result
    };
  });

  // Save migrated data
  writeJson('historical.json', newData);
  
  console.log('=' .repeat(60));
  console.log(`\n✅ Migration complete!`);
  console.log(`   Updated ${newData.length} historical fights\n`);
}

migrateHistoricalData().catch(console.error);
