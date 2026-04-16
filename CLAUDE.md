# TORCH Football — CLAUDE.md

## What This Is
TORCH Football is a mobile card game (Balatro meets college football). 8 fictional college teams (the Ember Eight conference) with distinct offensive schemes. Single-game format — each session is one game, TORCH points persist across games. Card-based play selection, personnel system with stars/traits, special teams burn deck, and TORCH points (score = wallet). Built with Vite + vanilla JS + GSAP, deployed on Vercel. **Shipping target: iOS + Android app stores via Capacitor** — all new code must work unchanged inside a native webview (see memory: Mobile App Shippability).

## Version
**v0.40.0 "Ember Eight"** — 4→8 team expansion shipped into single-game mode. New teams: Vermont Maples, Helix Salamanders, Larkspur Pronghorns, Sacramento Raccoons. Team select rebuilt as vertical hero carousel with POWERHOUSE / CONTENDER / UNDERDOG tier filter + hold-to-coach confirm. Per-team wordmark system (9 display typefaces, one per team). All downstream screens (pregame, gameplay, halftime, endGame, seasonRecap, roster) updated for the 8-team roster. Counter matrix (8-way rock-paper-scissors), 8 playbooks (160 plays), and 112 players all wired through. Mobile-prep phases 1-3: audio 220→7 MB, all fonts self-hosted via `@fontsource` (no CDN), `safe-area-inset` + `100dvh` on all screen roots, Capacitor-ready haptics (`src/engine/haptics.js`) + storage (`src/engine/storage.js`) facades.

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
| `src/data/` | All static game data: 8 teams, 112 players, 160 plays (8 × `*Plays.js`), 24 torch cards, game conditions, play diagrams, team identity/wordmarks, helmet variants, play sequence combos. | `TEAMS`, `TORCH_CARDS`, `COUNTER_MATRIX` |
| `src/engine/` | Game state and resolution. 26 modules: `gameState.js` is the simulation heart, `snapResolver.js` resolves plays, `personnelSystem.js` is the 4-layer player modifier, `aiOpponent.js` is AI brain, `torchPoints.js` is the economy, `handManager.js` manages the 8-card hand, `stDeck.js` is the special teams burn deck. Plus systems for momentum, achievements, streaks, career stats, game history, injuries, EPA, red zone, turnover returns, audio, haptics, storage. | `new GameState()`, `resolveSnap()`, `selectAIPlay()` |
| `src/ui/screens/` | Full-screen builders. One per route: `home`, `teamSelect`, `roster`, `pregame`, `gameplay` (~6,800 lines), `halftime`, `endGame`, `dailyDrive`, `seasonRecap`, `settings`, `teamCreator`, `visualTest`, `cardMockup`. `gameplay.css.js` holds the gameplay style sheet as a sibling string export. | `buildGameplay()`, `buildPregame()`, etc. |
| `src/ui/components/` | Reusable widgets: `cards.js` (play/player/torch builders), `cardTray.js` (8-card hand UI), `shop.js` (Torch Store sheet), `stSelect.js` (special teams picker), `devPanel.js`, `statsSheet.js` (scorebug-tap stats), `detailTooltip.js`, `personnelTooltip.js`, `tooltip.js`, `brand.js` (header/flame badge/accent bar), `clipboard.js`. | — |
| `src/ui/effects/` | `torchPointsAnim.js` — sequential points fly-in. | — |
| `src/ui/field/` | Canvas 2D field renderer + animator. Wired into gameplay as a background layer. | `createFieldAnimator()` |
| `src/utils/` | `flameIcon.js` (4-layer flame SVG), `footballIcon.js` (9-layer leather football SVG), `helmetLayers.js` (helmet construction). | `flameIconSVG()`, `footballIconSVG()` |
| `src/assets/` | SVGs (`flame.svg`, `football.svg`), `helmets/`, `icons/` (`teamLogos.js`, `torchCardIcons.js`), `lottie-starters/`, `torch-icons/`. | `renderTeamBadge()`, `renderTorchCardIcon()` |
| `src/tests/` | 13 test files: `smokeTest.js` (engine assertions), `balanceTest.js` (drive sim), `gameSimTest.js` (full-game sim), `persistenceTest.js`, `uiLogicTest.js`, `regressionTest.js`, `clicheBanTest.js`, `qaAudit.js`, `qaDownDistanceAudit.js`, `yardAlignmentTest.js`, `playByPlay.js`, `playByPlaySim.js`, `testRunner.js`. | `runSmokeTest()`, `runBalanceTest()` |
| `docs/` | `TORCH-EMBER-EIGHT-BIBLE.md` (canonical team/lore bible), `CLAUDE.md` (design system), `MOBILE-APP-RESEARCH.md`, `TESTING-GUIDE.md`, `research/` (football source-of-truth docs). | — |
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

