import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = { title: 'Admin — NOVARIFT', description: 'Platform control surface prototype.' };

export default function Page() {
  return <AdminDashboard />;
}
