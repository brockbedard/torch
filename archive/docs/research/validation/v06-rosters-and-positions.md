# V06 — Roster Construction Validation

**Date:** 2026-03-22
**Scope:** OL visibility, defensive position mix, player names, OVR distribution, badge assignments across all 4 new teams (Sentinels, Timber Wolves, Stags, Serpents)

---

## 1. OL Cards — Visible or Abstracted?

### Analysis of Three Options

#### Option A: OL as Visible, Playable Cards

**Pros:**
- More cards in the roster (7 per side, feels fuller)
- Line play is an authentic part of football
- Potential for OL-specific mechanics (protection schemes, double teams)

**Cons:**
- "Hank Maddox, OL, 72 OVR" is objectively the least exciting card in any hand. No player in any card game history has been thrilled to play a guard.
- OL cards dilute the fun. When your hand is QB + WR + OL, you always play the WR. The OL card is dead weight — it occupies a slot but never creates a "hell yes" moment.
- OL badges (BRICK, HELMET) overlap with run-game badges on RB/FB, creating confusion about which player to pair with which play.
- Three OL cards per team = 12 total OL across 4 teams. That is 12 cards that exist only to be ignored.
- Card games live and die on whether every card in your hand feels meaningful. OL cards fail this test.

**If visible, what makes them interesting?** You would need OL-specific mechanics: protection scheme selection (slide left/right), pancake block triggers, double-team combos. This adds complexity without adding fun. It is a mechanic tax — work the player does that does not feel rewarding.

#### Option B: OL Fully Abstracted into "Line Quality" Stat

**Pros:**
- Every card in your hand is a skill player. Every draw is exciting.
- Cleaner gameplay — fewer cards to manage, faster decision-making.
- Aligns with the existing 4+2 format (Canyon Tech and Iron Ridge already have no OL cards).

**Cons:**
- Offense becomes QB + 3 skill = 4 playable cards. Defense would need to match at 4 to keep balance.
- 4v4 feels thin. With only 4 cards per side, hand variety drops and the game becomes repetitive faster.
- Loses the "full team" feeling on the roster screen.

#### Option C: OL Exist on Roster, Never Enter Hand (RECOMMENDED)

**Pros:**
- OL appear on the roster/team screen for authenticity — the team "feels" complete with linemen listed.
- During gameplay, your hand only contains skill position players. Every card you draw is one you want to play.
- OL affect the game engine behind the scenes: their combined OVR creates a "Line Quality" modifier that influences sack rates, run-blocking effectiveness, and pocket time. This is already how the engine works — sack rates and run stuff rates are base values modified by matchup. OL quality can feed into these modifiers invisibly.
- Players who care about roster depth see OL on the team page. Players who care about gameplay never have to interact with them.
- Matches the existing Canyon Tech / Iron Ridge implementation, which has zero OL cards and works fine.

**Cons:**
- Minor potential confusion ("I see OL on my roster but can't play them"). Solved with a simple tooltip or roster screen label: "FRONT LINE — These players protect your QB and open running lanes behind the scenes."

### Recommendation: Option C — OL on Roster, Not in Hand

**Justification:**
1. The existing game already works this way. CT and IR have no OL cards and gameplay is not worse for it.
2. The synthesis doc (00-synthesis.md) already defines skill slot breakdowns without OL: "3 WR skill slots," "FB/SB/SB skill slots," etc.
3. The team archetypes doc itself suggests this in the "Format Compatibility" section: "Keep QB + 3 skill players as starters, move 1 skill + 1 OL to bench, drop remaining OL (they become implicit/abstracted)."
4. Card game design principle: every card in the player's hand should create a meaningful decision. OL cards do not.

**Implementation detail:** Each team's OL group gets a composite "Line Quality" rating (average of their 3 OVR values). This feeds into the engine as a modifier on sack rate (higher line quality = lower sack rate) and run stuff rate (higher = lower stuff rate). The player never sees this number, but it creates a real difference between teams. For example:
- Wolves OL avg: (76+74+72)/3 = 74 — best line, supports their run-heavy identity
- Serpents OL avg: (76+72+70)/3 = 72.7 — good pass protection for air raid
- Sentinels OL avg: (74+72+70)/3 = 72 — adequate for quick-release passing
- Stags OL avg: (74+72+70)/3 = 72 — relies on tempo to offset line play

---

## 2. Defensive Roster Position Mix

### Current 7-Man Defensive Rosters

| Team | CB | S | LB | DL/EDGE | Total |
|------|---:|--:|---:|--------:|------:|
| Sentinels (Press Man) | 2 | 2 | 2 | 1 | 7 |
| Wolves (Zone Read) | 1 | 2 | 2 | 2 | 7 |
| Stags (Swarm Blitz) | 2 | 1 | 2 | 2 | 7 |
| Serpents (Pattern Match) | 2 | 2 | 2 | 1 | 7 |

### Football Accuracy Assessment

