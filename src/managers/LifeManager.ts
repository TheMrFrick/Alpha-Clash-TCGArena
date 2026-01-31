/**
 * Alpha Clash TCG - Life Manager
 * Manages player and contender life totals
 */

import { debug } from '../utils';

export interface LifeChangeEvent {
  playerId: string;
  previousLife: number;
  newLife: number;
  change: number;
  source?: string;
}

export type LifeChangeCallback = (event: LifeChangeEvent) => void;

export interface LifeManagerConfig {
  startingLife: number;
  minLife: number;
  maxLife: number | null;
}

const DEFAULT_CONFIG: LifeManagerConfig = {
  startingLife: 20,
  minLife: 0,
  maxLife: null,
};

export class LifeManager {
  private lifeTotals: Map<string, number> = new Map();
  private config: LifeManagerConfig;
  private listeners: Set<LifeChangeCallback> = new Set();

  constructor(config: Partial<LifeManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    debug('LifeManager initialized');
  }

  /**
   * Initialize a player's life total
   */
  initializePlayer(playerId: string, startingLife?: number): void {
    const life = startingLife ?? this.config.startingLife;
    this.lifeTotals.set(playerId, life);
    debug(`Initialized player ${playerId} with ${life} life`);
  }

  /**
   * Get a player's current life total
   */
  getLife(playerId: string): number {
    const life = this.lifeTotals.get(playerId);
    if (life === undefined) {
      throw new Error(`Player ${playerId} not found`);
    }
    return life;
  }

  /**
   * Check if a player exists
   */
  hasPlayer(playerId: string): boolean {
    return this.lifeTotals.has(playerId);
  }

  /**
   * Set a player's life total
   */
  setLife(playerId: string, life: number, source?: string): LifeChangeEvent {
    const previousLife = this.getLife(playerId);
    const clampedLife = this.clampLife(life);

    this.lifeTotals.set(playerId, clampedLife);

    const event: LifeChangeEvent = {
      playerId,
      previousLife,
      newLife: clampedLife,
      change: clampedLife - previousLife,
      ...(source !== undefined && { source }),
    };

    this.notifyListeners(event);
    debug(`Set ${playerId} life to ${clampedLife} (was ${previousLife})`);

    return event;
  }

  /**
   * Change a player's life total by an amount
   */
  changeLife(playerId: string, amount: number, source?: string): LifeChangeEvent {
    const currentLife = this.getLife(playerId);
    return this.setLife(playerId, currentLife + amount, source);
  }

  /**
   * Deal damage to a player
   */
  dealDamage(playerId: string, amount: number, source?: string): LifeChangeEvent {
    if (amount < 0) {
      throw new Error('Damage amount must be non-negative');
    }
    return this.changeLife(playerId, -amount, source);
  }

  /**
   * Heal a player
   */
  heal(playerId: string, amount: number, source?: string): LifeChangeEvent {
    if (amount < 0) {
      throw new Error('Heal amount must be non-negative');
    }
    return this.changeLife(playerId, amount, source);
  }

  /**
   * Check if a player is alive (life > 0)
   */
  isAlive(playerId: string): boolean {
    return this.getLife(playerId) > this.config.minLife;
  }

  /**
   * Check if a player is dead (life <= 0)
   */
  isDead(playerId: string): boolean {
    return !this.isAlive(playerId);
  }

  /**
   * Reset a player's life to starting value
   */
  resetLife(playerId: string): void {
    this.setLife(playerId, this.config.startingLife, 'reset');
  }

  /**
   * Reset all players' life totals
   */
  resetAllLife(): void {
    for (const playerId of this.lifeTotals.keys()) {
      this.resetLife(playerId);
    }
  }

  /**
   * Get all player IDs
   */
  getPlayerIds(): string[] {
    return Array.from(this.lifeTotals.keys());
  }

  /**
   * Get all life totals
   */
  getAllLifeTotals(): Map<string, number> {
    return new Map(this.lifeTotals);
  }

  /**
   * Add a life change listener
   */
  addListener(callback: LifeChangeCallback): void {
    this.listeners.add(callback);
  }

  /**
   * Remove a life change listener
   */
  removeListener(callback: LifeChangeCallback): void {
    this.listeners.delete(callback);
  }

  /**
   * Remove all listeners
   */
  clearListeners(): void {
    this.listeners.clear();
  }

  /**
   * Serialize life state
   */
  serialize(): Map<string, number> {
    return new Map(this.lifeTotals);
  }

  /**
   * Restore from serialized state
   */
  restore(state: Map<string, number>): void {
    this.lifeTotals = new Map(state);
  }

  /**
   * Get the starting life value
   */
  getStartingLife(): number {
    return this.config.startingLife;
  }

  /**
   * Clamp life to valid range
   */
  private clampLife(life: number): number {
    let clamped = Math.max(life, this.config.minLife);
    if (this.config.maxLife !== null) {
      clamped = Math.min(clamped, this.config.maxLife);
    }
    return clamped;
  }

  /**
   * Notify all listeners of a life change
   */
  private notifyListeners(event: LifeChangeEvent): void {
    for (const callback of this.listeners) {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in life change listener:', error);
      }
    }
  }
}

// Singleton instance for global use
let defaultLifeManager: LifeManager | null = null;

export function getLifeManager(): LifeManager {
  if (!defaultLifeManager) {
    defaultLifeManager = new LifeManager();
  }
  return defaultLifeManager;
}

export function resetLifeManager(): void {
  defaultLifeManager = null;
}
