# TORCH v0.22 — "Gameday" Spec

## Overview

v0.22 transforms TORCH from a functional card game into a college football experience. Every screen, sound, and animation is redesigned based on 7 Deep Research reports covering team identity, pregame presentation, stadium audio, play result display, card clash animation, play-by-play commentary, and art style.

**Read order for Claude Code:** CLAUDE.md → this spec → acceptance checklist (to be generated per phase)

**Rule: this spec takes precedence over any prior spec, amendment, or design doc.**

---

## Phase 1: Team Identity Overhaul

**Research basis:** Research 1 (Team Select UX) + Research 7 (Art Style)

### 1A: Badge/Emblem SVG Logos

Create 4 team badge emblems as inline SVG functions in `src/data/teamLogos.js`. Each emblem must:

- Use flat vector construction (clean paths, solid fills, bold outlines)
- Target under 30 SVG paths per emblem
- Pass the silhouette test: recognizable as solid black shapes at 24px
- Use maximally contrasting geometric vocabularies between teams
- Support 4 responsive sizes via a `size` parameter: hero (140px), card (80px), icon (40px), micro (24px)
- Detail layers hidden at smaller sizes via conditional rendering

**Team design specs:**

**Sentinels** — Rectangular/angular geometry
- Badge shape: Heraldic shield (pointed bottom)
- Mascot element: Stylized helmet visor slit or guardian tower
- Colors: Deep navy #1B2838 primary, antique gold #C4A265 accent
- At 24px: Shield outline alone

**Timber Wolves** — Diagonal/triangular geometry  
- Badge shape: Irregular angular edges suggesting claw marks
- Mascot element: Wolf head in profile, pointed ears and angular snout, tilted 10-15° forward
- Colors: Forest green #1B3A2D primary, silver #D4D4D4, amber accent
- At 24px: Wolf profile silhouette (ears are unmistakable)

**Stags** — Vertical/branching geometry
- Badge shape: Tall vertical orientation
- Mascot element: Symmetrical antler rack forming a crown (NO face or body — antlers ARE the logo, like Texas longhorn)
- Colors: Burnt orange #F28C28 primary, charcoal #1C1C1C, cream accent
- At 24px: Branching crown shape

**Serpents** — Curved/sinuous geometry
- Badge shape: Circular (echoing the coil)
- Mascot element: Coiled snake forming an "S" shape, or striking fangs
- Colors: Deep purple #2E0854 primary, venom green #39FF14 accent
- At 24px: Curved S-shape

**Validation:** Render all 4 logos at all 4 sizes on the ?test harness. In grayscale, all 4 must be clearly distinguishable.

### 1B: Team Select Screen Redesign

Replace the current team select with a fighting-game-quality selection screen.

**Layout (375px width):**
- Side margins: 16px × 2 = 32px
- Column gutter: 16px
- Card width: (375 - 32 - 16) / 2 = ~163px
- Card height: 212px (1:1.3 ratio)
- Total grid: 440px tall. No scrolling needed.

**Card structure (top to bottom within 163×212px):**
- Team badge emblem at hero size (120-140px tall) filling top 55-60% of card
- Subtle team-color gradient overlay at 40-60% opacity fading from bottom to top on dark base
- Team name: Teko bold, 16-18pt
- Playstyle pill: 14pt with team-color border
- Flame pips: 12-14px per pip, team-colored fill (not abstract dots — actual flame icons)
- Star player callout on right
- 2-3px team-colored border, subtle 8-12px drop shadow

**Interaction:**
- Unselected: Full opacity, muted borders
- On tap (0ms): Scale to 110% with elastic easing. Team-color glow border fades in. Unselected cards dim to 70% opacity and scale to 95%.
- 200-400ms: Team name and playstyle label animate with fade + slide-up
- 400-500ms: Brief white flash overlay. Confirmation chime.
- 500-1000ms: Selected card zooms to fill screen, other elements fade. Whoosh sound. Transition to pregame.
- Total: ~1 second from tap to next screen.

