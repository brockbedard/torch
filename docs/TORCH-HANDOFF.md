# TORCH Football — Complete Project Handoff
## Everything needed to continue development with any AI assistant

---

## WHAT IS TORCH
TORCH is a mobile football card game. Balatro meets college football. You play both offense and defense, pick plays from a hand of cards, feature a player for badge combos, and SNAP. Cards clash simultaneously — neither side knows the other's call. Full game: 2 halves, 20 plays per half + 2-minute drills.

Two teams: Canyon Tech (Air Raid passing) vs Iron Ridge (Ground & Pound running).

---

## CURRENT STATE (March 14, 2026)

### What's Built and Working
- **Home screen** with Daily Challenge button
- **Player draft** (pick 4 offense + 4 defense from roster)
- **Play card draft** (pick 5 offense + 5 defense from 10-card playbook)
- **Gameplay engine** (Phases 1-3 complete):
  - `src/data/` — All player rosters, 20 offensive plays, 20 defensive plays, 21 Torch Cards, badge constants
  - `src/engine/` — snapResolver, badgeCombos, playHistory, redZone, ovrSystem, aiOpponent, torchPoints, injuries, turnoverReturns, gameState, test.js
  - `src/ui/screens/` — gameplay.js, coinToss.js, endGame.js
- **Gameplay screen** — field left (60%), card panel right (40%), scorebug top, narrative bottom
- **Quick Play dev button** — skips draft, drops into gameplay (position:fixed bottom-right, shows on all environments)
- **Fullscreen button** — "TAP TO GO FULLSCREEN" banner on mobile
- **PWA manifest** — for Android home screen install

### What's Broken RIGHT NOW (bugs to fix next)
1. **All 5 defensive plays are the same card (CORNER BLITZ).** Auto-draft duplicates instead of picking 5 unique cards.
2. **Quick Play drafts bench players instead of starters.** Should pick first 4 from roster arrays (starters), not random/bench.
3. **Combo preview shows "[SPEED_LINES]" text** instead of badge SVG icons.
4. **Top player cards scroll off screen** on mobile landscape.

