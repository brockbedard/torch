# TORCH — CLAUDE.md

## What This Is
TORCH is a football card game. Full game, starts 0-0, you play both sides of the ball. Two teams (Canyon Tech air raid, Iron Ridge ground-and-pound) battle through 2 halves with card-based play selection, badge combos, and TORCH point scoring.

## Current State (as of 2026-03-15)
- **Version:** v0.17.3 "Sound + Commentary + Polish" — full gameplay rebuild
- **Branch:** `refactor-vite` — all work is here
- **Stack:** Vite + vanilla JS + jsfxr (sounds), deployed on Vercel
- **Local dev:** `npx vite --host` (port 5173) or `npx vercel dev` (AI commentary)
- **Deploy:** `vercel --prod` from project root
- **GitHub:** https://github.com/brockbedard/torch.git
- **API:** `/api/commentary` — Vercel serverless → Claude Haiku for AI play-by-play (optional)

## Architecture
- Mobile-first, portrait gameplay screen, portrait for all screens
- Single-page app, vanilla JS (no React/framework)
- Vite for bundling and dev server
- All game state in memory (no backend for v1 — daily puzzle seed from date)
- CSS custom properties for theming (see existing design system in index.html)
- Fonts: Bebas Neue (headers), Press Start 2P (labels), Barlow Condensed (body)

## Critical Rules
1. **Git commit after every major change** with descriptive message
2. **Update this file (CLAUDE.md) when adding major features or changing architecture**
3. **PATCH for fixes, MINOR for new features, MAJOR for launch** — only bump version on production push
4. **Mobile-first** — everything must work on 375px wide minimum, 667px for landscape gameplay
5. **No emoji in UI** — use SVG icons or CSS-styled badges (emoji were removed in a prior commit)
6. **Test locally before any production push** — `npx vite --host`, test on phone via local IP

## Directory Structure
```
~/torch-football/
├── index.html          # Main app (being refactored into modules)
├── src/                # Vite source modules (JS, CSS)
├── public/             # Static assets (images, audio)
├── docs/               # Game design specs (see below)
│   ├── TORCH-GAMEPLAY-SPEC-v0.13.md       # Master gameplay spec
│   ├── TORCH-PLAY-DATA-TABLE-v0.11.md     # 20 offensive plays with distributions
│   ├── TORCH-DEFENSIVE-CARDS-v0.11.md     # 20 defensive plays, 10 per team
│   ├── TORCH-CARDS-CATALOG-v0.1.md        # 21 Torch Cards across 3 tiers
│   ├── TORCH-GDD-v0.7.md                  # Original game design doc (outdated — use gameplay spec)
│   └── torch_sim.py                       # Balance simulation engine (Python, reference only)
├── CLAUDE.md           # This file
├── DEV_LOG.md          # Changelog per local commit
├── package.json
└── vercel.json
```

## Spec Documents (READ THESE BEFORE CODING)
The gameplay engine must be built from these specs. They are the source of truth.

### TORCH-GAMEPLAY-SPEC-v0.13.md (MASTER SPEC)
- Game structure: 2 halves, 20 plays per half, 2-minute drill with real clock
- Setup flow: team pick → draft 4 offense + 4 defense players → draft 5+5 plays → coin toss → play
- Snap sequence: tap player → tap play → optional Torch Card → SNAP → clash animation → result
- Combo system: badge combos + play history bonuses + OVR modifiers + Torch Cards all STACK
- Scoring: TD(6) + XP(1 free) or 2pt(from 5) or 3pt(from 10). Safeties = 2pts.
- Ball placement: after score → opponent at 50, INT/fumble → at spot + return yards
- Both sides always go for it on 4th down
- Difficulty: Easy(streak 1-3), Medium(4-7), Hard(8+) with AI scaling
- TORCH points: earned/lost per snap on both offense and defense

