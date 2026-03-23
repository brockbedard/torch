# TORCH v0.21 — Build Instructions for Claude Code (FINAL)

## READ FIRST (in this order)
1. `CLAUDE.md` — architecture and rules
2. `docs/TORCH-V021-SPEC.md` — the complete spec (already includes hand management, seasons, TORCH cards, defensive renames, progressive disclosure)
3. `docs/torch-v021-amendment-2.md` — NEW additions: formation reveal, snap rhythm, fighting-game animation, difficulty rebalance, game day conditions, daily drive, play sequence combos, branding, film room
4. `docs/torch-v021-acceptance-checklist.md` — testing checklist
5. THIS FILE — phase-gated build instructions

**Amendment 2 takes precedence over the base spec where they conflict.**

## CRITICAL: Phase Gate Workflow

**DO NOT build the entire spec at once.** Build ONE phase at a time, then STOP and wait for Brock to test and approve before moving to the next phase.

After completing each phase:
1. Git commit with a descriptive message (e.g., "v0.21 Phase 1: data layer — 4 teams, 48 players, 80 plays")
2. Confirm the build is running locally (`npx vite --host`)
3. List exactly what was created/modified/deleted
4. Print a summary of what to test (reference the acceptance checklist)
5. Say: **"Phase [N] complete. Please test against the acceptance checklist before I proceed to Phase [N+1]."**
6. **STOP. DO NOT proceed until Brock explicitly says "approved" or "move to Phase [N+1]."**

If Brock reports failures, fix them BEFORE moving on. Do not carry bugs forward.

---

## Build Order (10 Phases)

### Phase 1: Data Layer
**Goal:** All new team, player, play, and condition data exists. No UI changes yet.

- Create `src/data/teams.js` (4 teams with colors, helmets, ratings, schemes)
- Create/update `src/data/players.js` (48 players across 4 teams, with isStar, starTitle, num fields)
- Create `src/data/sentinelsPlays.js`, `wolvesPlays.js`, `stagsPlays.js`, `serpentsPlays.js` (10 OFF + 10 DEF each, with engine stats + flavor text + `formation` field on defensive plays per Amendment 2 Section 6)
- Create `src/data/badgeIcons.js` (game-icons.net SVG path strings for all 12 badges)
- Create `src/data/teamLogos.js` (placeholder SVG paths for 4 team logos)
- Create `src/data/uiIcons.js` (Tabler Icons SVG paths)
- Create `src/data/torchCards.js` (8 v1 TORCH cards with costs, types, effects, tier)
- Create `src/data/gameConditions.js` (weather/field/crowd definitions + effects per Amendment 2 Section 10)
- Create `src/data/playSequenceCombos.js` (combo definitions per Amendment 2 Section 14: Setup, Drive Momentum, Caught Sleeping, Hot Read, Predictable)
- Update `src/state.js` (new flow states, season state, isFirstSeason flag, gameConditions slot, torchCard inventory)
- Remove ALL Canyon Tech / Iron Ridge references from data files
- **DO NOT touch any UI files yet**
- Git commit → Stop → Wait for approval

### Phase 2: Card Component Updates
**Goal:** Player cards show badge instead of OVR, tier borders work, team helmets render.

- Update `buildMaddenPlayer()` in `src/ui/components/cards.js` — badge icon as hero element, tier border logic
- Add `teamHelmetSvg(teamId, size)` function with team-colored helmets + facemask + stripe
- Add star player gold treatment (gold border, star icon)
- Add flame pip rating component (custom SVG, not Unicode stars)
- Update `buildTorchCard()` if needed for the 8 v1 cards
- Test: open `?mockup` page to verify card rendering
- Git commit → Stop → Wait for approval

### Phase 3: Team Select Screen + Fighting-Game Animation
**Goal:** New team select with 2x2 grid AND the full fighting-game selection sequence from Amendment 2 Section 8.

