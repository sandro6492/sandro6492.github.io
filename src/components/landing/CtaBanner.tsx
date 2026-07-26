'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui';
import { useUIStore, useUserStore } from '@/lib/store';
import { BRAND } from '@/lib/constants';

export function CtaBanner() {
  const openModal = useUIStore((s) => s.openModal);
  const isAuth = useUserStore((s) => s.isAuthenticated);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="neon-border relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/12 via-violet-500/10 to-fuchsia-500/12 px-6 py-14 text-center backdrop-blur-xl sm:px-12"
      >
        <div className="grid-bg absolute inset-0 opacity-40" />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="pointer-events-none absolute inset-x-1/4 -top-24 h-48 rounded-full bg-cyan-400/20 blur-3xl"
        />
        <div className="relative">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-void-950">
            <Rocket className="size-6" />
          </span>
          <h2 className="font-display mt-5 text-3xl font-black text-white sm:text-4xl">Your first multiplier is one click away</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-300 sm:text-base">
            Join thousands of pilots already running the rift. Free demo balance, zero risk, all of the adrenaline.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {isAuth ? (
              <Link href="/games"><Button size="xl">Enter the arena</Button></Link>
            ) : (
              <Button size="xl" onClick={() => openModal('signup')}>Claim 10,000 {BRAND.currency}</Button>
            )}
            <Link href="/leaderboard"><Button variant="secondary" size="xl" className="w-full sm:w-auto">See the leaderboard</Button></Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