**Sentinels (Press Man / Cover 1):** 2 CB + 2 S + 2 LB + 1 DL.
- Accurate. Press man needs two strong corners (the whole identity). One deep safety + one robber safety is textbook Cover 1. Two LBs for underneath coverage. One edge rusher to generate pressure that makes the coverage work. This mirrors Legion of Boom-era Seattle: two elite CBs, one centerfield safety (Earl Thomas), one box safety (Kam Chancellor), one pass rusher to complete the equation.
- **Verdict: Correct as-is.**

**Wolves (Zone Read / Cover 3):** 1 CB + 2 S + 2 LB + 2 DL.
- Only 1 CB is unusual but defensible. In a 7v7 context, the Cover 3 shell needs three deep defenders (1 CB + 2 S can cover the three deep thirds). Two LBs handle underneath zones. Two DL fit the gap-sound, spill-and-rally identity — you need bodies up front to control gaps.
- However, one concern: with only 1 CB, the Wolves defense looks vulnerable to any 2-WR set, which every other team runs. A second CB at the expense of one DL would be more balanced for gameplay.
- **Recommendation: Consider swapping to 2 CB + 2 S + 2 LB + 1 DL. If keeping 2 DL is important for identity, keep as-is but acknowledge the trade-off. The current setup is defensible — the walked-up strong safety (Jared Kline) effectively plays a nickel/slot-corner role.**

**Stags (Swarm Blitz / Cover 0):** 2 CB + 1 S + 2 LB + 2 DL/EDGE.
- Accurate. Cover 0 means no deep safety — you are sending everyone. Having only 1 safety who toggles between deep (Cover 1) and blitzing (Cover 0) is exactly right. Two press CBs who must win 1-on-1. Two LBs who blitz. Two front-line rushers. This mirrors Venables-style exotic pressure packages.
- **Verdict: Correct as-is.**

**Serpents (Pattern Match / Disguise):** 2 CB + 2 S + 2 LB + 1 DL.
- Accurate. Pattern-match defense is DB-heavy by nature — you need smart defensive backs who can transition from zone to man mid-play. Two CBs who can press-then-match. Two safeties who disguise and rotate. Two LBs for hook-curl zones and RB/TE matching. One interior rusher who generates pressure through scheme (games/twists) rather than pure athleticism. This mirrors Saban's Alabama defenses.
- **Verdict: Correct as-is.**

### Should Defense Be Reduced to Match 4-Card Offense?

If offense is QB + 3 skill (4 playable cards), should defense also be 4?

**Recommendation: Yes — 4 starters + 2 bench per side, matching the existing CT/IR format.**

The existing game uses 4 starters + 2 bench. This is already proven to work. Expanding to 7 playable defenders when offense only has 4 playable cards creates an asymmetry that complicates the engine without adding fun.

**Proposed 4+2 defensive rosters (trimmed from 7):**

**Sentinels (Press Man):**
| Role | Name | Pos | OVR | Badge | Notes |
|------|------|-----|-----|-------|-------|
| Starter | Rashad Tillery (STAR) | CB | 84 | PADLOCK | Shutdown corner |
| Starter | Nolan Reeves | S | 80 | EYE | Deep safety |
| Starter | Jamal Creed | CB | 78 | PADLOCK | CB2 |
| Starter | Terrence Obi | S | 76 | SPEED_LINES | Robber |
| Bench | Desmond Clay | LB | 74 | HELMET | Coverage LB |
| Bench | Kai Nakamura | DL | 70 | SPEED_LINES | Edge rusher |

**Wolves (Zone Read):**
| Role | Name | Pos | OVR | Badge | Notes |
|------|------|-----|-----|-------|-------|
| Starter | Beau Ledford (STAR) | LB | 84 | HELMET | MIKE LB |
| Starter | Travis McBride | LB | 78 | EYE | WILL LB |
| Starter | Aaron Posey | S | 78 | EYE | Free safety |
| Starter | Omar Baskins | DL | 76 | BRICK | Nose tackle |
| Bench | Dalton Mercer | CB | 74 | PADLOCK | Zone corner |
| Bench | Jared Kline | S | 72 | CLIPBOARD | Strong safety |

**Stags (Swarm Blitz):**
| Role | Name | Pos | OVR | Badge | Notes |
|------|------|-----|-----|-------|-------|
| Starter | Keon Blackwell (STAR) | EDGE | 84 | SPEED_LINES | Pass rusher |
| Starter | Roman Tate | LB | 80 | SPEED_LINES | Blitz LB |
| Starter | JaQuan Ross | CB | 78 | PADLOCK | Press CB |
| Starter | Devonte Shields | LB | 76 | HELMET | Spy/Robber |
| Bench | Cam Ridley | DL | 74 | BRICK | Nose tackle |
| Bench | Troy Beckett | S | 74 | EYE | Deep safety |

