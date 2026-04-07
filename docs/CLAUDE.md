# Design System: TORCH Football

## 1. Visual Theme & Atmosphere

TORCH is a mobile-first college football card game ("Balatro meets college football") rendered on a near-black canvas (`#05040a`) where every game element exists as emitted light. The design philosophy is **"stadium at night"** — a dark field surface where neon trails, glowing cards, and luminous text feel like LED scoreboards, stadium lights, and broadcast graphics floating in darkness. Nothing is painted on a surface; everything *glows from within*.

The overall density is **focused and vertical** — a 375px-wide single-column mobile layout where the player's attention flows from HUD (top) → field canvas (middle) → result text → card hand (bottom). The field is compact during gameplay (~200px, roughly one-third of the viewport) and expands to a 4:5 share card (420px) at drive's end. The cards are the primary interaction surface — they should feel like holding physical trading cards, not tapping buttons.

The typography is built on two families: **Bebas Neue** for display/impact text (yardage results, drive titles, section headers) and the **system sans-serif stack** (`-apple-system, BlinkMacSystemFont, sans-serif`) for all UI text (HUD, card content, labels, commentary). Bebas Neue is used exclusively at large sizes (30px+) with wide letter-spacing (2-4px) for that ESPN broadcast scorebug energy. System sans is used at 7-17px for everything else — crisp, readable, no-nonsense.

The color system is built around **four distinct team palettes** that take over the entire UI when a team is selected. Each team has a primary neon accent, a darker secondary, and derived trail/glow colors. The active team's primary color permeates: card borders, field goal lines, trail cores, HUD labels, timeline pips, and the share card branding. A universal palette of result-state colors (gold for touchdowns, red for turnovers, coverage-specific colors) overlays the team palette during gameplay.

**Key Characteristics:**
- Near-black canvas: `#05040a` (app background), `#050408` (field surface), `#080c10` (elevated field interior)
- Dark-mode-native: data emits light rather than sitting on surfaces
- Team-colored neon as the singular accent system — swapped per team, never mixed
- Bebas Neue for impact text only (results, titles) — never for body or labels
- System sans-serif at 7-17px for all functional UI text
- Canvas 2D rendering for field and trail visualization with `globalCompositeOperation: 'lighter'` (additive blending)
- 4-layer trail rendering: bloom → glow → core → hot center
- Organic noise (±1-2px jitter) on all trail paths for painterly texture
- Five-phase snap pacing: Snap → Trail → Impact → Context → Ready (~2.5-3.5s per play)
- Intensity-scaled visual feedback: font size, shake, field flash, impact rings all scale with play magnitude

## 2. Color Palette & Roles

### Canvas & Surfaces
- **App Background** (`#05040a`): The deepest black — the app shell color. Near-pure black with a cool-violet undertone.
- **Field Surface** (`#050408`): The field canvas background. Imperceptibly different from app bg.
- **Field Interior** (`#080c10`): The playing surface inside field boundaries. One step up — barely visible blue-cool tint.
- **Elevated Surface** (`#0c1e2e`): Card backgrounds when team is Spectres. Each team shifts this contextually.
- **Card Surface** (`rgba(teamR, teamG, teamB, 0.025)`): Cards use the team's primary color at near-zero opacity.

### Team Palettes

#### Ridgemont Boars — Power Spread
- **Primary** (`#8B0000`): Deep crimson. Commanding, heavy, ground-game energy.
- **Secondary / Accent** (`#C4A265`): Antique gold. Stripe color, secondary highlights.
- **Trail Neon**: `rgb(180, 50, 50)` for neutral plays, brighter on exploits.
- **Card Border**: `rgba(139, 0, 0, 0.3)` resting, `rgba(139, 0, 0, 0.5)` on hot cards.
- **Personality**: Heavy, physical, old-school. Dark maroon surfaces with gold accents.

#### Coral Bay Dolphins — Spread Option
- **Primary** (`#E8548F`): Hot pink. Fast, electric, explosive.
- **Secondary / Accent** (`#FF7EB3`): Light coral pink. Glow and hover states.
- **Trail Neon**: `rgb(232, 84, 143)` for neutral, brighter pink on exploits.
- **Card Border**: `rgba(232, 84, 143, 0.25)` resting, `rgba(255, 126, 179, 0.45)` on hot.
- **Personality**: Speed, flash, excitement. The fun team. Pink neon on black.

