'use client';
/**
 * DICE — slider-driven win chance with over/under selection.
 * Roll is a float in [0, 100); payout = (100 / winChance) × (1 - edge).
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Dices } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { BetPanel } from '../BetPanel';
import { GameShell } from '../GameShell';
import { WinBanner } from '../WinBanner';
import { CoinAmount } from '@/components/common/CoinAmount';
import { diceMultiplier, rollDice } from '@/lib/gameEngine';
import { useGamePlay, useSound } from '@/hooks';
import { useGameStore } from '@/lib/store';
import { cn, formatMultiplier } from '@/lib/utils';

type Mode = 'over' | 'under';

export function DiceGame() {
  const { placeBet, settle } = useGamePlay('dice');
  const soundOn = useGameStore((s) => s.soundByGame['dice'] ?? true);
  const play = useSound(soundOn);

  const [amount, setAmount] = useState(100);
  const [threshold, setThreshold] = useState(50);
  const [mode, setMode] = useState<Mode>('over');
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [banner, setBanner] = useState<{ payout: number; mult: number } | null>(null);
  const [rolls, setRolls] = useState<{ value: number; win: boolean }[]>([]);

  const winChance = mode === 'over' ? 100 - threshold : threshold;
  const multiplier = diceMultiplier(winChance);

  const roll = () => {
    if (rolling || winChance < 1 || winChance > 95) return;
    if (!placeBet(amount)) return;
    setRolling(true);
    setBanner(null);
    play('spin');

    const outcome = rollDice();
    // Brief "spinning numbers" flourish before locking the value
    let ticks = 0;
    const spinner = setInterval(() => {
      setLastRoll(Number((Math.random() * 100).toFixed(2)));
      if (++ticks > 12) {
        clearInterval(spinner);
        setLastRoll(outcome);
        const isWin = mode === 'over' ? outcome > threshold : outcome < threshold;
        setWon(isWin);
        setRolling(false);
        setRolls((r) => [{ value: outcome, win: isWin }, ...r].slice(0, 12));
        const payout = isWin ? Number((amount * multiplier).toFixed(2)) : 0;
        settle({ amount, payout, multiplier: isWin ? multiplier : 0, detail: `${mode} ${threshold}` });
        if (isWin) {
          setBanner({ payout, mult: multiplier });
          play('win');
          setTimeout(() => setBanner(null), 2_400);
        } else {
          play('lose');
        }
      }
    }, 55);
  };

  const board = (
    <div className="relative space-y-8 py-4">
      {/* Roll readout */}
      <div className="text-center">
        <p className="text-[11px] font-bold tracking-[0.24em] text-slate-500 uppercase">Roll result</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={lastRoll ?? 'idle'}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              'font-display text-6xl font-black tabular-nums sm:text-7xl',
              rolling ? 'text-slate-400' : won === true ? 'text-emerald-300 text-glow-cyan' : won === false ? 'text-rose-400' : 'text-white',
            )}
          >
            {lastRoll !== null ? lastRoll.toFixed(2) : '00.00'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Track */}
      <div className="px-2">
        <div className="relative h-14">
          <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full bg-void-800 ring-1 ring-white/8">
            <div
              className={cn('absolute inset-y-0 rounded-full', mode === 'over' ? 'bg-gradient-to-r from-rose-500/70 to-rose-600/70' : 'bg-gradient-to-r from-emerald-400/70 to-teal-500/70')}
              style={{ left: 0, width: `${threshold}%` }}
            />
            <div
              className={cn('absolute inset-y-0 right-0 rounded-full', mode === 'over' ? 'bg-gradient-to-r from-emerald-400/70 to-teal-500/70' : 'bg-gradient-to-r from-rose-500/70 to-rose-600/70')}
              style={{ width: `${100 - threshold}%` }}
            />
          </div>

          {/* Threshold handle */}
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${threshold}%` }}>
            <div className="grid size-8 place-items-center rounded-lg border border-cyan-400/70 bg-void-900 text-[10px] font-bold text-cyan-300 shadow-[0_0_20px_-4px_rgba(34,211,238,0.9)]">
              {threshold}
            </div>
          </div>

          {/* Result marker */}
          <AnimatePresence>
            {lastRoll !== null && !rolling && (
              <motion.div
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 -translate-x-1/2"
                style={{ left: `${lastRoll}%` }}
              >
                <span className={cn('block size-2.5 rotate-45 rounded-sm', won ? 'bg-emerald-300' : 'bg-rose-400')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          type="range"
          min={2}
          max={98}
          value={threshold}
          disabled={rolling}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full cursor-pointer"
          aria-label="Threshold"
        />
        <div className="mt-1 flex justify-between text-[10px] font-mono text-slate-600">
          <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
      </div>

      {/* Recent rolls */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {rolls.map((r, i) => (
          <span
            key={i}
            className={cn(
              'rounded-lg border px-2 py-1 font-mono text-[11px] font-bold',
              r.win ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/30 bg-rose-400/10 text-rose-300',
            )}
          >
            {r.value.toFixed(2)}
          </span>
        ))}
      </div>

      <WinBanner show={!!banner} payout={banner?.payout ?? 0} multiplier={banner?.mult ?? 1} />
    </div>
  );

  const controls = (
    <BetPanel amount={amount} onAmountChange={setAmount} disabled={rolling}>
      <div className="space-y-3 pt-1">
        <div className="grid grid-cols-2 gap-2">
          {(['under', 'over'] as Mode[]).map((m) => (
            <button
              key={m}
              disabled={rolling}
              onClick={() => setMode(m)}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold uppercase transition disabled:opacity-50',
                mode === m ? 'border-cyan-400/60 bg-cyan-400/12 text-cyan-200' : 'border-white/8 text-slate-400 hover:text-slate-200',
              )}
            >
              {m === 'under' ? <ArrowDown className="size-3.5" /> : <ArrowUp className="size-3.5" />} {m} {threshold}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Win chance', value: `${winChance.toFixed(1)}%`, tone: 'text-cyan-300' },
            { label: 'Multiplier', value: formatMultiplier(multiplier), tone: 'text-violet-300' },
            { label: 'Profit', value: `+${((amount * multiplier) - amount).toFixed(0)}`, tone: 'text-emerald-300' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/8 bg-void-900/60 px-2 py-2 text-center">
              <p className="text-[9px] tracking-wider text-slate-500 uppercase">{s.label}</p>
              <p className={cn('font-mono text-xs font-bold', s.tone)}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/8 bg-void-900/50 px-3 py-2 text-xs">
          <span className="text-slate-500">Payout on win</span>
          <CoinAmount value={amount * multiplier} size="sm" className="text-emerald-300" />
        </div>

        <Button size="lg" fullWidth loading={rolling} icon={<Dices className="size-4" />} onClick={roll}>
          Roll dice
        </Button>
      </div>
    </BetPanel>
  );

  const footer = (
    <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
      <Badge tone="cyan">{winChance.toFixed(1)}% win chance</Badge>
      <p className="text-xs text-slate-500">Drag the slider to trade frequency for magnitude — up to 49× at 2% chance.</p>
    </div>
  );

  return <GameShell gameId="dice" board={board} controls={controls} footer={footer} />;
}
