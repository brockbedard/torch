# TORCH Strategic Research: Personnel & Playbook Logic

## 1. The "Personnel Reveal" Mechanic: Connecting to Real Football

In real football, the strategic "chess match" begins before the ball is snapped. When the offense breaks the huddle, the defense sees the **Personnel Grouping** (e.g., how many WRs, TEs, and RBs are on the field). 

### Real-World Logic
*   **Offense Breaks Huddle:** Personnel is revealed (11 personnel, 22 personnel, etc.).
*   **Defense Responds:** The DC calls a "Sub-package" to match (Nickel for speed, Base for size).
*   **The Snap:** The actual play (Slant, Power, Go Route) remains a mystery until the action starts.

### The TORCH "Half-Reveal" Mechanic
To translate this to a simultaneous-turn card game, we implement the **Personnel Reveal**:
1.  **Simultaneous Pick:** Both players pick their cards (Offense picks a play, Defense picks a coverage/pressure).
2.  **The Reveal (Phase A):** The cards flip to show **Personnel Only**. 
    *   *Offense reveals:* "Spread" (3 WR), "Balanced" (1 RB, 1 TE, 1 WR), or "Heavy" (2 RB, 1 TE).
    *   *Defense reveals:* "Dime" (4 DB), "Nickel" (3 DB, 1 LB), or "Base" (2 DB, 2 LB).
3.  **The Drama:** A 1-second pause where the player realizes: *"Oh no, I called Dime (Pass Defense) but they came out in Heavy (Run Personnel)."*
4.  **The Reveal (Phase B):** The cards flip fully to reveal the specific play (e.g., "Power" or "Go Route").
5.  **The Clash:** The physical collision and yardage resolution.

---

## 2. Personnel Groupings & Sub-Packages (7-on-7 TORCH)

Because TORCH uses a 7-on-7 format (3 OL, 1 QB, 3 Skill vs 3 DL, 4 Skill), we simplify personnel into three distinct archetypes:

| Personnel (Offense) | Composition | Strength | Weakness |
| :--- | :--- | :--- | :--- |
| **Spread** | 3 WR | Max Speed / Deep Passing | Easily tackled if caught |
| **Balanced** | 1 RB, 1 TE, 1 WR | Versatility / Play Action | Master of none |
| **Heavy** | 2 RB, 1 TE | Power Running / Physicality | Slow / Limited range |

| Sub-Package (Defense) | Composition | Counter To | Vulnerable To |
| :--- | :--- | :--- | :--- |
| **Dime** | 4 DB | **Spread** (Matches speed) | **Heavy** (Gets bullied) |
| **Nickel** | 3 DB, 1 LB | **Balanced** (Hybrid response) | **Spread** (Speed mismatches) |
| **Base** | 2 DB, 2 LB | **Heavy** (Stops the run) | **Spread** (Too slow) |

---

## 3. The RPS Playbook: Deterministic Counters

Beyond personnel, the **Play Archetypes** have deterministic counters based on fundamental football logic.

### Archetype A: Air Raid (Vertical & Spread)
*   **Strategy:** Attack deep, exploit space, high variance.
*   **Countered by:** **Dime / Deep Zones (Cover 4)**. Adding DBs and dropping deep makes deep windows impossible to hit.
*   **Wins against:** **Heavy / Base / Blitz**. If there is no safety help or the defense is too slow, vertical routes are touchdowns.

### Archetype B: West Coast (Quick & Timing)
*   **Strategy:** Short, high-percentage passes (Slants, Flats).
*   **Countered by:** **Press Man / Physicality**. Jamming receivers at the line destroys the "rhythm" and "timing" required for West Coast plays.
*   **Wins against:** **Blitz**. The ball is out before the pressure can arrive.

### Archetype C: Ground & Pound (Power Run)
*   **Strategy:** Physical, interior running to wear down the defense.
*   **Countered by:** **Base / Heavy / Blitz**. Stacking the box with LBs and aggressive gaps stops the run before it starts.
*   **Wins against:** **Dime / Deep Zones**. Small DBs cannot tackle power backs in the open field; light boxes get gashed.

### Archetype D: Blitz-Heavy (Aggressive Pressure)
*   **Strategy:** Force mistakes, disrupt the QB, high risk/reward.
*   **Countered by:** **West Coast / Screens / Draws**. Using the defense's aggression against them by throwing into vacated spaces or letting rushers "run past" the play.
*   **Wins against:** **Air Raid (Vertical)**. Deep routes take 3+ seconds to develop; a good blitz gets there in 2.

---

## 4. Master RPS Logic Table

| Play Archetype | Beats (Scissors) | Lost To (Rock) | Why? |
| :--- | :--- | :--- | :--- |
| **Air Raid** | Blitz | Deep Zone (Cov 4) | Beats pressure with speed; loses to depth. |
| **West Coast** | Blitz | Press Man | Beats pressure with timing; loses to physicality. |
| **Power Run** | Deep Zone (Cov 4) | Blitz / Base | Beats light boxes; loses to stacked boxes. |
| **Blitz** | Air Raid | West Coast | Beats slow-developing plays; loses to quick ones. |

## 5. Implementation Recommendation: The "Clash Bonus"

To make this deterministic without being boring, we use **Multiplier Tiers** based on the RPS match:

1.  **Hard Counter (Rock beats Scissors):** Defensive Advantage +2. (e.g., Power Run vs Blitz). Yardage capped at 0-2 yards.
2.  **Soft Counter:** Neutral. Yardage determined by card stats + random variance (2-6 yards).
3.  **Scheme Win (Paper covers Rock):** Offensive Advantage +2. (e.g., Slant vs Blitz). Yardage floor raised to 8+ yards.

This ensures that while a "Go Route" *can* beat "Cover 4" if the RNG is miraculous, the **Football Logic** makes it an uphill battle, rewarding the player for "reading" the opponent's strategy.
