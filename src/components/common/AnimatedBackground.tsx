'use client';
/** Animated grid + drifting particle field rendered behind the whole app. */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle { id: number; x: number; y: number; size: number; delay: number; duration: number; hue: string }

const HUES = ['rgba(34,211,238,0.55)', 'rgba(167,139,250,0.5)', 'rgba(232,121,249,0.45)'];

export function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generated client-side to avoid SSR hydration mismatches from Math.random()
  useEffect(() => {
    setParticles(
      Array.from({ length: 34 }, (_, id) => ({
        id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 8,
        duration: Math.random() * 14 + 12,
        hue: HUES[id % HUES.length],
      })),
    );
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_20%,rgba(4,6,15,0.85)_78%)]" />

      {/* Drifting orbs */}
      <motion.div
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-32 size-[34rem] rounded-full bg-cyan-500/12 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -50, 40, 0], y: [0, 40, -25, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -right-40 size-[36rem] rounded-full bg-violet-600/12 blur-[130px]"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 left-1/3 size-[30rem] rounded-full bg-fuchsia-600/10 blur-[120px]"
      />

      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.hue, boxShadow: `0 0 ${p.size * 4}px ${p.hue}` }}
          animate={{ y: [0, -110, 0], opacity: [0, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
