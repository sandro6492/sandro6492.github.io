import type { GameMeta, Rarity } from '@/types';

export const BRAND = {
  name: 'NOVARIFT',
  tagline: 'Rift the odds. Rule the grid.',
  description:
    'A neon-drenched skill arena where every flip, spin and drop is provably fair. Play the rift, climb the leaderboard, unbox the impossible.',
  currency: 'RC', // Rift Coins
  currencyName: 'Rift Coins',
} as const;

/** Rarity tier design tokens — single source of truth for item colouring. */
export const RARITY: Record<
  Rarity,
  { label: string; text: string; border: string; glow: string; bg: string; hex: string; weight: number }
> = {
  common: {
    label: 'Common',
    text: 'text-slate-300',
    border: 'border-slate-500/40',
    glow: 'shadow-[0_0_24px_-6px_rgba(148,163,184,0.7)]',
    bg: 'from-slate-500/25 to-slate-700/10',
    hex: '#94a3b8',
    weight: 60,
  },
  rare: {
    label: 'Rare',
    text: 'text-cyan-300',
    border: 'border-cyan-400/50',
    glow: 'shadow-[0_0_28px_-6px_rgba(34,211,238,0.85)]',
    bg: 'from-cyan-500/25 to-blue-700/10',
    hex: '#22d3ee',
    weight: 24,
  },
  epic: {
    label: 'Epic',
    text: 'text-violet-300',
    border: 'border-violet-400/50',
    glow: 'shadow-[0_0_30px_-6px_rgba(167,139,250,0.9)]',
    bg: 'from-violet-500/30 to-purple-700/10',
    hex: '#a78bfa',
    weight: 10,
  },
  legendary: {
    label: 'Legendary',
    text: 'text-amber-300',
    border: 'border-amber-400/50',
    glow: 'shadow-[0_0_34px_-6px_rgba(251,191,36,0.9)]',
    bg: 'from-amber-500/30 to-orange-700/10',
    hex: '#fbbf24',
    weight: 5,
  },
  mythic: {
    label: 'Mythic',
    text: 'text-fuchsia-300',
    border: 'border-fuchsia-400/60',
    glow: 'shadow-[0_0_40px_-4px_rgba(232,121,249,1)]',
    bg: 'from-fuchsia-500/35 to-rose-700/15',
    hex: '#e879f9',
    weight: 1,
  },
};

export const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];

/** Game catalogue — drives the nav, landing grid and /games index. */
export const GAMES: GameMeta[] = [
  {
    id: 'crash',
    name: 'Crash',
    tagline: 'Ride the curve, escape the rift.',
    icon: 'TrendingUp',
    accent: 'from-cyan-400 to-blue-600',
    href: '/games/crash',
    players: 1284,
    hot: true,
  },
  {
    id: 'mines',
    name: 'Mines',
    tagline: 'Sweep the grid, dodge the core.',
    icon: 'Bomb',
    accent: 'from-fuchsia-400 to-purple-600',
    href: '/games/mines',
    players: 942,
    hot: true,
  },
  {
    id: 'coinflip',
    name: 'Coin Flip',
    tagline: 'Pure 50/50 duel in 3D.',
    icon: 'CircleDollarSign',
    accent: 'from-amber-300 to-orange-600',
    href: '/games/coinflip',
    players: 611,
  },
  {
    id: 'cases',
    name: 'Case Rift',
    tagline: 'Unbox mythic-tier loot.',
    icon: 'Package',
    accent: 'from-violet-400 to-indigo-600',
    href: '/games/cases',
    players: 803,
    hot: true,
  },
  {
    id: 'towers',
    name: 'Towers',
    tagline: 'Climb tiles, bank multipliers.',
    icon: 'Building2',
    accent: 'from-emerald-300 to-teal-600',
    href: '/games/towers',
    players: 428,
  },
  {
    id: 'jackpot',
    name: 'Jackpot',
    tagline: 'Winner takes the whole pool.',
    icon: 'Trophy',
    accent: 'from-yellow-300 to-amber-600',
    href: '/games/jackpot',
    players: 356,
  },
  {
    id: 'wheel',
    name: 'Wheel',
    tagline: 'Twelve segments, one truth.',
    icon: 'Disc3',
    accent: 'from-rose-400 to-pink-600',
    href: '/games/wheel',
    players: 297,
  },
  {
    id: 'dice',
    name: 'Dice',
    tagline: 'Dial your own edge.',
    icon: 'Dices',
    accent: 'from-sky-300 to-cyan-600',
    href: '/games/dice',
    players: 512,
  },
  {
    id: 'upgrader',
    name: 'Upgrader',
    tagline: 'Gamble items into legends.',
    icon: 'ArrowBigUpDash',
    accent: 'from-lime-300 to-emerald-600',
    href: '/games/upgrader',
    players: 233,
    isNew: true,
  },
];

