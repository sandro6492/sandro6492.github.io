import type { Metadata } from 'next';
import { CoinFlipGame } from '@/components/games/coinflip/CoinFlipGame';
import { GAME_BY_ID } from '@/lib/constants';

const meta = GAME_BY_ID['coinflip'];
export const metadata: Metadata = { title: `${meta.name} — NOVARIFT`, description: meta.tagline };

export default function Page() {
  return <CoinFlipGame />;
}
