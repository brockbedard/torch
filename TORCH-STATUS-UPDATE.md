# TORCH-STATUS-UPDATE

**Generated:** 2026-04-15 · `dev` branch, 7 commits ahead of `main`.

---

## Build version

| Source | Value |
|---|---|
| `package.json` | `0.40.0` |
| `src/state.js` VERSION | `0.40.0` |
| `src/state.js` VERSION_NAME | `Ember Eight` |
| Last git tag | `v0.37.0` (on `main`) |
| Current branch | `dev` |
| Production (`torch.football`) | v0.37.0 "Fresh Paint" (main unchanged) |
| Preview (`dev` on Vercel) | `7339cb1` |
| Smoke status | **1382 / 1382 passing** |

v0.40.0 "Ember Eight" is staged on `dev` but not yet shipped to `main`.

---

## What shipped since v0.36.1

### On `main` as v0.37.0 "Fresh Paint" (shipped)

| Commit | Change |
|---|---|
| 865492d | fix: remove auto-fullscreen + team card scale-on-select |
| 34bdb7a | feat(roster): tighter team identity strip + symmetric OFF/DEF headers |
| 0858b6f | fix(roster): align flame pips across all player rows |
| 68bf114 | docs: refresh CLAUDE.md, README.md after v0.36.1 audit |
| 31ffb4d | fix: vertical football-O positioning + tight viewBox crop |
| 6d04d01 | feat: fix football-O positioning + upgrade 11 flame silhouettes to 4-layer |
| f6beee5 | fix: football-O em-based sizing, matches Teko cap height |
| 1b27f0c | revert: remove football-O, restore plain TORCH text |
| 7fe5d7a | fix: flame sizing/spacing audit — revert small flames to silhouette |
| f8b2408 | feat: replace crude football ellipse with 9-layer leather SVG on receive kickoff card |
| 33ee914 | feat: replace Spectres stag with ghost mascot from IconScout |
| c7fabdd | ui: drop circle background from team mascot badges |
| d6a665e | feat: replace Dolphins wolf with pink gradient dolphin from IconScout |
| 274c7fe | feat: replace Serpents snake with coiled serpent from IconScout |
| c265e01 | **v0.37.0 "Fresh Paint" — team logo gradients + weather icon upgrade** |

### On `dev` as v0.40.0 "Ember Eight" (WIP, not yet merged to main)

| Commit | Change |
|---|---|
| fab9139 | feat: ember eight foundation — 8 teams + 112 players + counter matrix |
| 3671f3d | feat: ember eight 8-team UI integration — playbooks, screens, wordmarks (team select rebuilt as vertical hero carousel w/ tier filter + hold-to-coach; wordmark system across 9 display typefaces; version bump to 0.40.0) |
| cff1b1b | feat: helmet generator tool — live tuner, path overrides, PNG/SVG exports (`/mockups/helmets.html`) |
| b3cf8ef | chore: gitignore Claude Code personal + runtime files |
| 7910509 | perf: shrink audio 220→7 MB, self-host Ember Eight fonts (mobile-prep phase 1 — transcode 77 WAVs→MP3, archive 60 MB raw WAVs, remove 9 Google Fonts CDN links) |
| f211ed1 | feat: mobile-app prep phase 2+3 — safe-area-inset + 100dvh on 7 screens, Capacitor-ready haptics + storage facades |
| ffbcad2 | chore: repo cleanup — archive exploration, classify WIP, refresh CLAUDE.md (19 mockups triaged, Season 2 scope parked, archive/ committed once) |
| 7339cb1 | perf: audio lazy-load (7 rarely-used pools `preload: false`) + drop unused react deps + repair 3 tdEruption MP3 refs that phase 1 missed + commit logo-variants.html design tool |

---

## Current state of major systems

