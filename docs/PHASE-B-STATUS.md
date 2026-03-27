# Phase B Status Check — 2026-03-26

## Summary
B1-B6 are **BUILT and wired into snap resolution**. B7 is **PARTIALLY BUILT** (AI uses badges/OVR but not traits/stars/heat). B8 is **NOT BUILT** (ST ratings exist in data but don't affect outcome distributions).

## Status by Item

| # | Item | Status | Notes |
|---|------|--------|-------|
| B1 | Featured player in snap resolution | **BUILT** | `resolveSnap()` accepts featured players, calls `calculatePersonnelMod()`, adds to mean |
| B2 | Heat tracking system | **BUILT** | `offHeatMap`/`defHeatMap` in GameState, `updateHeat()` called after each snap, `heatPenalty()` applies -1 to -3 at heat 3-5+ |
| B3 | Relevance weight table | **BUILT** | 5 play groups × 9 positions in `RELEVANCE` table, used in `teamBaseline()` |
| B4 | Trait synergy table | **BUILT** | 27 traits mapped to play groups, `traitSynergy()` called from `calculatePersonnelMod()` |
| B5 | Team quality baseline | **BUILT** | Weights all 7 players' stars by position relevance, (avgStars - 3) × 0.5 yards |
| B6 | Direct matchup resolution | **BUILT** | `TRAIT_MATCHUP` table (10 offensive traits vs defensive traits), star diff × 0.4, only fires when both positions relevant |
| B7 | AI featured player selection | **PARTIALLY BUILT** | Offense: picks best badge combo match. Defense: picks highest OVR. Does NOT consider traits, stars, or heat. |
| B8 | ST ratings → distributions | **NOT BUILT** | Player data has `st: { kickPower, kickAccuracy, returnAbility }` but `attemptFieldGoal()`, `punt()`, `resolveKickoff()` take no player parameter and use fixed distributions. |

## What's Working
- Personnel system adds ±0-6 yards per snap based on player selection
- Picking a BURNER WR on a deep pass gives +4 synergy
- Picking an OL on a deep pass gives -1 anti-synergy
- Featuring same player 4 snaps in a row gives -2 heat penalty
- 5-star WR vs 2-star CB gives +1.2 matchup advantage
- BURNER vs PRESS CORNER gives +2 trait matchup (speed beats press)
- BURNER vs SHUTDOWN gives -2 trait matchup (shutdown locks down speed)
- All modifiers are invisible to the player — they learn by pattern

## What's Missing
1. **AI player selection ignoring traits/stars** — AI should pick players that synergize with their play card, scaled by difficulty
2. **ST ratings are cosmetic** — the burn deck UI shows ratings but they don't shift FG make %, punt distance, or return yardage
3. **No PLAY_ACTION play group** — the spec included it but personnelSystem.js maps OPTION to OUTSIDE_RUN, not PLAY_ACTION

## File Locations
- Personnel system: `src/engine/personnelSystem.js`
- Snap resolver integration: `src/engine/snapResolver.js:122-133`
- Heat maps: `src/engine/gameState.js:72-74, 504-508`
- AI selection: `src/engine/aiOpponent.js:108-139`
- ST methods (no player param): `src/engine/gameState.js:126-284`
