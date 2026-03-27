# Personnel System Audit — Phase 0

## 1. Player Cards

**Renderer:** `buildMaddenPlayer(p, w, h)` in `src/ui/components/cards.js:230`

**Current data model:**
```javascript
{
  id: 'rdg_o1', name: 'Monroe', pos: 'WR', ovr: 84,
  badge: 'SPEED_LINES', isStar: true, starTitle: 'The Jet',
  num: 1, ability: 'Burns man coverage deep'
}
```

**Rendering:** Position color, jersey number, name (auto-shrink), ability text, star badge if `isStar`, border tier by OVR (≥80 gold, ≥76 team, <76 muted).

**Selection:** `mkPlayerCardEl(p, hTeam)` at `gameplay.js:332`. Tap sets `selP = p`, advances phase to 'torch' or 'ready'.

**Roster source:** `src/data/players.js` — 4 teams × ~13 players (7 OFF + 6 DEF). Uses `getOffenseRoster(teamId)` / `getDefenseRoster(teamId)`.

---

## 2. Play Cards

**Renderer:** `buildPlayV1(p, w, h)` in `src/ui/components/cards.js:302`

**Data model:**
```javascript
{
  id: 'rdg_choice', name: 'Choice Route', cat: 'SHORT PASS',
  playType: 'SHORT', risk: 'med', desc: '...', isRun: false,
  mean: 8, variance: 4, completionRate: 0.76, sackRate: 0.05,
  intRate: 0.02, fumbleRate: 0.005, coverageMods: { ... }
}
```

**Selection:** Tap sets `selPl = play`, advances phase to 'player'. Drag-and-drop also supported.

**Source:** `src/data/{team}Plays.js` — 10 OFF + 10 DEF plays per team.

---

## 3. GSAP

**NOT INSTALLED.** All animations use CSS keyframes/transitions. Need to run `npm install gsap`.

---

## 4. Sound System

**File:** `src/engine/sound.js` — jsfxr synthesis, no audio files.

**SND object methods:** `snap()`, `td()`, `turnover()`, `bigPlay()`, `cardSnap()`, `click()`, `select()`, `whistle()`, `points()`, `chime()`.

**Architecture:** `genSound(preset)` creates WAV via jsfxr, cached after first generation. `play(preset)` plays from cache.

---

## 5. Card Hand/Tray

**Phase machine:** `play` → `player` → `torch` → `ready` → SNAP → `busy`

**State vars:** `selP` (player), `selPl` (play), `selTorch` (torch card ID), `phase` (string).

**`drawPanel()`** at `gameplay.js:1650` renders the tray based on current phase:
- Phase 'play': shows 4 play cards
- Phase 'player': shows 4 player cards with synergy badges
- Phase 'torch': shows pre-snap torch cards + SKIP button
- SNAP button enabled when play + player selected

**Current layout:** Single tray row, phase-sequential (plays first, then players, then torch). NOT the 8-card simultaneous layout from the spec.

**Synergy:** Badge-based (`SPEED_LINES` + `SHORT` play = bonus). Star players always +2.

---

## 6. Pre-Game Roster Preview

**Does not exist.** Flow is: teamSelect → pregame (4.5s broadcast matchup) → gameplay. No roster shown.

---

## 7. Torch Card Data

**File:** `src/data/torchCards.js` — 12 cards.

**Format:** `{ id, name, iconKey, tier, cost, type, category, effect }`

**Tiers:** GOLD (2), SILVER (5), BRONZE (5). Categories: information, amplification, disruption, protection.

**Shop:** `getBoosterOffers(trigger)` returns 3 weighted cards by trigger type.

---

## 8. Snap Sequence

**SNAP tap** → `doSnap()` → torch card overlay (if played) → `gs.executeSnap()` → `run3BeatSnap()`

**Beat 1 — BUILD (anticipation):** Full-screen dim, two cards slide in from left/right (offense play vs defense play). Duration scales by tier (0-800ms).

**Beat 2 — PEAK (impact):** Screen shake, color flash (green/red based on user sentiment), particle burst (8-80), sound (td/turnover/bigPlay), haptic vibration. Hitstop freeze 33-133ms.

**Beat 3 — SETTLE (result):** Winner card glows, loser dims. Result text appears (TOUCHDOWN / +X YDS / SACK / etc). Commentary generates. Duration: 1.8-5s based on tier × sentiment multiplier.

**Post-beats:** Drive summary update, possession change check, shop trigger check, next snap setup.

---

## Key Gaps for Personnel System

1. **No simultaneous 8-card hand** — current system is phase-sequential (plays → players → torch)
2. **No discard mechanic** — cards are dealt fresh each snap, no carry-over
3. **No star rating on player cards** — uses OVR number + badge system instead
4. **No traits** — abilities are free-text, not structured trait keywords
5. **No special teams player selection** — ST events auto-resolve
6. **No GSAP** — all animation is CSS
7. **No roster preview screen** — players first seen in-game
8. **Player cards lack ST ratings** — no kickPower/kickAccuracy/returnAbility fields
