'use client';
/**
 * TOWERS — climb one row at a time, each row hides a single core.
 * Difficulty controls the column count (and therefore the multiplier curve).
 */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bomb, HandCoins, Shield, Star } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { BetPanel } from '../BetPanel';
import { GameShell } from '../GameShell';
import { WinBanner } from '../WinBanner';
import { CoinAmount } from '@/components/common/CoinAmount';
import { TOWER_DIFFICULTY, generateTowerField, towerMultipliers } from '@/lib/gameEngine';
import { useGamePlay, useSound } from '@/hooks';
import { useGameStore } from '@/lib/store';
import { cn, formatMultiplier } from '@/lib/utils';

type Difficulty = keyof typeof TOWER_DIFFICULTY;

const LABELS: Record<Difficulty, { label: string; tone: string }> = {
  easy: { label: 'Easy · 1 in 4', tone: 'border-emerald-400/60 bg-emerald-400/12 text-emerald-200' },
  medium: { label: 'Medium · 1 in 3', tone: 'border-amber-400/60 bg-amber-400/12 text-amber-200' },
  hard: { label: 'Hard · 1 in 2', tone: 'border-rose-400/60 bg-rose-400/12 text-rose-200' },
};

export function TowersGame() {
  const { placeBet, settle } = useGamePlay('towers');
  const soundOn = useGameStore((s) => s.soundByGame['towers'] ?? true);
  const play = useSound(soundOn);

  const [amount, setAmount] = useState(100);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const cfg = TOWER_DIFFICULTY[difficulty];
  const multipliers = useMemo(() => towerMultipliers(cfg), [cfg]);

  const [field, setField] = useState<number[]>([]);
  const [level, setLevel] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [active, setActive] = useState(false);
  const [busted, setBusted] = useState(false);
  const [banner, setBanner] = useState<{ payout: number; mult: number } | null>(null);

  const currentMult = level === 0 ? 1 : multipliers[level - 1];

  const start = () => {
    if (!placeBet(amount)) return;
    setField(generateTowerField(cfg));
    setLevel(0);
    setPicks([]);
    setActive(true);
    setBusted(false);
    setBanner(null);
    play('click');
  };

  const cashOut = () => {
    if (!active || level === 0) return;
    const payout = Number((amount * currentMult).toFixed(2));
    settle({ amount, payout, multiplier: currentMult, detail: `${level} floors · ${difficulty}` });
    setActive(false);
    setBanner({ payout, mult: currentMult });
    play('cash');
    setTimeout(() => setBanner(null), 2_800);
  };

  const choose = (row: number, col: number) => {
    if (!active || row !== level) return;
    setPicks((p) => [...p, col]);

    if (field[row] === col) {
      setBusted(true);
      setActive(false);
      settle({ amount, payout: 0, multiplier: 0, detail: `fell at floor ${row + 1}` });
      play('lose');
      return;
    }

    const next = level + 1;
    setLevel(next);
    play('reveal');

    if (next === cfg.rows) {
      const mult = multipliers[cfg.rows - 1];
      const payout = Number((amount * mult).toFixed(2));
      settle({ amount, payout, multiplier: mult, detail: `summit · ${difficulty}` });
      setActive(false);
      setBanner({ payout, mult });
      setTimeout(() => setBanner(null), 3_400);
    }
  };

  const board = (
    <div className="relative">
      <div className="mx-auto flex max-w-md flex-col-reverse gap-1.5">
        {Array.from({ length: cfg.rows }, (_, row) => {
          const isCurrent = active && row === level;
          const isPassed = row < level;
          const isRevealed = busted || (!active && level === cfg.rows);

          return (
            <div key={row} className="flex items-center gap-2">
              <span
                className={cn(
                  'w-14 shrink-0 rounded-lg border px-1.5 py-1 text-center font-mono text-[10px] font-bold',
                  isCurrent
                    ? 'border-cyan-400/60 bg-cyan-400/12 text-cyan-200'
                    : isPassed
                      ? 'border-emerald-400/30 bg-emerald-400/8 text-emerald-300'
                      : 'border-white/8 text-slate-600',
                )}
              >
                {formatMultiplier(multipliers[row])}
              </span>

              <div className="grid flex-1 gap-1.5" style={{ gridTemplateColumns: `repeat(${cfg.cols}, minmax(0,1fr))` }}>
                {Array.from({ length: cfg.cols }, (_, col) => {
                  const isBomb = field[row] === col;
                  const picked = picks[row] === col;
                  const showBomb = isRevealed && isBomb;
                  const showSafe = (isPassed && picked) || (isRevealed && !isBomb && picked);

                  return (
                    <motion.button
                      key={col}
                      onClick={() => choose(row, col)}
                      disabled={!isCurrent}
                      whileHover={isCurrent ? { scale: 1.04, y: -2 } : undefined}
                      whileTap={isCurrent ? { scale: 0.96 } : undefined}
                      className={cn(
                        'relative grid h-11 place-items-center rounded-xl border transition-colors sm:h-12',
                        showSafe && 'border-emerald-400/50 bg-emerald-400/12',
                        showBomb && 'border-rose-500/60 bg-rose-500/15',
                        isCurrent && !showSafe && !showBomb && 'border-cyan-400/40 bg-void-800 hover:border-cyan-300/80 hover:bg-cyan-400/8',
                        !isCurrent && !showSafe && !showBomb && 'border-white/6 bg-white/[0.015] opacity-45',
                      )}
                    >
                      <AnimatePresence>
                        {showSafe && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Star className="size-4 text-emerald-300" />
                          </motion.span>
                        )}
                        {showBomb && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Bomb className="size-4 text-rose-400" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isCurrent && !showSafe && !showBomb && (
                        <motion.span
                          animate={{ opacity: [0.35, 1, 0.35] }}
                          transition={{ duration: 1.8, repeat: Infinity }}
                          className="size-1.5 rounded-full bg-cyan-300"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <WinBanner show={!!banner} payout={banner?.payout ?? 0} multiplier={banner?.mult ?? 1} />
    </div>
  );

  const controls = (
    <BetPanel amount={amount} onAmountChange={setAmount} disabled={active}>
      <div className="space-y-3 pt-1">
        <div>
          <p className="mb-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Difficulty</p>
          <div className="space-y-1.5">
            {(Object.keys(TOWER_DIFFICULTY) as Difficulty[]).map((d) => (
              <button
                key={d}
                disabled={active}
                onClick={() => setDifficulty(d)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold transition disabled:opacity-40',
                  difficulty === d ? LABELS[d].tone : 'border-white/8 text-slate-400 hover:text-slate-200',
                )}
              >
                {LABELS[d].label}
                <span className="font-mono text-[10px] opacity-70">max {formatMultiplier(towerMultipliers(TOWER_DIFFICULTY[d])[7])}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/8 bg-void-900/60 px-3 py-2">
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">Floor</p>
            <p className="font-mono text-sm font-bold text-cyan-300">{level}/{cfg.rows}</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-void-900/60 px-3 py-2">
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">Multiplier</p>
            <p className="font-mono text-sm font-bold text-violet-300">{formatMultiplier(currentMult)}</p>
          </div>
        </div>

        {active ? (
          <Button variant="success" size="lg" fullWidth disabled={level === 0} icon={<HandCoins className="size-4" />} onClick={cashOut}>
            Cash out <CoinAmount value={amount * currentMult} size="sm" className="ml-1 text-void-950" />
          </Button>
        ) : (
          <Button size="lg" fullWidth icon={<Shield className="size-4" />} onClick={start}>
            Start climb
          </Button>
        )}
      </div>
    </BetPanel>
  );

  const footer = (
    <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
      <Badge tone={busted ? 'rose' : active ? 'emerald' : 'cyan'}>{busted ? 'Fell' : active ? `Floor ${level + 1}` : 'Ready'}</Badge>
      <p className="text-xs text-slate-500">One core per floor. Bank your climb before the tower bites back.</p>
    </div>
  );

  return <GameShell gameId="towers" board={board} controls={controls} footer={footer} />;
}
