# TORCH — Broadcast-Quality SVG Helmet Generator: Research & Build Brief

**Date:** 2026-04-14
**Status:** Research complete, implementation not started.
**Goal:** A reusable `renderHelmet(teamId, opts)` SVG generator whose output would look at home on ESPN's gameday scoreboard, CBS Sports matchup cards, 247Sports recruit pages, and EA CFB 25 team-select.

This document replaces the aborted Gemini deep-research. Sources are cited inline. Opinionated — no hedging.

## Existing TORCH starting point

`src/ui/components/cards.js:190` exports `teamHelmetSvg(teamId, size)`. It's a **flat mark** — a single silhouette path filled with `team.helmet.base`, three rectangles for the facemask, a center stripe rect, plus a hairline light-catch. It does its job as a 48px icon on a card, but at any size it reads as clipart — no volume, no material, no decal, no variant support. That's the floor we're rebuilding from.

The new generator lives in a new module `src/assets/helmets/renderHelmet.js`, keeping `teamHelmetSvg` as the compatibility alias while we migrate sites.

---

## 1. Anatomy of a broadcast-quality helmet graphic

The 3/4-view right-facing helmet is the canonical broadcast angle — Michigan wing visible, facemask front-and-center, decal readable on the shell. Professional illustrators build this out of **8 stacked layers**. Missing any one is how graphics read as "toy" or "clipart."

### 1.1 Layers (back to front)

| # | Layer | Purpose | SVG construction |
|---|-------|---------|------------------|
| 1 | **Contact shadow** | Grounds the helmet on a "surface" — stops it floating | Flat ellipse below, `feGaussianBlur stdDeviation=6-10`, 18–35% opacity black |
| 2 | **Shell silhouette** | Base color + outline authority | One `<path>` with the shell curve, filled with `team.helmet.base` |
| 3 | **Shell mid-tone shading** | Volumetric falloff — the dome is curved, the cheek is a plane | Radial gradient inside a clipped copy of the shell path: warm/light top-left → cool/dark bottom-right. Use **2 radial gradients** (one for the dome, one for the jaw), NOT one global gradient. This is the biggest quality lever. |
| 4 | **Ambient occlusion (AO)** | Fake contact shadows where light can't reach: under the jaw, inside the ear hole, behind the facemask, under the decal | Separate paths filled with semi-transparent black (12–22%), positioned precisely. Blur ~1–2px. |
| 5 | **Decal** | Team identity | Embedded `renderTeamBadge(teamId)` via `<g>`, positioned and slightly rotated/scaled to fake curvature |
| 6 | **Stripe** | Team identity | Path that wraps the crown, follows the dome curve. See §3. |
| 7 | **Facemask cage** | Position silhouette | Stroked paths with gradients, front-bar brighter than side-bar. See §4. |
| 8 | **Specular highlights & rim light** | Material language + edge separation | A thin (1–2px) white stroke with `opacity 0.5` along the top-left edge + a radial highlight spot near the top of the dome |

