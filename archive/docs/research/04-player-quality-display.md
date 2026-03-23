# Research Brief 04: Player Quality Display Systems

## Problem Statement

In v0.7 user testing, OVR numbers (e.g., "82 OVR") confused non-football testers. They did not know whether 82 was good or bad. TORCH needs a quality indicator that is instantly readable for both football fans and casual players on a small mobile card.

## Current TORCH State

Players have OVR values ranging from 72 to 82 in a tight 10-point band:
- **82**: Top starter (Vasquez, Crews, Torres, Gill)
- **80**: Strong starter (Sampson, Knox, Kendrick, Lawson)
- **78**: Starter (Avery, Wilder, Sims, Slade)
- **76**: Bench (Liu, Bishop, Barrett, Owens)
- **74**: Bench (Meyers, Moon, Buckley, Larkin, Kemp)
- **72**: Bench (Walsh, Orozco, Ware)

The `buildMaddenPlayer` function currently renders OVR as a large centered number in Teko 700 font, colored by tier. The number dominates the card visually.

---

## Competitive Analysis

### Marvel Snap: Cost + Power (Two Numbers)
- **Cost** (top-left): Energy required to play the card (1-6)
- **Power** (top-right): Strength contributed to a location
- Both are single-digit numbers on a small scale, making relative comparison trivial
- No rarity tiers on cards themselves; rarity is about collection progression (Series 1-5)
- **Key insight**: Small numbers (1-6) are universally understood. "Is 5 bigger than 3?" requires zero domain knowledge. "Is 82 bigger than 78?" technically works, but the difference *feels* insignificant to newcomers

### Clash Royale: Elixir Cost + Level + Rarity Color
- Elixir cost (1-10) is the primary card identity
- Rarity tiers (Common, Rare, Epic, Legendary, Champion) set card border/frame treatment
- Card Level affects stats but is a progression mechanic, not an identity indicator
- **Key insight**: Rarity tier is communicated through visual treatment (border color, card frame), not a number. Players instantly "feel" that a Legendary card is special before reading any stats

### Slay the Spire: No Power Rating At All
- Cards have no overall "power" number
- Each card describes exactly what it does: "Deal 6 damage" or "Gain 5 block"
- Card rarity (Common, Uncommon, Rare) is shown by card frame color (gray, blue, gold)
- Upgraded cards get a green tint and a "+" suffix on the name
- **Key insight**: When effects are self-explanatory, you do not need a power number. The card tells you what it does

### Balatro: Visual Edition System
- No power ratings on cards. Jokers describe their effect in text
- Visual quality communicated through *editions*: Foil (chip shimmer), Holographic (rainbow shift), Polychrome (animated prismatic)
- Each edition is instantly recognizable by its visual treatment, not by a number
- **Key insight**: Material/finish treatments create an intuitive hierarchy that transcends language and numeracy. A shiny card "feels" better than a flat card without any numbers needed

### Pokemon GO: CP + Stars
- CP (Combat Power) is a large number (10-5000+) that serves as the primary strength indicator
- Star appraisal (0-3 stars) indicates IV quality / long-term potential
- **The problem**: Casual players consistently struggle with whether to prioritize CP or stars. This dual-system confusion is well-documented in community forums
- **Key insight**: Having two quality indicators creates confusion, not clarity. Pick one system and commit to it

### Madden/FIFA Ultimate Team: OVR + Card Tier
- OVR (0-99) is the primary number, displayed prominently
- Card tier (Bronze 60-69, Silver 70-79, Gold 80-84, Elite 85-89, etc.) determines card border treatment
- This is the system TORCH currently mimics, and it is the one that confused testers
- **Key insight**: OVR works for Madden/FIFA because their audience already understands the 0-99 scale from years of sports game context. TORCH cannot assume this context

### Fire Emblem Heroes: Star Rarity (1-5 Stars)
- Stars are the primary quality indicator, displayed on the stat screen and as visual sparkles
- 5-star units have gold sparkles on their map icon; 4-star units have silver sparkles
- Card portrait border changes color by rarity
- Stars directly correlate with stat totals and available skills
- **Key insight**: Stars are universally understood across cultures. More stars = better. No domain knowledge required

### Genshin Impact: Star Rarity (4-5 Stars)
- Characters come in 4-star or 5-star quality only
- Star count determines visual treatment: background color, wish animation, splash art presentation
- **Key insight**: Even a binary distinction (4-star vs 5-star) is enough to communicate "this one is more special." Simplicity scales

### TFT / Auto Chess: Cost Tier + Star Upgrades
- Units have a cost (1-5 gold) that indicates base power tier
- Units visually upgrade from 1-star to 2-star to 3-star by combining copies
- Star upgrades increase unit size on the board and add visual effects
- **Key insight**: The combination of cost tier (fixed identity) and star level (earned progression) creates two distinct, non-confusing axes because they serve different purposes

