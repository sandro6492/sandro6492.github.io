'use client';
/**
 * CRASH — a rising multiplier with an animated rocket trail.
 *
 * Round lifecycle: waiting (countdown) → running (multiplier climbs) →
 * crashed (2.5s hold) → waiting. The crash point is drawn up-front from the
 * standard 0.99/(1-r) distribution and never mutated mid-round.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Rocket, TrendingUp, Zap } from 'lucide-react';
import { Badge, Button, Toggle } from '@/components/ui';
import { BetPanel } from '../BetPanel';
import { GameShell } from '../GameShell';
import { WinBanner } from '../WinBanner';
import { CoinAmount } from '@/components/common/CoinAmount';
import { crashPoint } from '@/lib/gameEngine';
import { useGamePlay, useSound } from '@/hooks';
import { useGameStore } from '@/lib/store';
import { cn, formatMultiplier } from '@/lib/utils';

type Phase = 'waiting' | 'running' | 'crashed';

const TICK_MS = 60;
const WAIT_MS = 5_000;

export function CrashGame() {
  const { placeBet, settle } = useGamePlay('crash');
  const soundOn = useGameStore((s) => s.soundByGame['crash'] ?? true);
  const play = useSound(soundOn);

  const [phase, setPhase] = useState<Phase>('waiting');
  const [multiplier, setMultiplier] = useState(1);
  const [countdown, setCountdown] = useState(WAIT_MS);
  const [history, setHistory] = useState<number[]>([2.31, 1.04, 8.77, 1.52, 3.19, 1.21, 24.6, 1.87]);

  const [amount, setAmount] = useState(100);
  const [autoCashout, setAutoCashout] = useState(2);
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [inRound, setInRound] = useState(false);
  const [queued, setQueued] = useState(false);
  const [cashedAt, setCashedAt] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ payout: number; mult: number } | null>(null);

  const crashRef = useRef(1);
  const stakeRef = useRef(0);
  const inRoundRef = useRef(false);
  const autoRef = useRef({ enabled: autoEnabled, target: autoCashout });
  autoRef.current = { enabled: autoEnabled, target: autoCashout };

  /** Cash out at the current multiplier. */
  const cashOut = useCallback(
    (atMultiplier: number) => {
      if (!inRoundRef.current) return;
      inRoundRef.current = false;
      setInRound(false);
      setCashedAt(atMultiplier);
      const payout = Number((stakeRef.current * atMultiplier).toFixed(2));
      settle({ amount: stakeRef.current, payout, multiplier: atMultiplier, detail: `escaped @ ${atMultiplier.toFixed(2)}×` });
      setBanner({ payout, mult: atMultiplier });
      play('cash');
      setTimeout(() => setBanner(null), 2_600);
    },
    [settle, play],
  );

  /* ------------------------------ Round engine ----------------------------- */
  useEffect(() => {
    if (phase !== 'waiting') return;
    setMultiplier(1);
    setCashedAt(null);
    const started = Date.now();
    const timer = setInterval(() => {
      const left = WAIT_MS - (Date.now() - started);
      setCountdown(Math.max(0, left));
      if (left <= 0) {
        clearInterval(timer);
        crashRef.current = crashPoint();
        setPhase('running');
      }
    }, 80);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'running') return;
    // Queued bet becomes active exactly at launch
    if (queued) {
      setQueued(false);
      inRoundRef.current = true;
      setInRound(true);
    }
    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = (Date.now() - started) / 1000;
      const value = Number(Math.pow(Math.E, 0.11 * elapsed * 1.9).toFixed(2));

      if (value >= crashRef.current) {
        setMultiplier(crashRef.current);
        clearInterval(timer);
        setPhase('crashed');
        setHistory((h) => [crashRef.current, ...h].slice(0, 14));
        if (inRoundRef.current) {
          inRoundRef.current = false;
          setInRound(false);
          settle({ amount: stakeRef.current, payout: 0, multiplier: 0, detail: `busted @ ${crashRef.current.toFixed(2)}×` });
          play('lose');
        }
        setTimeout(() => setPhase('waiting'), 2_600);
        return;
      }

      setMultiplier(value);
      if (Math.round(value * 100) % 25 === 0) play('tick');
      const { enabled, target } = autoRef.current;
      if (enabled && inRoundRef.current && value >= target) cashOut(Number(target.toFixed(2)));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [phase, queued, settle, cashOut, play]);

  /* -------------------------------- Actions -------------------------------- */
  const joinRound = () => {
    if (!placeBet(amount)) return;
    stakeRef.current = amount;
    play('click');
    if (phase === 'running') {
      inRoundRef.current = true;
      setInRound(true);
    } else {
      setQueued(true);
    }
  };

  /* --------------------------------- Board --------------------------------- */
  const progress = Math.min(1, (multiplier - 1) / 9);
  const crashed = phase === 'crashed';

  const board = (
    <div className="relative">
      {/* History strip */}
      <div className="mask-fade-x mb-4 flex gap-1.5 overflow-hidden">
        {history.map((h, i) => (
          <span
            key={`${h}-${i}`}
            className={cn(
              'shrink-0 rounded-lg border px-2 py-1 font-mono text-[11px] font-bold',
              h >= 10
                ? 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300'
                : h >= 2
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                  : 'border-rose-400/30 bg-rose-400/10 text-rose-300',
            )}
          >
            {h.toFixed(2)}×
          </span>
        ))}
      </div>

      {/* Chart */}
      <div className="relative h-[19rem] overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-void-900/80 to-void-950 sm:h-[24rem]">
        <div className="grid-bg absolute inset-0 opacity-50" />

        {/* Axis labels */}
        <div className="absolute inset-y-4 left-3 flex flex-col-reverse justify-between text-[10px] font-mono text-slate-600">
          {['1×', '2×', '4×', '7×', '10×'].map((l) => <span key={l}>{l}</span>)}
        </div>

        <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="crashFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={crashed ? '#f43f5e' : '#22d3ee'} stopOpacity="0.35" />
              <stop offset="100%" stopColor={crashed ? '#f43f5e' : '#22d3ee'} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="crashLine" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor={crashed ? '#f43f5e' : '#a78bfa'} />
            </linearGradient>
          </defs>
          {/* Exponential curve up to the current progress */}
          <path
            d={`M0,100 ${Array.from({ length: 40 }, (_, i) => {
              const t = (i / 39) * progress;
              return `L${t * 100},${100 - Math.pow(t, 0.72) * 96}`;
            }).join(' ')} L${progress * 100},100 Z`}
            fill="url(#crashFill)"
          />
          <path
            d={`M0,100 ${Array.from({ length: 40 }, (_, i) => {
              const t = (i / 39) * progress;
              return `L${t * 100},${100 - Math.pow(t, 0.72) * 96}`;
            }).join(' ')}`}
            fill="none"
            stroke="url(#crashLine)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 3 }}
          />
        </svg>

        {/* Rocket */}
        <motion.div
          className="absolute"
          animate={{
            left: `${progress * 92}%`,
            bottom: `${Math.pow(progress, 0.72) * 88}%`,
            rotate: crashed ? 100 : -38,
            opacity: crashed ? 0 : 1,
            scale: crashed ? 0.6 : 1,
          }}
          transition={{ type: 'tween', duration: 0.14, ease: 'linear' }}
        >
          <span className={cn('grid size-10 place-items-center rounded-full', crashed ? 'text-rose-400' : 'text-cyan-300')}>
            <Rocket className="size-7 drop-shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
          </span>
        </motion.div>

        {/* Center readout */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <AnimatePresence mode="wait">
              {phase === 'waiting' ? (
                <motion.div key="wait" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-[11px] font-bold tracking-[0.24em] text-slate-500 uppercase">Next launch in</p>
                  <p className="font-display text-5xl font-black text-white">{(countdown / 1000).toFixed(1)}s</p>
                  <p className="mt-1 text-xs text-slate-500">{queued ? 'Bet queued for launch' : 'Place your bet'}</p>
                </motion.div>
              ) : (
                <motion.div key="run" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <motion.p
                    animate={crashed ? { scale: [1, 1.12, 1] } : {}}
                    className={cn(
                      'font-display text-6xl font-black tabular-nums sm:text-7xl',
                      crashed ? 'text-rose-400 text-glow-violet' : 'text-white text-glow-cyan',
                    )}
                  >
                    {multiplier.toFixed(2)}×
                  </motion.p>
                  <p className={cn('mt-1 text-xs font-bold tracking-[0.2em] uppercase', crashed ? 'text-rose-400' : 'text-cyan-300')}>
                    {crashed ? 'Rift collapsed' : cashedAt ? `Cashed @ ${cashedAt.toFixed(2)}×` : 'Climbing'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <WinBanner show={!!banner} payout={banner?.payout ?? 0} multiplier={banner?.mult ?? 1} label="Escaped" />
      </div>
    </div>
  );

  /* ------------------------------- Controls -------------------------------- */
  const potentialPayout = amount * (inRound ? multiplier : autoCashout);

  const controls = (
    <div className="space-y-4">
      <BetPanel amount={amount} onAmountChange={setAmount} disabled={inRound || queued}>
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-void-900/60 px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Zap className="size-3.5 text-amber-400" /> Auto cash out
            </span>
            <Toggle checked={autoEnabled} onChange={setAutoEnabled} size="sm" label="Auto cash out" />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-void-900/70 px-3">
            <TrendingUp className="size-3.5 shrink-0 text-cyan-300" />
            <input
              type="number"
              step="0.1"
              min="1.01"
              value={autoCashout}
              onChange={(e) => setAutoCashout(Math.max(1.01, Number(e.target.value)))}
              className="h-10 w-full bg-transparent text-sm font-semibold tabular-nums text-white focus:outline-none"
            />
            <span className="text-xs font-bold text-slate-500">×</span>
          </div>

          {inRound ? (
            <Button variant="success" size="lg" fullWidth onClick={() => cashOut(multiplier)}>
              Cash out {formatMultiplier(multiplier)}
            </Button>
          ) : (
            <Button size="lg" fullWidth disabled={queued} onClick={joinRound}>
              {queued ? 'Waiting for launch…' : phase === 'running' ? 'Join mid-flight' : 'Place bet'}
            </Button>
          )}

          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-void-900/40 px-3 py-2 text-xs">
            <span className="text-slate-500">Potential payout</span>
            <CoinAmount value={potentialPayout} size="sm" className="text-emerald-300" />
          </div>
        </div>
      </BetPanel>
    </div>
  );

  const footer = (
    <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
      <Badge tone={crashed ? 'rose' : phase === 'running' ? 'emerald' : 'cyan'} pulse>
        {crashed ? 'Crashed' : phase === 'running' ? 'In flight' : 'Boarding'}
      </Badge>
      <p className="text-xs text-slate-500">
        House edge 2% · Bust chance at 1.00× equals the edge · Auto cash out executes client-side at your target.
      </p>
    </div>
  );

  return <GameShell gameId="crash" board={board} controls={controls} footer={footer} />;
}