**Serpents (Pattern Match):**
| Role | Name | Pos | OVR | Badge | Notes |
|------|------|-----|-----|-------|-------|
| Starter | Solomon Vega (STAR) | S | 84 | CLIPBOARD | Eraser |
| Starter | Deon Whitaker | CB | 80 | PADLOCK | Pattern-match CB1 |
| Starter | Kendall Bishop | LB | 78 | HELMET | MIKE LB |
| Starter | Andre Baptiste | CB | 76 | EYE | Zone-match CB2 |
| Bench | Miles Langford | S | 74 | CLIPBOARD | Free safety |
| Bench | Jayce Pruitt | LB | 72 | EYE | WILL LB |

**Dropped from playable roster (absorbed into team identity/Line Quality equivalent on defense):** Xavier Pruitt (Sentinels LB), Reggie Stokes (Wolves DL), Darius Vaughn (Stags CB), Damon Chu (Serpents DL). These lowest-OVR players become part of the team's "defensive front" abstraction, similar to how OL works on offense.

### Proposed 4+2 Offensive Rosters

**Sentinels (Run & Shoot):**
| Role | Name | Pos | OVR | Badge | Notes |
|------|------|-----|-----|-------|-------|
| Starter | Tate Calloway | QB | 80 | CROSSHAIR | Field general |
| Starter | Jaylen Monroe (STAR) | WR | 84 | SPEED_LINES | Go-to receiver |
| Starter | DeShawn Frazier | WR | 78 | FOOTBALL | Deep threat |
| Starter | Corey Vance | WR | 76 | GLOVE | Possession WR |
| Bench | — | — | — | — | OL abstracted |
| Bench | — | — | — | — | OL abstracted |

Note: The Sentinels only have 4 skill players (QB + 3 WR). With OL abstracted, they have no bench depth. This is a problem. The team needs 2 additional skill players for bench slots. See recommendation below.

**Wolves (Triple Option):**
| Role | Name | Pos | OVR | Badge | Notes |
|------|------|-----|-----|-------|-------|
| Starter | Colton Briggs | QB | 78 | CLIPBOARD | Option QB |
| Starter | Marcus Thorne (STAR) | FB | 84 | HELMET | Fullback |
| Starter | Isaiah Quick | SB | 78 | CLEAT | Slotback |
| Starter | Deon Hargrove | SB | 74 | SPEED_LINES | Slotback |
| Bench | — | — | — | — | Needs bench player |
| Bench | — | — | — | — | Needs bench player |

Same issue — only 4 skill players, no bench.

**Stags (Spread RPO):**
| Role | Name | Pos | OVR | Badge | Notes |
|------|------|-----|-----|-------|-------|
| Starter | Micah Strand (STAR) | QB | 84 | FLAME | Dual-threat QB |
| Starter | Jalen Sayers | RB | 80 | CLEAT | Running back |
| Starter | Tyreek DaCosta | WR | 78 | BOLT | Slot WR |
| Starter | Malik Booker | WR | 76 | FOOTBALL | Outside WR |
| Bench | — | — | — | — | Needs bench player |
| Bench | — | — | — | — | Needs bench player |

Same issue.

**Serpents (Air Raid):**
| Role | Name | Pos | OVR | Badge | Notes |
|------|------|-----|-----|-------|-------|
| Starter | Ryder Ash | QB | 80 | CROSSHAIR | Pocket passer |
| Starter | Zion Hayward (STAR) | SLOT | 84 | GLOVE | Slot receiver |
| Starter | Calvin Dupree | WR | 78 | SPEED_LINES | Outside WR |
| Starter | Theo Slade | WR | 76 | FOOTBALL | Outside WR |
| Bench | — | — | — | — | Needs bench player |
| Bench | — | — | — | — | Needs bench player |

### Critical Finding: All 4 Teams Need 2 Bench Players on Offense

The 7v7 roster was designed as 1 QB + 3 OL + 3 skill. With OL abstracted, each team has exactly 4 offensive skill players and zero bench depth. The existing CT/IR teams have 4 starters + 2 bench (6 total). Each new team needs 2 additional offensive skill players.

**Recommended bench additions (8 new players total):**

**Sentinels bench:**
- **Kenji Tran** | QB | 74 | BOLT | Backup QB, quicker release, less accuracy
- **Devon Langley** | WR | 72 | FOOTBALL | 4th WR, reliable underneath

**Wolves bench:**
- **Silas Okafor** | FB | 74 | BRICK | Backup dive back, more power less speed
- **Cody Ballard** | SB | 72 | CLEAT | Third slotback option, change-of-pace

**Stags bench:**
- **Elijah Watts** | QB | 76 | CROSSHAIR | Backup QB, more passer than runner
- **Nico Reyes** | RB | 72 | HELMET | Short-yardage back, change of pace

**Serpents bench:**
- **Tariq Osei** | QB | 74 | CLIPBOARD | Backup QB, can read blitzes
- **Gabe Moreno** | SLOT | 72 | BOLT | Backup slot, quick-twitch underneath

