# TORCH Football

![Version](https://img.shields.io/badge/version-0.25.2-EBB010?style=flat-square)
![Status](https://img.shields.io/badge/status-Active%20Development-brightgreen?style=flat-square)
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
| **Northern Pines** | **Wolves** | Spread Option | 50/50 | QB runs. Zone read. Speed kills. |
| **Crestview** | **Stags** | Air Raid | 30/70 | Quick throws. Tempo. Outscore everyone. |
| **Blackwater** | **Serpents** | Multiple/Pro | 45/55 | Unpredictable. Disguise. Adapt. |

Each team has a weighted draft pool, formation tendencies, and unique animation style based on real college football archetypes (Georgia, Oregon, Mike Leach's Air Raid, Nick Saban's multiple looks).

## Key Features

- **80 play cards** with real football concepts — not random names
- **52 players** across 4 rosters with OVR ratings and abilities
- **12 TORCH cards** — Bronze/Silver/Gold power-ups you buy with your score
- **The Booster** — card shop at halftime, after TDs, turnovers, and big stops
- **User-biased presentation** — green = good for you, red = bad. Always. The commentary, timing, visual weight, and ambient mood are all on your side
- **Broadcast-style UI** — ESPN-inspired possession changes, TD celebrations with confetti
- **Scheme identity** — team selection changes your playbook, card draw weights, and field animations
- **3-game seasons** with card and point persistence
- **Red zone onboarding** — first-time players start at the 9-yard line with a tutorial

## TORCH Cards

Your score is your wallet. Buying power costs points.

| Tier | Examples | Cost Range |
|------|----------|------------|
| **Gold** | Scout Team (see opponent's play), Sure Hands (cancel turnover) | 180-200 pts |
| **Silver** | Deep Shot (2x pass yards), Truck Stick (2x run yards), Challenge Flag (reroll snap) | 75-120 pts |
| **Bronze** | Play Action (+5 vs run D), 12th Man (+4 yds + 2x points), Ice (zero opponent OVR) | 30-50 pts |

## Tech

Built with Vite + vanilla JavaScript. No framework. ~16K lines across 67 source files.

```bash
git clone https://github.com/brockbedard/torch.git
cd torch && npm install
npx vite --host    # → localhost:5173
```

| Layer | Stack |
|-------|-------|
| Frontend | Vanilla JS, HTML5 Canvas 2D |
| Fonts | Teko, Rajdhani, Barlow Condensed |
| Audio | Howler.js + jsfxr |
| Engine | Custom gaussian snap resolver with coverage modifiers |
| Icons | game-icons.net (CC BY 3.0) |
| Hosting | Vercel |
| Testing | 639 automated assertions + 1200-drive balance test |

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

**v0.25.2** — 12 TORCH cards, economy rebalance, user perspective bias, broadcast UI, red zone onboarding, automated testing. [Full changelog](https://github.com/brockbedard/torch/releases/tag/v0.25.2).

---

Built by [@brockbedard](https://github.com/brockbedard). Football research sourced from USA Football ADM, RRQB Training, and real college scheme analysis.
