# TORCH — The Football Card Game

## What This Is
TORCH is a daily football card game. You pick offense or defense, draft your hand, and play cards one snap at a time against an AI opponent. Neither side knows what the other called. Cards clash, results reveal, and the drive plays out with real down-and-distance, a ticking clock, and a scoreboard.

The core question every snap: **"What would you call here?"**

Built as a mobile-first single-page app (430px max-width). Single HTML file with vanilla JS, no framework.

## Version Status
- **v0.6.1** — Legacy. Replaced entirely.
- **v0.7** — "First Testable Build." Active development. See `TORCH-GDD-v0.7.md` for design spec, `TORCH-MATCHUP-TABLE-v0.7.md` for card matchup logic.

## Project Structure
```
torch-football/
├── public/
│   ├── index.html              ← The entire game (HTML + CSS + JS in one file)
│   ├── manifest.json           ← PWA manifest (home screen install)
│   └── sw.js                   ← Service worker (offline caching)
├── api/
│   └── commentary.js           ← Vercel serverless function (not used in v0.7)
├── TORCH-GDD-v0.7.md           ← Game design document
├── TORCH-MATCHUP-TABLE-v0.7.md ← Card matchup logic reference
├── package.json
├── vercel.json
├── .env.example
└── CLAUDE.md                    ← You are here
```

## How to Run
- **Local dev:** `npx serve public -l 3000`
- **Deploy:** `vercel --prod`
- **Production URL:** https://torch-two.vercel.app/

## Architecture

### Screen Flow
Home → Team + Side Selection → Player Draft → Card Draft → Gameplay → Result

### Implemented Screens (v0.7)
1. **Home** — Logo, animated flame, "Play Today's Torch" button, expandable How to Play / What is a Torch
2. **Setup** — Retro LED scoreboard with split-flap team name animation, team picker (2 teams), offense/defense picker, crowd ambience
3. **Player Draft** — Pick 1 QB + 3 skill players from team-specific pool of 6. "Pick For Me" random button.
4. **Card Draft** — Pick 5 play cards from team-specific pool of 10. "Pick For Me" button.
5. **Gameplay** — PLACEHOLDER. The clash mechanic goes here.
6. **Result** — PLACEHOLDER.

### Teams & Schemes
- **Iron Ridge** (Triple Option) — 7 run / 3 pass offensive cards. Paul Johnson-inspired option attack.
  - Cards: Triple Option, Midline, Rocket Toss, Trap, QB Keeper, Power, Zone Read, QB Sneak, PA Post, PA Flat
  - Players: Bo Kendrick, Tate Larkin (QBs), Mack Torres, Jaylen Sims, Duke Owens, Cade Buckley (skill)
- **Canyon Tech** (Air Raid) — 2 run / 8 pass offensive cards. Mike Leach-inspired air attack.
  - Cards: Mesh, Four Verts, Shallow Cross, Y-Corner, Stick, Slant, Go Route, Bubble Screen, Draw, QB Sneak
  - Players: Colt Avery, Dash Meyers (QBs), Quez Sampson, Dante Liu, Rio Vasquez, Kirby Walsh (skill)
- **Defense** (same for both teams): Blitz, Corner Blitz, Press Man, Safety Blitz, Line Stunt, Cover 2, Cover 3, Cover 4, Spy, Prevent

### Key Game Systems
- **Scoreboard** — Retro LED with CSS split-flap animations, crowd ambience via Web Audio filtered noise
- **Matchup Table** (`MT` object) — Card-vs-card lookup: offense card ID → defense card ID → tier (O+/N/D+/TO)
- **Yard resolution** — `rollYards(tier)` returns randomized yards per tier. `isTurnover(tier)` for TO-tier plays (~20% chance).
- **The Scenario** — 2nd & 10, DEF 35, down 7, 2:45 left, 1 timeout. Offense needs TD. Go for 2 to win, XP to tie.
- **Sound engine** (`SND`) — Web Audio synth: click, select, snap, menu, td, turnover, clash, draft, flip, crowdStart/crowdStop

### Football Knowledge (matchup design principles)
- Quick passes (Mesh, Slant, Stick, Shallow Cross, Bubble Screen) beat blitzes and aggressive pressure
- Deep shots (Four Verts, Y-Corner, Go Route) beat soft zone, get picked off against deep coverage
- Triple Option runs devastate soft zones but die to interior pressure and spy LBs
- Spy is the hard counter to QB Keeper
- Play-action works as a constraint play (neutral-to-good in v0.7)
- Cover 2's weakness: deep sideline (Y-Corner, Corner Route) and deep middle (PA Post)
- Cover 3's weakness: the flat

## Coding Conventions
- Vanilla JS, no transpilation, no build step
- ES5-compatible function expressions (not arrow functions) in UI code
- DOM construction via `createElement` chains
- CSS-in-JS via `el.style.cssText` strings
- Font stack: Bebas Neue (headers), Press Start 2P (labels/badges/LED), Barlow Condensed (body)
- Color palette: `--cyan`, `--gold`, `--green`, `--orange`, `--danger`, `--purple` on dark `--bg`
- All state in the `GS` object; `setGs()` triggers full re-render
- localStorage keys prefixed with `torch_`

## What's Next
- **Gameplay screen** — The clash mechanic: pick card → AI picks → cards collide → result reveals → down/distance/clock update
- **Result screen** — Win/Tie/Loss, stats, shareable emoji result
- **Bonus round** — Winners play again as the other side of the ball
- **Polish** — Card helper buttons, better animations, sound tuning

## Testing Plan
- **Audience:** Discord dynasty group (9 football-knowledgeable players)
- **Deploy to Vercel**, share URL
- **Key questions:** Can players finish in 5-7 min? Does the draft feel meaningful? Is the clash exciting or random? Do winners play the bonus round? Do losers come back tomorrow?
