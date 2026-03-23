# Math, Multipliers, and Game Feel
## Deep Research: Making Numbers Feel Exciting in TORCH

Raw inspiration document — formulas, patterns, psychology, and design principles
for making a football card game where the math FEELS visceral.

---

## 1. MULTIPLIER PSYCHOLOGY — Why Watching Numbers Go Up Is Addictive

### Variable Ratio Reinforcement (B.F. Skinner)

The single most powerful behavioral conditioning schedule. Rewards delivered on
unpredictable intervals produce the highest, most sustained response rates.

- **Fixed ratio** (reward every N actions): Produces "scalloping" — burst of
  activity near reward, pause after. Predictable, loses excitement fast.
- **Variable ratio** (reward after ~N actions on average): Produces constant,
  high-rate engagement. The slot machine principle. Players never know which
  action triggers the payoff, so EVERY action feels potentially rewarding.
- **Key finding**: Striatal dopamine release was observed for monetary rewards
  on variable ratio schedules but NOT for equivalent sums on fixed ratio
  schedules. Same reward, completely different brain response.

### The Dopamine Anticipation Loop

Dopamine spikes not at the moment of reward, but at the moment of ANTICIPATION.
The brain releases more dopamine when it PREDICTS a reward is coming than when
the reward actually lands. Implications:

- The wind-up matters more than the payoff
- Showing the multiplier BUILDING before the final score resolves is critical
- A 3x multiplier that you watch climb from 1x to 2x to 3x feels better than
  a flat 3x that appears instantly
- Near-misses (almost got the big multiplier) sustain engagement as strongly
  as actual wins

### Why Multiplication Feels Better Than Addition

- **+10 points** feels incremental, forgettable
- **x2 multiplier** feels like you DOUBLED your power
- Multiplication creates a feeling of LEVERAGE — small inputs create large outputs
- The player feels clever: "I set up the conditions for this multiplier"
- Multiplicative rewards create a sense of OWNERSHIP over the outcome

### The "Big Number" Dopamine Hit

- Cookie Clicker proved that watching numbers get absurdly large is inherently
  satisfying, even absent any other gameplay
- Disgaea's damage cap of 99,999,999 (then raised to billions) exists because
  players WANT to see big numbers
- The transition from hundreds to thousands to millions creates distinct
  emotional milestones — each order of magnitude feels like a breakthrough
- Prestige/reset mechanics in idle games exploit this: after reset, breezing
  through content that was once a wall creates a massive power fantasy

---

## 2. BALATRO'S SPECIFIC MATH — The Gold Standard for Multiplier Design

### Core Formula

```
SCORE = Chips x Mult
```

Dead simple. Two numbers multiplied together. Everything in the game modifies
one of these two values.

### The Three Types of Scaling

**Additive (Linear) — +Chips or +Mult:**
- Flat bonuses that add to the base value
- Example: Joker that gives +4 Mult on every hand
- Growth: If you add +4 Mult per round, after 8 rounds you have +32 Mult
- Score grows LINEARLY — steady but unexciting

**Quadratic — Growing both Chips AND Mult:**
- Most common "good" scaling in Balatro
- If Chips grow by +C per round and Mult grows by +M per round:
  `Score(n) = (base_chips + C*n) * (base_mult + M*n)`
- This expands to include an n^2 term — QUADRATIC growth
- "Almost all scaling in Balatro is quadratic"
- Feels good because growth ACCELERATES — each round feels better than the last

**Exponential — xMult Jokers:**
- Multiplicative multipliers don't ADD to Mult, they MULTIPLY it
- A x2 Mult joker doubles your ENTIRE multiplier
- Two x2 Mult jokers = x4 total (not x4 added, x4 MULTIPLIED onto everything)
- This is how you "send your score to the moon"
- Truly exponential decks are rare and require luck — which makes them feel SPECIAL

### Joker Order Matters — A Brilliant Design Detail

Jokers trigger left to right. This creates a PUZZLE within the scoring:

```
Example setup: Base hand = 55 Chips, 4 Mult

ORDER A: Joker Stencil (x3), then Popcorn (+12 Mult), then Ice Cream (+90 Chips)
  Step 1: 4 Mult x 3 = 12 Mult
  Step 2: 12 + 12 = 24 Mult
  Step 3: 55 + 90 = 145 Chips
  Final: 145 x 24 = 3,480

ORDER B: Popcorn (+12 Mult), then Joker Stencil (x3), then Ice Cream (+90 Chips)
  Step 1: 4 + 12 = 16 Mult
  Step 2: 16 x 3 = 48 Mult
  Step 3: 55 + 90 = 145 Chips
  Final: 145 x 48 = 6,960 — DOUBLE the score!
```

**Rule: +Mult jokers LEFT, xMult jokers RIGHT.** Additive effects build
the base, multiplicative effects amplify it. This is a LEARNABLE SKILL
that makes players feel clever.

### Ante Scaling — The Difficulty Ratchet

Chip requirements per ante (Small Blind / Big Blind / Boss Blind):

| Ante | Small   | Big     | Boss      |
|------|---------|---------|-----------|
| 1    | 300     | 450     | 600       |
| 2    | 800     | 900     | 1,000     |
| 3    | 2,000   | 2,600   | 3,200     |
| 4    | 5,000   | 8,000   | 9,000     |
| 5    | 11,000  | 20,000  | 25,000    |
| 6    | 20,000  | 36,000  | 60,000    |
| 7    | 35,000  | 60,000  | 110,000   |
| 8    | 50,000  | 100,000 | 200,000   |

