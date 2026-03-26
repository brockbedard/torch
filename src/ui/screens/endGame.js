/**
 * TORCH v0.22 — End Game Screen
 * Victory/defeat + score + TORCH breakdown + season + Film Room.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam } from '../../state.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import AudioStateManager from '../../engine/audioManager.js';

export function buildEndGame() {
  AudioStateManager.setState('game_over');
  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow-y:auto;';

  var styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }' +
    '@keyframes victoryPulse { 0%,100% { text-shadow:0 0 20px rgba(0,255,68,0.4); } 50% { text-shadow:0 0 40px rgba(0,255,68,0.8); } }';
  el.appendChild(styleEl);

  var gs = GS.finalEngine;
  var team = getTeam(GS.team);
  var oppId = GS.opponent || 'wolves';
  var opp = getTeam(oppId);

  var humanScore = gs.ctScore;
  var cpuScore = gs.irScore;
  var humanWon = humanScore > cpuScore;
  var tied = humanScore === cpuScore;
  var humanTorch = gs.ctTorchPts;

  // Single-game format — TORCH points persist across games
  var season = GS.season || { torchCards: [], carryoverPoints: 0 };
  var winBonus = humanWon ? 20 : 0;
  season.carryoverPoints = humanTorch + winBonus;

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = 'background:rgba(0,0,0,0.7);padding:10px 14px;text-align:center;flex-shrink:0;border-bottom:3px solid ' + (humanWon ? '#00ff44' : tied ? '#EBB010' : '#ff0040') + ';';
  hdr.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:30px;letter-spacing:4px;font-style:italic;transform:skewX(-8deg);" +
    (humanWon ? 'color:#00ff44;animation:victoryPulse 2s infinite;' : tied ? 'color:#EBB010;' : 'color:#ff0040;') + "\">" +
    (humanWon ? 'VICTORY' : tied ? 'TIE GAME' : 'DEFEAT') + '</div>';
  el.appendChild(hdr);

  var content = document.createElement('div');
  content.style.cssText = 'padding:10px 16px 16px;display:flex;flex-direction:column;align-items:center;gap:10px;animation:fadeSlideUp 0.5s ease-out;';

  // Score with team badges
  var scoreBlock = document.createElement('div');
  scoreBlock.style.cssText = 'display:flex;align-items:center;gap:12px;';
  scoreBlock.innerHTML =
    '<div style="display:flex;align-items:center;gap:6px;">' + renderTeamBadge(GS.team, 32) +
      "<div style='text-align:center;'><div style=\"font-family:'Teko';font-size:14px;color:" + team.accent + ";\">" + team.name + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:34px;color:#fff;\">" + humanScore + "</div></div></div>" +
    "<div style=\"font-family:'Teko';font-size:24px;color:#555;\">\u2014</div>" +
    '<div style="display:flex;align-items:center;gap:6px;flex-direction:row-reverse;">' + renderTeamBadge(oppId, 32) +
      "<div style='text-align:center;'><div style=\"font-family:'Teko';font-size:14px;color:" + opp.accent + ";\">" + opp.name + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:34px;color:#fff;\">" + cpuScore + "</div></div></div>";
  content.appendChild(scoreBlock);

  // TORCH points with breakdown
  var torchBlock = document.createElement('div');
  torchBlock.style.cssText = 'background:var(--bg-surface);border:1px solid #EBB010;border-radius:8px;padding:10px 16px;text-align:center;width:100%;max-width:300px;';
  torchBlock.innerHTML =
    "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#EBB010;letter-spacing:2px;margin-bottom:4px;\">TORCH POINTS</div>" +
    "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:28px;color:#EBB010;text-shadow:0 0 12px rgba(235,176,16,0.4);\">" + (humanTorch + winBonus) + "</div>" +
    "<div style=\"font-family:'Rajdhani';font-size:9px;color:#aaa;margin-top:4px;\">Base: " + humanTorch + (winBonus ? ' | Win Bonus: +' + winBonus : '') + "</div>";
  content.appendChild(torchBlock);

  // Film Room — good AND bad plays
  if (gs.snapLog && gs.snapLog.length > 2) {
    var filmBlock = document.createElement('div');
    filmBlock.style.cssText = 'background:var(--bg-surface);border:1px solid #333;border-radius:8px;padding:10px 14px;width:100%;max-width:300px;';
    filmBlock.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#FF6B00;letter-spacing:2px;margin-bottom:6px;\">FILM ROOM</div>";

    var moments = [];
    gs.snapLog.forEach(function(log, i) {
      if (!log || log.team !== 'CT') return;
      var text = log.result || '';
      var isGood = text.indexOf('TD') >= 0 || text.indexOf('TOUCHDOWN') >= 0 || (parseInt(text.match(/\+(\d+)/)?.[1]) >= 10);
      var isBad = text.indexOf('SACK') >= 0 || text.indexOf('INT') >= 0 || text.indexOf('FUMBLE') >= 0;
      if (isGood || isBad) {
        moments.push({ snap: i + 1, text: text, good: isGood });
      }
    });

    var shown = moments.slice(0, 4);
    if (shown.length === 0) {
      filmBlock.innerHTML += "<div style=\"font-family:'Rajdhani';font-size:10px;color:#00ff44;text-align:center;padding:4px;\">Clean game, Coach. Nothing to review.</div>";
    } else {
      shown.forEach(function(m) {
        var color = m.good ? '#00ff44' : '#ff0040';
        var tip = m.good ? 'Great read.' : 'Watch the coverage next time.';
        filmBlock.innerHTML += "<div style=\"font-family:'Rajdhani';font-size:9px;color:#ccc;padding:3px 0;border-bottom:1px solid #0E0A04;line-height:1.3;\">" +
          "<span style='color:" + color + ";'>Snap " + m.snap + ":</span> " + m.text +
          "<br><span style='color:#666;font-size:8px;font-style:italic;'>" + tip + "</span></div>";
      });
    }
    content.appendChild(filmBlock);
  }

  // Play Again — back to team select, keep TORCH points
  var playBtn = document.createElement('button');
  playBtn.className = 'btn-blitz';
  playBtn.style.cssText = "width:100%;max-width:300px;font-size:14px;background:linear-gradient(180deg,#EBB010,#FF4511);border-color:#FF4511;color:#000;letter-spacing:2px;";
  playBtn.textContent = 'PLAY AGAIN';
  playBtn.onclick = function() {
    SND.snap();
    setGs(function(s) {
      return Object.assign({}, s, {
        screen: 'teamSelect', opponent: null, engine: null, finalEngine: null,
        season: { torchCards: season.torchCards || [], carryoverPoints: season.carryoverPoints }
      });
    });
  };
  content.appendChild(playBtn);

  el.appendChild(content);
  return el;
}
