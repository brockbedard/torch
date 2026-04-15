# TORCH — Ember Eight Wordmark System

**Status:** Locked. April 14, 2026.
**Depends on:** TORCH-EMBER-EIGHT.md (team identities), Brand Book (color palettes).
**Purpose:** Defines the typographic identity for all 8 Ember Eight teams — font families, weights, color treatments, and the rendering system.

---

## The Eight Wordmarks

| Team | Font | Weight | Google Font | Category |
|------|------|--------|-------------|----------|
| Ridgemont Boars | Zilla Slab | 700 | `Zilla+Slab:wght@700` | Heavy slab serif |
| Vermont Maples | Playfair Display | 900 | `Playfair+Display:wght@900` | High-contrast serif |
| Hollowridge Spectres | Josefin Sans | 100 | `Josefin+Sans:wght@100;200;300` | Ultra-thin geometric |
| Coral Bay Dolphins | Italiana | 400 | `Italiana` | High-fashion Didone |
| Blackwater Serpents | Marcellus | 400 | `Marcellus` | Roman inscriptional |
| Helix Salamanders | Chakra Petch | 600 | `Chakra+Petch:wght@600` | Technical sport |
| Larkspur Pronghorns | Righteous | 400 | `Righteous` | Retro-rounded display |
| Sacramento Raccoons | Major Mono Display | 400 | `Major+Mono+Display` | Experimental mixed-case |

**Note:** Hollowridge loads weights 100, 200, and 300. Weight 100 is the hero display weight. Weight 200-300 is the fallback for T3/micro contexts where 100 would be illegible.

---

## Color Treatments (per Brand Book)

Each wordmark has a fill color and a text-shadow treatment. These are CSS values.

