# TORCH Football

![Version](https://img.shields.io/badge/version-0.36.1-EBB010?style=flat-square)
![Status](https://img.shields.io/badge/status-Live-brightgreen?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Web%20(Mobile%20First)-blue?style=flat-square)
![License](https://img.shields.io/badge/license-Private-gray?style=flat-square)

**Balatro meets college football.** Call plays. Read defenses. Spend your score.

[**Play Now**](https://torch.football/) | [Releases](https://github.com/brockbedard/torch/releases)

---

## The Pitch

TORCH is a mobile-first card game where every snap is a tactical puzzle. Pick a play card. Pick a player card. Match up against the AI's defensive scheme. Smart reads produce explosive gains — bad matchups get you stuffed.

**The twist:** Your TORCH points are your score AND your wallet. Spend them on power-up cards from The Booster to gain an edge — or save them for a higher final tally. Every purchase is a gamble.

4 fictional college teams with real offensive scheme identities. The team you pick changes the game you play, not just the colors on screen.

## Teams

| | Team | Scheme | Run/Pass | Identity |
|--|------|--------|----------|----------|
| **Ridgemont** | **Boars** | Power Spread | 55/45 | Smash-mouth. Physical. Patient. |
| **Coral Bay** | **Dolphins** | Spread Option | 50/50 | QB runs. Zone read. Speed kills. |
| **Hollowridge** | **Spectres** | Air Raid | 30/70 | Quick throws. Tempo. Outscore everyone. |
| **Blackwater** | **Serpents** | Multiple/Pro | 45/55 | Unpredictable. Disguise. Adapt. |

Each team has a weighted draft pool, formation tendencies, and unique animation style based on real college football archetypes (Georgia, Oregon, Mike Leach's Air Raid, Nick Saban's multiple looks).

## Key Features

- **80 play cards** with real football concepts — not random names
- **56 players** across 4 rosters with OVR ratings and abilities
- **25 TORCH cards** — Gold/Silver/Bronze power-ups you buy with your score
- **The Booster** — card shop at halftime, after TDs, turnovers, and big stops
- **Full Football Engine**: Safeties, Overtime, Onside Kicks, and consistent conversion logic.
- **User-biased presentation** — green = good for you, red = bad. Always. The commentary, timing, visual weight, and ambient mood are all on your side
- **Broadcast-style UI** — ESPN-inspired possession changes, TD celebrations with confetti
- **Scheme identity** — team selection changes your playbook, card draw weights, and field animations
- **Conference Season Mode** with card and point persistence
- **Red zone onboarding** — first-time players start at the 9-yard line with a tutorial

## TORCH Cards

Your score is your wallet. Buying power costs points.

| Tier | Examples | Cost Range |
|------|----------|------------|
| **Gold** | Scout Team (see opponent's play), Sure Hands (cancel turnover) | 180-200 pts |
| **Silver** | Deep Shot (2x pass yards), Truck Stick (2x run yards), Challenge Flag (reroll snap) | 75-120 pts |
| **Bronze** | Play Action (+5 vs run D), 12th Man (+4 yds + 2x points), Ice (zero opponent OVR) | 30-50 pts |

## Tech

Built with Vite + vanilla JavaScript. No framework. ~31K lines across 84 source files.

```bash
git clone https://github.com/brockbedard/torch.git
cd torch && npm install
npx vite --host    # → localhost:5173
```

| Layer | Stack |
|-------|-------|
| Frontend | Vanilla JS, HTML5 Canvas 2D, GSAP |
| Fonts | Teko, Rajdhani, Barlow Condensed, Oswald |
| Audio | Howler.js + ElevenLabs voice samples + jsfxr fallbacks |
| Engine | Custom gaussian snap resolver + 4-layer personnel system |
| Icons | game-icons.net (CC BY 3.0) |
| Hosting | Vercel |
| Testing | 821 engine assertions + 12-combination balance test + game sim |

## Environments

| Environment | Branch | URL |
|---|---|---|
| Local | `dev` | `localhost:5173` |
| Preview | `dev` | Auto-generated per push |
| Production | `main` | [torch.football](https://torch.football/) |

## Development

```bash
npx vite --host              # Local dev with hot reload
localhost:5173/?dev           # Activate dev panel (force results, give cards, apply state)
```

Full architecture docs, engine specs, and design system in [CLAUDE.md](CLAUDE.md).

## Current Version

**v0.36.1 "Spring Cleaning"** — Refactor + dead-code pass with no behavior changes. Extracted ~260 lines of inline CSS from `gameplay.js` into a sibling module, consolidated team-specific TD celebration config into `teams.js`, moved icon files into a new `src/assets/icons/` directory, deleted ~70 lines of unreferenced legacy code, archived design mockups and audit drafts. Engine smoke 821/821, balance green. [Full changelog](https://github.com/brockbedard/torch/releases/tag/v0.36.1).

**v0.36.0 "Kickoff Ritual"** — Cinematic 3-beat pregame runway (Matchup Slam → Coin Toss → Kickoff). 4-layer flame SVG and 9-layer leather football SVG overhaul across 13 files. Routing flipped: team select → Meet The Squads → runway → gameplay. [Changelog](https://github.com/brockbedard/torch/releases/tag/v0.36.0).

---

Built by [@brockbedard](https://github.com/brockbedard). Football research sourced from USA Football ADM, RRQB Training, and real college scheme analysis.
