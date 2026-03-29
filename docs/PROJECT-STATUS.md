# TORCH Football — Project Status

**Last Updated:** 2026-03-29 (end of session 2)
**Updated By:** Claude Code session

---

## Quick Context (Read This First)

TORCH Football is a mobile card game (Balatro meets college football). 4 fictional college teams, card-based play selection, TORCH points economy (score = wallet). Built with Vite + vanilla JS + GSAP + Howler.js. Solo dev (Brock), 17 days in development.

**Production (main):** v0.28.0 — Stable, playable, 24 cards, basic game loop. Live at torch.football.
**Preview (dev remote):** Same as prod. Not updated with dev changes yet.
**Local Dev (dev branch):** 43 commits ahead of prod. Massive feature expansion. NOT released.
**Field Animation (src/ui/field/):** Isolated project, iterating independently. NOT merged into game.

---

## What's In Production (v0.28.0)

- 4 teams (Boars, Dolphins, Spectres, Serpents) with distinct playbooks (10 OFF + 10 DEF each)
- 24 torch cards (12 were disabled/unimplemented)
- 56 players with stars, traits, ST ratings
- 8-card hand management (4 plays + 4 players)
- Special teams burn deck
- Personnel system (4-layer modifier)
- AI opponent (Easy/Medium/Hard)
- Howler.js audio (15 SFX pools, 3-tier crowd)
- End game replay loop (MVP card, open loop, PLAY AGAIN)
- Per-team win-loss records
- Coin toss with face-down card pick
- 2-minute drill with clock management
- DOM field strip (not canvas)
- 699 smoke test assertions

---

## What's On Local Dev (Unreleased)

### New Systems (7 engine modules)
- **Momentum Chains** — Per-player momentum (0-5), bonus yards at 3+
- **Card Combos** — 5 discoverable pairs trigger bonus effects
- **Achievements** — 19 persistent achievements (first win through national champion)
- **Rival Streaks** — Win streaks + head-to-head records per team
- **Game History** — Last 50 games logged with form string (W/D/L)
- **Career Stats** — Cumulative totals across all games
- **Haptic Feedback** — 18 vibration patterns for all interactions

### New Screens (3)
- **Season Recap** — 3-game season results, championship path, confetti
- **Settings** — Audio toggle, game speed, achievements gallery, career stats, game history, reset
- **Stats Sheet** — Tap scorebug for live game stats overlay

### Major Features
- **Conference Season Mode** — 3 regular games → championship if 2+ wins → National Champion
- **Daily Drive** — Seeded daily challenge, emoji share grid, streak tracking
- **Halftime Strategic Decision** — Aggressive (+2 yds, +5% INT) / Balanced / Conservative (-1 yd, -50% INT)
- **25 Torch Cards** — All 12 previously disabled cards now wired. Added TIMEOUT card.
- **Reactive Card Prompts** — SURE HANDS and CHALLENGE FLAG show USE IT / SAVE IT decision modal
- **Audible Mechanic** — Change play at the line + see DEF TENDENCY hint
- **Game Speed Settings** — Normal / Fast (0.6x) / Turbo (0.3x) animation speed
- **Mid-Game Save/Resume** — Auto-saves to localStorage, RESUME GAME on home screen
- **Team-Specific AI** — Each team's AI plays to their scheme identity

### Game Feel (Snap Reveal + Celebrations)
- **Option D Snap Reveal** — Commit → blackout → result slam → card reveal (tier-scaled)
- **Drive Heat Bar** — 0-120 momentum indicator at bottom of screen
- **Scoring Cascade** — Balatro-style point stacking on TDs (+6 TOUCHDOWN, +N BONUS)
- **Turnover Drama** — Red/green vignette + "YOUR BALL!" / "Possession lost."
- **Clutch Drive Detection** — Go-ahead TDs in 2nd half get enhanced celebration
- **Sack Brutality** — Hard shake + red flash (offense) or green "SACKED!" (defense)
- **Red Zone Intensity** — Field glow + "RED ZONE" flash on entry
- **First Down Celebration** — Gold banner + chime
- **End-of-Half Drama** — "FINAL" / "END OF HALF" overlay with whistle + score
- **Possession Change Swoosh** — Team-colored wipe + badge flash
- **Team-Specific TD Celebrations** — Unique confetti colors + catchphrases per team
- **Victory/Defeat Fanfare** — Ascending chimes (win) or somber thud (loss)
- **Newspaper Headlines** — "BOARS SURVIVE SERPENTS IN 24-21 THRILLER"

