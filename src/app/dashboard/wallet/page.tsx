import type { Metadata } from 'next';
import { WalletPanel } from '@/components/dashboard/WalletPanel';

export const metadata: Metadata = { title: 'Wallet & Inventory — NOVARIFT' };

export default function Page() {
  return <WalletPanel />;
}
