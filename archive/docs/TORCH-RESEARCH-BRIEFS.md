# TORCH — 5 Research Briefs for Marketability
## Deep research to make this the best it can be

---

## BRIEF 1: HOW BALATRO SOLVED THE KNOWLEDGE BARRIER (and what TORCH must steal)

### The core insight
Balatro doesn't teach poker. It teaches BALATRO. That's the secret. Players who've never played poker in their lives report picking it up instantly because the game never asks them to play poker. It asks them to make numbers go up.

The tutorial is one run on a fixed seed. Jimbo (the mascot) shows you: play cards, score points, beat the blind. That's it. The poker hand hierarchy is displayed as a reference panel you can check anytime — but you don't NEED to know it because the game tells you what hand you have when you select cards. You learn by doing, not by studying.

The critical design choice: Balatro shows you the score BEFORE you play the hand. You select your cards, the game shows "Pair — 10 x 2 = 20 chips." You can see if that's enough to beat the blind. This removes all ambiguity. You never play a hand and THEN discover it wasn't good enough — you know before you commit.

### What this means for TORCH
TORCH currently asks you to pick a play card, pick a player, and SNAP — then you see the result. You don't know if your combo is good until after. That's the opposite of Balatro. The game should show you BEFORE you snap:

- "SLANT + Vasquez (FLAME) vs Cover 3 — Estimated: 6-10 yds ⚡ COMBO: +3 yds (3rd down clutch)"
- "FOUR VERTS + Sampson (SPEED_LINES) vs Cover 4 — Estimated: 2-8 yds ⚠️ BAD MATCHUP"

This doesn't reveal the exact result (there's still variance), but it tells the player WHETHER THEIR CHOICE IS SMART. That's how you teach football without teaching football. The player learns "slant works against Cover 3" not because you told them, but because the estimated yards were higher.

**The post-snap film breakdown should confirm what the pre-snap preview hinted.** "Cover 3 leaves the short middle open. Your slant exploited it. +8 yds." Now the player has learned something — and they feel smart.

### Design principle to steal
Balatro's onboarding works because it never makes you feel stupid. Even losing feels like "I almost had it." The worst thing TORCH can do is make a player feel like they lost because they don't understand football. Every loss should feel like "I made a bad call" not "I don't know what Cover 3 means."

---

## BRIEF 2: WHY DAILY PUZZLE GAMES RETAIN (the psychology TORCH needs)

### What Wordle discovered
Three mechanics drive retention:

**1. Scarcity creates value.** One puzzle per day. You can't binge. This makes each puzzle feel important. Wordle's creator said: "Having one puzzle per day creates a sense of scarcity, leaving players wanting more." The daily limit means players spend 3 minutes, feel accomplished, and leave. They don't burn out. They don't feel guilty about playing too long. They come back tomorrow because they WANT to, not because a streak timer shames them.

**2. Shared experience creates social glue.** Everyone solves the SAME puzzle on the same day. This means your result is comparable to your friend's. "I got it in 3, how about you?" is the simplest social mechanic ever invented. Connections doubled down on this — the NYT Games team designs for shareability: "We think about 'What would be something I would want to share with my friends?'" The share grid isn't the point — the CONVERSATION is.

**3. Emotional arc in 3 minutes.** Every Wordle has a beginning (optimism), middle (narrowing down), and end (triumph or defeat). That arc is compressed into 6 guesses. The emotional density per minute is extremely high. Connections adds a second arc — you get 4 mistakes, and every wrong guess raises the stakes.

### What this means for TORCH
Product A (the daily puzzle) needs all three:

**Scarcity:** One game per day. Same game for all players. When it's done, it's done until tomorrow. No "play again" button. This is critical and counterintuitive — you're limiting engagement to INCREASE retention.

**Shared experience:** Same teams, same scenario, same draft pool. The only variable is YOUR play calls. This means two players can compare: "I called slant on 3rd and 5, what did you do?" That's the conversation. That's the Wordle grid equivalent — not a static image, but a story of decisions.

