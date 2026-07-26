import type { Metadata } from 'next';
import { ProfilePanel } from '@/components/dashboard/ProfilePanel';

export const metadata: Metadata = { title: 'Profile — NOVARIFT' };

export default function Page() {
  return <ProfilePanel />;
}
