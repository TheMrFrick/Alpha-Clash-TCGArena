/**
 * Alpha Clash TCG - Card Type Definitions
 */

export type CardType =
  | 'Contender'
  | 'Creature'
  | 'Spell'
  | 'Quick-Spell'
  | 'Artifact'
  | 'Trap'
  | 'Portal'
  | 'Resource';

export type CardRarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Ultra Rare';

export type CardElement =
  | 'Fire'
  | 'Ice'
  | 'Dark'
  | 'Nature'
  | 'Storm'
  | 'Earth'
  | 'Air'
  | 'Neutral';

export type CardKeyword =
  | 'Flying'
  | 'Taunt'
  | 'Stealth'
  | 'Haste'
  | 'Quick Strike'
  | 'Defender'
  | 'Hexproof';

export interface CardFace {
  name: string;
  type: string;
  image: string;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  attack: number;
  defense: number;
  img_link: string;
  text: string;
  rarity: CardRarity;
  set: string;
  element?: CardElement;
  keywords?: CardKeyword[];
  subtype?: string;
  isHorizontal?: boolean;
  face?: {
    front: CardFace;
    back?: CardFace;
  };
}

export interface CardDatabase {
  _metadata?: {
    name: string;
    version: string;
    lastUpdated: string;
    totalCards: number;
    source: string;
    description: string;
  };
  [cardId: string]: Card | CardDatabase['_metadata'];
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
  | 'Artifact-Trap-Zone'
  | 'Resources'
  | 'Discard';

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
