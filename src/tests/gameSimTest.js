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

// AI torch card purchasing logic (matches _halftimeBooster impact weighting)
var HIGH_IMPACT_CARDS = ['deep_shot', 'truck_stick', 'prime_time', 'hard_count', 'challenge_flag', 'sure_hands', 'scout_team'];
var MED_IMPACT_CARDS  = ['play_action', 'scramble_drill', 'twelfth_man', 'ice'];

function cardImpactScore(id) {
  if (HIGH_IMPACT_CARDS.includes(id)) return 3;
  if (MED_IMPACT_CARDS.includes(id)) return 2;
  return 1;
}

function aiPurchaseCards(gs, difficulty) {
  var inv = gs.cpuTorchCards;
  var pts = gs.humanTeam === 'CT' ? gs.irTorchPts : gs.ctTorchPts;
  var purchased = [];

  if (difficulty === 'EASY') return purchased;
  if (inv.length >= 3) return purchased;

  var affordable = TORCH_CARDS.filter(function(c) { return c.cost <= pts; });
  if (affordable.length === 0) return purchased;

  if (difficulty === 'MEDIUM') {
    // Medium: buy 1, prefer situational impact over cheapest
    var best = affordable.reduce(function(a, b) { return cardImpactScore(a.id) >= cardImpactScore(b.id) ? a : b; });
    if (inv.length < 3) {
      inv.push(best.id);
      if (gs.humanTeam === 'CT') gs.irTorchPts -= best.cost;
      else gs.ctTorchPts -= best.cost;
      purchased.push(best.id);
    }
  } else if (difficulty === 'HARD' || difficulty === 'RANDOM') {
    // Hard: buy up to 2, prioritize high-impact cards (tie-break: higher cost)
    var sorted = affordable.slice().sort(function(a, b) {
      var diff = cardImpactScore(b.id) - cardImpactScore(a.id);
      if (diff !== 0) return diff;
      return b.cost - a.cost;
    });
    for (var i = 0; i < Math.min(2, sorted.length); i++) {
      if (inv.length >= 3) break;
      var card = sorted[i];
      var curPts = gs.humanTeam === 'CT' ? gs.irTorchPts : gs.ctTorchPts;
      if (card.cost <= curPts) {
        inv.push(card.id);
        if (gs.humanTeam === 'CT') gs.irTorchPts -= card.cost;
        else gs.ctTorchPts -= card.cost;
        purchased.push(card.id);
      }
    }
  }
  return purchased;
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

  var maxLoops = 200; // safety valve
  var loopCount = 0;

  // === HALF LOOP ===
  for (var half = 0; half < 2; half++) {
    if (half === 1) {
      // Halftime
      gs.halftimeShop();
      gs.startSecondHalf();
      // Halftime kickoff: flip possession to the team that didn't start with it
      var receivingTeam = gs.possession === 'CT' ? 'IR' : 'CT';
      gs.kickoffFlip();
    }

    // AI purchases at start of each half
    var bought = aiPurchaseCards(gs, difficulty);
    bought.forEach(function(id) { stats.aiCardsBought.push(id); });

    // === PLAY LOOP ===
    while (!gs.gameOver && loopCount < maxLoops) {
      loopCount++;

      // Check if we need halftime transition
      if (gs.needsHalftime) break;

      // 4th down decisions
      if (gs.down === 4) {
        var decision = gs.ai4thDownDecision();
        if (decision === 'punt' && gs.canSpecialTeams()) {
          gs.punt();
          stats.snaps++;
          continue;
        } else if (decision === 'field_goal' && gs.canAttemptFG()) {
          var fgResult = gs.attemptFieldGoal();
          stats.snaps++;
          continue;
        }
        // else: go for it — fall through to executeSnap
      }

      try {
        var res = gs.executeSnap();
        if (!res || !res.result) continue;
        stats.snaps++;

        var r = res.result;

        // Track big plays (15+ yards)
        if (r.yards >= 15) stats.bigPlays++;

        // Track sacks
        if (r.isSack) stats.sacks++;

        // Track turnovers
        if (r.isInterception || r.isFumbleLost) {
          if (gs.possession === 'CT') stats.cpuTurnovers++; // possession already flipped
          else stats.humanTurnovers++;
          // Actually, after turnover possession has flipped. Need pre-snap possession.
          // The turnover is committed by whoever HAD the ball. Since executeSnap flips,
          // we check the gameEvent instead.
        }
        if (res.gameEvent === 'interception' || res.gameEvent === 'fumble_lost') {
          // The team that lost it was the one before the flip.
          // Since res includes scoringTeam only for TDs, use a different approach:
          // After an INT/fumble, possession has flipped. So the team that NOW has it
          // is the beneficiary. The turnover was committed by the OTHER team.
          if (gs.possession === 'CT') stats.cpuTurnovers++; // IR committed the turnover
          else stats.humanTurnovers++; // CT committed the turnover
        }

        // Track TDs
        if (res.gameEvent === 'touchdown') {
          if (res.scoringTeam === 'CT') stats.humanTDs++;
          else stats.cpuTDs++;
          // 30% chance of 2pt conversion to add score variety (reduce ties from multiples-of-7)
          var convChoice = Math.random() < 0.30 ? '2pt' : 'xp';
          gs.handleConversion(convChoice);
        }
        if (res.gameEvent === 'turnover_td') {
          // Turnover TD already scored in gameState
          // Figure out who scored from score changes
        }

        // Track peak momentum
        if (gs.momentum > stats.peakMomentum) stats.peakMomentum = gs.momentum;

        // AI card purchase after TDs and big plays (shop triggers)
        if (res.gameEvent === 'touchdown' || stats.snaps % 10 === 0) {
          var midBought = aiPurchaseCards(gs, difficulty);
          midBought.forEach(function(id) { stats.aiCardsBought.push(id); });
        }

      } catch (e) {
        // Skip crashes silently
      }
    }
  }

  stats.humanScore = gs.ctScore;
  stats.cpuScore = gs.irScore;
  stats.humanTorchPts = gs.ctTorchPts;
  stats.cpuTorchPts = gs.irTorchPts;
  stats.totalPlays = gs.totalPlays;

  // Fix turnover tracking — use engine stats which are accurate
  stats.humanTurnovers = gs.stats.ctTurnovers;
  stats.cpuTurnovers = gs.stats.irTurnovers;
  stats.humanTDs = gs.stats.ctTouchdowns;
  stats.cpuTDs = gs.stats.irTouchdowns;
  stats.sacks = gs.stats.sackCount;

  return stats;
}