### TORCH-PLAY-DATA-TABLE-v0.11.md
- 20 offensive plays (10 per team) with base stats: mean, variance, completion rate, sack rate, INT rate, fumble rate
- Coverage modifier tables per play
- CT plays are pass-heavy (SHORT, QUICK, DEEP, SCREEN + DRAW + QB SNEAK)
- IR plays are run-heavy (RUN, OPTION + PA FLAT, PA POST + QB SNEAK)

### TORCH-DEFENSIVE-CARDS-v0.11.md
- 20 defensive plays (10 per team)
- CT "Send Everybody": blitz-heavy, high sack rates, Cover 0 penalties vs run
- IR "Hard Nosed": disciplined, zone/hybrid, read-heavy

### TORCH-CARDS-CATALOG-v0.1.md
- 25 Torch Cards: 7 Gold (40-50pts), 12 Silver (20-30pts), 6 Bronze (10-20pts)
- Pre-snap vs Reactive cards
- The Booster (halftime shop) and Mini-Boosters (mid-game rewards)

## Gameplay Engine — Key Balance Numbers (from 300-game simulation)
These numbers were validated by running torch_sim.py. Use them as-is:

### Run Stuff Rate
- Base: 30%
- Good run defense (run_def_mod < -2): +10%
- Moderate run defense (< 0): +5%
- Cover 0 blitz vs run: -12% (gaps abandoned)
- Bad matchup (coverage mean ≤ -2): +8%
- Red zone inside 10: +8%, inside 20: +4%
- Cap: 5% min, 50% max

### Sack Rates
- Use base sack_rate from play data table
- Global boost: +2% (sacks are high-dopamine moments)
- Coverage sack: +3% when defense has negative pass_mean_mod AND sack_rate_bonus ≥ 0.03
- Red zone inside 20: +2%, inside 10: +4%
- Deep pass vs corner blitz: doubled
- Cap: 0% min, 30% max

### Completion Rates
- Use base completion_rate from play data table + OVR mods + defensive card comp_mod
- Bad matchup (coverage mean ≤ -2): -8%
- Moderate counter (≤ -1): -4%
- Red zone inside 10: -5%
- Cap: 15% min, 95% max

### Red Zone Compression
- Inside 20: deep capped at 20, -1 mean, -1 variance
- Inside 10: deep capped at 12, -2 mean, -1 variance
- Inside 5: deep capped at distance, -3 runs, +1 QB sneak, -1 universal, -2 variance

### Trailing Team Bonus (creates lead changes)
- Down 7-13: +1 mean, +2 variance
- Down 14+: +2 mean, +3 variance

### Badge Combos (TIGHT triggers, BIG bonuses)
Each badge fires on 1-2 play types max. When they fire: +3-4 yards, 15-20 TORCH pts.
- FOOTBALL: ONLY deep passes (+3 yds, 20pts)
- SPEED_LINES: ONLY deep passes (+4 yds, 20pts)
- CLEAT: ONLY screens and rocket toss/zone read (+2-3 yds, 15pts)
- HELMET: ONLY power runs, not draw (+3 yds, 15pts)
- CLIPBOARD: ONLY play-action and option (+2-3 yds, 15pts)
- GLOVE: ONLY short passes (+3 yds, 15pts)
- CROSSHAIR: ONLY quick passes (+3 yds, 15pts)
- BOLT: ONLY screens (+3 yds, 15pts)
- BRICK: ONLY power runs and QB sneaks (+3 yds, 15pts)
- FLAME: ONLY 3rd down, 4th down, conversions (+3 yds, 20pts)

### Defensive Badge Combos
- PADLOCK: ONLY man coverage cards (-3 yds, 15pts)
- HELMET: ONLY vs run + run-stopping card (-2 yds, 15pts)
- EYE: ONLY on robber/cover6 (-2 yds, 15pts)
- SPEED_LINES: ONLY on blitz cards (-2 yds, 15pts)
- BRICK: ONLY vs run + strong run D card (-3 yds, 15pts)
- CLIPBOARD: ONLY on spy/disguise schemes (-2 yds, 15pts)