---

## 3. Player Names and Diversity

### Complete Name Audit (56 Original + 8 New Bench = 64 Total)

#### Similarity to Real NFL/College Players — FLAGGED

| Name | Concern | Risk Level | Recommendation |
|------|---------|------------|----------------|
| **Jalen Sayers** | Gale Sayers (NFL legend). "Sayers" at RB is a direct association. | HIGH | Rename to **Jalen Cortland** |
| **Tyreek DaCosta** | "Tyreek" immediately evokes Tyreek Hill. First name at WR is too on-the-nose. | MEDIUM | Rename to **Tariq DaCosta** — wait, Tariq is used for Serpents bench. Rename to **Amari DaCosta** — wait, Amari Cooper. Use **Kael DaCosta** |
| **Roman Tate** | Golden Tate (NFL WR). Less direct since Tate is a common surname and Roman Tate plays LB. | LOW | Acceptable. Different position mitigates. |
| **Cam Ridley** | Cam Newton + Riley Ridley / Calvin Ridley. Combined evocation. | MEDIUM | Rename to **Cam Holbrook** |
| **Darius Vaughn** | No strong NFL match. Clear. | NONE | Keep |
| **Calvin Dupree** | Calvin Johnson (Megatron). "Calvin" at WR is risky. | MEDIUM | Rename to **Cedric Dupree** |
| **Malik Booker** | Malik Hooker (NFL safety). Different position, but Booker + Malik is close-ish. | LOW | Acceptable. |
| **Ryder Ash** | No match. | NONE | Keep |
| **Tate Calloway** | Golden Tate again, but Calloway differentiates. | LOW | Acceptable. |

#### Diversity Assessment

Reviewing ethnic/cultural background representation across all names:

**African American names (well represented):** Darnell Price, DeShawn Frazier, Jaylen Monroe, Rashad Tillery, Jamal Creed, Terrence Obi, Desmond Clay, Isaiah Quick, Deon Hargrove, Marcus Thorne, JaQuan Ross, Devonte Shields, Deon Whitaker, Andre Baptiste, Kendall Bishop, Solomon Vega, Malik Booker, Keon Blackwell, Damon Chu — strong representation.

**White/Anglo names (well represented):** Tate Calloway, Corey Vance, Colton Briggs, Hank Maddox, Earl Whitfield, Bo Jernigan, Travis McBride, Beau Ledford, Dalton Mercer, Jared Kline, Nolan Reeves, Aaron Posey, Troy Beckett, Aiden Marsh, Jesse Rowan, Nate Dunlap, Theo Slade, Ryder Ash — strong representation.

**Hispanic/Latino names:** Andre Polk (ambiguous), Liam Cortez, Dominic Ferro, Terrell Odom — underrepresented. Only Cortez and Ferro are clearly Latino-coded.

**Asian/Pacific Islander names:** Kai Nakamura (Japanese), Damon Chu (Chinese) — 2 out of 56. Minimal.

**Other backgrounds:** Terrence Obi (Igbo/Nigerian), Andre Baptiste (Haitian/French Caribbean), Solomon Vega (could be Latino) — some representation but could be stronger.

**Diversity verdict:** The roster skews heavily toward African American and White/Anglo names, which tracks with real college football demographics. However, for a card game that wants broad appeal, slightly more Latino and Asian representation would improve inclusivity without feeling forced.

**Recommended swaps to improve diversity (already partially addressed in bench additions above with Kenji Tran, Silas Okafor, Nico Reyes, Tariq Osei, Gabe Moreno):**
- Bench additions already add: 1 Japanese American (Kenji Tran), 1 Nigerian American (Silas Okafor), 1 Latino (Nico Reyes), 1 Ghanaian American (Tariq Osei), 1 Latino (Gabe Moreno). This meaningfully improves diversity.

#### Memorability Assessment — FLAGGED

| Name | Issue | Recommendation |
|------|-------|----------------|
| **Marcus Webb** (Sentinels OL) | Generic. Forgettable. | Not a problem since OL are abstracted and never in hand. |
| **Andre Polk** (Sentinels OL) | Same — generic OL, abstracted. | Fine. |
| **Aaron Posey** (Wolves S) | Slightly generic but acceptable for a safety. | Keep |
| **Nate Dunlap** (Serpents OL) | Generic but abstracted. | Fine |
| **Jesse Rowan** (Serpents OL) | Generic but abstracted. | Fine |

**Memorability verdict:** The skill position players (the ones players actually interact with) all have strong, memorable names. The star players are particularly good: "Jaylen 'Jet' Monroe," "Marcus 'The Hammer' Thorne," "Keon 'Chaos' Blackwell," "Zion 'Silk' Hayward." The generic names are all on OL players who will be abstracted — no action needed.

### Final Name Changes

