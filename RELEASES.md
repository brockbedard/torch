# TORCH — Release Notes

---

## v0.18.0 "Gameday Build" — March 15, 2026

**Production URL:** https://torch-two.vercel.app

### What's New
- **CM3-Inspired Play-by-Play Pacing** — Lines appear one at a time with variable timing (Setup: 0.7s, Action: 1.1s, Climax: 2.5s). Current line highlighted, previous lines dimmed to 0.4 opacity.
- **5-Tier Celebration System** — Scaling effects from Routine (Tier 1) to Clutch Game-Winner (Tier 5). Includes screen shake, impact bursts, full-screen takeovers, slow-mo fade, and massive football rain.
- **Kinetic Progress Stepper** — Overhauled 1-2-3-4 stepper with breathing pulse animations on active steps, glowing checkmarks for completion, and moving "flow" animations on connector lines.
- **Trophy Room Reviews** — Redesigned "YOUR SQUAD" and "YOUR PLAYS" screens using full-sized cards in a vertically scrolling grid.
- **Enhanced Selection Tracking** — Green dot progress system (●/○) for Roster and Play selection, perfectly aligned with text labels.

### What Changed
- **Unified Drafting UI** — Updated all draft headers to larger 32px "TORCH - PLAY NOW" branding.
- **Improved Navigation** — Upscaled back arrows (10px) across all screens for better mobile accessibility.
- **Purple Gameplay Highlights** — Card drop highlights and pulses shifted to Purple (#bb00ff) for maximum field contrast.
- **Endzone Refinement** — Upscaled endzone text (14px) and fixed orientation so both sides read logically.
- **Terminology Updates** — "AUTO" renamed to "AUTO-SELECT," "OFFENSE" to "OFFENSIVE PLAYS," and "PLAYERS" to "ROSTER."
- **Difficulty Reversion** — Reverted difficulty buttons to stoplight color theme (Green/Yellow/Red) while maintaining unified button physics.

### Bug Fixes
- Fixed SSL "bad record mac" network errors by forcing System CA.
- Resolved blank screen error during transition from player draft to play draft.
- Fixed vertical alignment of progress dots.
- Removed redundant pre-draft tutorial modals.

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
