# TORCH v0.21 — Research Synthesis

**Date:** 2026-03-22
**Sources:** 01-team-archetypes, 02-fast-onboarding, 03-star-player-mechanic, 04-player-quality-display, 05-pregame-screen-design

---

## The 4 Teams

### 1. Ridgemont Sentinels
- **Colors:** Crimson `#8B0000` / Antique Gold `#C4A265`
- **Motto:** *"Eyes Up, Hands Ready"*
- **Offense:** Run & Shoot — 4-wide, option routes that adjust mid-play based on coverage. Precision over volume. 3 WR skill slots.
- **Defense:** Press Man / Cover 1 — jam at the line, disrupt timing, one deep safety. Shuts down timing-based passing.
- **Stars:** WR Jaylen "Jet" Monroe (84, SPEED_LINES) / CB Rashad Tillery (84, PADLOCK)
- **Vibe:** Chess club that bench presses 315. Disciplined, adaptive, old-money program energy.

### 2. Northern Pines Timber Wolves
- **Colors:** Forest Green `#1B3A2D` / Silver `#D4D4D4`
- **Motto:** *"Run Through Them"*
- **Offense:** Triple Option (Flexbone) — FB dive, QB keep, pitch to slotback. Reads defenders instead of blocking them. Clock-killing. FB/SB/SB skill slots.
- **Defense:** Zone Read / Scrape Exchange — gap-sound, spill and rally. Every defender fills their gap. Cover 3 shell.
- **Stars:** FB Marcus "The Hammer" Thorne (84, HELMET) / LB Beau Ledford (84, HELMET)
- **Vibe:** Blue-collar. November football. Fans stand the whole game. Opponents leave sore.

### 3. Crestview Stags
- **Colors:** Burnt Orange `#F28C28` / Charcoal `#1C1C1C`
- **Motto:** *"Strike First, Strike Fast"*
- **Offense:** Spread RPO — shotgun, read one defender, hand off or throw. Tempo-driven, dual-threat QB. RB/WR/WR skill slots.
- **Defense:** Swarm Blitz — exotic pressure, Cover 0/1, chaos. High-risk, high-reward. Turnovers or touchdowns.
- **Stars:** QB Micah Strand (84, FLAME) / EDGE Keon "Chaos" Blackwell (84, SPEED_LINES)
- **Vibe:** Electric. Cowbell crowd. Wins 52-48 or loses 52-48. No middle ground.

### 4. Blackwater State Serpents
- **Colors:** Deep Purple `#2E0854` / Venom Green `#39FF14`
- **Motto:** *"Death by a Thousand Cuts"*
- **Offense:** Air Raid — 4-wide, same 5 concepts run relentlessly. Ball out in 2.5 seconds. Volume passing. SLOT/WR/WR skill slots.
- **Defense:** Pattern-Match / Disguise — show one coverage, play another. Rotate shells post-snap. Most complex but hardest to attack.
- **Stars:** SLOT Zion "Silk" Hayward (84, GLOVE) / S Solomon Vega (84, CLIPBOARD)
- **Vibe:** Cerebral. "The Pit." HC wears a tie. Opponents call it death by paper cuts.

### Counter-Play Dynamics
```
Sentinels → beat Serpents → beat Stags → beat Wolves → beat Sentinels
```
Each team has one natural prey and one natural predator. Neutral matchups come down to card play — exactly where TORCH shines.

---

## The Pre-Game Flow

### Home (unchanged)
Card fan hero, T(football)RCH wordmark, "KICK OFF" CTA. The visual north star.

### Team Select (NEW — single scroll, replaces 3 screens)
**Zone 1: Team Cards** — 2x2 grid of team cards (4 teams). Each shows helmet, team name, playstyle badge, star ratings, star player callout. Selected card gets green border pulse + scale lift. Broadcast-style "MATCHUP" banner across the top.

**Zone 2: Roster Reveal** — Appears after team selection. Two horizontal scroll rows (offense 7, defense 7) of `buildMaddenPlayer()` cards dealing in with staggered animation. Star players deal last with gold flash. Badge icon as hero element (replacing OVR number).

**Zone 3: Playbook Preview** — Full 10+10 play cards via `buildPlayV1()` in horizontal scroll rows. No drafting — all plays shown. "LOCK IN" CTA at bottom.

