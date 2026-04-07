/**
 * TORCH — Momentum Chains
 * Per-player momentum meter. Rewards consecutive featuring on matched play types.
 * Invisible to new players, discoverable by veterans.
 */

// Play type → momentum group mapping
var MOMENTUM_GROUPS = {
  DEEP: 'pass', SHORT: 'pass', QUICK: 'pass', SCREEN: 'pass',
  RUN: 'run', OPTION: 'run',
  PLAY_ACTION: 'pass',
};

/**
 * Check if a play type matches a player's natural momentum group.
 * WR/TE/QB = pass momentum, RB/FB = run momentum, others = either.
 */
function isMatchedPlay(player, playType) {
  var group = MOMENTUM_GROUPS[playType] || 'pass';
  var pos = (player.pos || '').toUpperCase();
  if (pos === 'RB' || pos === 'FB') return group === 'run';
  if (pos === 'WR' || pos === 'TE') return group === 'pass';
  return true; // QB, LB, CB, S match anything
}

/**
 * Update momentum for a featured player after a snap.
 * @param {string} playerId
 * @param {object} player - player object with pos
 * @param {string} playType - offensive play type
 * @param {object} momentumMap - { playerId: number (0-5) }
 * @returns {number} new momentum value
 */
export function updateMomentum(playerId, player, playType, momentumMap) {
  if (!playerId || !momentumMap || !player) return 0;
  var current = momentumMap[playerId] || 0;
  if (isMatchedPlay(player, playType)) {
    current = Math.min(5, current + 1);
  } else {
    current = Math.max(0, current - 1);
  }
  momentumMap[playerId] = current;
  return current;
}

/**
 * Get momentum bonus yards for a player's current momentum level.
 * @param {number} momentum - 0-5
 * @returns {number} bonus yards (0 at 0-2, +1 at 3, +2 at 4-5)
 */
export function getMomentumBonus(momentum) {
  if (momentum >= 4) return 2;
  if (momentum >= 3) return 1;
  return 0;
}

/**
 * Get TORCH point multiplier from momentum.
 * @param {number} momentum
 * @returns {number} multiplier (1.0 normally, 1.1 at momentum 5)
 */
export function getMomentumMultiplier(momentum) {
  return momentum >= 5 ? 1.1 : 1.0;
}

/**
 * Decay all players' momentum slightly (called on possession change).
 * @param {object} momentumMap
 */
export function decayMomentum(momentumMap) {
  for (var id in momentumMap) {
    if (momentumMap[id] > 0) momentumMap[id] = Math.max(0, momentumMap[id] - 2);
  }
}

/**
 * Spike a player's momentum after a big play (TD, INT, sack, forced fumble, etc.).
 * Adds amount on top of whatever updateMomentum already produced this snap, capped at 5.
 */
export function spikeMomentum(playerId, amount, momentumMap) {
  if (!playerId || !momentumMap || !amount) return 0;
  var current = momentumMap[playerId] || 0;
  current = Math.min(5, current + amount);
  momentumMap[playerId] = current;
  return current;
}

/**
 * Crash a player's momentum after a costly mistake (INT, lost fumble).
 * Forces to 0 — they're "off" for the next snap.
 */
export function crashMomentum(playerId, momentumMap) {
  if (!playerId || !momentumMap) return 0;
  momentumMap[playerId] = 0;
  return 0;
}
