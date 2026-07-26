'use client';
/**
 * Shared bet-amount control used by every game: quick chips, ½/2×/max,
 * balance awareness and a slot for the game's primary action.
 */
import type { ReactNode } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui';
import { CoinAmount } from '@/components/common/CoinAmount';
import { QUICK_BETS } from '@/lib/constants';
import { useUserStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface BetPanelProps {
  amount: number;
  onAmountChange: (value: number) => void;
  disabled?: boolean;
  children?: ReactNode;
  extra?: ReactNode;
  max?: number;
}

export function BetPanel({ amount, onAmountChange, disabled, children, extra, max }: BetPanelProps) {
  const balance = useUserStore((s) => s.user?.balance ?? 0);
  const ceiling = max ?? balance;

  const set = (v: number) => onAmountChange(Math.max(1, Math.min(ceiling || v, Math.round(v * 100) / 100)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Bet amount</span>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Wallet className="size-3.5" />
          <CoinAmount value={balance} size="xs" className="text-slate-300" />
        </span>
      </div>

      <div className={cn('flex items-center gap-2 rounded-xl border border-white/10 bg-void-900/70 px-3 transition focus-within:border-cyan-400/60', disabled && 'opacity-60')}>
        <span className="size-3 shrink-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-500" />
        <input
          type="number"
          min={1}
          value={Number.isFinite(amount) ? amount : ''}
          disabled={disabled}
          onChange={(e) => set(Number(e.target.value))}
          className="h-11 w-full bg-transparent text-sm font-semibold tabular-nums text-white focus:outline-none"
        />
        <div className="flex shrink-0 gap-1">
          {[
            { label: '½', fn: () => set(amount / 2) },
            { label: '2×', fn: () => set(amount * 2) },
            { label: 'MAX', fn: () => set(ceiling) },
          ].map((b) => (
            <button
              key={b.label}
              onClick={b.fn}
              disabled={disabled}
              className="rounded-md bg-white/5 px-2 py-1 text-[11px] font-bold text-slate-300 transition hover:bg-cyan-400/15 hover:text-cyan-200 disabled:opacity-50"
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {QUICK_BETS.map((v) => (
          <button
            key={v}
            onClick={() => set(v)}
            disabled={disabled}
            className={cn(
              'rounded-lg border py-1.5 text-[11px] font-bold transition disabled:opacity-50',
              amount === v
                ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200'
                : 'border-white/8 bg-white/[0.03] text-slate-400 hover:border-cyan-400/30 hover:text-slate-200',
            )}
          >
            {v >= 1000 ? `${v / 1000}K` : v}
          </button>
        ))}
      </div>

      {extra}
      {children}
    </div>
  );
}

export { Button };
