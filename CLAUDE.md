# TORCH — The Football Card Game

## What This Is
TORCH is a daily football card game with a late-90s arcade broadcast aesthetic. You pick a team and side (offense or defense), draft your hand from scheme-specific play cards, and play them one snap at a time against an AI opponent. One drive. One chance. Daily puzzle format.

## Version
**v0.10.0 — "Gameday Edition"**

## Tech Stack
- **Build:** Vite (v8), vanilla JS with ES6 modules
- **Styling:** CSS custom properties, inline styles via `document.createElement`
- **Fonts:** Bebas Neue, Press Start 2P, Barlow Condensed (Google Fonts)
- **Audio:** Web Audio API (synth SFX), HTML5 Audio (voice-over)
- **Deploy:** Vercel (`vercel --prod`)
- **Hosting:** Static site, no backend (API route stub exists for future commentary)

## How to Run
- **Local dev:** `npm run dev` → http://localhost:5173
- **Build:** `npm run build`
- **Deploy:** `vercel --prod`

## File Structure

### `src/` — Application Source
```
src/
├── main.js                     # Entry point, render() router, screen switching
├── state.js                    # Global state (GS), setGs(), getTeam(), getInitialScenario()
├── style.css                   # CSS variables, animations, global styles
├── data/
│   ├── teams.js                # Team definitions (Cacti, Tridents), players, coaches
│   ├── cards.js                # Offense/defense play cards per team
│   ├── matchups.js             # 4 matchup tables, tier system (O+, N, D+, TO)
│   └── playDiagrams.js         # X's and O's SVG data for play card visuals
├── engine/
│   ├── ai.js                   # AI play-calling logic, scheme-specific weights
│   ├── bgm.js                  # Background music manager (exists but not imported)
│   ├── resolution.js           # Yard resolution engine, matchup tier evaluation
│   └── sound.js                # Web Audio synth — single unified click sound
└── ui/
    ├── components/
    │   ├── intel.js             # Card intel modal (strategic tips per play)
    │   └── scoreboard.js        # Scoreboard component (mascot names, gold glow for player team)
    └── screens/
        ├── home.js              # Title screen — TORCH FOOTBALL logo, daily challenge button
        ├── setup.js             # Team/side selection + animated scenario modal
        ├── draft.js             # Player draft — 6 roster slots with Tecmo-style portraits
        ├── cardDraft.js         # Play card draft — pick 5 from scheme pool
        ├── play.js              # Gameplay — card clash, yard resolution, scorebug
        ├── result.js            # Win/loss — TORCH LIT / TORCH OUT, streak tracking
        └── under_construction.js # Broadcast Offline — coming soon page with voice-over
```

### `public/` — Static Assets
```
public/
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker (cache-clearing reset)
├── audio/
│   ├── torch-theme.mp3         # Menu theme music (not currently wired up)
│   └── broadcast-intro.mp3     # Voice-over for Broadcast Offline page
└── img/players/                # 24 Tecmo-style player portraits
    ├── ct-off-qb-avery.png     # Canyon Tech offense
    ├── ct-off-qb-meyers.png
    ├── ct-off-wr-sampson.png
    ├── ct-off-wr-liu.png
    ├── ct-off-slot-vasquez.png
    ├── ct-off-rb-walsh.png
    ├── ct-def-lb-wilder.png    # Canyon Tech defense
    ├── ct-def-lb-moon.png
    ├── ct-def-cb-crews.png
    ├── ct-def-cb-bishop.png
    ├── ct-def-s-knox.png
    ├── ct-def-s-orozco.png
    ├── ir-off-qb-kendrick.png  # Iron Ridge offense
    ├── ir-off-qb-larkin.png
    ├── ir-off-fb-torres.png
    ├── ir-off-rb-sims.png
    ├── ir-off-rb-owens.png
    ├── ir-off-te-buckley.png
    ├── ir-def-lb-lawson.png    # Iron Ridge defense
    ├── ir-def-lb-barrett.png
    ├── ir-def-cb-gill.png
    ├── ir-def-cb-kemp.png
    ├── ir-def-s-slade.png
    └── ir-def-s-ware.png
```

## Screen Flow
```
Home → Setup (scenario modal → team selection → side selection → scoreboard)
     → Player Draft (pick 6 roster players)
     → Card Draft (pick 5 play cards from scheme pool)
     → Gameplay (snap-by-snap card clash)
     → Result (TORCH LIT / TORCH OUT + streak)
```

