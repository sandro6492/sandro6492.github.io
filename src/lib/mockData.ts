/**
 * NOVARIFT — Mock data generators.
 *
 * Everything the prototype renders originates here. Generators are pure and
 * deterministic in shape (never in value) so React Query, Zustand stores and
 * interval-driven "live" feeds can all pull from the same fixtures.
 */
import {
  type AdminUserRow,
  type Bet,
  type CaseDefinition,
  type ChatMessage,
  type GameId,
  type InventoryItem,
  type Item,
  type LeaderboardEntry,
  type LeaderboardScope,
  type LiveWin,
  type Mission,
  type PlatformStats,
  type PromoCode,
  type Rarity,
  type SystemToggle,
  type User,
  type UserBadge,
  type UserRole,
} from '@/types';
import { GAMES, GAME_BY_ID, RARITY } from './constants';
import { pick, randFloat, randInt, uid, weightedPick, xpForLevel } from './utils';

/* -------------------------------------------------------------------------- */
/*                                  Identity                                  */
/* -------------------------------------------------------------------------- */

const USERNAMES = [
  'Nyx', 'VoltRunner', 'PixelWraith', 'zeroKelvin', 'GlitchMonk', 'AuroraByte', 'RiftJunkie',
  'NeonSaint', 'KiloWatt', 'ObsidianFox', 'SynthPriest', 'HexHazard', 'LunarDrift', 'CtrlAltDefeat',
  'PlasmaKid', 'QuantumYak', 'ChromeVulture', 'VaporTide', 'NullPointer', 'MidnightAxiom',
  'SolarFlareX', 'BitCrusher', 'EchoNomad', 'ZephyrCode', 'CobaltGhost', 'IrisFalls', 'DeltaMoth',
  'RustyPhoton', 'TitanLoop', 'ArcadeSeer', 'FrostByteJr', 'HollowSignal', 'MegaHertz', 'OrbitalKat',
];

const AVATAR_PALETTES = [
  ['#22d3ee', '#6366f1'],
  ['#a78bfa', '#ec4899'],
  ['#fbbf24', '#f97316'],
  ['#34d399', '#0ea5e9'],
  ['#f472b6', '#8b5cf6'],
  ['#38bdf8', '#14b8a6'],
  ['#e879f9', '#f43f5e'],
];

/**
 * Deterministic SVG data-URI avatar. Keeps the prototype 100% offline while
 * still giving every user a distinct, on-brand identicon.
 */
export function avatarFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  const abs = Math.abs(h);
  const [c1, c2] = AVATAR_PALETTES[abs % AVATAR_PALETTES.length];
  const initials = seed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'NV';
  const rot = abs % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
<defs><linearGradient id="g" gradientTransform="rotate(${rot} 0.5 0.5)">
<stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>
<rect width="96" height="96" rx="28" fill="#0b1020"/>
<rect x="3" y="3" width="90" height="90" rx="26" fill="url(#g)" opacity="0.9"/>
<circle cx="${20 + (abs % 56)}" cy="${18 + (abs % 40)}" r="26" fill="#0b1020" opacity="0.28"/>
<text x="48" y="60" font-family="Verdana,sans-serif" font-size="34" font-weight="700"
 fill="#04070f" text-anchor="middle" opacity="0.85">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const ALL_BADGES: UserBadge[] = [
  { id: 'founder', label: 'Rift Founder', icon: 'Sparkles', tint: 'from-cyan-400 to-blue-600', description: 'Joined during the opening season.' },
  { id: 'highroller', label: 'High Roller', icon: 'Crown', tint: 'from-amber-300 to-orange-600', description: 'Wagered over 500K Rift Coins.' },
  { id: 'unboxer', label: 'Unboxer', icon: 'Package', tint: 'from-violet-400 to-indigo-600', description: 'Opened 250+ cases.' },
  { id: 'survivor', label: 'Mine Survivor', icon: 'Bomb', tint: 'from-fuchsia-400 to-purple-600', description: 'Cleared a 24-mine board.' },
  { id: 'rocketeer', label: 'Rocketeer', icon: 'Rocket', tint: 'from-rose-400 to-pink-600', description: 'Cashed out above 50× on Crash.' },
  { id: 'philanthropist', label: 'Rainmaker', icon: 'CloudRain', tint: 'from-emerald-300 to-teal-600', description: 'Made it rain 25 times in chat.' },
];

