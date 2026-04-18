# TORCH Football

![Version](https://img.shields.io/badge/version-0.40.1-EBB010?style=flat-square)
![Status](https://img.shields.io/badge/status-Live-brightgreen?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Web%20(Mobile%20First)-blue?style=flat-square)
![License](https://img.shields.io/badge/license-Private-gray?style=flat-square)

**Balatro meets college football.** Call plays. Read defenses. Spend your score.

[**Play Now**](https://torch.football/) | [Releases](https://github.com/brockbedard/torch/releases)

---

## The Pitch

TORCH is a mobile-first card game where every snap is a tactical puzzle. Pick a play card. Pick a player card. Match up against the AI's defensive scheme. Smart reads produce explosive gains — bad matchups get you stuffed.

**The twist:** Your TORCH points are your score AND your wallet. Spend them on power-up cards from The Booster to gain an edge — or save them for a higher final tally. Every purchase is a gamble.

8 fictional college teams in the Ember Eight conference. The team you pick changes the game you play — different playbooks, player traits, scheme advantages, and counter matchups.

## The Ember Eight

| Tier | School | Team | Scheme | Identity |
|------|--------|------|--------|----------|
| **POWERHOUSE** | Larkspur State | **Pronghorns** | Triple Option | Ground game. Discipline. Relentless. |
| **POWERHOUSE** | Hollowridge State | **Spectres** | Spread RPO | Quick throws. Tempo. Outscore everyone. |
| **CONTENDER** | Vermont, St. Marlowe | **Maples** | West Coast | Precise. Intellectual. Short-to-intermediate. |
| **CONTENDER** | Helix University | **Salamanders** | Run & Shoot | Four-wide. Audibles. Pure passing. |
| **CONTENDER** | Coral Bay | **Dolphins** | Spread Option | QB runs. Zone read. Speed kills. |
| **CONTENDER** | Blackwater | **Serpents** | Multiple/Pro | Unpredictable. Disguise. Adapt. |
| **UNDERDOG** | Ridgemont | **Boars** | Power Spread | Smash-mouth. Physical. Patient. |
| **UNDERDOG** | Sacramento | **Raccoons** | Wishbone | Triple option. Misdirection. Chaos. |

Each team has a 20-play scheme playbook, weighted card draw pools, 14-player roster with unique traits, and an 8-way counter matrix that determines matchup advantages.

## Key Features

- **160 play cards** across 8 scheme-specific playbooks with real football concepts
- **112 players** across 8 rosters with star ratings and traits
- **24 TORCH cards** — Gold/Silver/Bronze power-ups you buy with your score
- **The Booster** — card shop at halftime, after TDs, turnovers, and big stops
- **8-card hand** — 4 plays + 4 players visible simultaneously, with carry-over and discard
- **Special teams burn deck** — choose who kicks, punts, and returns (they're burned for the game)
- **Counter matrix** — 8-way rock-paper-scissors between team schemes
- **Cinematic pregame** — matchup slam, 3D coin toss, kickoff sequence
- **User-biased presentation** — green = good for you, red = bad. Always.
- **Broadcast-style UI** — ESPN-inspired scorebug, TD celebrations, score animations
- **3 difficulty levels** — Easy/Medium/Hard with AI play selection and TORCH card usage
- **Red zone onboarding** — first-time players start at the 9-yard line with a tutorial

## TORCH Cards

Your score is your wallet. Buying power costs points.

| Tier | Examples | Cost Range |
|------|----------|------------|
| **Gold** | Scout Team (see opponent's play), Sure Hands (cancel turnover) | 150-200 pts |
| **Silver** | Deep Shot (2x pass yards), Truck Stick (2x run yards), Challenge Flag (reroll snap) | 20-120 pts |
| **Bronze** | Play Action (+5 vs run D), 12th Man (+4 yds + 2x points), Ice (zero opponent OVR) | 15-60 pts |

## Tech

Built with Vite + vanilla JavaScript. No framework. ~36K lines across 95 source files.

```bash
git clone https://github.com/brockbedard/torch.git
cd torch && npm install
npx vite --host    # localhost:5173
```

| Layer | Stack |
|-------|-------|
| Frontend | Vanilla JS, HTML5 Canvas 2D, GSAP 3.14 |
| Fonts | Self-hosted via @fontsource (Teko, Rajdhani, Barlow Condensed, Oswald + 9 team wordmark faces) |
| Audio | Howler.js, self-hosted MP3 |
| Engine | Custom gaussian snap resolver, 4-layer personnel system, 8-way counter matrix |
| Icons | game-icons.net (CC BY 3.0), IconScout |
| Hosting | Vercel (auto-deploy on push) |
| Testing | Engine smoke test, balance sim, full game sim, persistence + UI logic tests |

## Environments

| Environment | Branch | URL |
|---|---|---|
| Local | `dev` | `localhost:5173` |
| Preview | `dev` | Auto-generated per push |
| Production | `main` | [torch.football](https://torch.football/) |

## Development

```bash
npm run dev                  # Local dev with hot reload (Vite)
npm test                     # Full test suite
localhost:5173/?dev          # Dev panel (force results, give cards, apply state)
```

Full architecture docs, engine specs, and design system in [CLAUDE.md](CLAUDE.md).

## Current Version

**v0.40.1 "Ember Eight"** — Polish pass on top of the 4→8 expansion. Pregame screens (coin toss → card pick → reveal) refactored into flex-centered phase groups so they sit dead-center on any phone height. Kickoff result overlay rebuilt with the team's signature wordmark, badge, and broadcast-style entrance. Toss result stamp unified across user-win and AI-win paths. Scorebug stats tap fixed in the second half. Discard + conversion tap-spam guards. Null safety on `snapResolver` / `turnoverReturns` / `getTeam`. Shop sheet migrated to GSAP. Audio crowd intensity now sustains inside the red zone and on goal-to-go.

**v0.40.0 "Ember Eight"** — The Ember Eight expansion. 4→8 teams with full playbooks, rosters, and counter matrix. Cinematic team select with tier filtering. Per-team wordmark typography. Mobile-prep phases 1-3: audio compression (220→7 MB), self-hosted fonts, safe-area + dvh viewport, Capacitor-ready haptics and storage facades.

---

Built by [@brockbedard](https://github.com/brockbedard). Football research sourced from USA Football ADM, RRQB Training, and real college scheme analysis.
