# TORCH — The Football Card Game

## What This Is
TORCH is a daily football card game. You pick offense or defense, draft your hand, and play cards one snap at a time against an AI opponent. Neither side knows what the other called. Cards clash, results reveal, and the drive plays out with real down-and-distance, a ticking clock, and a scoreboard.

The core question every snap: **"What would you call here?"**

Built as a mobile-first single-page app (430px max-width). Single HTML file with vanilla JS, no framework.

## Version Status
- **v0.6.1** — Legacy code in `public/index.html`. Functional but being replaced.
- **v0.7** — "First Testable Build." Significant redesign of daily mode. See `TORCH-GDD-v0.7.md` for the full spec.

### What's Changing in v0.7
- **Daily mode redesign** — Draft 5 from 10 cards, simultaneous card clash (neither side knows what the other called), real down/distance/clock/scoreboard
- **Bonus round** — Winners unlock a second round playing the other side of the ball
- **Simplified home screen** — One button ("Play Today's Torch"), no scheme/team clutter
- **Two teams** (down from 4) with strong visual identity
- **No campaign mode** (hidden, preserved in codebase)
- **No AI commentary** (static fallbacks only)
- **No scheme selection, no coin shop, no 90 rotating scenarios**
- **One test scenario** to validate core mechanics

### What's Preserved from v0.6.1
- Single HTML file architecture, vanilla JS, no build step
- PWA support (manifest, service worker, home screen install)
- Card system fundamentals, coverage logic, team/player data
- Sound engine, visual style, color palette, font stack

## Project Structure
```
torch-football/
├── public/
│   ├── index.html      ← The entire game (HTML + CSS + JS in one file)
│   ├── manifest.json   ← PWA manifest (home screen install)
│   └── sw.js           ← Service worker (offline caching)
├── api/
│   └── commentary.js   ← Vercel serverless function (not used in v0.7)
├── TORCH-GDD-v0.7.md   ← Game design document — the v0.7 spec
├── package.json
├── vercel.json
├── .env.example
└── CLAUDE.md            ← You are here
```

## How to Run
- **Local dev:** `npx serve public -l 3000`
- **Deploy:** `vercel --prod`
- **Production URL:** https://torch-two.vercel.app/

## Architecture

### Current State (v0.6.1 — legacy)
Everything lives in one HTML file. The "framework" is:
- `GS` — global game state object
- `setGs(fn)` — updates state and calls `render()`
- `render()` — wipes `root.innerHTML`, rebuilds the active screen via `buildXxx()` functions
- Screen functions: `buildTitle`, `buildDaily`, `buildIntro`, `buildGame`, `buildResult`, `buildShop`, `buildEnd`, `buildOnboarding`

### v0.7 Target Screens (per GDD)
1. **Home** — Logo + single "Play Today's Torch" button
2. **Team & Side Selection** — Pick team, pick offense/defense, see scenario context
3. **Draft** — See 10 cards, pick 5 (offense: 5 run + 5 pass; defense: 5 aggressive + 5 conservative)
4. **Gameplay** — Real down/distance, clock, scoreboard. Pick card → AI picks → CLASH → reveal
5. **Result** — Win/Tie/Loss, stats, shareable emoji result
6. **Bonus Round** — Winners play again as the other side of the ball

### Key Game Systems
- **The Clash** — Both sides pick a card simultaneously. Cards collide on screen, result reveals. This is the heartbeat of the game.
- **Card resolution** — Football logic determines outcomes. Screens beat blitzes. Deep routes beat single-high. Runs get stuffed against stacked boxes.
- **Draft system** — Pick 5 from 10. Drafted cards are your game plan; random draws after each snap are improvisation.
- **Hand management** — Always 5 cards in hand. Play 1, draw 1 random replacement.
- **Coverage logic** (`CVR` object) — 7 coverages (Cover 0-4, Man Free, Cover 6)
- **Teams & Players** — `TORCH_TEAMS` array (trimming to 2 teams for v0.7)
- **Sound engine** — Web Audio API synthesized 8-bit sounds (SND object)

### Football Knowledge
The game teaches through play, not explanation. Card helpers explain what a play IS, never what it's good against. Players learn through pattern recognition:
- Cover 2's true weakness is the deep middle seam
- Screens are the mathematical answer to Cover 0 blitz
- Play action only works if you've established the run
- Motion pre-snap identifies man vs zone coverage
- Cover 4 pattern-matches, it's not just soft zone

## Coding Conventions
- Vanilla JS, no transpilation, no build step
- ES5-compatible function expressions (not arrow functions) in most UI code
- DOM construction via `createElement` chains (not innerHTML for interactive elements)
- CSS-in-JS via `el.style.cssText` strings
- Font stack: Bebas Neue (headers), Press Start 2P (labels/badges), Barlow Condensed (body)
- Color palette: `--cyan`, `--gold`, `--green`, `--orange`, `--danger`, `--purple` on dark `--bg`
- All state in the `GS` object; `setGs()` triggers full re-render
- localStorage keys all prefixed with `torch_`

## Testing Plan
- **Audience:** Discord dynasty group (9 football-knowledgeable players)
- **Deploy to Vercel**, share URL
- **Key questions:** Can players finish in 5-7 min? Does the draft feel meaningful? Is the clash exciting or random? Do winners play the bonus round? Do losers come back tomorrow?
