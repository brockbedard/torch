/**
 * TORCH v0.26 — Commentary Engine
 * Template-based play-by-play with 4-tier emotional intensity,
 * variable length, vivid verbs, and anti-repetition cooldowns.
 *
 * PERSONNEL SYSTEM TEMPLATE VARIABLES (available via res.featuredOff / res.featuredDef):
 *   offPlayerName:  res.featuredOff.name     — e.g. 'Martinez'
 *   offPlayerTrait: res.featuredOff.trait     — e.g. 'BURNER'
 *   offPlayerPos:   res.featuredOff.pos       — e.g. 'WR'
 *   defPlayerName:  res.featuredDef.name      — e.g. 'Jackson'
 *   defPlayerTrait: res.featuredDef.trait      — e.g. 'SHUTDOWN'
 *   defPlayerPos:   res.featuredDef.pos        — e.g. 'CB'
 *
 * THREE COMMENTARY MODES (Phase B will wire the selection logic):
 *
 * Mode 1 — Direct matchup (both positions interact on the play):
 *   "Martinez blazes past Jackson for 18! The speed was too much."
 *   "Jackson stays in Martinez's hip pocket. Pass broken up."
 *
 * Mode 2 — One player relevant (the other isn't):
 *   "Davis holds his block but nobody's rushing. Carter finds the TE for 11."
 *   "Collins gets pressure off the edge but Carter gets the throw off."
 *
 * Mode 3 — Neither relevant (both low-relevance positions):
 *   "Carter drops back, clean pocket, throws deep. Coverage is there."
 *   "Handoff up the middle. Modest gain of 3."
 *
 * Bad pick commentary (teaching through results):
 *   "Henderson finds a lane for 8. Carter just watched from the pocket."
 *   "Davis holds his block, but nobody tested him."
 */

// ============================================================
// TRAIT FLAVOR ADJECTIVES
// ============================================================
var TRAIT_FLAVOR = {
  'TRUCK STICK':       ['powerful', 'punishing'],
  'BURNER':            ['blazing', 'lightning-fast'],
  'DEEP BALL':         ['cannon-armed', 'strong-armed'],
  'SHUTDOWN':          ['lockdown', 'smothering'],
  'BALL HAWK':         ['ball-hawking', 'instinctive'],
  'ELUSIVE':           ['shifty', 'elusive'],
  'ROUTE IQ':          ['route-savvy', 'precise'],
  'PASS RUSHER':       ['relentless', 'ferocious'],
  'ENFORCER':          ['hard-hitting', 'punishing'],
  'YAC BEAST':         ['explosive', 'tackle-breaking'],
  'QUICK RELEASE':     ['quick-trigger', 'rapid-fire'],
  'CONTESTED CATCH':   ['sure-handed', 'fearless'],
  'BLITZ SPECIALIST':  ['aggressive', 'blitzing'],
  'COVERAGE LB':       ['rangy', 'athletic'],
};

function traitFlavor(player) {
  if (!player || !player.trait) return '';
  var flavors = TRAIT_FLAVOR[player.trait];
  if (!flavors) return '';
  return flavors[Math.floor(Math.random() * flavors.length)];
}

// ============================================================
// VERB POOLS
// ============================================================
var PASS_VERBS = ['fires','threads','delivers','zips','floats','lasers','rifles','slings','lofts','darts','whips','tosses','flicks','guns','uncorks'];
var RUN_VERBS = ['bursts','cuts','rumbles','plows','darts','weaves','powers','churns','slashes','barrels','grinds','bounces','hits','drives','surges'];
// CATCH_VERBS — used as "Name {verb} it" (verb must work before "it")
var CATCH_VERBS = ['snags','secures','gathers','grabs','corrals','plucks','catches'];
// CATCH_VERBS_STANDALONE — used without "it" (verb is complete on its own)
var CATCH_VERBS_SOLO = ['hauls it in','reels it in','pulls it down','snags it','grabs it','corrals it'];
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
// Sanitize commentary: fix double periods, stray periods before lowercase, double spaces
function sanitize(s) {
  if (!s) return s;
  return s.replace(/\.\./g, '.').replace(/\. ([a-z])/g, ' $1').replace(/  +/g, ' ').trim();
}

