import type { Metadata } from 'next';
import { CrashGame } from '@/components/games/crash/CrashGame';
import { GAME_BY_ID } from '@/lib/constants';

const meta = GAME_BY_ID['crash'];
export const metadata: Metadata = { title: `${meta.name} — NOVARIFT`, description: meta.tagline };

export default function Page() {
  return <CrashGame />;
}
