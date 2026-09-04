/**
 * Fetch raw Alpha Clash card data from Deckplanet into data/dp_alpha_clash_cards.json
 *
 * This is the input file consumed by scripts/convert-cards.ts.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://api.deckplanet.net/items/alpha_clash_cards?limit=-1';
// const API_URL = 'http://localhost:8055/items/alpha_clash_cards?limit=-1';

// Fields that only make sense inside Deckplanet's own data model
const STRIPPED_FIELDS = ['variant_of', 'variants'];

interface DeckplanetResponse {
  data: Record<string, unknown>[];
}

async function fetchCards(): Promise<void> {
  const outputPath = path.join(__dirname, '..', 'data', 'dp_alpha_clash_cards.json');

  console.log(`Fetching card data from ${API_URL} ...`);
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as DeckplanetResponse;

  if (!Array.isArray(json.data)) {
    throw new Error('Unexpected response shape: expected a "data" array');
  }

  console.log(`Fetched ${json.data.length} cards`);

  for (const card of json.data) {
    for (const field of STRIPPED_FIELDS) {
      delete card[field];
    }
  }

  const publishedCount = json.data.filter(c => c['status'] === 'published').length;
  console.log(`${publishedCount} cards are published`);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(json.data, undefined, 2));

  console.log(`Wrote ${json.data.length} cards to ${outputPath}`);
  console.log('Run convert-cards next to rebuild cards/alpha-clash-cards.json');
}

fetchCards().catch(err => {
  console.error('Fetch failed:', err);
  process.exit(1);
});
