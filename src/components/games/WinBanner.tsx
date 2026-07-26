'use client';
/** Glowing win overlay shown after a successful round. */
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CoinAmount } from '@/components/common/CoinAmount';
import { formatMultiplier } from '@/lib/utils';

export function WinBanner({ show, payout, multiplier, label = 'You won' }: { show: boolean; payout: number; multiplier: number; label?: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="pointer-events-none absolute inset-x-0 top-1/2 z-30 mx-auto flex w-fit -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border border-emerald-400/40 bg-void-950/80 px-8 py-5 backdrop-blur-xl"
          style={{ boxShadow: '0 0 70px -12px rgba(52,211,153,0.75)' }}
        >
          <motion.span
            animate={{ rotate: [0, 12, -12, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-emerald-300"
          >
            <Sparkles className="size-5" />
          </motion.span>
          <p className="text-[11px] font-bold tracking-[0.2em] text-emerald-300/80 uppercase">{label}</p>
          <p className="font-display text-3xl font-black text-white">{formatMultiplier(multiplier)}</p>
          <CoinAmount value={payout} size="md" className="text-emerald-300" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
