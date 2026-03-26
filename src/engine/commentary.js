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
// Tackle verbs — used as "Name {verb}." (not "Name {verb} him" to avoid "wraps up him")
var TACKLE_VERBS = ['brings him down','wraps him up','drags him down','meets him at the line','stonewalls him','drops him','levels him','cuts him down'];

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
  var isPass = r.playType === 'pass';
  var isHumanOnOff = gameState.possession === 'CT';
  var possTeam = isHumanOnOff ? humanTeamName : oppTeamName;
  var defTeam = isHumanOnOff ? oppTeamName : humanTeamName;

  // Derive correct player roles — QB throws, receiver catches, runner runs
  var qbName = off.pos === 'QB' ? off.name : (off.name || 'the QB');
  var receiverName = off.pos !== 'QB' ? off.name : (def.name || 'the receiver'); // fallback
  var rusherName = off.pos !== 'QB' ? off.name : off.name; // QB can rush too

  // Determine emotional tier
  var tier = 1;
  if (r.isTouchdown || r.isInterception || r.isFumbleLost) tier = 4;
  else if (r.isSack || yards >= 15 || gameState.down >= 3) tier = coinFlip() ? 3 : 2;
  else if (yards >= 8) tier = 2;
  // Close game boost
  if (gameState.half === 2 && Math.abs(gameState.ctScore - gameState.irScore) <= 7 && tier < 3) tier++;

  var line1 = '';
  var line2 = null;

  // User-biased sentiment: good for user = energetic, bad for user = flat
  var isGoodForUser = isHumanOnOff
    ? (yards > 0 || r.isTouchdown) && !r.isInterception && !r.isFumbleLost && !r.isSack
    : (r.isSack || r.isInterception || r.isFumbleLost || r.isIncomplete || yards <= 0);
  var isBadForUser = !isGoodForUser;

  // ── TOUCHDOWN ──
  if (r.isTouchdown) {
    var tdKey = 'td_' + Math.floor(Math.random() * 8);
    if (isHumanOnOff) {
      // User scores — BIG energy
      if (isPass) {
        line1 = pick([
          'TOUCHDOWN ' + possTeam.toUpperCase() + '!! ' + off.name + ' ' + pick(PASS_VERBS) + ' a DIME — ' + yards + '-yard STRIKE!',
          'HE\'S IN!! ' + off.name + ' ' + pick(CATCH_VERBS) + ' it ' + pick(ROUTE_MODS) + ' — TOUCHDOWN!!',
          possTeam.toUpperCase() + ' SCORES!! ' + yards + ' yards through the air! WHAT A THROW!',
          'BALL GAME! ' + off.name + ' ' + pick(CATCH_VERBS) + ' it and walks in! TOUCHDOWN!',
        ]);
      } else {
        line1 = pick([
          'TOUCHDOWN ' + possTeam.toUpperCase() + '!! ' + off.name + ' ' + pick(RUN_VERBS) + ' in from ' + yards + ' out! UNSTOPPABLE!',
          'HE\'S GONE!! ' + off.name + ' ' + pick(RUN_VERBS) + ' ' + pick(RUN_MODS) + ' — NOBODY TOUCHES HIM!',
          off.name + ' punches it in! ' + yards + '-yard SCORE! ' + possTeam.toUpperCase() + '!',
        ]);
      }
      line2 = possTeam + ' celebrates! The crowd is on their feet!';
    } else {
      // Opponent scores against user — flat, factual
      if (isPass) {
        line1 = pick([
          possTeam + ' finds the end zone. ' + off.name + ', ' + yards + '-yard pass.',
          off.name + ' catches a ' + yards + '-yard touchdown for ' + possTeam + '.',
          'Score for ' + possTeam + '. ' + yards + ' yards.',
        ]);
      } else {
        line1 = pick([
          off.name + ' runs it in from ' + yards + ' out. ' + possTeam + ' scores.',
          possTeam + ' punches it in. ' + yards + '-yard run.',
        ]);
      }
      line2 = null; // No celebration for the opponent
    }
    trackTemplate(tdKey);
    return { line1: line1, line2: line2 };
  }

  // ── SACK ──
  if (r.isSack) {
    if (!isHumanOnOff) {
      // User's defense got the sack — celebrate!
      line1 = pick([
        'SACK!! ' + def.name + ' BURIES the QB' + (Math.abs(yards) > 0 ? ' for -' + Math.abs(yards) + '!' : '!'),
        def.name + ' GETS THERE!' + (Math.abs(yards) > 0 ? ' Dropped for a ' + Math.abs(yards) + '-yard loss!' : ' NO GAIN!'),
        'NOWHERE TO THROW! ' + def.name + ' ' + pick(TACKLE_VERBS) + '! HUGE play!',
        'The pocket COLLAPSES! ' + def.name + ' brings the HEAT!',
      ]);
      if (tier >= 3) line2 = 'Drive-killer! Your defense is SWARMING!';
    } else {
      // User's QB got sacked — flat
      line1 = pick([
        'Sacked. ' + def.name + ' gets through.' + (Math.abs(yards) > 0 ? ' Loss of ' + Math.abs(yards) + '.' : ''),
        def.name + ' brings the pressure.' + (Math.abs(yards) > 0 ? ' Down for -' + Math.abs(yards) + '.' : ' No gain.'),
      ]);
    }
    return { line1: line1, line2: line2 };
  }

  // ── INTERCEPTION ──
  if (r.isInterception) {
    if (!isHumanOnOff) {
      // User's defense gets the pick — celebrate!
      line1 = pick([
        'INTERCEPTED!! ' + def.name + ' JUMPS the route! WHAT A READ!',
        'PICKED OFF!! ' + def.name + ' was sitting on that ALL DAY!',
        'TURNOVER! ' + def.name + ' ' + pick(CATCH_VERBS) + ' it! ' + defTeam + ' ball!',
        'BAD DECISION! ' + def.name + ' makes them PAY! PICKED!',
      ]);
      line2 = defTeam + ' takes over! Momentum is YOURS!';
    } else {
      // User threw a pick — flat, move on
      line1 = pick([
        'Intercepted. ' + def.name + ' picks it off.',
        'Turnover. ' + def.name + ' reads the throw.',
        'Bad throw. ' + def.name + ' comes away with it.',
      ]);
      line2 = defTeam + ' takes over.';
    }
    return { line1: line1, line2: line2 };
  }

  // ── FUMBLE ──
  if (r.isFumbleLost) {
    if (!isHumanOnOff) {
      // User's defense forces fumble — celebrate!
      line1 = pick([
        'FUMBLE!! ' + def.name + ' STRIPS the ball! ' + defTeam + ' RECOVERS!',
        'STRIPPED! ' + def.name + ' forces it loose! TURNOVER!',
        'BALL\'S OUT! ' + defTeam + ' jumps on it! HUGE play by ' + def.name + '!',
      ]);
      line2 = 'Your defense creates the turnover!';
    } else {
      // User fumbled — flat
      line1 = pick([
        'Fumble. ' + off.name + ' loses the ball. ' + defTeam + ' recovers.',
        'Ball comes loose. ' + defTeam + ' has it.',
      ]);
      line2 = null;
    }
    return { line1: line1, line2: line2 };
  }

  // ── INCOMPLETE ──
  if (r.isIncomplete) {
    var covMods = offPlay.coverageMods || {};
    var defCov = res.defPlay ? res.defPlay.baseCoverage : '';
    var covResult = covMods[defCov] || {};
    var defWon = (covResult.mean || 0) <= -2;
    if (!isHumanOnOff) {
      // User's defense forces incomplete — positive
      line1 = pick([
        'Incomplete! ' + def.name + ' breaks it up! Great coverage!',
        def.name + ' swats it away! Nothing doing for ' + possTeam + '.',
        'Pass broken up! ' + def.name + ' was ALL OVER ' + off.name + '.',
        'Thrown away. Your defense had everyone covered.',
      ]);
    } else {
      // User's pass is incomplete — flat
      if (defWon) {
        line1 = pick([
          'Incomplete. ' + def.name + ' breaks it up.',
          'Pass broken up by ' + def.name + '.',
        ]);
      } else {
        line1 = pick([
          'Incomplete. Overthrown, intended for ' + receiverName + '.',
          'Dropped by ' + receiverName + '.',
          receiverName + ' can\'t bring it in.',
          'Thrown away. Nothing was open.',
        ]);
      }
    }
    return { line1: line1, line2: line2 };
  }

  // ── POSITIVE GAIN ──
  // Commentary describes the PLAY, not the yards (the floating number shows yards)
  if (yards > 0) {
    var tackler = def ? def.name : '';
    var tackleTag = tackler ? ' ' + tackler + ' makes the stop.' : '';
    if (isHumanOnOff) {
      if (isPass) {
        if (tier <= 1) {
          line1 = receiverName + ' ' + pick(CATCH_VERBS) + ' a ' + (yards <= 5 ? 'short' : 'nice') + ' pass ' + pick(ROUTE_MODS) + '.' + tackleTag;
        } else if (tier === 2) {
          line1 = receiverName + ' ' + pick(CATCH_VERBS) + ' it ' + pick(ROUTE_MODS) + '!' + tackleTag;
          if (res.gotFirstDown) line2 = 'FIRST DOWN ' + possTeam + '! Chains move!';
        } else {
          line1 = receiverName + '! ' + pick(CATCH_VERBS) + ' it ' + pick(ROUTE_MODS) + '! WIDE OPEN!';
          if (yards >= 20) line2 = 'BIG chunk play! ' + possTeam + ' is ROLLING!';
          else if (res.gotFirstDown) line2 = 'Moves the chains on a KEY down!';
        }
      } else {
        if (tier <= 1) {
          line1 = rusherName + ' ' + pick(RUN_VERBS) + ' ' + pick(RUN_MODS) + '.' + tackleTag;
        } else if (tier === 2) {
          line1 = rusherName + ' ' + pick(RUN_VERBS) + ' through ' + pick(RUN_MODS) + '!' + tackleTag;
          if (res.gotFirstDown) line2 = 'FIRST DOWN! ' + possTeam + ' keeps it moving!';
        } else {
          line1 = rusherName + '! ' + pick(RUN_VERBS) + ' ' + pick(RUN_MODS) + '! HE\'S LOOSE!';
          if (yards >= 15) line2 = rusherName + ' is RUNNING WILD out there!';
        }
      }
    } else {
      // Opponent gains against user — flat, no yards in text
      if (isPass) {
        line1 = receiverName + ' catches it ' + pick(ROUTE_MODS) + '.' + tackleTag;
        if (res.gotFirstDown) line2 = 'First down ' + possTeam + '.';
      } else {
        line1 = rusherName + ' ' + pick(['finds a gap.','pushes ahead.','hits the hole.']) + tackleTag;
        if (res.gotFirstDown) line2 = 'First down ' + possTeam + '.';
      }
    }
    return { line1: line1, line2: line2 };
  }

  // ── NO GAIN / LOSS ──
  if (!isHumanOnOff) {
    line1 = pick([
      'STUFFED! ' + def.name + ' meets him at the line!',
      'NO GAIN! ' + defTeam + ' defense holds FIRM!',
      'STACKED UP! ' + def.name + ' plugs the gap!',
      'Going NOWHERE! ' + def.name + ' reads it perfectly!',
    ]);
  } else {
    line1 = pick([
      'Stuffed. ' + def.name + ' meets him at the line.',
      'No gain. Defense holds.',
      rusherName + ' is met at the line of scrimmage.',
    ]);
  }
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

  // User-biased context
  if (isHumanOff) {
    // User on offense
    if (ydsToEz <= 50 && ydsToEz > 45 && r && r.yards > 0) return possTeam + ' crosses midfield! Building momentum!';
    if (ydsToEz <= 20 && ydsToEz > 15) return 'Inside the 20 — this is YOUR territory!';
    if (r && r.isTouchdown && scoreDiff > 0 && scoreDiff <= 7) return 'YOU take the lead!';
    if (r && r.isTouchdown && scoreDiff === 0) return 'All tied up!';
    if (gameState.down === 4) return 'Fourth down. You have to go for it.';
  } else {
    // User on defense
    if (ydsToEz <= 50 && ydsToEz > 45 && r && r.yards > 0) return possTeam + ' crosses midfield.';
    if (ydsToEz <= 20 && ydsToEz > 15) return 'They\'re inside the 20. Bend, don\'t break.';
    if (r && r.isTouchdown && scoreDiff < 0 && scoreDiff >= -7) return possTeam + ' takes the lead.';
    if (r && r.isTouchdown && scoreDiff === 0) return 'Tied up.';
    if (r && (r.isInterception || r.isFumbleLost)) return 'TURNOVER! You get the ball back!';
    if (r && r.isSack && gameState.down >= 3) return 'Huge stop! They\'re going backwards!';
    if (gameState.down === 4) return 'Fourth down. Make the stop!';
  }

  if (gameState.twoMinActive && gameState.playsUsed <= 22) {
    return 'The clock is the enemy now.';
  }

  return null;
}
