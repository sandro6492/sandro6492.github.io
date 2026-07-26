import Link from 'next/link';
import { Code2, MessageCircle, RadioTower, Send } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { BRAND, GAMES } from '@/lib/constants';

const COLUMNS = [
  {
    title: 'Arenas',
    links: GAMES.slice(0, 6).map((g) => ({ label: g.name, href: g.href })),
  },
  {
    title: 'Platform',
    links: [
      { label: 'Leaderboard', href: '/leaderboard' },
      { label: 'Missions', href: '/missions' },
      { label: 'Cases', href: '/cases' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Admin console', href: '/admin' },
    ],
  },
  {
    title: 'Rift Docs',
    links: [
      { label: 'Provably fair', href: '/#faq' },
      { label: 'How it works', href: '/#how' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Responsible play', href: '/#faq' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/8 bg-void-950/70">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">{BRAND.description}</p>
            <div className="mt-5 flex gap-2">
              {[Send, MessageCircle, RadioTower, Code2].map((Icon, i) => (
                <span
                  key={i}
                  className="grid size-9 cursor-pointer place-items-center rounded-xl border border-white/8 bg-white/[0.02] text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-300"
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-xs font-bold tracking-[0.18em] text-slate-200 uppercase">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-slate-400 transition hover:text-cyan-300">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {BRAND.name}. Front-end prototype — no real currency, no wagering.
          </p>
          <p className="flex items-center gap-2 text-[11px] text-slate-600">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            All systems nominal · mock transport
          </p>
        </div>
      </div>
    </footer>
  );
}
