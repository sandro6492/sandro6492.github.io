/** Case + upgrader endpoints (mocked). */
import type { CaseDefinition, Item } from '@/types';
import { CASES, buildReel, rollCase } from '@/lib/mockData';
import { attemptUpgrade, upgradeChance } from '@/lib/gameEngine';
import { ApiError, request } from './apiClient';

export const caseService = {
  listCases: () => request<CaseDefinition[]>('/cases', () => CASES),

  getCase: (id: string) => request<CaseDefinition | undefined>(`/cases/${id}`, () => CASES.find((c) => c.id === id)),

  /** Server decides the winner; the reel is only presentation. */
  openCase: (id: string) =>
    request<{ winner: Item; reel: Item[]; winnerIndex: number }>(`/cases/${id}/open`, () => {
      const def = CASES.find((c) => c.id === id);
      if (!def) throw new ApiError('Unknown case.', 404);
      const winner = rollCase(def);
      const winnerIndex = 52;
      return { winner, reel: buildReel(def, winner, 60, winnerIndex), winnerIndex };
    }),

  upgrade: (fromValue: number, target: Item) =>
    request<{ success: boolean; chance: number }>('/upgrader/attempt', () => {
      const chance = upgradeChance(fromValue, target.value);
      return { success: attemptUpgrade(chance), chance };
    }),
};
