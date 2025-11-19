// Test RapidAPI UFC endpoints for historical data
async function testRapidAPI() {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    console.log('❌ No RAPIDAPI_KEY found in environment');
    return;
  }

  console.log('Testing RapidAPI UFC endpoints...\n');

  // Test 1: MMA Stats API - has historical fight data
  try {
    const res1 = await fetch('https://mma-stats.p.rapidapi.com/events/UFC_300', {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'mma-stats.p.rapidapi.com'
      }
    });
    console.log('1. MMA Stats API - UFC 300:', res1.status);
    if (res1.ok) {
      const data = await res1.json();
      console.log('   ✅ Response:', JSON.stringify(data).substring(0, 200));
    }
  } catch (e: any) {
    console.log('   ❌ Error:', e.message);
  }

  // Test 2: UFC API v1
  try {
    const res2 = await fetch('https://ufc-data-api.p.rapidapi.com/events', {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'ufc-data-api.p.rapidapi.com'
      }
    });
    console.log('\n2. UFC Data API - Events:', res2.status);
    if (res2.ok) {
      const data = await res2.json();
      console.log('   ✅ Sample:', JSON.stringify(data).substring(0, 300));
    }
  } catch (e: any) {
    console.log('   ❌ Error:', e.message);
  }

  // Test 3: Ultimate Fighter API
  try {
    const res3 = await fetch('https://ultimate-fighter.p.rapidapi.com/api/events', {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'ultimate-fighter.p.rapidapi.com'
      }
    });
    console.log('\n3. Ultimate Fighter API - Events:', res3.status);
    if (res3.ok) {
      const data = await res3.json();
      console.log('   ✅ Sample:', JSON.stringify(data).substring(0, 300));
    }
  } catch (e: any) {
    console.log('   ❌ Error:', e.message);
  }
}

testRapidAPI();
