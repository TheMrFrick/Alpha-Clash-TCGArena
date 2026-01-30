/**
 * Alpha Clash TCG - Turn Manager
 * Manages game turns and phases
 */

import { TurnPhase, TURN_PHASES, getNextPhase, isValidPhaseTransition } from '../types';
import { debug } from '../utils';

export interface TurnState {
  turnNumber: number;
  phase: TurnPhase;
  activePlayerId: string;
  phaseActionsRemaining: PhaseActions;
}

export interface PhaseActions {
  canDraw: boolean;
  canPlayResource: boolean;
  canPlayCards: boolean;
  canAttack: boolean;
  canActivateAbilities: boolean;
}

export interface TurnChangeEvent {
  previousTurn: number;
  newTurn: number;
  activePlayerId: string;
}

export interface PhaseChangeEvent {
  previousPhase: TurnPhase;
  newPhase: TurnPhase;
  turnNumber: number;
}

export type TurnChangeCallback = (event: TurnChangeEvent) => void;
export type PhaseChangeCallback = (event: PhaseChangeEvent) => void;

export interface TurnManagerConfig {
  skipFirstDraw: boolean;
  resourcesPerTurn: number;
  drawsPerTurn: number;
}

const DEFAULT_CONFIG: TurnManagerConfig = {
  skipFirstDraw: true,
  resourcesPerTurn: 1,
  drawsPerTurn: 1,
};

const DEFAULT_PHASE_ACTIONS: Record<TurnPhase, PhaseActions> = {
  start: {
    canDraw: false,
    canPlayResource: false,
    canPlayCards: false,
    canAttack: false,
    canActivateAbilities: false,
  },
  untap: {
    canDraw: false,
    canPlayResource: false,
    canPlayCards: false,
    canAttack: false,
    canActivateAbilities: false,
  },
  draw: {
    canDraw: true,
    canPlayResource: false,
    canPlayCards: false,
    canAttack: false,
    canActivateAbilities: false,
  },
  resource: {
    canDraw: false,
    canPlayResource: true,
    canPlayCards: false,
    canAttack: false,
    canActivateAbilities: false,
  },
  main: {
    canDraw: false,
    canPlayResource: false,
    canPlayCards: true,
    canAttack: false,
    canActivateAbilities: true,
  },
  clash: {
    canDraw: false,
    canPlayResource: false,
    canPlayCards: false,
    canAttack: true,
    canActivateAbilities: true,
  },
  main2: {
    canDraw: false,
    canPlayResource: false,
    canPlayCards: true,
    canAttack: false,
    canActivateAbilities: true,
  },
  end: {
    canDraw: false,
    canPlayResource: false,
    canPlayCards: false,
    canAttack: false,
    canActivateAbilities: false,
  },
};

export class TurnManager {
  private state: TurnState;
  private playerIds: [string, string];
  private config: TurnManagerConfig;
  private turnListeners: Set<TurnChangeCallback> = new Set();
  private phaseListeners: Set<PhaseChangeCallback> = new Set();

