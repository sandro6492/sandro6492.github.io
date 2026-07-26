'use client';
/**
 * UPGRADER — gamble an inventory item into a higher-value target.
 * The success arc is drawn proportionally to the computed chance, and the
 * needle stops inside or outside it.
 */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowBigUpDash, Target } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { GameShell } from '../GameShell';
import { ItemCard } from '../ItemCard';
import { CoinAmount } from '@/components/common/CoinAmount';
import { EmptyState } from '@/components/common/EmptyState';
import { RarityChip } from '@/components/common/RarityChip';
import { caseService } from '@/services';
import { ITEM_CATALOGUE } from '@/lib/mockData';
import { upgradeChance } from '@/lib/gameEngine';
import { RARITY } from '@/lib/constants';
import type { InventoryItem, Item } from '@/types';
import { useCelebration, useSound } from '@/hooks';
import { useGameStore, useUIStore, useUserStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function UpgraderGame() {
  const inventory = useUserStore((s) => s.inventory);
  const removeItem = useUserStore((s) => s.removeItem);
  const addItem = useUserStore((s) => s.addItem);
  const notify = useUIStore((s) => s.notify);
  const openModal = useUIStore((s) => s.openModal);
  const isAuth = useUserStore((s) => s.isAuthenticated);
  const soundOn = useGameStore((s) => s.soundByGame['upgrader'] ?? true);
  const play = useSound(soundOn);
  const { burst, shake } = useCelebration();

  const [source, setSource] = useState<InventoryItem | null>(null);
  const [target, setTarget] = useState<Item | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [needle, setNeedle] = useState(0);
  const [outcome, setOutcome] = useState<'success' | 'fail' | null>(null);

  const chance = source && target ? upgradeChance(source.value, target.value) : 0;
  const targets = useMemo(
    () => ITEM_CATALOGUE.filter((i) => !source || i.value > source.value).sort((a, b) => a.value - b.value),
    [source],
  );

  const spin = async () => {
    if (!isAuth) return openModal('login');
    if (!source || !target || spinning) return;
    setSpinning(true);
    setOutcome(null);
    play('spin');

    const { success } = await caseService.upgrade(source.value, target);
    // Land the needle inside (success) or outside (fail) the success arc
    const arc = (chance / 100) * 360;
    const landing = success ? Math.random() * arc * 0.92 : arc + Math.random() * (360 - arc) * 0.92;
    setNeedle(1_440 + landing);

    setTimeout(() => {
      setSpinning(false);
      setOutcome(success ? 'success' : 'fail');
      removeItem(source.instanceId);
      if (success) {
        addItem(target);
        burst(target.rarity === 'mythic' || target.rarity === 'legendary' ? 'large' : 'medium');
        if (target.rarity === 'mythic') shake();
        play('win');
        notify('reward', 'Upgrade succeeded!', `${source.name} → ${target.name}`);
      } else {
        play('lose');
        notify('error', 'Upgrade failed', `${source.name} was consumed by the rift.`);
      }
      setSource(null);
      setTarget(null);
    }, 3_400);
  };

  const arcAngle = (chance / 100) * 360;

  const board = (
    <div className="space-y-6">
      {/* Source → target */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Your item</p>
          {source ? (
            <div className="w-28"><ItemCard item={source} /></div>
          ) : (
            <div className="grid h-32 w-28 place-items-center rounded-xl border border-dashed border-white/12 text-xs text-slate-600">
              Select below
            </div>
          )}
        </div>

        <motion.div animate={{ x: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="text-cyan-300">
          <ArrowBigUpDash className="size-7" />
        </motion.div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Target</p>
          {target ? (
            <div className="w-28"><ItemCard item={target} /></div>
          ) : (
            <div className="grid h-32 w-28 place-items-center rounded-xl border border-dashed border-white/12 text-xs text-slate-600">
              Pick a target
            </div>
          )}
        </div>
      </div>

      {/* Percentage wheel */}
      <div className="relative mx-auto aspect-square w-56">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth="9" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none"
            stroke={outcome === 'fail' ? '#f43f5e' : '#22d3ee'}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${(arcAngle / 360) * 264} 264`}
            animate={{ opacity: chance > 0 ? 1 : 0.2 }}
            style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.8))' }}
          />
        </svg>

        {/* Needle */}
        <motion.div
          className="absolute inset-0 grid place-items-center"
          animate={{ rotate: needle }}
          transition={{ duration: 3.2, ease: [0.16, 1, 0.24, 1] }}
        >
          <div className="h-1/2 w-0.5 origin-bottom -translate-y-1/4 rounded-full bg-gradient-to-t from-transparent to-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
        </motion.div>

        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-display text-3xl font-black text-white">{chance.toFixed(1)}%</p>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Success</p>
          </div>
        </div>

        <AnimatePresence>
          {outcome && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border px-4 py-1 text-xs font-bold uppercase',
                outcome === 'success' ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300' : 'border-rose-400/60 bg-rose-400/15 text-rose-300',
              )}
            >
              {outcome === 'success' ? 'Upgraded' : 'Consumed'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inventory picker */}
      <div>
        <p className="mb-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Your inventory</p>
        {inventory.length === 0 ? (
          <EmptyState icon="Package" title="No items yet" body="Open a case to collect upgradeable loot." />
        ) : (
          <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-5 lg:grid-cols-7">
            {inventory.map((item) => (
              <ItemCard
                key={item.instanceId}
                item={item}
                size="sm"
                selected={source?.instanceId === item.instanceId}
                onClick={() => { setSource(item); setTarget(null); setOutcome(null); }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const controls = (
    <div className="space-y-3">
      <p className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Choose target</p>
      <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
        {targets.map((item) => {
          const c = source ? upgradeChance(source.value, item.value) : 0;
          return (
            <button
              key={item.id}
              disabled={!source || spinning}
              onClick={() => { setTarget(item); setOutcome(null); }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition disabled:opacity-40',
                target?.id === item.id ? 'border-cyan-400/60 bg-cyan-400/10' : 'border-white/8 hover:border-white/20',
              )}
            >
              <span className="text-xl">{item.glyph}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-slate-200">{item.name}</span>
                <RarityChip rarity={item.rarity} className="mt-0.5" />
              </span>
              <span className="text-right">
                <CoinAmount value={item.value} size="xs" decimals={0} className="text-slate-300" />
                <span className="block font-mono text-[10px] text-cyan-300">{c.toFixed(1)}%</span>
              </span>
            </button>
          );
        })}
      </div>

      <Button size="lg" fullWidth loading={spinning} disabled={!source || !target} icon={<Target className="size-4" />} onClick={spin}>
        {spinning ? 'Spinning' : 'Attempt upgrade'}
      </Button>

      {source && target && (
        <p className="rounded-xl border border-white/8 bg-void-900/50 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
          Risking <span className={RARITY[source.rarity].text}>{source.name}</span> for{' '}
          <span className={RARITY[target.rarity].text}>{target.name}</span> at {chance.toFixed(1)}% success.
        </p>
      )}
    </div>
  );

  const footer = (
    <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
      <Badge tone="emerald">Max 95% chance</Badge>
      <p className="text-xs text-slate-500">Success chance = (source value / target value) × 0.98. Failure consumes the source item.</p>
    </div>
  );

  return <GameShell gameId="upgrader" board={board} controls={controls} footer={footer} />;
}