| Original | Position | Team | Change To | Reason |
|----------|----------|------|-----------|--------|
| Jalen Sayers | RB | Stags | **Jalen Cortland** | Gale Sayers association |
| Tyreek DaCosta | WR | Stags | **Kael DaCosta** | Tyreek Hill association |
| Cam Ridley | DL | Stags | **Cam Holbrook** | Calvin Ridley association |
| Calvin Dupree | WR | Serpents | **Cedric Dupree** | Calvin Johnson association |

---

## 4. OVR Distribution

### Current Distribution

| Tier | OVR | Count per team (offense) | Count per team (defense) |
|------|-----|--------------------------|--------------------------|
| Star | 84 | 1 | 1 |
| Elite starter | 80 | 1 (QB or key skill) | 1 |
| Starter | 76-78 | 1-2 | 1-2 |
| Role player | 70-74 | 2-3 (mostly OL) | 1-2 |

**Total offensive OVR per team (7 players):** ~534 (avg 76.3)
**Total defensive OVR per team (7 players):** ~534 (avg 76.3)

### Is the Range Right?

**70-84 = 14-point spread.** Let's compare:

**Madden college roster equivalent (NCAA era games, 70-99 scale):**
- Star player: 88-92
- Starting QB: 82-85
- Key starters: 78-82
- Rotation players: 74-78
- Bench/depth: 68-74

That is a ~24-point spread (68-92). TORCH's 14-point spread (70-84) is considerably tighter.

**Is it tight enough to be balanced?** Yes. A 14-point gap means no single card is so dominant that it auto-wins. An 84 vs a 70 is meaningful but not game-breaking, especially when badge combos matter more than raw OVR.

**Is it wide enough to feel different?** Borderline. The concern: if OL are abstracted, the playable card range is actually 74-84 on offense (only 10 points) and 70-84 on defense (14 points). A 10-point range on offense might feel too flat — the difference between your worst and best card is subtle.

**Recommendation:** The range works for TORCH because the game uses visual tiers (Star/Starter/Reserve) rather than displaying OVR numbers. Players perceive the gold-bordered star card as clearly better than the dim-bordered reserve, even if the mechanical difference is modest. The badge system adds a second axis of differentiation that OVR alone cannot provide.

However, with the 4+2 format and bench additions, the bench players (72-74 OVR) should feel noticeably weaker when substituted in. The current 6-8 point gap between a bench player (72) and a star (84) achieves this. A bench QB at 74 replacing a starting QB at 80 should feel like a downgrade — and a 6-point OVR gap accomplishes that in the engine (+/- modifiers on completion rate, sack resistance, etc.).

**Verdict: Keep the current 70-84 range. It is appropriately tight for balance and appropriately wide for perceived differentiation, especially with visual tiers doing the heavy lifting.**

---

## 5. Badge Assignment Review

### Offensive Badges