Key observations:
- Ante 1 to Ante 8 Boss = 333x increase (600 -> 200,000)
- Growth accelerates: Ante 1-2 is ~1.7x, Ante 7-8 is ~1.8x per ante
- Requirements roughly DOUBLE every ante — exponential challenge growth
- This FORCES the player to find exponential scoring solutions
- If your deck only scales linearly, you WILL hit a wall around Ante 5-6
- The game teaches you: additive isn't enough, you need multiplicative

### Why Balatro Works for TORCH Inspiration

- Simple core formula anyone can understand (A x B)
- Depth comes from HOW you modify A and B
- Order of operations creates emergent puzzles
- The gap between additive and multiplicative teaches itself through play
- Escalating requirements force players to discover synergies

---

## 3. COMBO SYSTEMS IN FIGHTING GAMES — Escalation and Scaling

### How Damage Scaling Works

Fighting games face the multiplier problem in REVERSE: combos must feel
powerful but can't be SO powerful that one touch = death.

**Street Fighter IV Damage Scaling:**
```
Hit 1: 100% damage
Hit 2: 100% damage
Hit 3: 80% damage
Hit 4: 70% damage
Hit 5: 60% damage
Hit 6: 50% damage
Hit 7: 40% damage
Hit 8: 30% damage
Hit 9: 20% damage
Hit 10+: 10% damage (floor)
```

**Design insight**: Each additional hit does LESS, but the TOTAL keeps growing.
The combo counter goes up, the damage per hit goes down, but the player still
feels rewarded for extending the combo. Diminishing returns, not zero returns.

### The Optimal Combo Discovery Loop

This creates a player skill expression loop:
1. Discover a basic combo (3-4 hits)
2. Learn to extend it (5-6 hits)
3. Realize longer isn't always better (damage scaling)
4. Optimize: find the SWEET SPOT of combo length vs. damage efficiency
5. Discover situational combos (corner combos, meter combos, etc.)
6. Master one-touch-kill setups that use every resource

The journey from "mash buttons" to "I know the mathematically optimal combo
for every situation" is hundreds of hours of engaging gameplay.

### Combo Meter as Momentum

- Hitting the opponent builds super meter
- Super meter enables stronger attacks
- Stronger attacks enable longer combos
- Longer combos build more meter
- This is a POSITIVE FEEDBACK LOOP — momentum begets momentum
- The losing player gets meter from TAKING damage (comeback mechanic)

### Relevance to TORCH

- Card combos should have both a ceiling AND a skill expression floor
- "How many cards can you chain?" is the TORCH equivalent of combo length
- Diminishing returns per card prevent degenerate infinite chains
- But the TOTAL should still grow, rewarding longer sequences
- Meter/momentum concepts map directly to football drive mechanics

---

## 4. PUSH-YOUR-LUCK GAMES — The Heart of "One More Card"

### Core Design Pattern

Every push-your-luck game follows this structure:
1. Player has accumulated VALUE this turn
2. Player can STOP and keep the value (safe)
3. Player can CONTINUE for more value (risky)
4. If bad outcome occurs, player LOSES some or all accumulated value
5. Both risk and reward INCREASE with each push

### Can't Stop (Sid Sackson, 1980)

- Roll 4 dice, pair them into two sums (2-12)
- Advance runners on columns matching your sums
- Can keep rolling, but if you can't place ANY runner, lose ALL progress this turn
- Columns have different lengths (7 has the most spaces, 2 and 12 the fewest)
- The probability tension: 7 appears in 6/36 outcomes, 2 appears in 1/36
- Short columns are FASTER to complete but RISKIER to pursue
- Still in print after 45 years — the mechanic is timeless

### Quacks of Quedlinburg

- Draw tokens blindly from a bag you've been building
- White chips = danger (cherry bombs)
- Starting bag: four 1-value, two 2-value, one 3-value white chips
- Total cherry bomb value of 8+ = your potion EXPLODES
- You can stop at any time to bank your progress
- Bag-building lets you MANIPULATE your odds over time
- Early game: ~50% white chips. Late game: maybe 20% if you buy well
- The shift from "this is terrifying" to "I've engineered my bag to be safe"
  is the core progression arc

### The Mathematical Sweet Spot for Push-Your-Luck

For push-your-luck to FEEL right:
- Early pushes should succeed ~70-80% of the time (low risk, low reward)
- Mid pushes should succeed ~50-60% (the interesting decision zone)
- Late pushes should succeed ~20-40% (gambling territory)
- The expected value of pushing should be SLIGHTLY positive at the decision
  point — players should TECHNICALLY push more often than they do
- Loss aversion (losing hurts ~2x as much as equivalent gain feels good)
  means players stop too early by default
- The game should REWARD the player who pushes optimally

### The "Bust" Must Be Dramatic

- Losing everything is only fun if the MOMENT of loss is spectacular
- Quacks: your cauldron EXPLODES
- Can't Stop: you watch your runners slide back to zero
- Press Your Luck: the Whammy animation is iconic BECAUSE losing is entertaining
- The bust should be a story moment, not just a number going to zero

### TORCH Application

