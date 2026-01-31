/**
 * Convert Alpha Clash card data from raw format to typed Card format
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawCard {
  id: number;
  status: string;
  sort: number | null;
  card_name: string;
  card_number: string;
  card_type: string | null;
  card_subtype: string | null;
  card_color: string | null;
  card_rarity: string | null;
  card_cost: string | null;
  card_specific_cost: string | null;
  card_artist: string | null;
  card_skill: string | null;
  card_skill_styled: string | null;
  card_keywords: string[] | null;
  card_affiliation: string | null;
  card_attack: string | null;
  card_defense: string | null;
  card_health: string | null;
  view_count: number;
  card_series: string;
  card_planet: string | null;
  is_horizontal: boolean;
  has_errata: boolean;
  errata_text: string | null;
  is_banned: boolean;
  is_limited: boolean | null;
  limited_to: number | null;
  finishes: string[] | null;
  img_link: string;
}

const IMAGE_BASE_URL = 'https://multi-deckplanet.us-southeast-1.linodeobjects.com/alpha_clash';

interface CardFace {
  name: string;
  type: string;
  cost: number | null;
  image: string;
  isHorizontal: boolean;
  attack: number | null;
  defense: number | null;
  health: number | null;
  color: string;
  colors: string[];
  specificCost: string | null;
  affiliation: string | null;
  subtype: string | null;
  text: string | null;
  rarity: string;
  set: string;
  keywords: string[];
  artist: string | null;
  planet: string | null;
}

interface Card {
  id: string;
  isToken: boolean;
  face: {
    front: CardFace;
    back?: CardFace;
  };
  name: string;
  type: string;
  cost: number | null;
  color: string;
}

interface CardDatabase {
  [cardId: string]: Card;
}

// Image link is just the card number - game.json builds the full URL

// Normalize card type
function normalizeCardType(type: string | null): string {
  if (!type) return 'Clash';

  const normalized = type.trim();

  // Handle typo in data
  if (normalized === 'Clashround') return 'Clashground';

  // Valid types
  const validTypes = ['Contender', 'Clash', 'Action', 'Accessory', 'Clashground', 'Token', 'Basic'];
  if (validTypes.includes(normalized)) return normalized;

  return 'Clash';
}

// Normalize card rarity
function normalizeCardRarity(rarity: string | null): string {
  if (!rarity) return 'Common';

  const normalized = rarity.trim();

  // Fix typos
  const typoMap: Record<string, string> = {
    'Commmon': 'Common',
    'Comon': 'Common',
    'Uncommmon': 'Uncommon',
  };

  if (typoMap[normalized]) return typoMap[normalized];

  // Valid rarities
  const validRarities = [
    'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary',
    'Promo', 'Iconic Art', 'Iconic Rare', 'Starter Rare', 'Alpha Rare', 'AxO'
  ];

  if (validRarities.includes(normalized)) return normalized;

  return 'Common';
}

// Parse color into primary color and array of colors
function parseColor(colorStr: string | null): { color: string; colors: string[] } {
  if (!colorStr) return { color: 'Colorless', colors: [] };

  const normalized = colorStr.trim();

  // Multi-color cards
  if (normalized.includes('/')) {
    const colors = normalized.split('/').map(c => c.trim());
    return { color: 'Multi', colors };
  }

  // Single color
  const validColors = ['Blue', 'White', 'Red', 'Black', 'Green', 'Colorless'];
  if (validColors.includes(normalized)) {
    return { color: normalized, colors: [normalized] };
  }

  return { color: 'Colorless', colors: [] };
}

// Normalize affiliation
function normalizeAffiliation(affiliation: string | null): string | null {
  if (!affiliation) return null;

  const normalized = affiliation.trim().toLowerCase();

  const affiliationMap: Record<string, string> = {
    'alpha': 'Alpha',
    'harbinger': 'Harbinger',
    'progenitor': 'Progenitor',
    'rogue': 'Rogue',
    'dragon': 'Dragon',
    'alpha hunter': 'Alpha Hunter',
    'discarded': 'Discarded',
    'progenitor/ dragon': 'Progenitor',
    'progentior / dragon': 'Progenitor',
  };

  return affiliationMap[normalized] || null;
}

// Parse numeric value
function parseNumber(value: string | null): number | null {
  if (value === null || value === undefined) return null;
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
}

// Strip HTML tags from text
function stripHtml(html: string | null): string | null {
  if (!html) return null;
  return html
    .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// Convert a raw card to TCGArena Card format
function convertCard(raw: RawCard): Card {
  const { color, colors } = parseColor(raw.card_color);
  const cardType = normalizeCardType(raw.card_type);
  const cost = parseNumber(raw.card_cost);
  const isToken = cardType === 'Token';

  const front: CardFace = {
    name: raw.card_name,
    type: cardType,
    cost: cost,
    image: `${IMAGE_BASE_URL}/${raw.img_link}`,
    isHorizontal: raw.is_horizontal || false,
    attack: parseNumber(raw.card_attack),
    defense: parseNumber(raw.card_defense),
    health: parseNumber(raw.card_health),
    color,
    colors,
    specificCost: raw.card_specific_cost,
    affiliation: normalizeAffiliation(raw.card_affiliation),
    subtype: raw.card_subtype,
    text: stripHtml(raw.card_skill),
    rarity: normalizeCardRarity(raw.card_rarity),
    set: raw.card_series,
    keywords: raw.card_keywords || [],
    artist: raw.card_artist,
    planet: raw.card_planet,
  };

  return {
    id: raw.card_number,
    isToken,
    face: {
      front,
    },
    name: raw.card_name,
    type: cardType,
    cost: cost,
    color,
  };
}

// Main conversion function
function convertCards(): void {
  const inputPath = path.join(__dirname, '..', 'data', 'dp_alpha_clash_cards.json');
  const outputPath = path.join(__dirname, '..', 'cards', 'alpha-clash-cards.json');

  console.log('Reading raw card data...');
  const rawData: RawCard[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  console.log(`Converting ${rawData.length} cards...`);

  // Filter out cards with status !== 'published' if needed
  const publishedCards = rawData.filter(card => card.status === 'published');

  const cards = publishedCards.map(convertCard);

  // Build database as object with card IDs as keys (TCGArena format)
  const database: CardDatabase = {};

  // Add each card with its ID as the key
  for (const card of cards) {
    database[card.id] = card;
  }

  console.log(`Converted ${cards.length} cards (${cards.filter(c => c.isToken).length} tokens)`);
  console.log(`First card sample:`, JSON.stringify(cards[0], null, 2).substring(0, 500) + '...');

  console.log('Writing converted card data...');
  fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));

  console.log(`Successfully converted ${cards.length} cards to ${outputPath}`);

  // Print some stats
  const stats = {
    byType: {} as Record<string, number>,
    byColor: {} as Record<string, number>,
    byRarity: {} as Record<string, number>,
    bySet: {} as Record<string, number>,
  };

  for (const card of cards) {
    stats.byType[card.type] = (stats.byType[card.type] || 0) + 1;
    stats.byColor[card.color] = (stats.byColor[card.color] || 0) + 1;
    stats.byRarity[card.face.front.rarity] = (stats.byRarity[card.face.front.rarity] || 0) + 1;
    stats.bySet[card.face.front.set] = (stats.bySet[card.face.front.set] || 0) + 1;
  }

  console.log('\nCard Statistics:');
  console.log('By Type:', stats.byType);
  console.log('By Color:', stats.byColor);
  console.log('By Rarity:', stats.byRarity);
  console.log('By Set:', Object.keys(stats.bySet).length, 'sets');
}

convertCards();
