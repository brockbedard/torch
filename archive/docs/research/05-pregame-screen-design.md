# TORCH Pre-Game Screen Design
## Hybrid Card-Forward + Broadcast Presentation

**Date:** 2026-03-22
**Context:** Designing the pre-game flow from Home through Team Select through Coin Toss, replacing the current multi-step setup (team select + player draft + play draft + coin toss) with a streamlined, dramatic two-screen pre-game sequence.

---

## Research References

### Broadcast / Sports Presentation
- **ESPN College GameDay (2025 rebrand):** "Center Stage" concept anchors the package. Stadium atmosphere is the core design element. Helmets, gloves, and pageantry drive the visual language. Scalable system supporting 130+ teams. Half-tone dots, bold typography, team color dominance. ([NewscastStudio](https://www.newscaststudio.com/2025/09/19/espn-college-football-branding-design-graphics/), [Behance](https://www.behance.net/gallery/233649937/2025-ESPN-COLLEGE-FOOTBALL-REBRAND))
- **NFL Broadcast Graphics (2025):** Fox's typography-centric look swaps boxed elements for gradient-backed clean design. ESPN uses black-on-black with team color splashes and "venom" neon yellow accent. ([SportsvVideo Group](https://www.sportsvideo.org/2025/03/25/gridiron-graphics-national-broadcasters-discuss-the-latest-in-nfl-graphics-packages/))
- **NBA 2K26 Presentation:** Custom pregame intros with theme music and visual branding. Arena-specific light shows, pyrotechnic haze, LED wristband crowd effects. Playoff games get distinct graphic packages and commentator energy shifts. ([PlayStation Blog](https://blog.playstation.com/2025/08/06/nba-2k26-captures-authentic-nba-presentation-with-new-improvements/))

### Card / Mobile Game UI
- **Marvel Snap:** "Piano glass" dark UI with holographic light elements. Half-tone dots as comic homage. Location borders glow toward winning player. Simplified bottom HUD. Unique character animations (Ghost Rider's chain, Devil Dinosaur's roar). "Snapping" triggers dramatic light show + haptics. Design philosophy: approachable for casual players, fresh instead of copying existing card games. ([Tiffany Smart Portfolio](https://www.tiffanysmart.com/work/marvel-snap), [ArtStation](https://www.artstation.com/artwork/GemNDd))
- **Clash Royale:** Balance between simplicity and depth. Cartoonish exaggerated characters. VFX-heavy battle sequences. Lottie-format animations for cross-platform performance. ([Game UI Database](https://www.gameuidatabase.com/gameData.php?id=1299))
- **Fighting Game Character Select Patterns:** Grid of boxed portraits (heads/busts). Idle pose animation on hover/selection. Small stat bars (strength, speed, special). Navigation controls at bottom for thumb reach. ([Game UI Database](https://www.gameuidatabase.com/index.php?scrn=41))
- **EA FC Walkouts:** Silhouette tunnel walk reveals player identity. Firework / sprinkler effects signal card quality. 86+ OVR triggers walkout animation. Card rating drives reveal drama level. ([FifaUltimateTeam.it](https://www.fifaultimateteam.it/en/ea-fc-25-walkout-pack-opening-animation-unveiled-with-a-video/))

### Mobile Portrait UI Principles
- Portrait orientation = one-thumb play, top-left corner is hardest to reach.
- Content extending past screen edge signals scrollability.
- Simplicity wins: clean controls, clear info display, natural navigation.
- Hardcore vs casual balance: provide depth without overwhelming. ([BamBamTastic](https://bambamtastic.com/mobile-game-ui-design/))

---

## Design System Anchors (from Home Screen)

The home screen establishes TORCH's visual DNA. Every new screen must feel like entering a room in the same building.

| Element | Home Screen Implementation | Carry Forward |
|---------|---------------------------|---------------|
| **Background** | Warm scorched-black (#0A0804), radial warm light pools, noise texture, drifting bg layer | Every screen gets this base. Team Select adds team-colored light pools. |
| **Cards** | Three-card fan (offense/torch/defense backs), staggered deal animation, torch card premium glow | Team Select uses player cards as the hero visual. |
| **Typography** | Teko 700 for display (skewed -8deg, gold, heavy shadow), Rajdhani 700 for labels/buttons, Barlow Condensed for body | Consistent across all screens. |
| **Color System** | Gold (#FFB800) for titles/accent, Orange (#FF4511) for CTA/torch/brand, Cyan (#4DA6FF) for defense, Chartreuse (#7ACC00) for offense | Team colors layer ON TOP of this system, not replace it. |
| **Animation** | Ember particles, breathing glow, shimmer sweeps, cubic-bezier card deals | Every transition uses the same easing family. |
| **Button** | `.btn-blitz` with 4px border, 6px/10px box-shadow offset, uppercase Rajdhani | All CTAs use this. |

---

## Screen 1: Home (Unchanged)

The home screen is the visual north star. No changes needed. It establishes:
- Cards as hero elements (above the title, not below)
- The warm-dark atmosphere
- The TORCH wordmark with football-O
- "KICK OFF" as the singular CTA

**Transition to Team Select:** On "KICK OFF" tap, the card fan scales up and fades while the background warm pool intensifies, creating a seamless bridge to the team-colored world of Team Select.

---

## Screen 2: Team Select (NEW -- Replaces Team Select + Player Draft + Play Draft)

### Design Philosophy

This screen must accomplish what currently takes three screens (team select, player draft, play draft) in a single, scroll-based experience. The key insight from fighting games: **the character select screen IS the hype**. You don't rush through it -- you linger, you compare, you get excited about your choice.

The hybrid approach: **broadcast framing** (team colors, stat overlays, matchup graphics) wrapping **card-forward content** (player cards are the actual UI elements you interact with).

### Layout: Vertical Scroll, Three Zones

The screen is a single vertical scroll with three distinct zones that flow into each other. No tabs, no modals, no steppers. Just scroll down to go deeper.

```
+----------------------------------+
|  [TORCH header bar]    [< BACK]  |  Fixed header
+----------------------------------+
|                                  |
|  +-----------+  +-----------+    |  ZONE 1: Team Cards
|  |           |  |           |    |  (viewport height)
|  | CANYON    |  | IRON      |    |
|  | TECH      |  | RIDGE     |    |
|  |           |  |           |    |
|  | [helmet]  |  | [helmet]  |    |
|  | AIR RAID  |  | GROUND &  |    |
|  |           |  | POUND     |    |
|  | OFF ****  |  | OFF ***   |    |
|  | DEF ***   |  | DEF ****  |    |
|  +-----------+  +-----------+    |
|                                  |
|  [EASY] [MEDIUM] [HARD]         |  Difficulty row
|                                  |
+------ scroll boundary -----------+
|                                  |
|  ======= YOUR ROSTER ========   |  ZONE 2: Roster Reveal
|  (appears after team selected)   |  (auto-scrolls into view)
|                                  |
|  -- OFFENSE (7 players) --      |
|  [star] [card] [card] [card]    |  Horizontal scroll row
|                                  |
|  -- DEFENSE (7 players) --      |
|  [star] [card] [card] [card]    |  Horizontal scroll row
|                                  |
+------ scroll boundary -----------+
|                                  |
|  ====== YOUR PLAYBOOK =======   |  ZONE 3: Playbook
|  (appears after roster reveal)   |
|                                  |
|  -- OFFENSE PLAYS (10) --      |
|  [card] [card] [card] [card]    |  Horizontal scroll row
|                                  |
|  -- DEFENSE PLAYS (10) --      |
|  [card] [card] [card] [card]    |  Horizontal scroll row
|                                  |
|  [===== LOCK IN =====]         |  Final CTA
|                                  |
+----------------------------------+
```

### Zone 1: Team Cards (The Pick)

**Visual Treatment:** Two team cards side by side, each taking roughly 48% width with a 4% gap. They are tall cards (roughly 280px height on a 375px screen) that feel like choosing a faction.

**Information Hierarchy (per card, top to bottom):**
1. **Team helmet/icon** -- Large (64px), with team-colored glow halo behind it. CT gets a heat-haze shimmer, IR gets forge-spark particles (carried from current setup.js).
2. **Team name** -- Teko 700, 22px, white, letter-spacing 2px.
3. **Playstyle badge** -- Small pill/chip: "AIR RAID" in orange-on-dark or "GROUND & POUND" in red-on-dark. Rajdhani 600, 9px, uppercase.
4. **Star ratings** -- Compact 5-row: OFF/DEF/SPD/TGH/OVR with filled/empty stars in team accent color. Rajdhani 9px labels.
5. **Star player callout** -- Gold star icon + "VASQUEZ / SLOT / 82 OVR" or "TORRES / FB / 82 OVR". This is the "face of the franchise" hook.
6. **Stadium name** -- Bottom edge, muted text: "THE FURNACE" / "THE FORGE".

**Card Background:** Each card has a dark base (#141008) with a subtle diagonal gradient using the team's accent color at ~8% opacity. The selected card gets:
- A green (#00ff44) border pulse
- A scale(1.03) lift
- The unselected card dims to 60% opacity
- A "SELECTED" chip appears at top center with the green bar treatment from current setup.js

**Broadcast Element:** A thin "MATCHUP" banner runs across both cards at the top of Zone 1, styled like an ESPN lower-third: dark background, gold left-border accent, "TORCH MATCHUP" in Teko, auto-generated matchup line like "AIR RAID vs HARD NOSED" in Rajdhani muted text.

**Difficulty Row:** Below the team cards, three `.btn-blitz` buttons (EASY / MEDIUM / HARD) in green/gold/red. Same as current but tighter spacing.

### Zone 2: Roster Reveal (The Drama)

This zone is hidden until a team is selected. On team tap, it slides/fades into view and the screen auto-scrolls to bring it into the viewport. This is where the card-forward design shines.

**Entrance Animation:** When the team is selected, a 0.8s delay, then player cards deal in from the right with staggered timing (0.1s between cards), using the existing `dealMulti` cubic-bezier from cardMockup.js. The star player deals in LAST with a slightly larger scale and a brief gold flash.

**Layout: Two Horizontal Scroll Rows**

**Offense Row:**
- Section header: "OFFENSE" with chartreuse (#7ACC00) left-border accent, Teko 700 20px
- Horizontal scrolling row of 7 player cards (6 roster + the star player)
- Cards use `buildMaddenPlayer()` at 90x126 size (between draft and gameplay sizes)
- The star player card (highest OVR) is 1.15x scale with a gold border instead of the standard tier border, and a small gold star badge pinned to top-right corner
- Below each card: player nickname in Rajdhani 8px muted text (e.g., "THE GUNSLINGER", "SMOKE")

**Defense Row:**
- Same layout but with "DEFENSE" header using cyan (#4DA6FF) accent
- Star defender gets the same premium treatment

**Broadcast Element:** A stat comparison bar appears between offense and defense rows:
```
CT OFFENSE  ****  |  CT DEFENSE  ***
"BURN THE COVERAGE"   "SEND EVERYBODY"
```
Styled as a broadcast insert: dark glass background, team-colored left/right borders, Rajdhani typography.

### Zone 3: Playbook Preview (The Strategy)

After the roster reveal completes (all cards dealt), the playbook section fades in with a 0.5s delay. This gives players a preview of their full playbook before entering the game. Unlike the current flow, players do NOT draft plays -- they see all 10 and understand their team's identity.

**Layout: Two Horizontal Scroll Rows**

**Offense Plays:**
- Section header: "PLAYBOOK - OFFENSE" with chartreuse accent
- 10 play cards in horizontal scroll, using `buildPlayV1()` at 80x110 (gameplay size)
- Grouped visually by category (SHORT/QUICK/DEEP/SCREEN/RUN clusters)

**Defense Plays:**
- Section header: "PLAYBOOK - DEFENSE" with cyan accent
- 10 defensive play cards, same treatment

**Broadcast Element:** A "SCOUTING REPORT" insert appears below each playbook row with a one-line team personality summary:
- CT Offense: "10 plays. 7 pass. Air Raid lives here."
- CT Defense: "Cover 0 is home base. Bring the heat."
- IR Offense: "Triple option. Power. Control the clock."
- IR Defense: "Zone discipline. Read and react."

### Final CTA: "LOCK IN"

A full-width `.btn-blitz` at the bottom of the scroll:
- Disabled state: "SELECT A TEAM" (gray, muted)
- Ready state: "LOCK IN" with gold-to-orange gradient background, orange border, breathing glow animation (same as home screen CTA)
- On tap: all visible cards flip to their backs simultaneously (0.3s), then the screen transitions to coin toss

### Transition to Coin Toss

On "LOCK IN" tap:
1. All player/play cards flip face-down (card backs) with a cascading 0.05s stagger
2. The screen darkens (black overlay fades to 80% over 0.5s)
3. The team helmet zooms to center screen with team-colored glow
4. Cross-dissolve to coin toss screen

---

## Screen 3: Coin Toss (Redesigned as a Broadcast Moment)

### Recommendation: Keep as Its Own Screen, But Make It Feel Like a TV Broadcast Coin Toss

The coin toss should NOT be folded into team select (it would reduce its dramatic weight) and should NOT be just a transition (it contains meaningful player choice -- torch card vs receive). Instead, make it feel like the broadcast moment before kickoff: camera on the 50-yard line, captains meeting, the coin in the air.

### Layout

```
+----------------------------------+
|                                  |
|  [team helmet]  VS  [team helm]  |  Matchup banner
|  CANYON TECH    vs   IRON RIDGE  |
|                                  |
+------ broadcast bar -------------+
|                                  |
|         [ COIN ]                 |  Spinning coin (center)
|                                  |
|     "FLIPPING..."               |  Status text
|     then: "YOU WIN THE TOSS!"   |
|                                  |
+----------------------------------+
|                                  |
|  CHOOSE YOUR REWARD              |
|                                  |
|  [torch] [torch] [torch]        |  3 Torch Card options
|                                  |
|  -------- OR --------           |
|                                  |
|  [=== RECEIVE AT 50 ===]        |  Alternative CTA
|                                  |
+----------------------------------+
```

### Visual Treatment

**Matchup Banner (top):**
A broadcast-style matchup graphic occupies the top 25% of the screen. Two team helmets face each other with a "VS" element between them (using the existing `.vs-circle` but refined):
- Left side: team-colored gradient (user's team accent at 15% opacity)
- Right side: opponent team color at 15% opacity
- Center: "VS" in a small circle, pulsing with torch orange
- Below helmets: team names in Teko 700, 18px
- Below names: team records/playstyle in Rajdhani 9px muted
- A diagonal slash or chevron pattern divides the two halves (broadcast-style split screen)

This matchup banner is the **broadcast DNA**. It looks like an ESPN pregame graphic -- clean team color blocking, helmet art, stat comparison.

**Coin Animation (center):**
- The coin is a 80px gold disc with a football embossed on it (current implementation but refined)
- Spin animation: 1.5s rotateY(1080deg) with ease-out
- On land: a burst of ember particles radiates outward from the coin
- The result text appears with the existing `fadeSlideUp` animation

**Torch Card Choice (bottom):**
- Three torch cards from `buildTorchCard()` at 90x130
- Cards deal in from below with staggered timing after the coin lands
- Selected card does the existing scale(1.2) + translateY(-20px) + gold glow animation
- "OR" divider is a thin line with muted text
- "RECEIVE AT 50" button uses `.btn-blitz` with gold treatment

**CPU Win Scenario:**
- The matchup banner still shows, establishing the opponent
- CPU's chosen card animates with `cardStolen` (existing) -- flies up and away
- A broadcast-style lower-third slides in: "[OPPONENT] takes [CARD NAME]. You receive at the 50."
- "PLAY BALL" button appears with a 1.5s delay

### Transition to Gameplay

On final choice:
1. The matchup banner expands to fill the screen (0.4s)
2. Both helmets crash together at center (callback to the helmet crash animation in gameplay)
3. Spark burst at collision point
4. Flash to white (0.1s) then fade to gameplay field
5. The field materializes from the center outward

---

## How the Hybrid Card-Forward + Broadcast Style Manifests

### Card-Forward Elements
- **Player cards ARE the roster display** -- not text lists, not avatar grids. The actual `buildMaddenPlayer()` cards with OVR ratings, helmet art, tier borders, and team colors.
- **Play cards ARE the playbook** -- `buildPlayV1()` cards with category stripes, diagrams, and risk indicators.
- **Torch cards ARE the coin toss reward** -- `buildTorchCard()` with tier borders and flame art.
- **Card dealing animations** establish rhythm and drama. Every reveal is a deal, not a fade.
- **Card flipping** is the transition mechanism (face-down to face-up for reveals, face-up to face-down for exits).

### Broadcast Elements
- **Matchup banners** frame every screen with team-color split graphics (ESPN/Fox style).
- **Lower-third inserts** deliver contextual information (scouting reports, stat comparisons) in broadcast typography.
- **The "VS" graphic** at coin toss mimics pregame show team comparison screens.
- **Stat comparison bars** use the broadcast convention of side-by-side metrics with team colors.
- **Section headers** ("YOUR ROSTER", "YOUR PLAYBOOK", "CHOOSE YOUR REWARD") use the broadcast "topic banner" pattern: dark glass background, colored left-border accent, uppercase Teko typography.

### Where They Merge
The fusion happens when card content sits inside broadcast framing. A player card isn't just floating in space -- it's inside a "ROSTER REVEAL" broadcast segment. Torch cards aren't just options -- they're inside a "COIN TOSS" broadcast event. The broadcast frame gives structure and narrative; the cards give tactile, collectible-feeling content.

---

## Animation Budget

Every animation should use CSS only (no JS animation libraries). Key curves:
- **Card deals:** `cubic-bezier(0.22, 1.3, 0.36, 1)` -- the existing overshoot ease from cardMockup.js
- **Reveals:** `ease-out` 0.4s for slides, 0.3s for fades
- **Breathing glows:** 3s ease-in-out infinite (existing `ctaGlow` pattern)
- **Transitions between screens:** 0.5-0.8s total, never longer

Stagger timing for card deals:
- 3 cards: 0s, 0.12s, 0.24s (existing from home screen)
- 7 cards (roster row): 0s, 0.08s, 0.16s, 0.24s, 0.32s, 0.40s, 0.48s (star player last at 0.56s with gold flash)
- 10 cards (playbook): 0s through 0.72s at 0.08s intervals

---

## Mobile Portrait Considerations (375px minimum)

### Team Cards (Zone 1)
- Two cards side by side: each ~170px wide with 8px gap on 375px screen (leaving 27px total padding)
- Card height: ~280px to stay within viewport with header and difficulty row
- Star ratings use 14px font for stars, 9px for labels -- proven readable at current setup.js sizes
- Helmet icon at 48px minimum for tap target compliance

### Roster Cards (Zone 2)
- Player cards at 90x126: 4 visible at a time in horizontal scroll on 375px screen
- 12px gap between cards, 14px left padding
- Scroll indicator: partial card visible at right edge (the "peek" pattern)
- Star player gets 1.15x scale = 103x145, still fits comfortably

### Playbook Cards (Zone 3)
- Play cards at 80x110: 4 visible at a time
- Same scroll treatment as roster

### Touch Targets
- All cards are minimum 80px wide (exceeds 48px minimum tap target)
- Difficulty buttons span full width / 3 with 10px gaps
- "LOCK IN" button is full-width, 48px+ tall
- Bottom-of-screen CTA placement = thumb-friendly

---

## Scope Reduction vs Current Flow

| Current | New | Benefit |
|---------|-----|---------|
| 4-step progress stepper (TEAM / PLAYERS / PLAYS / START) | Single scroll screen | Less cognitive overhead, faster to game |
| Player draft (pick 4 offense + 4 defense from 6) | Full roster reveal (all 7 per side shown) | More drama, less decision fatigue, see whole team identity |
| Play draft (pick 4 offense + 4 defense from 10) | Full playbook preview (all 10 per side shown) | Strategy is in-game card selection, not pre-game drafting |
| Separate coin toss screen | Refined coin toss with broadcast matchup graphic | Higher production value, clearer visual bridge to gameplay |

**Key design decision:** By showing the FULL roster (7 offense + 7 defense) and FULL playbook (10 offense + 10 defense) instead of drafting subsets, we trade pre-game decision complexity for in-game hand management depth. The draft was a speed bump; the game itself is where card selection matters.

---

## Future Expansion: 4-Team Support

The current game has 2 teams. The design accommodates 4 teams by changing Zone 1 from a 2-column layout to a 2x2 grid:

```
+----------------------------------+
|  [Team 1]         [Team 2]      |
|  Canyon Tech      Iron Ridge     |
+----------------------------------+
|  [Team 3]         [Team 4]      |
|  ???              ???            |
+----------------------------------+
```

Each team card would shrink to ~170px tall (from 280px) to fit 2 rows in viewport. The selected card would expand/highlight while others dim. The horizontal scroll roster reveal pattern scales to any team without layout changes.

Alternatively, a horizontal carousel (swipe between teams) would preserve the tall-card drama for 4+ teams while keeping the portrait-friendly single-column flow.

---

## Implementation Notes

### Files to Create/Modify
- `src/ui/screens/teamSelect.js` -- New file, replaces setup.js + draft.js + cardDraft.js
- `src/ui/screens/coinToss.js` -- Modify existing with matchup banner and refined layout
- `src/style.css` -- Add new keyframes for roster deal, playbook reveal, screen transitions
- `src/main.js` -- Update router to remove draft/cardDraft screens, add teamSelect

### Files to Deprecate
- `src/ui/screens/setup.js` -- Replaced by teamSelect.js
- `src/ui/screens/draft.js` -- Roster is shown, not drafted
- `src/ui/screens/cardDraft.js` -- Playbook is shown, not drafted
- `src/ui/components/draftProgress.js` -- No more progress stepper

### Shared Components Used
All card rendering comes from `src/ui/components/cards.js`:
- `buildMaddenPlayer()` for roster display
- `buildPlayV1()` for playbook display
- `buildTorchCard()` for coin toss options
- `buildHomeCard()` for card-flip transitions (showing card backs)

### State Changes
The `setGs()` call on "LOCK IN" should set:
```js
{
  screen: 'coinToss',
  team: selectedTeamId,
  difficulty: selectedDifficulty,
  offRoster: allOffensePlayers,  // Full 7, not drafted 4
  defRoster: allDefensePlayers,  // Full 7, not drafted 4
  offHand: allOffensePlays,      // Full 10, not drafted 4
  defHand: allDefensePlays,      // Full 10, not drafted 4
}
```

The gameplay screen's hand management (which 4 cards are "in hand" vs "in deck") becomes the strategic layer that replaces pre-game drafting.

---

## Summary

The pre-game flow becomes:

1. **Home** -- Card fan hero, "KICK OFF" (unchanged)
2. **Team Select** -- Single scroll: pick team + see roster + see playbook + "LOCK IN"
3. **Coin Toss** -- Broadcast matchup graphic + coin flip + torch card choice + "PLAY BALL"
4. **Gameplay** -- Field materializes, first possession begins

Three screens instead of six. Every screen uses cards as its primary visual language, framed by broadcast-style graphics. The warm scorched-black atmosphere, Teko/Rajdhani typography, and orange-gold-blue color system carry through consistently.
