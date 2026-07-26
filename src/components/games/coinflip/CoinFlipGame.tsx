'use client';
/**
 * COIN FLIP — a true 3D CSS coin with NOVA / RIFT faces.
 * Pure 50/50 with the payout reduced by the house edge.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge, Button } from '@/components/ui';
import { BetPanel } from '../BetPanel';
import { GameShell } from '../GameShell';
import { WinBanner } from '../WinBanner';
import { CoinAmount } from '@/components/common/CoinAmount';
import { flipCoin, type CoinSide } from '@/lib/gameEngine';
import { HOUSE_EDGE } from '@/lib/constants';
import { useGamePlay, useSound } from '@/hooks';
import { useGameStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const PAYOUT = 2 * (1 - HOUSE_EDGE);

const SIDES: { id: CoinSide; label: string; glyph: string; accent: string; ring: string }[] = [
  { id: 'nova', label: 'Nova', glyph: '☀', accent: 'from-amber-300 to-orange-600', ring: 'border-amber-400/60 bg-amber-400/12 text-amber-200' },
  { id: 'rift', label: 'Rift', glyph: '◈', accent: 'from-cyan-400 to-violet-600', ring: 'border-cyan-400/60 bg-cyan-400/12 text-cyan-200' },
];

export function CoinFlipGame() {
  const { placeBet, settle } = useGamePlay('coinflip');
  const soundOn = useGameStore((s) => s.soundByGame['coinflip'] ?? true);
  const play = useSound(soundOn);

  const [amount, setAmount] = useState(100);
  const [choice, setChoice] = useState<CoinSide>('nova');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [banner, setBanner] = useState<{ payout: number; mult: number } | null>(null);
  const [streak, setStreak] = useState<CoinSide[]>(['nova', 'rift', 'rift', 'nova', 'rift']);

  const flip = () => {
    if (spinning || !placeBet(amount)) return;
    setSpinning(true);
    setResult(null);
    setBanner(null);
    play('spin');

    const outcome = flipCoin();
    // Land on the correct face: nova = 0deg, rift = 180deg (mod 360)
    const spins = 6 + Math.floor(Math.random() * 3);
    const target = rotation + spins * 360 + (outcome === 'rift' ? 180 : 0) - (rotation % 360);
    setRotation(target);

    setTimeout(() => {
      setSpinning(false);
      setResult(outcome);
      setStreak((s) => [outcome, ...s].slice(0, 12));
      const won = outcome === choice;
      const payout = won ? Number((amount * PAYOUT).toFixed(2)) : 0;
      settle({ amount, payout, multiplier: won ? PAYOUT : 0, detail: outcome });
      if (won) {
        setBanner({ payout, mult: PAYOUT });
        play('win');
        setTimeout(() => setBanner(null), 2_600);
      } else {
        play('lose');
      }
    }, 2_400);
  };

  const board = (
    <div className="relative flex flex-col items-center gap-8 py-6">
      {/* Streak */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {streak.map((s, i) => (
          <span
            key={i}
            className={cn(
              'grid size-7 place-items-center rounded-lg border text-xs font-bold',
              s === 'nova' ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
            )}
          >
            {s === 'nova' ? '☀' : '◈'}
          </span>
        ))}
      </div>

      {/* Coin */}
      <div className="perspective-1000 relative grid h-56 place-items-center sm:h-64">
        <motion.div
          className="preserve-3d relative size-40 sm:size-48"
          animate={{ rotateY: rotation }}
          transition={{ duration: 2.3, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {/* Nova face */}
          <div
            className="backface-hidden absolute inset-0 grid place-items-center rounded-full bg-gradient-to-br from-amber-300 via-orange-500 to-amber-600"
            style={{ boxShadow: '0 0 70px -10px rgba(251,191,36,0.85), inset 0 0 30px rgba(0,0,0,0.25)' }}
          >
            <div className="grid size-[85%] place-items-center rounded-full border-4 border-amber-200/50">
              <span className="text-5xl text-void-950 sm:text-6xl">☀</span>
            </div>
          </div>
          {/* Rift face */}
          <div
            className="backface-hidden absolute inset-0 grid place-items-center rounded-full bg-gradient-to-br from-cyan-300 via-blue-500 to-violet-600"
            style={{ transform: 'rotateY(180deg)', boxShadow: '0 0 70px -10px rgba(34,211,238,0.85), inset 0 0 30px rgba(0,0,0,0.25)' }}
          >
            <div className="grid size-[85%] place-items-center rounded-full border-4 border-cyan-100/50">
              <span className="text-5xl text-void-950 sm:text-6xl">◈</span>
            </div>
          </div>
        </motion.div>

        {/* Shadow */}
        <motion.div
          animate={{ scaleX: spinning ? [1, 0.7, 1] : 1, opacity: spinning ? [0.4, 0.2, 0.4] : 0.35 }}
          transition={{ duration: 0.6, repeat: spinning ? Infinity : 0 }}
          className="absolute bottom-2 h-3 w-32 rounded-full bg-cyan-500/30 blur-md"
        />
      </div>

      <div className="text-center">
        <p className="text-[11px] font-bold tracking-[0.24em] text-slate-500 uppercase">
          {spinning ? 'Flipping…' : result ? 'Result' : 'Choose a side'}
        </p>
        <p className={cn('font-display text-2xl font-black', result === choice ? 'text-emerald-300' : result ? 'text-rose-300' : 'text-white')}>
          {spinning ? '· · ·' : result ? result.toUpperCase() : choice.toUpperCase()}
        </p>
      </div>

      <WinBanner show={!!banner} payout={banner?.payout ?? 0} multiplier={banner?.mult ?? 1} />
    </div>
  );

  const controls = (
    <BetPanel amount={amount} onAmountChange={setAmount} disabled={spinning}>
      <div className="space-y-3 pt-1">
        <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Your pick</p>
        <div className="grid grid-cols-2 gap-2">
          {SIDES.map((s) => (
            <button
              key={s.id}
              disabled={spinning}
              onClick={() => setChoice(s.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border py-3 transition disabled:opacity-50',
                choice === s.id ? s.ring : 'border-white/8 bg-white/[0.02] text-slate-400 hover:text-slate-200',
              )}
            >
              <span className="text-2xl">{s.glyph}</span>
              <span className="text-xs font-bold">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-void-900/50 px-3 py-2 text-xs">
          <span className="text-slate-500">Payout on win</span>
          <CoinAmount value={amount * PAYOUT} size="sm" className="text-emerald-300" />
        </div>

        <Button size="lg" fullWidth loading={spinning} onClick={flip}>
          {spinning ? 'Flipping' : 'Flip the coin'}
        </Button>
      </div>
    </BetPanel>
  );

  const footer = (
    <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
      <Badge tone="amber">1.96× payout</Badge>
      <p className="text-xs text-slate-500">Fifty-fifty odds, 2% house edge. The face is decided before the animation starts.</p>
    </div>
  );

  return <GameShell gameId="coinflip" board={board} controls={controls} footer={footer} />;
}
