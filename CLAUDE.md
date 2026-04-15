# TORCH Football — CLAUDE.md

## What This Is
TORCH Football is a mobile card game (Balatro meets college football). 8 fictional college teams (the Ember Eight conference) with distinct offensive schemes. Single-game format — each session is one game, TORCH points persist across games. Card-based play selection, personnel system with stars/traits, special teams burn deck, and TORCH points (score = wallet). Built with Vite + vanilla JS + GSAP, deployed on Vercel. **Shipping target: iOS + Android app stores via Capacitor** — all new code must work unchanged inside a native webview (see memory: Mobile App Shippability).

## Version
**v0.40.0 "Ember Eight" (in flight, on dev)** — 4→8 team expansion shipping into single-game mode. New teams: Vermont Maples, Helix Salamanders, Larkspur Pronghorns, Sacramento Raccoons. Team select rebuilt as vertical hero carousel with POWERHOUSE / CONTENDER / UNDERDOG tier filter + hold-to-coach confirm. Per-team wordmark system lands (9 display typefaces, one per team). All downstream screens (pregame, gameplay, halftime, endGame, seasonRecap, roster) updated for the 8-team roster. Counter matrix, playbooks (4 new + 4 heavy rewrites), and 112 players all wired through. Internal team IDs `stags → Spectres`, `wolves → Dolphins`, `sentinels → Boars` are legacy from prior mascot renames; display names are correct (see Ember Eight bible at `docs/TORCH-EMBER-EIGHT-BIBLE.md`). Mobile-prep phases 1-3: audio 220→7 MB (raw WAV archive gitignored + MP3 transcode), all fonts self-hosted via `@fontsource` (no CDN), `safe-area-inset` + `100dvh` on all screen roots, Capacitor-ready haptics (`src/engine/haptics.js`) + storage (`src/engine/storage.js`) facades for future native-storage swap. Helmet generator tool shipped as a standalone utility at `/mockups/helmets.html`.

**v0.37.0 "Fresh Paint"** — Visual identity overhaul for all 4 team mascots and pregame weather icons. Replaced Boars mascot with detailed multi-path boar illustration from IconScout (gold-to-bronze gradient). Added color gradients to all 4 team logos: Boars gold-to-bronze, Dolphins deep magenta-to-pink, Spectres icy blue gradient body, Serpents lime-to-forest green. Each logo now has its own namespaced `<linearGradient>` def in `teamLogos.js`. Replaced 4 crude hand-drawn weather icons (rain, snow, wind, sun) in the pregame conditions strip with polished filled icons from IconScout Unicons weather pack. All weather icons render as single-path `currentColor` fills at 22px in the gold conditions strip. No gameplay changes — smoke 815/815, build 1.12s.

**v0.36.1 "Spring Cleaning"** — Refactor + dead code pass. Extracted ~260 lines of inline CSS from `gameplay.js` into a sibling `gameplay.css.js` module (gameplay.js is now ~4076 lines, was ~4340). Consolidated team-specific TD celebration config (`colors` + `phrases`) into `teams.js` instead of duplicating it across `gameplay.js` and `seasonRecap.js`. Moved icon data from `src/data/teamLogos.js` and `src/data/torchCardIcons.js` into a new `src/assets/icons/` directory and updated all 8 import sites. Deleted `src/data/badges.js` (~70 lines, fully unreferenced legacy file). Removed dead `initHand`, `cycleCard`, `hotRoute` hand-management functions from `state.js` (the live `cycleCard` is a local in `gameplay.js` with a different signature). Added `"type": "module"` to `package.json`. Cleaned up unreachable `team.celebration` fallback branches at gameplay.js:4080 and seasonRecap.js:190. No behavior changes — engine smoke 821/821, balance test green, build 967ms.

