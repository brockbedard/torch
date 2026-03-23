# TORCH — Comprehensive Project Review
## 3,000-Game Simulation Analysis · Architecture Review · Market Assessment · Blind Spots

---

## 1. ARCHITECTURE & ENGINEERING — HONEST ASSESSMENT

### What You're Doing Right

**Vanilla JS + Vite is the correct choice.** No framework overhead, fast load times, simple mental model. For a card game targeting mobile browsers, this beats React/Vue. Your bundle is tiny. Your dev server is instant. You can ship to any platform later (Capacitor, TWA, PWA) without framework lock-in.

**Mobile-first is correct.** 71% of mobile gamers are on Android. Your CSS custom properties, Bebas Neue + Press Start 2P font stack, and broadcast aesthetic all work on small screens. The existing UI from the draft screens proves the visual design translates.

**Spec-first development is correct.** Most solo devs build first, design later. You have 4 spec documents, a 1700-line simulation engine, and 3000 games of balance data BEFORE writing the gameplay code. This is unusually disciplined and it will pay off when you're not rewriting the engine 6 times.

### What Concerns Me

**The monolith problem.** Your index.html is 3,042 lines of inline JS. The old torch-v0_6_1.html is 3,368 lines. This is a single file with everything — state management, rendering, data, audio, AI calls, card definitions, coverage logic, scenario definitions, formations, all DOM manipulation. The CLAUDE.md lays out a clean modular structure (src/engine/, src/data/, src/screens/, src/ui/) but none of that exists yet. Everything is still in one file.

This matters because:
- Claude Code will struggle to make surgical changes to a 3000-line file without breaking adjacent code
- Two people (you + Claude Code) can't work on different features simultaneously
- Debugging a gameplay bug means reading through card rendering code, audio code, and AI commentary code to find it
- Mobile performance degrades when the browser parses one giant script

**Recommendation:** Before the gameplay engine goes in, the existing index.html needs to be broken into modules. The draft screens, home screen, audio system, and card data should each be their own file. Claude Code's Phase 1 (data layer) is the right first step — it extracts all game data into separate files. But somebody needs to also extract the existing UI code into modules, or the gameplay engine will be bolted onto the side of a monolith.

**No state management pattern.** The existing code uses a mix of global variables (GS, progSel, chosenSide, phase) and closure state. There's no single source of truth for game state. The gameplay engine needs a proper state machine — the CLAUDE.md describes a GameState class, which is correct, but it needs to REPLACE the existing ad-hoc state, not coexist with it.

**No automated testing.** The sim engine tests game balance, but there are no unit tests for the JS code. When Claude Code builds snapResolver.js, there's no test harness to verify it matches the Python sim output. The CLAUDE.md mentions creating src/engine/test.js — this is critical and should happen before any UI integration.

**No error boundaries.** If the gameplay engine throws an error mid-game, the user sees a blank screen or frozen UI. Mobile browsers don't show console errors. You need at minimum a try/catch around the game loop that shows "Something went wrong — tap to restart" rather than a dead screen.

### Grade: B-
The decisions are right. The execution is half-migrated. The Vite setup exists but the code hasn't been modularized yet. This is normal for a project at this stage — you've been designing, not refactoring. But the modularization needs to happen during or immediately after the engine build, not after launch.

---

## 2. CAN THIS GAME SELL? — HONEST MARKET ASSESSMENT

### The Optimistic Case

The mobile card game market generates $2.7 billion annually. Balatro — a solo dev project that started as a resume piece — sold 5 million copies and generated $9.3 million on mobile alone. It proved that a premium card game with roguelike mechanics can find a massive audience on mobile.

TORCH has structural advantages Balatro didn't:
- **Football is the largest sports audience in America.** 200M+ Americans watch college football. The sport's tribal identity (your team, your colors, your scheme) creates emotional investment that poker hands don't.
- **Daily puzzle model (Product A) is proven.** Wordle peaked at 2M daily players. The daily habit loop + share mechanic creates organic virality that premium games lack.
- **No direct competition.** There is no football card game that plays like Balatro. Madden Mobile is a gacha collector. EA College Football is a $70 console game. NFL Clash is dead. The intersection of "football strategy" + "roguelike card game" + "daily puzzle" is an empty niche.
- **Discord community as testing cohort.** You have 9 college football fans who are emotionally invested in the sport. They're your first 9 users, your feedback loop, and your word-of-mouth engine.

### The Realistic Case

Most indie mobile games fail. The top 1% of publishers capture 92.5% of all IAP revenue. Here are the hard truths:

