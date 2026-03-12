# TORCH — Game Design Document
## v0.7 "First Testable Build" Spec
**Last updated:** March 12, 2026
**Status:** Pre-build specification — ready for Claude Code implementation

---

## What Is TORCH

TORCH is a daily football card game. You pick offense or defense, draft your hand, and play cards one snap at a time against an AI opponent. Neither side knows what the other called. Cards clash, results reveal, and the drive plays out with real down-and-distance, a ticking clock, and a scoreboard.

The core question every snap: **"What would you call here?"**

The game teaches football through play. You never see a textbook. You learn by pattern recognition — run a slant against a certain look, get stuffed, remember it next time. Over days and weeks, players build football instincts without being taught.

---

## Design Principles

1. **The Wordle model** — One scenario per day. Win or lose, share your result, come back tomorrow.
2. **Neither side knows** — Offense and defense pick simultaneously. The drama is in the reveal.
3. **Learn by playing, not by reading** — The game never tells you what beats what. You discover it.
4. **Planning + improvisation** — You draft a game plan (pick 5 from 10), but random draws force adaptation.
5. **Accessible on the surface, deep underneath** — Anyone can pick a card. Football nerds will pick the right one.
6. **NFL Blitz energy, not Madden simulation** — Fast, dramatic, fun. Not a textbook.

---

## Daily Flow

### Win Path (maximum engagement)
1. Open app → Home Screen
2. Tap "Play Today's Torch"
3. Pick your team → Pick offense or defense
4. Draft 5 cards from 10
5. Play the scenario (one drive, real football)
6. **Win** → Share result → Unlock bonus round as the OTHER side
7. Play bonus round → Share combined result → Done for today

### Loss/Tie Path
1–6 same as above
6. **Tie or Lose** → Share result → Locked out until tomorrow

**A perfect day = win on offense AND win on defense.** That's the aspirational outcome that drives repeat play.

---

## Screen-by-Screen Flow

### Screen 1: Home
- TORCH logo + animated flame
- "The Football Card Game" subtitle
- **"Play Today's Torch"** — single dominant button
- Below: "How to Play" expandable section + "What is a Torch?" description
- No team selection, no scheme selection, no campaign mode on this screen
- Clean, one action, zero confusion

### Screen 2: Team & Side Selection
- Pick your team (2 teams for v0.7 — strong visual identity, named players)
- Pick offense or defense
- Brief scenario context (score, time, field position — the drama setup)

