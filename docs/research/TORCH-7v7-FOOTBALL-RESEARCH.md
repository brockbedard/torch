# TORCH 7v7 Football Research
## Formations, Alignments, and Route Concepts for the TORCH Hybrid Format

**Date:** March 24, 2026
**Purpose:** Get the real football right before building field animations. This document defines exactly how 14 dots should line up and move on TORCH's canvas field.

---

## 1. The Real 7v7 Landscape

### Standard Competitive 7v7 (Pass-Only)
The dominant format used in high school development leagues, Pylon Football, and USA Football tournaments:

- **Personnel:** QB + center + 5 receivers on offense. 7 defensive backs on defense.
- **No linemen.** No blocking. No rushing the passer.
- **No running.** Pass-only. QB has a 4-second throw clock.
- **Field:** 40–50 yards long, 25–30 yards wide. End zones 10 yards deep.
- **First downs:** Cross the 25 and the 10. Three downs per set.
- **Coverages seen:** Overwhelmingly man-to-man (because 5v5 or 4v4 in coverage doesn't leave enough defenders for zone). Cover 1, Cover 2 Man Under, and occasional Cover 3 zone.
- **Key insight:** With no pass rush and no run game, defenses live and die on man coverage. Rub/pick plays and bunch formations dominate because they create natural picks on man defenders.

### USA Football Rookie Tackle (7-Player Tackle)
**This is TORCH's direct ancestor.** USA Football designed a 7-player tackle format with linemen, rushing, and real football — scaled down from 11. Key rules:

- **Offense:** 3 OL required (center + 2 guards). 4th player must be on the line of scrimmage (TE or split end). QB can be under center, pistol, or shotgun. **Rushing is allowed.** Guards in 2-point stance. Max 1-yard splits between C and G.
- **Defense:** Only 2 DL allowed (3 if offense has a tight end). DL must align head-up or outside shade on guards. **No A-gap penetration on the snap.** No blitzing — LBs/DBs can flow to the ball after a handoff but cannot predetermine gap penetration. One defender must be 10+ yards deep. Remaining 4 must be 4+ yards off the LOS unless covering a TE/split end.
- **Field:** 40 × 35⅓ yards (two games fit on one regulation field). All possessions start at the 40.
- **No trips formations allowed** (no 3 players outside the guard box on the same side).
- **No QB sneaks** (because defense can't align over center or in A-gap).
- **Turnovers blown dead immediately** — no returns.

---

## 2. TORCH Hybrid Format — How It Maps

TORCH takes the Rookie Tackle skeleton and adds back enough real football to make coverage schemes matter. Here's the TORCH-specific adaptation:

### Offense: 3 OL + QB + 3 Skill = 7

| Slot | Position | Role | Notes |
|------|----------|------|-------|
| 0 | QB | Passes, hands off, can scramble | Shotgun or pistol |
| 1 | RB/FB | Ball carrier, chip blocker, receiver out of backfield | Sits behind or beside QB |
| 2 | WR1 | Primary outside receiver | Split wide left or right |
| 3 | WR2/TE/Slot | Second receiver or inline blocker | Can align tight, slot, or wide |
| 4 | LG | Left guard — blocks, cannot receive | 2-point stance |
| 5 | C | Center — snaps, blocks, cannot receive | On the ball |
| 6 | RG | Right guard — blocks, cannot receive | 2-point stance |

**The 3 skill players can be any mix of WR, RB, TE, or slot.** This is what creates formation variety — same 7 bodies, different alignments.

### Defense: 3 DL + 4 Secondary = 7

| Slot | Position | Role | Notes |
|------|----------|------|-------|
| 7 | DE (weak) | Edge rusher / contain | Aligns outside shade on guard |
| 8 | DT/NT | Interior rush / gap control | Head-up on center or shade |
| 9 | DE (strong) | Edge rusher / contain | Outside shade on guard |
| 10 | LB | Run fill, short zone, man on RB/TE | 4–5 yards off LOS |
| 11 | CB1 | Covers WR1 in man or zone | At depth or pressed |
| 12 | CB2 | Covers WR2/slot in man or zone | At depth or pressed |
| 13 | S (Free Safety) | Deep middle, last line of defense | 10+ yards off LOS |

**With only 4 secondary players covering 3 eligible receivers + QB scramble, coverage is TIGHT.** Every defender matters. This is why coverage scheme choice is the core puzzle of TORCH.

---

## 3. Offensive Formations (TORCH 7v7)

These are the formations that work with 3 OL + QB + 3 skill. Each describes where the skill players align relative to the OL. The OL stays constant: LG–C–RG in tight splits (≤1 yard).

### 3A. Shotgun 2×2 (Deuce)
The balanced spread look. Two receivers to each side.

```
WR1 ·····  LG  C  RG  ····· WR2
                  QB
              RB
```

- **Personnel:** 2 WR split wide, RB in backfield beside or behind QB
- **Strengths:** Balanced — can attack either side. Good for zone reads, draws, and play-action. Forces defense to be honest on both sides.
- **Run game:** Draw plays, zone reads (QB reads the DE), inside zone
- **Pass game:** Slant-arrow, smash, hitch concepts. Two-level reads to either side.
- **Real-world analog:** Modern spread offense base look (Oklahoma, Ohio State)
- **TORCH use:** Default "balanced" formation. Good all-purpose starting formation.

### 3B. Trips (3×1)
Three receivers to one side, isolating one receiver backside.

```
WR1 ·····  LG  C  RG ····· WR2
                              SLOT
                  QB
```

No RB in backfield (empty trips) OR:

```
WR1 ·····  LG  C  RG ····· WR2
                              SLOT
                  QB
              RB
```

- **Personnel:** 3 skill players to one side. Can be WR+WR+Slot, or WR+TE+Slot.
- **Strengths:** Overloads one side of the defense. Forces defensive rotation. Creates 3-on-2 or 3-on-3 matchups to the trips side.
- **Run game:** Jet sweep to trips side, zone read away from trips, QB draw
- **Pass game:** Flood concepts (3 levels: flat/out/vertical), smash-seam, mesh-cross
- **Coverage stress:** Against Cover 3, the trips side attacks the flat defender and corner simultaneously. Against man, bunch/stack alignments within trips create rub/pick opportunities.
- **Real-world analog:** Air Raid trips (Mike Leach, Lincoln Riley)
- **TORCH use:** The "Air Raid" formation. Canyon Tech / Stags identity formation.

### 3C. Twins (2×1 Open)
Two receivers to one side, one receiver to the other. No tight end.

```
WR1 ·····  LG  C  RG ····· WR2
                              SLOT
                  QB
              RB
```

- **Personnel:** Similar to trips but with a 2-1 split instead of 3-0.
- **Strengths:** More balanced than trips while still creating a strong side. The RB is a legitimate run threat AND outlet receiver.
- **Run game:** Power, toss, zone read
- **Pass game:** Slant-wheel, comeback-vertical, post-corner
- **Real-world analog:** Pro-style spread (Georgia, Alabama)
- **TORCH use:** Versatile formation. Good for teams with a dual-threat RB.

### 3D. Tight Bunch
Three skill players clustered tight to one side, within 2–3 yards of each other.

```
WR1 ·····  LG  C  RG · TE · WR2 · SLOT
                  QB
```

Or with RB:

```
          LG  C  RG · [WR2 · SLOT · TE] ← bunch
                  QB
              RB
WR1 ← iso backside
```

- **Personnel:** 3 receivers stacked/bunched within ~3 yards. The tight clustering makes it nearly impossible for man defenders to sort out who's going where.
- **Strengths:** DESTROYS man coverage. Natural rub/pick routes on every snap. Forces zone or bracket coverage.
- **Run game:** Sweep behind bunch blockers, H-across sweep, shovel pass
- **Pass game:** Flood out of bunch, smash-seam, throwback to isolated backside WR, dagger (seam + dig)
- **Real-world analog:** NFL bunch concepts (Kyle Shanahan, Sean McVay)
- **TORCH use:** The "man coverage killer." When defense plays man, call bunch.

### 3E. I-Form / Pistol (Under Center / Pistol with RB behind)
Power running formation with QB closer to center.

```
WR1 ·····  LG  C  RG ····· WR2
              QB
              RB
```

- **Personnel:** QB under center or in pistol (2–3 yards back). RB directly behind QB. Two WRs split wide.
- **Strengths:** Strong run game identity. Play-action is devastating because the defense must respect the run. OL fires forward in run blocking.
- **Run game:** Power, inside zone, draw, toss, QB sneak (if allowed), option
- **Pass game:** Play-action vertical shots, waggle (QB rollout), screen
- **Real-world analog:** Triple option / power run (Army, Navy, Georgia Tech — or power I like classic Nebraska)
- **TORCH use:** Iron Ridge / Wolves identity formation. "CONTROL THE LINE."

### 3F. Empty (No RB)
All 3 skill players split out as receivers. No one in the backfield.

```
WR1 · SLOT ·····  LG  C  RG ····· WR2
                     QB (alone)
```

Or spread all 3:

```
WR1 ·····  LG  C  RG ····· WR2
                  QB
SLOT (motion or slot side)
```

- **Personnel:** QB alone in backfield. All 3 skill players are receivers. Maximum passing threat.
- **Strengths:** 3 receivers vs 4 defenders in coverage creates stress points everywhere. Quick passes, mesh concepts, vertical stretches. If defense overplays pass, the QB can draw/scramble.
- **Run game:** QB draw only (no RB to hand off to). Receiver sweeps via shovel/jet motion.
- **Pass game:** Smash-seam, mesh, dagger, verticals, flood. Full route tree available to all 3 receivers.
- **Real-world analog:** Air Raid empty (Texas Tech), modern RPO empty sets
- **TORCH use:** Desperation / comeback formation. Also good for 2-minute drill.

---

## 4. Defensive Alignments (TORCH 7v7)

With 3 DL + LB + 2 CB + S, the defense has limited bodies to cover everything. Alignment + coverage scheme = the defensive "play call."

### 4A. 3-1-2-1 (Base)
The default alignment. DL on the line, LB at 5 yards, CBs at 7 yards, S deep at 10+.

```
        DE    DT    DE          ← line of scrimmage
              LB                ← 5 yards
       CB              CB      ← 7 yards
              S                 ← 10-12 yards
```

- **Coverages available:** Cover 1 (man-free), Cover 3 (zone), Cover 2 (two-deep split)
- **Run defense:** LB fills gaps, DL holds point of attack, S comes down in run support
- **Strengths:** Balanced. Can play man or zone. LB is a wild card — can blitz, spy QB, or drop into coverage.

### 4B. 3-1-1-2 (Two-High / Cover 2 Look)
Split the safety into two deep halves. Creates a Cover 2 shell.

```
        DE    DT    DE          ← line of scrimmage
              LB                ← 5 yards
              CB                ← 7 yards (slot)
       S                S      ← 10-12 yards (halves)
```

- **Coverage:** Cover 2 zone (CBs play flat/underneath, safeties play deep halves) or Cover 2 Man Under
- **Run defense:** Weaker — only LB and DL in the box. S must come down late.
- **Weakness:** The seam (between the two deep safeties) and the deep middle are vulnerable. Corner routes behind the flat-playing CB.
- **Strengths:** Takes away deep outside throws. Forces offense to work the middle of the field.

### 4C. 3-0-3-1 (Three-Under / Cover 3 Look)
No true LB. All 4 secondary players play coverage — 3 underneath, 1 deep.

```
        DE    DT    DE          ← line of scrimmage
     CB       LB         CB    ← 5-7 yards (flat/hook zones)
              S                 ← 12+ yards (deep middle)
```

- **Coverage:** Cover 3 — three underneath zones (flats + hook/curl), one deep middle third. OR the two CBs play man on WRs while LB covers flat/RB.
- **Run defense:** Vulnerable — no dedicated LB. CBs must be willing run defenders.
- **Weakness:** Flat routes, crosses underneath. The 3 underneath defenders are spread across the whole field.
- **Strengths:** Good deep coverage. Hard to throw over the top.

### 4D. 3-1-3-0 (Press / All-Out Man)
All 4 secondary players press up. No deep safety. Maximum aggression.

```
        DE    DT    DE          ← line of scrimmage
              LB                ← 3-4 yards
  CB          ·           CB    ← pressed on WRs at LOS
              NB                ← on slot/RB
```

- **Coverage:** Pure man-to-man. LB spies QB or covers RB. No safety help.
- **Run defense:** Strong — everyone is close to the LOS.
- **Weakness:** ONE missed assignment = touchdown. No safety net over the top. Deep routes with any separation are house calls.
- **Strengths:** Blankets short/intermediate routes. Forces QB to hold the ball. Creates pressure through man coverage.
- **TORCH note:** This is Cover 0 in your existing system. The ultimate gamble.

### 4E. 3-2-1-1 (Nickel / Extra LB)
Pull a CB and add a second LB for run support.

```
        DE    DT    DE          ← line of scrimmage
         LB         LB         ← 4-5 yards
              CB                ← 7 yards
              S                 ← 10+ yards
```

- **Coverage:** Cover 1 robber (one LB drops, one covers TE/RB, CB on WR, S deep). Or zone match.
- **Run defense:** Strong — two LBs in the box means 5 in the box total.
- **Weakness:** Only one CB covering the perimeter. If offense goes 3-wide, someone is in a mismatch.
- **TORCH note:** Good call against run-heavy teams (Iron Ridge / Wolves). Bad against spread.

---

## 5. Route Concepts That Work in 7v7

These are passing concepts specifically effective in 7v7 because they create conflicts with limited defenders. Each concept is described by its read progression and what coverage it attacks.

### Quick Game (1-step / catch-and-throw)

| Concept | Routes | Beats | Why it works in 7v7 |
|---------|--------|-------|---------------------|
| **Slant-Arrow** | WR1: slant, WR2: arrow (flat) | Man coverage, Cover 3 | Quick release beats press. Arrow is open vs off-man. Creates high-low on flat defender. |
| **Hitch** | Both WRs: 5-yard hitch | Cover 2, Cover 4, soft zone | Sit in the window between CBs and S. Quick and safe. |
| **Quick Out** | WR: 5-yard speed out | Off-man, Cover 3 | Gets the ball to the sideline fast. Hard to defend without press. |

### Intermediate (3-step / developing)

| Concept | Routes | Beats | Why it works in 7v7 |
|---------|--------|-------|---------------------|
| **Smash** | WR: hitch, TE/Slot: corner | Cover 2 (the classic Cover 2 beater) | Flat defender can't cover both the hitch and corner. |
| **Flood** | Flat, out, vertical on the same side | Cover 3 zone | Three levels overwhelm the two defenders responsible for that side in Cover 3. |
| **Mesh** | Two receivers cross at 5–6 yards | Man coverage | Crossing routes create natural picks. Most effective out of bunch. |
| **Smash-Seam** | WR: hitch, Slot: seam up the hash | Cover 2 | Attacks the hole between the two safeties. |
| **Drive** | Shallow cross + basic cross at 12 | Man coverage | Deep cross picks the defender off the shallow runner. |
| **Dagger** | Seam + dig (8–10 yard in-cut) | Cover 3, Cover 1 | Seam holds the deep middle defender, dig sits underneath. |

### Deep Shots (play-action / max protect)

| Concept | Routes | Beats | Why it works in 7v7 |
|---------|--------|-------|---------------------|
| **Comeback-Vertical** | WR: comeback, Slot: vertical seam | Cover 1 (man-free) | QB reads the single high safety — if S drifts to the seam, throw comeback; if S stays middle, throw seam. |
| **Post-Corner** | WR1: post, WR2: corner | Cover 2, Cover 3 | Post holds safety, corner goes behind. Classic 2-man route combo. |
| **Verticals (4 Verts scaled to 3)** | All 3 receivers run vertical | Cover 3 (attack the seams) | With 3 verticals, the single safety can't cover all 3. One seam is always open. |
| **Post-Wheel** | Slot: post, RB: wheel out of backfield | Man, Cover 1 | The wheel route out of the backfield is extremely hard to cover in man. |

### Run-Pass Options (RPOs)

| Concept | Run Component | Pass Component | Read |
|---------|---------------|----------------|------|
| **Zone Read RPO** | RB zone run | Slot: bubble/quick out | QB reads the DE/LB — if they crash, throw; if they widen, hand off |
| **Draw RPO** | RB draw fake | WR: vertical | QB fakes draw, reads safety — if S bites on run, throw deep |
| **Power RPO** | RB power run | Slot: slant | QB reads the backside LB — if LB fills the box, throw slant |

---

## 6. Run Plays That Work in TORCH's 7v7

With only 3 OL, the run game is inherently limited. But that limitation is what makes the PLAY CALL matter — running into the wrong front is a disaster.

| Play | OL Action | RB Path | QB Action | Works Against | Struggles Against |
|------|-----------|---------|-----------|---------------|-------------------|
| **Inside Zone** | All step playside, combo blocks | Presses LG/C hip, reads DT block, cuts back or continues | Hands off, fakes keeper | Light boxes (Cover 2/4), spread-out D | Stacked box, 3-2-1-1 nickel |
| **Power** | LG pulls, C/RG drive block | Follows pulling guard through B-gap | Under center, hands off | Man coverage (fewer defenders in box) | Blitz, extra LB looks |
| **Draw** | Pass set initially, then fire out | Delays, then takes handoff | Drops back 2 steps, hands off | Aggressive pass rush, Cover 0/1 blitz | Patient defense, zone drops |
| **Toss/Sweep** | C/RG block down, LG pulls | Catches toss, bounces outside | Tosses to RB, fakes boot | Cover 3 (weak flat support), soft edges | DE contain, aggressive CB |
| **Zone Read** | Zone step playside | Takes handoff or lets QB keep | Reads backside DE — give or keep | Aggressive DEs who crash | Patient DEs who squeeze |
| **QB Draw** | Pass set, lets rush go by | Blocks/releases as receiver | Drops back, tucks, runs | Cover 0/1, max coverage looks | Spy LB, gap integrity |

---

## 7. How Coverages Map to TORCH's Existing System

Here's how the real coverage concepts from this research map to the coverage names already in TORCH's game engine:

| TORCH Coverage | Real Equivalent | DL Action | Secondary | Weak Against | Strong Against |
|----------------|-----------------|-----------|-----------|--------------|----------------|
| Cover 0 | 3-1-3-0 press man, no safety | Rush hard | All man, no deep help | Deep routes, posts, any separation = TD | Short routes, screens (if QB pressured) |
| Cover 1 | 3-1-2-1 man-free | Standard rush | Man under, S plays deep middle | Crosses, mesh, rub/pick routes, screens | Deep balls (S helps over top), isolations |
| Cover 2 | 3-1-2-1 two-high shell | Standard rush | CBs play flat, S split deep halves | Seam, corner routes, deep middle | Outside deep throws, flat routes |
| Cover 3 | 3-0-3-1 three-under | Rush 3 | 3 underneath zones, S deep third | Flat routes, crosses, flood concepts | Deep throws, verticals (3 deep zones) |
| Cover 4 | 3-1-1-2 quarters | Contain rush | 4 across in quarter zones | Short routes, runs, screens (soft underneath) | Deep routes, 4 verts (each S takes a quarter) |
| Man Free | 3-1-2-1 with LB in coverage | Standard rush | Man on all 3 receivers, LB on RB, S free | Motion/rubs, bunch, crosses | Isolated routes where defender can trail |

---

## 8. Formation-to-Formation Matchups — What Creates Drama

The heart of TORCH's strategic puzzle is: **your formation + play call vs their alignment + coverage.** Here are the matchups that create the most interesting tension:

| Offensive Formation | Best Against | Worst Against | Why |
|--------------------|-------------|---------------|-----|
| Shotgun 2×2 | Cover 3 (balanced attack) | Press man (no bunch to create rubs) | Balanced but predictable. No built-in man beaters. |
| Trips | Cover 2 (flood the trips side) | Cover 1 robber (extra defender reads trips) | Overloads one side but tips your hand directionally. |
| Bunch | Man coverage (natural picks) | Cover 3/4 zone (picks don't matter in zone) | Built to beat man. Wasted against zone. |
| I-Form/Pistol | Cover 2/4 (light box, run at them) | Cover 0 blitz (they're selling out to stop the run) | Power running thrives against soft fronts. |
| Empty | Cover 0/1 (3 receivers vs 4 in coverage) | Cover 4 (4 deep defenders match 3 receivers) | Maximum pass threat, zero run threat. |

---

## 9. Recommendations for TORCH Field Animation

Based on this research, here's what the field renderer needs to accurately represent:

### Formation Positions (in xPct from left sideline, yards from LOS)

**Shotgun 2×2 (Deuce):**
- WR1: (0.08, 0) — wide left
- LG: (0.42, 0)
- C: (0.50, 0)
- RG: (0.58, 0)
- WR2: (0.92, 0) — wide right
- QB: (0.50, -4) — 4 yards behind center
- RB: (0.55, -6) — offset right behind QB

**Trips Right:**
- WR1: (0.08, 0) — isolated backside
- LG: (0.42, 0)
- C: (0.50, 0)
- RG: (0.58, 0)
- WR2: (0.80, 0) — trips outside
- SLOT: (0.72, -1) — trips middle (off LOS)
- QB: (0.50, -4)

**Tight Bunch Right:**
- WR1: (0.08, 0) — iso backside
- LG: (0.42, 0)
- C: (0.50, 0)
- RG: (0.58, 0)
- TE: (0.65, 0) — tight to RG (on LOS)
- WR2: (0.70, -1) — stacked behind TE
- QB: (0.50, -4)

**I-Form / Pistol:**
- WR1: (0.08, 0) — wide left
- LG: (0.42, 0)
- C: (0.50, 0)
- RG: (0.58, 0)
- WR2: (0.92, 0) — wide right
- QB: (0.50, -2) — pistol depth
- RB: (0.50, -5) — directly behind QB

**Empty Spread:**
- WR1: (0.05, 0) — wide left
- SLOT: (0.25, -1) — left slot
- LG: (0.42, 0)
- C: (0.50, 0)
- RG: (0.58, 0)
- WR2: (0.95, 0) — wide right
- QB: (0.50, -5) — alone, deep shotgun

### Defensive Alignment Positions

**Base 3-1-2-1:**
- DE1: (0.35, 1) — outside shade LG
- DT: (0.50, 1) — head-up on C
- DE2: (0.65, 1) — outside shade RG
- LB: (0.50, 5) — middle, 5 yards deep
- CB1: (0.10, 7) — over WR1
- CB2: (0.90, 7) — over WR2
- S: (0.50, 12) — deep middle

**Two-High (Cover 2 shell):**
- DE1: (0.35, 1)
- DT: (0.50, 1)
- DE2: (0.65, 1)
- LB: (0.50, 5)
- CB1: (0.15, 5) — playing flat/underneath
- CB2: (0.85, 5) — playing flat/underneath
- S1: (0.30, 12) — deep left half
- S2: (0.70, 12) — deep right half

*(Note: In this alignment, the S splits into two, so one of the LB/CB/S slots doubles as the second safety. TORCH's 7 defensive dots can represent this by reassigning the S and a CB.)*

**Press Man (Cover 0):**
- DE1: (0.35, 1)
- DT: (0.50, 1)
- DE2: (0.65, 1)
- LB: (0.50, 3) — spy / robber
- CB1: (0.09, 0.5) — pressed on WR1 at LOS
- CB2: (0.91, 0.5) — pressed on WR2 at LOS
- S: (0.50, 5) — no deep help, playing the slot/RB

### OL Movement by Play Type

| Play Type | OL Action | Visual Cue |
|-----------|-----------|------------|
| Pass (dropback) | Kick-step backward, mirror DL laterally | Dots retreat slightly, spread to match rush |
| Run (zone) | All 3 step playside in unison, combo blocks | Dots flow laterally as a unit |
| Run (power) | LG pulls across, C/RG drive forward | One dot loops behind the others |
| Screen | Initial pass set, then release downfield | Dots first retreat, then push forward to lead-block |
| Draw | Pass set initially, then fire out | Dots fake retreat, then explode forward |

### DL Movement by Situation

| Situation | DL Action | Visual Cue |
|-----------|-----------|------------|
| Pass rush | DEs attack edges, DT bull-rushes center | Dots converge toward QB position |
| Run defense (strong) | Hold gaps, squeeze the ball carrier | Dots hold position or push backward (offense can't move them) |
| Run defense (weak) | Washed out by OL blocks | Dots get pushed laterally or backward |
| Stunts | DEs/DT cross paths pre-snap | Dots swap positions as they rush |

---

## 10. Key Takeaways for TORCH

1. **TORCH's format has a real-world analog.** USA Football's Rookie Tackle 7-player format uses the exact same 3 OL structure. This isn't made-up game design — it's a real, tested format.

2. **6 core offensive formations cover the space.** Shotgun 2×2, Trips, Twins, Bunch, I-Form/Pistol, and Empty give enough variety without overwhelming players. Each formation has a distinct visual identity on the field and a distinct strategic purpose.

3. **The OL always stays in the same tight cluster** (0.42, 0.50, 0.58 xPct). The visual variety comes from where the 3 skill players deploy — wide, slot, bunch, or backfield.

4. **Defensive variety comes from secondary depth, not DL movement.** The 3 DL are always at the LOS. The interesting variation is whether CBs are pressed or at depth, whether there's one safety deep or two, and whether the LB is in a box or dropped.

5. **Route concepts, not individual routes, are what beat coverages.** A slant by itself isn't a "Cover 3 beater." A slant-arrow *concept* (two routes working together to create a high-low read) is what attacks Cover 3's flat defender. TORCH's play cards should represent concepts, not isolated routes.

6. **Man coverage dominates 7v7.** With only 4 secondary players, there often aren't enough defenders to play zone effectively. This means bunch/rub plays are disproportionately powerful, and the defense's counter is press man with help over the top — which is exactly the Cover 1 / Cover 0 dynamic already in TORCH.

7. **The run game is limited but essential.** With only 3 OL, you can't run power blocking schemes with pulling guards easily. But inside zone, draws, and QB runs are all viable and keep the defense honest. The threat of the run is what makes play-action lethal.
