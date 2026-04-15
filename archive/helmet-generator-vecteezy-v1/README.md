# Helmet Generator — Vecteezy v1 (archived 2026-04-14)

Working snapshot of the parametric SVG helmet generator built around the
Vecteezy "red-helmet-football-design" base. Archived while we evaluate other
helmet sources — the chinstrap path in this base sits where team decals need
to go, which limits how clean the logos can read.

## What's in here

```
archive/helmet-generator-vecteezy-v1/
├── README.md                              ← you are here
├── docs/
│   └── HELMET-GENERATOR-RESEARCH.md        ← 8-section research brief:
│                                            anatomy, finishes, stripe taxonomy,
│                                            facemask taxonomy, SVG patterns,
│                                            references, MVP build order
├── src/assets/helmets/
│   ├── renderHelmet.js                     ← the generator. API:
│   │                                         renderHelmet(teamId, {
│   │                                           size, showDecal, decal: {...},
│   │                                           decalLayer, topLayerOpacity
│   │                                         })
│   └── sources/
│       ├── helmet-template.svg             ← cleaned/optimized 122-path
│       │                                     template (102KB raw, 40KB gzip)
│       ├── vecteezy-red-helmet-raw.svg     ← raw Inkscape EPS→SVG conversion,
│       │                                     preserved for retracing
│       └── vecteezy-LICENSE.pdf            ← Vecteezy free license terms
└── public/mockups/
    └── helmets.html                        ← live tuner preview:
                                              6 sliders for decal position,
                                              size, tilt, opacity, blend mode,
                                              z-layer, top-layer-alpha
```

## What works

- **Clean layered source.** 122 distinct SVG paths with a semantic 5-shade
  red palette (shell) + 2-shade grey palette (facemask) + white (highlights)
  + bold black outlines. Substitutes cleanly per team via hex replacement.
- **All 8 Ember Eight teams recolor correctly** — Pronghorns green, Spectres
  ice-blue, Maples burgundy, Salamanders green-pink, Dolphins magenta,
  Serpents teal, Boars crimson, Raccoons grey.
- **Live tuning preview** works — sliders update every helmet in real time.
- **Decal layering system** — the generator can insert the team badge
  *between* arbitrary path indices so the chinstrap appears to cross over
  the logo (realistic). Plus a top-layer-opacity control to fade overlying
  paths when they fight the decal.
- **Build** clean — 40KB gzipped template adds only ~0.1KB to the main
  bundle after compression.

## What doesn't quite work

- **Chinstrap conflict.** The Vecteezy helmet's chinstrap wraps diagonally
  across the side panel where team decals would traditionally sit. Even with
  the top-layer-alpha fade at 0.3, the logo placement feels fighty.
  Fundamentally this is a source-asset structural issue, not a generator bug.
- **No native shading gradients.** The source uses solid-fill shading shapes
  rather than radial gradients, which reads slightly cartoony at large sizes.
  Fine for 48–200px but noticeably flat at 400px+.
- **Style reads vintage/illustrated, not modern-broadcast.** The bold black
  outlines give it a "Balatro trading card" feel which is on-brand but not
  the Schutt F7/Riddell SpeedFlex aggressive-modern look ESPN uses.

## To replace the base

When a new helmet source is chosen:

1. Drop the new SVG into `src/assets/helmets/sources/` as
   `helmet-template.svg`.
2. In `renderHelmet.js`, update the `SOURCE` color map at the top — identify
   which hexes in the new SVG are shell/facemask/stripe/outline, then map
   each to the corresponding team color slot. That's the only structural
   change — the recolor pipeline, decal compositing, and layer control all
   carry over unchanged.
3. Retune the `DECAL_DEFAULT` coordinates for the new viewBox. Use the live
   tuner page to find the sweet spot and paste the values in.
4. If the new source has gradients, the substitution pipeline will need to
   iterate `<stop>` elements instead of / in addition to `fill:` declarations.
   Small refactor — the `substFill` helper becomes `substColor` with gradient
   awareness.

## Attribution

Vecteezy Free License requires "Vecteezy.com" credit in the shipped app. If
we ship this version, add the line to settings/about. Upgrading to Pro
($13/mo) removes that requirement.

## Preview URL

When dev server is running: http://localhost:5173/mockups/helmets.html

## Commit at time of archive

TORCH v0.40.0 "Ember Eight" — helmet generator work was on branch `dev`,
not yet committed. This archive is the reference copy.
