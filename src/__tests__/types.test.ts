/**
 * Alpha Clash TCG - Type Functions Unit Tests
 */

import {
  isCard,
  createCardInstance,
  Card,
  CardType,
  createInitialGameState,
  getNextPhase,
  isValidPhaseTransition,
  TURN_PHASES,
  TurnPhase,
  isValidTokenId,
  getTokenDefinition,
  TOKEN_DEFINITIONS,
} from '../types';

describe('Card Types', () => {
  describe('isCard', () => {
    it('should return true for valid card object', () => {
      const card = {
        id: 'test-card',
        name: 'Test Card',
        type: 'Creature',
        cost: 3,
        attack: 2,
        defense: 2,
        img_link: 'test.webp',
        text: 'Test text',
        rarity: 'Common',
        set: 'Core Set',
      };

      expect(isCard(card)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isCard(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isCard(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isCard('string')).toBe(false);
      expect(isCard(123)).toBe(false);
      expect(isCard([])).toBe(false);
    });

    it('should return false for object missing required fields', () => {
      expect(isCard({ id: 'test' })).toBe(false);
      expect(isCard({ id: 'test', name: 'Test' })).toBe(false);
    });
  });

  describe('createCardInstance', () => {
    const mockCard: Card = {
      id: 'test-card',
      name: 'Test Card',
      type: 'Creature',
      cost: 3,
      attack: 2,
      defense: 2,
      img_link: 'test.webp',
      text: 'Test text',
      rarity: 'Common',
      set: 'Core Set',
    };

    it('should create card instance with unique ID', () => {
      const instance1 = createCardInstance(mockCard, 'player-1', 'Hand');
      const instance2 = createCardInstance(mockCard, 'player-1', 'Hand');

      expect(instance1.instanceId).not.toBe(instance2.instanceId);
    });

    it('should start untapped', () => {
      const instance = createCardInstance(mockCard, 'player-1', 'Hand');
      expect(instance.isTapped).toBe(false);
    });

    it('should be face down in deck', () => {
      const instance = createCardInstance(mockCard, 'player-1', 'Deck');
      expect(instance.isFaceDown).toBe(true);
    });

    it('should be face down in resources', () => {
      const instance = createCardInstance(mockCard, 'player-1', 'Resources');
      expect(instance.isFaceDown).toBe(true);
    });

    it('should be face up in hand', () => {
      const instance = createCardInstance(mockCard, 'player-1', 'Hand');
      expect(instance.isFaceDown).toBe(false);
    });

    it('should have empty tokens map', () => {
      const instance = createCardInstance(mockCard, 'player-1', 'Hand');
      expect(instance.tokens.size).toBe(0);
    });

    it('should set correct zone', () => {
      const instance = createCardInstance(mockCard, 'player-1', 'Clashground');
      expect(instance.zone).toBe('Clashground');
    });

    it('should set correct owner', () => {
      const instance = createCardInstance(mockCard, 'player-1', 'Hand');
      expect(instance.ownerId).toBe('player-1');
    });

    it('should reference original card', () => {
      const instance = createCardInstance(mockCard, 'player-1', 'Hand');
      expect(instance.card).toBe(mockCard);
    });
  });
});

describe('Game Types', () => {
  describe('createInitialGameState', () => {
    it('should create game state with two players', () => {
      const state = createInitialGameState('p1', 'p2');

      expect(state.players).toHaveLength(2);
      expect(state.players[0].id).toBe('p1');
      expect(state.players[1].id).toBe('p2');
    });

    it('should start at turn 1', () => {
      const state = createInitialGameState('p1', 'p2');
      expect(state.currentTurn).toBe(1);
    });

    it('should start at start phase', () => {
      const state = createInitialGameState('p1', 'p2');
      expect(state.currentPhase).toBe('start');
    });

    it('should have player 1 as active', () => {
      const state = createInitialGameState('p1', 'p2');
      expect(state.activePlayerId).toBe('p1');
      expect(state.players[0].isActive).toBe(true);
      expect(state.players[1].isActive).toBe(false);
    });

    it('should not be game over', () => {
      const state = createInitialGameState('p1', 'p2');
      expect(state.isGameOver).toBe(false);
      expect(state.winnerId).toBe(null);
    });

    it('should use default starting life', () => {
      const state = createInitialGameState('p1', 'p2');
      expect(state.players[0].life).toBe(20);
      expect(state.players[1].life).toBe(20);
    });

    it('should use custom config', () => {
      const state = createInitialGameState('p1', 'p2', {
        startingLife: 30,
        startingHandSize: 10,
        maxHandSize: null,
        deckSizeMin: 40,
        deckSizeMax: 60,
        maxCopiesPerCard: 4,
        resourcesPerTurn: 1,
        drawsPerTurn: 1,
        skipFirstDraw: true,
      });

      expect(state.players[0].life).toBe(30);
    });

    it('should initialize all zones for each player', () => {
      const state = createInitialGameState('p1', 'p2');
      const zones = state.players[0].zones;

      expect(zones.get('Deck')).toBeDefined();
      expect(zones.get('Hand')).toBeDefined();
      expect(zones.get('Contender')).toBeDefined();
      expect(zones.get('Portal')).toBeDefined();
      expect(zones.get('Clashground')).toBeDefined();
      expect(zones.get('Clash-Zone')).toBeDefined();
      expect(zones.get('Artifact-Trap-Zone')).toBeDefined();
      expect(zones.get('Resources')).toBeDefined();
      expect(zones.get('Discard')).toBeDefined();
    });

    it('should have empty turn history', () => {
      const state = createInitialGameState('p1', 'p2');
      expect(state.turnHistory).toHaveLength(0);
    });

    it('should generate unique game ID', () => {
      const state1 = createInitialGameState('p1', 'p2');
      const state2 = createInitialGameState('p1', 'p2');

      expect(state1.id).not.toBe(state2.id);
      expect(state1.id.startsWith('game-')).toBe(true);
    });
  });

  describe('getNextPhase', () => {
    it('should return next phase in sequence', () => {
      expect(getNextPhase('start')).toBe('untap');
      expect(getNextPhase('untap')).toBe('draw');
      expect(getNextPhase('draw')).toBe('resource');
      expect(getNextPhase('resource')).toBe('main');
      expect(getNextPhase('main')).toBe('clash');
      expect(getNextPhase('clash')).toBe('main2');
      expect(getNextPhase('main2')).toBe('end');
    });

    it('should return start after end', () => {
      expect(getNextPhase('end')).toBe('start');
    });

    it('should handle invalid phase', () => {
      expect(getNextPhase('invalid' as TurnPhase)).toBe('start');
    });
  });

  describe('isValidPhaseTransition', () => {
    it('should allow forward transitions', () => {
      expect(isValidPhaseTransition('start', 'untap')).toBe(true);
      expect(isValidPhaseTransition('main', 'clash')).toBe(true);
    });

    it('should allow end to start transition', () => {
      expect(isValidPhaseTransition('end', 'start')).toBe(true);
    });

    it('should not allow skipping phases', () => {
      expect(isValidPhaseTransition('start', 'main')).toBe(false);
    });

    it('should not allow backward transitions', () => {
      expect(isValidPhaseTransition('main', 'draw')).toBe(false);
    });
  });

  describe('TURN_PHASES', () => {
    it('should contain all phases', () => {
      expect(TURN_PHASES).toContain('start');
      expect(TURN_PHASES).toContain('untap');
      expect(TURN_PHASES).toContain('draw');
      expect(TURN_PHASES).toContain('resource');
      expect(TURN_PHASES).toContain('main');
      expect(TURN_PHASES).toContain('clash');
      expect(TURN_PHASES).toContain('main2');
      expect(TURN_PHASES).toContain('end');
    });

    it('should have 8 phases', () => {
      expect(TURN_PHASES).toHaveLength(8);
    });

    it('should be in correct order', () => {
      expect(TURN_PHASES[0]).toBe('start');
      expect(TURN_PHASES[7]).toBe('end');
    });
  });
});

describe('Token Types', () => {
  describe('isValidTokenId', () => {
    it('should return true for valid token IDs', () => {
      expect(isValidTokenId('damage-counter')).toBe(true);
      expect(isValidTokenId('boost-counter')).toBe(true);
      expect(isValidTokenId('shield-counter')).toBe(true);
      expect(isValidTokenId('status-stun')).toBe(true);
      expect(isValidTokenId('status-freeze')).toBe(true);
    });

    it('should return false for invalid token IDs', () => {
      expect(isValidTokenId('invalid')).toBe(false);
      expect(isValidTokenId('')).toBe(false);
      expect(isValidTokenId('damage')).toBe(false);
    });
  });

  describe('getTokenDefinition', () => {
    it('should return token definition', () => {
      const def = getTokenDefinition('damage-counter');

      expect(def.id).toBe('damage-counter');
      expect(def.name).toBe('Damage Counter');
      expect(def.stackable).toBe(true);
      expect(def.color).toBe('#FF4444');
    });

    it('should return correct definition for each token', () => {
      expect(getTokenDefinition('boost-counter').color).toBe('#44FF44');
      expect(getTokenDefinition('shield-counter').color).toBe('#4444FF');
      expect(getTokenDefinition('status-stun').stackable).toBe(false);
      expect(getTokenDefinition('status-freeze').stackable).toBe(false);
    });
  });

  describe('TOKEN_DEFINITIONS', () => {
    it('should have all expected tokens', () => {
      expect(TOKEN_DEFINITIONS['damage-counter']).toBeDefined();
      expect(TOKEN_DEFINITIONS['boost-counter']).toBeDefined();
      expect(TOKEN_DEFINITIONS['shield-counter']).toBeDefined();
      expect(TOKEN_DEFINITIONS['status-stun']).toBeDefined();
      expect(TOKEN_DEFINITIONS['status-freeze']).toBeDefined();
    });

    it('should have valid structure for all tokens', () => {
      for (const token of Object.values(TOKEN_DEFINITIONS)) {
        expect(token.id).toBeDefined();
        expect(token.name).toBeDefined();
        expect(token.image).toBeDefined();
        expect(token.color).toBeDefined();
        expect(typeof token.stackable).toBe('boolean');
        expect(typeof token.value).toBe('number');
      }
    });
  });
});
