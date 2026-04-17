# TORCH through Schell's Deck of Lenses — 100 Improvement Suggestions

**Source:** Jesse Schell, *The Art of Game Design: A Book of Lenses* (3rd ed.). Lenses 1–79 confirmed from published cheat-sheets; lenses 80–113 mapped from domain knowledge of Schell's book (names and sequence approximate, concepts accurate).

**Rules:** one concrete TORCH improvement per lens, grounded in actual code/state. No hypotheticals without a mapping.

**Key to abbreviations:** TS = team select · HUD = gameplay heads-up display · v0.40 = current dev state · E8 = Ember Eight conference.

---

## Chapters 1–4 — Designer / Experience Foundations

**#1 · Emotion** — *What emotions should players feel?* → Add an emotional curve spec to each snap result: the 5-phase sequence (snap/trail/impact/context/ready) currently scales by yardage but not by *narrative stakes*. A 4th-and-goal TD should feel different from a blowout TD even at the same yardage.

**#2 · Essential Experience** — *What's the core feeling you're selling?* → Write a single sentence on a sticky and post it at the top of `CLAUDE.md`: "TORCH is the feeling of a Saturday night upset coached from your phone." Every new feature gets challenged against that sentence.

**#3 · The Venue** — *Where and when will this be played?* → The app is designed for one-handed couch/bed play but the tap targets in `pregame.js` runway scenes still assume two-handed desk play. Move the coin-toss tap zone to the bottom 60% of the viewport.

**#4 · Surprise** — *Where are the surprises?* → The AI's TORCH card usage is currently deterministic per difficulty. Add a 10% chance for Hard AI to play an unexpected Gold card on a seemingly-routine 2nd-down — the kind of moment a broadcaster would clip.

**#5 · Fun** — *What's fun here?* → Audit the 40-play game loop: smoke-test with a stopwatch and identify the 3 least-fun plays per drive. The "punt from your own 20" drives likely fail this test — consider auto-punting with a cinematic cut.

**#6 · Curiosity** — *What questions do players want answered?* → "Can I beat Hard with Raccoons?" is a curiosity TORCH doesn't surface. Add a "challenge ladder" view in settings showing `team × difficulty` checkerboard of best results — the empty cells *are* the curiosity hook.

**#7 · Endogenous Value** — *Do the game's rewards matter inside the game?* → TORCH points already do (score = wallet). But unlocks (achievements, streaks) currently have no in-game value. Make an achievement cash in for a Bronze Torch card on your next run.

**#8 · Problem Solving** — *What problems are players solving?* → The core problem right now is "which card beats this coverage?" — but that's the *same* problem every snap. Add a meta-problem: "which personnel package survives the 20-play budget?" Expose a heat map of player usage during halftime.

**#9 · Elemental Tetrad** — *Mechanics + aesthetics + story + technology all aligned?* → Story is the weakest leg. Coach-ghost lore exists in `docs/TORCH-EMBER-EIGHT-BIBLE.md` but never surfaces in gameplay. A single pregame "the ghost speaks" beat per team would close that gap.

**#10 · Holographic Design** — *Does every piece reflect the whole?* → The helmet generator's warm gold + oxblood palette doesn't match in-game HUD chrome which leans cold ice-blue (Spectres-era legacy). Pick one: warm gameday or cold broadcast.

---

## Chapters 5–7 — Design Process

**#11 · Unification** — *Is there a unifying theme?* → Theme today is "TORCH = fire, football = night game." Make the crowd-cheer audio respond to fire metaphors (embers snap → brief chime) so theme reaches the audio layer too.

**#12 · Resonance** — *What makes it resonate with the player's life?* → College football Saturdays. Lean into weekly rhythm: Daily Drive could become "Saturday Slate" — 8 quick drives every 7 days, restoring the feel of a CFB game week.

**#13 · Infinite Inspiration** — *Where do new ideas come from?* → Seed `docs/TORCH-INSPIRATION-LOG.md` — a running list of non-game references (Friday Night Lights, HBO Winning Time, NFL Films orange-tinted footage) and their specific steals.