### Team Schemes

| Team | Scheme | Real Analog | Run/Pass | Def Shell |
|------|--------|-------------|----------|-----------|
| **Pronghorns** (Larkspur) | Triple Option | Georgia Tech, Navy | 70/30 | Cover 4 zone |
| **Spectres** (Hollowridge) | Spread RPO | Oregon State, Baylor | 30/70 | Cover 0 blitz |
| **Maples** (Vermont) | West Coast | Bill Walsh, McVay Rams | 40/60 | Cover 2 zone |
| **Salamanders** (Helix) | Run & Shoot | June Jones, Mouse Davis | 25/75 | Cover 1 man |
| **Dolphins** (Coral Bay) | Spread Option | Oregon, Rich Rod WVU | 50/50 | Cover 1 + spy |
| **Serpents** (Blackwater) | Multiple/Pro | Saban, Kirby Smart | 45/55 | Multiple/disguised |
| **Boars** (Ridgemont) | Power Spread | Georgia, Alabama | 55/45 | Cover 3 zone |
| **Raccoons** (Sacramento) | Wishbone | Barry Switzer, DKR | 75/25 | Cover 3 zone |

## TORCH Cards (Score = Wallet)
24 cards across 3 tiers (4 Gold, 10 Silver, 10 Bronze). Max 3 in hand. Single-use. Icons from game-icons.net (CC BY 3.0). Source of truth: `src/data/torchCards.js`.

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
| Silver | ICE THE KICKER | pre-snap | 20 | Reduce kicker accuracy by 1 star |
| Silver | CANNON LEG | pre-snap | 25 | Extend FG range by 10 yards |
| Silver | IRON MAN | pre-snap | 20 | Restore a burned ST player |
| Silver | RINGER | pre-snap | 30 | Best player kicks regardless of deck |
| Bronze | PLAY ACTION | pre-snap | 35 | +5 yards vs run defense |
| Bronze | SCRAMBLE DRILL | pre-snap | 40 | Convert negative to 0 yards |
| Bronze | 12TH MAN | pre-snap | 60 | +4 yards + 2x TORCH points |
| Bronze | ICE | pre-snap | 50 | Zero opponent OVR + combos |
| Bronze | TIMEOUT | pre-snap | 40 | Add 30s to the 2-minute drill clock |
| Bronze | FRESH LEGS | pre-snap | 15 | Extra discard this drive |
| Bronze | GAME PLAN | pre-snap | 15 | Reset a player's heat to zero |
| Bronze | COFFIN CORNER | pre-snap | 15 | Punt guaranteed inside the 10 |
| Bronze | FAIR CATCH GHOST | pre-snap | 15 | Force opponent fair catch |

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
8-card hand: 4 play cards + 4 player cards visible simultaneously.
- **First snap of drive:** 4 plays from playbook (10 per team), 4 players from roster (7 per side)
- **After snap:** used play + player replaced at same slot position, other 6 carry over
- **Draw pile exhaustion:** discard pile reshuffles into draw pile
- **Discard:** 1 play + 1 player discard per drive (tap DISCARD → mark cards → confirm)
- **Possession change:** full redeal + discard reset
- **Draw weighting** (`TEAM_DRAW_WEIGHTS` in state.js): each team has weighted card pools matching their scheme identity
- State managed by `src/engine/handManager.js`

### Personnel System
112 players (8 teams × 14: 7 OFF + 7 DEF). Each has:
- `firstName` / `name` — full name
- `stars` (1-5) — visible quality indicator
- `trait` — single keyword (TRUCK STICK, BURNER, SHUTDOWN, etc.)
- `st` — hidden special teams ratings: `{ kickPower, kickAccuracy, returnAbility }` (1-5 each)

