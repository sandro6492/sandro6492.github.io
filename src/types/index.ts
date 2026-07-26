/**
 * NOVARIFT — Global TypeScript domain model.
 *
 * These types describe the shape of the data the UI consumes. Today they are
 * satisfied by the mock services in `/services`; tomorrow they can be satisfied
 * by a real REST/WebSocket backend without touching a single component.
 */

/* -------------------------------------------------------------------------- */
/*                                    User                                    */
/* -------------------------------------------------------------------------- */

export type UserRole = 'player' | 'vip' | 'moderator' | 'admin';

export interface UserBadge {
  id: string;
  label: string;
  /** lucide-react icon name, resolved by <BadgePill /> */
  icon: string;
  /** tailwind gradient stops, e.g. "from-cyan-400 to-blue-500" */
  tint: string;
  description: string;
}

export interface UserStats {
  wagered: number;
  profit: number;
  wins: number;
  losses: number;
  biggestWin: number;
  gamesPlayed: number;
  winRate: number;
}

export interface RobloxLink {
  connected: boolean;
  username: string | null;
  userId: string | null;
  avatarUrl: string | null;
  tradeUrl: string | null;
  verifiedAt: string | null;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  level: number;
  xp: number;
  /** XP required to reach the next level */
  xpToNext: number;
  balance: number;
  createdAt: string;
  badges: UserBadge[];
  stats: UserStats;
  roblox: RobloxLink;
  /** Consecutive days claimed on the daily reward calendar */
  streak: number;
  lastClaimAt: string | null;
}

/* -------------------------------------------------------------------------- */
/*                                    Games                                   */
/* -------------------------------------------------------------------------- */

export type GameId =
  | 'coinflip'
  | 'jackpot'
  | 'cases'
  | 'towers'
  | 'mines'
  | 'crash'
  | 'wheel'
  | 'dice'
  | 'upgrader';

export interface GameMeta {
  id: GameId;
  name: string;
  tagline: string;
  /** lucide-react icon name */
  icon: string;
  accent: string; // tailwind gradient
  href: string;
  players: number;
  hot?: boolean;
  isNew?: boolean;
}

export type BetOutcome = 'win' | 'loss' | 'push' | 'pending';

export interface Bet {
  id: string;
  gameId: GameId;
  user: Pick<User, 'id' | 'username' | 'avatarUrl' | 'level'>;
  amount: number;
  multiplier: number;
  payout: number;
  outcome: BetOutcome;
  createdAt: string;
  /** Freeform per-game detail, e.g. "3 mines · 7 tiles" */
  detail?: string;
}

export interface LiveWin {
  id: string;
  username: string;
  avatarUrl: string;
  gameId: GameId;
  gameName: string;
  amount: number;
  multiplier: number;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/*                               Provably fair                                */
/* -------------------------------------------------------------------------- */

export interface FairSeed {
  clientSeed: string;
  serverSeedHashed: string;
  /** Only revealed after rotation — mocked here */
  serverSeedRevealed: string | null;
  nonce: number;
  hash: string;
}

/* -------------------------------------------------------------------------- */
/*                              Items / Cases                                 */
/* -------------------------------------------------------------------------- */

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface Item {
  id: string;
  name: string;
  rarity: Rarity;
  value: number;
  /** Emoji / glyph stand-in for a real sprite — keeps the prototype asset-free */
  glyph: string;
  collection: string;
}

export interface InventoryItem extends Item {
  instanceId: string;
  acquiredAt: string;
  locked: boolean;
}

export interface CaseDrop {
  item: Item;
  /** Relative weight, normalised at roll time */
  chance: number;
}

export interface CaseDefinition {
  id: string;
  name: string;
  price: number;
  tagline: string;
  accent: string;
  glyph: string;
  drops: CaseDrop[];
  opens: number;
}

/* -------------------------------------------------------------------------- */
/*                                    Chat                                    */
/* -------------------------------------------------------------------------- */

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  level: number;
  role: UserRole;
  body: string;
  createdAt: string;
  /** Rain / tip system events render differently */
  kind: 'message' | 'rain' | 'tip' | 'system';
  amount?: number;
}

/* -------------------------------------------------------------------------- */
/*                            Leaderboard & missions                          */
/* -------------------------------------------------------------------------- */

export type LeaderboardScope = 'winnings' | 'level' | 'weekly';

export interface LeaderboardEntry {
  rank: number;
  user: Pick<User, 'id' | 'username' | 'avatarUrl' | 'level'>;
  value: number;
  change: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  reward: number;
  claimed: boolean;
  tier: 'daily' | 'weekly' | 'season';
}

/* -------------------------------------------------------------------------- */
/*                                   Admin                                    */
/* -------------------------------------------------------------------------- */

export interface AdminUserRow {
  id: string;
  username: string;
  avatarUrl: string;
  role: UserRole;
  balance: number;
  wagered: number;
  status: 'active' | 'suspended' | 'flagged';
  joinedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  reward: number;
  uses: number;
  maxUses: number;
  active: boolean;
  expiresAt: string;
}

export interface SystemToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface PlatformStats {
  onlinePlayers: number;
  jackpotPool: number;
  totalWinnings: number;
  betsToday: number;
  housePnl: number;
  newSignups: number;
}

/* -------------------------------------------------------------------------- */
/*                              Notifications                                 */
/* -------------------------------------------------------------------------- */

export type ToastKind = 'success' | 'error' | 'info' | 'reward';

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
  duration?: number;
}