| Player | Pos | Badge | Label | Fires On | Football Sense? | Notes |
|--------|-----|-------|-------|----------|-----------------|-------|
| **Sentinels** | | | | | | |
| Tate Calloway | QB | CROSSHAIR | Precision | Quick passes | YES | Perfect for a timing-based Run & Shoot QB |
| Jaylen Monroe | WR | SPEED_LINES | Explosive | Deep passes | YES | Go-to WR with top speed, deep ball specialist |
| DeShawn Frazier | WR | FOOTBALL | Arm Talent | Deep passes | QUESTIONABLE | FOOTBALL (Arm Talent) on a WR is odd. This badge represents throwing ability. A WR does not throw the ball. |
| Corey Vance | WR | GLOVE | Sure Hands | Short passes | YES | Possession receiver with reliable hands — perfect fit |
| Darnell Price | OL | BRICK | Immovable | Power runs, QB sneaks | YES | Pass protector anchoring the pocket |
| Marcus Webb | OL | HELMET | Toughness | Power runs | YES | Physical blocker |
| Andre Polk | OL | BRICK | Immovable | Power runs, QB sneaks | YES | Center calling protections |
| **Wolves** | | | | | | |
| Colton Briggs | QB | CLIPBOARD | Football IQ | Play-action, option | YES | Option QB who reads the DE — pure football IQ |
| Marcus Thorne | FB | HELMET | Toughness | Power runs | YES | Power fullback, 20+ carries, breaks tackles. Textbook. |
| Isaiah Quick | SB | CLEAT | Pure Speed | Screens, zone read | YES | Pitch man, explosive in space |
| Deon Hargrove | SB | SPEED_LINES | Explosive | Deep passes | QUESTIONABLE | A slotback on a triple option team with a deep-pass badge? The Wolves barely throw. SPEED_LINES fires on deep passes, but Hargrove is a motion/counter sweep player. |
| Hank Maddox | OL | BRICK | Immovable | Power runs, QB sneaks | YES | Guard who gets movement at the point of attack |
| Earl Whitfield | OL | HELMET | Toughness | Power runs | YES | Tackle, edge sealer |
| Bo Jernigan | OL | BRICK | Immovable | Power runs, QB sneaks | YES | Guard, down blocks and traps |
| **Stags** | | | | | | |
| Micah Strand | QB | FLAME | Clutch | 3rd/4th down | YES | Dual-threat game-breaker. Clutch fits his "turns busted plays into first downs" identity. |
| Jalen Cortland (was Sayers) | RB | CLEAT | Pure Speed | Screens, zone read | YES | Inside zone runner who also catches swings. CLEAT triggers on screens — the swing passes are screen-adjacent. Good fit. |
| Kael DaCosta (was Tyreek) | WR | BOLT | Quick Twitch | Screens | YES | Bubble screen and quick slant specialist. BOLT fires on screens. Perfect. |
| Malik Booker | WR | FOOTBALL | Arm Talent | Deep passes | QUESTIONABLE | Same issue as DeShawn Frazier. FOOTBALL = Arm Talent on a WR makes no football sense. |
| Terrell Odom | OL | BRICK | Immovable | Power runs, QB sneaks | YES | Zone blocking guard |
| Aiden Marsh | OL | HELMET | Toughness | Power runs | YES | Center getting to second level |
| Dominic Ferro | OL | BRICK | Immovable | Power runs, QB sneaks | YES | Tackle sealing edge |
| **Serpents** | | | | | | |
| Ryder Ash | QB | CROSSHAIR | Precision | Quick passes | YES | Pocket passer with 68% completion. Textbook precision. |
| Zion Hayward | SLOT | GLOVE | Sure Hands | Short passes | YES | 120+ receptions, catches everything. The badge was made for this player. |
| Cedric Dupree (was Calvin) | WR | SPEED_LINES | Explosive | Deep passes | YES | Speed receiver running verticals. Fires on deep passes. Perfect. |
| Theo Slade | WR | FOOTBALL | Arm Talent | Deep passes | QUESTIONABLE | Third instance of FOOTBALL on a WR. Same problem. |
| Liam Cortez | OL | BRICK | Immovable | Power runs, QB sneaks | YES | LT protecting the blind side |
| Jesse Rowan | OL | HELMET | Toughness | Power runs | YES | Guard |
| Nate Dunlap | OL | BRICK | Immovable | Power runs, QB sneaks | YES | Center |

### Defensive Badges

