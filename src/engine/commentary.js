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
// Sanitize commentary:
//   1. fix double periods
//   2. strip stray periods before lowercase letters
//   3. collapse double spaces
//   4. trim
//   5. capitalize the first letter of the sentence — catches templates that
//      start with a variable like `defName` which can resolve to "the defense"
//      (lowercase) for linemen, resulting in "the defense swats it away."
function sanitize(s) {
  if (!s) return s;
  var out = s.replace(/\.\./g, '.').replace(/\. ([a-z])/g, ' $1').replace(/  +/g, ' ').trim();
  if (out.length > 0) {
    out = out.charAt(0).toUpperCase() + out.substring(1);
  }
  return out;
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
        // Ray Scott principle: noun, noun, outcome. No yardage (hero shows it).
        var tdPassPool = [
          'TOUCHDOWN ' + possTeam.toUpperCase() + '!',
          qbName + ' to ' + receiverName + '! Touchdown!',
          receiverName + '! End zone! Touchdown!',
          'Found him! ' + receiverName + '! Six!',
          qbName + ' ' + pick(PASS_VERBS) + ' it. ' + receiverName + '. Touchdown.',
          possTeam.toUpperCase() + '! ' + receiverName + ' in the end zone!',
          'Ball game! ' + receiverName + ' walks it in!',
          receiverName + ' — nobody near him! Touchdown!',
        ];
        if (traitFlavor(off)) {
          tdPassPool.push('That ' + traitFlavor(off) + ' ' + receiverName + ' finds the end zone!');
          tdPassPool.push(receiverName + ' shows that ' + (off.trait || 'talent') + '! Touchdown!');
        }
        if (isPositionMatchupTD) {
          tdPassPool.push(receiverName + ' beats ' + defName + ' for six!');
          tdPassPool.push(defName + ' had no answer for ' + receiverName + '. Touchdown!');
        }
        line1 = pick(tdPassPool);
      } else {
        var tdRunPool = [
          'TOUCHDOWN ' + possTeam.toUpperCase() + '!',
          rusherName + ' punches it in! Touchdown!',
          rusherName + ' crosses the plane. Touchdown.',
          'Six! ' + rusherName + '!',
          rusherName + ' ' + pick(['bulldozes', 'powers', 'muscles']) + ' in!',
          rusherName + ' won\'t be denied! Touchdown!',
          possTeam.toUpperCase() + '! ' + rusherName + ' in for six!',
          rusherName + ' finds pay dirt!',
        ];
        if (traitFlavor(off)) {
          tdRunPool.push('That ' + traitFlavor(off) + ' ' + rusherName + ' crashes in!');
          tdRunPool.push(rusherName + ' shows that ' + (off.trait || 'power') + '! Touchdown!');
        }
        if (isPositionMatchupTD) {
          tdRunPool.push(rusherName + ' runs through ' + defName + ' for six!');
          tdRunPool.push(defName + ' had no answer for ' + rusherName + '. Touchdown!');
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
      // Opponent scores against user — flat, factual, no yardage filler
      if (isPass) {
        line1 = pick([
          'Touchdown ' + possTeam + '. Caught by ' + receiverName + '.',
          receiverName + ' finds the end zone.',
          possTeam + ' score. Pass to ' + receiverName + '.',
          'Touchdown allowed.',
        ]);
      } else {
        line1 = pick([
          rusherName + ' runs it in.',
          possTeam + ' score. ' + rusherName + '.',
          'Into the end zone. ' + rusherName + '.',
          'Touchdown allowed.',
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
      // User's defense got the sack — celebrate! Tackler name is the point of a sack.
      var sackPool = [
        'Sack! ' + defName + ' gets home!',
        defName + ' buries the QB! Sack!',
        'Nowhere to throw! ' + defName + ' gets there!',
        'Pocket collapses! ' + defName + ' sacks him!',
        defName + ' beats the block. Sack!',
        'Off schedule! ' + defName + ' cleans him up!',
        defName + ' — free runner! Sack!',
        'Got him! ' + defName + ' through the line!',
      ];
      if (traitFlavor(def)) {
        sackPool.push('That ' + traitFlavor(def) + ' ' + defName + ' gets home!');
      }
      if (isPositionMatchupSack) {
        sackPool.push(defName + ' wins the rep. Sack!');
      }
      line1 = pick(sackPool);
      if (tier >= 3) line2 = 'Drive-killer. Your defense is swarming.';
      if (!line2 && gameState.irScore === 0 && _narrative.snapCount >= 20) {
        line2 = 'Shutout still alive.';
      }
    } else {
      // User's QB got sacked — flat
      line1 = pick([
        'Sacked by ' + defName + '.',
        defName + ' gets home. Sacked.',
        'Pressure gets there. ' + qbName + ' goes down.',
        defName + ' beats the block. Sacked.',
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
        'Intercepted! ' + defName + ' jumps the route!',
        'Picked off! Great read by ' + defName + '!',
        'Turnover! ' + defName + ' steps in front!',
        defName + ' reads it. Picked off!',
        'What a play by ' + defName + '! Interception!',
        defName + ' takes it away. Turnover!',
      ];
      if (traitFlavor(def)) {
        intPool.push('That ' + traitFlavor(def) + ' ' + defName + ' with the pick!');
      }
      if (isPositionMatchupINT && off && off.name) {
        intPool.push(defName + ' jumps ' + receiverName + '\'s route. Picked!');
      }
      line1 = pick(intPool);
      line2 = defTeam + ' ball. Momentum is yours.';
    } else {
      // User threw a pick — flat, move on
      line1 = pick([
        'Intercepted by ' + defName + '.',
        defName + ' reads the throw. Pick.',
        'Bad throw. ' + defName + ' has it.',
        defName + ' undercuts the route. Interception.',
        'Into coverage. Picked off.',
      ]);
      line2 = defTeam + ' take over.';
    }
    return { line1: sanitize(line1), line2: sanitize(line2) };
  }

  // ── FUMBLE ──
  if (r.isFumbleLost) {
    if (!isHumanOnOff) {
      // User's defense forces fumble — celebrate!
      line1 = pick([
        'Fumble! ' + defName + ' strips the ball!',
        'Stripped! ' + defTeam + ' recover!',
        'Ball\'s out! ' + defName + ' forces it loose!',
        defName + ' punches it out! Turnover!',
      ]);
      line2 = 'Your defense creates the turnover.';
    } else {
      // User fumbled — flat
      line1 = pick([
        'Fumble. ' + (isPass ? receiverName : rusherName) + ' loses it.',
        'Ball comes loose. ' + defTeam + ' recover.',
        (isPass ? receiverName : rusherName) + ' fumbles. Turnover.',
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
        'Incomplete! ' + defName + ' breaks it up.',
        defName + ' swats it away.',
        'Pass broken up by ' + defName + '.',
        'Thrown away. Coverage was tight.',
        defName + ' locks it down. Incomplete.',
        'Good coverage. Fell incomplete.',
      ]);
    } else {
      // User's pass is incomplete — flat
      if (defWon) {
        line1 = pick([
          'Incomplete. ' + defName + ' breaks it up.',
          'Pass broken up by ' + defName + '.',
          defName + ' with tight coverage.',
          'Nowhere to throw. Incomplete.',
        ]);
      } else {
        line1 = pick([
          'Incomplete. Overthrown.',
          'Dropped by ' + receiverName + '.',
          receiverName + ' can\'t bring it in.',
          'Thrown away.',
          'Off target.',
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
        'Turnover on downs. The ' + defTeam + ' hold.',
        'Comes up short on fourth. ' + defTeam + ' take over.',
        'Short of the marker. Turnover on downs.',
        'Fourth down stop by the ' + defTeam + '. Their ball.',
      ]);
      line2 = null;
    }
    return { line1: sanitize(line1), line2: sanitize(line2) };
  }

  // ── POSITIVE GAIN ──
  // Commentary describes the PLAY, not the yards (the floating number shows yards).
  // Rule: one clause per line on routine plays. No tacked-on tackler suffix — the
  // yardage on screen already tells you the play ended. Tier 3+ gets bigger energy.
  if (yards > 0) {
    var isPositionMatchupGain = off && def && (
      (off.pos === 'WR' && def.pos === 'CB') ||
      (off.pos === 'RB' && def.pos === 'LB') ||
      (off.pos === 'TE' && def.pos === 'S')
    );
    if (isHumanOnOff) {
      if (isPass) {
        if (tier <= 1) {
          line1 = pick([
            receiverName + ' ' + pick(ROUTE_MODS) + '.',
            qbName + ' finds ' + receiverName + '.',
            'Quick throw to ' + receiverName + '.',
            receiverName + ' ' + pick(CATCH_VERBS_SOLO) + '.',
            'Completion to ' + receiverName + '.',
          ]);
        } else if (tier === 2) {
          var t2PassPool = [
            receiverName + ' ' + pick(CATCH_VERBS) + ' it ' + pick(ROUTE_MODS) + '!',
            qbName + ' ' + pick(PASS_VERBS) + ' it to ' + receiverName + '!',
            'Big grab by ' + receiverName + '!',
            receiverName + ' gets open — caught!',
          ];
          if (traitFlavor(off)) t2PassPool.push('That ' + traitFlavor(off) + ' ' + receiverName + ' finds space!');
          if (isPositionMatchupGain) t2PassPool.push(receiverName + ' beats ' + defName + '!');
          line1 = pick(t2PassPool);
          if (res.gotFirstDown) line2 = 'FIRST DOWN! The ' + possTeam + ' move the chains!';
        } else {
          var t3PassPool = [
            'Deep ball! ' + receiverName + ' has it!',
            receiverName + '! Wide open!',
            qbName + ' finds ' + receiverName + ' downfield!',
            'Beautiful throw! ' + receiverName + ' — caught!',
            qbName + ' hits ' + receiverName + ' in stride!',
            receiverName + ' — nothing but grass!',
          ];
          if (traitFlavor(off)) t3PassPool.push(receiverName + '\'s ' + (off.trait || 'speed') + ' creates separation!');
          if (isPositionMatchupGain) {
            t3PassPool.push(receiverName + ' torches ' + defName + '!');
            t3PassPool.push(defName + ' had no answer for ' + receiverName + '.');
          }
          line1 = pick(t3PassPool);
          if (yards >= 20) line2 = 'Chunk play. The ' + possTeam + ' are rolling.';
          else if (res.gotFirstDown) line2 = 'Big conversion on a key down.';
        }
      } else {
        if (tier <= 1) {
          line1 = pick([
            rusherName + ' ' + pick(RUN_MODS) + '.',
            rusherName + ' ' + pick(RUN_VERBS) + ' forward.',
            'Handoff to ' + rusherName + '.',
            rusherName + ' finds a lane.',
            rusherName + ' grinds it out.',
          ]);
        } else if (tier === 2) {
          var t2RunPool = [
            rusherName + ' ' + pick(RUN_VERBS) + ' through the line!',
            rusherName + ' ' + pick(RUN_MODS) + ' — big run!',
            rusherName + ' breaks free!',
            rusherName + ' hits the hole hard!',
          ];
          if (traitFlavor(off)) t2RunPool.push('That ' + traitFlavor(off) + ' ' + rusherName + ' finds space!');
          if (isPositionMatchupGain) t2RunPool.push(rusherName + ' runs through ' + defName + '!');
          line1 = pick(t2RunPool);
          if (res.gotFirstDown) line2 = 'FIRST DOWN! The ' + possTeam + ' keep it moving!';
        } else {
          var t3RunPool = [
            rusherName + ' breaks free!',
            rusherName + ' — nothing but grass!',
            'Explosive run! ' + rusherName + ' is gone!',
            rusherName + ' hits the second level!',
            rusherName + ' busts loose ' + pick(RUN_MODS) + '!',
            rusherName + ' through the line — and he\'s rolling!',
          ];
          if (traitFlavor(off)) t3RunPool.push(rusherName + '\'s ' + (off.trait || 'speed') + ' on display!');
          if (isPositionMatchupGain) {
            t3RunPool.push(rusherName + ' runs right through ' + defName + '!');
            t3RunPool.push(defName + ' had no answer for ' + rusherName + '.');
          }
          line1 = pick(t3RunPool);
          if (yards >= 15) line2 = rusherName + ' is running wild.';
        }
      }
    } else {
      // Opponent gains against user — flat, terse, one clause max
      if (isPass) {
        line1 = pick([
          'Completion to ' + receiverName + '.',
          receiverName + ' ' + pick(ROUTE_MODS) + '.',
          receiverName + ' with the catch.',
          'Pass complete, ' + receiverName + '.',
          receiverName + ' finds space.',
        ]);
        if (res.gotFirstDown) line2 = 'First down for the ' + possTeam + '.';
      } else {
        line1 = pick([
          rusherName + ' finds a crease.',
          rusherName + ' carries.',
          rusherName + ' ' + pick(RUN_MODS) + '.',
          'Handoff to ' + rusherName + '.',
          rusherName + ' through the line.',
          rusherName + ' fights forward.',
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
