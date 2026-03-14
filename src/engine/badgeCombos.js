/**
 * TORCH — Badge Combo Logic
 * Ported from torch_sim.py. TIGHT triggers, BIG bonuses.
 * Each badge fires on 1-2 play types max.
 */

/**
 * @param {string} playType
 * @returns {boolean} True if play is RUN or OPTION
 */
export function isRunType(playType) {
  return playType === 'RUN' || playType === 'OPTION';
}

/**
 * Check if an offensive badge combo triggers.
 * @param {string} badge - Badge constant
 * @param {object} play - Offensive play object
 * @param {boolean} is3rd4th - Is it 3rd or 4th down
 * @param {boolean} isConversion - Is it a conversion attempt (2pt/3pt)
 * @returns {{ yardBonus: number, pointBonus: number }}
 */
export function checkOffensiveBadgeCombo(badge, play, is3rd4th, isConversion) {
  const pt = play.playType;
  let yardBonus = 0;
  let pointBonus = 0;

  switch (badge) {
    case 'FOOTBALL':
      // QB arm: ONLY deep passes (+3 yds, 20pts)
      if (pt === 'DEEP') { yardBonus = 3; pointBonus = 20; }
      break;
    case 'CLEAT':
      // Speed: ONLY screens and rocket toss/zone read (+2-3 yds, 15pts)
      if (pt === 'SCREEN') { yardBonus = 3; pointBonus = 15; }
      else if (play.id === 'rocket_toss' || play.id === 'zone_read') { yardBonus = 2; pointBonus = 15; }
      break;
    case 'HELMET':
      // Tough: ONLY power runs, not draw (+3 yds, 15pts)
      if (pt === 'RUN' && play.id !== 'draw') { yardBonus = 3; pointBonus = 15; }
      break;
    case 'CLIPBOARD':
      // IQ: ONLY play-action and option (+2-3 yds, 15pts)
      if (play.id === 'pa_flat' || play.id === 'pa_post') { yardBonus = 3; pointBonus = 15; }
      else if (pt === 'OPTION') { yardBonus = 2; pointBonus = 15; }
      break;
    case 'GLOVE':
      // Hands: ONLY short passes (+3 yds, 15pts)
      if (pt === 'SHORT') { yardBonus = 3; pointBonus = 15; }
      break;
    case 'SPEED_LINES':
      // Explosive: ONLY deep passes (+4 yds, 20pts)
      if (pt === 'DEEP') { yardBonus = 4; pointBonus = 20; }
      break;
    case 'CROSSHAIR':
      // Precision: ONLY quick passes (+3 yds, 15pts)
      if (pt === 'QUICK') { yardBonus = 3; pointBonus = 15; }
      break;
    case 'BOLT':
      // Agility: ONLY screens (+3 yds, 15pts)
      if (pt === 'SCREEN') { yardBonus = 3; pointBonus = 15; }
      break;
    case 'BRICK':
      // Immovable: ONLY power runs and QB sneaks (+3 yds, 15pts)
      if (pt === 'RUN' && (play.id === 'power' || play.id === 'trap' || play.id === 'qb_sneak' || play.id === 'ir_qb_sneak')) {
        yardBonus = 3; pointBonus = 15;
      }
      break;
    case 'FLAME':
      // Clutch: 3rd, 4th, conversions only (+3 yds, 20pts)
      if (is3rd4th || isConversion) { yardBonus = 3; pointBonus = 20; }
      break;
  }

  return { yardBonus, pointBonus };
}

/**
 * Check if a defensive badge combo triggers.
 * @param {string} badge - Badge constant
 * @param {object} defPlay - Defensive play object
 * @param {object} offPlay - Offensive play object
 * @returns {{ yardMod: number, pointBonus: number }}
 */
export function checkDefensiveBadgeCombo(badge, defPlay, offPlay) {
  let yardMod = 0;
  let pointBonus = 0;

  switch (badge) {
    case 'PADLOCK':
      // Lockdown: ONLY man coverage cards (-3 yds, 15pts)
      if (defPlay.isManCoverage) { yardMod = -3; pointBonus = 15; }
      break;
    case 'HELMET':
      // Tough: ONLY vs run + run-stopping card (-2 yds, 15pts)
      if (isRunType(offPlay.playType) && defPlay.runDefMod < -1) { yardMod = -2; pointBonus = 15; }
      break;
    case 'EYE':
      // Vision: ONLY on robber/cover6 (-2 yds, 15pts)
      if (defPlay.id === 'ir_robber' || defPlay.id === 'ir_cover6') { yardMod = -2; pointBonus = 15; }
      break;
    case 'SPEED_LINES':
      // Explosive: ONLY on blitz cards (-2 yds, 15pts)
      if (defPlay.cardType === 'BLITZ') { yardMod = -2; pointBonus = 15; }
      break;
    case 'BRICK':
      // Immovable: ONLY vs run + strong run D card (-3 yds, 15pts)
      if (isRunType(offPlay.playType) && defPlay.runDefMod <= -2) { yardMod = -3; pointBonus = 15; }
      break;
    case 'CLIPBOARD':
      // IQ: ONLY on spy/disguise schemes (-2 yds, 15pts)
      if (defPlay.id === 'ir_qb_spy' || defPlay.id === 'ct_zone_blitz_drop' || defPlay.id === 'ct_fire_zone') {
        yardMod = -2; pointBonus = 15;
      }
      break;
  }

  return { yardMod, pointBonus };
}
