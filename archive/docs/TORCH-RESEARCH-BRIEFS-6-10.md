# TORCH — Research Briefs 6-10
## Sound Design · Addiction Loops · Content Cadence · Multiplayer · Offseason Strategy

---

## BRIEF 6: THE SOUND OF DOPAMINE (how audio makes card games addictive)

### Why Balatro players can't stop
The single most cited reason Balatro is addictive — above the joker synergies, above the roguelike loop — is the SOUND. Players describe it in physical terms: "the trigger sound effects and the counter turning into flames are genius moves," "the acceleration when your hand has so many multipliers that counting your score takes too long — so good," "dopamine-releasing sound triggers and results-achieving."

What Balatro does with audio:
- **Score counting accelerates.** When you play a hand, chips count up one by one. If the score is small, it counts slowly. If it's huge, the counter speeds up and the pitch rises until the numbers are scrolling so fast they blur. That acceleration IS the dopamine. You HEAR your synergy paying off.
- **Joker trigger sounds are distinct.** Each joker that fires makes its own sound. When 5 jokers chain together, you hear a cascade of triggers. It sounds like a slot machine hitting — but it's your STRATEGY that caused it, not luck.
- **The "no miss" principle.** Every tap in Balatro makes a sound. Selecting cards. Discarding. Opening packs. Buying from the shop. There's no silent interaction. Your brain is constantly receiving audio confirmation that your inputs matter.

### What TORCH needs — a football audio dopamine map

| Moment | Audio | Why |
|--------|-------|-----|
| Tap player card | Short click + jersey rustle | Confirms selection, feels like picking a player off the bench |
| Tap play card | Whistle chirp + card slide | Confirms play call, sounds like a coach signaling |
| SNAP button | Stadium crowd roar (short burst) | Commitment moment — no going back |
| Clash reveal | Cards flip with a hard THWACK | Both plays face up — the collision is coming |
| Yards counting | Chains counting up (like Balatro) — pitch rises with yards | THE dopamine trigger. 3 yards = slow count. 18 yards = frantic acceleration |
| Touchdown | Air horn + crowd explosion + bass drop | Maximum dopamine. This has to feel like a REAL touchdown |
| Sack | Helmet crunch + crowd gasp | Violent, satisfying. The defense player should feel powerful |
| Interception | Record scratch + crowd eruption | Shock moment. The mood flips instantly |
| Incomplete | Flat buzz + brief crowd groan | Failure but not devastating — you still have downs left |
| Stuffed run | Pad collision + whistle | Heavy, physical, definitive |
| Badge combo fires | Arcade "power-up" chime layered over the play result | The player needs to HEAR when their strategy worked |
| TORCH points accumulate | Coin-collection cascade (like Mario coins) | Points flying to the counter should sound like winning |
| 2-minute warning | Urgency music shifts — tempo doubles | Heart rate should match the clock |
| Game over — win | Full stadium anthem, fireworks | Victory lap |
| Game over — loss | Muted crowd, slow fade | Respectful but motivating — "almost had it" |

### The key principle
Every interaction must make a sound. Every positive outcome must make a BETTER sound. The ratio of positive to negative sounds should be roughly 3:1 — the player should hear good things 3x more than bad things, even in a loss. This is because individual plays produce positive sounds (gained 4 yards — pleasant ding) even within a losing game. The player's emotional experience of a loss should be "that was fun but I came up short" not "everything was terrible."

**Haptics matter too.** On mobile, use `navigator.vibrate()`:
- Light tap (10ms) on card selection
- Medium pulse (50ms) on SNAP
- Strong buzz (100ms) on touchdown, sack, turnover
- Double pulse on badge combo fire

---

## BRIEF 7: THE "ONE MORE RUN" LOOP (what makes roguelikes addictive and how TORCH Product B should use it)

### The formula
Every addictive roguelike (Slay the Spire, Balatro, Hades, Vampire Survivors) runs on the same psychological loop:

**1. Short runs with total reset.** A Balatro run is 30-45 minutes. A Slay the Spire run is 45-90 minutes. When you lose, everything resets. This sounds punishing but it's actually liberating — there's no sunk cost. You can try a completely different strategy next time. The reset IS the hook. It removes the fear of commitment.

