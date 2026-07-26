'use client';
/** Dual-mode live wins ticker: horizontal marquee + vertical recent list. */
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Avatar, Card, CardHeader, CardTitle, Badge } from '@/components/ui';
import { CoinAmount } from '@/components/common/CoinAmount';
import { useLiveWins } from '@/hooks';
import { GAME_BY_ID } from '@/lib/constants';
import { formatMultiplier, timeAgo } from '@/lib/utils';

export function LiveWinsFeed() {
  const wins = useLiveWins(18);
  const marquee = wins.slice(0, 10);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display flex items-center gap-2 text-2xl font-extrabold text-white sm:text-3xl">
            <Flame className="size-6 text-amber-400" /> Live winnings
          </h2>
          <p className="mt-1 text-sm text-slate-400">Every payout across the rift, streaming in real time.</p>
        </div>
        <Badge tone="emerald" pulse className="shrink-0">Streaming</Badge>
      </div>

      {/* Marquee */}
      <div className="mask-fade-x relative overflow-hidden py-1">
        <div className="animate-[marquee_38s_linear_infinite] flex w-max gap-3 hover:[animation-play-state:paused]">
          {[...marquee, ...marquee].map((w, i) => (
            <div key={`${w.id}-${i}`} className="glass glass-hover flex items-center gap-2.5 rounded-xl px-3 py-2.5">
              <Avatar src={w.avatarUrl} alt={w.username} size={30} />
              <div className="whitespace-nowrap">
                <p className="text-xs font-semibold text-slate-200">{w.username}</p>
                <p className="text-[10px] text-slate-500">{w.gameName} · {formatMultiplier(w.multiplier)}</p>
              </div>
              <CoinAmount value={w.amount} size="xs" decimals={0} className="ml-1 text-emerald-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent list */}
      <Card className="mt-5 overflow-hidden">
        <CardHeader>
          <CardTitle>Recent big wins</CardTitle>
          <span className="text-[11px] text-slate-500">Updated live</span>
        </CardHeader>
        <ul className="divide-y divide-white/5">
          <AnimatePresence initial={false}>
            {wins.slice(0, 8).map((w) => {
              const game = GAME_BY_ID[w.gameId];
              return (
                <motion.li
                  key={w.id}
                  layout
                  initial={{ opacity: 0, height: 0, y: -12 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.02] sm:px-5"
                >
                  <Avatar src={w.avatarUrl} alt={w.username} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">{w.username}</p>
                    <p className="text-[11px] text-slate-500">{timeAgo(w.createdAt)}</p>
                  </div>
                  <Link href={game.href} className="hidden rounded-lg border border-white/8 px-2 py-1 text-[11px] font-semibold text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-300 sm:block">
                    {w.gameName}
                  </Link>
                  <span className="w-16 text-right font-mono text-xs font-bold text-cyan-300">{formatMultiplier(w.multiplier)}</span>
                  <CoinAmount value={w.amount} size="sm" decimals={0} className="w-28 justify-end text-emerald-300" />
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </Card>
    </section>
  );
}
