// Test if we can fetch historical UFC events from ESPN API
async function main() {
  const res = await fetch('https://site.web.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard');
  const data = await res.json();
  
  const calendar = data.leagues?.[0]?.calendar || [];
  console.log(`Total calendar items: ${calendar.length}\n`);
  
  // Find past events (before today)
  const now = new Date();
  const pastEvents = calendar.filter((item: any) => new Date(item.startDate) < now);
  const futureEvents = calendar.filter((item: any) => new Date(item.startDate) >= now);
  
  console.log(`Past events: ${pastEvents.length}`);
  console.log(`Future events: ${futureEvents.length}\n`);
  
  if (pastEvents.length > 0) {
    console.log('Most recent past events:');
    pastEvents.slice(0, 5).forEach((item: any, i: number) => {
      console.log(`${i + 1}. ${item.label} - ${item.startDate}`);
    });
    
    // Try to fetch details for the most recent past event
    console.log('\n🔍 Attempting to fetch most recent past event details...');
    const recentEvent = pastEvents[0];
    
    // ESPN calendar items don't have IDs, try the scoreboard with a date filter
    const eventDate = new Date(recentEvent.startDate);
    const dateStr = eventDate.toISOString().split('T')[0].replace(/-/g, '');
    
    console.log(`Trying date query: ${dateStr}`);
    const dateRes = await fetch(`https://site.web.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard?dates=${dateStr}`);
    const dateData = await dateRes.json();
    
    console.log(`Events found for ${recentEvent.label}: ${dateData.events?.length || 0}`);
    if (dateData.events && dateData.events.length > 0) {
      console.log('✅ Successfully retrieved historical event!');
      console.log('Event:', dateData.events[0].name);
      console.log('Status:', dateData.events[0].status?.type?.description);
    }
  }
}

main().catch(console.error);
