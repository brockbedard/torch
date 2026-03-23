# V07 — Visual Asset Audit: TORCH Icon & Art Library Recommendations

**Date:** 2026-03-22
**Goal:** Replace all generic/placeholder visuals with a cohesive, custom-feeling visual identity across badges, team logos, play diagrams, ratings, card art, UI icons, and card backs.

---

## Current State Assessment

### What Exists Today
- **12 badge icons** in `src/data/badges.js` — hand-drawn inline SVGs at 16x16 viewBox. Functional but thin, inconsistent stroke weights, and lack personality. They work at 16px but feel generic at larger sizes.
- **3 card back types** (offense/torch/defense) in `src/ui/components/cards.js` — bolt, flame, and shield SVGs embedded inline. These are decent but use Font Awesome-style paths.
- **Play diagrams** in `src/data/playDiagrams.js` — programmatic SVG dot-and-line formation diagrams (circles + lines/polylines). Clean and functional; these are actually good and custom-built.
- **Player cards** use a single monochrome helmet SVG path for all players. No team differentiation.
- **Risk indicators** use Unicode characters: `\u26A1 HIGH`, `\u25C6 MED`, `\u25CF LOW`.
- **Draft progress** uses Unicode bullets: `\u25CF` (filled) and `\u25CB` (empty).
- **Possession arrows** use Unicode triangles: `\u25B6` and `\u25C0`.
- **No Font Awesome CDN** currently loaded — the "Font Awesome icons" mentioned in dev log v0.20.0 appear to have been replaced with inline SVGs already.
- **No external SVG files** in the project — everything is inline.

### What Needs Replacing
1. Badge icons — need more character, better scaling, cohesive set
2. Team helmet/logo — needs 4 unique designs (Sentinels, Timber Wolves, Stags, Serpents)
3. Rating indicators — currently no visual rating system (OVR number being dropped per synthesis doc)
4. Unicode characters — risk icons, progress dots, possession arrows
5. Card art differentiation — Gold/Silver/Bronze torch card tiers need distinct treatments
6. Navigation/UI icons — back arrows, settings, info buttons

---

## A. Badge Icons (12 Badges)

### TORCH Badge Inventory

| Badge | Label | Gameplay Meaning | Icon Concept |
|-------|-------|-----------------|--------------|
| FOOTBALL | Arm Talent | Deep pass combos | Football with laces |
| SPEED_LINES | Explosive | Deep pass combos | Motion lines with arrow |
| HELMET | Toughness | Power run combos | Football helmet |
| PADLOCK | Lockdown | Man coverage combos | Padlock |
| FLAME | Clutch | 3rd/4th down combos | Flame |
| BRICK | Immovable | Power run/QB sneak combos | Brick wall |
| BOLT | Quick Twitch | Screen combos | Lightning bolt |
| CLEAT | Pure Speed | Screen/zone read combos | Football cleat |
| GLOVE | Sure Hands | Short pass combos | Catching glove |
| CROSSHAIR | Precision | Quick pass combos | Crosshair/reticle |
| EYE | Vision | Robber/Cover 6 combos | Eye |
| CLIPBOARD | Football IQ | Play-action/option combos | Clipboard |

### Library Evaluation for Badges

