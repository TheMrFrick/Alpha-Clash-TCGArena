/**
 * Alpha Clash TCG - Main Entry Point
 * TypeScript implementation for TCGArena
 */

import { TokenManager, getTokenManager, resetTokenManager } from './managers/TokenManager';
import { LifeManager, getLifeManager, resetLifeManager } from './managers/LifeManager';
import { TurnManager } from './managers/TurnManager';
import { setDebugMode, debug } from './utils';
import type {
  Card,
  CardInstance,
  CardType,
  ZoneName,
  TurnPhase,
  TokenId,
} from './types';

export * from './types';
export * from './managers';
export * from './utils';

export interface AlphaClashConfig {
  debug?: boolean;
  startingLife?: number;
  skipFirstDraw?: boolean;
}

export interface AlphaClashAPI {
  version: string;

  // Life management
  setLife: (player: 'self' | 'opponent', amount: number) => void;
  changeLife: (player: 'self' | 'opponent', delta: number) => void;
  getLife: (player: 'self' | 'opponent') => number;

  // Turn management
  setTurn: (turnNumber: number) => void;
  getTurn: () => number;
  setPhase: (phase: TurnPhase) => void;
  getPhase: () => TurnPhase;
  endTurn: () => void;
  nextPhase: () => void;

  // Token management
  addToken: (cardId: string, tokenId: TokenId, count?: number) => number;
  removeToken: (cardId: string, tokenId: TokenId, count?: number) => number;
  getTokens: (cardId: string) => Record<string, number>;
  clearTokens: (cardId: string) => void;

  // Sound management
  playSound: (soundName: string) => void;
  toggleSound: () => boolean;

  // Debug
  enableDebug: () => void;
  disableDebug: () => void;
}

/**
 * Initialize the Alpha Clash game system
 */
export function initializeAlphaClash(config: AlphaClashConfig = {}): AlphaClashAPI {
  const {
    debug: debugEnabled = false,
    startingLife = 20,
    skipFirstDraw = true,
  } = config;

  // Set debug mode
  setDebugMode(debugEnabled);
  debug('Initializing Alpha Clash...');

  // Initialize managers
  const lifeManager = getLifeManager();
  const tokenManager = getTokenManager();

  // Initialize players
  lifeManager.initializePlayer('self', startingLife);
  lifeManager.initializePlayer('opponent', startingLife);

  // Create turn manager
  const turnManager = new TurnManager('self', 'opponent', { skipFirstDraw });

  // Sound state
  let soundEnabled = true;

  const api: AlphaClashAPI = {
    version: '1.0.0',

    // Life management
    setLife: (player, amount) => {
      lifeManager.setLife(player, amount);
    },
    changeLife: (player, delta) => {
      lifeManager.changeLife(player, delta);
    },
    getLife: (player) => {
      return lifeManager.getLife(player);
    },

    // Turn management
    setTurn: (turnNumber) => {
      // Note: This is a simplified version - in a full implementation,
      // you'd need to handle the state more carefully
      debug(`Setting turn to ${turnNumber}`);
    },
    getTurn: () => {
      return turnManager.getTurnNumber();
    },
    setPhase: (phase) => {
      turnManager.setPhase(phase);
    },
    getPhase: () => {
      return turnManager.getCurrentPhase();
    },
    endTurn: () => {
      turnManager.endTurn();
    },
    nextPhase: () => {
      turnManager.nextPhase();
    },

    // Token management
    addToken: (cardId, tokenId, count = 1) => {
      return tokenManager.addToken(cardId, tokenId, count);
    },
    removeToken: (cardId, tokenId, count = 1) => {
      return tokenManager.removeToken(cardId, tokenId, count);
    },
    getTokens: (cardId) => {
      return tokenManager.getTokensOnCard(cardId);
    },
    clearTokens: (cardId) => {
      tokenManager.clearTokens(cardId);
    },

    // Sound management
    playSound: (soundName) => {
      if (!soundEnabled) return;
      debug(`Playing sound: ${soundName}`);
      // Actual sound playing would be handled by the browser
    },
    toggleSound: () => {
      soundEnabled = !soundEnabled;
      return soundEnabled;
    },

    // Debug
    enableDebug: () => {
      setDebugMode(true);
    },
    disableDebug: () => {
      setDebugMode(false);
    },
  };

  debug('Alpha Clash initialized successfully!');
  return api;
}

/**
 * Reset all managers (useful for testing)
 */
export function resetAlphaClash(): void {
  resetTokenManager();
  resetLifeManager();
  debug('Alpha Clash reset');
}

// Browser global export
if (typeof window !== 'undefined') {
  (window as unknown as { AlphaClash: AlphaClashAPI }).AlphaClash =
    initializeAlphaClash();
}