**Background:** Near-black (#0A0804) so team colors pop as accent glows.

**Difficulty row** (game 2+): Tucks tightly below grid. Hidden on first game.

Git commit → Stop → Wait for approval.

---

## Phase 2: Pregame Sequence

**Research basis:** Research 2 (Pregame Broadcast) + Research 3 (Stadium Audio)

### 5-Second Beat-by-Beat Sequence

Create `src/ui/screens/pregame.js` that plays between team select and gameplay.

| Time | Visual | Audio |
|------|--------|-------|
| 0.0-0.3s | Screen darkens. TORCH flame logo pulses at center. | Muffled crowd murmur fades in, low-pass filtered |
| 0.3-0.8s | Flame splits diagonally. Screen divides in team colors. | Marching snare cadence at 120 BPM, filter sweeps open |
| 0.8-1.5s | Team badge emblems slam in from opposite sides with scale overshoot (0→130%→100%) + white flash frame | Team-specific brass motif (4-6 notes), crowd builds |
| 1.5-2.0s | "VS" text slams center with screen shake (8px, 300ms). Particle burst at collision point. | 0.2s micro-silence then impact HIT: sub-bass + cymbal crash |
| 2.0-3.0s | Team names wipe-reveal in bold italic Teko. Game Day Conditions badge appears (CLEAR · TURF · HOME). Season record if applicable. | Crowd roar sustains, brass continues |
| 3.0-4.0s | Stat comparison bars animate with cascading fill (200ms stagger per stat) | Crowd settles to energetic ambient |
| 4.0-5.0s | Weather overlay fades in if applicable. Field materializes. | Whistle blast at 4.5s. Crossfade to gameplay ambient. |

**Team-specific brass motifs** (synthesized via Web Audio API or short audio clips):
- Sentinels: Stately military fanfare, ascending Bb major triad
- Wolves: Dark minor-key descent, then resolving upward
- Stags: Noble ascending horn call, 4 notes rising
- Serpents: Sinuous chromatic brass line, tension without resolution

**Progressive shortening:** Full 5s for first 5 games. After that, default to 2.5-3s "fast" version (same beats at 2x speed). Settings toggle: Full / Fast / Off.

**No skip button.** At 5 seconds, variation (different opponents, conditions, records) prevents staleness.

Git commit → Stop → Wait for approval.

---

## Phase 3: Audio System

**Research basis:** Research 3 (Stadium Audio)

### 3A: Install Howler.js and Create Audio Manager

`npm install howler`

Create `src/engine/audioManager.js` — an `AudioStateManager` class with:

**10 audio states:**
```
MENU, PRE_GAME, NORMAL_PLAY, BIG_MOMENT, TWO_MIN_DRILL, 
TOUCHDOWN, TURNOVER, HALFTIME, GAME_OVER, PAUSED
```

**3 simultaneous layers:**
- Ambient (crowd loops, crossfading between states)
- Intensity (one-shot stingers, brass hits)  
- UI (jsfxr clicks, card interactions — keep existing)

**State configs with crossfade:**
```javascript
const STATE_CONFIGS = {
  menu:          { ambient: null, volume: 0 },
  pre_game:      { ambient: 'crowd-building', volume: 0.4 },
  normal_play:   { ambient: 'crowd-idle', volume: 0.3 },
  big_moment:    { ambient: 'crowd-tense', volume: 0.5 },
  two_min_drill: { ambient: 'crowd-building', volume: 0.6 },
  touchdown:     { ambient: 'crowd-roar', volume: 0.8 },
  turnover:      { ambient: 'crowd-groan', volume: 0.4 },
  halftime:      { ambient: null, volume: 0 },
  game_over:     { ambient: 'crowd-roar', volume: 0.6 },
  paused:        { ambient: null, volume: 0 },
};
```

Transitions use 800-1500ms crossfades via Howler's `.fade()`.

**Mute toggle:** `Howler.mute(true/false)`, persist to `localStorage.setItem('torch_muted', ...)`. Auto-mute on Page Visibility hidden.

### 3B: Source Audio Assets

Source from Pixabay (royalty-free, no attribution):
- `crowd-idle.ogg` — 15s loop, stadium murmur, 250-2000Hz wash
- `crowd-tense.ogg` — 15s loop, nervous energy, clapping
- `crowd-building.ogg` — 15s loop, excitement building
- `crowd-roar.ogg` — 15s loop, touchdown-level eruption  
- `crowd-groan.ogg` — 15s loop, collective disappointment

One-shot SFX sprite (bundled into single file):
- Referee whistle (0.5s)
- Pad collision / hit (0.5s)
- Snap sound (0.3s)
- First-down chains (0.8s)
- Touchdown celebration (2s)
- Fight song brass sting (2s)

**Budget target: ~1.5 MB total.**

**Preload strategy:** Load idle crowd loop + SFX sprite on first user tap (~660KB). Lazy-load remaining loops during first gameplay seconds.

### 3C: Wire Audio to Game Events

Connect the AudioStateManager to gameplay events:
- Team select → PRE_GAME
- Pregame sequence → audio follows the 5-second beat map
- Snap → play whistle one-shot
- Result resolved → pad collision one-shot, state change based on result
- Big play / 3rd down → BIG_MOMENT
- 2-minute drill → TWO_MIN_DRILL  
- Touchdown → TOUCHDOWN + celebration one-shot + fight song sting
- Turnover → TURNOVER + crowd groan one-shot
- Halftime → HALFTIME (fade to silence)
- Game over → GAME_OVER

Git commit → Stop → Wait for approval.

---

## Phase 4: Scorebug Redesign

**Research basis:** Research 4 (Play Result Display)

Replace the current scorebug with a broadcast-quality persistent HUD.

**Position:** Top of screen (fixed).

**Always-visible elements (6 items max):**
1. Team badges (micro size, 24px) on team-color backgrounds
2. Score (largest numerals — 28pt)
3. Quarter/half indicator
4. Down and distance
5. Field position (text: "OPP 35" + mini-field bar showing ball position)
6. TORCH points with flame icon (animated on earn)

**Design rules from broadcast research:**
- Score is always largest element
- Possessing team's accent color dominates (dynamic shift on possession change)
- Multiple redundant possession indicators: colored accent + arrow + field position
- Reserve yellow ONLY for penalties. Use green for positive state changes.
- Down/distance text: minimum 12pt, Rajdhani bold

**TORCH points display:**
- Flame icon (reuse home screen animation, scaled to 16px)
- "T 185" in gold, Rajdhani
- On points earned: number scales to 120% with gold particle burst, settles back over 400ms
- Points only go UP from plays. Wallet (available to spend) shown separately in shop only.

**Mini-field indicator:**
- 80px wide horizontal bar showing full field
- Team-colored endzones at each end
- Ball position dot
- First-down line marker
- Updates position on every play result

Git commit → Stop → Wait for approval.

---

## Phase 5: Card Clash / Reveal Animation

**Research basis:** Research 5 (Card Reveal/Clash)

Replace the current basic card display with a collision-based reveal system.

### Layout (portrait mode, 375px)

- Left = Offense (60% width): Play Card foreground (full size) + Player Card behind (50-60% visible, slightly blurred)
- Right = Defense (40% width): Same mirrored grouping
- Center = Collision zone, slightly above vertical center
- Offense cards: angular/pointed borders, warm gold/orange palette
- Defense cards: rounded/shield borders, cool blue/steel palette

### 4-Phase Reveal Sequence

**Phase 1 — Alert (0-300ms):**
- Background dims via increasing vignette (20% → 40%)
- Ambient crowd sound lowers
- Card backs visible on each side

**Phase 2 — Build (300ms-1s):**
- Cards slide toward center from each side, face-down, with slight vibration
- Rising tone / low drum roll begins
- Rim lighting / edge glow on card backs
- High-stakes plays: add heartbeat SFX at 80-120 BPM

**Phase 3 — Peak (1-1.5s):**
- 100-200ms SILENCE (the "breath before the hit")
- Instant flip: both cards turn face-up simultaneously
- HITSTOP: freeze for duration based on tier (33ms / 67ms / 133ms)
- During freeze: screen shake (Perlin noise, trauma² system), particle burst from collision center
- Impact sound: layered bass thud + metallic ring + whoosh
- White flash at collision point (50-100ms)

**Phase 4 — Settle (1.5-2.5s):**
- Cards spring-back with 15-30% overshoot (EaseOutBack)
- Particles dissipate
- Winning cards glow and pulse; losing cards dim and shrink
- Result text animates in below collision zone

### 3-Tier Drama Scaling

| Parameter | Tier 1 (routine) | Tier 2 (important) | Tier 3 (game-changing) |
|-----------|-------------------|---------------------|------------------------|
| Total duration | 0.8-1.0s | 1.5s | 2.5-3.0s |
| Anticipation | None (skip Phase 1-2) | 300ms | 800ms-1s |
| Hitstop | 33ms | 67ms | 133ms |
| Screen shake | None | 3px, 200ms | 8-10px, 400ms |
| Background dim | 20% | 40% | 70% + blur |
| Particles | 10-20 subtle sparks | 50-100 | 200+ with speed lines |
| Card scale at impact | 100% | 110% | 120-130% |
| Sound layers | 1 (click) | 2 (click + impact) | 3+ (swell + impact + crowd) |

**Tier triggers:**
- Tier 1: Early-game standard downs, comfortable leads
- Tier 2: Third downs, red zone, sacks, first downs in competitive games
- Tier 3: Fourth-quarter decisive plays, game-winning situations, TDs, turnovers in close games

**Non-blocking:** Tap-to-skip always works. Skipping jumps to Phase 4 (settle + result). Impatient players get speed; invested players get spectacle.

Git commit → Stop → Wait for approval.

---

## Phase 6: Post-Play Display System

**Research basis:** Research 4 (Play Result Display)

Replace the current result display with the scaled 3-level hybrid system.

### 4-Beat Sequence (every play)

**Beat 1 — Impact (0-800ms):**
- Large color-coded yardage slams onto center screen
- Green = positive, Red = negative, Gold = special (TD, turnover)
- Font: Teko bold, 64px routine / 72px big plays / 96px TDs
- Scale pop: 0→120%→100% with EaseOutBack
- Sound: result-appropriate one-shot
- Haptic: proportional to play magnitude

**Beat 2 — Context (800ms-2s):**
- Scorebug updates: new down, distance, field position (animated)
- Mini-field ball position shifts
- If first down: "FIRST DOWN" flash with chains sound
- If scoring play: score animates up with number counting
- Commentary line 1 appears (the play description)

**Beat 3 — Reward (2-3.5s):**
- TORCH points earned: "T +25" pops up below yardage in gold
- Breakdown on second line: "(play: 15, combo: 10)" in smaller gold text
- If streak active: streak indicator pulses
- If combo triggered: combo name flashes ("SETUP! +4")
- Commentary line 2 appears (situational context)

**Beat 4 — Ready (3.5-5s):**
- Transient elements fade
- Card tray reappears with new hand
- "Awaiting snap" or next play prompt

### 3 Intensity Levels

**Level 1 — Quick Result (~60% of plays):** Duration 2-3s. No overlay — result banner slides in near scorebug area. Field updates in place. Single tap dismisses.

**Level 2 — Notable Result (~30% of plays):** Duration 3-4s. Ball animates on field. Larger result banner. "FIRST DOWN" or "SACK!" flash. Card highlight showing which card won.

**Level 3 — Big Play (~10% of plays):** Duration 4-5s. Full dramatic overlay. Celebration particles. Score counting animation. Full reward cascade. Screen shake. Featured card zooms to center.

### Stats Bottom Sheet

Add a swipe-up bottom sheet accessible during gameplay:
- **Ring 1 (one swipe):** Current drive stats, QB stat line (7/10, 150 yds, 1 TD), top-performing player
- **Ring 2 (full expand):** Full game stats comparison, both teams
- Thumb-friendly: follows Maps/Music app swipe convention
- Does NOT auto-show. Always one swipe away.

Git commit → Stop → Wait for approval.

---

## Phase 7: Commentary Engine

**Research basis:** Research 6 (Rich Play-by-Play)

Replace basic commentary with a template-based engine producing vivid, variable-length descriptions.

### Architecture

Create `src/engine/commentary.js` with:

**Template library:** 400-600 base templates organized by event type.
- 15-20 variants per common event (short gain, medium gain, incompletion)
- 8-12 variants per uncommon event (INT, fumble, sack, TD)
- Modular grammar: `{player} {verb} {modifier} for {yards} yards` with 20+ verbs, 15+ modifiers

**Game state tracker:** Monitors score, clock, down/distance, field position, momentum, player performance. Gates template selection so the same event triggers different commentary based on context.

### Variable Length by Importance

**Routine plays (70%):** 1 line, 8-15 words.
- "Martinez gains 4 on the draw. Second and 6."
- "Incomplete — Tillery was draped all over him."

**Notable plays (20%):** 2 lines, 15-25 words.
- "Harrison breaks a tackle and picks up 12! That moves the chains — Sentinels across midfield for the first time."

**Big plays (10%):** 2-3 lines, 25-40 words.
- "TOUCHDOWN SENTINELS! Calloway rolls right, buys time, and finds Monroe streaking down the sideline — 23-yard strike! The Sentinels take the lead with under two minutes to play!"

### 4-Tier Emotional Intensity

**Level 1 (Routine, 60-70%):** Even language, complete sentences. "Johnson takes the handoff, runs off left tackle, picks up three. Third and four."

**Level 2 (Elevated, 20%):** Stronger verbs, contextual urgency. "Johnson bursts through the hole for 8 — and that moves the chains on a critical third down."

**Level 3 (Intense, 8%):** Fast pacing, fragments, spatial tracking. "Johnson! Johnson cuts back — to the 40, the 45, he's got room!"

**Level 4 (Explosive, 2%):** ALL CAPS keywords, repetition, disbelief. ONLY for game-winning/game-changing moments. "JOHNSON BREAKS FREE — NOBODY'S GONNA CATCH HIM — TOUCHDOWN!!"

### Six Vividness Elements

Every template should use 2-3 of these:
1. **Action verbs:** "fires," "threads," "darts," "floats" (not "throws")
2. **Route/movement:** "cutting across the middle," "rolling right"
3. **Defender names:** "before Tillery drags him down"
4. **Field position:** "at the 35, just past midfield"
5. **Micro-narrative:** setup → action → resolution in one sentence
6. **Punctuation as pacing:** em dashes for breathless, ellipses for suspense

### Situational Context (~30% of snaps)

Inject context when these triggers fire:
- Crossing midfield: "The Sentinels are in Serpents territory for the first time."
- Entering red zone: "Inside the 20 now — this is scoring range."
- First score: "First blood — the Sentinels strike first."
- Lead change: "And just like that, the Serpents take the lead!"
- Two-minute warning: "The clock is the enemy now."
- Callbacks: "Calloway was picked off on this same route earlier — this time he delivers."

### Anti-Repetition

- Cooldown tracking: never repeat same template for same event type until all alternatives exhausted
- Contextual gating: same event triggers different text based on game state (doubles perceived variety)
- Special-moment one-shots: 20-30 templates flagged for single use per game

### The Championship Manager Trick

For Tier 2-3 plays, implement delayed text reveal:
- Line 1 appears: "Calloway fires deep..."
- 1.5-2 second pause
- Line 2 resolves: "CAUGHT! Monroe at the 15! First down Sentinels!"
This creates genuine suspense from pure text.

Git commit → Stop → Wait for approval.

---

## Phase 8: Gameplay Screen Optimization

### 8A: Layout Tightening

- Field height: reduce by 20% on mobile. Context, not the main interaction.
- Card tray: all cards identical width via flex:1 with min-width:0. No overflow.
- 5 player cards with OL position (already added in bug fixes)
- Commentary area: fixed 110px, torch orange top border, "Awaiting snap" placeholder
- Maximum 20px empty space between any content blocks
- SNAP button: torch orange gradient (matching KICK OFF), clear separation from commentary

### 8B: Card Animations

Implement card deal, flip, and selection animations using the card back designs from the home screen:

**Card deal:** When hand refreshes, cards slide in from right edge one at a time (50ms stagger), face-down showing card backs (green offense / blue defense), then flip face-up with a 300ms CSS perspective flip.

**Card selection:** Selected card lifts (scale 1.05, shadow increase) and slides upward toward the field drop zone. Green glow border.

**TORCH card phase:** Visually distinct from play hand. Header says "TORCH CARD — Play one or skip" in gold. Cards have the orange TORCH card back. Different background tint.

### 8C: 2-Minute Drill Real-Time Clock

When the 2-minute drill activates:
- Game clock becomes a REAL countdown timer ticking in real-time on the scorebug
- Clock counts down from 2:00 to 0:00
- Clock stops ONLY on: timeout, incomplete pass, out of bounds, penalty, score
- Continuous plays (runs, completions in bounds) keep the clock running
- Player must pick play + player + snap within the time — if clock hits 0:00, game ends
- Interface pulses red (existing T-urgent CSS), intensifying as clock drops below 0:30
- Heartbeat SFX below 0:15
- Audio state → TWO_MIN_DRILL

Git commit → Stop → Wait for approval.

---

## Phase 9: Halftime & Possession Screens

### 9A: Halftime Report Redesign

Current halftime is bare. Redesign as a broadcast-style halftime show:

**Layout:**
- "HALFTIME" header with torch orange underline
- Score display: both team badges (icon size) + scores + team names
- Drive summary: "Sentinels: 4 drives, 2 TDs, 185 total yards"
- Top performers: "QB Calloway: 8/12, 142 yds, 2 TD" with player card thumbnail
- Coach's pep talk: Random motivational quote in italics. ("We're right where we want to be. Second half is ours." — or situation-aware: "Down 7. One stop and one score. That's all it takes.")
- Locker Room Shop: 3 TORCH cards with working BUY buttons
- "START SECOND HALF →" button

**Audio:** Ambient crowd fades out. Brief halftime music sting (synth brass, 3 seconds). Silence during shop.

### 9B: Possession Change Screens

Current possession change is too bare. Add:
- Score display with team badges
- Drive summary: "DRIVE: 6 plays, 45 yards, 2:15" 
- "CHANGE OF POSSESSION" or "YOUR BALL" header
- If score changed: animated score update
- Crossfade audio from current state to new possession state
- 2-second auto-advance (tap to skip)

Git commit → Stop → Wait for approval.

---

## Phase 10: End Game & Film Room

### End Game Screen

- VICTORY / DEFEAT with appropriate audio (torch-lit vs torch-out)
- Final score with team badges
- TORCH points total with breakdown: "Base: 450 | Combos: 85 | Win Bonus: 100 | TOTAL: 635"
- Season record pips (W/L/—)
- Player of the Game: top performer with stat line and player card
- Film Room section with coaching moments

### Film Room Upgrade

Currently bare text. Redesign:
- "FILM ROOM" header with clipboard icon
- 3-5 key plays listed with snap number, result, and a coaching tip
- Good plays AND bad plays (not just negatives)
- Example: "Snap 14: TD +22 (Streak vs Two-Deep Sit) — Great read. The deep ball was there and Calloway delivered."
- Example: "Snap 8: INT (Fade & Stop vs Hidden Bracket) — They disguised the coverage. Look for the safety's alignment next time."

Git commit → Stop → Wait for approval.

---

## Phase 11: Visual Polish & Test Harness

### Update ?test Harness

Add new sections for every new/redesigned component:
- TEAM SELECT with new badge emblems at all 4 sizes
- PREGAME SEQUENCE (static keyframes: flame split, VS slam, settle)
- SCOREBUG CLOSE-UP with new broadcast design
- CARD CLASH at all 3 tiers (Tier 1, 2, 3 static states)
- POST-PLAY RESULT at all 3 levels
- COMMENTARY SAMPLES with all 4 emotional intensities
- HALFTIME REPORT redesigned
- END GAME with Film Room
- POSSESSION CHANGE screen

### Card Back Integration

Verify card backs from home screen (green offense, orange TORCH, blue defense) appear in:
- Card deal animation (face-down state)
- Card clash anticipation phase (face-down sliding toward center)
- Shop cards (TORCH card back visible before purchase)

Git commit → Stop → Wait for approval.

---

## Phase Summary

| Phase | What | Est. Complexity |
|-------|------|-----------------|
| 1 | Team Identity: SVG badges + team select redesign | High |
| 2 | Pregame: 5-second broadcast sequence | Medium |
| 3 | Audio: Howler.js + state machine + crowd loops | High |
| 4 | Scorebug: Broadcast-quality persistent HUD | Medium |
| 5 | Card Clash: 4-phase collision reveal + 3 tiers | High |
| 6 | Post-Play: 3-level display + 4-beat sequence + stats sheet | High |
| 7 | Commentary: Template engine + 400-600 templates | High |
| 8 | Gameplay: Layout + card animations + 2-min real-time clock | Medium |
| 9 | Halftime + Possession: Broadcast-style screens | Medium |
| 10 | End Game + Film Room | Low |
| 11 | Visual Polish + Test Harness updates | Medium |

---

## Design System Constants

**Colors (locked):**
- Background: #0A0804 (scorched black)
- Torch orange: #FF6B00
- Gold accent: #C4A265 / #FFB800
- Positive: #00FF44 (green)
- Negative: #FF3333 (red)
- Neutral: #E8E6FF (soft white)
- Special/reward: #FFD700 (gold)
- Penalty ONLY: #FFD700 (yellow — never used for positive state changes)

**Typography:**
- Headers: Teko, bold, italic for team names (5-12° slant)
- Body: Rajdhani
- Minimum mobile text: 10pt body, 14pt labels, 16pt+ team names

**Animation curves:**
- Slam approach: EaseInExpo
- Card flip: EaseInOutCubic, 300-400ms
- Post-impact settle: EaseOutBack (15-30% overshoot), 400-600ms
- Scale pop: 0→120%→100% with bounce

**Audio:**
- jsfxr: UI clicks only
- Howler.js: Everything else
- Crossfade: 800-1500ms between states
- Total budget: ~1.5MB
