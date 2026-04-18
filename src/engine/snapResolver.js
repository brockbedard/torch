/**
 * TORCH v0.23.0 — Snap Resolver (THE CORE)
 * Retuned for exciting football: bigger plays, scheme differentiation,
 * big play chance, softer covered results, explosive exploits.
 */

import { checkOffensiveBadgeCombo, checkDefensiveBadgeCombo, isRunType } from './badgeCombos.js';
import { getPlayHistoryBonus } from './playHistory.js';
import { applyRedZone } from './redZone.js';
import { applySquadOVR } from './ovrSystem.js';
import { calculatePersonnelMod } from './personnelSystem.js';
import { getMomentumBonus } from './momentumSystem.js';

/**
 * Box-Muller transform for gaussian random numbers.
 */
function gaussRandom(mean, stddev) {
  if (!stddev || stddev <= 0) return mean;
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

  // ── BALL CARRIER DERIVATION ──
  // OL/DL should NEVER be narrated as the ball carrier. If the user featured a
  // lineman (e.g., a pulling guard for a PULLING GUARD trait combo), the engine
  // still uses them for tier/OVR math — but the play description must credit the
  // actual rusher (RB) or receiver (WR/TE). Falls back to featuredOff when no
  // skill player is in the roster (edge case — shouldn't happen in normal play).
  const _featuredIsLineman = featuredOff && (featuredOff.pos === 'OL' || featuredOff.pos === 'DL');
  const _receiverPositions = ['WR', 'slot WR', 'TE', 'SLOT', 'H-back'];
  const _rusherFallbacks = ['FB', 'H-back', 'TE', 'slot WR'];
  let narrator = featuredOff;
  if (_featuredIsLineman && Array.isArray(offPlayers)) {
    if (isRunPlay) {
      narrator = offPlayers.find(p => p.pos === 'RB')
              || offPlayers.find(p => _rusherFallbacks.indexOf(p.pos) >= 0)
              || offPlayers.find(p => p.pos === 'QB')
              || featuredOff;
    } else {
      narrator = offPlayers.find(p => _receiverPositions.indexOf(p.pos) >= 0)
              || offPlayers.find(p => p.pos === 'RB')
              || offPlayers.find(p => p.pos === 'QB')
              || featuredOff;
    }
  }
  // Hard guards — if state is corrupted (null featured player, empty roster),
  // synthesize minimal stubs so descriptions never crash on `.name` / `.badge`.
  // Normal play guarantees these are populated; this defends against edge cases.
  const _fallbackOff = { name: 'the offense', pos: '', badge: null };
  const _fallbackDef = { name: 'the defense', pos: '', badge: null };
  if (!narrator) narrator = featuredOff || _fallbackOff;
  if (!featuredOff) featuredOff = _fallbackOff;
  if (!featuredDef) featuredDef = _fallbackDef;
  // QB used for sacks/scrambles regardless of featured player
  const _qb = (Array.isArray(offPlayers) && offPlayers.find(p => p.pos === 'QB')) || featuredOff;

  // ── DEFENDER CREDIT DERIVATION ──
  // Mirror of the ball-carrier rule: the featured defender gets combo math, but
  // credit for specific actions must go to a position-appropriate player.
  //  - INT / PBU → DB (CB, FS, SS, S)
  //  - SACK → DL or blitzing LB
  //  - (tackles remain position-neutral — LBs tackle everywhere)
  // Falls back to featuredDef when the roster isn't available.
  const _secondaryPositions = ['CB', 'FS', 'SS', 'S', 'OLB/SS'];
  const _rusherDefPositions = ['DL', 'LB', 'OLB/SS', 'EDGE'];
  const _featuredDefPos = featuredDef ? featuredDef.pos : '';
  let _coverageDef = featuredDef;
  let _passRushDef = featuredDef;
  if (Array.isArray(defPlayers)) {
    if (_secondaryPositions.indexOf(_featuredDefPos) < 0) {
      _coverageDef = defPlayers.find(p => _secondaryPositions.indexOf(p.pos) >= 0) || featuredDef;
    }
    if (_rusherDefPositions.indexOf(_featuredDefPos) < 0) {
      _passRushDef = defPlayers.find(p => _rusherDefPositions.indexOf(p.pos) >= 0) || featuredDef;
    }
  }

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
  if (context.offCard && ['SCOUT_TEAM', 'FILM_LEAK', 'SIDELINE_PHONE', 'PERSONNEL_REPORT', 'scout_team', 'personnel_report', 'pre_snap_read', 'scout_report'].includes(context.offCard)) {
    revealBonus = 1;
  }

  // FAKE KNEEL (SILVER): +6 mean yards (2-min only)
  let fakeKneelBonus = (context.offCard === 'FAKE_KNEEL' && context.twoMinActive) ? 6 : 0;

  // ── COVERAGE MODIFIERS ──
  const cov = offPlay.coverageMods[defPlay.baseCoverage] || {};
  const covMean = cov.mean || 0;
  const covVar = cov.var || 0;
  const covInt = cov.int || 0;

  // ── BASE MEAN (25% bump — reduced from 55% to fix inflated yardage) ──
  let mean = offPlay.mean * 1.25 + covMean;
  let variance = Math.max(1, offPlay.variance * 0.90 + covVar);

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

  // Personnel system (stars, traits, heat, matchups)
  const personnelMod = calculatePersonnelMod({
    featuredOff: featuredOff,
    featuredDef: featuredDef,
    offPlayers: offPlayers,
    defPlayers: defPlayers,
    offPlayType: offPlay.playType || (isRunPlay ? 'RUN' : 'SHORT'),
    defCardType: defPlay.cardType || 'ZONE',
    offHeatMap: context.offHeatMap || null,
    defHeatMap: context.defHeatMap || null,
  });
  mean += personnelMod.totalMod;
  result.personnelMod = personnelMod;

  // Momentum chains bonus
  var offMomentum = (context.offMomentumMap && featuredOff.id) ? (context.offMomentumMap[featuredOff.id] || 0) : 0;
  var momentumBonus = getMomentumBonus(offMomentum);
  mean += momentumBonus;

  // Card combo bonus (passed from UI via context)
  if (context.cardComboBonus) {
    mean += context.cardComboBonus.yards || 0;
    if (context.cardComboBonus.torchMultiplier) {
      result.torchMultiplier = (result.torchMultiplier || 1) * context.cardComboBonus.torchMultiplier;
    }
    result.cardComboFired = true;
  }

  // Star heat check bonus (hot star featured on this snap)
  if (context.starHotBonus) {
    mean += context.starHotBonus;
  }

  // Hot Read: screen called against blitz defense
  var defCat = defPlay.cat || defPlay.cardType || '';
  if (offPlay.playType === 'SCREEN' && (defCat === 'BLITZ' || defCat === 'PRESS COVERAGE')) {
    mean += 5;
    result.hotReadFired = true;
  }

  // Red zone compression
  const rz = applyRedZone(yardsToEndzone, mean, variance, offPlay);
  mean = rz.mean;
  variance = rz.variance;
  const maxYards = rz.maxYards;

  // Apply trailing team bonus
  mean += trailingBonus + revealBonus + fakeKneelBonus;
  variance += trailingVarBoost;

  // ── DIFFICULTY YARD BONUS ──
  // Easy: +0.6 (was +1.0), with rubber-band: +0 if ahead by 21+
  // Medium: +1 human offense, -0.5 AI offense — nudge toward 40-55% win rate
  if (difficulty === 'EASY' && offenseIsHuman) {
    mean += (scoreDiff <= -21) ? 0 : 0.6;
  } else if (difficulty === 'MEDIUM' && offenseIsHuman) {
    mean += 1;
  } else if (difficulty === 'MEDIUM' && !offenseIsHuman) {
    mean -= 0.5;
  } else if (difficulty === 'HARD' && offenseIsHuman) {
    mean -= 1;
  }
  // Halftime adjustment (2nd half only, human offense only)
  var adj = context.halftimeAdjustment;
  if (adj && offenseIsHuman) {
    if (adj === 'aggressive') mean += 2;
    else if (adj === 'conservative') mean -= 1;
  }

  // Weather modifiers applied post-resolution in gameplay.js via getConditionEffects()

  // === PASS PLAY RESOLUTION ===
  if (isPass) {
    // ── HAIL MARY BRANCH ──
    // Desperation heave: trailing team, clock ≤ 15s, 30+ yards from endzone,
    // deep pass. Bypasses normal sack/INT/completion math with a fixed distribution
    // modeled after real-football Hail Mary outcomes: ~15% TD, ~20% INT, ~65% bat-down.
    // Activates for BOTH user and AI automatically when conditions match.
    const _hailClock = context.clockSeconds;
    const _isHailMaryAttempt =
      offPlay.playType === 'DEEP' &&
      context.twoMinActive &&
      _hailClock !== undefined && _hailClock <= 15 &&
      context.scoreDiff >= 1 &&           // offense trailing
      yardsToEndzone >= 30;
    if (_isHailMaryAttempt) {
      const hailRoll = Math.random();
      if (hailRoll < 0.15) {
        // TOUCHDOWN! Miracle caught
        result.isComplete = true;
        result.isTouchdown = true;
        result.yards = yardsToEndzone;
        result.description = `HAIL MARY! ${_qb.name} lofts it \u2014 CAUGHT! TOUCHDOWN!`;
      } else if (hailRoll < 0.35) {
        // INTERCEPTED in the end zone
        result.isInterception = true;
        result.yards = 0;
        result.description = `HAIL MARY INTERCEPTED! ${_coverageDef.name} comes down with it in the end zone.`;
      } else {
        // BAT-DOWN / incomplete
        result.isIncomplete = true;
        result.yards = 0;
        const batdowns = [
          `HAIL MARY \u2014 batted down! ${_coverageDef.name} plays it well.`,
          `HAIL MARY falls incomplete. Traffic in the end zone.`,
          `HAIL MARY \u2014 knocked away! Nobody could come down with it.`,
        ];
        result.description = batdowns[Math.floor(Math.random() * batdowns.length)];
      }
      return result;
    }

    // ── SACK CHECK ──
    let sackRate = offPlay.sackRate + defPlay.sackRateBonus + ovrMods.sackMod;

    if (offPlay.playType === 'DEEP' && defPlay.id === 'ct_corner_blitz') sackRate *= 2;
    if (defPlay.passMeanMod < 0 && defPlay.sackRateBonus >= 0.03) sackRate += 0.03;
    if (yardsToEndzone <= 20) sackRate += 0.02;
    if (yardsToEndzone <= 10) sackRate += 0.02;
    sackRate += 0.01; // Global bump reduced from 0.03
    if (coachBadge === 'IRON_CURTAIN') sackRate += 0.03;
    if (difficulty === 'EASY' && offenseIsHuman) sackRate *= 0.4;

    sackRate *= 0.85; // Global sack reduction to increase scoring
    sackRate = Math.max(0, Math.min(0.30, sackRate));

    if (Math.random() < sackRate) {
      result.isSack = true;
      result.yards = -(4 + Math.floor(Math.random() * 7));
      result.description = `SACK! ${_qb.name} goes down.`;
    } else {
      // ── INT CHECK ──
      let intRate = offPlay.intRate + covInt + defPlay.intRateBonus + ovrMods.intMod;
      intRate += 0.005; // Global bump
      if (defPlay.id === 'ir_robber' && (offPlay.id === 'mesh' || offPlay.id === 'slant' || offPlay.id === 'shallow_cross')) intRate += 0.04;
      if (defPlay.id === 'ir_mod' && (offPlay.id === 'four_verts' || offPlay.id === 'go_route')) intRate += 0.03;
      if (featuredDef.badge === 'EYE' && (offPlay.id === 'pa_flat' || offPlay.id === 'pa_post' || offPlay.playType === 'OPTION')) intRate += 0.02;
      // Halftime adjustment: aggressive +5% INT risk, conservative -50%
      if (adj === 'aggressive' && offenseIsHuman) intRate += 0.05;
      else if (adj === 'conservative' && offenseIsHuman) intRate *= 0.5;
      intRate = Math.max(0, Math.min(0.20, intRate));

      if (Math.random() < intRate) {
        result.isInterception = true;
        result.isComplete = false;
        result.yards = 0;
        result.description = `INTERCEPTED! ${_coverageDef.name} jumps the route!`;
      } else {
        // ── COMPLETION CHECK ──
        let compRate = offPlay.completionRate + ovrMods.compMod + defPlay.passCompMod;

        // Play-type completion boost
        var pt = offPlay.playType;
        if (pt === 'SHORT') compRate += 0.10;
        else if (pt === 'SCREEN') compRate += 0.12;

        if (covMean <= -2) compRate -= 0.08;
        else if (covMean <= -1) compRate -= 0.04;
        if (yardsToEndzone <= 10) compRate -= 0.05;
        // Rain completionMod applied post-resolution in gameplay.js
        if (momentum > 75) compRate -= 0.05;
        if (difficulty === 'EASY' && offenseIsHuman) compRate += 0.10;

        compRate = Math.max(0.40, Math.min(0.95, compRate));

        if (Math.random() > compRate) {
          result.isIncomplete = true;
          result.yards = 0;
          result.description = `Incomplete. ${_qb.name}'s target can't come up with it.`;
        } else {
          // ── COMPLETE — ROLL YARDS ──
          result.isComplete = true;
          let rawYards = gaussRandom(mean, variance * 0.5);

          // Big play chance (3.5% on completions)
          if (Math.random() < 0.035) {
            var bigMult = 1.4 + Math.random() * 0.5;
            rawYards = mean * bigMult;
            result.description = `EXPLOSIVE! ${narrator.name} breaks free for extra yards!`;
          }

          // Soft cap: diminishing returns above 20 yards
          if (rawYards > 20) rawYards = 20 + (rawYards - 20) * 0.5;

          // Covered floor
          if (covMean <= -2 && rawYards < 2) rawYards = 1 + Math.random() * 3;

          result.yards = Math.max(-5, Math.min(Math.round(rawYards), maxYards));

          if (coachBadge === 'SPEED_DEMON' && result.yards >= 15) {
            result.yards = Math.min(result.yards + 2, maxYards);
          }

          // Fumble after catch
          let fumbleRate = offPlay.fumbleRate;
          fumbleRate += (context.fumbleRateMod || 0);  // Snow/rain fumble mod from conditions
          if (adj === 'aggressive' && offenseIsHuman) fumbleRate += 0.03;
          else if (adj === 'conservative' && offenseIsHuman) fumbleRate *= 0.5;
          if (Math.random() < fumbleRate) {
            result.isFumble = true;
            result.isFumbleLost = Math.random() < 0.5;
            if (result.isFumbleLost) {
              result.description = `FUMBLE! ${narrator.name} coughs it up — defense recovers!`;
            } else {
              result.description = `FUMBLE! ${narrator.name} coughs it up — offense falls on it!`;
            }
          }
        }
      }
    }
  }
  // === RUN PLAY RESOLUTION (skip completion check entirely) ===
  else {
    // ── STUFF CHECK ──
    let stuffRate = 0.11; // Reduced from 0.14 to improve drive success rate

    if (defPlay.runDefMod < -2) stuffRate += 0.10;
    else if (defPlay.runDefMod < 0) stuffRate += 0.05;
    if (defPlay.isCover0Blitz) stuffRate -= 0.12;
    if (covMean <= -2) stuffRate += 0.08;
    else if (covMean <= -1) stuffRate += 0.04;
    if (yardsToEndzone <= 10) stuffRate += 0.08;
    else if (yardsToEndzone <= 20) stuffRate += 0.04;
    if (difficulty === 'EASY' && offenseIsHuman) stuffRate *= 0.60;

    stuffRate = Math.max(0.05, Math.min(0.50, stuffRate));

    if (Math.random() < stuffRate) {
      result.yards = -1 + Math.floor(Math.random() * 4);
      if (result.yards <= 0) {
        result.description = `STUFFED! ${narrator.name} hit in the backfield.`;
      } else {
        result.description = `${narrator.name} squeezed through traffic for ${result.yards} yards.`;
      }

      if (Math.random() < offPlay.fumbleRate * 1.5) {
        result.isFumble = true;
        result.isFumbleLost = Math.random() < 0.5;
        if (result.isFumbleLost) {
          result.description = `STUFFED AND STRIPPED! ${narrator.name} loses it!`;
        }
      }
    } else {
      // ── ROLL YARDS (no completion check — runs always "connect") ──
      let rawYards = gaussRandom(mean, variance * 0.5);

      // Big play chance on runs (2.5%)
      if (Math.random() < 0.025) {
        var runBigMult = 1.3 + Math.random() * 0.4;
        rawYards = mean * runBigMult;
        result.description = `${narrator.name} breaks a tackle and keeps going!`;
      }

      // Soft cap: diminishing returns above 20 yards
      if (rawYards > 20) rawYards = 20 + (rawYards - 20) * 0.5;

      // Covered floor for runs
      if (covMean <= -2 && rawYards < 2) rawYards = 1 + Math.random() * 2;

      result.yards = Math.max(-5, Math.min(Math.round(rawYards), maxYards));

      if (coachBadge === 'SPEED_DEMON' && result.yards >= 15) {
        result.yards = Math.min(result.yards + 2, maxYards);
      }

      // No safeties in v1 — ball capped at 1-yard line in gameState.advanceBall()

      // Run fumble
      var runFumbleRate = offPlay.fumbleRate + 0.005;
      if (adj === 'aggressive' && offenseIsHuman) runFumbleRate += 0.03;
      else if (adj === 'conservative' && offenseIsHuman) runFumbleRate *= 0.5;
      if (Math.random() < runFumbleRate) {
        result.isFumble = true;
        result.isFumbleLost = Math.random() < 0.5;
        if (result.isFumbleLost) {
          result.description = `FUMBLE! Ball on the ground! Defense has it!`;
        } else {
          result.description = `FUMBLE! ${narrator.name} falls on it — offense recovers.`;
        }
      }
    }
  }

  // ── EASY DIFFICULTY POST-RESOLUTION ──
  if (difficulty === 'EASY') {
    if (offenseIsHuman) {
      if (result.isSack && Math.random() < 0.20) { // was 0.30
        result.isSack = false;
        result.yards = Math.floor(Math.random() * 3);
        result.description = `${_qb.name} escapes pressure for ${result.yards} yards.`;
      }
      if (result.isInterception && Math.random() < 0.25) { // was 0.40
        result.isInterception = false;
        result.isIncomplete = true;
        result.yards = 0;
        result.description = `Pass broken up — close call!`;
      }
    } else if (!offenseIsHuman && result.yards > 0) {
      result.yards = Math.max(1, Math.floor(result.yards * 0.90)); // Easy: AI 10% yard reduction
    }
  }

  // ── TORCH CARD EFFECTS (12 cards from torchCards.js v1) ──
  var oCard = context.offCard;
  var dCard = context.defCard;

  // SCOUT TEAM (Gold, pre-snap): reveals opponent play — handled in gameState.js
  // PERSONNEL REPORT (Bronze, pre-snap): reveals opponent player — handled in gameplay.js

  // SURE HANDS (Gold, reactive): Cancel a turnover
  if (oCard === 'sure_hands' && (result.isInterception || result.isFumbleLost)) {
    result.isInterception = false;
    result.isFumble = false;
    result.isFumbleLost = false;
    result.yards = Math.max(0, result.yards);
    result.description = "SURE HANDS! Turnover cancelled — " + narrator.name + " holds on!";
    result.torchCardUsed = 'sure_hands';
  }

  // CHALLENGE FLAG (Silver, reactive): Reroll, 50% chance of better outcome
  if (oCard === 'challenge_flag') {
    var origYards = result.yards;
    var origTurnover = result.isInterception || result.isFumbleLost;
    // Reroll the snap with same inputs
    var reroll = resolveSnap(offPlay, defPlay, featuredOff, featuredDef, offPlayers, defPlayers,
      Object.assign({}, context, { offCard: null, defCard: null }));
    var rerollBetter = reroll.yards > origYards || (origTurnover && !reroll.isInterception && !reroll.isFumbleLost);
    if (Math.random() < 0.5 && rerollBetter) {
      // Use the better reroll
      Object.assign(result, reroll);
      result.description = "CHALLENGE FLAG! Play overturned for " + result.yards + " yards!";
    } else {
      result.description = "CHALLENGE FLAG! Review stands. " + (origTurnover ? "Turnover confirmed." : "Result holds at " + origYards + " yards.");
    }
    result.torchCardUsed = 'challenge_flag';
  }

  // HARD COUNT (Silver, pre-snap): opponent play randomized — handled in gameplay.js

  // DEEP SHOT (Silver, pre-snap): 2x yards on pass plays
  if (oCard === 'deep_shot' && isPass && !result.isSack && !result.isInterception && !result.isFumbleLost && !result.isIncomplete) {
    result.yards = Math.round(result.yards * 2);
    result.description = "DEEP SHOT! " + narrator.name + " goes long for " + result.yards + " yards!";
    result.torchCardUsed = 'deep_shot';
  }

  // TRUCK STICK (Silver, pre-snap): 2x yards on run, can't fumble
  if (oCard === 'truck_stick' && isRunPlay && !result.isSack) {
    result.yards = Math.round(Math.max(result.yards, 1) * 2);
    result.isFumble = false;
    result.isFumbleLost = false;
    result.description = "TRUCK STICK! " + narrator.name + " trucks a defender for " + result.yards + " yards!";
    result.torchCardUsed = 'truck_stick';
  }

  // PRIME TIME (Silver, pre-snap): featured player OVR = 99 this snap
  // Boost yards based on the gap between actual OVR and 99 — more impact for weaker players
  if (oCard === 'prime_time') {
    var _origOvr = featuredOff.ovr || 78;
    var primeBoost = Math.max(2, Math.round((99 - _origOvr) * 0.2));
    result.yards += primeBoost;
    // Also prevent negative outcomes — PRIME TIME player doesn't get sacked or fumble
    if (result.yards < 0) result.yards = Math.max(0, result.yards + 3);
    if (result.isFumble) { result.isFumble = false; result.isFumbleLost = false; }
    result.description = result.description || (featuredOff.name + ' goes PRIME TIME! +' + primeBoost + ' yards!');
    result.torchCardUsed = 'prime_time';
  }

  // PLAY ACTION (Bronze, pre-snap): +5 yards if opponent played run defense
  if (oCard === 'play_action') {
    var isRunDef = defPlay && (defPlay.cardType === 'BLITZ' || (defPlay.runDefMod && defPlay.runDefMod < -1));
    if (isRunDef) {
      result.yards += 5;
      result.description = "PLAY ACTION! Defense bit on the run fake. 5 bonus yards!";
    } else {
      result.description = result.description || "Play action — defense wasn't fooled.";
    }
    result.torchCardUsed = 'play_action';
  }

  // SCRAMBLE DRILL (Bronze, pre-snap): convert negative play to 0 yards
  if (oCard === 'scramble_drill' && result.yards < 0 && !result.isInterception && !result.isFumbleLost) {
    result.yards = 0;
    result.isSack = false;
    result.description = "SCRAMBLE DRILL! " + _qb.name + " escapes the pressure — no loss!";
    result.torchCardUsed = 'scramble_drill';
  }

  // 12TH MAN (Bronze, pre-snap): +4 yards and double TORCH points
  if (oCard === 'twelfth_man') {
    result.yards += 4;
    result.torchMultiplier = 2;
    result.description = "12TH MAN! The crowd fuels " + result.yards + " yards!";
    result.torchCardUsed = 'twelfth_man';
  }

  // ICE (Bronze, pre-snap): Zero OVR bonus + no badge combo for opponent
  if (dCard === 'ice') {
    result.yards -= Math.round(ovrMods.meanMod);
    result.offComboYards = 0;
    result.offComboPts = 0;
    result.description = "ICE! " + featuredOff.name + " is frozen out — no OVR, no combos!";
    result.torchCardUsed = 'ice';
  }

  // ── TD CHECK ──
  if (result.yards >= yardsToEndzone && !result.isFumbleLost && !result.isInterception) {
    result.isTouchdown = true;
    result.yards = yardsToEndzone;
    result.description = `TOUCHDOWN! ${narrator.name} finds the end zone!`;
  } else if (!result.description) {
    // Descriptions use plain English with yard numbers (no +/- symbols)
    if (result.yards >= 15) {
      result.description = `${narrator.name} breaks free for ${result.yards} yards!`;
    } else if (result.yards >= 8) {
      result.description = `${narrator.name} picks up ${result.yards} yards.`;
    } else if (result.yards >= 1) {
      result.description = `${narrator.name} gains ${result.yards} yards.`;
    } else if (result.yards === 0) {
      result.description = `Stuffed! ${narrator.name} goes nowhere.`;
    } else {
      result.description = `${narrator.name} tackled for a loss of ${Math.abs(result.yards)}.`;
    }
  }

  return result;
}
