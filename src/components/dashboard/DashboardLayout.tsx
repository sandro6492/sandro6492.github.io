'use client';
/** Shared dashboard chrome: identity header, XP bar and section tabs. */
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gamepad2, LayoutDashboard, LogIn, User as UserIcon, Wallet } from 'lucide-react';
import { Avatar, Badge, Button, Card, ProgressBar } from '@/components/ui';
import { CoinAmount } from '@/components/common/CoinAmount';
import { EmptyState } from '@/components/common/EmptyState';
import { useUIStore, useUserStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Profile', icon: UserIcon },
  { href: '/dashboard/wallet', label: 'Wallet & Inventory', icon: Wallet },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);
  const openModal = useUIStore((s) => s.openModal);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <Card>
          <EmptyState
            icon="LockKeyhole"
            title="Sign in to view your dashboard"
            body="Create a free demo pilot to track XP, badges, inventory and match history."
            action={
              <div className="mt-2 flex gap-2">
                <Button icon={<LogIn className="size-4" />} onClick={() => openModal('login')}>Log in</Button>
                <Button variant="secondary" onClick={() => openModal('signup')}>Sign up</Button>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  const xpPct = (user.xp / user.xpToNext) * 100;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Identity card */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 p-0.5">
                <Avatar src={user.avatarUrl} alt={user.username} size={62} ring={false} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display truncate text-xl font-black text-white sm:text-2xl">{user.username}</h1>
                  <Badge tone={user.role === 'vip' ? 'amber' : 'cyan'}>{user.role}</Badge>
                </div>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
                <div className="mt-2 flex items-center gap-2.5">
                  <span className="font-display text-[11px] font-bold text-cyan-300">LV {user.level}</span>
                  <ProgressBar value={xpPct} className="w-32 sm:w-44" height="h-1.5" />
                  <span className="font-mono text-[10px] text-slate-500">{user.xp}/{user.xpToNext}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-white/8 bg-void-900/60 px-4 py-2.5">
                <p className="text-[10px] tracking-wider text-slate-500 uppercase">Balance</p>
                <CoinAmount value={user.balance} size="lg" className="text-white" />
              </div>
              <Button onClick={() => openModal('deposit')}>Deposit</Button>
              <Button variant="secondary" onClick={() => openModal('withdraw')}>Withdraw</Button>
              <Link href="/games"><Button variant="ghost" icon={<Gamepad2 className="size-4" />}>Play</Button></Link>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl border border-white/8 bg-void-900/60 p-1 scrollbar-none">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                'relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
                active ? 'text-white' : 'text-slate-400 hover:text-slate-200',
              )}
            >
              {active && (
                <motion.span layoutId="dash-tab" className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/25 to-violet-500/25 ring-1 ring-cyan-400/40" />
              )}
              <t.icon className="relative z-10 size-4" />
              <span className="relative z-10">{t.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-5">{children}</div>
    </div>
  );
}