  constructor(
    player1Id: string,
    player2Id: string,
    config: Partial<TurnManagerConfig> = {}
  ) {
    this.playerIds = [player1Id, player2Id];
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      turnNumber: 1,
      phase: 'start',
      activePlayerId: player1Id,
      phaseActionsRemaining: { ...DEFAULT_PHASE_ACTIONS.start },
    };
    debug('TurnManager initialized');
  }

  /**
   * Get current turn number
   */
  getTurnNumber(): number {
    return this.state.turnNumber;
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): TurnPhase {
    return this.state.phase;
  }

  /**
   * Get active player ID
   */
  getActivePlayerId(): string {
    return this.state.activePlayerId;
  }

  /**
   * Get inactive player ID
   */
  getInactivePlayerId(): string {
    return this.playerIds[0] === this.state.activePlayerId
      ? this.playerIds[1]!
      : this.playerIds[0]!;
  }

  /**
   * Check if it's a specific player's turn
   */
  isPlayerTurn(playerId: string): boolean {
    return this.state.activePlayerId === playerId;
  }

  /**
   * Get current phase actions
   */
  getPhaseActions(): PhaseActions {
    return { ...this.state.phaseActionsRemaining };
  }

  /**
   * Check if a specific action is allowed
   */
  canPerformAction(action: keyof PhaseActions): boolean {
    return this.state.phaseActionsRemaining[action];
  }

  /**
   * Advance to the next phase
   */
  nextPhase(): PhaseChangeEvent {
    const previousPhase = this.state.phase;
    const newPhase = getNextPhase(previousPhase);

    // If we're going from end to start, that means end turn
    if (previousPhase === 'end' && newPhase === 'start') {
      this.endTurn();
      return {
        previousPhase,
        newPhase: this.state.phase,
        turnNumber: this.state.turnNumber,
      };
    }

    this.state.phase = newPhase;
    this.state.phaseActionsRemaining = { ...DEFAULT_PHASE_ACTIONS[newPhase] };

    // Handle first turn draw skip
    if (
      newPhase === 'draw' &&
      this.state.turnNumber === 1 &&
      this.config.skipFirstDraw
    ) {
      this.state.phaseActionsRemaining.canDraw = false;
    }

    const event: PhaseChangeEvent = {
      previousPhase,
      newPhase,
      turnNumber: this.state.turnNumber,
    };

    this.notifyPhaseListeners(event);
    debug(`Phase changed: ${previousPhase} -> ${newPhase}`);

    return event;
  }

  /**
   * Set the current phase directly
   */
  setPhase(phase: TurnPhase): void {
    if (!TURN_PHASES.includes(phase)) {
      throw new Error(`Invalid phase: ${phase}`);
    }

    const previousPhase = this.state.phase;
    this.state.phase = phase;
    this.state.phaseActionsRemaining = { ...DEFAULT_PHASE_ACTIONS[phase] };

    const event: PhaseChangeEvent = {
      previousPhase,
      newPhase: phase,
      turnNumber: this.state.turnNumber,
    };

    this.notifyPhaseListeners(event);
  }

  /**
   * End the current turn and switch to the other player
   */
  endTurn(): TurnChangeEvent {
    const previousTurn = this.state.turnNumber;
    const previousPlayer = this.state.activePlayerId;

    // Switch active player
    this.state.activePlayerId =
      this.state.activePlayerId === this.playerIds[0]
        ? this.playerIds[1]!
        : this.playerIds[0]!;

    // Increment turn number (each player's turn counts)
    this.state.turnNumber++;

    // Reset to start phase
    this.state.phase = 'start';
    this.state.phaseActionsRemaining = { ...DEFAULT_PHASE_ACTIONS.start };

    const event: TurnChangeEvent = {
      previousTurn,
      newTurn: this.state.turnNumber,
      activePlayerId: this.state.activePlayerId,
    };

    this.notifyTurnListeners(event);
    debug(
      `Turn ended: ${previousTurn} (${previousPlayer}) -> ${this.state.turnNumber} (${this.state.activePlayerId})`
    );

    return event;
  }

  /**
   * Mark an action as used
   */
  useAction(action: keyof PhaseActions): void {
    if (!this.state.phaseActionsRemaining[action]) {
      throw new Error(`Action ${action} is not available in phase ${this.state.phase}`);
    }
    this.state.phaseActionsRemaining[action] = false;
  }

  /**
   * Get all phases
   */
  getAllPhases(): TurnPhase[] {
    return [...TURN_PHASES];
  }

  /**
   * Get the current turn state
   */
  getState(): TurnState {
    return {
      ...this.state,
      phaseActionsRemaining: { ...this.state.phaseActionsRemaining },
    };
  }

  /**
   * Add turn change listener
   */
  addTurnListener(callback: TurnChangeCallback): void {
    this.turnListeners.add(callback);
  }

  /**
   * Remove turn change listener
   */
  removeTurnListener(callback: TurnChangeCallback): void {
    this.turnListeners.delete(callback);
  }

  /**
   * Add phase change listener
   */
  addPhaseListener(callback: PhaseChangeCallback): void {
    this.phaseListeners.add(callback);
  }

  /**
   * Remove phase change listener
   */
  removePhaseListener(callback: PhaseChangeCallback): void {
    this.phaseListeners.delete(callback);
  }

  /**
   * Clear all listeners
   */
  clearListeners(): void {
    this.turnListeners.clear();
    this.phaseListeners.clear();
  }

  /**
   * Serialize turn state
   */
  serialize(): TurnState {
    return this.getState();
  }

  /**
   * Restore from serialized state
   */
  restore(state: TurnState): void {
    this.state = {
      ...state,
      phaseActionsRemaining: { ...state.phaseActionsRemaining },
    };
  }

  /**
   * Notify turn listeners
   */
  private notifyTurnListeners(event: TurnChangeEvent): void {
    for (const callback of this.turnListeners) {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in turn change listener:', error);
      }
    }
  }

  /**
   * Notify phase listeners
   */
  private notifyPhaseListeners(event: PhaseChangeEvent): void {
    for (const callback of this.phaseListeners) {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in phase change listener:', error);
      }
    }
  }
}
