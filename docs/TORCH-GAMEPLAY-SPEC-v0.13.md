# TORCH Gameplay Mechanics Spec — v0.13 (All Blindspots Resolved)

## THE GAME

TORCH is a football card game. Full game. Starts 0-0. You play both sides of the ball. Possessions change naturally like real football.

---

## SETUP FLOW

### Full Draft
1. Pick your team (Canyon Tech or Iron Ridge)
2. Draft 4 offensive players (1 QB + 3 skill)
3. Draft 4 defensive players (1 LB + 3 DBs)
4. Draft 5 offensive plays (from 10 in team playbook)
5. Draft 5 defensive plays (from 10 in team playbook)
6. Coin toss
7. Play ball

### Quick Start
1. Pick your team
2. AI handles steps 2-5
3. Coin toss
4. Play ball

### What You Know About the Opponent
- Their full 10-card team playbook (public — it's the team's identity)
- Their drafted roster (who they picked, OVR, badges)
- You do NOT see which 5 of 10 plays they drafted into their hand

---

## COIN TOSS

- Winner sees 3 random Torch Cards (weighted Bronze/Silver, no Gold) and picks 1 for free OR receives ball at the 50
- Loser takes whatever winner didn't pick
- **Halftime:** Coin toss LOSER sees 3 random Torch Cards and picks 1 for free OR receives at the 50

---

## GAME STRUCTURE

### Halves and Plays
- 2 halves, 20 plays per half outside the 2-minute drill
- Possessions alternate naturally: score → opponent gets ball at 50, turnover → opponent gets ball at turnover spot + return yards, 4th down failure → opponent gets ball at dead ball spot
- Both sides always go for it on 4th down

### Clock
**Outside 2-minute warning:** Plays are counted, no real clock.

**2-minute warning (end of each half):** 2:00 on the clock.
- Run / completed pass: 25-30 seconds
- Sack: 20 seconds
- Incomplete pass: 5 seconds (clock stops)
- Spike: 3 seconds (clock stops, 0 yards, no card played)
- Kneel: 30 seconds (0 yards, available to either side when leading)
- Timeouts: only exist as Torch Cards

**2-minute drill UX:** SNAP button splits into three options: SNAP / SPIKE / KNEEL. Spike always available. Kneel only available when you have the lead.

---

## SCORING

### Touchdowns
Score a TD (6 points), then choose:
- **Extra Point (1 pt)** — automatic, free
- **2-Point Conversion (from the 5)** — play a full snap
- **3-Point Conversion (from the 10)** — play a full snap, harder
- Conversion always happens regardless of clock

### Safeties
- If a sack or negative run puts the ball behind your own goal line = **safety**
- 2 points for the defense
- Offense kicks off — opponent gets ball at the 50

### Ball Placement After Events
- **After a score:** opponent receives at the 50
- **After a safety:** opponent receives at the 50
- **Failed 4th down (incomplete):** opponent gets ball at the line of scrimmage
- **Failed 4th down (stuffed run):** opponent gets ball at the dead ball spot
- **Interception:** opponent gets ball at the spot of the catch + return yards
- **Fumble recovery:** opponent gets ball at the spot of recovery + return yards

### Turnover Returns
When a turnover happens, roll return yards:
- Base return: random 0-15 yards
- Featured defender OVR: +1 yard per 5 OVR above 75
- SPEED_LINES or CLEAT badge: +5-10 return yards
- HELMET or BRICK badge: +0-3 return yards
- TO THE HOUSE Torch Card: automatic TD
- Return cannot exceed the end zone — if it does, it's a defensive touchdown

---

## THE SNAP SEQUENCE

### Building Your Combo (right panel)
1. See your 4 player cards and 5 play cards
2. Tap a player card, tap a play card (any order)
3. Optionally tap a pre-snap Torch Card
4. Cards shrink into combo preview bar (play on top, player below)
5. SNAP button in the combo bar, pulses when ready
6. Tap different card of same type to swap
7. One pre-snap Torch Card max per snap

