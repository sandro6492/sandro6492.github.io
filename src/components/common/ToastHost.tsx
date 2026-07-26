'use client';
/** Global notification stack. */
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Gift, Info, X } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import type { ToastKind } from '@/types';
import { cn } from '@/lib/utils';

const CONFIG: Record<ToastKind, { icon: typeof Info; ring: string; tint: string }> = {
  success: { icon: CheckCircle2, ring: 'ring-emerald-400/40', tint: 'from-emerald-500/25 text-emerald-300' },
  error: { icon: AlertTriangle, ring: 'ring-rose-400/40', tint: 'from-rose-500/25 text-rose-300' },
  info: { icon: Info, ring: 'ring-cyan-400/40', tint: 'from-cyan-500/25 text-cyan-300' },
  reward: { icon: Gift, ring: 'ring-amber-400/40', tint: 'from-amber-500/25 text-amber-300' },
};

export function ToastHost() {
  const toasts = useUIStore((s) => s.toasts);
  const dismiss = useUIStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed top-20 right-3 z-[200] flex w-[min(22rem,calc(100vw-1.5rem))] flex-col gap-2 sm:right-5">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const cfg = CONFIG[toast.kind];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={cn('glass-strong pointer-events-auto flex items-start gap-3 rounded-2xl p-3.5 ring-1', cfg.ring)}
            >
              <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br to-transparent', cfg.tint)}>
                <Icon className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                {toast.message && <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{toast.message}</p>}
              </div>
              <button onClick={() => dismiss(toast.id)} className="rounded p-1 text-slate-500 transition hover:text-white" aria-label="Dismiss">
                <X className="size-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
