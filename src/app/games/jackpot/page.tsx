import type { Metadata } from 'next';
import { JackpotGame } from '@/components/games/jackpot/JackpotGame';
import { GAME_BY_ID } from '@/lib/constants';

const meta = GAME_BY_ID['jackpot'];
export const metadata: Metadata = { title: `${meta.name} — NOVARIFT`, description: meta.tagline };

export default function Page() {
  return <JackpotGame />;
}
