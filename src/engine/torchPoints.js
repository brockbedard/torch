/**
 * TORCH — TORCH Point Calculations
 * Ported from torch_sim.py. Points per snap for offense and defense.
 */

/**
 * Calculate offensive TORCH points for a snap result.
 * @param {object} result - SnapResult object
 * @param {boolean} gotFirstDown
 * @returns {number}
 */
export function calcOffenseTorchPoints(result, gotFirstDown) {
  // Bad-result plays: offense earns ZERO torch points. Hard return, no
  // combo bonus trickle-through. This used to let offComboPts leak into
  // the result below (a sack could earn the sacked team +3 pts from a
  // stale card-combo bonus), which was why users reported "still getting
  // points on a sack."
  if (result.isSack || result.isIncomplete || result.isInterception || result.isFumbleLost) {
    return 0;
  }

  let pts = 0;

  // v0.23: Recalibrated for ~150-250 pts/game
  if (result.yards >= 15) { // Big play
    pts += 10;
  } else if (result.yards >= 8) {
    pts += 5;
  } else if (result.yards >= 4) {
    pts += 2;
  } else if (result.yards >= 1) {
    pts += 1;
  }

  if (gotFirstDown) pts += 2;
  if (result.isTouchdown) pts += 15;

  // Combo points also scaled down
  pts += Math.max(0, Math.floor((result.offComboPts || 0) / 4));
  return pts;
}

/**
 * Calculate defensive TORCH points for a snap result.
 * @param {object} result - SnapResult object
 * @param {boolean} allowedFirstDown
 * @returns {number}
 */
export function calcDefenseTorchPoints(result, allowedFirstDown) {
  let pts = 0;

  // v0.23: Recalibrated for ~150-250 pts/game
  if (result.isSack) {
    pts += 8;
  } else if (result.isInterception || result.isFumbleLost) {
    pts += 12;
  } else if (result.yards <= 0) {
    pts += 5;
  } else if (result.yards <= 3) {
    pts += 3;
  } else if (result.yards <= 7) {
    pts += 1;
  }

  if (result.isSafety) pts += 10;

  pts += Math.max(0, Math.floor((result.defComboPts || 0) / 4));
  return pts;
}
