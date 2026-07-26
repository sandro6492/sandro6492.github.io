'use client';
/**
 * WHEEL — 24-segment multiplier wheel rendered with conic-gradient + SVG ticks.
 * The winning segment is chosen first, then the rotation is solved to land on it.
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Disc3 } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { BetPanel } from '../BetPanel';
import { GameShell } from '../GameShell';
import { WinBanner } from '../WinBanner';
import { CoinAmount } from '@/components/common/CoinAmount';
import { WHEEL_SEGMENTS, spinWheel } from '@/lib/gameEngine';
import { useGamePlay, useSound } from '@/hooks';
import { useGameStore } from '@/lib/store';
import { cn, formatMultiplier } from '@/lib/utils';

const SEG_ANGLE = 360 / WHEEL_SEGMENTS.length;

export function WheelGame() {
  const { placeBet, settle } = useGamePlay('wheel');
  const soundOn = useGameStore((s) => s.soundByGame['wheel'] ?? true);
  const play = useSound(soundOn);

  const [amount, setAmount] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [last, setLast] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([2, 1.5, 3, 1.5, 5, 1.5, 2]);
  const [banner, setBanner] = useState<{ payout: number; mult: number } | null>(null);

  /** conic-gradient string built once from the segment table. */
  const gradient = useMemo(
    () =>
      `conic-gradient(${WHEEL_SEGMENTS.map(
        (s, i) => `${s.color} ${i * SEG_ANGLE}deg ${(i + 1) * SEG_ANGLE}deg`,
      ).join(', ')})`,
    [],
  );

  const spin = () => {
    if (spinning || !placeBet(amount)) return;
    setSpinning(true);
    setBanner(null);
    play('spin');

    const winner = spinWheel();
    // Land the winning segment's centre under the top pointer
    const targetAngle = 360 - (winner.id * SEG_ANGLE + SEG_ANGLE / 2);
    const spins = 5 + Math.floor(Math.random() * 3);
    const next = rotation + spins * 360 + ((targetAngle - (rotation % 360)) + 360) % 360;
    setRotation(next);

    setTimeout(() => {
      setSpinning(false);
      setLast(winner.multiplier);
      setHistory((h) => [winner.multiplier, ...h].slice(0, 12));
      const payout = Number((amount * winner.multiplier).toFixed(2));
      settle({ amount, payout, multiplier: winner.multiplier, detail: `${winner.multiplier}× segment` });
      if (payout > amount) {
        setBanner({ payout, mult: winner.multiplier });
        play('win');
        setTimeout(() => setBanner(null), 2_800);
      } else {
        play('lose');
      }
    }, 4_300);
  };

  const board = (
    <div className="relative flex flex-col items-center gap-6 py-4">
      {/* History */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {history.map((m, i) => (
          <span
            key={i}
            className={cn(
              'rounded-lg border px-2 py-1 font-mono text-[11px] font-bold',
              m >= 10 ? 'border-rose-400/40 bg-rose-400/10 text-rose-300'
                : m >= 3 ? 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300'
                : 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
            )}
          >
            {m}×
          </span>
        ))}
      </div>

      {/* Wheel */}
      <div className="relative aspect-square w-full max-w-sm">
        {/* Pointer */}
        <div className="absolute -top-1 left-1/2 z-20 -translate-x-1/2">
          <div className="size-0 border-x-[11px] border-t-[20px] border-x-transparent border-t-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
        </div>

        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ rotate: rotation }}
          transition={{ duration: 4.2, ease: [0.16, 1, 0.24, 1] }}
          style={{ background: gradient, boxShadow: '0 0 80px -18px rgba(34,211,238,0.8), inset 0 0 60px rgba(0,0,0,0.45)' }}
        >
          {/* Segment labels */}
          {WHEEL_SEGMENTS.map((s, i) => (
            <span
              key={s.id}
              className="absolute top-1/2 left-1/2 origin-left text-[10px] font-black text-void-950/80"
              style={{ transform: `rotate(${i * SEG_ANGLE + SEG_ANGLE / 2 - 90}deg) translateX(6.2rem)` }}
            >
              {s.multiplier}×
            </span>
          ))}
        </motion.div>

        {/* Rim + hub */}
        <div className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-void-900/80" />
        <div className="pointer-events-none absolute inset-3 rounded-full ring-1 ring-white/10" />
        <div className="absolute top-1/2 left-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-void-950/95 backdrop-blur">
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase">{spinning ? 'Spinning' : 'Last'}</p>
            <p className={cn('font-display text-2xl font-black', last && last >= 3 ? 'text-fuchsia-300' : 'text-white')}>
              {spinning ? '···' : last ? `${last}×` : '—'}
            </p>
          </div>
        </div>
      </div>

      <WinBanner show={!!banner} payout={banner?.payout ?? 0} multiplier={banner?.mult ?? 1} />
    </div>
  );

  const uniqueMultipliers = [...new Set(WHEEL_SEGMENTS.map((s) => s.multiplier))].sort((a, b) => a - b);

  const controls = (
    <BetPanel amount={amount} onAmountChange={setAmount} disabled={spinning}>
      <div className="space-y-3 pt-1">
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Segment payouts</p>
          <div className="grid grid-cols-3 gap-1.5">
            {uniqueMultipliers.map((m) => {
              const count = WHEEL_SEGMENTS.filter((s) => s.multiplier === m).length;
              const color = WHEEL_SEGMENTS.find((s) => s.multiplier === m)!.color;
              return (
                <div key={m} className="rounded-lg border border-white/8 bg-void-900/60 px-2 py-1.5 text-center">
                  <span className="mx-auto mb-1 block size-1.5 rounded-full" style={{ background: color }} />
                  <p className="font-mono text-[11px] font-bold text-slate-200">{m}×</p>
                  <p className="text-[9px] text-slate-500">{((count / 24) * 100).toFixed(0)}%</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-void-900/50 px-3 py-2 text-xs">
          <span className="text-slate-500">Max payout (50×)</span>
          <CoinAmount value={amount * 50} size="sm" decimals={0} className="text-fuchsia-300" />
        </div>

        <Button size="lg" fullWidth loading={spinning} icon={<Disc3 className="size-4" />} onClick={spin}>
          Spin the wheel
        </Button>
      </div>
    </BetPanel>
  );

  const footer = (
    <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
      <Badge tone="fuchsia">24 segments</Badge>
      <p className="text-xs text-slate-500">
        Segment weighting keeps the expected return just under 1.00 — {formatMultiplier(50)} appears once per rotation.
      </p>
    </div>
  );

  return <GameShell gameId="wheel" board={board} controls={controls} footer={footer} />;
}
