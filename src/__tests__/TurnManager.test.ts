/**
 * Alpha Clash TCG - TurnManager Unit Tests
 */

import { TurnManager, TurnChangeEvent, PhaseChangeEvent } from '../managers/TurnManager';
import { TurnPhase, TURN_PHASES } from '../types';

describe('TurnManager', () => {
  let manager: TurnManager;
  const player1Id = 'player-1';
  const player2Id = 'player-2';

  beforeEach(() => {
    manager = new TurnManager(player1Id, player2Id);
  });

  describe('initialization', () => {
    it('should start at turn 1', () => {
      expect(manager.getTurnNumber()).toBe(1);
    });

    it('should start at start phase', () => {
      expect(manager.getCurrentPhase()).toBe('start');
    });

    it('should have player 1 as active', () => {
      expect(manager.getActivePlayerId()).toBe(player1Id);
    });

    it('should have player 2 as inactive', () => {
      expect(manager.getInactivePlayerId()).toBe(player2Id);
    });
  });

  describe('isPlayerTurn', () => {
    it('should return true for active player', () => {
      expect(manager.isPlayerTurn(player1Id)).toBe(true);
    });

    it('should return false for inactive player', () => {
      expect(manager.isPlayerTurn(player2Id)).toBe(false);
    });
  });

  describe('nextPhase', () => {
    it('should advance through phases in order', () => {
      const phases: TurnPhase[] = [];

      // Start is already set, advance through remaining phases
      for (let i = 0; i < TURN_PHASES.length; i++) {
        phases.push(manager.getCurrentPhase());
        manager.nextPhase();
      }

      // First 8 phases should match TURN_PHASES
      expect(phases).toEqual(TURN_PHASES);
    });

    it('should return phase change event', () => {
      const event = manager.nextPhase();

      expect(event.previousPhase).toBe('start');
      expect(event.newPhase).toBe('untap');
      expect(event.turnNumber).toBe(1);
    });

    it('should end turn after end phase', () => {
      // Advance to end phase
      while (manager.getCurrentPhase() !== 'end') {
        manager.nextPhase();
      }

      // Next phase should trigger end turn
      manager.nextPhase();

      expect(manager.getTurnNumber()).toBe(2);
      expect(manager.getActivePlayerId()).toBe(player2Id);
    });
  });

  describe('setPhase', () => {
    it('should set phase directly', () => {
      manager.setPhase('main');
      expect(manager.getCurrentPhase()).toBe('main');
    });

    it('should throw for invalid phase', () => {
      expect(() => manager.setPhase('invalid' as TurnPhase)).toThrow('Invalid phase');
    });

    it('should update phase actions', () => {
      manager.setPhase('main');
      const actions = manager.getPhaseActions();

      expect(actions.canPlayCards).toBe(true);
      expect(actions.canActivateAbilities).toBe(true);
      expect(actions.canAttack).toBe(false);
    });
  });

  describe('endTurn', () => {
    it('should increment turn number', () => {
      manager.endTurn();
      expect(manager.getTurnNumber()).toBe(2);
    });

    it('should switch active player', () => {
      manager.endTurn();
      expect(manager.getActivePlayerId()).toBe(player2Id);
      expect(manager.getInactivePlayerId()).toBe(player1Id);
    });

    it('should reset to start phase', () => {
      manager.setPhase('main');
      manager.endTurn();
      expect(manager.getCurrentPhase()).toBe('start');
    });

    it('should return turn change event', () => {
      const event = manager.endTurn();

      expect(event.previousTurn).toBe(1);
      expect(event.newTurn).toBe(2);
      expect(event.activePlayerId).toBe(player2Id);
    });

    it('should alternate between players', () => {
      expect(manager.getActivePlayerId()).toBe(player1Id);
      manager.endTurn();
      expect(manager.getActivePlayerId()).toBe(player2Id);
      manager.endTurn();
      expect(manager.getActivePlayerId()).toBe(player1Id);
    });
  });

  describe('getPhaseActions', () => {
    it('should return correct actions for start phase', () => {
      const actions = manager.getPhaseActions();

      expect(actions.canDraw).toBe(false);
      expect(actions.canPlayResource).toBe(false);
      expect(actions.canPlayCards).toBe(false);
      expect(actions.canAttack).toBe(false);
      expect(actions.canActivateAbilities).toBe(false);
    });

    it('should return correct actions for draw phase', () => {
      manager.setPhase('draw');
      const actions = manager.getPhaseActions();

      // First turn, skip draw is enabled by default
      expect(actions.canDraw).toBe(false); // Due to skipFirstDraw
    });

    it('should allow draw on turn 2', () => {
      manager.endTurn(); // Turn 2
      manager.setPhase('draw');
      const actions = manager.getPhaseActions();

      expect(actions.canDraw).toBe(true);
    });

    it('should return correct actions for main phase', () => {
      manager.setPhase('main');
      const actions = manager.getPhaseActions();

      expect(actions.canPlayCards).toBe(true);
      expect(actions.canActivateAbilities).toBe(true);
      expect(actions.canAttack).toBe(false);
    });

    it('should return correct actions for clash phase', () => {
      manager.setPhase('clash');
      const actions = manager.getPhaseActions();

      expect(actions.canPlayCards).toBe(false);
      expect(actions.canAttack).toBe(true);
      expect(actions.canActivateAbilities).toBe(true);
    });

    it('should return a copy, not the original', () => {
      const actions = manager.getPhaseActions();
      actions.canPlayCards = true;

      expect(manager.getPhaseActions().canPlayCards).toBe(false);
    });
  });

  describe('canPerformAction', () => {
    it('should check if action is allowed', () => {
      manager.setPhase('main');

      expect(manager.canPerformAction('canPlayCards')).toBe(true);
      expect(manager.canPerformAction('canAttack')).toBe(false);
    });
  });

  describe('useAction', () => {
    it('should mark action as used', () => {
      manager.setPhase('main');
      expect(manager.canPerformAction('canPlayCards')).toBe(true);

      manager.useAction('canPlayCards');
      expect(manager.canPerformAction('canPlayCards')).toBe(false);
    });

    it('should throw if action not available', () => {
      manager.setPhase('start');

      expect(() => manager.useAction('canPlayCards')).toThrow(
        'Action canPlayCards is not available in phase start'
      );
    });
  });

  describe('getAllPhases', () => {
    it('should return all phases', () => {
      const phases = manager.getAllPhases();
      expect(phases).toEqual(TURN_PHASES);
    });

    it('should return a copy', () => {
      const phases = manager.getAllPhases();
      phases.push('fake' as TurnPhase);

      expect(manager.getAllPhases()).not.toContain('fake');
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      manager.setPhase('main');
      const state = manager.getState();

      expect(state.turnNumber).toBe(1);
      expect(state.phase).toBe('main');
      expect(state.activePlayerId).toBe(player1Id);
    });

    it('should return a copy', () => {
      const state = manager.getState();
      state.turnNumber = 100;

      expect(manager.getTurnNumber()).toBe(1);
    });
  });

  describe('listeners', () => {
    let turnEvents: TurnChangeEvent[];
    let phaseEvents: PhaseChangeEvent[];
    let turnCallback: (event: TurnChangeEvent) => void;
    let phaseCallback: (event: PhaseChangeEvent) => void;

    beforeEach(() => {
      turnEvents = [];
      phaseEvents = [];
      turnCallback = (event) => turnEvents.push(event);
      phaseCallback = (event) => phaseEvents.push(event);
    });

    it('should notify turn listeners on end turn', () => {
      manager.addTurnListener(turnCallback);
      manager.endTurn();

      expect(turnEvents).toHaveLength(1);
      expect(turnEvents[0]?.newTurn).toBe(2);
    });

    it('should notify phase listeners on next phase', () => {
      manager.addPhaseListener(phaseCallback);
      manager.nextPhase();

      expect(phaseEvents).toHaveLength(1);
      expect(phaseEvents[0]?.newPhase).toBe('untap');
    });

    it('should notify phase listeners on set phase', () => {
      manager.addPhaseListener(phaseCallback);
      manager.setPhase('main');

      expect(phaseEvents).toHaveLength(1);
      expect(phaseEvents[0]?.newPhase).toBe('main');
    });

    it('should remove turn listener', () => {
      manager.addTurnListener(turnCallback);
      manager.removeTurnListener(turnCallback);
      manager.endTurn();

      expect(turnEvents).toHaveLength(0);
    });

    it('should remove phase listener', () => {
      manager.addPhaseListener(phaseCallback);
      manager.removePhaseListener(phaseCallback);
      manager.nextPhase();

      expect(phaseEvents).toHaveLength(0);
    });

    it('should clear all listeners', () => {
      manager.addTurnListener(turnCallback);
      manager.addPhaseListener(phaseCallback);
      manager.clearListeners();

      manager.nextPhase();
      manager.endTurn();

      expect(turnEvents).toHaveLength(0);
      expect(phaseEvents).toHaveLength(0);
    });

    it('should handle listener errors gracefully', () => {
      const errorCallback = () => {
        throw new Error('Test error');
      };

      manager.addTurnListener(errorCallback);
      manager.addTurnListener(turnCallback);

      expect(() => manager.endTurn()).not.toThrow();
      expect(turnEvents).toHaveLength(1);
    });
  });

  describe('serialize/restore', () => {
    it('should serialize and restore state', () => {
      manager.setPhase('main');
      manager.endTurn();

      const state = manager.serialize();

      const newManager = new TurnManager(player1Id, player2Id);
      newManager.restore(state);

      expect(newManager.getTurnNumber()).toBe(2);
      expect(newManager.getActivePlayerId()).toBe(player2Id);
      expect(newManager.getCurrentPhase()).toBe('start');
    });
  });

  describe('skipFirstDraw config', () => {
    it('should skip draw on first turn when enabled', () => {
      const skipManager = new TurnManager(player1Id, player2Id, { skipFirstDraw: true });
      skipManager.setPhase('draw');

      expect(skipManager.canPerformAction('canDraw')).toBe(false);
    });

    it('should allow draw on first turn when disabled', () => {
      const noSkipManager = new TurnManager(player1Id, player2Id, {
        skipFirstDraw: false,
      });
      noSkipManager.setPhase('draw');

      expect(noSkipManager.canPerformAction('canDraw')).toBe(true);
    });
  });
});
