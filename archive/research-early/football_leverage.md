# Situational Leverage & High-Voltage UI

## 1. What is "Situational Leverage"?

In football, not all plays are created equal. "Leverage" is the mathematical and emotional weight of a single snap. It is the delta between the "Win Probability" (WP) if the play succeeds versus if it fails. 

In **TORCH**, we represent this leverage not through spreadsheets, but through **"High-Voltage" UI feedback**—simulating the physiological stress a QB feels when the stadium is shaking and the season is on the line.

---

## 2. High-Leverage "Inflection Points"

Research into NFL play-by-play data identifies these specific moments as the highest leverage points in a drive:

### A. The "Money Down" (3rd & Manageable)
*   **The Situation:** 3rd & 3 to 3rd & 6.
*   **The Leverage:** This is the most common "drive killer." Success keeps the chains moving; failure almost always results in a punt.
*   **Physiological State:** High focus, "narrowing" of the field, looking for the "sticks."

### B. The "Heartbreaker" (3rd & Long)
*   **The Situation:** 3rd & 8+.
*   **The Leverage:** Defenses expect a stop. If the offense converts, it is a massive emotional blow to the defense and a huge momentum swing for the offense.
*   **Physiological State:** Defensive panic vs. Offensive "nothing to lose" aggression.

### C. "And Goal" Situations (The Trench War)
*   **The Situation:** 1st & Goal from the 5 or closer.
*   **The Leverage:** The field is compressed. There is no "behind" the defense. It’s a game of inches.
*   **Physiological State:** Maximum physical intensity, "suffocation" feeling for the offense.

### D. The "Weight of the World" (4th Down Go-For-It)
*   **The Situation:** 4th & 2 in opponent territory.
*   **The Leverage:** Binary outcome. Total success or total failure. The drive ends here regardless of the result.
*   **Physiological State:** Peak adrenaline, "all-in" mentality.

### E. The "Two-Minute Drill" (Clock as an Enemy)
*   **The Situation:** Under 2:00 left, trailing by one score.
*   **The Leverage:** Every second has a literal value. A 5-yard gain that stays in-bounds is worse than an incomplete pass in some scenarios.
*   **Physiological State:** Elevated heart rate, frantic decision-making, "beating the clock."

---

## 3. The "High-Voltage" UI Evolution

To mirror these moments, the TORCH UI should "evolve" as leverage increases. We move from **"Neutral/Broadcast"** to **"High-Voltage"** mode.

| Element | Neutral State (1st & 10) | High-Voltage State (4th & Goal) |
| :--- | :--- | :--- |
| **Color Palette** | Cool Blues / Grass Greens | Amber / Neon Orange / "Emergency" Red |
| **Screen Edge** | Sharp, clear borders | Subtle vignette / "Pulse" compression |
| **Play Clock** | Static white text | Pulsing red, "Glitch" effect under 5s |
| **Haptics** | Subtle "click" on card select | Rhythmic "Heartbeat" pulse (120 BPM) |
| **The "Clash"** | 1.0x Speed, standard sparks | 1.5x Speed, "Electric Arc" sparks, screen shake |
| **Card Art** | Static icons | Cards "vibrate" or "hum" with electrical noise |
| **Ambient Audio** | Low crowd hum | "White noise" drone + swelling crowd roar |

### Implementation Strategy: The "Leverage Tier" System

We should implement a `leverageScore` (0.0 to 1.0) for every snap:
*   **Tier 1 (0.0 - 0.4):** Standard UI.
*   **Tier 2 (0.5 - 0.7):** 3rd Downs, Red Zone. Trigger "Glitch" updates and heartbeat audio.
*   **Tier 3 (0.8 - 1.0):** 4th Downs, 2-Minute Drill, 'And Goal'. Trigger vignette, screen shake, and "Neon Emergency" color shifts.

---

## 4. Visualizing "Pressure"

In real football, pressure isn't just a blitz—it's the *fear* of the blitz. 

**Recommendation:** When a player holds a "High Risk/High Reward" card (like a Blitz or a Go Route) in a Tier 3 leverage situation, the card itself should be difficult to "hold." It should jitter slightly, requiring the player to "commit" to the high-voltage decision.

---

## 5. Summary: From Simulation to Sensation

By connecting situational leverage to UI feedback, **TORCH** moves beyond a simple card game. It becomes a physiological experience. The player doesn't just *know* it's 4th down; they *feel* the weight of it in their hands and see the stadium "shaking" through the screen.
