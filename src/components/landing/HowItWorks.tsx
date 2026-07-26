'use client';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui';
import { SectionHeading } from '@/components/common/SectionHeading';
import { HOW_IT_WORKS } from '@/lib/constants';

export function HowItWorks() {
  return (
    <section id="how" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <SectionHeading eyebrow="How it works" title="Four steps into the rift" subtitle="From zero to your first multiplier in under a minute." />

      <div className="relative mt-12">
        {/* Connecting beam */}
        <div className="absolute inset-x-8 top-12 hidden h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400/40 to-fuchsia-400/0 lg:block" />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="glass relative rounded-2xl p-6 text-center"
            >
              <span className="relative mx-auto grid size-14 place-items-center rounded-2xl border border-cyan-400/30 bg-void-900">
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 blur-md" />
                <Icon name={s.icon} className="relative size-6 text-cyan-300" />
              </span>
              <p className="font-display mt-4 text-[11px] font-bold tracking-[0.2em] text-slate-500">{s.step}</p>
              <h3 className="font-display mt-1 text-base font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
