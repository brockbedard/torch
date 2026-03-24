# Validation: Staged Resolution Pacing

## 1. Optimal Duration for "Performance" Sequences

Based on industry standards for mobile "snackable" games, the "Staged Resolution" sequence (Revealing Cards -> Adding Mods -> Showing Result) should be optimized for a balance of "dopamine hits" and high-velocity gameplay.

### Phase 1: Card Reveal (The "Golden Ratio")
*   **Total Duration:** 400ms – 800ms per card.
*   **Breakdown:**
    *   **Anticipation (Shake/Hover):** 100ms – 200ms.
    *   **The Flip/Reveal:** 200ms – 300ms (Anything over 400ms feels sluggish).
    *   **The Celebration (Bounce/Overshoot):** 100ms – 300ms.
*   **Haptics:** Trigger a light impact exactly at the 50% mark of the flip (when the card is vertical).

### Phase 2: Adding Modifiers (The "Impact")
*   **Duration:** 300ms – 500ms per modifier.
*   **Visuals:** Use **Ease-Out** or **Back-Out** (overshoot) to make the modifier "stick" to the card or score.
*   **Pacing:** For multiple modifiers, stagger them with a 100ms – 150ms delay to allow the player to register each individual "hit" without dragging out the sequence.

### Phase 3: Showing Result (The "Tally")
*   **Standard Result:** 1.5s – 2.5s total.
*   **Small Gains:** 300ms – 500ms (Treat as a "pop" rather than a tally).
*   **Pacing:** Use **Exponential Deceleration** (Start fast, slow down as it approaches the final number) to make the result feel "heavy" and precise.
*   **Interactivity:** Always allow a "Tap to Skip" to instantly finish the tally and show the final result.

---

## 2. Player Patience in "Snackable" Mobile Games

Mobile players in 2024-2025 operate under extreme time and attention constraints.

*   **Session Length:** The median session length is **5–6 minutes**.
*   **Session Frequency:** Players engage in **4–6 sessions per day**, treating the game as a filler for small gaps in their schedule.
*   **Churn Rate:** Over **75% of new users churn within the first 24 hours**.
*   **Validation Insight:** Every second of unskippable animation in a 5-minute session is perceived as a significant barrier. Pacing must be "snackable"—fast, rewarding, and respectful of the player's time.

---

## 3. Veteran Pacing & "Skip" Mechanics (Balatro Case Study)

Games like *Balatro* provide a masterclass in how to transition from "learning the rules" to "optimizing the grind" for veteran players.

### Dynamic Speed Settings
*   **Native Speed Control:** *Balatro* allows users to toggle game speed from **0.5x to 4x**. 
*   **Veteran Behavior:** Experienced players default to **4x speed** to maximize runs per hour and minimize animation fatigue.
*   **Strategic Downshifting:** Veterans only slow down (to 0.5x) during critical moments (e.g., tracking a shuffled boss blind) where visual precision is required.

### Tactical Skipping (Skip Tags)
*   **Trade-offs:** *Balatro* turns "skipping" into a gameplay mechanic. Skipping a round (Blind) provides a "Tag" (reward) but costs the player a visit to the Shop.
*   **Impact:** This allows veterans to bypass early, low-value content to reach high-stakes mid-game content faster, while still making a meaningful strategic choice.

### Input Buffering & "Tap to Skip"
*   **Power-User UX:** Veteran players utilize **Input Buffering** (clicking through screens rapidly) and "Tap to Skip" to bypass ceremony once the outcome is known.
*   **Mod Influence:** High-level community members often use mods to reach **16x speed** or skip scoring animations entirely once scores reach complex magnitudes (e.g., scientific notation), as the standard animation becomes a bottleneck.

---

## 4. Key Recommendations for Torch Football

1.  **Implement a Global Speed Toggle:** Allow players to set the base resolution speed (1x to 4x).
2.  **Universal "Tap to Skip":** Any performance sequence must be instantly terminable by a screen tap, showing the final state immediately.
3.  **Haptic Sync:** Ensure haptic feedback is tied to the physical "impact" moments of the resolution (the flip, the mod application, the tally finish).
4.  **Veteran Skips:** Consider "Fast Forward" or "Instant Resolve" options for matches where the player's power level significantly outweighs the opposition (similar to Balatro's Skip Tags).
