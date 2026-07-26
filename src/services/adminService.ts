/** Admin console endpoints (mocked). */
import type { AdminUserRow, PlatformStats, PromoCode, SystemToggle } from '@/types';
import {
  PROMO_CODES,
  SYSTEM_TOGGLES,
  generateAdminUsers,
  generatePlatformStats,
  generateSeries,
} from '@/lib/mockData';
import { ApiError, request } from './apiClient';
import { uid } from '@/lib/utils';

export const adminService = {
  users: () => request<AdminUserRow[]>('/admin/users', () => generateAdminUsers(24)),
  promoCodes: () => request<PromoCode[]>('/admin/promos', () => PROMO_CODES),
  toggles: () => request<SystemToggle[]>('/admin/toggles', () => SYSTEM_TOGGLES),
  stats: () => request<PlatformStats>('/admin/stats', () => generatePlatformStats()),
  revenueSeries: () => request<number[]>('/admin/series', () => generateSeries(28, 30, 100)),

  createPromo: (code: string, reward: number, maxUses: number) =>
    request<PromoCode>('/admin/promos', () => {
      if (code.trim().length < 3) throw new ApiError('Promo code must be at least 3 characters.');
      return {
        id: uid('promo'),
        code: code.toUpperCase(),
        reward,
        uses: 0,
        maxUses,
        active: true,
        expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      };
    }),
};
