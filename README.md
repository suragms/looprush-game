# 🌀 Loop Rush

> A fast-paced neon arcade survival game — dodge obstacles, collect energy, build combos, and beat your high score.

![Loop Rush](https://img.shields.io/badge/version-1.0.0-blueviolet?style=flat-square)
![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-ready-orange?style=flat-square)
![Tests](https://img.shields.io/badge/tests-94%20passing-success?style=flat-square)

---

## 🎮 About the Game

**Loop Rush** is a mobile-first, neon-styled browser arcade game built with **Phaser 3** and **React 18**. Survive as long as you can in an ever-accelerating arena filled with enemy obstacles — chasers, bouncers, spinners, and more. Collect energy orbs to build your combo multiplier, dash through danger, and rack up near misses for bonus points.

### Core Gameplay Loop
1. **Move** your orb around the arena using touch or keyboard/mouse
2. **Collect** green energy orbs to build your combo multiplier
3. **Dodge** enemy obstacles that spawn and accelerate over time
4. **Dash** through obstacles for invulnerability frames — and bonus dodge points
5. **Score** is based on survival time, energy collected, combo multiplier, and near misses

---

## ✨ Features

### Gameplay
- 🎯 **8 Obstacle Types** — Basic Chasers, Speed Chasers, Bouncers, Spinners, Hunters, Splitters, Lasers, Meteors
- ⚡ **Dash System** — Invulnerability dash with cooldown indicator
- 🔥 **Combo Multiplier** — Up to x20, boosts score and player speed
- 💎 **Gold Energy Orbs** — High-value pickups worth 8× base score
- 🌀 **Near-Miss Detection** — Pass close to obstacles for bonus points
- 📈 **Dynamic Difficulty** — 12 levels, ramping every 30 seconds
- 🎪 **Random Events** — Blackout, Energy Storm, Gold Rush, Speed Surge

### Power-Ups
| Power-Up | Effect |
|---|---|
| 🛡 Shield | Absorbs one hit |
| 🧲 Magnet | Attracts nearby energy orbs |
| ⏱ Slow Time | Halves all obstacle speeds |
| 👻 Ghost Mode | Phase through all obstacles |
| 🌟 Score Boost | 2× score multiplier |
| 💥 Energy Blast | Destroys nearby obstacles |

### Meta & Progression
- 🏆 **9 Achievements** — First Run, Survivor, Combo Master, Dash Master, and more
- 🎨 **Cosmetic Customization** — Unlock orb colors, trails, dash effects, and arena themes
- 📅 **Daily Challenges** — New goals generated from a daily seed
- 📊 **Stats Tracking** — High score, total games, survival time, combos, near misses
- 💾 **Persistent Save** — localStorage with versioned migration system

### Technical
- 📱 **Mobile-First PWA** — Installable, full-screen, portrait-optimized
- 🎵 **Web Audio** — Procedural sound effects with volume/SFX controls
- 🖼 **Procedural Graphics** — All textures generated in-engine; no external assets
- ♿ **Accessibility** — Reduced motion, screen shake toggle, focus-visible styles

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Game Engine | [Phaser 3](https://phaser.io/) |
| UI Framework | [React 18](https://react.dev/) |
| State Management | [Zustand](https://github.com/pmndrs/zustand) |
| Language | TypeScript 5 |
| Bundler | Vite 5 |
| Styling | Tailwind CSS 3 |
| PWA | vite-plugin-pwa |
| Testing | Vitest |

---

## 🏗 Architecture

```
src/
├── App.tsx                   # Screen router
├── main.tsx                  # React entry point
├── index.css                 # Global styles + Tailwind
│
├── components/               # Reusable UI components
│   ├── NeonButton.tsx
│   ├── StatCard.tsx
│   ├── ToastContainer.tsx
│   └── Toggle.tsx
│
├── screens/                  # Full-screen React views
│   ├── HomeScreen.tsx        # Main menu
│   ├── GameScreen.tsx        # Phaser canvas host + overlay controls
│   ├── ResultScreen.tsx      # Post-game summary
│   ├── SettingsScreen.tsx
│   ├── AchievementsScreen.tsx
│   ├── StatsScreen.tsx
│   ├── CustomizeScreen.tsx
│   └── DailyChallengeScreen.tsx
│
├── game/                     # Phaser game engine
│   ├── scenes/
│   │   ├── BootScene.ts      # Fast boot → Preload
│   │   ├── PreloadScene.ts   # Procedural texture generation
│   │   ├── GameScene.ts      # Main game logic (720×1280 arena)
│   │   └── HUDScene.ts       # Overlay HUD (score, combo, dash)
│   │
│   ├── systems/              # Pure logic systems (unit-tested)
│   │   ├── ComboSystem.ts
│   │   ├── ScoringSystem.ts
│   │   ├── DifficultySystem.ts
│   │   ├── DashSystem.ts
│   │   ├── NearMissSystem.ts
│   │   ├── PowerupSystem.ts
│   │   └── EventSystem.ts
│   │
│   ├── managers/             # Phaser-integrated managers
│   │   ├── EntityManager.ts  # Obstacle/energy/powerup spawning & pooling
│   │   ├── InputManager.ts   # Touch + keyboard + pointer input
│   │   └── AudioManager.ts   # Web Audio API sound effects & music
│   │
│   ├── config/               # Tuning & constants
│   │   ├── balance.ts        # Gameplay balance (all pure functions)
│   │   ├── constants.ts      # Colors, textures, scene keys, physics
│   │   ├── achievements.ts   # Achievement definitions
│   │   ├── challenges.ts     # Daily challenge generation
│   │   ├── cosmetics.ts      # Unlock conditions
│   │   └── theme.ts          # Arena theme colors
│   │
│   └── utils/
│       ├── pool.ts           # Generic object pool
│       └── math.ts           # Math helpers (angleTo, randRange, etc.)
│
├── hooks/
│   └── usePhaserGame.ts      # React hook for Phaser lifecycle
│
├── store/
│   ├── gameStore.ts          # Screen routing, game-over handler, toasts
│   └── settingsStore.ts      # Settings & save data bridge
│
├── storage/
│   ├── saveManager.ts        # localStorage read/write
│   ├── defaults.ts           # Default save data
│   ├── migration.ts          # Versioned save migration
│   └── validate.ts           # Save data validation
│
├── types/                    # Shared TypeScript types
│
└── tests/                    # Vitest unit tests
    ├── combo.test.ts
    ├── math.test.ts
    ├── systems.test.ts
    ├── storage.test.ts
    └── challenges.test.ts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **npm** 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/suragms/looprush-game.git
cd looprush-game

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** If you encounter a cached PWA from another app on the same port, clear the service worker via DevTools → Application → Service Workers → Unregister, then reload.

### Building for Production

```bash
npm run build
```

Output is in the `dist/` folder. Includes a service worker for offline play.

### Preview Production Build

```bash
npm run preview
```

---

## 🧪 Testing

```bash
# Run all tests once
npm run test

# Watch mode
npm run test:watch
```

**94 tests across 5 test files:**
- `combo.test.ts` — Combo tier logic & multiplier math
- `math.test.ts` — Arena math utilities
- `systems.test.ts` — Game systems (ComboSystem, ScoringSystem, DifficultySystem, DashSystem, PowerupSystem)
- `storage.test.ts` — Save validation & migration
- `challenges.test.ts` — Daily challenge generation & determinism

---

## 🎮 Controls

### Mobile (Touch)
| Action | Control |
|---|---|
| Move | Drag / Swipe |
| Dash | Tap DASH button (bottom right) |
| Pause | Tap ⏸ button (top left) |

### Desktop (Keyboard)
| Action | Control |
|---|---|
| Move | `W A S D` or Arrow Keys |
| Dash | `Space` or `Shift` |
| Pause | `Escape` or `P` |

### Desktop (Mouse)
| Action | Control |
|---|---|
| Move | Click & drag toward cursor direction |
| Dash | Right mouse button / dedicated button |

---

## 🎨 Customization System

Cosmetics are unlocked by reaching milestones — **not purchased**. All content is earned through gameplay.

| Category | Items | Unlock Condition |
|---|---|---|
| **Orb Colors** | Magenta, Plasma, Solar, Void, Ember | Score/games/level milestones |
| **Trails** | Comet, Spark | Energy collected / near misses |
| **Dash Effects** | Burst, Shock | Dash dodges / high level |
| **Arena Themes** | Abyss, Rose | Level / games played |

---

## 🏆 Achievements

| Achievement | Description |
|---|---|
| First Run | Play your first game |
| Survivor | Survive for 2 minutes in a single run |
| Untouchable | Reach Level 5 in a single run |
| Combo Master | Reach x20 combo |
| Dash Master | Dodge 25 obstacles using Dash |
| Energy Hunter | Collect 1,000 total energy |
| Veteran | Play 100 games |
| Near Miss Pro | Perform 100 near misses total |
| High Scorer | Score 10,000+ in a single run |

---

## ⚙️ Configuration

All gameplay balance is centralized in [`src/game/config/balance.ts`](src/game/config/balance.ts). Key values:

```ts
// Player
baseSpeed: 420 px/s
comboSpeedPerTier: 14 px/s (capped at +180)

// Dash
speed: 1150 px/s
duration: 0.16s
cooldown: 1.4s

// Combo
decayTime: 3.2s      // Time without pickup before combo drops
tiers: [1, 2, 3, 5, 10, 20]

// Difficulty
levelDuration: 30s   // Seconds per level
obstacleBaseSpeed: 90 px/s
obstacleSpeedPerLevel: 22 px/s (capped at +320)
```

---

## 📦 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run all Vitest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | ESLint check (zero warnings) |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Prettier format all source files |
| `npm run typecheck` | TypeScript type check only |

---

## 📱 PWA / Offline

Loop Rush is a full **Progressive Web App**:
- ✅ Installable on Android and iOS (Add to Home Screen)
- ✅ Full-screen / standalone display
- ✅ Offline capable via Workbox service worker
- ✅ Portrait orientation locked
- ✅ All assets procedurally generated — no external downloads needed

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure all tests pass (`npm run test`) and there are no lint errors (`npm run lint`) before submitting a PR.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Surag MS**  
GitHub: [@suragms](https://github.com/suragms)

---

<p align="center">
  Made with ❤️ and neon lights
</p>
