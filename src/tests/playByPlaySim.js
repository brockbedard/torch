/**
 * TORCH — Single Game Play-by-Play Simulation
 * Dolphins (wolves) vs Spectres (stags), MEDIUM difficulty.
 * Full play-by-play output using the real game engine.
 */

import { GameState } from '../engine/gameState.js';
import { getOffenseRoster, getDefenseRoster } from '../data/players.js';
import { generateCommentary, resetNarrative, setHalftimeScore } from '../engine/commentary.js';
import { WOLVES_OFF_PLAYS, WOLVES_DEF_PLAYS } from '../data/wolvesPlays.js';
import { STAGS_OFF_PLAYS, STAGS_DEF_PLAYS } from '../data/stagsPlays.js';

// ============================================================
// SETUP
// ============================================================
var humanTeamId = 'wolves';   // Dolphins
var cpuTeamId = 'stags';      // Spectres
var humanName = 'DOLPHINS';
var cpuName = 'SPECTRES';
var difficulty = 'MEDIUM';

function getOffCards(tid) {
  if (tid === 'wolves') return WOLVES_OFF_PLAYS.slice(0, 5);
  return STAGS_OFF_PLAYS.slice(0, 5);
}
function getDefCards(tid) {
  if (tid === 'wolves') return WOLVES_DEF_PLAYS.slice(0, 5);
  return STAGS_DEF_PLAYS.slice(0, 5);
}

var gs = new GameState({
  humanTeam: 'CT',
  difficulty: difficulty,
  ctOffHand: getOffCards(humanTeamId),
  ctDefHand: getDefCards(humanTeamId),
  irOffHand: getOffCards(cpuTeamId),
  irDefHand: getDefCards(cpuTeamId),
  ctOffRoster: getOffenseRoster(humanTeamId),
  ctDefRoster: getDefenseRoster(humanTeamId),
  irOffRoster: getOffenseRoster(cpuTeamId),
  irDefRoster: getDefenseRoster(cpuTeamId),
  ctTeamId: humanTeamId,
  irTeamId: cpuTeamId,
});

resetNarrative();

// ============================================================
// HELPERS
// ============================================================
function teamName(poss) {
  return poss === 'CT' ? humanName : cpuName;
}

function ordinal(d) {
  if (d === 1) return '1st';
  if (d === 2) return '2nd';
  if (d === 3) return '3rd';
  if (d === 4) return '4th';
  return d + 'th';
}

function downAndDistance(gs) {
  var distLabel = gs.distance >= gs.yardsToEndzone() ? 'Goal' : gs.distance;
  return ordinal(gs.down) + ' & ' + distLabel;
}

function ballPosLabel(gs) {
  var yte = gs.yardsToEndzone();
  var poss = teamName(gs.possession);
  if (yte <= 50) return poss + ' side, ' + yte + ' yards to endzone';
  return poss + ' own ' + (100 - yte) + '-yard line';
}

function scoreLine() {
  return humanName + ' ' + gs.ctScore + ' - ' + cpuName + ' ' + gs.irScore;
}

function printDivider(char, len) {
  console.log((char || '=').repeat(len || 70));
}