**Snap Resolver Integration** — 4 layers inserted after OVR, before red zone compression (±6 yard soft cap):
1. **Team baseline:** weighted average star rating by position relevance (±0.5/star from 3-star baseline)
2. **Trait synergy:** featured player's trait vs play type (e.g. BURNER + DEEP_PASS = +4)
3. **Heat penalty:** repeated featuring of same player (-1 to -3 yards at heat 3-5+)
4. **Direct matchup:** when both featured positions interact (star diff × 0.4 + trait-vs-trait table)

Heat maps persist across the entire game (do not reset per drive or half).

### Special Teams Burn Deck
All 14 players start in the ST deck. When used for FG/punt/kickoff/return, they're burned (removed for rest of game). Still appear in normal offensive/defensive hands.
- Selection overlay shows ST ratings, explains the role, warns about burning
- Burned players listed with result context: "Made 42-yard FG", "45-yard punt"
- AI selection scales with difficulty (Easy: random, Medium: top 3, Hard: optimal)
- State managed by `src/engine/stDeck.js`, UI by `src/ui/components/stSelect.js`

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

### Pre-game Sequence
Team select → Meet The Squads (roster preview) → Matchup Slam → Coin Toss → Kickoff → Gameplay

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
- `/smoke` — **RUN AFTER EVERY PRODUCTION DEPLOY.** Engine + balance + build check.
- `/balance` — Balance test only with target range interpretation
- Detail tooltips on torch cards (hover desktop / long-press mobile)

### Automated Tests
```bash
npm test                     # Full test suite (smoke + persistence + UI logic + game sim)
# Individual tests:
node --input-type=module -e "import { runSmokeTest } from './src/tests/smokeTest.js'; runSmokeTest();"
node --input-type=module -e "import { runBalanceTest } from './src/tests/balanceTest.js'; runBalanceTest(100);"
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
Core fonts: Teko (`--font-display`), Rajdhani (`--font-ui`), Barlow Condensed (`--font-body`), Oswald (`--font-label`). All self-hosted via `@fontsource`. Per-team wordmark fonts: Zilla Slab, Playfair Display, Josefin Sans, Italiana, DM Serif Display, Chakra Petch, Righteous, Major Mono Display, Marcellus.

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

## Locked Design Decisions
- 8 teams, no draft. Predetermined squads and playbooks.
- Score = wallet. Buying TORCH cards spends your score.
- Single-game format. TORCH points persist across games.
- Progressive disclosure — learn by playing.
- TORCH points never decrease from plays (only from shop spending).
- 8 cards in hand (4 plays + 4 players). 3 TORCH card max.
- User perspective bias is always on — the game takes your side.

## Not Yet Built
- Season mode (conference schedule, standings, coach progression)
- Multiplayer (challenge links, async play)
- Dynasty mode (multi-season, recruiting, prestige)
- Native app store release (iOS/Android via Capacitor)
- Full DOM field-strip → Canvas migration (canvas currently renders as a background layer behind the DOM strip; the DOM strip still hosts card placement)

## DESIGN PRINCIPLES

These principles apply to ALL design and implementation decisions in TORCH. If a proposed solution violates any of these, flag it and suggest an alternative.

### Mobile-First
- TORCH is a mobile game. Every interaction must work on a 375px portrait touchscreen.
- No hover-dependent interactions. Touchscreens don't have hover.
- No desktop-first assumptions. If it doesn't feel good under a thumb, redesign it.
- All screens use `safe-area-inset` + `100dvh` for native webview compatibility.
- Goal is deployment to iOS and Android app stores via Capacitor.

### Real Football Logic
- Default to "what would real football do?" when making gameplay mechanic decisions.
- If a mechanic doesn't mirror real football logic, question it.
- Player learning should come from pattern recognition, not tutorials or exposed math.

### Premium Always
- Use GSAP for all card and UI animations, not CSS transitions. GSAP is in the stack.
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

### Sequential Decision-Making
- Present design questions one at a time, not as long lists.
- Answers to earlier questions often inform later ones (dependencies).
- This applies to both human design sessions and AI-generated specs.

### Information Hierarchy
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
- All fonts must be self-hosted via `@fontsource`. No runtime CDN dependencies.