**2. Each run teaches you something.** "Oh, Flush is way better than Straight if I get the right jokers." "Oh, Corner Blitz gets destroyed by screens." The player gets smarter across runs even though their in-game progress resets. This creates a mastery curve that the player can FEEL.

**3. Discovery as reward.** Balatro has 150 jokers, most of which are locked at the start. You unlock them by completing specific conditions. Each unlock changes what's POSSIBLE in future runs. The player isn't just replaying the same game — the game itself is expanding. Slay the Spire does this with cards and relics. Hades does it with story beats.

**4. Near-misses are more motivating than wins.** The run where you almost beat the final boss is the run that makes you hit "play again." Research on gambling psychology confirms this — near-misses activate the same brain regions as wins. Roguelikes exploit this by making late-game bosses dramatically harder, ensuring most runs end within sight of victory.

**5. "Build identity" creates emotional attachment.** In Slay the Spire, the moment you find Snecko Eye + Corruption + Dead Branch, you've discovered a "build." That build has a NAME in the community. Players share builds like recipes. The build is the player's creative expression within the system.

### How TORCH Product B (Dynasty Mode) should use each element

**Short runs:** One season = 12-16 games + playoffs. Each game is 5-8 minutes. A full season run = 90-120 minutes across multiple sessions. Save between games. The run resets when you lose in the playoffs (or get fired).

**Learning across runs:** "Last season I ran too much against Cover 3 teams. This time I'm drafting more passing plays." The player's football IQ grows across seasons. The meta-learning IS the product.

**Discovery:** Lock teams, players, and Torch Cards behind achievements. "Win a game with 0 turnovers" unlocks a new team. "Score 300+ TORCH points in a game" unlocks a Gold Torch Card. "Win a championship" unlocks Hard difficulty. The unlocks change what builds are possible.

**Near-misses:** The championship game should be significantly harder than regular season games. Losing in the championship game should show "Season Record: 11-1. Championship: LOSS. Try again?" That near-miss drives the next run.

**Build identity:** The combination of team + drafted players + drafted plays + Torch Cards = a "build." "I run Canyon Tech with all-deep with Sampson + Avery FOOTBALL combo and SCOUT TEAM Torch Card." That's a build. Players will share their builds. The game should name the builds or let players name their season.

### The TORCH-specific addiction trigger
Football has something poker doesn't: RIVALRY. In Balatro, you play against impersonal "blinds." In TORCH, you play against IRON RIDGE or CANYON TECH. These teams have names, colors, identities, and play styles. When Iron Ridge's Torres trucks through your defense for a TD, it's not "the number went down" — it's "TORRES scored on me AGAIN." Rivalry creates emotional stakes that abstract games can't match.

Dynasty mode should lean into this hard. Season records against each opponent. Rivalry game modifiers. "Torres has scored 14 TDs against you in 3 seasons" should appear as a stat. The player's desire to beat their nemesis IS the "one more run" trigger.

---

## BRIEF 8: KEEPING A DAILY GAME FRESH FOR 6 MONTHS (content cadence)

### The Wordle editorial model
Wordle has one dedicated editor (Tracy Bennett) who curates the daily word from a list. The NYT team calibrates difficulty across the week — Mondays are easier, Fridays are harder. They test puzzles 3-4 weeks in advance with 35 testers. They track solve rates and adjust. They deliberately avoid themed words (the Thanksgiving FEAST incident proved players hate it).

Connections has a constructor (Wyna Liu) who's become a "mini-celebrity" — players love and hate her personally. She's a content creator, not just a puzzle designer. Her personality drives engagement.

### What TORCH can do with zero editorial staff

**Week 1-4: Fixed scenarios.** Same daily game for everyone, seeded by date. Two teams, same draft pool. The variables are which 5 plays you draft and which player you feature each snap. Simple. Repeatable. Testable.

**Month 2-3: Situation variety.** Introduce daily "situations" — sometimes you start down 7, sometimes you're in a 2-minute drill, sometimes it's a rivalry game with boosted TORCH points. Same engine, different starting conditions. This is cheap to implement (just different initial GameState values) and creates daily variety.

