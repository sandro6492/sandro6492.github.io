/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  level?: number;
  ring?: boolean;
  className?: string;
}

/**
 * Avatars are inline SVG data-URIs generated locally, so <img> is intentional
 * here — next/image adds no value for data URIs.
 */
export function Avatar({ src, alt, size = 36, level, ring = true, className }: AvatarProps) {
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn('rounded-xl object-cover', ring && 'ring-1 ring-white/15')}
      />
      {level !== undefined && (
        <span className="absolute -right-1.5 -bottom-1.5 rounded-md bg-void-900 px-1 py-px text-[9px] font-bold text-cyan-300 ring-1 ring-cyan-400/40">
          {level}
        </span>
      )}
    </div>
  );
}
