// lib/ufcstats.ts - Scraper for UFCStats.com historical data
import * as cheerio from 'cheerio';

export interface UFCStatsEvent {
  id: string;
  name: string;
  date: string;
  url: string;
}

export interface UFCStatsFight {
  eventId: string;
  eventName: string;
  eventDate: string;
  fighter1: string;
  fighter2: string;
  winner: string; // fighter1 or fighter2
  method: string; // KO, SUB, DEC, etc.
}

/**
 * Fetch list of completed UFC events from UFCStats.com
 */
export async function fetchCompletedEvents(limit = 20, offset = 0): Promise<UFCStatsEvent[]> {
  console.log(`📥 Fetching completed events from UFCStats.com (offset: ${offset}, limit: ${limit})...`);
  
  const res = await fetch('http://ufcstats.com/statistics/events/completed?page=all');
  const html = await res.text();
  const $ = cheerio.load(html);

  const events: UFCStatsEvent[] = [];
  
  // Find all event rows in the table
  $('tr.b-statistics__table-row').each((i, elem) => {
    if (i === 0) return; // Skip header row
    
    // Apply offset and limit
    const rowIndex = i - 1; // Adjust for header
    if (rowIndex < offset) return;
    if (rowIndex >= offset + limit) return false; // Stop iteration

    const $row = $(elem);
    const link = $row.find('a.b-link').first();
    const url = link.attr('href');
    const nameText = link.text().trim();
    const dateText = $row.find('span.b-statistics__date').text().trim();

    if (url && nameText && dateText) {
      const id = url.split('/').pop() || '';
      events.push({
        id,
        name: nameText,
        date: dateText,
        url: url
      });
    }
  });

  console.log(`   Found ${events.length} events`);
  return events;
}

/**
 * Fetch fight details for a specific event
 */
export async function fetchEventFights(event: UFCStatsEvent): Promise<UFCStatsFight[]> {
  console.log(`   📋 Fetching fights for: ${event.name}`);
  
  const res = await fetch(event.url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const fights: UFCStatsFight[] = [];

  // Find all fight rows
  $('tbody tr.b-fight-details__table-row').each((i, elem) => {
    const $row = $(elem);
    
    // Get all <a> tags - first is win indicator, next two are fighters
    const $links = $row.find('a');
    if ($links.length < 3) return;

    const winIndicator = $links.eq(0).text().trim().toLowerCase();
    const fighter1 = $links.eq(1).text().trim();
    const fighter2 = $links.eq(2).text().trim();

    if (!fighter1 || !fighter2) return;

    // Determine winner based on which fighter is listed first
    // If first link says "win", fighter1 won; otherwise fighter2 won
    const winner = winIndicator === 'win' ? fighter1 : fighter2;

    // Get method - find all <p> tags and look for method text
    const $cells = $row.find('p.b-fight-details__table-text');
    let method = 'Unknown';
    
    // Method is typically in one of the middle cells
    $cells.each((_, el) => {
      const text = $(el).text().trim();
      if (text.match(/^(KO|TKO|SUB|DEC|UD|SD|MD|NC|DQ)/i)) {
        method = text;
      }
    });

    fights.push({
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      fighter1,
      fighter2,
      winner,
      method
    });
  });

  console.log(`      ✓ ${fights.length} fights extracted`);
  return fights;
}

/**
 * Fetch historical UFC data: get recent events and their fights
 */
export async function fetchHistoricalData(numEvents = 100, offset = 0): Promise<UFCStatsFight[]> {
  console.log(`\n🔍 Fetching historical UFC data (${numEvents} events, starting at offset ${offset})...\n`);
  
  const events = await fetchCompletedEvents(numEvents, offset);
  const allFights: UFCStatsFight[] = [];

  let eventCount = 0;
  for (const event of events) {
    try {
      eventCount++;
      const fights = await fetchEventFights(event);
      allFights.push(...fights);
      
      // Progress update every 10 events
      if (eventCount % 10 === 0) {
        console.log(`   📈 Progress: ${eventCount}/${events.length} events processed, ${allFights.length} fights collected\n`);
      }
      
      // Rate limiting - be respectful to UFCStats.com
      // Slower rate for large batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`   ❌ Error fetching ${event.name}:`, error);
    }
  }

  console.log(`\n✅ Total fights collected: ${allFights.length}\n`);
  return allFights;
}
