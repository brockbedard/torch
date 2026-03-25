# TORCH Football — CLAUDE.md

## What This Is
TORCH Football is a mobile card game (Balatro meets college football). 4 fictional college teams with distinct offensive/defensive schemes battle through 3-game seasons. Card-based play selection, badge combos, star player Heat Check, and TORCH points (score = wallet). Built with Vite + vanilla JS, deployed on Vercel.

## Version
**v0.24.0 "Scheme Identity"** — Real 7v7 football: 6 research-accurate formations, 13 pass concepts + 6 run concepts, team scheme identity (weighted draft pools, formation tendencies, animation styles per team). All 8 TORCH cards functional. Sequential points animation. Bug fixes (ovrSystem, conditions, card effects). UI refresh: team select with centered badges + KICK OFF flow, bigger home screen, pregame hold.

## How to Run
```bash
npx vite --host          # Local dev (port 5173, accessible via phone on LAN)
npx vite build           # Production build (dist/)
vercel --prod            # Deploy to production
```
- **Branch:** `main` (primary), `refactor-vite` (legacy name, merged into main)
- **GitHub:** https://github.com/brockbedard/torch.git
- **Production:** https://torch-two.vercel.app/

## File Structure
```
src/
├── main.js                    # App router (screen switching)
├── state.js                   # Global state, version, hand management helpers
├── style.css                  # CSS custom properties / design system
├── data/
│   ├── teams.js               # 4 teams: Boars (id: sentinels), Werewolves (id: wolves), Stags, Serpents
│   ├── players.js             # 52 players (4 teams × 7 OFF + 6 DEF) with ability text
│   ├── sentinelsPlays.js      # 10 OFF + 10 DEF plays with desc, isRun, risk
│   ├── wolvesPlays.js         # 10 OFF + 10 DEF plays with desc, isRun, risk
│   ├── stagsPlays.js          # 10 OFF + 10 DEF plays with desc, isRun, risk
│   ├── serpentsPlays.js       # 10 OFF + 10 DEF plays with desc, isRun, risk
│   ├── torchCards.js          # 8 TORCH cards (2 Gold, 4 Silver, 2 Bronze)
│   ├── badges.js              # Badge enum + inline SVG icons
│   ├── badgeIcons.js          # game-icons.net SVG paths for badge hero display
│   ├── teamLogos.js           # game-icons.net team mascot SVGs (boar/werewolf/deer/serpent)
│   ├── uiIcons.js             # Tabler Icons SVG paths for UI chrome
│   ├── torchCardIcons.js       # 20 game-icons.net SVG paths for TORCH modifier cards
│   ├── gameConditions.js      # Weather/field/crowd definitions + effects
│   ├── playSequenceCombos.js  # 5 hidden play pattern combos
│   └── playDiagrams.js        # SVG play diagram generator
├── assets/
│   └── torch-icons/           # 20 SVG source files from game-icons.net (CC BY 3.0)
├── tests/
│   └── balanceTest.js         # Balance test harness (window.runBalanceTest)
├── engine/
│   ├── gameState.js           # GameState class — full game simulation
│   ├── snapResolver.js        # Play resolution + playType field on result
│   ├── badgeCombos.js         # Badge combo checks (offense + defense)
│   ├── playHistory.js         # Play history bonuses
│   ├── ovrSystem.js           # OVR modifier calculations
│   ├── redZone.js             # Red zone compression
│   ├── aiOpponent.js          # AI play/player selection by difficulty
│   ├── torchPoints.js         # TORCH point calculations (never negative)
│   ├── injuries.js            # Injury system
│   ├── turnoverReturns.js     # Turnover return yard calculations
│   ├── sound.js               # jsfxr UI sound effects
│   ├── audioManager.js        # Howler.js AudioStateManager (10 states, crowd loops)
│   └── commentary.js          # Template-based commentary engine (4 emotional tiers)
├── ui/
│   ├── components/
│   │   ├── cards.js           # ★ SHARED CARD BUILDERS (play cards, player cards, torch cards)
│   │   ├── shop.js            # TORCH card shop bottom sheet
│   │   └── tooltip.js         # First-time teach tooltip component
│   └── screens/
│       ├── home.js            # Home screen (card fan hero, wordmark, KICK OFF, DAILY DRIVE)
│       ├── teamSelect.js      # Team select (2x2 grid + badge emblems + VS transition)
│       ├── pregame.js         # ★ Banded Clash pregame (away/home bands, VS, weather card)
│       ├── gameplay.js        # ★ Main game (field, card clash, drive summary, commentary)
│       ├── halftime.js        # Broadcast-style halftime report + coach pep talk + shop
│       ├── endGame.js         # End game (badges, TORCH breakdown, Film Room good+bad)
│       ├── dailyDrive.js      # Daily Drive mode
│       ├── cardMockup.js      # Card design reference (?mockup, dev-only)
│       └── visualTest.js      # Visual test harness (?test, dev-only)
│   ├── field/
│   │   ├── fieldRenderer.js   # ★ Digital Glass Floor portrait field (Canvas 2D)
│   │   ├── fieldAnimator.js   # Animation wrapper: shake, particles, camera follow
│   │   ├── playBuilder.js     # ★ Concept-based play animations (13 pass + 6 run concepts)
│   │   └── test.html          # Interactive field test harness (team/formation/play buttons)
├── docs/research/
│   ├── TORCH-7v7-FOOTBALL-RESEARCH.md    # ★ Football source of truth: formations, routes, coverages
│   └── TORCH-TEAM-SCHEME-IDENTITY.md     # ★ Team scheme identity: draft weights, animation styles
├── docs/                      # Other specs, amendments
└── archive/                   # Dead files kept for historical reference
```