## Teams

### Canyon Tech Cacti
- **Accent:** #ff8844
- **Offense:** Air Raid — sling it every play
- **Defense:** Send Everybody — blitz or bust
- **Players:** Colt Avery (QB), Dash Meyers (QB), Quez Sampson (WR), Dante Liu (WR), Rio Vasquez (SLOT), Kirby Walsh (RB)
- **Defenders:** Jace Wilder (LB), Darius Moon (LB), Zion Crews (CB), Ty Bishop (CB), Andre Knox (S), Kai Orozco (S)

### Iron Ridge Tridents
- **Accent:** #ff4444
- **Offense:** Triple Option — give, keep, pitch
- **Defense:** Hard Nosed — the process
- **Players:** Bo Kendrick (QB), Tate Larkin (QB), Mack Torres (FB), Jaylen Sims (RB), Duke Owens (RB), Cade Buckley (TE)
- **Defenders:** Dez Lawson (LB), Knox Barrett (LB), Terrance Gill (CB), Aiden Kemp (CB), Roman Slade (S), Malik Ware (S)

## Player Art
- 24 PNG files in `/public/img/players/`
- Naming: `{team}-{side}-{position}-{lastname}.png` (e.g., `ct-off-qb-avery.png`)
- Style: Nano/Banana Tecmo pixel art with team-colored uniforms and green glow outline

## Matchup System
- 4 matchup tables in `src/data/matchups.js`
- Tiers: **O+** (offense wins big), **N** (neutral), **D+** (defense wins), **TO** (turnover risk)
- AI selects plays using scheme-specific weights in `src/engine/ai.js`
- Yards resolved in `src/engine/resolution.js` based on tier + randomness

## Color System
```css
--bg: #050015          /* Deep dark base */
--bg-surface: #0f0d1a  /* Card/panel backgrounds */
--bg-raised: #1a1030   /* Elevated surfaces */
--f-purple: #bb00ff    /* Structural accents, borders */
--l-green: #00ff44     /* Selection state, offense */
--a-gold: #ffcc00      /* Brand, rewards, earned moments */
--p-red: #ff0040       /* Danger, defense, turnovers */
--cyan: #00eaff        /* Data display, down & distance */
--orange: #ff4d00      /* Clock, fire effects */
--muted: #aaa          /* Secondary text (WCAG AA compliant) */
```

## Architecture Notes
- **State:** All state lives in `GS` object. `setGs(updates)` triggers re-render.
- **Rendering:** `render()` in `main.js` wipes `#root` and appends current screen's `build*()` result.
- **Scenario:** Initial game state (down, distance, clock, scores) stored in `GS.scenario`.
- **Daily lock:** `localStorage` tracks `torch_last_play`, `torch_last_result`, `torch_streak`.

## Coding Conventions
- ES6 modules with `import`/`export`
- Vanilla DOM via `document.createElement` — no framework
- State updates: `setGs(s => Object.assign({}, s, { ... }))` to preserve nested state
- Inline styles via `.style.cssText` for component-scoped styling
- CSS variables for theme consistency

## Git Conventions
- **Version constants** live in `src/state.js` (`VERSION`, `VERSION_NAME`) — update these on every release
- **PATCH** (0.10.x): Bug fixes, copy changes, style tweaks
- **MINOR** (0.x.0): New features, new screens, new game modes
- **MAJOR** (x.0.0): Fundamental gameplay or architecture changes
- Commit messages: `v{VERSION} — short description of changes`

## Current Gaps / TODO
- **Free Play mode:** Button exists on home screen but disabled ("COMING SOON")
- **AI Commentary:** API route exists (`api/commentary.js`) but Broadcast Booth UI not wired up in v0.10.0
- **Background music:** `bgm.js` exists but is not imported anywhere (music removed for now)
- **2-Point Conversion:** Logic exists but may need re-verification after modularization
- **Social sharing:** No share/screenshot functionality yet
- **App Store packaging:** Capacitor not yet configured
- **Analytics:** No tracking or telemetry in place

## Deploy Notes
- Vercel auto-builds from `npm run build` (outputs to `dist/`)
- If Vercel throws "Git author must have access" error: `git config --global user.email "your.email@example.com"` then `git commit --amend --reset-author --no-edit`
- Service worker has been reset to cache-clearing mode for v0.10.0 rollout
