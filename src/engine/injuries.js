/**
 * TORCH — Injury System
 * Ported from torch_sim.py. 3% chance on big plays/sacks.
 */

/**
 * Check if an injury occurs after a snap.
 * @param {object} result - SnapResult object
 * @param {object} featuredOff - Featured offensive player
 * @param {object} featuredDef - Featured defensive player
 * @returns {object|null} { player, snapsRemaining } or null
 */
export function checkInjury(result, featuredOff, featuredDef) {
  // Only check on big-hit plays: 10+ yard plays or sacks
  if (Math.abs(result.yards) < 10 && !result.isSack) return null;

  if (Math.random() >= 0.03) return null; // 3% chance

  // 50/50 offense or defense player
  const injured = Math.random() < 0.5 ? featuredOff : featuredDef;
  if (injured.injured) return null; // Already injured

  const severity = Math.random();
  let snapsRemaining;
  if (severity < 0.5) {
    snapsRemaining = 2 + Math.floor(Math.random() * 2); // Minor: 2-3 snaps
  } else if (severity < 0.85) {
    snapsRemaining = 20; // Moderate: rest of half
  } else {
    snapsRemaining = 100; // Severe: rest of game
  }

  return { player: injured, snapsRemaining };
}

/**
 * Tick injury timers and heal players whose timer has expired.
 * @param {object[][]} allRosters - Array of roster arrays to process
 */
export function healInjuries(allRosters) {
  for (const roster of allRosters) {
    for (const player of roster) {
      if (player.injured && player.injurySnapsRemaining > 0) {
        player.injurySnapsRemaining--;
        if (player.injurySnapsRemaining <= 0) {
          player.injured = false;
        }
      }
    }
  }
}