**#14 · Problem Statement** — *What specific problem does this solve?* → Each feature PR should open with a one-line problem statement. Retrofit the top of every `.js` file docstring with "This module solves: X" for clarity.

**#15 · Eight Filters** — *Does the idea pass: Artistic, Demographic, Experience, Engineering, Social/Community, Playtesting, Profitability, Innovation?* → Run the helmet generator's standalone-product idea through these 8 — it failed on Profitability (small niche) and Engineering (Adobe Stock license), which is why I'd recommend open-sourcing it instead.

**#16 · Risk Mitigation** — *What's likely to fail?* → v0.40's biggest risk is 8-team scope bloat. Ship a strict cap: 2 new teams per quarter of the *release schedule*, never 4+ at once, to keep QA tractable.

**#17 · Toy** — *Is this fun to fiddle with without a goal?* → The helmet generator is already a great toy. Make the kickoff coin on the home screen (archetype E) a real physics-tap toy — players flip it idly and it never stops satisfying.

**#18 · Passion** — *Are you still personally excited?* → A "fieldnotes" mode: let the player save a single-snap GIF of their favorite moment to a scrapbook screen. This gives the *developer* a reason to care about every snap's cinematic quality.

---

## Chapter 8 — The Player

**#19 · Player** — *Who am I making this for?* → Player audit: roguelike card-game veterans + college football fans + indie-narrative seekers. Make onboarding explicit about this — the first-time "welcome" modal should say "if you liked Balatro, stay."

**#20 · Pleasure** — *What specific pleasures are available?* → Schell's pleasures: anticipation, completion, discovery, mastery, difficulty, triumph over adversity, collection, surprise, imagination, sharing, schadenfreude. TORCH nails 7 of 11. Weak on *collection* (no card binder) and *imagination* (no team customization in single-game mode).

**#21 · Flow** — *Are players in the zone?* → Measure it: log time between snap-tap and result-dismiss. If median climbs past 8s, pacing has drifted. Add to `balanceTest.js`.

**#22 · Needs** — *Does this satisfy a Maslow-level need?* → Esteem (winning), belonging (team identity), self-actualization (coaching a ghost's legacy). Make esteem earned, not given — don't give achievements for merely *finishing* a game.

**#23 · Motivation** — *What keeps players playing?* → Intrinsic: the counter matrix puzzle. Extrinsic: TORCH points + achievements. Right now achievements fire silently. Add a 600ms celebration + share card.

**#24 · Novelty** — *Where's the newness?* → The 8 teams are new but the 40-play loop is identical per game. Add micro-variation: one random "weather card" per game (e.g. "10mph wind → -2 to all long passes") posted pre-kickoff.

**#25 · Judgment** — *Are choices weighty?* → Card discards are currently frictionless. Make the discard animation HEAVY (slow, deliberate drag-off-table) so discarding a star card *feels* like losing something.

**#26 · Functional Space** — *Does the space serve play?* → The HUD takes 80px top + 56px result area + 24px timeline + hand = ~280px of chrome on a 720px game area. That's too chrome-heavy. Fold result and timeline into a single 70px band.

---

## Chapter 9–10 — Game Mechanics 1 (Time, State, Objects)

**#27 · Time** — *What's the pacing and duration?* → A full TORCH game is ~12 minutes. Mobile micro-session fit: add "save-after-any-snap" and let a commute-interrupted game resume mid-drive.

**#28 · State Machine** — *What states exist and how do they transition?* → Document the `GS.phase` state graph in `docs/` — it's currently implicit in `gameplay.js`. A state chart would catch edge cases (e.g. halftime timer during a conversion).

**#29 · Secrets** — *What's hidden from whom?* → The AI's next play is hidden (good). The *defensive coverage* is labeled pre-snap (a crutch). Make coverage reveal a Bronze Torch Card rather than a default — forces players to learn the tells.