function printPlay(playNum, half, preDown, preDist, preYTE, prePoss, res) {
  var possName = teamName(prePoss);
  var distLabel = preDist >= preYTE ? 'Goal' : preDist;

  console.log('');
  console.log('--- Play #' + playNum + ' | Half ' + half + ' | ' + possName + ' ball ---');
  console.log('  Situation: ' + ordinal(preDown) + ' & ' + distLabel + ' at ' + preYTE + ' yards to endzone (ball pos: ' + gs.ballPosition + ')');

  if (res.offPlay) {
    console.log('  OFF play: ' + res.offPlay.name + ' [' + (res.offPlay.playType || 'N/A') + ']');
  }
  if (res.featuredOff) {
    var fo = res.featuredOff;
    console.log('  OFF player: ' + (fo.firstName || '') + ' ' + fo.name + ' (' + fo.pos + ', ' + (fo.stars || '?') + ' stars, trait: ' + (fo.trait || 'none') + ')');
  }
  if (res.defPlay) {
    console.log('  DEF play: ' + res.defPlay.name + ' [' + (res.defPlay.cardType || 'N/A') + ']');
  }
  if (res.featuredDef) {
    var fd = res.featuredDef;
    console.log('  DEF player: ' + (fd.firstName || '') + ' ' + fd.name + ' (' + fd.pos + ', ' + (fd.stars || '?') + ' stars, trait: ' + (fd.trait || 'none') + ')');
  }

  // Result
  var r = res.result;
  var resultStr = '';
  if (r.isTouchdown) resultStr = 'TOUCHDOWN! ' + r.yards + ' yards';
  else if (r.isInterception) resultStr = 'INTERCEPTION!';
  else if (r.isFumbleLost) resultStr = 'FUMBLE LOST! (' + r.yards + ' yards before fumble)';
  else if (r.isSack) resultStr = 'SACK for ' + r.yards + ' yards';
  else if (r.isIncomplete) resultStr = 'INCOMPLETE';
  else if (r.isFumble && !r.isFumbleLost) resultStr = 'Fumble recovered by offense, ' + r.yards + ' yards';
  else resultStr = r.yards + ' yards (' + r.playType + ')';

  console.log('  >> RESULT: ' + resultStr);
  if (r.description) console.log('  >> ' + r.description);

  if (res.offCard) console.log('  [TORCH CARD OFF]: ' + res.offCard);
  if (res.defCard) console.log('  [TORCH CARD DEF]: ' + res.defCard);

  if (res.gotFirstDown) console.log('  >>> FIRST DOWN!');
  if (res.gameEvent) console.log('  >>> EVENT: ' + res.gameEvent);

  // Commentary
  var commentary = generateCommentary(res, {
    down: gs.down, distance: gs.distance,
    yardsToEndzone: gs.yardsToEndzone(),
    half: gs.half, ctScore: gs.ctScore, irScore: gs.irScore,
    possession: gs.possession,
    preSnapPossession: prePoss,
    playsUsed: gs.playsUsed, twoMinActive: gs.twoMinActive,
  }, humanName, cpuName);

  if (commentary && commentary.line1) console.log('  COMMENTARY: ' + commentary.line1);
  if (commentary && commentary.line2) console.log('             ' + commentary.line2);

  // New situation
  console.log('  After play: ' + ordinal(gs.down) + ' & ' + (gs.distance >= gs.yardsToEndzone() ? 'Goal' : gs.distance) + ' | ' + teamName(gs.possession) + ' ball | ' + gs.yardsToEndzone() + ' to endzone');
  console.log('  Score: ' + scoreLine());
  if (gs.twoMinActive) console.log('  [2-MIN DRILL] Clock: ' + gs.clockSeconds + 's');
}

// ============================================================
// GAME SIMULATION
// ============================================================

var maxLoops = 300;
var loopCount = 0;
var globalPlayNum = 0;

// Stats tracking
var statsTracker = {
  h1Plays: 0,
  h2Plays: 0,
  h1TwoMinTriggered: false,
  h2TwoMinTriggered: false,
  totalSnaps: 0,
  touchdowns: 0,
  turnovers: 0,
  punts: 0,
  fieldGoals: 0,
  conversions: { xp: 0, twoPt: 0, threePt: 0, twoPtSuccess: 0, threePtSuccess: 0 },
};

printDivider('=', 70);
console.log('  TORCH FOOTBALL — PLAY-BY-PLAY SIMULATION');
console.log('  ' + humanName + ' (Coral Bay) vs ' + cpuName + ' (Hollowridge)');
console.log('  Difficulty: ' + difficulty);
console.log('  Weather: ' + gs.weather);
console.log('  ' + teamName(gs.possession) + ' receives the opening kickoff');
printDivider('=', 70);