```js
const TEAM_WORDMARKS = {
  ridgemont: {
    name: 'Ridgemont Boars',
    mascot: 'Boars',
    abbr: 'RDG',
    font: "'Zilla Slab', serif",
    weight: 700,
    transform: 'uppercase',
    letterSpacing: '0.03em',
    fill: '#EBB010',           // Tusk Gold
    textShadow: '3px 3px 0px #8B0000, 0 0 24px rgba(235,176,16,0.3)',
    // Brand palette: Crimson #8B0000, Ember #C52C1E, Gold #EBB010, Obsidian #0A0302, Ivory #FFF2C2
  },
  vermont: {
    name: 'Vermont Maples',
    mascot: 'Maples',
    abbr: 'VRM',
    font: "'Playfair Display', serif",
    weight: 900,
    transform: 'none',
    letterSpacing: '0.02em',
    fill: '#FDF4D4',           // Autumn Cream
    textShadow: '2px 2px 0px #7A1E2E, 0 0 18px rgba(122,30,46,0.3)',
    // Brand palette: Wine #7A1E2E, Russet #8B4513, Persimmon #D97706, Gold Vein #FCD34D, Cream #FDF4D4, Aubergine #2E0A14
  },
  hollowridge: {
    name: 'Hollowridge Spectres',
    mascot: 'Spectres',
    abbr: 'HLW',
    font: "'Josefin Sans', sans-serif",
    weight: 100,
    weightMicro: 300,          // Bumped weight for T3 legibility
    transform: 'uppercase',
    letterSpacing: '0.15em',
    fill: '#FFFFFF',           // Hollow White
    textShadow: '0 0 8px rgba(255,244,212,0.6), 0 0 28px rgba(93,173,226,0.6), 0 0 56px rgba(27,79,114,0.4)',
    // Brand palette: White #FFF, Ghost Gold #FFF4D4, Spectre Ice #5DADE2, Ridge Midnight #1B4F72, Abyss #020510
  },
  coralbay: {
    name: 'Coral Bay Dolphins',
    mascot: 'Dolphins',
    abbr: 'CRL',
    font: "'Italiana', serif",
    weight: 400,
    transform: 'uppercase',
    letterSpacing: '0.06em',
    fill: '#FF7EB3',           // Coral Pink
    textShadow: '3px 3px 0px #2E0854, 0 0 20px rgba(255,126,179,0.35)',
    // Brand palette: Coral #FF7EB3, Magenta #D13A7A, Wine #6B1E7F, Prussian #2E0854, Foam #FFF6E4
  },
  blackwater: {
    name: 'Blackwater Serpents',
    mascot: 'Serpents',
    abbr: 'BLK',
    font: "'Marcellus', serif",
    weight: 400,
    transform: 'uppercase',
    letterSpacing: '0.06em',
    fill: '#F5C542',           // Jewel Amber
    textShadow: '3px 3px 0px #14B8A6, -1px -1px 0px #14B8A6, 0 0 16px rgba(245,197,66,0.3)',
    // Brand palette: Obsidian Teal #0A1F1E, Delta Forest #0F766E, Blackwater #14B8A6, Venom Mint #5EEAD4, Amber #F5C542
  },
  helix: {
    name: 'Helix Salamanders',
    mascot: 'Salamanders',
    abbr: 'HLX',
    font: "'Chakra Petch', sans-serif",
    weight: 600,
    transform: 'uppercase',
    letterSpacing: '0.06em',
    fill: '#F39C12',           // Chrome Orange
    textShadow: '3px 3px 0px #8E44AD, 0 0 18px rgba(243,156,18,0.3)',
    // Brand palette: Atelier Green #2ECC71, Fauvist Pink #E84393, Chrome Orange #F39C12, Cadmium Yellow #F1C40F, Violet #8E44AD
  },
  larkspur: {
    name: 'Larkspur Pronghorns',
    mascot: 'Pronghorns',
    abbr: 'LRK',
    font: "'Righteous', sans-serif",
    weight: 400,
    transform: 'uppercase',
    letterSpacing: '0.03em',
    fill: '#F59E0B',           // Antler Gold
    textShadow: '3px 3px 0px #062014, 0 0 20px rgba(245,158,11,0.3)',
    // Brand palette: Creek Forest #062014, Evergreen #166534, Pasture #22C55E, Antler Gold #F59E0B, Prairie Cream #FEF3C7
  },
  sacramento: {
    name: 'Sacramento Raccoons',
    mascot: 'Raccoons',
    abbr: 'MCR',
    font: "'Major Mono Display', monospace",
    weight: 400,
    transform: 'none',
    letterSpacing: '0.04em',
    fill: '#F4F4F5',           // Moonlight
    textShadow: '0 0 18px rgba(255,140,0,0.45), 0 0 42px rgba(255,140,0,0.15)',
    // Brand palette: Moonlight #F4F4F5, Pewter #D4D4D8, Slate #71717A, Storm Noir #27272A, Bandit Black #000, Amber Eye #FF8C00
  },
};
```

---

## Responsive Tiers

| Tier | Context | Content | Size | Notes |
|------|---------|---------|------|-------|
| **T1 — Hero** | Team select, pre-game splash | **Mascot name only** (e.g. "Boars") | 28-36px | Full text-shadow effects |
| **T2 — Label** | Season schedule, matchup header, "Around the Ember Eight" | Full name (e.g. "Ridgemont Boars") | 16-22px | Shadows scaled to 2px offset |
| **T3 — Micro** | Scorebug, card headers | Abbreviation only (e.g. "RDG") | 10-14px | Fill color only, no text-shadow |

### Tier rendering rules:
- T1: Mascot name from `config.mascot`, full `textShadow`
- T2: Full name from `config.name`, scaled shadow offsets (`2px 2px` instead of `3px 3px`), glow radius reduced ~40%
- T3: Abbreviation from `config.abbr`, no `textShadow`, `fill` color only. For Hollowridge, use `weightMicro` (300) instead of `weight` (100)

