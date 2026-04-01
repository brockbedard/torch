/**
 * TORCH — QA Audit: Down & Distance, Field Position, Possession Logic
 * Simulates 20 complete games and instruments EVERY snap to verify correctness.
 * Run with: node --input-type=module -e "import { runAudit } from './src/tests/qaDownDistanceAudit.js'; runAudit();"
 */

import { GameState } from '../engine/gameState.js';
import { getOffenseRoster, getDefenseRoster } from '../data/players.js';
import { SENTINELS_OFF_PLAYS, SENTINELS_DEF_PLAYS } from '../data/sentinelsPlays.js';
import { WOLVES_OFF_PLAYS, WOLVES_DEF_PLAYS } from '../data/wolvesPlays.js';
import { STAGS_OFF_PLAYS, STAGS_DEF_PLAYS } from '../data/stagsPlays.js';
import { SERPENTS_OFF_PLAYS, SERPENTS_DEF_PLAYS } from '../data/serpentsPlays.js';

var TEAMS_LIST = ['sentinels', 'wolves', 'stags', 'serpents'];
var _plays = {
  sentinels: { off: SENTINELS_OFF_PLAYS, def: SENTINELS_DEF_PLAYS },
  wolves:    { off: WOLVES_OFF_PLAYS,    def: WOLVES_DEF_PLAYS },
  stags:     { off: STAGS_OFF_PLAYS,     def: STAGS_DEF_PLAYS },
  serpents:  { off: SERPENTS_OFF_PLAYS,   def: SERPENTS_DEF_PLAYS },
};
function getOffCards(tid) { return _plays[tid].off.slice(0, 5); }
function getDefCards(tid) { return _plays[tid].def.slice(0, 5); }
function pickOpp(tid) {
  var others = TEAMS_LIST.filter(function(t) { return t !== tid; });
  return others[Math.floor(Math.random() * others.length)];
}

// ============================================================
// Violation trackers
// ============================================================
var violations = {
  downProgression: [],
  distanceCalc: [],
  fourthDownRule: [],
  possessionChange: [],
  ballBounds: [],
  puntMechanics: [],
  fgMechanics: [],
  twoMinClock: [],
  halfGameEnd: [],
};

var counters = {
  totalSnaps: 0,
  totalPunts: 0,
  totalFGs: 0,
  totalKickoffs: 0,
  totalTDs: 0,
  totalTurnovers: 0,
  totalFirstDowns: 0,
  twoMinSnaps: 0,
  gamesCompleted: 0,
  puntGrossDistances: [],
  puntReturnTypes: { fairCatch: 0, short: 0, decent: 0, big: 0, touchback: 0 },
  fgAttempts: { '20-29': { made: 0, total: 0 }, '30-39': { made: 0, total: 0 }, '40-49': { made: 0, total: 0 }, '50+': { made: 0, total: 0 } },
  kickoffPositions: [],
};

function addViolation(category, gameNum, detail) {
  violations[category].push('Game ' + gameNum + ': ' + detail);
}

