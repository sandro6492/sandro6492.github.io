'use client';
/** Composes background, nav, chat, modals and toasts around every page. */
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatedBackground } from '@/components/common/AnimatedBackground';
import { ToastHost } from '@/components/common/ToastHost';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { ChatDrawer } from '@/components/chat/ChatDrawer';
import { AuthModals } from './AuthModals';
import { WalletModals } from './WalletModals';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname.startsWith('/admin');

  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="relative min-h-[70vh]">{children}</main>
      {!hideFooter && <Footer />}
      <ChatDrawer />
      <AuthModals />
      <WalletModals />
      <ToastHost />
    </>
  );
}
