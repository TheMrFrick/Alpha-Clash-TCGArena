/**
 * Alpha Clash TCG - Game State Type Definitions
 */

import { CardInstance, ZoneName } from './card';

export type TurnPhase =
  | 'start'
  | 'untap'
  | 'draw'
  | 'resource'
  | 'main'
  | 'clash'
  | 'main2'
  | 'end';

export interface Player {
  id: string;
  name: string;
  life: number;
  zones: Map<ZoneName, CardInstance[]>;
  isActive: boolean;
}

export interface GameState {
  id: string;
  players: [Player, Player];
  currentTurn: number;
  currentPhase: TurnPhase;
  activePlayerId: string;
  isGameOver: boolean;
  winnerId: string | null;
  turnHistory: TurnAction[];
}

export interface TurnAction {
  type: ActionType;
  playerId: string;
  timestamp: number;
  data: ActionData;
}

export type ActionType =
  | 'draw'
  | 'play'
  | 'attack'
  | 'block'
  | 'activate'
  | 'tap'
  | 'untap'
  | 'move'
  | 'discard'
  | 'damage'
  | 'heal'
  | 'end_turn'
  | 'concede';

export interface ActionData {
  cardInstanceId?: string;
  targetId?: string;
  sourceZone?: ZoneName;
  targetZone?: ZoneName;
  amount?: number;
  [key: string]: unknown;
}

export interface WinCondition {
  id: string;
  type: 'life' | 'deck' | 'concession' | 'custom';
  condition: string;
  description: string;
  priority: number;
}

export interface GameConfig {
  startingLife: number;
  startingHandSize: number;
  maxHandSize: number | null;
  deckSizeMin: number;
  deckSizeMax: number;
  maxCopiesPerCard: number;
  resourcesPerTurn: number;
  drawsPerTurn: number;
  skipFirstDraw: boolean;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  startingLife: 20,
  startingHandSize: 8,
  maxHandSize: null,
  deckSizeMin: 40,
  deckSizeMax: 60,
  maxCopiesPerCard: 4,
  resourcesPerTurn: 1,
  drawsPerTurn: 1,
  skipFirstDraw: true,
};

export const TURN_PHASES: TurnPhase[] = [
  'start',
  'untap',
  'draw',
  'resource',
  'main',
  'clash',
  'main2',
  'end',
];

export function createInitialGameState(
  player1Id: string,
  player2Id: string,
  config: GameConfig = DEFAULT_GAME_CONFIG
): GameState {
  const createPlayer = (id: string, name: string): Player => ({
    id,
    name,
    life: config.startingLife,
    zones: new Map([
      ['Deck', []],
      ['Hand', []],
      ['Contender', []],
      ['Portal', []],
      ['Clashground', []],
      ['Clash-Zone', []],
      ['Accessory-Zone', []],
      ['Resources', []],
      ['Oblivion', []],
      ['Banished', []],
    ]),
    isActive: false,
  });

  const player1 = createPlayer(player1Id, 'Player 1');
  const player2 = createPlayer(player2Id, 'Player 2');
  player1.isActive = true;

  return {
    id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    players: [player1, player2],
    currentTurn: 1,
    currentPhase: 'start',
    activePlayerId: player1Id,
    isGameOver: false,
    winnerId: null,
    turnHistory: [],
  };
}

export function getNextPhase(currentPhase: TurnPhase): TurnPhase {
  const index = TURN_PHASES.indexOf(currentPhase);
  if (index === -1 || index === TURN_PHASES.length - 1) {
    return 'start';
  }
  const nextPhase = TURN_PHASES[index + 1];
  if (nextPhase === undefined) {
    return 'start';
  }
  return nextPhase;
}

export function isValidPhaseTransition(from: TurnPhase, to: TurnPhase): boolean {
  const fromIndex = TURN_PHASES.indexOf(from);
  const toIndex = TURN_PHASES.indexOf(to);

  // Can move forward one step or back to start (end turn)
  return toIndex === fromIndex + 1 || (from === 'end' && to === 'start');
}
