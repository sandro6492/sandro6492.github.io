/**
 * NOVARIFT — Client-side game maths.
 *
 * Pure functions only: no React, no side effects. A real deployment would move
 * these behind the API layer, but the signatures (seed in, result out) are
 * intentionally identical so the swap is mechanical.
 */
import { HOUSE_EDGE } from './constants';
import { clamp, mockHash, randInt, randomHex } from './utils';

/* ------------------------------- Fair seeds ------------------------------- */

export interface RoundSeed {
  clientSeed: string;
  serverSeed: string;
  nonce: number;
}

export function createSeed(clientSeed = randomHex(16)): RoundSeed {
  return { clientSeed, serverSeed: randomHex(64), nonce: 0 };
}

export function seedHash(seed: RoundSeed): string {
  return mockHash(`${seed.serverSeed}:${seed.clientSeed}:${seed.nonce}`);
}

/** Maps a round's hash to a uniform float in [0, 1). */
export function roll(seed: RoundSeed): number {
  const hash = seedHash(seed);
  const slice = parseInt(hash.slice(0, 8), 16);
  return slice / 0x100000000;
}

/* --------------------------------- Crash ---------------------------------- */

/**
 * Standard crash distribution: heavy tail, 1.00× instant-bust chance equal to
 * the house edge.
 */
export function crashPoint(r = Math.random()): number {
  if (r < HOUSE_EDGE) return 1.0;
  const point = 0.99 / (1 - r);
  return Math.max(1, Math.floor(point * 100) / 100);
}

/* --------------------------------- Mines ---------------------------------- */

export function minesMultiplier(tiles: number, mines: number, revealed: number): number {
  if (revealed === 0) return 1;
  let m = 1;
  for (let i = 0; i < revealed; i++) {
    m *= (tiles - i) / (tiles - mines - i);
  }
  return Number((m * (1 - HOUSE_EDGE)).toFixed(4));
}

export function generateMineField(tiles: number, mines: number): boolean[] {
  const field = new Array(tiles).fill(false);
  let placed = 0;
  while (placed < mines) {
    const idx = randInt(0, tiles - 1);
    if (!field[idx]) {
      field[idx] = true;
      placed++;
    }
  }
  return field;
}

/* --------------------------------- Towers --------------------------------- */

export interface TowerConfig {
  rows: number;
  cols: number;
  bombsPerRow: number;
}

export const TOWER_DIFFICULTY: Record<'easy' | 'medium' | 'hard', TowerConfig> = {
  easy: { rows: 8, cols: 4, bombsPerRow: 1 },
  medium: { rows: 8, cols: 3, bombsPerRow: 1 },
  hard: { rows: 8, cols: 2, bombsPerRow: 1 },
};

export function towerMultipliers(cfg: TowerConfig): number[] {
  const safe = (cfg.cols - cfg.bombsPerRow) / cfg.cols;
  return Array.from({ length: cfg.rows }, (_, i) =>
    Number((Math.pow(1 / safe, i + 1) * (1 - HOUSE_EDGE)).toFixed(2)),
  );
}

/** Bomb column index for each row. */
export function generateTowerField(cfg: TowerConfig): number[] {
  return Array.from({ length: cfg.rows }, () => randInt(0, cfg.cols - 1));
}

/* ---------------------------------- Dice ---------------------------------- */

export function diceMultiplier(winChance: number): number {
  const c = clamp(winChance, 1, 95);
  return Number(((100 / c) * (1 - HOUSE_EDGE)).toFixed(4));
}

export function rollDice(): number {
  return Number((Math.random() * 100).toFixed(2));
}

/* ---------------------------------- Wheel --------------------------------- */

export interface WheelSegment {
  id: number;
  multiplier: number;
  color: string;
  weight: number;
  label: string;
}

/** 24 alternating segments — a bespoke NOVARIFT layout. */
export const WHEEL_SEGMENTS: WheelSegment[] = Array.from({ length: 24 }, (_, i) => {
  const pattern = [1.5, 2, 1.5, 3, 1.5, 2, 1.5, 5, 1.5, 2, 1.5, 3, 1.5, 2, 1.5, 10, 1.5, 2, 1.5, 3, 1.5, 2, 1.5, 50];
  const multiplier = pattern[i];
  const colors: Record<number, string> = {
    1.5: '#22d3ee',
    2: '#818cf8',
    3: '#a78bfa',
    5: '#e879f9',
    10: '#fbbf24',
    50: '#f43f5e',
  };
  return {
    id: i,
    multiplier,
    color: colors[multiplier],
    weight: 1 / multiplier,
    label: `${multiplier}×`,
  };
});

export function spinWheel(): WheelSegment {
  // Weighted so the expected return sits just under 1.0
  const total = WHEEL_SEGMENTS.reduce((s, seg) => s + seg.weight, 0);
  let r = Math.random() * total;
  for (const seg of WHEEL_SEGMENTS) {
    r -= seg.weight;
    if (r <= 0) return seg;
  }
  return WHEEL_SEGMENTS[0];
}

/* -------------------------------- Coinflip -------------------------------- */

export type CoinSide = 'nova' | 'rift';

export function flipCoin(): CoinSide {
  return Math.random() < 0.5 ? 'nova' : 'rift';
}

/* -------------------------------- Upgrader -------------------------------- */

/** Success chance for trading `fromValue` up into `toValue`. */
export function upgradeChance(fromValue: number, toValue: number): number {
  if (toValue <= 0) return 0;
  return clamp((fromValue / toValue) * (1 - HOUSE_EDGE) * 100, 0.5, 95);
}

export function attemptUpgrade(chance: number): boolean {
  return Math.random() * 100 < chance;
}

/* -------------------------------- Jackpot --------------------------------- */

export interface JackpotEntry {
  id: string;
  username: string;
  avatarUrl: string;
  amount: number;
  color: string;
}

export function pickJackpotWinner(entries: JackpotEntry[]): JackpotEntry | null {
  if (!entries.length) return null;
  const total = entries.reduce((s, e) => s + e.amount, 0);
  let r = Math.random() * total;
  for (const e of entries) {
    r -= e.amount;
    if (r <= 0) return e;
  }
  return entries[entries.length - 1];
}

export const ENTRY_COLORS = [
  '#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#34d399',
  '#60a5fa', '#e879f9', '#fb923c', '#4ade80', '#f87171',
];