### AI Difficulty
- Easy: random play selection with basic filters (no QB sneak on 2nd & 12), -3 OVR, never combos. Human gets +2 yard bonus, CPU gets -1 penalty.
- Medium: situational filters, normal OVR, 40% combo rate, tracks last 2 plays
- Hard: 75% optimal counter + 25% random, +3 OVR, always combos, tracks full drive

### Challenge Flag (Torch Card — reworked)
Not a generic reroll. Challenges specific play elements:
- Sideline catch: 60% overturn
- Interception: 50% overturn (becomes incomplete)
- Fumble: 55% overturn (knee was down)
- Spot of the ball: 50% overturn
- Catch/no catch: 45% overturn

## Players (2 teams, 4 starters + 2 bench each side)

### Canyon Tech Offense (Air Raid)
| Name | Pos | OVR | Badge |
|------|-----|-----|-------|
| Avery | QB | 78 | FOOTBALL |
| Sampson | WR | 80 | SPEED_LINES |
| Vasquez | SLOT | 82 | FLAME |
| Walsh | RB | 72 | BRICK |
| Meyers (bench) | QB | 74 | BOLT |
| Liu (bench) | WR | 76 | CROSSHAIR |

### Canyon Tech Defense (Send Everybody)
| Name | Pos | OVR | Badge |
|------|-----|-----|-------|
| Crews | CB | 82 | PADLOCK |
| Knox | S | 80 | HELMET |
| Wilder | LB | 78 | SPEED_LINES |
| Orozco | S | 72 | EYE |
| Moon (bench) | LB | 74 | CLEAT |
| Bishop (bench) | CB | 76 | GLOVE |

### Iron Ridge Offense (Ground & Pound)
| Name | Pos | OVR | Badge |
|------|-----|-----|-------|
| Kendrick | QB | 80 | CLIPBOARD |
| Torres | FB | 82 | BRICK |
| Sims | RB | 78 | CLEAT |
| Buckley | TE | 74 | GLOVE |
| Larkin (bench) | QB | 74 | FLAME |
| Owens (bench) | RB | 76 | HELMET |

### Iron Ridge Defense (Hard Nosed)
| Name | Pos | OVR | Badge |
|------|-----|-----|-------|
| Lawson | LB | 80 | EYE |
| Gill | CB | 82 | PADLOCK |
| Barrett | LB | 76 | HELMET |
| Slade | S | 78 | CLIPBOARD |
| Kemp (bench) | CB | 74 | CROSSHAIR |
| Ware (bench) | S | 72 | SPEED_LINES |

## What's Built vs What Needs Building

### Built (v0.17.3)
- **Team selection** — full team cards with SVG coach portraits, stadium cutouts, star ratings, mottos
- **4-step progress stepper** — TEAM → PLAYERS → PLAYS → START GAME
- **Player draft** — pick 1 QB/LB + 3 skill/DB per side, modal explanations, roster fly-in review
- **Play draft** — pick 4 offense + 4 defense from 10-card playbook, playbook fly-in review
- **Coin toss** — overlay on gameplay field, pick torch card or receive
- **Gameplay engine** — full snap resolver, badge combos, play history, OVR, red zone, AI opponent, TORCH points, injuries, turnovers, spike/kneel
- **Gameplay UI** — portrait bottom-stack layout, Tecmo-style field with endzones/yard markers/midfield logo
- **Drag-and-drop cards** — play → player → torch → SNAP, pulsing drop zone outlines
- **Helmet crash animation** — cards crash from sides on snap, spark burst at impact
- **Broadcast play-by-play** — 256+ unique commentary combinations via synonym rotation, variable timing, context-aware analysis lines
- **AI commentary** — optional Claude Haiku via /api/commentary for richer play calls
- **Celebrations** — TD (footballs rain + green flash + screen shake), turnover (red crack), sack (impact burst)
- **TORCH points** — fly animation to scoreboard, roll-up ticker with sound, user-team-only display with breakdown
- **Scoreboard** — 5-column grid, team icons, possession arrow, AND GOAL, snap counter, 2-min clock
- **Card deck cycling** — played card returns to deck, random replacement drawn
- **Conversions** — XP (auto) / 2pt / 3pt with full card selection
- **Sound effects** — jsfxr synthesized sounds for all interactions
- **Offense/defense energy shift** — warm amber vs cold blue panel themes
- **2-minute drill** — pulsing red UI, SPIKE/KNEEL buttons, urgent commentary
- **Halftime shop** — buy torch cards with TORCH points
- **End game** — stats, TORCH points, snap log, return to hub

