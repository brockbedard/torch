/**
 * TORCH v0.21 — Play Sequence Combos (v2 feature, data model specced now)
 * Hidden bonuses for specific play patterns. Players discover organically.
 * Brief flash text when combo fires — no tooltip or explanation.
 */

export var PLAY_COMBOS = [
  {
    id: 'setup',
    name: 'SETUP!',
    description: 'Run-run-play action sequence',
    // Pattern: last 2 plays were RUN/OPTION type, current play is PLAY-ACTION
    check: function(history, currentCat) {
      if (history.length < 2) return false;
      var isPA = currentCat === 'PLAY-ACTION' || currentCat === 'PLAY_ACTION';
      var prev1Run = isRunType(history[history.length - 1]);
      var prev2Run = isRunType(history[history.length - 2]);
      return isPA && prev1Run && prev2Run;
    },
    yardBonus: 4,
    pointsMultiplier: 1,
  },
  {
    id: 'drive_momentum',
    name: 'DRIVE MOMENTUM',
    description: 'Three consecutive short passes',
    check: function(history, currentCat) {
      if (history.length < 2) return false;
      var isShort = currentCat === 'SHORT PASS' || currentCat === 'SHORT' || currentCat === 'QUICK PASS' || currentCat === 'QUICK';
      var prev1Short = isShortPass(history[history.length - 1]);
      var prev2Short = isShortPass(history[history.length - 2]);
      return isShort && prev1Short && prev2Short;
    },
    yardBonus: 2,
    pointsMultiplier: 1,
  },
  {
    id: 'caught_sleeping',
    name: 'CAUGHT SLEEPING',
    description: 'Deep pass after 3+ runs',
    check: function(history, currentCat) {
      if (history.length < 3) return false;
      var isDeep = currentCat === 'DEEP PASS' || currentCat === 'DEEP';
      var runCount = 0;
      for (var i = history.length - 1; i >= Math.max(0, history.length - 3); i--) {
        if (isRunType(history[i])) runCount++;
      }
      return isDeep && runCount >= 3;
    },
    yardBonus: 3,
    pointsMultiplier: 1,
  },
  {
    id: 'hot_read',
    name: 'HOT READ',
    description: 'Screen after opponent blitz',
    // This one checks the opponent's LAST play, not the player's history
    check: function(history, currentCat, opponentLastCat) {
      var isScreen = currentCat === 'SCREEN';
      var wasBlitz = opponentLastCat === 'BLITZ' || opponentLastCat === 'PRESS COVERAGE';
      return isScreen && wasBlitz;
    },
    yardBonus: 5,
    pointsMultiplier: 1,
  },
  {
    id: 'predictable',
    name: 'PREDICTABLE',
    description: 'Same play called 3 times in a row',
    check: function(history, currentCat, opponentLastCat, currentPlayId) {
      if (history.length < 2) return false;
      var prev1 = history[history.length - 1];
      var prev2 = history[history.length - 2];
      return currentPlayId && prev1.playId === currentPlayId && prev2.playId === currentPlayId;
    },
    yardBonus: -3,
    pointsMultiplier: 1,
  },
];

function isRunType(entry) {
  var cat = entry.cat || entry.category || '';
  return cat === 'RUN' || cat === 'OPTION' || cat === 'QB RUN' || cat === 'DRAW';
}

function isShortPass(entry) {
  var cat = entry.cat || entry.category || '';
  return cat === 'SHORT PASS' || cat === 'SHORT' || cat === 'QUICK PASS' || cat === 'QUICK';
}

// Check all combos against current play and history
export function checkPlayCombos(history, currentCat, opponentLastCat, currentPlayId) {
  var fired = [];
  for (var i = 0; i < PLAY_COMBOS.length; i++) {
    var combo = PLAY_COMBOS[i];
    if (combo.check(history, currentCat, opponentLastCat, currentPlayId)) {
      fired.push(combo);
    }
  }
  return fired;
}
