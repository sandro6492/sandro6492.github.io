'use client';
/**
 * JACKPOT — shared pot, weighted by contribution. A live timer counts down,
 * bots trickle in, then a horizontal ticket reel selects the winner.
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Timer, Trophy, Users } from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui';
import { BetPanel } from '../BetPanel';
import { GameShell } from '../GameShell';
import { CoinAmount } from '@/components/common/CoinAmount';
import { ENTRY_COLORS, pickJackpotWinner, type JackpotEntry } from '@/lib/gameEngine';
import { MOCK_USERS } from '@/lib/mockData';
import { useGamePlay, useInterval, useSound } from '@/hooks';
import { useGameStore } from '@/lib/store';
import { cn, formatCoins, pick, randInt, uid } from '@/lib/utils';

type Phase = 'open' | 'rolling' | 'settled';
const ROUND_SECONDS = 45;

function makeBotEntry(): JackpotEntry {
  const u = pick(MOCK_USERS);
  return {
    id: uid('jp'),
    username: u.username,
    avatarUrl: u.avatarUrl,
    amount: randInt(50, 8_000),
    color: pick(ENTRY_COLORS),
  };
}

export function JackpotGame() {
  const { placeBet, settle, user } = useGamePlay('jackpot');
  const soundOn = useGameStore((s) => s.soundByGame['jackpot'] ?? true);
  const play = useSound(soundOn);

  const [amount, setAmount] = useState(250);
  const [entries, setEntries] = useState<JackpotEntry[]>(() => Array.from({ length: 5 }, makeBotEntry));
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [phase, setPhase] = useState<Phase>('open');
  const [winner, setWinner] = useState<JackpotEntry | null>(null);
  const [reelOffset, setReelOffset] = useState(0);
  const joinedRef = useRef(false);

  const pot = entries.reduce((s, e) => s + e.amount, 0);
  const myEntry = entries.find((e) => e.id === 'me');
  const myOdds = myEntry ? (myEntry.amount / pot) * 100 : 0;

  /* Countdown */
  useInterval(
    () => {
      setSeconds((s) => {
        if (s <= 1) {
          setPhase('rolling');
          return 0;
        }
        if (s <= 5) play('tick');
        return s - 1;
      });
    },
    phase === 'open' ? 1_000 : null,
  );

  /* Bots join while the round is open */
  useInterval(
    () => {
      if (Math.random() > 0.45) setEntries((e) => [...e, makeBotEntry()]);
    },
    phase === 'open' ? 2_600 : null,
  );

  /* Roll the reel, pay out, then reset */
  useEffect(() => {
    if (phase !== 'rolling') return;
    play('spin');
    const won = pickJackpotWinner(entries);
    setReelOffset(2_400 + Math.random() * 600);

    const t1 = setTimeout(() => {
      setWinner(won);
      setPhase('settled');
      if (won?.id === 'me' && myEntry) {
        settle({ amount: myEntry.amount, payout: pot, multiplier: Number((pot / myEntry.amount).toFixed(2)), detail: `${entries.length} players` });
        play('win');
      } else if (myEntry) {
        settle({ amount: myEntry.amount, payout: 0, multiplier: 0, detail: `${entries.length} players` });
        play('lose');
      }
    }, 4_200);

    const t2 = setTimeout(() => {
      setEntries(Array.from({ length: randInt(3, 6) }, makeBotEntry));
      setWinner(null);
      setSeconds(ROUND_SECONDS);
      setReelOffset(0);
      setPhase('open');
      joinedRef.current = false;
    }, 9_500);

    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const join = () => {
    if (phase !== 'open' || joinedRef.current || !user) {
      if (!user) placeBet(amount); // triggers the sign-in prompt
      return;
    }
    if (!placeBet(amount)) return;
    joinedRef.current = true;
    setEntries((e) => [...e, { id: 'me', username: user.username, avatarUrl: user.avatarUrl, amount, color: '#22d3ee' }]);
    play('click');
  };

  /* Ticket reel: every entry repeated proportional to its share */
  const reel = entries.flatMap((e) => Array.from({ length: Math.max(1, Math.round((e.amount / pot) * 24)) }, () => e));
  const reelLoop = [...reel, ...reel, ...reel, ...reel];

  const board = (
    <div className="relative space-y-6">
      {/* Pot header */}
      <div className="text-center">
        <p className="text-[11px] font-bold tracking-[0.24em] text-slate-500 uppercase">Total pot</p>
        <motion.p key={pot} initial={{ scale: 0.94 }} animate={{ scale: 1 }} className="font-display text-4xl font-black text-white sm:text-5xl">
          <span className="neon-text">{formatCoins(pot, 0)}</span>
        </motion.p>
        <div className="mt-2 flex items-center justify-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5"><Users className="size-3.5" /> {entries.length} players</span>
          <span className="inline-flex items-center gap-1.5">
            <Timer className="size-3.5" />
            {phase === 'open' ? `${seconds}s left` : phase === 'rolling' ? 'Rolling…' : 'Round complete'}
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-void-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
          animate={{ width: `${(seconds / ROUND_SECONDS) * 100}%` }}
          transition={{ ease: 'linear', duration: 1 }}
        />
      </div>

      {/* Ticket reel */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-void-900/70 py-4">
        <div className="absolute inset-y-0 left-1/2 z-20 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-300 to-transparent shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
        <div className="mask-fade-x overflow-hidden">
          <motion.div className="flex gap-2 px-2" animate={{ x: -reelOffset }} transition={{ duration: 4, ease: [0.16, 1, 0.24, 1] }}>
            {reelLoop.map((e, i) => (
              <div
                key={`${e.id}-${i}`}
                className="flex shrink-0 flex-col items-center gap-1 rounded-xl border px-2.5 py-2"
                style={{ borderColor: `${e.color}55`, background: `${e.color}12` }}
              >
                <Avatar src={e.avatarUrl} alt={e.username} size={30} />
                <span className="max-w-[4.5rem] truncate text-[10px] font-semibold text-slate-300">{e.username}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Winner */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 rounded-2xl border border-amber-400/50 bg-amber-400/10 px-5 py-4"
            style={{ boxShadow: '0 0 60px -16px rgba(251,191,36,0.9)' }}
          >
            <Crown className="size-6 text-amber-300" />
            <div className="text-center">
              <p className="text-[11px] font-bold tracking-widest text-amber-300/80 uppercase">Winner</p>
              <p className="font-display text-lg font-black text-white">{winner.username}</p>
            </div>
            <CoinAmount value={pot} size="lg" decimals={0} className="text-amber-300" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry list */}
      <div className="space-y-1.5">
        {entries
          .slice()
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 8)
          .map((e) => {
            const share = (e.amount / pot) * 100;
            return (
              <div
                key={e.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-3 py-2',
                  e.id === 'me' ? 'border-cyan-400/40 bg-cyan-400/8' : 'border-white/6 bg-white/[0.02]',
                )}
              >
                <Avatar src={e.avatarUrl} alt={e.username} size={28} />
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-200">
                  {e.username} {e.id === 'me' && <span className="text-cyan-300">(you)</span>}
                </span>
                <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-void-800 sm:block">
                  <div className="h-full rounded-full" style={{ width: `${share}%`, background: e.color }} />
                </div>
                <span className="w-12 text-right font-mono text-[11px] text-slate-400">{share.toFixed(1)}%</span>
                <CoinAmount value={e.amount} size="xs" decimals={0} className="w-20 justify-end text-slate-300" />
              </div>
            );
          })}
      </div>
    </div>
  );

  const controls = (
    <BetPanel amount={amount} onAmountChange={setAmount} disabled={phase !== 'open' || joinedRef.current}>
      <div className="space-y-3 pt-1">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/8 bg-void-900/60 px-3 py-2">
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">Your odds</p>
            <p className="font-mono text-sm font-bold text-cyan-300">{myOdds.toFixed(1)}%</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-void-900/60 px-3 py-2">
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">Pot</p>
            <p className="font-mono text-sm font-bold text-amber-300">{formatCoins(pot, 0)}</p>
          </div>
        </div>

        <Button size="lg" fullWidth disabled={phase !== 'open' || joinedRef.current} icon={<Trophy className="size-4" />} onClick={join}>
          {joinedRef.current ? 'Entered this round' : phase === 'open' ? 'Join jackpot' : 'Round in progress'}
        </Button>
      </div>
    </BetPanel>
  );

  const footer = (
    <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
      <Badge tone={phase === 'open' ? 'emerald' : phase === 'rolling' ? 'amber' : 'cyan'} pulse>
        {phase === 'open' ? 'Accepting entries' : phase === 'rolling' ? 'Selecting winner' : 'Paid out'}
      </Badge>
      <p className="text-xs text-slate-500">Odds are proportional to your contribution. Winner takes 100% of the pot.</p>
    </div>
  );

  return <GameShell gameId="jackpot" board={board} controls={controls} footer={footer} />;
}
