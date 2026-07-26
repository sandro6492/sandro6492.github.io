import type { Metadata } from 'next';
import { MissionsPage } from '@/components/dashboard/MissionsPage';

export const metadata: Metadata = { title: 'Missions — NOVARIFT', description: 'Daily, weekly and season quests with claimable rewards.' };

export default function Page() {
  return <MissionsPage />;
}