- Create `src/ui/screens/teamSelect.js` (2x2 grid, difficulty row, LOCK IN)
- Wire into `src/main.js` router (KICK OFF → teamSelect)
- Implement selection behavior (tap → green border, others dim, difficulty selection)
- Implement first-time player logic (hide difficulty on first game, show tooltip)
- **Implement fighting-game confirmation animation (Amendment 2 Section 8):**
  - Phase 1: Color flash → team helmet scales to center → player cards fan out → team audio sting
  - Phase 2: Diagonal screen split → your helmet VS opponent helmet → "VS" slam
  - Phase 3: Diagonal wipe → field reveal → cards deal → gameplay begins
- Generate 4 team-specific audio stings in `src/engine/sound.js` using jsfxr
- **This REPLACES the separate coin toss screen.** Coin toss resolves in the engine during the VS animation.
- Deprecate/remove: `setup.js`, `draft.js`, `cardDraft.js`, `draftProgress.js`, `coinToss.js`
- Git commit → Stop → Wait for approval

### Phase 4: Core Gameplay Integration
**Goal:** Gameplay works with new team data, Option D hand management, and formation reveal.

- **Hand Management (Option D):** Update card tray to show 5 cards (not 4). Implement cycling: play 1 → goes to bottom of deck → draw 1 from top. Always 5 in hand.
- **Team Data Integration:** Gameplay loads correct roster and playbook based on selected team. AI loads correct opponent team data. Badge combos work with new badge assignments.
- **Formation Reveal (Amendment 2 Section 6):** Before player selects play card, show AI's defensive formation ("NICKEL", "BLITZ LOOK", etc.) based on the `formation` field on defensive plays. Hidden on first game; appears game 2+ with tooltip.
- **Counter-play matrix:** Apply matchup modifiers based on which teams are playing.
- **Hard Difficulty Rebalance (Amendment 2 Section 9):** 50% optimal + 25% situational + 25% random. OVR +2. Combo rate 80%. Formation reveal honest 75% (may disguise 25%).
- Git commit → Stop → Wait for approval

### Phase 5: Snap Result — 3-Beat Rhythm
**Goal:** Every snap resolves with the anticipation → impact → aftermath sequence from Amendment 2 Section 7.

- **Beat 1 (Anticipation):** Cards animate toward center, background dims, sound builds, 150ms pause at peak
- **Beat 2 (Impact):** Hitstop freeze (150ms both cards visible), screen shake, color flash (green/red/gold), 150ms silence, then result sound
- **Beat 3 (Aftermath):** Yardage counter with ascending audio pitch (Balatro-style), commentary text line by line, ball moves, down/distance updates
- **Scale to stakes:** Routine play = 2 sec total. First down = 3 sec. Explosive = 3.5 sec. Sack/turnover = 3.5 sec. TD = 4+ sec. 4th quarter go-ahead TD = 5 sec.
- Decorative animation must be non-blocking — player can start selecting next card while aftermath plays
- Git commit → Stop → Wait for approval

### Phase 6: TORCH Card System
**Goal:** Full TORCH card economy — 8 cards, shop at trigger moments, 3 slots, score-as-wallet.

- 8 v1 cards implemented: Scout Team, Sure Hands, Hard Count, Hot Route, Flag on the Play, Onside Kick, 12th Man, Ice
- Shop triggers: TD, forced turnover, 4th down stop, star activation, halftime, between-game
- Shop UI: bottom sheet, shows 1 card (3 at halftime/between-game), tier-weighted by trigger
- Buy/Pass interaction: tap BUY (points deducted, card added) or PASS (shop closes)
- 3-slot inventory with swap mechanic when full
- Pre-snap cards: attached before SNAP (one per snap max)
- Reactive cards: played AFTER seeing result (one per snap max, opponent sees you have one)
- Post-TD card: Onside Kick triggers during scoring sequence
- Hot Route integration with Option D hand management (reshuffle all 10, deal 5 fresh)
- AI TORCH card behavior by difficulty (Easy: never, Medium: buys Bronze 50%, Hard: buys best always)
- Git commit → Stop → Wait for approval

### Phase 7: Season Cycle + Star Heat Check
**Goal:** 3-game seasons with persistence, between-game shop, and star player activation.

