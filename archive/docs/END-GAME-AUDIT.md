# End Game Audit — 2026-03-27

## Current State

1. **Visual hierarchy**: Header (VICTORY/DEFEAT/TIE) → Score with badges → TORCH points box → Film Room → PLAY AGAIN button. Everything stacked vertically, all visible at once with no animation sequencing.

2. **Path to new game**: PLAY AGAIN → teamSelect screen. 2 taps (PLAY AGAIN + pick team). Goes direct, no main menu routing.

3. **Data displayed**: Final score with team badges, TORCH points (base + win bonus), Film Room (max 4 highlights). No MVP, no open loop, no per-team records.

4. **PLAY AGAIN**: Bottom of content, same width as other elements (300px max), standard btn-blitz styling. NOT the dominant element.

5. **TORCH points**: Static number, no animation. Shows "Base: X | Win Bonus: +20" as one line.

6. **State on new game**: Clears engine/opponent/finalEngine, carries season.torchCards and season.carryoverPoints to next game.

## What Needs to Change
- PLAY AGAIN must be the largest element, team-colored, in thumb zone
- Film Room should be opt-in (link below PLAY AGAIN), not inline
- MVP card needed (requires snap log tracking of featured players)
- Open loop needed (nearest affordable card calculation)
- GSAP animation sequence (score → MVP → points → open loop → PLAY AGAIN)
- Loss/tie text variants (RUN IT BACK, SETTLE IT)
- Per-team win-loss tracking (localStorage)
- All animations skippable with tap
