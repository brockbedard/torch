/**
 * TORCH — Detailed Play-by-Play Game Simulator
 * Runs one full game with detailed output for every play.
 */

import { GameState } from '../engine/gameState.js';
import { getOffenseRoster, getDefenseRoster } from '../data/players.js';
import { TORCH_CARDS } from '../data/torchCards.js';
import { SENTINELS_OFF_PLAYS, SENTINELS_DEF_PLAYS } from '../data/sentinelsPlays.js';
import { WOLVES_OFF_PLAYS, WOLVES_DEF_PLAYS } from '../data/wolvesPlays.js';
import { STAGS_OFF_PLAYS, STAGS_DEF_PLAYS } from '../data/stagsPlays.js';
import { SERPENTS_OFF_PLAYS, SERPENTS_DEF_PLAYS } from '../data/serpentsPlays.js';
import { calcOffenseTorchPoints, calcDefenseTorchPoints } from '../engine/torchPoints.js';

var TEAM_NAMES = { sentinels: 'BOARS', wolves: 'DOLPHINS', stags: 'SPECTRES', serpents: 'SERPENTS' };
var _plays = {
  sentinels: { off: SENTINELS_OFF_PLAYS, def: SENTINELS_DEF_PLAYS },
  wolves: { off: WOLVES_OFF_PLAYS, def: WOLVES_DEF_PLAYS },
  stags: { off: STAGS_OFF_PLAYS, def: STAGS_DEF_PLAYS },
  serpents: { off: SERPENTS_OFF_PLAYS, def: SERPENTS_DEF_PLAYS },
};

function pad(s, len) { s = String(s); while (s.length < len) s += ' '; return s; }
function rpad(s, len) { s = String(s); while (s.length < len) s = ' ' + s; return s; }

function teamLabel(poss, gs) {
  var tid = poss === 'CT' ? gs.ctTeamId : gs.irTeamId;
  return TEAM_NAMES[tid] || tid;
}

function sideLabel(poss, gs) {
  return poss === gs.humanTeam ? 'YOU' : 'CPU';
}

function fieldPos(ballPos, poss) {
  // Convert 0-100 to readable field position
  if (poss === 'CT') {
    if (ballPos <= 50) return 'OWN ' + ballPos;
    return 'OPP ' + (100 - ballPos);
  } else {
    if (ballPos >= 50) return 'OWN ' + (100 - ballPos);
    return 'OPP ' + ballPos;
  }
}

function torchCardName(id) {
  if (!id) return null;
  var c = TORCH_CARDS.find(function(tc) { return tc.id === id; });
  return c ? c.name : id;
}

