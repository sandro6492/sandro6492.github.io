'use client';
import { useUserStore } from '@/lib/store';
import { useUIStore } from '@/lib/store';
import { BRAND } from '@/lib/constants';
import { formatCoins } from '@/lib/utils';

export function useMissions() {
  const missions = useUserStore((s) => s.missions);
  const claim = useUserStore((s) => s.claimMission);
  const notify = useUIStore((s) => s.notify);

  return {
    missions,
    claim: (id: string) => {
      const mission = missions.find((m) => m.id === id);
      if (!mission) return;
      claim(id);
      notify('reward', 'Mission complete', `+${formatCoins(mission.reward, 0)} ${BRAND.currency} · ${mission.title}`);
    },
  };
}