**#30 · Emergence** — *What combos emerge?* → Card combos exist but aren't surfaced. Add a "YOU DISCOVERED" toast the first time a player triggers each of the 7 combos.

**#31 · Action** — *What can players do?* → The verb list is short: pick card, discard, buy. Add one new verb: *rewind* — a Silver card lets you replay the last snap with one card swapped.

**#32 · Goals** — *Clear and achievable?* → Game-level goal is always "win" (implicit). Add season-level goal: the in-game "week" tells you this is "Must Win" / "Rivalry" / "Trap Game" and adjusts difficulty narratively.

**#33 · Rules** — *What are the rules?* → Document the punt/FG distribution tables from `CLAUDE.md` *inside* the game as a "Coach's Notebook" reference screen accessible from pause.

**#34 · Skills** — *What skills do players exercise?* → Primarily: reading coverage + managing the discard economy. Secondary: none. Add a skill: player-trait *recognition* — over time, players should remember "BURNER + deep pass + Cover 3 = exploit."

**#35 · Expected Value** — *What's the perceived vs actual value?* → The Torch Store's 60% bronze / 30% silver / 10% gold distribution isn't shown. Reveal the odds in the shop UI — converts "unfair RNG" complaints into "strategic depth."

**#36 · Chance** — *How does randomness feel?* → Sack-cancel on Easy (30%) and INT-cancel on Easy (40%) are hidden mercy. Make them visible as a "LUCKY" stamp post-play so players notice difficulty's kindness.

**#37 · Fairness** — *Is play symmetric?* → AI gets difficulty-scaled OVR mods (+2 Hard, -3 Easy) but human doesn't. Add a difficulty-scaled "coaching bonus" for humans on Hard: +5% card draw weight toward strong matchups.

**#38 · Challenges** — *Variety and progression?* → Difficulty is binary-ish (Easy/Med/Hard). Add conditional challenges: "beat Serpents starting from your own 5" unlocks in the 3rd game vs them.

**#39 · Meaningful Choices** — *Do choices matter?* → The 4 play cards in hand often include 3 that are obviously dominated. Make the draw weight punish obvious dominance — don't deal a Cover-3-exploit when coverage is already Cover-3 for 3 of 4 cards.

**#40 · Triangularity** — *Safe vs risky tradeoff?* → (Schell's "triangularity" — risk-reward spectrum.) 4th-and-short currently has three outcomes: convert (good), fail (bad), field-position-neutral. Add a fourth: *miracle* — a gold card effect that turns 4th-and-1 into a chunk play.

**#41 · Skill vs Chance** — *What's the mix?* → Personnel matchups are skill; weather + RNG are chance. Track per-player: what's their skill-to-chance outcome ratio? Surface it in career stats: "78% of your wins came from skill."

**#42 · Head and Hands** — *Mental vs physical?* → TORCH is nearly pure head-game. Add one hand moment per game: the *coin flip* is already one. Consider: a drag-to-pass mini-interaction on the single biggest play of each game.

**#43 · Competition** — *Fair competitive measure?* → No PvP today. Add async leaderboards per-team: "Pronghorns coaches ranked by season record." Cheap to build via existing career stats.

**#44 · Cooperation** — *Cooperation mechanics?* → None today (single-player). Add "franchise mode" later where you hand off a season to a friend mid-year.

**#45 · Competition vs Cooperation** — *Balance between them?* → N/A in single-player; defer.

---

## Chapter 11 — Balance

**#46 · Rewards** — *What rewards, how often, how exciting?* → Reward cadence audit: TORCH points every 2-3 plays, achievements every 2-3 games, unlocks every 10 games. The 10-game gap is too long. Add a "minor unlock" every 3 games (e.g. new coin-flip sound, alt wordmark).

**#47 · Punishment** — *Are punishments fair?* → Losing a game costs nothing but 12 minutes. The cost should match: losing should advance a "cursed" meter for that team which grants a single free retry of the lost game.