| Player | Pos | Badge | Label | Fires On | Football Sense? | Notes |
|--------|-----|-------|-------|----------|-----------------|-------|
| **Sentinels** | | | | | | |
| Rashad Tillery | CB | PADLOCK | Lockdown | Man coverage | YES | Press-man shutdown corner. The badge is his identity. |
| Jamal Creed | CB | PADLOCK | Lockdown | Man coverage | YES | Physical CB2 who disrupts at the line |
| Nolan Reeves | S | EYE | Vision | Robber/Cover 6 | YES | Ball-hawk free safety reading the QB |
| Terrence Obi | S | SPEED_LINES | Explosive | Blitz cards | ACCEPTABLE | Strong safety/robber who comes down into the box. SPEED_LINES fires on blitz — he is a blitzer. Works, though SPEED_LINES connotes "fast" more than "hitter." |
| Desmond Clay | LB | HELMET | Toughness | vs Run + run-stopping card | YES | Coverage LB but HELMET fires vs run. Acceptable — he walls off crossers AND stops the run in underneath zones. |
| Xavier Pruitt | LB | CLIPBOARD | Football IQ | Spy/disguise | ACCEPTABLE | MIKE LB who reads run fits. CLIPBOARD fires on spy/disguise schemes. A MIKE calling coverages and reading keys fits "Football IQ" but the spy/disguise trigger is more of a Serpents trait. In a press-man scheme, the MIKE is not disguising — he is simply reading and reacting. |
| Kai Nakamura | DL | SPEED_LINES | Explosive | Blitz cards | DEBATABLE | Pass rusher with SPEED_LINES. The badge fires on blitz cards, which aligns with generating pressure. But "Explosive" for a DL connotes burst off the snap, which is fine for an edge rusher. The issue: SPEED_LINES is also the badge for Terrence Obi on the same defense. Duplicate badges on one unit reduce variety. |
| **Wolves** | | | | | | |
| Beau Ledford | LB | HELMET | Toughness | vs Run + run-stopping card | YES | Run-stuffing MIKE. Textbook HELMET. |
| Travis McBride | LB | EYE | Vision | Robber/Cover 6 | YES | Scrape-over LB who reads the zone play. EYE = reading the play. |
| Omar Baskins | DL | BRICK | Immovable | vs Run + strong run D | YES | Two-gap nose tackle eating double teams. He IS a brick wall. |
| Reggie Stokes | DL | HELMET | Toughness | vs Run + run-stopping card | YES | Squeeze/spill DE. Physical at the point of attack. |
| Dalton Mercer | CB | PADLOCK | Lockdown | Man coverage | ACCEPTABLE | Zone corner with a man-coverage badge. PADLOCK fires on man coverage cards, but Mercer plays zone. However, in the 4+2 format he would be bench, and having PADLOCK gives him flexibility if used in a man-coverage scheme adjustment. Acceptable. |
| Aaron Posey | S | EYE | Vision | Robber/Cover 6 | YES | Deep safety reading the field. EYE is perfect. |
| Jared Kline | S | CLIPBOARD | Football IQ | Spy/disguise | ACCEPTABLE | Strong safety / force player. CLIPBOARD on a gap-sound force defender is a stretch — he is not disguising or spying, he is filling force. HELMET or BRICK would fit better. But CLIPBOARD avoids badge duplication. |
| **Stags** | | | | | | |
| Keon Blackwell | EDGE | SPEED_LINES | Explosive | Blitz cards | YES | 15+ sack edge rusher. Fires on blitz cards. The badge was made for this archetype. |
| Roman Tate | LB | SPEED_LINES | Explosive | Blitz cards | YES | A-gap blitzer. Pure speed/explosion into the backfield. But this is a duplicate with Blackwell on the same unit. |
| Devonte Shields | LB | HELMET | Toughness | vs Run + run-stopping card | YES | Spy/robber LB. HELMET fires vs run — he spies dual-threat QBs and stops the run. Fits. |
| Cam Holbrook (was Ridley) | DL | BRICK | Immovable | vs Run + strong run D | YES | Nose tackle occupying blockers. Classic BRICK. |
| JaQuan Ross | CB | PADLOCK | Lockdown | Man coverage | YES | Press CB in Cover 0. Must win 1-on-1. PADLOCK is the only badge that makes sense here. |
| Darius Vaughn | CB | GLOVE | Sure Hands | — | FLAG | GLOVE (Sure Hands) on a CB makes no sense as a DEFENSIVE badge. GLOVE fires on SHORT PASSES as an offensive badge combo. On defense, there is no defined GLOVE defensive trigger. The player description says "handsy at the line" — but that is press technique, not sure hands for catching. This is a misassignment. |
| Troy Beckett | S | EYE | Vision | Robber/Cover 6 | YES | Deep safety / trigger player. EYE fires on robber/cover 6. Fits. |
| **Serpents** | | | | | | |
| Solomon Vega | S | CLIPBOARD | Football IQ | Spy/disguise | YES | The perfect CLIPBOARD player. Disguise specialist who could be anywhere post-snap. |
| Deon Whitaker | CB | PADLOCK | Lockdown | Man coverage | YES | Presses then matches — starts in man technique. PADLOCK fires on man coverage. |
| Andre Baptiste | CB | EYE | Vision | Robber/Cover 6 | YES | Reads QB's eyes to jump routes. EYE is exactly this skill. |
| Miles Langford | S | CLIPBOARD | Football IQ | Spy/disguise | ACCEPTABLE | Deep safety who rotates between Cover 2 and Cover 3. CLIPBOARD fits the scheme complexity, but having two CLIPBOARD badges on one defense (with Vega) reduces variety. |
| Kendall Bishop | LB | HELMET | Toughness | vs Run + run-stopping card | YES | MIKE LB, hook-curl defender who matches TEs/RBs. HELMET fires vs run — he is run-fit first. |
| Jayce Pruitt | LB | EYE | Vision | Robber/Cover 6 | YES | Wall player who reroutes underneath receivers. Reads routes to wall them off. EYE fits. But duplicates Andre Baptiste's badge on the same unit. |
| Damon Chu | DL | SPEED_LINES | Explosive | Blitz cards | YES | Interior rusher using games and twists. Fires on blitz cards. The "designed rush" identity fits — twists and games require burst timing. |

### Flagged Issues Summary

#### Critical Issues (Misassignments)

1. **FOOTBALL (Arm Talent) on WRs — DeShawn Frazier, Malik Booker, Theo Slade.** The FOOTBALL badge represents throwing ability ("Arm Talent"). It fires on deep passes. Assigning it to receivers creates a logical contradiction: WRs do not throw the ball. The badge fires on the right play type (deep passes) but the label does not match the player's role.

   **Fix options:**
   - **Option A:** Redefine FOOTBALL's label from "Arm Talent" to "Big Play" or "Deep Ball." This makes it position-agnostic — a WR can be a "big play" threat on deep passes.
   - **Option B (recommended):** Reassign these WRs to more position-appropriate badges:
     - DeShawn Frazier (Sentinels deep threat WR): Change to **SPEED_LINES** — but Monroe already has it. Change to **BOLT** (Quick Twitch, fires on screens). Actually, Frazier is a vertical threat, not a screen guy. Best option: keep FOOTBALL but relabel the badge. See Option A.
   - **Verdict: Go with Option A. Relabel FOOTBALL from "Arm Talent" to "Playmaker." This makes it work for QBs (playmaking arm) and WRs (playmaking catches on deep balls) alike. The badge trigger (deep passes only) remains unchanged.**

