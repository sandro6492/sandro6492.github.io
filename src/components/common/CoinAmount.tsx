import { cn, formatCoins } from '@/lib/utils';

/** Consistent currency rendering with the NOVARIFT coin glyph. */
export function CoinAmount({
  value,
  decimals = 2,
  className,
  size = 'md',
  signed = false,
}: {
  value: number;
  decimals?: number;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  signed?: boolean;
}) {
  const sizes = {
    xs: 'text-[11px] gap-1',
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-lg gap-2',
    xl: 'text-3xl gap-2.5',
  } as const;
  const dots = { xs: 'size-2', sm: 'size-2.5', md: 'size-3', lg: 'size-4', xl: 'size-6' } as const;
  const sign = signed ? (value > 0 ? '+' : value < 0 ? '−' : '') : '';

  return (
    <span className={cn('inline-flex items-center font-semibold tabular-nums', sizes[size], className)}>
      <span
        className={cn(
          'inline-block shrink-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_0_10px_-2px_rgba(251,191,36,0.9)]',
          dots[size],
        )}
      />
      {sign}
      {formatCoins(Math.abs(value), decimals)}
    </span>
  );
}
