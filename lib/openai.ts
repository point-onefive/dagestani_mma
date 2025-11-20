// lib/openai.ts
import OpenAI from 'openai';
import { readJson, writeJson } from './storage';

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

export type FighterOrigin = {
  name: string;
  country: string;
  state: string | null; // Region/state (e.g., "Dagestan", "Chechnya", "California")
  isDagestani: boolean;
};

type FighterCache = Record<string, FighterOrigin>;

const FIGHTERS_FILE = 'fighters.json';

function loadCache(): FighterCache {
  return readJson<FighterCache>(FIGHTERS_FILE, {});
}

function saveCache(cache: FighterCache) {
  writeJson(FIGHTERS_FILE, cache);
}

export async function getFighterOrigin(name: string): Promise<FighterOrigin> {
  const cache = loadCache();
  const key = name.trim().toLowerCase();

  if (cache[key]) {
    console.log(`✓ Cache hit for: ${name}`);
    return cache[key];
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn(`⚠ No OpenAI API key, marking ${name} as Unknown`);
    const fallback: FighterOrigin = {
      name,
      country: 'Unknown',
      state: null,
      isDagestani: false,
    };
    cache[key] = fallback;
    saveCache(cache);
    return fallback;
  }

  console.log(`🔍 Calling OpenAI API for: ${name}`);

  const prompt = `You are an MMA fighter database expert. Given the professional MMA/UFC fighter name "${name}", determine their BIRTHPLACE and region of origin with high accuracy.

CRITICAL INSTRUCTIONS:
1. Research the fighter's actual birthplace and hometown, not just their training location
2. For Russian fighters, determine if they are specifically from the Republic of Dagestan
3. Many fighters with "Magomed", "Khabib", "Islam", "Said", or similar names are from Dagestan, but verify each individually
4. Some Russian-speaking fighters may be from other countries (Turkey, Azerbaijan, Kazakhstan, etc.)
5. Be especially careful with fighters who have moved between countries

For Russian fighters, you MUST specify their specific region (Dagestan, Chechnya, Moscow, etc.).

Return ONLY this JSON format:
{
  "country": "<country of birth/origin>",
  "state": "<specific region/republic or null>",
  "isDagestani": true or false
}

Set "isDagestani" to true ONLY if:
- The fighter was born in the Republic of Dagestan, Russia, OR
- The fighter is widely documented as being from Dagestan

EXAMPLES:
- Khabib Nurmagomedov → {"country": "Russia", "state": "Dagestan", "isDagestani": true}
- Islam Makhachev → {"country": "Russia", "state": "Dagestan", "isDagestani": true}
- Tagir Ulanbekov → {"country": "Russia", "state": "Dagestan", "isDagestani": true}
- Abdul-Rakhman Yakhyaev → {"country": "Turkey", "state": null, "isDagestani": false}
- Petr Yan → {"country": "Russia", "state": null, "isDagestani": false}
- Khamzat Chimaev → {"country": "Russia", "state": "Chechnya", "isDagestani": false}
- Conor McGregor → {"country": "Ireland", "state": null, "isDagestani": false}

If you cannot verify the information with confidence, use:
{
  "country": "Unknown",
  "state": null,
  "isDagestani": false
}`;

  try {
    const openai = getClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a sports data expert. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    let parsed: { country?: string; state?: string | null; isDagestani?: boolean } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    const origin: FighterOrigin = {
      name,
      country: parsed.country || 'Unknown',
      state: parsed.state || null,
      isDagestani: !!parsed.isDagestani,
    };

    cache[key] = origin;
    saveCache(cache);
    const stateStr = origin.state ? ` (${origin.state})` : '';
    console.log(`✓ Cached ${name}: ${origin.country}${stateStr} (Dagestani: ${origin.isDagestani})`);
    return origin;
  } catch (error) {
    console.error(`❌ OpenAI error for ${name}:`, error);
    const fallback: FighterOrigin = {
      name,
      country: 'Unknown',
      state: null,
      isDagestani: false,
    };
    cache[key] = fallback;
    saveCache(cache);
    return fallback;
  }
}