2. **GLOVE on CB Darius Vaughn (Stags).** GLOVE is an offensive badge (Sure Hands, fires on short passes). There is no defined defensive trigger for GLOVE. This badge will never fire on defense.

   **Fix: Change Darius Vaughn's badge to PADLOCK** (man coverage). He is a press CB in Cover 0. Yes, this duplicates JaQuan Ross's badge, but two press CBs in a Cover 0 defense both having PADLOCK is more authentic than one having a non-functional badge. Alternatively, give him **EYE** (reads the receiver to disrupt) or **SPEED_LINES** (explosive jam at the line).

   **Recommendation: Change to PADLOCK.** In Cover 0, both corners must lock down. Duplication is acceptable and thematic.

#### Minor Issues (Debatable but Functional)

3. **SPEED_LINES on DL Kai Nakamura (Sentinels).** Duplicates Terrence Obi on the same defense. Both fire on blitz cards. Consider changing Nakamura to **BRICK** (he needs to hold up at the point of attack to make the coverage work) or keeping as-is if badge diversity per unit is not a priority.

4. **SPEED_LINES duplication on Stags defense (Blackwell + Roman Tate).** Both are blitzers, both have SPEED_LINES. Thematically accurate (this is a blitz defense) but reduces badge variety. Consider changing Roman Tate to **FLAME** (Clutch) — an A-gap blitzer arriving on critical downs is a clutch play. Or keep as-is since the Stags identity IS speed/pressure.

5. **CLIPBOARD on Jared Kline (Wolves S).** He is a force player, not a spy/disguise player. CLIPBOARD fires on spy/disguise schemes, which the Wolves rarely run. Consider **HELMET** (he takes on lead blockers — toughness) or **BRICK** (immovable force player). But these duplicate other Wolves defenders. Keep as-is for badge variety, accepting the imperfect fit.

6. **Deon Hargrove (Wolves SB) with SPEED_LINES.** Fires on deep passes, but the Wolves throw maybe 15-20% of the time. This badge will rarely activate. Consider **HELMET** (Hargrove runs counter sweeps — toughness/physicality) or **CLEAT** (fires on screens/zone read — counter option is adjacent). But CLEAT duplicates Isaiah Quick.

   **Recommendation: Change Hargrove's badge to HELMET.** Counter sweep runners need toughness to absorb contact on misdirection plays. Yes, this duplicates Marcus Thorne's HELMET, but both are physical runners. Alternatively, keep SPEED_LINES to give the Wolves a rare but explosive deep-shot capability when they do throw — which creates interesting strategic tension.

7. **Double CLIPBOARD on Serpents defense (Vega + Langford).** Both safeties with the same spy/disguise badge. Thematically perfect (this IS the disguise defense) but reduces variety. Consider changing Langford to **EYE** — he reads the field to know where to rotate. But EYE is already on Andre Baptiste and Jayce Pruitt. The Serpents defense is heavy on EYE and CLIPBOARD by design. Accept the duplication as identity-defining.

---

## Summary of Recommendations

### High Priority

1. **Adopt Option C for OL:** OL exist on roster screen for authenticity but never enter the player's hand. OL stats feed into engine modifiers (sack rate, run stuff rate) behind the scenes.

2. **Use 4+2 format for all teams** (matching existing CT/IR structure). This requires creating 8 new bench players across the 4 teams (2 per team on offense) and trimming defense from 7 to 6 (4 starters + 2 bench).

3. **Fix GLOVE on Darius Vaughn:** Change to PADLOCK. A defensive CB should not have an offensive-only badge.

4. **Relabel FOOTBALL badge** from "Arm Talent" to "Playmaker." This makes the badge work for both QBs and WRs without changing any game mechanics.

5. **Rename 4 players** to avoid NFL name associations: Sayers to Cortland, Tyreek to Kael, Cam Ridley to Cam Holbrook, Calvin Dupree to Cedric Dupree.

### Medium Priority

6. **Consider changing Deon Hargrove's badge** from SPEED_LINES to HELMET for better scheme fit with the run-heavy Wolves.

7. **Address SPEED_LINES duplication** on Stags defense (Blackwell + Tate). Consider FLAME for Roman Tate.

### Low Priority

8. **Badge duplication on same unit** (Sentinels: two SPEED_LINES on defense; Wolves: CLIPBOARD on a non-spy player; Serpents: two CLIPBOARD and two EYE on defense). These are acceptable as identity-defining choices but reduce the variety of badge combo opportunities per game.

9. **OVR range is appropriate.** No changes needed. The 70-84 range with visual tiers (Star/Starter/Reserve) communicates quality without requiring football knowledge.

10. **Diversity is adequate** and improves with the bench additions (Kenji Tran, Silas Okafor, Nico Reyes, Tariq Osei, Gabe Moreno adding Japanese, Nigerian, and Latino representation).
