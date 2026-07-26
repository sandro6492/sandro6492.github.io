import type { Metadata } from 'next';
import { UpgraderGame } from '@/components/games/upgrader/UpgraderGame';
import { GAME_BY_ID } from '@/lib/constants';

const meta = GAME_BY_ID['upgrader'];
export const metadata: Metadata = { title: `${meta.name} — NOVARIFT`, description: meta.tagline };

export default function Page() {
  return <UpgraderGame />;
}