**v0.36.0 "Kickoff Ritual"** — Cinematic 3-beat pre-game runway (Matchup Slam → Coin Toss → Kickoff) replaces the old static matchup card + inline gameplay coin toss. Beat 1 slams full-width team cards from top and bottom with VS burn. Beat 2 is a tap-to-flip 3D coin (with real team badges on each face), winner's interactive choice of RECEIVE vs TAKE A CARD, and 3 face-down TORCH cards that flip open to a tier-styled reveal. Beat 3 stamps KICKOFF with stadium flash and bass drop. Routing flipped: team select → Meet The Squads → runway → gameplay. Full visual asset overhaul — 4-layer flame SVG replaces old single-path flame across 13 files (home title, HUD banner, points animations, torch cards, buttons) via new `src/utils/flameIcon.js` helper. 9-layer leather football SVG replaces old gradient football in field renderer and TORCH title "O" via new `src/utils/footballIcon.js` helper. Meet The Squads polish: tighter team identity strip, symmetric OFFENSE/DEFENSE headers with avg star rating, aligned flame pips across all player rows. Bug fixes: auto-fullscreen removed (killed viewport height issues on coin toss), team card scale-on-select removed (no more dimension shifts), pregame runway click events wired directly instead of via GSAP's pointerEvents (which silently dropped), coin hover animation preserves horizontal centering, phase-exclusive fade-outs so runway beats don't stack on each other's text. Four home-page mockup archetypes in `public/mockups/` (Hero Focal, Stadium Tunnel, Broadcast Dashboard, Focal Hybrid + First Launch).

**v0.33.0 "Broadcast Polish"** — Premium gameplay feel: card breathing animation, shimmer sweep on gold UI, hitstop freeze before results (tier-scaled 0-80ms), score slide-up animation with particles, Tier 1 snap cycle compressed (50ms blackout, 1200ms hold), auto-advance replaces NEXT PLAY button, torch fanfare halved on repeat, cards visible at 0.3 opacity during routine results, field pulse at ball position, SNAP button inset press shadow, score weight lightened (Teko 500), ring shadow scorebug borders, saturate(160%) on all backdrop blur. Fixes: TORCH points only shown on user-positive plays, score/torch updates deferred until overlay clears, 2-minute drill clock always visible on overlays, first down gold bar removed, play clock bar removed, gsap import added to gameplay.js.

## Environments & Deployment

| Environment | Branch | URL | Updates |
|---|---|---|---|
| **Local** | `dev` | `localhost:5173` | Auto on file save |
| **Preview** | `dev` | Auto-generated per `git push origin dev` | Shareable test URL |
| **Production** | `main` | `torch.football` | Merge dev→main + push |

### Local Development (Vite)
```bash
npm run dev                  # Local dev (port 5173, phone accessible via LAN)
npm run build                # Production build (dist/)
```

### Persistent Dev Server (PM2)
The dev server is configured to run 24/7 in the background via PM2. This allows for instant access from mobile devices without keeping a terminal open.
```bash
pm2 list                     # Check server status
pm2 logs torch-dev           # View QR code and Network URL
pm2 restart torch-dev        # Refresh the server
pm2 stop torch-dev           # Stop the background process
```

### Deployment (Vercel)
```bash
git push origin dev           # Preview deploy (auto)
git checkout main && git merge dev --no-edit && git push origin main  # Production deploy (auto)
```

### Deployment Checklist (production pushes only)
1. Bump version in `state.js` (`VERSION` + `VERSION_NAME`) and `package.json`. Home banner + footer label read directly from `state.js`'s `VERSION` export, so no changelog file to update.
2. Update this file's Version line with a 1-paragraph summary
3. Commit, push dev, merge to main, push main
4. Tag: `git tag -a v0.X.Y -m "description"` + push tags
5. Create GitHub Release: `gh release create v0.X.Y --title "title" --notes "changelog"`
6. Run `/smoke` (engine + balance + build)
7. Return to dev branch

### Versioning
- **Patch** (v0.25.2→v0.25.3): bug fixes, balance tuning, text/docs changes
- **Minor** (v0.25→v0.26): new features or systems
- **Major** (v0→v1): public launch milestone (Discord beta, app store)
- Docs-only changes: no version bump, no tag

## File Structure

A high-level map. Per-file listings drift fast — `ls src/<dir>/` is always authoritative.

