/**
 * TORCH — Full Game Simulation v2
 * 1000-game sim (250 per team x 4 difficulties) with detailed analytics.
 * Runs actual GameState engine — no simplified model.
 */

import { GameState } from '../engine/gameState.js';
import { getOffenseRoster, getDefenseRoster } from '../data/players.js';
import { TORCH_CARDS } from '../data/torchCards.js';
import { SENTINELS_OFF_PLAYS, SENTINELS_DEF_PLAYS } from '../data/sentinelsPlays.js';
import { WOLVES_OFF_PLAYS, WOLVES_DEF_PLAYS } from '../data/wolvesPlays.js';
import { STAGS_OFF_PLAYS, STAGS_DEF_PLAYS } from '../data/stagsPlays.js';
import { SERPENTS_OFF_PLAYS, SERPENTS_DEF_PLAYS } from '../data/serpentsPlays.js';

var TEAMS = ['sentinels', 'wolves', 'stags', 'serpents'];
var TEAM_NAMES = { sentinels: 'BOARS', wolves: 'DOLPHINS', stags: 'SPECTRES', serpents: 'SERPENTS' };
var DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'RANDOM'];

var _plays = {
  sentinels: { off: SENTINELS_OFF_PLAYS, def: SENTINELS_DEF_PLAYS },
  wolves: { off: WOLVES_OFF_PLAYS, def: WOLVES_DEF_PLAYS },
  stags: { off: STAGS_OFF_PLAYS, def: STAGS_DEF_PLAYS },
  serpents: { off: SERPENTS_OFF_PLAYS, def: SERPENTS_DEF_PLAYS },
};
function getOffCards(tid) { return _plays[tid].off.slice(0, 5); }
function getDefCards(tid) { return _plays[tid].def.slice(0, 5); }

