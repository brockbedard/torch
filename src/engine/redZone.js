/**
 * TORCH — Red Zone Compression
 * Ported from torch_sim.py. Harder compression near the goal line.
 */

import { isRunType } from './badgeCombos.js';

/**
 * Apply red zone compression to play stats.
 * @param {number} yardsToEndzone
 * @param {number} mean
 * @param {number} variance
 * @param {object} play - Offensive play object
 * @returns {{ mean: number, variance: number, maxYards: number }}
 */
export function applyRedZone(yardsToEndzone, mean, variance, play) {
  let maxYards = yardsToEndzone;

  if (yardsToEndzone <= 5) {
    // Extreme red zone — brutal
    if (play.playType === 'DEEP') {
      maxYards = Math.min(maxYards, yardsToEndzone);
    }
    if (isRunType(play.playType)) {
      mean -= 3; // Runs get crushed inside the 5
    }
    if (play.id === 'qb_sneak' || play.id === 'ir_qb_sneak') {
      mean += 1; // QB sneak gets a small boost
    }
    mean -= 1; // Universal red zone squeeze
    variance = Math.max(1, variance - 2);
  } else if (yardsToEndzone <= 10) {
    if (play.playType === 'DEEP') {
      maxYards = Math.min(maxYards, 12);
    }
    mean -= 2;
    variance = Math.max(1, variance - 1);
  } else if (yardsToEndzone <= 20) {
    if (play.playType === 'DEEP') {
      maxYards = Math.min(maxYards, 20);
    }
    mean -= 1;
    variance = Math.max(1, variance - 1);
  }

  return { mean, variance, maxYards };
}