### Coin Toss (refined as broadcast moment)
Broadcast-style matchup banner (helmet vs helmet, team color split). Coin animation center. Torch card choice or "RECEIVE AT 50" below. Transition to gameplay via helmet crash + spark burst.

**Total: 3 screens (down from 6). Two taps to gameplay.**

---

## The Star Player Mechanic

### Recommended: "Heat Check" Activation System

**Dormant → On Fire → (optional) Clutch**

- Stars start dormant each game
- **Activate** when they make a big play: 10+ yard gain, badge combo fires, forced turnover, sack
- **When On Fire:** +4 OVR, enhanced badge combo (+5 bonus yards), pulsing flame border + ember particles
- **Deactivate** when opponent forces turnover/sack (offense star) or scores TD (defense star)
- **Clutch Factor** (optional Phase 3): In 4th quarter/2-minute drill while On Fire, badge combo auto-fires regardless of play type

### Implementation Priority
1. **Phase 1 (visual only):** Gold star icon, gold border, tagline on team select. ~2 hours.
2. **Phase 2 (Heat Check):** Activation/deactivation logic in snapResolver, OVR boost, flame border animation. ~4-6 hours.
3. **Phase 3 (Clutch Factor):** 4th quarter detection, auto-fire badge, unique celebrations. ~2-3 hours.

---

## The Player Quality Display

### Recommendation: Visual Tier Borders + Badge as Hero Element

**Drop the OVR number from cards.** Replace with badge icon as the centered visual element.

| Tier | OVR Range | Visual Treatment |
|------|-----------|-----------------|
| **Star** | 80-84 | Gold border (#FFB800) with subtle glow |
| **Starter** | 76-78 | Standard team-color border |
| **Reserve** | 72-74 | Muted/dimmed border, 50% opacity |

**Why:** OVR numbers confused non-football testers ("Is 82 good?"). Visual tiers (gold = best, normal = solid, muted = role player) communicate instantly without domain knowledge. The badge becomes the hero element because it directly supports the gameplay loop (badge-play combos).

**OVR stays in the engine** for all calculations — it just stops being displayed.

---

## Top 5 Onboarding Lessons Applied to TORCH

### 1. Zero Pre-Game Decisions for First Play
Every top game (Marvel Snap, Clash Royale, Hades, Subway Surfers) gives zero choices before the first game. TORCH should auto-assign team + roster for the first game. Team selection unlocks for game 2+.

### 2. The First Game IS the Tutorial
Don't explain badge combos, TORCH points, or play-action bonuses before gameplay. Teach each mechanic at the moment it's relevant: first snap teaches tap-to-play, first completion shows yardage, first combo introduces badges.

### 3. Make the First Game Unlosable
Hidden difficulty reduction: Easy AI, +3 yard bonus, no injuries, halved turnover rates. First TD should happen within 5-6 snaps. That TD celebration is the hook moment.

### 4. Progressive Disclosure
Hide 80% of systems initially. No torch cards, no difficulty settings, no full playbook on first game. Unlock features game by game: "You've proven yourself, Coach. Now build YOUR team."

### 5. Use Football as Cognitive Scaffolding
Players already know touchdowns, interceptions, first downs. Don't explain these. Only explain what's unique to TORCH: card-based play selection, badge combos, TORCH points. Even these can be introduced one per drive.

---

## Implementation Roadmap

### Phase 1: Data Layer (teams, rosters, plays)
- Create 4 team data files with 7v7 rosters
- Add `isStar`, `starTitle` fields to player data
- Add `tier` computed property (star/starter/reserve)
- Update play data for 4 team schemes

### Phase 2: Card Component Updates
- `buildMaddenPlayer`: Replace OVR number with badge icon, update border treatment by tier
- Add star player premium treatment (gold frame, star badge)

### Phase 3: Team Select Screen
- New `teamSelect.js` (replaces setup.js + draft.js + cardDraft.js)
- 2x2 team grid → roster reveal → playbook preview → LOCK IN
- All shared card builders used throughout

### Phase 4: Coin Toss Refinement
- Broadcast matchup banner (helmet vs helmet)
- Refined coin animation + torch card choice
- Transition to gameplay (helmet crash)

### Phase 5: Star Player Mechanic
- Heat Check activation/deactivation logic
- Visual treatment (flame border when activated)
- Commentary integration

### Phase 6: First-Time Player Flow
- Auto-assign team/roster for game 1
- Contextual teaching during first drive
- Hidden difficulty reduction
- Progressive feature unlock
