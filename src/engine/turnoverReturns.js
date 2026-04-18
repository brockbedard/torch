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
  // Null guard — edge case: turnover fires but no featured defender resolved.
  // Use a baseline 75-OVR, no-badge player to avoid crashing on `.ovr` / `.badge`.
  const d = featuredDef || { ovr: 75, badge: null };
  const base = Math.floor(Math.random() * 16); // 0-15
  const ovrBonus = Math.max(0, Math.floor(((d.ovr || 75) - 75) / 5));

  let badgeBonus = 0;
  if (d.badge === 'SPEED_LINES' || d.badge === 'CLEAT') {
    badgeBonus = 5 + Math.floor(Math.random() * 6); // 5-10
  } else if (d.badge === 'HELMET' || d.badge === 'BRICK') {
    badgeBonus = Math.floor(Math.random() * 4); // 0-3
  } else {
    badgeBonus = 1 + Math.floor(Math.random() * 5); // 1-5
  }

  return base + ovrBonus + badgeBonus;
}
