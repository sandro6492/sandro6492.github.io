import type { Metadata } from 'next';
import { DiceGame } from '@/components/games/dice/DiceGame';
import { GAME_BY_ID } from '@/lib/constants';

const meta = GAME_BY_ID['dice'];
export const metadata: Metadata = { title: `${meta.name} — NOVARIFT`, description: meta.tagline };

export default function Page() {
  return <DiceGame />;
}
