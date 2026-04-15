# TORCH — Ember Eight Season Framework

**Status:** Draft. April 13, 2026.
**Depends on:** TORCH-V2-SPEC.md (system design), TORCH-EMBER-EIGHT.md (team identities).
**Purpose:** Defines the full season structure, schedule generation, simulation engine, standings, and playoff format for the 8-team Ember Eight conference.

---

## Season Structure at a Glance

| Element | Value |
|---|---|
| Teams | 8 (Ember Eight conference) |
| Regular season | 7 games (full round-robin, every team plays every other team once) |
| Schedule order | Randomized each playthrough |
| Home/away | 3 home / 3 away / 1 neutral (week 7 Showcase) |
| Playoff | Seeds 1–2 bye to semis; seeds 3–6 play-in; reseeded 4-team CFP |
| Eliminated | Seeds 7–8 (no postseason) |
| Max games | 10 (seed 3–6 that wins it all: 7 regular + play-in + semi + championship) |
| Min games | 7 (seed 7–8, regular season only) |
| AI-vs-AI games | Resolved by simulation engine using tier-weighted probabilities |

---

## The Eight Teams (Reference)

| Seed Range | Team | Tier | Scheme |
|---|---|---|---|
| Contender | Larkspur Pronghorns | Top | TBD |
| Contender | Hollowridge Spectres | Top | Spread RPO |
| Mid-pack | Vermont Maples | Middle | TBD |
| Mid-pack | Helix Salamanders | Middle | TBD |
| Mid-pack | Coral Bay Dolphins | Middle | Spread Option |
| Mid-pack | Blackwater Serpents | Middle | Multiple/Pro |
| Underdog | Ridgemont Boars | Bottom | Power Spread |
| Underdog | Sacramento Raccoons | Bottom | TBD |

---

## Schedule Generation

### Rules

1. **Full round-robin.** Every team plays every other team exactly once. 28 total games across the league per season.
2. **Randomized order.** The 7-game schedule is shuffled each playthrough. No two seasons have the same week-by-week matchup order.
3. **Home/away assignment.** Weeks 1–6: each team gets 3 home and 3 away games. Assignment is randomized per season with the constraint that each game has exactly one home and one away team.
4. **Week 7: Ember Eight Showcase.** All 4 week-7 games are played at a neutral site (Phoenix). No home/away advantage. All 8 teams converge for the conference's signature event. Seeds lock after this week.
5. **No bye weeks.** 7 games played in 7 consecutive weeks. No dead weeks.
6. **No rivalry week.** The conference is brand new — rivalries haven't formed yet. This is the inaugural season. Rivalries emerge from play, not from schedule design.

### Algorithm (pseudocode)

```
1. Generate all 28 pairings (8 choose 2)
2. Assign pairings to 7 weeks such that no team plays twice in one week
   (This is a standard round-robin scheduling problem — 7 rounds of 4 games each)
3. Designate week 7 as the Showcase: all 4 games are neutral site
4. For weeks 1–6: randomly assign home/away per game
   Constraint: every team gets exactly 3 home and 3 away across weeks 1–6
5. Shuffle the player's schedule order (weeks 1–6 are randomized, week 7 is always the Showcase)
6. For each AI-vs-AI game: resolve via simulation engine
```

### The Ember Eight Showcase (Week 7)

- **Location:** Phoenix, Arizona (site of the founding Phoenix Summit)
- **Format:** All 4 final regular-season games played at one neutral venue
- **Narrative:** "The conference was born here. Now it proves itself here."
- **Gameplay:** No home/away modifier — true 50/50 for same-tier matchups
- **Stakes:** Final standings lock after this week. Playoff seeds are set.
- **Presentation:** Different visual treatment — Showcase branding, neutral crowd, bigger stage feel. All 4 games' results shown together as a single event recap.

### Schedule Presentation

The player sees a **season map screen** showing:
- All 7 weeks listed vertically
- Each week: opponent name, logo, home/away indicator, location flavor text
- Completed games show W/L result and score
- Current week is highlighted
- Tap any completed game to see box score / film room recap

---

## Simulation Engine (AI-vs-AI Results)

### Core Mechanic

Each AI-vs-AI game resolves using a weighted coin flip based on talent tier matchups.

### Base Win Probabilities (from TORCH-EMBER-EIGHT.md)

| Matchup | Favored team win % |
|---|---|
| Top vs Top | 50% |
| Top vs Middle | 70% |
| Top vs Bottom | 85% |
| Middle vs Middle | 50% |
| Middle vs Bottom | 70% |
| Bottom vs Bottom | 50% |

### Home/Away Modifier

Home team gets **+7%** win probability (mirrors real CFB home-field advantage, which is roughly 57/43 for evenly matched teams). **Week 7 Showcase games have no modifier** — neutral site.

Example: Top (home) vs Middle (away) → 70% + 7% = **77%** for Top team.
Example: Middle (home) vs Top (away) → 30% + 7% = **37%** for Middle team.
Example: Top vs Middle at Showcase → **70%** for Top team (no modifier).

