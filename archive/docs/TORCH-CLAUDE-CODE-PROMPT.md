# TORCH Gameplay Engine — Claude Code Prompt

## Context
Read CLAUDE.md first. Then read docs/TORCH-GAMEPLAY-SPEC-v0.13.md in full. Then read docs/torch_sim.py — it's the reference implementation of every game system in Python, validated across 300+ games. Your job is to port this to JS and wire it into the existing UI.

## What Exists Already
The refactor-vite branch has: home screen → team select → player draft (4 OFF + 4 DEF) → play card draft (5 OFF + 5 DEF from 10-card playbook). All UI. No gameplay logic. The draft screens produce a selected roster and playbook that need to flow into the gameplay engine.

## Task: Build the Gameplay Engine

### Phase 1 — Data Layer
Create `src/data/` with all game data as JS modules:

1. `players.js` — All player rosters (CT offense, CT defense, IR offense, IR defense) with name, position, OVR, badge. Export as arrays. See CLAUDE.md for exact rosters.

2. `ctOffensePlays.js` + `irOffensePlays.js` — 10 offensive plays per team. Each play needs: id, name, playType (SHORT/QUICK/DEEP/RUN/OPTION/SCREEN), mean, variance, completionRate (null for runs), sackRate (null for runs), intRate (null for runs), fumbleRate, coverageMods (object keyed by coverage type with mean/var/int modifiers), situational filters (minDistance, maxDistance, neverInsideOwn). Copy exact values from docs/TORCH-PLAY-DATA-TABLE-v0.11.md.

3. `ctDefensePlays.js` + `irDefensePlays.js` — 10 defensive plays per team. Each needs: id, name, cardType (BLITZ/PRESSURE/ZONE/HYBRID), baseCoverage, sackRateBonus, intRateBonus, runDefMod, isCover0Blitz, isManCoverage, passMeanMod, runMeanMod, passCompMod. Copy from docs/TORCH-DEFENSIVE-CARDS-v0.11.md.

4. `torchCards.js` — All 21 Torch Cards with id, name, tier (GOLD/SILVER/BRONZE), cost, isReactive, effect description. Copy from docs/TORCH-CARDS-CATALOG-v0.1.md.

5. `badges.js` — Badge enum/constants + SVG icon data (reuse existing badge SVGs from the player draft screen).

### Phase 2 — Engine Core
Create `src/engine/` modules. Port logic directly from `docs/torch_sim.py`:

1. `badgeCombos.js` — Export `checkOffensiveBadgeCombo(badge, play, is3rd4th, isConversion)` and `checkDefensiveBadgeCombo(badge, defPlay, offPlay)`. Returns {yardBonus, pointBonus}. Use TIGHT trigger rules from CLAUDE.md (each badge fires on 1-2 play types max).

2. `playHistory.js` — Export `getPlayHistoryBonus(history, currentPlay)`. Tracks consecutive runs/passes, PA stacking, repeat play penalty. Returns a number.

3. `redZone.js` — Export `applyRedZone(yardsToEndzone, mean, variance, play)`. Returns {mean, variance, maxYards}. Uses the harder compression values from CLAUDE.md.

4. `ovrSystem.js` — Export `applySquadOVR(offPlayers, defPlayers, offPlay, featuredOff, featuredDef)`. Returns {compMod, sackMod, meanMod, intMod}.

5. `turnoverReturns.js` — Export `calcReturnYards(featuredDef)`. Roll base 0-15 + OVR bonus + badge bonus.

6. `torchPoints.js` — Export `calcOffenseTorchPoints(result, gotFirstDown)` and `calcDefenseTorchPoints(result, allowedFirstDown)`. Use point tables from the gameplay spec.

7. `injuries.js` — Export `checkInjury(result, featuredOff, featuredDef)` and `healInjuries(allRosters)`. 3% chance on big plays/sacks. Minor=2-3 snaps, moderate=rest of half, severe=rest of game.

8. `aiOpponent.js` — Export `aiSelectPlay(hand, playType, difficulty, situation)` and `aiSelectPlayer(roster, play, difficulty)`. Three difficulty tiers with the rules from CLAUDE.md. Situation object = {down, distance, ballPos, playHistory, scoreDiff}.