### Commentary Overhaul
- Dynamic narrative across game (hot streaks, comeback arcs, shutout watch)
- Player-trait matchup lines ("The blazing Martinez finds the end zone!")
- 30+ new templates, grammar fixes, cooldown system fix

### UI Polish
- Canvas field renderer wired (replaces DOM strip) — BUT field animation polish is separate project
- Mini field position map in scorebug (hidden by default, decluttered)
- Animated down & distance transitions
- Play-by-play ESPN ticker
- Win probability meter (hidden by default, decluttered)
- Smart card highlighting ("STRONG" labels on situationally good plays)
- Heat/fatigue badges on player cards (WARM/TIRED)
- Momentum pips on player cards
- Card tray: 10px lift, 40ms deal stagger, shadow depth
- Shop: first-visit tooltip, NEW badges, swap-cancel fix
- Safe area insets (iPhone notch/Dynamic Island)
- Color standardized (#00ff44 green, #ff0040 red)
- Scorebug optimized (DOM created once, cached refs)
- Screen crossfade transitions (150ms out / 200ms in)

### Hidden Features
- **Custom Team Creator** — Engine + screen built, not wired to UI. Access via console.

### Onboarding
- 3-step visual tutorial (glow highlights on play → player → SNAP)
- Situational hints on ALL games (not just repeat players)
- Post-first-TD economy explainer ("YOUR SCORE IS YOUR WALLET")
- First-shop tooltip
- Discard discovery tooltip (game 2)
- Streamlined flow: team select → pregame (roster screen removed from main flow)
- Pregame scouting report (opponent scheme, star players, matchup type)

### Balance
- Base mean multiplier 1.35→1.55 (more scoring)
- Variance tightened 1.15→0.90 (less random)
- Big play chance 7%→3.5% with soft cap above 20 yards
- Medium difficulty: +1 human / -0.5 AI yard adjustment
- Easy: toned down (sack cancel 30%, INT cancel 25%)
- Card prices rebalanced (BLOCKED KICK 50→150, HOUSE CALL 50→175, etc.)
- Boars run plays buffed
- AI card buying improved (buys high-impact, not cheapest)

### Testing & Dev Tools
- **810 smoke test assertions** (14 test sections)
- **1000-game simulation** (reports win rates, tie rates, scoring, card usage)
- **Feature flags** — 15 toggleable flags in dev panel
- **Dev panel shortcuts** — Give specific cards, max momentum/heat, force scores, jump to screens
- **Testing guide** — docs/TESTING-GUIDE.md
- **Privacy policy + Terms** — public/privacy.html, public/terms.html
- **PWA assets** — Full manifest, OG meta tags, maskable icons, offline service worker

### Bug Fixes (Since Prod)
- Play card text no longer truncates with ... (pushed to prod as hotfix)
- doSettle double-fire race condition
- ST result / kickoff result double-fire
- offCard/defCard variable shadowing DOM elements
- IRON MAN/TIMEOUT refunded when conditions not met
- Save/resume actually restores engine state
- Swap cancel no longer freezes game
- Stale index when auto-consuming ICE THE KICKER + BLOCKED KICK together
- Personnel report reveal blocks SNAP button during display
- Auto-consumed ST cards now show toast notification
- Commentary CATCH_VERBS grammar fix
- Cooldown system TD keys were randomized (now stable)
- 481 lines dead code removed from gameplay.js

---

## Field Animation Project (Isolated)

**Location:** `src/ui/field/` (4 files only)
**Test:** `http://localhost:5174/src/ui/field/test.html`
**Status:** Phase 1+2 complete + 5 visual quality fixes applied (from 10-agent research audit). NOT merged into gameplay.

### What's Built
- Premium static field renderer (dark glass floor aesthetic, A+ quality)
- 6 formations with team-weighted pools
- 13 pass concepts + 6 run concepts
- Animation engine (camera follow, particles, shake, ball flight, speed trails)

### Phase 1 Complete
- Ball renders as spinning football with shadow + incomplete tumble
- Animation timing scales by route depth
- Sack QB scramble, INT defender return, TD particles at end zone
- Team-aware particle colors, counts scale by yards
- Test harness: yard slider, custom yards, defense scheme, replay, event log
- Camera bounds clamped (no empty space on reverse plays)
- Dot interpolation easeInOutCubic (smooth route breaks)
- DEF_FORMATION_MAP fixed (was mapping coverage to wrong formations)
- Boars formation pools fixed (removed Bunch, more I-Form)

### Phase 2 Complete (Polish)
- Yard lines/numbers 2x brighter for mobile readability
- Team-colored endzones (offense/defense brand colors)
- Formation name label, down & distance zone shading (gold tint)
- Cinematic vignette (edge darkening for broadcast feel)
- Enhanced mowing stripes (5-yard intervals, soft edges)
- Improved jersey number contrast (dark backing + thicker stroke)
- Pre-snap dot idle breathing animation
- Multi-layer impact flash bloom (3 layers)
- Velocity-based dot glow, dynamic speed trails
- Ground dust particles on tackles/sacks
- OL/DL contact flare indicators
- Incomplete passes: ball overshoots + drops, receiver reaches
- Test harness: PLAY ALL auto-cycle + RANDOM play buttons

### Phase 3 (Future)
- Commentary sync, camera zoom close-ups, ball rotation refinement
- Wire into gameplay.js (replace DOM field strip)

### API Contract
```
render(state) — ballYard, losYard, firstDownYard, formation, offTeam, defTeam
playSequence(type, yards, state) — type + playType + defScheme
scrollTo(from, to, duration) — camera pan
```
Conversion: `ballYard = gs.ballPosition * 1.1 + 5`

### Rules
- NEVER touch gameplay.js or any file outside src/ui/field/
- Commits prefixed `feat(field):` or `fix(field):`
- Game tests must still pass after field changes

---

## Known Issues & Balance

- Easy difficulty win rate 88-98% (target 65-80%, slightly high)
- Medium tie rate 14-26% (target <10%, structural — low scoring per half)
- Sentinels underperform on Medium/Hard
- Serpents slightly OP on Easy (98%)
- Big play rate still elevated on Easy
- gameplay.js is 4200+ lines (tech debt, refactor candidate)
- Bundle size 650KB (Vite warns >500KB)

---

## Revenue / Launch Strategy (Research Complete)

- **Positioning:** "Balatro meets college football" — zero competition in this niche
- **Monetization plan:** $4.99 premium + cosmetic IAP + $6.99/quarter season pass
- **App Store title:** "TORCH Football - Card Game"
- **Subtitle:** "Balatro meets college ball"
- **Launch plan:** 4-week pre-launch (Reddit/TikTok/YouTube), day-by-day launch week
- **Target subreddits:** r/balatro, r/IndieGaming, r/CFB, r/CardGames
- **Competitive positioning:** vs Retro Bowl (deeper strategy), vs Balatro (sport-specific), vs Marvel Snap (no ladder anxiety)
- **12-month content roadmap:** M4 two new teams, M5 Quick Fire mode, M6 cosmetics, M10 battle pass
- **Dynasty mode design doc:** Multi-season, player development, recruiting, prestige system
- **Multiplayer design:** Challenge Links (zero backend, encrypted play sequences)
- **Brand/IP strategy:** File trademark, design logo mark, franchise potential (TORCH Baseball Year 2)

---

## Git State

**Production (main):** v0.28.0 + play card text hotfix
**Dev branch:** 43 commits ahead. All changes committed.
**Commit convention:** `feat:`, `fix:`, `test:`, `balance:`, `ui:`, `feat(field):`

### Key Commits (newest first)
```
fff63a5 feat(field): Phase 1 animation improvements (isolated)
cbca711 feat: dev panel shortcuts, feature flags, testing guide
... (18 more commits covering all dev work)
538b9dd fix: play card text no longer truncates with ellipsis (IN PROD)
```

---

## How To Pick Up From Here

**To continue dev work:**
```bash
cd /Users/brock/torch-football
git checkout dev
npx vite --host          # Game at :5173, field test at :5174
# Add ?dev to URL for dev panel
```

**To test field animation:**
```bash
# Open http://localhost:5174/src/ui/field/test.html
# Use yard slider, play buttons, formation picker
```

**To verify nothing is broken:**
```bash
npx vite build
node --input-type=module -e "import { runSmokeTest } from './src/tests/smokeTest.js'; runSmokeTest();"
node --input-type=module -e "import { runGameSim } from './src/tests/gameSimTest.js'; runGameSim(60);"
```

**To push to preview:** `git push origin dev` (Vercel auto-deploys)
**To push to prod:** Merge dev→main, push main. Run /smoke after.

---

## Playtesting Status (as of 2026-03-29)

### Completed
- ✅ Core gameplay loop (snap → result → points → next play)
- ✅ Card dealing and selection (play + player + torch)
- ✅ Tutorial onboarding flow (3-step glow + field slot flash)
- ✅ Mobile touch interactions (tap-to-select, tap-to-deselect)
- ✅ Kickoff with team branding
- ✅ Scouting report layout and content
- ✅ Torch points color-coded breakdown in play-by-play

### Remaining (Priority Order)
1. ⬜ All 25 torch cards individually (use dev panel shortcuts)
2. ⬜ Reactive card prompts (SURE HANDS / CHALLENGE FLAG USE IT / SAVE IT)
3. ⬜ Season flow (3 games → recap → championship)
4. ⬜ Halftime strategic decision (aggressive/balanced/conservative)
5. ⬜ Daily Drive (seeded matchup, share grid)
6. ⬜ Momentum pips + heat badges + card combos
7. ⬜ Settings screen + game speed toggle
8. ⬜ Save/resume (refresh mid-game)
9. ⬜ Stats sheet (tap scorebug)
10. ⬜ Film Room highlights + game grade
11. ⬜ All celebrations (sack, turnover, red zone, 2-min drill, end-of-half)
12. ⬜ First-TD explainer + first-shop tooltip + discard discovery

### Bugs Fixed During Playtesting Batches 1-4 (16 total)
- Mobile snap button blocked by torch card row overflow
- Crowd audio loop gap (html5 mode → Web Audio)
- Torch card deselection (2 fixes — added TAP TO REMOVE bar)
- Plural team verb grammar (CHOOSES→CHOOSE, ELECTS→ELECT, etc.)
- "NO TORCH CARD" → "TORCH" label brevity
- "P1" scoreboard label removed (unclear)
- Audible button removed entirely (tap-to-deselect replaces it)
- Tutorial overlay blocking mobile (reverted to inline tooltips)
- Scouting report: removed duplicate matchup text, added team colors, moved to bottom
- Cards dealing before kickoff (hidden until after kickoff result)
- Auto-advance removed (player must tap for next play)
- Torch points visibility (now color-coded in play-by-play narr area)
- TAP FOR NEXT PLAY line wrapping (added white-space:nowrap)
- Auto-skip torch phase when no playable cards
- Kickoff result missing team name/badge/color
- Tutorial PLAYER field slot not flashing (added blue pulse)

---

## Strategic Priority Stack

*Validated by Claude UI analysis (2026-03-28)*

1. **Onboarding (highest leverage)** — Playtests proved players stay despite card confusion. Full onboarding spec v3.0 exists in Claude UI project (action-gated dismiss chains, 6 phases, tutorial reward, replayable HOW TO PLAY). Current dev has 3-step glow tutorial as foundation. Full spec NOT yet implemented.

2. **Ship dev branch** — 42 commits of unreleased work creates merge risk the longer it sits. 810 tests + 1000-game sim give engine confidence. Need human playtest to validate UX before push.

3. **Field animation integration** — 3 Phase 1 items remaining, then wire into gameplay.js. Biggest visual upgrade available. Isolated project, no rush.

4. **Engine gaps (Phase B)** — AI player selection using traits/stars (B7), ST ratings affecting distributions (B8), PLAY_ACTION missing from relevance table. Outstanding from original Phase B spec.

5. **Marketing: May 1 TikTok launch** — Play Call Challenge format designed. Window: May–July (EA CFB activity peak). Funnel: TikTok → Discord → Beta → Download. ~5 weeks to ship.

### Timeline (if executing now)
- Week 1: Playtest dev build, collect feedback
- Week 2: Fix issues from playtest, implement onboarding spec v3.0
- Week 3: Push to preview, broader testing
- Week 4: Push to prod, final QA, version bump
- Week 5 (May 1): Marketing launch

### Deploy Checklist (When Ready)
- [ ] Bump version in state.js + package.json (v0.29.0 or v0.30.0)
- [ ] Update DEV_LOG in home.js
- [ ] Update CLAUDE.md: move "Not Yet Built" items that are now built
- [ ] Commit, tag, push dev
- [ ] Merge dev→main, push main
- [ ] Run /smoke
- [ ] Create GitHub Release
- [ ] Return to dev branch

### Sync Issue to Fix at Deploy
CLAUDE.md "Not Yet Built" section lists things the dev branch has already built:
- Option D snap reveal sequence ← BUILT
- Wire Canvas field renderer ← BUILT (partially, animation polish separate)
- Card activation animations ← BUILT
- Daily Drive shareable grid ← BUILT
- Stats bottom sheet ← BUILT
These must move to their proper sections when dev ships to prod.
