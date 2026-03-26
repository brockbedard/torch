# TORCH Football

**Balatro meets college football.** A mobile card game where you call plays, exploit defensive weaknesses, and spend your score to gain an edge. Your TORCH points are your score AND your wallet.

**Play now:** [torch-two.vercel.app](https://torch-two.vercel.app/)

---

## What Is This

TORCH is a single-player football card game. Each snap, you pick a play card and a player card, then clash against the AI's defensive scheme. Smart matchups produce big gains; bad reads get you stuffed. Spend TORCH points on power-up cards from The Booster shop — or save them for a higher final score.

4 fictional college teams. Each plays real football with a distinct scheme identity. Picking your team changes your playbook, your draft pool, and how your offense looks on the field.

## The 4 Teams

| Team | School | Scheme | Identity |
|------|--------|--------|----------|
| **Boars** | Ridgemont | Power Spread | Run-first. Physical. Patient. |
| **Wolves** | Northern Pines | Spread Option | QB runs. Zone read. Speed kills. |
| **Stags** | Crestview | Air Raid | Quick throws. 4 receivers. Tempo. |
| **Serpents** | Blackwater | Multiple/Pro | Unpredictable. Disguise. Adapt. |

## Features

- **80 play cards** across 4 teams with real football concepts
- **52 players** with position abilities and OVR ratings
- **12 TORCH cards** — power-ups you buy with your score (Bronze/Silver/Gold)
- **The Booster** — card shop at halftime, after TDs, turnovers, and big stops
- **User-biased presentation** — the game is on YOUR side (colors, commentary, timing, mood)
- **Broadcast-style UI** — ESPN-inspired possession changes, TD celebrations with confetti
- **3-game seasons** with card and point persistence
- **Red zone tutorial** for first-time players

## Quick Start

```bash
git clone https://github.com/brockbedard/torch.git
cd torch
npm install
npx vite --host
```

Open the Network URL on your phone for the best experience.

## Tech Stack

- **Frontend:** Vite + vanilla JavaScript (no framework)
- **Rendering:** HTML5 Canvas 2D (field renderer with 7v7 formations and animations)
- **Fonts:** Teko, Rajdhani, Barlow Condensed (Google Fonts)
- **Audio:** Howler.js (crowd loops) + jsfxr (UI sounds)
- **Engine:** Custom snap resolver with gaussian distribution, coverage modifiers, badge combos
- **Icons:** game-icons.net SVG paths (CC BY 3.0)
- **Hosting:** Vercel (static)
- **Testing:** 639 automated engine assertions + 1200-drive balance test

## Project Structure

```
src/
  main.js              # App router
  state.js             # Global state, version, hand management, team draw weights
  data/                # Teams, players (52), plays (80), torch cards (12), icons
  engine/              # Snap resolver, game state, AI, commentary, TORCH points
  ui/components/       # Card builders, shop, tooltips, dev panel
  ui/effects/          # TORCH points fly-in animation
  ui/field/            # Canvas 2D field renderer, animator, play builder
  ui/screens/          # Home, team select, pregame, gameplay, halftime, end game
  tests/               # Smoke test (639 assertions), balance test, game simulation
docs/research/         # 7v7 football research, team scheme identity
```

See [CLAUDE.md](CLAUDE.md) for full architecture docs, design system, and engine details.

## Environments

| Environment | Branch | URL |
|---|---|---|
| Local | `dev` | `localhost:5173` |
| Preview | `dev` | Auto-generated per push |
| Production | `main` | [torch-two.vercel.app](https://torch-two.vercel.app/) |

## Dev Tools

Add `?dev` to any URL to activate the in-game dev panel.

- **Dev Panel** — Jump to gameplay, force results, give torch cards, apply game state
- **Smoke Test** — `node --input-type=module -e "import{runSmokeTest}from'./src/tests/smokeTest.js';runSmokeTest();"`
- **Balance Test** — `node --input-type=module -e "import{runBalanceTest}from'./src/tests/balanceTest.js';runBalanceTest(100);"`
- **Game Sim** — `node --input-type=module -e "import{runGameSim}from'./src/tests/gameSimTest.js';runGameSim(100);"`

## Current Version

**v0.25.2** — Economy rebalance, 12 TORCH cards with real SVG icons, The Booster shop, AI card behavior, user perspective bias, broadcast UI, red zone onboarding, automated testing.

## License

Private. All rights reserved.
