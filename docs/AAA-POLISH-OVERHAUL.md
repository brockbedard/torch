# aaa-polish-overhaul — Branch Summary

**Branch:** `aaa-polish-overhaul`
**Base commit:** `c265e01` — v0.37.0 "Fresh Paint"
**Status:** Work in progress. Not merged to dev/main.
**Purpose:** Exploratory AAA-feel upgrade pass. Adds WebGL rendering, new engine manager architecture, persistent AI memory, progressive disclosure, stadium upgrades, and a VS cutscene transition. No version bump — this work precedes the next minor release.

---

## What Changed

### Engine Architecture — `gameState.js`

The flat `GameState` class was refactored into 5 manager classes:

| Manager | Responsibility |
|---|---|
| `ClockManager` | Half, play count, two-minute drill, game-over flag |
| `ScoreManager` | CT/IR score |
| `FieldManager` | Ball position, down, distance, possession, red zone |
| `StatManager` | Game-wide stat accumulation |
| `EconomyManager` | TORCH points, AI starting cards |

All existing property names (`ctScore`, `possession`, `ballPosition`, etc.) still work through `Object.defineProperty` compatibility getters — no UI code needed updating. AI starting card logic and TORCH economy moved out of the constructor into `EconomyManager`.

Also added: `engineBridge.js` + `engine.worker.js` Web Worker wiring so the simulation engine can run off the main thread.

---

### New Engine Modules

**`impactLoop.js`**
Centralized coordinator for sensory feedback. Ties together audio duck, haptics, screen shake, and hitstop freeze into a single `triggerImpact(tier, opts)` call, synchronized at the millisecond level. Three tiers: routine (33ms hitstop), important (67ms), game-changing (133ms).

**`leagueSimulator.js`**
Simulates a game between the two teams not playing the human each week. Results feed the news ticker and update a persistent `torch_league_standings` record in localStorage. Standings are updated at game end (end screen) with actual human game results.

**`progressionSystem.js`**
XP system for players. Tracks XP per player in localStorage. `decoratePlayer(p)` adds `{ xp, level }` to any player object. `processGameXP(snapLog)` awards XP after a game. The season recap shows level + XP progress bars for the top 4 players.

**`coachProgression.js`**
Separate coach-level XP tree. 4 unlockable skills: Clock Manager (-2s clock run-off), Aggressive Caller (+5% pass yards), Iron Curtain (+5% sack rate), Talent Scout (+10% Silver/Gold card draw). Skills cost 1-2 skill points. Coach levels every 500 XP.

**`rivalrySystem.js`**
Persistent opponent memory. After each game, records your offensive tendencies (run/pass ratio) per opponent in localStorage. The AI opponent reads these on Hard difficulty to counter your long-term habits across sessions.

**`ghostManager.js`**
Coach profile export stub. `exportCoachProfile(teamId)` serializes your coach data and tendencies into a shareable string. Import side not yet implemented — disabled in settings UI.

**`telemetry.js`**
Lightweight event logger. `logGameComplete(gameRecord)` writes to `torch_telemetry` in localStorage. Useful for debugging and future analytics.

**`accessibility.js`**
Sonar system for visually impaired players. Pitch-based audio cue (A3 → A5) that rises as you approach the end zone. Short beep on red zone entry. Disabled by default, toggle via `torch_a11y_sonar` in localStorage.

**`managers/SpecialTeamsManager.js`**
Static class holding kickoff, punt, and field goal resolution. Previously static methods on `GameState`. Return value changed from raw yard number to `{ returnYard, touchdown, label }` object.

---

### New UI Modules

**`MatchupCutscene.js`**
Full-screen VS cutscene between pregame and gameplay. Team badges slam in from both sides, VS burns in the center. Auto-advances after ~2s. Tap anywhere to skip. 6s absolute safety timeout.

**`NewsTicker.js`**
Scrolling news ticker at the top of the gameplay screen. Driven by `leagueSimulator.js` results — shows headlines from the other teams' game this week.

**`MatchupWidget.js`**
Replaces the card fan on the home screen when the player is mid-season. Shows your team badge vs. the next opponent badge with the game number.

**`LeagueStandings.js`**
League standings table component. All 4 teams, W/L/T, points for/against.

**`playerDetail.js`**
Player detail modal. Shows expanded player stats, XP progress, and trait info.

**`webglRenderer.js`**
Three.js WebGL field renderer (replaces Canvas 2D). Shader-driven turf with 5-yard stripes, turfwear, vignette, and time-of-day lighting. Orthographic camera follows the ball.

**`webglAnimator.js`**
Wraps the WebGL renderer with GSAP camera animations. On Tier 3 plays (TD/INT/fumble), `runCinematicReplay()` triggers slow-motion (`gsap.globalTimeline.timeScale(0.4)`) and camera movement before returning to normal. `animatePlay()` is async and awaited in `run3BeatSnap`.

---

### New Screens

**`stadiumManagement.js`**
Stadium upgrade shop. Upgrades cost TORCH points and provide permanent bonuses. Accessible from the home screen STADIUM button.

**`commandCenter.js`**
Hub screen. Purpose TBD — wired into routing but UI not finalized.

**`leagueNews.js`**
League news screen. Shows generated headlines from the league simulator.

**`coachProfile.js`**
Coach profile/stats screen. Shows XP, level, unlocked skills, rivalry records.

---

### Modified Screens & Components

**`home.js`**
- Card fan replaced by `MatchupWidget` when mid-season
- PLAY button becomes CONTINUE (goes straight to pregame, skips team select)
- STADIUM button added below PLAY
- `active-scale` press feedback on PLAY button