#### 1. Game-icons.net (TOP RECOMMENDATION)
- **URL:** https://game-icons.net
- **License:** CC BY 3.0 (attribution required — "Icons by game-icons.net")
- **Icon count:** 4,170+ icons
- **Why it fits TORCH:** Purpose-built for games. Icons have a distinctive hand-drawn-meets-geometric style with thick strokes and high contrast. They look like they belong in a card game, not a corporate dashboard. Every icon fills its square frame boldly — they read clearly at both 16px and 48px.
- **Style:** White-on-transparent silhouettes, single-path SVGs, consistent visual weight
- **Specific icon matches:**
  - FOOTBALL: `american-football-ball` or `american-football-helmet`
  - SPEED_LINES: `running-ninja` or `wind-slap` or `sprint`
  - HELMET: `american-football-helmet` (dedicated football helmet icon)
  - PADLOCK: `padlock` (by Lorc)
  - FLAME: `flame` or `fire-silhouette` or `burning-passion`
  - BRICK: `brick-wall` (exact match)
  - BOLT: `lightning-bolt` or `electric`
  - CLEAT: `boot-stomp` or `wing-cleat` (boot/shoe category has 50+ icons)
  - GLOVE: `gloves` or `catch` (multiple glove variants)
  - CROSSHAIR: `crosshair` (by Delapouite, exact match)
  - EYE: `semi-closed-eye` or `eye-target`
  - CLIPBOARD: `scroll-unfurled` or `bookmarklet` (strategy/planning variants)
- **How to import:** Download SVGs from GitHub repo (`github.com/game-icons/icons`), copy path data into inline SVG functions. No npm package needed for vanilla JS (React wrapper exists: `react-game-icons`).
- **Verdict:** Best fit for TORCH. The "game artifact" aesthetic matches a card game perfectly. These icons have soul — they don't look like UI framework defaults.

#### 2. Phosphor Icons
- **URL:** https://phosphoricons.com
- **License:** MIT
- **Icon count:** 1,300+ icons in 6 weights (thin, light, regular, bold, fill, duotone)
- **Why it fits:** Clean, modern, consistent. The "bold" and "fill" weights work well at small sizes. The duotone variant adds visual interest.
- **Specific matches:** `fire`, `lock-simple`, `shield`, `lightning`, `eye`, `clipboard`, `crosshair`, `target`. Missing: football-specific icons (no helmet, cleat, football).
- **How to import:** `npm i @phosphor-icons/web` or CDN via unpkg. For vanilla JS: `<script src="https://unpkg.com/@phosphor-icons/web"></script>` then `<i class="ph-bold ph-fire"></i>`.
- **Limitation:** Too "UI framework" for a game. Clean and professional but lacks personality. No football-specific icons — would need to mix with another library for FOOTBALL, HELMET, CLEAT.
- **Verdict:** Good fallback for UI chrome (navigation, settings) but not distinctive enough for badge icons.

#### 3. Tabler Icons
- **URL:** https://tabler.io/icons
- **License:** MIT
- **Icon count:** 6,050+ icons
- **Why it fits:** Huge library, consistent 24x24 grid with 2px stroke. Has both `ball-american-football` and `play-football` icons.
- **Specific matches:** `flame`, `lock`, `shield`, `bolt`, `eye`, `clipboard`, `target`, `ball-american-football`, `shoe`. Good coverage but icons feel like a UI toolkit.
- **How to import:** `npm i @tabler/icons` or CDN via cdnjs. SVG sprite or inline SVG copy-paste.
- **Limitation:** Consistent but sterile. The 2px uniform stroke makes everything feel like a settings menu, not a card game. Would need significant customization to feel "game-like."
- **Verdict:** Best as a supplement for UI icons (navigation, settings gear, info circle). Not suitable for badge hero elements.

#### 4. Lucide
- **URL:** https://lucide.dev
- **License:** ISC (permissive, similar to MIT)
- **Icon count:** 1,500+ icons
- **Why it fits:** Fork of Feather Icons with more icons. Clean, minimal stroke-based design.
- **Specific matches:** `flame`, `lock`, `shield`, `zap`, `eye`, `clipboard`, `crosshair`, `football` (lab icon). Limited sports coverage.
- **Limitation:** Very similar aesthetic to Phosphor/Tabler — clean UI icons, not game icons. The football icon is in their "lab" (experimental) section.
- **Verdict:** Not recommended for TORCH. Too generic for a game identity.