Football is INHERENTLY push-your-luck:
- Each down is a push: gain yards or risk turnover
- 4th down is the ultimate push-your-luck decision
- Going for it vs. punting is Can't Stop in football form
- The drive itself is a push-your-luck sequence:
  "I've gained 45 yards... do I take the field goal or push for the TD?"

---

## 5. MOMENTUM SYSTEMS — Streaks, Meters, and Flow States

### Tony Hawk's Pro Skater — Combo as Momentum

The THPS combo system is one of the best momentum designs ever:

- **Base trick value**: Points for the trick itself
- **Multiplier**: Number of tricks in the current combo
- **Special meter**: Fills as you perform tricks, drains constantly
- **Special tricks**: Only available when meter is full, worth much more
- **The loop**:
  1. Do trick -> earn points + fill meter
  2. Chain tricks -> multiplier climbs
  3. Meter fills -> unlock Special tricks
  4. Special tricks -> HUGE point value x HUGE multiplier
  5. Eventually bail or land -> multiply everything together
  6. ALL points are at risk until you land successfully

Key design details:
- The meter DRAINS constantly — you must maintain activity
- Each trick in a combo adds to the meter, creating a sustainability loop
- Used tricks are worth less (repetition penalty)
- The combo multiplier is the number of tricks performed
- A 20-trick combo with specials can be worth 100x+ a single trick
- Bailing = losing EVERYTHING in that combo (push-your-luck!)

### Doom Eternal's "Push Forward" Combat

id Software's philosophy: "The solution to all problems is to be aggressive."

- **Health**: Gained by Glory Killing staggered demons (melee finishers)
- **Ammo**: Gained by Chainsawing demons
- **Armor**: Gained by Flame Belching demons
- **Every resource comes FROM combat, not from retreating**
- Playing defensively = running out of resources = death
- Playing aggressively = constantly topped off = survival
- "If something slowed down the player, kept them from being aggressive,
  or required them to retreat, it would be removed"

The result: a game where MOMENTUM is the core survival mechanic. Stop moving,
stop attacking, and you die. Keep pushing forward and you're invincible.

### Fighting Game Super Meters

- Build meter by dealing OR receiving damage
- Spend meter for powerful moves, reversals, or combo extensions
- Creates a secondary resource management game within the fight
- The losing player builds meter faster (from taking hits) — comeback mechanic
- "Burst" mechanics in Guilty Gear: spend ALL meter to escape a combo
  (emergency valve that prevents hopelessness)

### Streak Bonuses in Games

- **Call of Duty killstreaks**: 3/5/7/11/25 kills without dying unlock
  increasingly powerful rewards. The reward curve is EXPONENTIAL — a 25
  kill streak reward (tactical nuke) is worth more than all other rewards
  combined.
- **Roguelikes**: Many roguelikes track "perfect clears" or "no damage" runs
  and reward them with bonus currency or items
- **Sports games**: Madden/NBA 2K "on fire" mechanics where sustained success
  boosts player stats temporarily

### TORCH Application: Drive Momentum

A football drive IS a momentum system:
- Each successful play builds momentum
- Momentum could provide tangible mechanical benefits:
  - Reduced card costs
  - Bonus multiplier on scoring plays
  - Access to "special" plays (like THPS special tricks)
- Failed plays should DRAIN momentum (incomplete pass, penalty)
- Turnovers should RESET momentum entirely
- A 10-play, 80-yard touchdown drive should feel FUNDAMENTALLY different
  from a 1-play 80-yard touchdown bomb — the built-up momentum adds weight

---

## 6. EXPONENTIAL VS LINEAR SCALING — When to Use Each

### Linear Scaling

```
Value(n) = base + (growth * n)
```

**Properties:**
- Predictable, easy to understand
- Each increment feels the same
- Good for: early game, tutorial phases, resources the player manages directly
- Example: D&D 5e — Level 20 character is ~2x a Level 1 character
  (allows low-level characters to sometimes succeed against high-level threats)

**When to use:**
- When you want tight balance
- When you want all content to remain relevant
- When the player needs to make fine-grained tradeoff decisions
- When predictability matters (resource budgeting)

### Exponential Scaling

```
Value(n) = base * (growth_rate ^ n)
```

**Properties:**
- Each increment is a PERCENTAGE increase, not flat
- Early growth feels slow, late growth feels explosive
- Creates clear "tiers" of power
- Old content becomes trivially easy (can be feature or bug)
- Numbers get incomprehensibly large quickly

**When to use:**
- When you want a sense of PROGRESSION and POWER
- When old content should become trivial (prestige games)
- When the player should feel like they're "breaking" the system
- When you want dramatic moments of realization
  ("holy shit, I just did 10x what I did last round")

### The Sweet Spot: Polynomial/Quadratic Scaling

```
Value(n) = a*n^2 + b*n + c
```

- Grows faster than linear but slower than exponential
- Balatro's most common scaling pattern
- Each increment feels BETTER than the last without going infinite
- Creates a sense of acceleration without losing all balance
- The "Goldilocks zone" for most game systems

### Logarithmic Scaling (Diminishing Returns)

```
Value(n) = base + (rate * log(n))
```

- Each increment is LESS impactful than the last
- Used for COSTS, defensive stats, or things you want to cap naturally
- Example: Armor in many RPGs — first 10 points of armor reduce damage
  significantly, next 10 points reduce it less
