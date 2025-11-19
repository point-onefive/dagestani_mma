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

  const prompt = `Given the professional MMA fighter name "${name}", determine their country and state/region of origin.

For Russian fighters, please specify if they are from Dagestan, Chechnya, or another specific region.
For fighters from other countries, include the state/region if it's notable.

Return ONLY this JSON format:
{
  "country": "<country name>",
  "state": "<state/region name or null>",
  "isDagestani": true or false
}

Set "isDagestani" to true ONLY if the fighter is specifically from Dagestan, Russia.
Use null for state if the region is unknown or not notable.

If you are not sure, use:
{
  "country": "Unknown",
  "state": null,
  "isDagestani": false
}

Examples:
- Khabib Nurmagomedov → {"country": "Russia", "state": "Dagestan", "isDagestani": true}
- Islam Makhachev → {"country": "Russia", "state": "Dagestan", "isDagestani": true}
- Petr Yan → {"country": "Russia", "state": null, "isDagestani": false}
- Conor McGregor → {"country": "Ireland", "state": null, "isDagestani": false}
- Khamzat Chimaev → {"country": "Russia", "state": "Chechnya", "isDagestani": false}`;

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
