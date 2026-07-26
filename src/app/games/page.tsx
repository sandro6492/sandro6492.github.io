import type { Metadata } from 'next';
import { GamesIndex } from '@/components/games/GamesIndex';

export const metadata: Metadata = { title: 'Games — NOVARIFT', description: 'Nine original arenas, one rift.' };

export default function Page() {
  return <GamesIndex />;
}