## Screen Flow
```
Home → Team Select → Pregame (Banded Clash) → Gameplay → Halftime → Gameplay → End Game
                                                                                    ↓
                                                                          [Between-Game Shop]
                                                                                    ↓
                                                                          Next Game (×3 total)
                                                                                    ↓
                                                                          New Season (reset)

Home → Daily Drive → Gameplay (1 half) → Result + Share
```

## The 4 Teams (TORCH-TEAM-SCHEME-IDENTITY.md)

| Team | Scheme | Real Analog | Run/Pass | Formation Base | Def Shell |
|------|--------|-------------|----------|----------------|-----------|
| **Boars** (Ridgemont) | Power Spread | Georgia, Alabama | 55/45 | I-Form, Pistol, Twins | Cover 3 zone |
| **Wolves** (N. Pines) | Spread Option | Oregon, Rich Rod WVU | 50/50 | Shotgun, Pistol, Trips | Cover 1 + spy |
| **Stags** (Crestview) | Air Raid | Mike Leach, Lincoln Riley | 30/70 | Trips, Empty, Deuce | Cover 0 blitz |
| **Serpents** (Blackwater) | Multiple/Pro | Saban, Kirby Smart | 45/55 | Twins, Bunch, all looks | Multiple/disguised |

**Counter-play:** Boars > Serpents > Stags > Werewolves > Boars

### Team Gameplay Differentiation Matrix
| Dimension | Boars | Werewolves | Stags | Serpents |
|-----------|-------|------------|-------|---------|
| Draft pool | RUN 4x weight | RUN 3x, SCREEN 2x | QUICK 4x, DEEP 3x | All 2x (balanced) |
| Best formation | I-Form / Pistol | Shotgun / Pistol | Trips / Empty | Bunch / Twins |
| Animation feel | Physical, OL 1.4x | Fast, QB zone-read | Quick release 0.75x | Pre-snap WR motion |
| Star player | RB | QB | WR1 | Versatile flex |
| What beats them | Spread + quick pass | Contain QB + zone | Run the ball | Execute fundamentals |

## v0.23.0 — Football Engine Retuning

### Snap Resolver Overhaul (snapResolver.js)
- **Base yards +25%**: all play means multiplied by 1.25x, variance by 1.15x
- **Big play chance (7%)**: on completions and runs, 7% chance of 1.4-2.2x multiplier — produces 2-3 explosive plays per half
- **Softer covered results**: covered plays get a floor (1-3 yards on runs, 1-4 on passes) — still bad but not zero
- **Completion rate boost**: QUICK/SHORT +10%, SCREEN +12%
- **Stuff rate reduced**: 18% base (was 20%), outcome range -1 to +2 (was -2 to +1)

### Run/Pass Detection Fix
- Uses `offPlay.isRun`/`offPlay.type` instead of `completionRate` (which was 1.0 for some runs)
- Runs skip the completion check entirely — they always "connect"
- `result.playType` is now the single authoritative source for run vs pass