### The Clash (field side)
1. **Cards reveal:** Your combo at the line, AI combo flips face-up
2. **Play develops:** All 14 dots animate top-down All-22 view. Featured players glow with trail. Duration matches the play (slant = 1.5s, go route = 3-4s, sack = <1s)
3. **Result:** Big text explodes TRUE CENTER of screen
4. **Torch Card triggers** (if attached)
5. **Reactive Torch Card window** (if you have one and it applies)
6. **Narrative collapses** to 2-line bottom bar:
   - Line 1: play description with featured player
   - Line 2: point breakdown
7. Points fly to persistent counter
8. Tap to continue

### Right Panel During Clash
- Fades to 15% opacity
- Field stays same size

---

## HAND MANAGEMENT

### Play Cards
- Team playbook = 10 plays (drafted from)
- Start with 5 in hand
- Play a card → goes back to playbook, draw random replacement from the 5 NOT in your hand (no duplicates possible without Torch Card)
- **Discard (once per drive):** throw away a card without playing, draw replacement
- You always have 5 cards in hand

### Torch Cards
- Single use, burned when played
- 3 slots, any combination of pre-snap and reactive
- Duplicates allowed
- One pre-snap card per snap, one reactive card per snap (max 2 per snap)
- Cannot stack multiple pre-snap cards on same play

### Torch Card Types
**PRE-SNAP:** Attached before SNAP. Most cards.
**REACTIVE:** Held in reserve, played AFTER seeing result. Opponent can see you have one but not which. Cards: SURE HANDS, CHALLENGE FLAG, FLAG ON THE PLAY, MEDICAL TENT.

---

## COMBO SYSTEM

### Your combo (offense):
- **Play card** → base matchup result vs defense
- **Featured player** → their badge combos if it matches. Their OVR affects position-relevant checks.
- **Torch Card (optional)** → stacks on top
- **All bonuses stack when football logic supports it**

### Position-Relevant OVR (passive, every snap):
**Pass plays:**
- QB OVR: every 5 above 75 = +2% completion, -1% sack rate
- 🏈 FOOTBALL badge: +1 yard on SHORT/QUICK/SCREEN, +2-3 on DEEP (all passes)
- Featured WR/TE/RB target OVR: every 5 above 75 = +0.5 mean yards

**Run plays:**
- RB/FB OVR (ball carrier): every 5 above 75 = +0.5 mean yards
- QB OVR on OPTION plays: every 5 above 75 = +0.5 yards (read execution)

**Defense:**
- LB OVR: every 5 above 75 = -0.5 yards on opponent runs
- Best CB OVR: every 5 above 75 = -1% opponent completion
- Safety OVR: every 5 above 75 = +0.5% INT rate on deep passes

### Badge Combo Rules
- OPTION counts as RUN for all badge triggers
- Offensive badges trigger when play type matches
- **Defensive badges have dual triggers:** fire if your defensive card type matches OR if the opponent's play type matches
- PADLOCK triggers on any man coverage component (Cover 0, Cover 1, Man Free, Press Man, Bracket, A-Gap Mug)
- SPEED_LINES triggers on both BLITZ and PRESSURE defensive cards
- FOOTBALL (QB) triggers on ALL pass plays (smaller bonus on short, bigger on deep)
- CLEAT triggers on QUICK passes, SCREENS, outside runs (ROCKET TOSS, ZONE READ), and OPTION
- FLAME triggers on 3rd down, 4th down, AND conversion attempts (2-pt and 3-pt). All "must-convert" snaps.
- Conflicting combos (offense +3, defense -2) simply net (+1)

### Play History (bonuses stack)
- 1 pass → run: +0
- 2 passes → run: +1
- 3+ passes → run: +3
- 1 run → pass: +0
- 2 runs → pass: +1
- 3+ runs → pass: +2
- 2+ runs → play-action: +4 (stacks with generic run→pass bonus)
- Same play 2x in a row: -2
- Same play 3x in a row: -5

