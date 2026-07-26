'use client';
/** Landing hero: kinetic headline, CTAs and a floating holo-console visual. */
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui';
import { BRAND } from '@/lib/constants';
import { useUIStore, useUserStore } from '@/lib/store';

const orbit = [
  { label: 'Crash', deg: 0, color: 'from-cyan-400 to-blue-600' },
  { label: 'Mines', deg: 72, color: 'from-fuchsia-400 to-purple-600' },
  { label: 'Cases', deg: 144, color: 'from-violet-400 to-indigo-600' },
  { label: 'Wheel', deg: 216, color: 'from-rose-400 to-pink-600' },
  { label: 'Dice', deg: 288, color: 'from-amber-300 to-orange-600' },
];

export function Hero() {
  const openModal = useUIStore((s) => s.openModal);
  const isAuth = useUserStore((s) => s.isAuthenticated);

  return (
    <section className="relative overflow-hidden pt-14 pb-10 sm:pt-20 lg:pt-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/8 py-1.5 pr-3.5 pl-2 text-xs font-semibold text-cyan-200"
          >
            <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">New</span>
            Season 01 · Ascendant cases are live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display mt-5 text-4xl leading-[1.05] font-black tracking-tight text-white sm:text-6xl lg:text-[4.25rem]"
          >
            Rift the odds.
            <br />
            <span className="neon-text">Rule the grid.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            {BRAND.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            {isAuth ? (
              <Link href="/games">
                <Button size="xl" icon={<PlayCircle className="size-5" />} className="w-full sm:w-auto">
                  Enter the arena
                </Button>
              </Link>
            ) : (
              <Button size="xl" icon={<Sparkles className="size-5" />} onClick={() => openModal('signup')} className="w-full sm:w-auto">
                Claim 10,000 {BRAND.currency}
              </Button>
            )}
            <Link href="/games">
              <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                Browse games <ArrowRight className="size-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500"
          >
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-emerald-400" /> Provably fair rounds</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="size-3.5 text-amber-400" /> Sub-200ms settlement</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5 text-violet-400" /> No real money — ever</span>
          </motion.div>
        </div>

        {/* Holo console */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -12 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="perspective-1000 relative mx-auto hidden aspect-square w-full max-w-md lg:block"
        >
          {/* Rotating rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 26 + i * 9, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border"
              style={{
                inset: `${i * 34}px`,
                borderColor: ['rgba(34,211,238,0.28)', 'rgba(167,139,250,0.24)', 'rgba(232,121,249,0.2)'][i],
                borderStyle: i === 1 ? 'dashed' : 'solid',
              }}
            />
          ))}

          {/* Orbiting game chips */}
          {orbit.map((o, i) => (
            <motion.div
              key={o.label}
              className="absolute top-1/2 left-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear', delay: -i * 6 }}
              style={{ transformOrigin: '0 0' }}
            >
              <div style={{ transform: `rotate(${o.deg}deg) translateX(11rem) rotate(-${o.deg}deg)` }}>
                <motion.span
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear', delay: -i * 6 }}
                  className={`glass block -translate-x-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-br px-3 py-1.5 text-[11px] font-bold text-white ${o.color}`}
                >
                  {o.label}
                </motion.span>
              </div>
            </motion.div>
          ))}

          {/* Core */}
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 grid size-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-cyan-400/25 via-violet-500/25 to-fuchsia-500/25 backdrop-blur-xl"
            style={{ boxShadow: '0 0 90px -10px rgba(34,211,238,0.65)' }}
          >
            <div className="text-center">
              <p className="font-display text-4xl font-black text-white">∞</p>
              <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-cyan-200 uppercase">Rift Core</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
