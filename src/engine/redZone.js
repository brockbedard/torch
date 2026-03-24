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
    // Extreme red zone
    if (play.playType === 'DEEP') {
      maxYards = Math.min(maxYards, yardsToEndzone);
    }
    if (isRunType(play.playType) || play.playType === 'RUN') {
      mean -= 0.5; // reduced from -3
    }
    if (play.id === 'qb_sneak' || play.id === 'ir_qb_sneak') {
      mean += 1.5; // increased from +1
    }
    mean -= 0.5; // universal red zone squeeze softened from -1
    variance = Math.max(1, variance - 2);
  } else if (yardsToEndzone <= 10) {
    if (play.playType === 'DEEP') {
      maxYards = Math.min(maxYards, 12);
    }
    mean -= 1; // softened from -2
    variance = Math.max(1, variance - 1);
  } else if (yardsToEndzone <= 20) {
    if (play.playType === 'DEEP') {
      maxYards = Math.min(maxYards, 20);
    }
    mean -= 0.5; // softened from -1
    variance = Math.max(1, variance - 1);
  }

  return { mean, variance, maxYards };
}
