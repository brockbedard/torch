# TORCH Season Framework — Demo Mode Prompt

Read CLAUDE.md for project context and build rules.
Read docs/TORCH-SEASON-FRAMEWORK.md for the full season structure spec.

## Task: Build a standalone season demo mode

Build a tappable walkthrough of the full Ember Eight season that auto-simulates every game (including the player's). No actual gameplay — every game resolves via the simulation engine. The player taps through each week seeing the full presentation flow.

This is a PROTOTYPE for reviewing the season framework screens. It does NOT need to integrate with the existing game engine. It can be a standalone HTML page or a separate route.

## What to build

### 1. Season Setup
- Team select screen: pick one of the 8 Ember Eight teams
- Generate randomized 7-game schedule (3 home, 3 away, week 7 Showcase neutral)
- Assign all 28 round-robin pairings to 7 weeks (no team plays twice per week)

### 2. Simulation Engine
Use the tier-based win probability system:
- Top vs Top: 50/50
- Top vs Middle: 70/30
- Top vs Bottom: 85/15
- Middle vs Middle: 50/50
- Middle vs Bottom: 70/30
- Bottom vs Bottom: 50/50
- Home team modifier: +7% (except week 7 Showcase and Championship = neutral, no modifier)
- Floor 5% / ceiling 95%

Tier assignments:
- Top: Larkspur Pronghorns, Hollowridge Spectres
- Middle: Vermont Maples, Helix Salamanders, Coral Bay Dolphins, Blackwater Serpents
- Bottom: Ridgemont Boars, Sacramento Raccoons

Score generation:
- Winner score: random from [17, 21, 24, 27, 28, 31, 34, 35, 38]
- Margin: same tier = 3-10, one tier apart = 7-17, two tiers apart = 14-28
- Loser score: winner score minus margin (minimum 0)
- Games are simulated week by week, NOT pre-rolled

### 3. Weekly Flow (tap through each screen)

For each week 1-6:
```
Screen 1: SCHEDULE — show full 7-week schedule, highlight current week, show results for completed weeks
Screen 2: PREGAME — opponent name, record, home/away indicator, tier hint
Screen 3: GAME RESULT — auto-simmed score for your game. Show W/L, final score, "Player of the Game" (random player name)
Screen 4: AROUND THE EMBER EIGHT — broadcast + newspaper hybrid:
  - All 4 scores for this week animate in with team names
  - "Game of the Week" callout (biggest upset or closest game)
  - Beat writer headline about the week's top story
  - One-line editorial take
Screen 5: STANDINGS — all 8 teams ranked by W-L, then point differential. Show seed indicators (🏆 bye, ⚔️ play-in, ❌ eliminated) after week 7
```

For week 7 (Ember Eight Showcase):
```
Screen 1: SHOWCASE INTRO — "Welcome to Phoenix. The Ember Eight Showcase." Show all 4 matchups
Screen 2: GAME RESULT — your Showcase game result
Screen 3: SHOWCASE RECAP — all 4 Showcase results together, broadcast style
Screen 4: FINAL STANDINGS — seeds lock, bracket reveal
Screen 5: PLAYOFF BRACKET — visual bracket showing play-in matchups, semifinal slots, championship slot
```

For week 8 (Play-In):
```
If seed 3-6: Show your play-in game result, then other play-in result
If seed 1-2: BYE WEEK — show both play-in results (scouting), then bonus "development session" placeholder screen
If seed 7-8: SEASON OVER — end-of-season summary
```

For week 9 (Semifinals):
```
If still alive: Show your semifinal result
If eliminated: Show both semifinal results
```

For week 10 (Championship):
```
If still alive: Show championship result (neutral site Phoenix)
If eliminated: Show championship result
END OF SEASON: Final summary — champion revealed, coach record, final standings
```

### 4. Visual Style

Use the existing TORCH design tokens:
- Background: #07050e
- Fonts: Teko (headers), Barlow Condensed (body), Bebas Neue (numbers)
- Gold: #EBB010
- Green: #00ff88
- Cyan: #00d4ff
- Danger: #ff2424
- Team colors: use placeholder colors per team (red for Ridgemont, pink for Coral Bay, ice blue for Hollowridge, purple for Blackwater, hunter green for Larkspur, maple red for Vermont, orange for Helix, charcoal+lime for Sacramento)

Style the "Around the Ember Eight" screen to feel like a broadcast recap — scores slide in, standings table is clean and readable, beat writer text is in italics.

Mobile-first: 375px portrait. All screens must be tappable to advance. Show a "TAP TO CONTINUE" indicator.

### 5. What NOT to build
- No actual gameplay / snap resolution
- No player cards or roster management
- No sticker spending or stamp system
- No audio
- No save/load
- No integration with existing game engine

This is a clickable prototype of the season FLOW, not the season GAMEPLAY.

## Acceptance criteria
- I can pick a team and tap through an entire 7-week season + playoffs
- I see a different randomized schedule each time I start
- Standings update correctly each week
- Playoff seeding works (1-2 bye, 3-6 play-in, 7-8 eliminated)
- The Showcase (week 7) feels different from regular weeks
- The "Around the Ember Eight" screen shows all results with a headline
- I can reach the championship or get eliminated and see the champion revealed either way

Stop after implementation for review.
