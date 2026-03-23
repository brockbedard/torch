/**
 * TORCH — Snap Resolver (THE CORE)
 * Ported EXACTLY from torch_sim.py resolve_snap function.
 * All stacking bonuses, coverage sack mechanic, red zone compression, etc.
 */

import { checkOffensiveBadgeCombo, checkDefensiveBadgeCombo, isRunType } from './badgeCombos.js';
import { getPlayHistoryBonus } from './playHistory.js';
import { applyRedZone } from './redZone.js';
import { applySquadOVR } from './ovrSystem.js';

/**
 * Box-Muller transform for gaussian random numbers.
 * @param {number} mean
 * @param {number} stddev
 * @returns {number}
 */
function gaussRandom(mean, stddev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * stddev;
}

/**
 * Resolve a single snap.
 * @param {object} offPlay - Offensive play card
 * @param {object} defPlay - Defensive play card
 * @param {object} featuredOff - Featured offensive player
 * @param {object} featuredDef - Featured defensive player
 * @param {object[]} offPlayers - Full offensive roster
 * @param {object[]} defPlayers - Full defensive roster
 * @param {object} context - { playHistory, yardsToEndzone, ballPosition, down, distance, isConversion, scoreDiff }
 * @returns {object} SnapResult
 */
export function resolveSnap(offPlay, defPlay, featuredOff, featuredDef, offPlayers, defPlayers, context) {
  const { playHistory, yardsToEndzone, ballPosition, down, distance, isConversion, scoreDiff, weather, momentum, coachBadge, difficulty, offenseIsHuman } = context;

  const isPass = offPlay.completionRate !== null;

  const result = {
    yards: 0,
    playType: isPass ? 'pass' : 'run',
    isComplete: false,
    isIncomplete: false,
    isSack: false,
    isInterception: false,
    isFumble: false,
    isFumbleLost: false,
    isTouchdown: false,
    isSafety: false,
    offComboYards: 0,
    defComboYards: 0,
    offComboPts: 0,
    defComboPts: 0,
    historyBonus: 0,
    description: '',
    offTorchPts: 0,
    defTorchPts: 0,
  };
  const isRun = !isPass;
  const is3rd4th = down >= 3;

  // Trailing team bonus (Increased for better balance)
  let trailingBonus = 0;
  let trailingVarBoost = 0;
  if (scoreDiff >= 14) {
    trailingBonus = 3;
    trailingVarBoost = 4;
  } else if (scoreDiff >= 7) {
    trailingBonus = 2;
    trailingVarBoost = 2;
  }

  // Reveal Card Sim-Benefits (represented as passive mean boost)
  let revealBonus = 0;
  if (context.offCard && ['SCOUT_TEAM', 'FILM_LEAK', 'SIDELINE_PHONE', 'PERSONNEL_REPORT'].includes(context.offCard)) {
    revealBonus = 1;
  }

  // FAKE KNEEL (SILVER): +6 mean yards (2-min only)
  let fakeKneelBonus = (context.offCard === 'FAKE_KNEEL' && context.twoMinActive) ? 6 : 0;

  // Coverage modifiers
  const cov = offPlay.coverageMods[defPlay.baseCoverage] || {};
  const covMean = cov.mean || 0;
  const covVar = cov.var || 0;
  const covInt = cov.int || 0;

  let mean = offPlay.mean + covMean;
  let variance = Math.max(1, offPlay.variance + covVar);

  // Defensive card effects
  if (isRun) {
    mean += defPlay.runMeanMod;
    // Cover 0 blitz vs run: +3 penalty (gaps abandoned)
    if (defPlay.isCover0Blitz) {
      mean += 3;
    }
  } else {
    // Press man deep bonus for offense
    if ((defPlay.id === 'ct_press_man' || defPlay.id === 'ir_press_man') && offPlay.playType === 'DEEP') {
      mean += 2;
    }
  }

  // Badge combos
  const offCombo = checkOffensiveBadgeCombo(featuredOff.badge, offPlay, is3rd4th, isConversion || false);
  const defCombo = checkDefensiveBadgeCombo(featuredDef.badge, defPlay, offPlay);

  // SCHEMER Coach Badge: +1 mean on all badge combos
  if (coachBadge === 'SCHEMER' && offCombo.yardBonus > 0) {
    offCombo.yardBonus += 1;
  }

  result.offComboYards = offCombo.yardBonus;
  result.defComboYards = defCombo.yardMod;
  result.offComboPts = offCombo.pointBonus;
  result.defComboPts = defCombo.pointBonus;

  mean += offCombo.yardBonus + defCombo.yardMod;

  // Play history bonus
  const historyBonus = getPlayHistoryBonus(playHistory || [], offPlay);
  result.historyBonus = historyBonus;
  mean += historyBonus;

  // OVR modifiers
  const ovrMods = applySquadOVR(offPlayers, defPlayers, offPlay, featuredOff, featuredDef);
  mean += ovrMods.meanMod;

  // Red zone compression
  const rz = applyRedZone(yardsToEndzone, mean, variance, offPlay);
  mean = rz.mean;
  variance = rz.variance;
  const maxYards = rz.maxYards;

  // Apply trailing team bonus
  mean += trailingBonus + revealBonus + fakeKneelBonus;
  variance += trailingVarBoost;

  // Easy difficulty: boost mean yards for human offense
  if (difficulty === 'EASY' && offenseIsHuman) mean += 2;

  // Weather Modifiers
  if (weather === 'WINDY' && isPass) mean -= 2.0;
  if (weather === 'SNOW' && isRun) mean -= 1.0;

  // === PASS PLAY RESOLUTION ===
  if (isPass) {
    // Sack check
    let sackRate = offPlay.sackRate + defPlay.sackRateBonus + ovrMods.sackMod;

    // Deep passes vs corner blitz: doubled
    if (offPlay.playType === 'DEEP' && defPlay.id === 'ct_corner_blitz') {
      sackRate *= 2;
    }

    // Coverage sack: good coverage + pressure = sack even without all-out blitz
    if (defPlay.passMeanMod < 0 && defPlay.sackRateBonus >= 0.03) {
      sackRate += 0.03;
    }

    // Red zone sack bump
    if (yardsToEndzone <= 20) sackRate += 0.02;
    if (yardsToEndzone <= 10) sackRate += 0.02;

    // Global sack rate bump (+3% to match Python 0.03)
    sackRate += 0.03;

    // IRON_CURTAIN Coach Badge: +3% sack rate
    if (coachBadge === 'IRON_CURTAIN') sackRate += 0.03;

    // Easy difficulty: reduce sack rate when human is on offense
    if (difficulty === 'EASY' && offenseIsHuman) sackRate *= 0.4;

    sackRate = Math.max(0, Math.min(0.30, sackRate));

    if (Math.random() < sackRate) {
      result.isSack = true;
      result.yards = -(4 + Math.floor(Math.random() * 7)); // -4 to -10
      // Safety check
      if (ballPosition + result.yards <= 0) {
        result.isSafety = true;
        result.yards = 0;
      }
      result.description = `SACK! ${featuredOff.name} goes down.`;
      return result;
    }

    // Completion check
    let compRate = offPlay.completionRate + ovrMods.compMod + defPlay.passCompMod;

    // Bad matchup completion penalty
    if (covMean <= -2) {
      compRate -= 0.08;
    } else if (covMean <= -1) {
      compRate -= 0.04;
    }

    // Red zone completion squeeze
    if (yardsToEndzone <= 10) {
      compRate -= 0.05;
    }

    // RAIN: -5% completion rate
    if (weather === 'RAIN') compRate -= 0.05;

    // MOMENTUM: If opponent has high momentum (>75), -5% completion rate (Home noise)
    if (momentum > 75) compRate -= 0.05;

    // Easy difficulty: boost completion rate when human is on offense
    if (difficulty === 'EASY' && offenseIsHuman) compRate += 0.15;

    compRate = Math.max(0.15, Math.min(0.95, compRate));

    if (Math.random() > compRate) {
      result.isIncomplete = true;
      result.yards = 0;
      result.description = `Incomplete. ${featuredOff.name}'s target can't come up with it.`;
      return result;
    }

    // Complete — roll yards
    result.isComplete = true;
    const rawYards = gaussRandom(mean, variance * 0.5);
    result.yards = Math.max(-5, Math.min(Math.round(rawYards), maxYards));

    // SPEED_DEMON Coach Badge: +2 yards on explosive plays
    if (coachBadge === 'SPEED_DEMON' && result.yards >= 15) {
      result.yards = Math.min(result.yards + 2, maxYards);
    }

    // INT check
    let intRate = offPlay.intRate + covInt + defPlay.intRateBonus + ovrMods.intMod;
    // Global INT reduction (-0.5%)
    intRate -= 0.005;

    // Special defensive effects on INT
    if (defPlay.id === 'ir_robber' && (offPlay.id === 'mesh' || offPlay.id === 'slant' || offPlay.id === 'shallow_cross')) {
      intRate += 0.04;
    }
    if (defPlay.id === 'ir_mod' && (offPlay.id === 'four_verts' || offPlay.id === 'go_route')) {
      intRate += 0.03;
    }

    // EYE badge INT bonus on PA/option
    if (featuredDef.badge === 'EYE' && (offPlay.id === 'pa_flat' || offPlay.id === 'pa_post' || offPlay.playType === 'OPTION')) {
      intRate += 0.02;
    }

    intRate = Math.max(0, Math.min(0.20, intRate));

    if (Math.random() < intRate) {
      result.isInterception = true;
      result.isComplete = false;
      result.yards = 0;
      result.description = `INTERCEPTED! ${featuredDef.name} jumps the route!`;
      return result;
    }

    // Fumble after catch
    let fumbleRate = offPlay.fumbleRate;
    if (weather === 'SNOW') fumbleRate += 0.01;

    if (Math.random() < fumbleRate) {
      result.isFumble = true;
      result.isFumbleLost = Math.random() < 0.5;
      if (result.isFumbleLost) {
        result.description = `FUMBLE! ${featuredOff.name} coughs it up! Defense recovers!`;
      } else {
        result.description = `Fumble by ${featuredOff.name} but offense recovers!`;
      }
    }
  }
  // === RUN PLAY RESOLUTION ===
  else {
    // Stuff rate: chance the run is blown up
    let stuffRate = 0.20; // base 20% (balanced from 30%)

    if (defPlay.runDefMod < -2) stuffRate += 0.10;
    else if (defPlay.runDefMod < 0) stuffRate += 0.05;

    // Cover 0 blitz = fewer stuffs (gaps abandoned)
    if (defPlay.isCover0Blitz) stuffRate -= 0.12;

    // Bad matchup stuff boost
    if (covMean <= -2) stuffRate += 0.08;
    else if (covMean <= -1) stuffRate += 0.04;

    // Red zone stuff boost
    if (yardsToEndzone <= 10) stuffRate += 0.08;
    else if (yardsToEndzone <= 20) stuffRate += 0.04;

    // Easy difficulty: reduce stuff rate when human is on offense
    if (difficulty === 'EASY' && offenseIsHuman) stuffRate *= 0.5;

    stuffRate = Math.max(0.05, Math.min(0.50, stuffRate));

    if (Math.random() < stuffRate) {
      // Stuffed: -2 to +1 yards
      result.yards = -2 + Math.floor(Math.random() * 4);
      if (ballPosition + result.yards <= 0) {
        result.isSafety = true;
        result.yards = 0;
      }
      if (result.yards <= 0) {
        result.description = `STUFFED! ${featuredOff.name} hit in the backfield.`;
      } else {
        result.description = `${featuredOff.name} squeezed for ${result.yards}.`;
      }

      // Higher fumble rate on stuffs (1.5x)
      if (Math.random() < offPlay.fumbleRate * 1.5) {
        result.isFumble = true;
        result.isFumbleLost = Math.random() < 0.5;
        if (result.isFumbleLost) {
          result.description = `STUFFED AND STRIPPED! ${featuredOff.name} loses it!`;
        }
      }
      return result;
    }

    const rawYards = gaussRandom(mean, variance * 0.5);
    result.yards = Math.max(-5, Math.min(Math.round(rawYards), maxYards));

    // SPEED_DEMON Coach Badge: +2 yards on explosive plays
    if (coachBadge === 'SPEED_DEMON' && result.yards >= 15) {
      result.yards = Math.min(result.yards + 2, maxYards);
    }

    // Safety check
    if (ballPosition + result.yards <= 0) {
      result.isSafety = true;
      result.yards = 0;
    }

    // Run fumble (slightly higher than catches, +0.5%)
    const runFumbleRate = offPlay.fumbleRate + 0.005;
    if (Math.random() < runFumbleRate) {
      result.isFumble = true;
      result.isFumbleLost = Math.random() < 0.5;
      if (result.isFumbleLost) {
        result.description = `FUMBLE! Ball on the ground! Defense has it!`;
      } else {
        result.description = `Fumble but ${featuredOff.name} falls on it.`;
      }
    }
  }

  // FLAG ON THE PLAY (SILVER): 75% chance to nullify big gains
  if (context.defCard === 'FLAG_ON_THE_PLAY' && result.yards >= 10 && !result.isTouchdown) {
    if (Math.random() < 0.75) {
      result.yards = 0;
      result.description = "FLAG ON THE PLAY: Gain nullified by penalty.";
    }
  }

  // CHALLENGE FLAG (SILVER): 75% chance to overturn turnover/failed conversion
  if (context.offCard === 'CHALLENGE_FLAG' && (result.isInterception || result.isFumbleLost || (isConversion && !result.isTouchdown))) {
    if (Math.random() < 0.75) {
      result.isInterception = false;
      result.isFumbleLost = false;
      result.isTouchdown = isConversion;
      result.yards = !isConversion ? 0 : yardsToEndzone;
      result.description = "CHALLENGE FLAG: Play overturned by booth review!";
    }
  }

  // TD check
  if (result.yards >= yardsToEndzone && !result.isFumbleLost && !result.isInterception) {
    result.isTouchdown = true;
    result.yards = yardsToEndzone;
    result.description = `TOUCHDOWN! ${featuredOff.name} finds the end zone!`;
  } else if (!result.description) {
    if (result.yards >= 15) {
      result.description = `EXPLOSIVE! ${featuredOff.name} breaks free for ${result.yards}!`;
    } else if (result.yards >= 8) {
      result.description = `Big gain! ${featuredOff.name} picks up ${result.yards}.`;
    } else if (result.yards >= 1) {
      result.description = `${featuredOff.name} gains ${result.yards}.`;
    } else if (result.yards === 0) {
      result.description = `Stuffed! ${featuredOff.name} goes nowhere.`;
    } else {
      result.description = `Loss of ${Math.abs(result.yards)}! ${featuredOff.name} tackled in the backfield.`;
    }
  }

  return result;
}