- Creates natural soft caps without hard limits

### The Idle Game Insight

Idle games solved the "numbers too big" problem with PRESTIGE RESETS:
- Play until growth stalls
- Reset everything
- Gain permanent multiplier (+1% per prestige level in Cookie Clicker)
- Replay with multiplier, reach further, reset again
- Each cycle through the content is FASTER
- The feeling of "blazing through what was once hard" is deeply satisfying

**Cookie Clicker Prestige**: After earning enough cookies, player "ascends."
Loses ALL progress but earns Heavenly Chips (permanent +1% production per level)
and can buy prestige upgrades. Previously-hard milestones become trivial.
New, harder milestones appear. The cycle repeats infinitely.

### TORCH Application

- **Linear**: Yard gains, base card values, gold/currency per game
- **Quadratic**: Score from a well-built drive (more cards = more synergy)
- **Exponential**: Reserved for the most powerful combos, "break the game"
  moments, playoffs/championship runs
- **Logarithmic**: Card upgrade costs, skill unlock costs (prevent runaway)

---

## 7. THE "BREAK THE GAME" DESIGN PHILOSOPHY

### Disgaea — Damage in the Millions is the POINT

- Level cap: 9,999 (most RPGs cap at 50-100)
- Damage cap: originally 99,999,999, raised to BILLIONS in sequels
- HP cap: similarly absurd
- "Item World" — enter any item, fight through randomized floors to power it up
- Can stack equipment bonuses to reach stats in the millions
- The main story is ~40 hours. The POST-GAME is 200+ hours of optimization
- Each sequel ADDS more systems to break: Magichange, Evilities, Class Mastery
- Nippon Ichi's design philosophy: "Here are tools. Go wild."

**Why it works:**
- Breaking the game IS the game — it's not a bug, it's the content
- The "correct" way to play IS to find exploits
- Each exploit teaches you a system deeply
- The meta shifts from "win the battle" to "find the most efficient exploit"
- It's essentially speedrunning/optimization as core gameplay

### Noita — Emergent Chaos from Simple Rules

- "Every pixel is simulated" — water flows, fire burns, gas rises
- 300+ spells and spell modifiers
- Wand building = combining spells on a wand with specific cast patterns
- Simple spells combine into screen-clearing weapons of mass destruction
- Some combinations trivialize the game; others instantly kill the player
- The physics simulation means interactions are EMERGENT, not scripted
- "Players tend to kill themselves with fancy spell combinations" — this is GOOD
- The journey: die to your own wand -> learn -> build something broken -> die
  to something ELSE unexpected -> learn more -> eventually become a god

### Factorio — Optimization as Addiction

- Build automated factories that produce increasingly complex items
- There's always a bottleneck to solve
- Every optimization creates a new bottleneck
- The player is constantly "breaking" their current setup to build a better one
- No theoretical limit to factory size/output
- "The factory must grow" — the compulsion is SYSTEMIC, not reward-based
- Players optimize for throughput, ratio perfection, aesthetics
- The game TRUSTS the player to find the fun

### Common Principles Across "Break the Game" Designs

1. **Give players powerful tools** — Don't gate everything behind grinding
2. **Let combinations be multiplicative** — 2 good things together should be
   MORE than 2x as good
3. **Make discovery the reward** — Finding a broken combo feels like
   INVENTION, not exploitation
4. **Don't patch fun exploits** — If players are having fun "breaking" things,
   that's success
5. **Design for the CEILING** — The floor (minimum viable play) should be
   accessible, but the ceiling (maximum optimization) should be astronomical
6. **Create systems that interact** — The breaks come from INTERACTIONS between
   systems, not from any single system being overpowered

### TORCH Application

- Let certain card combinations produce absurd results
- The "broken" combos should require KNOWLEDGE to assemble (skill expression)
- A perfectly-built deck should be able to score 10x what a mediocre deck scores
- Don't balance away the fun — balance AROUND the fun
- If playtesters find a degenerate strategy, ask "Is this FUN?" before nerfing
- The post-game/meta should be about pushing limits, not just winning

---

## 8. SCORE ATTACK GAMES — The "One More Try" Loop

### Tetris Scoring — Rewarding Skill Expression

Modern Tetris (Guideline scoring, level-multiplied):

| Action           | Base Points |
|------------------|-------------|
| Single           | 100         |
| Double           | 300         |
| Triple           | 500         |
| Tetris (4 lines) | 800         |
| T-Spin Single    | 800         |
| T-Spin Double    | 1,200       |
| T-Spin Triple    | 1,600       |

All values multiplied by current level.

**Key scoring mechanics:**
- **Back-to-Back Bonus**: +50% for consecutive "difficult" clears (Tetris or
  T-Spin). Rewards CONSISTENCY of hard play.
- **Combo System**: 50 x combo_count x level for each consecutive line clear.
  Combo counter starts at -1, increments per clear, resets on non-clear.
- **T-Spin scoring is brilliantly designed**: A T-Spin Single (800) equals a
  Tetris (800) but only clears ONE line. This rewards TECHNIQUE over brute force.

**Why "one more try" works in Tetris:**
- High score is a PERSONAL benchmark
- You can always see HOW you could have done better
- Deaths feel FAIR — you made the mistake
- The speed curve means every game reaches a point of failure
- Improvement is MEASURABLE (score, lines cleared, time survived)

