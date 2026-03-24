# TORCH Football — CLAUDE.md

## What This Is
TORCH Football is a mobile card game (Balatro meets college football). 4 fictional college teams with distinct offensive/defensive schemes battle through 3-game seasons. Card-based play selection, badge combos, star player Heat Check, and TORCH points (score = wallet). Built with Vite + vanilla JS, deployed on Vercel.

## Version
**v0.23.0 "Gameday"** — Retuned football engine with bigger plays, scheme differentiation, and balance-tested difficulty. Color-coded play cards, position-hero player cards, drive summary, Banded Clash pregame, TORCH banner.

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
│   ├── gameConditions.js      # Weather/field/crowd definitions + effects
│   ├── playSequenceCombos.js  # 5 hidden play pattern combos
│   └── playDiagrams.js        # SVG play diagram generator
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
├── docs/                      # Specs, research, amendments
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

## The 4 Teams

| Team | Colors | Offense | Defense | OFF/DEF | Mascot Icon |
|------|--------|---------|---------|---------|-------------|
| **Boars** (Ridgemont) | Crimson #8B0000 / Gold #C4A265 | Run & Shoot | Press Man | 4/3 | boar-tusks.svg |
| **Werewolves** (Northern Pines) | Midnight #1A1A2E / Silver #C0C0C0 | Triple Option | Cover 3 Zone | 3/4 | werewolf.svg |
| **Stags** (Crestview) | Orange #F28C28 / Charcoal #1C1C1C | Spread RPO | Swarm Blitz | 5/2 | deer.svg |
| **Serpents** (Blackwater) | Purple #2E0854 / Venom #39FF14 | Air Raid | Pattern Match | 3/4 | sea-serpent.svg |

**Counter-play:** Boars > Serpents > Stags > Werewolves > Boars

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
10-card playbook per side. Draw 4 at game start. Play 1 → bottom of deck → draw 1 from top. Always 4 in hand. Player cards also 4 per hand.

### TORCH Card Economy (Score = Wallet)
8 cards. 3 inventory slots. Single-use within a season. Shop opens at trigger moments. Points only go UP from plays (never negative). Spending is the only way points decrease.

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
- DEV BUILD banner, Quick Play, Reset Daily Lock

## Design System
```css
--bg: #0A0804;         /* Scorched black background */
--torch: #FF4511;      /* Brand, CTA */
--a-gold: #FFB800;     /* Titles, highlights */
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

## Specced But Not Built (v2+)
- Additional TORCH cards (Prime Time, Challenge Flag, Double Down, etc.)
- Heat Check Clutch Factor (4th quarter auto-fire)
- Daily Drive shareable result grid (Wordle-style)
- Stats bottom sheet (swipe-up during gameplay)
- AI Coaching Personality flavor text
- Real crowd audio loops (system ready, files not sourced)
- Pre-snap route diagrams on field (offense only, SVG overlay, research complete)
- Defensive coverage diagrams on field
- Multiplayer, dynasty mode, app store release
