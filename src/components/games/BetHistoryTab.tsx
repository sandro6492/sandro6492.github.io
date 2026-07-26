'use client';
/** Per-game live bet history with a "my bets" filter. */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, Tabs } from '@/components/ui';
import { CoinAmount } from '@/components/common/CoinAmount';
import { EmptyState } from '@/components/common/EmptyState';
import { useGameStore, useUserStore } from '@/lib/store';
import { cn, formatMultiplier, timeAgo } from '@/lib/utils';
import type { GameId } from '@/types';

export function BetHistoryTab({ gameId }: { gameId: GameId }) {
  const bets = useGameStore((s) => s.history[gameId] ?? []);
  const userId = useUserStore((s) => s.user?.id);
  const [scope, setScope] = useState<'all' | 'mine'>('all');

  const rows = useMemo(
    () => (scope === 'mine' ? bets.filter((b) => b.user.id === userId) : bets).slice(0, 24),
    [bets, scope, userId],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-1 pb-3">
        <Tabs
          size="sm"
          layoutId={`hist-${gameId}`}
          active={scope}
          onChange={setScope}
          tabs={[{ id: 'all', label: 'All bets' }, { id: 'mine', label: 'My bets' }]}
        />
        <span className="hidden text-[11px] text-slate-500 sm:block">{rows.length} rounds</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {rows.length === 0 ? (
          <EmptyState icon="History" title="No bets yet" body="Play a round and it will appear here instantly." />
        ) : (
          <ul className="space-y-1.5">
            <AnimatePresence initial={false}>
              {rows.map((bet) => (
                <motion.li
                  key={bet.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-xs',
                    bet.outcome === 'win'
                      ? 'border-emerald-400/20 bg-emerald-400/[0.06]'
                      : 'border-white/6 bg-white/[0.02]',
                  )}
                >
                  <Avatar src={bet.user.avatarUrl} alt={bet.user.username} size={26} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-200">{bet.user.username}</p>
                    <p className="truncate text-[10px] text-slate-500">{bet.detail ?? timeAgo(bet.createdAt)}</p>
                  </div>
                  <span className={cn('font-mono text-[11px] font-bold', bet.outcome === 'win' ? 'text-emerald-300' : 'text-slate-500')}>
                    {formatMultiplier(bet.multiplier)}
                  </span>
                  <CoinAmount
                    value={bet.outcome === 'win' ? bet.payout - bet.amount : bet.amount}
                    size="xs"
                    signed
                    decimals={0}
                    className={cn('w-20 justify-end', bet.outcome === 'win' ? 'text-emerald-300' : 'text-rose-300/80')}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