### Pac-Man Scoring — Escalating Risk/Reward

```
Ghost scoring after Power Pellet:
  1st ghost: 200 points
  2nd ghost: 400 points
  3rd ghost: 800 points
  4th ghost: 1,600 points
```

DOUBLING for each consecutive ghost! Eating all 4 = 3,200 points total.
But the power pellet duration SHORTENS as levels increase.

- Fruit bonuses escalate: Cherry (100) -> Strawberry (300) -> Orange (500)
  -> ... -> Key (5,000)
- Perfect game: 3,333,360 points (every dot, every fruit, every ghost x4,
  all 255 levels)
- Ghost patterns are DETERMINISTIC — memorizable with practice
- This means score improvement comes from KNOWLEDGE + EXECUTION

### What Creates "One More Try"

1. **Visible improvement path**: "If I hadn't dropped that piece / missed that
   ghost, I would have scored higher"
2. **Quick restart**: Death-to-play time must be SHORT (<5 seconds ideal)
3. **Variable peaks**: Some runs go better than others due to variance, so
   your "best run" feels like it captured lightning in a bottle
4. **Near-miss moments**: Almost beating your high score is more motivating
   than beating it easily
5. **Meaningful score breakpoints**: Crossing 100K, 500K, 1M feels like
   achievement tiers
6. **Social comparison**: Leaderboards, friends' scores, world records

### TORCH Application

- Each game should have a clear SCORE that players want to maximize
- Quick game setup / restart is critical
- Show the "breakdown" of how the score was calculated (satisfying)
- Have visible tiers/ranks for score ranges
- Track personal bests per deck type, per opponent type, etc.

---

## 9. ECONOMY DESIGN — Shops, Currencies, and Scarcity

### Faucets and Sinks

Every game economy has:
- **Faucets**: Where resources come FROM (combat rewards, quest completion,
  daily bonuses, card rewards)
- **Sinks**: Where resources GO (shops, upgrades, card removal, rerolls)
- Balance: Too much faucet = inflation, choices feel meaningless.
  Too much sink = starvation, player feels punished.

### Slay the Spire's Economy — A Masterclass

**Gold sources (faucets):**
- Normal encounters: 10-20 Gold
- Elite encounters: 25-35 Gold
- Boss encounters: 95-105 Gold
- Events: variable

**Gold sinks:**
- Cards: ~50-175 Gold (common to rare)
- Relics: ~150-300 Gold
- Potions: ~50-100 Gold
- Card removal: 75 Gold, +25 each subsequent removal (75, 100, 125, 150...)
- One card always 50% off (creating a "deal" feeling)

**Shop layout**: Always 2 Attack, 2 Skill, 1 Power, 3 Relics, 2 Potions.
Consistent layout means players can PLAN for the shop.

**Escalating card removal cost is genius:**
- First removal: 75 Gold (cheap — encourages deck thinning as a concept)
- Each subsequent: +25 Gold (increasingly costly — forces prioritization)
- Smiling Mask relic: flat 50 Gold removals (enables "thin deck" strategies)
- This single mechanic creates a DECISION TREE:
  "Do I remove a bad card or buy a good card? How thin do I want my deck?"

**Key design insight**: In Slay the Spire, you NEVER have enough gold for
everything you want. Scarcity is maintained by:
- Limited gold per floor
- High prices relative to income
- Card removal getting more expensive
- Relics competing with cards for the same pool
- Shop appearing only every ~6 floors

### Multiple Currencies Create Multiple Decision Axes

When a game has only one currency, every decision is "is this worth X gold?"
When it has multiple currencies, decisions become multi-dimensional:
- Balatro: Money (for shop) + Hands (limited plays per round) + Discards
  (limited redraws)
- Slay the Spire: Gold + Card reward choices (free but opportunity cost) +
  HP (taking elite fights costs HP which is a resource)

### Scarcity Design Principles

1. **The player should ALWAYS want more than they can afford** — Every shop
   visit should involve a painful "I can't buy both" decision
2. **Windfalls feel amazing** — Occasional large payouts (boss gold, jackpots)
   break the scarcity and feel generous
3. **Early generosity, late scarcity** — Give players lots of options early
   (hook them), constrain later (force optimization)
4. **Let players FEEL rich sometimes** — A run where everything is affordable
   feels like being on a heater. Contrast with scarcity makes it special.
5. **The best purchase is one you're not sure about** — If every purchase is
   obviously correct, there's no meaningful choice

### TORCH Application

- Gold/currency earned per game based on performance
- Shop with cards, upgrades, and consumables
- Card removal or deck thinning mechanic
- Escalating costs for repeated actions (like Slay the Spire removal)
- Multiple "currencies" — money, pack picks, training points, etc.
- Shop should always present MORE options than the player can afford
- Occasional windfall (lucky pack pull, bonus round) breaks scarcity delightfully

---

## 10. DIFFICULTY CURVES THAT FEEL GOOD

### Slay the Spire's Ascension System

Instead of a single "Easy/Normal/Hard" toggle, Slay the Spire layers
difficulty modifiers that STACK:

- A0 (base): Learn the game
- A1: Elites are harder
- A2: Start with less HP
- A3-5: Enemies get stronger
- A6: Start with a Curse card (bad card in your deck)
- A10: Start with worse starting relic
- A15: Heart boss has more HP
- A16+: Shop prices increased 10%
- A20: Everything stacked — the ultimate challenge