---

## The Core Question: Does TORCH Even Need Individual Player Ratings?

This is the most important question in the brief. Consider what OVR does in other games versus what TORCH actually needs:

### What OVR does in Madden/FIFA
- Helps players make **draft/acquisition decisions** ("Should I pick the 88 or the 84?")
- Helps players build **team composition** ("My OVR is 86, I need better corners")
- Creates **market value** for trading

### What TORCH actually needs
- Players do NOT draft (team is predetermined in the current design, or drafted from a known small pool)
- There is no trading or market
- The primary decision is which player to **pair with which play** on a given snap
- The real differentiator between players is their **badge** (what play types they boost), not their raw number

**Conclusion**: TORCH's player quality system should emphasize *what a player is good at* (their badge/specialty) rather than *how good they are overall* (a number).

---

## Recommendation: Tier Badges, Not Numbers

### The Proposed System

Replace the prominent OVR number with a **visual tier system** combined with **badge prominence**:

#### Tier System (3 tiers, mapped from current OVR range)

| Tier | Current OVR | Visual Treatment | Label (optional) |
|------|-------------|-----------------|-------------------|
| **Star** | 80-82 | Gold card border, subtle gold shimmer on helmet | None needed |
| **Starter** | 76-78 | Standard card border (team color) | None needed |
| **Reserve** | 72-74 | Dimmer/muted card border | None needed |

#### Why 3 tiers, not 5 or more
- TORCH has only 6 players per side (4 starters + 2 bench)
- With 7 players on the field per side, you need enough differentiation to matter but not so much that it creates noise
- 3 tiers map cleanly to the existing OVR distribution
- 3 tiers are instantly scannable: gold border = best, normal = solid, muted = role player

#### Visual Implementation

