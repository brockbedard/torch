# Market Research: Balatro-Inspired Sports Games & Poker-Mechanic Sports Sims

## Overview
This research explores games that apply "Balatro-style" mechanics—specifically **Base x Mult** scoring, **Joker-like buffs**, and **roguelike deckbuilding/synergy**—to sports or competitive simulations. While the "Sports Roguelike" is a developing niche, several key titles have successfully adapted the math-heavy, run-based loop of Balatro to athletic contexts.

---

## 1. Key Games & Mechanical Parallels

### **Clutchtime: Basketball Deckbuilder**
*   **Sport:** Basketball
*   **The Loop:** Players build a deck of basketball moves (dribbles, passes, shots) to score points against an opposing team's defense across several "quarters" (equivalent to Balatro's Blinds).
*   **Balatro Logic:**
    *   **Base x Mult:** Plays have base point values that are modified by coaching buffs and equipment.
    *   **Joker-Like Buffs:** Instead of Jokers, you collect **Coaches** and **Equipment** cards that provide passive, game-breaking synergies (e.g., "Every 3rd pass adds x1.5 Mult to the next shot").
    *   **Scaling:** Each quarter has a "Point Blind" that increases in difficulty, forcing the player to find exponential scaling strategies.

### **Tape to Tape**
*   **Sport:** Hockey
*   **The Loop:** A hockey roguelite where you travel across a map, drafting players (Elites) and collecting artifacts between matches.
*   **Balatro Logic:**
    *   **Artifact Synergies:** Artifacts function exactly like Jokers. They provide passive buffs that can turn standard hockey plays into high-scoring combos.
    *   **Multipliers:** Certain artifacts apply multipliers to player speed, checking power, or shot accuracy based on conditional triggers (e.g., "Successful passes stack a multiplier for the shooter").

### **Ballionaire**
*   **Genre:** Pinball Roguelike (Sports-adjacent)
*   **The Loop:** Players place "triggers" on a board that generate money when hit by balls. It is frequently cited as the most mechanically similar game to Balatro's math engine.
*   **Balatro Logic:**
    *   **Pure Base x Mult:** The core of the game is about balancing "Base" point-generating triggers with "Multiplier" items.
    *   **Joker-Like Items:** You buy "triggers" that interact with each other (e.g., "If this trigger is hit, double the value of all adjacent triggers"). It mimics the spatial and conditional logic of Balatro's Joker placement.

### **Parlay**
*   **Sport:** Sports Betting (Meta-Sports)
*   **The Loop:** Instead of playing the sport, you are a bettor in a simulated season. You use a deck of "bets" and "buffs" to manipulate outcomes and payouts.
*   **Balatro Logic:**
    *   **Risk/Reward Multipliers:** The game centers on parlay-style multipliers.
    *   **Buff Synergies:** You use Joker-style passive buffs to "rig" the simulation (e.g., "Give the home team +10 points," or "Multiply all underdog payouts by 2x").

---

## 2. Competitive Genre: The "Gambling Roguelike"
Several games use other gambling mechanics (Poker, Blackjack, Roulette, Slots) but apply the same **Base x Mult** logic found in Balatro. These are relevant for their mechanical implementation of "Joker-style" buffs.

*   **Dungeons and Degenerate Gamblers:** Uses **Blackjack** as the core. Features "relics" and "cheat cards" that act as Jokers to break the standard 21-point rules.
*   **Bingle Bingle:** A **Roulette** roguelike where you buy "Joker-like" items to manipulate the ball's landing and multiply winnings based on colors or numbers.
*   **Luck Be a Landlord:** A **Slot Machine** roguelike (the progenitor of the modern "multiplier roguelike"). It uses symbols that interact with each other to generate exponential growth, providing a blueprint for Balatro's synergy system.

---

## 3. Core Mechanics for Torch Football (Findings)

To emulate the "Balatro Feel" in a football context, the following logic should be prioritized:

1.  **Play Types as "Hands":** Standard football plays (Run, Short Pass, Long Pass, Trick Play) should have a **Base Value** and a **Base Multiplier**.
2.  **The "Joker" Equivalent:** "Coaches," "Playbooks," or "Star Players" should act as the persistent buff layer. They should provide:
    *   **Additive (+) Base:** "Running plays gain +10 yards."
    *   **Multiplicative (x) Mult:** "If you complete 3 consecutive passes, the next touchdown is worth 3.0x score."
3.  **Conditional Triggers:** Buffs should trigger on specific conditions (e.g., "In the Red Zone," "On 3rd Down," or "After a Turnover").
4.  **Point Blinds:** Instead of just winning the game, the goal should be to hit a "Score Target" for the match, which scales as the season (run) progresses.

---
**Date:** $(date +%Y-%m-%d)
**Research Status:** Complete
