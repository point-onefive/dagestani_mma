// lib/espn.ts
export type RawEvent = {
  id: string;
  name: string;
  date: string;
  status: string;
};

export type RawCompetitor = {
  name: string;
  winner?: boolean;
};

export type RawFight = {
  id: string;
  competitors: RawCompetitor[];
  status: string;
  method?: string;
  round?: string;
};

export type RawEventWithCard = {
  id: string;
  name: string;
  date: string;
  fights: RawFight[];
};

const BASE = 'https://site.web.api.espn.com/apis/site/v2/sports/mma/ufc';

async function fetchWithRetry(url: string, retries = 3, delay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { 
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
      // If rate limited (429) or server error (5xx), retry
      if (res.status === 429 || res.status >= 500) {
        console.log(`   ⚠️  ESPN API returned ${res.status}, retrying in ${delay}ms... (${i + 1}/${retries})`);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      return res;
    } catch (error) {
      console.log(`   ⚠️  Network error, retrying in ${delay}ms... (${i + 1}/${retries})`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}

export async function fetchEvents(): Promise<RawEvent[]> {
  console.log('📡 Fetching UFC events from ESPN...');
  const res = await fetchWithRetry(`${BASE}/scoreboard`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch events from ESPN: ${res.status}`);
  }
  
  const data = await res.json();
  
  // ESPN API structure: { events: [...] }
  const rawEvents = data.events || [];
  
  const events: RawEvent[] = rawEvents.map((e: any) => {
    const status = e.status?.type?.name || e.status?.type?.state || 'unknown';
    return {
      id: String(e.id || ''),
      name: e.name || e.shortName || '',
      date: e.date || '',
      status,
    };
  });

  console.log(`✓ Found ${events.length} events`);
  return events;
}

export async function fetchEventDetails(eventId: string): Promise<RawEventWithCard> {
  console.log(`📡 Fetching event details for ${eventId}...`);
  
  // Fetch from scoreboard and extract the specific event
  const res = await fetchWithRetry(`${BASE}/scoreboard`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch scoreboard from ESPN: ${res.status}`);
  }
  
  const data = await res.json();
  const event = (data.events || []).find((e: any) => String(e.id) === String(eventId));
  
  if (!event) {
    console.warn(`Event ${eventId} not found in scoreboard`);
    return {
      id: eventId,
      name: 'Unknown Event',
      date: '',
      fights: [],
    };
  }
  
  // Parse fights from competitions array
  const competitions: any[] = event.competitions || [];
  
  const fights: RawFight[] = competitions.map((comp: any) => {
    const competitors: RawCompetitor[] = (comp.competitors || []).map((c: any) => ({
      name: c.athlete?.displayName || c.athlete?.name || '',
      winner: c.winner === true,
    }));
    
    return {
      id: String(comp.id || ''),
      competitors,
      status: comp.status?.type?.name || comp.status?.type?.state || 'unknown',
      method: comp.status?.type?.detail || '',
      round: comp.status?.period ? String(comp.status.period) : '',
    };
  });

  console.log(`✓ Found ${fights.length} fights for event ${eventId}`);
  
  return {
    id: String(event.id),
    name: event.name || event.shortName || '',
    date: event.date || '',
    fights,
  };
}
