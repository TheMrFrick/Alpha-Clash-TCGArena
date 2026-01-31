/**
 * Alpha Clash TCG - Card Type Definitions
 */

export type CardType =
  | 'Contender'
  | 'Clash'
  | 'Action'
  | 'Accessory'
  | 'Clashground'
  | 'Token'
  | 'Basic';

export type CardRarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Legendary'
  | 'Promo'
  | 'Iconic Art'
  | 'Iconic Rare'
  | 'Starter Rare'
  | 'Alpha Rare'
  | 'AxO';

export type CardColor =
  | 'Blue'
  | 'White'
  | 'Red'
  | 'Black'
  | 'Green'
  | 'Colorless'
  | 'Multi';

export type CardAffiliation =
  | 'Alpha'
  | 'Harbinger'
  | 'Progenitor'
  | 'Rogue'
  | 'Dragon'
  | 'Alpha Hunter'
  | 'Discarded';

export type CardKeyword =
  | 'Flying'
  | 'Taunt'
  | 'Stealth'
  | 'Haste'
  | 'Quick Strike'
  | 'Defender'
  | 'Hexproof'
  | 'Engage'
  | 'Guard'
  | 'Ambush'
  | 'Foretell'
  | 'Portal'
  | 'Banish'
  | 'Trigger';

export interface CardFace {
  name: string;
  type: string;
  image: string;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  subtype: string | null;
  color: CardColor;
  colors: string[];
  cost: number | null;
  specificCost: string | null;
  attack: number | null;
  defense: number | null;
  health: number | null;
  text: string | null;
  rarity: CardRarity;
  set: string;
  cardNumber: string;
  affiliation: CardAffiliation | null;
  keywords: string[];
  artist: string | null;
  planet: string | null;
  imgLink: string;
  isHorizontal: boolean;
  isBanned: boolean;
  isLimited: boolean;
  limitedTo: number | null;
  hasErrata: boolean;
  errataText: string | null;
}

export interface CardDatabaseMetadata {
  name: string;
  version: string;
  lastUpdated: string;
  totalCards: number;
  source: string;
  description: string;
}

export interface CardDatabase {
  _metadata: CardDatabaseMetadata;
  [cardId: string]: Card | CardDatabaseMetadata;
}

export interface CardInstance {
  card: Card;
  instanceId: string;
  isTapped: boolean;
  isFaceDown: boolean;
  tokens: Map<string, number>;
  zone: ZoneName;
  ownerId: string;
}

export type ZoneName =
  | 'Deck'
  | 'Hand'
  | 'Contender'
  | 'Portal'
  | 'Clashground'
  | 'Clash-Zone'
  | 'Accessory-Zone'
  | 'Resources'
  | 'Oblivion'
  | 'Banished';

export interface Zone {
  name: ZoneName;
  cards: CardInstance[];
  maxCards: number | null;
  faceDown: boolean;
  canTap: boolean;
}

export function isCard(obj: unknown): obj is Card {
  if (typeof obj !== 'object' || obj === null) return false;
  const card = obj as Record<string, unknown>;
  return (
    typeof card['id'] === 'string' &&
    typeof card['name'] === 'string' &&
    typeof card['type'] === 'string'
  );
}

export function createCardInstance(
  card: Card,
  ownerId: string,
  zone: ZoneName
): CardInstance {
  return {
    card,
    instanceId: `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    isTapped: false,
    isFaceDown: zone === 'Deck' || zone === 'Resources',
    tokens: new Map(),
    zone,
    ownerId,
  };
}