/* -------------------------------------------------------------------------- */
/*                                    Items                                   */
/* -------------------------------------------------------------------------- */

const ITEM_BLUEPRINTS: { name: string; glyph: string; rarity: Rarity; value: number; collection: string }[] = [
  { name: 'Static Shard', glyph: '🔹', rarity: 'common', value: 24, collection: 'Rift Basics' },
  { name: 'Coolant Cell', glyph: '🧊', rarity: 'common', value: 38, collection: 'Rift Basics' },
  { name: 'Copper Relay', glyph: '🔗', rarity: 'common', value: 55, collection: 'Rift Basics' },
  { name: 'Signal Flare', glyph: '🛰️', rarity: 'common', value: 72, collection: 'Rift Basics' },
  { name: 'Neon Blade', glyph: '🗡️', rarity: 'rare', value: 180, collection: 'Neon Drift' },
  { name: 'Pulse Visor', glyph: '🥽', rarity: 'rare', value: 245, collection: 'Neon Drift' },
  { name: 'Hover Deck', glyph: '🛹', rarity: 'rare', value: 310, collection: 'Neon Drift' },
  { name: 'Chrome Wolf', glyph: '🐺', rarity: 'epic', value: 690, collection: 'Apex Fauna' },
  { name: 'Void Prism', glyph: '🔮', rarity: 'epic', value: 880, collection: 'Void Cache' },
  { name: 'Plasma Katana', glyph: '⚔️', rarity: 'epic', value: 1150, collection: 'Void Cache' },
  { name: 'Solar Crown', glyph: '👑', rarity: 'legendary', value: 3400, collection: 'Regalia' },
  { name: 'Nova Core', glyph: '💠', rarity: 'legendary', value: 4600, collection: 'Regalia' },
  { name: 'Astral Dragon', glyph: '🐉', rarity: 'mythic', value: 12500, collection: 'Ascendant' },
  { name: 'Rift Singularity', glyph: '🌌', rarity: 'mythic', value: 21000, collection: 'Ascendant' },
];

export const ITEM_CATALOGUE: Item[] = ITEM_BLUEPRINTS.map((b, i) => ({
  id: `item_${i}_${b.name.toLowerCase().replace(/\s+/g, '_')}`,
  ...b,
}));

export function itemsByRarity(rarity: Rarity): Item[] {
  return ITEM_CATALOGUE.filter((i) => i.rarity === rarity);
}

export function randomItem(): Item {
  return weightedPick(ITEM_CATALOGUE.map((item) => ({ item, chance: RARITY[item.rarity].weight })));
}

export function makeInventoryItem(item: Item = randomItem()): InventoryItem {
  return {
    ...item,
    instanceId: uid('inv'),
    acquiredAt: new Date(Date.now() - randInt(0, 86_400_000 * 14)).toISOString(),
    locked: false,
  };
}

export function generateInventory(count = 12): InventoryItem[] {
  return Array.from({ length: count }, () => makeInventoryItem());
}

/* -------------------------------------------------------------------------- */
/*                                    Cases                                   */
/* -------------------------------------------------------------------------- */

function buildDrops(bias: Partial<Record<Rarity, number>>) {
  return ITEM_CATALOGUE.map((item) => ({
    item,
    chance: RARITY[item.rarity].weight * (bias[item.rarity] ?? 1),
  })).filter((d) => d.chance > 0);
}

export const CASES: CaseDefinition[] = [
  {
    id: 'case_starter',
    name: 'Starter Rift',
    price: 150,
    tagline: 'Cheap entry, honest odds.',
    accent: 'from-cyan-400 to-blue-600',
    glyph: '📦',
    opens: 184_233,
    drops: buildDrops({ common: 1.4, rare: 1, epic: 0.4, legendary: 0.12, mythic: 0.02 }),
  },
  {
    id: 'case_neon',
    name: 'Neon Cache',
    price: 650,
    tagline: 'Drift-tier gear, glowing hot.',
    accent: 'from-fuchsia-400 to-purple-600',
    glyph: '🎁',
    opens: 96_512,
    drops: buildDrops({ common: 0.7, rare: 1.6, epic: 1, legendary: 0.3, mythic: 0.06 }),
  },
  {
    id: 'case_void',
    name: 'Void Vault',
    price: 2200,
    tagline: 'Where epics become routine.',
    accent: 'from-violet-400 to-indigo-600',
    glyph: '🗃️',
    opens: 41_090,
    drops: buildDrops({ common: 0.25, rare: 1, epic: 1.8, legendary: 0.8, mythic: 0.16 }),
  },
  {
    id: 'case_ascendant',
    name: 'Ascendant Core',
    price: 7500,
    tagline: 'Mythic hunters only.',
    accent: 'from-amber-300 to-orange-600',
    glyph: '🏺',
    opens: 12_774,
    drops: buildDrops({ common: 0.05, rare: 0.4, epic: 1.4, legendary: 1.8, mythic: 0.6 }),
  },
];

