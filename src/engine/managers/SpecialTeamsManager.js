/**
 * TORCH — Special Teams Manager
 * Handles kickoff, punt, and field goal logic.
 */

export class SpecialTeamsManager {
  static resolveKickoff(returner, opts = {}) {
    if (opts.houseCall) {
      if (Math.random() < 0.3) return { returnYard: 100, touchdown: true, label: 'TOUCHDOWN! 100-YARD RETURN!' };
      var returnYard = 50 + Math.floor(Math.random() * 21); // own 50-70
      return { returnYard: returnYard, touchdown: false, label: 'HOUSE CALL! Returned to the ' + returnYard };
    }
    const KICKOFF = [
      { weight: 58, min: 25, max: 25, label: 'Touchback' },
      { weight: 22, min: 20, max: 28, label: 'Short return' },
      { weight: 13, min: 28, max: 35, label: 'Average return' },
      { weight: 5,  min: 35, max: 45, label: 'Good return' },
      { weight: 1.5, min: 45, max: 50, label: 'Big return' },
      { weight: 0.5, min: 100, max: 100, isTD: true, label: 'TOUCHDOWN!' },
    ];
    var retShift = returner && returner.st ? (returner.st.returnAbility - 3) * 5 : 0;
    var total = KICKOFF.reduce(function(s, k) { return s + k.weight; }, 0);
    var r = Math.random() * total;
    r = Math.max(0, Math.min(total - 0.01, r - retShift));
    for (var i = 0; i < KICKOFF.length; i++) {
      r -= KICKOFF[i].weight;
      if (r <= 0) {
        var k = KICKOFF[i];
        var returnYard = k.min + Math.floor(Math.random() * (k.max - k.min + 1));
        var label = k.isTD ? 'TOUCHDOWN! 100-YARD RETURN!' : (returnYard === 25 ? 'Touchback \u2014 ball on the 25' : 'Returned to the ' + returnYard);
        return { returnYard: returnYard, touchdown: !!k.isTD, label: label };
      }
    }
    return { returnYard: 25, touchdown: false, label: 'Touchback \u2014 ball on the 25' };
  }

  static resolvePunt(yardsToEndzone, punter, opts = {}) {
    const GROSS = [
      { min: 25, max: 34, weight: 10 },
      { min: 35, max: 39, weight: 20 },
      { min: 40, max: 44, weight: 35 },
      { min: 45, max: 49, weight: 25 },
      { min: 50, max: 58, weight: 10 },
    ];
    const RETURN = [
      { ret: 0, weight: 40, label: 'Fair catch' },
      { ret: 8, weight: 35, label: 'Short return' },
      { ret: 19, weight: 20, label: 'Decent return' },
      { ret: 35, weight: 5, label: 'Big return' },
    ];

    if (opts.blockedKick && Math.random() < 0.35) {
      return { blocked: true, label: 'BLOCKED PUNT! Recovered at the line of scrimmage!' };
    }

    var powerShift = punter && punter.st ? (punter.st.kickPower - 3) * 5 : 0;
    var total = GROSS.reduce(function(s, g) { return s + g.weight; }, 0);
    var r = Math.random() * total;
    r = Math.max(0, Math.min(total - 0.01, r - powerShift));
    var gross = 42;
    for (var i = 0; i < GROSS.length; i++) {
      r -= GROSS[i].weight;
      if (r <= 0) { gross = GROSS[i].min + Math.floor(Math.random() * (GROSS[i].max - GROSS[i].min + 1)); break; }
    }

    if (opts.coffinCorner) {
      gross = Math.max(yardsToEndzone - 9, Math.min(yardsToEndzone - 1, gross));
      if (gross < 20) gross = yardsToEndzone - 5;
    }

    var landingYdsToEz = Math.max(0, yardsToEndzone - gross);
    var isTouchback = !opts.coffinCorner && landingYdsToEz < 10 && Math.random() < 0.6;

    var retYards = 0;
    var retLabel = 'Fair catch';
    if (!opts.fairCatchGhost && !opts.coffinCorner && !isTouchback) {
      var rt = Math.random() * 100;
      for (var j = 0; j < RETURN.length; j++) {
        rt -= RETURN[j].weight;
        if (rt <= 0) {
          retYards = Math.max(0, RETURN[j].ret + Math.floor(Math.random() * 5 - 2));
          retLabel = RETURN[j].label;
          break;
        }
      }
    }

    var receiverYdsFromOwnEz = isTouchback ? 25 : Math.max(5, Math.min(50, landingYdsToEz + retYards));
    var netYards = gross - retYards;
    var puntPrefix = opts.coffinCorner ? 'COFFIN CORNER! ' : opts.fairCatchGhost ? 'FAIR CATCH GHOST! ' : '';
    var label = isTouchback
      ? puntPrefix + 'Punt — ' + gross + ' yards — Touchback'
      : puntPrefix + 'Punt — ' + gross + ' yards — ' + retLabel + ' to the ' + receiverYdsFromOwnEz;

    return { gross, netYards, isTouchback, retLabel, label, newBallPosFromOwnEz: receiverYdsFromOwnEz, blocked: false };
  }

  static resolveFieldGoal(yardsToEndzone, kicker, opts = {}, difficulty = 'MEDIUM', isHuman = true) {
    var fgDist = yardsToEndzone + 17;

    if (opts.blockedKick && Math.random() < 0.35) {
      return { made: false, distance: fgDist, label: 'BLOCKED! ' + fgDist + '-yard field goal is BLOCKED!', blocked: true };
    }

    var makePercent = fgDist <= 29 ? 88 : fgDist <= 39 ? 80 : fgDist <= 49 ? 68 : 50;
    var accStars = kicker && kicker.st ? kicker.st.kickAccuracy : 3;
    if (opts.iceTheKicker) accStars = Math.max(1, accStars - 1);
    makePercent += (accStars - 3) * 5;

    if (!isHuman) {
      makePercent += { EASY: -5, MEDIUM: 0, HARD: 8 }[difficulty] || 0;
    }

    var made = Math.random() * 100 < makePercent;
    var prefix = opts.iceTheKicker ? 'ICE THE KICKER! ' : '';
    var label = made ? prefix + fgDist + '-yard field goal is GOOD! +3' : prefix + fgDist + '-yard field goal NO GOOD!';

    return { made, distance: fgDist, label, blocked: false };
  }
}