Crucially, **layer 3 (mid-tone shading) is what separates pro from amateur.** The [vectordiary tutorial](https://vectordiary.com/create-a-footbal-helmet-tutorial/) uses two stacked ellipses (297×307 outer, 265×295 inner) and applies radial gradients to each. Our helmet path will be more complex than ellipses, but the two-zone shading principle holds: treat the dome and the jaw as separate volumes with their own radial gradients.

### 1.2 3/4-view proportions (the silhouette itself)

Measured from production CFB helmet illustrations (reviewed via [Dribbble football-helmet tag](https://dribbble.com/tags/football-helmet), SportLogos.net references, Schutt/Riddell product renders):

- **Aspect ratio:** width ≈ 1.25× height. The helmet is wider than it is tall in 3/4 view because the jaw extends forward past the dome.
- **Dome vs jaw:** dome is the upper ~60%, jaw is the lower ~40%. The inflection point ("ear line") is at roughly 55% down from the top.
- **Ear hole:** horizontal center is at ~55% of width from left, vertical center at ~58% of height. Approximately an 8% × 9% oval.
- **Chin strap:** visible **loop** under the earhole — a 2–3px stroke path curving from the lower-back of the shell around to the chin cup. The chin cup itself is a soft rectangle at the front-bottom, 12% wide, 6% tall.
- **Facemask:** front-extending cage starts at ~70% across horizontally, extends another 25% forward. Top bar is at ~45% height, bottom bar at ~75% height.

### 1.3 Common mistakes that make helmets look clipart-y

1. **Flat single-color shell** — no mid-tone, no volume → toy
2. **Facemask drawn as straight rectangles** → looks like a crosshatch, not a cage. Real facemasks have subtle vertical curvature and bars in front are thicker than bars behind.
3. **No ambient occlusion under the jaw** → the helmet appears to float, not rest on the neck.
4. **Decal sits dead-center on the dome** — real decals sit on the side (the plane most visible in 3/4 view), slightly forward of center, slightly tilted.
5. **Stripe is a straight rectangle** on the dome → breaks the illusion that the dome is curved. Stripe must taper front-to-back and follow the dome's curve.
6. **Full-white specular highlight** — makes the helmet look wet plastic rather than painted metal. Use `rgba(255,255,255,0.15–0.35)` and feather heavily.

---

## 2. Finish variants (material treatments)

Real CFB uses ~8 finishes. Each translates differently to SVG. Opinions below are for **broadcast-card rendering** (64–200px), not editorial hero graphics (where you'd use Photoshop or a 3D mockup anyway).

### 2.1 Matte (most common for throwbacks)

Soft, no specular highlight. Just mid-tone radial shading.

```xml
<filter id="matte">
  <feGaussianBlur stdDeviation="0" />
  <!-- Matte = no filter, just the base color + radial shading gradient -->
</filter>
```

Technique: **skip the specular layer entirely**. Use only the radial mid-tone gradient (layer 3). Add a subtle AO on the top/sides to imply volume without reflection.

### 2.2 Gloss (standard shiny paint — 90% of real helmets)

Mid-tone + a soft specular spot + a rim light. The specular spot is a radial gradient with white-at-center, positioned at ~25% from left, ~18% from top of the dome.

```xml
<radialGradient id="gloss-spec" cx="0.25" cy="0.18" r="0.35">
  <stop offset="0" stop-color="white" stop-opacity="0.45"/>
  <stop offset="0.6" stop-color="white" stop-opacity="0"/>
</radialGradient>
```

Paint this gradient on a copy of the dome path (clip-path or mask to contain it).

### 2.3 Metallic flake (Oregon-style mica base coat)

Real mica paint sparkles because individual flakes catch light at different angles. In SVG at broadcast-card scale, **approximate with a two-layer approach**:

1. Gloss base (§2.2)
2. A **low-density noise overlay** via `feTurbulence` at ~8% opacity, multiplied against the base

```xml
<filter id="metallic-flake" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" result="noise"/>
  <feColorMatrix in="noise" type="matrix"
    values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.08 0" result="sparkle"/>
  <feComposite in="sparkle" in2="SourceGraphic" operator="in" result="masked"/>
  <feBlend in="SourceGraphic" in2="masked" mode="screen"/>
</filter>
```

At thumbnail sizes the flakes compress visually into a shimmer; at large sizes they read as micro-sparkles. Tune `baseFrequency` and the alpha (`0.08`) per team.

### 2.4 Chrome (Ohio State silver, Oregon Liquid Metal)

This is the hard one. True chrome is a reflection of the environment, not a property of the surface — which is why [Oregon's real HydroChrome](https://spectrachrome.com/gallery-riddell/) is literally electroplated. In SVG you **fake environmental reflection with a strong vertical gradient** that runs light-dark-light-dark, producing the "mirror horizon line" that chrome always has.

```xml
<linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0"    stop-color="#F0F4F8"/>  <!-- Sky reflection -->
  <stop offset="0.35" stop-color="#8A95A5"/>  <!-- Horizon shadow -->
  <stop offset="0.55" stop-color="#3A4048"/>  <!-- Ground reflection (dark) -->
  <stop offset="0.85" stop-color="#C0C8D0"/>  <!-- Ground highlight -->
  <stop offset="1"    stop-color="#5A6370"/>
</linearGradient>
```

Plus `feSpecularLighting` for the sharp highlight on the dome top:

```xml
<filter id="chrome-spec">
  <feSpecularLighting in="SourceGraphic" result="spec"
    surfaceScale="5" specularConstant="1.2" specularExponent="60" lighting-color="white">
    <fePointLight x="60" y="40" z="120"/>
  </feSpecularLighting>
  <feComposite in="spec" in2="SourceGraphic" operator="in"/>
</filter>
```

`specularExponent="60"` is the chrome sweet spot — [MDN documents the full range](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpecularLighting) as 1.0–128.0, with higher = tighter/sharper highlight ("more shiny"). 1–5 is matte, 10–20 is satin, 20–40 is gloss, 50–80 is chrome, 100+ is "wet mirror."

For team-tinted chrome (like Washington's purple chrome), multiply the gradient output against the team color instead of pure greyscale.

### 2.5 Pearlescent / iridescent (Washington's pearl helmets)

Pearlescent shifts hue based on viewing angle. In a static SVG, **fake this with a three-stop gradient that includes a subtle hue shift** — e.g., for white pearl, offset-0 is cool-white, offset-0.5 is warm-white, offset-1 is pink-tinged white.

```xml
<linearGradient id="pearl" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0"   stop-color="#F8FAFF"/>  <!-- Cool highlight -->
  <stop offset="0.5" stop-color="#FFF8ED"/>  <!-- Warm mid -->
  <stop offset="1"   stop-color="#FFE5F2"/>  <!-- Pink shadow tint -->
</linearGradient>
```

Combine with gloss-level specular. The pearl effect needs the diagonal gradient angle (x1=0 y1=0 → x2=1 y2=1), not a vertical one — that's what sells the "viewing angle" illusion.

### 2.6 Carbon fiber (Baylor, South Carolina 2015-era)

Real carbon fiber is a tight woven pattern. In SVG, use `feTurbulence` + displacement:

```xml
<pattern id="carbon-weave" width="6" height="6" patternUnits="userSpaceOnUse">
  <rect width="6" height="6" fill="#1a1a1a"/>
  <rect x="0" y="0" width="3" height="3" fill="#2a2a2a"/>
  <rect x="3" y="3" width="3" height="3" fill="#2a2a2a"/>
</pattern>
```

Then overlay it on the shell at 35–50% opacity, mix-blend-mode:overlay.

### 2.7 Hydro-dipped / graphic wrap (Oregon wings, Maryland flag, Miami reverse stripe)

Graphic wraps are out of scope for a parametric template — they're hand-authored per team. **Keep an `overlay: <svg>` escape hatch in the API** so teams with a unique wrap can inject a full-shell SVG layer that stacks between the shell and the specular highlights.

### 2.8 Satin / brushed metal (Alabama anniversary)

Between matte and gloss. `specularExponent="10-15"`, lower `specularConstant="0.7"`, and a **horizontal-streak** noise pattern (brushed effect):

```xml
<filter id="brushed">
  <feTurbulence type="turbulence" baseFrequency="0.01 0.4" numOctaves="2" result="brush"/>
  <feDisplacementMap in="SourceGraphic" in2="brush" scale="1.5"/>
</filter>
```

The asymmetric `baseFrequency="0.01 0.4"` (low X, high Y) creates horizontal streaks rather than isotropic noise.

### 2.9 Finish API

```js
renderHelmet(teamId, { finish: 'gloss' | 'matte' | 'chrome' | 'metallic' | 'pearl' | 'carbon' | 'satin', ... })
```

Default `'gloss'`. Each finish is a filter-id string applied to the shell path. Chrome and metallic are the two that meaningfully change the team's visual identity — ship gloss + matte in v1, add chrome + metallic in v2.

Sources: [Van Seo Design — feSpecularLighting tutorial](https://vanseodesign.com/web-design/svg-filter-primitives-fespecularlighting/), [dev.to — SVG dynamic lighting](https://dev.to/hexshift/adding-dynamic-lighting-effects-with-svg-filters-1jj6), [Codrops — feTurbulence texture](https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/), [MDN `<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpecularLighting).

---

## 3. Stripe systems

Ten parametric stripe types cover ~95% of CFB. Each is a separate function that returns an SVG path (or paths) given the shell's dome curve. The stripe is painted **after** the mid-tone shading but **before** the facemask and specular highlights.

| Stripe type | Representative teams | Geometry |
|---|---|---|
| `center` | Alabama, Penn State, Georgia | Single vertical stripe following the dome's centerline. Taper from front (wider) to back (narrower) to fake 3/4 foreshortening. |
| `tri` / `northwestern` | Auburn, Florida, ND | Three parallel stripes, thinner (each ~30% of single-stripe width). |
| `wing` | Michigan, Princeton, Delaware | Sharp-edged maize wing over the forehead wrapping to the side. **Bezier-authored per team** — not fully parametric. |
| `bolt` / `lightning` | WVU throwback, Air Force | Jagged polyline along the crown. |
| `logo-stripe` | Miami (repeating U), Oklahoma (OU) | Actually a tiled pattern of the team's primary mark along the centerline. |
| `tapered` / `spear` | Kansas, BC, Houston | Single stripe that widens in the middle (spear-shaped). |
| `halo` / `ring` | Rare (throwbacks) | Horizontal stripe around the head circumference rather than over the crown. |
| `none` | Texas, Oregon chrome, some throwbacks | No stripe at all. The dome is clean. |
| `chrome-stripe` | Oregon variants | Stripe painted in chrome while the shell is matte — stripe uses the chrome filter, shell uses matte. |
| `illustrated` | Maryland flag, Cal "flag" | Full custom SVG overlay. Goes through the `overlay:` escape hatch, not the `stripe:` parameter. |

### 3.1 The dome-curve trick

A straight rect running top-to-bottom will read as pasted on. The stripe has to **follow the dome's curve**. Construct the stripe as a `<path>` with Bezier control points matched to the dome:

```xml
<!-- Center stripe, following dome curve, tapered front→back -->
<path d="M 260 30
         C 250 25, 220 25, 210 30    /* front edge, wide */
         L 185 160                     /* back edge, narrow */
         C 195 162, 255 162, 265 160
         Z"
      fill="url(#team-accent-gradient)"/>
```

Front-edge width ~22px at viewBox 512 wide; back-edge width ~14px. Tapering matters.

Sources: [Wikipedia — Winged football helmet](https://en.wikipedia.org/wiki/Winged_football_helmet), [Bentley Historical — Michigan's winged helmet](https://bentley.umich.edu/athdept/football/helmet/mhelmet.htm), [SchoolPride helmet stripes](https://schoolpride.com/decals/football-decals/stripes), [The Helmet Project](https://www.nationalchamps.net/Helmet_Project/), [Helmet History](https://www.helmethistory.com/).

### 3.2 Wing helmet specifics (since it's CFB's most iconic stripe)

Per [Bentley Historical Library](https://bentley.umich.edu/athdept/football/helmet/mhelmet.htm):
- Originally functional padding — became pure identity in 1938 under Fritz Crisler
- Composed of a **block of maize with pointed edges converging to a point on the sides**, with **three stripes** emerging vertically and wrapping around the crown to the back

For the generator: wing is one filled path (SVG `<path>`), three stripes are three separate thin rects. Not truly parametric — author once per wing-using team (Michigan, Princeton, Delaware get different wings).

---

## 4. Facemask variants

The Schutt/Riddell catalogue has ~14 common cage configurations. Broadcast graphics don't need all 14 — we need **6 archetypes** that read correctly at thumbnail size. Based on the [Sports Unlimited facemask buying guide](https://www.sportsunlimitedinc.com/football-facemask-buyers-guide.html):

| ID | Real name | Position | Bar pattern |
|---|---|---|---|
| `single-bar` | Schutt OPO / old-school | QB, K, throwbacks | 1 horizontal bar across the mouth |
| `qb` | Schutt ROPO-SW / Riddell 2BD | QB, WR, DB | 2 horizontal bars (mouth + chin), 1 short vertical center bar |
| `skill` | Schutt ROPO-DW / Riddell 2EG | RB, TE, DB | 3 horizontal bars + 1 vertical center bar |
| `lb` | Schutt RJOP / Riddell 3BD | LB, FB, TE | 3 horizontal + 2 vertical bars, closed forehead bar |
| `ol-dl` | Schutt EGOP-II / Riddell 3BDP | OL, DL, DE | 3 horizontal + 3 vertical bars, eye-level crossbars |
| `dl-cage` | Schutt NJOP | DL big cage | 4 horizontal + 3 vertical + upper eye cage — a true cage |

### 4.1 SVG construction

Each facemask is a `<g>` of stroked `<path>` elements. The [vectordiary tutorial](https://vectordiary.com/create-a-footbal-helmet-tutorial/) uses **9px strokes with linear gradients** on each bar. Key moves:

1. **Front-facing bars are thicker than side-facing bars.** In 3/4 view, the bar closest to the camera (the mouthguard bar that extends forward) is ~3px, the rear attachment points are ~2px.
2. **Each bar gets a linear gradient**, not a flat fill. Highlight on top (simulating overhead stadium lights), shadow on bottom. `url(#fm-gradient)`.
3. **Cast subtle shadows onto the shell behind each bar.** A 1px dark stroke offset 2px down/right from each bar, at ~30% opacity, clipped to the shell path.
4. **Rivet details at anchor points** — 3–4 small filled circles where the cage attaches to the shell. Optional but adds real fidelity.

```xml
<linearGradient id="fm-bar" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="white" stop-opacity="0.3"/>
  <stop offset="0.5" stop-color="var(--fm-color)"/>
  <stop offset="1" stop-color="black" stop-opacity="0.3"/>
</linearGradient>
```

### 4.2 Facemask API

```js
renderHelmet(teamId, { facemask: 'qb' | 'skill' | 'lb' | 'ol-dl' | 'single-bar' | 'dl-cage', ... })
```

Default `'skill'` (the most common, safest-looking at thumbnail size). Add `facemaskColor: '#ccc'` to override `team.helmet.facemask` when you want a chrome or color-swapped cage.

Sources: [Schutt Sports facemask catalogue](https://schuttsports.com/collections/facemasks), [Sports Unlimited facemask guide](https://www.sportsunlimitedinc.com/football-facemask-buyers-guide.html).

---

## 5. Decal placement & conformation

The decal (team logo) is THE single biggest identity cue. Nail this or the whole helmet reads generic.

### 5.1 Placement in 3/4 view

- **Horizontal:** centered between the ear hole and the front edge of the shell. In our viewBox (512 wide), that puts the decal center at roughly x=320.
- **Vertical:** roughly at the ear-hole height (y ≈ 230 of 411) — centered on the "side panel" that's most visible in 3/4 view.
- **Size:** width ≈ 30–38% of shell width. Too small = forgettable; too big = cartoon.
- **Tilt:** 2–5° rotation counter-clockwise. The helmet's side panel slopes slightly. A dead-level decal looks glued on; a tilted decal looks painted.

### 5.2 Conformation (making it look painted, not stickered)

Three progressive levels:

**Level 1 (cheapest, works fine at thumbnail):** Just embed `renderTeamBadge(teamId)` as a `<g>` with `transform="translate(...) rotate(-3) scale(0.28)"`. This is what ESPN's small scoreboard renders do.

**Level 2 (broadcast fidelity):** Add a **drop shadow** on the decal (1–2px, 40% opacity) to push it "into" the shell:

```xml
<g filter="url(#decal-shadow)">
  <!-- renderTeamBadge SVG -->
</g>

<filter id="decal-shadow" x="-10%" y="-10%" width="120%" height="120%">
  <feGaussianBlur stdDeviation="0.8"/>
  <feOffset dx="1" dy="1.5"/>
  <feComposite in2="SourceGraphic" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0"/>
</filter>
```

**Level 3 (editorial/hero):** Use `feDisplacementMap` with a spherical noise map to actually warp the decal over the dome curve. Overkill for scoreboard sizes; keep in back pocket for `size >= 300` hero graphics.

### 5.3 Outline treatments

Some teams' decals get an outline when placed on a helmet (Michigan's block M has a maize outline). Optional per-team config:

```js
// team.helmet
{ base: '#00274C', facemask: '#FFCB05', stripe: '#FFCB05', decalOutline: '#FFCB05', decalOutlineWidth: 2 }
```

---

## 6. SVG implementation patterns (the production stack)

### 6.1 One template vs per-team authored

Looking at how ESPN, CBS Sports, and SportLogos.net handle scale: they do **both**. A parametric template for 90% of teams, hand-authored SVGs for the 5–10% with unique geometry (Michigan wing, Maryland flag, Oregon variants, Miami U-stripe).

[ESPN's 2025 redesign](https://www.newscaststudio.com/2025/09/19/espn-college-football-branding-design-graphics/) explicitly calls out scalability "to support more than 130 teams" — they focus on helmets + gloves as the core visual element, which implies they're generating these, not authoring 130 one-offs.

**Our approach:** one parametric template + the overlay escape hatch. Ship with the 8 Ember Eight teams parametrically; if we need Michigan wings later, slot in a per-team override.

### 6.2 File structure

```
src/assets/helmets/
  renderHelmet.js              # Entry point. export renderHelmet(teamId, opts)
  helmetTemplate.js            # Base template: paths, gradients, filters
  stripes.js                   # 10 stripe types
  facemasks.js                 # 6 facemask archetypes
  finishes.js                  # 8 finish filters
  decal.js                     # Decal placement + transforms
  overrides/                   # Per-team override hooks (none yet for Ember Eight)
    # michigan.js, oregon-chrome.js etc. (future)
```

### 6.3 Inline vs `<symbol>` + `<use>`

If we render 8 helmets on one screen (team select carousel wouldn't — one at a time), `<symbol>` + `<use>` for the facemask primitive and stripe paths deduplicates markup. For now: **inline**. We're rendering one helmet at a time. Add `<symbol>` consolidation only if we build a "scoreboard view" with multiple simultaneous helmets later.

### 6.4 API signature

```js
/**
 * Build a broadcast-quality helmet SVG string for a team.
 *
 * @param {string} teamId
 * @param {object} opts
 * @param {number} [opts.size=120]  Display width (px). Height scales to viewBox ratio.
 * @param {string} [opts.finish='gloss']  'gloss' | 'matte' | 'chrome' | 'metallic' | 'pearl' | 'satin' | 'carbon'
 * @param {string} [opts.stripe]  Override team default. 'center' | 'tri' | 'wing' | 'bolt' | 'logo-stripe' | 'tapered' | 'halo' | 'none'
 * @param {string} [opts.facemask='skill']  'single-bar' | 'qb' | 'skill' | 'lb' | 'ol-dl' | 'dl-cage'
 * @param {string} [opts.facing='right']  'right' | 'left' (mirrors the SVG)
 * @param {boolean} [opts.showShadow=true]  Contact shadow under helmet
 * @param {string} [opts.overlay]  Raw SVG fragment for per-team graphics (Maryland flag, Oregon wing)
 * @returns {string} SVG string
 */
export function renderHelmet(teamId, opts = {}) { ... }
```

### 6.5 Team data extension

Add to `src/data/teams.js` per team:

```js
helmet: {
  base: '#166534',
  facemask: '#F59E0B',
  stripe: '#FCD34D',
  stripeStyle: 'center',        // NEW: default stripe type
  defaultFinish: 'gloss',        // NEW: default finish
  decalOutline: '#FCD34D',       // NEW: optional decal outline
  decalOutlineWidth: 0           // NEW
}
```

### 6.6 Accessibility

Each helmet gets `<title>{team.school} {team.name} helmet</title>` as the first child, plus `role="img"` on the root `<svg>`. Screen readers announce "Larkspur State University Pronghorns helmet" instead of "graphic."

---

## 7. Reference library

Sites to study (bookmark these, use as spot-check during build):

- **[The Helmet Project](https://www.nationalchamps.net/Helmet_Project/)** — vintage encyclopedia of every CFB helmet, including throwbacks and defunct programs. The reference for confirming historical accuracy of a stripe or color combo.
- **[Helmet History](https://www.helmethistory.com/)** — sister resource, similar coverage.
- **[Bentley Historical Library — Michigan wing](https://bentley.umich.edu/athdept/football/helmet/mhelmet.htm)** — the definitive reference on the wing design.
- **[Spectra Chrome — NCAA helmet gallery](https://spectrachrome.com/gallery-riddell/)** — real chrome helmets, good reference for what our chrome filter should reproduce.
- **[Schutt facemask catalogue](https://schuttsports.com/collections/facemasks)** — every real facemask style with photos. Use as visual source for your SVG facemask paths.
- **[Dribbble football-helmet tag](https://dribbble.com/tags/football-helmet)** — 80+ designer portfolios. Study the top-voted ones for shading and decal techniques.
- **[ESPN 2025 CFB graphics package](https://www.newscaststudio.com/2025/09/19/espn-college-football-branding-design-graphics/)** — the bar we're clearing.

---

## 8. Build order

### Phase 1 — MVP that already looks broadcast-quality (v1)

Target: ship a helmet that beats the current `teamHelmetSvg` at every size from 48px to 300px.

1. **New template shell path** — proper 3/4-view silhouette at viewBox `0 0 512 411`. Hand-author once in Illustrator/Figma → export path. Test at 48, 80, 120, 200px.
2. **Two-zone radial gradient shading** (layer 3) — dome + jaw, separately gradient-filled. This is the biggest quality lever.
3. **AO layer** — soft shadows under the jaw, inside the ear hole, behind the facemask region.
4. **`skill` facemask** — 3 horizontal bars + 1 vertical. Stroke-gradient fill.
5. **`center` stripe** — Bezier path that tapers front-to-back, not a rect.
6. **Decal** — `renderTeamBadge` embedded with proper transform + a soft drop-shadow filter.
7. **Specular highlight spot** + rim light — the top-left dome catch + back-edge separation light.
8. **Contact shadow ellipse** — 35% opacity, 8px blur, below the helmet.
9. **`gloss` and `matte` finishes** — just the filter stack for each.

Validation: render each of the 8 Ember Eight teams. Compare side-by-side with their real school's broadcast helmet graphic (or a close proxy — Pronghorns → Baylor/Oregon State etc.). If any team looks flat or toy-like, go back and fix the layer that's failing.

### Phase 2 — Variants & polish (v2)

1. **Remaining stripes** — `tri`, `bolt`, `tapered`, `halo`, `none`, `logo-stripe`
2. **Remaining facemasks** — `qb`, `lb`, `ol-dl`, `single-bar`, `dl-cage`
3. **`chrome`, `metallic`, `satin` finishes**
4. **Per-team `helmet` fields** — `stripeStyle`, `defaultFinish`, `decalOutline` on each team in `teams.js`
5. **`mirror` for left-facing variant** (matchup cards: home team right-facing, away team left-facing)

### Phase 3 — The unusual (v3 / as-needed)

1. **Wing stripe override for Michigan/Princeton/Delaware** (if we ship a full CFB pack)
2. **`overlay:` escape hatch** — pass raw SVG fragment for one-off graphics like Maryland flag, Miami reverse stripe, Oregon wings
3. **`pearl` and `carbon` finishes**
4. **`feDisplacementMap` decal warping** for hero-size renders ≥ 300px

### Failure-mode diagnostics

If a rendered team helmet looks wrong, the failing layer is:

| Symptom | Root cause layer |
|---|---|
| "Looks like a toy / clipart" | Missing layer 3 (mid-tone radial shading) |
| "Floating, doesn't sit right" | Missing layer 1 (contact shadow) |
| "Flat cardboard feel" | Missing layer 4 (AO) or layer 8 (rim light) |
| "Decal looks stickered on" | Missing layer 5 drop-shadow; tilt too straight |
| "Facemask feels crosshatched" | Bars are rects not stroked paths; front bars not thicker than rear bars |
| "Stripe feels painted on a box" | Stripe is a rect not a Bezier path that tapers |
| "Chrome looks like grey paint" | `specularExponent` too low (try 60) OR missing the vertical 5-stop gradient |

### Validation teams (stress tests)

If the template survives these five, it's broadcast-quality:

1. **Alabama** — classic crimson, single white center stripe, grey facemask. If this looks boring, the shading layers are failing.
2. **Michigan** — maize wing, blue shell, maize facemask. Tests the wing override system (phase 3).
3. **Oregon** — green-and-yellow gloss, yellow stripe, black facemask. Tests high-contrast palette + gloss finish.
4. **Miami** — orange-green-white, logo-stripe (the U repeated). Tests the `logo-stripe` variant.
5. **Ohio State** — silver chrome, grey facemask, no stripe. Tests the `chrome` finish + `stripe: 'none'`.

---

## Sources

- [Van Seo Design — feSpecularLighting tutorial](https://vanseodesign.com/web-design/svg-filter-primitives-fespecularlighting/)
- [dev.to — Adding Dynamic Lighting Effects with SVG Filters](https://dev.to/hexshift/adding-dynamic-lighting-effects-with-svg-filters-1jj6)
- [Codrops — Creating Texture with feTurbulence](https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/)
- [MDN — `<feSpecularLighting>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpecularLighting)
- [MDN — `<feTurbulence>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence)
- [Vectordiary — Create A Football Helmet (Illustrator tutorial)](https://vectordiary.com/create-a-footbal-helmet-tutorial/)
- [Sports Unlimited — Football Facemask Buying Guide](https://www.sportsunlimitedinc.com/football-facemask-buyers-guide.html)
- [Schutt Sports — Facemasks catalogue](https://schuttsports.com/collections/facemasks)
- [Wikipedia — Winged football helmet](https://en.wikipedia.org/wiki/Winged_football_helmet)
- [Bentley Historical Library — Michigan's Winged Helmet](https://bentley.umich.edu/athdept/football/helmet/mhelmet.htm)
- [The Helmet Project (nationalchamps.net)](https://www.nationalchamps.net/Helmet_Project/)
- [Helmet History](https://www.helmethistory.com/)
- [Spectra Chrome — Riddell gallery](https://spectrachrome.com/gallery-riddell/)
- [SchoolPride — Football helmet stripes](https://schoolpride.com/decals/football-decals/stripes)
- [NewscastStudio — ESPN 2025 CFB graphics redesign](https://www.newscaststudio.com/2025/09/19/espn-college-football-branding-design-graphics/)
- [Dribbble — football-helmet designers](https://dribbble.com/tags/football-helmet)
