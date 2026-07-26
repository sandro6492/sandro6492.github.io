/**
 * Global chat store. A mock "socket" (setInterval) feeds messages in; the
 * public API mirrors what a real Socket.io client would expose.
 */
import { create } from 'zustand';
import type { ChatMessage } from '@/types';
import { generateChatHistory, generateChatMessage } from '@/lib/mockData';
import { uid } from '@/lib/utils';

interface ChatState {
  messages: ChatMessage[];
  connected: boolean;
  onlineCount: number;
  /** ms remaining until the next rain event */
  rainCountdown: number;

  connect: () => () => void;
  send: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  receive: (message: ChatMessage) => void;
  triggerRain: (username: string, avatarUrl: string, amount: number) => void;
  tick: () => void;
}

const MAX_MESSAGES = 120;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: generateChatHistory(16),
  connected: false,
  onlineCount: 4_812,
  rainCountdown: 15 * 60,

  /** Starts the mock feed; returns a disconnect fn (socket-like ergonomics). */
  connect: () => {
    if (get().connected) return () => {};
    set({ connected: true });

    const msgTimer = setInterval(() => {
      const roll = Math.random();
      const kind: ChatMessage['kind'] = roll > 0.94 ? 'rain' : roll > 0.88 ? 'tip' : 'message';
      get().receive(generateChatMessage(kind));
    }, 3_800);

    const presenceTimer = setInterval(() => {
      set((s) => ({ onlineCount: Math.max(1_000, s.onlineCount + Math.round((Math.random() - 0.5) * 90)) }));
    }, 5_000);

    const countdownTimer = setInterval(() => get().tick(), 1_000);

    return () => {
      clearInterval(msgTimer);
      clearInterval(presenceTimer);
      clearInterval(countdownTimer);
      set({ connected: false });
    };
  },

  send: (message) =>
    get().receive({ ...message, id: uid('msg'), createdAt: new Date().toISOString() }),

  receive: (message) =>
    set((s) => ({ messages: [...s.messages, message].slice(-MAX_MESSAGES) })),

  triggerRain: (username, avatarUrl, amount) =>
    get().receive({
      id: uid('msg'),
      userId: 'usr_demo',
      username,
      avatarUrl,
      level: 42,
      role: 'vip',
      body: 'made it rain on the rift!',
      createdAt: new Date().toISOString(),
      kind: 'rain',
      amount,
    }),

  tick: () =>
    set((s) => ({ rainCountdown: s.rainCountdown <= 0 ? 15 * 60 : s.rainCountdown - 1 })),
}));
