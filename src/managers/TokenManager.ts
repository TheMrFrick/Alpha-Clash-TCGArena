/**
 * Alpha Clash TCG - Token Manager
 * Manages tokens on cards (damage counters, boosts, shields, etc.)
 */

import { TokenId, TokenDefinition, TOKEN_DEFINITIONS, isValidTokenId } from '../types';
import { debug, generateId } from '../utils';

export interface TokenState {
  [tokenId: string]: number;
}

export interface TokenManagerConfig {
  stackLimit: number;
}

const DEFAULT_CONFIG: TokenManagerConfig = {
  stackLimit: 99,
};

export class TokenManager {
  private tokens: Map<string, TokenState> = new Map();
  private config: TokenManagerConfig;

  constructor(config: Partial<TokenManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    debug('TokenManager initialized');
  }

  /**
   * Add a token to a card
   */
  addToken(cardId: string, tokenId: TokenId, count = 1): number {
    if (!isValidTokenId(tokenId)) {
      throw new Error(`Invalid token ID: ${tokenId}`);
    }

    const definition = TOKEN_DEFINITIONS[tokenId];

    if (!this.tokens.has(cardId)) {
      this.tokens.set(cardId, {});
    }

    const cardTokens = this.tokens.get(cardId)!;
    const currentCount = cardTokens[tokenId] ?? 0;

    // For non-stackable tokens, max is 1
    const maxCount = definition.stackable ? this.config.stackLimit : 1;
    const newCount = Math.min(currentCount + count, maxCount);

    cardTokens[tokenId] = newCount;

    debug(`Added ${count} ${tokenId} to card ${cardId}, new total: ${newCount}`);
    return newCount;
  }

  /**
   * Remove a token from a card
   */
  removeToken(cardId: string, tokenId: TokenId, count = 1): number {
    if (!isValidTokenId(tokenId)) {
      throw new Error(`Invalid token ID: ${tokenId}`);
    }

    const cardTokens = this.tokens.get(cardId);
    if (!cardTokens) {
      return 0;
    }

    const currentCount = cardTokens[tokenId] ?? 0;
    const newCount = Math.max(currentCount - count, 0);

    if (newCount === 0) {
      delete cardTokens[tokenId];
    } else {
      cardTokens[tokenId] = newCount;
    }

    // Clean up empty card entries
    if (Object.keys(cardTokens).length === 0) {
      this.tokens.delete(cardId);
    }

    debug(`Removed ${count} ${tokenId} from card ${cardId}, new total: ${newCount}`);
    return newCount;
  }

  /**
   * Set the exact count of a token on a card
   */
  setTokenCount(cardId: string, tokenId: TokenId, count: number): void {
    if (!isValidTokenId(tokenId)) {
      throw new Error(`Invalid token ID: ${tokenId}`);
    }

    const definition = TOKEN_DEFINITIONS[tokenId];
    const maxCount = definition.stackable ? this.config.stackLimit : 1;
    const clampedCount = Math.min(Math.max(count, 0), maxCount);

    if (clampedCount === 0) {
      this.removeToken(cardId, tokenId, this.getTokenCount(cardId, tokenId));
      return;
    }

    if (!this.tokens.has(cardId)) {
      this.tokens.set(cardId, {});
    }

    this.tokens.get(cardId)![tokenId] = clampedCount;
  }

  /**
   * Get the count of a specific token on a card
   */
  getTokenCount(cardId: string, tokenId: TokenId): number {
    const cardTokens = this.tokens.get(cardId);
    if (!cardTokens) {
      return 0;
    }
    return cardTokens[tokenId] ?? 0;
  }

  /**
   * Get all tokens on a card
   */
  getTokensOnCard(cardId: string): TokenState {
    return { ...(this.tokens.get(cardId) ?? {}) };
  }

  /**
   * Check if a card has any tokens
   */
  hasTokens(cardId: string): boolean {
    const cardTokens = this.tokens.get(cardId);
    return cardTokens !== undefined && Object.keys(cardTokens).length > 0;
  }

  /**
   * Check if a card has a specific token
   */
  hasToken(cardId: string, tokenId: TokenId): boolean {
    return this.getTokenCount(cardId, tokenId) > 0;
  }

  /**
   * Clear all tokens from a card
   */
  clearTokens(cardId: string): void {
    this.tokens.delete(cardId);
    debug(`Cleared all tokens from card ${cardId}`);
  }

  /**
   * Clear all tokens from all cards
   */
  clearAllTokens(): void {
    this.tokens.clear();
    debug('Cleared all tokens from all cards');
  }

  /**
   * Get token definition by ID
   */
  getTokenDefinition(tokenId: TokenId): TokenDefinition {
    return TOKEN_DEFINITIONS[tokenId];
  }

  /**
   * Get all token definitions
   */
  getAllTokenDefinitions(): TokenDefinition[] {
    return Object.values(TOKEN_DEFINITIONS);
  }

  /**
   * Get all cards with tokens
   */
  getCardsWithTokens(): string[] {
    return Array.from(this.tokens.keys());
  }

  /**
   * Serialize token state
   */
  serialize(): Map<string, TokenState> {
    return new Map(this.tokens);
  }

  /**
   * Restore from serialized state
   */
  restore(state: Map<string, TokenState>): void {
    this.tokens = new Map(state);
  }

  /**
   * Get total token count across all cards
   */
  getTotalTokenCount(): number {
    let total = 0;
    for (const cardTokens of this.tokens.values()) {
      for (const count of Object.values(cardTokens)) {
        total += count;
      }
    }
    return total;
  }
}

// Singleton instance for global use
let defaultTokenManager: TokenManager | null = null;

export function getTokenManager(): TokenManager {
  if (!defaultTokenManager) {
    defaultTokenManager = new TokenManager();
  }
  return defaultTokenManager;
}

export function resetTokenManager(): void {
  defaultTokenManager = null;
}
