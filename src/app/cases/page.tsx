import type { Metadata } from 'next';
import { CasesPage } from '@/components/games/cases/CasesPage';

export const metadata: Metadata = { title: 'Case Rift — NOVARIFT', description: 'Unbox mythic-tier loot across four case tiers.' };

export default function Page() {
  return <CasesPage />;
}
