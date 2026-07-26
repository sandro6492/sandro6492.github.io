'use client';
/** Sticky top navigation with wallet chip, games mega-menu and auth actions. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, LayoutDashboard, LogOut, Menu, MessagesSquare, Plus, Shield,
  Trophy, User as UserIcon, Wallet, X, Gamepad2, ListChecks,
} from 'lucide-react';
import { Avatar, Badge, Button, Icon } from '@/components/ui';
import { Logo } from '@/components/common/Logo';
import { CoinAmount } from '@/components/common/CoinAmount';
import { GAMES } from '@/lib/constants';
import { useUIStore, useUserStore } from '@/lib/store';
import { useAuth } from '@/hooks';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/cases', label: 'Cases', icon: Plus },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/missions', label: 'Missions', icon: ListChecks },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const user = useUserStore((s) => s.user);
  const isAuth = useUserStore((s) => s.isAuthenticated);
  const openModal = useUIStore((s) => s.openModal);
  const toggleChat = useUIStore((s) => s.toggleChat);
  const mobileOpen = useUIStore((s) => s.mobileNavOpen);
  const setMobileNav = useUIStore((s) => s.setMobileNav);
  const { logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileNav(false); setUserMenu(false); setGamesOpen(false); }, [pathname, setMobileNav]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'border-b border-white/8 bg-void-950/85 backdrop-blur-xl' : 'bg-transparent',
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo />

            <div className="hidden items-center gap-1 lg:flex">
              {/* Games mega-menu */}
              <div className="relative" onMouseEnter={() => setGamesOpen(true)} onMouseLeave={() => setGamesOpen(false)}>
                <Link
                  href="/games"
                  className={cn(
                    'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition',
                    pathname.startsWith('/games') ? 'text-cyan-300' : 'text-slate-300 hover:text-white',
                  )}
                >
                  Games <ChevronDown className={cn('size-3.5 transition', gamesOpen && 'rotate-180')} />
                </Link>
                <AnimatePresence>
                  {gamesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      className="glass-strong absolute top-full left-0 grid w-[34rem] grid-cols-2 gap-1 rounded-2xl p-2"
                    >
                      {GAMES.map((g) => (
                        <Link
                          key={g.id}
                          href={g.href}
                          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/5"
                        >
                          <span className={cn('grid size-9 place-items-center rounded-lg bg-gradient-to-br text-void-950', g.accent)}>
                            <Icon name={g.icon} className="size-4.5" />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
                              {g.name}
                              {g.hot && <Badge tone="rose" className="px-1 py-0 text-[9px]">Hot</Badge>}
                              {g.isNew && <Badge tone="emerald" className="px-1 py-0 text-[9px]">New</Badge>}
                            </span>
                            <span className="block truncate text-[11px] text-slate-500">{g.tagline}</span>
                          </span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {LINKS.slice(1).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-semibold transition',
                    pathname.startsWith(l.href) ? 'text-cyan-300' : 'text-slate-300 hover:text-white',
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuth && user ? (
              <>
                <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-void-900/70 py-1.5 pr-1.5 pl-3 sm:flex">
                  <CoinAmount value={user.balance} size="sm" className="text-white" />
                  <Button size="sm" onClick={() => openModal('deposit')} icon={<Plus className="size-3.5" />}>
                    Top up
                  </Button>
                </div>

                <Button variant="secondary" size="icon" aria-label="Open chat" onClick={toggleChat} className="hidden sm:inline-flex">
                  <MessagesSquare className="size-4" />
                </Button>

                <div className="relative">
                  <button
                    onClick={() => setUserMenu((v) => !v)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-void-900/70 p-1 pr-2 transition hover:border-cyan-400/40"
                  >
                    <Avatar src={user.avatarUrl} alt={user.username} size={28} />
                    <span className="hidden text-xs font-semibold text-slate-200 sm:block">Lv {user.level}</span>
                    <ChevronDown className="size-3.5 text-slate-500" />
                  </button>
                  <AnimatePresence>
                    {userMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          className="glass-strong absolute top-full right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl p-1.5"
                        >
                          <div className="border-b border-white/5 px-3 py-2.5">
                            <p className="truncate text-sm font-bold text-white">{user.username}</p>
                            <p className="truncate text-[11px] text-slate-500">{user.email}</p>
                          </div>
                          {[
                            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                            { href: '/dashboard/profile', label: 'Profile', icon: UserIcon },
                            { href: '/dashboard/wallet', label: 'Wallet & Inventory', icon: Wallet },
                            { href: '/admin', label: 'Admin console', icon: Shield },
                          ].map((i) => (
                            <Link
                              key={i.href}
                              href={i.href}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                            >
                              <i.icon className="size-4 text-slate-500" />
                              {i.label}
                            </Link>
                          ))}
                          <button
                            onClick={() => { setUserMenu(false); logout(); }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10"
                          >
                            <LogOut className="size-4" /> Sign out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="md" onClick={() => openModal('login')} className="hidden sm:inline-flex">
                  Log in
                </Button>
                <Button size="md" onClick={() => openModal('signup')}>Start playing</Button>
              </>
            )}

            <button
              onClick={() => setMobileNav(!mobileOpen)}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-white/5 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/8 bg-void-950/95 backdrop-blur-xl lg:hidden"
            >
              <div className="space-y-3 px-4 py-4">
                <div className="grid grid-cols-2 gap-1.5">
                  {GAMES.map((g) => (
                    <Link key={g.id} href={g.href} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5">
                      <span className={cn('grid size-7 place-items-center rounded-lg bg-gradient-to-br text-void-950', g.accent)}>
                        <Icon name={g.icon} className="size-3.5" />
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{g.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {LINKS.slice(1).concat([{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, { href: '/admin', label: 'Admin', icon: Shield }]).map((l) => (
                    <Link key={l.href} href={l.href} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5">
                      <l.icon className="size-4 text-slate-500" /> {l.label}
                    </Link>
                  ))}
                </div>
                {!isAuth && (
                  <div className="flex gap-2">
                    <Button variant="secondary" fullWidth onClick={() => openModal('login')}>Log in</Button>
                    <Button fullWidth onClick={() => openModal('signup')}>Sign up</Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div className="h-16" />
    </>
  );
}
