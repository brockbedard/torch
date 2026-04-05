import { setGs, VERSION, GAME_SPEED, setGameSpeed } from '../../state.js';
import { getAllAchievements, getUnlockedIds, getProgress } from '../../engine/achievements.js';
import AudioStateManager from '../../engine/audioManager.js';
import { getRecentGames, getFormString } from '../../engine/gameHistory.js';

export function buildSettings() {
  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);padding:16px;overflow-y:auto;';

  // Back button
  var backBtn = document.createElement('div');
  backBtn.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:11px;color:#555;cursor:pointer;padding:4px;margin-bottom:8px;";
  backBtn.textContent = '← BACK';
  backBtn.onclick = function() { setGs(null); };
  el.appendChild(backBtn);

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = "font-family:'Teko';font-weight:700;font-size:28px;color:#EBB010;letter-spacing:3px;text-align:center;margin-bottom:16px;";
  hdr.textContent = 'SETTINGS & PROFILE';
  el.appendChild(hdr);

  // ── AUDIO SECTION ──
  var audioSection = createSection('AUDIO');
  var isMuted = AudioStateManager.isMuted ? AudioStateManager.isMuted() : (localStorage.getItem('torch_muted') === 'true');
  var muteRow = createToggleRow('Sound Effects', !isMuted, function(on) {
    // Only toggle if state differs from desired
    var currentlyMuted = AudioStateManager.isMuted ? AudioStateManager.isMuted() : (localStorage.getItem('torch_muted') === 'true');
    if (on && currentlyMuted) AudioStateManager.toggleMute();
    else if (!on && !currentlyMuted) AudioStateManager.toggleMute();
  });
  audioSection.appendChild(muteRow);
  el.appendChild(audioSection);

  // ── GAME SPEED SECTION ──
  var speedSection = createSection('GAME SPEED');
  var speedRow = document.createElement('div');
  speedRow.style.cssText = 'display:flex;gap:8px;padding:8px 0;';
  ['normal', 'fast', 'turbo'].forEach(function(speed) {
    var btn = document.createElement('button');
    var isSel = GAME_SPEED.current === speed;
    btn.style.cssText = "flex:1;font-family:'Rajdhani';font-weight:700;font-size:11px;letter-spacing:1px;padding:8px;border-radius:4px;cursor:pointer;border:1px solid " +
      (isSel ? '#EBB010' : '#333') + ";background:" + (isSel ? '#EBB010' : 'transparent') + ";color:" + (isSel ? '#000' : '#666') + ";";
    btn.textContent = speed.toUpperCase();
    btn.onclick = function() {
      setGameSpeed(speed);
      speedRow.querySelectorAll('button').forEach(function(b, i) {
        var s = ['normal', 'fast', 'turbo'][i];
        var sel = s === speed;
        b.style.borderColor = sel ? '#EBB010' : '#333';
        b.style.background = sel ? '#EBB010' : 'transparent';
        b.style.color = sel ? '#000' : '#666';
      });
    };
    speedRow.appendChild(btn);
  });
  speedSection.appendChild(speedRow);
  el.appendChild(speedSection);

  // ── ACHIEVEMENTS SECTION ──
  var achSection = createSection('ACHIEVEMENTS');
  var prog = getProgress();
  var progEl = document.createElement('div');
  progEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:12px;color:#EBB010;margin-bottom:8px;";
  progEl.textContent = prog.unlocked + ' / ' + prog.total + ' UNLOCKED';
  achSection.appendChild(progEl);

  // Progress bar
  var progBar = document.createElement('div');
  progBar.style.cssText = 'height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-bottom:12px;overflow:hidden;';
  var progFill = document.createElement('div');
  var pct = prog.total > 0 ? Math.round(prog.unlocked / prog.total * 100) : 0;
  progFill.style.cssText = 'height:100%;background:#EBB010;border-radius:2px;width:' + pct + '%;transition:width 0.5s;';
  progBar.appendChild(progFill);
  achSection.appendChild(progBar);

  // Achievement list
  var allAch = getAllAchievements();
  var unlockedIds = getUnlockedIds();
  allAch.forEach(function(ach) {
    var isUnlocked = unlockedIds.indexOf(ach.id) >= 0;
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid rgba(255,255,255,0.08);' + (isUnlocked ? '' : 'opacity:0.35;');
    row.innerHTML =
      "<div style='font-size:16px;flex-shrink:0;width:24px;text-align:center;'>" + (isUnlocked ? ach.icon : '🔒') + "</div>" +
      "<div style='flex:1;min-width:0;'>" +
        "<div style=\"font-family:'Teko';font-weight:700;font-size:13px;color:" + (isUnlocked ? '#EBB010' : '#555') + ";letter-spacing:1px;\">" + ach.name + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-size:10px;color:#888;\">" + ach.desc + "</div>" +
      "</div>";
    achSection.appendChild(row);
  });
  el.appendChild(achSection);

  // ── ALL-TIME STATS SECTION ──
  var statsSection = createSection('ALL-TIME STATS');
  var gamesPlayed = parseInt(localStorage.getItem('torch_games_played') || '0');
  var records = {};
  try { records = JSON.parse(localStorage.getItem('torch_team_records') || '{}'); } catch(e) {}
  var totalWins = 0, totalLosses = 0, totalTies = 0;
  for (var tid in records) {
    totalWins += (records[tid].wins || 0);
    totalLosses += (records[tid].losses || 0);
    totalTies += (records[tid].ties || 0);
  }
  var titles = {};
  try { titles = JSON.parse(localStorage.getItem('torch_titles') || '{}'); } catch(e) {}
  var totalTitles = 0;
  for (var t in titles) totalTitles += titles[t];

  var stats = [
    ['Games Played', gamesPlayed],
    ['Record', totalWins + '-' + totalLosses + (totalTies > 0 ? '-' + totalTies : '')],
    ['Championships', totalTitles],
    ['Win %', gamesPlayed > 0 ? Math.round(totalWins / gamesPlayed * 100) + '%' : '—'],
  ];
  stats.forEach(function(s) {
    var row = document.createElement('div');
    row.style.cssText = "display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #0E0A04;font-family:'Rajdhani';font-size:12px;color:#aaa;";
    row.innerHTML = '<span>' + s[0] + '</span><span style="color:#fff;font-weight:700;">' + s[1] + '</span>';
    statsSection.appendChild(row);
  });
  // Recent form
  var form = getFormString(10);
  if (form.length > 0) {
    var formRow = document.createElement('div');
    formRow.style.cssText = "display:flex;gap:3px;justify-content:center;padding:8px 0;";
    form.split('').forEach(function(ch) {
      var pip = document.createElement('div');
      var col = ch === 'W' ? '#00ff44' : ch === 'D' ? '#EBB010' : '#ff0040';
      pip.style.cssText = "width:18px;height:18px;border-radius:3px;background:" + col + ";font-family:'Teko';font-weight:700;font-size:11px;color:#000;display:flex;align-items:center;justify-content:center;";
      pip.textContent = ch;
      formRow.appendChild(pip);
    });
    statsSection.appendChild(formRow);
  }

  // Last 5 games
  var recent = getRecentGames(5);
  if (recent.length > 0) {
    var recentHdr = document.createElement('div');
    recentHdr.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#555;letter-spacing:1px;padding:8px 0 4px;";
    recentHdr.textContent = 'RECENT GAMES';
    statsSection.appendChild(recentHdr);

    recent.forEach(function(g) {
      var row = document.createElement('div');
      var resultCol = g.won ? '#00ff44' : g.tied ? '#EBB010' : '#ff0040';
      var resultText = g.won ? 'W' : g.tied ? 'D' : 'L';
      row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #0E0A04;font-family:'Rajdhani';font-size:11px;color:#aaa;";
      row.innerHTML = '<span style="color:' + resultCol + ';font-weight:700;">' + resultText + '</span>' +
        '<span>vs ' + (g.opponent || '?') + '</span>' +
        '<span>' + g.humanScore + '-' + g.cpuScore + '</span>' +
        '<span style="color:#EBB010;">' + (g.torchPts || 0) + ' pts</span>';
      statsSection.appendChild(row);
    });
  }

  el.appendChild(statsSection);

  // ── VERSION ──
  var verEl = document.createElement('div');
  verEl.style.cssText = "text-align:center;padding:16px;font-family:'Rajdhani';font-size:10px;color:#333;";
  verEl.textContent = 'TORCH Football v' + VERSION;
  el.appendChild(verEl);

  // ── RESET (danger zone) ──
  var resetBtn = document.createElement('div');
  resetBtn.style.cssText = "text-align:center;padding:8px;font-family:'Rajdhani';font-size:10px;color:#ff004044;cursor:pointer;";
  resetBtn.textContent = 'Reset All Progress';
  resetBtn.onclick = function() {
    if (confirm('This will erase ALL progress, achievements, and records. Are you sure?')) {
      localStorage.clear();
      setGs(null);
    }
  };
  el.appendChild(resetBtn);

  return el;
}

