'use client';
/** NOVARIFT primary button primitive with neon variants. */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 text-slate-950 font-semibold shadow-[0_10px_34px_-12px_rgba(34,211,238,0.9)] hover:shadow-[0_14px_44px_-10px_rgba(167,139,250,0.9)]',
  secondary:
    'glass text-slate-100 hover:border-cyan-400/45 hover:text-white',
  ghost: 'text-slate-300 hover:text-white hover:bg-white/5',
  danger:
    'bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow-[0_10px_30px_-12px_rgba(244,63,94,0.9)]',
  success:
    'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-semibold shadow-[0_10px_30px_-12px_rgba(52,211,153,0.9)]',
  outline:
    'border border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10 hover:border-cyan-300/70',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-sm gap-2 rounded-xl',
  xl: 'h-14 px-8 text-base gap-2.5 rounded-2xl',
  icon: 'h-10 w-10 rounded-xl',
};

/** Native button props minus the animation props Framer Motion owns. */
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'style'
>;

export interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, icon, fullWidth, children, disabled, ...props },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-void-950',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </motion.button>
  );
});
