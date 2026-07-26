import type { Metadata } from 'next';
import { WheelGame } from '@/components/games/wheel/WheelGame';
import { GAME_BY_ID } from '@/lib/constants';

const meta = GAME_BY_ID['wheel'];
export const metadata: Metadata = { title: `${meta.name} — NOVARIFT`, description: meta.tagline };

export default function Page() {
  return <WheelGame />;
}