#### 5. Heroicons
- **URL:** https://heroicons.com
- **License:** MIT
- **Icon count:** ~450 icons in 4 styles (outline, solid, mini, micro)
- **Specific matches:** `fire`, `lock-closed`, `shield-check`, `bolt`, `eye`. No sports icons at all.
- **Limitation:** Built for Tailwind UI. Very polished but extremely generic. Smallest library of the bunch.
- **Verdict:** Not recommended. Too few icons, no sports coverage.

#### 6. Remix Icons
- **URL:** https://remixicon.com
- **License:** Apache 2.0
- **Icon count:** 2,860+ icons
- **Specific matches:** `fire-fill`, `lock-fill`, `shield-fill`, `flashlight-fill`, `eye-fill`, `clipboard-fill`, `crosshair-2-fill`. Decent coverage but no sports-specific icons.
- **Limitation:** Neutral system icon style. Would blend into any app — which is the opposite of what TORCH needs.
- **Verdict:** Acceptable for UI elements but not for badges.

### Badge Icon Recommendation

**Primary: game-icons.net** for all 12 badge icons. The CC BY 3.0 license is fine — add a credits line in the about/settings screen. The aesthetic is perfect: bold, game-native, distinctive silhouettes that work at 16px on a player card and 48px as a badge hero element.

**Implementation approach:**
1. Browse game-icons.net for each of the 12 badges
2. Download the SVG path data from the GitHub repo
3. Replace the current `badgeSvg()` switch statement with new path data
4. Keep the same 16x16 viewBox wrapper but use the game-icons paths (they use 512x512 viewBox — scale with `transform`)
5. Color with the existing `fill` and `stroke` parameters

---

## B. Team Logos & Helmet Designs (4 Teams)

### Team Visual Requirements

| Team | Mascot | Colors | Motif |
|------|--------|--------|-------|
| Ridgemont Sentinels | Shield/Guardian | Crimson `#8B0000` / Gold `#C4A265` | Shield, watchtower, eagle |
| Northern Pines Timber Wolves | Wolf | Forest Green `#1B3A2D` / Silver `#D4D4D4` | Wolf head, pine trees, claw marks |
| Crestview Stags | Stag/Deer | Burnt Orange `#F28C28` / Charcoal `#1C1C1C` | Stag head with antlers, crown |
| Blackwater State Serpents | Snake/Cobra | Deep Purple `#2E0854` / Venom Green `#39FF14` | Coiled cobra, fangs, venom drops |

### Approach Comparison

#### Approach 1: Hand-Drawn SVG Paths (RECOMMENDED)
**How:** Create 4 custom SVG logos as inline path data. Each logo is a single `<path>` or small group of paths, designed at 64x64 or 128x128 viewBox, colorable via `fill` attribute.

**Pros:**
- Completely unique to TORCH — no other game has these exact logos
- Zero dependencies, zero licensing concerns
- Can be optimized for both small (team card 24px) and large (coin toss 96px) sizes
- Consistent visual language when designed together
- Can use AI SVG generators (svgai.org) or design tools for initial drafts, then hand-optimize

**Cons:**
- Requires design skill or iteration with AI tools
- Most time-intensive approach
- Risk of amateur look if not executed well

**Execution plan:**
- Sentinels: Geometric shield shape with interior crest lines. Think Spartan shield, not medieval.
- Timber Wolves: Howling wolf head silhouette, angular/geometric. Ears and snout as sharp triangles.
- Stags: Forward-facing stag head with branching antlers. Symmetrical, crown-like.
- Serpents: Coiled cobra in strike position. S-curve body with flared hood.

#### Approach 2: Game-icons.net Compositions
**How:** Select 1-2 game-icons.net icons per team and compose them. E.g., Sentinels = `roman-shield` + `watchtower`, Wolves = `wolf-head` + `pine-tree`.

**Pros:**
- Fast — icons already exist
- Consistent visual quality
- Free (CC BY 3.0)

**Cons:**
- Other games may use the same icons
- Compositions of existing icons can look assembled rather than designed
- CC BY 3.0 attribution required

