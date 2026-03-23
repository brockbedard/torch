# TORCH Football — CLAUDE.md

## What This Is
TORCH Football is a mobile card game (Balatro meets college football). 4 fictional college teams with distinct offensive/defensive schemes battle through 3-game seasons. Card-based play selection, badge combos, star player Heat Check, and TORCH points (score = wallet). Built with Vite + vanilla JS, deployed on Vercel.

## Version
**v0.22.0 "Gameday"** — Broadcast-quality presentation, card clash animations, rich commentary, stadium audio system.

## How to Run
```bash
npx vite --host          # Local dev (port 5173, accessible via phone on LAN)
npx vite build           # Production build (dist/)
vercel --prod            # Deploy to production
```
- **Branch:** `refactor-vite` (all work here)
- **GitHub:** https://github.com/brockbedard/torch.git
- **Vercel:** Auto-deploys on push to refactor-vite

## File Structure
```
src/
├── main.js                    # App router (screen switching)
├── state.js                   # Global state, version, hand management helpers
├── style.css                  # CSS custom properties / design system
├── data/
│   ├── teams.js               # 4 teams: sentinels, wolves, stags, serpents
│   ├── players.js             # 48 players (4 teams × 6 OFF + 6 DEF)
│   ├── sentinelsPlays.js      # 10 OFF + 10 DEF plays (Run & Shoot / Press Man)
│   ├── wolvesPlays.js         # 10 OFF + 10 DEF plays (Triple Option / Cover 3)
│   ├── stagsPlays.js          # 10 OFF + 10 DEF plays (Spread RPO / Swarm Blitz)
│   ├── serpentsPlays.js       # 10 OFF + 10 DEF plays (Air Raid / Pattern Match)
│   ├── torchCards.js          # 8 TORCH cards (2 Gold, 4 Silver, 2 Bronze)
│   ├── badges.js              # Badge enum + inline SVG icons
│   ├── badgeIcons.js          # game-icons.net SVG paths for badge hero display
│   ├── teamLogos.js           # Placeholder SVG paths for 4 team logos
│   ├── uiIcons.js             # Tabler Icons SVG paths for UI chrome
│   ├── gameConditions.js      # Weather/field/crowd definitions + effects
│   ├── playSequenceCombos.js  # 5 hidden play pattern combos
│   └── playDiagrams.js        # SVG play diagram generator
├── engine/
│   ├── gameState.js           # GameState class — full game simulation
│   ├── snapResolver.js        # Play resolution (yards, completions, turnovers)
│   ├── badgeCombos.js         # Badge combo checks (offense + defense)
│   ├── playHistory.js         # Play history bonuses
│   ├── ovrSystem.js           # OVR modifier calculations
│   ├── redZone.js             # Red zone compression
│   ├── aiOpponent.js          # AI play/player selection by difficulty
│   ├── torchPoints.js         # TORCH point calculations
│   ├── injuries.js            # Injury system
│   ├── turnoverReturns.js     # Turnover return yard calculations
│   └── sound.js               # jsfxr sound effects
├── ui/
│   ├── components/
│   │   ├── cards.js           # ★ SHARED CARD BUILDERS (single source of truth)
│   │   ├── shop.js            # TORCH card shop bottom sheet
│   │   └── tooltip.js         # First-time teach tooltip component
│   └── screens/
│       ├── home.js            # Home screen (card fan hero, wordmark, KICK OFF)
│       ├── teamSelect.js      # Team select (2x2 grid + fighting-game VS transition)
│       ├── gameplay.js         # Main game (field, cards, 3-beat snap, commentary)
│       ├── halftime.js        # Halftime report + shop
│       ├── endGame.js         # End game (score, season progress, Film Room)
│       ├── dailyDrive.js      # Daily Drive mode
│       ├── cardMockup.js      # Card design reference (?mockup, dev-only)
│       └── visualTest.js      # Visual test harness (?test, dev-only)
├── docs/                      # Specs, research, amendments
└── archive/                   # Dead files kept for historical reference
```

## Screen Flow
```
Home → Team Select → [fighting-game VS transition] → Gameplay → Halftime → Gameplay → End Game
                                                                                        ↓
                                                                              [Between-Game Shop]
                                                                                        ↓
                                                                              Next Game (×3 total)
                                                                                        ↓
                                                                              New Season (reset)

Home → Daily Drive → Gameplay (1 half) → Result + Share
```

## The 4 Teams

| Team | Colors | Offense | Defense | OFF/DEF |
|------|--------|---------|---------|---------|
| **Boars** (Ridgemont) | Crimson #8B0000 / Gold #C4A265 | Run & Shoot | Press Man | 4/3 |
| **Werewolves** (Northern Pines) | Midnight #1A1A2E / Silver #C0C0C0 | Triple Option | Cover 3 Zone | 3/4 |
| **Stags** (Crestview) | Orange #F28C28 / Black #1C1C1C | Spread RPO | Swarm Blitz | 5/2 |
| **Serpents** (Blackwater) | Purple #2E0854 / Green #39FF14 | Air Raid | Pattern Match | 3/4 |

**Counter-play:** Boars > Serpents > Stags > Werewolves > Boars

## Key Systems

### Hand Management (Option D)
- 10-card playbook per side. Draw 5 at game start. Play 1 → goes to bottom of deck → draw 1 from top. Always 5 in hand.