**Football knowledge is a barrier.** Balatro works because everyone knows poker. Five cards, hand rankings, done. TORCH requires understanding that a slant beats Cover 2, that play-action works after establishing the run, that a Cover 0 blitz means gaps are abandoned. Your spec says "You don't need to know football" but the game TEACHES football through pattern recognition. That's a longer onboarding ramp than "pair of jacks beats pair of tens."

**The addressable market is narrower than you think.** 200M Americans watch football, but the overlap of "watches football" + "plays mobile card games" + "willing to learn a new game" is much smaller. Balatro's audience was "anyone who's ever played cards" — that's billions of people. TORCH's audience is "American football fans who like strategy games" — that's maybe 10-20M people, and you need to reach them.

**Freemium daily puzzle (Product A) fights discovery.** Free games live or die on UA (user acquisition). CPI for casual games is ~$1 on Android, ~$2.23 on iOS. If your LTV (lifetime value per user) from ads or IAP doesn't exceed CPI, you can't grow. Wordle solved this with virality (the share grid), not paid UA. TORCH needs its own viral mechanic or it stays in the Discord group forever.

**You're one person.** LocalThunk built Balatro in 2.5 years solo. You're building TORCH while working a full-time TPM job. The scope of what you've designed — 2 teams, 40 plays, 48 players, 21 Torch Cards, 3 difficulty levels, injuries, 2-minute drills, halftime shops, daily puzzles, dynasty mode — is enormous. Shipping a polished v1 that people pay for requires either reducing scope or extending timeline.

### My Assessment

TORCH can generate revenue, but probably not as a standalone premium game on day one. Here's the path I'd bet on:

**Phase 1: Free daily puzzle (Product A).** No monetization. Just the daily game. Share your score. Viral loop. Build audience on the back of college football season (August-January). Target: 1,000 daily players.

**Phase 2: Prove retention.** If Day 7 retention exceeds 20%, you have something. If it doesn't, the game needs redesigning before you monetize anything.

**Phase 3: Monetize with dynasty mode (Product B).** This is where Balatro's model applies. $4.99 premium unlock for the roguelike run mode. Or a battle pass during football season. The daily puzzle is the funnel, the dynasty mode is the revenue.

**Phase 4: Content expansion.** More teams. More players. More Torch Cards. Real college football schedules as daily scenarios. This is where it becomes a platform, not just a game.

**Revenue target (realistic):** If you get 10,000 players with 5% converting to a $4.99 premium mode, that's $2,500/month. Not quit-your-job money, but proof of concept. At 100,000 players with 5% conversion, it's $25,000/month. That's the Balatro trajectory — it took award nominations and press coverage to get there.

### Grade: B+
The idea is strong. The niche is real and empty. The execution risk is high because of scope and the football knowledge barrier. The path to revenue exists but requires disciplined focus on Product A validation before building Product B.

---

## 3. SIMULATION DEEP DIVE — 3,000 GAMES

### Overview (500 games per bucket, 6 buckets)

| Mode | Difficulty | CT Score | IR Score | CT Wins | IR Wins | Ties |
|---|---|---|---|---|---|---|
| CPU vs CPU | Easy | 9.3 | 9.2 | 227 | 207 | 66 |
| CPU vs CPU | Medium | 9.0 | 13.4 | 144 | 308 | 48 |
| CPU vs CPU | Hard | 9.6 | 14.7 | 147 | 315 | 38 |
| Human vs CPU | Easy | 10.6 | 10.9 | 222 | 231 | 47 |
| Human vs CPU | Medium | 10.6 | 12.4 | 199 | 252 | 49 |
| Human vs CPU | Hard | 10.5 | 12.4 | 188 | 264 | 48 |

### Critical Finding #1: First Scorer Wins 70% of Games

This is the biggest balance problem. In 500 Medium CPU games, the team that scores first wins 70% of the time. Only 22% of first-scorers end up losing. This means the game is functionally decided by the first touchdown in most cases.

**Why it happens:** Both teams start at the 50. First possession has a natural advantage — they get the ball with no pressure, fresh play history, and the opponent has no momentum. Once they score 7, the trailing team gets the ball at the 50 but now with the trailing bonus... which only adds +1 mean. That's not enough to reliably score 7+ points. The math: a +1 mean bonus on a play that averages 6 yards means you gain 7 instead of 6. That's one extra yard per play. Over a 6-play drive, that's 6 extra yards — not a touchdown.

**Fix options:**
1. Increase trailing bonus to +2/+3 mean at -7 (currently +1)
2. Give the trailing team a free Bronze Torch Card after opponent scores
3. Turnovers should happen more in the opponent's territory (currently INTs happen where the pass is thrown, not where the defender catches it — and most passes happen at midfield)

### Critical Finding #2: Iron Ridge Dominates on Medium/Hard

