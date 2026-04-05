# TORCH Football — CLAUDE.md

## What This Is
TORCH Football is a mobile card game (Balatro meets college football). 4 fictional college teams with distinct offensive schemes. Single-game format — each session is one game, TORCH points persist across games. Card-based play selection, personnel system with stars/traits, special teams burn deck, and TORCH points (score = wallet). Built with Vite + vanilla JS + GSAP, deployed on Vercel.

## Version
**v0.32.0 "Visual Polish"** — Design system formalization + 25 visual refinements from design.md audit. Design tokens (typography scale, color/surface system, animation vocabulary) added to style.css. Visual: warm text (#f0ece4), semi-transparent borders, backdrop blur overlays, multi-layer card shadows, field strip vignette, scorebug elevation + LED glow cast, frosted result overlay, ghost pill badges, warm gold shadows, score micro-animation, directional screen transitions, card tray offense/defense color shift, possession crossfade. Gameplay: slot status indicator replaces phase pills, row labels replaced with color bars, tray header shortened to team name, scorebug dims during selection.

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
1. Bump version in `state.js` + `package.json`
2. Update DEV_LOG in `home.js`
3. Update this file's Version line
4. Commit, push dev, merge to main, push main
5. Tag: `git tag -a v0.X.Y -m "description"` + push tags
6. Create GitHub Release: `gh release create v0.X.Y --title "title" --notes "changelog"`
7. Run `/smoke` (engine + balance + build)
8. Return to dev branch

### Versioning
- **Patch** (v0.25.2→v0.25.3): bug fixes, balance tuning, text/docs changes
- **Minor** (v0.25→v0.26): new features or systems
- **Major** (v0→v1): public launch milestone (Discord beta, app store)
- Docs-only changes: no version bump, no tag

## File Structure
```
src/
├── main.js                    # App router (screen switching)
├── state.js                   # Global state, version, hand management, team draw weights
├── style.css                  # CSS custom properties / design system
├── data/
│   ├── teams.js               # 4 teams: Boars (sentinels), Dolphins (wolves), Spectres (stags), Serpents
│   ├── players.js             # 56 players (4 teams × 14: 7 OFF + 7 DEF) with stars, traits, ST ratings
│   ├── *Plays.js              # 10 OFF + 10 DEF plays per team (80 total)
│   ├── torchCards.js           # 24 TORCH cards (4 Gold, 10 Silver, 10 Bronze)
│   ├── torchCardIcons.js       # 20 game-icons.net SVG paths + renderTorchCardIcon()
│   ├── badges.js              # Badge enum + inline SVG icons
│   ├── teamLogos.js           # Team mascot SVGs (boar/dolphin/spectre/serpent)
│   └── gameConditions.js      # Weather/field/crowd (45 combos)
├── engine/
│   ├── gameState.js           # GameState class — full game simulation
│   ├── snapResolver.js        # Play resolution with personnel system + TORCH card effects
│   ├── personnelSystem.js     # 4-layer personnel modifier (baseline, synergy, heat, matchup)
│   ├── handManager.js         # 8-card hand: deal, carry-over, discard, reshuffle
│   ├── stDeck.js              # Special teams burn deck (14 players, burn on use)
│   ├── aiOpponent.js          # AI play/player selection + archetype weighting
│   ├── torchPoints.js         # TORCH point calculations (points only go UP)
│   ├── commentary.js          # Template-based user-biased commentary (4 tiers)
│   ├── ovrSystem.js           # OVR modifier calculations
│   ├── badgeCombos.js         # Badge combo checks
│   ├── sound.js               # jsfxr sound system + card sound placeholders
│   └── [5 more engine files]
├── ui/
│   ├── components/
│   │   ├── cards.js           # Shared card builders (play, player, torch cards with real SVG icons)
│   │   ├── cardTray.js        # 8-card tray: play + player rows, discard, GSAP animations
│   │   ├── shop.js            # Torch Store — TORCH card shop bottom sheet
│   │   ├── stSelect.js        # Special teams player selection overlay
│   │   ├── devPanel.js        # In-game dev tools (?dev)
│   │   ├── detailTooltip.js   # Hover/long-press info tooltips
│   │   ├── personnelTooltip.js # First-game onboarding tooltips (4 max)
│   │   └── tooltip.js         # First-time teach tooltips
│   ├── effects/
│   │   └── torchPointsAnim.js # Sequential points fly-in animation
│   ├── field/
│   │   ├── fieldRenderer.js   # Digital Glass Floor (Canvas 2D, NOT yet wired into gameplay)
│   │   ├── fieldAnimator.js   # Animation: shake, particles, ball flight, camera follow
│   │   ├── playBuilder.js     # 13 pass concepts + 6 run concepts
│   │   └── test.html          # Interactive field test harness
│   └── screens/
│       ├── home.js            # Home screen (TORCH FOOTBALL, LET'S GO!)
│       ├── teamSelect.js      # Team select (centered badges, KICK OFF!)
│       ├── roster.js          # Meet Your Squad (14 players, pre-game preview)
│       ├── pregame.js         # Game Day (3s hold, broadcast matchup)
│       ├── gameplay.js        # Main game (~4000 lines — user-biased everything)
│       ├── halftime.js        # Halftime report + Torch Store + 2nd half card pick
│       ├── endGame.js         # End game (TORCH breakdown, Film Room, Play Again)
│       └── [3 more screens]
├── tests/
│   ├── smokeTest.js           # 699 engine assertions (snaps, cards, conversions, state)
│   ├── balanceTest.js         # 1200-drive balance test
│   └── gameSimTest.js         # 100-game simulation (scoring, economy, card usage)
└── docs/
    ├── research/
    │   ├── TORCH-7v7-FOOTBALL-RESEARCH.md    # Football source of truth
    │   └── TORCH-TEAM-SCHEME-IDENTITY.md     # Team scheme identity
    └── PERSONNEL-AUDIT.md     # Phase A codebase audit
```

## The 4 Teams

| Team | Scheme | Real Analog | Run/Pass | Def Shell |
|------|--------|-------------|----------|-----------|
| **Boars** (Ridgemont) | Power Spread | Georgia, Alabama | 55/45 | Cover 3 zone |
| **Dolphins** (Coral Bay) | Spread Option | Oregon, Rich Rod WVU | 50/50 | Cover 1 + spy |
| **Spectres** (Hollowridge) | Spread RPO | Oregon State, Baylor | 30/70 | Cover 0 blitz |
| **Serpents** (Blackwater) | Multiple/Pro | Saban, Kirby Smart | 45/55 | Multiple/disguised |

**Counter-play:** Boars > Serpents > Spectres > Dolphins > Boars

### Team Differentiation
| Dimension | Boars | Dolphins | Spectres | Serpents |
|-----------|-------|--------|-------|---------|
| Draft pool | RUN 4x | RUN 3x, SCREEN 2x | QUICK 4x, DEEP 3x | All 2x |
| Best formation | I-Form / Pistol | Shotgun / Pistol | Trips / Empty | Bunch / Twins |
| Star player | RB | QB | WR1 | Versatile flex |
| What beats them | Spread + quick pass | Contain QB + zone | Run the ball | Execute fundamentals |

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

## Torch Cards (24 total)

| Tier | Card | Type | Cost | Effect |
|------|------|------|------|--------|
| Gold | SCOUT TEAM | pre-snap | 180 | See opponent's play before picking yours |
| Gold | SURE HANDS | reactive | 200 | Cancel a turnover, drive continues |
| Gold | BLOCKED KICK | reactive | 150 | Chance to block opponent's FG or punt |
| Gold | HOUSE CALL | pre-snap | 175 | Returner guaranteed 50+ yard return |
| Silver | HARD COUNT | pre-snap | 90 | Force opponent to random play |
| Silver | DEEP SHOT | pre-snap | 100 | 2x yards on pass |
| Silver | TRUCK STICK | pre-snap | 100 | 2x yards on run, no fumble |
| Silver | CHALLENGE FLAG | reactive | 120 | Reroll snap, 50% better outcome |
| Silver | PRIME TIME | pre-snap | 75 | Featured player OVR = 99 |
| Silver | SCOUT REPORT | pre-snap | 30 | See all 7 players instead of 4 |
| Silver | PRE-SNAP READ | pre-snap | 35 | Reveals if opponent is in zone, man, or blitz |
| Silver | ICE THE KICKER | pre-snap | 20 | Reduce kicker accuracy by 1 star |
| Silver | CANNON LEG | pre-snap | 25 | Extend FG range by 10 yards |
| Silver | IRON MAN | pre-snap | 20 | Restore a burned ST player |
| Silver | RINGER | pre-snap | 30 | Best player kicks regardless of deck |
| Bronze | PLAY ACTION | pre-snap | 35 | +5 yards vs run defense |
| Bronze | SCRAMBLE DRILL | pre-snap | 40 | Convert negative to 0 yards |
| Bronze | 12TH MAN | pre-snap | 50 | +4 yards + 2x TORCH points |
| Bronze | ICE | pre-snap | 50 | Zero opponent OVR + combos |
| Bronze | PERSONNEL REPORT | pre-snap | 30 | Reveal opponent's player |
| Bronze | FRESH LEGS | pre-snap | 10 | Extra discard this drive |
| Bronze | GAME PLAN | pre-snap | 10 | Reset player heat to zero |
| Bronze | COFFIN CORNER | pre-snap | 15 | Punt guaranteed inside the 10 |
| Bronze | FAIR CATCH GHOST | pre-snap | 10 | Force opponent fair catch |

## Locked Design Decisions
- 4 teams, no draft. Predetermined squads and playbooks.
- Score = wallet. Buying TORCH cards spends your score.
- Single-game format. TORCH points persist across games.
- Progressive disclosure — learn by playing.
- TORCH points never decrease from plays (only from shop spending).
- 8 cards in hand (4 plays + 4 players). 3 TORCH card max.
- User perspective bias is always on — the game takes your side.

## Not Yet Built
- Option D snap reveal sequence (commit → blackout → result slam → card reveal)
  - Offense: result slams first, then cards flip to show matchup (highlight reel feel)
  - Defense: same rhythm, cold color palette (blue tones vs warm offense tones)
  - GSAP timeline: commit (0.2s) → blackout (0.2-0.6s) → result slam (0.4s) → card reveal (0.8s) → settle (0.5s)
  - Tier-scaled: routine plays ~1.8s total, big plays ~4-5s with extended blackout and screen shake
- Wire Canvas field renderer into gameplay.js (replace DOM field strip)
- Card activation animations (bronze/silver/gold escalation)
- Daily Drive shareable result grid (Wordle-style)
- Stats bottom sheet (swipe-up during gameplay)
- Real crowd audio loops (infrastructure exists, files not sourced)
- Multiplayer, dynasty mode, app store release

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
