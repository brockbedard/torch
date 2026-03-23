# TORCH v0.21 — Spec Amendment #2

**Date:** 2026-03-22
**Applies to:** `docs/TORCH-V021-SPEC.md` (after Amendment #1 is merged)
**Sources:** Deep Research reports on market analysis, TikTok marketing, team select UX, continuous discovery, and gameplay mechanics

---

## Amendment 6: Pre-Snap Formation Reveal

### What Changes
Before the player selects their play card, the AI's **defensive formation** is briefly shown. NOT the specific play — just the alignment category.

### Why
Research across Slay the Spire, Into the Breach, Yomi, and real football is unambiguous: pure simultaneous reveal with zero information feels like guessing, not strategy. Partial information converts losses from "bad luck" to "I misread that." Real football already provides this model — the offense sees the defensive formation pre-snap but not the coverage.

### How It Works

**Per-snap flow becomes 4 phases:**

| Phase | Duration | What Happens |
|-------|----------|-------------|
| 1. Formation Reveal | ~1 sec | AI's defensive alignment flashes above the field: "NICKEL" / "3-4 BASE" / "DIME" / "BLITZ LOOK". Player sees this BEFORE selecting their play card. |
| 2. Commit | Player-paced | Player selects play card → player card → (optional TORCH card) → SNAP. Both plays are now locked. |
| 3. Simultaneous Reveal | ~0.5 sec | Both cards flip and collide. Hitstop freeze. This is the drama moment. |
| 4. Resolution | ~2-3 sec | Yardage counting, commentary, board state update. |

**Formation categories (what the player sees):**

| Formation Shown | What It Hints | Defensive Plays That Use It |
|----------------|---------------|---------------------------|
| NICKEL (5 DB) | Pass coverage likely | Most zone and man coverage plays |
| DIME (6 DB) | Heavy pass coverage | Deep zone, bracket coverage |
| 3-4 BASE | Balanced / run-ready | Base zone, gap-sound plays |
| 4-2-5 | Hybrid | Pattern match, spy plays |
| BLITZ LOOK | Pressure likely (but could be fake) | All blitz plays + sim pressure/fake blitz |

**Critical design rule:** The formation narrows possibilities but NEVER guarantees the play. "BLITZ LOOK" could be a real blitz OR a sim pressure that drops into coverage. This creates a learnable-but-not-solvable prediction game, exactly like Yomi's bounded uncertainty.

### Data Model Addition
Each defensive play needs a `formation` field:
```js
{ id: 'rdg_d1', name: 'Press & Trail', cat: 'PRESS COVERAGE', 
  risk: 'med', flavor: 'Get in his face, stay on his hip',
  formation: 'NICKEL',  // <-- NEW: shown to player pre-snap
  // ... engine stats
}
```

### Progressive Disclosure
- First game: formation reveal is NOT shown (too much info for first-time players)
- Game 2+: formation reveal appears with a one-time tooltip: "Read the defense before you call your play."

---

## Amendment 7: Snap Result — 3-Beat Rhythm

### What Changes
The snap result animation is redesigned from "cards resolve, commentary plays" to a 3-beat emotional rhythm: Anticipation → Impact → Aftermath.

### The Sequence

**Beat 1: Anticipation (0.8–1.2 sec)**
- Both cards animate toward center of screen (offense from bottom, defense from top)
- Background dims slightly
- Sound builds (low rumble, increasing pitch)
- Brief 150ms pause at peak — silence before thunder

**Beat 2: Impact / Reveal (0.5–0.8 sec)**
- **Hitstop freeze:** Both cards visible, side by side, for 150ms. Slight screen shake. Flash of color matching the result (green = good, red = bad, gold = explosive).
- 150ms of near-silence after the flash — the "silence before thunder" technique
- Result sound fires: crowd roar for big gain, groan for loss, explosion for TD

**Beat 3: Aftermath / Cascade (1.0–2.5 sec)**
- Yardage counter animates up (Balatro-style ascending audio pitch synced to number)
- Commentary text appears line by line
- Ball moves on field
- Down/distance updates
- Player regains control (new cards ready) while decorative animations finish

### Scale to Stakes

| Situation | Total Duration | Juice Level |
|-----------|---------------|-------------|
| Routine play (1st & 10, 3 yard gain) | ~2 sec | Minimal: clean feedback, no shake, quiet sound |
| First down conversion | ~3 sec | Moderate: brief flash, crowd murmur, badge combo highlight if triggered |
| Explosive play (15+ yards) | ~3.5 sec | High: strong shake, loud crowd, yardage counter dramatic |
| Sack or turnover | ~3.5 sec | High: red flash, impact sound, screen crack effect |
| Touchdown | ~4+ sec | Maximum: full celebration, gold flash, confetti, crowd roar, haptic burst |
| 4th quarter go-ahead TD | ~5 sec | Maximum+: everything above + slow-motion feel + extended crowd |

### Implementation Notes
- Hitstop freeze: CSS `animation-play-state: paused` for 150ms, then resume
- Screen shake: CSS `transform: translate()` with ±3px, 3 oscillations, 100ms
- Yardage counter: `requestAnimationFrame` loop, count from 0 to final yards over 400-800ms, with jsfxr tone rising in pitch proportionally
- All decorative animation must be non-blocking — player can start selecting next play card while aftermath plays

---

## Amendment 8: Fighting-Game Team Selection Animation

### What Changes
Replace the current simple selection behavior (green border pulse + scale lift) with a fighting-game-inspired confirmation sequence. Merge coin toss INTO this transition — eliminate the separate 3-second coin animation entirely.

### The 2-Tap Flow

```
TAP 1: KICK OFF (home) → Team Select screen loads
       [2x2 grid with idle animations, cards stagger in 100ms apart]

TAP 2: Player taps their team → NO MORE TAPS, auto-transition begins:

PHASE 1 — Team Hype (0.8–1.2 sec)
  • Full-screen color flash in team primary color, 70% opacity, 150ms ease-out
  • Team mascot/helmet scales from card to screen center with particle trail (300ms, overshoot easing)
  • 2-3 player cards from that team fan out behind the logo (400ms, staggered 80ms)
  • Team-specific audio sting plays (1 sec jsfxr sound)
  • Haptic pulse fires (if supported)

PHASE 2 — VS Matchup (0.5–0.8 sec)
  • Screen splits diagonally — your team color LEFT, opponent team color RIGHT
  • Your helmet LEFT, opponent helmet RIGHT
  • "VS" text slams in from top (200ms, scale 200%→100%, bounce easing)
  • This phase masks any data loading

PHASE 3 — Field Reveal (0.3–0.5 sec)
  • Diagonal wipe clears VS screen
  • Game field fades in
  • Cards deal into hand
  • "1ST & 10" text with final flourish

→ GAMEPLAY BEGINS

Total: ~1.6–2.5 seconds, ZERO additional taps after team selection
```

### What This Replaces
- The separate coin toss screen (Section 11.3 in current spec) is ELIMINATED
- The coin toss result is determined in the engine during the VS animation — player never sees a coin
- Winner receives at 50, resolved automatically

### Team-Specific Audio Stings
Each team gets a unique 1-second jsfxr-generated sound on selection:
- **Sentinels:** Regal brass hit + crowd chant (warm, disciplined)
- **Wolves:** Low growl + heavy drums (physical, ominous)
- **Stags:** Electric crack + fast tempo (explosive, chaotic)
- **Serpents:** Slithering hiss + eerie synth (cerebral, dark)

Generate these with jsfxr and store in `src/engine/sound.js` alongside existing sound effects.

### First-Time Player
- First game: the full animation plays but at slightly slower speed (2.5-3 sec total) to let the player absorb it
- Subsequent games: standard 1.6-2.5 sec speed
- The VS screen is their first glimpse of the opponent — no prior reveal needed

### Difficulty Selection
With the coin toss eliminated and the transition being automatic, difficulty selection MUST happen on the team select screen (already specced). On first game, difficulty is hidden (auto-Easy). On game 2+, difficulty row appears below the 2x2 grid.

---

## Amendment 9: Hard Difficulty Rebalance

### What Changes
Reduce the AI's optimal counter rate from 75% to 50%. Shift difficulty to OVR bonuses and combo rate, not perfect reads.

### Why
Research across fighting games, card games, and sports games: AI that counters optimally above ~60% feels like input-reading cheating. Players describe it as "the AI always has the answer" rather than "the AI outplayed me."

### Revised Difficulty Table

| Aspect | Easy | Medium | Hard |
|--------|------|--------|------|
| Play selection | Random with basic filters | Situational (down/distance/score) | 50% optimal + 25% situational + 25% random |
| OVR modifier | -3 | Normal | +2 |
| Combo rate | Never | 40% | 80% |
| Player bonus | +2 yards | None | None |
| Formation reveal accuracy | Always honest | Honest 90% of the time | Honest 75% (may disguise) |
| Target player win rate | 75-85% | 50-60% | 35-45% |

### AI Coaching Personality (flavor, not mechanic — v2+)
- Easy: "Rookie Coach" — telegraphed, predictable, panics when losing
- Medium: "Veteran Coach" — situational, has exploitable tendencies
- Hard: "Mastermind Coach" — mixed strategies, subtle patterns, adaptable

### Rubber-Banding Rule
- NEVER within a game (Mario Kart rubber-banding kills satisfaction)
- Between games only: after 3 consecutive player losses, next game subtly favors weaker AI play selection
- Always invisible to the player

---

## Amendment 10: Game Day Conditions (v2 — spec now, build later)

### What It Is
Per-game random modifiers that make each game feel different even with the same matchup. Inspired by Marvel Snap's location system.

### Categories

**Weather (5 types):**
| Weather | Effect |
|---------|--------|
| Clear | No modifier (baseline) |
| Rain | -5% completion rate, +1 fumble rate |
| Wind | Deep passes capped at 15 yards, field goals harder |
| Snow | Run plays -2 mean yards, all plays +1 variance |
| Heat | Player fatigue increases faster (future mechanic) |

**Field (3 types):**
| Field | Effect |
|-------|--------|
| Turf | No modifier (baseline) |
| Grass | Run plays +1 mean yard |
| Mud | All plays -1 mean yard, +2 variance |

**Crowd (3 levels):**
| Crowd | Effect |
|-------|--------|
| Home | +1 OVR for your team |
| Neutral | No modifier |
| Away | +1 OVR for opponent |

### Combinatorics
5 weather × 3 field × 3 crowd = **45 unique condition sets**
× 12 team matchups = **540 distinct game contexts**
× 3 difficulty levels = **1,620 scenarios** before considering play/card variance

### How It's Revealed
- Conditions shown on the VS matchup screen (Amendment 8's Phase 2)
- Small weather icon + field type + crowd indicator below the helmets
- First game: always Clear / Turf / Home (simple baseline)
- Subsequent games: randomized

### Build Priority
**NOT in v1 build.** Spec it in the data model so the engine can accept condition modifiers, but don't generate or display them yet. This is a v2 feature that dramatically extends replay value.

```js
// Future data model addition
gameConditions: {
  weather: 'clear',  // clear|rain|wind|snow|heat
  field: 'turf',     // turf|grass|mud
  crowd: 'home',     // home|neutral|away
}
```

---

## Amendment 11: Daily Drive (v2 — spec now, build later)

### What It Is
One shared game scenario per day — same matchup, weather, score, field position, conditions for all players. A 2-3 minute daily challenge with a shareable result.

### Why
Wordle was played 4.8 billion times in a single year on this model. Scarcity (one per day) + synchronization (everyone plays the same challenge) + shareability (the result grid) creates daily ritual and social organic growth.

### How It Works
- Daily scenario generated from a date-based seed (same for all players)
- Fixed: teams, weather, field, crowd, starting score/field position, AI play sequence
- Variable: only the player's card choices differ
- Result: efficiency score (how many snaps to score, or how few yards allowed)
- Shareable: TORCH-themed result grid (like Wordle's green/yellow squares but with football iconography)

### Build Priority
**NOT in v1 build.** Spec the date-based seed system and the result-sharing format. This becomes the primary acquisition tool alongside the TikTok Play Call Challenge content.

---

## Amendment 12: Branding — "TORCH Football"

### What Changes
Consistently use "TORCH Football" (not just "TORCH") in all player-facing contexts where searchability matters.

### Where It Applies
- App Store listing title: "TORCH Football — The Card Game"
- TikTok account name: @TORCHFootball
- In-game: the home screen wordmark can stay "TORCH" (it's the brand mark), but the subtitle changes from "DEAL THE PLAY" to "TORCH FOOTBALL" with "DEAL THE PLAY" as a smaller tagline below
- Social sharing cards: "TORCH Football" in the header
- Discord server name: "TORCH Football"
- Website/landing page: torchfootball.com (if available)

### Why
Research found that 48% of TikTok-to-download conversions come from users searching the game name directly on the App Store. "TORCH" alone is a common English word. "TORCH Football" is unique and findable.

---

## Amendment 13: Post-Game Feedback (What the AI Would Have Done)

### What Changes
After each game, the end-game screen includes a "Film Room" section showing 2-3 key plays where the player's choice differed from the optimal play.

### Why
Research says: "Post-game feedback must reinforce agency. Show what the optimal play would have been so every loss becomes a coaching moment."

### How It Works
- Engine tracks the optimal play for each snap (based on the defensive play that was called)
- At end-of-game, identify the 2-3 snaps with the largest gap between chosen play result and optimal play result
- Display: "Play 14: You called FB Dive vs Zero Blitz. A Screen Pass would have gained +8 more yards."
- Tone: coaching, not punishing. "Next time, watch for the blitz look — screens eat blitzes alive."

### Build Priority
v1 stretch goal. The engine already calculates what would have happened with different plays — surfacing it is primarily a UI task.

---

## Amendment 14: Play Sequence Combos (v2 — spec now, build later)

### What It Is
Hidden bonuses for specific play sequences that players discover organically. Run-run-play action triggers a bonus. Three consecutive short passes build "Drive Momentum." A deep pass after three runs triggers "Caught Sleeping."

### Why
Balatro's replayability secret is multiplicative card interactions — 150 Jokers × 5 slots = 591M+ combinations, with new synergies discovered after hundreds of hours. TORCH should reward play-calling patterns that mirror real football strategy.

### Example Combos (design, not final balance)

| Sequence | Name | Bonus |
|----------|------|-------|
| RUN → RUN → PLAY-ACTION | Setup | +4 yards on the PA play |
| 3 consecutive SHORT PASS | Drive Momentum | +2 yards on 4th pass |
| DEEP PASS after 3+ runs | Caught Sleeping | +3 yards, higher completion rate |
| SCREEN after opponent BLITZ | Hot Read | +5 yards (already partially in engine) |
| Same play called 3x in a row | Predictable | -3 yards (AI caught on) |

### How Players Learn
They DON'T get told about these. No tooltip, no tutorial. They discover them through pattern recognition — the same way TORCH's original design doc described learning: "The game never reveals what beats what — players learn by pattern recognition."

When a combo fires, a brief visual flash appears: "SETUP!" or "CAUGHT SLEEPING!" — enough to notice, not enough to explain. Players piece together what triggered it over multiple games.

### Build Priority
**NOT in v1 build.** But the play history tracking already exists in the engine (consecutive play type tracking, play-action bonus after runs). Extending it to support named combos is a natural evolution.

---

## Summary of All Amendment #2 Decisions

| # | Decision | Build Phase |
|---|----------|-------------|
| 6 | Pre-snap formation reveal (show defensive alignment before play selection) | v1 Phase 5 (gameplay integration) — but hidden on first game |
| 7 | 3-beat snap result rhythm (anticipation → hitstop → cascade) | v1 Phase 5 |
| 8 | Fighting-game team selection animation (replaces simple border pulse + eliminates coin toss screen) | v1 Phase 3 (team select) + Phase 4 (replaces coin toss) |
| 9 | Hard difficulty rebalanced (50% optimal counter, down from 75%) | v1 Phase 5 |
| 10 | Game Day Conditions (weather/field/crowd) | v2 — spec data model now, build later |
| 11 | Daily Drive (shared daily challenge + shareable result) | v2 — spec seed system now, build later |
| 12 | "TORCH Football" branding | v1 Phase 6 (visual polish) |
| 13 | Post-game Film Room (show optimal plays for key snaps) | v1 stretch goal |
| 14 | Play Sequence Combos (hidden bonuses for smart play patterns) | v2 — engine hooks exist, named combos later |