CPU vs CPU on Easy: CT 227 wins, IR 207 (52-48%). Balanced.
CPU vs CPU on Medium: CT 144, IR 308 (32-68%). Broken.
CPU vs CPU on Hard: CT 147, IR 315 (32-68%). Broken.

The root cause is structural: **passing has two failure modes (incomplete + sack), running has one (stuff).** CT attempts ~25 passes per game with a ~70% completion rate = ~7.5 wasted snaps. CT also gets sacked ~2.1 times = 9.6 total wasted plays. IR gets stuffed ~10.5 times. Net: CT wastes 9.6 plays vs IR wastes 10.5. Looks close, right?

But sacks are WORSE than stuffs. A stuff gains 0-1 yards. A sack loses 4-10 yards. CT's sacks actively move them backward. IR's stuffs just stall. Over a game, CT loses ~15 yards to sacks while IR loses ~0 to stuffs. That's a 15-yard deficit before any play resolution.

Additionally, when the AI gets smarter (Medium/Hard), it badge-matches better. IR's BRICK badge fires on every power run. CT's FOOTBALL badge only fires on deep passes that complete 43% of the time. Smart AI + consistent combo triggers = IR snowballs.

**Fix options:**
1. CT needs a sack-avoidance mechanic (quick passes should have lower sack rates than they currently do)
2. Stuff penalty should be harsher (-2 to +1 is too generous — should be -3 to 0)
3. Or accept this as team identity and let the human's skill on defense compensate

### Critical Finding #3: Score Distribution Is Football-Accurate But Repetitive

Most common individual score: 7 (20.8% of all team-scores). This is realistic but means most games are 7-7, 7-14, 7-0, or 14-7. The 3-point conversion was supposed to create unique scores (9, 16, 23), but it's chosen too rarely (15% of conversions) and converts only 23-38% of the time.

Score 0 appears 11.2% of the time — meaning 1 in 5 games has a shutout. That's too high for a fun card game. Being shut out feels terrible.

**Fix options:**
1. Increase 3-pt attempt rate (make the AI try it more, especially when up by specific amounts)
2. Reduce shutout rate by giving every team a guaranteed first possession scoring opportunity (start with a Bronze Torch Card, for example)

### Critical Finding #4: Games Are Close But Not Dramatic

69% of games decided by one score (≤8 points). Only 0.4 lead changes per game. 36% comeback wins. This means games are CLOSE but not BACK-AND-FORTH. The typical game is: Team A scores 7, Team B scores 7, Team A scores 7, game over 14-7. There's never a moment where Team B takes the lead back.

Compare to Balatro: every round has a clear "am I going to make this blind or not?" tension that resets. TORCH needs a similar per-drive tension reset. The trailing team bonus helps with comeback WINS but not with lead SWINGS.

### Critical Finding #5: Badge Combos Are Background Noise on Easy, Overpowered on Hard

Easy: 22.5 combos/game (in target). Hard: 43.2 combos/game (way over). This means on Hard, a combo fires on nearly every snap. It stops being a "I found a synergy!" moment and becomes expected. The combo system needs to scale differently by difficulty — Hard AI shouldn't auto-match badges on every play.

### What's Working Well

- Game length (51-52 plays) is consistent and appropriate
- 2-minute drill scores (0.7-0.8/game) create late-game drama
- 4th down conversion rate (45-48%) is perfect coin-flip tension  
- Red zone TD rate (60-67%) is in the NFL range
- Comeback wins (26-39%) feel plausible, not rubber-banded
- Score range (0-36) produces realistic college football scores

---

## 4. THINGS YOU HAVEN'T THOUGHT OF YET

### Game Design Blind Spots

1. **What happens when the player doesn't understand why they lost?** Balatro shows you exactly which jokers fired, which multipliers stacked, and what the target was. TORCH shows a 2-line narrative. If a player calls FOUR VERTS against MOD and gets picked off, do they understand WHY? The game never reveals the matchup table. You designed it so players "learn by pattern recognition" but new players will feel like the game is random, not strategic. You need a post-snap "film breakdown" that shows: your play, their play, the coverage matchup, and what would have been better.

2. **Kneeling breaks the simulation.** Your sim doesn't implement AI kneeling in the 2-minute drill. In a real game, the winning team kneels to burn clock. If you don't implement this, the CPU will keep running plays when it should be running out the clock, gifting the human extra possessions.

3. **The 50-yard-line kickoff creates sameness.** Every new possession starts at the 50. There's no field position battle. In real football, a team might start at their own 20, their own 35, or midfield depending on the kickoff. Starting every drive at the 50 means every drive has the same difficulty — 50 yards to score. Consider varying starting position.

