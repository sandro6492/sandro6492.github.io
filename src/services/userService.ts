/** Account, wallet and Roblox-link endpoints (mocked). */
import type { User } from '@/types';
import { createDemoUser, generateInventory } from '@/lib/mockData';
import { ApiError, request } from './apiClient';

export interface Credentials {
  email: string;
  password: string;
}

export const userService = {
  login: (creds: Credentials) =>
    request<User>('/auth/login', () => {
      if (!creds.email.includes('@')) throw new ApiError('Enter a valid email address.');
      if (creds.password.length < 4) throw new ApiError('Password must be at least 4 characters.');
      return createDemoUser(creds.email.split('@')[0], creds.email);
    }),

  signup: (username: string, creds: Credentials) =>
    request<User>('/auth/signup', () => {
      if (username.trim().length < 3) throw new ApiError('Username must be at least 3 characters.');
      if (!creds.email.includes('@')) throw new ApiError('Enter a valid email address.');
      if (creds.password.length < 6) throw new ApiError('Password must be at least 6 characters.');
      return createDemoUser(username, creds.email);
    }),

  requestPasswordReset: (email: string) =>
    request<{ sent: boolean }>('/auth/forgot', () => {
      if (!email.includes('@')) throw new ApiError('Enter a valid email address.');
      return { sent: true };
    }),

  fetchInventory: () => request('/me/inventory', () => generateInventory(10)),

  deposit: (amount: number) =>
    request<{ amount: number; reference: string }>('/wallet/deposit', () => {
      if (amount <= 0) throw new ApiError('Amount must be greater than zero.');
      return { amount, reference: `DEP-${Date.now().toString(36).toUpperCase()}` };
    }),

  withdraw: (amount: number, balance: number) =>
    request<{ amount: number; reference: string }>('/wallet/withdraw', () => {
      if (amount <= 0) throw new ApiError('Amount must be greater than zero.');
      if (amount > balance) throw new ApiError('Insufficient balance.');
      return { amount, reference: `WDR-${Date.now().toString(36).toUpperCase()}` };
    }),

  linkRoblox: (username: string, tradeUrl?: string) =>
    request<{ username: string; userId: string; tradeUrl: string | null }>('/me/roblox', () => {
      if (username.trim().length < 3) throw new ApiError('Roblox username looks too short.');
      return {
        username,
        userId: String(Math.floor(Math.random() * 9_000_000) + 1_000_000),
        tradeUrl: tradeUrl ?? null,
      };
    }),

  redeemPromo: (code: string) =>
    request<{ code: string; reward: number }>('/promo/redeem', () => {
      const table: Record<string, number> = { RIFTOPEN: 500, NEON250: 250, MYTHICHUNT: 1500 };
      const reward = table[code.trim().toUpperCase()];
      if (!reward) throw new ApiError('That promo code is invalid or expired.');
      return { code: code.toUpperCase(), reward };
    }),
};
