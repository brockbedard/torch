# Session Handoff — Card Integration (2026-03-22)

## What We Did

### The Goal
Integrate the finalized card designs from the mockup page (`?mockup`) into all game screens. The mockup had been iterated on across 20+ versions to nail the exact visual style for player cards, play cards, torch cards, and card backs. The game screens were still using older, inconsistent card rendering.

### Phase 0: Extract Shared Card Components
Created `src/ui/components/cards.js` — a single shared module containing all card builder functions extracted from `cardMockup.js`:

- **`buildHomeCard(type, w, h)`** — Card backs with vivid colored backgrounds (#96CC50 offense, #E88050 torch, #6AAAEE defense), gradient borders, diagonal texture, spotlight, shimmer, nameplate. Torch gets gold double frame + ember sparks.
- **`buildMaddenPlayer(p, w, h)`** — Player cards with centered OVR rating, flanking jersey # and position, football helmet art with tier-colored glow, bottom gradient, team-colored name bar.
- **`buildPlayV1(p, w, h)`** — Play cards with category color stripe at top, name bar, diagram center area, category + risk indicator bottom bar. Unified colors: offense = #7ACC00 green, defense = #4DA6FF blue.
- **`buildTorchCard(tc, w, h)`** — Torch cards with centered flame SVG, tier-colored border (gold/silver/bronze), tier label, card name, effect text, bottom accent bar.

All builders use unique SVG gradient IDs (`_uid` counter) to prevent collisions when multiple cards render on the same page.

### Home Page Update
Replaced the inline card fan construction (150+ lines of manual DOM building) with calls to `buildHomeCard()`. The fan positioning, deal animation, and torch premium effects (breathing glow, light cast on adjacent cards, ember sparks) are applied on top of the shared builder output. Key visual fix: card backgrounds now use vivid colors + bgEdge gradients instead of fading to near-black.

### Gameplay Integration (Hardest Part)
The gameplay screen was the most complex because it used HTML strings (`innerHTML`) for card rendering within `.T-card` CSS-class wrappers. This caused a layered styling conflict — the wrapper applied its own background/border/shadow that overrode the mockup styling.

**Solution:**
1. Stripped `.T-card` CSS down to just flex sizing + drag behavior (no visual styling)
2. Changed tray rendering to call the actual shared builders (`buildMaddenPlayer`, `buildPlayV1`, `buildTorchCard`) and append the returned DOM elements as children of `.T-card` wrappers
3. Changed placed cards on the field strip from inline HTML to DOM-based appending (create placeholder divs in the HTML string, then `querySelector` + `appendChild` after `strip.innerHTML = h`)
4. Added `!important` to `.T-card-sel` border/shadow to override inline styles on selected cards

### Other Screens
- **draft.js** — `buildPlayerCard()` now calls `buildMaddenPlayer()` with `width:100%/height:100%` override
- **coinToss.js** — Torch card options use `buildTorchCard()` instead of manual divs
- **halftime.js** — Shop cards use `buildTorchCard()` with cost overlay appended
- **cardMockup.js** — Imports from shared module instead of defining local copies

## Why It Matters
Before this work, card visuals were defined in 6+ places with copy-pasted code that drifted. A change to the mockup design wouldn't propagate to the game. Now there's one source of truth (`cards.js`), and every screen imports from it. If a card doesn't match the mockup, it's a bug in the calling code, not a design inconsistency.

## Key Decisions
1. **DOM builders, not HTML strings** — The shared builders return DOM elements, not HTML strings. This prevents XSS-style injection issues and makes the code composable.
2. **Wrapper pattern for gameplay** — `.T-card` provides flex sizing and drag/selection behavior. The shared builder provides the visual card. They're separate concerns.
3. **Adapter pattern for data** — Game data (players, plays) doesn't match the mockup's expected data shape. Gameplay creates adapter objects to bridge the gap (e.g., deriving `tier` from `ovr`, `catColor` from play type).

## Rollback Tags
- `card-integration-v3` — Final state (current)
- `card-integration-v2` — After gameplay CSS fix but before shared builder refactor
- `card-integration-v1` — First attempt (had inline HTML duplication issues)
- `pre-expert-fixes` — Before any integration work began

## What's Left (Not Done)
- Card deal animations on draft/gameplay screens (slide-in from deck)
- Face-down card backs during dealing
- Snap flip animation when playing a card
- Torch card activation burst effect
- Card back type associations (offense backs → offense content, defense backs → defense content)
- Version bump + production deploy
