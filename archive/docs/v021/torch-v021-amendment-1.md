# TORCH v0.21 — Spec Amendment #1

**Date:** 2026-03-22
**Applies to:** `docs/TORCH-V021-SPEC.md`
**Decisions made:** Hand management, opponent selection, TORCH card system, defensive play renaming

---

## Amendment 1: Hand Management — Option D (5 visible, swap 1)

### How It Works
- Each side (offense and defense) has a **playbook of 10 plays**
- At game start, **draw 5 randomly** from the 10. These are your visible hand.
- The remaining 5 form a face-down **deck** (order randomized)
- Each snap: pick 1 play from your hand of 5 → play resolves → played card goes to **bottom of deck** → draw 1 from **top of deck** into your hand
- You always have exactly **5 cards in hand**
- Over ~10 snaps, you cycle through all 10 plays roughly once

### Why Option D
- Clash Royale uses this exact system (play 1 of 4, next card queues from 8-card deck)
- Creates plannable-but-not-static decisions: "Hail Mary is 2 draws away, do I stall?"
- 5 cards fits mobile portrait well (slightly wider than current 4-card tray)
- Every play gets seen — no card is permanently buried

### UI Implications
- Card tray at bottom of gameplay screen shows 5 cards (currently shows 4)
- Card tray width: 5 cards × 68px + 4 gaps × 6px = 364px (fits 375px screen with ~5px padding each side)
- "Next card" indicator optional: show the top of the deck card as a dimmed peek at the right edge
- When a card is played, it slides out of the tray. New card slides in from the right (deal animation).

