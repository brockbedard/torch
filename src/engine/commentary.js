/**
 * TORCH v0.22 — Commentary Engine
 * Template-based play-by-play with 4-tier emotional intensity,
 * variable length, vivid verbs, and anti-repetition cooldowns.
 */

// ============================================================
// VERB POOLS
// ============================================================
var PASS_VERBS = ['fires','threads','delivers','zips','floats','lasers','rifles','slings','lofts','darts','whips','tosses','flicks','guns','uncorks'];
var RUN_VERBS = ['bursts','cuts','rumbles','plows','darts','weaves','powers','churns','slashes','barrels','grinds','bounces','hits','drives','surges'];
var CATCH_VERBS = ['hauls in','snags','reels in','pulls down','secures','gathers','grabs','corrals','plucks'];
var TACKLE_VERBS = ['brings down','wraps up','drags down','meets','stonewalls','drops','levels','cuts down'];

// ============================================================
// MODIFIERS
// ============================================================
var ROUTE_MODS = ['cutting across the middle','on the slant','over the top','down the sideline','on the out route','in the flat','on the crossing route','up the seam','on a quick hitch','rolling right'];
var RUN_MODS = ['off left tackle','up the gut','around the edge','through the hole','behind the pulling guard','on the outside','between the tackles','on the counter','on the toss'];
var FIELD_MODS = function(yds) {
  if (yds <= 5) return 'deep in the red zone';
  if (yds <= 20) return 'inside the ' + yds;
  if (yds <= 50) return 'near midfield';
  return 'in their own territory';
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function coinFlip() { return Math.random() < 0.5; }

// ============================================================
// COOLDOWN TRACKER
// ============================================================
var _usedTemplates = {};
var _usedCount = 0;
function trackTemplate(key) {
  _usedTemplates[key] = (_usedTemplates[key] || 0) + 1;
  _usedCount++;
  // Reset every 30 snaps to allow reuse
  if (_usedCount > 30) { _usedTemplates = {}; _usedCount = 0; }
}
function isOnCooldown(key) { return (_usedTemplates[key] || 0) >= 2; }

// ============================================================
// MAIN COMMENTARY GENERATOR
// ============================================================

/**
 * Generate commentary for a snap result.
 * @param {object} res — snap result from executeSnap
 * @param {object} gameState — { down, distance, yardsToEndzone, half, ctScore, irScore, possession, playsUsed, twoMinActive }
 * @param {string} humanTeamName — human's team name for possession context
 * @param {string} oppTeamName
 * @returns {{ line1: string, line2: string|null }} — line1 = play description, line2 = context (may be null)
 */
export function generateCommentary(res, gameState, humanTeamName, oppTeamName) {
  var r = res.result;
  var off = res.featuredOff;
  var def = res.featuredDef;
  var offPlay = res.offPlay;
  var yards = r.yards || 0;
  var isPass = offPlay.type === 'pass';
  var isHumanOnOff = gameState.possession === 'CT';
  var possTeam = isHumanOnOff ? humanTeamName : oppTeamName;
  var defTeam = isHumanOnOff ? oppTeamName : humanTeamName;

  // Determine emotional tier
  var tier = 1;
  if (r.isTouchdown || r.isInterception || r.isFumbleLost) tier = 4;
  else if (r.isSack || yards >= 15 || gameState.down >= 3) tier = coinFlip() ? 3 : 2;
  else if (yards >= 8) tier = 2;
  // Close game boost
  if (gameState.half === 2 && Math.abs(gameState.ctScore - gameState.irScore) <= 7 && tier < 3) tier++;

  var line1 = '';
  var line2 = null;

  // ── TOUCHDOWN ──
  if (r.isTouchdown) {
    var tdKey = 'td_' + Math.floor(Math.random() * 8);
    if (isPass) {
      var templates = [
        'TOUCHDOWN ' + possTeam.toUpperCase() + '! ' + off.name + ' ' + pick(PASS_VERBS) + ' it to ' + (coinFlip() ? off.name : 'the end zone') + '!',
        possTeam.toUpperCase() + ' SCORES! ' + off.name + ' ' + pick(CATCH_VERBS) + ' it ' + pick(ROUTE_MODS) + ' — ' + yards + '-yard strike!',
        'HE\'S IN! ' + off.name + ' ' + pick(CATCH_VERBS) + ' the pass and walks into the end zone!',
        'TOUCHDOWN! ' + yards + ' yards through the air — ' + possTeam + ' strike first!',
      ];
      line1 = pick(templates);
    } else {
      var templates2 = [
        'TOUCHDOWN ' + possTeam.toUpperCase() + '! ' + off.name + ' ' + pick(RUN_VERBS) + ' in from ' + yards + ' yards out!',
        'HE\'S GONE! ' + off.name + ' ' + pick(RUN_VERBS) + ' ' + pick(RUN_MODS) + ' — TOUCHDOWN!',
        off.name + ' powers through for the score! ' + yards + '-yard ' + (yards > 10 ? 'burst' : 'push') + '!',
      ];
      line1 = pick(templates2);
    }
    line2 = possTeam + ' celebrates. The crowd erupts.';
    trackTemplate(tdKey);
    return { line1: line1, line2: line2 };
  }

  // ── SACK ──
  if (r.isSack) {
    var sackTemplates = [
      'SACK! ' + def.name + ' ' + pick(TACKLE_VERBS) + ' the QB for a loss of ' + Math.abs(yards) + '.',
      def.name + ' gets there! Dropped for a ' + Math.abs(yards) + '-yard loss.',
      'Nowhere to throw — ' + def.name + ' ' + pick(TACKLE_VERBS) + ' him behind the line.',
      'The pocket collapses. ' + def.name + ' brings the pressure and finishes it.',
    ];
    line1 = pick(sackTemplates);
    if (tier >= 3) line2 = 'That\'s a drive-killer. ' + defTeam + ' defense is swarming.';
    return { line1: line1, line2: line2 };
  }

  // ── INTERCEPTION ──
  if (r.isInterception) {
    var intTemplates = [
      'INTERCEPTED! ' + def.name + ' jumps the route and picks it off!',
      'PICKED! ' + def.name + ' reads it all the way — turnover ' + defTeam + '!',
      'That\'s a turnover! ' + def.name + ' was sitting on that route the whole time.',
      'Bad decision — ' + def.name + ' ' + pick(CATCH_VERBS) + ' it for the interception!',
    ];
    line1 = pick(intTemplates);
    line2 = defTeam + ' takes over. Momentum shift.';
    return { line1: line1, line2: line2 };
  }

  // ── FUMBLE ──
  if (r.isFumbleLost) {
    var fumTemplates = [
      'FUMBLE! ' + off.name + ' loses the ball — ' + defTeam + ' recovers!',
      'Stripped! ' + def.name + ' forces the fumble and ' + defTeam + ' has it!',
      'Ball is loose! ' + defTeam + ' jumps on it. Turnover.',
    ];
    line1 = pick(fumTemplates);
    line2 = 'That could be costly.';
    return { line1: line1, line2: line2 };
  }

  // ── INCOMPLETE ──
  if (r.isIncomplete) {
    // Pick variant based on matchup: strong defense counter = broken up, otherwise vary
    var covMods = offPlay.coverageMods || {};
    var defCov = res.defPlay ? res.defPlay.baseCoverage : '';
    var covResult = covMods[defCov] || {};
    var defWon = (covResult.mean || 0) <= -2;
    var incTemplates;
    if (defWon) {
      incTemplates = [
        'Incomplete — broken up by ' + def.name + '!',
        def.name + ' swats it away! Great coverage.',
        'Pass broken up! ' + def.name + ' was draped all over ' + off.name + '.',
        'No chance — ' + def.name + ' was step for step with ' + off.name + '.',
      ];
    } else {
      incTemplates = [
        'Incomplete — overthrown, intended for ' + off.name + '.',
        'Dropped by ' + off.name + '! Had it in his hands.',
        off.name + ' couldn\'t hang on. Ball hits the turf.',
        'Thrown away — nothing was open.',
        'Incomplete. ' + off.name + ' can\'t bring it in.',
      ];
    }
    line1 = pick(incTemplates);
    return { line1: line1, line2: line2 };
  }

  // ── POSITIVE GAIN ──
  if (yards > 0) {
    if (isPass) {
      if (tier <= 1) {
        line1 = off.name + ' ' + pick(CATCH_VERBS) + ' a ' + (yards <= 5 ? 'short' : 'nice') + ' pass for ' + yards + '.';
      } else if (tier === 2) {
        line1 = off.name + ' ' + pick(CATCH_VERBS) + ' it ' + pick(ROUTE_MODS) + ' for ' + yards + '!';
        if (res.gotFirstDown) line2 = 'First down ' + possTeam + '. Chains move.';
      } else {
        line1 = off.name + '! ' + pick(CATCH_VERBS) + ' it ' + pick(ROUTE_MODS) + ' — ' + yards + ' yards!';
        if (yards >= 20) line2 = 'Big chunk play! ' + possTeam + ' is moving.';
        else if (res.gotFirstDown) line2 = 'That moves the chains on a key down.';
      }
    } else {
      if (tier <= 1) {
        line1 = off.name + ' ' + pick(RUN_VERBS) + ' ' + pick(RUN_MODS) + ' for ' + yards + '.';
      } else if (tier === 2) {
        line1 = off.name + ' ' + pick(RUN_VERBS) + ' through for ' + yards + '!';
        if (res.gotFirstDown) line2 = 'First down! ' + possTeam + ' keeps it moving.';
      } else {
        line1 = off.name + '! ' + pick(RUN_VERBS) + ' ' + pick(RUN_MODS) + ' — picks up ' + yards + '!';
        if (yards >= 15) line2 = off.name + ' is running wild out there!';
      }
    }
    return { line1: line1, line2: line2 };
  }

  // ── NO GAIN / LOSS ──
  var stuffTemplates = [
    'Stuffed. ' + def.name + ' ' + pick(TACKLE_VERBS) + ' him at the line.',
    'No gain. ' + defTeam + ' defense holds firm.',
    off.name + ' is met immediately — nowhere to go.',
    'Stacked up. ' + def.name + ' plugs the gap.',
  ];
  line1 = pick(stuffTemplates);
  return { line1: line1, line2: line2 };
}

// ============================================================
// SITUATIONAL CONTEXT INJECTOR
// ============================================================

/**
 * Generate optional situational context line.
 * Returns null if no context trigger fires (~70% of snaps).
 */
export function generateContext(gameState, humanTeamName, oppTeamName, res) {
  var r = res ? res.result : null;
  var isHumanOff = gameState.possession === 'CT';
  var possTeam = isHumanOff ? humanTeamName : oppTeamName;
  var ydsToEz = gameState.yardsToEndzone;
  var scoreDiff = gameState.ctScore - gameState.irScore;

  // Only fire ~30% of the time for non-critical moments
  if (!r || (!r.isTouchdown && !r.isInterception && !r.isFumbleLost && Math.random() > 0.3)) return null;

  // Crossing midfield
  if (ydsToEz <= 50 && ydsToEz > 45 && r && r.yards > 0) {
    return possTeam + ' crosses midfield.';
  }
  // Red zone
  if (ydsToEz <= 20 && ydsToEz > 15) {
    return 'Inside the 20 — this is scoring range.';
  }
  // Two-minute warning
  if (gameState.twoMinActive && gameState.playsUsed <= 22) {
    return 'The clock is the enemy now.';
  }
  // Lead change (check if score just changed)
  if (r && r.isTouchdown) {
    if (scoreDiff > 0 && scoreDiff <= 7) return 'And just like that, they take the lead!';
    if (scoreDiff === 0) return 'We\'re all tied up!';
  }
  // Fourth down
  if (gameState.down === 4) {
    return 'Fourth down. They have to go for it.';
  }

  return null;
}
