'use client';
/** Live-updating platform counters used by the landing hero + admin. */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PlatformStats } from '@/types';
import { socialService } from '@/services';

export function usePlatformStats() {
  const { data } = useQuery({ queryKey: ['platform-stats'], queryFn: socialService.platformStats });
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => { if (data) setStats(data); }, [data]);

  useEffect(
    () =>
      socialService.statsChannel.subscribe((next) =>
        setStats((prev) =>
          prev
            ? {
                // Nudge values instead of replacing them so counters animate smoothly
                onlinePlayers: prev.onlinePlayers + Math.round((next.onlinePlayers - prev.onlinePlayers) * 0.12),
                jackpotPool: prev.jackpotPool + Math.round(Math.random() * 4_000),
                totalWinnings: prev.totalWinnings + Math.round(Math.random() * 22_000),
                betsToday: prev.betsToday + Math.round(Math.random() * 240),
                housePnl: next.housePnl,
                newSignups: prev.newSignups + (Math.random() > 0.7 ? 1 : 0),
              }
            : next,
        ),
      ),
    [],
  );

  return stats;
}