### Engine Changes
```js
// In gameState.js
offenseHand: [],     // 5 play objects (visible)
offenseDeck: [],     // 5 play objects (face down, ordered)
defenseHand: [],
defenseDeck: [],

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

### Interaction with Hot Route TORCH Card
Hot Route discards your entire hand of 5 and draws 5 fresh. Implementation:
```js
function hotRoute(hand, deck) {
  const combined = [...hand, ...deck].sort(() => Math.random() - 0.5);
  return { hand: combined.slice(0, 5), deck: combined.slice(5) };
}
```

---

## Amendment 2: Opponent Selection — Season Cycle

### How It Works
- A **season** = 3 games against the 3 teams you didn't pick
- Order is fixed based on the counter-play matrix: you play your **neutral matchup first**, your **prey second**, your **predator third** (escalating difficulty)
- Beat all 3 = season complete. Unlock: next difficulty tier, new TORCH cards for the catalog, season score recorded.

### Season Order by Team

| Your Team | Game 1 (neutral) | Game 2 (favorable) | Game 3 (tough) |
|-----------|------------------|-------------------|----------------|
| Sentinels | Stags | Serpents | Wolves |
| Wolves | Serpents | Sentinels | Stags |
| Stags | Wolves | Stags... | ... |

**Note:** Exact order needs tuning based on the counter-play matrix. The principle is: easiest matchup first, hardest last. Claude Code should calculate this from the STRONG/WEAK/NEUTRAL relationships.

### Between-Game Flow
1. Game ends → End Game screen (stats, TORCH points, season record)
2. "NEXT GAME" button → Between-Game Shop (spend carried-over points)
3. "CONTINUE" → Coin toss transition → Game 2 gameplay

### Season Score
- Season score = sum of TORCH points across all 3 games (after spending)
- Win bonus: +100 TORCH points per win
- Season complete bonus: +200 TORCH points for winning all 3
- This creates the core tension: spend points on cards to win, or save them for a higher season score

### State Changes
```js
{
  season: {
    team: 'sentinels',
    difficulty: 'MEDIUM',
    opponents: ['stags', 'serpents', 'wolves'],  // fixed order
    currentGame: 0,     // 0, 1, 2
    results: [],        // [{won: true, score: 145}, ...]
    totalScore: 0,      // running season total
    torchCards: [],      // persisted cards (max 3)
    carryoverPoints: 0,  // unspent points from previous game
  }
}
```

---

## Amendment 3: TORCH Card System — Complete Redesign

### Core Philosophy
- TORCH points = your score AND your wallet
- Buying cards spends your score — the signature tension
- Cards persist across the 3-game season
- 3 inventory slots (tight, forces choices)
- Shop opens at big moments, not just halftime

### v1 Card Roster (8 cards)

#### Gold Tier (40-50 pts)

| Card | Cost | Type | Effect |
|------|------|------|--------|
| **Scout Team** | 45 | Pre-snap | See the opponent's play card before you pick yours this snap |
| **Sure Hands** | 50 | Reactive | Cancel a turnover on this snap. Played AFTER seeing an INT or fumble |

#### Silver Tier (20-30 pts)

| Card | Cost | Type | Effect |
|------|------|------|--------|
| **Hard Count** | 25 | Pre-snap | Force opponent to discard their chosen play and pick a random replacement |
| **Hot Route** | 25 | Pre-snap | Discard your full 5-card play hand, draw 5 fresh from your playbook |
| **Flag on the Play** | 25 | Reactive (DEF) | After opponent gains 10+ yards, 75% chance play is called back to scrimmage. 25% flag picked up |
| **Onside Kick** | 20 | Post-TD | After scoring a TD, 35% chance you recover at the 50 and keep the ball |

#### Bronze Tier (10-20 pts)

| Card | Cost | Type | Effect |
|------|------|------|--------|
| **12th Man** | 15 | Pre-snap | +4 yards and double TORCH points earned this snap |
| **Ice** | 15 | Pre-snap | Freeze opponent's featured player. Zero OVR bonus, no badge combo this snap |

### Card Types
- **Pre-snap:** Attached to your combo before hitting SNAP. One per snap maximum.
- **Reactive:** Held in reserve. Played AFTER seeing the snap result. One per snap maximum. Opponent can see you have one but not which one.
- **Post-TD:** Triggered during the scoring sequence, before the conversion attempt.

### Inventory Rules
- **3 slots total.** Any combination of card types.
- **Duplicates allowed.** You can hold two 12th Man cards.
- **One pre-snap card per snap.** Cannot stack.
- **One reactive card per snap.** Can fire alongside a pre-snap card (max 2 TORCH cards on a single snap).
- **If you're full (3/3) and the shop offers something, you must discard one to make room or pass.**

### Shop System

#### When the Shop Opens (Trigger Moments)
The shop slides up as a bottom sheet after these moments. It shows **1 card** (random from the catalog, weighted by tier based on the trigger).

| Trigger | Cards Shown | Tier Weighting |
|---------|-------------|----------------|
| Touchdown scored (yours) | 1 | 40% Bronze, 40% Silver, 20% Gold |
| Forced turnover (INT/fumble) | 1 | 40% Bronze, 40% Silver, 20% Gold |
| 4th down stop | 1 | 60% Bronze, 30% Silver, 10% Gold |
| Star player goes On Fire | 1 | 50% Bronze, 35% Silver, 15% Gold |
| Halftime | 3 | 30% Bronze, 40% Silver, 30% Gold |
| Between-game (season) | 3 | 20% Bronze, 40% Silver, 40% Gold |

#### Shop Interaction Flow
1. Big moment celebration plays out fully (TD rain, turnover crack, etc.)
2. Shop bottom sheet slides up. Shows card name, tier, cost, 1-line effect description.
3. Player taps **BUY** (points deducted, card added to inventory) or **PASS** (shop closes)
4. If inventory is full (3/3), BUY shows a "swap" interface: tap the card you want to drop, then confirm.
5. Shop slides down. Game continues.
6. **Total interaction time: 1-3 seconds.** The shop must never feel like an interruption.

#### Halftime & Between-Game Shop
- Shows **3 cards** instead of 1
- Player can buy any, all, or none
- Same swap mechanic if inventory is full
- Halftime shop appears after the halftime stat summary
- Between-game shop appears after the end-game screen, before the next game's coin toss

### Season Persistence
- **Cards persist** across all 3 games in a season
- **TORCH points carry over** between games (unspent points from game 1 are available in game 2)
- **Used cards are gone forever** (single-use within the season)
- **Season reset:** When a new season starts, all cards and points reset to 0

### First-Time Player Experience
- **Game 1, first big moment:** The shop appears with a Bronze card (12th Man or Ice, guaranteed). A brief tooltip explains: "TORCH cards give you an edge. Buy with your points — but remember, points are also your score!"
- **Game 1, halftime:** First time seeing 3 cards at once. No tooltip needed — the system is learned.
- **Game 2 start:** If player has cards from game 1, a brief "Your cards carry over" indicator shows inventory.

### AI TORCH Card Behavior

| Difficulty | Starting Cards | Shop Behavior | Usage |
|------------|---------------|---------------|-------|
| Easy | 0 cards | Never buys | Never uses |
| Medium | 0 cards | Buys Bronze only, 50% of the time | Uses at reasonable moments |
| Hard | Starts with 1 random Silver | Buys best available, always | Uses optimally (Scout Team on 3rd & long, Sure Hands on risky throws) |

### v2+ Unlock Cards (not in v1 build)
After completing first season, unlock 2-3 additional cards:
- **Prime Time** (Silver, 25pts) — Max power for one snap
- **Challenge Flag** (Silver, 25pts) — Challenge specific play elements
- **Double Down** (Gold, 45pts) — Play two play cards, use better matchup

After completing season on Medium, unlock:
- **Trick Play** (Silver, 20pts) — Hidden from AI, double points
- **Next Man Up** (Bronze, 10pts) — Bench swap

After completing season on Hard, unlock:
- **Trade Deadline** (Gold, 50pts) — Steal opponent's play permanently
- **Fake Kneel** (Silver, 25pts) — 2-minute drill deception

---

## Amendment 4: Defensive Play Names — Simplified Across All 4 Teams

All defensive play cards must use approachable, action-oriented names. Replace football jargon with plain language. Keep the underlying scheme accurate — only the player-facing name and flavor text change.

### Sentinels Defense (Press Man / Cover 1) — REVISED

| Old Name | New Name | Category | Risk | Flavor |
|----------|----------|----------|------|--------|
| Cover 1 Press | Press & Trail | PRESS COVERAGE | MED | Get in his face, stay on his hip |
| Cover 1 Robber | Lurk Underneath | HYBRID | MED | Bait the throw, jump the route |
| Cover 1 Hole | Plug the Middle | MAN COVERAGE | LOW | Nothing through the center |
| Cover 1 Rat | QB Shadow | SPY | MED | Wherever he goes, I go |
| Man Under Blitz | All-Out Rush | BLITZ | HIGH | No help, everyone's coming |
| Bracket Coverage | Double Team | MAN COVERAGE | LOW | Two on their best weapon |
| Trail Technique | Mirror Match | PRESS COVERAGE | MED | Stride for stride, hip to hip |
| Press Bail | Fake Press | MAN COVERAGE | LOW | Show press, drop deep |
| Double Mug Blitz | A-Gap Overload | BLITZ | HIGH | Both backers, right up the gut |
| Robber Squeeze | Bait & Take | HYBRID | MED | Let him throw it, then take it |

### Wolves Defense (Cover 3 Zone / Scrape Exchange) — REVISED

| Old Name | New Name | Category | Risk | Flavor |
|----------|----------|----------|------|--------|
| Cover 3 Buzz | Three Deep Shell | ZONE COVERAGE | LOW | Three deep, four underneath |
| Scrape Exchange | Gap Swap | HYBRID | MED | Switch gaps, confuse the read |
| Cover 3 Cloud | Cloud Corner | ZONE COVERAGE | LOW | Flat defender jumps the short stuff |
| Spill & Rally | Force Outside | ZONE COVERAGE | LOW | Push it wide, gang tackle |
| Cover 4 Quarters | Four Across | ZONE COVERAGE | LOW | Four deep, take away the big play |
| Under Front Slant | Crash Inside | BLITZ | MED | Everybody shifts, nobody's where you think |
| Bracket Seam | Wall Off the Middle | ZONE COVERAGE | MED | Two guys own the seam |
| Sky Coverage | Safety Rolls Down | HYBRID | MED | Safety sneaks into the flat |
| Bear Front Stuff | Stack the Box | BLITZ | MED | Extra man at the line, dare you to throw |
| Zone Blitz Weak | Delayed Rush | BLITZ | MED | Drop one, send one you didn't expect |

### Stags Defense (Swarm Blitz / Cover 0) — REVISED

| Old Name | New Name | Category | Risk | Flavor |
|----------|----------|----------|------|--------|
| Cover 0 Blitz | Zero Blitz | PRESS COVERAGE | HIGH | No safety, max pressure, all or nothing |
| Fire Zone | Overload Rush | BLITZ | HIGH | Flood one side with rushers |
| Sim Pressure | Fake Blitz | HYBRID | MED | Show six, rush four, drop two |
| Cover 1 Dog | One-High Rush | BLITZ | HIGH | One safety deep, everyone else attacks |
| Zone Dog | Zone Drop Blitz | BLITZ | MED | Blitz two, zone the rest |
| Double A-Gap Mug | Twin Rush | BLITZ | HIGH | Both inside backers through the middle |
| Green Dog | Spy Release | SPY | MED | Spy the back, rush if he stays in |
| Corner Blitz | Edge Sneak | BLITZ | HIGH | Corner comes off the edge, nobody sees it |
| Nickel Fire | Quick Flood | BLITZ | HIGH | Five rush, man behind it |
| Tampa Robber | Sit & Read | ZONE COVERAGE | LOW | Drop deep, read the QB's eyes |

### Serpents Defense (Pattern Match / Disguise) — REVISED

| Old Name | New Name | Category | Risk | Flavor |
|----------|----------|----------|------|--------|
| Rip Match | Match Right | HYBRID | MED | Read the route, lock on right |
| Liz Match | Match Left | HYBRID | MED | Mirror image, same trap left |
| Quarters Match | Four-Man Read | ZONE COVERAGE | LOW | Four deep, each one locks a man |
| MABLE | Man-Zone Blend | HYBRID | MED | Starts zone, becomes man |
| Cover 2 Trap | Two-Deep Sit | ZONE COVERAGE | LOW | Sit back, read the QB |
| Late Rotate | Delayed Switch | HYBRID | MED | Wait, wait... now move |
| Sim Pressure | Fake Rush | BLITZ | MED | Show blitz, drop to coverage |
| Palms Coverage | Outside Lock | ZONE COVERAGE | LOW | Lock the outside two, zone the rest |
| Tampa 2 Match | Deep Middle Drop | ZONE COVERAGE | LOW | Linebacker sprints to deep center |
| Bracket Disguise | Hidden Bracket | MAN COVERAGE | MED | You think you know, you don't |

---

## Summary of All Decisions

| Decision | Choice |
|----------|--------|
| Hand management | Option D: 5 visible, swap 1 per snap. Cycle through all 10. |
| Opponent selection | Season cycle: face all 3 other teams in order, escalating difficulty |
| TORCH points | Score = wallet. Spend your score to buy cards. |
| Card persistence | Cards persist across 3-game season. Points carry over. |
| Inventory slots | 3 slots. Tight, forces choices. |
| Shop frequency | Opens at every trigger moment (TD, turnover, 4th stop, star activation, halftime, between-game) |
| Shop format | 1 random card, tier-weighted by trigger. Halftime/between-game show 3. |
| v1 card count | 8 cards (2 Gold, 4 Silver, 2 Bronze) |
| v1 roster | Scout Team, Sure Hands, Hard Count, Hot Route, Flag on the Play, Onside Kick, 12th Man, Ice |
| Defensive names | Simplified across all 4 teams — approachable, action-oriented |
| Between-game shop | Yes — spend carried-over points between season games |
| First-time experience | Bronze card guaranteed at first shop. Brief tooltip on first appearance. |
| Difficulty on first game | Hidden. Auto-Easy. Revealed at game 2 with "Choose your challenge." |
| Onboarding approach | Progressive disclosure — no tutorial screens, learn by playing |

---

## Amendment 5: Progressive Disclosure — Learn As You Go

### Core Principles
1. **Don't explain, reveal.** No mechanic is explained before it's needed. Every system arrives at the moment it becomes relevant.
2. **Engineer the first success.** AI on Easy deliberately plays weak coverage on snaps 2-3 so the badge combo fires. First TD within 5-6 snaps. First shop guaranteed Bronze card.
3. **Same pattern, new context.** Offense and defense use identical interaction (tap play → tap player → SNAP). Learn once, apply twice.
4. **Three things are NEVER explicitly explained:** Flame pip ratings (more = better is universal), football rules (cultural knowledge), card cycling (watching it teaches itself).

### First-Time Player State Machine

The game tracks `isFirstSeason: true` in state. This flag controls what's shown, hidden, and taught. It flips to `false` after the first season is completed.

### Home Screen (first launch)
- Player sees card fan hero, TORCH wordmark, KICK OFF button
- Zero explanation. One button. Tap it.
- **Hidden:** TORCH points, cards, seasons, difficulty — all invisible

### Team Select (first visit)
- 2x2 grid appears with brief pulse animation
- **One tooltip:** "Each team plays differently. Tap to choose." Dismisses on tap anywhere.
- **Hidden:** Difficulty selector (auto-set to Easy). Appears starting game 2.
- **Shown but not explained:** Flame pip ratings (players naturally read "more flames = better")
- **Hidden:** Counter-play matrix, season structure, opponent order

### Coin Toss (first game)
- Helmet vs helmet matchup, coin spin, auto-resolve. 3-second hype animation.
- **Hidden:** No torch card choice, no receive/kick decision

### First Snap (~12 seconds from app open)
- Play cards appear in hand (5 cards). Player cards shown above. SNAP button visible.
- **Teach sequence (pulsing highlights, one at a time):**
  1. Pulsing highlight on one play card → "Tap a play to call it"
  2. After selection, pulsing highlight on one player card → "Now pick who runs it"
  3. SNAP button pulses gold → "Hit SNAP!"
- **Hidden:** TORCH card slot exists but is empty and dimmed. No explanation.
- **Hidden:** Badge combos, matchup quality, TORCH points — running in engine but not highlighted.

### First Play Result (~20 seconds)
- Commentary plays, yardage shows, ball moves, down/distance updates
- No tooltip needed — football context does the teaching
- Played card slides out, new card slides in — player sees hand cycling for first time

### First Badge Combo (engineered to fire snap 2-3)
- Badge icon flashes on player card. "+3 yards! COMBO!" brief highlight.
- **Teach:** One-line tooltip: "Match the right player with the right play for bonus yards!" Auto-dismisses after 2 seconds.
- **Engine note:** AI on Easy MUST call weak coverage on snaps 2-3 so the combo fires. Don't leave this to chance.

### First Touchdown (engineered within 5-6 snaps)
- Full TD celebration: footballs rain, green flash, screen shake, crowd roar. THIS IS THE HOOK MOMENT.
- TORCH points fly to scoreboard for the first time. Counter animates up.
- **Teach:** Brief flash text: "TORCH points are your score — and your wallet."
- **First shop opens.** Guaranteed Bronze card (12th Man or Ice).
- **Teach:** Shop tooltip: "Spend points on TORCH cards for an edge. Buy it or pass!"

### First TORCH Card Used (~2-3 minutes)
- If player bought a card, TORCH card slot pulses on next snap: "Tap your TORCH card to use it before you SNAP."
- Card effect fires with special visual treatment. Card disappears (single-use).
- If player passed at shop, no teach moment — they'll see the shop again at next trigger.

### First Defense (first time on other side of ball)
- Energy shift to cold blue. Defensive players and plays appear.
- No tooltip needed — same interaction pattern as offense.

### Halftime (first game)
- Halftime stat summary (first time seeing full stats)
- Halftime shop shows 3 cards. Player sees Silver and possibly Gold for first time.
- If inventory full (3/3), first "swap" experience: "Your slots are full. Drop a card to make room, or pass."

### End of Game 1
- End game screen with final score, stats, TORCH points breakdown
- **Season reveal:** "GAME 1 OF 3 COMPLETE. Next opponent: [Team]." First time player sees the season structure.
- Between-game shop: "Your cards and points carry over. Stock up for game 2."

### Game 2 — New Reveals
- **Difficulty selector appears** on team select: "You've proven yourself, Coach. Choose your challenge." (Easy pre-selected, Medium and Hard now visible)
- Opponent is pre-set (season cycle). Player sees the matchup.
- **Star Heat Check** activates for the first time on a big play. Flame border, "ON FIRE" visual.

### Game 3 — Final Reveals
- Hardest opponent (counter-play predator). Player feels the matchup disadvantage.
- If player loses, end screen hints: "The Wolves' zone shuts down your passing. Try a different team next season?"

### Season 2+ — Progressive Unlocks
- 2-3 new TORCH cards added to catalog (Prime Time, Challenge Flag, Double Down)
- Medium/Hard difficulty available if not already unlocked
- Season score tracking and personal bests
- `isFirstSeason` flag set to `false` — all teach tooltips permanently disabled

### First-Game Engine Modifications (when `isFirstSeason: true && season.currentGame === 0`)
```js
{
  // Hidden difficulty reduction
  difficulty: 'EASY',
  firstGameMods: {
    playerYardBonus: +3,          // Extra yards on top of Easy bonus
    aiNever4thDown: true,         // AI punts on 4th (less confusing)
    noInjuries: true,             // Remove injury system for game 1
    turnoverRateMultiplier: 0.5,  // Halve INT/fumble rates
    forceWeakCoverageSnap2: true, // Guarantee badge combo fires early
    forceWeakCoverageSnap3: true,
    firstShopGuaranteedBronze: true,
  }
}
```

### Tooltip Implementation
All first-time tooltips use the same component:
- Dark semi-transparent backdrop behind target element
- White text, Rajdhani 600, 13px
- Appears with 0.3s fade-in
- Dismisses on any tap (not just the tooltip)
- Each tooltip has a unique ID tracked in `localStorage` — once dismissed, never shown again
- Max 1 tooltip per screen transition. Never stack.
