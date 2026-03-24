# Roguelike Deckbuilder Genre Analysis
## Raw Inspiration for TORCH Football Card Game
### March 2026

---

## Table of Contents
1. [Slay the Spire — The Grandfather](#1-slay-the-spire--the-grandfather)
2. [Inscryption — Meta-Narrative + Card Mechanics](#2-inscryption--meta-narrative--card-mechanics)
3. [Monster Train — Lanes, Champions, Differentiation](#3-monster-train--lanes-champions-differentiation)
4. [Luck Be a Landlord — Slot Machine Roguelike](#4-luck-be-a-landlord--slot-machine-roguelike)
5. [Shotgun King — Known Game + Roguelike Progression](#5-shotgun-king--known-game--roguelike-progression)
6. [Dicey Dungeons — Dice as Cards](#6-dicey-dungeons--dice-as-cards)
7. [Neon White — Dual-Use Card Design](#7-neon-white--dual-use-card-design)
8. [Ring of Pain — Circular Dungeon, Risk-Reward](#8-ring-of-pain--circular-dungeon-risk-reward)
9. [What Makes the Best Deckbuilders Tick](#9-what-makes-the-best-deckbuilders-tick)
10. [Failed Deckbuilders — What Goes Wrong](#10-failed-deckbuilders--what-goes-wrong)
11. [The Meta-Progression Question](#11-the-meta-progression-question)
12. [Emerging Trends 2025-2026](#12-emerging-trends-2025-2026)
13. [TORCH Takeaways — Design Principles to Steal](#13-torch-takeaways--design-principles-to-steal)

---

## 1. Slay the Spire — The Grandfather

### Why It Matters
Slay the Spire (MegaCrit, 2019) invented the modern roguelike deckbuilder template. Every game in this document exists in its shadow. Understanding StS is understanding the genre's DNA.

### Structure: Acts and Floors
- **3 acts**, each exactly **17 floors** long
- Each act culminates in a **boss encounter**
- Map is a **7x15 irregular isometric grid** — roughly 6 possible rooms per floor in a horizontal row
- **Floor-specific guarantees** bake in pacing:
  - Floor 1: Always easy combat encounters (from the act's "easy pool")
  - Floor 9: Always treasure rooms (guarantees at least one relic mid-act)
  - Floor 15: Always rest sites (guaranteed recovery before boss)
- Between floors, 1-3 branching paths — player CHOOSES their route
- Room types: Combat, Elite Combat, Shop, Rest Site, Treasure, Event (mystery)

**TORCH RELEVANCE:** The branching map with guaranteed structural beats (easy start, mid-act reward, pre-boss rest) is a masterclass in pacing. The player always has agency over difficulty via pathing.

### The Energy System
- **3 energy per turn** (base). Refreshes every turn. Unspent energy is WASTED
- Cards cost 0-3 energy typically
- **Draw 5 cards per turn** (base)
- Unplayed cards go to discard pile; when draw pile empties, discard reshuffles into draw
- Boss relics often offer a 4th energy point at a severe cost (Cursed Key adds a curse card to your deck every chest; Ectoplasm prevents gold gain entirely)

**Key design insight:** The 3-energy / 5-card hand creates a constant tension. You always have MORE cards than you can play. Every turn is a triage decision. The energy system means you can't just "play everything" — you must prioritize.

### Enemy Intents — The Genre's Biggest Innovation
- Enemies display their **intent** (what they plan to do) BEFORE the player's turn
- Intents show: Attack (with damage number), Block, Buff, Debuff, or Unknown
- This converts combat from guessing to **puzzle-solving**
- Player has **complete information** about the immediate threat but **incomplete information** about the opponent's pattern over multiple turns
- Eliminates the "feels unfair" problem of hidden enemy actions
- Creates a rhythm: Read intent -> Plan response -> Execute -> Read new intent

**TORCH RELEVANCE:** This is massive. If TORCH has any opponent AI or defense mechanics, showing intent transforms the experience from frustrating guessing to satisfying planning. Football equivalent: the defense shows their formation but not their exact coverage assignments.

### Relics — Permanent Run Modifiers
- ~170 relics across all rarities
- Obtained from: elite combats, boss kills, treasure rooms, shops, events
- Relics are PASSIVE — they modify rules permanently for the run
- Categories: Common, Uncommon, Rare, Boss, Shop, Event
- Examples of design:
  - **Kunai**: Gain 1 Dexterity every time you play 3 Attacks in a turn (rewards attack-heavy builds)
  - **Dead Branch**: Whenever you Exhaust a card, add a random card to your hand (insane with exhaust strategies)
  - **Snecko Eye**: Draw 2 additional cards each turn, but randomize ALL card costs to 0-3 (high risk, high reward — completely changes how you build)
  - **Runic Dome**: Gain 1 Energy each turn, but enemy intents are hidden (trades the game's core information for power)

**Key design insight:** Relics create "build identity." A run with Snecko Eye plays completely differently from a run with Dead Branch. The best relics don't just add power — they change WHAT you want to draft.

### Ascension — Difficulty Scaling
- 20 Ascension levels, each adding a stacking modifier
- Modifiers include: more elites, enemies hit harder, less gold, fewer rest sites, bosses are stronger
- All modifiers stack — Ascension 20 has ALL previous modifiers active
- This is the endgame. The base game is essentially a tutorial for Ascension climbing

**Key design insight:** Ascension doesn't add new content. It makes existing content harder, forcing mastery of fundamentals. This is cheap to develop and infinitely replayable.

### Card Design Philosophy (from GDC 2019 Talk)
- MegaCrit used **metrics-driven design** from early prototypes onward
- Built a metric server tracking every player decision, even in early playtesting with Netrunner players
- Brainstormed **thousands** of card designs, cut to the most impactful
- Key principle: every card should create an interesting decision in at least some context
- Card upgrades at rest sites add another layer — upgrade timing matters

### Deck Thinning — The Hidden Skill
- Optimal deck size: **20-25 cards** with 6-8 draw/exhaust cards
- Card removal via shops, events, and exhaust mechanics
- Consistency > raw power: a deck that reliably finds its scaling by turn 2-3 of a boss fight wins more than a powerful but inconsistent one
- Ironclad's dominant strategy: Corruption + Dark Embrace + Feel No Pain (exhaust your entire deck to a repeatable loop)

**TORCH RELEVANCE:** Deck thinning creates a skill ceiling. If TORCH has a "playbook" that grows, the ability to CUT plays is as important as adding them. "Do I really need this play, or is it diluting my strategy?"

---

## 2. Inscryption — Meta-Narrative + Card Mechanics

### Why It Matters
Inscryption (Daniel Mullins, 2021) proves that a card game can be a vehicle for storytelling, not just mechanics. It layers horror, meta-fiction, and puzzle-solving ON TOP of deckbuilding.

### The Sacrifice System
- Originated from a Ludum Dare game jam ("Sacrifices Must Be Made," 2018)
- Influenced by Magic: The Gathering's sacrifice mechanics
- **Blood cost**: Sacrifice creatures already in play to summon stronger ones. A 2-blood creature requires killing 2 of your own units
- **Bone cost**: Earned passively when any creature dies (yours or enemy's). Alternative resource that rewards attrition
- **Squirrels**: Free 0-cost/1-health units from a SEPARATE draw pile. Always available. Exist purely as sacrifice fodder
- This creates a constant tension: your board IS your mana. Summoning a powerful card requires destroying your own position

**TORCH RELEVANCE:** The sacrifice system is visceral. Imagine a football version: you must "sacrifice" a player's energy/stamina to execute a power play. The cost is visible and emotional, not just numerical.

### Cards That Talk To You
- Several cards in your deck are sentient — they are people trapped inside cards by the antagonist
- They offer advice, beg for help, warn about dangers, have personalities
- This creates emotional attachment to individual cards — you don't just care about stats, you care about the character
- When a talking card dies, it HURTS in a way a generic "Skeleton 2/3" never would

**TORCH RELEVANCE:** What if specific players on your TORCH roster had personality? Not just stats but voice lines, reactions, complaints? "Coach, stop running me on 3rd down, I'm exhausted" — this is the Inscryption principle applied to sports.

### Totem System — Tribe-Based Synergies
- Totems grant a sigil (ability) to ALL cards of a specific tribe
- Two-part: Totem Head (determines which tribe) + Totem Body (determines which sigil)
- Creates explosive combos: give all Wolves the "Unkillable" sigil and you have infinite sacrifice fodder
- The specific combo of two 1-blood same-tribe cards + Unkillable totem = infinite loop (sacrifice one, it returns, sacrifice it again)

**Key design insight:** Totems are a "rule-changing" system. They don't add cards to your deck — they change how existing cards work. This creates emergent combos the designer didn't explicitly program.

### Meta-Narrative Integration
- The game provides NO context at the start. Story is assembled from clues
- Act 1 is a cabin with a mysterious figure across the table (Leshy)
- Players can get up from the table, explore the cabin, solve puzzles
- Puzzles USE card game logic — internalizing card mechanics helps solve meta-puzzles
- The game shifts genres entirely between acts (cabin horror -> digital card game -> retro RPG)
- Cards and mechanics from Act 1 persist metaphorically into later acts

**Key design insight:** Gameplay and narrative are not separate tracks. The card mechanics ARE the story. When you sacrifice a card, you're participating in the narrative's themes of sacrifice and control.

---

## 3. Monster Train — Lanes, Champions, Differentiation

### Why It Matters
Monster Train (Shiny Shoe, 2020) is the strongest Slay the Spire alternative because it found a genuinely different spatial mechanic while keeping the deckbuilder core.

### The Floor/Lane System
- **3 floors** + engine room (where the Pyre sits)
- Enemies enter from the bottom floor and move UP each turn
- Surviving enemies on floor 3 reach the Pyre and damage it directly
- You deploy units to floors (limited space per floor — typically 2-5 units depending on unit size)
- Spells cast from hand affect specific floors
- This creates a **tower defense** layer on top of deckbuilding

**Key design insight:** The floor system means positioning matters. A 10/10 unit on the wrong floor is useless. This adds a spatial dimension that StS completely lacks.

### Champion System
- Your primary faction gives you a **Champion** — a powerful unit that returns every combat
- Each champion has **3 upgrade paths** with **3 levels** each (9 possible upgrade choices)
- Champions upgraded at Dark Forge events during the run
- Example: Penumbra (Umbra faction)
  - Architect path: Increases floor capacity (lets you deploy more units on its floor)
  - Monstrous path: Huge stat bonuses + Trample ability (overkill damage hits next unit)
  - Glutton path: Interacts with Umbra's "Eaten" mechanic (consumes friendly morsels for buffs)

**TORCH RELEVANCE:** The champion system is directly applicable. In football: your star quarterback has multiple development paths. Do you build him as a pocket passer, a scrambler, or a game manager? Each path changes what supporting cards (plays, receivers) you want around him.

### Dual Faction System
- 5 factions total; you pick 2 per run (primary + allied)
- Primary faction determines your champion
- Allied faction adds cards and units to your reward pool
- 10 possible faction combinations, each playing dramatically differently
- Examples:
  - **Hellhorned + Umbra**: Explosive rage scaling + morsel engine for sustained high damage
  - **Stygian + Melting Remnant**: Spell scaling + reform (revive dead units) for defensive attrition

**Key design insight:** The dual faction system creates 10 "classes" from 5 factions. This is multiplicative content — each faction is designed to be interesting on its own, but combinations create emergent strategies.

### Ember (Mana) System
- Similar to StS energy, but with faction-specific generation
- High Covenant (difficulty) runs reduce starting ember, demanding more careful planning
- Some factions can generate bonus ember through mechanics

### Differentiation from Slay the Spire
| Feature | Slay the Spire | Monster Train |
|---------|----------------|---------------|
| Combat | 1v1 (you vs enemies) | Deploy army on 3 floors |
| Positioning | None | Floor placement is critical |
| Persistent unit | None (you ARE the character) | Champion returns every fight |
| Class system | 4 fixed characters | 10 faction combos from 5 factions |
| Scaling | Cards + relics | Cards + relics + champion upgrades |
| Defense | Block points | Unit HP + floor positioning |

---

## 4. Luck Be a Landlord — Slot Machine Roguelike

### Why It Matters
Luck Be a Landlord (TrampolineTales, 2021) proves the deckbuilder formula works even WITHOUT cards. It replaces the deck with a slot machine and cards with symbols, creating a system of pure passive synergy.

### Core Loop
1. Spend 1 coin, spin the slot machine
2. Symbols land, generate money based on their effects and adjacencies
3. Between spins, choose a new symbol to add (from 3 options)
4. Every few spins, pay rent (increasing amounts)
5. After rent payment, choose an item (permanent modifier)
6. If you can't pay rent, game over

### Slot Machine Design
- **5 reels**, each showing **4 symbols** = 20 visible symbols per spin
- Symbols NOT visible (off-screen) do nothing
- Processing order: top to bottom in each reel, left to right across reels
- Processing continues until no more synergies trigger (chain reactions are possible)

### Passive Synergy System
- Symbols interact based on **adjacency** and **presence**:
  - **Cat** drinks adjacent **Milk** (Cat earns bonus coins)
  - **Bee** pollinates adjacent **Flower** (Flower earns bonus coins)
  - **Thief** steals from adjacent symbols (removes their coins but adds to Thief)
  - **Mrs. Fruit** gives coins for every fruit symbol on the board
- Some symbols **destroy** others (creating risk/reward)
- Some symbols **multiply** the payout of neighbors
- Some symbols **transform** into other symbols under conditions

### Emergent Combo Examples
- Fill the board with Cats + Milk = massive passive income
- Combine Bees + Flowers + Honey = pollination chains
- Use Thieves to concentrate value, then multiply the Thief's total

**TORCH RELEVANCE:** This is the "Balatro principle" in a different skin. Passive synergies between elements create emergent combos the player discovers. For TORCH: what if player cards had passive synergies? A fast receiver next to a strong QB creates an adjacency bonus. A blocking TE "protects" the adjacent RB symbol. This is the slot machine / Balatro approach applied to football formation.

### Items as Build Shapers
- Items obtained after each rent payment
- Permanent modifiers that define your strategy
- Force you to commit to a build direction early

**Key design insight:** The beauty is that the player doesn't "play" anything during the spin. All the action is passive. The skill is entirely in CONSTRUCTION — choosing which symbols to add and which items to take. The slot machine just reveals whether your build works.

---

## 5. Shotgun King — Known Game + Roguelike Progression

### Why It Matters
Shotgun King: The Final Checkmate (Punkcake Delicieux, 2022) takes chess — a game everyone knows — and bolts roguelike card modifiers onto it. It proves that a familiar base game + roguelike progression = magic.

### Core Mechanic
- You are the King. You have a shotgun
- Every turn: move OR shoot (shooting requires reloading = one move to reload)
- All other chess pieces are enemies, moving by standard chess rules
- Shotgun has physical spread — accuracy depends on distance, not RNG percentage
- Clustered enemies can be hit with one shot (spatial strategy)
- Kill the enemy King to clear the board

### The Card Modifier System — The Key Innovation
- After clearing each board, choose from **two pairs of modifiers**
- Each pair has a **player buff** and an **enemy buff** — you MUST take both
- Examples:
  - Player: Expand ammo count / Enemy: Additional queens appear
  - Player: Shotgun becomes a sniper rifle / Enemy: Enemy pieces gain healing
  - Player: Moat appears in the middle of the board / Enemy: Pieces gain ranged attacks
- The tension is in evaluating which COST is acceptable for which BENEFIT
- Some buffs seem amazing until the enemy buff completely counters them

**TORCH RELEVANCE:** This is the Shotgun King principle: take something everyone knows (football), add roguelike modifiers. "After each drive, choose a modifier: Your RB gets +2 yards per carry, BUT the opponent's pass rush gets +1 pressure." The double-edged modifier creates agonizing, meaningful choices.

### Design Lessons
- The familiar base (chess) means zero tutorial needed for core movement
- Card modifiers create the replayability — same chess, different rules every time
- The "pill you must swallow" design forces risk assessment, not just power accumulation
- Runs are SHORT (15-20 minutes) — perfect for "one more run" psychology

---

## 6. Dicey Dungeons — Dice as Cards

### Why It Matters
Dicey Dungeons (Terry Cavanagh, 2019) replaces cards with dice, proving the deckbuilder formula is about RESOURCE MANIPULATION, not specifically cards.

### Core Mechanic
- Each turn, roll a set of dice (number depends on level and character)
- **Equipment** = the "cards." Each piece of equipment accepts dice of specific values
- Example equipment:
  - Sword: Place any die. Deal damage equal to die value
  - Shield: Place any die. Gain block equal to die value
  - Lockpick: Place a die showing 6. Gain 2 extra dice
  - Pea Shooter: Place a die showing 1-3. Deal 2 damage

### Dice Manipulation = Deck Thinning Equivalent
- Some equipment CHANGES dice faces (turn a 3 into a 6)
- Some equipment SPLITS dice (turn a 6 into two 3s)
- Some equipment REROLLS dice
- The skill is in **manipulating your dice to fit your equipment**, not just rolling well
- This is the exact same skill as deck thinning in StS: you're trying to make your resources more predictable

### 6 Character Classes = Different Puzzle Approaches
- **Warrior**: Straightforward damage, gets a free reroll per turn
- **Thief**: Steals enemy equipment, duplicates dice
- **Robot**: Calculates — adds dice values together, aims for target numbers
- **Inventor**: Crafts gadgets from combinations of dice values
- **Witch**: Uses spells that require specific dice combinations (like poker hands)
- **Jester**: Completely unique mechanic — snap-judgments on random card offerings

**TORCH RELEVANCE:** The dice-as-resource model could apply to football. What if each turn you roll dice representing: Arm Strength, Accuracy, Speed, Blocking? Then your plays are equipment that require specific stats. A Hail Mary requires high Arm Strength (5-6), but a Screen Pass works with any value. Your "build" is about acquiring plays that match your dice tendencies.

### The Probability Awareness Design
- Players learn to think in probabilities naturally
- "I need a 5 or 6 to use my best equipment — that's a 33% chance, or I can use my dice splitter..."
- This probabilistic thinking IS the skill, disguised as a fun dice game

---

## 7. Neon White — Dual-Use Card Design

### Why It Matters
Neon White (Angel Matrix, 2022) demonstrates the most elegant dual-use card design in gaming. Every card does TWO completely different things depending on how you use it.

### The Dual-Use Principle
Each "Soul Card" has:
1. **USE**: Functions as a weapon (shoot enemies)
2. **DISCARD**: Functions as a movement ability (traverse the level)

You cannot do both. Using a card as a weapon means you DON'T get the movement. Discarding for movement means you LOSE the weapon.

### Specific Card Designs

| Card | USE (Weapon) | DISCARD (Movement) |
|------|-------------|-------------------|
| **Elevate** | Pistol (basic shots) | Double jump upward |
| **Purify** | Assault rifle (automatic fire) | Throw sticky grenade (explosion propels you) |
| **Godspeed** | Rifle (precision shots) | Massive horizontal dash through enemies |
| **Stomp** | SMG (spray and pray) | Slam downward, shockwave on impact |
| **Fireball** | Shotgun (3 powerful shells) | Directional air dash, destroys enemies in path |

### Design Constraints That Create Depth
- Can only hold **2 unique card types** at once
- Can stack up to **3 of the same card** (more ammo, more discards)
- This means: do you carry 2 Fireballs (safe, lots of shotgun ammo) or 1 Fireball + 1 Godspeed (more movement options, less ammo)?

### The Evolution Story
- Originally designed as a deckbuilder with random weapon draws — **it wasn't fun**
- Designer Ben Esposito removed deckbuilding and randomized levels
- Added risk/reward via the discard mechanic
- The game transformed from "card game" to "time attack FPS platformer"
- Cards stopped being "weapons" and became "resources for movement"

**Key design insight:** The discard mechanic was an accidental discovery that became the core. Players don't think about cards as weapons — they think about cards as movement resources. The combat use is secondary.

**TORCH RELEVANCE:** What if TORCH plays had dual-use? A "Hail Mary" card could be USED as a long pass attempt (high risk, high reward) OR DISCARDED to gain "Momentum" (a resource that powers other plays). Every card becomes a strategic choice between its face value and its sacrifice value.

---

## 8. Ring of Pain — Circular Dungeon, Risk-Reward

### Why It Matters
Ring of Pain (Twice Different, 2020) strips the roguelike deckbuilder to its most minimal form: you don't even have a deck. The dungeon IS the deck.

### The Ring Structure
- Dungeon is a circular ring of face-up cards
- You can see exactly 2 cards at a time (your current position)
- Cards are: enemies, treasure, equipment, events, exits
- You move clockwise around the ring
- Moving past a card activates it — fight, loot, or trigger event
- Design originated from: "What if roguelikes didn't have empty hallways?"

### Risk-Reward Positioning
- At each position, you see the current card and the next card
- Options:
  - **Attack** the current card (speed stat determines who strikes first)
  - **Sneak past** the current card (chance of taking damage based on stealth stat)
  - **Move to the card on the other side** (if it's not an enemy, safe passage)
- The ring reacts to your actions — defeating enemies may change the ring's composition
- Equipment is limited — each inventory slot holds ONE item of that type (weapon, armor, ring, etc.)

### Challenge Through Choice, Not Mechanical Skill
- All outcomes are displayed on screen before you act
- You always know exactly how much damage you'll deal and take
- The difficulty comes from SEQUENCE — which cards to fight, which to avoid, and in what order
- Resource management (HP, equipment durability) across the ring is the actual game

**TORCH RELEVANCE:** The ring structure is interesting for football. Imagine a "drive" as a ring of defensive plays you must navigate. You see 2 at a time. Some you must fight through (engage the defense), some you can sneak past (audible to exploit weak coverage). The spatial metaphor of moving through a ring of threats maps well to driving down a football field.

---

## 9. What Makes the Best Deckbuilders Tick

### Common Pattern #1: Meaningful Choices at Every Scale

The best deckbuilders present meaningful choices at THREE scales:
1. **Micro** (within a turn): Which cards to play, in what order, with which targets
2. **Meso** (within a run): Which cards to draft, which to skip, which path to take
3. **Macro** (across runs): Which character/build to attempt, which challenges to tackle

Every choice must feel like it MATTERS. If the player can't articulate why they chose A over B, the choice is fake.

### Common Pattern #2: Combo Discovery

The best moment in any deckbuilder is: "Wait... THESE work together?!"

This requires:
- Cards with effects that aren't obviously synergistic at first glance
- Enough mechanical variety that unexpected interactions emerge
- A system complex enough to surprise the DESIGNER (emergent combos the dev didn't explicitly plan)
- Slay the Spire example: Dead Branch + Corruption = exhaust all skills for free, each generates a random card. The deck becomes infinite
- Balatro example: Joker ordering creates multiplicative chains the player discovers through experimentation

### Common Pattern #3: Escalating Power Fantasy

The run should feel like a crescendo:
- **Early**: Scrappy, survival-focused, every fight is tense
- **Middle**: Build is forming, synergies emerging, player sees the shape of their strategy
- **Late**: Build is ONLINE. Player is demolishing encounters that would have killed them earlier
- The "I am become death" moment — when the build fully comes together and you're operating at 10x the power of your starting state

Balatro's version: a hand that scored 50 points at the start now scores 50,000. The acceleration is visible and intoxicating.

**TORCH RELEVANCE:** TORCH needs this crescendo. Early game: struggling to move the chains, every yard is hard. Mid game: your playbook is gelling, you're finding holes in the defense. Late game: you're running the hurry-up offense, scoring at will, the defense can't stop your engine. This is the same power fantasy arc in football terms.

### Common Pattern #4: Managed Randomness (Input vs Output)

**Input randomness**: Randomness that happens BEFORE the player's decision (what cards you draw, what enemies appear). The player can REACT.

**Output randomness**: Randomness that happens AFTER the player's decision (did the attack hit? Did the coin flip go your way?). The player can only HOPE.

The best deckbuilders use primarily **input randomness** and minimize **output randomness**:
- StS: Card draw is random (input), but damage is deterministic (no output)
- Balatro: Which jokers appear is random (input), but scoring is deterministic (no output)
- Bad deckbuilders: "Your attack has a 60% chance to hit" is output randomness and feels terrible

The Hades approach: RNG picks 3 options, player picks 1. Random generation, deterministic choice.

**TORCH RELEVANCE:** This is CRITICAL for TORCH. Football has inherent output randomness (will the pass be complete?). The challenge is minimizing feel-bad moments. Show the player the probability. Let them choose the risk level. Never have a play "just fail" with no player input. If a play fails, the player should be able to point to the decision that caused it.

### Common Pattern #5: Deck Composition Control

Players MUST be able to shape their deck, not just add to it:
- **Card removal** (shops, events, mechanics)
- **Card upgrade** (rest sites, events)
- **Deck thinning** via exhaust/burn mechanics
- Skipping a card reward is often the correct play
- The game must make "not adding a card" feel like a viable and sometimes optimal strategy

### Common Pattern #6: Interconnected Systems ("Engine Building")

Every system feeds into others:
- Cards synergize with relics
- Relics change what cards you want
- Map pathing determines what relics and cards you encounter
- Character choice determines what cards exist in the pool
- This creates a web of decisions where NOTHING is evaluated in isolation

The board game design term is **"engine building"** — assembling a machine where each piece makes the other pieces stronger.

---

## 10. Failed Deckbuilders — What Goes Wrong

### Pitfall #1: Excessive Randomness Without Agency
- When random elements can destroy a run with no player recourse
- "I lost because the shop didn't have the card I needed" = bad design
- Solution: Always provide 2-3 options. Never present a single take-it-or-leave-it random outcome for critical moments

### Pitfall #2: Homogeneous Strategy
- When one strategy dominates, every run plays the same
- Players find the "best build" and repeat it forever
- Solution: Balance through variety, not through nerfing. Make 5 builds viable, not 1 build balanced
- StS solves this by making card offerings partially random — you can't reliably assemble the same deck twice

### Pitfall #3: Cards Without Identity
- Every card feels like "Deal X damage" or "Gain X block" with different numbers
- No mechanical differentiation between cards
- Solution (from Adam Millard): Cards need to enable synergies, create interesting decisions in long-term strategies, AND have distinct identities. All three simultaneously

### Pitfall #4: Wrong Pacing
- **Too short**: Can't develop a satisfying build. The build never "comes together"
- **Too long**: Loses the "one more run" factor. Commitment anxiety
- Sweet spot: **30-60 minutes per run** for most successful deckbuilders
  - StS: ~45-60 min
  - Balatro: ~30-45 min
  - Monster Train: ~30-40 min
  - Shotgun King: ~15-20 min (shorter but compensates with faster iteration)

### Pitfall #5: Difficulty Spikes / Bad Curve
- Unpredictable difficulty makes players feel cheated
- Solution: Difficulty should be a RAMP, not a series of random spikes
- StS solves this with act structure — Act 1 is always easier than Act 2, always easier than Act 3

### Pitfall #6: Information Overload
- Too many stats, abilities, keywords, and interactions
- Decision paralysis — player is overwhelmed and stops having fun
- Solution: Lenticular design — cards that LOOK simple but reveal depth over time
- First read: "Deal 8 damage." After 10 hours: "Deal 8 damage... which triggers my relic, which procs my other card, which..."

### Pitfall #7: No Identity / Too Clone-y
- "It's like Slay the Spire but worse" — the kiss of death
- The roguelike deckbuilder market is SATURATED (2025-2026 data shows year-over-year decline in the tag)
- Must have a clear hook that differentiates from StS in the first 30 seconds of gameplay
- Bramble Royale: critically praised but commercially failed because players saw "another StS clone" and bounced

**TORCH RELEVANCE:** TORCH's identity is clear: it's FOOTBALL. That's the differentiation. But it still needs to nail every other principle. The football theme IS the hook, but the mechanical depth is what retains.

---

## 11. The Meta-Progression Question

### When Meta-Progression Helps

**As a gradual tutorial:**
- Early runs are simpler with fewer cards/mechanics
- Unlocks introduce complexity incrementally
- Player is never overwhelmed
- Works best when unlocks are earned quickly and automatically (not grindy)

**As variety expansion:**
- New characters, new card pools, new relics
- Each unlock adds a NEW way to play, not more power
- StS does this well: unlocking cards for a character adds options, not advantages

**As motivation:**
- "I unlocked the Watcher!" gives a reason to try again after a loss
- Progress bars and unlock notifications trigger dopamine
- Critical for the first 5-10 hours when the player hasn't yet internalized the fun of the core loop

### When Meta-Progression Hurts

**Power gating:**
- When necessary stat upgrades are locked behind multiple failed runs
- "The game is impossible to beat on your first run because you haven't unlocked the good stuff"
- This feels like the game is CHEATING — punishing you for being new, not for being bad

**Content gating:**
- When core content (acts, bosses, mechanics) is locked behind progression
- Player never sees the full game without dozens of hours
- Feels manipulative, like a mobile game retention trick

**Undermining skill:**
- When a skilled player on a fresh account CANNOT win because they lack unlocks
- Skill should always be a path to victory, regardless of meta-progression
- "Perfect play on the first run should allow winning" — the gold standard

### The Spectrum

| Game | Meta-Progression Type | Assessment |
|------|----------------------|------------|
| Slay the Spire | Unlock new cards/relics (options, not power) | Gold standard |
| Balatro | Unlock new jokers/decks (options) | Excellent |
| Hades | Permanent stat upgrades + story progression | Good but borderline power-gating |
| Rogue Legacy | Heavy stat upgrades required | Too grindy for some |
| Monster Train | Card/clan unlocks (options) | Excellent |

### The Best Approach
**Unlock OPTIONS and COMPLEXITY, not RAW POWER.**

The player should feel: "Now I have MORE choices" not "Now I'm STRONGER."

**TORCH RELEVANCE:** TORCH meta-progression should unlock new plays, new player archetypes, new formations — NOT "+1 to all passing stats." A rookie coach should be able to win with skill and good decisions. An experienced coach should have more TOOLS, not more POWER.

---

## 12. Emerging Trends 2025-2026

### Slay the Spire 2 (Early Access, 2025)
- Launched to 175,000+ concurrent players
- New characters: Necrobinder (minion summoning, Exhaustion resource), Regent (Stars resource, Forge keyword)
- **Co-op multiplayer** (up to 4 players!) — some cards specifically designed for helping allies
- **Relic upgrades** at rest sites (a new dimension beyond card upgrades)
- **Dynamic enemies** — elites and bosses adapt intent based on player's board state
- **Alternate acts** — branching story paths change run structure
- **Enchantment system** — card customization beyond simple upgrades
- New keywords: "Momentum" and "Echo" for turn economy
- Built on Godot (not Unity) — better modding potential
- Deeper exhaust pile interactions — dual-type cards gain power based on what's been exhausted

### Genre Fusions — The New Frontier
- **StarVaders**: Turn-based tactics + deckbuilder (Space Invaders-style enemy march)
- **Shroom & Gloom**: First-person exploration + deckbuilder (two separate decks: combat + exploration)
- **Into the Restless Ruins**: Dungeon-building + deckbuilder (your hand of cards creates the dungeon, then you autobattle through it)
- **Hungry Horrors**: Cooking + deckbuilder (cook recipes to feed deadly creatures)
- **Spinera**: Civilization-building + slot machine roguelike (spin for resources, combine with tech/wonders)
- **NUTMEG!**: Football management + deckbuilding (build a team through '80s/'90s as a gaffer)
- **MECHBORN**: Your mech IS the deck (body parts are cards)

### Market Reality
- The roguelike deckbuilder tag shows **year-over-year decline** on Steam
- Market saturation is real — "every game is a roguelike deckbuilder now"
- BUT: games with a genuine twist still break through (Balatro, StS2)
- The bar for entry has risen dramatically — generic StS clones no longer find audiences
- Innovation is mandatory, not optional

### What's Selling in 2026
1. **Unique core mechanic** (not just "cards + roguelike")
2. **Strong visual identity** (Balatro's retro aesthetic, Inscryption's horror vibe)
3. **Accessible on entry, deep on mastery**
4. **Clear 30-second pitch** ("It's poker but the jokers change the rules" — Balatro)

---

## 13. TORCH Takeaways — Design Principles to Steal

### From Slay the Spire
- **Branching map with guaranteed beats**: Structure drives, not just randomly. Guaranteed events at specific points (halftime, two-minute warning, red zone)
- **Enemy intents**: Show the defense's formation/intent before the player calls a play. Convert guessing into planning
- **Energy/resource system**: Limited play calls per drive. Can't spam your best play forever
- **Ascension-style difficulty**: Same content, harder modifiers. Cheap to build, infinite replayability
- **Deck thinning**: The ability to CUT plays from your playbook is as strategic as adding them

### From Inscryption
- **Cards with personality**: Players on your roster should feel like characters, not stat blocks
- **Sacrifice mechanics**: Using a player "costs" something visible (stamina, injury risk). Makes every deployment emotional
- **Meta-narrative**: The season itself tells a story. Rivalries build, injuries create drama, comebacks feel earned

### From Monster Train
- **Spatial/positional mechanics**: Football IS spatial. Formation matters. Where you put players on the field matters
- **Champion development paths**: Star players evolve in different directions. Your QB can become a pocket passer OR a dual-threat
- **Dual faction system**: Offensive + Defensive philosophy creates combinatorial variety (West Coast + Zone Defense vs. Air Raid + Man Coverage)

### From Luck Be a Landlord
- **Passive synergies**: Players on the field buff each other just by being there. A good O-line passively boosts the RB. A shutdown corner lets the pass rush develop
- **The "build reveals itself" moment**: When you spin and the synergies chain — this is the touchdown drive where everything clicks

### From Shotgun King
- **Take a known game, add roguelike modifiers**: Football is the chess. Roguelike modifiers are the shotgun
- **Double-edged choices**: Every upgrade comes with a defensive upgrade too. "Your WR gets +speed, but their CB gets +coverage"
- **Short runs**: 15-20 minute drives/games keep the "one more" factor alive

### From Dicey Dungeons
- **Resource manipulation IS the game**: Whether it's dice, cards, or play calls — the skill is in making your resources fit your equipment/plays
- **Character classes as different puzzle approaches**: Different team archetypes (run-heavy, pass-heavy, balanced) should feel like playing a different game

### From Neon White
- **Dual-use cards**: Every play card has a USE (execute the play) and a DISCARD (sacrifice for momentum/resources). Creates agonizing decisions
- **Accidental discovery**: Sometimes the best mechanic comes from iteration, not planning. Stay open to pivots

### From Ring of Pain
- **Minimal design, maximum depth**: You don't need a huge deck to have interesting decisions. Sometimes 2 choices is enough
- **Visible risk/reward**: Show the player exactly what they're risking and what they might gain. No hidden information in the outcome

### Universal Principles for TORCH
1. **Input randomness, not output randomness**: Randomize what options appear, not whether the chosen option works
2. **30-second pitch**: "It's football, but your playbook is a roguelike deck that evolves every drive"
3. **The build comes together moment**: Every run needs a moment where the player's strategy clicks and they feel unstoppable
4. **Meaningful choices at every scale**: Play-level, drive-level, game-level, season-level decisions all matter
5. **Unlock options, not power**: Meta-progression adds new plays and formations, not stat boosts
6. **Identity through theme**: Football IS the identity. Lean into it hard. Don't be "StS but football" — be "football that plays like a deckbuilder"
7. **Lenticular design**: Plays should look simple ("Pass to WR1") but reveal depth ("Pass to WR1... who triggers my West Coast Offense relic, which chains into my Quick Release upgrade, which lets me run a no-huddle next play")

---

## Sources

### Slay the Spire
- [Game Design Tips from Slay the Spire — Cloudfall Studios](https://www.cloudfallstudios.com/blog/2020/11/2/game-design-tips-reverse-engineering-slay-the-spires-decisions)
- [In-Depth Analysis of Game Design in 'Slay the Spire' — Oreate AI](https://www.oreateai.com/blog/indepth-analysis-of-game-design-in-slay-the-spire/31e5a1880268eaa391d06856f239fbf6)
- [GDC Vault — 'Slay the Spire': Metrics Driven Design and Balance](https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics)
- [How Slay the Spire's devs use data to balance — Gamedeveloper](https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder)
- [Map Generation — Slay the Spire Wiki](https://slaythespire.wiki.gg/wiki/Map_Generation)
- [Mechanics — Slay the Spire Wiki](https://slaythespire.wiki.gg/wiki/Mechanics)
- [Why Slay the Spire Still Rules — VideoGamer](https://www.videogamer.com/features/why-slay-the-spire-still-rules-the-roguelike-deckbuilder-genre/)

### Inscryption
- [Inscryption Tells a Meta Story in the Cards — Game Wisdom](https://game-wisdom.com/analysis/inscryption)
- [Why Inscryption's Metafiction Stands Out — Game Rant](https://gamerant.com/inscryption-meta-narrative-card-games-stand-out-selling-point/)
- [How a game jam on "sacrifices" became Inscryption — Gamedeveloper](https://www.gamedeveloper.com/design/how-game-jam-sacrifices-became-inscryption)
- [Horror as Mechanic in Inscryption — Intermittent Mechanism](https://intermittentmechanism.blog/2022/11/16/horror-as-mechanic-in-inscryption/)

### Monster Train
- [Monster Train Review — Game Wisdom](https://game-wisdom.com/analysis/monster-train)
- [Monster Train May Have Dethroned Slay The Spire — The Gamer](https://www.thegamer.com/monster-train-slay-the-spire-comparison/)
- [Champions — Monster Train Wiki](https://monster-train.fandom.com/wiki/Champions)

### Luck Be a Landlord
- [Luck Be a Landlord — Wikipedia](https://en.wikipedia.org/wiki/Luck_Be_a_Landlord)
- [Luck Be a Landlord Wiki — Fandom](https://luck-be-a-landlord.fandom.com/wiki/Luck_be_a_Landlord)

### Shotgun King
- [Shotgun King — Wikipedia](https://en.wikipedia.org/wiki/Shotgun_King:_The_Final_Checkmate)
- [Shotgun King: Indie roguelike takes chess and adds hot lead — PC Gamer](https://www.pcgamer.com/indie-roguelike-shotgun-king-takes-chess-and-adds-hot-lead-and-a-grudge/)

### Dicey Dungeons
- [Dicey Dungeons — Wikipedia](https://en.wikipedia.org/wiki/Dicey_Dungeons)
- [Dicey Dungeons — Thinky Games](https://thinkygames.com/games/dicey-dungeons/)

### Neon White
- [Neon White and designing for player creativity — Gamedeveloper](https://www.gamedeveloper.com/business/-neon-white-and-designing-for-player-creativity)
- [Complete Guide To Soul Cards — The Gamer](https://www.thegamer.com/neon-white-soul-cards-tips-tricks-guide/)
- [Soul Card — Neon White Wiki](https://neonwhite.fandom.com/wiki/Soul_Card)

### Ring of Pain
- [Ring of Pain — Steam](https://store.steampowered.com/app/998740/Ring_of_Pain/)
- [Ring of Pain Review — The Strategy Informer](https://www.thestrategyinformer.com/game-reviews/ring-of-pain-review/)
- [Ring Of Pain Review — COGconnected](https://cogconnected.com/review/ring-of-pain-review/)

### Design Patterns & Failures
- [Common Deckbuilder Pitfalls — New to Narrative](https://newtonarrative.com/news/common-deckbuilder-pitfalls/)
- [Roguelike Deckbuilder Balancing — GameDev.net](https://www.gamedev.net/forums/topic/715223-roguelike-deckbuilder-balancing/)
- [Roguelike Itemization: Balancing Randomness and Player Agency — Wayline](https://www.wayline.io/blog/roguelike-itemization-balancing-randomness-player-agency)
- [Tackling deckbuilding and roguelite design in Roguebook — Gamedeveloper](https://www.gamedeveloper.com/design/tackling-deckbuilding-design-in-abrakam-s-roguebook)
- [How Balatro Offers Power Fantasy Through Math — Kokutech](https://www.kokutech.com/blog/gamedev/design-patterns/power-fantasy/balatro)
- [Why did this excellent roguelike deckbuilder fail to scale? — GameDiscover](https://newsletter.gamediscover.co/p/why-did-this-excellent-roguelike)

### Emerging Trends
- [Every game is a roguelike deckbuilder now — PC Gamer](https://www.pcgamer.com/games/roguelike/every-game-is-a-roguelike-deckbuilder-now-but-ive-finally-found-a-few-that-have-stopped-me-being-a-hater/)
- [5 upcoming roguelike deckbuilders with big twists — PC Gamer](https://www.pcgamer.com/games/roguelike/these-5-upcoming-roguelike-deckbuilders-caught-my-eye-because-they-have-big-twists-on-the-usual-formula/)
- [Most Anticipated Rogues of 2026 — Rogueliker](https://rogueliker.com/roguelike-release-dates-2026/)
- [Slay the Spire 2 New Mechanics Explained — GAMES.GG](https://games.gg/slay-the-spire-2/guides/slay-the-spire-2-new-mechanicsmode-classes-explained/)
- [Upcoming Deckbuilder Games 2026 — DualShockers](https://www.dualshockers.com/upcoming-deckbuilder-games-to-keep-on-your-radar-in-2026/)