| System | State |
|---|---|
| **Stamps** (player traits) | unchanged |
| **Stickers** (helmet decals) | shipped as `/mockups/helmets.html` generator tool; configs NOT yet baked into teams.js |
| **Commentary** | unchanged |
| **Kickoff ritual** (v0.36.0) | unchanged |
| **Personnel system** (v0.27.0) | unchanged |
| **Audio** | modified — all shipped audio now MP3 @ 128kbps, 6.9 MB total; 7 rare pools lazy-loaded; haptics routed through `Haptic.*` facade with Capacitor detection |
| **UI (team select)** | full rewrite — vertical hero carousel, tier filter (POWERHOUSE / CONTENDER / UNDERDOG), hold-to-coach 1.4s, per-team wordmark via Google Fonts (now self-hosted) |
| **UI (other screens)** | pregame / gameplay / halftime / endGame / seasonRecap / roster all modified for 8 teams; safe-area-inset and 100dvh added to home / dailyDrive / settings / cardMockup / seasonRecap / teamCreator |
| **Helmet renderer** | new at `src/assets/helmets/renderHelmet.js` — base Adobe Stock #186214272, path-role overrides, Capacitor-ready |
| **Wordmark system** | new — `src/data/teamWordmarks.js` + `src/ui/teamWordmark.js`, 9 fonts per team, self-hosted via `@fontsource` |
| **Storage** | new facade `src/engine/storage.js` — wraps `torch_career_stats`, `torch_achievements`, `torch_team_records`, `torch_streaks`, `torch_game_history`. Casual keys (mute, dev, tooltips) stay on raw localStorage |
| **Tests** | smoke 1382/1382 passing (±3 fluctuation from randomized snap simulation) |

---

## Actively in progress (uncommitted)

| Item | Path | State |
|---|---|---|
| Homepage research doc | `docs/TORCH-HOMEPAGE-RESEARCH.md` | written, untracked |
| Homepage archetype mockups | `public/mockups/home-{a-stadium,b-program,c-locker,d-broadcast,e-coin,index}.html` | 6 files, all untracked |
| App icon monograph Vol II | `public/mockups/app-icons-v2.html` | written, untracked (5 team-select-inspired concepts) |
| App icon monograph Vol I | `public/mockups/app-icons.html` | status unclear — shows as untracked but was written this session (6 concepts) |
| Helmet design configs | — | not yet baked into `src/data/teams.js` `helmet` blocks |
| Walkthrough of 8-team game | — | user has not completed end-to-end playthrough of v0.40.0 |

---

## What's broken or blocked

None tracked. No failing tests. No known crashes.

