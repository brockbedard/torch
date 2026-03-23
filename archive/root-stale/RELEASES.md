# TORCH — Release Notes

---

## v0.18.0 "Gameday Build" — March 15, 2026

**Production URL:** https://torch-two.vercel.app

### What's New
- **CM3-Inspired Play-by-Play Pacing** — Lines appear one at a time with variable timing. Current line highlighted, previous lines dimmed.
- **Atmospheric Team Identity** — Added unique environmental effects to Team Selection: **Heat Haze** for Canyon Tech and **Static Sparks** for Iron Ridge.
- **Star Power Overlays** — Featured star players (Rio Vasquez & Mack Torres) highlighted with large gold icons and full position names inside team cards.
- **Kinetic Progress Stepper** — Overhauled 1-2-3-4 stepper shifted to **Purple (#bb00ff)** with breathing pulse animations and moving "flow" connector lines.
- **5-Tier Celebration System** — Scaling effects from Routine to Clutch Game-Winner. Includes screen shake, impact bursts, and football rain.

### What Changed
- **Symmetric Team Selection** — Redesigned team cards for perfect symmetry and 1-screen mobile optimization. Moved Star info into stats box.
- **Mascot Branding** — Updated names to **CANYON TECH CACTI** and **IRON RIDGE TRIDENTS**.
- **Unified Drafting UI** — Updated all draft headers to larger 32px gold "TORCH" branding with consistent middle-dot subtitle.
- **Refined Rating Stars** — Filled stars now match team accent colors (Gold/Teal) with crisp white outlines for empty slots.
- **Clean Difficulty Buttons** — Stoplight-colored buttons (Easy/Medium/Hard) match main button physics with white text and clean selection borders.
- **Improved Spacing** — Increased gaps between major page sections (20px) for better visual breathing room on high-res displays.

### Bug Fixes
- Fixed swapped coach and stadium images in Team Selection.
- Corrected "Vasquez" identity to full name "Rio Vasquez."
- Fixed gray border artifacts on selected difficulty buttons.
- Resolved blank screen error during draft transitions.
- Consolidated redundant style injections in Progress Stepper.

---

## v0.17.6 "Torch Popup + Field Polish" — March 15, 2026

**Production URL:** https://torch-two.vercel.app

### What's New
- **Big TORCH Points Popup** — 28px center-screen popup when points earned/lost (gold/red)
- **Brighter Football Field** — yard lines 2x visible, numbers bolder, midfield logo 35% opacity at 56px

### What Changed
- **VS Display** — removed crash animation, simple flex-centered between card stacks
- **Scoreboard** — symmetric grid, proportional icons/names/scores, FIRST HALF on one line
- **Clash Display** — cards appear instantly, clean 3-column layout

### Bug Fixes
- SPIKE/KNEEL only on offense
- Negative yards increase distance correctly (sack on 2nd & 10 → 3rd & 17)
- Scorebug stays at pre-snap state during commentary
- iPhone scrolling fixed
- Play/player draft screens behave identically
- Play cards stay static on selection
- 2pt/3pt conversions play out with full card selection + commentary

---

## v0.17.3 "Complete Gameplay Rebuild" — March 15, 2026

### What's New
- **Complete UI rebuild** from v0.10.0 landscape to portrait bottom-stack
- **Tecmo Bowl field** with colored endzones, yard markers, midfield logo
- **Drag-and-drop card selection** — play → player → torch → SNAP
- **Broadcast play-by-play commentary** — 256+ unique combinations via synonym rotation
- **AI commentary** via /api/commentary (Claude Haiku, optional)
- **Celebrations** — TD (football rain + green flash), turnover (red crack), sack (impact)
- **TORCH points** — fly animation, roll-up ticker, user-team-only display with breakdown
- **Sound effects** — 16 jsfxr synthesized sounds for all interactions
- **Card deck cycling** — played card returns to deck, replacement drawn
- **Conversions** — XP auto, 2pt/3pt with full card selection
- **Offense/defense energy shift** — warm amber vs cold blue themes
- **2-minute drill transformation** — pulsing red UI, SPIKE/KNEEL

### Pregame Changes
- **Team selection** — SVG coach portraits, stadium cutouts, star ratings
- **4-step stepper** — TEAM → PLAYERS → PLAYS → START GAME
- **Player/play drafts** — modals, fly-in reviews, matching behavior
- **Coin toss** — overlay on gameplay field
- **4 plays per side** (was 5, now matches 4 players)

---

## v0.10.0 "Gameday Edition" — March 13, 2026

- Initial arcade broadcast redesign
- Player art, team branding, scenario modal, audio
- Landscape gameplay with 60/40 split
- Player draft and play card draft screens
