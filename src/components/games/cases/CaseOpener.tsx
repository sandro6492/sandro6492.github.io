'use client';
/**
 * CASE RIFT — horizontal roulette reel unboxing.
 *
 * The winner is resolved by the (mock) service before the animation starts;
 * the reel is built so the winner sits at a known index, and we translate the
 * strip so that index lands under the centre marker.
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, RotateCcw, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { Badge, Button, Modal, Toggle } from '@/components/ui';
import { ItemCard } from '../ItemCard';
import { CoinAmount } from '@/components/common/CoinAmount';
import { RarityChip } from '@/components/common/RarityChip';
import { caseService } from '@/services';
import { RARITY } from '@/lib/constants';
import type { CaseDefinition, Item } from '@/types';
import { useCelebration, useSound } from '@/hooks';
import { useUIStore, useUserStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const CARD_W = 116; // px, incl. gap — must match the rendered tile width

export function CaseOpener({ def, onClose }: { def: CaseDefinition; onClose: () => void }) {
  const user = useUserStore((s) => s.user);
  const adjustBalance = useUserStore((s) => s.adjustBalance);
  const addItem = useUserStore((s) => s.addItem);
  const notify = useUIStore((s) => s.notify);
  const openModal = useUIStore((s) => s.openModal);
  const { burst, shake } = useCelebration();

  const [soundOn, setSoundOn] = useState(true);
  const play = useSound(soundOn);

  const [reel, setReel] = useState<Item[]>([]);
  const [offset, setOffset] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Item | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [fast, setFast] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Idle reel so the strip never looks empty
  useEffect(() => {
    caseService.openCase(def.id).then(({ reel: r }) => setReel(r));
  }, [def.id]);

  const open = async () => {
    if (spinning) return;
    if (!user) {
      openModal('login');
      return;
    }
    if (user.balance < def.price) {
      notify('error', 'Insufficient balance', `You need ${def.price.toLocaleString()} RC to open ${def.name}.`);
      return;
    }

    adjustBalance(-def.price);
    setSpinning(true);
    setWinner(null);
    setShowReveal(false);
    play('spin');

    const { reel: nextReel, winner: won, winnerIndex } = await caseService.openCase(def.id);
    setReel(nextReel);

    // Centre the winning tile with a small random jitter for realism
    const viewport = viewportRef.current?.clientWidth ?? 800;
    const jitter = (Math.random() - 0.5) * (CARD_W * 0.5);
    setOffset(winnerIndex * CARD_W - viewport / 2 + CARD_W / 2 + jitter);

    const duration = fast ? 2_000 : 5_200;
    setTimeout(() => {
      setSpinning(false);
      setWinner(won);
      setShowReveal(true);
      addItem(won);
      play('reveal');
      if (won.rarity === 'legendary' || won.rarity === 'mythic') {
        burst('large');
        shake();
      } else if (won.rarity === 'epic') {
        burst('medium');
      }
      notify(
        won.value >= def.price ? 'reward' : 'info',
        `${RARITY[won.rarity].label} unboxed`,
        `${won.name} · worth ${won.value.toLocaleString()} RC`,
      );
    }, duration);
  };

  const sellWinner = () => {
    if (!winner) return;
    adjustBalance(winner.value);
    notify('success', 'Item sold', `+${winner.value.toLocaleString()} RC added to your balance.`);
    setShowReveal(false);
  };

  const reset = () => {
    setOffset(0);
    setWinner(null);
    setShowReveal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn('grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-2xl', def.accent)}>{def.glyph}</span>
          <div>
            <h3 className="font-display text-xl font-extrabold text-white">{def.name}</h3>
            <p className="text-xs text-slate-400">{def.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundOn((v) => !v)}
            className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:text-white"
            aria-label="Toggle unboxing sound"
          >
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          <button onClick={onClose} className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:text-white" aria-label="Close case">
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Reel */}
      <div ref={viewportRef} className="relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-void-900 to-void-950 py-5">
        <div className="grid-bg absolute inset-0 opacity-40" />
        {/* Centre marker */}
        <div className="absolute inset-y-0 left-1/2 z-20 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-300 to-transparent shadow-[0_0_20px_rgba(34,211,238,1)]" />
        <div className="absolute top-1 left-1/2 z-20 size-0 -translate-x-1/2 border-x-[7px] border-t-[11px] border-x-transparent border-t-cyan-300" />
        <div className="absolute bottom-1 left-1/2 z-20 size-0 -translate-x-1/2 border-x-[7px] border-b-[11px] border-x-transparent border-b-cyan-300" />

        <div className="mask-fade-x relative overflow-hidden">
          <motion.div
            className="flex gap-2 px-2"
            animate={{ x: -offset }}
            transition={{ duration: spinning ? (fast ? 2 : 5.2) : 0.4, ease: [0.12, 0.72, 0.16, 1] }}
          >
            {reel.map((item, i) => {
              const r = RARITY[item.rarity];
              return (
                <div
                  key={`${item.id}-${i}`}
                  className={cn('flex w-[108px] shrink-0 flex-col items-center gap-1 rounded-xl border bg-gradient-to-b py-3', r.border, r.bg)}
                >
                  <span className="text-3xl">{item.glyph}</span>
                  <span className="line-clamp-1 px-1 text-[10px] font-semibold text-slate-200">{item.name}</span>
                  <span className={cn('text-[9px] font-bold uppercase', r.text)}>{r.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" loading={spinning} icon={<Package className="size-4" />} onClick={open} className="flex-1 sm:flex-none">
          Open for {def.price.toLocaleString()} RC
        </Button>
        <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-void-900/60 px-3 py-2">
          <span className="text-xs font-semibold text-slate-400">Fast spin</span>
          <Toggle checked={fast} onChange={setFast} size="sm" label="Fast spin" />
        </div>
        {winner && (
          <Button variant="ghost" size="lg" icon={<RotateCcw className="size-4" />} onClick={reset}>
            Reset reel
          </Button>
        )}
      </div>

      {/* Drop table */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Drop table</p>
          <span className="text-[11px] text-slate-500">{def.opens.toLocaleString()} opens</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
          {def.drops
            .slice()
            .sort((a, b) => b.item.value - a.item.value)
            .map((d) => {
              const total = def.drops.reduce((s, x) => s + x.chance, 0);
              return (
                <div key={d.item.id} className="relative">
                  <ItemCard item={d.item} size="sm" />
                  <span className="absolute right-1 bottom-1 rounded bg-void-950/80 px-1 text-[9px] font-bold text-slate-400">
                    {((d.chance / total) * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Reveal modal */}
      <Modal open={showReveal} onClose={() => setShowReveal(false)} hideClose className="max-w-sm">
        <AnimatePresence>
          {winner && (
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 text-center">
              <motion.div
                animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="text-7xl"
                style={{ filter: `drop-shadow(0 0 28px ${RARITY[winner.rarity].hex})` }}
              >
                {winner.glyph}
              </motion.div>
              <RarityChip rarity={winner.rarity} />
              <h3 className="font-display text-2xl font-black text-white">{winner.name}</h3>
              <p className="text-xs text-slate-500">{winner.collection}</p>
              <CoinAmount value={winner.value} size="lg" decimals={0} className="text-amber-300" />

              <div className="mt-3 flex w-full gap-2">
                <Button variant="secondary" fullWidth onClick={() => setShowReveal(false)} icon={<Sparkles className="size-4" />}>
                  Keep item
                </Button>
                <Button variant="success" fullWidth onClick={sellWinner}>
                  Sell for {winner.value.toLocaleString()}
                </Button>
              </div>
              <Badge tone={winner.value >= def.price ? 'emerald' : 'slate'} className="mt-1">
                {winner.value >= def.price ? 'Profit' : 'Below case value'}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  );
}