**Month 3-4: Weekly themes.** Monday = Easy (good matchups). Tuesday = Run Heavy (more run plays in draft pool). Wednesday = Blitz Day (opponent calls more blitzes). Thursday = Red Zone (start inside the 20). Friday = Clutch (start in 2-minute drill, down by 4). Saturday = Rivalry (double TORCH points). Sunday = Wildcard (random modifier). This creates a weekly rhythm that players anticipate.

**Month 4-6: New teams.** Add 2 more teams (Valley Ridge triple option, Lakeshore State balanced). Each team has 10 new offensive and 10 new defensive plays. This quadruples the possible matchups from 1 (CT vs IR) to 6 (4 teams, each can face any other). This is the first CONTENT update and should coincide with a marketing push.

**Month 6+: Seasonal content.** Align with real college football season. Weekly scenarios inspired by real games. "This week's TORCH: 4th and 3, down 6, 30 seconds left — inspired by last Saturday's Alabama-Georgia finish." This creates a bridge between real football and TORCH that no other game offers.

### The math of freshness
With 2 teams × 10 offensive plays × 10 defensive plays × 4 players × 5 situations = 4,000 unique game seeds. At 1 per day, that's 11 YEARS of unique daily puzzles before any repetition. You don't have a content problem. You have a PERCEPTION problem — the game feels the same even when the seed is different. The weekly themes and situation variety solve this by making each day FEEL different even though the engine is identical.

---

## BRIEF 9: SHOULD TORCH HAVE MULTIPLAYER? (and if so, what kind)

### The short answer
Not at launch. Not for 6 months. Multiplayer is a feature that kills indie games because it splits the already-small player base, requires server infrastructure, and creates matchmaking problems. But the RIGHT kind of multiplayer, added at the RIGHT time, could be TORCH's biggest growth lever.

### What the research says
Mobile card games with PvP multiplayer (Clash Royale, Marvel Snap) have higher retention but also higher churn. The matchmaking problem is acute: if a new player faces a veteran, they get destroyed and quit. If you match by skill, queue times increase. If you match by card collection, pay-to-win emerges.

Asynchronous multiplayer avoids all of these problems. Wordle is asynchronous — you solve the same puzzle as your friend, then compare results. There's no real-time interaction. No waiting for opponents. No matchmaking. No servers.

### The TORCH multiplayer roadmap

**Phase 1 (Launch): Asynchronous leaderboard.** Everyone plays the same daily game. A global leaderboard shows TORCH points. Your Discord group can compare scores. This is "multiplayer" in the Wordle sense — shared competition without real-time interaction.

**Phase 2 (Month 3): Head-to-head async challenges.** Challenge a friend. You both play the same scenario. Whoever scores more TORCH points wins. No real-time needed — your friend can play their game whenever they want that day. The result is compared when both have played. This is the "Wordle group chat" mechanic but formalized.

**Phase 3 (Month 6): Live head-to-head.** Both players draft simultaneously. Each snap, you're playing AGAINST a human, not CPU. Your play card vs their play card. This is the ultimate expression of TORCH — two people who think they know football, proving it against each other in real time. This requires WebSocket infrastructure and is a significant engineering investment. Only build this after proving the single-player game retains.

**Phase 4 (Year 1): Leagues.** Groups of 8-16 players compete in a weekly league. Play one game per day against a different league member. Weekly standings. Playoff bracket at the end. This is where the EA CFB dynasty community goes ALL IN — it's their online dynasty, but in 5 minutes on their phone.

### The key insight
TORCH's multiplayer advantage is that the game is ALREADY designed for human vs human. The engine resolves offense vs defense simultaneously. The snap sequence (pick player, pick play, SNAP) works identically whether the defense is CPU or human. The only difference is who picks the defensive play. This means the single-player engine IS the multiplayer engine. You're not building two products — you're adding an input source.

---

## BRIEF 10: OWNING THE FOOTBALL OFFSEASON (the strategic window nobody else occupies)

