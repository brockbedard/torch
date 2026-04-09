# TORCH Football — Project Status

**Last Updated:** 2026-04-09
**Updated By:** Claude

---

## Quick Context (Read This First)

TORCH Football is a mobile card game (Balatro meets college football). 4 fictional college teams, card-based play selection, TORCH points economy (score = wallet). Built with Vite + vanilla JS + GSAP + Howler.js. Solo dev (Brock), 17 days in development.

**Production (main):** v0.36.0 — Kickoff Ritual shipped.
**Preview (dev remote):** v0.36.0
**Local Dev (dev branch):** Synced with main.
**Field Animation (src/ui/field/):** Isolated project, iterating independently. NOT merged into game.

---

## What's In Production (v0.36.0)

### v0.36.0 "Kickoff Ritual"
- **3-Beat Pregame Runway**: Replaces the old static matchup card + inline gameplay coin toss with a cinematic 3-beat sequence. Beat 1 slams full-width team cards from top and bottom with a gold VS burn and conditions strip (weather + field surface icons). Beat 2 is a tap-to-flip 3D coin with real team badges on each face, winner's interactive choice between RECEIVE KICKOFF and TAKE A TORCH CARD, and a 3 face-down card pick that flips open to a tier-styled reveal (bronze/silver/gold). Beat 3 stamps KICKOFF with a stadium flash and bass drop. Full implementation in `src/ui/screens/pregame.js` (~720 lines). Uses real `GS.team` / `GS.opponent` / `TORCH_CARDS` data, SND audio (`coinFlip`, `coinCatch`, `cardDeal`, `flipDramatic`, `bassDrop`), and GSAP timelines throughout.
- **Routing Refactor**: Game flow is now `team select → roster (Meet The Squads) → pregame runway → gameplay`. Previously roster came AFTER the static pregame card; now it precedes the runway so the player sees rosters before the ritual. `gameplay.js` coin toss gate split: `_coinTossDone` + new `_openingKickoffResolved` flag let the runway own the coin toss while gameplay still resolves the opening kickoff via a new `_enterPlayAfterOpeningKickoff()` helper. Legacy inline coin toss preserved as a fallback for dev quick play.
- **4-Layer Flame SVG Overhaul**: Replaced the old single-path wiggly flame (44×56 viewBox) with a new 4-layer flame (34×34 viewBox) featuring built-in color depth: outer red (#EF3820), dark red shadow (#D8190B), inner gold (#F8AB1F), and hot orange core (#FE5436). Centralized in new `src/utils/flameIcon.js` helper (`flameIconSVG`, `flameSilhouetteSVG`, `flameLayersMarkup`, `FLAME_SILHOUETTE_PATH`, `FLAME_LAYER_1-4`). Swept across 13 files: `brand.js` (header + button badge), `cards.js` (torch card emblem + corner pips + hot flame), `cardTray.js` (discard banner + burn button + SNAP badge), `shop.js` (4 header/cost/cover flames), `gameplay.js` (10 inline flames: torch banner, torch tab, choice icons, 3× gold points rows, tutorial, conversion pts, result overlay), `home.js` (hero title flame), `pregame.js` (TORCH CARD choice icon), `halftime.js` (3 shop flames), `endGame.js` (points row), `teamSelect.js` (footer brand mark), `fieldRenderer.js` (midfield decoration canvas Path2D).
- **9-Layer Leather Football Overhaul**: Replaced the old gradient football (D4893B → B5652B → 8B4A1F gradient + cream laces) with a new 9-layer leather football featuring tip panels (#1a1208 / #140e06), saddle brown body (#8B4513), dark brown shadow depth (#6B3410), and warm cream stitching (#E8DCC8). Centralized in new `src/utils/footballIcon.js` helper. Swept the field renderer (midfield decoration) and the TORCH title "O" in the home wordmark.
- **Meet The Squads Polish**: Tighter team identity strip (school tag + team name + OFF/DEF scheme tags + team motto), symmetric OFFENSE/DEFENSE section headers with average star rating pips, flame pips now align vertically across all 14 player rows (previously drifted due to variable trait-column widths), tightened row padding so all 14 players fit on a standard phone viewport without scrolling.
- **Bug Fixes**: Auto-fullscreen removed (Chrome's fullscreen toast was shifting viewport and pushing KICK OFF button off screen + creating dead space on coin toss). Team card scale-on-select removed (tapping a team no longer causes it to grow/push neighbors). Pregame runway click events wired via direct `.style.pointerEvents = 'auto'` instead of `gsap.set({ pointerEvents })` which was silently dropping the property and making the 3 face-down torch cards unclickable. Coin hover animation keyframe fixed to include `translate(-50%)` so the coin stays centered horizontally during the breathing loop. Phase-exclusive visibility rules in Beat 2 so midfield label / captains / coin / result stamp / choice cards / face-downs / reveal cards each own their own on-screen window. Coin positioned to avoid overlapping midfield label during the spin's peak height and result stamp at rest. Team names (SPECTRES/DOLPHINS/SERPENTS) sized at 38px Teko with 1px letter spacing so 8-character names fit full-width horizontal cards without clipping. Crowd dot horizon silhouette removed (too noisy). Captains removed from coin toss (redundant with team logos on coin faces).
- **Home Page Mockups**: Four home-screen archetypes in `public/mockups/home-page-mockup.html` informed by Gemini deep research (Hero Focal, Stadium Tunnel, Broadcast Dashboard, Focal Hybrid ★) plus a First Launch variant for Focal Hybrid showing progressive disclosure for new players. Design direction saved but not wired into the real home screen.
- **Runway Mockup**: Standalone `public/mockups/runway-mockup.html` with interactive 3-beat controls (jump to beat, user/AI winner toggle, choice toggle) used to iterate on the runway design before porting to real code.

### v0.35.0 "Moments of Joy"
- **Synergy Chain Combo Pops**: MATCHUP, TEMPO, HOT READ, CARD COMBO badges pop in sequence on Beat 3 with pitch-shifted 12-TET audio cues (ascending semitone steps per badge).
- **Glow Tell**: Shop cards are face-down by default; tap once to trigger a gold glow pulse, tap again to shimmer-reveal. Prevents impulsive buys on reactive cards.
- **Walkout TD Card**: After a touchdown, the featured player's card flies in from below at 2.5s post-snap (after text/cascade reads). Pure CSS transitions, speed-multiplier-independent.
- **Shame Card**: On INT or fumble, the featured player's card desaturates and receives a rotated verdict stamp (PICKED / FUMBLED). Visceral accountability.
- **Hitstop 2.0 — Sack**: Sacks trigger rotational screen shake (T-rot-shake), bass drop audio, and heavy-impact haptic (`Haptic.bigHit`). Screen briefly freezes before result.
- **Pressure Heartbeat**: On 4th down / red zone / late-game pressure snaps, the SNAP button pulses with a double-thump heartbeat animation and audio. `isPressureSnap()` detection.
- **Player Momentum Boosts**: Big plays spike/crash momentum in real time — TD +2, INT +3, fumble lost +3, sack +2. HOT badge appears at level 4+. `spikeMomentum()` / `crashMomentum()` wired in gameState.js.
- **Big Play Interface**: game-icons.net SVG paths (CC BY 3.0) used for all event badges — onFire (TD), pickSix (INT), truckStick (fumble), ironWall (sack), dominance (momentum). Replaces text labels.
- **Game Speed Locked**: Speed multiplier locked to 1.0. Settings speed section removed. `localStorage.removeItem('torch_speed')` clears stale values.
- **Stakeholder Demo**: `joy-demo.html` — standalone interactive HTML page demonstrating all 8 features. No server required.

### v0.34.0 "Football Integrity"
- **Core Logic Audit & Fixes**: Fixed "multiple TD" bug via explicit state reset after scoring. Implemented Safeties (2pts + free kick from 20). Added Overtime support (simplified matching possessions). Updated `kneel()` to correctly cost a down. Fixed kickoff return TDs to award 7 points (auto-XP) for consistency.
- **TORCH Points Integrity**: Fixed bug where offense gained points on turnovers; defense is now correctly credited.
- **Animation Synchronization**: Scoreboard and TORCH Banner updates are now deferred until the post-play result overlay is fully dismissed, ensuring all animations are visible. Implemented a "fly up" animation for TORCH points from the result screen to the banner.
- **UI Refinements**:
  - **Opponent TD Overlay**: Redesigned for more dramatic impact (red flash, screen shake, larger text).
  - **Gameplay Spacing**: Increased vertical "breathing room" between all major gameplay elements (scoreboard, banner, field, card tray) based on the 8px design system.
  - **Pregame Screen**: Reworked for better composition and readability. Increased spacing between team cards, improved contrast and font sizes on bottom info bar.
  - **Coin Toss Screen**: Removed "COIN TOSS" label, redesigned choice buttons to be text-only, and adjusted layout to ensure all text fits on one line.
  - **Scoreboard Polish**: Reduced down/distance font size for better balance. Updated OT labels to "OVERTIME", "2ND OVERTIME", etc.

### Previously Unreleased
- **New Systems (7 engine modules)**: Momentum Chains, Card Combos, Achievements, Rival Streaks, Game History, Career Stats, Haptic Feedback.
- **New Screens (3)**: Season Recap, Settings, Stats Sheet.
- **Major Features**: Conference Season Mode, Daily Drive, Halftime Strategic Decision, 25 Torch Cards (all wired), Reactive Card Prompts, Audible Mechanic, Game Speed Settings, Mid-Game Save/Resume, Team-Specific AI.
- **Game Feel**: Option D Snap Reveal, Drive Heat Bar, Scoring Cascade, Turnover Drama, Clutch Drive Detection, Sack Brutality, Red Zone Intensity, First Down Celebration, End-of-Half Drama, Possession Change Swoosh, Team-Specific TD Celebrations, Victory/Defeat Fanfare, Newspaper Headlines.
- **Commentary Overhaul**: Dynamic narrative, player-trait matchup lines, 30+ new templates.
- **UI Polish**: Canvas field renderer, animated down/distance, ESPN ticker, smart card highlighting, heat/fatigue badges, momentum pips, screen crossfades.
- **Onboarding**: 3-step visual tutorial, situational hints, post-TD economy explainer.
- **Balance**: Higher scoring, tighter variance, rebalanced card prices, AI card buying logic.
- **Testing & Dev Tools**: 810+ smoke tests, 1000-game sim, feature flags, dev panel.

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