| Path | Purpose | Key entry points |
|---|---|---|
| `src/main.js` | App router. Screen switch + transitions, called once on boot. | `render()` |
| `src/state.js` | Global `GS`, version, draw weights, save/load, getTeam helpers. | `VERSION`, `GS`, `setGs()`, `getTeam()` |
| `src/style.css` | Global CSS variables (colors, typography, spacing, animation tokens). | — |
| `src/data/` | All static game data: 4 teams, 56 players, 80 plays (4 × `*Plays.js`), 25 torch cards, 45 weather/field/crowd combos, play sequence combos, badge enum stubs. | `TEAMS`, `TORCH_CARDS`, `getOffenseRoster()`, `getDefenseRoster()` |
| `src/engine/` | Game state and resolution. ~24 modules: `gameState.js` is the simulation heart, `snapResolver.js` resolves plays, `personnelSystem.js` is the 4-layer player modifier, `aiOpponent.js` is AI brain, `torchPoints.js` is the economy. Plus systems for momentum, achievements, streaks, career stats, game history, injuries, EPA, red zone, turnover returns, audio, haptics. | `new GameState()`, `resolveSnap()`, `selectAIPlay()` |
| `src/ui/screens/` | Full-screen builders. One per route: `home`, `teamSelect`, `roster`, `pregame`, `gameplay` (the 6,700-line main game loop and refactor candidate), `halftime`, `endGame`, `dailyDrive`, `seasonRecap`, `settings`, `teamCreator`, `visualTest`, `cardMockup`. `gameplay.css.js` holds the gameplay style sheet as a sibling string export. | `buildGameplay()`, `buildPregame()`, etc. |
| `src/ui/components/` | Reusable widgets: `cards.js` (play/player/torch builders), `cardTray.js` (8-card hand UI), `shop.js` (Torch Store sheet), `stSelect.js` (special teams picker), `devPanel.js`, `statsSheet.js` (scorebug-tap stats), `detailTooltip.js`, `personnelTooltip.js`, `tooltip.js`, `brand.js` (header/flame badge/accent bar), `clipboard.js`. | — |
| `src/ui/effects/` | `torchPointsAnim.js` — sequential points fly-in. | — |
| `src/ui/field/` | Canvas 2D field renderer + animator. Wired into gameplay as a background layer. | `createFieldAnimator()` |
| `src/utils/` | `flameIcon.js` (4-layer flame SVG helper), `footballIcon.js` (9-layer leather football SVG helper). | `flameIconSVG()`, `footballIconSVG()` |
| `src/assets/icons/` | Icon path data: `teamLogos.js`, `torchCardIcons.js`. Moved out of `src/data/` in v0.36.1. | `renderTeamBadge()`, `renderTorchCardIcon()` |
| `src/tests/` | `smokeTest.js` (821 engine assertions), `balanceTest.js` (12-combination drive sim), `gameSimTest.js` (full-game simulation), `regressionTest.js`. | `runSmokeTest()`, `runBalanceTest()` |
| `docs/` | `CLAUDE.md` (design system), `MOBILE-APP-RESEARCH.md`, `PHASE-B-STATUS.md`, `TEST-PLAN-PREPROD.md`, `TESTING-GUIDE.md`, `elevenlabs-sfx-prompts.md`, `research/` (football source-of-truth docs). | — |
| `public/` | Static assets: `audio/` (crowd loops, sfx, ambient, PA), `mockups/` (in-progress design HTMLs). | — |

## The Ember Eight

8 teams across 3 talent tiers. Full lore, ghost coaches, regional identity,
scheme details, and counter matrix live in `docs/TORCH-EMBER-EIGHT-BIBLE.md`
(canonical). Quick reference:

| Tier | Teams |
|------|-------|
| **POWERHOUSE** | Larkspur Pronghorns · Hollowridge Spectres |
| **CONTENDER** | Vermont Maples · Helix Salamanders · Coral Bay Dolphins · Blackwater Serpents |
| **UNDERDOG** | Ridgemont Boars · Sacramento Raccoons |

Counter matrix (8-way rock-paper-scissors): see `teams.js → COUNTER_MATRIX`.

**Note on internal team IDs:** 3 IDs are legacy from prior mascot renames
and don't match the current display name. Not a bug — everything routes
through `TEAMS[id].name` for UI:

| Internal ID | Display Name | School |
|---|---|---|
| `stags` | SPECTRES | Hollowridge State |
| `wolves` | DOLPHINS | Coral Bay |
| `sentinels` | BOARS | Ridgemont |
| `pronghorns`, `maples`, `salamanders`, `serpents`, `raccoons` | (match) | (match) |

Legacy 4-team scheme details (accurate for these specific teams):