// ============================================================
// Simulate a single game with full instrumentation
// ============================================================
function simulateGameAudit(gameNum) {
  var teamId = TEAMS_LIST[gameNum % TEAMS_LIST.length];
  var oppId = pickOpp(teamId);
  var diffs = ['EASY', 'MEDIUM', 'HARD'];
  var diff = diffs[gameNum % diffs.length];

  var gs = new GameState({
    humanTeam: 'CT', difficulty: diff,
    ctOffHand: getOffCards(teamId), ctDefHand: getDefCards(teamId),
    irOffHand: getOffCards(oppId), irDefHand: getDefCards(oppId),
    ctOffRoster: getOffenseRoster(teamId).slice(0, 4),
    ctDefRoster: getDefenseRoster(teamId).slice(0, 4),
    irOffRoster: getOffenseRoster(oppId).slice(0, 4),
    irDefRoster: getDefenseRoster(oppId).slice(0, 4),
    ctTeamId: teamId, irTeamId: oppId,
  });

  var maxLoops = 300;
  var loopCount = 0;
  var halfEnded = [false, false];

  for (var half = 0; half < 2; half++) {
    if (half === 1) {
      gs.halftimeShop();
      gs.startSecondHalf();
      gs.kickoffFlip();
      // Validate kickoff position
      var koYte = gs.yardsToEndzone();
      counters.totalKickoffs++;
      counters.kickoffPositions.push(100 - koYte); // own yard line
      if (gs.ballPosition < 1 || gs.ballPosition > 99) {
        addViolation('ballBounds', gameNum, 'Kickoff ball position out of bounds: ' + gs.ballPosition);
      }
    }

    while (!gs.gameOver && loopCount < maxLoops) {
      loopCount++;
      if (gs.needsHalftime) { halfEnded[half] = true; break; }

      // ---- SNAPSHOT BEFORE ----
      var prevDown = gs.down;
      var prevDistance = gs.distance;
      var prevBallPos = gs.ballPosition;
      var prevPoss = gs.possession;
      var prevYTE = gs.yardsToEndzone();
      var prevTwoMin = gs.twoMinActive;
      var prevClock = gs.clockSeconds;
      var prevPlaysUsed = gs.playsUsed;

      // ---- PRE-SNAP VALIDATION ----
      // Rule 1: down must be 1-4
      if (gs.down < 1 || gs.down > 4) {
        addViolation('downProgression', gameNum, 'Down is ' + gs.down + ' (should be 1-4) at ballPos=' + gs.ballPosition);
      }
      // Rule 2: distance must be positive
      if (gs.distance <= 0) {
        addViolation('distanceCalc', gameNum, 'Distance is ' + gs.distance + ' (must be > 0) at down=' + gs.down + ' ballPos=' + gs.ballPosition);
      }
      // Rule 5: ball position bounds
      if (gs.ballPosition < 1 || gs.ballPosition > 99) {
        addViolation('ballBounds', gameNum, 'Ball position ' + gs.ballPosition + ' out of bounds [1,99]');
      }

      // ---- 4th DOWN HANDLING ----
      if (gs.down === 4) {
        var canST = gs.canSpecialTeams();
        var yteNow = gs.yardsToEndzone();

        // Rule 3: Must go for it if yardsToEndzone > 50
        if (yteNow > 50 && canST) {
          addViolation('fourthDownRule', gameNum, 'canSpecialTeams() returned true when yardsToEndzone=' + yteNow + ' (should be false when > 50)');
        }
        if (yteNow <= 50 && !canST) {
          addViolation('fourthDownRule', gameNum, 'canSpecialTeams() returned false when yardsToEndzone=' + yteNow + ' (should be true when <= 50)');
        }

        var decision = gs.ai4thDownDecision();

        // Validate AI respects the 4th down rule
        if (!canST && (decision === 'punt' || decision === 'field_goal')) {
          addViolation('fourthDownRule', gameNum, 'AI chose ' + decision + ' but not past the 50 (yardsToEndzone=' + yteNow + ')');
        }

        if (decision === 'punt' && canST) {
          var puntResult = gs.punt();
          counters.totalPunts++;

          // Rule 6: Punt mechanics
          if (puntResult.gross < 25 || puntResult.gross > 58) {
            if (!puntResult.blocked) {
              addViolation('puntMechanics', gameNum, 'Punt gross distance ' + puntResult.gross + ' outside expected 25-58 range');
            }
          }
          counters.puntGrossDistances.push(puntResult.gross);
          if (puntResult.isTouchback) counters.puntReturnTypes.touchback++;
          else if (puntResult.retLabel === 'Fair catch') counters.puntReturnTypes.fairCatch++;
          else if (puntResult.retLabel === 'Short return') counters.puntReturnTypes.short++;
          else if (puntResult.retLabel === 'Decent return') counters.puntReturnTypes.decent++;
          else if (puntResult.retLabel === 'Big return') counters.puntReturnTypes.big++;

          // Verify possession changed
          if (gs.possession === prevPoss) {
            addViolation('possessionChange', gameNum, 'Possession did NOT change after punt (still ' + gs.possession + ')');
          }
          if (gs.ballPosition < 1 || gs.ballPosition > 99) {
            addViolation('ballBounds', gameNum, 'Ball position ' + gs.ballPosition + ' out of bounds after punt');
          }
          continue;
        } else if (decision === 'field_goal' && gs.canAttemptFG()) {
          var fgResult = gs.attemptFieldGoal();
          counters.totalFGs++;

          // Rule 7: FG mechanics
          var fgDist = fgResult.distance;
          var bucket;
          if (fgDist <= 29) bucket = '20-29';
          else if (fgDist <= 39) bucket = '30-39';
          else if (fgDist <= 49) bucket = '40-49';
          else bucket = '50+';
          counters.fgAttempts[bucket].total++;
          if (fgResult.made) counters.fgAttempts[bucket].made++;

          if (fgResult.made) {
            // After made FG, possession should flip (kickoff)
            if (gs.possession === prevPoss) {
              addViolation('possessionChange', gameNum, 'Possession did NOT change after made FG');
            }
          } else {
            // Missed FG: opponent gets ball at LOS or 20, whichever is farther from endzone
            if (gs.possession === prevPoss) {
              addViolation('possessionChange', gameNum, 'Possession did NOT change after missed FG');
            }
            var actualYTE = gs.yardsToEndzone();
            // Missed FG: opponent gets ball at LOS or their own 20, whichever is farther from THEIR OWN endzone.
            // Key insight: kicker's ydsToEz numerically equals the receiver's own yard line.
            // (CT at ballPos=73: kicker ydsToEz=27, receiver own YL from their endzone=27.)
            // So spotYds = max(20, kicker_ydsToEz) = receiver's own yard line.
            // Receiver's yardsToEndzone = 100 - spotYds.
            var spotYds = Math.max(20, prevYTE);
            var expectedReceiverYTE = 100 - spotYds;
            if (actualYTE !== expectedReceiverYTE && !fgResult.blocked) {
              addViolation('fgMechanics', gameNum, 'Missed FG: new team yardsToEndzone=' + actualYTE + ' but expected ' + expectedReceiverYTE + ' (prev kicker ydsToEZ=' + prevYTE + ', spotYds=' + spotYds + ')');
            }
          }
          if (gs.ballPosition < 1 || gs.ballPosition > 99) {
            addViolation('ballBounds', gameNum, 'Ball position ' + gs.ballPosition + ' out of bounds after FG attempt');
          }
          continue;
        }
        // else: go for it, fall through to executeSnap
      }

      // ---- EXECUTE SNAP ----
      try {
        var res = gs.executeSnap();
        if (!res || !res.result) continue;
        counters.totalSnaps++;

        var result = res.result;
        var yards = result.yards;
        var gotFirstDown = res.gotFirstDown;
        var gameEvent = res.gameEvent;

        // ---- 2-MINUTE CLOCK VALIDATION (Rule 8) ----
        if (prevTwoMin) {
          counters.twoMinSnaps++;
          var clockDrain = prevClock - gs.clockSeconds;
          if (result.isIncomplete) {
            if (clockDrain !== 5) {
              addViolation('twoMinClock', gameNum, 'Incomplete pass: clock drained ' + clockDrain + 's (expected 5)');
            }
          } else if (result.isSack) {
            if (clockDrain !== 20) {
              addViolation('twoMinClock', gameNum, 'Sack: clock drained ' + clockDrain + 's (expected 20)');
            }
          } else if (!result.isInterception && !result.isFumbleLost && !result.isTouchdown) {
            // Run or completion: 25-30s
            if (clockDrain < 25 || clockDrain > 30) {
              addViolation('twoMinClock', gameNum, 'Run/completion: clock drained ' + clockDrain + 's (expected 25-30)');
            }
          }
        }

        // ---- POSSESSION CHANGE VALIDATION (Rule 4) ----
        if (result.isInterception || result.isFumbleLost) {
          counters.totalTurnovers++;
          if (gs.possession === prevPoss && gameEvent !== 'turnover_td') {
            // turnover_td does a kickoffFlip which double-flips, so possession might look same
            // Actually turnover_td: possession goes through kickoff so ends at the team that was scored on
          }
          // After a turnover (non-TD), possession should have changed
          if (!result.isTouchdown && gameEvent !== 'turnover_td') {
            if (gs.possession === prevPoss) {
              addViolation('possessionChange', gameNum, 'Possession did NOT change after turnover (' + (result.isInterception ? 'INT' : 'fumble') + ')');
            }
          }
        } else if (result.isSack || result.isIncomplete || (!result.isTouchdown && !gotFirstDown && prevDown < 4)) {
          // Non-scoring, non-first-down, non-4th-down play: possession should NOT change
          if (gs.possession !== prevPoss && gameEvent !== 'turnover_on_downs') {
            addViolation('possessionChange', gameNum, 'Possession changed unexpectedly on routine play (yards=' + yards + ', down=' + prevDown + ', event=' + gameEvent + ')');
          }
        }

        // ---- TURNOVER ON DOWNS (Rule 4) ----
        if (gameEvent === 'turnover_on_downs') {
          if (gs.possession === prevPoss) {
            addViolation('possessionChange', gameNum, 'Possession did NOT change on turnover on downs');
          }
        }

        // ---- TOUCHDOWN HANDLING ----
        if (result.isTouchdown || gameEvent === 'touchdown') {
          counters.totalTDs++;
          var convChoice = Math.random() < 0.15 ? '3pt' : (Math.random() < 0.30 ? '2pt' : 'xp');
          var prevPossConv = gs.possession;
          gs.handleConversion(convChoice);
          counters.totalKickoffs++;
          // After TD + conversion + kickoff, possession should have changed
          if (gs.possession === prevPossConv && !gs.gameOver) {
            // Note: onside kick can keep possession, so this isn't always a violation
            // addViolation('possessionChange', gameNum, 'Possession did not change after TD+conversion');
          }
          // Validate post-kickoff position
          if (!gs.gameOver && gs.ballPosition >= 1 && gs.ballPosition <= 99) {
            var ownYL = gs.possession === 'CT' ? gs.ballPosition : 100 - gs.ballPosition;
            counters.kickoffPositions.push(ownYL);
          }
          if (gs.ballPosition < 1 || gs.ballPosition > 99) {
            if (!gs.gameOver) {
              addViolation('ballBounds', gameNum, 'Ball position ' + gs.ballPosition + ' out of bounds after TD+kickoff');
            }
          }
          continue;
        }

        // ---- DOWN PROGRESSION VALIDATION (Rule 1) ----
        if (!gameEvent || (gameEvent !== 'turnover_on_downs' && gameEvent !== 'touchdown')) {
          if (gotFirstDown) {
            // After first down, down should be 1
            if (gs.down !== 1) {
              addViolation('downProgression', gameNum, 'After first down, down is ' + gs.down + ' (should be 1)');
            }
            counters.totalFirstDowns++;
            // Distance should be min(10, yardsToEndzone)
            var expectedDist = Math.min(10, gs.yardsToEndzone());
            if (gs.distance !== expectedDist) {
              addViolation('distanceCalc', gameNum, 'After first down, distance=' + gs.distance + ' but expected ' + expectedDist + ' (yardsToEndzone=' + gs.yardsToEndzone() + ')');
            }
          } else {
            // Non-first-down: down should increment by 1
            if (gs.down !== prevDown + 1 && gs.down !== 1) {
              // down might be 1 if turnover on downs triggered flipPossession (handled by gameEvent check)
              // Also after turnover on downs, down resets to 1
              if (gameEvent !== 'turnover_on_downs') {
                addViolation('downProgression', gameNum, 'Down went from ' + prevDown + ' to ' + gs.down + ' without first down (yards=' + yards + ')');
              }
            }
          }
        }

        // ---- DISTANCE VALIDATION (Rule 2) ----
        if (!gameEvent || gameEvent !== 'turnover_on_downs') {
          if (gs.distance <= 0 && gs.down >= 1 && gs.down <= 4) {
            addViolation('distanceCalc', gameNum, 'Distance is ' + gs.distance + ' (must be > 0) after snap, down=' + gs.down);
          }
        }

        // ---- BALL BOUNDS CHECK (Rule 5) ----
        if (gs.ballPosition < 1 || gs.ballPosition > 99) {
          if (!gs.gameOver) {
            addViolation('ballBounds', gameNum, 'Ball position ' + gs.ballPosition + ' out of bounds after snap (yards=' + yards + ')');
          }
        }

      } catch (e) {
        // Log errors but don't crash
        addViolation('downProgression', gameNum, 'Exception during snap: ' + e.message);
      }
    }
  }

  // ---- HALF/GAME END VALIDATION (Rule 9) ----
  if (!gs.gameOver) {
    addViolation('halfGameEnd', gameNum, 'Game did not end after full simulation (totalPlays=' + gs.totalPlays + ', half=' + gs.half + ')');
  }

  counters.gamesCompleted++;
}

