'use client';
/** Confetti + screen-shake win effects. */
import { useCallback } from 'react';
import confetti from 'canvas-confetti';

const CYBER_COLORS = ['#22d3ee', '#a78bfa', '#e879f9', '#fbbf24', '#34d399'];

export function useCelebration() {
  const burst = useCallback((intensity: 'small' | 'medium' | 'large' = 'medium') => {
    const counts = { small: 60, medium: 140, large: 260 };
    confetti({
      particleCount: counts[intensity],
      spread: intensity === 'large' ? 120 : 80,
      startVelocity: intensity === 'large' ? 55 : 40,
      origin: { y: 0.6 },
      colors: CYBER_COLORS,
      scalar: 0.9,
      ticks: 220,
    });
    if (intensity === 'large') {
      setTimeout(() => confetti({ particleCount: 120, angle: 60, spread: 70, origin: { x: 0 }, colors: CYBER_COLORS }), 140);
      setTimeout(() => confetti({ particleCount: 120, angle: 120, spread: 70, origin: { x: 1 }, colors: CYBER_COLORS }), 220);
    }
  }, []);

  const shake = useCallback((ms = 420) => {
    if (typeof document === 'undefined') return;
    document.body.classList.add('nv-shake');
    setTimeout(() => document.body.classList.remove('nv-shake'), ms);
  }, []);

  return { burst, shake };
}