**#48 · Simplicity/Complexity** — *Innate vs emergent?* → Innate rules: ~20 (plays, phases, timing). Emergent complexity: combos, counter matrix, personnel heat. Ratio is healthy. Don't add more innate rules before documenting them in-game.

**#49 · Elegance** — *Does each element serve multiple purposes?* → The flame icon serves: brand, HUD, cards, achievements, app icon (soon), wordmark, pregame runway. That's 7. Good elegance score.

**#50 · Character** — *What makes it memorable?* → The 4-layer flame + 9-layer leather football + warm-gold/torch-red palette + Teko masthead. Defensible. Strengthen by committing the helmet generator's visual style to the full game chrome.

**#51 · Imagination** — *How much is left for the player?* → Currently players don't imagine much — the game shows everything. Leave a gap: never show the *exact* yards a star player contributed; the player has to feel it.

**#52 · Economy** — *Earning and spending balanced?* → TORCH points 15/TD, cards 15-200. Math checks. Expose a running average earn-rate in the store UI so players can mentally budget.

**#53 · Balance** — *Does it feel right?* → Smoke 1382/1382 suggests yes. But qualitative balance: does a v0.40 game of the underdog Raccoons feel as dramatic as Pronghorns? Playtest specifically and tune.

---

## Chapter 12 — Puzzle Design

**#54 · Accessibility** — *Easy to start solving?* → Onboarding gives a gold Sure Hands card + 1st-and-goal. Good. Add: first Hard game starts with a safe 1st-and-10 at midfield.

**#55 · Visible Progress** — *Can players see advancement?* → Drive position, down/distance, score, clock — all visible. Torch Point total is hidden during negative plays (intentionally) but the mental model might benefit from a faded "you would've earned +X" ghost.

**#56 · Parallelism** — *Multiple solvable problems?* → The 4-card hand gives parallelism within a snap. The 40-play game gives parallelism across drives. Good.

**#57 · Pyramid** — *Sub-puzzles feeding a big one?* → Currently flat: every snap is a one-off puzzle. Add an arc: first 10 plays establish tendencies the *defense* exploits in plays 30-40 — so the game becomes "disguise yourself."

**#58 · Puzzle** — *Overall puzzle quality?* → The 10 Schell principles are mostly hit. Weakest: #5 (parallelism) and #10 (give hints). Add: occasional coach whispers ("they're cheating to the run side").

---

## Chapter 13 — Interfaces

**#59 · Control** — *Do players feel in control?* → Yes for card selection; no for AI defensive calls. Surface one lever: let players "predict defense" pre-snap for a bonus if right.

**#60 · Physical Interface** — *Tactile input mapped correctly?* → Touch on phone, no physical controller. Haptics facade exists (v0.40 phase 3). Add: Taptic feedback on the SNAP button press so the gesture feels load-bearing.

**#61 · Virtual Interface** — *On-screen info well presented?* → Gameplay HUD is busy (17+ elements). Implement a "Focus Mode" — long-press to hide everything non-essential for the next snap.

**#62 · Transparency** — *Is the interface invisible?* → For veterans yes; for first-timers no. Add a 30-second "turn off hints" toggle — some players want the hand-holding gone aggressively.

**#63 · Feedback** — *Do players know what happened?* → The 5-phase sequence is strong here. Weakness: when a Bronze card did nothing notable, the feedback is silent. Add a 100ms chime even for "no-op" plays.

**#64 · Juiciness** — *How rich is the feedback?* → The additive trail canvas + impact rings + shake are juicy. The post-game screen is NOT — it's a flat list. Add a fireworks celebration for TDs and a dark wash for losses.

**#65 · Primality** — *What primal instincts does this hit?* → Tribe (team identity), territorial acquisition (yards), competition. Weak: collection instinct. Add a "your coached teams" gallery that fills in as you play each of the 8.

---

## Chapter 14 — Richness / Secondary Design

