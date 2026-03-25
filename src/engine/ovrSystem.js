/**
 * TORCH — OVR System
 * Ported from torch_sim.py. Passive OVR effects every snap.
 */

import { isRunType } from './badgeCombos.js';

/**
 * @param {number} ovr
 * @param {number} baseline
 * @returns {number} OVR modifier (units of 5 above baseline)
 */
function ovrMod(ovr, baseline = 75) {
  return (ovr - baseline) / 5.0;
}

/**
 * Calculate passive OVR effects for the snap.
 * @param {object[]} offPlayers - Offensive roster (available players)
 * @param {object[]} defPlayers - Defensive roster (available players)
 * @param {object} offPlay - Offensive play
 * @param {object} featuredOff - Featured offensive player
 * @param {object} featuredDef - Featured defensive player
 * @returns {{ compMod: number, sackMod: number, meanMod: number, intMod: number }}
 */
export function applySquadOVR(offPlayers, defPlayers, offPlay, featuredOff, featuredDef) {
  const mods = { compMod: 0, sackMod: 0, meanMod: 0, intMod: 0 };
  const isPass = !(offPlay.isRun === true || offPlay.type === 'run');

  // Find QB
  const qb = offPlayers.find(p => p.pos === 'QB' && !p.injured);
  if (qb && isPass) {
    const qbMod = ovrMod(qb.ovr);
    mods.compMod += qbMod * 0.02;  // +2% completion per 5 OVR above 75
    mods.sackMod -= qbMod * 0.01;  // -1% sack per 5 OVR above 75
  }

  // Featured player OVR on yards
  if (featuredOff) {
    mods.meanMod += ovrMod(featuredOff.ovr) * 0.5;
  }

  // Best CB affects completion
  const cbs = defPlayers.filter(p => p.pos === 'CB' && !p.injured);
  if (cbs.length > 0 && isPass) {
    const bestCB = cbs.reduce((best, p) => p.ovr > best.ovr ? p : best);
    mods.compMod -= ovrMod(bestCB.ovr) * 0.01;
  }

  // Best LB affects run defense
  const lbs = defPlayers.filter(p => p.pos === 'LB' && !p.injured);
  if (lbs.length > 0 && isRunType(offPlay.playType)) {
    const bestLB = lbs.reduce((best, p) => p.ovr > best.ovr ? p : best);
    mods.meanMod -= ovrMod(bestLB.ovr) * 0.5;
  }

  // Best S affects deep INT
  const safeties = defPlayers.filter(p => p.pos === 'S' && !p.injured);
  if (safeties.length > 0 && offPlay.playType === 'DEEP') {
    const bestS = safeties.reduce((best, p) => p.ovr > best.ovr ? p : best);
    mods.intMod += ovrMod(bestS.ovr) * 0.005;
  }

  return mods;
}
