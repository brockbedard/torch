# Adding a Team to TORCH

A runbook for adding a new team to the Ember Eight conference (or rebuilding the conference entirely). It lists every file to touch, in dependency order, with concrete templates drawn from the Larkspur Pronghorns.

If you're pairing with Claude on this: point it at this doc, hand it the team concept, and it can execute the mechanical edits. The bottleneck is creative (scheme, lore, color, wordmark font, 14 player names); the mechanics are boilerplate.

---

## 0. Decide before you code

These choices cascade into every downstream file. Don't skip ahead until these are locked.

| Decision | Options | Example |
|---|---|---|
| **Internal ID** | lowercase, no spaces, stable forever (schema key across 30+ files) | `pronghorns` |
| **Display name** | UPPERCASE mascot | `PRONGHORNS` |
| **School + city** | full school + location | `Larkspur State University` |
| **Tier** | `top` / `middle` / `bottom` | `top` |
| **Offensive scheme** | name + real analog | `POWER SPREAD` (Oklahoma/Iowa State lineage) |
| **Defensive scheme** | name + shell family | `PATTERN MATCH` |
| **Run/pass ratio** | expressed as `offScheme` flavor | 65/35 |
| **Accent + palette** | accent (used in UI), primary + secondary | `#F5DEB3` / `#166534` / `#F59E0B` |
| **Helmet** | base, facemask, stripe (for the simple helmet in cards.js) | `#166534` / `#F59E0B` / `#FCD34D` |
| **Counter matrix slot** | 2 strong vs, 2 weak vs, 3 neutral | see Step 1 |
| **Ghost coach** | name, tenure, lore, emotional weight | per `docs/TORCH-EMBER-EIGHT-BIBLE.md` |
| **Wordmark typeface** | font family, weight, sizing — must reflect team personality | `Righteous, 400` |
| **Motto + celebration phrases** | one motto, 3 celebration phrases, 4 celebration colors | `Outrun The Horizon` |

---

## 1. `src/data/teams.js` — team identity + counter matrix

**Add the TEAMS entry.** Copy the shape exactly — every field matters.

```js
pronghorns: {
  id: 'pronghorns',
  name: 'PRONGHORNS',                             // UPPERCASE display
  school: 'Larkspur State University',
  mascot: 'Pronghorns',
  abbr: 'LAR',                                    // 3-char scorebug
  accent: '#F5DEB3',
  icon: '',                                       // reserved, keep empty
  colors: { primary: '#166534', secondary: '#F59E0B' },
  helmet: { base: '#166534', facemask: '#F59E0B', stripe: '#FCD34D' },
  motto: 'Outrun The Horizon',
  offScheme: 'POWER SPREAD',
  defScheme: 'PATTERN MATCH',
  ratings: { offense: 4, defense: 4 },            // 1–5, tier-appropriate
  tier: 'top',                                    // 'top' | 'middle' | 'bottom'
  vibe: 'Reinhardt dynasty. RPO conflict + pulling guards. Senior class.',
  celebration: {
    colors: ['#F5DEB3', '#166534', '#F59E0B', '#FCD34D'],
    phrases: ['LARKSPUR RUNS!', 'OUTRUN THE HORIZON!', 'PLAINS POWER!']
  }
},
```

**Add the COUNTER_MATRIX row.** Every team has exactly **2 strong / 2 weak / 3 neutral** opponents — 7 other teams total in the current 8-team conference.

```js
pronghorns: { strong: ['maples', 'stags'], weak: ['salamanders', 'raccoons'], neutral: ['wolves', 'serpents', 'sentinels'] },
```

**Matrix symmetry rule:** if `A.strong` contains `B`, then `B.weak` must contain `A`. When you add a team, you must **edit all 7 existing teams' counter rows** to slot the new team in (strong/weak/neutral). Skipping this leaves the team disconnected from the rock-paper-scissors.

**Tier-appropriate ratings guidance:**
| Tier | OFF rating | DEF rating |
|---|---|---|
| top | 4–5 | 4–5 |
| middle | 3–4 | 3–4 |
| bottom | 2–3 | 2–3 |

---

## 2. `src/data/players.js` — 14-player roster

**Two exports per team**: `TEAMID_OFFENSE` (7 players) + `TEAMID_DEFENSE` (7 players). Then register in `_rosters`.

Player shape (all fields required except `starTitle`):