**Emotional arc:** The v0.7 daily puzzle was one drive. That might be too short for an emotional arc. A full game (40 plays) might be too long. The sweet spot is probably ONE HALF — 20 plays + a 2-minute drill. ~25 snaps, ~5 minutes. That's enough for 2-3 possessions, a lead change, and a clutch finish.

### The NYT Games retention secret
NYT subscribers who play games AND read news have the highest retention of any subscriber segment. Games aren't a revenue center — they're a retention tool. TORCH's daily puzzle could serve the same function: the daily game is free, it retains users, and it funnels them into the paid dynasty mode (Product B).

---

## BRIEF 3: THE EA COLLEGE FOOTBALL DYNASTY COMMUNITY (your target market, mapped)

### Who they are
EA College Football 25 sold 5.5 million copies in its first month. Dynasty mode is the most discussed feature on forums, Reddit, and Discord. The community is characterized by:

- **Runs online dynasties with 10-32 friends** coordinated through Discord (sound familiar?)
- **Obsessed with play-calling, recruiting, and scheme identity** — they don't just play games, they build programs over 10+ seasons
- **Frustrated with EA's bugs** — Dynasty mode has been plagued with save corruption, broken win tracking, and limited user slots. The forums are full of players who love the concept but hate the execution
- **Hungry for mobile options** — Dynasty mode requires sitting at a console for hours. There's no mobile companion app. Players want to manage their dynasty on the go but can't
- **Already organized in Discord servers** — Every online dynasty has a Discord. Communication, scheduling, trash talk, draft boards — it all happens there

### The gap TORCH fills
These players want three things EA doesn't give them:
1. Quick football strategy hits on mobile (5 min, not 45 min)
2. Play-calling as the core mechanic (not the 200+ other things in EA CFB)
3. A daily reason to engage with football strategy in the offseason

TORCH is perfectly positioned for the offseason gap. EA CFB is a fall/winter game. From February to August, dynasty players have nothing. TORCH's daily puzzle fills that void. The Play Call Challenge TikTok content speaks directly to their language — they argue about 4th down calls every day in their Discords already.

### How to reach them
- **Your Discord group IS the first dynasty.** You're already in the community. Start there.
- **Reddit: r/NCAAFBseries** — 160K+ members, highly active, would be receptive to a "play-calling card game" post during the offseason
- **CFB TikTok creators** — @cfbudge (148K), @brownemax (134K), @baldynfl (125K) are college football analysts who would naturally engage with Play Call Challenge content
- **EA forum cross-promotion** — Dynasty mode players searching for alternatives during bug frustrations

---

## BRIEF 4: ZERO-BUDGET LAUNCH PLAYBOOK (what actually works for solo devs)

### What the data says
The games that break out with zero budget share three traits: they're complete, they're shareable, and they solve a specific frustration. Among Us sat dead for 2 years before TikTok streamers discovered it. Vampire Survivors was a side project that grew through word of mouth. Schedule 1 — a $15 game by a solo dev — sold 8 million copies in 2 months, beating Assassin's Creed Shadows, purely through Steam's algorithm and organic virality.

### Your specific playbook

**Phase 0 (NOW — before launch):**
- Build a one-page landing site (torch.football or similar) with a 15-second gameplay GIF and an email signup. Goal: 200 emails before the public launch.
- Post dev progress on r/NCAAFBseries and r/IndieDev. Not "play my game" posts — "I'm building a football card game inspired by Balatro" posts. Development stories are engaging content.

**Phase 1 (Soft launch — Discord only):**
- Deploy to your 9 friends. Collect feedback for 2 weeks. Fix everything that blocks a complete game.
- Ask each friend to invite ONE person. That's 18 players. If retention holds, you have signal.