**`pregame.js`**
- `finishRunway()` now inserts `MatchupCutscene` before transitioning to gameplay

**`gameplay.js`**
- Field renderer swapped: `fieldAnimator.js` (Canvas 2D) → `webglAnimator.js` (Three.js)
- `run3BeatSnap` made `async` — awaits cinematic replay on Tier 3 plays
- News ticker appended at top of screen
- Progressive disclosure re-enabled: Torch Cards hidden game 1, Heat/Momentum hidden games 1-2
- Tutorial overlays restored: Torch Card intro (game 2), Heat/Momentum intro (game 3)
- Onboarding bubbles moved from `document.body` to `el` (contained within screen)
- Sonar accessibility wired into `drawField()`
- `showKickoffResult` hardened: 5s auto-advance, 8s emergency fallback, error recovery
- Kickoff now uses `SpecialTeamsManager.resolveKickoff()` with rich return value
- `saveGameState()` called at kickoff so reloads land correctly
- Event bus subscription for targeted UI redraws
- **Bug (found/fixed during dev):** `leagueTicker.appendChild` was called before `const el` was initialized — TDZ crash

**`endGame.js`**
- Share button added next to PLAY/CONTINUE (Web Share API on mobile, clipboard fallback)
- Records game to telemetry, rivalry system, and updates league standings
- `gamesPlayed` counter incremented on next-game transition

**`seasonRecap.js`**
- "ROSTER EVOLUTION" section added: top 4 players with XP bars and level badges
- `overflow:hidden` → `overflow-y:auto` to accommodate longer page

**`settings.js`**
- "COACH IDENTITY" section: Export Coach Profile button + disabled Import Ghost placeholder

**`cardTray.js`**
- `active-scale` press feedback on SNAP and DISCARD buttons
- Torch cards row gated behind `showTorchCards` flag (hidden game 1)
- Heat/momentum indicators gated behind `showHeatMomentum` flag (hidden games 1-2)

**`dailyDrive.js`**
- `_openingKickoffResolved: false` added to quick-play state

---

### Core Systems

**`state.js`**
- Added lightweight pub/sub event bus (`subscribe`, `emit`) for targeted redraws
- `setGs()` accepts optional `eventType` — emits instead of full re-render when provided
- Save data now encoded with base64 + salted checksum (tamper-resistant). Old plain JSON saves still load.
- Save now includes `_coinTossDone` and `_openingKickoffResolved` flags
- `gamesPlayed` counter added to initial state

**`aiOpponent.js`**
- Hard AI now reads `humanTendencies` (in-game run/pass ratio) and adjusts weights mid-game
- Hard AI also reads `rivalrySystem` for cross-game memory

**`audioManager.js`**
- `duck(ratio, durationMs)` method added for impact SFX audio ducking

**`commentary.js`**
- Trait matchup flavor injection: surfaces "BURNER overpowers SHUTDOWN!" on large matchup mods
- Team motto drops on TDs and 20+ yard plays
- Signature changed from team name strings → team objects for richer data access

**`personnelSystem.js`**
- `directMatchup()` returns `{ total, starMod, traitMod }` object instead of plain number
- `calculatePersonnelMod()` exposes `details.traitMatchupMod` for commentary use

**`style.css`**
- `--glass` opacity reduced (0.1 → 0.06), `--glass-border` and `--glass-reflection` variables added
- `.glass-panel` utility class with backdrop-blur, border, and reflection pseudo-elements
- `.matchup-widget` and shimmer animation
- `.active-scale` press feedback utility class
- `.drop-zone-indicator` / `.drop-zone-active` for drag-and-drop prep

**`sw.js`**
- Complete rewrite. Cache version bumped to `torch-v0.37.0`.
- Cache-first strategy for static assets (audio, fonts, JS/CSS, images)
- Stale-while-revalidate for app shell
- Skips waiting on install, claims clients on activate

**`package.json`**
- `three@^0.183.2` added for WebGL renderer

---

### New Data

**`data/stadiumUpgrades.js`**
Stadium upgrade definitions: Heated Turf (500 pts), Jumbotron Pro (800 pts), and others.

**`data/playerSubs.js`**
Substitution data. Not yet wired into gameplay UI.

---

### Design/Docs

**`docs/TORCH-EMBER-EIGHT.md`**
World-building bible for the Ember Eight conference — lore, team identities, coaching ghost system, founding narrative.

**`docs/TORCH-V2-BUILD-PLAN.md`**
v2 prototype build plan. 7-game season mode, sub-attributes, stamp economy, 2-3 week ship target.

**`public/mockups/`**
Design exploration HTML files: team helmets, icon comparisons.

**`public/*.html`**
Gallery/comparison pages from the visual identity exploration: `vibe-gallery`, `flat-cyber-gallery`, `real-preview`, `design-comparison`, `comprehensive-assets`, `master-flat-gallery`.

---

## Known Issues (at time of commit)

1. **`leagueSimulator.js`** — Score formula uses 1-5 star ratings as if they were 55-99 OVR values. All simulated games produce 0-0. Non-crashing but produces bad data.
2. **`EconomyManager` / `hasUpgrade` / `processGameXP`** — Imported by `gameplay.js` but not yet called. Dead imports.
3. **`engineBridge.js`** — Web Worker wired into `gameState.js` imports but the bridge doesn't do anything meaningful yet.
4. **`commandCenter.js`** — Screen is routed but UI not finalized.
5. **`playerSubs.js`** — Data file exists but substitution system not wired into gameplay.
6. **Ghost import** — Coach profile export works; import side not implemented.
