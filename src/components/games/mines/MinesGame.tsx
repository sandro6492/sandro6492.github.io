'use client';
/**
 * MINES — 5×5 grid, configurable mine count, escalating multiplier and a
 * cash-out at any point. The field is generated at round start and only
 * revealed tile-by-tile so the maths stays honest.
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bomb, Gem, HandCoins, RotateCcw } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { BetPanel } from '../BetPanel';
import { GameShell } from '../GameShell';
import { WinBanner } from '../WinBanner';
import { CoinAmount } from '@/components/common/CoinAmount';
import { generateMineField, minesMultiplier } from '@/lib/gameEngine';
import { useGamePlay, useSound } from '@/hooks';
import { useGameStore } from '@/lib/store';
import { cn, formatMultiplier } from '@/lib/utils';

const TILES = 25;
const MINE_OPTIONS = [1, 3, 5, 10, 15, 24];

export function MinesGame() {
  const { placeBet, settle } = useGamePlay('mines');
  const soundOn = useGameStore((s) => s.soundByGame['mines'] ?? true);
  const play = useSound(soundOn);

  const [amount, setAmount] = useState(100);
  const [mines, setMines] = useState(3);
  const [field, setField] = useState<boolean[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [active, setActive] = useState(false);
  const [busted, setBusted] = useState(false);
  const [banner, setBanner] = useState<{ payout: number; mult: number } | null>(null);

  const safeCount = revealed.length;
  const currentMult = minesMultiplier(TILES, mines, safeCount);
  const nextMult = minesMultiplier(TILES, mines, safeCount + 1);
  const maxSafe = TILES - mines;

  const start = () => {
    if (!placeBet(amount)) return;
    setField(generateMineField(TILES, mines));
    setRevealed([]);
    setBusted(false);
    setBanner(null);
    setActive(true);
    play('click');
  };

  const cashOut = (auto = false) => {
    if (!active || safeCount === 0) return;
    const payout = Number((amount * currentMult).toFixed(2));
    settle({ amount, payout, multiplier: currentMult, detail: `${mines} mines · ${safeCount} tiles` });
    setActive(false);
    setBanner({ payout, mult: currentMult });
    play('cash');
    if (!auto) setTimeout(() => setBanner(null), 2_800);
  };

  const reveal = (index: number) => {
    if (!active || revealed.includes(index)) return;

    if (field[index]) {
      // Hit a mine — bust the round and expose the full board
      setBusted(true);
      setActive(false);
      settle({ amount, payout: 0, multiplier: 0, detail: `${mines} mines · ${safeCount} tiles` });
      play('lose');
      return;
    }

    const next = [...revealed, index];
    setRevealed(next);
    play('reveal');

    // Cleared every safe tile — force a max win
    if (next.length === maxSafe) {
      const mult = minesMultiplier(TILES, mines, next.length);
      const payout = Number((amount * mult).toFixed(2));
      settle({ amount, payout, multiplier: mult, detail: `perfect clear · ${mines} mines` });
      setActive(false);
      setBanner({ payout, mult });
      setTimeout(() => setBanner(null), 3_200);
    }
  };

  const reset = () => {
    setField([]);
    setRevealed([]);
    setActive(false);
    setBusted(false);
    setBanner(null);
  };

  const board = (
    <div className="relative">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-2 sm:gap-2.5">
        {Array.from({ length: TILES }, (_, i) => {
          const isRevealed = revealed.includes(i);
          const isMine = field[i];
          const exposed = busted && isMine;
          const dimmed = busted && !isRevealed && !isMine;

          return (
            <motion.button
              key={i}
              onClick={() => reveal(i)}
              disabled={!active || isRevealed}
              whileHover={active && !isRevealed ? { scale: 1.06, y: -3 } : undefined}
              whileTap={active && !isRevealed ? { scale: 0.94 } : undefined}
              animate={exposed ? { rotate: [0, -6, 6, 0] } : {}}
              className={cn(
                'relative aspect-square rounded-xl border transition-colors',
                isRevealed && 'border-emerald-400/50 bg-emerald-400/12',
                exposed && 'border-rose-500/60 bg-rose-500/15',
                dimmed && 'border-white/5 bg-white/[0.015] opacity-40',
                !isRevealed && !exposed && !dimmed && 'border-white/10 bg-gradient-to-b from-void-800 to-void-900 hover:border-cyan-400/50',
                !active && !isRevealed && !busted && 'opacity-70',
              )}
            >
              <AnimatePresence>
                {(isRevealed || exposed) && (
                  <motion.span
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    className="absolute inset-0 grid place-items-center"
                  >
                    {isRevealed ? (
                      <Gem className="size-6 text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)] sm:size-7" />
                    ) : (
                      <Bomb className="size-6 text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.9)] sm:size-7" />
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
              {!isRevealed && !exposed && (
                <span className="absolute inset-0 grid place-items-center text-slate-700 transition group-hover:text-cyan-400">
                  <span className="size-1.5 rounded-full bg-current" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <WinBanner show={!!banner} payout={banner?.payout ?? 0} multiplier={banner?.mult ?? 1} />

      <AnimatePresence>
        {busted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-5 flex max-w-lg items-center justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-rose-300">
              <Bomb className="size-4" /> Core detonated at {safeCount} tiles
            </span>
            <Button variant="secondary" size="sm" icon={<RotateCcw className="size-3.5" />} onClick={reset}>
              New board
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const controls = (
    <div className="space-y-4">
      <BetPanel amount={amount} onAmountChange={setAmount} disabled={active}>
        <div className="space-y-3 pt-1">
          <div>
            <p className="mb-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Mines</p>
            <div className="grid grid-cols-6 gap-1.5">
              {MINE_OPTIONS.map((m) => (
                <button
                  key={m}
                  disabled={active}
                  onClick={() => setMines(m)}
                  className={cn(
                    'rounded-lg border py-1.5 text-[11px] font-bold transition disabled:opacity-40',
                    mines === m
                      ? 'border-fuchsia-400/60 bg-fuchsia-400/15 text-fuchsia-200'
                      : 'border-white/8 text-slate-400 hover:text-slate-200',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/8 bg-void-900/60 px-3 py-2">
              <p className="text-[10px] tracking-wider text-slate-500 uppercase">Current</p>
              <p className="font-mono text-sm font-bold text-cyan-300">{formatMultiplier(currentMult)}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-void-900/60 px-3 py-2">
              <p className="text-[10px] tracking-wider text-slate-500 uppercase">Next tile</p>
              <p className="font-mono text-sm font-bold text-violet-300">{formatMultiplier(nextMult)}</p>
            </div>
          </div>

          {active ? (
            <Button
              variant="success"
              size="lg"
              fullWidth
              disabled={safeCount === 0}
              icon={<HandCoins className="size-4" />}
              onClick={() => cashOut()}
            >
              Cash out <CoinAmount value={amount * currentMult} size="sm" className="ml-1 text-void-950" />
            </Button>
          ) : (
            <Button size="lg" fullWidth onClick={start}>Start round</Button>
          )}
        </div>
      </BetPanel>
    </div>
  );

  const footer = (
    <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
      <div className="flex gap-2">
        <Badge tone="emerald">{safeCount} safe</Badge>
        <Badge tone="rose">{mines} mines</Badge>
        <Badge tone="slate">{maxSafe - safeCount} left</Badge>
      </div>
      <p className="text-xs text-slate-500">Multiplier scales with remaining safe tiles — cash out before the core finds you.</p>
    </div>
  );

  return <GameShell gameId="mines" board={board} controls={controls} footer={footer} />;
}
