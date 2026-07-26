import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/constants';

/** NOVARIFT wordmark + custom rift glyph (pure SVG, no assets). */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn('group inline-flex items-center gap-2.5', className)}>
      <span className="relative grid size-9 place-items-center">
        <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 opacity-90 transition group-hover:opacity-100" />
        <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 blur-md opacity-60 transition group-hover:opacity-90" />
        <svg viewBox="0 0 24 24" className="relative size-5 text-void-950" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 19V5l14 14V5" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          <span className="text-white">NOVA</span>
          <span className="neon-text">RIFT</span>
        </span>
      )}
      <span className="sr-only">{BRAND.name}</span>
    </Link>
  );
}