**#66 · Channels and Dimensions** — *Info across channels?* → Currently: visual (primary), audio (secondary), haptics (tertiary). Add one more: *dynamic typography* — when the run-game is hot, the play-card type weights shift heavier as if the game itself is agreeing.

**#67 · Modes** — *Distinct gameplay modes?* → Single-game (core), Daily Drive (light). Career / franchise is on the roadmap. Don't add a 4th before the first 3 hit parity.

**#68 · Moments** — *Where are the emotional beats?* → TDs, turnovers, 4th-down stops, Torch Store visits. Add: "The Drive" detection — if a player runs a 10-play 80-yard game-winning drive, mark it permanently in career stats as "The Drive #7."

**#69 · Interest Curve** — *Engagement mapped over time?* → Current curve: opens low (pregame), spikes at snap, falls between plays. Flatten troughs: add a 3-second "sideline reaction" clip (crowd cheer + mascot dance) on any play > 15 yards.

**#70 · Inherent Interest** — *What's immediately interesting?* → The coin flip is the strongest opening inherent-interest. Lead with it (per home-screen archetype E).

**#71 · Beauty** — *Is it beautiful?* → Dark canvas + neon trails + additive blending = yes. Weakness: the `src/data/gameConditions.js` weather renders are crude. Upgrade weather with a GSAP timeline per condition (Lottie was explored and pulled out 2026-04-16 — GSAP is already load-bearing and the default for animation work).

**#72 · Projection** — *Does the player feel themselves there?* → Coach-avatar creation exists but barely surfaces. Put the coach avatar in the scorebug during gameplay — tiny silhouette that reacts to outcomes.

---

## Chapter 15 — Story

**#73 · Story Machine** — *Do rules generate stories?* → Yes — emergent. Every game tells a story because of drive position + score arcs. Strengthen: auto-generate a 3-sentence summary post-game ("You were down 14 at the half; Henderson's 45-yard TD run with 1:12 left sealed it").

**#74 · Obstacle** — *Who/what's in the way?* → The opposing team's coach is generic. Give each team an identifiable "rival DC" with a single-line quote they say pre-snap against blitzes.

**#75 · Simplicity and Transcendence** — *Familiar core, magical extension?* → Football is familiar. The magical extension is the Torch Cards. Make the cards *more* magical: one Gold card per team should have a *team-specific* flavor (e.g. Salamanders' "Karst Breakthrough" = runner phases through defender).

**#76 · Hero's Journey** — *Archetypal structure?* → Currently: none. A season mode (deferred) would provide it — Call → Crossing → Trials → Bowl → Return. Defer but spec now.

**#77 · Weirdest Thing** — *Do unusual elements confuse?* → The ghost-coach lore is the weirdest thing. Introduce it carefully — a tooltip on the coach avatar, not a cutscene.

**#78 · Story** — *Does the game need one?* → Yes, eventually — single-game is fine without, but the lore investment in the bible is wasted if it never surfaces. Add *one* narrative moment per game: a "player call-out" pre-snap.

---

## Chapter 16 — Indirect Control

**#79 · Freedom** — *When do players feel free?* → Card selection: free. Defensive call: constrained. Personnel: constrained. Open up personnel: let players substitute 1 player per drive mid-game.

**#80 · Indirect Control** — *How do you guide without controlling?* → The tier filter on team select is a great example. Extend the same pattern: difficulty selection should have a *recommended* tier based on career stats.

**#81 · Collusion** — *Do NPCs prompt specific player behavior?* → AI opponent currently doesn't taunt or encourage. Add a coach-voice line ("you won't convert this") on 4th-and-long — triggers the ego response that makes players go for it.

**#82 · Constraints** — *Shape choices with limits?* → The 8-card hand is a great constraint. Tighten further on Hard: only 6 cards in hand for Hard players. The scarcity forces skill.

**#83 · Goals as Control** — *Channel players with goals?* → The 40-play budget is a budget, not a goal. Add mini-goals: "survive the 3rd quarter in the red zone" posts mid-game.