#### Hollowridge Spectres — Air Raid
- **Primary** (`#5DADE2`): Ice blue. Precise, surgical, cerebral.
- **Secondary** (`#1B4F72`): Deep navy. Card backgrounds, depth.
- **Accent** (`#85C1E9`): Light ice. Hover states, brighter trail endpoints.
- **Trail Neon**: `rgb(93, 173, 226)` for neutral, `rgb(140, 225, 255)` for exploits.
- **Card Border**: `rgba(93, 173, 226, 0.18)` resting, `rgba(93, 173, 226, 0.4)` on hot.
- **Personality**: Cold, calculated, aerial. The default/demo team. Blue neon on black.

#### Blackwater Serpents — Multiple/Pro
- **Primary** (`#2E0854`): Deep purple. Mysterious, versatile, dangerous.
- **Secondary / Accent** (`#39FF14`): Neon green. Electric, venomous. The most dramatic contrast.
- **Trail Neon**: `rgb(57, 255, 20)` for neutral — the green glows intensely on dark canvas.
- **Card Border**: `rgba(57, 255, 20, 0.2)` resting, `rgba(57, 255, 20, 0.4)` on hot.
- **Personality**: Unpredictable, balanced. Purple/green is the most visually distinctive palette.

### Result State Colors (universal, override team colors)
- **Exploit** — brighter variant of team neon, with white-hot center at 35-40% opacity
- **Covered / Stuffed** — desaturated dark blue-gray: `rgb(55, 65, 85)`. Dim, recessive.
- **Turnover** (`#ff2424`): Vivid red. X-mark at trail endpoint, red field flash, red scar glow.
- **Touchdown** (`#EBB010`): Warm gold. End zone bloom, gold impact rings, 72px gold text.
- **Sacked** — same as Covered visually, but with dark field flash overlay.
- **Incomplete** — same as Covered. No trail rendered (ball wasn't caught).
- **First Down** — highlighted in team primary color at higher opacity in description text.

### Coverage Colors (defense identity)
- **Cover 4** (`#44ff88`): Green — safe, zone-heavy
- **Cover 3** (`#44aaff`): Blue — balanced zone
- **Cover 2** (`#ffd700`): Gold — vulnerable underneath
- **Man Free** (`#cc44ff`): Purple — physical, tight
- **Cover 1** (`#ff7700`): Orange — aggressive
- **Cover 6** (`#ff66aa`): Pink — split coverage
- **Cover 0** (`#ff2424`): Red — all-out blitz, maximum risk

### Text
- **Primary Text** (`rgba(255, 250, 235, 0.8)`): Warm near-white. HUD down-and-distance, main labels.
- **Secondary Text** (`rgba(255, 250, 235, 0.28)`): Description text, commentary, flavor text.
- **Muted Text** (`rgba(255, 250, 235, 0.18)`): Card flavor text, de-emphasized labels.
- **Team Label** — team primary color at 40% opacity, Bebas Neue, letter-spacing 4-5px.
- **Coverage Label** — coverage-specific color at 65% opacity.

### Borders
- **Card Border Default**: team primary at 18% opacity, 1.5px solid
- **Card Border Hot**: team primary at 40% opacity + outer glow `box-shadow: 0 0 12px rgba(team, 0.12)`
- **Field Border**: team primary at 4% opacity, used on field boundary stroke
- **Divider**: `rgba(255, 250, 235, 0.02)` — nearly invisible horizontal rules

## 3. Typography Rules

### Font Families
- **Display / Impact**: `Bebas Neue` — loaded from Google Fonts. Used ONLY for yardage results, drive titles (TOUCHDOWN, TURNOVER), and share card headings. Never for body text, labels, or UI.
- **UI / Body**: `-apple-system, BlinkMacSystemFont, sans-serif` — system stack. Everything else. Crisp at small sizes on mobile retina displays.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Drive Result (TD) | Bebas Neue | 72px | 900 | 1.0 | 3px | Touchdown — maximum visual impact |
| Drive Result (Big) | Bebas Neue | 60px | 900 | 1.0 | 3px | Turnovers, 15+ yard exploits |
| Drive Result (Notable) | Bebas Neue | 48px | 900 | 1.0 | 3px | 8-14 yard exploits, sacks, big first downs |
| Drive Result (Routine) | Bebas Neue | 30px | 900 | 1.0 | 3px | Standard gains, short runs, incomplete |
| Share Title | Bebas Neue | 40px | 900 | 1.0 | 2px | "TOUCHDOWN" / "TURNOVER" on share card |
| HUD Down & Distance | System sans | 17px | 800 | 1.2 | 0.5px | "1ST & 10 — OWN 20" |
| Team Name | Bebas Neue | 12px | 400 | 1.0 | 5px | "HOLLOWRIDGE SPECTRES" above HUD |
| Coverage Badge | System sans | 9px | 800 | 1.0 | 2px | "COVER 4" in pill badge |
| Card Name | System sans | 13px | 900 | 1.1 | 0.3px | Play name on card face |
| Card Category | System sans | 6.5px | 800 | 1.0 | 1.5px | "RPO" / "RUN" / "SCREEN" |
| Card Flavor | System sans | 8px | 400 | 1.3 | 0 | Italic. "Bread and butter" |
| Hand Label | System sans | 8px | 800 | 1.0 | 3px | "CALL YOUR PLAY" |
| Result Description | System sans | 11px | 400 | 1.2 | 0 | Play description after result |
| Commentary | System sans | 10px | 400 | 1.2 | 0 | Italic. "Perfect read." |
| Stats Line | System sans | 11px | 600 | 1.0 | 0 | "12 PLAYS · 80 YDS · 3 EXPLOITS" |
| Field Label | System sans | 8px | 900 | 1.0 | 0 | Yard numbers on field, autopsy annotations |
| Timeline Pip | — | 8px wide | — | — | — | Visual only — colored bars |
| Share Branding | System sans | 7px | 800 | 1.0 | 0 | "TORCH · DRIVE #247" bottom-right |

## 4. Component Styling

### Play Cards
Cards are the primary interaction surface. They should feel like trading cards — physical, collectible, tactile.

- **Size**: 76px wide × ~100px tall minimum, flex column
- **Border**: 1.5px solid, team primary at 18% opacity (default) or 40% (hot/recommended)
- **Border Radius**: 8px
- **Background**: team primary at 2.5% opacity — barely tinted, mostly dark
- **Top Bar**: 3px tall accent bar spanning full card width. Blue (`team neon`) for pass plays, amber (`#ff9933`) for run plays.
- **Shadow**: `0 2px 10px rgba(0,0,0,0.4)`
- **Hot State** (card is recommended vs current coverage): border brightens, outer glow appears (`0 0 12px rgba(team, 0.12)`), top bar opacity goes to 100%
- **Tap/Active**: `transform: scale(0.92) translateY(2px)`, `filter: brightness(1.4)`
- **Deal Animation**: Cards enter from bottom with `translateY(20px) → translateY(0)`, staggered 50ms per card, 250ms ease-out
- **Exit**: Hand container fades out with `opacity:0, translateY(8px)`, 150ms

### HUD (Head-Up Display)
- **Layout**: Flex row, space-between. Left side: team name + down/distance. Right side: coverage badge.
- **Team Name**: Bebas Neue, 12px, team primary at 40% opacity, letter-spacing 5px
- **Down/Distance**: System sans, 17px, weight 800, warm near-white at 80%
- **Coverage Badge**: System sans, 9px, weight 800, letter-spacing 2px. Pill shape: `padding: 3px 10px`, `border-radius: 4px`, `border: 1px solid rgba(team, 0.15)`. Text color = coverage-specific color at 65% opacity.
- **Dim State**: During snap animation, HUD dims to `opacity: 0.35` over 150ms
- **Bright State**: After result context, HUD returns to full opacity over 300ms with 200ms delay

### Result Display
- **Container**: Centered text block, min-height 56px, no background
- **Yardage Text**: Bebas Neue, size varies by intensity (30-72px). Spring-bounce entrance: `transform: scale(0.3) → scale(1)` with `cubic-bezier(0.34, 1.56, 0.64, 1)` over 300ms.
- **Description**: System sans, 11px, warm white at 28%. Fades in 300ms after yardage with 200ms delay.
- **First Down Description**: Same as above but team primary at 45% opacity, prefixed with "FIRST DOWN —"
- **Commentary**: System sans, 10px italic, team primary at 35%. Fades in 400ms with 400ms delay.

### Timeline Strip
- **Layout**: Flex row, 2px gap, 24px tall container, aligned to bottom
- **Pips**: 8px wide, variable height (4-16px), `border-radius: 2px 2px 0 0`
- **Pip Color**: team trail color for neutral/exploit, `#ff2424` for turnover, `#2a3040` for covered
- **Pip Height**: Scaled by yards gained — `min(16, 8 + |yards| * 0.3)` for exploits, flat 4px for covered, 12px for turnovers

### Field Canvas
See Section 9 (Drive Fingerprint) for detailed rendering specification.

- **Gameplay Size**: 375px × 200px (~1/3 viewport). Shows 40-yard zoomed window centered on ball.
- **Share Size**: 375px × 420px (4:5 ratio). Shows full 100-yard field.
- **Transition**: CSS `height` transition, 600ms ease-out. Canvas resizes and redraws.
- **Surface Color**: `#050408` outer, `#080c10` inner playing area
- **Yard Lines**: `rgba(255,255,255, 0.025)` at 0.3px width. 50-yard line at 0.06 opacity, 0.7px.
- **Goal Lines**: team primary at 12% opacity, 0.8px width
- **End Zones**: team primary at 1.5% opacity fill
- **Vignette**: Radial gradient from transparent center to `rgba(5,4,8,0.5)` at edges

## 5. Layout Principles

### Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| xs | 2-3px | Timeline pip gap, card internal micro-spacing |
| sm | 6-8px | Card body padding, pip dimensions, hand gap |
| md | 10-14px | HUD padding-bottom, result padding |
| lg | 16-18px | HUD horizontal padding, hand horizontal padding |
| xl | 20px | Card deal-in translateY distance |

### Vertical Stack (gameplay screen, top to bottom)
1. **HUD** — `padding: 12px 18px 8px`. Fixed at top.
2. **Field Canvas** — 200px tall. The visual anchor.
3. **Result Display** — 56px min-height. Appears/fades per snap.
4. **Timeline Strip** — 24px tall. Grows with each snap.
5. **Hand Label** — 8px text, `padding: 8px 18px 5px`.
6. **Card Hand** — Flex row, horizontal scroll, `padding: 0 18px 14px`.

### Mobile-First Constraints
- Fixed 375px width (iPhone SE/6/7/8 viewport)
- No horizontal scrolling except card hand overflow
- Touch targets: cards are 76px wide (well above 44px minimum)
- All interactive elements are thumb-reachable in the bottom 60% of screen
- Canvas renders at `devicePixelRatio` (capped at 2x) for retina sharpness

## 6. Depth & Elevation

### Surface Hierarchy (dark-on-dark)
Elevation on a near-black canvas is communicated through luminance stepping, not shadows. Each level slightly increases the base color's lightness.

| Level | Surface | Background | Usage |
|-------|---------|-----------|-------|
| 0 | App Shell | `#05040a` | Deepest — app background behind everything |
| 1 | Field Outer | `#050408` | Field canvas outer area |
| 2 | Field Inner | `#080c10` | Playing surface — barely lighter |
| 3 | Card Surface | `rgba(team, 0.025)` on `#05040a` | Cards float above the background |
| 4 | Hot Card | `rgba(team, 0.04)` + glow shadow | Recommended cards glow slightly |
| 5 | Result Text | Full-opacity neon text + additive bloom | Maximum foreground — text as light source |

### Shadow System
- **Card Shadow**: `0 2px 10px rgba(0,0,0,0.4)` — subtle depth, mostly invisible on dark bg
- **Hot Card Glow**: `0 0 12px rgba(team, 0.12), 0 2px 10px rgba(0,0,0,0.4)` — colored outer glow
- **No traditional shadows on field** — the field uses luminance + additive blending for depth

### Additive Blending (Canvas)
The field canvas uses `globalCompositeOperation: 'lighter'` for all trail rendering. This means overlapping trails brighten at intersections — creating emergent heat zones where the offense targets frequently. This is the core visual principle of the Drive Fingerprint: density creates brightness without explicit heat-map code.

## 7. Do's and Don'ts

### Do
- Use Bebas Neue ONLY for impact text (yardage, titles) — never for body, labels, or UI elements
- Build everything on `#05040a` — this is the universal canvas, not a "dark theme" applied to a light design
- Use team primary color as the singular accent — it should permeate: borders, glows, trails, labels, goal lines
- Apply additive blending (`globalCompositeOperation: 'lighter'`) for ALL trail and glow rendering on canvas
- Scale visual feedback with play magnitude — bigger plays = bigger text, longer shake, brighter trails, wider rings
- Use organic noise (±1-2px random jitter) on trail paths — fingerprints should feel hand-drawn, not mechanical
- Keep trail thickness proportional to yards: `max(0.8, min(5, |yards| / 4.5))` pixels
- Show 40-yard zoomed viewport during gameplay — trails need to be readable at 200px field height
- Distinguish run plays (amber `#ff9933` card bar) from pass plays (team neon card bar) at card level
- Use seeded randomness for trail paths — same plays should produce same visual fingerprint

### Don't
- Don't use pure white (`#ffffff`) for text — use `rgba(255, 250, 235, 0.8)` for warm near-white
- Don't add color to the field surface — the field is near-black; trails ARE the color
- Don't use Bebas Neue below 30px — it's a display face, not a UI face
- Don't mix team colors — only one team's palette is active at a time
- Don't use normal blending on the trail canvas — without additive blending, overlapping trails look muddy
- Don't skip the five-phase pacing sequence — instant results kill the drama
- Don't make routine plays dramatic — shake, field flash, and rings are reserved for intensity 2+ plays
- Don't render trails with straight lines — always use the SHAPES lookup + noise + midpoint interpolation
- Don't use solid backgrounds on cards — they should be near-transparent tinted with team color
- Don't put more than 3 text elements on a card face — name, category, flavor text. That's it.
- Don't animate the field during the snap phase — the flash is the only visual; the field should be still/waiting

## 8. Animation & Pacing

### Five-Phase Snap Sequence
Each play follows a strict temporal sequence. The pacing IS the game feel.

| Phase | Timing | What Happens | Visual |
|-------|--------|-------------|--------|
| **Snap** | 0-350ms | Card hand slides out, HUD dims, LOS flash | `snapFlash` animation: team color at 8% opacity, fades 300ms |
| **Trail** | 350-850ms+ | Route traces across field. Result HIDDEN. | Trail draws at `280 + |yards| × 8` ms. Sparks emit from tip. |
| **Impact** | Immediate after trail | Result slams in. Field reacts. | Font scales up with spring bounce. Shake + field flash + impact rings per intensity. |
| **Context** | 300-800ms after impact | Down/distance updates. Commentary fades in. | HUD un-dims. Timeline pip grows. First down callout if applicable. |
| **Ready** | 300-900ms after context | Result fades. New hand deals in. | Cards stagger in from bottom (50ms each). Player can tap again. |

### Intensity Scaling
Every visual response scales across three intensity levels:

| Property | Level 1 (Routine) | Level 2 (Notable) | Level 3 (Big Play / TD) |
|----------|-------------------|--------------------|-----------------------|
| Font Size | 30px | 48px | 60-72px |
| Shake | None | shake1 (2px, 250ms) | shake2/shake3 (4-6px, 350-450ms) |
| Field Flash | None | Exploit: blue radial / Sack: darken | TD: gold bloom / Turnover: red wash |
| Impact Rings | None | 1 ring, 20px radius, 400ms | 2 rings, 35px radius, 600ms |
| Trail Draw Speed | 280 + yards×8 ms | Same formula | Same, but longer because more yards |
| Context Delay | 300ms | 500ms | 800ms |
| Linger Time | 300ms | 600ms | 900ms |
| Drive End Delay | 600ms | — | TD: 1200ms, TO: 900ms |

### Intensity Assignment
- **Level 1**: Standard gains, short runs, incomplete passes
- **Level 2**: Exploits 8-14 yards, sacks (yards < -3), first downs gaining 8+ yards
- **Level 3**: Touchdowns, turnovers, exploits 15+ yards

### Screen Shake Keyframes
```css
/* Level 1 — nudge */
@keyframes shake1 { 0%,100%{transform:none} 25%{transform:translateX(-2px)} 50%{transform:translateX(2px)} 75%{transform:translateX(-1px)} }

/* Level 2 — jolt */
@keyframes shake2 { 0%,100%{transform:none} 15%{transform:translateX(-4px) rotate(-.4deg)} 35%{transform:translateX(4px) rotate(.4deg)} 55%{transform:translateX(-2px)} 75%{transform:translateX(1px)} }

/* Level 3 — rumble */
@keyframes shake3 { 0%,100%{transform:none} 10%{transform:translateX(-6px) rotate(-.6deg)} 25%{transform:translateX(6px) rotate(.6deg)} 40%{transform:translateX(-4px) rotate(-.3deg)} 55%{transform:translateX(3px)} 70%{transform:translateX(-2px)} 85%{transform:translateX(1px)} }
```

### Card Deal Animation
```css
.card { opacity:0; transform:translateY(20px); animation: dealIn .25s ease-out forwards; }
.card:nth-child(1) { animation-delay: .05s }
.card:nth-child(2) { animation-delay: .1s }
.card:nth-child(3) { animation-delay: .15s }
.card:nth-child(4) { animation-delay: .2s }
@keyframes dealIn { to { opacity:1; transform:translateY(0) } }
```

## 9. Drive Fingerprint — Canvas Rendering Specification

The Drive Fingerprint is a visualization layer that accumulates during gameplay. Every play the player calls leaves a glowing trail on the field canvas. By drive's end, the pattern of trails forms a unique visual artifact — the fingerprint of how they played.

### Trail Rendering (4-layer additive stack)
Each trail is rendered four times with `globalCompositeOperation: 'lighter'`:

| Layer | Line Width | Opacity | Color | Purpose |
|-------|-----------|---------|-------|---------|
| Bloom | `w × 5.5` | `op × 0.025` | Team RGB | Soft atmospheric halo |
| Glow | `w × 2.5` | `op × 0.09` | Team RGB | Mid-range glow |
| Core | `w` | `op × 0.55` | Team RGB | The visible trail line |
| Hot Center | `max(0.3, w×0.25)` | `op × 0.12-0.35` | `255,255,250` (near-white) | Bright inner edge, stronger on exploits |

Where `w = max(0.8, min(5, |yards| / 4.5))` and `op` is the trail's base opacity:
- Exploit: 0.85
- Turnover: 0.9
- Covered: 0.35
- Neutral: 0.5

### Trail Path Construction
1. Look up route shape from SHAPES table (normalized `[xOffset, yProgress]` waypoints)
2. Apply seeded random mirror (left/right based on `snapNum + playId` hash)
3. Scale x-offsets by field width, y-progress by actual yards gained
4. Add organic noise: ±2px x-jitter, ±1.5px y-jitter per waypoint
5. Interpolate midpoints between each pair of waypoints with ±1.5px noise
6. Result: 9-point smooth polyline with organic hand-drawn feel

### Trail Endpoints
- **Exploit**: Radial gradient bloom (white center → team color → transparent). Radius = `4 + |yards| × 0.18`.
- **Turnover**: Red radial glow + X-mark (two crossed lines, 3.5px arms, `rgba(255,50,40, op×0.55)`)
- **Covered**: No endpoint marker — trail simply ends
- **Neutral**: Subtle radial gradient (white center → team color → transparent), 5px radius
- **Touchdown**: Gold radial bloom at end zone coordinates, 30px radius, `rgba(235,176,16, op×0.15)`

### Impact Rings (Canvas)
On exploits and touchdowns, expanding rings pulse from the trail endpoint:
- Ring expands from 0 to `ringMax` pixels over `ringDur` ms
- Opacity fades from 0.3 to 0 as ring expands
- Line width decreases from 2px to 0 as ring expands
- Level 3 plays get a second ring at 1.4× radius with 50% opacity
- Color: team RGB for exploits, gold `rgb(235,176,16)` for touchdowns

### Temporal Fade (Accumulated Trails)
Earlier trails render at lower opacity to create depth:
- Trail `i` of `n` total: fade factor = `0.3 + 0.7 × (i / max(1, n-1))`
- First trail: 30% brightness. Last trail: 100% brightness.
- Effect: the drive's history recedes while recent plays glow brightest

### Trail Connectors
Dashed lines connect consecutive trail endpoints:
- `setLineDash([1.5, 3])`, line width 0.4px
- Color: team primary at `(fade × 0.03)` opacity
- Purpose: shows the drive's spatial journey across the field

### Viewport System
- **Gameplay**: 40-yard window centered on ball position. Each yard = ~4.4px. Trails are large and readable.
- **Share Card**: Full 100-yard field. Each yard = ~3.96px. All trails visible, spatial story revealed.
- **Transition**: When drive ends, field expands from 200px to 420px, viewport switches from `game` to `full`, all trails rebuild at new scale using stored play data + seeded randomness.

### Share Card Layout (4:5 ratio, 375×420px)
After the field expands, the share card renders in phases:
1. **Dark field** (0ms): Ultra-dim yard lines (1.5% opacity), faded goal lines
2. **Trail replay** (200ms + 100ms per trail): Trails draw in sequence at 1.15× opacity
3. **Autopsy labels** (+250ms): "KEY PLAY" and "TURNING POINT" annotations at trail endpoints
4. **Title** (+300ms): "TOUCHDOWN" / "TURNOVER" in Bebas Neue 40px, outcome-colored
5. **Stats** (+250ms): Play count, yards, exploits. Team name. "TORCH · DRIVE #[number]" in bottom-right.

## 10. Agent Prompt Guide

### Quick Color Reference
```
App Background:    #05040a
Field Surface:     #050408
Field Interior:    #080c10

Boars:             primary #8B0000, accent #C4A265
Dolphins:          primary #E8548F, accent #FF7EB3
Spectres:          primary #5DADE2, accent #85C1E9
Serpents:          primary #2E0854, accent #39FF14

Touchdown Gold:    #EBB010
Turnover Red:      #ff2424
Covered Gray:      rgb(55, 65, 85)

Text Primary:      rgba(255, 250, 235, 0.8)
Text Secondary:    rgba(255, 250, 235, 0.28)
Text Muted:        rgba(255, 250, 235, 0.18)
```

### Ready-to-Use Prompts

**"Build a TORCH gameplay screen"**
→ 375px wide, #05040a background. HUD at top (team name in Bebas Neue + down/distance + coverage badge). Canvas field at 200px height. Result display area. Timeline strip. Card hand at bottom with 4 cards.

**"Style a play card"**
→ 76px wide, 8px radius, 1.5px border in team color at 18% opacity. 3px top bar (amber for runs, team neon for passes). Dark near-transparent background. Card name in 13px white 900 weight. Category in 6.5px team color. Flavor text in 8px italic at 18% opacity.

**"Render a drive fingerprint trail"**
→ Canvas 2D, `globalCompositeOperation: 'lighter'`. Four-layer stack: bloom (w×5.5, 2.5% opacity), glow (w×2.5, 9%), core (w, 55%), hot center (w×0.25, 12-35% near-white). Line width w = max(0.8, min(5, |yards|/4.5)). Add ±2px noise to path points.

**"Animate a play result at intensity 3"**
→ Font: Bebas Neue 60-72px. Spring bounce scale(0.3→1) over 300ms. Shake3 animation (6px, 450ms). Field flash: gold radial for TD, red wash for turnover. Two expanding impact rings from trail endpoint (35px radius, 600ms). Hold result for 900ms before clearing.

**"Create the share card"**
→ Expand field to 420px (4:5 ratio). Switch to full 100-yard view. Rebuild trails with seeded paths. Replay trails at 100ms intervals. Add "KEY PLAY" and "TURNING POINT" labels at best/worst trail endpoints. Slam title in Bebas Neue 40px. Stats line: "12 PLAYS · 80 YDS · 3 EXPLOITS". Team name. "TORCH · DRIVE #247" bottom-right in gold at 16% opacity.
