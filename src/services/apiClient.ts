/**
 * NOVARIFT — transport abstraction.
 *
 * Every service in this folder calls `request()` instead of `fetch()` directly.
 * Today `request()` resolves a local mock resolver; to go live you only change
 * `MODE` to 'http' and provide `NEXT_PUBLIC_API_URL` — no component changes.
 */

export type TransportMode = 'mock' | 'http';

export const API_CONFIG = {
  mode: (process.env.NEXT_PUBLIC_API_MODE as TransportMode) ?? 'mock',
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? '',
  /** Simulated latency window for the mock transport (ms). */
  latency: [90, 260] as [number, number],
};

function mockLatency(): number {
  const [min, max] = API_CONFIG.latency;
  return Math.random() * (max - min) + min;
}

export class ApiError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * @param path    Logical endpoint, e.g. '/games/crash/bet'. Used verbatim by the
 *                HTTP transport and purely for logging by the mock transport.
 * @param resolve Mock resolver invoked in 'mock' mode.
 * @param init    Standard fetch init forwarded in 'http' mode.
 */
export async function request<T>(
  path: string,
  resolve: () => T | Promise<T>,
  init?: RequestInit,
): Promise<T> {
  if (API_CONFIG.mode === 'http') {
    const res = await fetch(`${API_CONFIG.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
    if (!res.ok) throw new ApiError(await res.text(), res.status);
    return (await res.json()) as T;
  }

  await new Promise((r) => setTimeout(r, mockLatency()));
  return resolve();
}

/**
 * Mock realtime channel. Mirrors the slice of the Socket.io client API the app
 * actually uses, so `createChannel` can be replaced by `io(url)` later.
 */
export function createChannel<T>(
  producer: () => T,
  intervalMs: number,
): { subscribe: (cb: (payload: T) => void) => () => void } {
  return {
    subscribe(cb) {
      const timer = setInterval(() => cb(producer()), intervalMs);
      return () => clearInterval(timer);
    },
  };
}