function pickOpp(tid) {
  var others = TEAMS.filter(function(t) { return t !== tid; });
  return others[Math.floor(Math.random() * others.length)];
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function simulateGame(teamId, difficulty) {
  var oppId = pickOpp(teamId);
  var actualDiff = difficulty === 'RANDOM' ? pickRandom(['EASY', 'MEDIUM', 'HARD']) : difficulty;

  var gs = new GameState({
    humanTeam: 'CT', difficulty: actualDiff,
    ctOffHand: getOffCards(teamId), ctDefHand: getDefCards(teamId),
    irOffHand: getOffCards(oppId), irDefHand: getDefCards(oppId),
    ctOffRoster: getOffenseRoster(teamId).slice(0, 4),
    ctDefRoster: getDefenseRoster(teamId).slice(0, 4),
    irOffRoster: getOffenseRoster(oppId).slice(0, 4),
    irDefRoster: getDefenseRoster(oppId).slice(0, 4),
    ctTeamId: teamId, irTeamId: oppId,
  });

  var stats = {
    humanScore: 0, cpuScore: 0,
    humanTorchPts: 0, cpuTorchPts: 0,
    snaps: 0, humanTDs: 0, cpuTDs: 0,
    humanTurnovers: 0, cpuTurnovers: 0,
    bigPlays: 0, sacks: 0, totalPlays: 0,
    peakMomentum: 50,
    aiCardsBought: [],
  };

  var maxLoops = 300; // safety valve
  var loopCount = 0;

  // === HALF LOOP ===
  for (var half = 0; half < 2; half++) {
    if (half === 1) {
      // Halftime
      var prevInvLen = gs.cpuTorchCards.length;
      gs.halftimeShop();
      if (gs.cpuTorchCards.length > prevInvLen) {
        stats.aiCardsBought.push(gs.cpuTorchCards[gs.cpuTorchCards.length - 1]);
      }
      gs.startSecondHalf();
      gs.kickoffFlip();
    }

    // === PLAY LOOP ===
    while (!gs.gameOver && loopCount < maxLoops) {
      loopCount++;
      if (gs.needsHalftime) break;

      // 4th down
      if (gs.down === 4) {
        var decision = gs.ai4thDownDecision();
        if (decision === 'punt' && gs.canSpecialTeams()) {
          gs.punt();
          stats.snaps++;
          continue;
        } else if (decision === 'field_goal' && gs.canAttemptFG()) {
          gs.attemptFieldGoal();
          stats.snaps++;
          continue;
        }
      }

      try {
        var prevCpuInv = [...gs.cpuTorchCards];
        var res = gs.executeSnap();
        if (!res || !res.result) continue;
        stats.snaps++;

        if (gs.cpuTorchCards.length > prevCpuInv.length) {
          stats.aiCardsBought.push(gs.cpuTorchCards[gs.cpuTorchCards.length - 1]);
        }

        if (res.gameEvent === 'touchdown') {
          var convChoice = Math.random() < 0.30 ? '2pt' : 'xp';
          gs.handleConversion(convChoice);
        }
        if (gs.momentum > stats.peakMomentum) stats.peakMomentum = gs.momentum;
      } catch (e) { /* silent */ }
    }
  }

  stats.humanScore = gs.ctScore;
  stats.cpuScore = gs.irScore;
  stats.humanTorchPts = gs.ctTorchPts;
  stats.cpuTorchPts = gs.irTorchPts;
  stats.totalPlays = gs.totalPlays;
  stats.humanTurnovers = gs.stats.ctTurnovers;
  stats.cpuTurnovers = gs.stats.irTurnovers;
  stats.humanTDs = gs.stats.ctTouchdowns;
  stats.cpuTDs = gs.stats.irTouchdowns;
  stats.sacks = gs.stats.sackCount;
  stats.bigPlays = gs.stats.explosivePlays;

  return stats;
}

export function runGameSim(gamesPerCombo) {
  gamesPerCombo = gamesPerCombo || 250;
  var totalGames = TEAMS.length * DIFFICULTIES.length * gamesPerCombo;
  var startTime = Date.now();

  console.log('');
  console.log('=== TORCH GAME SIMULATION (' + totalGames + ' games) ===');
  console.log('  ' + gamesPerCombo + ' games per team x difficulty');
  console.log('');

  var allResults = [];
  var globalStats = {
    totalGames: 0, closeGames: 0, shutouts: 0,
    totalSnaps: 0, totalTorchPts: 0,
    scoreFrequency: {}, aiCardBuys: {},
  };

  TEAMS.forEach(function(tid) {
    console.log('TEAM: ' + TEAM_NAMES[tid]);
    DIFFICULTIES.forEach(function(diff) {
      var totals = {
        humanScore: 0, cpuScore: 0, humanTorchPts: 0, cpuTorchPts: 0,
        snaps: 0, humanTDs: 0, cpuTDs: 0, humanTurnovers: 0, cpuTurnovers: 0,
        bigPlays: 0, sacks: 0, totalPlays: 0, peakMomentum: 0,
        wins: 0, losses: 0, ties: 0,
      };

      for (var g = 0; g < gamesPerCombo; g++) {
        var s = simulateGame(tid, diff);
        totals.humanScore += s.humanScore; totals.cpuScore += s.cpuScore;
        totals.humanTorchPts += s.humanTorchPts; totals.cpuTorchPts += s.cpuTorchPts;
        totals.snaps += s.snaps; totals.humanTDs += s.humanTDs; totals.cpuTDs += s.cpuTDs;
        totals.humanTurnovers += s.humanTurnovers; totals.cpuTurnovers += s.cpuTurnovers;
        totals.bigPlays += s.bigPlays; totals.sacks += s.sacks;
        totals.totalPlays += s.totalPlays; totals.peakMomentum += s.peakMomentum;

        if (s.humanScore > s.cpuScore) totals.wins++;
        else if (s.humanScore < s.cpuScore) totals.losses++;
        else totals.ties++;

        globalStats.totalGames++;
        if (Math.abs(s.humanScore - s.cpuScore) <= 3 && s.humanScore !== s.cpuScore) globalStats.closeGames++;
        if (s.humanScore === 0 || s.cpuScore === 0) globalStats.shutouts++;
        globalStats.totalSnaps += s.snaps;
        globalStats.totalTorchPts += s.humanTorchPts;

        var hi = Math.max(s.humanScore, s.cpuScore), lo = Math.min(s.humanScore, s.cpuScore);
        var scoreKey = hi + '-' + lo;
        globalStats.scoreFrequency[scoreKey] = (globalStats.scoreFrequency[scoreKey] || 0) + 1;
        s.aiCardsBought.forEach(function(id) { globalStats.aiCardBuys[id] = (globalStats.aiCardBuys[id] || 0) + 1; });
      }

      var n = gamesPerCombo;
      var winPct = ((totals.wins / n) * 100).toFixed(0);
      var tiePct = ((totals.ties / n) * 100).toFixed(0);
      var avgH = (totals.humanScore / n).toFixed(0);
      var avgC = (totals.cpuScore / n).toFixed(0);
      var avgTDs = (totals.humanTDs / n).toFixed(1);
      var avgTO = ((totals.humanTurnovers + totals.cpuTurnovers) / n).toFixed(1);
      var avgBig = (totals.bigPlays / n).toFixed(1);
      var sackRate = totals.totalPlays > 0 ? ((totals.sacks / totals.totalPlays) * 100).toFixed(1) : '0.0';
      var avgTorch = (totals.humanTorchPts / n).toFixed(0);

      var pad = function(s, len) { s = String(s); while (s.length < len) s += ' '; return s; };
      console.log('  ' + pad(diff, 8) + 'W ' + pad(winPct + '%', 5) + '| Avg ' + pad(avgH + '-' + avgC, 7) + '| Ties ' + pad(tiePct + '%', 5) + '| TDs ' + pad(avgTDs + '/g', 6) + '| TO ' + pad(avgTO + '/g', 6) + '| Big ' + pad(avgBig + '/g', 6) + '| Sack ' + pad(sackRate + '%', 6) + '| TORCH ' + avgTorch);

      allResults.push({ team: tid, diff: diff, winPct: +winPct, tiePct: +tiePct });
    });
    console.log('');
  });

  console.log('GLOBAL METRICS:');
  console.log('  Close games (<=3 pts): ' + ((globalStats.closeGames / globalStats.totalGames) * 100).toFixed(1) + '%');
  console.log('  Shutouts: ' + ((globalStats.shutouts / globalStats.totalGames) * 100).toFixed(1) + '%');
  console.log('  Avg game length: ' + (globalStats.totalSnaps / globalStats.totalGames).toFixed(1) + ' snaps');
  console.log('  Avg TORCH pts earned: ' + (globalStats.totalTorchPts / globalStats.totalGames).toFixed(0));

  console.log('\nTORCH CARD AI USAGE:');
  var buys = Object.entries(globalStats.aiCardBuys).sort((a,b) => b[1]-a[1]);
  if (buys.length > 0) {
    console.log('  Most bought: ' + buys.slice(0, 6).map(e => {
      var c = TORCH_CARDS.find(tc => tc.id === e[0]);
      return (c ? c.name : e[0]) + ' (' + ((e[1] / globalStats.totalGames) * 100).toFixed(1) + '%)';
    }).join(', '));
    var never = TORCH_CARDS.filter(c => !globalStats.aiCardBuys[c.id]).map(c => c.name);
    if (never.length) console.log('  Never bought: ' + never.join(', '));
  }

  console.log('\nBALANCE FLAGS:');
  var targets = {
    EASY:   { winMin: 55, winMax: 90, tieMax: 8 },
    MEDIUM: { winMin: 30, winMax: 65, tieMax: 10 },
    HARD:   { winMin: 15, winMax: 45, tieMax: 10 },
    RANDOM: { winMin: 30, winMax: 70, tieMax: 10 },
  };

  var flagCount = 0;
  allResults.forEach(function(r) {
    var t = targets[r.diff];
    if (r.winPct < t.winMin || r.winPct > t.winMax || r.tiePct > t.tieMax) {
      flagCount++;
      console.log('  ! ' + TEAM_NAMES[r.team] + ' ' + r.diff + ': W ' + r.winPct + '%, T ' + r.tiePct + '%');
    }
  });

  if (flagCount === 0) console.log('  All metrics within target ranges.');
  else {
    console.log('\n  FAIL: ' + flagCount + ' balance flags triggered.');
    if (typeof process !== 'undefined') process.exit(1);
  }

  console.log('\nSimulation complete in ' + ((Date.now() - startTime) / 1000).toFixed(1) + 's');
  return allResults;
}
