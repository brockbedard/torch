# TORCH — The Football Card Game

## What This Is
TORCH is a daily football puzzle game (think Wordle meets Madden playcalling). Players read a defensive coverage shell and pick play cards that exploit it. The core loop: **read the defense → pick your play → see if you read it right**.

Built as a mobile-first single-page app (430px max-width). Currently a single HTML file (`public/index.html`, ~3400 lines) with vanilla JS, no framework.

## Project Structure
```
torch-project/
├── public/
│   └── index.html      ← The entire game (HTML + CSS + JS in one file)
├── api/
│   └── commentary.js   ← Vercel serverless function proxying to Anthropic API
├── package.json
├── vercel.json
├── .env.example
└── CLAUDE.md            ← You are here
```

## How to Run
- **Static (no AI commentary):** `npx serve public -l 3000` — fallback commentary kicks in
- **With API routes:** `vercel dev` — requires `ANTHROPIC_API_KEY` in `.env`
- **Deploy:** `vercel --prod`

## Architecture

### Current State (v0.6.1)
Everything lives in one HTML file. The "framework" is:
- `GS` — global game state object
- `setGs(fn)` — updates state and calls `render()`
- `render()` — wipes `root.innerHTML`, rebuilds the active screen via `buildXxx()` functions
- Screen functions: `buildTitle`, `buildDaily`, `buildIntro`, `buildGame`, `buildResult`, `buildShop`, `buildEnd`, `buildOnboarding`

This approach works but won't scale much further. The next major refactor should move to a component-based approach (Preact recommended — tiny, no build step required with HTM).

### Game Modes
1. **Daily Torch** (primary) — One scenario per day, pick from 5 cards, try to hit a yardage target. Wordle-style sharing. Has both offense and defense sides.
2. **Campaign Mode** — Multi-drive run: score 5 TDs before losing 3 lives. Has deck building, coin shop, player cards.

### Key Game Systems
- **Coverage logic** (`CVR` object) — 7 coverages (Cover 0-4, Man Free, Cover 6), each with weak plays, weakness confidence values, formation variants, hints
- **Card resolution** (`resolve()` function) — Calculates yards based on card vs coverage matchup, buffs, streaks, scheme bonuses. Uses `weakStrength` confidence values so exploits aren't guaranteed
- **Offensive schemes** (4) — Spread Option, Lightning Tempo, Vertical Threat, Triple Option. Each has starter decks and unique bonuses
- **Defensive schemes** (4) — Gulf Coast Zone, Pressure Storm, Sooner Four, Pacific Press
- **Defensive cards** (12) — DCARDS array, used in defense mode
- **Teams & Players** (4 teams, 3 players each) — TORCH_TEAMS array, with abilities that boost specific plays
- **Daily scenarios** (90) — SCENARIOS array, each with a specific coverage, hand, yardage target, and difficulty
- **Streak system** — localStorage-based, unlocks film room hints at 3-day and 7-day streaks
- **Sound engine** — Web Audio API synthesized 8-bit sounds (SND object)

### Football Knowledge
The game mechanics are grounded in real football concepts from Smart Football (Chris Brown):
- Cover 2's true weakness is the deep middle seam
- Screens are the mathematical answer to Cover 0 blitz
- Play action only works if you've established the run
- Motion pre-snap identifies man vs zone coverage
- Run streaks open passing lanes (safeties cheat up)
- Cover 4 pattern-matches, it's not just soft zone

### AI Commentary
The `ai()` function calls `/api/commentary` which proxies to the Anthropic API. Three types:
1. **Play-by-play commentary** — after each snap on the result screen
2. **DC adjustments** — between drives, the AI defensive coordinator comments on tendencies
3. **Game recap** — end screen summary

All AI calls have static fallbacks (FALLBACK object) so the game works without a backend.

## Coding Conventions
- Vanilla JS, no transpilation, no build step
- ES5-compatible function expressions (not arrow functions) in most UI code
- DOM construction via `createElement` chains (not innerHTML for interactive elements)
- CSS-in-JS via `el.style.cssText` strings
- Font stack: Bebas Neue (headers), Press Start 2P (labels/badges), Barlow Condensed (body)
- Color palette: `--cyan`, `--gold`, `--green`, `--orange`, `--danger`, `--purple` on dark `--bg`
- All state in the `GS` object; `setGs()` triggers full re-render
- localStorage keys all prefixed with `torch_`

## Known Issues & Next Steps
1. **Monolith** — 3400 lines in one file. Needs component extraction.
2. **Full re-render** — Every state change rebuilds the entire DOM. Causes scroll position loss and animation restart.
3. **No versioned localStorage** — Schema changes between versions cause silent bugs from stale stored values.
4. **Vertical Threat scheme is OP** — PA always active + no go route INT removes too much risk.
5. **Triple Option +18 streak bonus** — Very swingy, may need tuning.
6. **No offline/PWA support** — Should add a manifest and service worker.
7. **Campaign mode and Daily mode share 90% of play logic** — Should unify into one `doPlay()` pipeline.
