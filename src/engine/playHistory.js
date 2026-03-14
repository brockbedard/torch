/**
 * TORCH — Play History Bonus
 * Ported from torch_sim.py. Bonuses stack.
 */

import { isRunType } from './badgeCombos.js';

/**
 * Calculate bonus from play tendency history.
 * @param {string[]} history - Array of PlayType strings from the drive
 * @param {object} currentPlay - Offensive play object
 * @returns {number} Yard bonus (positive = good for offense)
 */
export function getPlayHistoryBonus(history, currentPlay) {
  if (history.length === 0) return 0;

  let bonus = 0;
  const currentIsRun = isRunType(currentPlay.playType);
  const currentIsPass = ['SHORT', 'QUICK', 'DEEP', 'SCREEN'].includes(currentPlay.playType);
  const currentIsPA = currentPlay.id === 'pa_flat' || currentPlay.id === 'pa_post';

  // Count consecutive runs/passes from most recent
  let consecRuns = 0;
  let consecPasses = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const pt = history[i];
    if (isRunType(pt)) {
      if (consecPasses > 0) break;
      consecRuns++;
    } else {
      if (consecRuns > 0) break;
      consecPasses++;
    }
  }

  // Pass -> Run bonuses
  if (currentIsRun && consecPasses >= 3) bonus += 3;
  else if (currentIsRun && consecPasses === 2) bonus += 1;

  // Run -> Pass bonuses
  if (currentIsPass && consecRuns >= 3) bonus += 2;
  else if (currentIsPass && consecRuns === 2) bonus += 1;

  // PA specific bonus (stacks with generic run->pass)
  if (currentIsPA && consecRuns >= 2) bonus += 4;

  // Repeat play penalty (checks playType, not specific play)
  if (history.length >= 1 && history[history.length - 1] === currentPlay.playType) {
    if (history.length >= 2 && history[history.length - 2] === currentPlay.playType) {
      bonus -= 5; // 3x in a row
    } else {
      bonus -= 2; // 2x in a row
    }
  }

  return bonus;
}