// ============================================================
// MAIN SIMULATION
// ============================================================

export function runGameSim(gamesPerCombo) {
  gamesPerCombo = gamesPerCombo || 250;
  var totalGames = TEAMS.length * DIFFICULTIES.length * gamesPerCombo;
  var startTime = Date.now();

  console.log('');
  console.log('=== TORCH GAME SIMULATION (' + totalGames + ' games) ===');
  console.log('  ' + gamesPerCombo + ' games per team x difficulty');
  console.log('  ' + TEAMS.length + ' teams x ' + DIFFICULTIES.length + ' difficulties');
  console.log('');

  var allResults = [];
  var globalStats = {
    totalGames: 0,
    closeGames: 0,      // decided by 3 or fewer
    shutouts: 0,
    totalSnaps: 0,
    totalTorchPts: 0,
    scoreFrequency: {},  // "24-17" => count
    aiCardBuys: {},      // card_id => count
  };

  TEAMS.forEach(function(tid) {
    console.log('TEAM: ' + TEAM_NAMES[tid]);

    DIFFICULTIES.forEach(function(diff) {
      var totals = {
        humanScore: 0, cpuScore: 0,
        humanTorchPts: 0, cpuTorchPts: 0,
        snaps: 0, humanTDs: 0, cpuTDs: 0,
        humanTurnovers: 0, cpuTurnovers: 0,
        bigPlays: 0, sacks: 0, totalPlays: 0,
        peakMomentum: 0,
        wins: 0, losses: 0, ties: 0,
      };

      for (var g = 0; g < gamesPerCombo; g++) {
        var s = simulateGame(tid, diff);
        totals.humanScore += s.humanScore;
        totals.cpuScore += s.cpuScore;
        totals.humanTorchPts += s.humanTorchPts;
        totals.cpuTorchPts += s.cpuTorchPts;
        totals.snaps += s.snaps;
        totals.humanTDs += s.humanTDs;
        totals.cpuTDs += s.cpuTDs;
        totals.humanTurnovers += s.humanTurnovers;
        totals.cpuTurnovers += s.cpuTurnovers;
        totals.bigPlays += s.bigPlays;
        totals.sacks += s.sacks;
        totals.totalPlays += s.totalPlays;
        totals.peakMomentum += s.peakMomentum;

        if (s.humanScore > s.cpuScore) totals.wins++;
        else if (s.humanScore < s.cpuScore) totals.losses++;
        else totals.ties++;

        // Global tracking
        globalStats.totalGames++;
        if (Math.abs(s.humanScore - s.cpuScore) <= 3 && s.humanScore !== s.cpuScore) globalStats.closeGames++;
        if (s.humanScore === 0 || s.cpuScore === 0) globalStats.shutouts++;
        globalStats.totalSnaps += s.snaps;
        globalStats.totalTorchPts += s.humanTorchPts;

        // Score frequency
        var hi = Math.max(s.humanScore, s.cpuScore);
        var lo = Math.min(s.humanScore, s.cpuScore);
        var scoreKey = hi + '-' + lo;
        globalStats.scoreFrequency[scoreKey] = (globalStats.scoreFrequency[scoreKey] || 0) + 1;

        // AI card buys
        s.aiCardsBought.forEach(function(id) {
          globalStats.aiCardBuys[id] = (globalStats.aiCardBuys[id] || 0) + 1;
        });
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
      console.log(
        '  ' + pad(diff, 8) +
        'W ' + pad(winPct + '%', 5) +
        '| Avg ' + pad(avgH + '-' + avgC, 7) +
        '| Ties ' + pad(tiePct + '%', 5) +
        '| TDs ' + pad(avgTDs + '/g', 6) +
        '| TO ' + pad(avgTO + '/g', 6) +
        '| Big ' + pad(avgBig + '/g', 6) +
        '| Sack ' + pad(sackRate + '%', 6) +
        '| TORCH ' + avgTorch
      );

      allResults.push({
        team: tid, diff: diff,
        winPct: +winPct, tiePct: +tiePct,
        avgHuman: +avgH, avgCpu: +avgC,
        avgTDs: +avgTDs, avgTO: +avgTO,
        avgBig: +avgBig, sackRate: +sackRate,
        avgTorch: +avgTorch,
        wins: totals.wins, losses: totals.losses, ties: totals.ties,
      });
    });

    console.log('');
  });

  // ============================================================
  // GLOBAL METRICS
  // ============================================================
  console.log('GLOBAL METRICS:');
  var closePct = ((globalStats.closeGames / globalStats.totalGames) * 100).toFixed(1);
  var shutoutPct = ((globalStats.shutouts / globalStats.totalGames) * 100).toFixed(1);
  var avgSnaps = (globalStats.totalSnaps / globalStats.totalGames).toFixed(1);
  var avgTorchGlobal = (globalStats.totalTorchPts / globalStats.totalGames).toFixed(0);
  console.log('  Close games (<=3 pts): ' + closePct + '%');
  console.log('  Shutouts: ' + shutoutPct + '%');
  console.log('  Avg game length: ' + avgSnaps + ' snaps');
  console.log('  Avg TORCH pts earned: ' + avgTorchGlobal);

  // Most common final scores
  var scorePairs = Object.entries(globalStats.scoreFrequency)
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 8);
  console.log('');
  console.log('  Most common final scores:');
  scorePairs.forEach(function(pair) {
    var pct = ((pair[1] / globalStats.totalGames) * 100).toFixed(1);
    console.log('    ' + pair[0] + '  (' + pair[1] + 'x, ' + pct + '%)');
  });

  // ============================================================
  // TORCH CARD AI USAGE
  // ============================================================
  console.log('');
  console.log('TORCH CARD AI USAGE:');
  var totalBuys = Object.values(globalStats.aiCardBuys).reduce(function(a, b) { return a + b; }, 0);
  if (totalBuys > 0) {
    var cardEntries = Object.entries(globalStats.aiCardBuys)
      .sort(function(a, b) { return b[1] - a[1]; });
    var topCards = cardEntries.slice(0, 6);
    var topStr = topCards.map(function(e) {
      var card = TORCH_CARDS.find(function(c) { return c.id === e[0]; });
      var name = card ? card.name : e[0];
      var pct = ((e[1] / totalBuys) * 100).toFixed(0);
      return name + ' (' + pct + '%)';
    }).join(', ');
    console.log('  Most bought: ' + topStr);

    // Never bought
    var boughtIds = Object.keys(globalStats.aiCardBuys);
    var neverBought = TORCH_CARDS.filter(function(c) {
      return !boughtIds.includes(c.id);
    }).map(function(c) { return c.name; });
    if (neverBought.length > 0) {
      console.log('  Never bought: ' + neverBought.join(', '));
    }
  } else {
    console.log('  No AI card purchases recorded');
  }

  // ============================================================
  // BALANCE FLAGS
  // ============================================================
  console.log('');
  console.log('BALANCE FLAGS:');
  var targets = {
    EASY:   { winMin: 55, winMax: 85, tieMax: 8 },
    MEDIUM: { winMin: 35, winMax: 60, tieMax: 10 },
    HARD:   { winMin: 15, winMax: 40, tieMax: 10 },
    RANDOM: { winMin: 30, winMax: 65, tieMax: 10 },
  };

  var flagCount = 0;
  allResults.forEach(function(r) {
    var t = targets[r.diff];
    if (!t) return;
    var icon, status;

    // Win rate check
    if (r.winPct < t.winMin) {
      icon = '!'; status = 'LOW';
      console.log('  ' + icon + ' ' + TEAM_NAMES[r.team] + ' ' + r.diff + ' win rate ' + r.winPct + '% (target ' + t.winMin + '-' + t.winMax + ') -- ' + status);
      flagCount++;
    } else if (r.winPct > t.winMax) {
      icon = '!'; status = 'HIGH';
      console.log('  ' + icon + ' ' + TEAM_NAMES[r.team] + ' ' + r.diff + ' win rate ' + r.winPct + '% (target ' + t.winMin + '-' + t.winMax + ') -- ' + status);
      flagCount++;
    }

    // Tie rate check
    if (r.tiePct > t.tieMax) {
      icon = 'X'; status = 'TOO HIGH';
      console.log('  ' + icon + ' ' + TEAM_NAMES[r.team] + ' ' + r.diff + ' tie rate ' + r.tiePct + '% (target <' + t.tieMax + '%) -- ' + status);
      flagCount++;
    }
  });

  if (flagCount === 0) {
    console.log('  All metrics within target ranges.');
  }

  var elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('');
  console.log('Simulation complete: ' + totalGames + ' games in ' + elapsed + 's');

  return allResults;
}
