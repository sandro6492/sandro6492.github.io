'use client';
/** /games — full catalogue with filters and a live all-games bet feed. */
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Avatar, Badge, Card, CardHeader, CardTitle, Icon, Tabs } from '@/components/ui';
import { CoinAmount } from '@/components/common/CoinAmount';
import { useGames, useLiveBets } from '@/hooks';
import { GAMES, GAME_BY_ID } from '@/lib/constants';
import { cn, formatMultiplier, timeAgo } from '@/lib/utils';

type Filter = 'all' | 'hot' | 'new';

export function GamesIndex() {
  const { data } = useGames();
  const games = data ?? GAMES;
  const bets = useLiveBets(14);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = games.filter((g) => (filter === 'hot' ? g.hot : filter === 'new' ? g.isNew : true));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-white sm:text-4xl">
            The <span className="neon-text">Arena</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">Nine original modes. Every round provably fair, every payout instant.</p>
        </div>
        <Tabs
          active={filter}
          onChange={setFilter}
          layoutId="games-filter"
          tabs={[
            { id: 'all', label: 'All', count: games.length },
            { id: 'hot', label: 'Hot', count: games.filter((g) => g.hot).length },
            { id: 'new', label: 'New', count: games.filter((g) => g.isNew).length },
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_21rem]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <Link href={g.href} className="group block h-full">
                <div className="glass glass-hover relative h-full overflow-hidden rounded-2xl p-5">
                  <div className={cn('pointer-events-none absolute -top-16 -right-12 size-40 rounded-full bg-gradient-to-br opacity-15 blur-3xl transition group-hover:opacity-35', g.accent)} />
                  <div className="relative flex items-start justify-between">
                    <span className={cn('grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-void-950 transition group-hover:scale-110', g.accent)}>
                      <Icon name={g.icon} className="size-6" />
                    </span>
                    <div className="flex gap-1.5">
                      {g.hot && <Badge tone="rose">Hot</Badge>}
                      {g.isNew && <Badge tone="emerald">New</Badge>}
                    </div>
                  </div>
                  <h2 className="font-display mt-4 text-lg font-bold text-white">{g.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">{g.tagline}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 text-slate-500">
                      <Users className="size-3" /><span className="font-semibold text-slate-300">{g.players.toLocaleString()}</span> live
                    </span>
                    <span className="font-semibold text-cyan-300 transition group-hover:translate-x-0.5">Play →</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Live all-games feed */}
        <Card className="h-fit overflow-hidden lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>Live bets</CardTitle>
            <Badge tone="emerald" pulse>Streaming</Badge>
          </CardHeader>
          <ul className="max-h-[32rem] divide-y divide-white/5 overflow-y-auto">
            {bets.length === 0 && <li className="px-4 py-8 text-center text-xs text-slate-500">Listening for bets…</li>}
            {bets.map((b) => (
              <motion.li key={b.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5 px-4 py-2.5">
                <Avatar src={b.user.avatarUrl} alt={b.user.username} size={26} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-200">{b.user.username}</p>
                  <p className="text-[10px] text-slate-500">{GAME_BY_ID[b.gameId].name} · {timeAgo(b.createdAt)}</p>
                </div>
                <span className={cn('font-mono text-[11px] font-bold', b.outcome === 'win' ? 'text-emerald-300' : 'text-slate-600')}>
                  {formatMultiplier(b.multiplier)}
                </span>
                <CoinAmount value={b.outcome === 'win' ? b.payout : b.amount} size="xs" decimals={0} className={b.outcome === 'win' ? 'text-emerald-300' : 'text-rose-300/70'} />
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
