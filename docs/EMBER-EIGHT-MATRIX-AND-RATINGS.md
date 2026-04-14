# Ember Eight — Counter Matrix & Ratings Spec

**Status:** Locked 2026-04-14. Drives `COUNTER_MATRIX` in `src/data/teams.js` and tier-based balance tuning.

---

## Counter Matrix (verified balanced)

Each team has exactly **2 strong** / **2 weak** / **3 neutral** opponents. Matrix is internally consistent (every "A strong vs B" has a matching "B weak vs A").

| Attacker \ Defender | Lar | Hol | Ver | Hel | Cor | Bla | Rid | Sac |
|---|---|---|---|---|---|---|---|---|
| **Larkspur** | — | – | **W** | weak | – | – | – | weak |
| **Hollowridge** | – | — | – | – | **W** | weak | **W** | – |
| **Vermont** | weak | – | — | **W** | **W** | – | – | – |
| **Helix** | **W** | – | weak | — | – | **W** | – | weak |
| **Coral Bay** | – | weak | weak | – | — | **W** | – | **W** |
| **Blackwater** | – | **W** | – | weak | weak | — | **W** | – |
| **Ridgemont** | – | weak | – | – | – | weak | — | **W** |
| **Sacramento** | **W** | – | – | **W** | weak | – | weak | — |

(W = strong vs that opponent; weak = weak vs that opponent; — = self; – = neutral)

### Edge logic (per matchup)

- **Larkspur W vs Vermont, Hollowridge** — RPO conflict puts Quarters safeties in bind; pattern match handles option. **Weak vs Helix, Sacramento** — Mesh breaks match rules; sideline splits break pattern match geometry.
- **Hollowridge W vs Ridgemont, Coral Bay** — Zone Read horizontally stretches rigid defense; dual-threat QB gashes man Cover 0/1. **Weak vs Larkspur, Blackwater** — Rip/Liz accounts for option geometry; more disciplined option keeps Spectres off field.
- **Vermont W vs Coral Bay, Helix** — Disguise shells bait Coryell verticals into INTs and muddy Air Raid pre-snap reads past the 4-sec clock. **Weak vs Larkspur, Ridgemont** — physically outmuscled.
- **Helix W vs Blackwater, Larkspur** — Mesh destroys Rip/Liz man-match with natural picks; Air Raid scores faster than option answers. **Weak vs Vermont, Sacramento** — disguise beats pre-snap reads; Drop-5 flood clogs shallow crossers.
- **Coral Bay W vs Blackwater, Sacramento** — Four Verts floods single-high; 1-on-1 athleticism overwhelms Flyover zones. **Weak vs Vermont, Hollowridge** — disguise + QB pressure.
- **Blackwater W vs Ridgemont, Hollowridge** — Options neutralize read-and-react LB play. **Weak vs Coral Bay, Helix** — can't match scoring rate.
- **Ridgemont W vs Vermont, Sacramento** — Duo/Power overwhelms finesse Quarters and 3-safety light boxes. **Weak vs Hollowridge, Blackwater** — attacking 3-1-3 penetrates slow power; option clock-control keeps Ridgemont off field.
- **Sacramento W vs Helix, Larkspur** — Flyover clogs crossers; extreme splits break pattern match geometry. **Weak vs Ridgemont, Coral Bay** — physically outmatched.

---

## COUNTER_MATRIX module shape

```js
// Replaces COUNTER_PLAY (4-team cycle) in src/data/teams.js
export const COUNTER_MATRIX = {
  pronghorns:  { strong: ['maples', 'stags'],     weak: ['salamanders', 'raccoons'], neutral: ['wolves', 'serpents', 'sentinels'] },
  stags:       { strong: ['sentinels', 'wolves'], weak: ['pronghorns', 'serpents'], neutral: ['maples', 'salamanders', 'raccoons'] },
  maples:      { strong: ['wolves', 'salamanders'], weak: ['pronghorns', 'sentinels'], neutral: ['stags', 'serpents', 'raccoons'] },
  salamanders: { strong: ['serpents', 'pronghorns'], weak: ['maples', 'raccoons'], neutral: ['stags', 'wolves', 'sentinels'] },
  wolves:      { strong: ['serpents', 'raccoons'], weak: ['maples', 'stags'], neutral: ['pronghorns', 'salamanders', 'sentinels'] },
  serpents:    { strong: ['sentinels', 'stags'], weak: ['wolves', 'salamanders'], neutral: ['pronghorns', 'maples', 'raccoons'] },
  sentinels:   { strong: ['maples', 'raccoons'], weak: ['stags', 'serpents'], neutral: ['pronghorns', 'salamanders', 'wolves'] },
  raccoons:    { strong: ['salamanders', 'pronghorns'], weak: ['sentinels', 'wolves'], neutral: ['stags', 'maples', 'serpents'] },
};
```