Cap at 5% floor / 95% ceiling — upsets must always be possible, and no game is guaranteed.

### Score Generation

When an AI-vs-AI game resolves, generate a plausible score:
1. Determine effective tier for each team (base tier adjusted by cumulative roster progression)
2. Apply win probability based on effective tiers + home/away modifier (or neutral for Showcase/Championship)
3. Roll for winner
4. Winner's score: random from pool (21, 24, 27, 28, 31, 34, 35, 38, 42)
5. Margin of victory: weighted by effective tier gap
   - Same effective tier: tight game (3–10 point margin)
   - One tier apart: moderate (7–17 point margin)
   - Two tiers apart: blowout possible (14–28 point margin)
6. Loser's score: winner's score minus margin
7. Occasional upsets flip the script — an upset game uses same-tier margins regardless of actual tier gap

### Simulation Timing

AI-vs-AI games are **simulated week by week, not pre-rolled.** After the player completes their game each week, the other 3 AI-vs-AI games for that week are resolved.

**Why week-by-week matters:**
- AI team rosters progress over the season just like the player's roster. AI players earn stickers, gain sub-attribute points, and unlock stamps on a simplified progression curve.
- A top-tier team that loses early may develop slower (fewer sticker opportunities from wins). A bottom-tier team on a streak gets progressively stronger.
- Win probabilities shift slightly across the season as rosters improve — the base tier probabilities are the starting point, but by week 7 a well-developed middle-tier team could be playing at near-top-tier level.
- The league feels alive. Standings aren't predetermined — they emerge from 7 weeks of simulated play.

**AI Progression (simplified):**
- After each AI-vs-AI game, winning team's players get a small sub-attribute bump (~1-2 points distributed across the roster)
- Losing team's players get a smaller bump (~0.5-1 point)
- This is invisible to the player — they just see teams getting stronger/weaker through results
- AI progression does NOT include stamp acquisition (too complex for v1 — stamps are player-only)

**Simulation order each week:**
1. Player plays their game
2. Player sees their result + postgame (sticker spending, etc.)
3. The 3 other games for that week are simulated using current roster states
4. "Around the Ember Eight" shows all results
5. Standings update

---

## Standings

### Ranking Method