### Difficulty Rebalance
- Easy: +1.5 mean yards (was +3), rubber-band caps bonus at +0 when ahead by 21+
- Hard: -1 mean yard penalty
- Easy sack cancel 50%, INT cancel 40%, CPU -2 yard penalty

### Balance Test Results (100 drives × 4 teams × 3 difficulties)
```
EASY:   59-71% scoring, 8.4-9.6 yds/play, 41-50 est pts/game
MEDIUM: 28-40% scoring, 6.2-6.7 yds/play, 20-28 est pts/game
HARD:   17-34% scoring, 5.1-6.4 yds/play, 12-24 est pts/game
```
Werewolves Triple Option fixed: 40% scoring on Medium (was 14%).

### Balance Test Harness (src/tests/balanceTest.js)
- `window.runBalanceTest(100)` in browser console (dev mode)
- Simulates 1200 drives, logs stats with warning flags
- Code-split, lazy-loaded behind dev flag

## v0.22.5 — What's New (since v0.22.0)

### Play Cards — Color-Coded by Type (cards.js)
Each play type has a unique color scheme (bg, border, accent):
- **Offense:** DEEP (blue #4488ff), SHORT (green #44dd66), QUICK (gold #ddbb44), SCREEN (orange #ffaa22), RUN (brown #c4733b)
- **Defense:** ZONE (blue #4499dd), BLITZ (red #dd4444), HYBRID (purple #9955cc), PRESSURE (copper #cc7744)
- Pass plays get gradient stripe + diagonal pattern; run plays get solid stripe + horizontal pattern
- Each card shows: play name, type pill, plain-English description, flame-pip risk indicator
- Every play has a `desc` field (plain-English) and `isRun` field in the play data files

### Player Cards — Position Hero Style (cards.js)
- Large position abbreviation (Teko 22px, weight 900) as the hero element
- 11 position colors: QB gold, WR green, RB orange, CB blue, S cyan, LB red, DL dark red, etc.
- Shows: position + jersey number, player name, colored accent line, ability text
- Every player has an `ability` field in players.js (52 unique abilities)
- No team badges on player cards — identity from context

### Pregame — Banded Clash (pregame.js)
Full-screen symmetrical layout replacing old beat-by-beat sequence:
- TORCH header with animated flame + GAME DAY branding
- Away team band (left): badge, school, team name, scheme, OFF/DEF flame pips
- VS collision zone with gradient bars and pulsing glow
- Home team band (right): mirrored layout
- Weather conditions card (icon + temperature + surface)
- Auto-advance 4.5s, tap-to-skip, progressive shortening after 5 games

### TORCH Points Banner (gameplay.js)
Full-width gold strip between scorebug and field:
- Animated flame SVG + "TORCH" label + live points number
- Balatro-style animation on point earn: scale 120%, count-up ticker, gold glow pulse

### Drive Summary Panel (gameplay.js)
Persistent panel below SNAP button replacing dead space:
- Team-branded header: "{TEAM} DRIVE" in team accent color
- Play-by-play ticker: newest play on top, ESPN-style descriptions with player names
- Game-wide stat lines: QB/WR/RB (human offense) + best defender (human defense)
- Both teams tracked separately with correct rosters
- Commentary text (16px bold) from the commentary engine

### Commentary on Clash Overlay (gameplay.js)
- Post-play overlay shows vivid commentary instead of "Play vs Play" matchup label
- "T +5" TORCH points removed from overlay (now animated on banner)
- Tackler names on every completed play in both commentary and drive summary

### Scorebug Upgrades (gameplay.js)
- Team names auto-scale: 20px (≤5 chars), 17px (6-8), 14px (9+) — never truncated
- Team badges: 44px
- Snap count: Teko 22px bold
- Clock: Teko 18px; 24px red with bg during 2-minute drill
- Possession: green 14px arrows + glow border on possessing side

### UI Cleanup
- "YOUR OFFENSE/DEFENSE" replaced with team-branded labels ("STAGS OFFENSE", "BOARS DEFENSE")
- "SELECT SCHEME" and "DRAG A SCHEME ONTO THE FIELD" instruction text removed
- TORCH points removed from down-and-distance bar (now in dedicated banner)
- Down & distance text bumped to Teko 16-18px bold
- Zero-yard plays show neutral color instead of gold
- Incomplete descriptions varied: "broken up by", "overthrown", "dropped by"

### Engine Fixes (v0.22.5)
- `snapResolver.js`: result includes `playType: 'run'|'pass'` — single source of truth
- `commentary.js`: uses `result.playType` to select correct verb pool (never crosses run/pass)
- 1st down distance always resets to 10 (display clamped too)
- See v0.23.0 section above for full engine retuning details

## Key Systems

### Hand Management
10-card playbook per side. Draw 4 at game start. Play 1 → draw 1 from remaining 6 (weighted by team scheme). Always 4 in hand. Player cards also 4 per hand.

**Draw weighting** (`TEAM_DRAW_WEIGHTS` in state.js): When cycling a card, the replacement is selected with weighted probability based on the team's offensive identity. Boars see run cards 4x more often. Stags see quick/deep pass cards 3-4x more. Serpents are balanced (all 2x). This makes team selection change gameplay, not just colors.

### TORCH Modifier Cards (Score = Wallet)
20 cards across 4 categories, 3 tiers (Bronze/Silver/Gold). Icons from game-icons.net (CC BY 3.0).
- **Snap Modifiers** (10): single-play consumables (PICK SIX, UNCOVERABLE, DA BOMB, etc.)
- **Drive Modifiers** (4): full-possession buffs (NO HUDDLE, IRON WALL, RED ZONE PKG, BALL CONTROL)
- **Scheme Cards** (3): passive season-long (FILM ROOM, TEMPO KING, GUNSLINGER)
- **Momentum** (3): auto-trigger on conditions (ON FIRE, TENDENCY BREAK, CLUTCH GENE)

3 inventory slots. Single-use within a season. Shop opens at trigger moments (halftime, TD, turnover). Points only go UP from plays (never negative). Spending is the only way points decrease.

Icon data: `src/data/torchCardIcons.js` — 20 SVG paths + `renderTorchCardIcon(key, size, color)` helper.
Mockup: `mockups/torch-card-system-mockup.jsx` — React artifact with 5 tabbed views (Cards, Gameplay, Shop, Activate, Mini). Preview via `mockups/preview/`.

### Season Cycle
3 games per season. Order: neutral → prey → predator. Cards + unspent points carry. +100/win, +200 sweep.

### Star Heat Check
1 OFF + 1 DEF star per team (84 OVR). Activate on big plays. On Fire: +4 OVR, +5 badge combo yards, flame border. Hidden on first game.

### Progressive Disclosure
`isFirstSeason` flag. First game: auto-Easy, teach tooltips, hidden difficulty/formation/Heat Check. Game 2+: full features.

### Game Day Conditions
Weather × Field × Crowd = 45 combinations. First game: Clear/Turf/Home. Shown on pregame weather card.

### Difficulty
| Aspect | Easy | Medium | Hard |
|--------|------|--------|------|
| Play selection | Random | Situational | 50% optimal + 25% sit + 25% random |
| OVR modifier | -3 | Normal | +2 |
| Combo rate | Never | 40% | 80% |
| Sack rate | 40% of base | Normal | Normal |
| Completion boost | +15% | Normal | Normal |
| Mean yard bonus | +1.5 (0 if ahead 21+) | 0 | -1 |
| Sack cancel | 50% | None | None |
| INT cancel | 40% | None | None |
| CPU yard penalty | -2 | None | None |

## Shared Card Builders (src/ui/components/cards.js)
**Single source of truth.** Never duplicate card HTML inline.

| Builder | Returns |
|---------|---------|
| `buildHomeCard(type, w, h)` | Card back (offense/torch/defense) |
| `buildMaddenPlayer(p, w, h)` | Player card (position hero, ability text) |
| `buildPlayV1(p, w, h)` | Play card (type-colored, description, risk pips) |
| `buildTorchCard(tc, w, h)` | Torch card (flame, tier border, text-safe) |
| `teamHelmetSvg(teamId, size)` | Team-colored helmet with facemask (legacy — not used in player cards) |
| `renderFlamePips(filled, total, color, size)` | SVG flame rating pips |
| `renderTeamBadge(teamId, size)` | Team mascot icon on dark circle |

## Dev Tools
Enable: `localStorage.setItem('torch_dev', '1')` or visit any URL with `?dev`.
- `?test` — Visual test harness showing all screen states
- `?mockup` — Card component reference page
- `window.runBalanceTest(100)` — Simulate 1200 drives, log balance stats to console
- DEV BUILD banner, Quick Play, Reset Daily Lock
- `mockups/preview/` — TORCH card system React mockup (run with `npx vite` from that dir)

## Design System
```css
--bg: #0A0804;         /* Scorched black background */
--torch: #FF4511;      /* Brand, CTA */
--a-gold: #EBB010;     /* Warm Gold — titles, highlights */
--l-green: #00ff44;    /* Success, first downs */
--p-red: #ff0040;      /* Danger, turnovers */
Torch orange: #FF6B00  /* Commentary border, side indicators */
```
Fonts: Teko (display), Rajdhani (UI/labels), Barlow Condensed (body).
No emoji in UI. No blue outside defense card backs.

## Locked Design Decisions
- 4 teams, no draft. Predetermined squads and playbooks.
- Score = wallet. Buying TORCH cards spends your score.
- Simultaneous card reveal with formation hint.
- 3-game seasons with card/point persistence.
- Progressive disclosure — learn by playing, no tutorials.
- TORCH points never decrease from plays (only from shop spending).
- 4 cards in hand (plays and players).

## Digital Glass Floor — Field Renderer

### Architecture (src/ui/field/)
Canvas 2D portrait field renderer with animated player dots. 375×360px. NOT yet wired into gameplay.js (still uses old DOM field strip).

- **fieldRenderer.js** — Static field + formations + player dot glow sprites
- **fieldAnimator.js** — rAF loop, screen shake, particles, ball flight, camera follow
- **playBuilder.js** — Concept-based animation: 13 pass concepts + 6 run concepts
- **test.html** — Interactive test: `http://localhost:5173/src/ui/field/test.html`

### 6 Offensive Formations (from TORCH-7v7-FOOTBALL-RESEARCH.md §3)
`shotgun_deuce`, `trips`, `twins`, `bunch`, `iform_pistol`, `empty`
- OL ALWAYS at x: 0.42, 0.50, 0.58 — variety from 3 skill player positions only
- DL at x: 0.35, 0.50, 0.65 at y:1 (outside shade on guards)
- 5 defensive alignments: Base 3-1-2-1, Two-High, Cover 3, Press Man, Nickel

### Route Concepts (from research §5, not isolated routes)
**Quick:** slant-arrow, hitch, quick-out | **Intermediate:** smash, flood, mesh, smash-seam, dagger, drive | **Deep:** post-corner, verticals, comeback-vertical, post-wheel
**Run:** inside zone, power, draw, toss, zone read, QB draw
Each concept assigns routes to ALL 3 skill players. Team concept weights bias selection.

### Team Animation Styles (TEAM_ANIM_STYLE in playBuilder.js)
| Team | olScale | throwTMod | Special |
|------|---------|-----------|---------|
| Boars | 1.4 | 1.0 | OL fires forward aggressively |
| Werewolves | 1.0 | 0.85 | QB zone-read mesh motion |
| Stags | 0.9 | 0.75 | Ball out fast — Air Raid quick game |
| Serpents | 1.0 | 0.95 | Pre-snap WR motion across formation |

### Formation Pools (TEAM_FORMATION_POOLS in fieldRenderer.js)
Weighted random selection per team × play type. Boars get I-Form 50% on RUN, Stags get Trips 35% on SHORT, etc. Provides visual variety while maintaining team identity.

### Camera Follow
For big plays (settle point past 80% canvas height), the field viewport scrolls downfield in sync with the dots. Uses `ballYard` adjustment + pixel offset — no ctx.translate.

## Specced But Not Built (v2+)
- TORCH modifier card system (20 cards designed, icons sourced, mockup complete — needs gameplay integration)
- Halftime TORCH shop with tier-based card offerings
- Card activation animations (bronze/silver/gold escalation)
- Heat Check Clutch Factor (4th quarter auto-fire)
- Daily Drive shareable result grid (Wordle-style)
- Stats bottom sheet (swipe-up during gameplay)
- AI Coaching Personality flavor text
- Real crowd audio loops (system ready, files not sourced)
- Wire field renderer into gameplay.js (replace old DOM field strip with Canvas 2D)
- Phase 2 juice: speed trails, screen shake tuning, impact flash (infrastructure exists)
- Phase 3 identity: star player glow, team particles, variable play speed, turnover drama
- Multiplayer, dynasty mode, app store release
