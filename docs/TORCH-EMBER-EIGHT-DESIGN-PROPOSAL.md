# TORCH Ember Eight — 8-Team Expansion Design Proposal

**Status:** Draft for review. April 14, 2026.
**Companion to:** `TORCH-EMBER-EIGHT-BIBLE.md` (lore source of truth).
**Purpose:** Synthesizes scheme research, naming research, and team-select UX research into a single design proposal for the 4→8 team expansion. Nothing in this document has been built yet. **No game code will change until the user approves this proposal.**

After approval, deliverable B = structured data files (per-team name pools, scheme specs, playbook outlines, counter-matrix module) staged for review before code.

---

## 1. Scope summary

The expansion takes TORCH from 4 to 8 teams in the live game. Every system that currently knows about 4 teams gets reworked to 8. Specifically:

- **8 distinct offensive schemes** (currently 4) — fresh research-grounded design from scratch
- **8 matching defensive philosophies**
- **8 fresh playbooks** (currently 4 × ~20 plays = 80 plays; new total = 160 plays, ~20 per team)
- **8 fresh rosters** (14 players per team = 112 players; currently 56)
- **8-team counter-matrix** (currently 4-team cycle: Boars > Serpents > Spectres > Wolves > Boars)
- **Tier ladder** lock-in (2 top / 4 middle / 2 bottom — bible-defined)
- **Team-select UI overhaul** (new mobile-first vertical hero carousel)
- **Bible-driven school name updates** in `teams.js` and `teamsSeason2.js` (merge into one)
- **All Season 2 lore** (Ghosts, towns, founding history) integrated into program-history reveal screen

