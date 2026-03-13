# TORCH — The Football Card Game

## What This Is
TORCH is a daily football card game. You pick offense or defense, draft your hand, and play cards one snap at a time against an AI opponent. 

**v0.9.0 Update:** The project has been modularized using **Vite**. Logic is no longer in a single HTML file but split into ES6 modules in `src/`.

## Version Status
- **v0.9.0** — "Broadcast Ready Build." Modularized architecture via Vite. Re-integrated AI Commentary, 2-point conversion choice, and mobile app optimizations (safe areas, touch-action). Added "Broadcast Offline" placeholder.

## Project Structure
```
torch-football/
├── src/
│   ├── data/           # Teams, Cards, Matchup Tables, Play Diagrams
│   ├── engine/         # Sound engine, AI logic, Yard resolution
│   ├── ui/
│   │   ├── components/ # Scoreboard, Intel Modal
│   │   └── screens/    # buildHome, buildPlay, buildSetup, etc.
│   ├── state.js        # Global state (GS) and setGs management
│   ├── style.css       # Unified arcade broadcast styles
│   └── main.js         # Entry point & Render loop
├── public/             # Static assets (manifest.json, sw.js)
├── index.html          # Vite entry shell
├── index.legacy.html   # Backup of the v0.8.x monolith
├── package.json        # Vite/Vercel configuration
└── CLAUDE.md           # You are here
```

## How to Run
- **Local dev:** `npm run dev` (Runs Vite on http://localhost:5173)
- **Build:** `npm run build`
- **Deploy:** `vercel --prod` 
  - *Note:* If Vercel throws a "Git author must have access" error, ensure your local git email matches your Vercel account: `git config --global user.email "your.email@example.com"` and then `git commit --amend --reset-author --no-edit` before deploying.

## Architecture (v0.9.0 Vite Modular)

### State Management (`src/state.js`)
- All state lives in the `GS` object. 
- `setGs(updates)` handles state transitions and triggers a re-render.
- **Scenario:** Initial game state (down/dist/clock) is now stored in `GS.scenario`.

### UI Rendering (`src/main.js`)
- The `render()` function in `main.js` is the central router. 
- It wipes `#root` and appends the result of the current screen's `build*` function.
- All screens are located in `src/ui/screens/`.

### Sound Engine (`src/engine/sound.js`)
- Web Audio API synth. Functions: `snap()`, `td()`, `clash()`, `whistle()`, `grunt()`.

## Coding Conventions
- **ES6 Modules:** Use `import`/`export` for all logic.
- **Functional State:** Prefer `setGs(s => Object.assign({}, s, { ... }))` to preserve nested state like `scenario`.
- **Vanilla DOM:** Screens use `document.createElement`.

## Recent Changes (Gemini CLI - v0.9.0)
- **Modularization:** Successfully broke the 1,500-line `index.html` into a Vite project structure.
- **AI Commentary:** Re-integrated `api/commentary.js` with a "Broadcast Booth" UI box.
- **2-Point Conversion:** Restored the strategic choice logic after touchdowns.
- **Home Screen Fix:** Corrected ball animation to perfectly cross and "ignite" over the flame logo.
- **Mobile Optimizations:** Added `env(safe-area-inset-*)` and `touch-action: manipulation` for App Store readiness.
- **Under Construction:** Added "BROADCAST OFFLINE" screen with a hidden "DEV ACCESS" bypass.
- **Deployment:** Linked modular build to Vercel and resolved Git author validation errors for seamless `--prod` pushes.
- **Cleanup:** Cleaned up `public/` folder; moved legacy monolith to `index.legacy.html`.

## What's Next
- **Prototype Expansion:** Implementing the currently grayed-out "FREE PLAY" mode.
- **Defensive Logic:** Fine-tuning "Multiple D" weights and scheme-specific AI for Iron Ridge.
- **Vercel Refinement:** Adding better analytics or social sharing previews for the web version.
- **App Store Readiness:** Continual focus on mobile-friendly UI/performance, keeping native packaging (Capacitor) as a long-term goal.
