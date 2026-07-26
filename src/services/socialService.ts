/** Chat, leaderboard, missions and platform-stat endpoints (mocked). */
import type { ChatMessage, LeaderboardEntry, LeaderboardScope, Mission, PlatformStats } from '@/types';
import {
  generateChatHistory,
  generateChatMessage,
  generateLeaderboard,
  generateMissions,
  generatePlatformStats,
} from '@/lib/mockData';
import { createChannel, request } from './apiClient';

export const socialService = {
  chatHistory: (limit = 18) => request<ChatMessage[]>('/chat/history', () => generateChatHistory(limit)),
  chatChannel: createChannel<ChatMessage>(() => generateChatMessage(), 4_000),

  leaderboard: (scope: LeaderboardScope, limit = 25) =>
    request<LeaderboardEntry[]>(`/leaderboard/${scope}`, () => generateLeaderboard(scope, limit)),

  missions: () => request<Mission[]>('/me/missions', () => generateMissions()),

  platformStats: () => request<PlatformStats>('/stats', () => generatePlatformStats()),
  statsChannel: createChannel<PlatformStats>(generatePlatformStats, 4_500),
};