### Branch & Deploy
- **Branch:** `refactor-vite` (all work is here, 22+ commits ahead of production)
- **Live production:** https://torch-two.vercel.app (still v0.10.0, NOT updated)
- **Local dev:** `cd ~/torch-football && npx vite --host` (port 5173 or 5174)
- **Mobile testing:** Open the Network URL (e.g., http://10.0.0.131:5174) on phone, same WiFi
- **Deploy:** `vercel --prod` from project root
- **GitHub:** https://github.com/brockbedard/torch.git

---

## KEY FILES

### Config
- `~/torch-football/CLAUDE.md` — Master context file. READ THIS FIRST. Contains all balance numbers, player rosters, engine architecture, file structure.
- `~/torch-football/vite.config.js` — Vite config
- `~/torch-football/package.json` — Dependencies

### Specs (in `docs/`)
- `TORCH-GAMEPLAY-SPEC-v0.13.md` — Master gameplay spec. Game structure, snap sequence, combos, scoring, everything.
- `TORCH-PLAY-DATA-TABLE-v0.11.md` — 20 offensive plays with statistical distributions
- `TORCH-DEFENSIVE-CARDS-v0.11.md` — 20 defensive plays, 10 per team
- `TORCH-CARDS-CATALOG-v0.1.md` — 21 Torch Cards (not yet implemented in gameplay)
- `torch_sim.py` — Python simulation engine. 1700 lines. Reference implementation for ALL game math. Validated across 3000 games.

### Engine (in `src/engine/`)
- `snapResolver.js` — Core play resolution. THE most important file. Ported from torch_sim.py.
- `gameState.js` — Full game loop manager with state transitions
- `aiOpponent.js` — 3-tier AI (Easy/Medium/Hard)
- `badgeCombos.js` — Badge trigger logic (tight triggers, big bonuses)
- `playHistory.js` — Consecutive run/pass tracking, PA bonuses
- `redZone.js` — Field position compression
- `ovrSystem.js` — Passive OVR modifiers
- `torchPoints.js` — Point tables for offense and defense
- `injuries.js` — Injury probability and healing
- `turnoverReturns.js` — INT/fumble return yards
- `test.js` — Console test runner (10 games)

### Data (in `src/data/`)
- `players.js` — All rosters (CT offense, CT defense, IR offense, IR defense, starters + bench)
- `ctOffensePlays.js` — 10 Canyon Tech offensive plays
- `irOffensePlays.js` — 10 Iron Ridge offensive plays
- `ctDefensePlays.js` — 10 CT defensive plays
- `irDefensePlays.js` — 10 IR defensive plays
- `torchCards.js` — 21 Torch Cards
- `badges.js` — Badge constants and SVG icons

### UI (in `src/ui/screens/`)
- `gameplay.js` — Main gameplay screen
- `coinToss.js` — Coin toss screen
- `endGame.js` — End game results
- `src/main.js` — App entry point and routing

### Research & Strategy (in Downloads or outputs)
- `TORCH-PROJECT-REVIEW.md` — Full project audit: architecture, market viability, 3000-game sim analysis, 16 blind spots
- `TORCH-RESEARCH-BRIEFS.md` — Briefs 1-5: onboarding, retention, target market, launch strategy, monetization
- `TORCH-RESEARCH-BRIEFS-6-10.md` — Briefs 6-10: sound design, addiction loops, content cadence, multiplayer, offseason strategy

---

## CRITICAL BALANCE NUMBERS (from 3000-game simulation)

### Run Stuff Rate
- Base: 30%, +10% strong run D, +5% moderate run D, -12% Cover 0 blitz, +8% bad matchup, +8% red zone inside 10, +4% red zone inside 20. Cap: 5-50%.

### Sack Rates
- Base from play data + 2% global + 3% coverage sack + 2-4% red zone. Deep vs corner blitz doubled. Cap: 0-30%.

### Completion Rates
- Base from play data + OVR mods. -8% bad matchup, -4% moderate counter, -5% red zone inside 10. Cap: 15-95%.

### Red Zone Compression
- Inside 20: -1 mean, -1 variance. Inside 10: -2 mean. Inside 5: -3 runs, +1 QB sneak, -1 universal, -2 variance.

### Trailing Team Bonus
- Down 7-13: +1 mean, +2 variance. Down 14+: +2 mean, +3 variance.

### Badge Combos (TIGHT triggers, BIG bonuses)
Each badge fires on 1-2 play types only. When they fire: +3-4 yards, 15-20 TORCH pts.
- FOOTBALL: ONLY deep passes. SPEED_LINES: ONLY deep passes. CLEAT: ONLY screens + rocket toss/zone read. HELMET: ONLY power runs (not draw). CLIPBOARD: ONLY play-action + option. GLOVE: ONLY short passes. CROSSHAIR: ONLY quick passes. BOLT: ONLY screens. BRICK: ONLY power runs + QB sneaks. FLAME: ONLY 3rd/4th down + conversions.

### AI Difficulty
- Easy: random + basic filters, -3 OVR, never combos, human gets +2 yards / CPU -1
- Medium: situational filters, normal OVR, 40% combo, tracks 2 plays
- Hard: 75% optimal counter + 25% random, +3 OVR, always combos, tracks full drive

### Simulation Results (3000 games)
- Teams balanced on Easy (52-48 CT/IR). IR favored Medium/Hard (32-68) due to passing having two failure modes (incomplete + sack) vs running having one (stuff).
- 6 explosive plays/game, 2.2 sacks/game, 0.7 2-min drill scores/game
- 65-70% one-score finishes, 33-39% comeback wins, 3-7% blowouts
- First scorer wins 70% of games (biggest remaining balance issue)

---

## WHAT TO BUILD NEXT (priority order)

### Immediate (fix bugs, ship to testers)
1. Fix defensive play auto-draft (5 unique cards, not 5 duplicates)
2. Fix Quick Play player draft (starters not bench)
3. Fix badge text in combo preview (show SVG icons)
4. Fix mobile scroll on player cards
5. Git commit, test 3 full games on mobile
6. Deploy v0.11.0: `vercel --prod`
7. Send to Discord group for testing (9 friends, EA CFB dynasty players)

### Short-term (after Discord feedback)
8. Pre-snap matchup preview ("Estimated: 6-10 yds ⚡ COMBO" or "⚠️ BAD MATCHUP")
9. Post-snap film breakdown ("Cover 3 leaves short middle open. Your slant exploited it.")
10. Sound design — yards counting up, touchdown horn, sack crunch, card tap sounds, badge combo chime
11. Haptic feedback on mobile (vibration for TDs, sacks, turnovers)
12. End-of-game share card (score + key stat + link)
13. Basic analytics (game_started, game_finished, game_result events)

### Medium-term (after proving retention)
14. Product A daily puzzle wrapper (one game/day, same seed for everyone, locked after play)
15. Weekly themes (Monday easy, Friday clutch, Saturday rivalry)
16. Torch Card implementation in gameplay
17. 2 more teams (Valley Ridge, Lakeshore State)
18. Halftime Booster shop
19. Conversion choice screen (XP / 2pt / 3pt)

### Long-term
20. Product B dynasty mode (roguelike season runs)
21. Async multiplayer (leaderboards → head-to-head challenges → live PvP)
22. Auto-generated replay clips for sharing
23. Play Call Challenge TikTok content series
24. Landing page + email collection
25. Dynasty Pass monetization ($2.99/month)

---

## VIRAL STRATEGY: PLAY CALL CHALLENGE

Two-video TikTok format:
- Video 1: Show game situation + "what do you call?" → comments argue
- Video 2 (24 hrs later): Show the result → drives follows

Target: EA College Football dynasty community during 2026 offseason (May-July).
Start posting before August season start. Full strategy in TORCH-PROJECT-REVIEW.md.

---

## DESIGN SYSTEM

```css
--gold: #F5B800;    /* Logo, wins, highlights */
--cyan: #00E5C0;    /* Stats, first downs */
--red: #F03030;     /* Danger, turnovers */
--orange: #FF5E1A;  /* Streak, fire */
--purple: #8B5CF6;  /* Daily badge */
--navy: #09081A;    /* Background */
--bg2: #0f0d24;     /* Card backgrounds */
--bdr: #1e1c3a;     /* Borders */
--muted: #3e3c60;   /* Secondary text */
--text: #e8e6ff;    /* Primary text */
```

Fonts: Bebas Neue (headers), Press Start 2P (pixel labels), Barlow Condensed (body).
No emoji in UI — use SVG icons or CSS badges.

---

## GIT CONVENTIONS
- `feat(engine): description` — new features
- `fix: description` — bug fixes
- `chore: description` — cleanup, docs
- `docs: description` — documentation only
- PATCH for fixes, MINOR for features, MAJOR for launch
- Only bump version number on production deploy
- Commit after every major change

---

## GEMINI CLI SETUP
If using Gemini CLI (gemini-cli or similar):
1. `cd ~/torch-football`
2. Point it at CLAUDE.md as the project context file
3. The first message should be: "Read CLAUDE.md, then read docs/TORCH-GAMEPLAY-SPEC-v0.13.md. Here are the current bugs to fix: [paste the 4 bugs above]"
4. Gemini can run the Python sim: `cd docs && python3 torch_sim.py 10 MEDIUM -v`
5. Gemini can run the JS test: `node src/engine/test.js`

---

## KEY DESIGN DECISIONS ALREADY MADE
- Both sides always go for it on 4th down (no punting/FG for v1)
- Ball starts at the 50 after every score
- OPTION counts as RUN for all badge purposes
- FLAME triggers on 3rd, 4th, AND conversions
- Challenge Flag challenges specific play elements (not a generic reroll)
- 20 plays per half (increased from 15)
- Hard CPU is 75% optimal counter, 25% random (not 100%)
- Easy CPU gets basic situational filters (no QB Sneak on 2nd & 12)
- Game never reveals what beats what — players learn by pattern recognition
- Pre-snap matchup preview should show estimated yards (not yet implemented)

---

## TESTING CONTACTS
- Discord group: 9 friends running EA College Football dynasty (primary testers)
- Previous testers: Pookie (completed flow, picked highest OVR), Meredith (got confused by scenario modal)
- Teresa Torres assumption tests to run:
  1. Can a non-football person figure out what to do?
  2. Does losing on Day 1 kill Day 2 return?
  3. What would you tell a friend this game is?
  4. Where did you get stuck or have to think?