**Specific game-icons.net matches:**
- Sentinels: `roman-shield`, `spartan-helmet`, `watchtower`
- Timber Wolves: `wolf-head`, `pine-tree`, `claw-slashes`
- Stags: `deer`, `antlers`, `crown`
- Serpents: `cobra`, `snake-bite`, `poison-bottle`

#### Approach 3: Geometric Logo Generator + Manual Refinement
**How:** Use tools like Haikei (haikei.app) or SVG AI generators to create geometric animal silhouettes, then manually clean up the SVG paths.

**Pros:**
- Faster than pure hand-drawing
- Can produce modern, clean geometric logos
- Unique output each time

**Cons:**
- Output quality varies — may need significant manual cleanup
- Geometric style may not match TORCH's aggressive sports aesthetic
- Still requires SVG path knowledge to refine

### Helmet Design

The current codebase uses a single complex helmet SVG path in `buildMaddenPlayer()` (lines 182-184 of cards.js). This same helmet is used for every player on every team.

**Recommended approach:**
1. Keep the base helmet silhouette shape (it's well-proportioned)
2. Create a separate `teamHelmetSvg(teamId)` function
3. Each team gets:
   - **Base helmet fill:** Team primary color
   - **Stripe:** Team secondary color stripe down the center
   - **Logo decal:** Small team logo SVG on the side (scaled to fit within helmet bounds)
   - **Facemask color:** Team secondary or accent color
4. The facemask area (currently `rect` at x=12, y=6) becomes team-colored

**Helmet stripe patterns:**
- Sentinels: Single gold center stripe on crimson helmet
- Timber Wolves: Double silver racing stripes on forest green helmet
- Stags: Burnt orange helmet with charcoal back half (split design)
- Serpents: Purple helmet with venom green stripe and fang marks

### Team Logo Recommendation

**Use Approach 1 (hand-drawn SVG paths) for the final product, but start with Approach 2 (game-icons.net) as placeholder/reference.** The game-icons wolf-head, cobra, deer, and shield icons give you working visuals immediately while custom logos are iterated. The placeholders establish layout and sizing before investing in final art.

---

## C. Play Card Visuals

### Current State
The play diagram system in `playDiagrams.js` is already custom-built and effective. It uses:
- Coordinate arrays for player positions (circles)
- Solid lines for primary routes
- Dashed lines for secondary routes/blocking
- QB (first dot) rendered larger (r=3.5 vs r=2.5)
- Single color per diagram (green for offense, blue for defense)

**Assessment: This is one of TORCH's best visual assets.** The diagrammatic style is clean, readable at small sizes, and genuinely looks like a coaching whiteboard. Do not replace this system.

### Recommended Enhancements (Not Replacements)

1. **Add route arrow tips:** Currently lines just end. Add small arrowhead markers to route endpoints to show direction.
   ```
   <marker id="arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
     <path d="M0,0 L6,3 L0,6 Z" fill="${color}"/>
   </marker>
   ```

2. **Add a scrimmage line:** A horizontal dashed line at y=46 (offense) or the relevant snap point for defense to visually anchor the formation.

3. **Play category icons:** Small 12x12 icons in the play card corner to indicate category:
   - SHORT PASS: horizontal arrow
   - DEEP PASS: vertical arrow with arrowhead
   - RUN: running figure
   - SCREEN: curved arrow
   - BLITZ: lightning bolt
   - ZONE: semicircle/umbrella shape
   - MAN: padlock
   - SPY: eye

   These can come from Tabler Icons (MIT) or be simple custom SVG paths.

4. **Replace Unicode risk indicators** (`\u26A1`, `\u25C6`, `\u25CF`) with custom SVG icons:
   - HIGH: small flame or double chevron up
   - MED: single diamond (SVG path, not Unicode)
   - LOW: small shield or single dot (SVG circle)

### Play Diagram Libraries (For Reference Only)

These coaching tools were evaluated but are NOT recommended for use in TORCH:
- **Football Play Card** (footballplaycard.com) — commercial SaaS, not embeddable
- **FirstDown PlayBook** — 35,000+ pre-drawn plays, commercial
- **PlayArt Pro** — free designer but browser-based tool, not a library
- **Pro Quick Draw** — coaching platform, not an asset library

TORCH's homegrown diagram system is better than any of these for the card game use case because it's already optimized for small card sizes and renders as pure SVG.

---

## D. Player Quality / Rating Indicators

### Requirements
- Replace Unicode stars and OVR numbers (per synthesis doc recommendation)
- Communicate a 3-tier system: Star (80-84), Starter (76-78), Reserve (72-74)
- Work at small sizes inside player cards (roughly 60-80px wide cards on 375px screen)
- Fit TORCH's fire/football identity

### Option 1: Torch Flame Pips (RECOMMENDED)

Use small flame SVG icons as rating pips. Three flames for Star, two for Starter, one for Reserve.

```
Star:    [flame] [flame] [flame]  — gold (#FFB800) flames
Starter: [flame] [flame] [dim]   — team-color flames
Reserve: [flame] [dim]  [dim]   — muted single flame
```

**Implementation:**
```javascript
function ratingFlames(tier, color) {
  const flame = 'M8 1C8 1 3 6 3 9C3 12 5 14 7 15C6 13 7 10 8 7C9 10 10 13 9 15C11 14 13 12 13 9C13 6 8 1 8 1Z';
  const count = tier === 'star' ? 3 : tier === 'starter' ? 2 : 1;
  let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (count * 14) + ' 16" width="' + (count * 10) + '" height="12">';
  for (let i = 0; i < 3; i++) {
    const active = i < count;
    svg += '<path d="' + flame + '" transform="translate(' + (i * 14) + ',0)" fill="' + (active ? color : '#333') + '" opacity="' + (active ? '1' : '0.2') + '"/>';
  }
  return svg + '</svg>';
}
```

**Why it fits:** Fire IS the TORCH brand. Flame pips are immediately recognizable, scale well, and communicate quality without numbers. Gold flames for stars echo the existing gold border treatment.

### Option 2: Tier Bars / Signal Strength

Use vertical bars like a signal strength indicator:

```
Star:    [|||]  — 3 bars, gold
Starter: [||.]  — 2 bars, team color
Reserve: [|..]  — 1 bar, muted
```

**Pros:** Very compact, works at tiny sizes (even 8px wide). Familiar signal-strength metaphor.
**Cons:** Less thematic. Doesn't tie into fire/football identity.

### Option 3: Shield Fill

Use a shield shape that fills up based on tier:

```
Star:    [full shield]     — gold fill, glow
Starter: [2/3 shield]     — team color fill
Reserve: [1/3 shield]     — outline only, muted
```

**Pros:** Football-adjacent (shield = defense, protection). More visual interest than bars.
**Cons:** Complex SVG for partial fills. May not read well at very small sizes.

### Option 4: Chevron Stack

Military-style chevron ranks:

```
Star:    >>>  — 3 chevrons, gold
Starter: >>   — 2 chevrons, team color
Reserve: >    — 1 chevron, muted
```

**Pros:** Compact, hierarchical, has a "rank" feel appropriate for team sports.
**Cons:** Less unique — many games use chevrons.

### Option 5: Ember Intensity

Single flame icon with varying visual intensity:

```
Star:    [large flame + glow + particles]
Starter: [medium flame, no glow]
Reserve: [small dim ember]
```

**Pros:** Most thematic — literally "how hot is this player." One shape, three treatments.
**Cons:** Subtlety might not communicate clearly at small sizes.

### Rating Recommendation

**Use Option 1 (Torch Flame Pips)** as the primary indicator, with Option 5 (Ember Intensity) as the badge hero element on larger card views. The flame pip is compact enough for the player card list (3 tiny flames = ~30px wide) and strongly branded to TORCH.

For star players specifically, add an outer glow/pulse animation to the flame pips to create the "On Fire" Heat Check visual without additional UI elements.

---

## E. Torch Card Art & Tier Treatments

### Current State
- `buildTorchCard()` uses a single flame SVG path (`FLAME_PATH`) for all tiers
- Tier differentiation is border color only: Gold `#FFB800`, Silver `#B0C4D4`, Bronze `#A0522D`
- The flame is the same size and style for all tiers

### Recommended Tier Differentiation

#### Gold Tier
- **Border:** 3px gold with outer glow (`box-shadow: 0 0 12px rgba(255,184,0,0.4)`)
- **Flame art:** Larger flame, dual-tone gradient (orange core to yellow tips), subtle animation (sway)
- **Background:** Radial gradient from warm amber center to deep black
- **Premium treatment:** Holographic shimmer overlay (CSS, see below)
- **Card back:** Gold foil pattern border

#### Silver Tier
- **Border:** 2px silver/steel blue
- **Flame art:** Medium flame, cooler orange gradient
- **Background:** Subtle steel-blue tinted black
- **Premium treatment:** Simple diagonal shimmer (already exists in card system)
- **Card back:** Silver metallic border

#### Bronze Tier
- **Border:** 2px copper/brown
- **Flame art:** Smaller flame, warm brown-to-orange gradient
- **Background:** Dark warm brown
- **Premium treatment:** None (static)
- **Card back:** Weathered copper border

### CSS Premium Card Treatments

#### Holographic Shimmer (Gold Cards)
Based on [simeydotme/pokemon-cards-css](https://github.com/simeydotme/pokemon-cards-css):

```css
.torch-card-gold::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 20%,
    rgba(255, 219, 112, 0.15) 36%,
    rgba(255, 255, 255, 0.1) 42%,
    rgba(255, 184, 0, 0.12) 48%,
    transparent 60%
  );
  mix-blend-mode: color-dodge;
  animation: holoShimmer 6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes holoShimmer {
  0%, 100% { transform: translateX(-100%) rotate(15deg); opacity: 0; }
  50% { transform: translateX(100%) rotate(15deg); opacity: 1; }
}
```

#### Foil Border (Gold Cards)
```css
.torch-card-gold-frame {
  background: linear-gradient(
    135deg,
    #FFB800 0%, #FFF5D4 25%, #FFB800 50%, #FFF5D4 75%, #FFB800 100%
  );
  background-size: 200% 200%;
  animation: foilShift 4s ease-in-out infinite;
}
```

### Fire/Flame SVG Art Sources

For enhanced flame art beyond the current `FLAME_PATH`:
- **game-icons.net fire tag:** 104 fire icons including `fire-silhouette`, `flame`, `burning-passion`, `fire-ring`, `fire-zone` — all CC BY 3.0
- **Custom approach:** The existing flame SVG in `buildHomeCard()` torch config is already excellent. Create tier variants by adjusting the path complexity (more detail = higher tier) and gradient stops.

---

## F. UI Icons

### Icons Needed

| Context | Current | Replacement Source |
|---------|---------|-------------------|
| Back arrow (navigation) | None/browser default | Tabler: `arrow-left` or `chevron-left` |
| Settings gear | None visible | Tabler: `settings` |
| Info button | None visible | Tabler: `info-circle` |
| Snap button | Text "SNAP" | Keep text, add small bolt icon |
| Timeout | Text | Tabler: `clock-pause` |
| Spike | Text | Tabler: `arrow-bar-down` or custom football-spike SVG |
| Kneel | Text | Tabler: `arrow-bar-down` rotated or knee-down custom |
| Risk HIGH | Unicode `\u26A1` | Custom SVG double-chevron-up or flame |
| Risk MED | Unicode `\u25C6` | Custom SVG diamond |
| Risk LOW | Unicode `\u25CF` | Custom SVG circle |
| Draft progress dots | Unicode `\u25CF`/`\u25CB` | Custom SVG filled/empty circles |
| Possession arrow | Unicode `\u25B6`/`\u25C0` | Custom SVG triangle |

### Recommendation

**Use Tabler Icons (MIT license) for all UI chrome.** The 2px stroke, 24x24 grid aesthetic is perfect for navigation and system UI — it should look clean and functional, not flashy. Reserve the game-icons.net style for gameplay elements (badges, cards).

**Implementation for vanilla JS:**
```javascript
// Copy SVG path data directly — no runtime dependency
const UI_ICONS = {
  arrowLeft: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M5 12l6 6"/><path d="M5 12l6-6"/></svg>',
  settings: '...', // Copy from tabler.io/icons
  info: '...',
};
```

No npm dependency needed. Just copy the 10-15 SVG strings you need into a `uiIcons.js` constants file.

---

## G. Card Back Designs

### Current State
Three card backs exist in `CARD_CONFIGS`: offense (green/bolt), torch (orange/flame), defense (blue/shield). They share a consistent design language:
- Radial gradient background (bgEdge to bg)
- Centered art icon
- Accent-colored nameplate at bottom
- Diagonal texture overlay
- Shimmer animation
- Gradient border

### Recommended Enhancements (Not Redesign)

The current card back system is well-designed. Enhance, don't replace:

1. **Offense card back art:** Replace the bolt SVG with a more football-specific icon. Options:
   - Play diagram silhouette (small formation dots)
   - Football with motion lines
   - Stylized "O" in Teko font

2. **Defense card back art:** Replace the shield SVG with:
   - Crossed defensive stance silhouette
   - Brick wall / fortress icon
   - Stylized "D" in Teko font

3. **Torch card back art:** The flame is perfect. Keep it. Consider adding tier-specific backgrounds:
   - Gold torch backs: warm amber radial, gold shimmer
   - Silver torch backs: cooler blue-orange, silver shimmer
   - Bronze torch backs: muted brown-orange, no shimmer

4. **Cohesion technique:** All three card backs should share:
   - Same border-radius and proportions
   - Same nameplate height ratio
   - Same texture overlay pattern
   - Different animation timing (offense fastest shimmer, defense slowest, torch in between)

5. **Pattern ideas from card game research:**
   - **Geometric repeat pattern** in the background (subtle, behind the main icon) — diagonal hash marks, hexagon grid, or TORCH-branded pattern
   - **Corner ornaments** — small flame or dot motifs in each corner
   - **Watermark** — very faint TORCH wordmark behind the main icon

---

## Library Summary Matrix

| Library | Icons | License | Sports Icons | Game Feel | Badge Use | UI Use | Import |
|---------|-------|---------|-------------|-----------|-----------|--------|--------|
| **game-icons.net** | 4,170+ | CC BY 3.0 | Excellent (football helmet, football, cleat, etc.) | Excellent | **Best** | Overkill | Raw SVG from GitHub |
| **Tabler Icons** | 6,050+ | MIT | Good (american-football, play-football) | Neutral | OK | **Best** | npm or CDN or copy SVG |
| **Phosphor Icons** | 1,300+ | MIT | Limited (no football) | Neutral | OK | Good | npm or CDN |
| **Lucide** | 1,500+ | ISC | Minimal (lab football) | Neutral | Poor | Good | npm or CDN |
| **Heroicons** | 450 | MIT | None | Neutral | Poor | OK | npm or CDN |
| **Remix Icons** | 2,860+ | Apache 2.0 | None | Neutral | OK | Good | npm or CDN |
| **Kenney.nl** | 250+ board game | CC0 | Sports Pack (380 assets) | Good | OK | OK | Download |
| **SVG Repo** | Massive | Varies | Good | Varies | OK | OK | Copy SVG |
| **Noun Project** | Millions | CC BY or $3.33/mo | Excellent | Varies | OK | OK | Download or API |
| **Flaticon** | Millions | Free w/ attribution or paid | Excellent | Varies | OK | OK | Download |

---

## Prioritized Recommendations

### For Badges: game-icons.net
The single best source for TORCH badge icons. Download the 12 specific SVG paths, embed them in `badgeSvg()`. The bold silhouette style IS the TORCH visual identity for gameplay elements. Credit in an about/credits screen.

### For Team Logos: Hand-drawn SVG paths
Start with game-icons.net icons as development placeholders (wolf-head, cobra, deer, roman-shield). Commission or iterate custom SVG logos for v1.0. Each logo should be a single `<path>` element, monochrome, that can be filled with the team's primary color.

### For Helmets: Extend the existing helmet SVG
Keep the current helmet shell shape. Add a `teamHelmetSvg(teamId)` function that applies team-specific colors (fill, stripe, facemask) and overlays the team logo as a small decal. This is 2-3 hours of work, not a new asset.

### For Play Diagrams: Keep the current system
Add arrowhead markers to route endpoints. Add a scrimmage line. Replace Unicode risk indicators with tiny custom SVG shapes. The diagram system is already one of TORCH's best custom assets.

### For Ratings: Torch Flame Pips
Three small flame SVGs: filled = active tier, dimmed = inactive. Gold for stars, team color for starters, muted for reserves. Simple, on-brand, compact.

### For Card Art: CSS treatments + game-icons.net flames
Gold/Silver/Bronze differentiation via CSS (shimmer intensity, glow, border treatment). Use game-icons.net fire variants for tier-specific flame art on torch cards. Reference simeydotme/pokemon-cards-css for holographic techniques.

### For UI Icons: Tabler Icons (copy SVG strings)
Copy 10-15 SVG path strings from Tabler into a `uiIcons.js` file. No runtime dependency. MIT license, no attribution needed. Clean, functional, stays out of the way of the game art.

### For Card Backs: Enhance, don't replace
The current system is good. Add geometric background patterns, corner ornaments, and tier-specific treatments for torch card backs. Replace the offense bolt and defense shield art with more football-specific variants from game-icons.net.

---

## Implementation Priority

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 1 | Replace 12 badge icons with game-icons.net paths | 2-3 hours | High — badges are the hero element on player cards |
| 2 | Add torch flame pip rating indicators | 1-2 hours | High — replaces OVR numbers per design spec |
| 3 | Create 4 team helmet color variants | 2-3 hours | High — team differentiation on player cards |
| 4 | Replace Unicode risk/progress/arrow chars | 1 hour | Medium — polish, eliminates platform-dependent rendering |
| 5 | Add play diagram arrowheads + scrimmage line | 1 hour | Medium — makes diagrams more readable |
| 6 | Copy Tabler Icons SVGs for UI chrome | 1 hour | Low — navigation is functional as-is |
| 7 | Create team logo SVG placeholders from game-icons | 1-2 hours | Medium — needed for team select and coin toss |
| 8 | Add Gold/Silver/Bronze CSS card treatments | 2-3 hours | Medium — torch card visual differentiation |
| 9 | Enhance card back art and patterns | 2-3 hours | Low — current card backs work fine |
| 10 | Commission/create final custom team logos | 4-8 hours | High — but can ship without |

**Total estimated effort: 17-28 hours**

---

## Attribution Requirements

| Asset | License | Attribution Needed |
|-------|---------|-------------------|
| game-icons.net icons | CC BY 3.0 | Yes — "Icons by [author]. Available on https://game-icons.net" |
| Tabler Icons | MIT | No (MIT is permissive) |
| Phosphor Icons | MIT | No |
| Pokemon Cards CSS techniques | MIT | No (techniques, not assets) |
| Custom SVG paths | Original work | No |

Add a "Credits" section to the settings or about screen:
```
Game icons by Lorc, Delapouite, and contributors
Available at https://game-icons.net
Licensed under CC BY 3.0
```