9. `snapResolver.js` — THE CORE. Export `resolveSnap(offPlay, defPlay, featuredOff, featuredDef, offPlayers, defPlayers, context)`. Context = {playHistory, yardsToEndzone, ballPosition, down, distance, isConversion, scoreDiff}. Returns a result object with: yards, isComplete, isIncomplete, isSack, isInterception, isFumble, isFumbleLost, isTouchdown, isSafety, offComboYards, defComboYards, offComboPts, defComboPts, historyBonus, description. Port EXACTLY from the resolve_snap function in torch_sim.py including:
   - Stuff rate for runs (30% base + all modifiers)
   - Sack check with coverage sack mechanic and red zone bump
   - Bad matchup completion penalty
   - Trailing team bonus
   - INT rate with global -0.5% adjustment
   - Run fumble rate with +0.5% adjustment
   - All stacking bonuses

10. `gameState.js` — Export a GameState class that manages:
    - Score (both teams), ball position, down, distance, half, plays used
    - 2-minute drill clock (120 seconds, different time per play type)
    - Possession tracking, drive history
    - TORCH point accumulation
    - Torch Card inventory (3 slots)
    - Injury tracking
    - State transitions: flipPossession, advanceBall, checkFirstDown, checkTouchdown, checkSafety
    - The full game loop: for each snap, resolve → update state → check for scoring/turnovers/drive changes → advance to next snap

### Phase 3 — UI Integration (after engine works)
This is the wiring phase. Don't start this until Phase 1 and 2 are working with console.log tests.

1. **Coin toss screen** — After draft, show coin toss. Winner picks from 3 random Bronze/Silver Torch Cards OR receives at 50.

2. **Gameplay screen** — New screen that renders:
   - Top: scorebug (score + clock + down & distance + TORCH points)
   - Right panel: player cards (2x2) + play cards + Torch Card slot + combo preview + SNAP button
   - Left: field placeholder (just yard line + ball marker for Phase 3, animation comes later)
   - Bottom: 2-line narrative bar

3. **Snap interaction** — Tap player card → selected state. Tap play card → selected state. Both selected → combo preview bar shows, SNAP button pulses. Tap SNAP → call resolveSnap → show result → update scorebug → show narrative → tap to continue.

4. **Possession flow** — After score/turnover/failed 4th, flip possession. Show "YOUR BALL" or "OPPONENT'S BALL" transition. Switch hand panel to show the other side's cards.

5. **2-minute drill** — After 20 plays, switch to clock mode. SNAP button splits into SNAP / SPIKE / KNEEL. Show clock ticking down.

6. **Halftime** — After first half ends, show The Booster (3 random Torch Cards to buy). Then start second half.

7. **Conversion choice** — After TD, show 3 buttons: XP (free, 1pt), 2-PT (from the 5), 3-PT (from the 10).

8. **End game** — Show final score, TORCH points earned, key stats, share button.

## Code Style
- ES modules (import/export)
- No TypeScript (vanilla JS)
- JSDoc comments for function signatures
- Descriptive variable names (no abbreviations)
- All magic numbers should reference CLAUDE.md or spec docs in comments
- Console.log the game state after every snap during development (remove before deploy)

## Testing Strategy
After Phase 2, before Phase 3:
- Create a `src/engine/test.js` that plays 10 full games in the console
- Log every snap result
- Verify: scores are reasonable (avg 22 combined), sacks happen (2-3/game), turnovers happen (~0.5/game per team), badge combos fire ~25/game, games end after 2 halves
- Compare output to torch_sim.py output to verify parity

## DO NOT
- Do not change the existing draft screens or home screen
- Do not remove or modify any existing CSS
- Do not add any npm dependencies without asking
- Do not build the field animation in Phase 3 (that's Phase 4, later)
- Do not implement Torch Card usage in Phase 3 (card slot shows, but cards are non-functional until Phase 4)
- Do not implement the AI commentary system (that's Phase 5)

## Git Convention
- Commit after each phase with message format: `feat(engine): Phase N — description`
- Example: `feat(engine): Phase 1 — add game data layer with all play/player/card data`
- Do NOT deploy to production. Local only until all phases are tested.