### Special handling:
- **Hollowridge (Josefin Sans 100):** Weight 100 is the hero weight. At T3 (10-14px), weight 100 is invisible on dark backgrounds. Use `weightMicro: 300` for T3.
- **Major Mono Display (Sacramento):** Lowercase letters render as small caps. Test each tier. At T3, abbreviation "MCR" is all caps — should be fine.
- **Italiana (Coral Bay):** Single weight (400). Thin Didone strokes vanish below 12px. Enforce 12px minimum for T3.
- **Righteous (Larkspur):** Rounded letterforms are wider than condensed type. Verify container fit.

---

## Font Loading

### Google Fonts URL:
```
https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@700&family=Playfair+Display:wght@900&family=Josefin+Sans:wght@100;200;300&family=Italiana&family=Marcellus&family=Chakra+Petch:wght@600&family=Righteous&family=Major+Mono+Display&display=swap
```

### Add to `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@700&family=Playfair+Display:wght@900&family=Josefin+Sans:wght@100;200;300&family=Italiana&family=Marcellus&family=Chakra+Petch:wght@600&family=Righteous&family=Major+Mono+Display&display=swap" rel="stylesheet">
```

---

## Render Function

Create `src/ui/teamWordmark.js`:

```js
import { TEAM_WORDMARKS } from '../data/teamWordmarks.js';

/**
 * Renders a team wordmark as a styled DOM element.
 * @param {string} teamId - Team key (e.g. 'ridgemont', 'hollowridge')
 * @param {string} tier - 't1' (hero/mascot), 't2' (full name), 't3' (micro/abbr)
 * @param {object} opts - Optional overrides { fontSize, container }
 * @returns {HTMLElement}
 */
export function renderTeamWordmark(teamId, tier = 't1', opts = {}) {
  const config = TEAM_WORDMARKS[teamId];
  if (!config) return null;

  const el = document.createElement('div');
  el.className = `team-wordmark team-wordmark--${tier}`;

  // Determine text content per tier
  let text;
  if (tier === 't1') text = config.mascot;       // "Boars", "Spectres", etc.
  else if (tier === 't2') text = config.name;     // "Ridgemont Boars"
  else text = config.abbr;                        // "RDG"

  // Determine font size
  const sizes = { t1: 28, t2: 18, t3: 12 };
  const fontSize = opts.fontSize || sizes[tier];

  // Determine font weight (Hollowridge bumps at T3)
  const weight = (tier === 't3' && config.weightMicro) ? config.weightMicro : config.weight;

  // Determine text-shadow
  let shadow = 'none';
  if (tier === 't1') {
    shadow = config.textShadow;
  } else if (tier === 't2') {
    shadow = config.textShadow
      .replace(/3px 3px/g, '2px 2px')
      .replace(/56px/g, '34px')
      .replace(/28px/g, '17px')
      .replace(/24px/g, '14px')
      .replace(/20px/g, '12px');
  }
  // t3: no shadow

  el.style.cssText = `
    font-family: ${config.font};
    font-weight: ${weight};
    font-size: ${fontSize}px;
    color: ${config.fill};
    text-transform: ${config.transform};
    letter-spacing: ${config.letterSpacing};
    text-shadow: ${shadow};
    line-height: 1.15;
    white-space: nowrap;
  `;
  el.textContent = text;

  if (opts.container) {
    opts.container.appendChild(el);
  }

  return el;
}
```

---

## Where Wordmarks Appear

| Screen | Tier | Content | Notes |
|--------|------|---------|-------|
| Team Select | T1 | **Mascot name only** ("Boars", "Spectres") | Center-aligned below team badge |
| Pre-game Matchup Slam | T1 | Mascot name | Animate in from left/right flanking "VS" |
| Season Schedule | T2 | Full name ("Ridgemont Boars") | Left-aligned, paired with team badge micro |
| "Around the Ember Eight" | T2 | Full name | Centered under each score |
| Scorebug | T3 | Abbreviation ("RDG") | Micro size, fill color only, no effects |
| Post-game Results | T1/T2 | Mascot name for winner (T1), full name for loser (T2) | Winner gets hero treatment |

---

## Claude Code Implementation Prompt

```
Read CLAUDE.md for project context and build rules.

