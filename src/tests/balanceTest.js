/**
 * TORCH — Balance Test Harness
 * Simulates 100 drives × 4 teams × 3 difficulties = 1200 drives (12000 snaps)
 * Logs stats summary to console. No UI, read-only, diagnostic only.
 *
 * Usage: window.runBalanceTest(100)  // from browser console with dev mode
 */

import { resolveSnap } from '../engine/snapResolver.js';
import { SENTINELS_OFF_PLAYS, SENTINELS_DEF_PLAYS } from '../data/sentinelsPlays.js';
import { WOLVES_OFF_PLAYS, WOLVES_DEF_PLAYS } from '../data/wolvesPlays.js';
import { STAGS_OFF_PLAYS, STAGS_DEF_PLAYS } from '../data/stagsPlays.js';
import { SERPENTS_OFF_PLAYS, SERPENTS_DEF_PLAYS } from '../data/serpentsPlays.js';
import { getOffenseRoster, getDefenseRoster } from '../data/players.js';

var TEAMS = [
  { id: 'sentinels', name: 'BOARS', off: SENTINELS_OFF_PLAYS, def: SENTINELS_DEF_PLAYS },
  { id: 'wolves', name: 'DOLPHINS', off: WOLVES_OFF_PLAYS, def: WOLVES_DEF_PLAYS },
  { id: 'stags', name: 'SPECTRES', off: STAGS_OFF_PLAYS, def: STAGS_DEF_PLAYS },
  { id: 'serpents', name: 'SERPENTS', off: SERPENTS_OFF_PLAYS, def: SERPENTS_DEF_PLAYS },
];

var DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function simulateDrive(offPlays, defPlays, offRoster, defRoster, difficulty) {
  var ballPos = 25; // start at own 25
  var down = 1;
  var distance = 10;
  var yardsToEz = 75;
  var totalYards = 0;
  var snaps = 0;
  var bigPlays = 0;
  var incompletions = 0;
  var sacks = 0;
  var turnovers = 0;
  var passYards = 0;
  var passAttempts = 0;
  var runYards = 0;
  var runAttempts = 0;
  var scored = false;
  var playHistory = [];

  for (var i = 0; i < 10; i++) {
    snaps++;
    var offPlay = pick(offPlays);
    var defPlay = pick(defPlays);
    var featuredOff = pick(offRoster);
    var featuredDef = pick(defRoster);

    var context = {
      playHistory: playHistory,
      yardsToEndzone: yardsToEz,
      ballPosition: ballPos,
      down: down,
      distance: distance,
      isConversion: false,
      scoreDiff: 0,
      weather: 'CLEAR',
      momentum: 50,
      coachBadge: 'SCHEMER',
      difficulty: difficulty,
      offenseIsHuman: true,
    };

    var result = resolveSnap(offPlay, defPlay, featuredOff, featuredDef, offRoster, defRoster, context);

    var yards = result.yards;
    totalYards += yards;
    playHistory.push(offPlay.playType);

    if (result.playType === 'pass') {
      passAttempts++;
      if (result.isComplete) passYards += yards;
    } else {
      runAttempts++;
      runYards += yards;
    }

    if (yards >= 15) bigPlays++;
    if (result.isIncomplete) incompletions++;
    if (result.isSack) sacks++;
    if (result.isInterception || result.isFumbleLost) { turnovers++; break; }

    if (result.isTouchdown) { scored = true; break; }

    // Advance ball
    ballPos += yards;
    yardsToEz = 100 - ballPos;

    // Down & distance
    if (yards >= distance) {
      down = 1;
      distance = Math.min(10, yardsToEz);
    } else {
      if (yards > 0) distance -= yards;
      else if (yards < 0) distance += Math.abs(yards);
      down++;

      if (down > 4) {
        // 4th down: go for it if short, otherwise punt
        if (distance <= 3) {
          down = 4; // simulate going for it on next snap
        } else {
          break; // punt
        }
      }
    }

    if (yardsToEz <= 0) { scored = true; break; }
  }

  return {
    snaps: snaps,
    totalYards: totalYards,
    scored: scored,
    bigPlays: bigPlays,
    incompletions: incompletions,
    sacks: sacks,
    turnovers: turnovers,
    passYards: passYards,
    passAttempts: passAttempts,
    runYards: runYards,
    runAttempts: runAttempts,
  };
}