This is a **production ship** target. Versioning: this is a **minor bump** (e.g., v0.38.0 → v0.40.0 or jump to v1.0 if it's the launch milestone).

---

## 2. The 8 schemes — locked

Each team gets one offensive scheme + one defensive philosophy. Schemes were designed to (a) be visually distinguishable in the field animator, (b) trace to a real college/NFL coaching tree the user can recognize, (c) form a balanced 8-team counter-matrix, and (d) match the team's bible identity.

### 2.1 Offensive schemes

Scheme names are stripped of coach references (no "Erhardt-Perkins," "Coryell," "Flexbone"). Lineage paragraphs still cite real coaches as the recognizable shorthand for *how* the scheme actually plays.

| Team | Scheme | Lineage | Run/Pass | Star archetypes |
|---|---|---|---|---|
| Ridgemont Boars | **Smashmouth Pro** | Harbaugh Stanford, early Saban Alabama, Joe Gibbs | 70/30 | Power RB + run-stopping LB |
| Vermont Maples | **Multiple** | Belichick, Walsh, Andy Reid | 45/55 | Cerebral TE + disguising FS |
| Hollowridge Spectres | **Spread Option** | Rich Rodriguez WVU, Urban Meyer, Dan Mullen | 60/40 | Dual-threat QB + boundary CB |
| Coral Bay Dolphins | **Vertical Pass** | Bobby Petrino, Dirk Koetter, Jimmy Johnson Miami | 40/60 | Alpha X-receiver + ball-hawking FS |
| Blackwater Serpents | **Triple Option** | Paul Johnson Navy/GT, Niumatalolo, early Osborne | 85/15 | Icy option QB + penetrating 3-tech DT |
| Helix Salamanders | **Air Raid** | Leach, Mumme, Lincoln Riley | 20/80 | Precision pocket QB + processing MLB |
| Larkspur Pronghorns | **Power Spread** | Gus Malzahn, Matt Rhule, Lincoln Riley OU, Matt Campbell | 65/35 | Athletic pulling guard + hybrid OLB/SS |
| Sacramento Raccoons | **Veer & Shoot** | Art Briles Baylor, Josh Heupel, Phil Longo | 50/50 (RPO-driven) | YAC slot WR + processing FS |

**Coral Bay note:** Petrino/Koetter style = pro-style vertical passing — quick game + deep shots, isolation routes, aggressive play-action. Less pure-vertical-tree than Coryell, more downfield-aggression than West Coast. Sticks Coral Bay's "transfer-portal misfit superstars" identity to a scheme that lets a 5-star X-receiver eat man coverage.

### 2.1.1 Offensive personnel (the 7 on the field)

3 OL slots are fixed across all teams (LG, C, RG). The 4 remaining slots = QB + 3 skill. Skill mix is what makes the schemes look different on the field.

| Team | OL | QB | Skill 1 | Skill 2 | Skill 3 | Personnel package | Base formation |
|---|---|---|---|---|---|---|---|
| Ridgemont Boars | LG, C, RG | Pocket QB | RB (power) | TE (Y, inline) | TE (F, H-back) | 12 Pro Heavy | I-Form / Pistol |
| Vermont Maples | LG, C, RG | Game-mgr QB | RB (balanced) | TE (move/Y) | WR (X, possession) | 11 ACE | Shotgun 2x1 |
| Hollowridge Spectres | LG, C, RG | Dual-threat QB | RB (zone-cut) | WR (X, vertical) | WR (slot, jet/RPO) | 11 Spread | Shotgun 2x1 |
| Coral Bay Dolphins | LG, C, RG | Strong-arm QB | RB (3rd-down) | WR (X, alpha) | WR (Z, deep threat) | 11 Pro | Shotgun, max splits |
| Blackwater Serpents | LG, C, RG | Option QB | FB (inside dive) | Slot/Wing (H, perimeter) | WR (split end) | 21 Triple-Option | Under-center / Pistol |
| Helix Salamanders | LG, C, RG | Precision QB | RB (pass-catch) | WR (X, route IQ) | WR (slot, mesh) | 11 Spread | Shotgun (flex to 10 Empty) |
| Larkspur Pronghorns | LG, C, RG | RPO QB | RB (one-cut) | H-back (move TE) | Slot WR | 11/12 Pistol | Pistol 2x1 |
| Sacramento Raccoons | LG, C, RG | Quick-process QB | RB (zone) | WR (X, vertical) | Slot WR (YAC) | 11 Spread | Shotgun, extreme splits |

### 2.2 Defensive philosophies

Defense names simplified to 1-2 words each — distinctive without overlap:

| Team | Defense | Base shell | Signature concepts |
|---|---|---|---|
| Ridgemont | **Cover 3** | Cover 3 Match | Under Front, Cover 3 Buzz, Cover 1 Hole |
| Vermont | **Disguise** | Cover 4 Match | Two-high disguise, Simulated Pressures (Creepers), Tampa 2 |
| Hollowridge | **Robber** | Cover 1 Robber | Robber, Simulated Fire Zone, Press Man |
| Coral Bay | **Press Man** | Cover 0 / Cover 1 Hole | Cover 0, Cover 1 Hole, 3-deep 4-under fire zone |
| Blackwater | **Gap Control** | 3-4 Cover 3 Match | Single-high, slant fronts, gap exchange |
| Helix | **Bend Don't Break** | Tampa 2 / Cover 6 | Simulated Drop-8, Cover 6, Tampa 2 |
| Larkspur | **Pattern Match** | Rip/Liz Match | Cover 4 Match, Sink Check, Rip/Liz Match |
| Sacramento | **Flyover** | Tampa 2 from 3-safety | Cover 3 Cloud, Creepers, 3-safety zone |

### 2.2.1 Defensive personnel (the 7 on the field)

3 DL slots are fixed across all teams. The 4 remaining slots = 1 LB + 3 secondary. The secondary mix (CB-vs-S balance) is what differentiates the defenses on the field.

| Team | DL | LB | DB 1 | DB 2 | DB 3 | Secondary mix |
|---|---|---|---|---|---|---|
| Ridgemont Boars | DE, NT, DE (run-stuffers) | MLB (downhill) | CB (boundary) | SS (run-support, in box) | FS (deep middle) | 1 CB + 2 S — built to stop the run |
| Vermont Maples | DE, NT, DE (balanced) | LB (coverage MLB) | CB | SS (disguise) | FS (centerfielder) | 1 CB + 2 S — disguise pre-snap |
| Hollowridge Spectres | DE, 3-tech DT, DE (penetrating) | LB (robber) | CB (press) | CB (press) | FS (deep middle) | 2 CB + 1 S — press-man heavy |
| Coral Bay Dolphins | DE, DT, DE (athletic edge) | LB (man on RB/TE) | CB (man) | CB (man) | FS (ball hawk) | 2 CB + 1 S — Cover 0 / man pressure |
| Blackwater Serpents | DE, 3-tech DT (penetrator), DE | LB (pursuit MLB) | CB | SS (run-fit) | FS | 1 CB + 2 S — gap-control + pursuit |
| Helix Salamanders | DE, NT, DE (drop-eligible) | LB (zone-drop, range) | CB | SS | FS (rangy) | 1 CB + 2 S — Drop-5 zone flood |
| Larkspur Pronghorns | DE, DT, DE (athletic) | OLB/SS hybrid (overhang) | CB | CB | FS (split-field reader) | 2 CB + 1 S — Pattern Match Quarters |
| Sacramento Raccoons | DE, NT, DE (push-pocket) | LB (zone-drop) | CB (boundary) | SS | FS (3rd safety high) | 1 CB + 2 S — 3-Safety Flyover |

**Why this set works:**
- Every philosophical corner of college football is represented: smashmouth pro, intellectual multiple, spread option, vertical pass, triple option, air raid, power spread, RPO veer-shoot
- Each lineage has a recognizable real-world coaching ghost (often dovetailing with the bible's actual ghost — e.g., Larkspur's power-spread = Reinhardt's signature; Helix's analytics-driven Air Raid = Marcus Chen-coded)
- No two schemes share the same primary identity (vertical pass owned by Coral Bay, quick-game pass owned by Helix, RPO pass owned by Sacramento — each gets its own lane)

### 2.2 Defensive philosophies

| Team | Defense | Base shell | Signature concepts |
|---|---|---|---|
| Ridgemont | 3-1-3 scaled 4-3 | Cover 3 Match | Under Front, Cover 3 Buzz, Cover 1 Hole |
| Vermont | Two-high disguise shell | Quarters Match | Cover 4 Match, Simulated Pressures (Creepers), Tampa 2 |
| Hollowridge | Attacking 3-1-3 (3-3-5 lineage) | Cover 1 Robber | Simulated Fire Zone, Press Man, Robber |
| Coral Bay | Athletic man pressure | Cover 0 / Cover 1 Hole | Cover 0, Cover 1 Hole, 3-deep 4-under fire zone |
| Blackwater | Gap-control 3-4 principles | Cover 3 Match | Single-high, slant fronts, gap exchange |
| Helix | Drop-8 (scaled to Drop-5) bend-don't-break | Tampa 2 / Cover 6 | Simulated Drop-8, Cover 6, Tampa 2 |
| Larkspur | Saban-style pattern match | Rip/Liz Match | Cover 4 Match, Sink Check, Rip/Liz Match |
| Sacramento | 3-Safety Flyover | Tampa 2 from 3-safety | Cover 3 Cloud, Creepers, 3-safety zone |

---

## 3. The counter-matrix — locked and verified

Verified balanced (every team has exactly 2 strong / 2 weak / 3 neutral) AND internally consistent (every "A strong vs B" has a matching "B weak vs A" — no broken edges).

| Attacker \ Defender | Ridge | Vmt | Hollow | Coral | Black | Helix | Lark | Sac |
|---|---|---|---|---|---|---|---|---|
| **Ridgemont** | — | STRONG | weak | – | weak | – | – | STRONG |
| **Vermont** | weak | — | – | STRONG | – | STRONG | weak | – |
| **Hollowridge** | STRONG | – | — | STRONG | weak | – | weak | – |
| **Coral Bay** | – | weak | weak | — | STRONG | – | – | STRONG |
| **Blackwater** | STRONG | – | STRONG | weak | — | weak | – | – |
| **Helix** | – | weak | – | – | STRONG | — | STRONG | weak |
| **Larkspur** | – | STRONG | STRONG | – | – | weak | — | weak |
| **Sacramento** | weak | – | – | weak | – | STRONG | STRONG | — |

**Edge logic (per matchup):**

- **Ridgemont strong vs Vermont, Sacramento** — Duo/Power overwhelms finesse Quarters and 3-safety light boxes. **Weak vs Hollowridge, Blackwater** — attacking 3-1-3 penetrates slow power; option clock-control keeps Ridgemont off the field.
- **Vermont strong vs Coral Bay, Helix** — Disguise shells bait Coryell verticals into INTs and muddy Air Raid pre-snap reads past the 4-sec clock. **Weak vs Ridgemont, Larkspur** — RPOs put Quarters safeties in conflict.
- **Hollowridge strong vs Ridgemont, Coral Bay** — Zone Read horizontally stretches rigid defense; dual-threat QB gashes man Cover 0/1. **Weak vs Larkspur, Blackwater** — Rip/Liz accounts for option geometry; more disciplined option keeps Spectres off field.
- **Coral Bay strong vs Blackwater, Sacramento** — Four Verts floods single-high; 1-on-1 athleticism overwhelms Flyover zones. **Weak vs Vermont, Hollowridge** — disguise + QB pressure.
- **Blackwater strong vs Ridgemont, Hollowridge** — Options neutralize read-and-react LB play. **Weak vs Coral Bay, Helix** — can't match scoring rate; Air Raid scores faster than 8-min option drives.
- **Helix strong vs Blackwater, Larkspur** — Mesh destroys Rip/Liz man-match with natural picks; Air Raid scores faster than option answers. **Weak vs Vermont, Sacramento** — disguise beats pre-snap reads; Drop-5 flood clogs shallow crossers.
- **Larkspur strong vs Vermont, Hollowridge** — RPO conflict puts Quarters safeties in bind; pattern match handles option. **Weak vs Helix, Sacramento** — Mesh breaks match rules; sideline splits mathematically break pattern match.
- **Sacramento strong vs Helix, Larkspur** — Flyover clogs crossers; extreme splits break pattern match geometry. **Weak vs Ridgemont, Coral Bay** — physically outmatched by power + size.

**Implementation note:** This replaces the current `COUNTER_PLAY` 4-team cycle in `src/data/teams.js`. New module shape: `COUNTER_MATRIX[teamId] = { strong: [id, id], weak: [id, id], neutral: [id, id, id] }`. Engine consumers in `snapResolver.js` and `aiOpponent.js` will need to update from the old `{strong, weak, neutral}` (single value each) to arrays.

---

## 4. 7-on-7 meta insights (informs play card design)

Research surfaced specific implications for our 3-OL + 1-LB-box format:

**Run game (only 3 OL — no tackles):**
- **GH Counter is the king run play** — backside guard pulls to kick, H-back wraps to LB. Perfect for 3 OL.
- **Buck Sweep needs modification** — TE becomes second puller (you can't pull both guards and leave the C alone vs 3 DL).
- **Inside Zone is weakened** — must be **Split Zone** (TE slice kicks DE) to work without tackles.
- **Midline / Veer thrive** — leave DEs unblocked, double-team the lone DT with 2 OL climbing to LB.
- **Counter GT and Power with FB don't translate cleanly.**

**Pass game (4-second throw clock + 1 LB box):**
- **Mesh / Snag / Stick / Shallow Cross dominate** — natural rubs gut a 1-LB defense.
- **Deep Dig (15-yd) and Deep Comeback are obsolete** — they take 3.5-3.8s to develop in real football, so any DB reroute = sack in our 4-sec world.
- **The passing meta is short / intermediate crossing** — that's the canonical 7-on-7 truth.
- **Glance RPO and Stick RPO are lethal** — 1 LB triggering downhill empties the entire intermediate middle.
- **Perimeter screen RPOs die** — no tackle hinge-block means the unblocked DE crushes the QB.

**Defensive design:**
- **Simulated Pressures (Creepers) are THE weapon** — DL drops to coverage, DB rushes, satisfying the "no pre-snap blitz" rule while wrecking QB timing.
- **Tampa 2 only works** if paired with a DL-drop (Simulated Drop-8) — otherwise the lone LB carrying the deep seam vacates underneath.
- **Rip/Liz and Cover 3 Match adapt cleanly** — single-high stays deep, 2 DBs + 1 LB pattern-match on releases.
- **Cover 2 Man, Double-A-Gap mugs, traditional zone blitzes from a 2nd LB are impossible** — we don't have a 2nd LB.

**Personnel groupings (for play card design):**
- **ACE (11)** = 1 RB + 1 TE + 1 WR. Most balanced — Vermont's home base.
- **EMPTY (10)** = 0 RB + 3 WR, 2x1 (no trips). Helix and Sacramento home.
- **PRO HEAVY (12/21)** = compressed sets. Ridgemont's home for Duo/Power.
- **WILDCAT** = direct snap to RB/WR, +1 run-game numbers, neutralizes missing tackles.

**This shapes the new playbooks.** Each team's ~20 plays will be drawn from concepts that actually work in this format, not 11-man imports.

---

## 5. Tier ladder → ratings translation

The bible locks tiers at: Top = Larkspur, Hollowridge | Middle = Vermont, Helix, Coral Bay, Blackwater | Bottom = Ridgemont, Sacramento.

**Bible target sub-attribute averages:**
- Top tier: ~70 (high 4-star)
- Middle tier: ~52 (3-star)
- Bottom tier: ~35 (low 2-3 star)

**Translated to TORCH's existing 1-5 star system + OVR:**

| Tier | Avg stars | Avg OVR | Star players (rated 5★) | Strong players (rated 4★) | Role players (rated 3★) | Weak players (rated 2★) |
|---|---|---|---|---|---|---|
| Top | 4.0 | 82 | 3 | 6 | 4 | 1 |
| Middle | 3.0 | 76 | 2 | 4 | 6 | 2 |
| Bottom | 2.3 | 70 | 1 | 3 | 6 | 4 |

**Star-on-each-side rule:** You said "1 star each side for some teams, 2-3 total for better teams." Translation:

- **Top-tier teams (Larkspur, Hollowridge):** 3 stars total. 2 on one side of ball + 1 on the other (preferred side decided by scheme — e.g., Larkspur = 2 stars on offense + 1 defense; Hollowridge = balanced 2-1 either way).
- **Middle-tier teams (4 teams):** 2 stars total. 1 on each side of the ball (forced symmetry — keeps middle tier feeling balanced).
- **Bottom-tier teams (Ridgemont, Sacramento):** 1 star total. Either side of the ball — Ridgemont gets a star RB (matches their identity); Sacramento gets a star slot WR (matches their analytical YAC scheme).

That's **3+3+2+2+2+2+1+1 = 16 starred players across 112 total** = 14% star density. Realistic.

---

## 6. Roster construction approach

For each team's 14 players (7 OFF: 3 OL + QB + 3 skill | 7 DEF: 3 DL + LB + 3 secondary), I'll:

1. **Pick the scheme's star archetypes first** (e.g., Blackwater needs an icy option QB + a penetrating 3-tech DT — these are the stars).
2. **Assign positional needs based on scheme** (e.g., Helix Air Raid wants 3 WR + tiny RB; Ridgemont Smashmouth wants 1 power RB + 2 TE).
3. **Pull names from the regional pool** (deliverable from research thread #3 — 32 first + 32 last names per team).
4. **Apply position-flavor pairing rules** (e.g., Blackwater O-line gets French-Catholic names like Beau Boudreaux + Luc Hebert; burner WRs get one-syllable speed names).
5. **Distribute traits per position** matching the scheme (e.g., Larkspur OL = ROAD GRADER + PULLING; Coral Bay WR1 = BURNER + CONTESTED CATCH).
6. **Set ratings to match tier distribution** (table above).
7. **Set ST ratings** (kickPower, kickAccuracy, returnAbility 1-5 each — respect existing data model).

Output: `players.js` rebuilt as 8 teams × 14 = 112 players. Existing `players.js` data structure preserved (id, name, firstName, pos, ovr, badge, isStar, num, ability, stars, trait, side, team, st) — backward-compatible field names so engine doesn't need refactoring.

---

## 7. Playbook overhaul approach

For each team, ~20 plays drawn from:
- **8-12 offensive plays** matching the scheme's signature concepts (e.g., Blackwater = Inside Veer, Midline, Rocket Toss, PA Verticals, Trap)
- **8-12 defensive plays** matching the philosophy
- Each play has type (RUN/PASS/SCREEN/SPECIAL), formation, base yards, success/fail variance, conditional modifiers
- Existing `*Plays.js` data structure preserved (id, name, type, base, variance, success, etc.)

Output: 4 new playbook files (`pronghornsPlays.js`, `salamandersPlays.js`, `maplesPlays.js`, `raccoonsPlays.js`) + rewritten existing 4 (`sentinelsPlays.js`, `serpentsPlays.js`, `stagsPlays.js`, `wolvesPlays.js`) to match new schemes.

**TEAM_DRAW_WEIGHTS** in `state.js` updated for all 8 teams — what cards each team sees more often based on scheme run/pass split.

---

## 8. Team-select UI — recommended direction

**Vertical Hero Carousel ("Ember Eight Faction Deck")** — research strongly recommends this over grid/map/list alternatives.

**Layout (375px portrait):**
- **Top 15%:** Team logo + "RIDGEMONT BOARS" title + "Ridgemont University · Ozarks, Arkansas" subtitle + tier badge: `[POWERHOUSE]` | `[CONTENDER]` | `[UNDERDOG]`
- **Middle 50% (hero):** Full-width illustration of the team's Ghost (Coach Wendell Pace, etc.) over a heavy color-wash of team's primary hex. Ghost makes eye contact.
- **Lower 20%:** One-sentence narrative hook ("The town's only claim to relevance — pride and ghosts.") + 3 stylized icons:
  - **Scheme icon:** 🏈 + scheme tagline ("Smashmouth Pro")
  - **Region icon:** 🗺️ + town name
  - **Star count:** ⭐⭐⭐ (visualizes tier visually)
- **Sticky bottom 15%:** "HOLD TO COACH" button (1.5s press, haptic build-up, progress fill)

**Interactions:**
- **Swipe up/down** through 8 teams (snap-paged, full-bleed)
- **Reactive color-wash on swipe** — screen visibly *becomes* the next team's color before the player decides
- **Hold-to-confirm** prevents accidental lock-in (research-backed cautionary tale: Slay the Spire mobile)
- **Transition out:** screen flashes white → primary color floods viewport → ghost art zooms out into the program-history reveal screen (no loading mask, seamless)

**What this replaces:** Current matchup-slam team-select layout in `src/ui/screens/teamSelect.js` (4-team specific). Pre-game runway flow stays intact AFTER the new pick.

**Optional pre-pick step (recommended):** Tier-archetype filter inspired by EA CFB 25 Road to Glory — *"Pick your difficulty: Underdog / Contender / Powerhouse"* — filters the carousel down to that tier's teams. Makes tier choice feel like a narrative decision, not a hidden stat. Open question for the user — flagged below.

**Program-history reveal screen** (after pick): Lore from the bible (school, town, ghost backstory, current arc). Recommended layout in deliverable B.

---

## 9. Files that will change (when you approve B → code)

For visibility — no files touched yet:

**Data files:**
- `src/data/teams.js` — merge `teamsSeason2.js` in, update all 8 schools/regions/tiers per bible, replace COUNTER_PLAY with new COUNTER_MATRIX
- `src/data/teamsSeason2.js` — delete (folded into teams.js)
- `src/data/players.js` — full rewrite, 112 players
- `src/data/sentinelsPlays.js`, `serpentsPlays.js`, `stagsPlays.js`, `wolvesPlays.js` — full rewrite to match new schemes
- `src/data/pronghornsPlays.js`, `salamandersPlays.js`, `maplesPlays.js`, `raccoonsPlays.js` — new files
- `src/state.js` — update `TEAM_DRAW_WEIGHTS` for all 8 teams; bump VERSION

**Engine files:**
- `src/engine/snapResolver.js` — update counter-matrix lookups (single value → array)
- `src/engine/aiOpponent.js` — same update
- `src/engine/personnelSystem.js` — verify trait synergy table covers all new traits
- `src/engine/gameState.js` — verify nothing assumes 4-team-only

**UI files:**
- `src/ui/screens/teamSelect.js` — full rewrite to vertical hero carousel
- `src/ui/screens/pregame.js` — update for 8-team matchup support
- `src/ui/screens/roster.js` — verify works with new traits

**Test files:**
- `src/tests/smokeTest.js` — likely needs assertion updates for new team count + new scheme-specific behavior
- `src/tests/balanceTest.js` — expand from 12-combination drive sim (4 × 3 opponents) to 56-combination (8 × 7 opponents)

**Scope estimate:** ~12 files modified + 4 files added + 1 file deleted. Largest single rewrites: `players.js` (~600 lines), `teamSelect.js` (full UI overhaul), the 8 playbook files (~250 lines each).

---

## 10. Open questions for the user

Before I build the structured data files (deliverable B), confirm or override:

**Q1 — Tier-archetype filter pre-pick step?** ✅ CONFIRMED 2026-04-14. Include the difficulty filter at the top of the team-select carousel.

**Q2 — Hollowridge tier shift to top.** ✅ CONFIRMED 2026-04-14. Boars drop to bottom, Spectres rise to top.

**Q3 — Scheme-to-existing-team identity continuity.** ✅ CONFIRMED 2026-04-14. Coral Bay flips to Vertical Pass (Petrino/Koetter); Boars/Spectres/Serpents schemes locked as proposed.

**Q4 — Star distribution per team.** ✅ CONFIRMED 2026-04-14. Defaults stand: Top 3 (2/1 split), Middle 2 (1/1), Bottom 1 (offensive).

**Q5 — Coral Bay's "transfer portal" identity.** ✅ CONFIRMED 2026-04-14. Coral Bay name pool overrides to 30/70 regional/recruit.

**Q6 — Larkspur's "Plains-only recruiting" identity.** ✅ CONFIRMED 2026-04-14. Larkspur name pool overrides to 80/20 regional/recruit.

**Q7 — Sacramento having no Ghost.** ✅ DEFERRED 2026-04-14. Ghost / coach narrative is invisible to the game for now. Team-select hero illustration uses logos/mascots/colors only — see mockups in `public/mockups/team-select-v1/2/3.html`.

**Q8 — Versioning.** ✅ CONFIRMED 2026-04-14. **Minor bump** (v0.38.0 → next minor, e.g., v0.40.0 "Ember Eight"). Save the v1.0.0 milestone for later.

**Q9 — Anything else missing.** ✅ CONFIRMED 2026-04-14. No additional systems flagged.

---

## SCOPE CLARIFICATION (locked 2026-04-14)

**Season functionality is DEFERRED.** This release just adds the 8 teams to the existing single-game flow. Out of scope for this release:

- Coach creator / coach avatar
- Program history reveal screen (ghost lore)
- Round-robin schedule, standings, seeds, playoff
- Tier-weighted AI-vs-AI sim
- Showcase week / Phoenix neutral site
- Any multi-game season tracking
- Bible-driven Ghost UI surfacing

**In scope** for this release:
- 8 teams replace the current 4 in `teams.js`
- 8 fresh schemes (offensive + defensive)
- 8 fresh rosters (112 players total)
- 8 fresh playbooks (~160 plays total)
- 8-team counter-matrix module
- New team-select UI (V1 carousel + difficulty pre-pick filter)
- Production play continues to be: team select → pregame → single game

When season mode ships later, the bible's lore (ghosts, towns, founding history) plugs in — UI, data files, and engine are designed to support it without rework.

---

## 11. Approval gates

To keep this manageable:

- **Gate A (this doc):** Approve the schemes, counter-matrix, ratings translation, team-select direction, and naming approach. Resolve Q1-Q9. Then I move to deliverable B.
- **Gate B (data files):** I produce structured data: name pools (8 markdown files), scheme specs (8 markdown files), playbook outlines (8 markdown files), counter-matrix module spec. You review. Approve before I touch game code.
- **Gate C (code):** Per-file PRs or one big landing — your preference. I recommend **per-system landing**: (1) data files (teams + players + playbooks + counter-matrix) as one commit; (2) UI rewrite (team-select + program-history reveal) as a second commit; (3) test updates as a third commit. Each tested green before the next.

Awaiting your read of this doc + answers to Q1-Q9.
