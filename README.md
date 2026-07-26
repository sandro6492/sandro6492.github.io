# NOVARIFT

**Rift the odds. Rule the grid.**

A fully client-side, futuristic gaming & rewards platform prototype. Nine original game modes, a loot economy, live chat, leaderboards and an admin console — all running on mock data in the browser, with **zero backend and zero database**.

> ⚠️ This is a front-end prototype. There is no real currency, no wagering and no payment processing. Every balance, item and outcome is simulated locally.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@theme` tokens) |
| Animation | Framer Motion |
| Client state | Zustand (+ `persist`) |
| Data fetching | TanStack Query v5 |
| Icons | lucide-react |
| Effects | canvas-confetti + Web Audio API |

---

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

No environment variables are required — the app runs entirely on mock transport out of the box.

---

## Project structure

```
src/
├── app/                    # App Router routes
│   ├── page.tsx            # Landing page
│   ├── games/              # /games index + 8 game routes
│   ├── cases/              # Case Rift unboxing
│   ├── leaderboard/        # Global leaderboards
│   ├── missions/           # Quest log
│   ├── dashboard/          # Overview · Profile · Wallet & Inventory
│   └── admin/              # Admin console prototype
│
├── components/
│   ├── ui/                 # Primitives (Button, Card, Modal, Tabs, Toggle…)
│   ├── common/             # Background, toasts, logo, coin display
│   ├── layout/             # AppShell, Providers, auth & wallet modals
│   ├── navigation/         # Navbar, Footer
│   ├── landing/            # Hero, live counters, wins feed, FAQ, CTA
│   ├── games/              # GameShell, BetPanel, fairness modal + per-game folders
│   ├── dashboard/          # Profile, wallet, leaderboard, missions
│   ├── chat/               # Global chat drawer
│   └── admin/              # Admin dashboard
│
├── hooks/                  # useGames, useUser, useChat, useGamePlay, useSound…
├── lib/
│   ├── constants.ts        # Brand, rarity tokens, game catalogue, FAQ
│   ├── mockData.ts         # All generators (users, items, cases, bets, chat)
│   ├── gameEngine.ts       # Pure game maths (crash, mines, towers, dice…)
│   ├── utils.ts            # Formatters, RNG helpers, mock hashing
│   └── store/              # Zustand stores (user, UI, game, chat)
├── services/               # Typed API layer with swappable transport
└── types/                  # Domain model
```

---

## Swapping mocks for a real backend

Every data call routes through `src/services/apiClient.ts`. Components never call `fetch` directly.

```ts
// src/services/apiClient.ts
export async function request<T>(path, resolve, init?): Promise<T> {
  if (API_CONFIG.mode === 'http') {
    const res = await fetch(`${API_CONFIG.baseUrl}${path}`, init);
    ...
  }
  await sleep(mockLatency());
  return resolve(); // local mock resolver
}
```

To go live:

1. Set `NEXT_PUBLIC_API_MODE=http` and `NEXT_PUBLIC_API_URL=https://api.example.com`.
2. Implement the endpoints already named in each service (`/auth/login`, `/games`, `/cases/:id/open`, `/leaderboard/:scope`, …).
3. Replace `createChannel()` with a Socket.io client — it exposes the same `subscribe(cb) => unsubscribe` contract used by the live feeds.

No component, hook or store changes are required.

---

## Game modes

| Game | Mechanic |
| --- | --- |
| **Crash** | Rising multiplier curve, manual + auto cash out, `0.99/(1-r)` distribution |
| **Mines** | 5×5 grid, 1–24 mines, combinatorial multiplier, cash out anytime |
| **Coin Flip** | True 3D CSS coin, Nova vs Rift, 1.96× payout |
| **Case Rift** | Horizontal roulette reel, 5 rarity tiers, published drop tables |
| **Towers** | 8-floor climb, three difficulties, per-floor multipliers |
| **Jackpot** | Shared pot weighted by contribution, live timer, ticket reel |
| **Wheel** | 24 segments, 1.5×–50×, weighted to a sub-1.0 expected return |
| **Dice** | Slider win chance, over/under, up to 49× |
| **Upgrader** | Trade an item up, success arc = `(source / target) × 0.98` |

Every game includes a sound toggle, a Provably Fair inspector (client seed, hashed server seed, nonce, round hash), a live bet-history tab and confetti/screen-shake win effects.

---

## Design system

- Deep slate/black base with neon cyan, blue and violet accents
- Glassmorphism (`.glass`, `.glass-strong`, `.neon-border`)
- Animated grid + drifting particle background
- Fully responsive: single-column mobile → sidebar desktop
- Honours `prefers-reduced-motion`

---

## Notes

- **No database, no ORM, no server persistence.** Session state lives in Zustand + `localStorage`.
- Avatars are generated as inline SVG data-URIs, so the app ships with no image assets.
- Sound effects are synthesized with the Web Audio API — no audio files.
- Fonts load from Google Fonts with system fallbacks, so the UI degrades gracefully offline.