4. **No punt/FG means no strategic decisions.** You removed punting and field goals for simplicity. But punting is a strategic decision (take 3 points or go for 7?) and field goals create scores like 3, 10, 13, 17, 20, 23 — much more varied than the current 0/6/7/8/9/14/15/16 distribution. This might be worth reconsidering for v2.

5. **Torch Cards aren't in the simulation.** The sim runs 3000 games with zero Torch Cards. In the real game, SCOUT TEAM, SURE HANDS, FILM LEAK, and TO THE HOUSE will dramatically change outcomes. Your balance numbers are pre-Torch-Card. Once Torch Cards are live, you'll need to resimulate.

6. **The daily puzzle (Product A) and the full game (current build) are different products.** Product A is "pick one side, play one drive, win or lose, come back tomorrow." The current build is a full 40-play game. These require different UI, different onboarding, and different session lengths. You've spec'd Product A but you're building Product B. Which ships first matters enormously for validation.

### Technical Blind Spots

7. **No offline support.** Mobile users lose connectivity on subways, in stadiums, during commutes. A football card game should work 100% offline. Your current architecture calls an API for AI commentary. If the API is down or the user is offline, what happens? The game engine should be fully client-side with commentary as an optional enhancement.

8. **No analytics.** You have no way to know how far players get, where they drop off, which plays they pick most, or whether they come back tomorrow. Before you deploy to real users, you need basic event tracking. Even just console.log to a free service like Plausible or PostHog would give you the data you need.

9. **No share mechanic.** Wordle's green/yellow/gray grid was the single most important feature for growth. TORCH needs its equivalent. What does a TORCH share card look like? Score, key play, combo count? This needs to be designed before launch, not after.

10. **Sound design is incomplete.** The existing audio is a menu theme and click sounds. The gameplay screen needs: snap sounds, crowd noise, hit sounds, touchdown celebration, sack crunch, interception gasp, 2-minute drill urgency music. Audio is 50% of the feel of a football game. Without it, the game feels like a spreadsheet.

11. **No haptics.** Mobile games use vibration for impact moments — sacks, touchdowns, turnovers, big hits. iOS and Android both support haptic feedback from the browser (navigator.vibrate). This is free dopamine and you should add it.

12. **Landscape mode transition will be jarring.** Your menus are portrait. Your gameplay is landscape. The moment the user hits SNAP, the phone rotates 90 degrees. This needs to be smooth — a transition animation, a "rotate your phone" prompt, or a choice to play in portrait mode (compressed layout). Don't assume users will rotate willingly.

### Business Blind Spots

13. **No landing page.** Before the game exists, you need a page that explains what TORCH is, shows a 15-second gameplay GIF, and collects email addresses. When you have 500 emails, you have a launch audience. Right now your only distribution channel is 9 Discord friends.

14. **College football season is your launch window.** The sport is seasonal. August through January is when attention peaks. If you ship in March, you're launching into the dead zone. Your development timeline needs to target August 2026 for a public beta.

15. **The name TORCH is not Google-able.** Searching "torch game" returns flashlight apps, Olympic torches, and Minecraft mods. "TORCH football" is better but still noisy. You need SEO-friendly naming or a distinctive enough brand that word-of-mouth carries it. The URL torch-two.vercel.app doesn't help either.

16. **You haven't talked to a non-football person yet.** Pookie and Meredith gave you UI feedback. Your Discord group knows football. You need to hand this game to someone who has never watched a football game and see what happens. That's Teresa Torres assumption test #1 and it's the most important test in the whole project.

---

## Summary

**Architecture:** Good decisions, incomplete migration. Modularize before it becomes technical debt. B-

**Market:** Real niche, empty competition, proven comparable (Balatro). High execution risk due to football knowledge barrier and solo dev scope. Path to revenue exists through daily puzzle → retention proof → premium dynasty mode. B+

**Balance:** Teams are even on Easy (52-48), broken on Medium/Hard (32-68 IR). First scorer wins 70%. Games are close but lack dramatic swings. Sack asymmetry structurally disadvantages CT. Fixable with trailing bonus increase and stuff penalty increase. B

**Blind spots:** 16 items above, most critical being: post-snap film breakdown (players need to learn), share mechanic (growth depends on it), analytics (you can't improve what you can't measure), and launching before football season (August 2026 target).

The game is worth building. The design is thoughtful and the football logic is sound. The biggest risk is scope creep — trying to ship everything (Product A + Product B + Torch Cards + dynasty mode + 4 teams) instead of validating the core loop with 1 team, 1 difficulty, 1 daily puzzle first.

Ship small. Ship to your 9 friends. Watch them play. Fix what breaks. Then scale.
