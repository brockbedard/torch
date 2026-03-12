# TORCH — The Football Card Game

## What This Is
TORCH is a daily football card game. You pick offense or defense, draft your hand, and play cards one snap at a time against an AI opponent. Neither side knows what the other called. Cards clash, results reveal, and the drive plays out with real down-and-distance, a ticking clock, and a scoreboard.

The core question every snap: **"What would you call here?"**

Built as a mobile-first single-page app (430px max-width). Single HTML file with vanilla JS, no framework.

## Version Status
- **v0.6.1** — Legacy. Replaced entirely.
- **v0.7** — "First Testable Build." Active development. See `TORCH-GDD-v0.7.md` for design spec, `TORCH-MATCHUP-TABLE-v0.7.md` for card matchup logic, `TORCH-DEFENSE-SPEC-v0.7.md` for defensive scheme details.

## Project Structure
```
torch-football/
├── public/
│   ├── index.html              ← The entire game (~1800 lines: HTML + CSS + JS)
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
Home → Team + Side Selection → Player Draft → Card Draft → **Gameplay** → Result

### Implemented Screens (v0.7)
1. **Home** — Logo, animated flame, "Play Today's Torch" button, expandable How to Play / What is a Torch
2. **Setup** — Retro LED scoreboard (stadium centerpiece with metallic frame, glowing LED cells, corner bolts), team picker (2 teams as portrait trading cards), offense/defense picker, punchy tagline, crowd ambience
3. **Player Draft** — Pick 1 QB/LB + 3 skill players from team-specific pool of 6. Side-aware: shows offensive players (QB + skill) or defensive players (LB + DBs). Portrait trading card layout.
4. **Card Draft** — Pick 5 play cards from team-specific pool of 10. Offensive or defensive cards based on side. Portrait trading cards with SVG play diagrams. "Pick For Me" button.
5. **Gameplay** — Full drive simulation with scorebug, field visualization, clash mechanic, hand management, AI play-calling, drive logic (downs, clock, turnovers).
6. **Result** — Win ("TORCH LIT") or loss ("TORCH OUT") with final score and drive stats.

### Teams & Schemes
- **Iron Ridge** (Triple Option offense / "The Process" defense)
  - Offense cards (7 run / 3 pass): Triple Option, Midline, Rocket Toss, Trap, QB Keeper, Power, Zone Read, QB Sneak, PA Post, PA Flat
  - Defense cards (Saban-inspired, 5 zone / 5 aggressive): Rip/Liz Match, Cover 4 Match, MOD, Cover 6, Bracket, Skinny, MEG, Gap Integrity, Fire Zone, Robber
  - Offensive players: Bo Kendrick, Tate Larkin (QBs), Mack Torres, Jaylen Sims, Duke Owens, Cade Buckley (skill)
  - Defensive players: Dez Lawson, Knox Barrett (LBs), Terrance Gill, Aiden Kemp, Roman Slade, Malik Ware (DBs)
- **Canyon Tech** (Air Raid offense / "Send Everybody" defense)
  - Offense cards (2 run / 8 pass): Mesh, Four Verts, Shallow Cross, Y-Corner, Stick, Slant, Go Route, Bubble Screen, Draw, QB Sneak
  - Defense cards (Williams-inspired, 5 blitz / 5 coverage): Overload Blitz, DB Blitz, Zero Cover, A-Gap Mug, Edge Crash, Cover 2 Buc, Man Press, Zone Blitz Drop, Spy, Prevent
  - Offensive players: Colt Avery, Dash Meyers (QBs), Quez Sampson, Dante Liu, Rio Vasquez, Kirby Walsh (skill)
  - Defensive players: Jace Wilder, Darius Moon (LBs), Zion Crews, Ty Bishop, Andre Knox, Kai Orozco (DBs)

### Key Game Systems
- **Scoreboard** — Retro LED with CSS split-flap animations, metallic frame, glowing cells, crowd ambience via Web Audio filtered noise
- **Play Diagrams** — SVG X's and O's diagrams on every card (`PD` data object + `playSvg()` renderer). 30 unique diagrams covering all offensive and defensive plays.
- **Matchup Tables** — 4 grids for all team combinations: `MT_CT_IR`, `MT_IR_CT`, `MT_CT_CT`, `MT_IR_IR`. Selected via `getMatchupTable(offTeamId, defTeamId)`.
- **Yard resolution** — `rollYards(tier)` returns randomized yards per tier. `isTurnover(tier)` for TO/OT tiers. OT tier = boom-or-bust (70% O+ yards, 30% D+ with 20% turnover risk).
- **AI Play-Calling** — `aiPickDefense()` and `aiPickOffense()` with scheme-appropriate weighted selection. IR defense: 60% zone / 25% adjust / 15% aggressive. CT defense: 50% blitz / 30% coverage / 15% specialty / 5% random.
- **Clock** — `clockCost(cardId)` deducts 8-22 seconds per play based on play type.
- **Gameplay Screen** — Scorebug (broadcast-style), field visualization (green strip with LOS/yard lines/player dots/end zone), clash zone (animated card collision with flash/shake), hand management (5 portrait cards, tap-to-select, SNAP to confirm, deck replacement with NEW badge).
- **Drive Logic** — 4 downs to gain 10 yards, first down resets, TD at ballOn=0, turnover on downs/INT/fumble, clock expiration.
- **Sound engine** (`SND`) — Web Audio synth: click, select, snap, menu, td, turnover, clash, draft, flip, crowdStart/crowdStop

### Football Knowledge (matchup design principles)
- Quick passes (Mesh, Slant, Stick, Shallow Cross, Bubble Screen) beat blitzes and aggressive pressure
- Deep shots (Four Verts, Y-Corner, Go Route) beat soft zone, get picked off against deep coverage
- Rip/Liz Match (Saban's signature) kills crossing routes — it was literally invented to stop them
- Triple Option runs devastate soft zones but die to Overload Blitz and A-Gap Mug
- Spy is the hard counter to QB Keeper and Triple Option
- Play-action works as a constraint (PA Flat kills Overload Blitz, PA Post kills soft zone)
- Gap Integrity is Saban's answer to option football — every defender owns a gap
- Williams' zone looks (Cover 2 Buc, Zone Drop) are the changeup that counters quick-game offense

## Coding Conventions
- Vanilla JS, no transpilation, no build step
- ES5-compatible function expressions (not arrow functions) in UI code
- DOM construction via `createElement` chains
- CSS-in-JS via `el.style.cssText` strings
- Font stack: Bebas Neue (headers), Press Start 2P (labels/badges/LED), Barlow Condensed (body)
- Color palette: `--cyan`, `--gold`, `--green`, `--orange`, `--danger`, `--purple` on dark `--bg`
- All state in the `GS` object; `setGs()` triggers full re-render
- Gameplay screen uses local state + manual DOM updates for animations (no setGs during play)
- localStorage keys prefixed with `torch_`

## What's Next
- **Bonus round** — Winners play again as the other side of the ball
- **Share card** — Wordle-style emoji result sharing
- **Polish** — Card helper buttons, better animations, sound tuning
- **Daily lockout** — One play per day, come back tomorrow on loss
- **2-point conversion** — Post-TD decision: XP to tie or go for 2 to win

## Testing Plan
- **Audience:** Discord dynasty group (9 football-knowledgeable players)
- **Deploy to Vercel**, share URL
- **Key questions:** Can players finish in 5-7 min? Does the draft feel meaningful? Is the clash exciting or random? Do winners play the bonus round? Do losers come back tomorrow?