export function rollCase(def: CaseDefinition): Item {
  return weightedPick(def.drops.map((d) => ({ item: d.item, chance: d.chance })));
}

/** Builds the long horizontal reel of items shown while a case spins. */
export function buildReel(def: CaseDefinition, winner: Item, length = 60, winnerIndex = 52): Item[] {
  const reel = Array.from({ length }, () => rollCase(def));
  reel[winnerIndex] = winner;
  return reel;
}

/* -------------------------------------------------------------------------- */
/*                                    Users                                   */
/* -------------------------------------------------------------------------- */

export function generateUser(overrides: Partial<User> = {}): User {
  const username = overrides.username ?? `${pick(USERNAMES)}${randInt(1, 99)}`;
  const level = overrides.level ?? randInt(3, 87);
  const wagered = randInt(5_000, 900_000);
  const wins = randInt(120, 4_800);
  const losses = randInt(120, 4_800);
  return {
    id: uid('usr'),
    username,
    email: `${username.toLowerCase()}@novarift.gg`,
    avatarUrl: avatarFor(username),
    role: 'player',
    level,
    xp: randInt(0, xpForLevel(level)),
    xpToNext: xpForLevel(level),
    balance: randInt(500, 250_000),
    createdAt: new Date(Date.now() - randInt(1, 700) * 86_400_000).toISOString(),
    badges: ALL_BADGES.slice(0, randInt(1, 4)),
    stats: {
      wagered,
      profit: randInt(-60_000, 180_000),
      wins,
      losses,
      biggestWin: randInt(2_000, 340_000),
      gamesPlayed: wins + losses,
      winRate: Number(((wins / (wins + losses)) * 100).toFixed(1)),
    },
    roblox: { connected: false, username: null, userId: null, avatarUrl: null, tradeUrl: null, verifiedAt: null },
    streak: randInt(0, 6),
    lastClaimAt: null,
    ...overrides,
  };
}

/** The signed-in demo account. */
export function createDemoUser(username = 'RiftPilot', email = 'pilot@novarift.gg'): User {
  return generateUser({
    id: 'usr_demo',
    username,
    email,
    avatarUrl: avatarFor(username),
    role: 'vip',
    level: 42,
    xp: 1_280,
    xpToNext: xpForLevel(42),
    balance: 25_000,
    badges: [ALL_BADGES[0], ALL_BADGES[1], ALL_BADGES[4]],
    streak: 3,
    stats: {
      wagered: 486_320,
      profit: 42_918,
      wins: 1_884,
      losses: 1_642,
      biggestWin: 128_400,
      gamesPlayed: 3_526,
      winRate: 53.4,
    },
  });
}

export const MOCK_USERS: User[] = Array.from({ length: 40 }, () => generateUser());

function lightUser(u: User) {
  return { id: u.id, username: u.username, avatarUrl: u.avatarUrl, level: u.level };
}

/* -------------------------------------------------------------------------- */
/*                                    Bets                                    */
/* -------------------------------------------------------------------------- */

const DETAILS: Record<GameId, () => string> = {
  crash: () => `escaped @ ${randFloat(1.1, 24).toFixed(2)}×`,
  mines: () => `${randInt(1, 24)} mines · ${randInt(1, 12)} tiles`,
  coinflip: () => pick(['heads', 'tails']),
  cases: () => pick(CASES).name,
  towers: () => `${randInt(1, 8)} floors`,
  jackpot: () => `${randInt(2, 24)} players`,
  wheel: () => `${pick(['1.5×', '2×', '3×', '5×', '50×'])} segment`,
  dice: () => `${pick(['over', 'under'])} ${randInt(4, 96)}`,
  upgrader: () => `${randInt(5, 85)}% odds`,
};

