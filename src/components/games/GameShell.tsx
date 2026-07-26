'use client';
/**
 * Standard chrome for every game page: title bar, sound toggle, fairness
 * button, the game board slot, a side control column and the history tab.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Volume2, VolumeX, Users } from 'lucide-react';
import { Badge, Button, Card, Icon } from '@/components/ui';
import { BetHistoryTab } from './BetHistoryTab';
import { ProvablyFairModal } from './ProvablyFairModal';
import { useGameStore } from '@/lib/store';
import { GAME_BY_ID } from '@/lib/constants';
import type { GameId } from '@/types';
import { cn } from '@/lib/utils';

interface GameShellProps {
  gameId: GameId;
  board: ReactNode;
  controls: ReactNode;
  /** Optional extra panel rendered under the board */
  footer?: ReactNode;
  className?: string;
}

export function GameShell({ gameId, board, controls, footer, className }: GameShellProps) {
  const meta = GAME_BY_ID[gameId];
  const ensureGame = useGameStore((s) => s.ensureGame);
  const soundOn = useGameStore((s) => s.soundByGame[gameId] ?? true);
  const toggleSound = useGameStore((s) => s.toggleGameSound);
  const [fairOpen, setFairOpen] = useState(false);

  useEffect(() => { ensureGame(gameId); }, [ensureGame, gameId]);

  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10', className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <span className={cn('grid size-11 place-items-center rounded-2xl bg-gradient-to-br text-void-950', meta.accent)}>
            <Icon name={meta.icon} className="size-5.5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">{meta.name}</h1>
            <p className="text-xs text-slate-400 sm:text-sm">{meta.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="emerald" pulse className="hidden sm:inline-flex">
            <Users className="mr-0.5 size-3" />
            {meta.players.toLocaleString()} playing
          </Badge>
          <Button variant="secondary" size="icon" aria-label="Toggle sound" onClick={() => toggleSound(gameId)}>
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4 text-slate-500" />}
          </Button>
          <Button variant="secondary" size="md" icon={<ShieldCheck className="size-4" />} onClick={() => setFairOpen(true)}>
            <span className="hidden sm:inline">Provably Fair</span>
          </Button>
        </div>
      </motion.div>

      {/* Layout */}
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem]">
        <div className="order-2 space-y-4 lg:order-1">
          <Card className="relative overflow-hidden p-4 sm:p-6">{board}</Card>
          {footer}
        </div>

        <div className="order-1 space-y-4 lg:order-2">
          <Card className="p-4">{controls}</Card>
          <Card className="flex h-[22rem] flex-col p-4 lg:h-[26rem]">
            <BetHistoryTab gameId={gameId} />
          </Card>
        </div>
      </div>

      <ProvablyFairModal gameId={gameId} open={fairOpen} onClose={() => setFairOpen(false)} />
    </div>
  );
}
