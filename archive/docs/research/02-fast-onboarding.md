# TORCH Research Brief #02: Fast Onboarding
**Date:** 2026-03-22
**Goal:** How do the best games get players into gameplay as fast as possible, and what should TORCH do?

---

## The Core Metric: Time to First Fun

Industry research converges on one number: **30 seconds**. The best mobile games deliver a "small win" — a satisfying action, a loot drop, a level-up — within the first 30 seconds of opening the app. Players form first impressions within 50-500 milliseconds, and most early churn comes from cognitive overload, weak onboarding, and poor game feel.

Key benchmarks from industry data:
- **3-5 screens or under 60 seconds** keeps user interest high (UX research consensus)
- **Hades** gets players into combat within **15 seconds** of launch
- **Day 1 retention** for top-performing titles: ~40%. By Day 7: ~15%. By Day 28: ~6.5%
- The distinction between FTUE (first 60 seconds to first 15 minutes) and Onboarding (first 7 days) is critical — you only need to teach the core loop in the FTUE, not every system

Apple's official guidance: "Avoid showing splash screens, menus, agreements, or disclaimers when a new player opens your app. Start onboarding at launch."

---

## Game-by-Game Analysis

### Mobile Card Games

#### Marvel Snap
- **Taps to gameplay:** ~3-4 (open app, brief load, guided tutorial match begins almost immediately)
- **Pre-play choices:** None. Deck is pre-built. You play a scripted tutorial match against AI (Doctor Doom scenario with Nick Fury guiding you)
- **Info shown vs hidden:** Only energy costs and power values shown. Locations, snapping, collection level all hidden initially. Snapping itself doesn't unlock until 10-20 matches in
- **How it teaches:** You play a real (scripted) match immediately. Tooltips appear contextually as you encounter new elements. "Bite-sized tutorial" takes ~2 minutes
- **The hook:** Marvel IP recognition + the 3-minute match format means instant gratification. "Simple ruleset, bite-sized tutorial, and lightning-fast matches are key ingredients for low barrier of entry"
- **Key insight for TORCH:** Marvel Snap gives you ZERO choices before your first game. Pre-built deck, scripted opponent. All customization comes after you understand the feel

#### Clash Royale
- **Taps to gameplay:** ~2-3 (open app, immediately into first guided battle)
- **Pre-play choices:** None. First battle is fully guided — the game tells you where to place troops
- **Info shown vs hidden:** Only troop placement shown. Upgrading, deck editing, clan system, chest timers all hidden until after first win
- **How it teaches:** Two "coached" moments: (1) placing units on the map, (2) upgrading cards and editing deck. Between those, player explores freely. "Almost no text bubbles or coach markings"
- **The hook:** Destroying the opponent's tower within 60 seconds of opening the app. Then 15-second reward timer creates anticipation loop
- **Key insight for TORCH:** Clash Royale has TWO coaching moments, not a continuous tutorial. The rest is exploration. The reward unlock timer ("go explore, we'll have rewards waiting") is a retention trick

#### Balatro
- **Taps to gameplay:** ~2-3 (start game, tutorial begins on fixed seed with Red Deck)
- **Pre-play choices:** None. Tutorial always plays on seed "TUTORIAL" with Red Deck (the only available deck)
- **Info shown vs hidden:** Poker hand basics, discards, scoring. Jokers and consumables introduced gradually. You can actually lose the tutorial in the first blind
- **How it teaches:** Jimbo (mascot) guides you through basics. You play real hands immediately. The tutorial IS the first run
- **The hook:** The dopamine of seeing chip multipliers stack. Familiar poker hand recognition lowers cognitive load
- **Key insight for TORCH:** Balatro uses familiar concepts (poker hands) as cognitive scaffolding. Players already know what a "pair" or "straight" is. TORCH can do the same with football concepts

