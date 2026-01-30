/**
 * Alpha Clash TCG - LifeManager Unit Tests
 */

import { LifeManager, resetLifeManager, LifeChangeEvent } from '../managers/LifeManager';

describe('LifeManager', () => {
  let manager: LifeManager;

  beforeEach(() => {
    resetLifeManager();
    manager = new LifeManager();
  });

  describe('initializePlayer', () => {
    it('should initialize player with default starting life', () => {
      manager.initializePlayer('player-1');
      expect(manager.getLife('player-1')).toBe(20);
    });

    it('should initialize player with custom starting life', () => {
      manager.initializePlayer('player-1', 30);
      expect(manager.getLife('player-1')).toBe(30);
    });

    it('should use config starting life if not specified', () => {
      const customManager = new LifeManager({ startingLife: 25 });
      customManager.initializePlayer('player-1');
      expect(customManager.getLife('player-1')).toBe(25);
    });
  });

  describe('getLife', () => {
    it('should return current life total', () => {
      manager.initializePlayer('player-1', 15);
      expect(manager.getLife('player-1')).toBe(15);
    });

    it('should throw error for non-existent player', () => {
      expect(() => manager.getLife('non-existent')).toThrow('Player non-existent not found');
    });
  });

  describe('hasPlayer', () => {
    it('should return true for existing player', () => {
      manager.initializePlayer('player-1');
      expect(manager.hasPlayer('player-1')).toBe(true);
    });

    it('should return false for non-existent player', () => {
      expect(manager.hasPlayer('non-existent')).toBe(false);
    });
  });

  describe('setLife', () => {
    beforeEach(() => {
      manager.initializePlayer('player-1', 20);
    });

    it('should set life to specified amount', () => {
      manager.setLife('player-1', 15);
      expect(manager.getLife('player-1')).toBe(15);
    });

    it('should not go below minimum life', () => {
      manager.setLife('player-1', -10);
      expect(manager.getLife('player-1')).toBe(0);
    });

    it('should respect max life if configured', () => {
      const customManager = new LifeManager({ startingLife: 20, minLife: 0, maxLife: 30 });
      customManager.initializePlayer('player-1');
      customManager.setLife('player-1', 50);
      expect(customManager.getLife('player-1')).toBe(30);
    });

    it('should return life change event', () => {
      const event = manager.setLife('player-1', 15, 'test');

      expect(event.playerId).toBe('player-1');
      expect(event.previousLife).toBe(20);
      expect(event.newLife).toBe(15);
      expect(event.change).toBe(-5);
      expect(event.source).toBe('test');
    });
  });

  describe('changeLife', () => {
    beforeEach(() => {
      manager.initializePlayer('player-1', 20);
    });

    it('should increase life', () => {
      manager.changeLife('player-1', 5);
      expect(manager.getLife('player-1')).toBe(25);
    });

    it('should decrease life', () => {
      manager.changeLife('player-1', -5);
      expect(manager.getLife('player-1')).toBe(15);
    });

    it('should not go below minimum', () => {
      manager.changeLife('player-1', -30);
      expect(manager.getLife('player-1')).toBe(0);
    });
  });

  describe('dealDamage', () => {
    beforeEach(() => {
      manager.initializePlayer('player-1', 20);
    });

    it('should reduce life by damage amount', () => {
      manager.dealDamage('player-1', 5);
      expect(manager.getLife('player-1')).toBe(15);
    });

    it('should throw error for negative damage', () => {
      expect(() => manager.dealDamage('player-1', -5)).toThrow(
        'Damage amount must be non-negative'
      );
    });

    it('should not go below 0', () => {
      manager.dealDamage('player-1', 25);
      expect(manager.getLife('player-1')).toBe(0);
    });
  });

  describe('heal', () => {
    beforeEach(() => {
      manager.initializePlayer('player-1', 10);
    });

    it('should increase life by heal amount', () => {
      manager.heal('player-1', 5);
      expect(manager.getLife('player-1')).toBe(15);
    });

    it('should throw error for negative heal amount', () => {
      expect(() => manager.heal('player-1', -5)).toThrow(
        'Heal amount must be non-negative'
      );
    });
  });

  describe('isAlive/isDead', () => {
    it('should return true for alive player', () => {
      manager.initializePlayer('player-1', 10);
      expect(manager.isAlive('player-1')).toBe(true);
      expect(manager.isDead('player-1')).toBe(false);
    });

    it('should return false for dead player', () => {
      manager.initializePlayer('player-1', 0);
      expect(manager.isAlive('player-1')).toBe(false);
      expect(manager.isDead('player-1')).toBe(true);
    });

    it('should detect death after damage', () => {
      manager.initializePlayer('player-1', 5);
      manager.dealDamage('player-1', 5);

      expect(manager.isAlive('player-1')).toBe(false);
      expect(manager.isDead('player-1')).toBe(true);
    });
  });

  describe('resetLife', () => {
    it('should reset life to starting value', () => {
      manager.initializePlayer('player-1', 20);
      manager.setLife('player-1', 5);
      manager.resetLife('player-1');

      expect(manager.getLife('player-1')).toBe(20);
    });
  });

  describe('resetAllLife', () => {
    it('should reset all players life', () => {
      manager.initializePlayer('player-1', 20);
      manager.initializePlayer('player-2', 20);
      manager.setLife('player-1', 5);
      manager.setLife('player-2', 3);

      manager.resetAllLife();

      expect(manager.getLife('player-1')).toBe(20);
      expect(manager.getLife('player-2')).toBe(20);
    });
  });

  describe('getPlayerIds', () => {
    it('should return all player IDs', () => {
      manager.initializePlayer('player-1');
      manager.initializePlayer('player-2');
      manager.initializePlayer('player-3');

      const ids = manager.getPlayerIds();

      expect(ids).toHaveLength(3);
      expect(ids).toContain('player-1');
      expect(ids).toContain('player-2');
      expect(ids).toContain('player-3');
    });
  });

  describe('getAllLifeTotals', () => {
    it('should return map of all life totals', () => {
      manager.initializePlayer('player-1', 20);
      manager.initializePlayer('player-2', 15);

      const totals = manager.getAllLifeTotals();

      expect(totals.get('player-1')).toBe(20);
      expect(totals.get('player-2')).toBe(15);
    });

    it('should return a copy, not the original', () => {
      manager.initializePlayer('player-1', 20);
      const totals = manager.getAllLifeTotals();
      totals.set('player-1', 100);

      expect(manager.getLife('player-1')).toBe(20);
    });
  });

  describe('listeners', () => {
    let events: LifeChangeEvent[];
    let callback: (event: LifeChangeEvent) => void;

    beforeEach(() => {
      events = [];
      callback = (event) => events.push(event);
      manager.initializePlayer('player-1', 20);
    });

    it('should notify listeners on life change', () => {
      manager.addListener(callback);
      manager.setLife('player-1', 15);

      expect(events).toHaveLength(1);
      expect(events[0]?.newLife).toBe(15);
    });

    it('should notify on damage', () => {
      manager.addListener(callback);
      manager.dealDamage('player-1', 5);

      expect(events).toHaveLength(1);
      expect(events[0]?.change).toBe(-5);
    });

    it('should notify on heal', () => {
      manager.addListener(callback);
      manager.setLife('player-1', 10);
      events.length = 0;

      manager.heal('player-1', 3);

      expect(events).toHaveLength(1);
      expect(events[0]?.change).toBe(3);
    });

    it('should remove listener', () => {
      manager.addListener(callback);
      manager.removeListener(callback);
      manager.setLife('player-1', 15);

      expect(events).toHaveLength(0);
    });

    it('should clear all listeners', () => {
      manager.addListener(callback);
      manager.addListener((e) => events.push(e));
      manager.clearListeners();
      manager.setLife('player-1', 15);

      expect(events).toHaveLength(0);
    });

    it('should handle listener errors gracefully', () => {
      const errorCallback = () => {
        throw new Error('Test error');
      };

      manager.addListener(errorCallback);
      manager.addListener(callback);

      // Should not throw and second listener should still be called
      expect(() => manager.setLife('player-1', 15)).not.toThrow();
      expect(events).toHaveLength(1);
    });
  });

  describe('serialize/restore', () => {
    it('should serialize and restore state', () => {
      manager.initializePlayer('player-1', 20);
      manager.initializePlayer('player-2', 15);
      manager.setLife('player-1', 12);

      const serialized = manager.serialize();

      const newManager = new LifeManager();
      newManager.restore(serialized);

      expect(newManager.getLife('player-1')).toBe(12);
      expect(newManager.getLife('player-2')).toBe(15);
    });
  });

  describe('getStartingLife', () => {
    it('should return configured starting life', () => {
      const customManager = new LifeManager({ startingLife: 30 });
      expect(customManager.getStartingLife()).toBe(30);
    });

    it('should return default starting life', () => {
      expect(manager.getStartingLife()).toBe(20);
    });
  });
});