### The dead zone
College football's season runs August through January. From February through July, there is almost nothing for fans to do. The NFL Draft (April) and spring practices (March-April) provide brief spikes of interest, but for 5 months, college football fans are starving for content. EA College Football doesn't release new content in the offseason. Fantasy football doesn't start until August. Sports talk shows fill the gap with speculation and recruiting talk, but there's no INTERACTIVE football experience during the offseason.

This is TORCH's window.

### The offseason content strategy

**February-March (Post-season):** Launch TORCH. The championship game just happened. Football is still in the cultural conversation. Opening message: "The season's over. But your play-calling career is just beginning." Target the fans who are grieving the end of the season and looking for a football fix.

**March-April (Spring football):** Introduce "Spring Practice" mode — a tutorial/onboarding experience that teaches the game through a simplified season. This aligns with real spring football practices happening at universities. Content angle: "Your spring game starts now."

**May-July (Dead zone):** This is where the Play Call Challenge TikTok content strategy hits hardest. There is ZERO football content competing for attention. A football strategy game posting daily content during the dead zone will own the space. Every college football fan scrolling TikTok in June looking for ANY football content will find TORCH.

**August (Season start):** Launch the premium Dynasty Pass timed to Week 1 of college football. "Your season starts when theirs does." The daily puzzle shifts to scenarios inspired by real game situations from the previous week. TORCH becomes a companion app to the real season — play TORCH on Sunday, watch football on Saturday, compare your play-calling to what the real coaches did.

### Why this timing beats August launch
My earlier brief said launch in August. I'm revising that. Launch in February. Here's why:

1. **February launch = 6 months of iteration before the season.** You find and fix every bug, balance every play, tune every difficulty before the high-stakes football audience arrives in August.
2. **February-July = audience building with zero competition.** Nobody is marketing football games in March. Your Play Call Challenge content has the entire niche to itself.
3. **August = monetization, not launch.** By August, you have 6 months of daily players, proven retention data, and a community. THAT is when you launch Dynasty Pass. The free players become paid players when football season gives them a reason to go deeper.

This is the Wordle playbook: launch quietly, build audience organically, monetize when the audience is large enough. Wordle launched in October 2021. It went viral in December 2021. NYT bought it in January 2022. TORCH should launch in February 2026 (or as soon as it's ready), grow through the offseason, and monetize in August.

### The college football calendar as content calendar

| Month | Real Football | TORCH Content |
|-------|--------------|---------------|
| Feb | Signing Day, coaching hires | Launch. "Build your program." |
| Mar | Spring practice begins | Spring Practice tutorial mode |
| Apr | Spring games, NFL Draft | Daily scenarios based on draft prospects |
| May | Dead zone begins | Play Call Challenge TikTok series starts |
| Jun | Dead zone | Weekly team spotlights, new team reveals |
| Jul | Preseason polls, media days | Dynasty Pass announcement, preseason rankings |
| Aug | Season Week 1 | Dynasty Pass launches. Daily scenarios mirror real games |
| Sep-Dec | Regular season | Weekly scenarios from Saturday's games |
| Jan | Playoffs, championship | Championship scenarios, season wrap |

Every month has a content hook because real football provides the narrative. TORCH doesn't need to invent stories — it rides the biggest sport in America.

---

## SUMMARY: Briefs 6-10

6. **Sound design is 50% of addiction.** Build a dopamine audio map. Score counting should accelerate like Balatro. Every interaction makes a sound. Positive sounds outnumber negative 3:1. Add haptics on mobile.

7. **Product B (Dynasty) needs the roguelike loop.** Short seasons, total reset, learning across runs, discovery through unlocks, near-miss championship losses, and rivalry as the emotional hook that poker games can't match.

8. **A daily game stays fresh through situation variety, not new content.** Weekly themes (Monday easy, Friday clutch, Saturday rivalry) + monthly situation additions + quarterly new teams. 4,000 unique seeds = 11 years of dailies.

9. **No multiplayer at launch.** Async leaderboard first, then head-to-head async challenges, then live PvP, then leagues. The single-player engine IS the multiplayer engine — you're just changing who picks the defensive play.

10. **Launch in February, not August.** Own the football offseason dead zone. 6 months of zero-competition audience building. Monetize in August when the real season starts. The college football calendar IS your content calendar.
