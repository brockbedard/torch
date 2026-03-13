# TORCH — The Football Card Game

## What This Is
TORCH is a daily football card game. You pick offense or defense, draft your hand, and play cards one snap at a time against an AI opponent. Neither side knows what the other called. Cards clash, results reveal, and the drive plays out with real down-and-distance, a ticking clock, and a scoreboard.

The core question every snap: **"What would you call here?"**

Built as a mobile-first single-page app (430px max-width). Single HTML file with vanilla JS, no framework.

## Version Status
- **v0.8** — "Arcade Broadcast Build." Massively updated the UI to an "NFL Blitz/Tecmo Bowl" high-octane aesthetic. Introduced dynamic scoring, CRT scanlines, and new synthesized football audio (grunts, whistles).

## Project Structure
```
torch-football/
├── public/
│   ├── index.html              ← The entire game (~1200 lines: HTML + CSS + JS)
│   ├── manifest.json           ← PWA manifest (home screen install)
│   └── sw.js                   ← Service worker (offline caching)
├── api/
│   └── commentary.js           ← Vercel serverless function (not used currently)
├── TORCH-GDD-v0.7.md           ← Game design document (legacy UI notes)
├── TORCH-MATCHUP-TABLE-v0.7.md ← Card matchup logic reference
├── package.json
├── vercel.json
└── CLAUDE.md                   ← You are here
```

## How to Run
- **Local dev:** `npx serve public -l 3000`
- **Deploy:** `vercel --prod`
- **Production URL:** https://torch-two.vercel.app/

## Architecture (v0.8 Arcade Redesign)

### Visual Philosophy: "Arcade Broadcast"
The UI is styled like a 1998 arcade machine mixed with a high-end TV sports graphic. 
- **Global VFX:** `.crt-overlay` applies a persistent scanline and vignette overlay (`pointer-events: none`).
- **CSS:** Heavy use of `box-shadow` for neon glows, `linear-gradient` for chrome/metallic bevels, and CSS keyframe animations (`flicker`, `pop`, `sup`).
- **Fonts:** `Bebas Neue` (large headers), `Press Start 2P` (pixel data/buttons), `Barlow Condensed` (body).
- **Colors:** Deep purple/navy background (`--bg: #050015`), vivid accents (`--l-green`, `--a-gold`, `--p-red`, `--f-purple`).

### Screen Flow
Home → Setup (Side & Team) → Player Draft → Card Draft → **Gameplay** → Result

### Implemented Screens (v0.8)
1. **Home** — Giant skewed `TORCH` logo, animated flame, "PLAY TODAY'S TORCH" button, grayed-out "FREE PLAY", and a hidden "DEV: RESET DAILY LOCK" button.
2. **Setup** — Scenario Brief Modal pops up first (late 4th quarter, score 14-21). 3-column Proportional Scoreboard. Step 1: Pick Side (Offense/Defense). Step 2: Choose Team (Iron Ridge / Canyon Tech). "LOCK IN TEAM" button.
3. **Player Draft** — Pick 1 QB/LB + 3 skill players from team-specific pool of 6. Side-aware. Cards use the `.play-card-blitz` class.
4. **Card Draft** — Pick 5 play cards from team-specific pool of 10. Side-aware. 
5. **Gameplay** — Widescreen broadcast Scorebug (dynamic team names/colors based on Side choice), Field Visualization (neon green/red player dots), Clash Zone (VS circle with red plasma glow), Hand Management.
6. **Result** — Win ("TORCH LIT") or loss ("TORCH OUT"). Includes final score, drive stats, streak counter, and share-to-clipboard button.

### Teams & Schemes
- **Iron Ridge (IRON)**
  - Offense: TRIPLE OPTION
  - Defense: MULTIPLE D
  - Colors: Red/Black
- **Canyon Tech (CANYON)**
  - Offense: AIR RAID
  - Defense: SEND EVERYBODY
  - Colors: Orange/Black

### Key Game Systems
- **Matchup Tables** — 4 grids for all team combinations: `MT_CT_IR`, `MT_IR_CT`, `MT_CT_CT`, `MT_IR_IR`.
- **Yard resolution** — `rollYards(tier)` returns randomized yards per tier. `isTurnover(tier)`.
- **AI Play-Calling** — Scheme-appropriate weighted selection in `aiPickDefense()` and `aiPickOffense()`.
- **Streak Tracking** — localStorage (`torch_streak`, `torch_last_play`). Increments on win, resets on loss. Displayed on result screen. Locked out on loss until next day.
- **Sound engine (`SND`)** — Web Audio synth. Football-specific sounds: `snap()` (grunt + noise), `td()` and `turnover()` (modulated whistles), `clash()` (heavy hit). 

## Coding Conventions
- Vanilla JS, no transpilation, no build step.
- DOM construction via `document.createElement` chains.
- CSS-in-JS via `el.style.cssText` strings.
- All state in the `GS` object; `setGs()` triggers full re-render.
- Gameplay screen uses local state + manual DOM updates for animations (no setGs during play).
- localStorage keys prefixed with `torch_`.

## Recent Changes (Gemini CLI - v0.8 Redesign)
- Scrapped Neubrutalism UI for "Arcade Broadcast" (NFL Blitz style).
- Re-wrote `index.html` structure to use `.btn-blitz` and `.chrome-header` utility classes.
- Added CRT scanline overlay and high-saturation color palette.
- Overhauled Setup flow: Users now pick Side (Off/Def) before Team.
- Added auto-firing Scenario Modal to Setup screen.
- Redesigned Scoreboard/Scorebug into a proportional 3-column grid with dynamic team naming ("IRON" / "CANYON").
- Added dynamic "BALL ON: [TEAM] 35" logic.
- Overhauled sound engine with synthesized football grunts and whistles.
- Fixed Next Play button overlap bug and emoji sharing encoding.

## What's Next
- Re-integrating `api/commentary.js` AI system.
- Adding specific defensive playbook logic for "Multiple D".
- Implementing "FREE PLAY" mode.
