/**
 * TORCH v0.21 — Daily Drive
 * One shared scenario per day. Date-based seed. 2-3 minute challenge.
 * Same matchup for all players — only card choices differ.
 * Efficiency score + shareable result grid.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOffCards, getDefCards } from '../../state.js';
import { TEAMS, getSeasonOpponents } from '../../data/teams.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { generateConditions } from '../../data/gameConditions.js';

// Date-based seed: produces deterministic values from a date string
function dateSeed(dateStr) {
  var hash = 0;
  for (var i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  // Simple LCG
  seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
  return { value: seed / 0x7fffffff, next: seed };
}

function getTodayKey() {
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

export function buildDailyDrive() {
  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);';

  var todayKey = getTodayKey();
  var played = localStorage.getItem('torch_daily_' + todayKey);

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = 'background:rgba(0,0,0,0.5);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;border-bottom:2px solid var(--a-gold);';
  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText = "font-family:'Teko';font-weight:700;font-size:24px;color:var(--a-gold);letter-spacing:3px;font-style:italic;transform:skewX(-8deg);text-shadow:2px 2px 0 rgba(0,0,0,0.9);";
  hdrTitle.textContent = 'DAILY DRIVE';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = "font-family:'Rajdhani';font-size:10px;padding:8px 14px;cursor:pointer;background:#000;color:#fff;border:2px solid #333;border-radius:4px;";
  backBtn.textContent = '\u2190 BACK';
  backBtn.onclick = function() { SND.click(); setGs(null); };
  hdr.appendChild(hdrTitle);
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  var content = document.createElement('div');
  content.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:20px 20px 16px;gap:10px;';

  // Date display
  var dateEl = document.createElement('div');
  dateEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:12px;color:#aaa;letter-spacing:2px;";
  dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  content.appendChild(dateEl);

  if (played) {
    // Already played today — show result
    var result = JSON.parse(played);

    var doneTitle = document.createElement('div');
    doneTitle.style.cssText = "font-family:'Teko';font-weight:700;font-size:28px;color:var(--a-gold);letter-spacing:3px;";
    doneTitle.textContent = 'DRIVE COMPLETE';
    content.appendChild(doneTitle);

    var scoreEl = document.createElement('div');
    scoreEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:20px;color:#fff;";
    scoreEl.textContent = 'Score: ' + result.score;
    content.appendChild(scoreEl);

    // Shareable result grid
    var gridEl = document.createElement('div');
    gridEl.style.cssText = "font-family:monospace;font-size:14px;line-height:1.6;color:#fff;background:var(--bg-surface);padding:12px 16px;border-radius:8px;border:1px solid #333;text-align:center;";
    gridEl.textContent = result.grid;
    content.appendChild(gridEl);

    // Copy button
    var copyBtn = document.createElement('button');
    copyBtn.className = 'btn-blitz';
    copyBtn.style.cssText = 'font-size:10px;padding:8px 20px;background:var(--bg-surface);border-color:var(--a-gold);color:var(--a-gold);';
    copyBtn.textContent = 'COPY RESULT';
    copyBtn.onclick = function() {
      navigator.clipboard.writeText('TORCH Football Daily Drive\n' + dateEl.textContent + '\nScore: ' + result.score + '\n' + result.grid).then(function() {
        copyBtn.textContent = 'COPIED!';
        setTimeout(function() { copyBtn.textContent = 'COPY RESULT'; }, 1500);
      });
    };
    content.appendChild(copyBtn);

    var nextEl = document.createElement('div');
    nextEl.style.cssText = "font-family:'Rajdhani';font-size:10px;color:#666;margin-top:8px;";
    nextEl.textContent = 'Next drive tomorrow.';
    content.appendChild(nextEl);
  } else {
    // Generate today's scenario from seed
    var seed = dateSeed(todayKey);
    var teamIds = Object.keys(TEAMS);
    var r1 = seededRandom(seed);
    var humanIdx = r1.value * teamIds.length | 0;
    var r2 = seededRandom(r1.next);
    var oppIdx = (humanIdx + 1 + (r2.value * (teamIds.length - 1) | 0)) % teamIds.length;
    var humanTeam = teamIds[humanIdx];
    var oppTeam = teamIds[oppIdx];

    var humanT = TEAMS[humanTeam];
    var oppT = TEAMS[oppTeam];

    // Scenario display
    var matchup = document.createElement('div');
    matchup.style.cssText = "font-family:'Teko';font-weight:700;font-size:22px;color:#fff;letter-spacing:2px;text-align:center;";
    matchup.innerHTML = "<span style='color:" + humanT.accent + "'>" + humanT.name + "</span> vs <span style='color:" + oppT.accent + "'>" + oppT.name + "</span>";
    content.appendChild(matchup);

    var descEl = document.createElement('div');
    descEl.style.cssText = "font-family:'Rajdhani';font-size:11px;color:#aaa;text-align:center;line-height:1.4;max-width:280px;";
    descEl.textContent = 'Score as many points as you can in one half. Same scenario for everyone today.';
    content.appendChild(descEl);

    var startBtn = document.createElement('button');
    startBtn.className = 'btn-blitz';
    startBtn.style.cssText = 'font-size:16px;padding:14px 32px;background:linear-gradient(180deg,#EBB010,#FF4511);border-color:#FF4511;color:#000;letter-spacing:3px;';
    startBtn.textContent = 'START DRIVE';
    startBtn.onclick = function() {
      SND.snap();
      setGs(function(s) {
        return Object.assign({}, s || {}, {
          screen: 'gameplay',
          team: humanTeam,
          opponent: oppTeam,
          difficulty: 'MEDIUM',
          humanReceives: true,
          _coinTossDone: true,
          isDailyDrive: true,
          dailySeed: seed,
          isFirstSeason: false,
          gameConditions: { weather: 'clear', field: 'turf', crowd: 'neutral' },
          offRoster: getOffenseRoster(humanTeam).slice(0, 4).map(function(p) { return p.id; }),
          defRoster: getDefenseRoster(humanTeam).slice(0, 4).map(function(p) { return p.id; }),
          offHand: getOffCards(humanTeam).slice(0, 5),
          defHand: getDefCards(humanTeam).slice(0, 5),
          season: { opponents: [oppTeam], currentGame: 0, results: [], totalScore: 0, torchCards: [], carryoverPoints: 0 },
        });
      });
    };
    content.appendChild(startBtn);
  }

  el.appendChild(content);
  return el;
}

// Called from endGame to record daily drive result
export function recordDailyResult(score, snapLog) {
  var todayKey = getTodayKey();
  // Build Wordle-style grid from snap results
  var grid = '';
  if (snapLog) {
    snapLog.forEach(function(log) {
      if (!log || log.team !== 'CT') return; // Human snaps only
      var text = log.result || '';
      if (text.indexOf('TD') >= 0 || text.indexOf('TOUCHDOWN') >= 0) grid += '\uD83D\uDD25'; // fire
      else if (text.indexOf('INT') >= 0 || text.indexOf('FUMBLE') >= 0) grid += '\u274C'; // red X
      else if (text.indexOf('SACK') >= 0 || text.indexOf('-') >= 0) grid += '\uD83D\uDFE5'; // red square
      else if (text.indexOf('1st') >= 0 || parseInt(text) >= 5) grid += '\uD83D\uDFE9'; // green square
      else grid += '\uD83D\uDFE8'; // yellow square
    });
  }
  localStorage.setItem('torch_daily_' + todayKey, JSON.stringify({ score: score, grid: grid }));
}
