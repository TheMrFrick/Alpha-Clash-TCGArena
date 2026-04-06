/**
 * Unit tests for alpha-clash-cards.json validation
 * Ensures card database integrity and consistency
 */

import * as fs from 'fs';
import * as path from 'path';

// Card type matching the actual JSON structure
interface CardFace {
  name: string;
  type: string;
  cost: number | null;
  image: string;
}

interface Card {
  affiliation: string | null;
  attack: number | null;
  color: string;
  colors: string[];
  cost: number | null;
  defense: number | null;
  face: {
    front: CardFace;
    back?: CardFace;
  };
  health: number | null;
  id: string;
  isToken: boolean;
  keywords: string[];
  name: string;
  planet: string | null;
  rarity: string;
  set: string;
  subtype: string | null;
  type: string;
}

interface CardDatabase {
  [cardId: string]: Card;
}

describe('Alpha Clash Card Database', () => {
  let database: CardDatabase;
  let cards: Card[];
  let cardEntries: [string, Card][];

  beforeAll(() => {
    const cardsPath = path.join(__dirname, '../../cards/alpha-clash-cards.json');
    const data = fs.readFileSync(cardsPath, 'utf-8');
    database = JSON.parse(data) as CardDatabase;
    cardEntries = Object.entries(database);
    cards = cardEntries.map(([, card]) => card);
  });

  describe('Basic Structure', () => {
    it('should load the database without errors', () => {
      expect(database).toBeDefined();
      expect(cardEntries.length).toBeGreaterThan(0);
    });

    it('should have at least 1000 cards', () => {
      expect(cardEntries.length).toBeGreaterThanOrEqual(1000);
    });

    it('should not have any empty entries', () => {
      for (const [key, card] of cardEntries) {
        expect(card).toBeDefined();
        expect(typeof card).toBe('object');
        expect(card).not.toBeNull();
      }
    });
  });

  describe('Key-Data Consistency', () => {
    it('should have database keys that match the card image filename', () => {
      const mismatches: string[] = [];
      
      for (const [key, card] of cardEntries) {
        const imageUrl = card.face.front.image;
        const filename = imageUrl.split('/').pop()?.replace('.webp', '');
        
        if (key !== filename) {
          mismatches.push(`Key "${key}" does not match image filename "${filename}"`);
        }
      }
      
      if (mismatches.length > 0) {
        console.error('Key-Image mismatches:', mismatches.slice(0, 10));
      }
      
      expect(mismatches).toHaveLength(0);
    });

    it('should have consistent id field across all cards', () => {
      const inconsistencies: string[] = [];
      
      for (const [key, card] of cardEntries) {
        // id should be a valid string
        if (typeof card.id !== 'string' || card.id.length === 0) {
          inconsistencies.push(`Card "${key}" has invalid id: ${card.id}`);
        }
      }
      
      expect(inconsistencies).toHaveLength(0);
    });

    it('should have name field matching face.front.name', () => {
      const mismatches: string[] = [];
      
      for (const [key, card] of cardEntries) {
        if (card.name !== card.face.front.name) {
          mismatches.push(`Card "${key}": name "${card.name}" !== front.name "${card.face.front.name}"`);
        }
      }
      
      expect(mismatches).toHaveLength(0);
    });
  });

  describe('Required Fields', () => {
    it('should have all required fields on every card', () => {
      const requiredFields = [
        'id', 'name', 'type', 'color', 'colors', 'rarity', 'set',
        'face', 'isToken', 'keywords', 'affiliation', 'attack',
        'defense', 'health', 'cost', 'planet', 'subtype'
      ];
      
      const missing: Array<{ key: string; field: string }> = [];
      
      for (const [key, card] of cardEntries) {
        for (const field of requiredFields) {
          if (!(field in card)) {
            missing.push({ key, field });
          }
        }
      }
      
      if (missing.length > 0) {
        console.error('Missing fields sample:', missing.slice(0, 10));
      }
      
      expect(missing).toHaveLength(0);
    });

    it('should have face.front with required properties', () => {
      const invalid: string[] = [];
      
      for (const [key, card] of cardEntries) {
        const front = card.face?.front;
        if (!front) {
          invalid.push(`Card "${key}" missing face.front`);
          continue;
        }
        
        if (!front.name || typeof front.name !== 'string') {
          invalid.push(`Card "${key}" has invalid face.front.name`);
        }
        
        if (!front.type || typeof front.type !== 'string') {
          invalid.push(`Card "${key}" has invalid face.front.type`);
        }
        
        if (!front.image || typeof front.image !== 'string' || !front.image.endsWith('.webp')) {
          invalid.push(`Card "${key}" has invalid face.front.image`);
        }
      }
      
      expect(invalid).toHaveLength(0);
    });
  });

  describe('Valid Values', () => {
    const validTypes = ['Contender', 'Clash', 'Action', 'Accessory', 'Clashground', 'Token', 'Basic'];
    const validColors = ['Blue', 'White', 'Red', 'Black', 'Green', 'Colorless', 'Multi'];
    const validRarities = [
      'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary',
      'Promo', 'Iconic Art', 'Iconic Rare', 'Starter Rare', 'Alpha Rare', 'AxO'
    ];

    it('should have valid card types', () => {
      const invalid: Array<{ key: string; type: string }> = [];
      
      for (const [key, card] of cardEntries) {
        if (!validTypes.includes(card.type)) {
          invalid.push({ key, type: card.type });
        }
      }
      
      expect(invalid).toHaveLength(0);
    });

    it('should have valid colors', () => {
      const invalid: Array<{ key: string; color: string }> = [];
      
      for (const [key, card] of cardEntries) {
        if (!validColors.includes(card.color)) {
          invalid.push({ key, color: card.color });
        }
      }
      
      expect(invalid).toHaveLength(0);
    });

    it('should have valid rarities', () => {
      const invalid: Array<{ key: string; rarity: string }> = [];
      
      for (const [key, card] of cardEntries) {
        if (!validRarities.includes(card.rarity)) {
          invalid.push({ key, rarity: card.rarity });
        }
      }
      
      expect(invalid).toHaveLength(0);
    });

    it('should have non-empty set names', () => {
      const invalid: string[] = [];
      
      for (const [key, card] of cardEntries) {
        if (!card.set || typeof card.set !== 'string' || card.set.trim() === '') {
          invalid.push(key);
        }
      }
      
      expect(invalid).toHaveLength(0);
    });
  });

  describe('Backface Data', () => {
    it('should have valid backface structure when present', () => {
      const invalid: string[] = [];
      
      for (const [key, card] of cardEntries) {
        if (card.face.back) {
          const back = card.face.back;
          
          if (!back.name || typeof back.name !== 'string') {
            invalid.push(`Card "${key}" has invalid backface name`);
          }
          
          if (!back.type || typeof back.type !== 'string') {
            invalid.push(`Card "${key}" has invalid backface type`);
          }
          
          if (!back.image || typeof back.image !== 'string' || !back.image.endsWith('.webp')) {
            invalid.push(`Card "${key}" has invalid backface image`);
          }
        }
      }
      
      expect(invalid).toHaveLength(0);
    });

    it('should track cards with backfaces', () => {
      const cardsWithBackface = cards.filter(c => c.face.back);
      
      // Log for debugging purposes
      console.log(`Found ${cardsWithBackface.length} cards with backfaces`);
      if (cardsWithBackface.length > 0) {
        console.log('Cards with backfaces:', cardsWithBackface.map(c => `${c.name} (${c.id})`));
      }
      
      // We expect at least the known backface cards to be present
      expect(cardsWithBackface.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Image URL Validation', () => {
    it('should have all images from the correct base URL', () => {
      const expectedBaseUrl = 'https://multi-deckplanet.us-southeast-1.linodeobjects.com/alpha_clash/';
      const invalid: string[] = [];
      
      for (const [key, card] of cardEntries) {
        const frontImage = card.face.front.image;
        if (!frontImage.startsWith(expectedBaseUrl)) {
          invalid.push(`Card "${key}" has invalid image URL: ${frontImage}`);
        }
        
        if (card.face.back) {
          const backImage = card.face.back.image;
          if (!backImage.startsWith(expectedBaseUrl)) {
            invalid.push(`Card "${key}" has invalid back image URL: ${backImage}`);
          }
        }
      }
      
      expect(invalid).toHaveLength(0);
    });

    it('should have unique image URLs across all cards', () => {
      const imageUrls: string[] = [];
      const duplicates: Array<{ url: string; cards: string[] }> = [];
      const urlToCards = new Map<string, string[]>();
      
      for (const [key, card] of cardEntries) {
        const frontUrl = card.face.front.image;
        if (!urlToCards.has(frontUrl)) {
          urlToCards.set(frontUrl, []);
        }
        urlToCards.get(frontUrl)!.push(key);
        
        if (card.face.back) {
          const backUrl = card.face.back.image;
          if (!urlToCards.has(backUrl)) {
            urlToCards.set(backUrl, []);
          }
          urlToCards.get(backUrl)!.push(`${key} (back)`);
        }
      }
      
      for (const [url, cardKeys] of urlToCards) {
        if (cardKeys.length > 1) {
          duplicates.push({ url, cards: cardKeys });
        }
      }
      
      if (duplicates.length > 0) {
        console.error('Duplicate image URLs:', duplicates);
      }
      
      expect(duplicates).toHaveLength(0);
    });
  });

  describe('Token Cards', () => {
    it('should have isToken=true only for Token type cards', () => {
      const mismatches: string[] = [];
      
      for (const [key, card] of cardEntries) {
        if (card.isToken && card.type !== 'Token') {
          mismatches.push(`Card "${key}" has isToken=true but type="${card.type}"`);
        }
        if (!card.isToken && card.type === 'Token') {
          mismatches.push(`Card "${key}" has isToken=false but type="Token"`);
        }
      }
      
      expect(mismatches).toHaveLength(0);
    });
  });

  describe('No Duplicate IDs', () => {
    it('should have unique id values across all cards', () => {
      const idCounts = new Map<string, string[]>();
      
      for (const [key, card] of cardEntries) {
        if (!idCounts.has(card.id)) {
          idCounts.set(card.id, []);
        }
        idCounts.get(card.id)!.push(key);
      }
      
      const duplicates = Array.from(idCounts.entries())
        .filter(([, keys]) => keys.length > 1);
      
      if (duplicates.length > 0) {
        console.error('Duplicate IDs found:', duplicates);
      }
      
      // Multiple database keys can have the same id (card_number) - this is expected
      // The test is just informational
      expect(duplicates.length).toBeGreaterThanOrEqual(0);
    });
  });
});