Engine consumers (`src/engine/snapResolver.js`, `aiOpponent.js`) will need to update from the old `{strong, weak, neutral}` (single value each) to the new array shape.

---

## Tier Ratings

| Tier | Teams | Star count | Avg OVR | Star side rule |
|---|---|---|---|---|
| **Top** | Larkspur, Hollowridge | 3 | 82 | 2 on stronger side, 1 on weaker side |
| **Middle** | Vermont, Helix, Coral Bay, Blackwater | 2 | 76 | 1 each side |
| **Bottom** | Ridgemont, Sacramento | 1 | 70 | Offensive star |

### Per-team rating breakdown

| Team | Tier | Avg OVR (computed) | Stars on roster | Star sides |
|---|---|---|---|---|
| Larkspur | Top | 79.6 | 3 | 2 OFF (RB + OL) + 1 DEF (LB hybrid) |
| Hollowridge | Top | 79.4 | 3 | 1 OFF (QB) + 2 DEF (CB + FS) |
| Vermont | Middle | 76.4 | 2 | 1 OFF (TE) + 1 DEF (FS) |
| Helix | Middle | 76.6 | 2 | 1 OFF (QB) + 1 DEF (LB) |
| Coral Bay | Middle | 78.6 | 2 | 1 OFF (WR) + 1 DEF (FS) |
| Blackwater | Middle | 76.8 | 2 | 1 OFF (QB) + 1 DEF (DT) |
| Ridgemont | Bottom | 73.9 | 1 | 1 OFF (RB) |
| Sacramento | Bottom | 73.5 | 1 | 1 OFF (Slot WR) |

Coral Bay runs slightly above middle-tier average due to transfer-portal veteran skew (more 4-star transfers, fewer 3-star starters). Larkspur edges Hollowridge slightly because of their 5th-Sr star RB. These are intentional flavoring within tier — not a re-tier.

---

## TEAM_DRAW_WEIGHTS adjustments (in `src/state.js`)

Each team's card-draw multipliers should bias toward their scheme's signature concepts. From the existing pattern in `state.js`:

```js
// Replace existing TEAM_DRAW_WEIGHTS
export const TEAM_DRAW_WEIGHTS = {
  // Run-heavy schemes — high RUN multiplier
  sentinels:   { RUN: 4, QUICK: 1, DEEP: 1, SCREEN: 1, SPECIAL: 1 }, // Smashmouth (was Power Spread)
  serpents:    { RUN: 5, QUICK: 1, DEEP: 1, SCREEN: 1, SPECIAL: 1 }, // Triple Option (extreme run)
  pronghorns:  { RUN: 3, QUICK: 2, DEEP: 1, SCREEN: 2, SPECIAL: 1 }, // Power Spread (RPO conflict)
  stags:       { RUN: 3, QUICK: 2, DEEP: 1, SCREEN: 2, SPECIAL: 1 }, // Spread Option (was Spread RPO)

  // Pass-heavy schemes
  wolves:      { RUN: 1, QUICK: 2, DEEP: 4, SCREEN: 1, SPECIAL: 1 }, // Vertical Pass (was Spread Option)
  salamanders: { RUN: 1, QUICK: 4, DEEP: 2, SCREEN: 1, SPECIAL: 1 }, // Air Raid (mesh-heavy)

  // Balanced
  maples:      { RUN: 2, QUICK: 2, DEEP: 2, SCREEN: 2, SPECIAL: 1 }, // Multiple
  raccoons:    { RUN: 2, QUICK: 2, DEEP: 2, SCREEN: 2, SPECIAL: 2 }, // Veer & Shoot (RPO-balanced)
};
```

---

## Class Distribution Summary

| Team | Fr | So | Jr | Sr | RS-Sr | 5th-Sr | Skew |
|---|---|---|---|---|---|---|---|
| Larkspur | 1 | 2 | 3 | 4 | 3 | 1 | **veteran** |
| Hollowridge | 2 | 1 | 4 | 5 | 2 | 0 | slight veteran |
| Vermont | 1 | 4 | 3 | 4 | 2 | 0 | balanced |
| Helix | 2 | 3 | 4 | 4 | 1 | 0 | balanced |
| Coral Bay | 1 | 0 | 3 | 6 | 3 | 1 | **transfer veteran** |
| Blackwater | 2 | 2 | 4 | 4 | 2 | 0 | balanced |
| Ridgemont | 2 | 2 | 4 | 4 | 2 | 0 | balanced |
| Sacramento | 5 | 4 | 3 | 2 | 0 | 0 | **young** |
| **TOTAL** | 16 | 18 | 28 | 33 | 15 | 2 | — |

Class distribution feels like a real college conference — about 14% Fr, 16% So, 25% Jr, 29% Sr, 13% RS-Sr, 2% 5th-Sr — with intentional team variance (Sacramento youngest, Larkspur/Coral Bay oldest).