### Red Zone Compression
- 20-11 yard line: deep routes capped at 20 yards, run variance -1
- 10-6 yard line: deep routes capped at 12, all means -1, completion +3%
- 5-1 yard line: all routes capped at field position, run means -2, QB Sneak mean +1

---

## PLAY RESULT CALCULATION

### Per snap (offense)
1. Check sack rate (pass plays only) → sack = random -4 to -10 yards
2. Check completion (pass plays) → incomplete = 0 yards, clock stops
3. Roll yardage from distribution (mean + all modifiers ± variance)
4. Check INT rate → INT = turnover + return yards
5. Check fumble rate → fumble = 50/50 recovery, if defense recovers = turnover + return yards
6. Apply all stacking bonuses: badge combos, Torch Card, play history, OVR modifiers
7. Apply red zone compression
8. Cap yards at distance to end zone (TD if exceeded)
9. Check for safety (if result puts ball behind own goal line)
10. Final result

### Blitz vs Run Rules
- Cover 0 blitzes (CORNER BLITZ, SAFETY BLITZ, DB BLITZ, BLITZ CALL): +3 mean yards for offense on RUN/OPTION plays (gaps abandoned)
- Zone blitzes (FIRE ZONE, ZONE BLITZ DROP): NO penalty vs runs (zone behind the rush)

### Press Man Rules
- SHORT/QUICK completion rate -8%
- DEEP pass plays +2 mean yards (clean release off press)

---

## DEFENSIVE CARD DUAL EFFECTS

Every defensive card has both pass AND run special effects:

Example format:
- **A-GAP MUG** — Pass: DEEP +3% sack rate, forces quick throws. Run: inside runs (DRAW, QB SNEAK, MIDLINE, ZONE READ) get -2 mean yards.
- **CORNER BLITZ** — Pass: sack rate doubled on DEEP. Run: +3 yards for offense (gap abandoned).
- **ROBBER** — Pass: MESH/SLANT/SHALLOW +4% INT. Run: no special effect.
- **GAP INTEGRITY** — Pass: +2 mean yards for offense (light rush). Run: ALL runs -3 mean, variance -2.

(Full dual effects to be added to TORCH-DEFENSIVE-CARDS spec)

---

## TORCH POINTS

### Offensive points (when you have the ball)
| Result | Points |
|--------|--------|
| 8+ yard gain | +30 |
| 4-7 yard gain | +10 |
| 1-3 yard gain | +0 |
| Incomplete pass | -5 |
| 0 or negative yards | -10 |
| Sack | -10 |
| Turnover (INT/fumble) | -25 |
| First down | +10 |
| Touchdown | +50 |
| 2-pt conversion made | +25 |
| 3-pt conversion made | +40 |
| Combo trigger | +10-15 |

### Defensive points (when opponent has the ball)
| Result | Points |
|--------|--------|
| Stop for 0 or less | +20 |
| Short gain 1-3 | +10 |
| Moderate gain 4-7 | +0 |
| Big gain 8-14 | -5 |
| Explosive 15+ | -15 |
| First down allowed | -10 |
| Sack | +25 |
| Forced turnover | +40 |
| TD allowed | -30 |
| 4th down stop | +30 |
| 2-pt/3-pt conversion stopped | +20 |
| Safety | +30 |

### Difficulty bonus
- Easy (streak 1-3): base points
- Medium (streak 4-7): +25%
- Hard (streak 8+): +50%

### Win/Loss
- Win the game: +100
- Lose: no bonus (can go negative from turnovers and big plays allowed)

---

## DIFFICULTY SCALING

### Streak-based
- Streak 1-3 = EASY
- Streak 4-7 = MEDIUM  
- Streak 8+ = HARD

