'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading';
import { FAQ } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <SectionHeading eyebrow="FAQ" title="Everything you're wondering" subtitle="Short answers about fairness, currency and what this prototype actually does." />

      <div className="mt-10 space-y-2.5">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={item.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className={cn('glass overflow-hidden rounded-2xl transition', isOpen && 'border-cyan-400/30')}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className={cn('text-sm font-semibold transition sm:text-base', isOpen ? 'text-cyan-200' : 'text-slate-200')}>
                  {item.q}
                </span>
                <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className={cn('shrink-0 rounded-lg p-1', isOpen ? 'bg-cyan-400/15 text-cyan-300' : 'text-slate-500')}>
                  <Plus className="size-4" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
