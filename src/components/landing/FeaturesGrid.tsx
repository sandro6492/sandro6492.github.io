'use client';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui';
import { SectionHeading } from '@/components/common/SectionHeading';
import { FEATURES } from '@/lib/constants';

export function FeaturesGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Built different"
        title="A platform engineered for velocity"
        subtitle="Every surface of NOVARIFT was designed from scratch — no templates, no borrowed layouts, no compromises on feel."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            whileHover={{ y: -6 }}
            className="glass glass-hover group relative overflow-hidden rounded-2xl p-6"
          >
            <div className={`pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition duration-500 group-hover:opacity-25 ${f.accent}`} />
            <span className={`grid size-11 place-items-center rounded-xl bg-gradient-to-br text-void-950 ${f.accent}`}>
              <Icon name={f.icon} className="size-5" />
            </span>
            <h3 className="font-display mt-4 text-base font-bold text-white">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