**Phase 2 (Offseason content — May to July 2026):**
- Start posting Play Call Challenge videos (the two-video TikTok format). 3 per week.
- Cross-post to Instagram Reels and YouTube Shorts. TikTok organic reach is declining — diversify from day one.
- Target: 1,000 followers across platforms before August.

**Phase 3 (Public launch — August 2026, start of CFB season):**
- Send the email list. Post on Reddit. Share in EA CFB Discord servers.
- Timing is everything — launch when football attention peaks, not in March during the dead zone.
- Target: 1,000 daily players by September.

**Phase 4 (Monetization — after proving retention):**
- Only after Day 7 retention exceeds 15% do you add paid features.
- Start with a $2.99 "Dynasty Pass" that unlocks Product B (roguelike run mode).

### Key principle
Zero budget means you trade money for time and authenticity. Every successful zero-budget launch relied on genuine community engagement, not tricks. Your advantage is that you ARE a member of the college football community, not a marketer pretending to be one.

---

## BRIEF 5: MONETIZATION MODELS THAT WORK FOR CARD GAMES ON MOBILE

### The landscape
Mobile card games generate $2.7 billion annually. The dominant models:

**1. Gacha/collector (Madden Mobile, FIFA Mobile, Marvel Snap)**
You pull random cards with real money. Whales spend thousands. This model requires massive card pools, constant content updates, and a tolerance for pay-to-win backlash. Not right for TORCH — the game has 40 plays and 48 players, not 10,000 cards.

**2. Premium purchase (Balatro)**
$9.99 upfront, no IAP, no ads. Balatro earned $9.3 million on mobile this way. This works when your game is SO good that people will pay before trying it. The trade-off: you need press coverage and word of mouth to drive purchases, since there's no free trial.

**3. Freemium daily + premium unlock (NYT Games model)**
Wordle is free. The crossword requires a subscription. Games retain subscribers 40% better than news alone. The daily game is a funnel, the subscription is the revenue.

**4. Battle pass / season pass (Fortnite, Clash Royale)**
Pay $5-10 per month or per season for premium rewards, cosmetics, and content. Works when there's ongoing progression and social competition.

### What fits TORCH

The NYT Games model is the best fit. Here's the specific structure:

**Free tier (Product A):**
- Daily puzzle: one game per day, same for everyone
- 2 teams (Canyon Tech, Iron Ridge)
- Easy difficulty
- Share results

**Premium tier ($2.99/month or $4.99 one-time — "Dynasty Pass"):**
- Unlimited games at all difficulties
- Roguelike dynasty mode (Product B)
- 4+ teams with unique playbooks
- Torch Card collection progression
- Streak rewards and seasonal challenges
- Stat tracking and leaderboards

**Why this works for TORCH:**
- The free daily puzzle removes the "pay before you try" barrier that limits premium games
- The daily habit creates retention that makes the subscription feel worthwhile
- College football has a natural season rhythm — you can sell a "Season Pass" from August to January
- The $2.99 price point is low enough for impulse purchase, high enough to cover costs at 5,000 subscribers ($15K/month)

### What NOT to do
- No gacha / random card packs. TORCH's identity is about strategy, not luck. Pay-to-win kills the credibility.
- No ads in gameplay. Ads in a football card game feel cheap and break immersion. If you add ads, put them BETWEEN games (post-game interstitial), never during.
- No energy systems / play limits beyond the daily puzzle. Artificial gates feel manipulative and erode trust.

---

## SUMMARY: The 5 things that will make or break TORCH

1. **Show the player if their choice is smart BEFORE they snap** (steal Balatro's pre-commit feedback)
2. **Daily scarcity + shared experience + emotional arc in 5 minutes** (steal Wordle's retention mechanics)
3. **Target EA CFB dynasty players during the offseason** (they're organized, hungry, and reachable)
4. **Launch in August 2026 with 3 months of Play Call Challenge content** (build audience before launch)
5. **Free daily puzzle → paid dynasty pass** (NYT Games monetization model)

Everything else is noise until these 5 are right.
