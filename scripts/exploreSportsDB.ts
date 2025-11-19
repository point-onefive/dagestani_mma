// Deep dive into The Sports DB to see if it has individual fight details
async function exploreSportsDB() {
  console.log('Exploring The Sports DB for UFC fight details...\n');

  // Get recent UFC events
  const res = await fetch('https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=UFC&s=2024-2025');
  const data = await res.json();
  
  if (!data.event || data.event.length === 0) {
    console.log('No events found');
    return;
  }

  console.log(`Found ${data.event.length} UFC events\n`);

  // Look at the most recent completed event
  const completedEvents = data.event.filter((e: any) => e.strStatus === 'Match Finished');
  console.log(`Completed events: ${completedEvents.length}\n`);

  if (completedEvents.length > 0) {
    const recent = completedEvents[0];
    console.log('Most recent completed event:');
    console.log('  Name:', recent.strEvent);
    console.log('  Date:', recent.dateEvent);
    console.log('  Status:', recent.strStatus);
    console.log('  Result:', recent.strResult || 'N/A');
    console.log('  Event ID:', recent.idEvent);
    console.log('\n  Full event object keys:', Object.keys(recent).join(', '));

    // Try to get event details
    console.log('\n\nTrying to get fight card details...');
    const eventId = recent.idEvent;
    
    // Try lineup endpoint
    const lineupRes = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventlineups.php?id=${eventId}`);
    const lineupData = await lineupRes.json();
    console.log('Lineup data:', lineupData.lineup ? `${lineupData.lineup.length} items` : 'None');
    
    // Try event results endpoint  
    const resultsRes = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookupevent.php?id=${eventId}`);
    const resultsData = await resultsRes.json();
    console.log('Event details:', resultsData.events ? 'Available' : 'None');
    
    if (resultsData.events && resultsData.events[0]) {
      const evt = resultsData.events[0];
      console.log('\nDetailed event info:');
      console.log('  Fighter 1:', evt.strPlayer1 || 'N/A');
      console.log('  Fighter 2:', evt.strPlayer2 || 'N/A'); 
      console.log('  Score:', evt.intScore1, '-', evt.intScore2);
    }

    // Try to get past events by league
    console.log('\n\nTrying league events endpoint...');
    const leagueRes = await fetch('https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=4443');
    const leagueData = await leagueRes.json();
    console.log('Past league events:', leagueData.events ? `${leagueData.events.length} found` : 'None');
    
    if (leagueData.events && leagueData.events.length > 0) {
      console.log('\nFirst 3 past events:');
      leagueData.events.slice(0, 3).forEach((e: any, i: number) => {
        console.log(`  ${i+1}. ${e.strEvent} (${e.dateEvent})`);
        console.log(`     Fighters: ${e.strPlayer1 || 'N/A'} vs ${e.strPlayer2 || 'N/A'}`);
      });
    }
  }
}

exploreSportsDB().catch(console.error);
