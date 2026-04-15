# Logo Exploration · April 2026

Drafting artifacts from the TORCH Season 2 logo identity system design pass.

## Final Decisions

All 8 teams' logos were finalized and committed to `src/assets/icons/teamLogos.js` and `src/data/teams.js` on 2026-04-14. The exploration below led to those final picks.

| Team | Variant | Concept | Primary | Secondary |
|------|---------|---------|---------|-----------|
| Boars | A (current) | Crimson Sovereign | `#8B0000` | `#C4A265` |
| Dolphins | J (flipped) | Oracle's Wave | `#D13A7A` | `#6B1E7F` |
| Spectres | J | Eclipse Corona | `#5DADE2` | `#1B4F72` |
| Serpents | D | Quetzalcoatl (teal) | `#14B8A6` | `#F5C542` |
| Pronghorns | A (current) | Cedar Creek | `#166534` | `#F59E0B` |
| Salamanders | H | Fauvist Triadic | `#2ECC71` | `#E84393` |
| Maples | (shift) | Oxblood Momiji | `#7A1E2E` | `#D97706` |
| Raccoons | (invert) | Moonshine Silver | `#D4D4D8` | `#FF8C00` |

## Files in this archive

| File | Purpose |
|------|---------|
| `build_alts_ef.mjs` | Initial A→F variant generator (Bold, Biology, Myth, Era, Moment) |
| `build_alts_ghi.mjs` | Full A→I variant matrix with 9 concepts × 8 teams + scoring |
| `build_j_tens.mjs` | Perfect-10 "J" column generator — one refined execution per team |
| `build_triad.mjs` | Triad rebalance proposal — Boars/Maples/Raccoons split into distinct color cells |
| `build_brandbook.mjs` | Full brand book HTML generator — cover + 8 team spreads |
| `apply_final_logos.mjs` | Applies final gradients to `teamLogos.js` |
| `update_season_mockups.mjs` | Batch-updates hex colors in Season 2 mockup HTMLs |

## Mockup pages generated

All live in `public/mockups/`:

- `season-2-logos.html` — production preview of the live 8 teams
- `logo-variants.html` — the 9-column A→I comparison grid with scores
- `perfect-10.html` — J "Perfect 10" bespoke-rebuild page with side-by-side A→J comparison
- `triad-rebalance.html` — Boars/Maples/Raccoons separation proposal with conference color map
- `brandbook.html` — full brand book with covers, team spreads, color palettes, typography, mini apps

## Design principles locked in

1. **Every team owns a distinct cell on the thermal × saturation × signature-hue grid.** No two teams overlap.
2. **Gradient depth = premium feel.** 5-7 stops per gradient, including a highlight stop and a shadow stop.
3. **Focal accents are concentrated, not distributed.** Raccoon amber lives only in the eye, not the body. Serpent gold lives only in the eye, not the scales.
4. **Hardcoded detail colors matter.** For multi-path SVGs from IconScout, hardcoded hex colors (outlines, shadows, highlights) have to be hand-matched to the new gradient family — otherwise you get dark outlines from the original file that clash with the new palette.
5. **The Pronghorn antler uses `userSpaceOnUse`** so both antlers render identically regardless of path shape. Default `objectBoundingBox` samples the gradient per-path, causing visible asymmetry on symmetric shapes.

## Regenerate mockups

```bash
node archive/logo-exploration-2026-04/build_brandbook.mjs       # brand book
node archive/logo-exploration-2026-04/build_triad.mjs           # triad comparison
node archive/logo-exploration-2026-04/build_j_tens.mjs          # perfect-10 page
node archive/logo-exploration-2026-04/build_alts_ghi.mjs        # 9-way scored grid
```

Scripts read `src/assets/icons/teamLogos.js` and write HTML into `public/mockups/`. They are safe to re-run.