export function generateBet(gameId: GameId = pick(GAMES).id, user?: User): Bet {
  const u = user ?? pick(MOCK_USERS);
  const amount = randInt(10, 25_000);
  const win = Math.random() > 0.48;
  const multiplier = win ? Number(randFloat(1.05, 18).toFixed(2)) : 0;
  return {
    id: uid('bet'),
    gameId,
    user: lightUser(u),
    amount,
    multiplier,
    payout: Number((amount * multiplier).toFixed(2)),
    outcome: win ? 'win' : 'loss',
    createdAt: new Date(Date.now() - randInt(0, 600_000)).toISOString(),
    detail: DETAILS[gameId](),
  };
}

export function generateBets(count = 20, gameId?: GameId): Bet[] {
  return Array.from({ length: count }, () => generateBet(gameId)).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export function generateLiveWin(): LiveWin {
  const game = pick(GAMES);
  const user = pick(MOCK_USERS);
  const multiplier = Number(randFloat(1.4, 42).toFixed(2));
  return {
    id: uid('win'),
    username: user.username,
    avatarUrl: user.avatarUrl,
    gameId: game.id,
    gameName: game.name,
    amount: Math.round(randInt(80, 6_000) * multiplier),
    multiplier,
    createdAt: new Date().toISOString(),
  };
}

export function generateLiveWins(count = 12): LiveWin[] {
  return Array.from({ length: count }, generateLiveWin);
}

/* -------------------------------------------------------------------------- */
/*                                    Chat                                    */
/* -------------------------------------------------------------------------- */

const CHAT_LINES = [
  'that crash round was criminal 😭',
  'gg on the mythic pull',
  'anyone else running 3 mines only?',
  'cashed 12.4x lets gooo',
  'rain when 👀',
  'towers is rigged (it is not, i am just bad)',
  'first mythic in 400 cases, worth it',
  'dice at 4% win chance is pure adrenaline',
  'upgrader took my chrome wolf. rip.',
  'jackpot pool is fat right now',
  'wheel 50x segment exists?? proof needed',
  'wagered my whole balance on one flip. heads.',
  'the neon cache odds feel generous today',
  'grinding to level 50 tonight',
  'someone tip me 10 coins i beg',
  'provably fair panel is a nice touch ngl',
];

export function generateChatMessage(kind: ChatMessage['kind'] = 'message'): ChatMessage {
  const u = pick(MOCK_USERS);
  const role: UserRole = pick<UserRole>(['player', 'player', 'player', 'vip', 'moderator']);
  if (kind === 'rain') {
    return {
      id: uid('msg'), userId: u.id, username: u.username, avatarUrl: u.avatarUrl, level: u.level,
      role, body: 'made it rain on the rift!', createdAt: new Date().toISOString(),
      kind: 'rain', amount: randInt(500, 15_000),
    };
  }
  if (kind === 'tip') {
    return {
      id: uid('msg'), userId: u.id, username: u.username, avatarUrl: u.avatarUrl, level: u.level,
      role, body: `tipped ${pick(MOCK_USERS).username}`, createdAt: new Date().toISOString(),
      kind: 'tip', amount: randInt(50, 2_500),
    };
  }
  return {
    id: uid('msg'), userId: u.id, username: u.username, avatarUrl: u.avatarUrl, level: u.level,
    role, body: pick(CHAT_LINES), createdAt: new Date().toISOString(), kind: 'message',
  };
}

export function generateChatHistory(count = 18): ChatMessage[] {
  return Array.from({ length: count }, () =>
    generateChatMessage(Math.random() > 0.9 ? pick(['rain', 'tip']) : 'message'),
  );
}

/* -------------------------------------------------------------------------- */
/*                                Leaderboards                                */
/* -------------------------------------------------------------------------- */

export function generateLeaderboard(scope: LeaderboardScope, count = 25): LeaderboardEntry[] {
  const pool = [...MOCK_USERS];
  const valued = pool.map((u) => ({
    user: lightUser(u),
    value:
      scope === 'level' ? u.level : scope === 'weekly' ? randInt(4_000, 420_000) : u.stats.biggestWin,
    change: randInt(-6, 6),
  }));
  return valued
    .sort((a, b) => b.value - a.value)
    .slice(0, count)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

/* -------------------------------------------------------------------------- */
/*                                  Missions                                  */
/* -------------------------------------------------------------------------- */

/**
 * Missions use a *deterministic* starting progress so the server and client
 * render identical markup — random values here would cause hydration errors.
 */
export function generateMissions(): Mission[] {
  const base: (Omit<Mission, 'claimed'>)[] = [
    { id: 'm1', title: 'Warm the core', description: 'Place 10 bets in any game mode.', icon: 'Flame', target: 10, progress: 6, reward: 250, tier: 'daily' },
    { id: 'm2', title: 'Rift sweeper', description: 'Cash out 3 Mines rounds safely.', icon: 'Bomb', target: 3, progress: 3, reward: 400, tier: 'daily' },
    { id: 'm3', title: 'Altitude', description: 'Escape a Crash round above 5×.', icon: 'Rocket', target: 1, progress: 0, reward: 600, tier: 'daily' },
    { id: 'm4', title: 'Loot hunter', description: 'Open 5 cases of any tier.', icon: 'Package', target: 5, progress: 2, reward: 500, tier: 'daily' },
    { id: 'm5', title: 'Weekly grind', description: 'Wager 100,000 Rift Coins this week.', icon: 'TrendingUp', target: 100_000, progress: 64_200, reward: 5_000, tier: 'weekly' },
    { id: 'm6', title: 'Season ascension', description: 'Reach account level 50.', icon: 'Medal', target: 50, progress: 42, reward: 25_000, tier: 'season' },
  ];
  return base.map((m) => ({ ...m, claimed: false }));
}

/* -------------------------------------------------------------------------- */
/*                                   Admin                                    */
/* -------------------------------------------------------------------------- */

export function generateAdminUsers(count = 24): AdminUserRow[] {
  return MOCK_USERS.slice(0, count).map((u) => ({
    id: u.id,
    username: u.username,
    avatarUrl: u.avatarUrl,
    role: pick<UserRole>(['player', 'player', 'player', 'vip', 'moderator']),
    balance: u.balance,
    wagered: u.stats.wagered,
    status: pick(['active', 'active', 'active', 'active', 'flagged', 'suspended'] as const),
    joinedAt: u.createdAt,
  }));
}

export const PROMO_CODES: PromoCode[] = [
  { id: 'p1', code: 'RIFTOPEN', reward: 500, uses: 3_412, maxUses: 10_000, active: true, expiresAt: new Date(Date.now() + 6 * 86_400_000).toISOString() },
  { id: 'p2', code: 'NEON250', reward: 250, uses: 9_980, maxUses: 10_000, active: true, expiresAt: new Date(Date.now() + 2 * 86_400_000).toISOString() },
  { id: 'p3', code: 'MYTHICHUNT', reward: 1_500, uses: 640, maxUses: 2_000, active: false, expiresAt: new Date(Date.now() - 86_400_000).toISOString() },
];

export const SYSTEM_TOGGLES: SystemToggle[] = [
  { id: 's1', label: 'Maintenance mode', description: 'Freeze all games and show a maintenance splash.', enabled: false },
  { id: 's2', label: 'Global chat', description: 'Allow players to post in the rift chat drawer.', enabled: true },
  { id: 's3', label: 'Coin rain', description: 'Automatic rain events every ~15 minutes.', enabled: true },
  { id: 's4', label: 'Case unboxing', description: 'Enable the Case Rift and Upgrader economy.', enabled: true },
  { id: 's5', label: 'New signups', description: 'Accept new account registrations.', enabled: true },
  { id: 's6', label: 'Withdrawals', description: 'Allow players to withdraw their balance.', enabled: false },
];

export function generatePlatformStats(): PlatformStats {
  return {
    onlinePlayers: randInt(4_200, 6_800),
    jackpotPool: randInt(800_000, 1_600_000),
    totalWinnings: randInt(180_000_000, 220_000_000),
    betsToday: randInt(240_000, 480_000),
    housePnl: randInt(-40_000, 260_000),
    newSignups: randInt(600, 2_400),
  };
}

/** Sparkline-friendly series for admin charts. */
export function generateSeries(points = 24, min = 20, max = 100): number[] {
  let value = randInt(min, max);
  return Array.from({ length: points }, () => {
    value = Math.max(min, Math.min(max, value + randInt(-12, 14)));
    return value;
  });
}

export { GAME_BY_ID };