export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g])) as Record<
  GameMeta['id'],
  GameMeta
>;

/** Quick-select chip amounts used across every game's bet panel. */
export const QUICK_BETS = [10, 50, 100, 500, 1000] as const;

export const HOUSE_EDGE = 0.02;

export const FAQ = [
  {
    q: 'Is NOVARIFT real money gambling?',
    a: 'No. NOVARIFT is a front-end prototype. Every balance, item and outcome is simulated in your browser with mock data — nothing is stored on a server and nothing has monetary value.',
  },
  {
    q: 'How does provably fair work here?',
    a: 'Each round combines a client seed you control, a hashed server seed and an incrementing nonce. The UI exposes all three plus the resulting hash in the Provably Fair panel of every game, mirroring the flow a real backend would implement with HMAC-SHA256.',
  },
  {
    q: 'What are Rift Coins?',
    a: 'Rift Coins (RC) are the prototype currency. You start with a demo balance, and deposit/withdraw modals simulate transactions instantly with no payment processing involved.',
  },
  {
    q: 'Do I need a Roblox account?',
    a: 'The Roblox connection modal is a UI mock. It lets you preview a username, pick an avatar style and store a trade URL locally so the profile flow feels complete.',
  },
  {
    q: 'Can items be traded or withdrawn?',
    a: 'Inventory items can be sold back for coins or gambled in the Upgrader. Withdrawal is a simulated flow that resolves after a short delay.',
  },
  {
    q: 'How do levels and missions work?',
    a: 'Every wager grants XP. Levels unlock badges, rain eligibility and leaderboard visibility. Daily missions refresh on a timer and can be claimed from the Quest Log.',
  },
];

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Open the rift',
    body: 'Create an account in seconds — no email verification, no wallet, no friction. A demo balance lands instantly.',
    icon: 'UserPlus',
  },
  {
    step: '02',
    title: 'Pick your arena',
    body: 'Nine original game modes, each with configurable risk, live bet feeds and provably fair verification.',
    icon: 'Gamepad2',
  },
  {
    step: '03',
    title: 'Stack multipliers',
    body: 'Cash out early or push your luck. Every round grants XP toward badges, rain access and leaderboard rank.',
    icon: 'Rocket',
  },
  {
    step: '04',
    title: 'Claim the loot',
    body: 'Unbox cases, upgrade items into mythics, and convert your inventory back into Rift Coins whenever you want.',
    icon: 'Gem',
  },
];

export const FEATURES = [
  {
    title: 'Provably fair core',
    body: 'Client seed, hashed server seed and nonce surfaced on every single round.',
    icon: 'ShieldCheck',
    accent: 'from-cyan-400 to-blue-600',
  },
  {
    title: 'Instant settlement',
    body: 'Bets resolve in under 200ms with zero page reloads and optimistic balance updates.',
    icon: 'Zap',
    accent: 'from-amber-300 to-orange-600',
  },
  {
    title: 'Live rift chat',
    body: 'Global chat with rank badges, tipping and coin rain events every few minutes.',
    icon: 'MessagesSquare',
    accent: 'from-fuchsia-400 to-purple-600',
  },
  {
    title: 'Season progression',
    body: 'XP, levels, badges and a weekly leaderboard with a full podium payout.',
    icon: 'Medal',
    accent: 'from-emerald-300 to-teal-600',
  },
  {
    title: 'Loot economy',
    body: 'Five rarity tiers, case unboxing reels and an item upgrader with tunable odds.',
    icon: 'Boxes',
    accent: 'from-violet-400 to-indigo-600',
  },
  {
    title: 'Built to scale',
    body: 'Every data call routes through a typed service layer — swap mocks for Socket.io in one file.',
    icon: 'Blocks',
    accent: 'from-rose-400 to-pink-600',
  },
];

/** Daily reward ladder shown on the landing teaser + dashboard. */
export const DAILY_REWARDS = [
  { day: 1, amount: 100 },
  { day: 2, amount: 200 },
  { day: 3, amount: 350 },
  { day: 4, amount: 500 },
  { day: 5, amount: 800 },
  { day: 6, amount: 1200 },
  { day: 7, amount: 2500 },
];