| Aspect | Easy | Medium | Hard |
|--------|------|--------|------|
| AI featured player | Random | Smart badge match | Best counter (75% optimal, 25% random) |
| AI player OVR | -3 | Normal | +3 |
| AI combo triggers | Never | Sometimes (40%) | Always |
| AI play-calling | Basic situational filters | Situational filters loose | Situational filters strict (75% optimal counter, 25% scheme-weighted random) |
| AI tendency adaptation | None | Tracks last 2 plays | Tracks full drive |
| AI Torch Cards | 0, never buys | 1 Bronze start, buys 1 at Booster | 1 Silver start, buys 2 at Booster |
| AI Torch Card usage | Never | Reasonable moments | Optimal moments |
| TORCH point bonus | x1 | x1.25 | x1.5 |

### AI Situational Play Filters
**All difficulties** (including Easy) use basic football sense:
- QB SNEAK: only 3rd/4th and 2 or less
- FOUR VERTS / GO ROUTE: never on 3rd/4th and 2 or less
- BUBBLE SCREEN: never inside own 5

**Medium adds:**
- POWER / TRIPLE OPTION: weighted heavier short yardage
- PA POST / PA FLAT: weighted heavier after 2+ runs
- DRAW: weighted heavier after 2+ passes
- PREVENT: only protecting lead under 2 minutes

**Hard adds all Medium filters plus:**
- 75% chance of picking the optimal counter to your tendency
- 25% chance of picking from scheme-weighted random (prevents feeling robotic)
- Reads your full drive history for adaptation

### AI Kneeling Logic
AI kneels when: has the lead + 2-minute drill active + a kneel burns enough time to end the half.

---

## DRAMA CONTEXT SYSTEM

The narrative engine checks these factors and amplifies language:

| Factor | Trigger | Language |
|--------|---------|----------|
| Field position | Inside own 10 | "from deep in their own territory" |
| Down | 3rd or 4th | "must convert here" |
| Score | Trailing by one possession, 4th quarter | "this could be their last chance" |
| Clock | Under 30 seconds | "racing against the clock" |
| Conversion | 2-pt or 3-pt attempt | "everything rides on this snap" |
| Momentum | After turnover | "momentum has completely shifted" |
| Last play | Final snap of the half/game | "LAST PLAY" banner |
| Comeback | Trailing, scored to tie/take lead | "WHAT A DRIVE" |

Multiple factors stack for maximum drama.

---

## GAMEPLAY SCREEN LAYOUT (Landscape)

### Left 60% — The Field
- Horizontal field, yard lines, line of scrimmage, first down marker
- All 14 player dots, featured players glow with trail
- All-22 top-down play animation

### Right 40% — Your Hand
1. Player cards (2x2)
2. Play cards (rows)
3. Torch Card slot (only when you have one)
4. Combo preview bar (shrunk cards + SNAP/SPIKE/KNEEL)

### Top Bar — Scorebug (full width)
- Football score + quarter/clock + down & distance + TORCH points

### Bottom Bar — Narrative (full width, 2 lines)
- Line 1: play description
- Line 2: point breakdown

---

## INJURIES

### Probability
- Small chance on big-hit plays: sacks, stuffed runs, contested catches
- Not every snap, just violent ones

### Severity
- **Minor:** out 2-3 snaps, returns automatically
- **Moderate:** out rest of the half
- **Severe:** out rest of the game

### Handling
- Injured player can't be featured until healed
- Must sub from bench (2 bench players per side)
- Minor injuries auto-heal after 2-3 snaps, original player returns
- MEDICAL TENT Torch Card revives any injury immediately

---

## WHAT'S NOT DEFINED YET
- Exact injury probability per play type
- Mini-Booster card pool weighting
- Head-to-head multiplayer structure
- Player progression / XP system
- Card variant system (Bronze → Silver → Gold → Diamond visual upgrades)
- Roguelike run structure (Product B)
- Season/streak persistence between games
- Share card design
- Tutorial / how to play flow
