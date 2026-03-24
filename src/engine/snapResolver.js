/**
 * TORCH v0.23.0 — Snap Resolver (THE CORE)
 * Retuned for exciting football: bigger plays, scheme differentiation,
 * big play chance, softer covered results, explosive exploits.
 */

import { checkOffensiveBadgeCombo, checkDefensiveBadgeCombo, isRunType } from './badgeCombos.js';
import { getPlayHistoryBonus } from './playHistory.js';
import { applyRedZone } from './redZone.js';
import { applySquadOVR } from './ovrSystem.js';

/**
 * Box-Muller transform for gaussian random numbers.
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
 */
export function resolveSnap(offPlay, defPlay, featuredOff, featuredDef, offPlayers, defPlayers, context) {
  const { playHistory, yardsToEndzone, ballPosition, down, distance, isConversion, scoreDiff, weather, momentum, coachBadge, difficulty, offenseIsHuman } = context;

  // ── RUN/PASS DETECTION (authoritative) ──
  // Use the play's type/isRun field, NOT completionRate (which is 1.0 for some runs)
  const isRunPlay = offPlay.isRun === true || offPlay.type === 'run';
  const isPass = !isRunPlay;

  const result = {
    yards: 0,
    playType: isRunPlay ? 'run' : 'pass',
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
  const is3rd4th = down >= 3;

  // ── TRAILING TEAM BONUS ──
  let trailingBonus = 0;
  let trailingVarBoost = 0;
  if (scoreDiff >= 14) {
    trailingBonus = 3;
    trailingVarBoost = 4;
  } else if (scoreDiff >= 7) {
    trailingBonus = 2;
    trailingVarBoost = 2;
  }

  // Reveal Card Sim-Benefits
  let revealBonus = 0;
  if (context.offCard && ['SCOUT_TEAM', 'FILM_LEAK', 'SIDELINE_PHONE', 'PERSONNEL_REPORT'].includes(context.offCard)) {
    revealBonus = 1;
  }

  // FAKE KNEEL (SILVER): +6 mean yards (2-min only)
  let fakeKneelBonus = (context.offCard === 'FAKE_KNEEL' && context.twoMinActive) ? 6 : 0;

  // ── COVERAGE MODIFIERS ──
  const cov = offPlay.coverageMods[defPlay.baseCoverage] || {};
  const covMean = cov.mean || 0;
  const covVar = cov.var || 0;
  const covInt = cov.int || 0;

  // ── BASE MEAN (25% bump from v0.22) ──
  let mean = offPlay.mean * 1.25 + covMean;
  let variance = Math.max(1, offPlay.variance * 1.15 + covVar);

  // Defensive card effects
  if (isRunPlay) {
    mean += defPlay.runMeanMod;
    if (defPlay.isCover0Blitz) mean += 3;
  } else {
    if ((defPlay.id === 'ct_press_man' || defPlay.id === 'ir_press_man') && offPlay.playType === 'DEEP') {
      mean += 2;
    }
  }

  // ── BADGE COMBOS ──
  const offCombo = checkOffensiveBadgeCombo(featuredOff.badge, offPlay, is3rd4th, isConversion || false);
  const defCombo = checkDefensiveBadgeCombo(featuredDef.badge, defPlay, offPlay);

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

  // ── DIFFICULTY YARD BONUS ──
  // Easy: +1.5 (was +3), with rubber-band: +0 if ahead by 21+
  if (difficulty === 'EASY' && offenseIsHuman) {
    mean += (scoreDiff <= -21) ? 0 : 1.5;
  } else if (difficulty === 'HARD' && offenseIsHuman) {
    mean -= 1;
  }

  // Weather Modifiers
  if (weather === 'WINDY' && isPass) mean -= 2.0;
  if (weather === 'SNOW' && isRunPlay) mean -= 1.0;

  // === PASS PLAY RESOLUTION ===
  if (isPass) {
    // ── SACK CHECK ──
    let sackRate = offPlay.sackRate + defPlay.sackRateBonus + ovrMods.sackMod;

    if (offPlay.playType === 'DEEP' && defPlay.id === 'ct_corner_blitz') sackRate *= 2;
    if (defPlay.passMeanMod < 0 && defPlay.sackRateBonus >= 0.03) sackRate += 0.03;
    if (yardsToEndzone <= 20) sackRate += 0.02;
    if (yardsToEndzone <= 10) sackRate += 0.02;
    sackRate += 0.03; // Global bump
    if (coachBadge === 'IRON_CURTAIN') sackRate += 0.03;
    if (difficulty === 'EASY' && offenseIsHuman) sackRate *= 0.4;

    sackRate = Math.max(0, Math.min(0.30, sackRate));

    if (Math.random() < sackRate) {
      result.isSack = true;
      result.yards = -(4 + Math.floor(Math.random() * 7));
      if (ballPosition + result.yards <= 0) {
        result.isSafety = true;
        result.yards = 0;
      }
      result.description = `SACK! ${featuredOff.name} goes down.`;
      return result;
    }

    // ── COMPLETION CHECK ──
    let compRate = offPlay.completionRate + ovrMods.compMod + defPlay.passCompMod;

    // Play-type completion boost
    var pt = offPlay.playType;
    if (pt === 'QUICK' || pt === 'SHORT') compRate += 0.10;
    else if (pt === 'SCREEN') compRate += 0.12;

    if (covMean <= -2) compRate -= 0.08;
    else if (covMean <= -1) compRate -= 0.04;
    if (yardsToEndzone <= 10) compRate -= 0.05;
    if (weather === 'RAIN') compRate -= 0.05;
    if (momentum > 75) compRate -= 0.05;
    if (difficulty === 'EASY' && offenseIsHuman) compRate += 0.15;

    compRate = Math.max(0.15, Math.min(0.95, compRate));

    if (Math.random() > compRate) {
      result.isIncomplete = true;
      result.yards = 0;
      result.description = `Incomplete. ${featuredOff.name}'s target can't come up with it.`;
      return result;
    }

    // ── COMPLETE — ROLL YARDS ──
    result.isComplete = true;
    let rawYards = gaussRandom(mean, variance * 0.5);

    // Big play chance (7% on completions — was 15%)
    if (Math.random() < 0.07) {
      var bigMult = 1.4 + Math.random() * 0.8;
      rawYards = mean * bigMult;
      result.description = `EXPLOSIVE! ${featuredOff.name} breaks free for extra yards!`;
    }

    // Covered floor
    if (covMean <= -2 && rawYards < 2) rawYards = 1 + Math.random() * 3;

    result.yards = Math.max(-5, Math.min(Math.round(rawYards), maxYards));

    if (coachBadge === 'SPEED_DEMON' && result.yards >= 15) {
      result.yards = Math.min(result.yards + 2, maxYards);
    }

    // ── INT CHECK ──
    let intRate = offPlay.intRate + covInt + defPlay.intRateBonus + ovrMods.intMod;
    intRate -= 0.005;
    if (defPlay.id === 'ir_robber' && (offPlay.id === 'mesh' || offPlay.id === 'slant' || offPlay.id === 'shallow_cross')) intRate += 0.04;
    if (defPlay.id === 'ir_mod' && (offPlay.id === 'four_verts' || offPlay.id === 'go_route')) intRate += 0.03;
    if (featuredDef.badge === 'EYE' && (offPlay.id === 'pa_flat' || offPlay.id === 'pa_post' || offPlay.playType === 'OPTION')) intRate += 0.02;
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
  // === RUN PLAY RESOLUTION (skip completion check entirely) ===
  else {
    // ── STUFF CHECK ──
    let stuffRate = 0.18;

    if (defPlay.runDefMod < -2) stuffRate += 0.10;
    else if (defPlay.runDefMod < 0) stuffRate += 0.05;
    if (defPlay.isCover0Blitz) stuffRate -= 0.12;
    if (covMean <= -2) stuffRate += 0.08;
    else if (covMean <= -1) stuffRate += 0.04;
    if (yardsToEndzone <= 10) stuffRate += 0.08;
    else if (yardsToEndzone <= 20) stuffRate += 0.04;
    if (difficulty === 'EASY' && offenseIsHuman) stuffRate *= 0.5;

    stuffRate = Math.max(0.05, Math.min(0.50, stuffRate));

    if (Math.random() < stuffRate) {
      result.yards = -1 + Math.floor(Math.random() * 4);
      if (ballPosition + result.yards <= 0) {
        result.isSafety = true;
        result.yards = 0;
      }
      if (result.yards <= 0) {
        result.description = `STUFFED! ${featuredOff.name} hit in the backfield.`;
      } else {
        result.description = `${featuredOff.name} squeezed for ${result.yards}.`;
      }

      if (Math.random() < offPlay.fumbleRate * 1.5) {
        result.isFumble = true;
        result.isFumbleLost = Math.random() < 0.5;
        if (result.isFumbleLost) {
          result.description = `STUFFED AND STRIPPED! ${featuredOff.name} loses it!`;
        }
      }
      return result;
    }

    // ── ROLL YARDS (no completion check — runs always "connect") ──
    let rawYards = gaussRandom(mean, variance * 0.5);

    // Big play chance on runs (7% — was 15%)
    if (Math.random() < 0.07) {
      var runBigMult = 1.4 + Math.random() * 0.8;
      rawYards = mean * runBigMult;
      result.description = `${featuredOff.name} breaks a tackle and keeps going!`;
    }

    // Covered floor for runs
    if (covMean <= -2 && rawYards < 2) rawYards = 1 + Math.random() * 2;

    result.yards = Math.max(-5, Math.min(Math.round(rawYards), maxYards));

    if (coachBadge === 'SPEED_DEMON' && result.yards >= 15) {
      result.yards = Math.min(result.yards + 2, maxYards);
    }

    // Safety check
    if (ballPosition + result.yards <= 0) {
      result.isSafety = true;
      result.yards = 0;
    }

    // Run fumble
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

  // ── EASY DIFFICULTY POST-RESOLUTION ──
  if (difficulty === 'EASY') {
    if (offenseIsHuman) {
      if (result.isSack && Math.random() < 0.50) {
        result.isSack = false;
        result.yards = Math.floor(Math.random() * 3);
        result.description = `${featuredOff.name} escapes pressure for ${result.yards}.`;
      }
      if (result.isInterception && Math.random() < 0.40) {
        result.isInterception = false;
        result.isIncomplete = true;
        result.yards = 0;
        result.description = `Pass broken up — close call!`;
      }
    } else if (!offenseIsHuman && !result.isSack && !result.isIncomplete) {
      result.yards = Math.max(result.yards - 2, -5);
    }
  }

  // ── TORCH CARD EFFECTS ──
  if (context.defCard === 'FLAG_ON_THE_PLAY' && result.yards >= 10 && !result.isTouchdown) {
    if (Math.random() < 0.75) {
      result.yards = 0;
      result.description = "FLAG ON THE PLAY: Gain nullified by penalty.";
    }
  }

  if (context.offCard === 'CHALLENGE_FLAG' && (result.isInterception || result.isFumbleLost || (isConversion && !result.isTouchdown))) {
    if (Math.random() < 0.75) {
      result.isInterception = false;
      result.isFumbleLost = false;
      result.isTouchdown = isConversion;
      result.yards = !isConversion ? 0 : yardsToEndzone;
      result.description = "CHALLENGE FLAG: Play overturned by booth review!";
    }
  }

  // ── TD CHECK ──
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
