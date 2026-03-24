/**
 * TORCH — Turnover Return Yards
 * Ported from torch_sim.py.
 */

/**
 * Calculate return yards on a turnover.
 * @param {object} featuredDef - Featured defensive player
 * @returns {number} Return yards
 */
export function calcReturnYards(featuredDef) {
  const base = Math.floor(Math.random() * 16); // 0-15
  const ovrBonus = Math.max(0, Math.floor((featuredDef.ovr - 75) / 5));

  let badgeBonus = 0;
  if (featuredDef.badge === 'SPEED_LINES' || featuredDef.badge === 'CLEAT') {
    badgeBonus = 5 + Math.floor(Math.random() * 6); // 5-10
  } else if (featuredDef.badge === 'HELMET' || featuredDef.badge === 'BRICK') {
    badgeBonus = Math.floor(Math.random() * 4); // 0-3
  } else {
    badgeBonus = 1 + Math.floor(Math.random() * 5); // 1-5
  }

  return base + ovrBonus + badgeBonus;
}
