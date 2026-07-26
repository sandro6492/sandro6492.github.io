import type { Metadata } from 'next';
import { TowersGame } from '@/components/games/towers/TowersGame';
import { GAME_BY_ID } from '@/lib/constants';

const meta = GAME_BY_ID['towers'];
export const metadata: Metadata = { title: `${meta.name} — NOVARIFT`, description: meta.tagline };

export default function Page() {
  return <TowersGame />;
}
