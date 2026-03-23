# TORCH Football — CLAUDE.md

## What This Is
TORCH Football is a mobile card game (Balatro meets college football). 4 fictional college teams with distinct offensive/defensive schemes battle through 3-game seasons. Card-based play selection, badge combos, star player Heat Check, and TORCH points (score = wallet). Built with Vite + vanilla JS, deployed on Vercel.

## Version
**v0.22.0 "Gameday"** — Broadcast-quality presentation with card clash animations, rich commentary engine, stadium audio system, and 5-second pregame sequence.

## How to Run
```bash
npx vite --host          # Local dev (port 5173, accessible via phone on LAN)
npx vite build           # Production build (dist/)
vercel --prod            # Deploy to production
```
- **Branch:** `refactor-vite` (all work here)
- **GitHub:** https://github.com/brockbedard/torch.git
- **Production:** https://torch-two.vercel.app/

## File Structure
```
src/
├── main.js                    # App router (screen switching)
├── state.js                   # Global state, version, hand management helpers
├── style.css                  # CSS custom properties / design system
├── data/
│   ├── teams.js               # 4 teams: sentinels(Boars), wolves(Werewolves), stags, serpents
│   ├── players.js             # 52 players (4 teams × 7 OFF + 6 DEF)
│   ├── sentinelsPlays.js      # 10 OFF + 10 DEF plays (Run & Shoot / Press Man)
│   ├── wolvesPlays.js         # 10 OFF + 10 DEF plays (Triple Option / Cover 3)
│   ├── stagsPlays.js          # 10 OFF + 10 DEF plays (Spread RPO / Swarm Blitz)
│   ├── serpentsPlays.js       # 10 OFF + 10 DEF plays (Air Raid / Pattern Match)
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
│   ├── snapResolver.js        # Play resolution (yards, completions, turnovers)
│   ├── badgeCombos.js         # Badge combo checks (offense + defense)
│   ├── playHistory.js         # Play history bonuses
│   ├── ovrSystem.js           # OVR modifier calculations
│   ├── redZone.js             # Red zone compression
│   ├── aiOpponent.js          # AI play/player selection by difficulty
│   ├── torchPoints.js         # TORCH point calculations (never negative)
│   ├── injuries.js            # Injury system
│   ├── turnoverReturns.js     # Turnover return yard calculations
│   ├── sound.js               # jsfxr UI sound effects
│   ├── audioManager.js        # ★ Howler.js AudioStateManager (10 states, crowd loops)
│   └── commentary.js          # ★ Template-based commentary engine (4 emotional tiers)
├── ui/
│   ├── components/
│   │   ├── cards.js           # ★ SHARED CARD BUILDERS (single source of truth)
│   │   ├── shop.js            # TORCH card shop bottom sheet
│   │   └── tooltip.js         # First-time teach tooltip component
│   └── screens/
│       ├── home.js            # Home screen (card fan hero, wordmark, KICK OFF, DAILY DRIVE)
│       ├── teamSelect.js      # Team select (2x2 grid + badge emblems + VS transition)
│       ├── pregame.js         # ★ 5-second broadcast pregame sequence
│       ├── gameplay.js        # Main game (field, card clash, 4-beat results, commentary)
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
Home → Team Select → Pregame Sequence (5s) → Gameplay → Halftime → Gameplay → End Game
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

**Team icons:** game-icons.net (CC BY 3.0 by Lorc/Delapouite). Rendered as team-colored fill on dark circular background at 4 sizes (140/80/40/24px).

## v0.22 "Gameday" — What's New

### Pregame Sequence (pregame.js)
5-second broadcast-style intro between team select and gameplay:
- Beat 0: TORCH flame logo pulse
- Beat 1: Diagonal screen split in team colors
- Beat 2: Team badge emblems slam in from sides (scale overshoot)
- Beat 3: "VS" slam with screen shake + particle burst
- Beat 4: Team names, conditions badge, season record
- Beat 5: Stat comparison bars + field reveal
- Progressive shortening: full 5s first 5 games, then 2.5s fast

### Audio System (audioManager.js)
Howler.js-powered 3-layer audio with 10 states:
- States: MENU, PRE_GAME, NORMAL_PLAY, BIG_MOMENT, TWO_MIN_DRILL, TOUCHDOWN, TURNOVER, HALFTIME, GAME_OVER, PAUSED
- Ambient crowd loops crossfade between states (1s transitions)
- Mute toggle persisted to localStorage, auto-mute on page hidden
- Audio files in public/audio/ (crowd-idle/tense/building/roar/groan.ogg)

### Card Clash Animation (gameplay.js)
4-phase collision-based reveal replacing old 3-beat system:
- Phase 1 (Alert): Background dims (20/40/70% by tier)
- Phase 2 (Build): Cards slide in from sides, offense gold/defense blue
- Phase 3 (Peak): Hitstop freeze (33/67/133ms), screen shake, particle burst, impact sound
- Phase 4 (Settle): Winning card glows, losing dims, result text scales in
- 3-tier drama scaling: routine (0.8s), important (1.5s), game-changing (2.5s)
- Tap-to-skip jumps to Phase 4

### Post-Play Display (gameplay.js)
4-beat sequence after every play:
- Beat 1 (Impact): Yardage slams center (64/72/96px by intensity)
- Beat 2 (Context): First down flash, scorebug updates, commentary line 1
- Beat 3 (Reward): TORCH points + combo names stagger in
- Beat 4 (Ready): Overlay fades, card tray restores

### Commentary Engine (commentary.js)
Template-based play-by-play with vivid language:
- 15 pass verbs, 15 run verbs, 9 catch verbs, 8 tackle verbs
- 10 route modifiers, 9 run modifiers, field position awareness
- 4 emotional tiers: routine → elevated → intense → explosive
- Situational context: midfield crossing, red zone, lead changes, 4th down
- Anti-repetition cooldown tracker

### Card Deal Animation
Cards deal face-down showing colored card backs (green offense, blue defense), then flip face-up:
- 0.5s slide from right edge with 120ms stagger between cards
- 300ms CSS perspective flip with card snap sound
- Applied to both play cards and player cards

### 2-Minute Drill Real-Time Clock
- setInterval ticks every 1s, decrements clock, updates scorebug
- Pauses during snap animations
- Heartbeat SFX below 15 seconds
- Auto-ends game at 0:00

### Broadcast Halftime (halftime.js)
- Team badges + scores, drive summary stats
- Situation-aware coach pep talk (winning/losing/tied variants)
- Locker room shop with 3 TORCH cards

### Upgraded Possession Change
- Team badges + scores with "YOUR BALL" / "CHANGE OF POSSESSION"
- Tap to skip, 2s auto-advance

### End Game + Film Room (endGame.js)
- Team badges on score display
- TORCH points breakdown: "Base: 450 | Win Bonus: +100"
- Film Room shows GOOD plays (green) AND bad plays (red) with coaching tips

## Key Systems

### Hand Management (Option D)
10-card playbook per side. Draw 5 at game start. Play 1 → bottom of deck → draw 1 from top. Always 5 in hand.

### TORCH Card Economy (Score = Wallet)
8 cards. 3 inventory slots. Single-use within a season. Shop opens at trigger moments. Points only go UP from plays (never negative). Spending is the only way points decrease.

### Season Cycle
3 games per season. Order: neutral → prey → predator. Cards + unspent points carry. +100/win, +200 sweep.

### Star Heat Check
1 OFF + 1 DEF star per team (84 OVR). Activate on big plays. On Fire: +4 OVR, +5 badge combo yards, flame border. Hidden on first game.

### Progressive Disclosure
`isFirstSeason` flag. First game: auto-Easy, teach tooltips, hidden difficulty/formation/Heat Check. Game 2+: full features.

### Game Day Conditions
Weather × Field × Crowd = 45 combinations. First game: Clear/Turf/Home. Shown on pregame VS screen.

### Play Sequence Combos
5 hidden patterns discovered through play. Flash text on trigger, no explanation.

### Difficulty
| Aspect | Easy | Medium | Hard |
|--------|------|--------|------|
| Play selection | Random | Situational | 50% optimal + 25% sit + 25% random |
| OVR modifier | -3 | Normal | +2 |
| Combo rate | Never | 40% | 80% |

## Shared Card Builders (src/ui/components/cards.js)
**Single source of truth.** Never duplicate card HTML inline.

| Builder | Returns |
|---------|---------|
| `buildHomeCard(type, w, h)` | Card back (offense/torch/defense) |
| `buildMaddenPlayer(p, w, h)` | Player card (badge, tier border, helmet) |
| `buildPlayV1(p, w, h)` | Play card (type icon watermark, tinted bg, risk) |
| `buildTorchCard(tc, w, h)` | Torch card (flame, tier border, text-safe) |
| `teamHelmetSvg(teamId, size)` | Team-colored helmet with facemask |
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

## Specced But Not Built (v2+)
- Additional TORCH cards (Prime Time, Challenge Flag, Double Down, etc.)
- Heat Check Clutch Factor (4th quarter auto-fire)
- Daily Drive shareable result grid (Wordle-style)
- Stats bottom sheet (swipe-up during gameplay)
- AI Coaching Personality flavor text
- Real crowd audio loops (system ready, files not sourced)
- Multiplayer, dynasty mode, app store release
