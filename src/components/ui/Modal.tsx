'use client';
/** Animated, accessible glass modal shell. */
import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  hideClose?: boolean;
}

export function Modal({ open, onClose, title, subtitle, children, className, hideClose }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-void-950/85 backdrop-blur-md"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 22 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className={cn(
              'neon-border glass-strong relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl',
              className,
            )}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-3xl bg-gradient-to-b from-cyan-500/10 to-transparent" />
            {(title || !hideClose) && (
              <div className="relative flex items-start justify-between gap-4 px-6 pt-6">
                <div>
                  {title && <h2 className="font-display text-xl font-bold text-white">{title}</h2>}
                  {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
                </div>
                {!hideClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="size-5" />
                  </button>
                )}
              </div>
            )}
            <div className="relative px-6 pt-4 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
