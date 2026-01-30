/**
 * Alpha Clash TCG - Token Type Definitions
 */

export type TokenId =
  | 'damage-counter'
  | 'boost-counter'
  | 'shield-counter'
  | 'status-stun'
  | 'status-freeze';

export interface TokenDefinition {
  id: TokenId;
  name: string;
  image: string;
  color: string;
  stackable: boolean;
  value: number;
}

export interface TokenInstance {
  definitionId: TokenId;
  count: number;
  cardInstanceId: string;
}

export const TOKEN_DEFINITIONS: Record<TokenId, TokenDefinition> = {
  'damage-counter': {
    id: 'damage-counter',
    name: 'Damage Counter',
    image: 'images/tokens/damage.png',
    color: '#FF4444',
    stackable: true,
    value: 1,
  },
  'boost-counter': {
    id: 'boost-counter',
    name: 'Boost Counter',
    image: 'images/tokens/boost.png',
    color: '#44FF44',
    stackable: true,
    value: 1,
  },
  'shield-counter': {
    id: 'shield-counter',
    name: 'Shield Counter',
    image: 'images/tokens/shield.png',
    color: '#4444FF',
    stackable: true,
    value: 1,
  },
  'status-stun': {
    id: 'status-stun',
    name: 'Stun Token',
    image: 'images/tokens/stun.png',
    color: '#FFFF00',
    stackable: false,
    value: 1,
  },
  'status-freeze': {
    id: 'status-freeze',
    name: 'Freeze Token',
    image: 'images/tokens/freeze.png',
    color: '#00FFFF',
    stackable: false,
    value: 1,
  },
};

export function getTokenDefinition(id: TokenId): TokenDefinition {
  return TOKEN_DEFINITIONS[id];
}

export function isValidTokenId(id: string): id is TokenId {
  return id in TOKEN_DEFINITIONS;
}
