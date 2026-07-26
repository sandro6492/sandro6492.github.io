import type { Metadata } from 'next';
import { LeaderboardPage } from '@/components/dashboard/LeaderboardPage';

export const metadata: Metadata = { title: 'Leaderboard — NOVARIFT', description: 'Top winners, highest levels and the weekly podium.' };

export default function Page() {
  return <LeaderboardPage />;
}
