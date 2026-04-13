# TORCH v2 — Build Plan

**Goal:** Smallest playable v2 prototype that your Discord friends can play in a season loop.
**Constraint:** Ship to testers within 2-3 weeks of starting, not 2-3 months.
**Principle:** Build the loop first, expand content later.

---

## What the prototype IS

A 7-game season mode using the existing 4 teams (Boars, Dolphins, Spectres, Serpents) with the new stamp system, sub-attributes, and helmet sticker economy. One team (player's choice), 7 games against the other 3 teams (rotating), a simple bracket at the end.

## What the prototype IS NOT

- Not 8 teams (the 4 new teams are content, not structure)
- Not the Ember Eight conference lore in-game (that's presentation, not mechanics)
- Not coach creators or avatars (that's onboarding, not the loop)
- Not the full stamp library (start with RB/FB stamps only, other positions use flat traits)
- Not logos, not lore screens, not narrative text

---

## Build phases

### Phase 1: Sub-attributes on existing players (2-3 days)

**What:** Add 3 sub-attributes per player to all 56 existing players (4 teams × 14 players). Generate plausible values based on existing star ratings.

**Tasks:**
1. Add sub-attribute fields to player data model in `src/data/` (each player gets 3 numbers on 0-99 scale per their position group)
2. Write a generator script that converts existing star ratings into sub-attribute distributions (a 4-star player averages ~65 across their 3 subs, a 3-star ~50, etc.)
3. Verify star ratings derived from sub-attributes match the existing star ratings (or are close enough)
4. Add long-press detail view showing sub-attributes on player cards

**Done when:** Every player has sub-attributes visible on long-press. Star ratings still work. Existing gameplay unchanged.

### Phase 2: Stamps on RB/FB position (2-3 days)

**What:** Implement the 7 locked RB/FB stamps (TRUCK, BURNER, CUTBACK, GLIDE, ANCHOR, MITTS, MOTOR) in the snap resolver. Every RB/FB starts with their existing trait promoted to their first stamp.

**Tasks:**
1. Create stamp data model (`src/data/stamps.js`) with the 7 RB/FB stamps: name, trigger condition, effect, sub-attribute lean, icon
2. Add stamp-firing check to `snapResolver.js` — after the snap resolves, check if the featured player has stamps whose triggers match the play result
3. Implement opposed-roll math for stamp resolution (offense_value vs defense_value, bounded ±10 roll)
4. Wire stamp results into commentary engine (chain stamp names into play descriptions)
5. Add stamp visual badges to the post-snap result display
6. Give every RB/FB their first stamp (promote existing trait)

**Done when:** When you feature an RB on a power run, TRUCK can fire visibly in the result. Commentary says "Henderson trucks the safety." Other positions still play normally with no stamps.

### Phase 3: Helmet stickers + between-games screen (3-4 days)

**What:** Players earn helmet stickers from in-game events. After each game, a between-games screen lets you spend stickers on sub-attribute increases or new stamps for RB/FB.

**Tasks:**
1. Track per-player sticker earning during gameplay (catch = +X, TD = +Y, turnover = +Z, bad play cancels that play's earning)
2. End-of-game stat bonuses (100-yard game, 3-TD game, etc.)
3. Build between-games screen: show each player's earned stickers, offer spending choices (sub-attribute +1 per sticker OR stamp purchase for RB/FB at higher cost)
4. Persist player progression in save state (sub-attributes and stamps carry to next game)
5. Visual: helmet sticker count visible on player cards

**Done when:** After a game, you see stickers earned per player. You can spend them. Henderson's POWER goes from 70 to 72. You buy him BURNER. Next game he has both TRUCK and BURNER active.

### Phase 4: Season loop (3-4 days)

**What:** 7-game season with the existing 4 teams. Simple standings. Bracket at the end (top 2 play a championship game — simplified from full 8-team CFP since we only have 4 teams).

**Tasks:**
1. Season state: current week, standings, schedule, player progression
2. Season map screen: shows schedule, results, standings, next opponent
3. Between-games screen (from Phase 3) sits between each game
4. Simple 4-team bracket at end of regular season (1v4, 2v3 semis, championship — or just top 2 play the final)
5. End-of-season summary screen showing coach record, player development, final standings
6. Save/load for season state (localStorage, extend existing save system)
7. "New Season" flow from home screen

**Done when:** You can start a season, pick the Boars, play 7 games against the other 3 teams, develop your RBs with stamps across the season, and play a championship game. The loop works end to end.

### Phase 5: TORCH points in-game spending (2-3 days)

**What:** Team-level TORCH points earned from team achievements, spendable via contextual buttons during gameplay.

**Tasks:**
1. Track TORCH point earning from team events (winning drives, three-and-outs, holding leads)
2. Implement 4-6 in-game spends to start: TIMEOUT, ICE THE KICKER, GO FOR IT BOOST, HURRY UP, SCOUT THE PLAY, CALL AUDIBLE
3. Contextual buttons that surface when relevant (4th down = GO FOR IT BOOST appears, etc.)
4. TORCH points carry over between games if unspent
5. Between-games team spending (2-3 simple options: scouting report on next opponent, home crowd boost, extra timeout)

**Done when:** TORCH points appear during games, you can spend them on timeouts and boosts, unspent points carry to the between-games screen where you can buy a scouting report for next week.

---

## Phase 6+ (after tester feedback)

Only start these AFTER Discord friends have played the Phase 1-5 prototype and given feedback:

- Stamps for other 6 position groups
- Counter-stamps on defense
- Defense featuring (pick play + player on defense)
- 4 new teams (the Ember Eight expansion from 4 to 8)
- Conference lore screens and team identity presentation
- Coach creator / avatar
- AI tendency panel
- Full 8-team CFP bracket with play-in round
- Signature stamps
- Pre-snap stamp matchup reveal (showdown)
- Ember Eight narrative (The Letter, the ghosts, the founding myth)

---

## Claude Code session starters

### Phase 1 prompt
```
Read docs/PROJECT-STATUS.md for project context. CLAUDE.md has the build rules.

Task: Add sub-attributes to every player in the game.

Each player needs 3 sub-attributes on a 0-99 scale based on their position group:
- QB: ARM, POISE, MOBILITY
- RB/FB: POWER, SPEED, VISION
- Pass catchers (WR/TE): HANDS, ROUTES, SPEED
- OL: STRENGTH, PASS_PRO, AWARENESS
- DL: PASS_RUSH, RUN_STOP, AWARENESS
- LB: TACKLING, COVERAGE, RUN_FIT
- DB: COVERAGE, BALL_SKILLS, AWARENESS

Generate values based on existing star ratings:
- 5-star: average ~82 (range 75-95)
- 4-star: average ~65 (range 55-79)
- 3-star: average ~50 (range 40-59)
- 2-star: average ~35 (range 25-45)

Add variance within each player (not all 3 subs the same — some players are fast but weak, etc.)

Add a long-press detail view on player cards that shows the 3 sub-attributes.

Verify: star rating derived from average of 3 subs should match existing star rating ±0.5 stars.

Stop after implementation for review.
```

### Phase 2 prompt
```
Read docs/PROJECT-STATUS.md for project context. CLAUDE.md has the build rules.

Task: Implement the RB/FB stamp system.

Create src/data/stamps.js with these 7 stamps:
- TRUCK: fires when defender attempts open-field tackle, opposed roll using POWER, win = break tackle +3-5 yards
- BURNER: fires when run gains 8+ yards, opposed roll using SPEED, win = breakaway +10-20 yards
- CUTBACK: fires when called gap is filled, opposed roll using VISION vs LB RUN_FIT, win = find lane
- GLIDE: fires on stretch/outside zone runs, opposed roll using VISION, win = blocks develop +2-4 yards
- ANCHOR: fires when featured on passing down, opposed roll using POWER+VISION vs blitzer, win = picks up blitz
- MITTS: fires on screen/check-down, opposed roll using VISION, win = clean catch
- MOTOR: fires on 3rd featuring in a drive, passive = no fatigue penalty

Each stamp has: name, trigger condition, effect function, sub-attribute lean, position group.

Give every RB/FB their current trait promoted as their first stamp (TRUCK for power backs, BURNER for speed backs, etc.)

Add stamp-fire check to snapResolver.js — after result, check featured player's stamps against play result. Run opposed roll: offense_value = base_rate + (sub_attribute/10) + random(-10,10). Show result in commentary.

Add stamp badge to post-snap result display: "TRUCK ✓" or "TRUCK — stuffed"

Stop after implementation for review.
```

---

## Timeline

| Phase | Estimated days | Cumulative |
|---|---|---|
| Phase 1: Sub-attributes | 2-3 | 2-3 days |
| Phase 2: RB/FB stamps | 2-3 | 4-6 days |
| Phase 3: Stickers + between-games | 3-4 | 7-10 days |
| Phase 4: Season loop | 3-4 | 10-14 days |
| Phase 5: TORCH points | 2-3 | 12-17 days |
| **Ship to Discord testers** | | **~2-3 weeks** |

---

## What to tell your Discord testers

"I rebuilt the card system. Instead of buying torch cards from a store, your players now earn stamps — named football moves like TRUCK and BURNER — that fire automatically when you feature them. You develop players across a 7-game season by spending helmet stickers on upgrades between games. Pick a team and play a season. Tell me what's confusing, what's boring, and what's fun."

That's it. Don't explain the lore. Don't explain the Ember Eight. Don't explain the ghost coaches. Just hand them the loop and watch what they do.