| Team | Scheme | Real Analog | Run/Pass | Def Shell |
|------|--------|-------------|----------|-----------|
| **Boars** (Ridgemont) | Power Spread | Georgia, Alabama | 55/45 | Cover 3 zone |
| **Dolphins** (Coral Bay) | Spread Option | Oregon, Rich Rod WVU | 50/50 | Cover 1 + spy |
| **Spectres** (Hollowridge) | Spread RPO | Oregon State, Baylor | 30/70 | Cover 0 blitz |
| **Serpents** (Blackwater) | Multiple/Pro | Saban, Kirby Smart | 45/55 | Multiple/disguised |

### Team Differentiation (legacy 4)
| Dimension | Boars | Dolphins | Spectres | Serpents |
|-----------|-------|--------|-------|---------|
| Draft pool | RUN 4x | RUN 3x, SCREEN 2x | QUICK 4x, DEEP 3x | All 2x |
| Best formation | I-Form / Pistol | Shotgun / Pistol | Trips / Empty | Bunch / Twins |
| Star player | RB | QB | WR1 | Versatile flex |
| What beats them | Spread + quick pass | Contain QB + zone | Run the ball | Execute fundamentals |

Ember Eight newcomers (Maples, Salamanders, Pronghorns, Raccoons) — see
`docs/TORCH-EMBER-EIGHT-BIBLE.md` and `docs/EMBER-EIGHT-PLAYBOOKS.md`
for scheme, personnel, and counter details.

## TORCH Cards (Score = Wallet)
24 cards across 3 tiers. Max 3 in hand. Single-use. Icons from game-icons.net (CC BY 3.0).
See full card table in the "Torch Cards (24 total)" section below.

**Economy:** TD = 15 pts, Big play = 10, First down = 2, Sack/INT = 8-12. Win bonus = 20 pts. Cards are expensive relative to earnings — buying is a real decision.

**Torch Store:** Opens on 5 player-positive triggers:
1. After player scores a touchdown (post-PAT, before kickoff)
2. After player forces a turnover (INT or fumble recovery)
3. After player stops opponent on 4th down (turnover on downs)
4. After a star player activates (Heat Check)
5. At halftime

Does NOT open when the AI scores, forces turnovers, or on conversions. 3 cards offered (60% bronze, 30% silver, 10% gold).

**AI behavior:** Easy = 0 cards/never buys. Medium = starts 1 Bronze, buys cheapest. Hard = starts 1 Silver, buys 2 best value.