- **Season Cycle:** 3 games against 3 opponents in order (neutral → favorable → tough). Win tracking, season score (sum of all 3 game scores after spending). +100 per win, +200 for sweep.
- **Between-Game Flow:** End game screen → season progress → between-game shop (3 cards, carried-over points) → next game VS transition
- **TORCH card persistence:** Cards and unspent points carry across all 3 games. Used cards gone. Season reset clears everything.
- **Star Heat Check:** Stars start dormant. Activate on: 10+ yard gain or badge combo (offense), turnover or sack (defense) while star is selected. On Fire: +4 OVR, +5 badge combo yards, flame border + embers. Deactivate on: opponent turnover/sack (offense star), opponent TD (defense star).
- Git commit → Stop → Wait for approval

### Phase 8: Progressive Disclosure + First-Time Experience
**Goal:** The learn-as-you-go system for new players.

- `isFirstSeason` state machine controlling what's shown/hidden
- Teach tooltip sequence: play → player → SNAP (first snap), badge combo (snap 2-3), TORCH points (first TD), shop (first shop), TORCH card use (after first purchase)
- First-game engine mods: +3 yard bonus, no injuries, 50% turnover rate, AI never 4th down, force weak coverage snaps 2-3, guaranteed Bronze at first shop
- Difficulty hidden on first game (auto-Easy)
- Formation reveal hidden on first game (appears game 2+)
- Season structure hidden until end of game 1
- Star Heat Check hidden until game 2
- Tooltip component: dark backdrop, Rajdhani 13px, fade-in, dismiss on any tap, unique ID in localStorage, max 1 per screen
- Game 2 reveals: difficulty selector + formation reveal + Heat Check, each with one-time tooltip
- Git commit → Stop → Wait for approval

### Phase 9: Game Day Conditions + Play Sequence Combos
**Goal:** Per-game variance systems that extend replay value.

- **Game Day Conditions (Amendment 2 Section 10):** Random weather (5 types), field (3 types), crowd (3 levels) selected at game start. Shown on VS screen during transition. Effects applied as engine modifiers. First game: always Clear/Turf/Home. Subsequent: randomized.
- **Play Sequence Combos (Amendment 2 Section 14):** Track play sequence history per drive. Fire named combos on specific patterns:
  - RUN → RUN → PLAY-ACTION = "SETUP!" (+4 yards)
  - 3 consecutive SHORT PASS = "DRIVE MOMENTUM" (+2 yards)
  - DEEP PASS after 3+ runs = "CAUGHT SLEEPING" (+3 yards)
  - SCREEN after opponent BLITZ = "HOT READ" (+5 yards)
  - Same play 3x in a row = "PREDICTABLE" (-3 yards)
- Combo visual: brief flash text when combo fires. No tooltip — players discover through pattern recognition.
- Git commit → Stop → Wait for approval

### Phase 10: Daily Drive + Post-Game Film Room + Visual Polish
**Goal:** Daily challenge system, coaching feedback, and final polish.

- **Daily Drive (Amendment 2 Section 11):** Date-based seed generates daily scenario. Same for all players. 2-3 minute challenge. Efficiency score. Shareable result grid. Accessible from home screen as separate mode.
- **Post-Game Film Room (Amendment 2 Section 13):** End-game screen shows 2-3 key snaps where player's choice differed from optimal. Coaching tone.
- **"TORCH Football" Branding (Amendment 2 Section 12):** Update home screen subtitle. Consistent naming in all player-facing text.
- **Visual Polish:** Replace all badge icons with game-icons.net SVGs. Add team logos to helmets. Remove any remaining Unicode/emoji. Verify all 4 team color schemes. Final mobile test at 375px.
- Remove any remaining Canyon Tech / Iron Ridge references
- Git commit → Stop → Wait for approval

---

## Rules Throughout the Build
- **Mobile-first.** Test at 375px minimum width after every phase.
- **No emoji in UI.** Use SVG icons or CSS-styled elements only.
- **Shared card builders are the source of truth** for card visuals. Never duplicate card HTML inline.
- **Update CLAUDE.md** after each phase with current architecture.
- **Git commit after every phase** with descriptive messages.
- **If something in the spec or amendment is ambiguous, ASK — don't guess.** Say "The spec doesn't specify X. My options are A or B. Which do you prefer?"
- **Amendment 2 takes precedence over the base spec where they conflict.**
