// Test alternative sources for UFC historical data
async function testAlternatives() {
  console.log('Testing alternative UFC data sources...\n');

  // Test 1: UFC Stats official site (public data)
  try {
    console.log('1. Testing UFC Stats site scraping potential...');
    const res1 = await fetch('http://ufcstats.com/statistics/events/completed?page=all');
    console.log('   UFC Stats:', res1.status, res1.ok ? '✅ Accessible' : '❌ Not accessible');
  } catch (e: any) {
    console.log('   ❌ Error:', e.message);
  }

  // Test 2: Sherdog (another MMA stats site)
  try {
    console.log('\n2. Testing Sherdog...');
    const res2 = await fetch('https://www.sherdog.com/organizations/Ultimate-Fighting-Championship-UFC-2');
    console.log('   Sherdog:', res2.status, res2.ok ? '✅ Accessible' : '❌ Not accessible');
  } catch (e: any) {
    console.log('   ❌ Error:', e.message);
  }

  // Test 3: ESPN's historical endpoint with different params
  try {
    console.log('\n3. Testing ESPN with limit param...');
    const res3 = await fetch('https://site.web.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard?limit=100');
    const data = await res3.json();
    console.log('   ESPN with limit:', res3.status);
    console.log('   Events returned:', data.events?.length || 0);
  } catch (e: any) {
    console.log('   ❌ Error:', e.message);
  }

  // Test 4: Try ESPN summary endpoint
  try {
    console.log('\n4. Testing ESPN summary endpoint...');
    const res4 = await fetch('https://site.api.espn.com/apis/site/v2/sports/mma/ufc/summary?event=600055175');
    console.log('   ESPN Summary:', res4.status);
    if (res4.ok) {
      const data = await res4.json();
      console.log('   Has boxscore:', !!data.boxscore);
      console.log('   Has competitors:', !!data.boxscore?.competitors);
    }
  } catch (e: any) {
    console.log('   ❌ Error:', e.message);
  }

  // Test 5: The Sports DB (free tier)
  try {
    console.log('\n5. Testing The Sports DB...');
    const res5 = await fetch('https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=UFC');
    console.log('   The Sports DB:', res5.status);
    if (res5.ok) {
      const data = await res5.json();
      console.log('   Events found:', data.event?.length || 0);
      if (data.event && data.event.length > 0) {
        console.log('   Sample event:', data.event[0].strEvent);
        console.log('   Has results:', !!data.event[0].strResult);
      }
    }
  } catch (e: any) {
    console.log('   ❌ Error:', e.message);
  }
}

testAlternatives();
