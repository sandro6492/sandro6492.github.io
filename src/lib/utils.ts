import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware className joiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Deterministic-ish id generator (no external uuid dependency). */
export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/** Random float in [min, max). */
export function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Random integer in [min, max]. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from a non-empty array. */
export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Weighted pick — weights need not sum to 1. */
export function weightedPick<T>(entries: readonly { item: T; chance: number }[]): T {
  const total = entries.reduce((sum, e) => sum + e.chance, 0);
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= entry.chance;
    if (roll <= 0) return entry.item;
  }
  return entries[entries.length - 1].item;
}

/** Promise-based delay used to imitate network latency in mock services. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

/** 12345.6 -> "12,345.60" */
export function formatCoins(value: number, decimals = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** 12345 -> "12.3K" */
export function formatCompact(value: number): string {
  return compact.format(value);
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}×`;
}

/** "2m ago" style relative timestamps for feeds and chat. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.round(diff / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Tiny synchronous "hash" used purely to render believable provably-fair
 * strings in the UI. NOT cryptographic — a real backend supplies HMAC-SHA256.
 */
export function mockHash(input: string, length = 64): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  let out = '';
  let seed = (h1 >>> 0) + (h2 >>> 0);
  while (out.length < length) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    out += seed.toString(16).padStart(8, '0');
  }
  return out.slice(0, length);
}

export function randomHex(length = 32): string {
  let out = '';
  while (out.length < length) out += Math.random().toString(16).slice(2);
  return out.slice(0, length);
}

/** XP needed to progress from `level` to `level + 1`. */
export function xpForLevel(level: number): number {
  return Math.round(400 + level ** 1.6 * 90);
}