// ============================================================
// Kickoff distribution audit (standalone)
// ============================================================
function auditKickoffDistribution() {
  var results = [];
  for (var i = 0; i < 5000; i++) {
    var pos = GameState.resolveKickoff(null, {});
    results.push(pos);
  }
  var buckets = { touchback: 0, short: 0, avg: 0, good: 0, big: 0, returnTD: 0 };
  for (var j = 0; j < results.length; j++) {
    var p = results[j];
    if (p === -1) buckets.returnTD++;
    else if (p === 25) buckets.touchback++;
    else if (p >= 20 && p <= 28) buckets.short++;
    else if (p > 28 && p <= 35) buckets.avg++;
    else if (p > 35 && p <= 45) buckets.good++;
    else if (p > 45 && p <= 50) buckets.big++;
  }
  return buckets;
}

// ============================================================
// FG make rate audit (standalone)
// ============================================================
function auditFGMakeRates() {
  var trials = 2000;
  var results = { '20-29': { made: 0, total: 0 }, '30-39': { made: 0, total: 0 }, '40-49': { made: 0, total: 0 }, '50': { made: 0, total: 0 } };
  var distances = [22, 27, 33, 37, 42, 47, 50];
  for (var d = 0; d < distances.length; d++) {
    var fgDist = distances[d];
    var ydsToEz = fgDist - 17;
    var bucket = fgDist <= 29 ? '20-29' : fgDist <= 39 ? '30-39' : fgDist <= 49 ? '40-49' : '50';
    for (var i = 0; i < trials; i++) {
      var makePercent;
      if (fgDist <= 29) makePercent = 88;
      else if (fgDist <= 39) makePercent = 80;
      else if (fgDist <= 49) makePercent = 68;
      else makePercent = 50;
      var made = Math.random() * 100 < makePercent;
      results[bucket].total++;
      if (made) results[bucket].made++;
    }
  }
  return results;
}