## Code Organization for the Engine
Build the engine as modular JS files under `src/`:

```
src/
├── engine/
│   ├── gameState.js        # GameState class, state transitions
│   ├── snapResolver.js     # Core play resolution (port from torch_sim.py)
│   ├── badgeCombos.js      # Badge combo checks (offense + defense)
│   ├── playHistory.js      # Play history bonuses
│   ├── ovrSystem.js        # OVR modifier calculations
│   ├── redZone.js          # Red zone compression
│   ├── aiOpponent.js       # AI play/player selection by difficulty
│   ├── torchPoints.js      # TORCH point calculations
│   ├── injuries.js         # Injury system
│   └── turnoverReturns.js  # Turnover return yard calculations
├── data/
│   ├── ctOffensePlays.js   # Canyon Tech offensive play cards
│   ├── ctDefensePlays.js   # Canyon Tech defensive play cards
│   ├── irOffensePlays.js   # Iron Ridge offensive play cards
│   ├── irDefensePlays.js   # Iron Ridge defensive play cards
│   ├── players.js          # All player rosters
│   ├── torchCards.js       # All 21 Torch Cards
│   └── badges.js           # Badge definitions and SVG icons
├── screens/
│   ├── gameplay.js         # Main gameplay screen (landscape)
│   ├── coinToss.js         # Coin toss screen
│   ├── booster.js          # Halftime Booster shop
│   ├── conversion.js       # Post-TD conversion choice
│   └── endGame.js          # End-of-game results
└── ui/
    ├── scorebug.js         # Persistent score/clock/down display
    ├── comboPreview.js     # Combo preview bar with SNAP button
    ├── narrative.js        # 2-line bottom bar narrative
    └── fieldAnimation.js   # All-22 dot animation on the field
```

## Reference Implementation
`docs/torch_sim.py` is a 1700-line Python simulation that implements ALL game systems. Use it as the reference for porting to JS. Every calculation in the sim has been validated across 300+ games. The JS engine should produce equivalent results.

## Design System Colors
```css
--gold: #F5B800;      /* Logo, wins, highlights */
--cyan: #00E5C0;      /* Stats, first downs, Lakeshore */
--red: #F03030;       /* Danger, turnovers, loss */
--orange: #FF5E1A;    /* Streak, fire, momentum */
--purple: #8B5CF6;    /* Daily badge, special */
--navy: #09081A;      /* Background */
--bg2: #0f0d24;       /* Card backgrounds */
--bdr: #1e1c3a;       /* Borders */
--muted: #3e3c60;     /* Secondary text */
--text: #e8e6ff;      /* Primary text */
```

## Testing Checklist Before Deploy
- [ ] Both teams play a full game without errors
- [ ] Score updates correctly on TD, XP, 2pt, 3pt, safety
- [ ] Ball placement correct after: score, INT, fumble, failed 4th
- [ ] 2-minute drill clock works (run/pass/spike/kneel timing)
- [ ] Red zone compression applies correctly
- [ ] Badge combos fire only on correct play types
- [ ] AI makes sensible play calls at all difficulties
- [ ] TORCH points accumulate correctly
- [ ] Injuries occur and heal properly
- [ ] Game ends after 2 halves + 2-minute drills
- [ ] Works on mobile (375px portrait menus, 667px landscape gameplay)
- [ ] No console errors
