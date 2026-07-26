import type { Metadata } from 'next';
import { OverviewPanel } from '@/components/dashboard/OverviewPanel';

export const metadata: Metadata = { title: 'Dashboard — NOVARIFT' };

export default function Page() {
  return <OverviewPanel />;
}
