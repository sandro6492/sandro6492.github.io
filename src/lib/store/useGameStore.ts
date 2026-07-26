/**
 * Per-game session state shared across the games section:
 * bet history, provably-fair seeds and per-game sound preferences.
 */
import { create } from 'zustand';
import type { Bet, GameId } from '@/types';
import { createSeed, seedHash, type RoundSeed } from '@/lib/gameEngine';
import { generateBets } from '@/lib/mockData';
import { randomHex } from '@/lib/utils';

interface GameState {
  /** Recent bets keyed by game — seeded with believable history. */
  history: Record<string, Bet[]>;
  seeds: Record<string, RoundSeed>;
  soundByGame: Record<string, boolean>;

  pushBet: (gameId: GameId, bet: Bet) => void;
  getHistory: (gameId: GameId) => Bet[];
  ensureGame: (gameId: GameId) => void;

  getSeed: (gameId: GameId) => RoundSeed;
  bumpNonce: (gameId: GameId) => void;
  rotateSeed: (gameId: GameId, clientSeed?: string) => void;
  getHash: (gameId: GameId) => string;

  isMuted: (gameId: GameId) => boolean;
  toggleGameSound: (gameId: GameId) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  history: {},
  seeds: {},
  soundByGame: {},

  ensureGame: (gameId) => {
    const { history, seeds } = get();
    const patch: Partial<GameState> = {};
    if (!history[gameId]) patch.history = { ...history, [gameId]: generateBets(14, gameId) };
    if (!seeds[gameId]) patch.seeds = { ...seeds, [gameId]: createSeed(randomHex(16)) };
    if (Object.keys(patch).length) set(patch as GameState);
  },

  pushBet: (gameId, bet) => {
    const history = get().history;
    const list = history[gameId] ?? [];
    set({ history: { ...history, [gameId]: [bet, ...list].slice(0, 60) } });
  },

  getHistory: (gameId) => get().history[gameId] ?? [],

  getSeed: (gameId) => get().seeds[gameId] ?? createSeed(),

  bumpNonce: (gameId) => {
    const seeds = get().seeds;
    const seed = seeds[gameId] ?? createSeed();
    set({ seeds: { ...seeds, [gameId]: { ...seed, nonce: seed.nonce + 1 } } });
  },

  rotateSeed: (gameId, clientSeed) => {
    const seeds = get().seeds;
    set({ seeds: { ...seeds, [gameId]: createSeed(clientSeed ?? randomHex(16)) } });
  },

  getHash: (gameId) => seedHash(get().seeds[gameId] ?? createSeed()),

  isMuted: (gameId) => get().soundByGame[gameId] === false,

  toggleGameSound: (gameId) => {
    const map = get().soundByGame;
    const current = map[gameId] ?? true;
    set({ soundByGame: { ...map, [gameId]: !current } });
  },
}));