// ============================================================
// GAME NARRATIVE TRACKING (resets per game via resetNarrative)
// ============================================================
var _narrative = {
  playerTouches: {},    // { playerId: { name, yards, tds, goodPlays } }
  bigMoments: [],       // ['comeback', 'shutout_threat', 'blowout']
  lastTurnover: null,   // { team, type, snapNum }
  snapCount: 0,
  scoreDiffAtHalf: 0,
};

export function resetNarrative() {
  _narrative = { playerTouches: {}, bigMoments: [], lastTurnover: null, snapCount: 0, scoreDiffAtHalf: 0 };
}

export function setHalftimeScore(diff) { _narrative.scoreDiffAtHalf = diff; }

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
  // Use pre-snap possession if provided (post-snap possession may have flipped on turnovers)
  var preSnapPoss = gameState.preSnapPossession || gameState.possession;
  var isHumanOnOff = preSnapPoss === 'CT';
  var possTeam = isHumanOnOff ? humanTeamName : oppTeamName;
  var defTeam = isHumanOnOff ? oppTeamName : humanTeamName;

  // Update narrative state
  _narrative.snapCount++;
  var offId = off ? off.id : null;
  if (offId) {
    if (!_narrative.playerTouches[offId]) _narrative.playerTouches[offId] = { name: off.name, yards: 0, tds: 0, goodPlays: 0 };
    var pt = _narrative.playerTouches[offId];
    pt.yards += yards;
    if (r.isTouchdown) pt.tds++;
    if (yards >= 5) pt.goodPlays++;
  }

  // Null safety: derive positional fallbacks before any name is used
  if (!off) off = { name: null, pos: 'QB' };
  if (!def) def = { name: null, pos: 'LB' };
  // OL/DL should never be featured — if they slip through, use generic names
  var _offIsLineman = off.pos === 'OL' || off.pos === 'DL';
  var _defIsLineman = def.pos === 'OL' || def.pos === 'DL';
  // QB always throws — use roster QB name, not featured player
  var qbName = res._qbName || (off.pos === 'QB' ? qbName : 'the QB');
  // Receiver is the featured non-QB skill player on pass plays
  var receiverName = res._receiverName || (_offIsLineman ? 'the receiver' : (off.pos !== 'QB' ? (off.name || 'the receiver') : 'the receiver'));
  // Rusher is the featured skill player on run plays
  var rusherName = res._rusherName || (_offIsLineman ? 'the runner' : (off.pos !== 'QB' ? (off.name || 'the runner') : 'the runner'));
  var defName = _defIsLineman ? 'the defense' : (def.name || 'the defense');
  var defLineman = def.name || 'the pass rusher';

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
    // NOTE: isOnCooldown() is not yet checked — pool randomness handles anti-repetition
    var tdKey = isHumanOnOff ? (isPass ? 'td_pass' : 'td_run') : 'td_opp';
    if (isHumanOnOff) {
      // User scores — BIG energy
      var isPositionMatchupTD = off && def && (
        (off.pos === 'WR' && def.pos === 'CB') ||
        (off.pos === 'RB' && def.pos === 'LB') ||
        (off.pos === 'TE' && def.pos === 'S')
      );
      if (isPass) {
        var tdPassPool = [
          'TOUCHDOWN ' + possTeam.toUpperCase() + '!! ' + qbName + ' ' + pick(PASS_VERBS) + ' a DIME — ' + yards + '-yard STRIKE!',
          'HE\'S IN!! ' + receiverName + ' ' + pick(CATCH_VERBS_SOLO) + ' ' + pick(ROUTE_MODS) + ' — TOUCHDOWN!!',
          possTeam.toUpperCase() + ' SCORE!! ' + yards + ' yards through the air! WHAT A THROW!',
          'BALL GAME! ' + receiverName + ' ' + pick(CATCH_VERBS_SOLO) + ' and walks in! TOUCHDOWN!',
          'TOUCHDOWN!! ' + receiverName + ' was wide open and ' + qbName + ' FOUND HIM! ' + yards + ' yards!',
          possTeam.toUpperCase() + ' IN THE END ZONE! ' + yards + '-yard strike! NOTHING THEY COULD DO!',
        ];
        if (traitFlavor(off)) {
          tdPassPool.push('The ' + traitFlavor(off) + ' ' + receiverName + ' finds the end zone! TOUCHDOWN!');
          tdPassPool.push(receiverName + ' uses that ' + (off.trait || 'talent') + ' to score! TOUCHDOWN ' + possTeam.toUpperCase() + '!');
        }
        if (isPositionMatchupTD) {
          tdPassPool.push(receiverName + ' wins the battle against ' + defName + '! TOUCHDOWN!!');
          tdPassPool.push(defName + ' had no answer for ' + receiverName + '\'s ' + (off.trait || 'speed') + '. SIX!');
          tdPassPool.push(receiverName + ' vs ' + defName + ' — and ' + receiverName + ' WINS! TOUCHDOWN!!');
        }
        line1 = pick(tdPassPool);
      } else {
        var tdRunPool = [
          'TOUCHDOWN ' + possTeam.toUpperCase() + '!! ' + rusherName + ' ' + pick(RUN_VERBS) + ' in from ' + yards + ' out! UNSTOPPABLE!',
          'HE\'S GONE!! ' + rusherName + ' ' + pick(RUN_VERBS) + ' ' + pick(RUN_MODS) + ' — NOBODY TOUCHES HIM!',
          rusherName + ' punches it in! ' + yards + '-yard SCORE! ' + possTeam.toUpperCase() + '!',
          'BULLDOZED IN! ' + rusherName + ' would not be denied! TOUCHDOWN!!',
          possTeam.toUpperCase() + ' POUNDS IT IN! ' + rusherName + ' from ' + yards + ' out! SIX!!',
        ];
        if (traitFlavor(off)) {
          tdRunPool.push('The ' + traitFlavor(off) + ' ' + rusherName + ' crashes in! TOUCHDOWN!');
          tdRunPool.push(rusherName + ' uses that ' + (off.trait || 'talent') + ' to score! TOUCHDOWN ' + possTeam.toUpperCase() + '!');
        }
        if (isPositionMatchupTD) {
          tdRunPool.push(rusherName + ' wins the battle against ' + defName + '! TOUCHDOWN!!');
          tdRunPool.push(defName + ' had no answer for ' + rusherName + '\'s ' + (off.trait || 'power') + '. SIX!');
          tdRunPool.push(rusherName + ' vs ' + defName + ' — and ' + rusherName + ' WINS! TOUCHDOWN!!');
        }
        line1 = pick(tdRunPool);
      }
      // Narrative: multi-TD override takes priority over default celebrate line
      if (offId && _narrative.playerTouches[offId] && _narrative.playerTouches[offId].tds >= 2) {
        var ptTd = _narrative.playerTouches[offId];
        line2 = ptTd.name + ' with TD #' + ptTd.tds + '! ' + (ptTd.tds >= 3 ? 'HAT TRICK! THIS KID IS UNSTOPPABLE!' : 'Keeps finding the end zone!');
      } else {
        // Narrative: comeback — only fire if down 8+ at half and now scoring
        var scoreDiffNow = gameState.ctScore - gameState.irScore;
        if (_narrative.scoreDiffAtHalf <= -8 && scoreDiffNow >= 0) {
          line2 = 'FROM ' + Math.abs(_narrative.scoreDiffAtHalf) + ' DOWN AT THE HALF! ' + possTeam.toUpperCase() + ' COMPLETES THE COMEBACK!!';
        } else if (_narrative.scoreDiffAtHalf <= -8 && scoreDiffNow > _narrative.scoreDiffAtHalf) {
          line2 = 'They were down ' + Math.abs(_narrative.scoreDiffAtHalf) + ' at halftime. This fight isn\'t over.';
        } else {
          line2 = 'The ' + possTeam + ' celebrate! The crowd is on their feet!';
        }
      }
    } else {
      // Opponent scores against user — flat, factual
      if (isPass) {
        line1 = pick([
          'The ' + possTeam + ' find the end zone. ' + receiverName + ', ' + yards + '-yard pass.',
          receiverName + ' catches a ' + yards + '-yard touchdown for the ' + possTeam + '.',
          'Score for the ' + possTeam + '. ' + yards + ' yards.',
          'Touchdown pass. ' + yards + ' yards. The ' + possTeam + ' score.',
        ]);
      } else {
        line1 = pick([
          rusherName + ' runs it in from ' + yards + ' out. The ' + possTeam + ' score.',
          'The ' + possTeam + ' punch it in. ' + yards + '-yard run.',
          'Into the end zone. ' + yards + '-yard carry. Touchdown.',
        ]);
      }
      line2 = null; // No celebration for the opponent
    }
    trackTemplate(tdKey);
    return { line1: sanitize(line1), line2: sanitize(line2) };
  }

  // ── SACK ──
  if (r.isSack) {
    var isPositionMatchupSack = off && def && off.pos === 'QB' && (def.pos === 'DE' || def.pos === 'LB' || def.pos === 'DT');
    if (!isHumanOnOff) {
      // User's defense got the sack — celebrate!
      var sackPool = [
        'SACK!! ' + defName + ' BURIES the QB' + (Math.abs(yards) > 0 ? ' for a loss of ' + Math.abs(yards) + '!' : '!'),
        defName + ' GETS THERE!' + (Math.abs(yards) > 0 ? ' Dropped for a ' + Math.abs(yards) + '-yard loss!' : ' NO GAIN!'),
        'NOWHERE TO THROW! ' + defName + ' ' + pick(TACKLE_VERBS) + '! HUGE play!',
        'The pocket COLLAPSES! ' + defName + ' brings the HEAT!',
        'GOT HIM! ' + defName + ' through the line — SACK!' + (Math.abs(yards) > 0 ? ' Loss of ' + Math.abs(yards) + '!' : ''),
        'OFF SCHEDULE! ' + defName + ' gets to the QB and TAKES HIM DOWN!',
        'FREE RUNNER! ' + defName + ' unblocked — SACK!! ' + (Math.abs(yards) > 0 ? Math.abs(yards) + '-yard loss!' : ''),
      ];
      if (traitFlavor(def)) {
        sackPool.push('The ' + traitFlavor(def) + ' ' + defName + ' gets home! SACK!');
        sackPool.push(defName + '\'s ' + (def.trait || 'relentless pressure') + ' pays off! SACKED!!');
      }
      if (isPositionMatchupSack) {
        sackPool.push(defName + ' wins the rep — straight through the blocker! SACK!');
        sackPool.push('The QB never had a chance. ' + defName + ' was ALREADY THERE!');
        sackPool.push(defName + ' owned that matchup start to finish. SACK!!');
      }
      line1 = pick(sackPool);
      if (tier >= 3) line2 = 'Drive-killer! Your defense is SWARMING!';
      // Shutout narrative
      if (!line2 && gameState.irScore === 0 && _narrative.snapCount >= 20) {
        line2 = 'The shutout is still alive. Opponent has been held scoreless all game.';
      }
    } else {
      // User's QB got sacked — flat
      line1 = pick([
        'Sacked. ' + defName + ' gets through.' + (Math.abs(yards) > 0 ? ' Loss of ' + Math.abs(yards) + '.' : ''),
        defName + ' brings the pressure.' + (Math.abs(yards) > 0 ? ' Loss of ' + Math.abs(yards) + '.' : ' No gain.'),
        'Pressure gets home. Sacked.' + (Math.abs(yards) > 0 ? ' Loss of ' + Math.abs(yards) + '.' : ''),
        defName + ' beats the block.' + (Math.abs(yards) > 0 ? ' Down for a loss of ' + Math.abs(yards) + '.' : ' No gain.'),
      ]);
    }
    return { line1: sanitize(line1), line2: sanitize(line2) };
  }

  // ── INTERCEPTION ──
  if (r.isInterception) {
    var isPositionMatchupINT = off && def && (
      (off.pos === 'WR' && def.pos === 'CB') ||
      (off.pos === 'TE' && def.pos === 'S') ||
      (def.pos === 'LB' || def.pos === 'S' || def.pos === 'CB')
    );
    if (!isHumanOnOff) {
      // User's defense gets the pick — celebrate!
      var intPool = [
        'INTERCEPTED!! ' + defName + ' JUMPS the route! WHAT A READ!',
        'PICKED OFF!! ' + defName + ' was sitting on that ALL DAY!',
        'TURNOVER! ' + defName + ' ' + pick(CATCH_VERBS_SOLO) + '! ' + defTeam + ' ball!',
      // Note: defTeam here is correct without "the" — used as possessive ("Boars ball")
        'BAD DECISION! ' + defName + ' makes them PAY! PICKED!',
        'RIGHT PLACE, RIGHT TIME! ' + defName + ' STEPS IN FRONT! INTERCEPTION!',
        defName + ' reads it perfectly! PICKED OFF! What a play!',
        'GIFT WRAPPED! ' + defName + ' takes it away! TURNOVER!!',
      ];
      if (traitFlavor(def)) {
        intPool.push('The ' + traitFlavor(def) + ' ' + defName + ' steps in front! INTERCEPTED!');
        intPool.push(defName + ' with the ' + (def.trait || 'instincts') + ' pick! INTERCEPTED!');
      }
      if (isPositionMatchupINT && off && off.name) {
        intPool.push(defName + ' takes it right away from ' + receiverName + '! INTERCEPTION!');
        intPool.push('Threw it right to ' + defName + '. ' + receiverName + ' never had a chance. PICKED!');
        intPool.push(defName + ' owned that route. ' + defTeam.toUpperCase() + ' BALL!');
      }
      line1 = pick(intPool);
      line2 = 'The ' + defTeam + ' take over! Momentum is YOURS!';
    } else {
      // User threw a pick — flat, move on
      line1 = pick([
        'Intercepted. ' + defName + ' picks it off.',
        'Turnover. ' + defName + ' reads the throw.',
        'Bad throw. ' + defName + ' comes away with it.',
        defName + ' undercuts the route. Interception.',
        'Into coverage. ' + defName + ' has it.',
      ]);
      line2 = 'The ' + defTeam + ' take over.';
    }
    return { line1: sanitize(line1), line2: sanitize(line2) };
  }

  // ── FUMBLE ──
  if (r.isFumbleLost) {
    if (!isHumanOnOff) {
      // User's defense forces fumble — celebrate!
      line1 = pick([
        'FUMBLE!! ' + defName + ' STRIPS the ball! ' + defTeam + ' RECOVERS!',
        'STRIPPED! ' + defName + ' forces it loose! TURNOVER!',
        'BALL\'S OUT! ' + defTeam + ' jump on it! HUGE play by ' + defName + '!',
      ]);
      line2 = 'Your defense creates the turnover!';
    } else {
      // User fumbled — flat
      line1 = pick([
        'Fumble. ' + (isPass ? receiverName : rusherName) + ' loses the ball. ' + defTeam + ' recovers.',
        'Ball comes loose. ' + defTeam + ' have it.',
      ]);
      line2 = null;
    }
    return { line1: sanitize(line1), line2: sanitize(line2) };
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
        'Incomplete! ' + defName + ' breaks it up! Great coverage!',
        defName + ' swats it away! Nothing doing for the ' + possTeam + '.',
        'Pass broken up! ' + defName + ' was ALL OVER ' + receiverName + '.',
        'Thrown away. Your defense had everyone covered.',
        'NOWHERE TO GO! ' + defName + ' locks it down! Incomplete!',
        defName + ' right there in coverage. Pass falls incomplete.',
        'Good defense! ' + defName + ' takes away the throw. Incomplete!',
      ]);
    } else {
      // User's pass is incomplete — flat
      if (defWon) {
        line1 = pick([
          'Incomplete. ' + defName + ' breaks it up.',
          'Pass broken up by ' + defName + '.',
          defName + ' with tight coverage. Falls incomplete.',
          'Nowhere to throw. ' + defName + ' takes it away.',
        ]);
      } else {
        line1 = pick([
          'Incomplete. Overthrown, intended for ' + receiverName + '.',
          'Dropped by ' + receiverName + '.',
          receiverName + ' can\'t bring it in.',
          'Thrown away. Nothing was open.',
          'Off target. Intended for ' + receiverName + '.',
          receiverName + ' and the QB out of sync.',
        ]);
      }
    }
    return { line1: sanitize(line1), line2: sanitize(line2) };
  }

  // ── 4TH DOWN STOPS (turnover on downs) ──
  if (r.isTurnoverOnDowns) {
    if (!isHumanOnOff) {
      // User's defense stops opponent on 4th — big moment
      line1 = pick([
        'TURNOVER ON DOWNS!! Your defense holds! ' + possTeam + ' come up SHORT!',
        'STOPS THEM ON FOURTH! ' + defName + ' MAKES THE PLAY! TURNOVER ON DOWNS!',
        'FOURTH DOWN STOP!! ' + defTeam.toUpperCase() + ' DEFENSE HOLDS! YOU GET THE BALL!',
        'THEY CAME UP SHORT! Your defense just SLAMMED THE DOOR!',
        'TURNOVER ON DOWNS! ' + defName + ' — WHAT A STOP!',
      ]);
      line2 = 'Your ball. That stop changes everything!';
    } else {
      // User fails on 4th down — flat
      line1 = pick([
        'Turnover on downs. The ' + defTeam + ' holds.',
        'Comes up short on fourth. ' + defTeam + ' take over.',
        'Short of the marker. Turnover on downs.',
        'Fourth down stop by the ' + defTeam + '. Their ball.',
      ]);
      line2 = null;
    }
    return { line1: sanitize(line1), line2: sanitize(line2) };
  }

  // ── POSITIVE GAIN ──
  // Commentary describes the PLAY, not the yards (the floating number shows yards)
  if (yards > 0) {
    var tackler = def ? defName : '';
    var tackleTag = tackler ? ' ' + tackler + ' makes the stop.' : '';
    var isPositionMatchupGain = off && def && (
      (off.pos === 'WR' && def.pos === 'CB') ||
      (off.pos === 'RB' && def.pos === 'LB') ||
      (off.pos === 'TE' && def.pos === 'S')
    );
    if (isHumanOnOff) {
      if (isPass) {
        if (tier <= 1) {
          line1 = pick([
            receiverName + ' ' + pick(CATCH_VERBS) + ' a ' + (yards <= 5 ? 'short' : 'nice') + ' pass ' + pick(ROUTE_MODS) + '.' + tackleTag,
            qbName + ' ' + pick(PASS_VERBS) + ' it to ' + receiverName + ' ' + pick(ROUTE_MODS) + '.' + tackleTag,
            'Quick throw to ' + receiverName + '. ' + pick(CATCH_VERBS_SOLO) + ' cleanly.' + tackleTag,
          ]);
        } else if (tier === 2) {
          var t2PassPool = [
            receiverName + ' ' + pick(CATCH_VERBS) + ' it ' + pick(ROUTE_MODS) + '!' + tackleTag,
            qbName + ' ' + pick(PASS_VERBS) + ' to ' + receiverName + ' — caught!' + tackleTag,
            'Good throw, good catch. ' + receiverName + ' with the reception ' + pick(ROUTE_MODS) + '.' + tackleTag,
          ];
          if (traitFlavor(off)) t2PassPool.push('That ' + traitFlavor(off) + ' route from ' + receiverName + ' creates the opening!' + tackleTag);
          if (isPositionMatchupGain) t2PassPool.push(receiverName + ' wins the route against ' + defName + '!' + tackleTag);
          line1 = pick(t2PassPool);
          if (res.gotFirstDown) line2 = 'FIRST DOWN! The ' + possTeam + ' move the chains!';
        } else {
          var t3PassPool = [
            receiverName + ' ' + pick(CATCH_VERBS_SOLO) + ' ' + pick(ROUTE_MODS) + '! WIDE OPEN!',
            qbName + ' FINDS ' + receiverName + '! BIG CATCH ' + pick(ROUTE_MODS) + '!',
            'BEAUTIFUL BALL! ' + receiverName + ' ' + pick(CATCH_VERBS_SOLO) + '! Nobody near him!',
          ];
          if (traitFlavor(off)) t3PassPool.push(receiverName + '\'s ' + (off.trait || 'speed') + ' creates SEPARATION! ' + yards + '-yard gain!');
          if (isPositionMatchupGain) {
            t3PassPool.push(receiverName + ' torches ' + defName + '! NOTHING they could do!');
            t3PassPool.push(defName + ' had no answer for ' + receiverName + '. BIG gain!');
          }
          line1 = pick(t3PassPool);
          if (yards >= 20) line2 = 'BIG chunk play! The ' + possTeam + ' are ROLLING!';
          else if (res.gotFirstDown) line2 = 'Moves the chains on a KEY down!';
        }
      } else {
        if (tier <= 1) {
          line1 = pick([
            rusherName + ' ' + pick(RUN_VERBS) + ' ' + pick(RUN_MODS) + '.' + tackleTag,
            'Handoff to ' + rusherName + '. Picks up yards ' + pick(RUN_MODS) + '.' + tackleTag,
          ]);
        } else if (tier === 2) {
          var t2RunPool = [
            rusherName + ' ' + pick(RUN_VERBS) + ' through ' + pick(RUN_MODS) + '!' + tackleTag,
            rusherName + ' finds daylight ' + pick(RUN_MODS) + '!' + tackleTag,
            'Nice run! ' + rusherName + ' ' + pick(RUN_VERBS) + ' for the gain.' + tackleTag,
          ];
          if (traitFlavor(off)) t2RunPool.push(rusherName + '\'s ' + (off.trait || 'physicality') + ' shows up on this carry!' + tackleTag);
          if (isPositionMatchupGain) t2RunPool.push(rusherName + ' wins the matchup against ' + defName + '!' + tackleTag);
          line1 = pick(t2RunPool);
          if (res.gotFirstDown) line2 = 'FIRST DOWN! The ' + possTeam + ' keep it moving!';
        } else {
          var t3RunPool = [
            rusherName + ' ' + pick(RUN_VERBS) + ' through a crease ' + pick(RUN_MODS) + '! HE\'S LOOSE!',
            rusherName + ' BREAKS FREE! Nobody is going to catch him!',
            'EXPLOSIVE RUN! ' + rusherName + ' ' + pick(RUN_VERBS) + ' for a HUGE gain!',
          ];
          if (traitFlavor(off)) t3RunPool.push(rusherName + '\'s ' + (off.trait || 'explosiveness') + ' on full display! GONE for ' + yards + '!');
          if (isPositionMatchupGain) {
            t3RunPool.push(rusherName + ' runs RIGHT THROUGH ' + defName + '! Nobody bringing him down!');
            t3RunPool.push(defName + ' had no answer for ' + rusherName + '. BIG run!');
          }
          line1 = pick(t3RunPool);
          if (yards >= 15) line2 = rusherName + ' is RUNNING WILD out there!';
        }
      }
    } else {
      // Opponent gains against user — flat, no yards in text
      if (isPass) {
        line1 = pick([
          receiverName + ' catches it ' + pick(ROUTE_MODS) + '.' + tackleTag,
          'Short completion for the ' + possTeam + '.' + tackleTag,
          'Pass caught ' + pick(ROUTE_MODS) + '.' + tackleTag,
        ]);
        if (res.gotFirstDown) line2 = 'First down for the ' + possTeam + '.';
      } else {
        line1 = pick([
          rusherName + ' ' + pick(['finds a gap','pushes ahead','hits the hole']) + '.' + tackleTag,
          'Run play. The ' + possTeam + ' pick up yards.' + tackleTag,
          'Handoff. Gains ground.' + tackleTag,
        ]);
        if (res.gotFirstDown) line2 = 'First down for the ' + possTeam + '.';
      }
    }

    // Narrative overrides for positive gains (user offense only, don't override existing line2 on non-user plays)
    if (isHumanOnOff && offId && _narrative.playerTouches[offId]) {
      var ptGain = _narrative.playerTouches[offId];
      // Hot player — 3+ good plays and this one qualifies
      if (ptGain.goodPlays >= 3 && yards >= 5 && !line2) {
        line2 = pick([
          ptGain.name + ' is having a DAY. ' + ptGain.goodPlays + ' big plays and counting.',
          ptGain.name + ' can\'t be stopped right now. ' + ptGain.yards + ' total yards this game.',
          'The ' + ptGain.name + ' show continues. ' + ptGain.goodPlays + ' impact plays.',
          ptGain.name + ' is in a zone. Nobody can touch ' + (off.pos === 'RB' ? 'him' : 'this kid') + '.',
          'Keep feeding ' + ptGain.name + '. Every time he touches it, something happens.',
        ]);
      }
    }

    return { line1: sanitize(line1), line2: sanitize(line2) };
  }

  // ── NO GAIN / LOSS ──
  if (!isHumanOnOff) {
    line1 = pick([
      'STUFFED! ' + defName + ' meets him at the line!',
      'NO GAIN! The ' + defTeam + ' defense holds FIRM!',
      'STACKED UP! ' + defName + ' plugs the gap!',
      'Going NOWHERE! ' + defName + ' reads it perfectly!',
      defName + ' BLOWS IT UP at the line! NO GAIN!',
      'SHUT DOWN! Your defense smells it out!',
      'DEAD ON ARRIVAL! ' + defName + ' — great read, great stop!',
    ]);
    // Shutout narrative on stop plays
    if (gameState.irScore === 0 && _narrative.snapCount >= 20) {
      line2 = 'Shutout still on. The ' + defTeam + ' have not given up a single point.';
    }
  } else {
    line1 = pick([
      'Stuffed. ' + defName + ' meets him at the line.',
      'No gain. Defense holds.',
      rusherName + ' is met at the line of scrimmage.',
      'Stopped for no gain. ' + defName + ' stood their ground.',
    ]);
  }
  return { line1: sanitize(line1), line2: sanitize(line2) };
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
  var preSnapPoss = gameState.preSnapPossession || gameState.possession;
  var isHumanOff = preSnapPoss === 'CT';
  var possTeam = isHumanOff ? humanTeamName : oppTeamName;
  var ydsToEz = gameState.yardsToEndzone;
  var scoreDiff = gameState.ctScore - gameState.irScore;

  // Only fire ~30% of the time for non-critical moments
  if (!r || (!r.isTouchdown && !r.isInterception && !r.isFumbleLost && Math.random() > 0.3)) return null;

  // User-biased context
  if (isHumanOff) {
    // User on offense
    if (ydsToEz <= 50 && ydsToEz > 45 && r && r.yards > 0) return 'The ' + possTeam + ' cross midfield! Building momentum!';
    if (ydsToEz <= 20 && ydsToEz > 15) return 'Inside the 20 — this is YOUR territory!';
    if (r && r.isTouchdown && scoreDiff > 0 && scoreDiff <= 7) return 'YOU take the lead!';
    if (r && r.isTouchdown && scoreDiff === 0) return 'All tied up!';
    if (gameState.down === 4) return 'Fourth down. You have to go for it.';
  } else {
    // User on defense
    if (ydsToEz <= 50 && ydsToEz > 45 && r && r.yards > 0) return 'The ' + possTeam + ' cross midfield.';
    if (ydsToEz <= 20 && ydsToEz > 15) return 'They\'re inside the 20. Bend, don\'t break.';
    if (r && r.isTouchdown && scoreDiff < 0 && scoreDiff >= -7) return 'The ' + possTeam + ' take the lead.';
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