for (var half = 0; half < 2; half++) {
  if (half === 1) {
    // HALFTIME
    printDivider('*', 70);
    console.log('');
    console.log('  *** HALFTIME ***');
    console.log('  Score: ' + scoreLine());
    console.log('  1st Half plays used: ' + statsTracker.h1Plays);
    console.log('  2-min drill triggered in H1: ' + statsTracker.h1TwoMinTriggered);
    console.log('  Stats: CT yards=' + gs.stats.ctTotalYards + ' IR yards=' + gs.stats.irTotalYards);
    console.log('  TORCH pts: ' + humanName + '=' + gs.ctTorchPts + ' ' + cpuName + '=' + gs.irTorchPts);
    console.log('');
    printDivider('*', 70);

    setHalftimeScore(gs.ctScore - gs.irScore);
    gs.halftimeShop();
    gs.startSecondHalf();
    // Halftime kickoff
    var hkResult = gs.kickoffFlip();
    console.log('');
    console.log('  2ND HALF KICKOFF: ' + teamName(gs.possession) + ' receives');
    if (hkResult.returnTD) {
      console.log('  KICK RETURN TOUCHDOWN!!');
    } else {
      console.log('  Ball spotted at own ' + (hkResult.startYard || 25));
    }
    console.log('');
  }

  var halfLabel = half === 0 ? '1ST HALF' : '2ND HALF';
  printDivider('-', 70);
  console.log('  ' + halfLabel + ' BEGINS');
  printDivider('-', 70);

  while (!gs.gameOver && loopCount < maxLoops) {
    loopCount++;
    if (gs.needsHalftime) break;

    // Track 2-min drill trigger
    if (gs.twoMinActive) {
      if (half === 0) statsTracker.h1TwoMinTriggered = true;
      else statsTracker.h2TwoMinTriggered = true;
    }

    // 4th down decisions
    if (gs.down === 4) {
      var decision = gs.ai4thDownDecision();

      if (decision === 'punt' && gs.canSpecialTeams()) {
        globalPlayNum++;
        statsTracker.punts++;
        if (half === 0) statsTracker.h1Plays++;
        else statsTracker.h2Plays++;

        var preYTE = gs.yardsToEndzone();
        var prePoss = gs.possession;
        var puntResult = gs.punt();

        console.log('');
        console.log('--- Play #' + globalPlayNum + ' | Half ' + (half + 1) + ' | PUNT ---');
        console.log('  ' + teamName(prePoss) + ' punts from ' + preYTE + ' yards out');
        console.log('  >> ' + puntResult.label);
        console.log('  ' + teamName(gs.possession) + ' takes over');
        console.log('  Score: ' + scoreLine());
        if (gs.twoMinActive) console.log('  [2-MIN DRILL] Clock: ' + gs.clockSeconds + 's');
        continue;
      } else if (decision === 'field_goal' && gs.canAttemptFG()) {
        globalPlayNum++;
        statsTracker.fieldGoals++;
        if (half === 0) statsTracker.h1Plays++;
        else statsTracker.h2Plays++;

        var preYTE2 = gs.yardsToEndzone();
        var prePoss2 = gs.possession;
        var fgResult = gs.attemptFieldGoal();

        console.log('');
        console.log('--- Play #' + globalPlayNum + ' | Half ' + (half + 1) + ' | FIELD GOAL ---');
        console.log('  ' + teamName(prePoss2) + ' attempts from ' + preYTE2 + ' yards out');
        console.log('  >> ' + fgResult.label);
        console.log('  Score: ' + scoreLine());
        if (gs.twoMinActive) console.log('  [2-MIN DRILL] Clock: ' + gs.clockSeconds + 's');
        continue;
      }
      // else: go for it on 4th down
    }

    // Execute snap (all AI-selected since this is a sim)
    var preDown = gs.down;
    var preDist = gs.distance;
    var preYTE3 = gs.yardsToEndzone();
    var prePoss3 = gs.possession;
    var prePlaysUsed = gs.playsUsed;
    var preTwoMin = gs.twoMinActive;

    try {
      var res = gs.executeSnap();
      if (!res || !res.result) continue;

      globalPlayNum++;
      statsTracker.totalSnaps++;
      if (half === 0) statsTracker.h1Plays++;
      else statsTracker.h2Plays++;

      // Detect 2-min trigger
      if (!preTwoMin && gs.twoMinActive) {
        console.log('');
        printDivider('!', 70);
        console.log('  >>> 2-MINUTE WARNING! Play limit reached (' + gs.playsPerHalf + ' plays). Clock: ' + gs.clockSeconds + 's');
        printDivider('!', 70);
      }

      printPlay(globalPlayNum, half + 1, preDown, preDist, preYTE3, prePoss3, res);

      // Handle touchdown -> conversion
      if (res.gameEvent === 'touchdown') {
        statsTracker.touchdowns++;

        // AI picks conversion: XP most of the time, occasionally 2pt
        var convChoice = 'xp';
        var scoreDiff = gs.possession === 'CT' ? gs.ctScore - gs.irScore : gs.irScore - gs.ctScore;
        // Go for 2 if trailing by specific amounts in 2nd half
        if (gs.half === 2 && (scoreDiff === -2 || scoreDiff === -5 || scoreDiff === -8)) {
          convChoice = '2pt';
        }
        // Occasionally go for 3 if trailing big
        if (gs.half === 2 && scoreDiff <= -14 && Math.random() < 0.3) {
          convChoice = '3pt';
        }

        var convResult = gs.handleConversion(convChoice);

        console.log('');
        console.log('  CONVERSION: ' + convChoice.toUpperCase());
        if (convChoice === 'xp') {
          console.log('  >> Extra point is GOOD! +1');
          statsTracker.conversions.xp++;
        } else if (convChoice === '2pt') {
          console.log('  >> 2-point conversion: ' + (convResult.success ? 'GOOD! +2' : 'NO GOOD'));
          statsTracker.conversions.twoPt++;
          if (convResult.success) statsTracker.conversions.twoPtSuccess++;
        } else {
          console.log('  >> 3-point conversion: ' + (convResult.success ? 'GOOD! +3' : 'NO GOOD'));
          statsTracker.conversions.threePt++;
          if (convResult.success) statsTracker.conversions.threePtSuccess++;
        }
        console.log('  Score after conversion: ' + scoreLine());

        // Kickoff after score (already handled by handleConversion -> kickoffFlip)
        console.log('  KICKOFF: ' + teamName(gs.possession) + ' receives');
        console.log('  Ball at ' + gs.yardsToEndzone() + ' yards to endzone');
      }

      if (res.gameEvent === 'turnover_td') {
        statsTracker.turnovers++;
        statsTracker.touchdowns++;
        console.log('  >> TURNOVER RETURNED FOR A TOUCHDOWN!');
        console.log('  Score: ' + scoreLine());
      }

      if (res.gameEvent === 'interception' || res.gameEvent === 'fumble_lost') {
        statsTracker.turnovers++;
      }

      if (res.gameEvent === 'turnover_on_downs') {
        console.log('  >> TURNOVER ON DOWNS! ' + teamName(gs.possession) + ' takes over.');
      }

    } catch (e) {
      console.log('  [ERROR] Snap failed: ' + e.message);
      console.log('  ' + e.stack);
      break;
    }
  }
}