**Categories** (icon fill color): information (gold #EBB010), amplification (green #00FF44), disruption (red #FF4511), protection (blue #4488FF).

**Rendering:** Real SVG icons. Bronze = static border. Silver = shimmer. Gold = glow pulse. Reactive = dashed border + "REACTIVE" label.

## User Perspective Bias

The game is always on the user's side. This is enforced across 6 layers:

1. **Colors:** Green = good for user, Red = bad. Flips when user is on defense.
2. **Visual weight:** Good results are large/glowing/centered. Bad results are small/muted/top-positioned.
3. **Timing:** Good results hold 1.5x longer. Bad results 0.9x (move on faster).
4. **Commentary:** Energetic CAPS + exclamation for user wins. Flat factual tone for opponent gains.
5. **Sound:** Triumphant sounds only for user success. Muted tones for opponent.
6. **Ambient mood:** Field brightness ±6%, edge vignette on negative momentum (4-play rolling average).

## Key Systems

### Hand Management
See Personnel System section below for current hand management rules (8-card hand with carry-over).

**Draw weighting** (`TEAM_DRAW_WEIGHTS` in state.js): Boars see run cards 4x more. Spectres see quick/deep pass cards 3-4x more. Serpents balanced (all 2x).

### Onboarding
First-time players start at 1st & Goal from the 9 with a SURE HANDS gold card. 3-step tooltip sequence: welcome → mechanics → torch cards. Phase-based teach tooltips on first snap. Personnel tooltips (4 max) suggest player cards after play selection.

### Conversions
2pt and 3pt conversions play through the full 3-beat snap flow with commentary. XP is automatic. `_isConversion` flag prevents TD celebration loop. Result shows "GOOD!" or "NO GOOD" (not "TOUCHDOWN"). No down & distance overlay. No shop trigger after conversion.

### Difficulty
| Aspect | Easy | Medium | Hard |
|--------|------|--------|------|
| Play selection | Random | Situational | 50% optimal + 25% sit + 25% random |
| OVR modifier | -3 | Normal | +2 |
| Mean yard bonus | +1.5 (0 if ahead 21+) | +1 human / -0.5 AI | -1 |
| Sack cancel | 30% | None | None |
| INT cancel | 40% | None | None |
| AI TORCH cards | 0 | 1 Bronze | 1 Silver |

## Game Flow

### Game Structure
- 2 halves, 20 plays per half (40 total outside 2-minute drills)
- Possessions alternate naturally: score → kickoff, turnover → opponent ball, failed 4th down → opponent ball
- No overtime. Ties are valid outcomes.

### 4th Down Rule
You MUST go for it on 4th down unless you have crossed the 50 yard line into opponent territory. Only past the 50 do PUNT and FIELD GOAL options appear. This applies to both the player and the AI.

### Kickoff Distribution (college football data)
After every score (TD+PAT or FG), the opponent receives a kickoff:
| Result | Weight | Starting Position |
|--------|--------|------------------|
| Touchback | 58% | Own 25 |
| Short return | 22% | Own 20-28 |
| Average return | 13% | Own 28-35 |
| Good return | 5% | Own 35-45 |
| Big return | 1.5% | Own 45-50 |
| Return TD | 0.5% | Automatic touchdown |

### Punt Distribution (college football data)
Gross distance: 25-34 yds (10%), 35-39 (20%), 40-44 (35%), 45-49 (25%), 50-58 (10%).
Return: fair catch 40%, short 5-12 yds (35%), decent 13-25 (20%), big 26-45 (5%).
Touchback if landing inside 10: 60% touchback to 25, 40% downed at spot.

### Field Goal
Auto-resolves from college make rates: 88% (20-29 yds), 80% (30-39), 68% (40-49), 50% (50 yds max).
Missed FG: opponent gets ball at LOS or the 20, whichever is farther from end zone.

### Scoring
- TD (6 pts) + choose: XP (free +1), 2-pt conversion from the 5, 3-pt conversion from the 10
- FG (3 pts)
- Conversion turnovers are dead plays (conversion failed, no defensive score)
- PAT/conversion snaps do not count toward the 20-play limit

### Coin Toss
Winner chooses: free Torch Card (3 face-down, flip one to reveal — pool: 55% Bronze, 35% Silver, 10% Gold) OR receive the kickoff. Loser gets whatever winner didn't pick. At halftime, coin toss loser gets the same choice.

### 2-Minute Drill
Triggers after 20 plays used in a half. 2:00 clock. Time drain: run/completion 25-30s, sack 20s, incomplete 5s (stops), spike 3s (stops), kneel 30s (only when leading). Timeouts only exist as Torch Cards. PAT still happens after time-expiring TD.

### Safety Handling
Safeties are NOT implemented. Negative yardage is capped at the 1-yard line.

## Dev Tools
Enable: `localStorage.setItem('torch_dev', '1')` or visit any URL with `?dev`.
- `?dev` — In-game dev panel (auto-opens on desktop): jump to gameplay, force results, force conversions, give torch cards, apply state, redeal hand, reset discards, ST deck info, view roster
- `/smoke` — **RUN AFTER EVERY PRODUCTION DEPLOY.** Engine (699 assertions) + balance (1200 drives) + build check.
- `/balance` — Balance test only with target range interpretation
- Detail tooltips on torch cards (hover desktop / long-press mobile)

### Automated Tests
```bash
# Engine smoke test (699 assertions, ~2s)
node --input-type=module -e "import { runSmokeTest } from './src/tests/smokeTest.js'; runSmokeTest();"
# Balance test (1200 drives, ~5s)
node --input-type=module -e "import { runBalanceTest } from './src/tests/balanceTest.js'; runBalanceTest(100);"
# Full game simulation (1200 games, ~30s)
node --input-type=module -e "import { runGameSim } from './src/tests/gameSimTest.js'; runGameSim(100);"
```

## Design System

### Colors & Surfaces
```css
/* 4 elevation levels */
--bg: #0A0804;           /* Deepest canvas */
--bg-surface: #141008;   /* Cards, panels */
--bg-raised: #1E1610;    /* Elevated elements */
--bg-overlay: #281E14;   /* Modals, sheets */

/* Accent colors */
--torch: #FF4511;        /* Brand, CTA */
--a-gold: #EBB010;       /* Warm Gold — titles, highlights */
--l-green: #00ff44;      /* Success, good for user */
--p-red: #ff0040;        /* Danger, bad for user */
--cyan: #4DA6FF;         /* Defense, info */

/* Text hierarchy */
--text-primary: #ffffff;    --text-secondary: #bbbbbb;
--text-muted: #888888;      --text-faint: #555555;

/* Overlays */
--overlay-heavy: rgba(10,8,4,0.95);   /* Modals, confirms */
--overlay-medium: rgba(10,8,4,0.88);  /* Sheets, drawers */
--overlay-light: rgba(0,0,0,0.5);     /* Scrims, backdrops */
--overlay-subtle: rgba(0,0,0,0.3);    /* Hover states */

/* Borders */
--border-subtle: rgba(255,255,255,0.04);
--border-default: rgba(255,255,255,0.08);
--border-strong: rgba(255,255,255,0.15);

/* Shadows */
--shadow-card: 0 2px 8px rgba(0,0,0,0.3);
--shadow-elevated: 0 8px 24px rgba(0,0,0,0.5);
--shadow-dramatic: 0 12px 40px rgba(0,0,0,0.7);

/* Radius: 3 stops only */
--radius-sm: 4px;  --radius-md: 6px;  --radius-lg: 8px;
```
No emoji in UI. No blue outside defense card backs.

### Typography
Fonts: Teko (`--font-display`), Rajdhani (`--font-ui`), Barlow Condensed (`--font-body`), Oswald (`--font-label`).

| Role | Class | Font | Size | Weight | Spacing | Use |
|------|-------|------|------|--------|---------|-----|
| Hero | `.t-hero` | Teko | 56px | 900 | 6px | Home title, gameplay drama |
| Display | `.t-display` | Teko | 36px | 700 | 3px | Section headers, scores |
| Title | `.t-title` | Teko | 24px | 700 | 2px | Screen/modal titles |
| Heading | `.t-heading` | Teko | 18px | 700 | 2px | Card headers, large labels |
| Body | `.t-body` | Rajdhani | 14px | 600 | 1px | Primary content |
| Label | `.t-label` | Rajdhani | 11px | 700 | 1px | UI labels, buttons |
| Caption | `.t-caption` | Rajdhani | 9px | 700 | 0.5px | Micro labels, badges |
| Scheme | `.t-scheme` | Oswald | 11px | 700 | 2px | Team scheme labels |

New code should use these classes or variables. Existing inline styles stay until touched for other reasons.

### Animation Tokens
```css
/* Durations */
--dur-instant: 0.1s;    /* Button feedback */
--dur-fast: 0.2s;       /* State changes */
--dur-normal: 0.3s;     /* Overlays, card moves */
--dur-slow: 0.5s;       /* Celebrations, entrances */
--dur-dramatic: 0.8s;   /* Hero moments, reveals */

/* CSS easing (GSAP equivalents) */
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);       /* power2.out — entrances */
--ease-in: cubic-bezier(0.32, 0, 0.67, 0);         /* power2.in — exits */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);  /* back.out(1.5) — cards */
--ease-snap: cubic-bezier(0.22, 1, 0.36, 1);       /* power3.out — snappy */
```
GSAP easing vocabulary: `power2.out` (entrances), `power2.in` (exits), `back.out(1.5)` (cards/deal), `back.out(2.5)` (celebrations), `elastic.out` (rare, TD only).

## Personnel System (v0.27.0)

### Player Data Model
56 players (4 teams × 14: 7 OFF + 7 DEF). Each has:
- `firstName` / `name` — full name (e.g. Marcus Henderson)
- `stars` (1-5) — visible quality indicator (replaces OVR for player-facing display)
- `trait` — single keyword (TRUCK STICK, BURNER, SHUTDOWN, etc.)
- `st` — hidden special teams ratings: `{ kickPower, kickAccuracy, returnAbility }` (1-5 each)
- Backward-compatible: retains `ovr`, `badge`, `isStar`, `num`, `ability`

### Hand Management
8-card hand: 4 play cards + 4 player cards visible simultaneously.
- **First snap of drive:** 4 plays from playbook (10), 4 players from roster (7)
- **After snap:** used play + player replaced at same slot position, other 6 carry over
- **Draw pile exhaustion:** discard pile reshuffles into draw pile
- **Discard:** 1 play + 1 player discard per drive (tap DISCARD → mark cards → confirm)
- **Possession change:** full redeal + discard reset
- State managed by `src/engine/handManager.js`

### Special Teams Burn Deck
All 14 players start in the ST deck. When used for FG/punt/kickoff/return, they're burned (removed for rest of game). Still appear in normal offensive/defensive hands.
- Selection overlay shows ST ratings, explains the role, warns about burning
- Burned players listed with result context: "Made 42-yard FG", "45-yard punt"
- AI selection scales with difficulty (Easy: random, Medium: top 3, Hard: optimal)
- State managed by `src/engine/stDeck.js`, UI by `src/ui/components/stSelect.js`

### Snap Resolver Personnel Integration (Phase B)
4 layers inserted after OVR, before red zone compression (±6 yard soft cap):
1. **Team baseline:** weighted average star rating by position relevance (±0.5/star from 3-star baseline)
2. **Trait synergy:** featured player's trait vs play type (e.g. BURNER + DEEP_PASS = +4)
3. **Heat penalty:** repeated featuring of same player (-1 to -3 yards at heat 3-5+)
4. **Direct matchup:** when both featured positions interact (star diff × 0.4 + trait-vs-trait table)

Heat maps persist across the entire game (do not reset per drive or half). Updated after each snap.

### Pre-game Roster Preview
"MEET YOUR SQUAD" screen between team select and pregame. Shows all 14 players (7 OFF + 7 DEF) with stars, position, full name, trait. Star players highlighted with gold border + star title.

### GSAP Animations
All card animations use GSAP (not CSS transitions). Installed: `gsap@3.14.2`.
- **Deal:** cards enter from above with stagger (0.08s) + overshoot (back.out 1.7)
- **Select:** card leaves tray (ghost slot "ON FIELD"), appears on field
- **Touch feedback:** subtle lift on touchstart, settle on touchend
- **Discard marking:** tilt + dim via GSAP

### Card Sounds (jsfxr placeholders)
`cardDeal`, `cardThud`, `cardFlick`, `cardLift`, `resultGood`, `resultBad`, `kickThud`, `kickGood`, `kickMiss`, `discardConfirm` — all mapped to jsfxr presets. Replace with Pixabay samples later.

## Torch Cards (25 total)

Source of truth: `src/data/torchCards.js`. Tier counts: 4 Gold, 11 Silver, 10 Bronze.

| Tier | Card | Type | Cost | Effect |
|------|------|------|------|--------|
| Gold | SCOUT TEAM | pre-snap | 180 | See opponent's play before picking yours |
| Gold | SURE HANDS | reactive | 200 | Cancel a turnover, drive continues |
| Gold | BLOCKED KICK | reactive | 150 | 35% chance to block opponent's FG or punt |
| Gold | HOUSE CALL | pre-snap | 160 | Returner guaranteed 50+ yard return |
| Silver | HARD COUNT | pre-snap | 90 | Force opponent to random play |
| Silver | DEEP SHOT | pre-snap | 120 | 2x yards on pass |
| Silver | TRUCK STICK | pre-snap | 100 | 2x yards on run, no fumble |
| Silver | CHALLENGE FLAG | reactive | 90 | Reroll snap, 50% better outcome |
| Silver | PRIME TIME | pre-snap | 75 | Featured player OVR = 99, no fumbles |
| Silver | SCOUT REPORT | pre-snap | 40 | See all 7 players instead of 4 |
| Silver | PRE-SNAP READ | pre-snap | 35 | Reveal opponent's featured player |
| Silver | ICE THE KICKER | pre-snap | 20 | Reduce kicker accuracy by 1 star |
| Silver | CANNON LEG | pre-snap | 25 | Extend FG range by 10 yards |
| Silver | IRON MAN | pre-snap | 20 | Restore a burned ST player |
| Silver | RINGER | pre-snap | 30 | Best player kicks regardless of deck |
| Bronze | PLAY ACTION | pre-snap | 35 | +5 yards vs run defense |
| Bronze | SCRAMBLE DRILL | pre-snap | 40 | Convert negative to 0 yards |
| Bronze | 12TH MAN | pre-snap | 60 | +4 yards + 2x TORCH points |
| Bronze | ICE | pre-snap | 50 | Zero opponent OVR + combos |
| Bronze | PERSONNEL REPORT | pre-snap | 30 | Reveal opponent's featured player |
| Bronze | TIMEOUT | pre-snap | 40 | Add 30s to the 2-minute drill clock |
| Bronze | FRESH LEGS | pre-snap | 15 | Extra discard this drive |
| Bronze | GAME PLAN | pre-snap | 15 | Reset a player's heat to zero |
| Bronze | COFFIN CORNER | pre-snap | 15 | Punt guaranteed inside the 10 |
| Bronze | FAIR CATCH GHOST | pre-snap | 15 | Force opponent fair catch |

## Locked Design Decisions
- 4 teams, no draft. Predetermined squads and playbooks.
- Score = wallet. Buying TORCH cards spends your score.
- Single-game format. TORCH points persist across games.
- Progressive disclosure — learn by playing.
- TORCH points never decrease from plays (only from shop spending).
- 8 cards in hand (4 plays + 4 players). 3 TORCH card max.
- User perspective bias is always on — the game takes your side.

## Not Yet Built
- Multiplayer (challenge links, async play)
- Dynasty mode (multi-season, recruiting, prestige)
- Native app store release (iOS/Android)
- Full DOM field-strip → Canvas migration (canvas currently renders as a background layer behind the DOM strip; the DOM strip still hosts card placement)

## DESIGN PRINCIPLES

These principles apply to ALL design and implementation decisions in TORCH. If a proposed solution violates any of these, flag it and suggest an alternative.

### Mobile-First
- TORCH is a mobile game. Every interaction must work on a 375px portrait touchscreen.
- No hover-dependent interactions. Touchscreens don't have hover.
- No desktop-first assumptions. If it doesn't feel good under a thumb, redesign it.
- Goal is eventual deployment to iOS and Android app stores.

### Real Football Logic
- Default to "what would real football do?" when making gameplay mechanic decisions.
- If a mechanic doesn't mirror real football logic, question it.
- Player learning should come from pattern recognition, not tutorials or exposed math.

### Premium Always
- Use GSAP for all card and UI animations, not CSS transitions. GSAP is in the stack.
- Use Pixabay audio samples for card sounds (snap, thud, flick), not jsfxr synthesis.
- Animation easing should feel physical — overshoot, settle, bounce. Never linear.
- When choosing between "good enough" and "premium," always choose premium.

### Card Game Identity
- TORCH is a card game that happens to be about football. Cards are the primary interaction.
- Cards should feel physical — dealt from a deck, slapped on the table, flicked away on discard.
- All card animations use GSAP timelines with staggered sequencing.
- Sound accompanies every card interaction (deal snap, select thud, discard flick).

### Torch Cards Emerge From Mechanics
- Torch Cards should not be designed in isolation. They emerge from game systems.
- When building a new system (discards, personnel, special teams), identify where a Torch Card would create a meaningful strategic decision and suggest it.
- Maintain a running inventory of Torch Card ideas in docs/TORCH-CARD-IDEAS.md.

### Sequential Decision-Making
- Present design questions one at a time, not as long lists.
- Answers to earlier questions often inform later ones (dependencies).
- This applies to both human design sessions and AI-generated specs.

### Information Hierarchy (from player quality research)
- One dominant visual signal readable in under 1 second (star rating, card border color).
- 3-5 key attributes visible on the card face (name, stars, trait).
- Full details behind a tap (progressive disclosure).
- Never show math, modifiers, or synergy bonuses to the player. They learn by playing.
- No abbreviations. Plain English traits and descriptions.

### Implementation Checks
- Before writing animation code, confirm GSAP can handle it natively. Don't fight the tool.
- Before building a UI interaction, confirm it works with touch events (not mouse events).
- Before adding a feature, check if it already exists in the codebase (Phase 0 audit pattern).
- Match existing code conventions for state management, field position tracking, and screen rendering.
