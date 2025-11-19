// scripts/inspectEspn.ts
/* eslint-disable no-console */

async function main() {
  console.log('🔍 Inspecting ESPN API structure...\n');

  try {
    // Fetch the scoreboard
    const res = await fetch('https://site.web.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const data = await res.json();
    
    console.log('Full API Response Structure:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