// ============================================================
// GAME OVER
// ============================================================
printDivider('=', 70);
console.log('');
console.log('  GAME OVER');
console.log('');
printDivider('=', 70);
console.log('');
console.log('  FINAL SCORE: ' + scoreLine());
console.log('');

var winner = gs.ctScore > gs.irScore ? humanName : (gs.irScore > gs.ctScore ? cpuName : 'TIE');
console.log('  WINNER: ' + winner);
console.log('');

printDivider('-', 70);
console.log('  GAME STATS');
printDivider('-', 70);
console.log('');
console.log('  Total plays: ' + gs.totalPlays);
console.log('  1st Half plays: ' + statsTracker.h1Plays);
console.log('  2nd Half plays: ' + statsTracker.h2Plays);
console.log('  2-min drill triggered H1: ' + statsTracker.h1TwoMinTriggered);
console.log('  2-min drill triggered H2: ' + statsTracker.h2TwoMinTriggered);
console.log('  Plays per half limit: ' + gs.playsPerHalf);
console.log('');
console.log('  ' + humanName + ':');
console.log('    Score: ' + gs.ctScore);
console.log('    Total yards: ' + gs.stats.ctTotalYards);
console.log('    Touchdowns: ' + gs.stats.ctTouchdowns);
console.log('    First downs: ' + gs.stats.ctFirstDowns);
console.log('    Turnovers: ' + gs.stats.ctTurnovers);
console.log('    Sacks forced: ' + gs.stats.ctSacks);
console.log('    Incompletions: ' + gs.stats.ctIncompletions);
console.log('    Drives: ' + gs.stats.ctDrives);
console.log('    TORCH points: ' + gs.ctTorchPts);
console.log('');
console.log('  ' + cpuName + ':');
console.log('    Score: ' + gs.irScore);
console.log('    Total yards: ' + gs.stats.irTotalYards);
console.log('    Touchdowns: ' + gs.stats.irTouchdowns);
console.log('    First downs: ' + gs.stats.irFirstDowns);
console.log('    Turnovers: ' + gs.stats.irTurnovers);
console.log('    Sacks forced: ' + gs.stats.irSacks);
console.log('    Incompletions: ' + gs.stats.irIncompletions);
console.log('    Drives: ' + gs.stats.irDrives);
console.log('    TORCH points: ' + gs.irTorchPts);
console.log('');
console.log('  Combined:');
console.log('    Explosive plays (15+ yds): ' + gs.stats.explosivePlays);
console.log('    Big plays (10+ yds): ' + gs.stats.bigPlays);
console.log('    Total sacks: ' + gs.stats.sackCount);
console.log('    Red zone trips: ' + gs.stats.redZoneTrips);
console.log('    Red zone TDs: ' + gs.stats.redZoneTDs);
console.log('    3-and-outs: ' + gs.stats.threeAndOuts);
console.log('    Long drives (6+ plays): ' + gs.stats.longDrives);
console.log('    4th down attempts: ' + gs.stats.fourthDownAttempts);
console.log('    4th down conversions: ' + gs.stats.fourthDownConversions);
console.log('    Lead changes: ' + gs.stats.leadChanges);
console.log('    Badge combos: ' + gs.stats.badgeCombos);
console.log('    2-min scores: ' + gs.stats.twoMinScores);
console.log('    Turnover TDs: ' + gs.stats.turnoverTDs);
console.log('');
console.log('  Conversions:');
console.log('    XP: ' + statsTracker.conversions.xp);
console.log('    2pt attempts: ' + statsTracker.conversions.twoPt + ' (made: ' + statsTracker.conversions.twoPtSuccess + ')');
console.log('    3pt attempts: ' + statsTracker.conversions.threePt + ' (made: ' + statsTracker.conversions.threePtSuccess + ')');
console.log('');
console.log('  Special teams:');
console.log('    Punts: ' + statsTracker.punts);
console.log('    FG attempts: ' + statsTracker.fieldGoals);
console.log('');
printDivider('=', 70);
console.log('  SIMULATION COMPLETE');
printDivider('=', 70);
