import type { Metadata } from 'next';
import { MinesGame } from '@/components/games/mines/MinesGame';
import { GAME_BY_ID } from '@/lib/constants';

const meta = GAME_BY_ID['mines'];
export const metadata: Metadata = { title: `${meta.name} — NOVARIFT`, description: meta.tagline };

export default function Page() {
  return <MinesGame />;
}
