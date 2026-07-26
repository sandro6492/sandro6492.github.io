'use client';
/** Animated jackpot / players / winnings counters fed by the mock stats channel. */
import { motion } from 'framer-motion';
import { Coins, TrendingUp, Users } from 'lucide-react';
import { usePlatformStats, useCountUp } from '@/hooks';
import { BRAND } from '@/lib/constants';
import { formatCoins } from '@/lib/utils';

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const animated = useCountUp(value, 800);
  return <span className="tabular-nums">{formatCoins(animated, decimals)}</span>;
}

export function LiveCounterBar() {
  const stats = usePlatformStats();

  const items = [
    { label: 'Jackpot pool', value: stats?.jackpotPool ?? 0, icon: Coins, accent: 'from-amber-300 to-orange-500', suffix: BRAND.currency },
    { label: 'Players online', value: stats?.onlinePlayers ?? 0, icon: Users, accent: 'from-emerald-300 to-teal-500', suffix: 'live' },
    { label: 'Total winnings', value: stats?.totalWinnings ?? 0, icon: TrendingUp, accent: 'from-cyan-300 to-violet-500', suffix: BRAND.currency },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="neon-border glass grid gap-px overflow-hidden rounded-2xl sm:grid-cols-3"
      >
        {items.map((item) => (
          <div key={item.label} className="relative flex items-center gap-3.5 px-5 py-5">
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-void-950 ${item.accent}`}>
              <item.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.16em] text-slate-500 uppercase">{item.label}</p>
              <p className="font-display truncate text-xl font-extrabold text-white sm:text-2xl">
                <Counter value={item.value} />
                <span className="ml-1.5 text-[11px] font-semibold text-slate-500">{item.suffix}</span>
              </p>
            </div>
            <span className="absolute top-1/2 right-0 hidden h-8 w-px -translate-y-1/2 bg-white/8 sm:block last:hidden" />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
