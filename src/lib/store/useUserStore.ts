/**
 * Auth + wallet + inventory + progression store.
 * Persisted to localStorage so a refresh keeps the demo session alive.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InventoryItem, Item, Mission, RobloxLink, User } from '@/types';
import { avatarFor, createDemoUser, generateInventory, generateMissions, makeInventoryItem } from '@/lib/mockData';
import { xpForLevel } from '@/lib/utils';

interface UserState {
  user: User | null;
  inventory: InventoryItem[];
  missions: Mission[];
  isAuthenticated: boolean;
  hydrated: boolean;

  login: (email: string, username?: string) => void;
  signup: (username: string, email: string) => void;
  logout: () => void;

  adjustBalance: (delta: number) => void;
  setBalance: (value: number) => void;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean;

  addXp: (amount: number) => void;
  recordResult: (wagered: number, payout: number) => void;

  addItem: (item: Item) => InventoryItem;
  removeItem: (instanceId: string) => void;
  sellItem: (instanceId: string) => void;
  sellAll: () => void;
  replaceItem: (instanceId: string, item: Item) => void;

  connectRoblox: (link: Partial<RobloxLink>) => void;
  disconnectRoblox: () => void;

  claimDaily: (amount: number) => void;
  updateMission: (id: string, progress: number) => void;
  claimMission: (id: string) => void;
  setHydrated: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      inventory: [],
      missions: generateMissions(),
      isAuthenticated: false,
      hydrated: false,

      login: (email, username) => {
        const name = username ?? email.split('@')[0] ?? 'RiftPilot';
        set({
          user: createDemoUser(name, email),
          inventory: generateInventory(10),
          missions: generateMissions(),
          isAuthenticated: true,
        });
      },

      signup: (username, email) => {
        const user = createDemoUser(username, email);
        set({
          user: { ...user, level: 1, xp: 0, xpToNext: xpForLevel(1), balance: 10_000, streak: 0 },
          inventory: generateInventory(3),
          missions: generateMissions(),
          isAuthenticated: true,
        });
      },

      logout: () => set({ user: null, inventory: [], isAuthenticated: false }),

      adjustBalance: (delta) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, balance: Math.max(0, Number((user.balance + delta).toFixed(2))) } });
      },

      setBalance: (value) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, balance: Math.max(0, value) } });
      },

      deposit: (amount) => get().adjustBalance(amount),

      withdraw: (amount) => {
        const { user } = get();
        if (!user || user.balance < amount) return false;
        get().adjustBalance(-amount);
        return true;
      },

      addXp: (amount) => {
        const { user } = get();
        if (!user) return;
        let { level, xp, xpToNext } = user;
        xp += amount;
        while (xp >= xpToNext) {
          xp -= xpToNext;
          level += 1;
          xpToNext = xpForLevel(level);
        }
        set({ user: { ...user, level, xp, xpToNext } });
      },

      recordResult: (wagered, payout) => {
        const { user } = get();
        if (!user) return;
        const win = payout > wagered;
        const wins = user.stats.wins + (win ? 1 : 0);
        const losses = user.stats.losses + (win ? 0 : 1);
        set({
          user: {
            ...user,
            stats: {
              ...user.stats,
              wagered: user.stats.wagered + wagered,
              profit: user.stats.profit + (payout - wagered),
              wins,
              losses,
              gamesPlayed: user.stats.gamesPlayed + 1,
              biggestWin: Math.max(user.stats.biggestWin, payout),
              winRate: Number(((wins / Math.max(1, wins + losses)) * 100).toFixed(1)),
            },
          },
        });
        get().addXp(Math.max(5, Math.round(wagered / 10)));
      },

      addItem: (item) => {
        const inv = makeInventoryItem(item);
        set({ inventory: [inv, ...get().inventory] });
        return inv;
      },

      removeItem: (instanceId) =>
        set({ inventory: get().inventory.filter((i) => i.instanceId !== instanceId) }),

      sellItem: (instanceId) => {
        const item = get().inventory.find((i) => i.instanceId === instanceId);
        if (!item) return;
        get().removeItem(instanceId);
        get().adjustBalance(item.value);
      },

      sellAll: () => {
        const total = get().inventory.reduce((s, i) => (i.locked ? s : s + i.value), 0);
        set({ inventory: get().inventory.filter((i) => i.locked) });
        get().adjustBalance(total);
      },

      replaceItem: (instanceId, item) => {
        set({
          inventory: get().inventory.map((i) =>
            i.instanceId === instanceId ? { ...makeInventoryItem(item), instanceId } : i,
          ),
        });
      },

      connectRoblox: (link) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            roblox: {
              connected: true,
              username: link.username ?? user.username,
              userId: link.userId ?? String(Math.floor(Math.random() * 9_000_000) + 1_000_000),
              avatarUrl: link.avatarUrl ?? avatarFor(link.username ?? user.username),
              tradeUrl: link.tradeUrl ?? null,
              verifiedAt: new Date().toISOString(),
            },
          },
        });
      },

      disconnectRoblox: () => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            roblox: { connected: false, username: null, userId: null, avatarUrl: null, tradeUrl: null, verifiedAt: null },
          },
        });
      },

      claimDaily: (amount) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            balance: user.balance + amount,
            streak: Math.min(7, user.streak + 1),
            lastClaimAt: new Date().toISOString(),
          },
        });
      },

      updateMission: (id, progress) =>
        set({
          missions: get().missions.map((m) =>
            m.id === id ? { ...m, progress: Math.min(m.target, progress) } : m,
          ),
        }),

      claimMission: (id) => {
        const mission = get().missions.find((m) => m.id === id);
        if (!mission || mission.claimed || mission.progress < mission.target) return;
        set({ missions: get().missions.map((m) => (m.id === id ? { ...m, claimed: true } : m)) });
        get().adjustBalance(mission.reward);
      },

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'novarift-user',
      partialize: (s) => ({
        user: s.user,
        inventory: s.inventory,
        missions: s.missions,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