1. **Card border treatment** (primary signal):
   - Star tier: 2px gold (#FFB800) border with faint gold outer glow (like the existing Torch card gold frame treatment)
   - Starter tier: 2px team-color border (current behavior)
   - Reserve tier: 1px team-color border at 50% opacity

2. **Badge as the hero element** (replaces OVR as the centered visual):
   - Move the badge icon to where OVR currently sits (top-center of the card)
   - Badge icon rendered at prominent size with the tier-appropriate color treatment
   - This communicates *what the player does* rather than a contextless number

3. **Position + Name remain** (flanking and bottom bar, unchanged)

4. **OVR still exists under the hood** for all engine calculations (snap resolver, AI difficulty modifiers, etc.) -- it just is not shown to the player

#### What This Looks Like on a Card

```
Current card layout:
  ┌─────────────┐
  │  #12  82  WR│   <-- OVR centered, confusing
  │             │
  │   [helmet]  │
  │             │
  │  SAMPSON    │
  └─────────────┘

Proposed card layout:
  ┌━━━━━━━━━━━━━┓   <-- gold border = Star tier
  │  WR  ⚡  #12│   <-- Badge icon centered (SPEED_LINES)
  │             │
  │   [helmet]  │
  │             │
  │  SAMPSON    │
  └━━━━━━━━━━━━━┛
```

### Why This Works for Both Audiences

**For football fans**: Position (WR, QB, RB) and name are still visible. The badge system maps to football concepts they already understand (speed, power, coverage). The tier border gives them a quick read on quality without needing to compare 78 vs 82.

**For non-football people**: A gold-bordered card with a speed icon is instantly readable as "fast, high-quality." No football knowledge needed. The visual hierarchy does the work.

**For the TORCH game loop**: Since the core decision is "which player pairs best with this play," making the badge the hero element directly supports the gameplay. Players learn that the SPEED_LINES badge pairs with deep passes, not because they understand football, but because the game rewards the combo.

---

## Alternative Approaches Considered

### Alt A: Star Rating (1-3 stars under the name)
- Pros: Universal, simple
- Cons: Adds visual clutter to an already small card. Stars are associated with gacha/collection games, which is not TORCH's identity. With only 3 possible values across 6 players, it creates visual noise for minimal information gain.
- **Verdict**: The border treatment communicates the same information more elegantly

### Alt B: Named Tiers with Labels (Elite / Pro / Rookie)
- Pros: Thematic, readable
- Cons: Takes up card real estate with text. "Elite" and "Pro" are Madden-adjacent language that may not resonate with non-football players. Adds cognitive load.
- **Verdict**: Too wordy for a small mobile card. Let the visual treatment speak

### Alt C: Keep OVR but Simplify the Scale (1-10 instead of 72-82)
- Pros: Simpler numbers. "8" is more parseable than "78"
- Cons: Still requires players to understand what the number means. A "6" player -- is that good? In what context? Tested poorly in Marvel Snap community feedback when players didn't understand Power values for new cards.
- **Verdict**: Any number requires context. Visual tiers do not

### Alt D: No Individual Quality Indicator At All (Team Identity Only)
- Pros: Radically simple. Emphasizes team identity (Canyon Tech = air raid, Iron Ridge = ground-and-pound) over individual stats
- Cons: Removes meaningful differentiation between the 6 players on a side. Players need *some* reason to prefer pairing Vasquez over Walsh with a deep pass beyond just the badge. The tier system provides that "this guy is your ace" feeling.
- **Verdict**: Too far. Some quality signal is needed, but it should be visual, not numeric

### Alt E: Balatro-Style Edition Treatments (Foil/Holo/Standard)
- Pros: Gorgeous, modern, premium feel that matches TORCH's visual identity
- Cons: Three visual treatments (foil shimmer, holographic shift, standard flat) would require significant CSS animation work and may not render well on all mobile devices. Could also feel overwrought for a card you glance at for 1-2 seconds during snap selection.
- **Verdict**: Aspirational for v2. The border treatment is the right v1 approach, but Balatro-style editions could be a future reward/progression system

---

## Implementation Notes

### Data Layer (No Change)
Players keep their `ovr` field in `players.js`. The engine uses OVR for all calculations. Add a computed `tier` property:

```js
function playerTier(ovr) {
  if (ovr >= 80) return 'star';
  if (ovr >= 76) return 'starter';
  return 'reserve';
}
```

### Card Component (`cards.js`)
- `buildMaddenPlayer` already receives a `p.tier` value and uses `TIER_COLORS` -- this infrastructure exists
- Replace the centered OVR number with the player's badge SVG icon
- Modify border styling based on tier (gold glow for star, standard for starter, muted for reserve)
- Keep position labels (WR, QB, etc.) in their current flanking position

### What NOT to Change
- Engine calculations (`ovrSystem.js`, `snapResolver.js`, `aiOpponent.js`) continue using numeric OVR
- Badge combo logic unchanged
- Play data tables unchanged

---

## Summary

| Approach | Intuitive? | Mobile-friendly? | Football knowledge needed? | Differentiates 7 players? |
|----------|-----------|-------------------|---------------------------|--------------------------|
| OVR number (current) | No | Yes | Yes (need to know 82 > 78 matters) | Yes but confusing |
| Star rating | Somewhat | Cluttered | No | Weakly (only 3 values) |
| Named tiers | Somewhat | Too wordy | Somewhat | Weakly |
| Simplified number | Somewhat | Yes | Somewhat | Yes but still abstract |
| **Visual tier borders + badge hero** | **Yes** | **Yes** | **No** | **Yes (tier + badge = unique identity)** |

**Recommended approach**: Visual tier borders (gold/standard/muted) with badge icon as the card's hero element, replacing the OVR number. OVR continues to exist under the hood for engine calculations. This gives every player a unique identity (position + badge + tier) that is instantly readable without any football knowledge.

---

## Sources

- [Marvel Snap Help Center: Card Information](https://marvelsnap.helpshift.com/hc/en/3-marvel-snap/faq/21-what-does-the-information-on-cards-mean/)
- [Charlie INTEL: Every Card in Marvel Snap](https://www.charlieintel.com/games/every-card-in-marvel-snap-power-cost-abilities-222833/)
- [Clash Royale Wiki: Cards](https://clashroyale.fandom.com/wiki/Cards)
- [Genshin Impact Wiki: Quality](https://genshin-impact.fandom.com/wiki/Quality)
- [Fire Emblem Wiki: Rarity](https://fireemblemwiki.org/wiki/Rarity)
- [Pokemon GO Wiki: Combat Power](https://pokemongo.fandom.com/wiki/Combat_Power)
- [ExpertBeacon: Stars or CP in Pokemon GO](https://expertbeacon.com/are-stars-or-cp-more-important/)
- [TFT Beginner Guide (Mobalytics)](https://mobalytics.gg/blog/tft/tft-guide/)
- [Balatro Wiki: Card Modifiers](https://balatrowiki.org/w/Card_Modifiers)
- [TV Tropes: Color-Coded Item Tiers](https://tvtropes.org/pmwiki/pmwiki.php/Main/ColorCodedItemTiers)
- [Claire Fishman: How Color Theory Codifies Item Quality](https://medium.com/@ClaireFish/how-color-theory-codifies-item-quality-in-video-games-104d8118044)
- [Game Studies: Rarity and Power in Collectible Object Games](https://gamestudies.org/1001/articles/ham)
- [Heathrileyo: Rarity in Game Design](https://medium.com/@Heathrileyo/rarity-in-game-design-why-some-cards-and-characters-just-feel-special-d1739a8ab232)
- [Game Informer: Origins of Loot Rarity Colors](https://gameinformer.com/2019/05/18/the-surprising-origins-of-loot-rarity-colors)
