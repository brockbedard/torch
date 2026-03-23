# TORCH v0.21 — Buildable Spec

**Date:** 2026-03-22
**Status:** Ready for implementation (includes Amendment #1: hand management, seasons, TORCH cards, defensive names, progressive disclosure)
**Replaces:** Canyon Tech + Iron Ridge (retired), player draft, play draft, 6-screen pre-game flow

---

## 1. Overview — What Changed from v0.20

| v0.20 | v0.21 |
|-------|-------|
| 2 teams (Canyon Tech, Iron Ridge) | 4 teams (Sentinels, Wolves, Stags, Serpents) |
| 6 pre-game screens | 3 screens (Home, Team Select, Coin Toss transition) |
| Player draft (pick 4+4 from 6+6) | Predetermined squads (4 starters + 2 bench per side) |
| Play draft (pick 4+4 from 10+10) | Predetermined playbooks (10 OFF + 10 DEF), draw 5 at a time |
| 4 cards in hand | 5 cards in hand, cycling through 10-card playbook |
| Single game | 3-game season cycle vs all 3 opponents |
| OVR number on cards | Badge icon as hero element + visual tier borders |
| No star players | 1 offensive star + 1 defensive star per team (Heat Check) |
| Old TORCH card system | 8-card catalog, score=wallet, shop at trigger moments |
| Generic badge icons | game-icons.net SVGs (CC BY 3.0) |
| Single gold helmet | Team-colored helmets with unique decals |
| Technical defensive names | Simplified, action-oriented defensive play names |
| Tutorial screens | Progressive disclosure — learn by playing |

---

## 2. Visual Asset Plan

### 2.1 Badge Icons — game-icons.net (CC BY 3.0)

Source: https://game-icons.net — 4,170+ bold game-native silhouette icons. Import by copying SVG path data from their GitHub repo (https://github.com/game-icons/icons).

| Badge | game-icons.net Icon | Search Term |
|-------|-------------------|-------------|
| SPEED_LINES | `running-ninja` or `sprint` | "sprint" |
| HELMET | `american-football-helmet` | "football helmet" |
| PADLOCK | `padlock` | "padlock" |
| FLAME | `fire` | "fire" |
| BRICK | `brick-wall` | "brick wall" |
| BOLT | `lightning-bolt` or `electric` | "lightning" |
| CLEAT | `boot-stomp` or `wingfoot` | "boot" |
| GLOVE | `gloves` or `catch` | "glove" |
| CROSSHAIR | `crosshair` | "crosshair" |
| EYE | `semi-closed-eye` or `eye-target` | "eye" |
| CLIPBOARD | `scroll-unfurled` or `checklist` | "checklist" |
| FOOTBALL | `american-football-ball` | "football" |

**Implementation:** Create `src/data/badgeIcons.js` containing raw SVG path strings. Each icon renders as a single `<path>` element inside an `<svg viewBox="0 0 512 512">`. Color via `fill` attribute.

### 2.2 Team Helmets — Extended from Current SVG

Keep the existing helmet shell shape from `cards.js`. Add a `teamHelmetSvg(teamId, size)` function that applies:
- **Base fill:** Team primary color
- **Facemask:** Team secondary color or contrasting color
- **Stripe:** CSS `linear-gradient` overlay for stripe pattern (1-3 stripes down center)
- **Logo decal:** Team logo SVG composited onto the helmet side

| Team | Base | Facemask | Stripe | Decal |
|------|------|----------|--------|-------|
| Sentinels | Crimson #8B0000 | Gold #C4A265 | Single gold stripe | Shield silhouette |
| Wolves | Forest Green #1B3A2D | Silver #D4D4D4 | Silver wolf paw | Wolf head profile |
| Stags | Burnt Orange #F28C28 | Black #1C1C1C | Black antler fork | Leaping stag |
| Serpents | Deep Purple #2E0854 | Venom Green #39FF14 | Green serpent coil | Cobra hood |

### 2.3 Team Logos — Hand-drawn SVG Paths

Start with game-icons.net placeholders, iterate to custom:
- **Sentinels:** `roman-shield` or `visored-helm` -> custom shield with spear
- **Wolves:** `wolf-head` -> custom snarling wolf profile
- **Stags:** `deer` or `antlers` -> custom leaping stag
- **Serpents:** `cobra` or `snake` -> custom coiled king cobra

Each logo is a single SVG `<path>` that works at 16px (card pip) through 64px (team select). Stored in `src/data/teamLogos.js`.

### 2.4 Play Card Diagrams — Keep Current System

The existing `playSvg()` system in `src/data/playDiagrams.js` is already one of TORCH's best custom assets. Enhancements:
- Add arrowhead markers to route endpoints
- Add scrimmage line
- Replace Unicode risk indicators with small custom SVG shapes

### 2.5 Quality Rating Indicators — Torch Flame Pips

Replace Unicode stars with custom flame pip SVGs:

```
Flame pip SVG (filled):
<svg viewBox="0 0 12 16" width="10" height="13">
  <path d="M6 0C6 0 2 5 1.5 8C1 11 3 13.5 5 14.5C5 14.5 3.5 11 5 8C5.5 6.5 6 5 6 3.5C6 5 6.5 6.5 7 8C8.5 11 7 14.5 7 14.5C9 13.5 11 11 10.5 8C10 5 6 0 6 0Z" fill="FILL_COLOR"/>
</svg>

Flame pip SVG (dimmed):
Same path, fill="#333" or team color at 20% opacity
```

Usage on team select cards: 5 flame pips per stat line (Offense, Defense). Gold (#FFB800) for filled, #333 for empty.

### 2.6 Torch Card Art — CSS Treatments by Tier

| Tier | Border | Background | Effect |
|------|--------|------------|--------|
| Gold | 3px solid #FFB800 | radial-gradient(#2a1800, #0A0804) | Shimmer sweep + subtle glow |
| Silver | 3px solid #B0C4D4 | radial-gradient(#141820, #0A0804) | Shimmer sweep (cooler tone) |
| Bronze | 3px solid #A0522D | radial-gradient(#1a1008, #0A0804) | None (standard) |

### 2.7 Card Back Designs — Keep Current with Team Color Variants

- **Offense backs:** Green (#96CC50 / #4A6A20) with bolt icon
- **Defense backs:** Blue (#6AAAEE / #385890) with shield icon
- **Torch backs:** Orange (#E88050 / #904028) with flame icon + gold double frame

### 2.8 UI Icons — Tabler Icons (MIT)

Source: https://tabler.io/icons — 6,050+ icons, clean 2px stroke style.
Copy 10-15 SVG strings into `src/data/uiIcons.js`:
- Back arrow: `arrow-left`
- Settings: `settings`
- Info: `info-circle`
- Close: `x`

---

## 3. The 4 Teams

### 3.1 Ridgemont Sentinels

**Colors:** Crimson `#8B0000` / Antique Gold `#C4A265`
**Motto:** *"Eyes Up, Hands Ready"*
**Helmet:** Crimson base, gold facemask, single gold center stripe, shield decal
**Vibe:** Disciplined. Adaptive. The chess team that bench presses 315.

**Offense: Run & Shoot** — 4-wide, option routes adjust mid-play based on coverage. WRs read defensive leverage and break opposite. Precision over volume.

**Defense: Press Man / Cover 1** — Jam at the line, disrupt timing, one deep safety. Shuts down timing-based passing.

#### Offensive Roster (4 starters + 2 bench)

| Name | Pos | OVR | Badge | Tier | Star | Notes |
|------|-----|-----|-------|------|------|-------|
| Tate Calloway | QB | 80 | CROSSHAIR | Star | | Quick release, reads safeties |
| **Jaylen "Jet" Monroe** | WR | 84 | SPEED_LINES | Star | STAR | Best route-runner in the game |
| DeShawn Frazier | WR | 78 | FOOTBALL | Starter | | Deep threat, stretches the field |
| Corey Vance | WR | 76 | GLOVE | Starter | | Reliable hands, chain mover |
| Kenji Tran | QB | 74 | BOLT | Reserve | Bench | Backup, electric scrambler |
| Devon Langley | WR | 72 | CROSSHAIR | Reserve | Bench | Possession slot |

#### Defensive Roster (4 starters + 2 bench)

| Name | Pos | OVR | Badge | Tier | Star | Notes |
|------|-----|-----|-------|------|------|-------|
| **Rashad Tillery** | CB | 84 | PADLOCK | Star | STAR | Shutdown corner, island player |
| Nolan Reeves | S | 80 | EYE | Star | | Ball hawk, deep center field |
| Jamal Creed | CB | 78 | PADLOCK | Starter | | Physical press corner |
| Terrence Obi | S | 76 | SPEED_LINES | Starter | | Robber/spy role |
| Desmond Clay | LB | 74 | HELMET | Reserve | Bench | Coverage linebacker |
| Kai Nakamura | DL | 72 | SPEED_LINES | Reserve | Bench | Edge rusher |

#### Offensive Playbook (10 plays)

| Name | Category | Risk | Flavor |
|------|----------|------|--------|
| Choice Route | SHORT PASS | MED | Read him and burn him |
| Go Seam | DEEP PASS | HIGH | Split the safeties deep |
| Switch | SHORT PASS | LOW | Cross 'em up underneath |
| Streak | DEEP PASS | HIGH | Four arrows, one target |
| Quick Flat | QUICK PASS | LOW | Dump it and run |
| Seam Read | SHORT PASS | MED | Find the soft spot |
| Superback Draw | DRAW | LOW | Sell the pass, run the ball |
| Fade & Stop | DEEP PASS | MED | Freeze him, then go |
| Bubble Screen | SCREEN | LOW | Quick flip to the edge |
| QB Scramble Drill | QB RUN | MED | Nothing open? I'll go |

#### Defensive Playbook (10 plays)

| Name | Category | Risk | Flavor |
|------|----------|------|--------|
| Press & Trail | PRESS COVERAGE | MED | Get in his face, stay on his hip |
| Lurk Underneath | HYBRID | MED | Bait the throw, jump the route |
| Plug the Middle | MAN COVERAGE | LOW | Nothing through the center |
| QB Shadow | SPY | MED | Wherever he goes, I go |
| All-Out Rush | BLITZ | HIGH | No help, everyone's coming |
| Double Team | MAN COVERAGE | LOW | Two on their best weapon |
| Mirror Match | PRESS COVERAGE | MED | Stride for stride, hip to hip |
| Fake Press | MAN COVERAGE | LOW | Show press, drop deep |
| A-Gap Overload | BLITZ | HIGH | Both backers, right up the gut |
| Bait & Take | HYBRID | MED | Let him throw it, then take it |

---

### 3.2 Northern Pines Timber Wolves

**Colors:** Forest Green `#1B3A2D` / Silver `#D4D4D4`
**Motto:** *"Run Through Them"*
**Helmet:** Matte forest green, silver facemask, silver wolf paw decal
**Vibe:** Blue-collar. Relentless. Opponents leave sore.

**Offense: Triple Option (Flexbone)** — FB dive, QB keep, pitch to slotback. Reads defenders instead of blocking them. Clock-killing ground attack.

**Defense: Zone Read / Cover 3** — Gap-sound, spill and rally. Every defender fills their gap. Bend but don't break.

#### Offensive Roster (4 starters + 2 bench)

| Name | Pos | OVR | Badge | Tier | Star | Notes |
|------|-----|-----|-------|------|------|-------|
| Colton Briggs | QB | 78 | CLIPBOARD | Starter | | Tough, decisive, reads the DE |
| **Marcus "The Hammer" Thorne** | FB | 84 | HELMET | Star | STAR | 20+ carries, impossible to bring down |
| Isaiah Quick | SB | 78 | CLEAT | Starter | | Pitch man, explosive in space |
| Deon Hargrove | SB | 74 | SPEED_LINES | Reserve | | Counter/motion specialist |
| Silas Okafor | FB | 74 | BRICK | Reserve | Bench | Backup bruiser |
| Cody Ballard | SB | 72 | CLEAT | Reserve | Bench | Speed backup |

#### Defensive Roster (4 starters + 2 bench)

| Name | Pos | OVR | Badge | Tier | Star | Notes |
|------|-----|-----|-------|------|------|-------|
| **Beau Ledford** | LB | 84 | HELMET | Star | STAR | Run-stuffing machine, QB of defense |
| Travis McBride | LB | 78 | EYE | Starter | | Scrapes over top on zone read |
| Aaron Posey | S | 78 | EYE | Starter | | Deep third, reliable |
| Omar Baskins | DL | 76 | BRICK | Starter | | Two-gaps, eats double teams |
| Dalton Mercer | CB | 74 | PADLOCK | Reserve | Bench | Zone corner |
| Jared Kline | S | 72 | CLIPBOARD | Reserve | Bench | Force player |

#### Offensive Playbook (10 plays)

| Name | Category | Risk | Flavor |
|------|----------|------|--------|
| Inside Veer | OPTION | LOW | Three yards and a cloud of dust |
| Midline | OPTION | LOW | Straight through the front door |
| Speed Option | QB RUN | MED | Footrace to the corner |
| Rocket Toss | RUN | MED | Gone before they blink |
| Counter Option | OPTION | MED | Wrong way - gotcha |
| Fullback Dive | RUN | LOW | The Hammer falls |
| QB Sneak | QB RUN | LOW | Just get across |
| PA Post-Wheel | PLAY-ACTION | HIGH | Safeties bit - bombs away |
| PA Bootleg | PLAY-ACTION | MED | Nobody's home backside |
| Switch Pass | SHORT PASS | HIGH | Faked the block, ran right by |

#### Defensive Playbook (10 plays)

| Name | Category | Risk | Flavor |
|------|----------|------|--------|
| Three Deep Shell | ZONE COVERAGE | LOW | Three deep, four underneath |
| Gap Swap | HYBRID | MED | Switch gaps, confuse the read |
| Cloud Corner | ZONE COVERAGE | LOW | Flat defender jumps the short stuff |
| Force Outside | ZONE COVERAGE | LOW | Push it wide, gang tackle |
| Four Across | ZONE COVERAGE | LOW | Four deep, take away the big play |
| Crash Inside | BLITZ | MED | Everybody shifts, nobody's where you think |
| Wall Off the Middle | ZONE COVERAGE | MED | Two guys own the seam |
| Safety Rolls Down | HYBRID | MED | Safety sneaks into the flat |
| Stack the Box | BLITZ | MED | Extra man at the line, dare you to throw |
| Delayed Rush | BLITZ | MED | Drop one, send one you didn't expect |

---

### 3.3 Crestview Stags

**Colors:** Burnt Orange `#F28C28` / Charcoal `#1C1C1C`
**Motto:** *"Strike First, Strike Fast"*
**Helmet:** Burnt orange base, black facemask, black antler fork decal
**Vibe:** Explosive. Electric. Wins 52-48 or loses 52-48.

**Offense: Spread RPO** — Shotgun, read one defender, hand off or throw. Tempo-driven, dual-threat QB.

**Defense: Swarm Blitz / Cover 0** — Exotic pressure, Cover 0/1, chaos. Turnovers or touchdowns.

#### Offensive Roster (4 starters + 2 bench)

| Name | Pos | OVR | Badge | Tier | Star | Notes |
|------|-----|-----|-------|------|------|-------|
| **Micah Strand** | QB | 84 | FLAME | Star | STAR | Most dangerous player on the field |
| Jalen Cortland | RB | 80 | CLEAT | Star | | Patient, finds the crease |
| Kael DaCosta | WR | 78 | BOLT | Starter | | Bubble screen / RPO target |
| Malik Booker | WR | 76 | FOOTBALL | Starter | | Vertical threat |
| Elijah Watts | QB | 76 | FLAME | Starter | Bench | Backup dual-threat |
| Nico Reyes | RB | 72 | CLEAT | Reserve | Bench | Speed backup |

#### Defensive Roster (4 starters + 2 bench)

| Name | Pos | OVR | Badge | Tier | Star | Notes |
|------|-----|-----|-------|------|------|-------|
| **Keon "Chaos" Blackwell** | EDGE | 84 | SPEED_LINES | Star | STAR | 15+ sacks, unblockable |
| Roman Tate | LB | 80 | SPEED_LINES | Star | | A-gap blitzer |
| JaQuan Ross | CB | 78 | PADLOCK | Starter | | Island press corner |
| Devonte Shields | LB | 76 | HELMET | Starter | | Spy/robber |
| Cam Holbrook | DL | 74 | BRICK | Reserve | Bench | Nose tackle |
| Troy Beckett | S | 74 | EYE | Reserve | Bench | Deep safety / trigger |

#### Offensive Playbook (10 plays)

| Name | Category | Risk | Flavor |
|------|----------|------|--------|
| Inside Zone | RUN | LOW | Bread and butter |
| Bubble Screen RPO | RPO | LOW | Numbers don't lie |
| Stick RPO | RPO | MED | Pick your poison |
| QB Power Read | OPTION | MED | Your move, end man |
| Pop Pass | RPO | HIGH | Eyes on the safety |
| Jet Sweep | RUN | MED | Get to the edge |
| QB Draw | QB RUN | MED | Kept it himself |
| Glance Slant RPO | RPO | MED | Blink and it's gone |
| Swing Pass | SCREEN | LOW | Catch and go |
| Zone Read Keep | QB RUN | HIGH | He's loose! |

#### Defensive Playbook (10 plays)

| Name | Category | Risk | Flavor |
|------|----------|------|--------|
| Zero Blitz | PRESS COVERAGE | HIGH | No safety, max pressure, all or nothing |
| Overload Rush | BLITZ | HIGH | Flood one side with rushers |
| Fake Blitz | HYBRID | MED | Show six, rush four, drop two |
| One-High Rush | BLITZ | HIGH | One safety deep, everyone else attacks |
| Zone Drop Blitz | BLITZ | MED | Blitz two, zone the rest |
| Twin Rush | BLITZ | HIGH | Both inside backers through the middle |
| Spy Release | SPY | MED | Spy the back, rush if he stays in |
| Edge Sneak | BLITZ | HIGH | Corner comes off the edge, nobody sees it |
| Quick Flood | BLITZ | HIGH | Five rush, man behind it |
| Sit & Read | ZONE COVERAGE | LOW | Drop deep, read the QB's eyes |

---

### 3.4 Blackwater State Serpents

**Colors:** Deep Purple `#2E0854` / Venom Green `#39FF14`
**Motto:** *"Death by a Thousand Cuts"*
**Helmet:** Matte deep purple, venom green facemask, green serpent coil decal
**Vibe:** Cerebral. Methodical. Death by paper cuts.

**Offense: Air Raid** — 4-wide, same 5 concepts run relentlessly. Ball out in 2.5 seconds. Volume passing.

**Defense: Pattern Match / Disguise** — Show one coverage, play another. Rotate shells post-snap. Most complex, hardest to attack.

#### Offensive Roster (4 starters + 2 bench)

| Name | Pos | OVR | Badge | Tier | Star | Notes |
|------|-----|-----|-------|------|------|-------|
| Ryder Ash | QB | 80 | CROSSHAIR | Star | | Pocket passer, never scrambles |
| **Zion "Silk" Hayward** | SLOT | 84 | GLOVE | Star | STAR | 120+ receptions, routes are flawless |
| Cedric Dupree | WR | 78 | SPEED_LINES | Starter | | Speed receiver, stretches field |
| Theo Slade | WR | 76 | FOOTBALL | Starter | | Intermediate specialist |
| Tariq Osei | QB | 74 | CROSSHAIR | Reserve | Bench | Backup pocket passer |
| Gabe Moreno | SLOT | 72 | GLOVE | Reserve | Bench | Reliable underneath |

#### Defensive Roster (4 starters + 2 bench)

| Name | Pos | OVR | Badge | Tier | Star | Notes |
|------|-----|-----|-------|------|------|-------|
| **Solomon Vega** | S | 84 | CLIPBOARD | Star | STAR | Most versatile defender, the eraser |
| Deon Whitaker | CB | 80 | PADLOCK | Star | | Pattern-match press corner |
| Kendall Bishop | LB | 78 | HELMET | Starter | | Hook-curl, matches TEs/RBs |
| Andre Baptiste | CB | 76 | EYE | Starter | | Zone-match, reads QB eyes |
| Miles Langford | S | 74 | CLIPBOARD | Reserve | Bench | Deep middle rotator |
| Jayce Pruitt | LB | 72 | EYE | Reserve | Bench | Wall player, reroutes |

#### Offensive Playbook (10 plays)

| Name | Category | Risk | Flavor |
|------|----------|------|--------|
| Mesh Crossfire | SHORT PASS | LOW | Pick your poison |
| Y-Cross Strike | DEEP PASS | HIGH | Coast to coast |
| Shallow Drag | SHORT PASS | LOW | Underneath, always open |
| Four Verticals | DEEP PASS | HIGH | Send everybody deep |
| All Curls | QUICK PASS | LOW | Five out, four under |
| Stick Read | QUICK PASS | LOW | Triangle of trouble |
| Jailbreak Screen | SCREEN | MED | Linemen on the loose |
| Y-Corner Fade | DEEP PASS | MED | Back pylon, every time |
| Tunnel Screen | SCREEN | MED | Through the gap |
| QB Draw | DRAW | MED | They all dropped back |

#### Defensive Playbook (10 plays)

| Name | Category | Risk | Flavor |
|------|----------|------|--------|
| Match Right | HYBRID | MED | Read the route, lock on right |
| Match Left | HYBRID | MED | Mirror image, same trap left |
| Four-Man Read | ZONE COVERAGE | LOW | Four deep, each one locks a man |
| Man-Zone Blend | HYBRID | MED | Starts zone, becomes man |
| Two-Deep Sit | ZONE COVERAGE | LOW | Sit back, read the QB |
| Delayed Switch | HYBRID | MED | Wait, wait... now move |
| Fake Rush | BLITZ | MED | Show blitz, drop to coverage |
| Outside Lock | ZONE COVERAGE | LOW | Lock the outside two, zone the rest |
| Deep Middle Drop | ZONE COVERAGE | LOW | Linebacker sprints to deep center |
| Hidden Bracket | MAN COVERAGE | MED | You think you know, you don't |

---

## 4. Counter-Play Matrix

```
Sentinels (R&S + Press Man)
  OFF STRONG vs Wolves DEF (option routes torch Cover 3 zone seams)
  OFF WEAK vs  Stags DEF (blitz kills route development time)
  DEF STRONG vs Serpents OFF (press jams Air Raid timing routes)
  DEF WEAK vs  Wolves OFF (can't man-cover the option pitch)

Wolves (Triple Option + Cover 3 Zone)
  OFF STRONG vs Sentinels DEF (option washes man coverage assignments)
  OFF WEAK vs  Serpents DEF (pattern-match LBs read the mesh point)
  DEF STRONG vs Stags OFF (zone discipline doesn't bite on RPO fakes)
  DEF WEAK vs  Sentinels OFF (option routes exploit Cover 3 seams)

Stags (Spread RPO + Swarm Blitz)
  OFF STRONG vs Serpents DEF (RPO attacks before disguise resolves)
  OFF WEAK vs  Wolves DEF (zone reads RPO, doesn't bite)
  DEF STRONG vs Wolves OFF (blitz overwhelms option mesh before reads develop)
  DEF WEAK vs  Serpents OFF (quick release beats blitz — ball out in 2s)

Serpents (Air Raid + Pattern Match)
  OFF STRONG vs Stags DEF (quick timing passes beat the blitz every time)
  OFF WEAK vs  Sentinels DEF (press-man jams disrupt timing routes)
  DEF STRONG vs Wolves OFF (pattern-match reads the triple option mesh)
  DEF WEAK vs  Stags OFF (RPO forces post-snap decision before coverage sorts)
```

**Circular dynamic:** Sentinels > Serpents > Stags > Wolves > Sentinels

Neutral matchups (non-adjacent) come down to card play, which is where TORCH's gameplay shines.

---

## 5. Hand Management — Draw 5, Cycle Through 10

### How It Works
- Each side (offense and defense) has a **playbook of 10 plays**
- At game start, **draw 5 randomly** from the 10. These are your visible hand.
- The remaining 5 form a face-down **deck** (order randomized)
- Each snap: pick 1 play from your hand of 5 → play resolves → played card goes to **bottom of deck** → draw 1 from **top of deck** into your hand
- You always have exactly **5 cards in hand**
- Over ~10 snaps, you cycle through all 10 plays roughly once

### Why This System
- Clash Royale uses this exact pattern (play 1 of 4, next card queues from 8-card deck)
- Creates plannable-but-not-static decisions: "Hail Mary is 2 draws away, do I stall?"
- 5 cards fits mobile portrait (5 × 68px + 4 × 6px gaps = 364px on 375px screen)
- Every play gets seen — no card permanently buried

### UI
- Card tray shows 5 cards (up from current 4)
- When played, card slides out. New card slides in from the right (deal animation).
- Optional: dimmed peek of next-draw card at right edge

### Engine
```js
// On game start (per side):
function initHand(playbook) {
  const shuffled = [...playbook].sort(() => Math.random() - 0.5);
  return { hand: shuffled.slice(0, 5), deck: shuffled.slice(5) };
}

// After each snap:
function cycleCard(hand, deck, playedIndex) {
  const played = hand.splice(playedIndex, 1)[0];
  deck.push(played);           // played card goes to bottom
  hand.push(deck.shift());     // draw from top
  return { hand, deck };
}
```

---

## 6. Season System — 3-Game Cycle

### Structure
- A **season** = 3 games against the 3 teams you didn't pick
- Order: **neutral matchup first**, **prey second**, **predator third** (escalating difficulty)
- Beat all 3 = season complete

### Season Order by Team

| Your Team | Game 1 (neutral) | Game 2 (favorable) | Game 3 (tough) |
|-----------|------------------|-------------------|----------------|
| Sentinels | Stags | Serpents | Wolves |
| Wolves | Serpents | Sentinels | Stags |
| Stags | Sentinels | Wolves | Serpents |
| Serpents | Wolves | Stags | Sentinels |

### Between-Game Flow
1. Game ends → End Game screen (stats, TORCH points, season record)
2. "NEXT GAME" → Between-Game Shop (spend carried-over points on TORCH cards)
3. "CONTINUE" → Coin toss transition → Game 2 gameplay

### Season Score
- Season score = sum of TORCH points across all 3 games (after spending)
- Win bonus: +100 TORCH points per win
- Season complete bonus: +200 TORCH points for winning all 3
- Core tension: spend points on cards to win, or save them for a higher season score

### State
```js
season: {
  team: 'sentinels',
  difficulty: 'MEDIUM',
  opponents: ['stags', 'serpents', 'wolves'],
  currentGame: 0,
  results: [],
  totalScore: 0,
  torchCards: [],       // persisted cards (max 3)
  carryoverPoints: 0,
}
```

---

## 7. TORCH Card System

### Core Philosophy
- TORCH points = your score AND your wallet
- Buying cards spends your score — the signature tension
- Cards persist across the 3-game season
- 3 inventory slots (tight, forces choices)
- Shop opens at trigger moments, not just halftime

### v1 Card Roster (8 cards)

#### Gold Tier (40-50 pts)

| Card | Cost | Type | Effect |
|------|------|------|--------|
| **Scout Team** | 45 | Pre-snap | See the opponent's play card before you pick yours |
| **Sure Hands** | 50 | Reactive | Cancel a turnover (INT or fumble) on this snap |

#### Silver Tier (20-30 pts)

| Card | Cost | Type | Effect |
|------|------|------|--------|
| **Hard Count** | 25 | Pre-snap | Force opponent to discard their play and pick a random replacement |
| **Hot Route** | 25 | Pre-snap | Discard your full 5-card hand, draw 5 fresh |
| **Flag on the Play** | 25 | Reactive (DEF) | After opponent gains 10+ yards, 75% chance play is called back |
| **Onside Kick** | 20 | Post-TD | After scoring a TD, 35% chance you recover at 50 and keep the ball |

#### Bronze Tier (10-20 pts)

| Card | Cost | Type | Effect |
|------|------|------|--------|
| **12th Man** | 15 | Pre-snap | +4 yards and double TORCH points this snap |
| **Ice** | 15 | Pre-snap | Freeze opponent's featured player — zero OVR bonus, no badge combo |

### Card Types
- **Pre-snap:** Attached before hitting SNAP. One per snap max.
- **Reactive:** Held in reserve. Played AFTER seeing snap result. One per snap max.
- **Post-TD:** Triggered during scoring sequence, before conversion.

### Inventory Rules
- 3 slots total. Any combination of types. Duplicates allowed.
- One pre-snap + one reactive per snap maximum (can stack).
- If full (3/3) and shop offers something, must discard one or pass.

### Shop System

#### When the Shop Opens

| Trigger | Cards Shown | Tier Weighting |
|---------|-------------|----------------|
| Touchdown scored (yours) | 1 | 40% Bronze, 40% Silver, 20% Gold |
| Forced turnover | 1 | 40% Bronze, 40% Silver, 20% Gold |
| 4th down stop | 1 | 60% Bronze, 30% Silver, 10% Gold |
| Star goes On Fire | 1 | 50% Bronze, 35% Silver, 15% Gold |
| Halftime | 3 | 30% Bronze, 40% Silver, 30% Gold |
| Between-game (season) | 3 | 20% Bronze, 40% Silver, 40% Gold |

#### Shop Flow
1. Celebration plays out fully
2. Shop bottom sheet slides up. Card name, tier, cost, 1-line effect.
3. **BUY** (points deducted, card added) or **PASS** (shop closes)
4. If full: tap card to drop, then confirm swap
5. Shop slides down. Game continues.
6. **Total interaction: 1-3 seconds.** Never feels like an interruption.

### AI TORCH Card Behavior

| Difficulty | Starting Cards | Shop Behavior | Usage |
|------------|---------------|---------------|-------|
| Easy | 0 | Never buys | Never uses |
| Medium | 0 | Buys Bronze only, 50% of the time | Uses at reasonable moments |
| Hard | 1 random Silver | Buys best available, always | Uses optimally |

### Season Persistence
- Cards persist across all 3 games
- TORCH points carry over between games
- Used cards are gone forever (single-use)
- New season = everything resets to 0

### Hot Route Interaction
```js
function hotRoute(hand, deck) {
  const combined = [...hand, ...deck].sort(() => Math.random() - 0.5);
  return { hand: combined.slice(0, 5), deck: combined.slice(5) };
}
```

---

## 8. Star Player Mechanic — Heat Check

### Phase 1 (Visual Only — ship first)
- Gold star icon pinned to star player cards
- Gold (#FFB800) border instead of tier border
- Star player name in gold on team select
- `isStar: true` and `starTitle: 'The Jet'` in player data

### Phase 2 (Heat Check Activation)
Stars start **dormant** each game. Activate on big plays:

**Offense activation:** 10+ yard gain OR badge combo fires while star is the selected player
**Defense activation:** Turnover OR sack while star is the selected player

**When On Fire:**
- +4 OVR boost (82 -> 86 for engine calculations)
- Badge combo grants +5 bonus yards (instead of normal +2-4)
- Card gets pulsing flame border + ember particle effect
- Special sound cue on activation

**Deactivation:**
- Offense star: opponent forces turnover or sack while star is selected
- Defense star: opponent scores TD while star is selected
- Star returns to dormant (can re-activate)

### Phase 3 (Clutch Factor — future)
When On Fire + 4th quarter/2-minute drill: +2 more OVR (total +6), badge combo auto-fires regardless of play type.

---

## 9. Player Quality Display

### Card Layout Change
Replace centered OVR number with centered badge icon:
```
Current:                    New:
+-------------+            +-------------------+
| #12  82  WR |            |  WR  [badge]  #12 |
|             |            |                   |
|  [helmet]   |            |    [helmet]       |
|             |            |                   |
|  SAMPSON    |            |    SAMPSON        |
+-------------+            +-------------------+
```

### Tier Visual Treatment

| Tier | OVR | Border | Badge Color | Helmet Glow |
|------|-----|--------|-------------|-------------|
| Star | 80-84 | 2px gold #FFB800 + faint outer glow | Gold | Gold drop-shadow |
| Starter | 76-78 | 2px team accent color | Team color | Team color drop-shadow |
| Reserve | 72-74 | 1px team accent at 50% opacity | Muted | Minimal |

**OVR remains in the data layer** for all engine calculations. Not displayed on cards.

---

## 10. Progressive Disclosure — Learn As You Go

### Core Principles
1. **Don't explain, reveal.** Every system arrives at the moment it becomes relevant.
2. **Engineer the first success.** AI on Easy deliberately plays weak coverage on snaps 2-3 so badge combo fires. First TD within 5-6 snaps.
3. **Same pattern, new context.** Offense and defense use identical interaction.
4. **Three things NEVER explicitly explained:** Flame pip ratings, football rules, card cycling.

### First-Time Player State
Game tracks `isFirstSeason: true` in state. Controls what's shown/hidden. Flips to `false` after first season.

### Teach Sequence (first game only)

| Moment | What Happens | Tooltip |
|--------|-------------|---------|
| Home | Card fan, KICK OFF. Zero explanation. | None |
| Team Select | 2x2 grid appears | "Each team plays differently. Tap to choose." |
| Coin Toss | Auto-play 3s animation | None |
| First snap | Play cards appear in hand | Pulsing highlight: "Tap a play to call it" |
| After play selected | Player cards shown | "Now pick who runs it" |
| SNAP button | Button pulses gold | "Hit SNAP!" |
| First result | Commentary, yardage, ball moves | None (football teaches itself) |
| First badge combo (snap 2-3) | Badge flashes, "+3 yards! COMBO!" | "Match the right player with the right play for bonus yards!" |
| First TD (within 5-6 snaps) | Full celebration, TORCH points fly | "TORCH points are your score — and your wallet." |
| First shop | Guaranteed Bronze card | "Spend points on TORCH cards for an edge. Buy it or pass!" |
| First TORCH card used | Card slot pulses | "Tap your TORCH card before you SNAP." |
| Halftime | 3-card shop | None (system learned) |
| End of game 1 | Season reveal | "GAME 1 OF 3 COMPLETE. Next opponent: [Team]." |
| Game 2 | Difficulty selector appears | "Choose your challenge." |
| Game 2 big play | Star Heat Check activates | Flame border, "ON FIRE" visual |

### First-Game Engine Modifications (`isFirstSeason && currentGame === 0`)
```js
firstGameMods: {
  difficulty: 'EASY',
  playerYardBonus: +3,
  aiNever4thDown: true,
  noInjuries: true,
  turnoverRateMultiplier: 0.5,
  forceWeakCoverageSnap2: true,
  forceWeakCoverageSnap3: true,
  firstShopGuaranteedBronze: true,
}
```

### Tooltip Component
- Dark semi-transparent backdrop behind target element
- White text, Rajdhani 600, 13px
- 0.3s fade-in, dismisses on any tap
- Each tooltip has unique ID in `localStorage` — once dismissed, never again
- Max 1 tooltip per screen transition

### Hidden on First Game
- Difficulty selector (auto-Easy, appears game 2)
- Counter-play matrix
- Season structure (revealed at end of game 1)
- TORCH card slot (dimmed, empty until first shop)
- Star Heat Check (activates game 2)

---

## 11. Pre-Game Screen Specs

### 11.1 Home (Unchanged)
Card fan hero, T(football)RCH wordmark, "KICK OFF" CTA. No changes.

### 11.2 Team Select (NEW)

**One purpose:** Pick your team. No roster reveal, no playbook preview, no draft.

**Layout (375px mobile portrait):**
```
+----------------------------------+  0px
|  [TORCH header]       [< BACK]  |  Fixed header (44px)
+----------------------------------+  44px
|                                  |
|  CHOOSE YOUR TEAM               |  Section label
|                                  |
|  +-----------+  +-----------+   |  2x2 grid
|  | SENTINELS |  | WOLVES    |   |  Each card ~170x220px
|  | [helmet]  |  | [helmet]  |   |  8px gap
|  | R&S       |  | OPTION    |   |
|  | OFF ####. |  | OFF ##... |   |  Flame pips
|  | DEF ###.. |  | DEF ####. |   |
|  | Jet Monroe|  | The Hammer|   |  Star callout
|  +-----------+  +-----------+   |
|  +-----------+  +-----------+   |
|  | STAGS     |  | SERPENTS  |   |
|  | [helmet]  |  | [helmet]  |   |
|  | RPO       |  | AIR RAID  |   |
|  | OFF ####. |  | OFF ###.. |   |
|  | DEF ##... |  | DEF ####. |   |
|  | Micah     |  | Silk      |   |
|  +-----------+  +-----------+   |
|                                  |
|  [EASY] [MEDIUM] [HARD]        |  Difficulty (hidden first game)
|                                  |
|  [======= LOCK IN =======]     |  CTA
|                                  |
+----------------------------------+
```

**Team Card Contents (per card, top to bottom):**
1. **Team helmet** — 48px, team-colored, with glow halo
2. **Team name** — Teko 700, 18px, white
3. **Playstyle pill** — "RUN & SHOOT" / "TRIPLE OPTION" / "SPREAD RPO" / "AIR RAID" in Rajdhani 700, 8px, team accent on dark chip
4. **Flame pip ratings** — OFF: N/5, DEF: N/5 (custom SVG flame pips)
5. **Star player callout** — Gold star icon + "JET MONROE / WR" in Rajdhani 9px, gold text
6. **Motto** — Rajdhani 7px, muted, italic

**Team Flame Pip Ratings:**

| Team | OFF | DEF |
|------|-----|-----|
| Sentinels | 4/5 | 3/5 |
| Wolves | 3/5 | 4/5 |
| Stags | 5/5 | 2/5 |
| Serpents | 3/5 | 4/5 |

**Selection behavior:**
- Tap team -> green (#00ff44) border pulse, scale(1.03), others dim 60%
- Tap difficulty -> team accent color fill
- "LOCK IN" enables when both selected
- First game: difficulty row hidden, auto-Easy

### 11.3 Coin Toss (Auto-Play Transition)

3-second animation between team select and gameplay:
1. Screen darkens (0.3s)
2. Matchup banner: `[Your helmet] VS [Opponent helmet]` with team color split (0.5s)
3. Coin spins (1.5s)
4. Result text (0.5s)
5. Auto-resolve: winner receives at 50
6. Flash to gameplay (0.2s)

No user input in v1. Torch card choice deferred to v2.

---

## 12. Data Model Changes

### 12.1 Team Data Structure
```js
// src/data/teams.js
export const TEAMS = {
  sentinels: {
    id: 'sentinels', name: 'Sentinels', school: 'Ridgemont University',
    mascot: 'Sentinels', abbr: 'RDG',
    colors: { primary: '#8B0000', secondary: '#C4A265' },
    helmet: { base: '#8B0000', facemask: '#C4A265', stripe: '#C4A265' },
    motto: 'Eyes Up, Hands Ready',
    offScheme: 'Run & Shoot', defScheme: 'Press Man',
    ratings: { offense: 4, defense: 3 },
  },
  wolves: {
    id: 'wolves', name: 'Timber Wolves', school: 'Northern Pines A&M',
    mascot: 'Timber Wolves', abbr: 'NPA',
    colors: { primary: '#1B3A2D', secondary: '#D4D4D4' },
    helmet: { base: '#1B3A2D', facemask: '#D4D4D4', stripe: '#D4D4D4' },
    motto: 'Run Through Them',
    offScheme: 'Triple Option', defScheme: 'Cover 3 Zone',
    ratings: { offense: 3, defense: 4 },
  },
  stags: {
    id: 'stags', name: 'Stags', school: 'Crestview College',
    mascot: 'Stags', abbr: 'CRV',
    colors: { primary: '#F28C28', secondary: '#1C1C1C' },
    helmet: { base: '#F28C28', facemask: '#1C1C1C', stripe: '#1C1C1C' },
    motto: 'Strike First, Strike Fast',
    offScheme: 'Spread RPO', defScheme: 'Swarm Blitz',
    ratings: { offense: 5, defense: 2 },
  },
  serpents: {
    id: 'serpents', name: 'Serpents', school: 'Blackwater State',
    mascot: 'Serpents', abbr: 'BWS',
    colors: { primary: '#2E0854', secondary: '#39FF14' },
    helmet: { base: '#2E0854', facemask: '#39FF14', stripe: '#39FF14' },
    motto: 'Death by a Thousand Cuts',
    offScheme: 'Air Raid', defScheme: 'Pattern Match',
    ratings: { offense: 3, defense: 4 },
  },
};
```

### 12.2 Player Data Structure
```js
// src/data/players.js — per team, offense + defense arrays
{ id: 'rdg_o1', name: 'Monroe', pos: 'WR', ovr: 84, badge: 'SPEED_LINES',
  isStar: true, starTitle: 'The Jet', num: 1 },
```

### 12.3 Play Data Structure
```js
// src/data/sentinelsPlays.js
{ id: 'rdg_choice', name: 'Choice Route', cat: 'SHORT PASS',
  risk: 'med', flavor: 'Read him and burn him',
  type: 'pass', mean: 7, variance: 4, completionRate: 0.72,
  sackRate: 0.04, intRate: 0.02, fumbleRate: 0.01 },
```

### 12.4 TORCH Card Data
```js
// src/data/torchCards.js
export const TORCH_CARDS = [
  { id: 'scout_team', name: 'Scout Team', tier: 'GOLD', cost: 45,
    type: 'pre-snap', effect: 'See the opponent\'s play before you pick yours' },
  { id: 'sure_hands', name: 'Sure Hands', tier: 'GOLD', cost: 50,
    type: 'reactive', effect: 'Cancel a turnover on this snap' },
  // ... 6 more
];
```

### 12.5 State Changes
```js
{
  screen: 'home',       // -> 'teamSelect' -> 'coinToss' -> 'gameplay'
  team: null,           // 'sentinels' | 'wolves' | 'stags' | 'serpents'
  difficulty: null,     // 'EASY' | 'MEDIUM' | 'HARD' (null = auto-Easy first game)
  isFirstSeason: true,  // progressive disclosure flag
  season: {
    opponents: [],      // derived from team + counter-play matrix
    currentGame: 0,
    results: [],
    totalScore: 0,
    torchCards: [],     // max 3, persisted across games
    carryoverPoints: 0,
  },
  // Per-game (reset each game):
  engine: null,         // GameState instance
  offenseHand: [],      // 5 plays
  offenseDeck: [],      // 5 plays
  defenseHand: [],
  defenseDeck: [],
}
```

---

## 13. Files to Create / Modify / Deprecate

### Create
- `src/data/teams.js` — 4 team definitions
- `src/data/sentinelsPlays.js` — 10 OFF + 10 DEF plays
- `src/data/wolvesPlays.js` — 10 OFF + 10 DEF plays
- `src/data/stagsPlays.js` — 10 OFF + 10 DEF plays
- `src/data/serpentsPlays.js` — 10 OFF + 10 DEF plays
- `src/data/badgeIcons.js` — game-icons.net SVG paths
- `src/data/teamLogos.js` — SVG paths for 4 team logos
- `src/data/uiIcons.js` — Tabler Icons SVG paths
- `src/ui/screens/teamSelect.js` — NEW team select screen
- `src/ui/components/tooltip.js` — First-time tooltip component
- `src/ui/components/shop.js` — TORCH card shop bottom sheet

### Modify
- `src/data/players.js` — Replace CT/IR with 4 new team rosters
- `src/data/torchCards.js` — Replace with 8-card v1 catalog
- `src/ui/components/cards.js` — Badge replaces OVR, tier borders, `teamHelmetSvg()`
- `src/ui/screens/coinToss.js` — Auto-play transition animation
- `src/ui/screens/gameplay.js` — 5-card hand, hand cycling, shop triggers, Heat Check
- `src/ui/screens/halftime.js` — 3-card shop, season persistence
- `src/ui/screens/endGame.js` — Season progress, between-game shop, "NEXT GAME" flow
- `src/ui/screens/home.js` — Navigate to `teamSelect`
- `src/state.js` — Season state, hand/deck state, `isFirstSeason`
- `src/main.js` — Router for new flow
- `src/style.css` — Team colors, flame pips, shop bottom sheet
- `src/engine/gameState.js` — `initHand()`, `cycleCard()`, first-game mods

### Deprecate
- `src/ui/screens/setup.js`
- `src/ui/screens/draft.js`
- `src/ui/screens/cardDraft.js`
- `src/ui/components/draftProgress.js`
- `src/data/ctOffensePlays.js`
- `src/data/ctDefensePlays.js`
- `src/data/irOffensePlays.js`
- `src/data/irDefensePlays.js`

---

## 14. Implementation Phases

### Phase 1: Data Layer
1. Create `teams.js` with 4 team definitions
2. Create player rosters for all 4 teams (48 players)
3. Create play data for all 4 teams (80 plays)
4. Create `torchCards.js` with 8-card catalog
5. Create `badgeIcons.js` with game-icons.net SVGs
6. Update `state.js` for season + hand/deck state

### Phase 2: Card Component Updates
7. `buildMaddenPlayer` — badge replaces OVR, tier borders
8. `teamHelmetSvg()` with team-colored helmets
9. Star player gold treatment
10. Flame pip rating component

### Phase 3: Team Select Screen
11. Build `teamSelect.js` — 2x2 grid, difficulty (hidden first game), LOCK IN
12. Wire to main.js router
13. Deprecate setup.js, draft.js, cardDraft.js

### Phase 4: Coin Toss + Season Flow
14. Auto-play coin toss transition
15. Season opponent selection from counter-play matrix
16. Between-game shop + "NEXT GAME" flow
17. End game screen season progress

### Phase 5: Gameplay — Hand Management
18. 5-card hand rendering
19. `initHand()` / `cycleCard()` engine logic
20. Card slide-out / slide-in animations

### Phase 6: Gameplay — TORCH Card Shop
21. Shop bottom sheet component
22. Trigger moment detection (TD, turnover, 4th stop, star activation)
23. Buy/pass/swap interaction
24. Season card persistence

### Phase 7: Star Player Heat Check
25. Activation/deactivation logic in snapResolver
26. Flame border + ember particles when On Fire
27. Sound cue on activation

### Phase 8: Progressive Disclosure
28. `isFirstSeason` flag + first-game engine mods
29. Tooltip component with localStorage tracking
30. Teach sequence (pulsing highlights, contextual tooltips)
31. Feature reveals at game 1 end, game 2 start

### Phase 9: Visual Polish
32. Replace badge icons with game-icons.net SVGs
33. Team logos on helmets
34. Flame pip ratings on team select
35. UI icon replacements (Tabler)