export function runBalanceTest(drivesPerCombo) {
  drivesPerCombo = drivesPerCombo || 100;
  var allResults = [];

  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║        TORCH BALANCE TEST — v0.23.0             ║');
  console.log('║   ' + drivesPerCombo + ' drives per team × difficulty           ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');

  TEAMS.forEach(function(team) {
    var offRoster = getOffenseRoster(team.id);
    var defRoster = getDefenseRoster(team.id);
    // Use a different team's defense to simulate opponents
    var oppIdx = (TEAMS.indexOf(team) + 1) % TEAMS.length;
    var oppDefPlays = TEAMS[oppIdx].def;
    var oppDefRoster = getDefenseRoster(TEAMS[oppIdx].id);

    DIFFICULTIES.forEach(function(diff) {
      var totalSnaps = 0, totalYards = 0, totalScored = 0;
      var totalBigPlays = 0, totalInc = 0, totalSacks = 0, totalTO = 0;
      var totalPassYds = 0, totalPassAtt = 0, totalRunYds = 0, totalRunAtt = 0;
      var longestPlay = 0;

      for (var d = 0; d < drivesPerCombo; d++) {
        var dr = simulateDrive(team.off, oppDefPlays, offRoster, oppDefRoster, diff);
        totalSnaps += dr.snaps;
        totalYards += dr.totalYards;
        if (dr.scored) totalScored++;
        totalBigPlays += dr.bigPlays;
        totalInc += dr.incompletions;
        totalSacks += dr.sacks;
        totalTO += dr.turnovers;
        totalPassYds += dr.passYards;
        totalPassAtt += dr.passAttempts;
        totalRunYds += dr.runYards;
        totalRunAtt += dr.runAttempts;
        // Track longest play per drive (approximate)
        if (dr.totalYards > longestPlay && dr.snaps === 1) longestPlay = dr.totalYards;
      }

      var avgYPP = totalSnaps > 0 ? (totalYards / totalSnaps).toFixed(1) : '0';
      var avgYPD = (totalYards / drivesPerCombo).toFixed(1);
      var scorePct = ((totalScored / drivesPerCombo) * 100).toFixed(0);
      var bigPct = totalSnaps > 0 ? ((totalBigPlays / totalSnaps) * 100).toFixed(1) : '0';
      var incPct = totalSnaps > 0 ? ((totalInc / totalSnaps) * 100).toFixed(1) : '0';
      var sackPct = totalSnaps > 0 ? ((totalSacks / totalSnaps) * 100).toFixed(1) : '0';
      var toPct = totalSnaps > 0 ? ((totalTO / totalSnaps) * 100).toFixed(1) : '0';
      var runYPP = totalRunAtt > 0 ? (totalRunYds / totalRunAtt).toFixed(1) : 'N/A';
      var passYPP = totalPassAtt > 0 ? (totalPassYds / totalPassAtt).toFixed(1) : 'N/A';
      var avgPtsPerGame = ((totalScored / drivesPerCombo) * 7 * 10).toFixed(1); // ~10 drives/game, 7pts/score

      // Warnings
      var warnings = [];
      var ypp = parseFloat(avgYPP);
      if (ypp < 7) warnings.push('⚠️ avg yds/play < 7 (too conservative)');
      if (ypp > 14) warnings.push('⚠️ avg yds/play > 14 (too generous)');
      if (parseInt(scorePct) < 25) warnings.push('⚠️ scoring % < 25% (too hard)');
      if (parseInt(scorePct) > 60) warnings.push('⚠️ scoring % > 60% (too easy)');
      if (parseFloat(bigPct) < 3) warnings.push('⚠️ big play % < 3% (too rare)');
      if (parseFloat(bigPct) > 10) warnings.push('⚠️ big play % > 10% (too common)');
      if (parseFloat(toPct) > 5) warnings.push('⚠️ turnover % > 5% (too punishing)');
      if (parseFloat(runYPP) < 5 && runYPP !== 'N/A') warnings.push('⚠️ run yds/play < 5 (runs feel useless)');

      console.log('=== ' + team.name + ' (' + diff + ') — ' + drivesPerCombo + ' drives, ' + totalSnaps + ' snaps ===');
      console.log('Avg yards/play:     ' + avgYPP);
      console.log('Avg yards/drive:    ' + avgYPD);
      console.log('Scoring drives:     ' + totalScored + '/' + drivesPerCombo + ' (' + scorePct + '%)');
      console.log('Big plays (15+):    ' + totalBigPlays + ' (' + bigPct + '%)');
      console.log('Incompletions:      ' + totalInc + ' (' + incPct + '%)');
      console.log('Sacks:              ' + totalSacks + ' (' + sackPct + '%)');
      console.log('Turnovers:          ' + totalTO + ' (' + toPct + '%)');
      console.log('Est. pts/game:      ' + avgPtsPerGame);
      console.log('Run yds/play avg:   ' + runYPP);
      console.log('Pass yds/play avg:  ' + passYPP);
      if (warnings.length > 0) warnings.forEach(function(w) { console.log(w); });
      console.log('');

      allResults.push({
        team: team.name, diff: diff,
        ypp: ypp, scorePct: parseInt(scorePct),
        bigPct: parseFloat(bigPct), toPct: parseFloat(toPct),
        runYPP: parseFloat(runYPP), passYPP: parseFloat(passYPP),
      });
    });
  });

  // Cross-team balance check
  console.log('=== BALANCE CHECK ===');
  DIFFICULTIES.forEach(function(diff) {
    var diffResults = allResults.filter(function(r) { return r.diff === diff; });
    var avgYPP = diffResults.reduce(function(s, r) { return s + r.ypp; }, 0) / diffResults.length;
    diffResults.forEach(function(r) {
      var deviation = Math.abs(r.ypp - avgYPP) / avgYPP * 100;
      if (deviation > 25) {
        console.log('⚠️ ' + r.team + ' (' + diff + ') deviates ' + deviation.toFixed(0) + '% from avg yds/play — scheme imbalance');
      }
    });
  });
  console.log('');
  console.log('Test complete. ' + allResults.length + ' combinations tested.');
  return allResults;
}
