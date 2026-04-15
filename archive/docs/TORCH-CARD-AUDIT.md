# Torch Card Audit — 2026-03-27

## 12 Implemented Cards (available in store/pools)

| Card | DATA | ACQUIRE | PLAY | EFFECT | CONSUME | Notes |
|------|------|---------|------|--------|---------|-------|
| SCOUT TEAM | PASS | PASS | PASS | PASS | PASS | AI play reveals before player picks |
| SURE HANDS | PASS | PASS | PASS | PASS | PASS | Cancels INT/fumble, drive continues |
| HARD COUNT | PASS | PASS | PASS | PASS | PASS | AI play randomized in gameplay.js |
| DEEP SHOT | PASS | PASS | PASS | PASS | PASS | 2x yards on completed pass (not negatives) |
| TRUCK STICK | PASS | PASS | PASS | PASS | PASS | 2x yards on run, fumble prevented |
| CHALLENGE FLAG | PASS | PASS | PASS | PASS | PASS | Rerolls snap, 50% better outcome |
| PRIME TIME | PASS | PASS | PASS | **FLAG** | PASS | Legacy: uses `(99-ovr)/5*0.5` not stars/traits |
| PLAY ACTION | PASS | PASS | PASS | PASS | PASS | +5 vs run defense, 0 vs zone |
| SCRAMBLE DRILL | PASS | PASS | PASS | PASS | PASS | Negative yards → 0 |
| 12TH MAN | PASS | PASS | PASS | PASS | PASS | +4 yards + 2x TORCH points |
| ICE | PASS | PASS | PASS | **FLAG** | PASS | Legacy: zeros OVR+badges, NOT personnel mods |
| PERSONNEL REPORT | PASS | PASS | PASS | PASS | PASS | **DUPLICATE of PRE-SNAP READ** |

## 12 Unimplemented Cards (hidden from store/pools via `implemented: false`)

BLOCKED KICK, HOUSE CALL, ICE THE KICKER, CANNON LEG, IRON MAN, RINGER,
SCOUT REPORT, PRE-SNAP READ, FRESH LEGS, GAME PLAN, COFFIN CORNER, FAIR CATCH GHOST

Data exists in torchCards.js. `getCardsByTier()` filters them out so they never appear in store, coin toss, or halftime free card pools.

## Issues to Address

1. **PRIME TIME** — uses legacy OVR boost `(99 - player.ovr) / 5 * 0.5`. Should be updated to work with star/trait system (e.g. treat featured player as 5-star with max synergy).

2. **ICE** — zeros OVR modifier + badge combo yards/points but does NOT zero personnel system modifiers (baseline, synergy, matchup). Should also subtract `personnelMod.totalMod` for full freeze.

3. **PERSONNEL REPORT vs PRE-SNAP READ** — identical effect (both give `revealBonus = 1`). Recommend:
   - PERSONNEL REPORT (30pts): reveals opponent player name + position
   - PRE-SNAP READ (25pts): reveals opponent player name + position + stars + trait
   - Or remove duplicate entirely
