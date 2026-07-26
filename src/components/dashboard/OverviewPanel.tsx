'use client';
/** Dashboard overview: stats, match history, mission snapshot, daily streak. */
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, Flame, Target, TrendingUp, Trophy } from 'lucide-react';
import { Badge, Card, CardBody, CardHeader, CardTitle, Icon, ProgressBar } from '@/components/ui';
import { CoinAmount } from '@/components/common/CoinAmount';
import { EmptyState } from '@/components/common/EmptyState';
import { useBetHistory, useMissions } from '@/hooks';
import { useUserStore } from '@/lib/store';
import { DAILY_REWARDS, GAME_BY_ID } from '@/lib/constants';
import { cn, formatMultiplier, timeAgo } from '@/lib/utils';

export function OverviewPanel() {
  const user = useUserStore((s) => s.user)!;
  const { data: bets } = useBetHistory(undefined, 12);
  const { missions } = useMissions();

  const stats = [
    { label: 'Total wagered', value: user.stats.wagered, icon: Activity, tone: 'from-cyan-400 to-blue-500' },
    { label: 'Net profit', value: user.stats.profit, icon: TrendingUp, tone: 'from-emerald-400 to-teal-500', signed: true },
    { label: 'Biggest win', value: user.stats.biggestWin, icon: Trophy, tone: 'from-amber-300 to-orange-500' },
    { label: 'Win rate', value: user.stats.winRate, icon: Target, tone: 'from-violet-400 to-fuchsia-500', percent: true },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="flex items-center gap-3.5 p-4">
              <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-void-950', s.tone)}>
                <s.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] tracking-wider text-slate-500 uppercase">{s.label}</p>
                {s.percent ? (
                  <p className="font-display text-lg font-extrabold text-white">{s.value}%</p>
                ) : (
                  <CoinAmount value={s.value} size="md" decimals={0} signed={s.signed} className={cn('text-white', s.signed && s.value > 0 && 'text-emerald-300', s.signed && s.value < 0 && 'text-rose-300')} />
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Match history */}
      <Card className="overflow-hidden lg:col-span-2">
        <CardHeader>
          <CardTitle>Match history</CardTitle>
          <Link href="/games" className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200">Play more →</Link>
        </CardHeader>
        {!bets?.length ? (
          <EmptyState icon="History" title="No matches yet" body="Your recent rounds will appear here." />
        ) : (
          <ul className="divide-y divide-white/5">
            {bets.map((b) => {
              const game = GAME_BY_ID[b.gameId];
              return (
                <li key={b.id} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                  <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-void-950', game.accent)}>
                    <Icon name={game.icon} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-200">{game.name}</p>
                    <p className="truncate text-[10px] text-slate-500">{b.detail} · {timeAgo(b.createdAt)}</p>
                  </div>
                  <span className={cn('font-mono text-[11px] font-bold', b.outcome === 'win' ? 'text-emerald-300' : 'text-slate-600')}>
                    {formatMultiplier(b.multiplier)}
                  </span>
                  <CoinAmount
                    value={b.outcome === 'win' ? b.payout - b.amount : b.amount}
                    signed
                    size="sm"
                    decimals={0}
                    className={cn('w-24 justify-end', b.outcome === 'win' ? 'text-emerald-300' : 'text-rose-300/80')}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <div className="space-y-4">
        {/* Streak */}
        <Card>
          <CardHeader><CardTitle>Daily streak</CardTitle><Badge tone="amber"><Flame className="mr-0.5 size-3" />{user.streak} days</Badge></CardHeader>
          <CardBody className="space-y-3">
            <div className="grid grid-cols-7 gap-1">
              {DAILY_REWARDS.map((d) => (
                <div
                  key={d.day}
                  className={cn(
                    'grid aspect-square place-items-center rounded-lg border text-[10px] font-bold',
                    d.day <= user.streak ? 'border-emerald-400/40 bg-emerald-400/12 text-emerald-300' : 'border-white/8 text-slate-600',
                  )}
                >
                  {d.day}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">Next reward: {DAILY_REWARDS[Math.min(user.streak, 6)].amount.toLocaleString()} RC</p>
          </CardBody>
        </Card>

        {/* Missions snapshot */}
        <Card>
          <CardHeader>
            <CardTitle>Active missions</CardTitle>
            <Link href="/missions" className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200">All →</Link>
          </CardHeader>
          <CardBody className="space-y-3.5">
            {missions.slice(0, 4).map((m) => (
              <div key={m.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-slate-300">{m.title}</span>
                  <span className="shrink-0 font-mono text-[10px] text-slate-500">{m.progress}/{m.target}</span>
                </div>
                <ProgressBar value={m.progress} max={m.target} height="h-1.5" />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