### TORCH Card Economy (Score = Wallet)
- 8 cards: Scout Team, Sure Hands, Hard Count, Hot Route, Flag on the Play, Onside Kick, 12th Man, Ice
- 3 inventory slots. Single-use within a season. Shop opens at trigger moments (TD, turnover, 4th stop, star activation, halftime, between-game).
- Buying cards spends your TORCH points (which are also your score).

### Season Cycle
- 3 games per season against the 3 other teams. Order: neutral → prey → predator.
- Cards and unspent points carry across games. +100 per win, +200 sweep bonus.

### Star Heat Check
- 1 OFF star + 1 DEF star per team (84 OVR, gold border).
- Activate on big plays (10+ yards, badge combo, turnover, sack). On Fire: +4 OVR, +5 badge combo yards, flame border.
- Deactivate: opponent forces turnover/sack (OFF star) or scores TD (DEF star).

### 3-Beat Snap Result
- Beat 1 (1200ms): Cards fly toward center, background dims, tension builds, 500ms hold.
- Beat 2 (1200ms): 800ms hitstop freeze (both cards readable), shake, flash, 300ms silence, result sound.
- Beat 3 (2000-5000ms): Result text scales in, commentary 800ms later, board updates. TD = 5s. Routine = 2s.

### Progressive Disclosure
- `isFirstSeason` flag (localStorage). First game: auto-Easy, no difficulty row, no formation reveal, no Heat Check, teach tooltips in sequence (play → player → SNAP → combo → TD → shop).
- Game 2+: difficulty selector, formation reveal, Heat Check.

### Game Day Conditions (v2 data model, active)
- Weather (clear/rain/wind/snow/heat), Field (turf/grass/mud), Crowd (home/neutral/away).
- First game always Clear/Turf/Home. Subsequent randomized. Effects applied as engine modifiers.

### Play Sequence Combos
- 5 hidden patterns: SETUP! (+4), DRIVE MOMENTUM (+2), CAUGHT SLEEPING (+3), HOT READ (+5), PREDICTABLE (-3).
- Flash text on trigger. No explanation — players discover through pattern recognition.

### Formation Reveal
- AI defensive formation shown before play selection (game 2+): NICKEL, DIME, 3-4 BASE, 4-2-5, BLITZ LOOK.
- Narrows possibilities but never guarantees the play.

### Difficulty
| Aspect | Easy | Medium | Hard |
|--------|------|--------|------|
| Play selection | Random | Situational | 50% optimal + 25% sit + 25% random |
| OVR modifier | -3 | Normal | +2 |
| Combo rate | Never | 40% | 80% |
| Player bonus | +2 yards | None | None |
| Formation honesty | Always | 90% | 75% |

## Shared Card Builders (src/ui/components/cards.js)
**Single source of truth for all card visuals.** Never duplicate card HTML inline.

| Builder | Returns | Used By |
|---------|---------|---------|
| `buildHomeCard(type, w, h)` | Card back (offense/torch/defense) | home.js |
| `buildMaddenPlayer(p, w, h)` | Player card (badge hero, tier border, helmet) | gameplay.js, teamSelect.js |
| `buildPlayV1(p, w, h)` | Play card (type icon watermark, tinted bg, colored risk) | gameplay.js |
| `buildTorchCard(tc, w, h)` | Torch card (centered flame, tier border) | gameplay.js, shop.js |
| `teamHelmetSvg(teamId, size)` | Team-colored helmet with facemask + stripe | teamSelect.js, cards.js |
| `renderFlamePips(filled, total, color, size)` | Custom SVG flame rating pips | teamSelect.js |

## Dev Tools
Enable: `localStorage.setItem('torch_dev', '1')` then refresh.
- `?test` — Visual test harness: all 12 screen states on one scrollable page
- `?mockup` — Card component reference page
- DEV BUILD banner, Quick Play button, Reset Daily Lock button

## Design System
```css
--a-gold: #FFB800;    /* Titles, highlights, torch orange accent */
--torch: #FF4511;     /* Brand, CTA, fire */
--bg: #0A0804;        /* Background (warm scorched black) */
--bg-surface: #141008;/* Card/panel backgrounds */
--l-green: #00ff44;   /* Success, first downs, selection */
--p-red: #ff0040;     /* Danger, turnovers */
```
Fonts: Teko (display), Rajdhani (UI/labels), Barlow Condensed (body).
**No emoji in UI.** No blue outside defense card backs (#4DA6FF).

## Locked Design Decisions
- **4 teams, no draft.** Predetermined squads and playbooks.
- **Score = wallet.** Buying TORCH cards spends your score.
- **Simultaneous reveal** with formation hint (not full information).
- **3-game seasons** with card/point persistence.
- **Progressive disclosure** — no tutorial screens, learn by playing.

## Specced But Not Built (v2+)
- TORCH cards: Prime Time, Challenge Flag, Double Down, Trick Play, Next Man Up, Trade Deadline, Fake Kneel
- Heat Check Phase 3: Clutch Factor (4th quarter auto-fire badge combo)
- Daily Drive: shareable result grid (Wordle-style)
- Play Sequence Combos: visual flash implemented, combo detection active
- AI Coaching Personality flavor text
- Multiplayer, dynasty mode, app store release