1. **Win-loss record** (primary)
2. **Head-to-head result** (first tiebreaker — did you beat the team you're tied with?)
3. **Point differential** (second tiebreaker)
4. **Points scored** (third tiebreaker)
5. **Coin flip** (final tiebreaker — should almost never reach this in an 8-team round-robin)

### Standings Display

The player sees a **standings table** accessible from the season map:
- All 8 teams listed by rank
- Columns: Rank, Team, W-L, PF (points for), PA (points against), DIFF
- Player's team highlighted
- Playoff seeds annotated: 🏆 = bye (1–2), ⚔️ = play-in (3–6), ❌ = eliminated (7–8)
- Updates after each week's results are revealed

---

## Playoff Format

### Structure (from V2 spec, locked)

```
PLAY-IN ROUND (Week 8)
  Game A: #3 seed vs #6 seed
  Game B: #4 seed vs #5 seed

CFP SEMIFINALS (Week 9) — Reseeded
  Game C: #1 seed vs lowest surviving seed
  Game D: #2 seed vs highest surviving seed

EMBER EIGHT CHAMPIONSHIP (Week 10)
  Game E: Winner of C vs Winner of D
```

### Reseeding Logic

After the play-in round, the 4 remaining teams are reseeded by their original regular-season seed. The #1 seed always plays the lowest remaining seed.

Example: If #3 and #5 win the play-in:
- Semi 1: #1 vs #5 (lowest surviving)
- Semi 2: #2 vs #3 (highest surviving)

Example: If #3 and #4 win the play-in:
- Semi 1: #1 vs #4
- Semi 2: #2 vs #3

### Playoff Home/Away

- **Play-in games:** Higher seed hosts (home field advantage)
- **Semifinals:** Higher seed hosts (home field advantage)
- **Championship:** Neutral site — back in Phoenix at the Showcase venue. The season begins and ends in Phoenix.

### Player Scenarios

| Regular season seed | Playoff path |
|---|---|
| 1st or 2nd | Bye week 8 → Semi week 9 → Championship week 10 (if win) |
| 3rd through 6th | Play-in week 8 → Semi week 9 (if win) → Championship week 10 (if win) |
| 7th or 8th | Season over. End-of-season summary screen. |

### AI Playoff Resolution

If the player is eliminated (7th/8th), the remaining playoff games are simulated using the same engine. The player sees bracket results and the eventual champion. This matters — you want the player to care about who won even if they didn't make it. "Larkspur won it. Of course they did. Next season I'm taking them down."

If the player is on a bye (1st/2nd), the play-in games are simulated to determine their semifinal opponent. The player sees the play-in results before their semifinal game.

---

## Season Flow (Week by Week)

### Weeks 1–6 (Regular Season)

```
1. PREGAME
   - Season map: highlight this week's game
   - Opponent preview: team name, record, tier hint, home/away
   - (Future: scouting report purchasable with TORCH points)

2. GAME
   - Full gameplay session (existing engine)
   - Home/away mechanic active

3. POSTGAME
   - Result screen: W/L, score, player of the game
   - Sticker earnings + spending (between-games screen)
   - Stamp purchases for eligible players

4. LEAGUE UPDATE
   - "Around the Ember Eight" — show this week's other results
   - Updated standings table
   - Advance to next week
```

### Week 7 (Ember Eight Showcase)

```
1. SHOWCASE INTRO
   - Special presentation: "Welcome to Phoenix. The Ember Eight Showcase."
   - All 4 matchups shown — the player sees the full day's slate
   - Neutral site: no home/away advantage

2. GAME
   - Full gameplay session
   - Neutral crowd audio (mixed, no home-field energy)

3. POSTGAME
   - Result screen + sticker spending (last between-games before playoffs)
   - All 4 Showcase results revealed together
   - Final standings lock — playoff seeds announced
   - Bracket reveal: who's in, who's out, who has a bye
```

### Week 8 (Play-In Round)

- If seed 3–6: play your play-in game
- If seed 1–2: bye week — show play-in results, then advance to semis
- If seed 7–8: season over — show end-of-season summary

### Week 9 (Semifinals)

- If still alive: play semifinal
- If eliminated: watch from the couch (show simulated results + bracket)

### Week 10 (Championship)

- If still alive: play the Ember Eight Championship Game
- If eliminated: show champion reveal

### End of Season

- Final standings
- Coach record summary
- Player development recap (who grew the most, best stamp moments)
- "The Ember Eight's inaugural champion is..." reveal
- Hook: "Season 2 is coming. Your coach remembers everything." (multi-season tease, not built yet)

---

## Resolved Design Decisions (Formerly Open)

### 1. Home/Away Gameplay Mechanic
**AI difficulty shift.** The AI plays smarter defense at home — better play selection, higher counter rate. The player's roster is not debuffed on the road; the opposing defense is simply sharper in front of their home crowd. This mirrors real football's 12th-man effect (communication disruption, crowd energy fueling defensive intensity) without adding invisible stat penalties.

### 2. Helix Team Identity
**Fully designed.** Helix Salamanders, Houston area, Texas. Coach Marcus Chen (alive, semi-retired, teaches probability theory at the university). Middle tier. Identity: "uncomfortable admiration for a withdrawn genius who could help but won't volunteer." See focused planning session for full profile.

### 3. Scheme Assignments for New Teams
**Placeholders for now.** Vermont, Helix, Larkspur, and Sacramento need offensive/defensive scheme identities. Deferred — football identity comes after the season framework is locked. The original 4 teams retain their schemes: Ridgemont (Power Spread), Coral Bay (Spread Option), Hollowridge (Spread RPO), Blackwater (Multiple/Pro).

### 4. "Around the Ember Eight" Presentation
**Broadcast + newspaper hybrid.**
- **Broadcast layer:** Scores animate in one at a time with team logos. "Game of the Week" highlight with a one-sentence simulated play-by-play moment. Standings slide in with movement arrows. GSAP-driven, premium feel.
- **Newspaper layer:** A fictional beat writer's editorial headline about the week's biggest result ("SACRAMENTO STUNS LARKSPUR IN WEEK 4 UPSET"). One-line editorial take at the bottom. Player of the Week callout. Printed-style standings table with seed indicators.
- **The spectacle sells the moment. The editorial makes you care about teams you didn't play this week.**

### 5. Bye Week Experience (Seeds 1–2)
**Watch + develop.** Two-part bye week:
1. **Scouting:** Play-in games shown in expanded broadcast-style recap with more detail than a normal weekly update. The player is watching to learn who their semifinal opponent will be.
2. **Bonus development session:** Extra between-games spending screen. Players get a free week of sticker spending while play-in teams burn energy in an extra game. This is the tangible reward for earning the bye.

### 6. Season Save/Load
**One active save.** One season at a time. Player must finish or abandon their current season before starting a new one. Completed seasons are stored as career history (coach record, team, final standing) but the save slot is freed for a new season.

---

## Implementation Notes for Claude Code

- Schedule generation is a pure function: `generateSchedule(playerTeamId, rngSeed)` → returns 7 weeks of matchups with home/away/neutral assignments
- AI-vs-AI games are simulated after the player completes their game each week via `simulateWeek(weekNum, seasonState)` → resolves remaining games using current roster states
- AI roster progression tracked in season state: simplified sub-attribute growth per team after each game
- Standings are derived from accumulated results, not stored separately
- Playoff bracket is derived from final standings after week 7
- Playoff games (AI-vs-AI) simulated on demand as the player advances through the bracket
- Season state persists in localStorage (extend existing save system)
- Championship game uses neutral-site rules (no home modifier) — same as Showcase
