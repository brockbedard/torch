/**
 * TORCH — End Game Screen (Replay Loop Design)
 * Centered vertically: Result → Score → Teams → MVP → TORCH Points → CTA.
 * Every element drives a replay or gets out of the way.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, clearGameSave } from '../../state.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { getFullRoster } from '../../data/players.js';
import { renderTeamBadge } from '../../assets/icons/teamLogos.js';
import { renderTeamWordmark } from '../teamWordmark.js';
import { TEAM_WORDMARKS } from '../../data/teamWordmarks.js';
import { buildMaddenPlayer } from '../components/cards.js';
import AudioStateManager from '../../engine/audioManager.js';
import { getJSON, setJSON } from '../../engine/storage.js';
import { recordDailyResult } from './dailyDrive.js';
import { flameSilhouetteSVG } from '../../utils/flameIcon.js';
import { updateStreak, getStreak, getH2H } from '../../engine/streaks.js';
import { checkAchievements } from '../../engine/achievements.js';
import { recordGameStats } from '../../engine/careerStats.js';
import { recordGame } from '../../engine/gameHistory.js';
import { formatKPA } from '../../engine/epa.js';

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
    return { text: 'You can afford ' + buyable[0].name + '!', canBuy: true };
  }
  // Nearest card can't yet afford
  var nearest = TORCH_CARDS.filter(function(c) { return c.cost > torchPoints; }).sort(function(a, b) { return (a.cost - torchPoints) - (b.cost - torchPoints); });
  if (nearest.length > 0) {
    var gap = nearest[0].cost - torchPoints;
    return { text: gap + ' more \u2192 ' + nearest[0].name, canBuy: false };
  }
  return null;
}

// ── PER-TEAM RECORDS ──
function updateTeamRecord(teamId, won, tied) {
  var records = getJSON('torch_team_records', {});
  if (!records[teamId]) records[teamId] = { wins: 0, losses: 0, ties: 0 };
  if (tied) records[teamId].ties++;
  else if (won) records[teamId].wins++;
  else records[teamId].losses++;
  setJSON('torch_team_records', records);
}

export function getTeamRecord(teamId) {
  var records = getJSON('torch_team_records', {});
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
      (mvpName ? mvpName + ' LEADS' : team.name + ' LEAD') + ' ' + margin + '-POINT DEMOLITION OF ' + opp.name,
    ];
    return blowoutLines[Math.floor(Math.random() * blowoutLines.length)];
  }
  if (won && close) {
    var closeLines = [
      team.name + ' SURVIVE ' + opp.name + ' SCARE IN ' + hScore + '-' + cScore + ' THRILLER',
      'NAIL-BITER! ' + team.name + ' EDGE ' + opp.name + ' BY ' + margin,
      (mvpName ? mvpName + ' DELIVERS' : team.name + ' DELIVER') + ' IN CLUTCH ' + hScore + '-' + cScore + ' WIN',
    ];
    return closeLines[Math.floor(Math.random() * closeLines.length)];
  }
  if (won) {
    var winLines = [
      team.name + ' TAKE DOWN ' + opp.name + ' ' + hScore + '-' + cScore,
      (mvpName ? mvpName + ' POWERS ' + team.name + ' PAST ' + opp.name : team.name + ' POWER PAST ' + opp.name),
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

// ── MVP NARRATIVE ──
function generateMVPNarrative(mvp, snapLog, won) {
  if (!mvp || !snapLog) return won ? 'Led the team when it mattered' : 'Only bright spot on a tough day';
  var tds = 0, yards = 0, ints = 0, sacks = 0;
  snapLog.forEach(function(snap) {
    if (!snap) return;
    if (snap.featuredOffId === mvp.id || snap.featuredDefId === mvp.id) {
      if (snap.event === 'touchdown') tds++;
      yards += snap.yards || 0;
      if (snap.event === 'interception' && snap.featuredDefId === mvp.id) ints++;
      if (snap.yards <= -3 && snap.featuredDefId === mvp.id) sacks++;
    }
  });
  if (tds >= 2) return 'Dominated in the end zone';
  if (yards >= 100 && mvp.pos === 'RB') return 'Dominated on the ground all game';
  if (yards >= 100) return 'Tore up the secondary';
  if (ints >= 1) return 'Ball-hawking performance';
  if (sacks >= 2) return 'Terrorized the QB';
  if (!won) return 'Only bright spot on a tough day';
  return 'Led the team when it mattered';
}

// ── BUILD END GAME ──
export function buildEndGame() {
  clearGameSave();
  var gs = GS.finalEngine;
  var _humanScore = gs.ctScore;
  var _cpuScore = gs.irScore;
  var _humanWon = _humanScore > _cpuScore;
  var _tied = _humanScore === _cpuScore;
  // Set audio state based on outcome
  AudioStateManager.setState(_humanWon ? 'game_over_win' : 'game_over');
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
  var humanTorch = gs.ctTorchPts; // Already includes win bonus from engine
  var winBonus = 0; // Win bonus already applied in gameState._endGame()
  var totalEarned = humanTorch;

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

  // Season-aware CTA
  var seasonComplete = isChampionshipGame || (season.currentGame >= 3);

  // ── BUILD DOM ──
  // FLAME_PATH removed — replaced with flameSilhouetteSVG helper imports
  // above. The old wiggly path on 44×56 is gone; the single use-site
  // (points row) now renders a gold silhouette of the new 4-layer flame.

  // Inject keyframes
  if (!document.getElementById('eg-anims')) {
    var sty = document.createElement('style');
    sty.id = 'eg-anims';
    sty.textContent =
      '@keyframes mvpGlow{0%,100%{box-shadow:0 0 12px ' + (team.accent || '#EBB010') + '33}50%{box-shadow:0 0 24px ' + (team.accent || '#EBB010') + '55}}' +
      '@keyframes ctaBreathe{0%,100%{transform:scale(1);box-shadow:0 4px 16px rgba(0,0,0,0.3)}50%{transform:scale(1.02);box-shadow:0 4px 24px ' + resultColor + '33}}' +
      '@keyframes confettiFall{0%{transform:translateY(0) rotate(0) translateX(0);opacity:0.9}20%{opacity:1}100%{transform:translateY(105vh) rotate(var(--rot,720deg)) translateX(var(--drift,0px));opacity:0}}';
    document.head.appendChild(sty);
  }

  var el = document.createElement('div');
  el.style.cssText = 'height:100vh;height:100dvh;display:flex;flex-direction:column;background:#0A0804;overflow:hidden;position:relative;padding-top:env(safe-area-inset-top,0px);';

  // ── TOP ACCENT BAR ──
  var accentTop = document.createElement('div');
  accentTop.style.cssText = 'height:3px;background:linear-gradient(90deg,transparent,' + resultColor + ',transparent);flex-shrink:0;';
  el.appendChild(accentTop);

  // ── BACKGROUND WASH ──
  var bgWash = document.createElement('div');
  bgWash.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 25%,' + resultColor + '10,transparent 60%);pointer-events:none;';
  el.appendChild(bgWash);

  // ── CONTENT ──
  var content = document.createElement('div');
  content.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 24px;min-height:0;position:relative;z-index:1;';

  // Result word — chrome gradient
  var resultEl = document.createElement('div');
  resultEl.style.cssText = "font-family:'Teko';font-weight:900;font-size:40px;letter-spacing:5px;line-height:0.9;background:linear-gradient(180deg,#fff 0%," + resultColor + " 40%,#fff 70%," + resultColor + " 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 16px " + resultColor + "44) drop-shadow(0 4px 8px rgba(0,0,0,0.8));opacity:0;transform:scale(0.3);";
  resultEl.textContent = resultText;
  content.appendChild(resultEl);

  // Score
  var scoreEl = document.createElement('div');
  scoreEl.style.cssText = "font-family:'Teko';font-weight:900;font-size:60px;color:#fff;line-height:0.85;letter-spacing:5px;margin-top:6px;text-shadow:0 0 20px " + resultColor + "44,0 4px 12px rgba(0,0,0,0.8);opacity:0;";
  scoreEl.innerHTML = humanScore + " <span style=\"color:#333;font-size:40px;text-shadow:0 0 20px " + resultColor + "44,0 4px 12px rgba(0,0,0,0.8);\">\u2014</span> " + cpuScore;
  content.appendChild(scoreEl);

  // Teams row — per-team wordmarks. Winner/leader team at slightly larger
  // T2 size, opponent at the same size but lower opacity. The scoreEl above
  // already communicates the winner; wordmarks here show identity.
  var teamsEl = document.createElement('div');
  teamsEl.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:4px;opacity:0;';
  function _endSize(tid) {
    var wm = TEAM_WORDMARKS[tid];
    return Math.max(16, Math.round((wm && wm.heroSize ? wm.heroSize : 40) * 0.42));
  }
  var _homeWm = renderTeamWordmark(GS.team, 't2', { mascot: true, fontSize: _endSize(GS.team) });
  var _vs = document.createElement('span');
  _vs.style.cssText = "font-family:'Rajdhani';font-size:10px;color:#333;letter-spacing:1px;";
  _vs.textContent = 'vs';
  var _oppWm = renderTeamWordmark(GS.opponent, 't2', { mascot: true, fontSize: _endSize(GS.opponent) });
  if (_oppWm) _oppWm.style.opacity = '0.5';
  if (_homeWm) teamsEl.appendChild(_homeWm);
  teamsEl.appendChild(_vs);
  if (_oppWm) teamsEl.appendChild(_oppWm);
  content.appendChild(teamsEl);

  // Win streak
  var streakEl = null;
  if (streak.currentWin >= 2) {
    streakEl = document.createElement('div');
    streakEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:11px;color:#EBB010;letter-spacing:2px;margin-top:4px;opacity:0;";
    streakEl.textContent = streak.currentWin + '-GAME WIN STREAK';
    content.appendChild(streakEl);
  }

  // Divider 1
  var div1 = document.createElement('div');
  div1.style.cssText = 'width:60px;height:1px;background:linear-gradient(90deg,transparent,' + resultColor + '33,transparent);margin:14px 0;transform:scaleX(0);';
  content.appendChild(div1);

  // ── MVP ROW ──
  var mvpRow = document.createElement('div');
  mvpRow.style.cssText = 'display:flex;align-items:center;gap:12px;width:100%;max-width:280px;opacity:0;';

  if (mvp) {
    // Mini player card
    var mvpCard = buildMaddenPlayer({
      name: mvp.name, firstName: mvp.firstName, pos: mvp.pos, ovr: mvp.ovr,
      num: mvp.num || '', badge: mvp.badge, isStar: mvp.isStar,
      ability: mvp.ability || '', stars: mvp.stars, trait: mvp.trait,
      teamColor: team.colors ? team.colors.primary : team.accent, teamId: GS.team
    }, 70, 96);
    mvpCard.style.flexShrink = '0';
    mvpCard.style.animation = 'mvpGlow 3s ease-in-out infinite';
    mvpRow.appendChild(mvpCard);

    // MVP info
    var mvpInfo = document.createElement('div');
    mvpInfo.style.cssText = 'flex:1;min-width:0;';

    var mvpLabel = document.createElement('div');
    mvpLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:8px;color:#EBB010;letter-spacing:2px;";
    mvpLabel.textContent = '\u2605 GAME MVP';
    mvpInfo.appendChild(mvpLabel);

    var mvpName = document.createElement('div');
    mvpName.style.cssText = "font-family:'Teko';font-weight:700;font-size:22px;color:#fff;letter-spacing:1px;line-height:1;";
    mvpName.textContent = mvp.name;
    mvpInfo.appendChild(mvpName);

    if (mvpStats) {
      var mvpStatEl = document.createElement('div');
      mvpStatEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:12px;color:#ccc;margin-top:2px;";
      mvpStatEl.textContent = mvpStats;
      mvpInfo.appendChild(mvpStatEl);
    }

    // Narrative
    var narrative = generateMVPNarrative(mvp, gs.snapLog, humanWon);
    var narrEl = document.createElement('div');
    narrEl.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:10px;color:#555;line-height:1.2;margin-top:3px;";
    narrEl.textContent = narrative;
    mvpInfo.appendChild(narrEl);

    mvpRow.appendChild(mvpInfo);
  } else {
    // No MVP — team badge + label
    mvpRow.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;max-width:280px;opacity:0;';
    mvpRow.innerHTML = renderTeamBadge(GS.team, 64) +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:3px;\">TEAM EFFORT</div>";
  }
  content.appendChild(mvpRow);

  // Divider 2
  var div2 = document.createElement('div');
  div2.style.cssText = 'width:60px;height:1px;background:linear-gradient(90deg,transparent,#EBB01022,transparent);margin:14px 0;transform:scaleX(0);';
  content.appendChild(div2);

  // TORCH points
  var ptsWrap = document.createElement('div');
  ptsWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;opacity:0;';
  var ptsRow = document.createElement('div');
  ptsRow.style.cssText = 'display:flex;align-items:center;gap:6px;';
  ptsRow.innerHTML = flameSilhouetteSVG(18, '#EBB010') +
    "<span style=\"font-family:'Teko';font-weight:900;font-size:30px;color:#EBB010;text-shadow:0 0 12px rgba(235,176,16,0.4);\">+" + totalEarned + "</span>";
  ptsWrap.appendChild(ptsRow);
  var ptsLabel = document.createElement('div');
  ptsLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:8px;color:#EBB01066;letter-spacing:2px;";
  ptsLabel.textContent = 'TORCH POINTS';
  ptsWrap.appendChild(ptsLabel);
  content.appendChild(ptsWrap);

  // Open loop nudge
  var loopEl = null;
  if (openLoop) {
    loopEl = document.createElement('div');
    loopEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#EBB010;margin-top:6px;padding:4px 10px;border:1px solid #EBB01022;border-radius:4px;background:rgba(235,176,16,0.04);opacity:0;";
    loopEl.textContent = openLoop.text;
    content.appendChild(loopEl);
  }

  // ── ADVANCED STATS ROW (EPA / Turnover / 3rd Down) ──
  // Pulls from game-wide accumulators if available. Analytics-forward: shows
  // efficiency metrics modern football fans actually care about.
  var finalStats = (gs && gs._finalStats) || GS._gameplayStats || {};
  var _finalHEpa = (finalStats._hEpaSum !== undefined) ? finalStats._hEpaSum : 0;
  var _finalCEpa = (finalStats._cEpaSum !== undefined) ? finalStats._cEpaSum : 0;
  var _finalHTo  = finalStats._hTurnovers || 0;
  var _finalCTo  = finalStats._cTurnovers || 0;
  var _finalH3A  = finalStats._h3rdAtt || 0;
  var _finalH3C  = finalStats._h3rdConv || 0;
  var _epaDiff = _finalHEpa - _finalCEpa;
  var _toMargin = _finalCTo - _finalHTo; // +ve = user won the battle
  var _h3Pct = _finalH3A > 0 ? Math.round(100 * _finalH3C / _finalH3A) : 0;

  var advStatsRow = document.createElement('div');
  advStatsRow.style.cssText = 'display:flex;gap:10px;margin-top:10px;opacity:0;';
  function _advTile(label, val, valColor) {
    var col = valColor || '#fff';
    return "<div style=\"flex:1;text-align:center;padding:8px 6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:4px;min-width:70px;\">" +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:" + col + ";line-height:1;\">" + val + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:8px;color:#555;letter-spacing:1.5px;margin-top:3px;\">" + label + "</div>" +
    "</div>";
  }
  var _epaColor = _epaDiff >= 2 ? '#00ff44' : _epaDiff >= 0 ? '#c8a030' : _epaDiff >= -2 ? '#FF6B00' : '#ff0040';
  var _toColor = _toMargin > 0 ? '#00ff44' : _toMargin < 0 ? '#ff0040' : '#888';
  var _3dColor = _h3Pct >= 50 ? '#00ff44' : _h3Pct >= 33 ? '#c8a030' : '#FF6B00';
  advStatsRow.innerHTML =
    _advTile('KPA DIFF', formatKPA(_epaDiff), _epaColor) +
    _advTile('TO MARGIN', (_toMargin > 0 ? '+' : '') + _toMargin, _toColor) +
    _advTile('3RD DOWN', (_finalH3A > 0 ? _finalH3C + '/' + _finalH3A : '—'), _3dColor);
  content.appendChild(advStatsRow);

  // ── TOP MOMENTS CASCADE (Balatro-style — top 3 plays fire into the summary) ──
  // Use the existing highlights extractor to find the best plays of the game.
  var topMoments = extractHighlights(gs.snapLog).plays.slice(0, 3);
  var momentsEls = [];
  if (topMoments.length > 0) {
    var momentsHeader = document.createElement('div');
    momentsHeader.style.cssText = "font-family:'Oswald';font-weight:700;font-size:9px;color:#666;letter-spacing:3px;margin-top:12px;opacity:0;";
    momentsHeader.textContent = 'TOP MOMENTS';
    content.appendChild(momentsHeader);
    momentsEls.push(momentsHeader);
    topMoments.forEach(function(m) {
      var ind = getTypeIndicator(m.type);
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;margin-top:4px;background:rgba(255,255,255,0.02);border-left:2px solid ' + ind.color + '66;border-radius:3px;width:100%;max-width:300px;opacity:0;transform:translateX(-10px);';
      var labelText = m.label || 'Play ' + m.snap;
      if (labelText.length > 38) labelText = labelText.substring(0, 36) + '…';
      row.innerHTML =
        "<div style=\"font-family:'Teko';font-weight:700;font-size:10px;color:" + ind.color + ";letter-spacing:1px;padding:1px 5px;background:" + ind.color + "15;border:1px solid " + ind.color + "44;border-radius:2px;\">" + ind.icon + "</div>" +
        "<div style=\"flex:1;font-family:'Rajdhani';font-weight:500;font-size:11px;color:#bbb;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;\">" + labelText + "</div>" +
        "<div style=\"font-family:'Teko';font-weight:700;font-size:12px;color:#555;\">#" + m.snap + "</div>";
      content.appendChild(row);
      momentsEls.push(row);
    });
  }

  // Achievement banners
  var achEls = [];
  if (newAch.length > 0) {
    newAch.forEach(function(ach) {
      var achEl = document.createElement('div');
      achEl.style.cssText = "text-align:center;padding:6px 12px;background:rgba(235,176,16,0.08);border:1px solid #EBB01044;border-radius:6px;opacity:0;max-width:300px;width:100%;margin-top:6px;";
      achEl.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:2px;\">ACHIEVEMENT UNLOCKED</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:#fff;\">" + ach.name + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-size:10px;color:#888;\">" + ach.desc + "</div>";
      content.appendChild(achEl);
      achEls.push(achEl);
    });
  }

  el.appendChild(content);

  // ── CTA BUTTON ──
  var botZone = document.createElement('div');
  botZone.style.cssText = 'padding:0 16px 16px;padding-bottom:max(16px,env(safe-area-inset-bottom,0px));flex-shrink:0;position:relative;z-index:1;';

  var ctaGrad, ctaColor;
  if (humanWon) { ctaGrad = 'linear-gradient(180deg,#00ff44,#00aa22)'; ctaColor = '#000'; }
  else if (tied) { ctaGrad = 'linear-gradient(180deg,#EBB010,#8B4A1F)'; ctaColor = '#fff'; }
  else { ctaGrad = 'linear-gradient(180deg,' + team.accent + ',' + team.accent + '88)'; ctaColor = '#fff'; }

  var ctaText = humanWon ? 'NEXT GAME' : tied ? 'SETTLE IT' : 'RUN IT BACK';
  if (seasonComplete) ctaText = 'SEASON RECAP';

  var playBtn = document.createElement('button');
  playBtn.style.cssText = "width:100%;padding:16px;border-radius:6px;border:none;font-family:'Teko';font-weight:700;font-size:24px;letter-spacing:6px;color:" + ctaColor + ";background:" + ctaGrad + ";cursor:pointer;opacity:0;";
  playBtn.textContent = ctaText;
  playBtn.onclick = function() {
    SND.click();
    if (seasonComplete) {
      setGs(function(s) {
        return Object.assign({}, s, {
          screen: 'seasonRecap', engine: null, finalEngine: null,
          season: season
        });
      });
    } else {
      var nextOpponentId = season.opponents && season.opponents[season.currentGame];
      if (!nextOpponentId) {
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
  el.appendChild(botZone);

  // ── BOTTOM ACCENT BAR ──
  var accentBot = document.createElement('div');
  accentBot.style.cssText = 'height:2px;background:linear-gradient(90deg,transparent,' + resultColor + '44,transparent);flex-shrink:0;';
  el.appendChild(accentBot);

  // ── CONFETTI (wins only) ──
  if (humanWon) {
    var confColors = [resultColor, '#EBB010', '#FF4511', '#fff', team.accent];
    setTimeout(function() {
      for (var ci = 0; ci < 25; ci++) {
        var c = document.createElement('div');
        var x = 5 + Math.random() * 90;
        var sz = 3 + Math.random() * 5;
        var dur = 2000 + Math.random() * 2000;
        var drift = (Math.random() - 0.5) * 80;
        var rot = 360 + Math.random() * 1080;
        var delay = Math.random() * 800;
        c.style.cssText = 'position:absolute;top:-10px;left:' + x + '%;width:' + sz + 'px;height:' + sz + 'px;background:' + confColors[ci % confColors.length] + ';border-radius:1px;opacity:0.9;z-index:0;--drift:' + drift + 'px;--rot:' + rot + 'deg;animation:confettiFall ' + dur + 'ms ease-in ' + delay + 'ms both;pointer-events:none;';
        el.appendChild(c);
      }
    }, 400);
  }

  // ── RATING PROMPT ──
  var gamesPlayed = parseInt(localStorage.getItem('torch_games_played') || '0');
  var ratedAlready = localStorage.getItem('torch_rated');
  if (humanWon && gamesPlayed >= 3 && !ratedAlready) {
    setTimeout(function() {
      var rateOv = document.createElement('div');
      rateOv.style.cssText = 'position:fixed;inset:0;z-index:800;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);';
      rateOv.innerHTML =
        "<div style=\"background:#141008;border:1px solid #EBB01044;border-radius:12px;padding:20px;max-width:280px;text-align:center;\">" +
          "<div style=\"font-family:'Teko';font-weight:700;font-size:20px;color:#EBB010;letter-spacing:2px;\">ENJOYING TORCH?</div>" +
          "<div style=\"font-family:'Rajdhani';font-size:12px;color:#ccc;margin:8px 0 16px;line-height:1.3;\">Your rating helps other football fans discover the game.</div>" +
          "<div style='display:flex;gap:8px;justify-content:center;'>" +
            "<button id='rate-yes' style=\"flex:1;padding:10px;border-radius:6px;border:1px solid #EBB010;background:#EBB010;color:#000;font-family:'Teko';font-weight:700;font-size:14px;letter-spacing:1px;cursor:pointer;\">RATE NOW</button>" +
            "<button id='rate-later' style=\"flex:1;padding:10px;border-radius:6px;border:1px solid #333;background:transparent;color:#666;font-family:'Teko';font-weight:700;font-size:14px;letter-spacing:1px;cursor:pointer;\">LATER</button>" +
          "</div>" +
        "</div>";
      el.appendChild(rateOv);
      rateOv.querySelector('#rate-yes').onclick = function() {
        localStorage.setItem('torch_rated', '1');
        rateOv.remove();
      };
      rateOv.querySelector('#rate-later').onclick = function() {
        localStorage.setItem('torch_rated', '1');
        rateOv.remove();
      };
    }, 2000);
  }

  // ── GSAP ENTRANCE ANIMATION ──
  try {
    var tl = gsap.timeline();
    tl.to(resultEl, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)' });
    tl.to(scoreEl, { opacity: 1, y: 0, duration: 0.25 }, '-=0.1');
    tl.from(scoreEl, { y: 10, duration: 0.25 }, '<');
    tl.to(teamsEl, { opacity: 1, duration: 0.2 }, '-=0.05');
    if (streakEl) tl.to(streakEl, { opacity: 1, duration: 0.2 }, '-=0.05');
    tl.to(div1, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, '+=0.1');
    tl.to(mvpRow, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }, '-=0.1');
    tl.from(mvpRow, { x: -20, duration: 0.3, ease: 'power2.out' }, '<');
    tl.to(div2, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, '+=0.05');
    tl.to(ptsWrap, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, '-=0.1');
    tl.from(ptsWrap, { scale: 0.8, duration: 0.3, ease: 'back.out(2)' }, '<');
    if (loopEl) { tl.to(loopEl, { opacity: 1, duration: 0.2 }, '+=0.1'); tl.from(loopEl, { y: 6, duration: 0.2 }, '<'); }
    // Advanced stats row (EPA / TO / 3rd Down)
    tl.to(advStatsRow, { opacity: 1, duration: 0.3, ease: 'power2.out' }, '+=0.1');
    // Top Moments cascade — each row staggers in, Balatro-style
    if (momentsEls.length > 0) {
      tl.to(momentsEls, { opacity: 1, x: 0, duration: 0.3, stagger: 0.1, ease: 'power2.out' }, '+=0.15');
    }
    achEls.forEach(function(achEl) { tl.to(achEl, { opacity: 1, duration: 0.3 }, '+=0.1'); });
    tl.to(playBtn, { opacity: 1, duration: 0.3 }, '+=0.1');
    tl.call(function() {
      playBtn.style.animation = 'ctaBreathe 2s ease-in-out infinite';
    });

    // Skip on tap
    var skipped = false;
    function skipAll() {
      if (skipped) return;
      skipped = true;
      tl.progress(1);
    }
    el.addEventListener('touchstart', skipAll, { once: true, passive: true });
    el.addEventListener('click', function(e) {
      if (e.target === playBtn) return;
      skipAll();
    }, { once: true });
  } catch(e) {
    // Fallback: show everything
    resultEl.style.opacity = '1'; resultEl.style.transform = 'scale(1)';
    scoreEl.style.opacity = '1';
    teamsEl.style.opacity = '1';
    div1.style.transform = 'scaleX(1)';
    mvpRow.style.opacity = '1';
    div2.style.transform = 'scaleX(1)';
    ptsWrap.style.opacity = '1';
    if (loopEl) loopEl.style.opacity = '1';
    advStatsRow.style.opacity = '1';
    momentsEls.forEach(function(m) { m.style.opacity = '1'; m.style.transform = 'none'; });
    playBtn.style.opacity = '1';
  }

  return el;
}