TASK: Implement the Ember Eight wordmark system per TORCH-WORDMARK-SYSTEM.md.

PHASE 1 — Setup:
1. Create `src/data/teamWordmarks.js` with the TEAM_WORDMARKS config object from the spec. Export it.
2. Create `src/ui/teamWordmark.js` with the renderTeamWordmark() function from the spec. Import TEAM_WORDMARKS.
3. Add the Google Fonts link to index.html <head> (see spec for exact URL).

PHASE 2 — Team Select Integration:
4. On the team select screen, render the MASCOT NAME ONLY (e.g. "Boars", not "Ridgemont Boars") at T1 tier below each team badge.
5. The wordmark replaces any existing team name text that was using Teko/Bebas.
6. Center-align the wordmark below the badge.

PHASE 3 — Codebase Audit (CRITICAL):
7. Audit every screen where team names currently appear. For each location, measure the rendered width of every team's wordmark at its target tier and font size. Report:
   - Container width available (px)
   - Rendered wordmark width for each of the 8 teams (px)
   - Any overflows (wordmark wider than container)

   Pay special attention to:
   a) HOLLOWRIDGE (Josefin Sans 100, letter-spacing 0.15em) — the wide tracking makes "SPECTRES" significantly wider than other mascot names. If it overflows the team select card at 375px viewport, reduce letter-spacing or font-size until it fits.
   b) SACRAMENTO (Major Mono Display) — mixed-case rendering. Verify "Raccoons" doesn't look broken. The font renders lowercase as small caps — confirm this reads as intentional.
   c) CORAL BAY (Italiana) — thin Didone strokes. If the abbreviation "CRL" is illegible at 12px on #07060A background, bump to 14px minimum.
   d) LARKSPUR (Righteous) — wider than condensed fonts. "PRONGHORNS" is 10 characters in a rounded typeface. Verify it fits team select cards and scorebug containers.
   e) ALL TEAMS — compare rendered widths at T1 (mascot name). If any team's mascot name is more than 30% wider than the narrowest, flag it and propose a fix.

8. Integrate wordmarks into the Scorebug at T3 tier. Replace existing team name/abbreviation text.

PHASE GATE: Stop after Phase 3. Show me:
   a) Screenshot of the team select screen with all 8 mascot-name wordmarks
   b) A table of width audit results for all 8 teams at T1 and T3
   c) Screenshot of the scorebug with T3 abbreviations
   d) List of any proposed fixes for overflow or legibility issues
Do NOT proceed to other screens without approval.
```

---

## Design Rationale Summary

| Team | Font | Category | Why It Fits |
|------|------|----------|-------------|
| Ridgemont | Zilla Slab Bold | Heavy slab serif | Mill-town industrial. Stamped steel. |
| Vermont | Playfair Display Black | High-contrast serif | Ivy-adjacent prestige. Old money. |
| Hollowridge | Josefin Sans 100 | Ultra-thin geometric | The letters themselves are ghosts. Barely there. |
| Coral Bay | Italiana | High-fashion Didone | South Florida luxury. The program that hired an agency. |
| Blackwater | Marcellus | Roman inscriptional | Patient authority. Restraint that lets teal/amber breathe. |
| Helix | Chakra Petch SemiBold | Technical sport | Angular geometry for a science school. Sporty but brainy. |
| Larkspur | Righteous | Retro-rounded display | 1970s dynasty nostalgia. Wally Reinhardt's Nebraska. |
| Sacramento | Major Mono Display | Experimental mixed-case | Design school. No history. The weirdest font for the weirdest team. |
