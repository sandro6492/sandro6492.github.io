'use client';
import { useQuery } from '@tanstack/react-query';
import type { LeaderboardScope } from '@/types';
import { socialService } from '@/services';

export function useLeaderboard(scope: LeaderboardScope, limit = 25) {
  return useQuery({
    queryKey: ['leaderboard', scope, limit],
    queryFn: () => socialService.leaderboard(scope, limit),
    staleTime: 60_000,
  });
}
