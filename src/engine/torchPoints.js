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
  let pts = 0;

  if (result.isSack) {
    pts -= 10;
  } else if (result.isIncomplete) {
    pts -= 5;
  } else if (result.isInterception || result.isFumbleLost) {
    pts -= 25;
  } else if (result.yards >= 8) {
    pts += 30;
  } else if (result.yards >= 4) {
    pts += 10;
  } else if (result.yards >= 1) {
    pts += 0;
  } else {
    pts -= 10;
  }

  if (gotFirstDown) pts += 10;
  if (result.isTouchdown) pts += 50;

  pts += Math.floor(result.offComboPts);
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

  if (result.isSack) {
    pts += 25;
  } else if (result.isInterception || result.isFumbleLost) {
    pts += 40;
  } else if (result.yards <= 0) {
    pts += 20;
  } else if (result.yards <= 3) {
    pts += 10;
  } else if (result.yards <= 7) {
    pts += 0;
  } else if (result.yards <= 14) {
    pts -= 5;
  } else {
    pts -= 15;
  }

  if (allowedFirstDown) pts -= 10;
  if (result.isTouchdown) pts -= 30;
  if (result.isSafety) pts += 30;

  pts += Math.floor(result.defComboPts);
  return pts;
}
