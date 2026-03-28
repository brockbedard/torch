/**
 * TORCH — End Game Screen (Replay Loop Design)
 * Three zones: Result (top) → MVP + Points + Open Loop (middle) → PLAY AGAIN (bottom).
 * Every element drives a replay or gets out of the way.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, clearGameSave } from '../../state.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { getFullRoster } from '../../data/players.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { buildMaddenPlayer } from '../components/cards.js';
import AudioStateManager from '../../engine/audioManager.js';
import { recordDailyResult } from './dailyDrive.js';
import { updateStreak, getStreak, getH2H } from '../../engine/streaks.js';
import { checkAchievements } from '../../engine/achievements.js';
import { recordGameStats } from '../../engine/careerStats.js';
import { recordGame } from '../../engine/gameHistory.js';

// ── MVP CALCULATION ──
function calculateMVP(snapLog, teamId) {
  var scores = {};
  if (!snapLog) return null;

  snapLog.forEach(function(snap) {
    if (!snap) return;
    // Score offensive featured players on CT snaps
    if (snap.team === 'CT' && snap.featuredOffId) {
      var id = snap.featuredOffId;
      if (!scores[id]) scores[id] = 0;
      if (snap.event === 'touchdown') scores[id] += 25;
      if (snap.yards >= 15) scores[id] += 10;
      if (snap.gotFirstDown) scores[id] += 5;
      if (snap.yards >= 5) scores[id] += 2;
    }
    // Score defensive featured players on IR snaps (user on defense)
    if (snap.team === 'IR' && snap.featuredDefId) {
      var did = snap.featuredDefId;
      if (!scores[did]) scores[did] = 0;
      if (snap.event === 'interception') scores[did] += 15;
      if (snap.event === 'fumble_lost') scores[did] += 12;
      if (snap.yards <= 0) scores[did] += 5;
      if (snap.yards <= -3) scores[did] += 5;
    }
  });

  var entries = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
  if (!entries.length || entries[0][1] < 10) return null;

  var mvpId = entries[0][0];
  var roster = getFullRoster(teamId);
  return roster.find(function(p) { return p.id === mvpId; }) || null;
}

function getMVPStatLine(mvpId, snapLog) {
  var tds = 0, yards = 0, ints = 0, sacks = 0, bigPlays = 0;
  if (!snapLog) return '';

  snapLog.forEach(function(snap) {
    if (!snap) return;
    if (snap.featuredOffId === mvpId || snap.featuredDefId === mvpId) {
      if (snap.event === 'touchdown') tds++;
      yards += snap.yards || 0;
      if (snap.event === 'interception' && snap.featuredDefId === mvpId) ints++;
      if (snap.yards <= -3 && snap.featuredDefId === mvpId) sacks++;
      if (snap.yards >= 15) bigPlays++;
    }
  });

  var parts = [];
  if (tds > 0) parts.push(tds + ' TD' + (tds > 1 ? 's' : ''));
  if (Math.abs(yards) > 30) parts.push(Math.abs(yards) + ' yards');
  if (ints > 0) parts.push(ints + ' INT' + (ints > 1 ? 's' : ''));
  if (sacks > 0) parts.push(sacks + ' sack' + (sacks > 1 ? 's' : ''));
  if (bigPlays > 1 && parts.length < 2) parts.push(bigPlays + ' big plays');
  return parts.slice(0, 2).join(' \u00b7 ');
}

// ── OPEN LOOP ──
function getOpenLoop(torchPoints) {
  // Can afford right now?
  var buyable = TORCH_CARDS.filter(function(c) { return c.cost <= torchPoints; }).sort(function(a, b) { return b.cost - a.cost; });
  if (buyable.length > 0) {
    return { icon: '\uD83D\uDD25', text: 'You can afford ' + buyable[0].name + '!', canBuy: true };
  }
  // Nearest card can't yet afford
  var nearest = TORCH_CARDS.filter(function(c) { return c.cost > torchPoints; }).sort(function(a, b) { return (a.cost - torchPoints) - (b.cost - torchPoints); });
  if (nearest.length > 0) {
    var gap = nearest[0].cost - torchPoints;
    return { icon: '\uD83D\uDD13', text: gap + ' more \u2192 ' + nearest[0].name, canBuy: false };
  }
  return null;
}

// ── PER-TEAM RECORDS ──
function updateTeamRecord(teamId, won, tied) {
  var records = JSON.parse(localStorage.getItem('torch_team_records') || '{}');
  if (!records[teamId]) records[teamId] = { wins: 0, losses: 0, ties: 0 };
  if (tied) records[teamId].ties++;
  else if (won) records[teamId].wins++;
  else records[teamId].losses++;
  localStorage.setItem('torch_team_records', JSON.stringify(records));
}

export function getTeamRecord(teamId) {
  var records = JSON.parse(localStorage.getItem('torch_team_records') || '{}');
  return records[teamId] || { wins: 0, losses: 0, ties: 0 };
}

// ── HIGHLIGHT EXTRACTION ──
function extractHighlights(snapLog) {
  if (!snapLog) return { best: null, worst: null, plays: [] };

  var highlights = [];
  snapLog.forEach(function(snap, i) {
    if (!snap) return;
    var score = 0;
    var type = 'play';
    var label = snap.result || '';

    if (snap.event === 'touchdown' && snap.team === 'CT') { score = 30; type = 'td'; }
    else if (snap.event === 'touchdown' && snap.team === 'IR') { score = -20; type = 'opp_td'; }
    else if (snap.event === 'interception' && snap.team === 'IR') { score = 20; type = 'pick'; }
    else if (snap.event === 'interception' && snap.team === 'CT') { score = -25; type = 'threw_pick'; }
    else if (snap.yards >= 20 && snap.team === 'CT') { score = 15; type = 'explosive'; }
    else if (snap.yards >= 15 && snap.team === 'CT') { score = 10; type = 'big_play'; }
    else if (snap.yards <= -5) { score = snap.team === 'CT' ? -10 : 10; type = 'sack'; }

    if (Math.abs(score) >= 10) {
      highlights.push({ snap: i + 1, score: score, type: type, label: label, team: snap.team });
    }
  });

  highlights.sort(function(a, b) { return b.score - a.score; });

  return {
    best: highlights[0] || null,
    worst: highlights.length > 1 ? highlights[highlights.length - 1] : null,
    plays: highlights.slice(0, 6)
  };
}

function getTypeIndicator(type) {
  switch (type) {
    case 'td':        return { icon: 'TD', color: '#EBB010' };
    case 'opp_td':    return { icon: 'TD', color: '#ff0040' };
    case 'pick':      return { icon: 'INT', color: '#00ff44' };
    case 'threw_pick':return { icon: 'INT', color: '#ff0040' };
    case 'explosive': return { icon: 'BIG', color: '#EBB010' };
    case 'big_play':  return { icon: 'BIG', color: '#EBB010' };
    case 'sack':      return { icon: 'SCK', color: '#ff0040' };
    default:          return { icon: 'PLY', color: '#888' };
  }
}

// ── FILM ROOM MODAL ──
function showFilmRoom(parent, gs) {
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:auto;';
  var bd = document.createElement('div');
  bd.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.5);';
  bd.onclick = function() { gsap.to(ov, { opacity: 0, duration: 0.2, onComplete: function() { ov.remove(); } }); };
  ov.appendChild(bd);

  var sheet = document.createElement('div');
  sheet.style.cssText = "position:relative;z-index:1;background:#141008;border-top:2px solid #FF6B00;border-radius:12px 12px 0 0;padding:14px 12px 28px;max-height:75vh;overflow-y:auto;";

  var highlights = extractHighlights(gs.snapLog);

  var totalScore = highlights.plays.reduce(function(s, h) { return s + h.score; }, 0);
  var grade = totalScore >= 80 ? 'A+' : totalScore >= 50 ? 'A' : totalScore >= 30 ? 'B+' : totalScore >= 10 ? 'B' : totalScore >= -10 ? 'C' : 'D';
  var gradeColor = totalScore >= 30 ? '#00ff44' : totalScore >= 0 ? '#EBB010' : '#ff0040';

  var html = "<div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#FF6B00;letter-spacing:2px;margin-bottom:12px;\">FILM ROOM</div>";

  // Play of the Game
  if (highlights.best) {
    var b = highlights.best;
    var bInd = getTypeIndicator(b.type);
    var bIsPositive = b.score > 0;
    html += "<div style=\"border:1px solid #EBB010;border-radius:8px;padding:10px 12px;margin-bottom:14px;background:rgba(235,176,16,0.05);\">" +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:2px;margin-bottom:6px;\">PLAY OF THE GAME</div>" +
      "<div style='display:flex;align-items:center;gap:8px;'>" +
        "<span style=\"font-family:'Teko';font-weight:700;font-size:13px;color:" + bInd.color + ";background:rgba(0,0,0,0.4);border-radius:4px;padding:2px 6px;letter-spacing:1px;\">" + bInd.icon + "</span>" +
        "<div style='flex:1;'>" +
          "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:13px;color:" + (bIsPositive ? '#00ff44' : '#ff0040') + ";line-height:1.3;\">" + b.label + "</div>" +
          "<div style=\"font-family:'Rajdhani';font-size:10px;color:#555;margin-top:1px;\">Snap " + b.snap + "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  // Key Moments
  var rest = highlights.plays.slice(highlights.best ? 1 : 0);
  if (rest.length > 0) {
    html += "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#888;letter-spacing:2px;margin-bottom:6px;\">KEY MOMENTS</div>";
    rest.forEach(function(h) {
      var ind = getTypeIndicator(h.type);
      var isPositive = h.score > 0;
      html += "<div style='display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #1a1a1a;'>" +
        "<span style=\"font-family:'Teko';font-weight:700;font-size:11px;color:" + ind.color + ";background:rgba(0,0,0,0.4);border-radius:4px;padding:1px 5px;letter-spacing:1px;flex-shrink:0;\">" + ind.icon + "</span>" +
        "<div style='flex:1;min-width:0;'>" +
          "<div style=\"font-family:'Rajdhani';font-size:11px;color:" + (isPositive ? '#00ff44' : '#ff0040') + ";font-weight:700;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\">" + h.label + "</div>" +
        "</div>" +
        "<div style=\"font-family:'Rajdhani';font-size:10px;color:#555;flex-shrink:0;margin-left:4px;\">S" + h.snap + "</div>" +
      "</div>";
    });
  }

  if (highlights.plays.length === 0) {
    html += "<div style=\"font-family:'Rajdhani';font-size:12px;color:#00ff44;text-align:center;padding:12px 0;\">Clean game, Coach. Nothing to review.</div>";
  }

  // Game Grade
  html += "<div style='margin-top:16px;text-align:center;border-top:1px solid #1a1a1a;padding-top:14px;'>" +
    "<div style=\"font-family:'Rajdhani';font-size:9px;color:#555;letter-spacing:2px;margin-bottom:4px;\">GAME GRADE</div>" +
    "<div style=\"font-family:'Teko';font-weight:700;font-size:40px;color:" + gradeColor + ";letter-spacing:4px;line-height:1;text-shadow:0 0 20px " + gradeColor + "44;\">" + grade + "</div>" +
  "</div>";

  sheet.innerHTML = html;

  ov.appendChild(sheet);
  parent.appendChild(ov);
  gsap.from(sheet, { y: 300, duration: 0.3, ease: 'power2.out' });
}

// ── HEADLINE GENERATOR ──
function generateHeadline(won, tied, hScore, cScore, team, opp, mvp, gs) {
  var margin = Math.abs(hScore - cScore);
  var blowout = margin >= 21;
  var close = margin <= 3;
  var shutout = (won && cScore === 0) || (!won && hScore === 0);
  var mvpName = mvp ? mvp.name.split(' ').pop() : null; // Last name

  if (won && shutout) {
    var shutoutLines = [
      team.name + ' BLANK ' + opp.name + ' IN DOMINANT SHUTOUT',
      'LIGHTS OUT! ' + team.name + ' SHUT DOWN ' + opp.name + ' ' + hScore + '-0',
      team.name + ' DEFENSE DELIVERS SHUTOUT MASTERPIECE',
    ];
    return shutoutLines[Math.floor(Math.random() * shutoutLines.length)];
  }
  if (won && blowout) {
    var blowoutLines = [
      team.name + ' ROUT ' + opp.name + ' IN ' + margin + '-POINT BLOWOUT',
      'NO CONTEST! ' + team.name + ' CRUISE PAST ' + opp.name,
      (mvpName || team.name) + ' LEADS ' + margin + '-POINT DEMOLITION OF ' + opp.name,
    ];
    return blowoutLines[Math.floor(Math.random() * blowoutLines.length)];
  }
  if (won && close) {
    var closeLines = [
      team.name + ' SURVIVE ' + opp.name + ' SCARE IN ' + hScore + '-' + cScore + ' THRILLER',
      'NAIL-BITER! ' + team.name + ' EDGE ' + opp.name + ' BY ' + margin,
      (mvpName || team.name) + ' DELIVERS IN CLUTCH ' + hScore + '-' + cScore + ' WIN',
    ];
    return closeLines[Math.floor(Math.random() * closeLines.length)];
  }
  if (won) {
    var winLines = [
      team.name + ' TAKE DOWN ' + opp.name + ' ' + hScore + '-' + cScore,
      (mvpName || team.name) + ' POWERS ' + team.name + ' PAST ' + opp.name,
      team.name + ' TRIUMPH OVER ' + opp.name + ' IN CONFERENCE CLASH',
    ];
    return winLines[Math.floor(Math.random() * winLines.length)];
  }
  if (tied) {
    return team.name + ' AND ' + opp.name + ' BATTLE TO ' + hScore + '-' + cScore + ' STALEMATE';
  }
  // Loss
  if (close) {
    return opp.name + ' ESCAPE WITH ' + cScore + '-' + hScore + ' VICTORY OVER ' + team.name;
  }
  var lossLines = [
    opp.name + ' HAND ' + team.name + ' A TOUGH ' + cScore + '-' + hScore + ' DEFEAT',
    team.name + ' FALL TO ' + opp.name + ' ' + cScore + '-' + hScore,
  ];
  return lossLines[Math.floor(Math.random() * lossLines.length)];
}

// ── BUILD END GAME ──
export function buildEndGame() {
  clearGameSave();
  AudioStateManager.setState('game_over');

  var gs = GS.finalEngine;
  var _humanScore = gs.ctScore;
  var _cpuScore = gs.irScore;
  var _humanWon = _humanScore > _cpuScore;
  var _tied = _humanScore === _cpuScore;
  // Victory/defeat fanfare
  setTimeout(function() {
    if (_humanWon) SND.victory();
    else if (!_tied) SND.defeat();
  }, 300); // Slight delay for the score reveal to land first
  var team = getTeam(GS.team);
  var oppId = GS.opponent || 'wolves';
  var opp = getTeam(oppId);
  var humanScore = gs.ctScore;
  var cpuScore = gs.irScore;
  var humanWon = humanScore > cpuScore;
  var tied = humanScore === cpuScore;
  var humanTorch = gs.ctTorchPts;
  var winBonus = humanWon ? 20 : 0;
  var totalEarned = humanTorch + winBonus;

  // Persist
  var season = GS.season || { torchCards: [], carryoverPoints: 0, opponents: [], currentGame: 0, results: [] };
  season.carryoverPoints = totalEarned;
  // Track this game result in season (never mutate season state for Daily Drive games)
  if (!season.results) season.results = [];
  var isChampionshipGame = season.championshipOpponent && GS.opponent === season.championshipOpponent && !season.championshipPlayed;
  if (!GS.isDailyDrive) {
    if (isChampionshipGame) {
      season.results.push({ won: humanWon, tied: tied, score: humanScore, oppScore: cpuScore, opponent: GS.opponent });
      season.championshipPlayed = true;
      season.championshipWon = humanWon;
    } else if (season.currentGame !== undefined && season.results.length <= season.currentGame) {
      season.results.push({ won: humanWon, tied: tied, score: humanScore, oppScore: cpuScore, opponent: GS.opponent });
      season.currentGame = (season.currentGame || 0) + 1;
    }
  }
  updateTeamRecord(GS.team, humanWon, tied);
  if (gs) recordGameStats(gs);
  var streak = !tied ? updateStreak(GS.team, humanWon, oppId) : getStreak(GS.team);
  var h2h = getH2H(GS.team, oppId);

  // Record daily drive result if this was a daily drive game
  if (GS.isDailyDrive) {
    recordDailyResult(totalEarned, humanScore + '-' + cpuScore, humanWon, gs.snapLog);
  }

  // Check achievements
  var achContext = {
    won: humanWon, tied: tied, humanScore: humanScore, cpuScore: cpuScore,
    difficulty: GS.difficulty, teamId: GS.team, opponentId: GS.opponent,
    tds: (gs.stats && gs.stats.ctTouchdowns) || 0,
    turnoversForced: (gs.stats && gs.stats.irTurnovers) || 0,
    biggestPlay: (function() { var mx = 0; if (gs.snapLog) gs.snapLog.forEach(function(s) { if (s && s.team === 'CT' && s.yards > mx) mx = s.yards; }); return mx; })(),
    isClutchTD: false, // Would need to pass from gameplay
    torchCardsBought: parseInt(localStorage.getItem('torch_cards_bought') || '0'),
    goldCardUsed: false,
    comboTriggered: false,
    seasonRecord: season,
    isChampionship: !!season.championshipPlayed,
    championshipWon: !!season.championshipWon,
    trailingAtHalf: false, // Would need halftime score tracking
    dailyStreak: parseInt(localStorage.getItem('torch_daily_streak') || '0'),
  };
  var newAch = checkAchievements(achContext);

  // Result colors
  var resultColor = humanWon ? '#00ff44' : tied ? '#EBB010' : '#ff0040';
  var resultText = humanWon ? 'VICTORY' : tied ? 'TIE' : 'DEFEAT';

  // MVP
  var mvp = calculateMVP(gs.snapLog, GS.team);
  var mvpStats = mvp ? getMVPStatLine(mvp.id, gs.snapLog) : '';

  // Headline (generated early so share button can reference it)
  var headline = generateHeadline(humanWon, tied, humanScore, cpuScore, team, opp, mvp, gs);

  recordGame({
    team: GS.team,
    opponent: GS.opponent,
    difficulty: GS.difficulty,
    humanScore: humanScore,
    cpuScore: cpuScore,
    won: humanWon,
    tied: tied,
    torchPts: totalEarned,
    mvp: mvp ? mvp.name : null,
    isDaily: !!GS.isDailyDrive,
    isChampionship: !!(season && season.championshipPlayed),
  });

  // Open loop
  var openLoop = getOpenLoop(totalEarned);

  // Season-aware button text
  var seasonComplete = isChampionshipGame || (season.currentGame >= 3);
  var gamesLeft = 3 - (season.currentGame || 0);
  var btnText, filmText;
  if (seasonComplete) {
    btnText = 'SEASON RECAP';
    filmText = humanWon ? 'Film Room \u2192' : 'What went wrong? \u2192';
  } else {
    var nextOpp = season.opponents && season.opponents[season.currentGame] ? getTeam(season.opponents[season.currentGame]) : null;
    btnText = nextOpp ? 'NEXT GAME \u2014 vs ' + nextOpp.name : 'NEXT GAME';
    filmText = humanWon ? 'Film Room \u2192' : tied ? 'What happened? \u2192' : 'What went wrong? \u2192';
  }

  // ── BUILD DOM ──
  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow:hidden;';

  // Top bar (Menu + Share)
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;justify-content:space-between;padding:8px 16px;flex-shrink:0;';
  var menuBtn = document.createElement('div');
  menuBtn.style.cssText = "font-family:'Rajdhani';font-size:10px;color:#444;cursor:pointer;padding:4px;";
  menuBtn.textContent = 'Menu';
  menuBtn.onclick = function() { setGs(null); };
  topBar.appendChild(menuBtn);
  var shareBtn = document.createElement('div');
  shareBtn.style.cssText = "font-family:'Rajdhani';font-size:10px;color:#444;cursor:pointer;padding:4px;";
  shareBtn.textContent = 'Share';
  shareBtn.onclick = function() {
    var txt = 'TORCH \uD83D\uDD25 ' + resultText + ' ' + humanScore + '-' + cpuScore + ' as the ' + team.name + '!\n"' + headline + '"\n+' + totalEarned + ' pts';
    if (streak.currentWin >= 2) txt += ' | ' + streak.currentWin + '-game streak';
    txt += ' | vs ' + opp.name + ' (' + h2h.wins + '-' + h2h.losses + ')';
    if (navigator.share) navigator.share({ text: txt }).catch(function() {});
    else if (navigator.clipboard) navigator.clipboard.writeText(txt);
  };
  topBar.appendChild(shareBtn);
  el.appendChild(topBar);

  // ── TOP ZONE: Result ──
  var topZone = document.createElement('div');
  topZone.style.cssText = 'text-align:center;padding:8px 16px 12px;flex-shrink:0;';

  var scoreEl = document.createElement('div');
  scoreEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:48px;color:" + resultColor + ";letter-spacing:3px;line-height:1;opacity:0;";
  scoreEl.textContent = resultText + ' ' + humanScore + '-' + cpuScore;
  topZone.appendChild(scoreEl);

  if (streak.currentWin >= 2) {
    var streakEl = document.createElement('div');
    var isNewBest = streak.currentWin === streak.longestWin;
    streakEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:2px;margin-top:2px;";
    streakEl.textContent = streak.currentWin + '-GAME WIN STREAK' + (isNewBest ? '  NEW BEST!' : '');
    if (isNewBest) {
      streakEl.innerHTML =
        "<span style='color:#EBB010;'>" + streak.currentWin + "-GAME WIN STREAK</span>" +
        "  <span style='color:#00ff44;'>NEW BEST!</span>";
    }
    topZone.appendChild(streakEl);
  }

  var teamLine = document.createElement('div');
  teamLine.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;opacity:0;';
  // Show season record
  var seasonWins = 0, seasonLosses = 0;
  (season.results || []).forEach(function(r) { if (r.won) seasonWins++; else if (!r.tied) seasonLosses++; });
  var seasonRecStr = seasonWins + '-' + seasonLosses;
  teamLine.innerHTML = renderTeamBadge(GS.team, 28) +
    "<span style=\"font-family:'Teko';font-size:16px;color:" + team.accent + ";letter-spacing:2px;\">" + team.name + " (" + seasonRecStr + ")</span>";
  topZone.appendChild(teamLine);

  // Newspaper headline element
  var headlineEl = document.createElement('div');
  headlineEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:16px;color:#ccc;letter-spacing:1px;text-align:center;margin:8px auto 0;max-width:320px;line-height:1.2;opacity:0;font-style:italic;";
  headlineEl.textContent = '"' + headline + '"';
  topZone.appendChild(headlineEl);

  el.appendChild(topZone);

  // ── MIDDLE ZONE: MVP + Points + Open Loop ──
  var midZone = document.createElement('div');
  midZone.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;padding:0 16px;gap:10px;overflow-y:auto;';

  // MVP card
  var mvpWrap = document.createElement('div');
  mvpWrap.style.cssText = 'text-align:center;opacity:0;';
  if (mvp) {
    mvpWrap.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:3px;margin-bottom:6px;\">\u2605 GAME MVP \u2605</div>";
    var card = buildMaddenPlayer({
      name: mvp.name, firstName: mvp.firstName, pos: mvp.pos, ovr: mvp.ovr,
      num: mvp.num || '', badge: mvp.badge, isStar: mvp.isStar,
      ability: mvp.ability || '', stars: mvp.stars, trait: mvp.trait,
      teamColor: team.colors ? team.colors.primary : team.accent, teamId: GS.team
    }, 100, 140);
    mvpWrap.appendChild(card);
    if (mvpStats) {
      var statLine = document.createElement('div');
      statLine.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:12px;color:#ccc;margin-top:6px;";
      statLine.textContent = mvpStats;
      mvpWrap.appendChild(statLine);
    }
  } else {
    mvpWrap.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:3px;margin-bottom:6px;\">TEAM EFFORT</div>" +
      '<div style="display:flex;justify-content:center;">' + renderTeamBadge(GS.team, 64) + '</div>';
  }
  midZone.appendChild(mvpWrap);

  // Points
  var ptsWrap = document.createElement('div');
  ptsWrap.style.cssText = 'text-align:center;width:100%;max-width:280px;opacity:0;';

  var ptsLabel = document.createElement('div');
  ptsLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#EBB010;letter-spacing:2px;";
  ptsLabel.textContent = humanWon ? 'TORCH POINTS EARNED' : 'EVEN IN DEFEAT';
  ptsWrap.appendChild(ptsLabel);

  var ptsNum = document.createElement('div');
  ptsNum.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:36px;color:#EBB010;text-shadow:0 0 16px rgba(235,176,16,0.4);line-height:1;margin-top:2px;";
  ptsNum.textContent = '+' + totalEarned;
  ptsWrap.appendChild(ptsNum);

  var ptsBreak = document.createElement('div');
  ptsBreak.style.cssText = "font-family:'Rajdhani';font-size:9px;color:#666;margin-top:4px;";
  ptsBreak.textContent = 'Base: ' + humanTorch + (winBonus ? ' | Win: +' + winBonus : '');
  ptsWrap.appendChild(ptsBreak);

  var ptsTotal = document.createElement('div');
  ptsTotal.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:12px;color:#888;margin-top:4px;";
  ptsTotal.textContent = 'Total: ' + totalEarned;
  ptsWrap.appendChild(ptsTotal);

  midZone.appendChild(ptsWrap);

  // Open loop
  var loopEl = null;
  if (openLoop) {
    loopEl = document.createElement('div');
    loopEl.style.cssText = "background:rgba(235,176,16,0.06);border:1px solid #EBB01033;border-radius:6px;padding:6px 12px;text-align:center;opacity:0;max-width:300px;width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
    loopEl.innerHTML = "<span style=\"font-size:12px;\">" + openLoop.icon + "</span> <span style=\"font-family:'Rajdhani';font-weight:700;font-size:11px;color:" + (openLoop.canBuy ? '#00ff44' : '#EBB010') + ";letter-spacing:0.5px;\">" + openLoop.text + "</span>";
    midZone.appendChild(loopEl);
  }

  // Achievement banners (appended but animated later in timeline)
  var achEls = [];
  if (newAch.length > 0) {
    newAch.forEach(function(ach) {
      var achEl = document.createElement('div');
      achEl.style.cssText = "text-align:center;padding:6px 12px;background:rgba(235,176,16,0.08);border:1px solid #EBB01044;border-radius:6px;opacity:0;max-width:300px;width:100%;";
      achEl.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:2px;\">ACHIEVEMENT UNLOCKED</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:#fff;\">" + ach.name + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-size:10px;color:#888;\">" + ach.desc + "</div>";
      midZone.appendChild(achEl);
      achEls.push(achEl);
    });
  }

  el.appendChild(midZone);

  // ── BOTTOM ZONE: PLAY AGAIN + Film Room ──
  var botZone = document.createElement('div');
  botZone.style.cssText = 'padding:12px 16px 24px;flex-shrink:0;text-align:center;';

  var playBtn = document.createElement('button');
  playBtn.style.cssText = "width:100%;padding:18px;border-radius:8px;border:none;font-family:'Teko';font-weight:700;font-size:22px;letter-spacing:4px;color:#fff;cursor:pointer;background:" + team.accent + ";opacity:0;";
  playBtn.textContent = btnText;
  playBtn.onclick = function() {
    SND.snap();
    if (seasonComplete) {
      // Go to season recap
      setGs(function(s) {
        return Object.assign({}, s, {
          screen: 'seasonRecap', engine: null, finalEngine: null,
          season: season
        });
      });
    } else {
      // Advance to next game in season
      var nextOpponentId = season.opponents && season.opponents[season.currentGame];
      if (!nextOpponentId) {
        // Out of regular season games — fall back to season recap
        setGs(function(s) {
          return Object.assign({}, s, {
            screen: 'seasonRecap', engine: null, finalEngine: null,
            season: season
          });
        });
        return;
      }
      setGs(function(s) {
        return Object.assign({}, s, {
          screen: 'pregame',
          opponent: nextOpponentId,
          engine: null, finalEngine: null,
          _coinTossDone: false,
          season: season
        });
      });
    }
  };
  botZone.appendChild(playBtn);

  var filmLink = document.createElement('div');
  filmLink.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:11px;color:#555;letter-spacing:1px;margin-top:10px;cursor:pointer;opacity:0;";
  filmLink.textContent = filmText;
  filmLink.onclick = function() { showFilmRoom(el, gs); };
  botZone.appendChild(filmLink);

  el.appendChild(botZone);

  // ── GSAP ANIMATION SEQUENCE ──
  var tl = gsap.timeline();
  var skipped = false;

  function skipAll() {
    if (skipped) return;
    skipped = true;
    tl.progress(1);
  }
  el.addEventListener('touchstart', skipAll, { once: true, passive: true });
  el.addEventListener('click', function(e) {
    // Don't skip if tapping buttons
    if (e.target === playBtn || e.target === filmLink || e.target === menuBtn || e.target === shareBtn) return;
    skipAll();
  }, { once: true });

  // Step 1: Score flies in
  tl.to(scoreEl, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
  tl.from(scoreEl, { scale: 1.4, duration: 0.3, ease: 'back.out(1.7)' }, '<');
  tl.to(teamLine, { opacity: 1, duration: 0.2, ease: 'power2.out' }, '-=0.1');
  tl.to(headlineEl, { opacity: 0.8, duration: 0.3 }, '-=0.05');

  // Step 2: MVP deals in
  tl.to(mvpWrap, { opacity: 1, duration: 0.3, ease: 'power2.out' }, '+=0.15');
  tl.from(mvpWrap, { y: -80, rotation: -3, scale: 0.85, duration: 0.3, ease: 'back.out(1.7)' }, '<');

  // Step 3: Points
  tl.to(ptsWrap, { opacity: 1, duration: 0.25, ease: 'power2.out' }, '+=0.15');

  // Step 4: Open loop
  if (loopEl) {
    tl.to(loopEl, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, '+=0.15');
    tl.from(loopEl, { y: 10, duration: 0.25, ease: 'power2.out' }, '<');
  }

  // Step 5: Achievement banners
  achEls.forEach(function(achEl) {
    tl.to(achEl, { opacity: 1, duration: 0.3, ease: 'power2.out' }, '+=0.15');
  });

  // Step 6: PLAY AGAIN pulses to life
  tl.to(playBtn, { opacity: 1, duration: 0.3, ease: 'back.out(1.5)' }, '+=0.1');
  tl.from(playBtn, { scale: 0.9, duration: 0.3, ease: 'back.out(1.5)' }, '<');
  tl.to(filmLink, { opacity: 1, duration: 0.2 }, '-=0.1');
  tl.call(function() {
    gsap.to(playBtn, { scale: 1.02, duration: 1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });

  return el;
}
