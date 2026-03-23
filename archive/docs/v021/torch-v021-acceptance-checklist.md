# TORCH v0.21 — Acceptance Testing Checklist (10 Phases)

Run local dev: `cd ~/torch-football && npx vite --host`
Test on: Desktop browser (Chrome) + phone via local IP
**Test each phase BEFORE approving. Don't let bugs carry forward.**

---

## Phase 1: Data Layer ✅❌

### Teams
- [ ] `src/data/teams.js` exports TEAMS with 4 teams: sentinels, wolves, stags, serpents
- [ ] Colors match spec: Sentinels (#8B0000/#C4A265), Wolves (#1B3A2D/#D4D4D4), Stags (#F28C28/#1C1C1C), Serpents (#2E0854/#39FF14)
- [ ] Each team has: id, name, school, mascot, abbr, colors, helmet, motto, offScheme, defScheme, ratings

### Players
- [ ] 48 players total (4 × 6 offense + 4 × 6 defense)
- [ ] Each has: id, name, pos, ovr, badge, isStar, starTitle (if star), num
- [ ] 1 offensive star + 1 defensive star per team at 84 OVR
- [ ] No OL in playable rosters

### Plays
- [ ] 4 play files exist with 10 OFF + 10 DEF each (80 total)
- [ ] Every play has: id, name, cat, risk, flavor, formation (defensive only), engine stats
- [ ] Defensive names are simplified (no jargon)
- [ ] Flavor text under 6 words each

### Other Data
- [ ] `badgeIcons.js` has SVG paths for all 12 badges
- [ ] `teamLogos.js` has placeholder paths for 4 logos
- [ ] `torchCards.js` has 8 cards with cost, type, tier, effect
- [ ] `state.js` has season state + isFirstSeason + gameConditions placeholder
- [ ] Zero Canyon Tech / Iron Ridge references in any data file

---

## Phase 2: Card Components ✅❌

- [ ] `buildMaddenPlayer()` shows badge icon instead of OVR number
- [ ] Tier borders: gold (star), team color (starter), muted (reserve)
- [ ] `teamHelmetSvg()` renders team-colored helmets at 48px and 24px
- [ ] Star players have gold border + star icon
- [ ] Flame pip component renders custom SVG (not Unicode ★)
- [ ] Ratings match: Sentinels 4/3, Wolves 3/4, Stags 5/2, Serpents 3/4
- [ ] `?mockup` page shows new card styles correctly

---

## Phase 3: Team Select + Fighting-Game Animation ✅❌

### Layout
- [ ] 2x2 grid, all 4 teams visible without scrolling on 375px
- [ ] Each card shows: helmet, name, playstyle pill, flame pips, star callout, motto
- [ ] "CHOOSE YOUR TEAM" header visible

### Selection Animation
- [ ] Tap team → color flash in team primary (150ms)
- [ ] Helmet/mascot scales to center with particle trail
- [ ] Player cards fan out behind (staggered)
- [ ] Screen shake fires
- [ ] Team-specific audio sting plays (4 distinct sounds)
- [ ] Total animation under 2.5 seconds

### First-Time Player
- [ ] First game: difficulty row hidden, auto-Easy
- [ ] First game: tooltip "Each team plays differently. Tap to choose."
- [ ] Game 2+: difficulty row visible

### Cleanup
- [ ] `setup.js`, `draft.js`, `cardDraft.js`, `draftProgress.js` removed
- [ ] KICK OFF → teamSelect navigation works

---

## Phase 4: VS Transition ✅❌

- [ ] After team hype animation → screen splits diagonally (your color LEFT, opponent RIGHT)
- [ ] Your helmet vs opponent helmet visible
- [ ] "VS" text slams in with bounce easing
- [ ] Diagonal wipe clears to gameplay field
- [ ] Cards deal into hand
- [ ] NO separate coin toss screen exists (coinToss.js removed)
- [ ] Coin toss resolved silently in engine
- [ ] Total transition 1.6-2.5 seconds

---

## Phase 5: Gameplay — Hand Management + Teams + Formation ✅❌

### Hand Management
- [ ] 5 play cards visible in hand (not 4)
- [ ] Playing a card: it leaves, new card slides in from right
- [ ] All 10 plays cycle through over ~10 snaps
- [ ] Hand always has exactly 5

### Formation Reveal
- [ ] Defensive formation label shows above field BEFORE play selection (game 2+)
- [ ] Labels are: NICKEL, DIME, 3-4 BASE, 4-2-5, BLITZ LOOK
- [ ] Hidden on first game (isFirstSeason && currentGame === 0)
- [ ] Game 2 tooltip: "Read the defense before you call your play."

### Team Integration
- [ ] Correct roster loads for selected team (all 4 work)
- [ ] Correct playbook loads (all 4 work)
- [ ] Badge combos fire correctly for all team/badge/play combinations
- [ ] AI uses opponent-specific defensive playbook

### Difficulty
- [ ] Easy: random plays, -3 OVR, no combos, +2 yards
- [ ] Medium: situational, normal OVR, 40% combos
- [ ] Hard: 50% optimal + 25% situational + 25% random, +2 OVR, 80% combos
- [ ] Formation reveal honest on Easy, 90% on Medium, 75% on Hard

---

## Phase 6: 3-Beat Snap Result ✅❌

### Beat 1: Anticipation
- [ ] Cards animate toward center
- [ ] Background dims
- [ ] Sound builds
- [ ] 150ms pause at peak

### Beat 2: Impact
- [ ] Hitstop freeze (both cards visible, 150ms)
- [ ] Screen shake
- [ ] Color flash (green = good, red = bad, gold = explosive)
- [ ] 150ms near-silence after flash
- [ ] Result sound fires

### Beat 3: Aftermath
- [ ] Yardage counter animates with ascending audio pitch
- [ ] Commentary appears line by line
- [ ] Ball moves, down/distance updates
- [ ] Player can start selecting next card while animations finish

### Scaling
- [ ] Routine play (3 yard gain on 1st & 10): ~2 seconds, minimal effects
- [ ] Explosive play (15+ yards): strong shake, loud sound
- [ ] Touchdown: 4+ seconds, full celebration, confetti, haptic

---

## Phase 7: Season + TORCH Cards + Stars + Film Room ✅❌

### Season
- [ ] 3-game season, opponent changes each game
- [ ] "GAME 1 OF 3 COMPLETE" shown at end
- [ ] Between-game shop with 3 cards
- [ ] TORCH points carry over
- [ ] Cards persist across games
- [ ] Season complete bonus (+100/win, +200 sweep)

### TORCH Cards
- [ ] 8 cards work: Scout Team, Sure Hands, Hard Count, Hot Route, Flag on the Play, Onside Kick, 12th Man, Ice
- [ ] Shop opens after: TD, turnover, 4th stop, star activation, halftime, between-game
- [ ] Post-trigger shop shows 1 card, halftime/between-game shows 3
- [ ] Buying deducts points from score
- [ ] 3-slot limit enforced, swap UI when full
- [ ] Cards are single-use (disappear after use)

### Star Heat Check
- [ ] Stars start dormant
- [ ] Activate on big plays (10+ yards / badge combo / turnover / sack)
- [ ] Flame border visible when On Fire
- [ ] +4 OVR applied in engine
- [ ] Deactivation works (opponent turnover/sack → offense star off, opponent TD → defense star off)

### Film Room
- [ ] End-game screen shows 2-3 key plays where chosen play differed from optimal
- [ ] Coaching tone, not punishing
- [ ] Shows what play would have worked better and by how many yards

---

## Phase 8: Progressive Disclosure ✅❌

- [ ] `isFirstSeason` flag controls all teach moments
- [ ] Tooltips fire in order: play → player → SNAP → combo → TD/points → shop → TORCH card use
- [ ] Each tooltip shows only once (tracked in localStorage)
- [ ] Max 1 tooltip per screen transition
- [ ] First-game mods: +3 yards, no injuries, 0.5× turnovers, weak coverage snaps 2-3, guaranteed Bronze
- [ ] Formation reveal hidden on first game
- [ ] Difficulty hidden on first game
- [ ] Season revealed at end of game 1
- [ ] Heat Check first appears game 2
- [ ] "TORCH Football" branding on home screen subtitle
- [ ] Game 2: difficulty selector appears with "Choose your challenge"

---

## Phase 9: Game Day Conditions ✅❌

- [ ] Conditions generate randomly per game (seeded)
- [ ] First game always: Clear / Turf / Home
- [ ] Weather modifiers apply: Rain (-5% completion, +1% fumble), Wind (deep cap 15), Snow (-2 run, +1 variance)
- [ ] Field modifiers apply: Grass (+1 run), Mud (-1 all, +2 variance)
- [ ] Crowd modifiers apply: Home (+1 OVR), Away (+1 opponent OVR)
- [ ] Conditions visible on VS screen (weather icon + field + crowd)
- [ ] 45 possible combinations work correctly
- [ ] Engine calculations include condition modifiers

---

## Phase 10: Play Combos + Daily Drive ✅❌

### Play Sequence Combos
- [ ] RUN → RUN → PLAY-ACTION triggers "Setup" (+4 yards)
- [ ] 3× SHORT PASS triggers "Drive Momentum" (+2 yards)
- [ ] DEEP after 3+ runs triggers "Caught Sleeping" (+3 yards)
- [ ] SCREEN after BLITZ triggers "Hot Read" (+5 yards)
- [ ] Same play 3× triggers "Predictable" (-3 yards)
- [ ] Visual flash appears on trigger (no tooltip/explanation)

### Daily Drive
- [ ] "DAILY DRIVE" button on home screen alongside KICK OFF
- [ ] Date-based seed produces same scenario for all players
- [ ] Fixed: teams, weather, field, crowd, start position, AI sequence
- [ ] Only player choices vary
- [ ] 2-3 minute challenge
- [ ] Efficiency score calculated
- [ ] Shareable result grid generated (TORCH-themed)
- [ ] One attempt per day enforced via localStorage

---

## Cross-Cutting (run after EVERY phase)

- [ ] Home screen loads correctly
- [ ] No console errors
- [ ] No broken imports
- [ ] Mobile test at 375px: text readable, touch targets work, no horizontal scroll
- [ ] `git diff` shows only expected changes
- [ ] CLAUDE.md updated
- [ ] Git committed with descriptive message
