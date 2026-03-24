# TORCH Football

**Balatro meets college football.** A mobile card game where you pick plays, match up against AI defenses, and build TORCH points through smart playcalling.

**Play now:** [torch-two.vercel.app](https://torch-two.vercel.app/)

---

## What Is This

TORCH is a single-player card game that simulates college football through play selection. Each snap, you pick an offensive play card and a player card, then watch them clash against the AI's defensive scheme. Smart matchups produce big gains; bad reads get you stuffed.

4 fictional college teams with distinct schemes. 3-game seasons. TORCH points are your score AND your wallet — spend them on power-up cards or save them for the final tally.

## Teams

| Team | School | Offense | Defense |
|------|--------|---------|---------|
| **Boars** | Ridgemont | Run & Shoot | Press Man |
| **Werewolves** | Northern Pines | Triple Option | Cover 3 Zone |
| **Stags** | Crestview | Spread RPO | Swarm Blitz |
| **Serpents** | Blackwater | Air Raid | Pattern Match |

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
- **Fonts:** Teko, Rajdhani, Barlow Condensed (Google Fonts)
- **Audio:** Howler.js (crowd loops) + jsfxr (UI sounds)
- **Engine:** Custom snap resolver with gaussian distribution, coverage modifiers, badge combos
- **Hosting:** Vercel (static + serverless)

## Project Structure

```
src/
  main.js              # App router
  state.js             # Global state + version
  data/                # Teams, players (52), plays (80 with descriptions)
  engine/              # Snap resolver, game state, AI, commentary
  ui/components/       # Card builders (play, player, torch cards)
  ui/screens/          # Home, team select, pregame, gameplay, halftime, end game
  tests/               # Balance test harness
```

See [CLAUDE.md](CLAUDE.md) for full architecture docs, design system, and engine details.

## Deploy

```bash
npx vite build         # Production build
vercel --prod          # Deploy to Vercel
```

## Dev Tools

Add `?dev` to any URL or `localStorage.setItem('torch_dev', '1')`.

- `?test` — Visual test harness
- `?mockup` — Card component reference
- `window.runBalanceTest(100)` — Simulate 1200 drives, log balance stats

## Current Version

**v0.23.0** — Retuned football engine with balance-tested difficulty. Color-coded play cards, position-hero player cards, drive summary with ESPN-style play-by-play, Banded Clash pregame, TORCH points banner, broadcast commentary.
