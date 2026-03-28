/**
 * TORCH v0.29.0 — Daily Drive
 * Same seeded game for all players each day.
 * Date-seeded deterministic setup: team, opponent, difficulty, conditions.
 * Player earns TORCH points. Result is shareable.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOffCards, getDefCards } from '../../state.js';
import { TEAMS } from '../../data/teams.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { renderTeamBadge } from '../../data/teamLogos.js';

// ============================================================
// SEEDED RNG — LCG (deterministic, date-based)
// ============================================================

function seededRandom(seed) {
  var s = seed;
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function dateToSeed(dateStr) {
  // "2026-03-28" -> 20260328
  return parseInt(dateStr.replace(/-/g, ''), 10);
}

// ============================================================
// DAILY SETUP GENERATOR
// ============================================================

function getDailySetup() {
  var today = new Date().toISOString().split('T')[0]; // "2026-03-28"
  var rng = seededRandom(dateToSeed(today));

  var teamIds = ['sentinels', 'wolves', 'stags', 'serpents'];

  // Pick human team
  var teamIdx = Math.floor(rng() * 4);
  var team = teamIds[teamIdx];

  // Pick opponent — different team, offset by 1-3
  var oppOffset = 1 + Math.floor(rng() * 3);
  var oppIdx = (teamIdx + oppOffset) % 4;
  var opponent = teamIds[oppIdx];

  // Difficulty
  var diffs = ['EASY', 'MEDIUM', 'HARD'];
  var difficulty = diffs[Math.floor(rng() * 3)];

  // Conditions — seeded, not random
  var weatherOpts = ['clear', 'clear', 'clear', 'heat', 'heat', 'rain', 'wind', 'snow'];
  var fieldOpts = ['turf', 'turf', 'turf', 'grass', 'grass', 'mud'];
  var crowdOpts = ['home', 'home', 'neutral', 'neutral', 'away'];
  var weather = weatherOpts[Math.floor(rng() * weatherOpts.length)];
  var field = fieldOpts[Math.floor(rng() * fieldOpts.length)];
  var crowd = crowdOpts[Math.floor(rng() * crowdOpts.length)];

  return {
    date: today,
    team: team,
    opponent: opponent,
    difficulty: difficulty,
    conditions: { weather: weather, field: field, crowd: crowd },
  };
}

// ============================================================
// DATE KEY + STREAK HELPERS
// ============================================================

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getDailyResult(dateKey) {
  var raw = localStorage.getItem('torch_daily_' + dateKey);
  return raw ? JSON.parse(raw) : null;
}

function getStreak() {
  return parseInt(localStorage.getItem('torch_daily_streak') || '0', 10);
}

function updateStreak(todayKey) {
  var yesterday = new Date(new Date(todayKey) - 86400000).toISOString().split('T')[0];
  var hadYesterday = !!localStorage.getItem('torch_daily_' + yesterday);
  var current = getStreak();
  var newStreak = hadYesterday ? current + 1 : 1;
  localStorage.setItem('torch_daily_streak', String(newStreak));
  return newStreak;
}

// ============================================================
// CONDITION LABELS (for display)
// ============================================================

var WEATHER_LABEL = { clear: 'Clear', rain: 'Rain', wind: 'Wind', snow: 'Snow', heat: 'Heat' };
var FIELD_LABEL   = { turf: 'Turf', grass: 'Grass', mud: 'Mud' };
var CROWD_LABEL   = { home: 'Home', neutral: 'Neutral', away: 'Away' };

// ============================================================
// INJECT KEYFRAMES
// ============================================================

function injectAnimations() {
  if (document.getElementById('dd-anims')) return;
  var s = document.createElement('style');
  s.id = 'dd-anims';
  s.textContent =
    '@keyframes ddFadeUp { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:none} }' +
    '@keyframes ddPulse { 0%,100%{box-shadow:0 0 0 0 rgba(235,176,16,0.4)} 50%{box-shadow:0 0 0 8px rgba(235,176,16,0)} }';
  document.head.appendChild(s);
}

// ============================================================
// BUILD SCREEN
// ============================================================

export function buildDailyDrive() {
  injectAnimations();

  var todayKey = getTodayKey();
  var setup = getDailySetup();
  var result = getDailyResult(todayKey);
  var streak = getStreak();

  var humanTeam = TEAMS[setup.team];
  var oppTeam = TEAMS[setup.opponent];
  var accentColor = humanTeam ? humanTeam.accent : 'var(--a-gold)';

  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;background:var(--bg);';

  // ── HEADER ──
  var hdr = document.createElement('div');
  hdr.style.cssText = 'background:rgba(0,0,0,0.5);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;border-bottom:2px solid var(--a-gold);';

  var hdrLeft = document.createElement('div');
  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:24px;color:var(--a-gold);letter-spacing:3px;font-style:italic;transform:skewX(-8deg);text-shadow:2px 2px 0 rgba(0,0,0,0.9);line-height:1;";
  hdrTitle.textContent = 'DAILY DRIVE';
  var hdrDate = document.createElement('div');
  hdrDate.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:600;font-size:10px;color:#aaa;letter-spacing:2px;margin-top:1px;";
  hdrDate.textContent = new Date(todayKey + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  hdrLeft.appendChild(hdrTitle);
  hdrLeft.appendChild(hdrDate);

  var backBtn = document.createElement('button');
  backBtn.style.cssText = "font-family:'Rajdhani',sans-serif;font-size:10px;padding:8px 14px;cursor:pointer;background:#000;color:#fff;border:2px solid #333;border-radius:4px;letter-spacing:1px;";
  backBtn.textContent = '\u2190 BACK';
  backBtn.onclick = function() { SND.click(); setGs(null); };

  hdr.appendChild(hdrLeft);
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  // ── CONTENT ──
  var content = document.createElement('div');
  content.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:24px 20px 32px;gap:20px;';

  // ── MATCHUP BADGES ──
  var matchupRow = document.createElement('div');
  matchupRow.style.cssText = 'display:flex;align-items:center;gap:16px;animation:ddFadeUp 0.4s ease both;';

  var humanBadgeWrap = document.createElement('div');
  humanBadgeWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;';
  var humanBadge = renderTeamBadge(setup.team, 72);
  humanBadge.style.cssText = (humanBadge.style.cssText || '') + 'filter:drop-shadow(0 0 8px ' + accentColor + '66);';
  var humanName = document.createElement('div');
  humanName.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:700;font-size:11px;color:" + accentColor + ";letter-spacing:2px;";
  humanName.textContent = humanTeam ? humanTeam.name : setup.team.toUpperCase();
  humanBadgeWrap.appendChild(humanBadge);
  humanBadgeWrap.appendChild(humanName);

  var vsEl = document.createElement('div');
  vsEl.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:28px;color:#444;letter-spacing:2px;";
  vsEl.textContent = 'VS';

  var oppAccent = oppTeam ? oppTeam.accent : '#aaa';
  var oppBadgeWrap = document.createElement('div');
  oppBadgeWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;';
  var oppBadge = renderTeamBadge(setup.opponent, 72);
  oppBadge.style.cssText = (oppBadge.style.cssText || '') + 'opacity:0.7;';
  var oppName = document.createElement('div');
  oppName.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:700;font-size:11px;color:" + oppAccent + ";letter-spacing:2px;";
  oppName.textContent = oppTeam ? oppTeam.name : setup.opponent.toUpperCase();
  oppBadgeWrap.appendChild(oppBadge);
  oppBadgeWrap.appendChild(oppName);

  matchupRow.appendChild(humanBadgeWrap);
  matchupRow.appendChild(vsEl);
  matchupRow.appendChild(oppBadgeWrap);
  content.appendChild(matchupRow);

  // ── CHALLENGE DESCRIPTION ──
  var descCard = document.createElement('div');
  descCard.style.cssText = 'width:100%;max-width:320px;background:rgba(255,255,255,0.04);border:1px solid #333;border-radius:8px;padding:14px 16px;display:flex;flex-direction:column;gap:10px;animation:ddFadeUp 0.4s 0.1s ease both;opacity:0;';
  descCard.style.animationFillMode = 'forwards';

  var descTitle = document.createElement('div');
  descTitle.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:13px;color:#666;letter-spacing:3px;";
  descTitle.textContent = "TODAY'S CHALLENGE";

  var descText = document.createElement('div');
  descText.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:600;font-size:15px;color:#fff;line-height:1.4;";
  descText.innerHTML = 'Beat <span style="color:' + oppAccent + '">' + (oppTeam ? oppTeam.name : setup.opponent) + '</span> on <span style="color:' + _diffColor(setup.difficulty) + '">' + setup.difficulty + '</span> as the <span style="color:' + accentColor + '">' + (humanTeam ? humanTeam.name : setup.team) + '</span>';

  // Conditions row
  var condRow = document.createElement('div');
  condRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;';
  [
    WEATHER_LABEL[setup.conditions.weather] || setup.conditions.weather,
    FIELD_LABEL[setup.conditions.field] || setup.conditions.field,
    CROWD_LABEL[setup.conditions.crowd] || setup.conditions.crowd,
  ].forEach(function(label) {
    var chip = document.createElement('div');
    chip.style.cssText = "font-family:'Rajdhani',sans-serif;font-size:10px;font-weight:700;color:#888;background:rgba(255,255,255,0.06);border:1px solid #333;border-radius:4px;padding:2px 8px;letter-spacing:1px;";
    chip.textContent = label.toUpperCase();
    condRow.appendChild(chip);
  });

  // Difficulty badge
  var diffBadge = document.createElement('div');
  diffBadge.style.cssText = 'display:inline-flex;align-items:center;gap:6px;';
  var diffPip = document.createElement('div');
  diffPip.style.cssText = 'width:8px;height:8px;border-radius:50%;background:' + _diffColor(setup.difficulty) + ';';
  var diffLabel = document.createElement('div');
  diffLabel.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:700;font-size:11px;color:" + _diffColor(setup.difficulty) + ";letter-spacing:2px;";
  diffLabel.textContent = setup.difficulty;
  diffBadge.appendChild(diffPip);
  diffBadge.appendChild(diffLabel);

  descCard.appendChild(descTitle);
  descCard.appendChild(descText);
  descCard.appendChild(condRow);
  content.appendChild(descCard);

  // ── STREAK ──
  if (streak > 0 || result) {
    var streakEl = document.createElement('div');
    streakEl.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;color:#EBB010;letter-spacing:2px;animation:ddFadeUp 0.4s 0.2s ease both;opacity:0;";
    streakEl.style.animationFillMode = 'forwards';
    streakEl.textContent = (streak || 1) + ' DAY STREAK';
    content.appendChild(streakEl);
  }

  if (result) {
    // ── ALREADY PLAYED — show result ──
    _buildResultView(content, result, setup, accentColor, streak, todayKey);
  } else {
    // ── NOT YET PLAYED — show PLAY button ──
    var playBtn = document.createElement('button');
    playBtn.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:28px;letter-spacing:6px;padding:18px 48px;border:none;border-radius:6px;cursor:pointer;color:#000;background:" + accentColor + ";animation:ddFadeUp 0.4s 0.2s ease both,ddPulse 2s 0.6s ease infinite;opacity:0;";
    playBtn.style.animationFillMode = 'forwards';
    playBtn.textContent = 'PLAY';
    playBtn.onclick = function() {
      SND.snap ? SND.snap() : (SND.click && SND.click());
      var humanTeamId = setup.team;
      var offRoster = getOffenseRoster(humanTeamId).slice(0, 4).map(function(p) { return p.id; });
      var defRoster = getDefenseRoster(humanTeamId).slice(0, 4).map(function(p) { return p.id; });
      var offHand = getOffCards(humanTeamId).slice(0, 5);
      var defHand = getDefCards(humanTeamId).slice(0, 5);
      setGs(function(s) {
        return Object.assign({}, s || {}, {
          screen: 'gameplay',
          team: humanTeamId,
          opponent: setup.opponent,
          difficulty: setup.difficulty,
          humanReceives: true,
          _coinTossDone: true,
          isDailyDrive: true,
          dailyDate: setup.date,
          isFirstSeason: false,
          gameConditions: setup.conditions,
          offRoster: offRoster,
          defRoster: defRoster,
          offHand: offHand,
          defHand: defHand,
          season: {
            opponents: [setup.opponent],
            currentGame: 0,
            results: [],
            totalScore: 0,
            torchCards: [],
            carryoverPoints: 0,
          },
        });
      });
    };
    content.appendChild(playBtn);

    var subNote = document.createElement('div');
    subNote.style.cssText = "font-family:'Rajdhani',sans-serif;font-size:10px;color:#555;letter-spacing:1px;text-align:center;animation:ddFadeUp 0.4s 0.3s ease both;opacity:0;";
    subNote.style.animationFillMode = 'forwards';
    subNote.textContent = 'Same matchup for everyone today. New drive tomorrow.';
    content.appendChild(subNote);
  }

  el.appendChild(content);
  return el;
}

// ============================================================
// RESULT VIEW (already-played state)
// ============================================================

function _buildResultView(content, result, setup, accentColor, streak, todayKey) {
  var humanTeam = TEAMS[setup.team];
  var oppTeam = TEAMS[setup.opponent];

  // Result banner
  var banner = document.createElement('div');
  var wonColor = result.won ? 'var(--l-green)' : 'var(--p-red)';
  var wonLabel = result.won ? 'VICTORY' : (result.score && result.score.split('-')[0] === result.score.split('-')[1] ? 'TIE' : 'DEFEAT');
  banner.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:36px;color:" + wonColor + ";letter-spacing:4px;animation:ddFadeUp 0.4s 0.15s ease both;opacity:0;";
  banner.style.animationFillMode = 'forwards';
  banner.textContent = wonLabel;
  content.appendChild(banner);

  // Score + TORCH pts
  var scoreRow = document.createElement('div');
  scoreRow.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;animation:ddFadeUp 0.4s 0.2s ease both;opacity:0;';
  scoreRow.style.animationFillMode = 'forwards';

  var scoreEl = document.createElement('div');
  scoreEl.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:28px;color:#fff;letter-spacing:2px;";
  scoreEl.textContent = result.score || '--';

  var torchPtsEl = document.createElement('div');
  torchPtsEl.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:700;font-size:14px;color:var(--a-gold);letter-spacing:2px;";
  torchPtsEl.textContent = (result.torchPts != null ? result.torchPts : '--') + ' TORCH PTS';

  scoreRow.appendChild(scoreEl);
  scoreRow.appendChild(torchPtsEl);
  content.appendChild(scoreRow);

  // Share card
  var shareText = _buildShareText(result, setup, streak, todayKey);

  var shareCard = document.createElement('div');
  shareCard.style.cssText = 'width:100%;max-width:320px;background:rgba(255,255,255,0.04);border:1px solid #333;border-radius:8px;padding:14px 16px;font-family:monospace;font-size:13px;line-height:1.8;color:#eee;white-space:pre;text-align:left;animation:ddFadeUp 0.4s 0.25s ease both;opacity:0;';
  shareCard.style.animationFillMode = 'forwards';
  shareCard.textContent = shareText;
  content.appendChild(shareCard);

  // Share button
  var shareBtn = document.createElement('button');
  shareBtn.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:700;font-size:12px;letter-spacing:3px;padding:12px 28px;border:2px solid var(--a-gold);background:transparent;color:var(--a-gold);border-radius:6px;cursor:pointer;animation:ddFadeUp 0.4s 0.3s ease both;opacity:0;";
  shareBtn.style.animationFillMode = 'forwards';
  shareBtn.textContent = 'SHARE RESULT';
  shareBtn.onclick = function() {
    navigator.clipboard.writeText(shareText).then(function() {
      shareBtn.textContent = 'COPIED!';
      setTimeout(function() { shareBtn.textContent = 'SHARE RESULT'; }, 1800);
    }).catch(function() {
      // Fallback for browsers without clipboard API
      shareBtn.textContent = 'COPIED!';
      setTimeout(function() { shareBtn.textContent = 'SHARE RESULT'; }, 1800);
    });
  };
  content.appendChild(shareBtn);

  var nextNote = document.createElement('div');
  nextNote.style.cssText = "font-family:'Rajdhani',sans-serif;font-size:10px;color:#555;letter-spacing:1px;animation:ddFadeUp 0.4s 0.35s ease both;opacity:0;";
  nextNote.style.animationFillMode = 'forwards';
  nextNote.textContent = 'New drive tomorrow.';
  content.appendChild(nextNote);
}

// ============================================================
// SHARE TEXT BUILDER
// ============================================================

function _buildShareText(result, setup, streak, todayKey) {
  var humanTeam = TEAMS[setup.team];
  var oppTeam = TEAMS[setup.opponent];
  var humanName = humanTeam ? humanTeam.name : setup.team.toUpperCase();
  var oppName = oppTeam ? oppTeam.name : setup.opponent.toUpperCase();
  var wonLabel = result.won ? 'VICTORY' : 'DEFEAT';

  var grid = result.snapLog ? generateDailyGrid(result.snapLog) : '';

  var lines = [
    'TORCH DAILY ' + todayKey,
    humanName + ' vs ' + oppName + ' (' + setup.difficulty + ')',
  ];

  if (grid) {
    lines.push('');
    lines.push(grid);
    lines.push('');
    lines.push(wonLabel + ' ' + (result.score || '--') + ' | TORCH: ' + (result.torchPts != null ? result.torchPts : '--'));
  } else {
    lines.push(wonLabel + ' ' + (result.score || '--') + ' | ' + (result.torchPts != null ? result.torchPts : '--') + ' pts');
  }

  if (streak > 0) {
    lines.push('\uD83D\uDD25 ' + streak + '-day streak');
  }

  lines.push('torch.football');

  return lines.join('\n');
}

// ============================================================
// RECORD DAILY RESULT (called from endGame)
// ============================================================

export function recordDailyResult(torchPts, score, won, snapLog) {
  var todayKey = getTodayKey();
  var streak = updateStreak(todayKey);
  var payload = {
    played: true,
    torchPts: torchPts || 0,
    score: score || '0-0',
    won: !!won,
  };
  // Save CT-only snaps for grid generation (cap at 60 to keep localStorage lean)
  if (snapLog && Array.isArray(snapLog)) {
    var ctSnaps = snapLog.filter(function(s) { return s && s.team === 'CT'; }).slice(0, 60);
    if (ctSnaps.length > 0) payload.snapLog = ctSnaps;
  }
  localStorage.setItem('torch_daily_' + todayKey, JSON.stringify(payload));
  return streak;
}

// ============================================================
// EMOJI GRID GENERATOR
// ============================================================

function generateDailyGrid(snapLog) {
  if (!snapLog || !snapLog.length) return '';

  var emojis = snapLog.map(function(snap) {
    if (!snap) return '⬜';
    var event = snap.event || '';
    var yards = snap.yards || 0;
    var card = snap.offCard;

    // Torch card takes priority — marks the snap
    if (card) return '🔥';
    // Touchdown
    if (event === 'touchdown') return '🏈';
    // Turnover events
    if (event === 'interception' || event === 'fumble_lost' || event === 'turnover_on_downs') return '🟥';
    // Negative yards (sacks, stuffed runs)
    if (yards < 0) return '🟥';
    // No gain
    if (yards === 0) return '⬜';
    // Short gain 1-3
    if (yards <= 3) return '🟨';
    // Positive 4+
    return '🟩';
  });

  // Wrap at 10 per line
  var lines = [];
  for (var i = 0; i < emojis.length; i += 10) {
    lines.push(emojis.slice(i, i + 10).join(''));
  }
  return lines.join('\n');
}

// ============================================================
// INTERNAL HELPERS
// ============================================================

function _diffColor(diff) {
  if (diff === 'EASY') return '#00FF44';
  if (diff === 'HARD') return '#FF4511';
  return '#EBB010';
}
