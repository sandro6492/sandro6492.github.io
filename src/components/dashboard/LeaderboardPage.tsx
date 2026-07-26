'use client';
/** Global leaderboards with a podium visual and three scopes. */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import { Avatar, Badge, Card, Skeleton, Tabs } from '@/components/ui';
import { CoinAmount } from '@/components/common/CoinAmount';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useLeaderboard } from '@/hooks';
import type { LeaderboardScope } from '@/types';
import { cn, formatCompact } from '@/lib/utils';

const SCOPES: { id: LeaderboardScope; label: string }[] = [
  { id: 'winnings', label: 'Top winners' },
  { id: 'level', label: 'Highest level' },
  { id: 'weekly', label: 'Weekly race' },
];

const PODIUM = [
  { place: 2, height: 'h-24', ring: 'from-slate-300 to-slate-500', prize: '25,000' },
  { place: 1, height: 'h-32', ring: 'from-amber-300 to-orange-500', prize: '100,000' },
  { place: 3, height: 'h-20', ring: 'from-orange-400 to-amber-700', prize: '10,000' },
];

export function LeaderboardPage() {
  const [scope, setScope] = useState<LeaderboardScope>('winnings');
  const { data, isLoading } = useLeaderboard(scope, 25);
  const rows = data ?? [];
  const top3 = rows.slice(0, 3);

  const format = (value: number) => (scope === 'level' ? `Lv ${value}` : formatCompact(value));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Season 01"
        title="Rift leaderboard"
        subtitle="Ranks refresh continuously. The weekly race pays the podium every Sunday at 00:00 UTC."
      />

      <div className="mt-8 flex justify-center">
        <Tabs active={scope} onChange={setScope} tabs={SCOPES} layoutId="lb" />
      </div>

      {/* Podium */}
      <div className="mt-10 grid grid-cols-3 items-end gap-3 sm:gap-6">
        {PODIUM.map((p, i) => {
          const entry = top3[p.place - 1];
          return (
            <motion.div
              key={p.place}
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col items-center"
            >
              {p.place === 1 && (
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.6, repeat: Infinity }}>
                  <Crown className="mb-1 size-6 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
                </motion.div>
              )}
              {entry ? (
                <>
                  <div className={cn('rounded-2xl bg-gradient-to-br p-0.5', p.ring)}>
                    <Avatar src={entry.user.avatarUrl} alt={entry.user.username} size={p.place === 1 ? 58 : 46} ring={false} />
                  </div>
                  <p className="mt-2 max-w-[7rem] truncate text-center text-xs font-bold text-white sm:text-sm">{entry.user.username}</p>
                  <p className="font-mono text-[11px] text-cyan-300">{format(entry.value)}</p>
                </>
              ) : (
                <Skeleton className="size-12 rounded-2xl" />
              )}
              <div
                className={cn(
                  'mt-3 flex w-full flex-col items-center justify-center rounded-t-xl border border-b-0 border-white/10 bg-gradient-to-t from-void-900 to-void-800',
                  p.height,
                )}
              >
                <span className="font-display text-2xl font-black text-white/25">#{p.place}</span>
                <span className="text-[10px] font-semibold text-slate-500">{p.prize} RC</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Table */}
      <Card className="mt-8 overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_5rem_6rem] gap-2 border-b border-white/8 px-4 py-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase sm:grid-cols-[3.5rem_1fr_6rem_8rem] sm:px-5">
          <span>Rank</span><span>Player</span><span className="text-right">Trend</span><span className="text-right">{scope === 'level' ? 'Level' : 'Value'}</span>
        </div>
        <ul className="divide-y divide-white/5">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <li key={i} className="px-5 py-3"><Skeleton className="h-8 w-full" /></li>
              ))
            : rows.map((row, i) => (
                <motion.li
                  key={row.user.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                  className={cn(
                    'grid grid-cols-[3rem_1fr_5rem_6rem] items-center gap-2 px-4 py-3 transition hover:bg-white/[0.02] sm:grid-cols-[3.5rem_1fr_6rem_8rem] sm:px-5',
                    row.rank <= 3 && 'bg-gradient-to-r from-amber-400/[0.06] to-transparent',
                  )}
                >
                  <span className={cn('font-display text-sm font-black', row.rank === 1 ? 'text-amber-300' : row.rank <= 3 ? 'text-slate-300' : 'text-slate-600')}>
                    {row.rank <= 3 ? <Medal className="size-4" /> : `#${row.rank}`}
                  </span>
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Avatar src={row.user.avatarUrl} alt={row.user.username} size={30} level={row.user.level} />
                    <span className="truncate text-sm font-semibold text-slate-100">{row.user.username}</span>
                  </span>
                  <span className={cn('flex items-center justify-end gap-1 font-mono text-[11px]', row.change >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                    {row.change >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {Math.abs(row.change)}
                  </span>
                  <span className="text-right">
                    {scope === 'level' ? (
                      <Badge tone="violet">Lv {row.value}</Badge>
                    ) : (
                      <CoinAmount value={row.value} size="sm" decimals={0} className="justify-end text-emerald-300" />
                    )}
                  </span>
                </motion.li>
              ))}
        </ul>
      </Card>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Trophy className="size-3.5 text-amber-400" /> Prize pool resets weekly · top 3 split 135,000 RC
      </p>
    </div>
  );
}