### Screen 3: Draft
- See 10 cards, pick 5 for your hand
- **Offense:** 5 run plays + 5 pass plays to choose from
- **Defense:** 5 aggressive plays + 5 conservative plays to choose from
- Optional helper button explains what each card IS (not what it's good against)
- Drafting is your game plan — these are your guaranteed opening cards

### Screen 4: Gameplay
- Real down & distance, ticking clock, scoreboard
- Each snap: pick a card from your hand → AI picks for the other side → **CLASH**
- Clash screen: cards physically collide, dramatic reveal of who won the matchup
- Result describes what happened on the play (not why it worked/didn't strategically)
- Down, distance, field position, and clock update after each play
- After playing a card, draw 1 random replacement from the card library (hand stays at 5)
- Drive continues until: TD, turnover, 4th down stop, or clock expires
- Same mechanics for offense and defense players

### Screen 5: Result
- Win / Tie / Loss with dramatic presentation
- Stats summary
- Shareable emoji result (Wordle-style)
- If **Win**: unlock bonus round as the other side of the ball
- If **Tie or Lose**: tomorrow's scenario tease, locked out

### Screen 6: Bonus Round (winners only)
- Same scenario, other side of the ball
- Same draft → gameplay → result flow
- Combined share card for both sides

---

## Core Mechanic: The Clash

This is the heartbeat of the game. Both sides pick a card. Neither knows what the other called. Cards slam together on screen. Result reveals.

**What determines who wins:** Football logic. Specific card-vs-card matchups based on real football principles. A screen beats a blitz. A deep route beats single-high coverage with no safety help. A run gets stuffed against a stacked box. The exact resolution system will be defined separately, but the principle is: real football knowledge gives you an edge.

**What the player sees after the clash:** A description of what happened on the play. "The screen got behind the blitz and picked up 15 yards." NOT "Screens beat Cover 0 because there's no safety help." The game shows results, not lessons. Pattern recognition is the player's job.

---

## Card System

### Draft Phase
- 10 cards presented, player picks 5
- Offense: 5 run cards + 5 pass cards
- Defense: 5 aggressive cards + 5 conservative cards
- Cards show: name, type, brief description of what the play IS
- Cards do NOT show: what they're effective against

### In-Game Hand Management
- Hand size: always 5
- Play 1 card per snap → draw 1 random replacement from the full card library
- Your 5 drafted cards are your game plan; random draws are improvisation
- This creates tension: do I play my best card now or save it for a crucial down?

### Card Information
- Each card has a "helper" explanation accessible via button
- Helper explains the play in plain language ("A draw play fakes a pass, then hands off to the running back")
- Helper NEVER reveals strategic matchup information
- Players learn what works through experience, not tooltips

---

## The Scenario (v0.7 Test Scenario)

One scenario for initial testing. Must meet these criteria:
- Both offense and defense have a realistic chance to win
- Neither side is overpowered by the situation
- Creates genuine drama and time pressure
- Tests all core mechanics (drafting, hand management, clock, down/distance)

**Scenario:** TBD — will be defined during build phase. Example framing: "2nd and 10 from the defense's 35. Down 7 with 3:15 left and 1 timeout."

**Offense wins by:** Scoring a touchdown. Can go for 2-point conversion (win) or extra point (tie).
**Defense wins by:** Stopping the drive (4th down stop, turnover, clock runs out).
**Tie:** Offense scores TD + extra point to tie the game.

---

## Teams (v0.7: 2 Teams)

Two teams with strong visual identity for the test build. Each team should have:
- Name, logo/icon, color scheme
- 2-3 named players with personality
- A playstyle identity that affects which cards appear in their draft pool
- Coach character with a voice/personality

Full team details to be designed during build phase.

---

## Retention Design

### Daily Loop
- One scenario per day, same for all players
- Win unlocks bonus round (more gameplay as reward for skill)
- Lose = come back tomorrow (Wordle sting)
- Shareable results drive social discovery

### Progression Loop (future — not in v0.7)
- Streak counter (consecutive days played)
- Skill development (players get better at reading matchups over time)
- Team building / card collection (dynasty mode — the paid product)

### Why Players Come Back
- **Day 1:** "That clash moment was cool, I want to try again"
- **Day 2:** "I lost yesterday, I think I know what I did wrong"
- **Week 1:** "I'm starting to see patterns in what works"
- **Month 1:** "I feel like I actually understand football coverage now"

---

## What This Is NOT (v0.7 Scope)

- No campaign mode (hidden, preserved in codebase)
- No card shop or coin economy
- No AI commentary (static fallbacks only)
- No 90 rotating scenarios (one scenario for testing)
- No scheme selection
- No player card system beyond team roster
- No offensive/defensive formation customization
- No leaderboards or social features (beyond share button)

---

## Testing Plan

### Audience
Discord dynasty group (9 football-knowledgeable players)

### What We're Testing
1. Can players complete a full game in 5-7 minutes?
2. Does the draft feel like a meaningful decision?
3. Does the clash moment feel exciting or random?
4. Do players want to play the bonus round when they win?
5. Do players who lose want to come back tomorrow?
6. Can a non-football player pick it up with the helper buttons?

### How We'll Test
- Deploy to Vercel, share URL with Discord group
- Watch for: completion rate, bonus round opt-in rate, next-day return
- Collect feedback via Discord after first play session
- Teresa Torres framework: these are assumption tests, not feature requests

---

## Technical Notes

- Single HTML file (`public/index.html`) — no framework, no build step
- Local dev: `npx serve public -l 3000`
- Deploy: `vercel --prod` → https://torch-two.vercel.app/
- Claude Code has full context via `CLAUDE.md`
- Git repo on GitHub for version control
- PWA enabled for home screen install