**Why this works:**
- Each level adds ONE thing — player learns to adapt to it
- Modifiers stack, so A20 has ALL 20 modifiers simultaneously
- What seems easy at A5 becomes part of a crushing combination at A15
- Players self-select difficulty — no gatekeeping
- Completing each level is its own achievement

### The Breathing Room Principle

Good difficulty curves alternate between tension and relief:

```
[Easy] -> [Medium] -> [HARD] -> [Relief/Shop] -> [Medium] -> [BOSS]
   ^                                                            |
   |______________ New area with reset to medium ______________|
```

- After every spike, give the player a moment to recover
- Shops, rest sites, and easy encounters serve as "exhale" moments
- The ANTICIPATION of the boss is as stressful as the boss itself
- Post-boss relief (new items, new area) is deeply satisfying

### Ante Structure as Difficulty Ramp (Balatro)

- Each ante increases requirements ~2x
- Within each ante: Small Blind (easy) -> Big Blind (medium) -> Boss (hard)
- Boss Blinds have special rules that disrupt your strategy
- Between antes: shop, reroll, upgrade opportunities
- The pattern is: Fight -> Fight -> BOSS -> BREATHE -> repeat at higher stakes

### When to Spike vs When to Coast

- **Spike early** to teach the player the game is dangerous
- **Coast in the middle** to let them build power and explore
- **Spike before the end** to test everything they've built
- **Final boss should require EVERYTHING** — the culmination
- Never spike twice in a row without relief (feels unfair)
- The first spike should be survivable even if played poorly (teaches, doesn't punish)

### TORCH Application: Season/Playoff Structure

- Regular season games: gradual difficulty increase
- Mid-season: a "rival" spike to test the player's deck
- Playoffs: significant difficulty spike, but player should be powerful by now
- Championship: requires optimal play and deck building
- Between games: shop, draft, deck editing (breathing room)
- Each "season" could be like an Ascension level — more modifiers, harder

---

## 11. JUICE AND GAME FEEL FOR NUMBERS

### Vlambeer's "Art of Screenshake" — The Canonical Reference

Jan Willem Nijman of Vlambeer demonstrated 30+ techniques that transform a
bland shooter into a visceral experience. Applied to NUMBER DISPLAY:

**Visual Juice for Scoring:**
1. **Number scale-up**: Score numbers start LARGE and shrink to final size
2. **Color flash**: Big numbers flash gold/white before settling
3. **Screen shake**: On big scores, shake the screen proportional to magnitude
4. **Particle burst**: Numbers emit particles when they appear
5. **Accumulation animation**: Show the score COUNTING UP, not jumping
6. **Hit pause / "sleep"**: Freeze for ~20ms on big moments (emphasizes impact)
7. **Stacking numbers**: Show component bonuses combining visually
   (base score + bonus + multiplier → animate them merging)
8. **Permanence**: Leave traces of big scores on screen (like shell casings in FPS)

### The "Juice It Or Lose It" Framework (Jonasson & Purho, GDC 2012)

Core principle: **Excessive positive feedback relative to player input.**
The goal is to make every action feel 10x more impactful than it actually is.

Applied to a card game with numbers:
- Playing a card: Card should SLAM onto the field, not slide
- Damage numbers: Should POP up with scale animation, float, then fade
- Multiplier activation: Distinct visual + sound, moment of anticipation
  before the multiplication resolves
- Score total: Should COUNT UP audibly (like a slot machine)
- Critical hits / big combos: Screen flash, camera zoom, particle shower
- Chain bonuses: Each link in the chain should have escalating visual feedback
  (first link: small pop, second: medium pop, third: BIG pop with shake)

### Sound Design for Numbers

- **Pitch scaling**: Higher-pitched sounds for bigger numbers (ascending tones)
- **Stacking sounds**: Each multiplier layer adds a harmonic
- **The "cha-ching"**: A distinct sound for when multiplication resolves
- **Bass drop**: For truly massive scores, a deep bass hit
- **Combo escalation**: Each successive hit in a chain uses a higher note
  (think Mario coin sounds ascending)
- **Silence before the big reveal**: Brief pause before a massive number
  appears creates anticipation

### Number Display Best Practices

- **Comma separators**: 1,000,000 not 1000000
- **Abbreviations at scale**: 1.2M feels more manageable than 1,200,000
- **Color coding by magnitude**: White (normal), Yellow (good), Orange (great),
  Red (incredible), Purple/Rainbow (game-breaking)
- **Size scaling**: Physically larger numbers for bigger values
- **Show the math**: "300 Chips x 42 Mult = 12,600" is more satisfying than
  just showing "12,600"
- **Animate the multiplication**: Show chips value, show mult value, show them
  COMBINE with a visual flourish, THEN show the result

### TORCH Application

- Every card play should have physical WEIGHT (slam, impact sound)
- Yard gains should pop up with scale animation
- Multiplier chains should have escalating visual/audio feedback
- Score calculation should be ANIMATED, not instant
  Show: Base yards -> +bonus yards -> x multiplier -> FINAL SCORE
- Touchdown scoring should be the biggest juice moment in the game
- Screen shake intensity scales with play importance
- Sound design: ascending tones for building combos, bass drop for scores

---

## 12. FOOTBALL-SPECIFIC MATH — The Natural Game System

### Football as Push-Your-Luck

Football's down system IS a push-your-luck game:

```
1st & 10: Low risk, 3 more chances. "Free" push.
2nd & long: Medium risk. Need a good gain.
3rd & short: Medium-high risk. This is the DECISION POINT.
3rd & long: High risk. Probably punting if you fail.
4th & anything: THE PUSH-YOUR-LUCK MOMENT.
  - Punt (bank your field position, give up scoring chance)
  - Field Goal (partial reward, safe-ish)
  - Go for it (maximum reward, risk turnover on downs)
```

### Expected Points by Field Position (NFL Models)

Field position creates a natural "score" for how well a drive is going:

| Field Position (own yard line) | Expected Points |
|-------------------------------|-----------------|
| Own 1                         | -1.2            |
| Own 20                        | +0.3            |
| Own 40                        | +1.1            |
| Midfield (50)                 | +2.0            |
| Opponent 40                   | +2.8            |
| Opponent 20                   | +4.0            |
| Opponent 5                    | +5.5            |
| Opponent 1                    | +6.0            |

Key insight: The relationship is roughly LINEAR in the middle of the field
(~1 EP per 15 yards) but ACCELERATES near the end zones.

In the "red zone" (opponent's 20 and in), each yard is worth MORE because
you're increasingly likely to score a touchdown (7 points) rather than a
field goal (3 points) or nothing.

### The Drive as a Momentum Narrative

A football drive has natural narrative structure:

1. **Opening** (own 25): Establish rhythm, low stakes
2. **Building** (midfield): Momentum growing, choices opening up
3. **Approaching** (opponent's 40): Getting exciting, can smell the score
4. **Red Zone** (opponent's 20): High tension, every play matters
5. **Goal Line** (opponent's 5): Maximum tension, the PUSH for the TD
6. **Score**: RELEASE — all built tension converts to points

This maps PERFECTLY to a multiplier system:
- Early plays build a base (additive)
- Mid-drive plays add multipliers (quadratic scaling)
- Red zone plays have heightened stakes (risk/reward amplified)
- Touchdown is the MULTIPLICATION moment (chips x mult = score)

### Fourth Down as Decision Point

NFL analytics show teams should go for it on 4th down FAR more than they do:
- On average, going for it on 4th & 2 from the opponent's 35 yields higher
  expected points than punting
- Coaches are RISK AVERSE due to loss aversion (same psychology as push-your-luck)
- In a card game, we can make 4th down the EXCITING choice, not the scary one

### Turnover as Momentum Shift

- Interceptions and fumbles are the "bust" in push-your-luck
- In real football, a turnover swings expected points by ~7 points on average
- A pick-six is the MAXIMUM dramatic reversal — all your built momentum
  converts to points FOR THE OPPONENT
- This should be the most dramatic moment in TORCH — massive visual feedback

### Football Math for TORCH Scoring

Potential formula structure:

```
Play Score = (Base Yards + Card Bonus) x Drive Multiplier x Situation Bonus

Where:
  Base Yards     = card's base yard value (3-15 typical)
  Card Bonus     = synergy bonuses from card combinations
  Drive Mult     = increases with consecutive successful plays (1.0, 1.2, 1.5, 2.0...)
  Situation Bonus = red zone bonus, 4th down conversion bonus, etc.

Touchdown Score = Total Drive Yards x Momentum Multiplier x TD Bonus
```

### Natural Football Multipliers

- **Down & Distance**: Converting 3rd downs (clutch bonus)
- **Red Zone**: Entering the red zone (territory bonus)
- **Big Play**: Any single play over 20 yards (explosive play bonus)
- **Fourth Down Conversion**: Going for it and succeeding (courage bonus)
- **No-Huddle / Tempo**: Playing multiple cards quickly (tempo bonus)
- **Clock Management**: Scoring before the half or end of game (time bonus)
- **Two-Minute Drill**: Special state with altered rules/bonuses
- **Comeback**: Bonus when trailing (rubber-band mechanic)

---

## SYNTHESIS: Design Patterns for TORCH

### The Core Loop Should Feel Like This

```
Play Card -> See Yards (satisfying)
Chain Cards -> See Multiplier Build (exciting)
Continue Drive -> Risk vs Reward Decision (tense)
Score Touchdown -> MULTIPLICATION RESOLVES (euphoric)
  Base x Mult x Bonuses = BIG NUMBER with full juice
```

### Multiplier Sources (Ordered by Power)

1. **Additive**: +yards from individual cards (base, always present)
2. **Synergy Additive**: +yards from card combos (reward deck building)
3. **Drive Multiplier**: x1.5 for sustained drives (reward consistency)
4. **Situation Multiplier**: x2 for 4th down conversions, red zone, etc.
5. **Multiplicative Combos**: xN from specific rare card interactions
   (reward mastery, "break the game" moments)

### The Scaling Curve

- **Games 1-5**: Player learns basic card play. Linear scoring.
  Scores in the hundreds.
- **Games 5-15**: Player discovers synergies. Quadratic scoring.
  Scores in the low thousands.
- **Games 15-30**: Player builds optimized decks. High quadratic.
  Scores in the high thousands.
- **Games 30+**: Player finds "break the game" combos. Exponential.
  Scores in the tens of thousands. Leaderboard territory.

### Key Design Principles

1. **Show the math**: Always show Base x Mult = Score. Let players SEE
   the multiplication happen.
2. **Animate the build**: Score calculation should be a MOMENT, not instant.
3. **Reward risk-taking**: 4th down conversions, trick plays, and aggressive
   calls should be mechanically rewarded, not just narratively.
4. **Let players break it**: The ceiling should be 100x the floor. Finding
   broken combos should feel like discovery, not exploitation.
5. **Push-your-luck is the skeleton**: Every drive is "do I keep going or
   take what I have?" This is the core tension.
6. **Momentum is tangible**: Not just flavor — actual mechanical benefits
   for sustained drives.
7. **The bust must be dramatic**: Turnovers should be spectacular,
   screen-shaking, story-generating moments.
8. **Scarcity creates meaning**: Never give players enough resources to
   buy everything. Every choice should cost something.
9. **Juice everything**: Every number that appears should have animation,
   sound, and visual weight proportional to its importance.
10. **One more game**: Quick setup, clear score, visible improvement path,
    personal bests, and the feeling that next time could be THE run.

---

## REFERENCE: Key Sources & Talks

### Must-Watch GDC Talks
- "The Art of Screenshake" — Jan Willem Nijman (Vlambeer)
- "Juice It Or Lose It" — Martin Jonasson & Petri Purho (GDC Europe 2012)
- "Embracing Push Forward Combat in DOOM" — id Software (GDC Vault)
- "Designing Game Feel" — Martin Pichlmair & Mads Johansen (academic survey)

### Key Articles & Resources
- [Balatro Score Growth Analysis](https://www.mattgreer.dev/blog/balatro-score-growth/)
- [Balatro Wiki: Mult](https://balatrowiki.org/w/Mult)
- [Balatro Wiki: Blinds and Antes](https://balatrowiki.org/w/Blinds_and_Antes)
- [Balatro Wiki: Scaling Guide](https://balatrowiki.org/w/Guide:_Scaling)
- [How Damage Scaling Holds Fighting Games Together](https://www.superjumpmagazine.com/how-damage-scaling-holds-fighting-games-together/)
- [SF4 Combo & Damage Scaling](https://www.eventhubs.com/guides/2009/may/09/how-combo-and-damage-scaling-works-street-fighter-iv/)
- [Disgaea's Damage in the Millions (Gamedeveloper)](https://www.gamedeveloper.com/design/game-design-inspirations-disgaea-s-damage-in-the-millions-and-post-game-structure)
- [The Mathematics of Game Balance](https://departmentofplay.net/the-mathematics-of-balance/)
- [The Math of Idle Games, Part I](https://blog.kongregate.com/the-math-of-idle-games-part-i/)
- [The Math of Idle Games, Part III (Prestige)](https://blog.kongregate.com/the-math-of-idle-games-part-iii/)
- [Linear vs Exponential Progression](http://talarian.blogspot.com/2014/09/linear-versus-exponential-progression.html)
- [Squeezing More Juice Out of Your Game Design](https://www.gamedeveloper.com/design/squeezing-more-juice-out-of-your-game-design-)
- [Doom's Push Forward Design](https://www.gamedeveloper.com/design/how-doom-s-push-forward-design-cured-my-hoarder-syndrome)
- [Doom Eternal's Aggressive Resource Management](https://www.gamedeveloper.com/design/the-aggressive-resource-management-of-i-doom-eternal-i-)
- [Push Your Luck Game Design (Board Game Design Course)](https://boardgamedesigncourse.com/game-mechanics-sometimes-you-want-to-push-your-luck/)
- [Quacks of Quedlinburg: Probability Analysis](https://playknighttimegames.com/reviews/the-quacks-of-quedlinburg-probability-luck-and-definitely-explosions/)
- [Psychology of Rewards in Games](https://mpr.unas.ac.id/the-psychology-of-rewards-in-modern-games/)
- [Variable Reward Schedules Guide](https://www.numberanalytics.com/blog/ultimate-guide-reward-schedules-game-design)
- [Game Economy Design 101](https://gamedevessentials.com/designing-a-game-economy-101-the-ultimate-guide-for-game-devs/)
- [Slay the Spire Wiki: Gold](https://slaythespire.wiki.gg/wiki/Gold)
- [Slay the Spire Wiki: Merchant](https://slaythespire.wiki.gg/wiki/Merchant)
- [Tetris Scoring (TetrisWiki)](https://tetris.wiki/Scoring)
- [Pac-Man Scoring System](https://pacmanmuseum.com/history/pacman-scoring.php)
- [Understanding Pac-Man Ghost Behavior](https://gameinternals.com/understanding-pac-man-ghost-behavior)
- [NFL Advanced Football Analytics: Field Position](http://www.advancedfootballanalytics.com/2007/09/importance-of-field-position.html)
- [NFL Advanced Football Analytics: 4th Down Game Theory](https://www.advancedfootballanalytics.com/2008/06/game-theory-intro-and-4th-down.html)
- [NFL Win Probability Model](https://www.pro-football-reference.com/about/win_prob.htm)
- [Slay the Spire Ascension & Difficulty Design](https://frostilyte.ca/2020/04/16/more-games-should-handle-difficulty-like-slay-the-spire/)
- [Noita Official Site](https://noitagame.com/)
- [7 Game Feel Tricks](https://dawnosaur.substack.com/p/7-game-feel-tricks-to-improve-your)