**Observed during this session:**
- Phase 1 audio regex missed 3 crowd files with `#`/`-` in names (Stadium_crowd_celebr_#3, Outdoor_American_foo_#2/#3). Repaired in commit 7339cb1.
- Gemini MCP server disconnected mid-session (deep research query could not be retrieved).

**Pre-existing warnings (not new):**
- Vite reports one chunk > 500 KB; build passes with warning.
- `src/engine/audioManager.js` dynamically + statically imported (ineffective dynamic-import warning).

---

## Files changed recently

### Git log (last 20)
```
7339cb1 perf: audio lazy-load + drop unused react deps + repair tdEruption + commit logo-variants tool
ffbcad2 chore: repo cleanup — archive exploration, classify WIP, refresh CLAUDE.md
f211ed1 feat: mobile-app prep phase 2+3 — safe-area, dvh, haptics & storage facades
7910509 perf: shrink audio 220→7 MB, self-host Ember Eight fonts (mobile-prep phase 1)
b3cf8ef chore: gitignore Claude Code personal + runtime files
cff1b1b feat: helmet generator tool — live tuner, path overrides, exports
3671f3d feat: ember eight 8-team UI integration — playbooks, screens, wordmarks
fab9139 feat: ember eight foundation — 8 teams + 112 players + counter matrix
c265e01 v0.37.0 "Fresh Paint" — team logo gradients + weather icon upgrade
274c7fe feat: replace Serpents snake with coiled serpent from IconScout
d6a665e feat: replace Dolphins wolf with pink gradient dolphin from IconScout
c7fabdd ui: drop circle background from team mascot badges
33ee914 feat: replace Spectres stag with ghost mascot from IconScout
f8b2408 feat: replace crude football ellipse with 9-layer leather SVG on receive kickoff card
7fe5d7a fix: flame sizing/spacing audit — revert small flames to silhouette
1b27f0c revert: remove football-O, restore plain TORCH text
f6beee5 fix: football-O now em-based sizing, matches Teko cap height
6d04d01 feat: fix football-O positioning + upgrade 11 flame silhouettes to 4-layer
31ffb4d fix: vertical football-O positioning + tight viewBox crop
68bf114 docs: refresh CLAUDE.md, README.md after v0.36.1 audit
```

### `git diff --stat main..dev` summary

**Total:** 666 files changed, +99,640 / -2,821 (archive directory is ~87k lines of historical reference material).

**Engine modifications:**
- `src/engine/audioManager.js` (+90) — lazy-load opts, MP3 paths
- `src/engine/haptics.js` (+101) — Capacitor detection facade
- `src/engine/storage.js` (+56, new) — JSON get/set facade
- `src/engine/careerStats.js`, `gameHistory.js`, `achievements.js`, `streaks.js`, `aiOpponent.js` — routed through storage facade / small tweaks
- `src/state.js` (+52) — version bump, misc

**UI screen modifications:**
- `src/ui/screens/teamSelect.js` (+753) — full rewrite (vertical hero carousel)
- `src/ui/screens/pregame.js` (+170) — 8-team support
- `src/ui/screens/gameplay.js` (+63), `endGame.js` (+32), `seasonRecap.js` (+39), `halftime.js` (+25) — 8-team data flow
- `src/ui/screens/roster.js`, `settings.js`, `home.js`, `dailyDrive.js`, `cardMockup.js`, `teamCreator.js` — safe-area-inset + dvh additions
- `src/ui/teamWordmark.js` (+86, new), `src/utils/helmetLayers.js` (+41, new)

**Data:**
- 4 new playbooks: `maplesPlays.js`, `pronghornsPlays.js`, `raccoonsPlays.js`, `salamandersPlays.js`
- 4 existing playbooks heavy-rewritten: `sentinelsPlays.js`, `wolvesPlays.js`, `stagsPlays.js`, `serpentsPlays.js`
- `teams.js`, `teamIdentity.js` (new), `teamWordmarks.js` (new), `players.js` (rewritten for 112 players)

**Tests:** balanceTest, gameSimTest, smokeTest — small 8-team additions.

---

## New / updated project docs

### New, committed on dev
- `docs/TORCH-EMBER-EIGHT-BIBLE.md` — conference lore + team identity + ghost coaches (source of truth for world-building)
- `docs/TORCH-EMBER-EIGHT-DESIGN-PROPOSAL.md` — original 4→8 design pitch
- `docs/EMBER-EIGHT-MATRIX-AND-RATINGS.md` — counter-play matrix + tier ratings
- `docs/EMBER-EIGHT-PLAYBOOKS.md` — per-team offensive + defensive scheme detail
- `docs/EMBER-EIGHT-ROSTERS.md` — 112-player roster specifications
- `docs/HELMET-GENERATOR-RESEARCH.md` — research that preceded the helmet generator build
- `docs/TORCH-WORDMARK-SYSTEM.md` — wordmark font mapping + usage

### New, untracked (this session)
- `docs/TORCH-HOMEPAGE-RESEARCH.md` — synthesized research report on mobile card game home screens (Balatro, Slay the Spire, ESPN 2024 rebrand, CF visual vocabulary); 5 home archetypes + recommended direction.

### Updated
- `CLAUDE.md` — refreshed in commit `ffbcad2` with v0.40.0 entry, "8 teams (Ember Eight)" in header, Ember Eight tier table, internal-ID mismatch note.

---

## CLAUDE.md drift check

### Correct
- Header: "8 fictional college teams (the Ember Eight conference)" ✓
- Version block: v0.40.0 "Ember Eight" WIP entry at top ✓
- "The Ember Eight" section with tier table + internal-ID legacy note ✓
- Shipping target for iOS + Android called out ✓
- References to `docs/TORCH-EMBER-EIGHT-BIBLE.md` + memory: Mobile App Shippability ✓

### Stale references (still say 4 teams / 56 players)

| Line | Current text | Should be |
|---|---|---|
| 70 (File Structure table, `src/data/` row) | "4 teams, 56 players, 80 plays (4 × `*Plays.js`)" | 8 teams, 112 players, 8 × `*Plays.js` |
| 323 (Personnel System — Player Data Model) | "56 players (4 teams × 14: 7 OFF + 7 DEF)" | 112 players (8 teams × 14) |
| 401 (Locked Design Decisions) | "4 teams, no draft. Predetermined squads and playbooks." | 8 teams, no draft |

### Also drift-risk (not yet updated but probably should be soon)
- "## The 4 Teams" — renamed to "## The Ember Eight" ✓ but legacy 4-team scheme table still present below. Accurate for those 4 teams, but needs a companion table for the 4 new teams (Maples, Pronghorns, Salamanders, Raccoons) pointing to the bible.
- Smoke-test counts referenced in older version entries say 815/815, 821/821 — those were for v0.37.0 / v0.36.1; current 1382/1382 is for v0.40.0 and isn't reflected anywhere in CLAUDE.md.

### Home screen / app icon mockups
The `public/mockups/` tree has grown substantially (app-icons.html, app-icons-v2.html, helmets.html, home-a-stadium/b-program/c-locker/d-broadcast/e-coin/index.html) — none of these are referenced in CLAUDE.md. Not yet incorporated into docs.