#### Slay the Spire
- **Taps to gameplay:** ~3-4 (launch, select Ironclad — only unlocked character — begin run)
- **Pre-play choices:** Character selection (but only one is available initially, so it's really just a confirmation tap)
- **Info shown vs hidden:** Starting deck of ~10 basic cards shown. Relics, potions, card rewards, map pathing all discovered through play. Three additional characters locked behind progression
- **How it teaches:** First combat encounter is trivially easy. Tooltips on hover/tap explain card effects. Map navigation taught by requiring you to choose a path. No formal tutorial
- **The hook:** First card reward after first combat — the feeling of building YOUR deck
- **Key insight for TORCH:** Limiting starting options (one character) eliminates decision paralysis. Complexity unlocks over time

#### Hearthstone
- **Taps to gameplay:** ~4-5 (account setup, then 3 guided tutorial matches as Mage)
- **Pre-play choices:** None during tutorial. Play as Mage only. Other classes locked behind Apprentice Track progression
- **Info shown vs hidden:** Initially only Mage class available. Other classes, game modes, competitive play all locked. Features gate behind progression to prevent overwhelm
- **How it teaches:** 3 scripted practice matches with guided play. New "Apprentice Track" (2025) replaces old rank system — quests teach systems progressively over 6-12 hours
- **The hook:** Satisfying card-play animations and sound design. Earning new cards feels rewarding
- **Key insight for TORCH:** Hearthstone's main lesson is feature gating. New players see a SIMPLIFIED version of the game. Complexity reveals over days, not minutes

#### Legends of Runeterra
- **Taps to gameplay:** ~3-4 (account, then immediately into 4 tutorial matches)
- **Pre-play choices:** None. Deck pre-built for each tutorial
- **Info shown vs hidden:** Each tutorial introduces one champion's level-up mechanic plus lore. Full deckbuilding unlocked after tutorials
- **How it teaches:** 4 separate tutorials, each built around a champion rivalry with narrative context. Lore integration makes tutorials feel like story, not instruction
- **The hook:** Champion level-up animations are cinematic moments. Narrative investment from minute one
- **Key insight for TORCH:** Runeterra wraps tutorials in STORY. Each tutorial is a rivalry. TORCH could frame the first game as Canyon Tech vs. Iron Ridge rivalry narrative

#### Pokemon TCG Live
- **Taps to gameplay:** ~5-6 (account creation/login required, tutorial, then 8 starter decks awarded)
- **Pre-play choices:** Account setup required (Trainer Club account). Tutorial uses pre-built deck
- **Info shown vs hidden:** Tutorial covers basics. After completion, 8 semi-competitive starter decks unlocked. Full collection system revealed post-tutorial
- **How it teaches:** Guided tutorial match, then starter decks to experiment with. Account requirement adds friction vs. competitors
- **Key insight for TORCH:** Account requirements are a retention killer for FTUE. TORCH should never require signup before first play

---

### Mobile Sports Games

#### Retro Bowl
- **Taps to gameplay:** ~3-4 (name coach, pick team, optional tutorial, first game)
- **Pre-play choices:** Name your coach, choose your team (or get assigned randomly). Tutorial is offered but skippable
- **Info shown vs hidden:** Team management, drafting, free agency all available from menu but not required to play first game. Core gameplay (passing/running) taught in optional tutorial
- **How it teaches:** Tutorial covers passing (tap to throw) and running (swipe). Can be skipped entirely. Games last only a few minutes each
- **The hook:** The physicality of the swipe/tap controls. Scoring a touchdown feels great immediately. Retro aesthetic removes visual complexity
- **Key insight for TORCH:** Retro Bowl's genius is its SIMPLE CONTROLS + SHORT GAMES. The team selection screen is meaningful (emotional attachment to your team) but it's the only pre-play decision

#### NFL Rivals
- **Taps to gameplay:** ~4-5 (download, brief intro, team building from cards, first match is offense-only)
- **Pre-play choices:** Team assembly from starter cards
- **Info shown vs hidden:** Offense-only matches initially. Full team management revealed later. Card collection/trading hidden behind progression
- **How it teaches:** Simplified offense-only gameplay first, then introduces defensive challenges as scenario-based missions
- **The hook:** NFL licensing + card collecting. 5 million downloads and 115 million games played in first season
- **Key insight for TORCH:** Starting offense-only (not both sides) reduces initial cognitive load dramatically

#### Madden Mobile
- **Taps to gameplay:** ~6-8 (loading, account, team setup, tutorial match)
- **Pre-play choices:** Team selection, initial lineup configuration
- **Info shown vs hidden:** Core gameplay shown. Auction house, season mode, live events revealed progressively. Many game modes locked initially
- **How it teaches:** Guided tutorial game with on-screen prompts for controls (passing, running, juking). Play-calling simplified initially
- **The hook:** NFL brand recognition, realistic player likenesses, live season tie-ins
- **Key insight for TORCH:** Madden Mobile is the cautionary tale — too many screens, too many modes, too much friction before first play. TORCH should be the anti-Madden-Mobile

#### NBA 2K Mobile
- **Taps to gameplay:** ~5-7 (loading, account, initial team, tutorial match with 2-minute halves)
- **Pre-play choices:** Auto mode vs manual mode control selection. Starting lineup from starter cards
- **Info shown vs hidden:** Simplified controls. Full card collection, training, and auction systems hidden initially. Matches are 2 halves of 2 minutes each
- **How it teaches:** Offers auto mode (simplified) vs manual mode choice — lets players self-select difficulty. Tutorial covers basic shooting and defense
- **The hook:** NBA player likenesses, satisfying shooting mechanics
- **Key insight for TORCH:** The auto/manual choice is interesting — it lets casual players engage immediately while giving hardcore players depth

---

### Fast-Onboarding Champions

#### Subway Surfers
- **Taps to gameplay:** ~1 (open app, you're running)
- **Pre-play choices:** None. Zero. You are a character running from a cop the moment the app loads
- **Info shown vs hidden:** Only swipe directions shown. Power-ups, characters, hoverboards, missions all discovered through play
- **How it teaches:** First obstacle requires a swipe. That's the tutorial. Fail = you learn. Succeed = you keep running. "If they need to learn to jump, put a small gap in front of them, not a manual"
- **The hook:** The endless runner momentum. You're always moving forward. The chase scenario creates immediate tension
- **Key insight for TORCH:** Subway Surfers is the gold standard of zero-friction onboarding. The "tutorial" is the first obstacle. TORCH can't match this (card games need more setup), but the PHILOSOPHY applies

#### Candy Crush
- **Taps to gameplay:** ~2 (open app, first level IS the tutorial)
- **Pre-play choices:** None. Level 1 is preset: collect 30 blue candies in 30 moves
- **Info shown vs hidden:** Only matching mechanic shown. Special candies, boosters, lives system, social features all hidden. Tutorial uses mascot + contextual tooltips + arrows pointing at candies
- **How it teaches:** "Uses a mascot, contextual tooltips with visual support, and a huge skip button." The skip button is deliberately "big and shiny so that no one has to look for it"
- **The hook:** Color matching is universally understood. First level is impossible to fail. Immediate gratification of clearing candy
- **Key insight for TORCH:** The SKIP BUTTON matters. Players who know what they're doing should never be trapped in a tutorial. Also: make Level 1 impossible to lose

#### Wordle
- **Taps to gameplay:** ~2 (open page/app, tap Play, rules popup optional, type first word)
- **Pre-play choices:** None. No account required (optional for save sync)
- **Info shown vs hidden:** Brief rules popup that can be dismissed. No tutorial needed — the game IS the explanation. Color feedback teaches the rules
- **How it teaches:** Type a word, colors tell you what's right. The mechanic is self-teaching. Green = right, yellow = wrong spot, gray = not in word
- **The hook:** One puzzle per day creates FOMO and social sharing. The constraint IS the hook
- **Key insight for TORCH:** Self-teaching mechanics are the pinnacle of onboarding. If your game mechanic explains itself through feedback, you don't need a tutorial

#### Among Us
- **Taps to gameplay:** ~3-4 (open app, host/join game, brief role assignment, gameplay begins)
- **Pre-play choices:** Host vs join. Map selection (optional, host decides). Custom rules (optional)
- **Info shown vs hidden:** Role (crewmate/impostor) revealed at start. Task locations, sabotage system, voting UI all discovered through play. "Freeplay" mode available as optional tutorial
- **How it teaches:** Social context — friends explain the game while playing. Freeplay mode for solo learning. The game is simple enough to learn by watching one round
- **The hook:** Social deception. The emergent storytelling of "who did it?"
- **Key insight for TORCH:** Among Us proves that games with social context need less tutorial. But TORCH is single-player, so the game itself must teach

#### Fall Guys
- **Taps to gameplay:** ~3-4 (open app, optional tutorial level "Welcome to Fall Guys", queue for match)
- **Pre-play choices:** None. Tutorial level has no elimination risk. Skip option available
- **Info shown vs hidden:** Jump/grab/dive controls shown. No elimination risk in tutorial. Competitive modes, costumes, battle pass shown after first match
- **How it teaches:** "Welcome to Fall Guys" tutorial level with simple obstacles (bumpers, rotating hammers, turnstiles). Safe environment — can't be eliminated. Tutorial can be skipped to jump directly into a competitive match
- **The hook:** Physical comedy of failing. Watching other players wipe out. Low stakes make failure fun
- **Key insight for TORCH:** Fall Guys makes the tutorial a SAFE PLAYGROUND. First game experience has no real stakes. TORCH could make the first game easier (hidden difficulty reduction for first-time players)

---

### Console/PC Games with Great Onboarding

#### Celeste
- **Taps to gameplay:** ~2 (start game, first screen IS the tutorial)
- **Pre-play choices:** None
- **Info shown vs hidden:** Only basic movement + dash shown. Wall jumping, dashing mechanics taught by level geometry. Advanced techniques discovered naturally
- **How it teaches:** The level design IS the tutorial. A gap in the floor teaches you to jump. A wall teaches you to wall-jump. A distant platform teaches you to dash. "For successful onboarding, designers should plan when each new idea will be introduced." No text, no popups, no explanation
- **The hook:** The tight, responsive controls feel amazing immediately. The difficulty curve is a perfect ramp
- **Key insight for TORCH:** Celeste's approach — teaching through environment design, not text — is the gold standard. Every screen in TORCH should teach something by doing, not telling

#### Hades
- **Taps to gameplay:** ~1-2 (start game, you're in combat within 15 seconds)
- **Pre-play choices:** None on first run. Weapon selection opens after first death
- **Info shown vs hidden:** Only attack/dash/cast shown. Boons, mirror upgrades, weapon aspects, Keepsakes, NPC relationships all unlocked through death cycles. "The game drip-feeds you new features as you do more runs"
- **How it teaches:** "Skelly" (a training dummy skeleton) in the starting area gives button prompts if you approach. Otherwise, you learn by fighting. "The game does not hand-hold you and lets you learn by actually playing"
- **The hook:** The combat feels incredible from the first swing. Then death reveals a whole layer of story and progression you didn't know existed
- **Key insight for TORCH:** Hades is the ultimate "learn by dying" game. Death = progress, not failure. TORCH equivalent: losing a game should still feel like you earned/learned something (TORCH points carry forward?)

#### Into the Breach
- **Taps to gameplay:** ~3 (start game, optional Combat Simulation tutorial, first mission)
- **Pre-play choices:** Squad selection (but only one squad available initially — Rift Walkers)
- **Info shown vs hidden:** Grid-based combat with 3 mechs shown. Enemy attack previews (the core mechanic) highlighted from turn one. Advanced squads, pilot abilities, time travel reset all locked behind progression
- **How it teaches:** Combat Simulation teaches move, attack, push with three distinct mech types. Core insight — "Vek signal their attacks ahead of time" — taught immediately because it IS the game. Perfect information = the player always knows what will happen
- **The hook:** The puzzle satisfaction of finding the perfect sequence of 3 moves. Every turn is a solvable puzzle
- **Key insight for TORCH:** Into the Breach shows ALL information to the player. No hidden dice rolls. TORCH could show outcome probabilities before the snap to give players agency (and teach the system)

---

## Synthesis: Universal Patterns

### Pattern 1: Zero Choices Before First Play
Every top-performing game gives you ZERO meaningful decisions before your first game. Pre-built decks, scripted opponents, fixed characters. **The first game is for FEELING, not CHOOSING.**

| Game | Choices Before First Play |
|------|--------------------------|
| Marvel Snap | 0 |
| Clash Royale | 0 |
| Balatro | 0 |
| Subway Surfers | 0 |
| Candy Crush | 0 |
| Hades | 0 |
| Celeste | 0 |
| Wordle | 0 |
| Retro Bowl | 1 (team pick) |
| Slay the Spire | 1 (character confirm) |
| Into the Breach | 1 (squad confirm) |
| Hearthstone | 0 |

The only pre-play choice that survives is **team/character selection** — and only when limited to 1 option initially (Slay the Spire) or when it's emotionally meaningful (Retro Bowl's NFL team pick).

### Pattern 2: Teach by Doing, Never by Telling
- Subway Surfers: first obstacle = first lesson
- Celeste: level geometry = curriculum
- Candy Crush: first level = tutorial
- Hades: Skelly exists but is optional
- Clash Royale: "almost no text bubbles"
- Balatro: tutorial IS the first run

The pattern: **the first game IS the tutorial, not a separate thing that precedes the game.**

### Pattern 3: Progressive Disclosure
Every successful game hides 80%+ of its systems initially:
- Marvel Snap hides snapping, collection levels, competitive ranks
- Clash Royale hides upgrading, clans, chest timers
- Hearthstone locks classes, modes, and features behind progression
- Hades reveals mirror upgrades, weapon aspects, and NPC systems through death

**Rule: If the player doesn't need it in the first game, they shouldn't know it exists.**

### Pattern 4: The First Game Should Be Unlosable (or Losing Should Feel Good)
- Candy Crush Level 1: impossible to fail
- Clash Royale first battle: fully guided
- Marvel Snap tutorial: scripted win
- Fall Guys tutorial: no elimination possible
- Hades: death IS progression (you unlock story)
- Balatro: you CAN lose the tutorial (rare exception that works because runs are fast)

### Pattern 5: Familiar Scaffolding Reduces Cognitive Load
- Balatro uses poker hands (universally known)
- Retro Bowl uses NFL teams (emotional pre-attachment)
- Marvel Snap uses Marvel characters (brand recognition)
- Wordle uses English words (literally everyone knows)

**TORCH has football** — a massively familiar framework. Touchdown, first down, interception, sack — players already know these concepts.

---

## Recommendations for TORCH

### Current Flow: Home -> Team Select -> Coin Toss -> Gameplay
(Draft steps exist but can be simplified for first play)

### Recommended First-Time Flow: Home -> Team Select -> Gameplay (with integrated coin toss)

#### Recommendation 1: Eliminate Pre-Game Decisions for First-Time Players
**Current:** Player must pick a team, draft 4 offense + 4 defense players, draft 5+5 plays, do a coin toss, THEN play.

**Recommended first-time flow:**
1. **Home** (1 tap: "PLAY")
2. **Team Select** (1 tap: pick Canyon Tech or Iron Ridge — this is emotionally meaningful and fast)
3. **Gameplay begins** with pre-built roster and plays, coin toss animated as the first moment of the game itself (not a separate screen)

That's **2 taps to gameplay** — competitive with the best in the industry.

**For returning players:** Full draft flow unlocks after first game. "You've proven yourself, Coach. Now build YOUR team."

#### Recommendation 2: Make the Coin Toss Part of Gameplay, Not a Separate Screen
The coin toss is a real football moment. Don't remove it — but don't make it a gate. Integrate it as the **opening animation of the gameplay screen**. The coin flips, the player taps "HEADS" or "TAILS" on the field itself, and the game flows directly into the first snap.

This removes one full screen transition while preserving the football ritual.

#### Recommendation 3: Pre-Build First Game Roster and Plays
For first-time players:
- Auto-assign the "best" 4 offense + 4 defense players for the chosen team
- Auto-assign a balanced play selection (mix of run/pass for offense, mix of coverage for defense)
- Skip draft entirely

The draft is a great system for retention — it gives DEPTH and OWNERSHIP. But depth before the first snap is a retention killer. Save it for game 2+.

#### Recommendation 4: Teach Through the First Drive, Not Before It
Instead of explaining badge combos, TORCH points, play-action bonuses, etc. before gameplay:

1. **First snap:** Just show "tap a player, tap a play, hit SNAP." That's it.
2. **First completion:** "Nice! Your play gained 8 yards." Show yard gain animation.
3. **First badge combo (engineered to happen):** "COMBO! Sampson's SPEED_LINES badge fired on that deep pass! +3 yards!" Brief highlight, then move on.
4. **First TORCH card (given, not chosen):** "You earned a TORCH card! It'll boost your next play." Auto-play it.
5. **First touchdown:** Full celebration. This is the first "win" moment.

Each mechanic taught at the MOMENT it's relevant, never before.

#### Recommendation 5: Make the First Game Unlosable (Invisibly)
Apply hidden difficulty modifiers for the first game:
- AI set to Easy (already exists)
- Player gets +3 yard bonus (beyond normal Easy bonus)
- AI never goes for it on 4th down (less confusing)
- No injuries in first game
- Reduce turnover rates by 50%

The player should score a touchdown within the first 5-6 snaps. That TD celebration is your "hook moment."

After the first game: "You won! Ready to build your own team?" Unlock full draft for game 2.

#### Recommendation 6: Each Screen Should Have ONE Purpose

| Screen | Purpose | Max Time | Taps |
|--------|---------|----------|------|
| **Home** | Excitement + "PLAY" | 3 seconds | 1 |
| **Team Select** | Emotional investment (pick your team) | 5-10 seconds | 1 |
| **Gameplay** | Core loop: pick player, pick play, SNAP, result | All remaining time | Ongoing |

The home screen's job is to make you want to play. Card fan, fire effects, brand energy. One giant "PLAY" button.

The team select screen's job is to create emotional investment. Canyon Tech (air raid) vs. Iron Ridge (ground & pound). Brief team identity, tap to choose.

The gameplay screen's job is EVERYTHING ELSE. Coin toss, play calling, scoring, celebrations, TORCH points, badge combos — all happen here, taught in sequence.

#### Recommendation 7: Always Provide a Skip/Veteran Path
- First-time players: Home -> Team Select -> Auto-Draft Gameplay
- Returning players: Home -> Team Select -> Draft Players -> Draft Plays -> Coin Toss -> Gameplay
- Speed-run option: "Quick Play" button on Home that randomizes team + auto-drafts and starts immediately (1 tap to gameplay)

#### Recommendation 8: Use Football Familiarity as Cognitive Scaffolding
TORCH's biggest onboarding advantage: **everyone knows football.** Players already understand:
- Touchdown = good (6 points)
- Interception = bad
- First down = keep going
- 4th down = risky

Don't explain these. Let them happen. Only explain what's UNIQUE to TORCH:
- Badge combos
- TORCH points
- Card-based play selection
- Torch Cards (power-ups)

Even these can be introduced one per drive, not all at once.

---

## Priority Matrix

| Priority | Action | Impact | Effort |
|----------|--------|--------|--------|
| **P0** | Skip draft for first game (pre-build roster/plays) | Removes 3+ minutes of pre-game decisions | Medium |
| **P0** | Integrate coin toss into gameplay screen | Removes 1 full screen, feels more immersive | Low |
| **P1** | Contextual mechanic teaching during first game | Eliminates need for tutorial screens | Medium |
| **P1** | Hidden first-game difficulty reduction | Guarantees positive first experience | Low |
| **P1** | "Quick Play" one-tap option for returning players | Respects veteran time | Low |
| **P2** | Progressive feature unlock (draft unlocks after game 1) | Prevents cognitive overload | Medium |
| **P2** | First TD within 5-6 snaps (engineered hook moment) | Creates emotional peak early | Low |

---

## Sources
- [Apple Developer: Onboarding for Games](https://developer.apple.com/app-store/onboarding-for-games/)
- [Adrian Crook: Best Practices for Mobile Game Onboarding](https://adriancrook.com/best-practices-for-mobile-game-onboarding/)
- [GameAnalytics: 10 Tips for Great FTUE in F2P Games](https://www.gameanalytics.com/blog/tips-for-a-great-first-time-user-experience-ftue-in-f2p-games)
- [Mobile Game Doctor: FTUE & Onboarding](https://mobilegamedoctor.com/2025/05/30/ftue-onboarding-whats-in-a-name/)
- [All That's Epic: Why Players Quit in the First 10 Minutes](https://allthatsepic.com/blog/why-players-quit-in-the-first-10-minutes-and-how-to-stop-it)
- [Celia Hodent: The Gamer's Brain - UX of Onboarding](https://celiahodent.com/gamers-brain-ux-onboarding/)
- [UX Design / Leo Brouard: Building the Right Onboarding Experience](https://uxdesign.cc/games-ux-building-the-right-onboarding-experience-a6e99cf4aaea)
- [Udonis: First-Time User Experience in Mobile Games](https://www.blog.udonis.co/mobile-marketing/mobile-games/first-time-user-experience)
- [PocketGamer: FTUE Clash Royale](https://www.pocketgamer.biz/news/62827/ftue-clash-royale/)
- [Medium / Matt Le: Clash Royale Sticky FTUE](https://medium.com/@Matthewwspencerr/clash-royale-creating-a-sticky-first-time-user-experience-113e17b18f36)
- [Medium / Giulia Palma: 6 Lessons from Clash Royale Onboarding](https://medium.com/design-bootcamp/6-lessons-from-clash-royal-onboarding-40ed13bf2483)
- [Balatro Wiki: Tutorial](https://balatrowiki.org/w/Tutorial)
- [Marvel Snap Zone: Beginner's Guide](https://marvelsnapzone.com/marvel-snap-beginners-guide/)
- [Deconstructor of Fun: Marvel Snap Deconstruction](https://www.deconstructoroffun.com/blog/2023/5/23/marvel-snap-the-definitive-deconstruction)
- [Hearthstone Wiki: New Player Experience](https://hearthstone.wiki.gg/wiki/New_player_experience)
- [Mastering Runeterra: New Player Guide](https://masteringruneterra.com/legends-of-runeterra-new-player-guide/)
- [UserOnboarding Academy: Candy Crush Onboarding](https://useronboarding.academy/user-onboarding-inspirations/candy-crush)
- [Rubyroid Labs: Onboarding UX Strategies First 60 Seconds](https://rubyroidlabs.com/blog/2026/02/ux-onboarding-first-60-seconds/)
- [iABDI: The $10,000,000 Tutorial](https://www.iabdi.com/designblog/2026/1/13/g76gpguel0s6q3c9kfzxwpfegqvm4k)
- [Hades Wiki: How to Play Guide](https://hades.fandom.com/wiki/How_to_play_guide_for_Hades)
- [Into the Breach Wiki: How to Play Guide](https://intothebreach.fandom.com/wiki/How_To_Play_Guide_For_Into_The_Breach)
- [Retro Bowl Wiki: Gameplay](https://retro-bowl.fandom.com/wiki/Gameplay)
- [CrazyLabs: 5 Tips for Successful Mobile Games Onboarding](https://www.crazylabs.com/blog/tips-for-successful-mobile-games-onboarding/)
- [Keewano: FTUE 5 Tips for Mobile Games](https://keewano.com/blog/first-time-user-experience-ftue-mobile-games/)
