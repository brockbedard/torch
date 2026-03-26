/**
 * TORCH — Full Game Simulation Test
 * Simulates 100 complete games and reports torch card spending, usage, and scoring.
 */

import { GameState } from '../engine/gameState.js';
import { getOffenseRoster, getDefenseRoster } from '../data/players.js';
import { TORCH_CARDS } from '../data/torchCards.js';

var TEAMS = ['sentinels', 'wolves', 'stags', 'serpents'];

function pickOpp(tid) {
  var others = TEAMS.filter(function(t) { return t !== tid; });
  return others[Math.floor(Math.random() * others.length)];
}

function simulateGame(teamId, difficulty) {
  var oppId = pickOpp(teamId);
  var gs = new GameState({
    humanTeam: 'CT', difficulty: difficulty,
    ctOffHand: getOffCards(teamId), ctDefHand: getDefCards(teamId),
    irOffHand: getOffCards(oppId), irDefHand: getDefCards(oppId),
    ctOffRoster: getOffenseRoster(teamId).slice(0, 4),
    ctDefRoster: getDefenseRoster(teamId).slice(0, 4),
    irOffRoster: getOffenseRoster(oppId).slice(0, 4),
    irDefRoster: getDefenseRoster(oppId).slice(0, 4),
  });

  var stats = {
    humanScore: 0, cpuScore: 0,
    humanTorchPts: 0, cpuTorchPts: 0,
    cardsGiven: 0, cardsUsed: 0, cardsSpent: 0,
    snaps: 0, humanTDs: 0, cpuTDs: 0,
    turnovers: 0,
  };

  // Simulate 20 snaps per half x 2 halves = 40 snaps max
  for (var half = 0; half < 2; half++) {
    // Halftime booster
    if (half === 1) {
      gs.halftimeShop();
      stats.cardsGiven += gs.humanTorchCards.length;
    }

    for (var snap = 0; snap < 20; snap++) {
      if (gs.gameOver) break;
      stats.snaps++;

      try {
        var res = gs.executeSnap();
        if (!res || !res.result) continue;
        var r = res.result;

        if (r.isTouchdown) {
          if (gs.possession === 'CT' || res.scoringTeam === 'CT') stats.humanTDs++;
          else stats.cpuTDs++;
          // Auto XP
          gs.handleConversion('xp');
        }

        if (r.isInterception || r.isFumbleLost) stats.turnovers++;

        // Track card usage
        if (res.offCard || res.defCard) stats.cardsUsed++;

      } catch (e) {
        // Skip crashes
      }
    }
  }

  stats.humanScore = gs.ctScore;
  stats.cpuScore = gs.irScore;
  stats.humanTorchPts = gs.ctTorchPts;
  stats.cpuTorchPts = gs.irTorchPts;
  stats.cardsSpent = gs.humanTorchCards.length + gs.cpuTorchCards.length;

  return stats;
}

// Need to import play data
import { SENTINELS_OFF_PLAYS, SENTINELS_DEF_PLAYS } from '../data/sentinelsPlays.js';
import { WOLVES_OFF_PLAYS, WOLVES_DEF_PLAYS } from '../data/wolvesPlays.js';
import { STAGS_OFF_PLAYS, STAGS_DEF_PLAYS } from '../data/stagsPlays.js';
import { SERPENTS_OFF_PLAYS, SERPENTS_DEF_PLAYS } from '../data/serpentsPlays.js';

var _plays = {
  sentinels: { off: SENTINELS_OFF_PLAYS, def: SENTINELS_DEF_PLAYS },
  wolves: { off: WOLVES_OFF_PLAYS, def: WOLVES_DEF_PLAYS },
  spectres: { off: STAGS_OFF_PLAYS, def: STAGS_DEF_PLAYS },
  serpents: { off: SERPENTS_OFF_PLAYS, def: SERPENTS_DEF_PLAYS },
};
function getOffCards(tid) { return _plays[tid].off.slice(0, 4); }
function getDefCards(tid) { return _plays[tid].def.slice(0, 4); }

export function runGameSim(count) {
  count = count || 100;
  var difficulties = ['EASY', 'MEDIUM', 'HARD'];

  console.log('');
  console.log('TORCH Full Game Simulation — ' + count + ' games per team x difficulty');
  console.log('='.repeat(60));

  var allResults = [];

  TEAMS.forEach(function(tid) {
    difficulties.forEach(function(diff) {
      var totals = {
        humanScore: 0, cpuScore: 0, humanTorchPts: 0,
        cardsUsed: 0, snaps: 0, humanTDs: 0, cpuTDs: 0, turnovers: 0,
        wins: 0, losses: 0, ties: 0,
      };

      for (var g = 0; g < count; g++) {
        var s = simulateGame(tid, diff);
        totals.humanScore += s.humanScore;
        totals.cpuScore += s.cpuScore;
        totals.humanTorchPts += s.humanTorchPts;
        totals.cardsUsed += s.cardsUsed;
        totals.snaps += s.snaps;
        totals.humanTDs += s.humanTDs;
        totals.cpuTDs += s.cpuTDs;
        totals.turnovers += s.turnovers;
        if (s.humanScore > s.cpuScore) totals.wins++;
        else if (s.humanScore < s.cpuScore) totals.losses++;
        else totals.ties++;
      }

      var avgHScore = (totals.humanScore / count).toFixed(1);
      var avgCScore = (totals.cpuScore / count).toFixed(1);
      var avgTorch = (totals.humanTorchPts / count).toFixed(0);
      var avgCards = (totals.cardsUsed / count).toFixed(1);
      var avgSnaps = (totals.snaps / count).toFixed(0);
      var avgHTD = (totals.humanTDs / count).toFixed(1);
      var avgCTD = (totals.cpuTDs / count).toFixed(1);
      var avgTO = (totals.turnovers / count).toFixed(1);
      var winPct = ((totals.wins / count) * 100).toFixed(0);

      console.log('');
      console.log('--- ' + tid.toUpperCase() + ' (' + diff + ') — ' + count + ' games ---');
      console.log('  Avg score:    ' + avgHScore + ' - ' + avgCScore + ' (human - cpu)');
      console.log('  Win rate:     ' + winPct + '% (' + totals.wins + 'W / ' + totals.losses + 'L / ' + totals.ties + 'T)');
      console.log('  Avg TORCH:    ' + avgTorch + ' pts earned');
      console.log('  Cards used:   ' + avgCards + ' per game');
      console.log('  Avg TDs:      ' + avgHTD + ' human / ' + avgCTD + ' cpu');
      console.log('  Turnovers:    ' + avgTO + ' per game');
      console.log('  Avg snaps:    ' + avgSnaps + ' per game');

      allResults.push({ team: tid, diff: diff, humanScore: +avgHScore, cpuScore: +avgCScore, torch: +avgTorch, cards: +avgCards, winPct: +winPct, humanTDs: +avgHTD, cpuTDs: +avgCTD });
    });
  });

  // Summary table
  console.log('');
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log('Team          Diff    Score     Win%  TORCH  Cards  TDs');
  allResults.forEach(function(r) {
    var pad = function(s, n) { s = String(s); while (s.length < n) s += ' '; return s; };
    console.log(
      pad(r.team, 14) +
      pad(r.diff, 8) +
      pad(r.humanScore + '-' + r.cpuScore, 10) +
      pad(r.winPct + '%', 6) +
      pad(r.torch, 7) +
      pad(r.cards, 7) +
      r.humanTDs + '/' + r.cpuTDs
    );
  });

  return allResults;
}