// ── HELPERS ──

function createSection(title) {
  var sec = document.createElement('div');
  sec.style.cssText = 'margin-bottom:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;';
  var hdr = document.createElement('div');
  hdr.style.cssText = "font-family:'Teko';font-weight:700;font-size:14px;color:#FF4511;letter-spacing:2px;margin-bottom:8px;";
  hdr.textContent = title;
  sec.appendChild(hdr);
  return sec;
}

function createToggleRow(label, isOn, onChange) {
  var row = document.createElement('div');
  row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:6px 0;';
  row.innerHTML = "<span style=\"font-family:'Rajdhani';font-size:12px;color:#ccc;\">" + label + "</span>";
  var toggle = document.createElement('div');
  toggle.style.cssText = 'width:36px;height:20px;border-radius:10px;cursor:pointer;position:relative;transition:background 0.2s;background:' + (isOn ? '#00ff44' : '#333') + ';';
  var knob = document.createElement('div');
  knob.style.cssText = 'position:absolute;top:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left 0.2s;left:' + (isOn ? '18px' : '2px') + ';';
  toggle.appendChild(knob);
  var state = isOn;
  toggle.onclick = function() {
    state = !state;
    toggle.style.background = state ? '#00ff44' : '#333';
    knob.style.left = state ? '18px' : '2px';
    onChange(state);
  };
  row.appendChild(toggle);
  return row;
}
