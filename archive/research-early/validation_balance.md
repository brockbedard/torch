# Validation: Simultaneous Reveal + Poker Game Balance

This document outlines research findings on how to balance "Simultaneous Reveal" mechanics with "Poker-style" risk management, specifically focusing on preventing RNG frustration and rewarding skill over luck.

## 1. Preventing "RNG Frustration" (Informed Prediction)
Pure simultaneous reveal often falls into the "Rock-Paper-Scissors" (RPS) trap. Top-tier games mitigate this by providing enough data to turn a "blind guess" into an "informed read."

### A. Telegraphing & Clues
*   **Personnel Groupings (Football Specific):** Before the secret play selection, players reveal "Personnel" (e.g., "Heavy Goal Line" vs. "4 Wide Receivers"). This narrows the pool of likely plays and allows for "double-think" strategies.
*   **Row/Zone Constraints (Gwent/Field Zones):** In Gwent, row-locked abilities provide clues. In a football context, committing units to "The Flats" or "The Seams" provides visible tells that an opponent can react to.
*   **Public History & Card Exhaustion:** Tracking what an opponent has already used (Discard Piles) makes their future reveals more predictable. If a player has used their "Blitz" card, the opponent knows they are safer to attempt a "Long Pass."

### B. Information Asymmetry
*   **Wind-up Phase:** Introduce a phase where players commit to a *type* of action (e.g., "Pass Strategy") before the specific *execution* (e.g., "Post Route").
*   **Visible Resources:** Display stamina, "Timeouts," or "Audible" points. A player low on stamina is statistically more likely to choose a conservative move, making the opponent's "guess" feel like a "read."

## 2. Priority & Timing Mechanics (The "Coin Flip" Solution)
Simultaneous reveal games must handle resolution order deterministically to avoid "tie-breaker" frustration.

*   **Deterministic Priority (Marvel Snap):** Award "Priority" (who reveals first) to the player currently winning. This allows for **Priority Management**—intentionally losing the lead to "throw priority" and ensure your counter-cards reveal last.
*   **Speed/Initiative Stats:** Assign a speed value to cards. A "Fast Receiver" card might resolve its yardage gain before a "Heavy Linebacker" can trigger a tackle effect, even if revealed simultaneously.
*   **The "Audible" Window:** Allow a limited resource (like a Timeout) to let a player swap their revealed card *after* seeing a partial reveal or the opponent's personnel, simulating a QB's pre-snap read.

## 3. Stakes & Risk Management (The "Poker" Layer)
To make "Guessing Right" feel like skill, the *consequences* of the guess must be manageable by the player.

*   **The Snapping/Doubling Mechanic:** Borrowed from Marvel Snap/Backgammon. Players can "Snap" to double the stakes. This shifts the goal from "winning every hand" to "managing cube/point equity."
*   **The Retreat/Fold:** Allow players to retreat at any point before the final reveal for a minor loss. This caps the downside of a "bad read" and rewards players who recognize a losing state early.
*   **Decoupling Win Rate from Progress:** In high-skill games, a 40% win rate can be "positive" if the player wins 8-point games and retreats from 1-point games. This turns "luck" into "probability management."

## 4. Mechanical Counter-Play
*   **Soft vs. Hard Counters:** Avoid binary "Win/Loss" outcomes. A "Blitz" might reduce a "Long Pass" success rate by 60% rather than 100%, allowing for "upsets" based on player stats or small RNG "Skill Flips."
*   **Asymmetric Payoffs:** A "Hail Mary" has a massive payoff but is easily countered. A "Short Run" has a small payoff but is harder to stop. This forces players to weigh the risk-reward ratio of their "reads."
*   **Shared Benefits (Lead and Follow):** If both players pick a similar strategy, both should gain some benefit (e.g., a "Neutral Gain"), reducing the sting of picking the "wrong" counter.

## 5. Summary of Implementation Recommendations
| Mechanic | Purpose | Football Context |
| :--- | :--- | :--- |
| **Personnel Reveal** | Telegraphing | Reveal "3WR" vs "2TE" before picking the play. |
| **Priority System** | Resolve Order | The leading team reveals first (harder to counter-play). |
| **Audible Points** | Skill/Reaction | Use a point to change a play after seeing the D-front. |
| **Point Doubling** | Risk Stakes | Snap on 3rd & Long if you're sure of the Blitz. |
| **Zone Coverage** | Mitigation | Reward matching zones (Read) vs open zones (Burn). |
