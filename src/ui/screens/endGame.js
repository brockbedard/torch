/**
 * TORCH v0.22 — End Game Screen
 * Victory/defeat + score + TORCH breakdown + season + Film Room.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam } from '../../state.js';
import { TEAMS, getSeasonOpponents } from '../../data/teams.js';
import { showShop } from '../components/shop.js';
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

  // Season state
  var season = GS.season || { opponents: [], currentGame: 0, results: [], totalScore: 0, torchCards: [], carryoverPoints: 0 };
  var gameNum = season.currentGame || 0;
  var isLastGame = gameNum >= 2;
  var winBonus = humanWon ? 100 : 0;
  var gamePoints = humanTorch + winBonus;
  season.results = season.results || [];
  if (season.results.length <= gameNum) {
    season.results.push({ won: humanWon, score: gamePoints });
  }
  season.totalScore = season.results.reduce(function(sum, r) { return sum + r.score; }, 0);
  season.carryoverPoints = humanTorch;
  var allWon = isLastGame && season.results.every(function(r) { return r.won; });
  if (allWon) season.totalScore += 200;

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

  // Season progress
  var seasonBlock = document.createElement('div');
  seasonBlock.style.cssText = 'background:var(--bg-surface);border:1px solid #333;border-radius:8px;padding:10px 14px;width:100%;max-width:300px;';
  seasonBlock.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:2px;margin-bottom:6px;\">GAME " + (gameNum + 1) + " OF 3 COMPLETE</div>";
  var resultsRow = document.createElement('div');
  resultsRow.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;';
  var opponents = season.opponents || getSeasonOpponents(GS.team);
  for (var g = 0; g < 3; g++) {
    var oppTeam = TEAMS[opponents[g]];
    var result = season.results[g];
    var pip = document.createElement('div');
    pip.style.cssText = 'flex:1;padding:4px;border-radius:4px;text-align:center;border:1px solid ' +
      (result ? (result.won ? '#00ff44' : '#ff0040') : '#333') + ';background:' +
      (result ? (result.won ? 'rgba(0,255,68,0.08)' : 'rgba(255,0,64,0.08)') : 'rgba(0,0,0,0.3)') + ';';
    pip.innerHTML = "<div style=\"font-family:'Rajdhani';font-size:7px;color:#aaa;\">" + (oppTeam ? oppTeam.name : '?') + "</div>" +
      "<div style=\"font-family:'Teko';font-size:14px;color:" + (result ? (result.won ? '#00ff44' : '#ff0040') : '#555') + ";\">" + (result ? (result.won ? 'W' : 'L') : '\u2014') + "</div>";
    resultsRow.appendChild(pip);
  }
  seasonBlock.appendChild(resultsRow);
  seasonBlock.innerHTML += "<div style=\"font-family:'Rajdhani';font-size:9px;color:#aaa;text-align:center;\">SEASON SCORE: " + season.totalScore + (allWon ? ' (+200 SWEEP!)' : '') + "</div>";
  content.appendChild(seasonBlock);

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

  // Buttons
  if (isLastGame) {
    var returnBtn = document.createElement('button');
    returnBtn.className = 'btn-blitz';
    returnBtn.style.cssText = "width:100%;max-width:300px;font-size:14px;background:linear-gradient(180deg,#EBB010,#FF4511);border-color:#FF4511;color:#000;letter-spacing:2px;";
    returnBtn.textContent = 'NEW SEASON';
    returnBtn.onclick = function() {
      SND.click();
      localStorage.setItem('torch_first_season_done', '1');
      setGs(null);
    };
    content.appendChild(returnBtn);
  } else {
    var nextOppId = opponents[gameNum + 1];
    var nextOpp = TEAMS[nextOppId];
    content.innerHTML += "<div style=\"text-align:center;font-family:'Rajdhani';font-size:10px;color:#aaa;\">NEXT: <span style='color:" + (nextOpp ? nextOpp.accent : '#fff') + ";font-weight:700;'>" + (nextOpp ? nextOpp.name : '?') + "</span></div>";

    var shopBtn = document.createElement('button');
    shopBtn.className = 'btn-blitz';
    shopBtn.style.cssText = "width:100%;max-width:300px;font-size:11px;background:var(--bg-surface);border-color:#EBB010;color:#EBB010;";
    shopBtn.textContent = 'TORCH CARD SHOP (' + humanTorch + ' PTS)';
    shopBtn.onclick = function() {
      SND.click();
      showShop(el, 'betweenGame', humanTorch, season.torchCards || [], function(card, newInv, spent) {
        season.torchCards = newInv;
        season.carryoverPoints -= spent;
      }, function() {});
    };
    content.appendChild(shopBtn);

    var nextBtn = document.createElement('button');
    nextBtn.className = 'btn-blitz';
    nextBtn.style.cssText = "width:100%;max-width:300px;font-size:14px;background:linear-gradient(180deg,#EBB010,#FF4511);border-color:#FF4511;color:#000;letter-spacing:2px;";
    nextBtn.textContent = 'NEXT GAME \u2192';
    nextBtn.onclick = function() {
      SND.snap();
      season.currentGame = gameNum + 1;
      setGs(function(s) {
        return Object.assign({}, s, { screen: 'teamSelect', opponent: nextOppId, engine: null, finalEngine: null, season: season });
      });
    };
    content.appendChild(nextBtn);
  }

  el.appendChild(content);
  return el;
}