**#84 · Visual Design as Control** — *Aesthetic hints?* → Torch red for negative, torch gold for positive — already used. Push further: the *field tint* should shift warm/cool based on momentum.

**#85 · Characters as Control** — *NPCs guide play?* → Star players' flame-pip halos could *intensify* when they're the optimal matchup — a silent visual nudge.

**#86 · Music as Control** — *Audio shaping behavior?* → Crowd loops currently flat-stereo. Swell intensity with score differential — leading by 3 scores → low rumble, close game → higher-frequency buzzing.

---

## Chapter 17 — World / Setting

**#87 · World** — *Is the world coherent?* → E8 bible is coherent but unseen in-game. Each team's field should have 1-2 world-specific touches (Pronghorns: prairie grass edge; Serpents: cypress-swamp sideline fog).

**#88 · Avatar** — *Is the avatar projection-ready?* → Coach avatar is thin. Add 4-8 selectable silhouette styles (clipboard, headset, hoodie, whistle) per coach creation.

**#89 · Transmedia** — *Does the world extend beyond the game?* → Not yet. Start: a `docs/TORCH-FIELDBOOK.md` in-repo fanfic — the kind of text you'd paste on the subreddit when the game launches.

**#90 · Community** — *Is there a player community?* → Not yet. When you launch: a Discord, a weekly "TORCH Scoreboard" post, a shareable share-card format.

---

## Chapter 18 — Character

**#91 · Character** — *Are characters memorable?* → Ghost coaches ARE memorable in the bible. Star players are not. Rewrite star-player bios in the pregame roster screen from "6'2, 4.4 40" to "the kid who flipped the state title with a broken thumb."

**#92 · Inner Contradiction** — *Do characters carry tension?* → Current star traits are one-note (TRUCK STICK = one thing). Give each star a second, contradicting trait (TRUCK STICK + FRAGILE CONFIDENCE — strong on first down, weaker on 3rd-and-long).

**#93 · Character Transformation** — *Do they change?* → No transformation arc today. Add: a star player's trait upgrades if they dominate 3 games in a row — a small arc across a career.

**#94 · Status** — *Are status changes visible?* → Streaks are, but the *team's* status vs the league isn't. A standings screen — even fake — would give every game stakes.

---

## Chapter 19 — Characters / Worlds

**#95 · Interest** — *Is every moment interesting?* → The 20-second "between plays" lull is the weakest. Fill it: a mini-commentary card ("THIRD DOWN CONVERSIONS — you're 3 of 4"), 2-second dwell.

**#96 · Visible Action** — *Can the player see what's happening?* → The trail canvas is great. Add ghost-trails showing the top 2 *candidate* plays you rejected for half a second after the snap.

**#97 · Anticipation** — *Is there healthy anticipation?* → The 5-phase sequence builds anticipation well. Strengthen: on 4th down, add a 300ms full-screen darken before snap ("the whole stadium is quiet").

**#98 · Reward** — *Do rewards feel rewarding?* → See #46. Additionally: a *first-time* reward for each achievement should feel bigger than repeat-earning the same class — a 2s animation, not 800ms.

**#99 · Delight** — *Are there small delights?* → The fire-particle drift on TD cards is delightful. Add: a similar drift on the home-screen flame just to remind players the app is alive between sessions.

**#100 · Atmosphere** — *Is atmosphere consistent?* → Stadium-at-night is consistent in-game. Menu chrome breaks it with flat dark. Add faint ember particles to menu bg.

---

## Chapters 20+ — Community / Responsibility / Finishing

**#101 · Community** — *Do players connect?* → Pre-launch: design for shareability. Every share card should have a signature visual TORCH users recognize across social media.

**#102 · Griefing** — *How to prevent players harming each other?* → N/A in single-player. When async multiplayer ships: rate-limit smack-talk in shared leaderboards.

**#103 · Love** — *Do you love this game?* → Obvious but underrated — if the designer's love isn't in each feature, players feel it. Audit the last 3 PRs: which felt like obligation? Those may need a rethink.