```js
{
  id: 'lar_o1',                                   // {abbr}_{side}{index}, unique
  name: 'Schroeder',                              // surname — card header
  firstName: 'Brock',                             // first — shown in some UIs
  pos: 'RB',                                      // QB/RB/WR/TE/H-back/FB/OL for OFF; DL/LB/CB/SS/FS/DB for DEF
  year: '5th-Sr',                                 // Fr/So/Jr/Sr/RS-*/5th-Sr
  stars: 5,                                       // 1–5, visible quality indicator
  ovr: 88,                                        // 50–99, hidden rating
  trait: 'TRUCK STICK',                           // UPPERCASE keyword, see traits table
  isStar: true,                                   // only 1–2 stars per team
  starTitle: 'The Hammer',                        // required only if isStar: true
  badge: 'HELMET',                                // HELMET / CROSSHAIR / GLOVE / SPEED_LINES / BRICK / etc.
  num: 28,
  ability: 'Breaks arm tackles, finishes runs forward',
  side: 'offense',                                // 'offense' or 'defense'
  team: 'pronghorns',
  st: { kickPower: 1, kickAccuracy: 1, returnAbility: 3 }  // 1–5 each, hidden ST ratings
},
```

**Registration (same file, near bottom):**

```js
var _rosters = {
  pronghorns:  { offense: PRONGHORNS_OFFENSE,  defense: PRONGHORNS_DEFENSE },
  // ... existing entries
};
```

**Balance guidance per tier:**
- **Top tier**: avg ~4 stars (e.g. one 5, three 4s, three 3s), 1–2 `isStar: true`
- **Middle tier**: avg ~3.5 stars, 1 `isStar: true`
- **Bottom tier**: avg ~2.5 stars, 0–1 `isStar: true`

**ST ratings** are hidden until the player is selected for kickoff/punt/FG. Distribute them so each team has 1–2 viable kickers (`kickPower`/`kickAccuracy` both ≥3), 1–2 returners (`returnAbility` ≥3), not all on the same player.

---

## 3. `src/data/{teamId}Plays.js` — new file, 20 plays

**One file per team**, two exports: `TEAMID_OFF_PLAYS` (10 plays) + `TEAMID_DEF_PLAYS` (10 plays).

**Offensive play shape:**

```js
{
  id: 'lar_gh_counter',                           // {abbr}_{snake_name}
  name: 'GH Counter',                             // display name
  cat: 'RUN',                                     // RUN/DEEP/SHORT/QUICK/SCREEN
  playType: 'RUN',                                // RUN/PASS
  sub: 'RUN',                                     // matches cat for run, sub-pass type otherwise
  strength: 'Guard pulls, H-back wraps',          // one-line strength summary
  risk: 'low',                                    // low/med/high — drives variance band
  desc: 'Backside guard kicks, H-back wraps to the linebacker',
  isRun: true,
  flavor: 'Pull the guard, wrap the back',
  type: 'run',                                    // 'run' or 'pass' (lowercase engine key)
  mean: 7,                                        // expected yards pre-counter-adjustment
  variance: 4,                                    // yardage std deviation
  completionRate: 1.0,                            // 1.0 for runs, 0.45–0.75 for passes
  sackRate: 0,                                    // 0 for runs, 0.03–0.10 for passes
  intRate: 0,                                     // 0 for runs, 0.015–0.04 for passes
  fumbleRate: 0.01,                               // 0.005–0.02
  coverageMods: {
    cover_0: { mean: 4, var: 3 },                 // vs each coverage shell, yardage delta
    cover_1: { mean: 2, var: 1 },
    cover_2: { mean: 2, var: 1 },
    cover_3: { mean: 1, var: 1 },
    cover_4: { mean: 2, var: 1 },
    cover_6: { mean: 1, var: 1 },
    man_free: { mean: 3, var: 2 },
  },
},
```

**Defensive play shape** is similar but inverted (from the offense's perspective, these plays represent defensive calls the opponent's offense will face). Look at any existing `{team}Plays.js` for exact structure.

**Playbook composition per scheme (as a guideline):**

| Scheme | Run plays | Deep pass | Short pass | Quick pass | Screen |
|---|---|---|---|---|---|
| Power Spread (Pronghorns) | 4 | 2 | 2 | 1 | 1 |
| Triple Option (Serpents) | 6 | 1 | 1 | 1 | 1 |
| Air Raid (Salamanders) | 1 | 3 | 3 | 2 | 1 |
| Smashmouth (Boars) | 5 | 1 | 2 | 1 | 1 |
| Vertical Pass (Dolphins) | 2 | 4 | 2 | 1 | 1 |

Mirror this ratio in the `TEAM_DRAW_WEIGHTS` you'll add in Step 6.

---

## 4. `src/data/teamWordmarks.js` — typographic identity

Single entry, keyed by internal team ID. Font choice should reflect team personality.