// ============================================================
// Main audit runner
// ============================================================
export function runAudit() {
  var GAME_COUNT = 20;
  var startTime = Date.now();

  console.log('');
  console.log('=== TORCH QA AUDIT: Down & Distance / Field Position / Possession ===');
  console.log('  Simulating ' + GAME_COUNT + ' full games with snap-level instrumentation');
  console.log('');

  // Run all games
  for (var g = 0; g < GAME_COUNT; g++) {
    simulateGameAudit(g);
  }

  // Kickoff distribution audit
  var koBuckets = auditKickoffDistribution();

  var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // ============================================================
  // RESULTS
  // ============================================================
  console.log('--- GAME COMPLETION ---');
  console.log('  Games completed: ' + counters.gamesCompleted + '/' + GAME_COUNT);
  console.log('  Total snaps: ' + counters.totalSnaps);
  console.log('  Total TDs: ' + counters.totalTDs);
  console.log('  Total turnovers: ' + counters.totalTurnovers);
  console.log('  Total first downs: ' + counters.totalFirstDowns);
  console.log('  Total punts: ' + counters.totalPunts);
  console.log('  Total FGs: ' + counters.totalFGs);
  console.log('  2-minute snaps: ' + counters.twoMinSnaps);
  console.log('');

  // Rule results
  var rules = [
    { id: 1, name: 'Down Progression', key: 'downProgression', desc: 'Down increments by 1 or resets to 1 on first down' },
    { id: 2, name: 'Distance Calculation', key: 'distanceCalc', desc: 'Distance > 0, resets to min(10, yardsToEndzone) on first down' },
    { id: 3, name: '4th Down Rule', key: 'fourthDownRule', desc: 'Must go for it if not past the 50; punt/FG only when yardsToEndzone <= 50' },
    { id: 4, name: 'Possession Changes', key: 'possessionChange', desc: 'Flips on: TD+kickoff, turnover, turnover on downs, punt. Does NOT flip on routine plays.' },
    { id: 5, name: 'Ball Position Bounds', key: 'ballBounds', desc: 'Always between 1-99 inclusive' },
    { id: 6, name: 'Punt Mechanics', key: 'puntMechanics', desc: 'Gross distance 25-58 yards' },
    { id: 7, name: 'FG Mechanics', key: 'fgMechanics', desc: 'Missed FG: opponent at LOS or 20, whichever farther from endzone' },
    { id: 8, name: '2-Minute Clock', key: 'twoMinClock', desc: 'Incomplete 5s, sack 20s, run/completion 25-30s' },
    { id: 9, name: 'Half/Game End', key: 'halfGameEnd', desc: 'Game ends when clock expires in 2-min drill (both halves)' },
  ];

  console.log('=== RULE VERIFICATION ===');
  console.log('');
  var allPass = true;
  for (var r = 0; r < rules.length; r++) {
    var rule = rules[r];
    var vCount = violations[rule.key].length;
    var status = vCount === 0 ? 'PASS' : 'FAIL';
    if (vCount > 0) allPass = false;
    console.log('  Rule ' + rule.id + ': ' + rule.name + ' — ' + status + (vCount > 0 ? ' (' + vCount + ' violations)' : ''));
    console.log('    ' + rule.desc);
    if (vCount > 0) {
      var show = Math.min(vCount, 5);
      for (var v = 0; v < show; v++) {
        console.log('    ! ' + violations[rule.key][v]);
      }
      if (vCount > show) {
        console.log('    ... and ' + (vCount - show) + ' more');
      }
    }
    console.log('');
  }

  // ---- DISTRIBUTION AUDITS ----
  console.log('=== DISTRIBUTION AUDITS (informational) ===');
  console.log('');

  // Kickoff distribution (Rule 5 supplement)
  console.log('  Kickoff Distribution (5000 samples):');
  var koTotal = 5000;
  console.log('    Touchback: ' + (koBuckets.touchback / koTotal * 100).toFixed(1) + '% (expected ~58%)');
  console.log('    Short return (20-28): ' + (koBuckets.short / koTotal * 100).toFixed(1) + '% (expected ~22%)');
  console.log('    Avg return (28-35): ' + (koBuckets.avg / koTotal * 100).toFixed(1) + '% (expected ~13%)');
  console.log('    Good return (35-45): ' + (koBuckets.good / koTotal * 100).toFixed(1) + '% (expected ~5%)');
  console.log('    Big return (45-50): ' + (koBuckets.big / koTotal * 100).toFixed(1) + '% (expected ~1.5%)');
  console.log('    Return TD: ' + (koBuckets.returnTD / koTotal * 100).toFixed(1) + '% (expected ~0.5%)');
  console.log('');

  // In-game kickoff positions
  if (counters.kickoffPositions.length > 0) {
    var koPositions = counters.kickoffPositions;
    var koAvg = koPositions.reduce(function(a,b) { return a+b; }, 0) / koPositions.length;
    var koMin = Math.min.apply(null, koPositions);
    var koMax = Math.max.apply(null, koPositions);
    console.log('  In-Game Kickoff Starting Positions (' + koPositions.length + ' kickoffs):');
    console.log('    Avg own yard line: ' + koAvg.toFixed(1) + ' (expected ~25-28)');
    console.log('    Range: ' + koMin + ' to ' + koMax);
    console.log('');
  }

  // Punt gross distances
  if (counters.puntGrossDistances.length > 0) {
    var pGross = counters.puntGrossDistances;
    var pAvg = pGross.reduce(function(a,b) { return a+b; }, 0) / pGross.length;
    var pMin = Math.min.apply(null, pGross);
    var pMax = Math.max.apply(null, pGross);
    console.log('  Punt Gross Distances (' + pGross.length + ' punts):');
    console.log('    Avg: ' + pAvg.toFixed(1) + ' yards (expected ~42)');
    console.log('    Range: ' + pMin + ' to ' + pMax + ' (expected 25-58)');
    var pRetTotal = counters.puntReturnTypes.fairCatch + counters.puntReturnTypes.short + counters.puntReturnTypes.decent + counters.puntReturnTypes.big + counters.puntReturnTypes.touchback;
    if (pRetTotal > 0) {
      console.log('    Fair catch: ' + (counters.puntReturnTypes.fairCatch / pRetTotal * 100).toFixed(0) + '% (expected ~40%)');
      console.log('    Short return: ' + (counters.puntReturnTypes.short / pRetTotal * 100).toFixed(0) + '% (expected ~35%)');
      console.log('    Decent return: ' + (counters.puntReturnTypes.decent / pRetTotal * 100).toFixed(0) + '% (expected ~20%)');
      console.log('    Big return: ' + (counters.puntReturnTypes.big / pRetTotal * 100).toFixed(0) + '% (expected ~5%)');
      console.log('    Touchback: ' + (counters.puntReturnTypes.touchback / pRetTotal * 100).toFixed(0) + '%');
    }
    console.log('');
  }

  // FG make rates from games
  console.log('  FG Make Rates (in-game):');
  for (var bk in counters.fgAttempts) {
    var b = counters.fgAttempts[bk];
    if (b.total > 0) {
      console.log('    ' + bk + ' yards: ' + b.made + '/' + b.total + ' (' + (b.made/b.total*100).toFixed(0) + '%)');
    }
  }
  console.log('');

  // ---- SUMMARY ----
  console.log('=== SUMMARY ===');
  console.log('  ' + (allPass ? 'ALL RULES PASSED' : 'SOME RULES FAILED — see violations above'));
  console.log('  Time: ' + elapsed + 's');
  console.log('');

  return { pass: allPass, violations: violations, counters: counters };
}
