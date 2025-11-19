// Fetch and parse ufcstats.com for historical UFC data
async function fetchUFCStats() {
  console.log('Fetching UFC Stats for completed events...\n');

  const res = await fetch('http://ufcstats.com/statistics/events/completed?page=all');
  const html = await res.text();

  // Parse the HTML to extract event links
  const eventLinkRegex = /href="(http:\/\/ufcstats\.com\/event-details\/[^"]+)"/g;
  const matches = [...html.matchAll(eventLinkRegex)];
  
  const eventUrls = [...new Set(matches.map(m => m[1]))];
  console.log(`Found ${eventUrls.length} completed UFC events\n`);

  if (eventUrls.length > 0) {
    console.log('Most recent 5 events:');
    for (let i = 0; i < Math.min(5, eventUrls.length); i++) {
      console.log(`${i+1}. ${eventUrls[i]}`);
    }

    // Fetch details for the most recent event
    console.log('\n\nFetching fight card for most recent event...');
    const eventRes = await fetch(eventUrls[0]);
    const eventHtml = await eventRes.text();

    // Extract event name
    const eventNameMatch = eventHtml.match(/<h2[^>]*>\s*<span[^>]*>(.*?)<\/span>/);
    const eventName = eventNameMatch ? eventNameMatch[1].trim() : 'Unknown';
    console.log('Event:', eventName);

    // Extract fight data - looking for fighter names and results
    const fightRows = eventHtml.match(/<tr[^>]*data-link[^>]*>[\s\S]*?<\/tr>/g) || [];
    console.log(`\nFights found: ${fightRows.length}\n`);

    if (fightRows.length > 0) {
      // Parse first fight as example
      const firstFight = fightRows[0];
      
      // Extract fighter names (they're in <a> tags)
      const fighterMatches = [...firstFight.matchAll(/<a[^>]*>\s*([^<]+)\s*<\/a>/g)];
      const fighters = fighterMatches
        .map(m => m[1].trim())
        .filter(name => name && !name.includes('href') && name.length > 3);

      console.log('First fight example:');
      console.log('  Fighters found:', fighters.slice(0, 2));

      // Look for result indicators (W/L columns)
      const hasWinLoss = firstFight.includes('<i class="b-flag__text">W</i>') || 
                         firstFight.includes('<i class="b-flag__text">L</i>');
      console.log('  Has win/loss data:', hasWinLoss);

      if (hasWinLoss) {
        const isWin1 = firstFight.indexOf('b-flag__text">W') < firstFight.lastIndexOf('b-flag__text">W');
        console.log('  Fighter 1 won:', isWin1);
      }
    }

    console.log('\n✅ UFCStats.com is viable for historical data!');
    console.log('   We can scrape: Event names, fighter names, and W/L results');
  }
}

fetchUFCStats().catch(console.error);
