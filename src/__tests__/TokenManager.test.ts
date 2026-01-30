/**
 * Alpha Clash TCG - TokenManager Unit Tests
 */

import { TokenManager, resetTokenManager } from '../managers/TokenManager';
import { TokenId } from '../types';

describe('TokenManager', () => {
  let manager: TokenManager;

  beforeEach(() => {
    resetTokenManager();
    manager = new TokenManager();
  });

  describe('addToken', () => {
    it('should add a token to a card', () => {
      const result = manager.addToken('card-1', 'damage-counter');
      expect(result).toBe(1);
      expect(manager.getTokenCount('card-1', 'damage-counter')).toBe(1);
    });

    it('should stack multiple tokens', () => {
      manager.addToken('card-1', 'damage-counter');
      manager.addToken('card-1', 'damage-counter');
      manager.addToken('card-1', 'damage-counter');

      expect(manager.getTokenCount('card-1', 'damage-counter')).toBe(3);
    });

    it('should add multiple tokens at once', () => {
      const result = manager.addToken('card-1', 'damage-counter', 5);
      expect(result).toBe(5);
      expect(manager.getTokenCount('card-1', 'damage-counter')).toBe(5);
    });

    it('should respect stack limit', () => {
      const manager = new TokenManager({ stackLimit: 10 });
      manager.addToken('card-1', 'damage-counter', 15);

      expect(manager.getTokenCount('card-1', 'damage-counter')).toBe(10);
    });

    it('should limit non-stackable tokens to 1', () => {
      manager.addToken('card-1', 'status-stun');
      manager.addToken('card-1', 'status-stun');

      expect(manager.getTokenCount('card-1', 'status-stun')).toBe(1);
    });

    it('should throw error for invalid token ID', () => {
      expect(() => {
        manager.addToken('card-1', 'invalid-token' as TokenId);
      }).toThrow('Invalid token ID');
    });

    it('should handle multiple token types on same card', () => {
      manager.addToken('card-1', 'damage-counter', 3);
      manager.addToken('card-1', 'boost-counter', 2);
      manager.addToken('card-1', 'shield-counter', 1);

      expect(manager.getTokenCount('card-1', 'damage-counter')).toBe(3);
      expect(manager.getTokenCount('card-1', 'boost-counter')).toBe(2);
      expect(manager.getTokenCount('card-1', 'shield-counter')).toBe(1);
    });
  });

  describe('removeToken', () => {
    it('should remove a token from a card', () => {
      manager.addToken('card-1', 'damage-counter', 5);
      const result = manager.removeToken('card-1', 'damage-counter');

      expect(result).toBe(4);
      expect(manager.getTokenCount('card-1', 'damage-counter')).toBe(4);
    });

    it('should remove multiple tokens at once', () => {
      manager.addToken('card-1', 'damage-counter', 5);
      const result = manager.removeToken('card-1', 'damage-counter', 3);

      expect(result).toBe(2);
      expect(manager.getTokenCount('card-1', 'damage-counter')).toBe(2);
    });

    it('should not go below 0', () => {
      manager.addToken('card-1', 'damage-counter', 2);
      const result = manager.removeToken('card-1', 'damage-counter', 5);

      expect(result).toBe(0);
      expect(manager.getTokenCount('card-1', 'damage-counter')).toBe(0);
    });

    it('should return 0 for non-existent card', () => {
      const result = manager.removeToken('non-existent', 'damage-counter');
      expect(result).toBe(0);
    });

    it('should clean up empty token entries', () => {
      manager.addToken('card-1', 'damage-counter', 1);
      manager.removeToken('card-1', 'damage-counter', 1);

      expect(manager.hasTokens('card-1')).toBe(false);
    });
  });

  describe('setTokenCount', () => {
    it('should set exact token count', () => {
      manager.setTokenCount('card-1', 'damage-counter', 7);
      expect(manager.getTokenCount('card-1', 'damage-counter')).toBe(7);
    });

    it('should clamp to stack limit', () => {
      const manager = new TokenManager({ stackLimit: 10 });
      manager.setTokenCount('card-1', 'damage-counter', 100);

      expect(manager.getTokenCount('card-1', 'damage-counter')).toBe(10);
    });

    it('should remove token when set to 0', () => {
      manager.addToken('card-1', 'damage-counter', 5);
      manager.setTokenCount('card-1', 'damage-counter', 0);

      expect(manager.hasToken('card-1', 'damage-counter')).toBe(false);
    });
  });

  describe('getTokensOnCard', () => {
    it('should return all tokens on a card', () => {
      manager.addToken('card-1', 'damage-counter', 3);
      manager.addToken('card-1', 'boost-counter', 2);

      const tokens = manager.getTokensOnCard('card-1');

      expect(tokens).toEqual({
        'damage-counter': 3,
        'boost-counter': 2,
      });
    });

    it('should return empty object for card with no tokens', () => {
      const tokens = manager.getTokensOnCard('non-existent');
      expect(tokens).toEqual({});
    });

    it('should return a copy, not the original', () => {
      manager.addToken('card-1', 'damage-counter', 3);
      const tokens = manager.getTokensOnCard('card-1');
      tokens['damage-counter'] = 100;

      expect(manager.getTokenCount('card-1', 'damage-counter')).toBe(3);
    });
  });

  describe('hasTokens', () => {
    it('should return true if card has any tokens', () => {
      manager.addToken('card-1', 'damage-counter');
      expect(manager.hasTokens('card-1')).toBe(true);
    });

    it('should return false if card has no tokens', () => {
      expect(manager.hasTokens('card-1')).toBe(false);
    });
  });

  describe('hasToken', () => {
    it('should return true if card has specific token', () => {
      manager.addToken('card-1', 'damage-counter');
      expect(manager.hasToken('card-1', 'damage-counter')).toBe(true);
    });

    it('should return false if card does not have specific token', () => {
      manager.addToken('card-1', 'damage-counter');
      expect(manager.hasToken('card-1', 'boost-counter')).toBe(false);
    });
  });

  describe('clearTokens', () => {
    it('should remove all tokens from a card', () => {
      manager.addToken('card-1', 'damage-counter', 3);
      manager.addToken('card-1', 'boost-counter', 2);
      manager.clearTokens('card-1');

      expect(manager.hasTokens('card-1')).toBe(false);
    });

    it('should not affect other cards', () => {
      manager.addToken('card-1', 'damage-counter', 3);
      manager.addToken('card-2', 'damage-counter', 5);
      manager.clearTokens('card-1');

      expect(manager.hasTokens('card-1')).toBe(false);
      expect(manager.getTokenCount('card-2', 'damage-counter')).toBe(5);
    });
  });

  describe('clearAllTokens', () => {
    it('should remove all tokens from all cards', () => {
      manager.addToken('card-1', 'damage-counter', 3);
      manager.addToken('card-2', 'boost-counter', 2);
      manager.addToken('card-3', 'shield-counter', 1);
      manager.clearAllTokens();

      expect(manager.getCardsWithTokens()).toHaveLength(0);
    });
  });

  describe('getCardsWithTokens', () => {
    it('should return all card IDs with tokens', () => {
      manager.addToken('card-1', 'damage-counter');
      manager.addToken('card-2', 'boost-counter');
      manager.addToken('card-3', 'shield-counter');

      const cards = manager.getCardsWithTokens();

      expect(cards).toHaveLength(3);
      expect(cards).toContain('card-1');
      expect(cards).toContain('card-2');
      expect(cards).toContain('card-3');
    });
  });

  describe('getTotalTokenCount', () => {
    it('should return total count across all cards', () => {
      manager.addToken('card-1', 'damage-counter', 3);
      manager.addToken('card-1', 'boost-counter', 2);
      manager.addToken('card-2', 'damage-counter', 5);

      expect(manager.getTotalTokenCount()).toBe(10);
    });

    it('should return 0 when no tokens exist', () => {
      expect(manager.getTotalTokenCount()).toBe(0);
    });
  });

  describe('serialize/restore', () => {
    it('should serialize and restore state', () => {
      manager.addToken('card-1', 'damage-counter', 3);
      manager.addToken('card-2', 'boost-counter', 2);

      const serialized = manager.serialize();

      const newManager = new TokenManager();
      newManager.restore(serialized);

      expect(newManager.getTokenCount('card-1', 'damage-counter')).toBe(3);
      expect(newManager.getTokenCount('card-2', 'boost-counter')).toBe(2);
    });
  });

  describe('getTokenDefinition', () => {
    it('should return token definition', () => {
      const def = manager.getTokenDefinition('damage-counter');

      expect(def.id).toBe('damage-counter');
      expect(def.name).toBe('Damage Counter');
      expect(def.stackable).toBe(true);
    });
  });

  describe('getAllTokenDefinitions', () => {
    it('should return all token definitions', () => {
      const defs = manager.getAllTokenDefinitions();

      expect(defs.length).toBeGreaterThan(0);
      expect(defs.some((d) => d.id === 'damage-counter')).toBe(true);
      expect(defs.some((d) => d.id === 'boost-counter')).toBe(true);
    });
  });
});