**#104 · Playtest Demographics** — *Are you testing with your actual audience?* → Currently internal-only. Add a "friends test" before v0.41: 5 people who aren't game devs, measure first-session completion rate.

**#105 · Iteration** — *Are you iterating enough?* → Yes — commit velocity is healthy. But: tag a "design review" session monthly where you open the game as a new player and take notes.

**#106 · Responsibility** — *What's your ethical responsibility?* → No loot boxes. No real-money pressure. Monetization plan (if ever): cosmetics + a single one-time purchase for a "career mode" expansion, nothing predatory.

**#107 · Transformation (of the player)** — *Does the player change?* → Mastery arc exists (you get better at reading coverage). Make it visible: "YOU'VE GOTTEN BETTER AT" mid-career stat that highlights specific improvements.

**#108 · Secret Purpose** — *What are you really making?* → A love letter to college football Saturdays, encoded as a card game. Say it. Put it in the about screen.

**#109 · The Designer's Vow** — *Commitment to the craft?* → Post a changelog that reads like a designer's diary, not a marketing doc. "I spent 3 days on this; here's what I learned."

**#110 · Playtesting** — *Are you playtesting the RIGHT things?* → You're testing mechanics (smoke test). You're NOT testing the emotional arc. Add a 5-question emotional-review after each internal playtest.

**#111 · Business** — *Can this sustain?* → Sizing check: at $5 one-time purchase + 10% conversion of free players, need 20,000 players to hit $10k gross. Realistic for year 1? Probably not without a launch campaign.

**#112 · Their Secret** — *What do experienced players know that new players don't?* → The counter matrix. Make it discoverable, not documented — reward the first time a player *notices* the pattern.

**#113 · The Book** — *Is everything held together?* → Write a one-page design doc you personally re-read every Monday morning. Not CLAUDE.md — a *design* north star.

---

## Top 15 highest-leverage improvements

In order of effort × impact:

1. **#12 Resonance — "Saturday Slate"** replacing/augmenting Daily Drive. Weekly 8-drive cadence. 1 week to spec + build. High emotional resonance.
2. **#29 Secrets — coverage is a pay-to-see secret.** Remove the free coverage label; make it a Bronze Torch card. Rebalances the whole reading-the-defense game.
3. **#61 Transparency — HUD Focus Mode.** Long-press hides non-essential chrome. Makes the best moments cleaner.
4. **#64 Juiciness — post-game screen upgrade.** Fireworks on TDs, dark wash on losses, emoji on ties. 2-day polish.
5. **#68 Moments — "The Drive" memorization.** Auto-mark any 10+ play game-winning drive in career stats with a number. Permanent memorabilia.
6. **#75 Simplicity/Transcendence — team-specific gold cards.** One per team, 8 new cards, 2 weeks of design + balance.
7. **#86 Music as Control — dynamic crowd loops.** Swell intensity with score differential. 1 week audio work.
8. **#91 Character — star-player bios in Coach's Notebook voice.** Not "6'2 4.4" — "the kid who flipped the state title."
9. **#108 Secret Purpose — about screen manifesto.** One paragraph. Explains what you're actually making.
10. **#33 Rules — "Coach's Notebook" in-game reference.** Punt/FG tables + counter matrix + TORCH card pricing visible mid-game.
11. **#46 Rewards — unlock cadence fix.** Minor unlock every 3 games (alt wordmark, coin-flip sound). Prevents 10-game reward deserts.
12. **#69 Interest Curve — 3-second "sideline" beat** on plays > 15 yards. Crowd cheer + mascot dance.
13. **#84 Visual Design as Control — field warm/cool tint** tracking momentum. 1-day shader work.
14. **#23 Motivation — achievement celebration animation.** 600ms + share card. Makes silent unlocks loud.
15. **#50 Character — commit the helmet generator's warm-gold palette** to the full game chrome (replace Spectres-era ice-blue legacy).
