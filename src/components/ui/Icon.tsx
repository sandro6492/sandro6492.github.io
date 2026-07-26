'use client';
/** Resolves lucide icon names stored as plain strings in mock data. */
import * as Lucide from 'lucide-react';
import type { LucideProps } from 'lucide-react';

type IconRegistry = Record<string, React.ComponentType<LucideProps>>;

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const registry = Lucide as unknown as IconRegistry;
  const Cmp = registry[name] ?? Lucide.Sparkles;
  return <Cmp {...props} />;
}