export function runPlayByPlay(userTeam, oppTeam, difficulty) {
  userTeam = userTeam || 'stags';
  oppTeam = oppTeam || 'sentinels';
  difficulty = difficulty || 'MEDIUM';

  var gs = new GameState({
    humanTeam: 'CT', difficulty: difficulty,
    ctOffHand: _plays[userTeam].off.slice(0, 5),
    ctDefHand: _plays[userTeam].def.slice(0, 5),
    irOffHand: _plays[oppTeam].off.slice(0, 5),
    irDefHand: _plays[oppTeam].def.slice(0, 5),
    ctOffRoster: getOffenseRoster(userTeam).slice(0, 4),
    ctDefRoster: getDefenseRoster(userTeam).slice(0, 4),
    irOffRoster: getOffenseRoster(oppTeam).slice(0, 4),
    irDefRoster: getDefenseRoster(oppTeam).slice(0, 4),
    ctTeamId: userTeam, irTeamId: oppTeam,
  });

  // Box score accumulators
  var box = {
    CT: { plays: 0, yards: 0, tds: 0, fgs: 0, turnovers: 0, firstDowns: 0, sacks: 0, torchPts: 0, cardsUsed: [] },
    IR: { plays: 0, yards: 0, tds: 0, fgs: 0, turnovers: 0, firstDowns: 0, sacks: 0, torchPts: 0, cardsUsed: [] },
  };

  // Player stat tracking
  var playerStats = {};
  function trackPlayer(p, stat, val) {
    if (!p || !p.id) return;
    if (!playerStats[p.id]) playerStats[p.id] = { name: p.name || p.firstName, pos: p.pos, team: null, snaps: 0, yards: 0, tds: 0, turnovers: 0, sacks: 0 };
    playerStats[p.id][stat] = (playerStats[p.id][stat] || 0) + (val || 1);
  }

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                    TORCH FOOTBALL — GAME DAY                    ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log('║  YOU: ' + pad(TEAM_NAMES[userTeam], 12) + ' vs  CPU: ' + pad(TEAM_NAMES[oppTeam], 12) + '  Difficulty: ' + pad(difficulty, 6) + ' ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');

  var playNum = 0;
  var driveNum = 0;
  var lastPoss = null;
  var maxLoops = 300;
  var loopCount = 0;

  function printDriveHeader() {
    driveNum++;
    var who = sideLabel(gs.possession, gs) + ' (' + teamLabel(gs.possession, gs) + ')';
    var fp = fieldPos(gs.ballPosition, gs.possession);
    console.log('');
    console.log('── DRIVE #' + driveNum + ' ── ' + who + ' OFFENSE ── Ball at ' + fp + ' ──');
  }

  function printScore() {
    console.log('   ┌─ SCORE: ' + TEAM_NAMES[userTeam] + ' ' + gs.ctScore + ' - ' + TEAM_NAMES[oppTeam] + ' ' + gs.irScore + '  |  TORCH: YOU ' + gs.ctTorchPts + ' / CPU ' + gs.irTorchPts + ' ─┐');
  }

  // Opening kickoff
  console.log('═══ 1ST HALF ═══');
  console.log('Opening kickoff — ' + teamLabel(gs.possession, gs) + ' receives');
  printDriveHeader();

  for (var half = 0; half < 2; half++) {
    if (half === 1) {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════════════╗');
      console.log('║                          HALFTIME                               ║');
      printScore();
      console.log('╚══════════════════════════════════════════════════════════════════╝');

      var prevCards = gs.cpuTorchCards.length;
      gs.halftimeShop();
      if (gs.cpuTorchCards.length > prevCards) {
        console.log('   CPU bought: ' + torchCardName(gs.cpuTorchCards[gs.cpuTorchCards.length - 1]));
      }
      gs.startSecondHalf();
      gs.kickoffFlip();
      console.log('');
      console.log('═══ 2ND HALF ═══');
      console.log('2nd half kickoff — ' + teamLabel(gs.possession, gs) + ' receives');
      lastPoss = null;
      printDriveHeader();
    }

    while (!gs.gameOver && loopCount < maxLoops) {
      loopCount++;
      if (gs.needsHalftime) break;

      // Track drive changes
      if (gs.possession !== lastPoss && lastPoss !== null) {
        printDriveHeader();
      }
      lastPoss = gs.possession;

      // 4th down decisions
      if (gs.down === 4) {
        var decision = gs.ai4thDownDecision();
        if (decision === 'punt' && gs.canSpecialTeams()) {
          playNum++;
          var puntRes = gs.punt();
          box[lastPoss].plays++;
          console.log('   #' + rpad(String(playNum), 3) + '  4th down — PUNT: ' + puntRes.label);
          printScore();
          lastPoss = gs.possession;
          printDriveHeader();
          continue;
        } else if (decision === 'field_goal' && gs.canAttemptFG()) {
          playNum++;
          var fgRes = gs.attemptFieldGoal();
          box[lastPoss].plays++;
          if (fgRes.made) box[lastPoss].fgs++;
          console.log('   #' + rpad(String(playNum), 3) + '  4th down — FG ATTEMPT: ' + fgRes.label);
          printScore();
          if (fgRes.made) {
            lastPoss = gs.possession;
            printDriveHeader();
          }
          continue;
        }
        // else: go for it (falls through to normal snap)
      }

      try {
        var prevCtPts = gs.ctTorchPts;
        var prevIrPts = gs.irTorchPts;
        var prevCtScore = gs.ctScore;
        var prevIrScore = gs.irScore;
        var snapPoss = gs.possession;

        var res = gs.executeSnap();
        if (!res || !res.result) continue;
        playNum++;

        var r = res.result;
        var offTeam = teamLabel(snapPoss, gs);
        var offSide = sideLabel(snapPoss, gs);
        var yds = r.yards || 0;

        // Track box score
        box[snapPoss].plays++;
        box[snapPoss].yards += yds;
        if (res.gotFirstDown) box[snapPoss].firstDowns++;
        if (r.isSack) {
          var defPoss = snapPoss === 'CT' ? 'IR' : 'CT';
          box[defPoss].sacks++;
        }

        // Track player stats
        if (res.featuredOff) {
          trackPlayer(res.featuredOff, 'snaps', 1);
          trackPlayer(res.featuredOff, 'yards', yds);
          if (r.isTouchdown) trackPlayer(res.featuredOff, 'tds', 1);
          if (r.isInterception || r.isFumbleLost) trackPlayer(res.featuredOff, 'turnovers', 1);
          playerStats[res.featuredOff.id].team = snapPoss;
        }
        if (res.featuredDef) {
          trackPlayer(res.featuredDef, 'snaps', 1);
          if (r.isSack) trackPlayer(res.featuredDef, 'sacks', 1);
          playerStats[res.featuredDef.id].team = snapPoss === 'CT' ? 'IR' : 'CT';
        }

        // Build play line
        var downStr = gs.down <= 4 ? res.result.isTouchdown ? '' : '' : '';
        var preDown = (gs.down || '-') + '&' + (gs.distance || '-');
        // Use the pre-snap down info from the result
        var line = '   #' + rpad(String(playNum), 3) + '  ';
        line += pad(offSide, 4);

        // Play + player picks
        var offName = res.featuredOff ? (res.featuredOff.firstName || res.featuredOff.name || '?') : '?';
        var defName = res.featuredDef ? (res.featuredDef.firstName || res.featuredDef.name || '?') : '?';

        line += pad(res.offPlay.name, 18);
        line += 'w/ ' + pad(offName, 14);
        line += 'vs ' + pad(res.defPlay.name, 16);
        line += pad(defName, 14);

        // Result
        if (r.isTouchdown) {
          line += ' TOUCHDOWN! +' + yds + ' yds';
        } else if (r.isInterception) {
          line += ' INTERCEPTED!';
        } else if (r.isFumbleLost) {
          line += ' FUMBLE LOST!';
        } else if (r.isSack) {
          line += ' SACKED! ' + yds + ' yds';
        } else if (r.isIncomplete) {
          line += ' Incomplete';
        } else {
          var sign = yds >= 0 ? '+' : '';
          line += ' ' + sign + yds + ' yds';
          if (res.gotFirstDown) line += ' FIRST DOWN';
        }

        // Torch cards
        if (res.offCard) {
          line += '  [' + torchCardName(res.offCard) + ']';
          box[snapPoss].cardsUsed.push(torchCardName(res.offCard));
        }
        if (res.defCard) {
          var defCardPoss = snapPoss === 'CT' ? 'IR' : 'CT';
          line += '  {' + torchCardName(res.defCard) + '}';
          box[defCardPoss].cardsUsed.push(torchCardName(res.defCard));
        }

        console.log(line);

        // TORCH points earned this play
        var ctGain = gs.ctTorchPts - prevCtPts;
        var irGain = gs.irTorchPts - prevIrPts;
        box.CT.torchPts = gs.ctTorchPts;
        box.IR.torchPts = gs.irTorchPts;

        if (ctGain > 0 || irGain > 0) {
          var ptLine = '         ';
          if (ctGain > 0) ptLine += TEAM_NAMES[userTeam] + ' +' + ctGain + ' TORCH  ';
          if (irGain > 0) ptLine += TEAM_NAMES[oppTeam] + ' +' + irGain + ' TORCH';
          console.log(ptLine);
        }

        // Handle events
        if (res.gameEvent === 'touchdown') {
          box[snapPoss].tds++;
          var convChoice = Math.random() < 0.15 ? '2pt' : 'xp';
          var conv = gs.handleConversion(convChoice);
          if (convChoice === 'xp') {
            console.log('         XP: GOOD (+1)');
          } else {
            console.log('         2PT CONVERSION: ' + (conv.success ? 'GOOD! (+2)' : 'NO GOOD'));
          }
          printScore();
          lastPoss = gs.possession;
          if (!gs.gameOver && !gs.needsHalftime) {
            console.log('   Kickoff — ' + teamLabel(gs.possession, gs) + ' receives');
            printDriveHeader();
          }
          continue;
        }

        if (res.gameEvent === 'turnover_td') {
          var scorerPoss = snapPoss === 'CT' ? 'IR' : 'CT';
          box[scorerPoss].tds++;
          box[snapPoss].turnovers++;
          console.log('         PICK SIX / SCOOP & SCORE!');
          printScore();
          lastPoss = gs.possession;
          if (!gs.gameOver && !gs.needsHalftime) printDriveHeader();
          continue;
        }

        if (res.gameEvent === 'interception' || res.gameEvent === 'fumble_lost') {
          box[snapPoss].turnovers++;
          printScore();
          lastPoss = gs.possession;
          printDriveHeader();
          continue;
        }

        if (res.gameEvent === 'turnover_on_downs') {
          console.log('         TURNOVER ON DOWNS');
          printScore();
          // possession already flipped
          lastPoss = gs.possession;
          printDriveHeader();
          continue;
        }

      } catch (e) {
        console.log('   [ERROR: ' + e.message + ']');
      }
    }
  }

  // === FINAL SCORE ===
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                         FINAL SCORE                             ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  var winner = gs.ctScore > gs.irScore ? TEAM_NAMES[userTeam] + ' WIN!' : gs.irScore > gs.ctScore ? TEAM_NAMES[oppTeam] + ' WIN!' : 'TIE GAME!';
  console.log('║   ' + pad(TEAM_NAMES[userTeam], 12) + rpad(String(gs.ctScore), 3) + '  -  ' + pad(String(gs.irScore), 3) + pad(TEAM_NAMES[oppTeam], 12) + '     ' + pad(winner, 16) + '║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  // === BOX SCORE ===
  console.log('');
  console.log('┌──────────────────────── BOX SCORE ────────────────────────┐');
  console.log('│  ' + pad('', 18) + pad(TEAM_NAMES[userTeam], 14) + pad(TEAM_NAMES[oppTeam], 14) + '│');
  console.log('│  ' + pad('Score', 18) + pad(String(gs.ctScore), 14) + pad(String(gs.irScore), 14) + '│');
  console.log('│  ' + pad('Total Plays', 18) + pad(String(box.CT.plays), 14) + pad(String(box.IR.plays), 14) + '│');
  console.log('│  ' + pad('Total Yards', 18) + pad(String(box.CT.yards), 14) + pad(String(box.IR.yards), 14) + '│');
  console.log('│  ' + pad('Touchdowns', 18) + pad(String(box.CT.tds), 14) + pad(String(box.IR.tds), 14) + '│');
  console.log('│  ' + pad('Field Goals', 18) + pad(String(box.CT.fgs), 14) + pad(String(box.IR.fgs), 14) + '│');
  console.log('│  ' + pad('First Downs', 18) + pad(String(box.CT.firstDowns), 14) + pad(String(box.IR.firstDowns), 14) + '│');
  console.log('│  ' + pad('Turnovers', 18) + pad(String(box.CT.turnovers), 14) + pad(String(box.IR.turnovers), 14) + '│');
  console.log('│  ' + pad('Sacks', 18) + pad(String(box.CT.sacks), 14) + pad(String(box.IR.sacks), 14) + '│');
  console.log('│  ' + pad('TORCH Points', 18) + pad(String(gs.ctTorchPts), 14) + pad(String(gs.irTorchPts), 14) + '│');
  console.log('└──────────────────────────────────────────────────────────┘');

  // Torch cards used
  if (box.CT.cardsUsed.length > 0 || box.IR.cardsUsed.length > 0) {
    console.log('');
    console.log('┌──────────────────── TORCH CARDS USED ────────────────────┐');
    if (box.CT.cardsUsed.length > 0) {
      console.log('│  ' + TEAM_NAMES[userTeam] + ': ' + box.CT.cardsUsed.join(', '));
    }
    if (box.IR.cardsUsed.length > 0) {
      console.log('│  ' + TEAM_NAMES[oppTeam] + ': ' + box.IR.cardsUsed.join(', '));
    }
    console.log('└──────────────────────────────────────────────────────────┘');
  }

  // Player stats
  console.log('');
  console.log('┌───────────────────── PLAYER STATS ─────────────────────────┐');
  console.log('│  ' + pad('Player', 22) + pad('Pos', 5) + pad('Team', 10) + pad('Snaps', 7) + pad('Yards', 7) + pad('TDs', 5) + pad('TO', 5) + pad('Sacks', 6) + '│');
  console.log('│  ' + '─'.repeat(55) + '│');

  var sortedPlayers = Object.values(playerStats).sort(function(a, b) { return b.yards - a.yards; });
  sortedPlayers.forEach(function(p) {
    var tName = p.team === 'CT' ? TEAM_NAMES[userTeam] : TEAM_NAMES[oppTeam];
    console.log('│  ' + pad(p.name, 22) + pad(p.pos, 5) + pad(tName, 10) + pad(String(p.snaps), 7) + pad(String(p.yards), 7) + pad(String(p.tds), 5) + pad(String(p.turnovers), 5) + pad(String(p.sacks), 6) + '│');
  });
  console.log('└───────────────────────────────────────────────────────────┘');

  console.log('');
  console.log('Total plays: ' + gs.totalPlays + '  |  Drives: ' + (gs.stats.ctDrives + gs.stats.irDrives));
  console.log('');
}

// CLI entry
var args = process.argv.slice(2);
var userTeam = args[0] || 'stags';
var oppTeam = args[1] || 'sentinels';
var diff = args[2] || 'MEDIUM';
runPlayByPlay(userTeam, oppTeam, diff);