```js
pronghorns: {
  name: 'Larkspur Pronghorns',
  mascot: 'Pronghorns',
  abbr: 'LRK',
  font: "'Righteous', sans-serif",              // CSS font-family string
  weight: 400,
  transform: 'uppercase',                         // or 'none'
  letterSpacing: '0.06em',
  fill: '#F59E0B',                                // primary text color
  textShadow: '3px 3px 0px #062014, 0 0 20px rgba(245,158,11,0.3)',
  heroSize: 40,                                   // T1 hero (px) — tune per typeface width
  scorebugSize: 11,                               // T3 scorebug (px) — tune for legibility
},
```

**Tuning notes:**
- `heroSize` varies because wordmark readability depends on typeface width. Monospace (Major Mono) = 42px; condensed display (Righteous) = 40px; thin serif (Italiana) = 54px.
- `scorebugSize` bottoms out around 10px — thin-weight fonts may need a bumped `scorebugWeight` override (see Spectres for the pattern).
- `fill` should contrast the dark BG (#07060A scorebug, #141008 cards).

**Existing font inventory** (one per team). Pick an unused one if possible:

| Font | Team using it |
|---|---|
| Zilla Slab | Boars |
| Playfair Display | Maples |
| Josefin Sans | Spectres |
| Italiana | Dolphins |
| DM Serif Display | Serpents |
| Chakra Petch | Salamanders |
| Righteous | Pronghorns |
| Major Mono Display | Raccoons |
| Marcellus | *(unused — available)* |

If you pick a new font not in the list above, also do Step 7 (font import).

---

## 5. `src/data/helmetVariants.js` — up to 5 variants

Each team has a `HELMET_VARIANTS[teamId]` array with 5 named variants. Used by the helmet generator in `src/assets/helmets/renderHelmet.js`.

```js
pronghorns: [
  {
    name: 'THE STANDARD',                        // uppercase display name
    blurb: 'Forest green shell, white stripe, gold facemask, pronghorn.',
    shell: '#166534',
    facemask: '#F59E0B',
    stripe: { type: 'single', color: '#FFFFFF' }, // 'none' | 'single' | 'double' | 'runway' | 'pinstripe' | 'outlined'
    decal: { type: 'logo' },                     // 'logo' | 'monogram' | 'text' | 'blank'
  },
  // ... 4 more (alt / hometown / blackout / lore-driven)
],
```

Variant slots by convention:
1. **[0] PRIMARY / THE STANDARD** — home flagship
2. **[1] ALT** — seasonal or themed
3. **[2] HOMETOWN** — throwback / monogram
4. **[3] BLACKOUT or CHROME** — matte / chrome / dark
5. **[4] LORE-DRIVEN** — ghost-coach tribute or mascot concept

---

## 6. `src/state.js` — three edits

```js
// ── EDIT 1: add the playbook import at top ─────────────────────────────
import { PRONGHORNS_OFF_PLAYS, PRONGHORNS_DEF_PLAYS } from './data/pronghornsPlays.js';

// ── EDIT 2: register in _playLookup ────────────────────────────────────
var _playLookup = {
  // ... existing entries ...
  pronghorns:  { offense: PRONGHORNS_OFF_PLAYS,  defense: PRONGHORNS_DEF_PLAYS },
};

// ── EDIT 3: add draw weights matching the scheme ───────────────────────
export var TEAM_DRAW_WEIGHTS = {
  // ... existing entries ...
  // Pronghorns — Power Spread: 65/35. RPO conflict + pulling guards.
  pronghorns:  { RUN: 3, SHORT: 2, DEEP: 1.5, QUICK: 2, SCREEN: 1 },
};
```

**Draw weights are bias multipliers** — higher weight = more likely to appear in your hand. Sum of all weights per team should be roughly 8–10 (doesn't have to match exactly). Match the scheme's run/pass identity:

| Scheme flavor | Typical weights |
|---|---|
| Heavy run | RUN: 4+, SHORT: 1–2, DEEP: 0.5–1, QUICK: 0.5, SCREEN: 0.5 |
| Balanced | RUN: 2–3, SHORT: 2, DEEP: 1.5, QUICK: 2, SCREEN: 1.5 |
| Heavy pass | RUN: 0.5–1, SHORT: 3, DEEP: 2.5, QUICK: 4, SCREEN: 2 |

---

## 7. `src/main.js` — font import (only if adding a new typeface)

```js
import '@fontsource/{font-name}/{weight}.css';
```

And add to `package.json`:

```bash
npm install @fontsource/{font-name}
```

Skip this step entirely if you're reusing an existing wordmark font (see Step 4 inventory).

---

## 8. Helmet SVG (optional, part of the in-flight generator system)

The helmet generator at `src/assets/helmets/renderHelmet.js` can produce per-team helmet SVGs from `helmetVariants.js` data. Currently only `src/assets/helmets/pronghorns-final.svg` has been finalized. For a new team:

1. Ensure Step 5 (helmet variants) is complete
2. Use the generator tool at `/mockups/helmets.html` (dev-only) to preview and export
3. Save exported SVG to `src/assets/helmets/{teamId}-final.svg`

This step is not required for the team to function — the simple hand-rolled helmet in `cards.js` uses only `teams.js` helmet data. The generator SVG is additive polish.

---

## 9. `docs/TORCH-EMBER-EIGHT-BIBLE.md` — lore

Add a team section following the existing pattern:

```markdown
## {MASCOT} — {School, City}

**Tier:** {top/middle/bottom}
**Ratings:** OFF {n}/5 · DEF {n}/5
**Scheme:** {OFF scheme} / {DEF scheme}

**Ghost Coach:** {Name, tenure, status (dead/alive)}
*{One-paragraph backstory — era, achievements, how they left the program.}*

**Emotional Weight:** {What this program carries — what winning or losing means here.}

**Identity:** {Region, culture, signature play, visual flavor.}
```

---

## Verification checklist

After wiring all 9 steps, run these to confirm the team is fully integrated:

```bash
# 1. Build should succeed with no import errors
npm run build

# 2. Smoke test should pass — exercises engine across all teams
npm test

# 3. Manual: run dev server, navigate to team select, verify:
#    - Team card appears with correct wordmark font + accent
#    - Helmet stripes render
#    - Hold-to-coach confirm works
#    - Pregame shows team correctly
#    - Gameplay hand deals 4 plays from the new playbook
#    - Scorebug shows correct 3-char abbr + wordmark
```

Also grep to confirm no dangling references:

```bash
# Every place the team ID should appear
grep -rn "newteamid" src/ docs/
```

---

## Common mistakes

1. **Forgetting the `_playLookup` entry in state.js** — team exists but hand-draw returns empty arrays. Symptom: gameplay deal produces no play cards.
2. **Skipping the counter matrix symmetry update** — the new team has its own row but the other 7 teams don't reference it. Symptom: matchup scheme advantages broken for any game involving the new team.
3. **Using inconsistent ID casing** — TEAMS keys are lowercase, no spaces, immutable after first commit. The legacy `stags`/`wolves`/`sentinels` mismatch with their display names (SPECTRES/DOLPHINS/BOARS) is intentional for backward compat; new teams should pick IDs that won't need renaming.
4. **Font used in wordmark but not imported in main.js** — wordmark renders with fallback system font. Symptom: the hero wordmark on team select looks like plain Arial.
5. **Star rating + OVR mismatch** — `stars` is visible, `ovr` is hidden; they should correlate (5 stars ≈ 85+, 4 stars ≈ 78–84, 3 stars ≈ 72–77, 2 stars ≈ 65–71). The snap resolver uses `ovr` directly.
6. **`isStar: true` without `starTitle`** — renders an empty star title slot in the card. Always pair them.
7. **Every player with returnAbility ≥ 4** — creates a "who returns?" UI trap. Cluster returners on 1–2 skill position players.
8. **Counter matrix weights exceed 2-strong/2-weak** — break the balance guarantees in the snap resolver. Strict 2/2/3 split, no exceptions.
9. **Forgetting the team in docs/TORCH-EMBER-EIGHT-BIBLE.md** — the team plays but has no narrative, ghost coach, or lore hook for future season mode.

---

## Quick reference: files touched per team add

| # | File | Edit type |
|---|---|---|
| 1 | `src/data/teams.js` | Add TEAMS entry + add COUNTER_MATRIX row + update all 7 other matrix rows |
| 2 | `src/data/players.js` | Add two roster exports + register in `_rosters` |
| 3 | `src/data/{teamId}Plays.js` | Create new file with two playbook exports |
| 4 | `src/data/teamWordmarks.js` | Add one wordmark entry |
| 5 | `src/data/helmetVariants.js` | Add 5-variant array |
| 6 | `src/state.js` | Add playbook import + `_playLookup` entry + `TEAM_DRAW_WEIGHTS` entry |
| 7 | `src/main.js` | Add font import (new typefaces only) |
| 8 | `src/assets/helmets/` | Optional — generate + save finalized SVG |
| 9 | `docs/TORCH-EMBER-EIGHT-BIBLE.md` | Add lore section |
| — | `package.json` | Add `@fontsource/{font}` dep (new typefaces only) |
