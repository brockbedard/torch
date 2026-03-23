/**
 * TORCH v0.21 — End Game Screen
 * Final score, TORCH points, season progress, between-game shop, next game.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam } from '../../state.js';
import { TEAMS, getSeasonOpponents } from '../../data/teams.js';
import { showShop } from '../components/shop.js';

export function buildEndGame() {
  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow-y:auto;';

  var styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }' +
    '@keyframes victoryPulse { 0%,100% { text-shadow:0 0 20px rgba(0,255,68,0.4); } 50% { text-shadow:0 0 40px rgba(0,255,68,0.8); } }';
  el.appendChild(styleEl);

  var gs = GS.finalEngine;
  // v0.21: human always maps to CT slot
  var humanAbbr = 'CT';
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

  // Record result
  var winBonus = humanWon ? 100 : 0;
  var gamePoints = humanTorch + winBonus;
  season.results = season.results || [];
  if (season.results.length <= gameNum) {
    season.results.push({ won: humanWon, score: gamePoints });
  }
  season.totalScore = season.results.reduce(function(sum, r) { return sum + r.score; }, 0);
  season.carryoverPoints = humanTorch; // Unspent points carry over

  // Sweep bonus
  var allWon = isLastGame && season.results.every(function(r) { return r.won; });
  if (allWon) season.totalScore += 200;

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = 'background:rgba(0,0,0,0.7);padding:12px 14px;text-align:center;flex-shrink:0;border-bottom:2px solid var(--a-gold);';
  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText =
    "font-family:'Teko',sans-serif;font-weight:700;font-size:32px;letter-spacing:3px;font-style:italic;transform:skewX(-8deg);" +
    (humanWon ? 'color:#00ff44;animation:victoryPulse 2s infinite;' : tied ? 'color:var(--a-gold);' : 'color:#ff0040;');
  hdrTitle.textContent = humanWon ? 'VICTORY' : tied ? 'TIE GAME' : 'DEFEAT';
  hdr.appendChild(hdrTitle);
  el.appendChild(hdr);

  // Content
  var content = document.createElement('div');
  content.style.cssText = 'padding:12px 16px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;animation:fadeSlideUp 0.5s ease-out;';

  // Score display
  var scoreBlock = document.createElement('div');
  scoreBlock.style.cssText = 'display:flex;align-items:center;gap:20px;margin-bottom:4px;';
  function teamBlock(name, score, color) {
    var b = document.createElement('div');
    b.style.cssText = 'text-align:center;';
    b.innerHTML = "<div style=\"font-family:'Teko';font-size:24px;color:" + color + ";letter-spacing:2px;\">" + name + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:36px;color:#fff;text-shadow:0 0 15px rgba(255,255,255,0.3);\">" + score + "</div>";
    return b;
  }
  var dash = document.createElement('div');
  dash.style.cssText = "font-family:'Teko';font-size:28px;color:var(--muted);";
  dash.textContent = '\u2014';
  scoreBlock.append(teamBlock(team.name, humanScore, team.accent), dash, teamBlock(opp.name, cpuScore, opp.accent));
  content.appendChild(scoreBlock);

  // TORCH points
  var torchBlock = document.createElement('div');
  torchBlock.style.cssText = 'background:var(--bg-surface);border:1px solid var(--a-gold);border-radius:8px;padding:10px 20px;text-align:center;width:100%;max-width:300px;';
  torchBlock.innerHTML =
    "<div style=\"font-family:'Rajdhani';font-size:8px;color:var(--a-gold);letter-spacing:2px;margin-bottom:4px;\">TORCH POINTS</div>" +
    "<div style=\"font-family:'Rajdhani';font-size:24px;color:var(--a-gold);text-shadow:0 0 15px rgba(255,184,0,0.4);\">" + humanTorch + "</div>" +
    (winBonus ? "<div style=\"font-family:'Rajdhani';font-size:10px;color:#00ff44;margin-top:2px;\">+100 WIN BONUS</div>" : '');
  content.appendChild(torchBlock);

  // Season Progress
  var seasonBlock = document.createElement('div');
  seasonBlock.style.cssText = 'background:var(--bg-surface);border:1px solid #333;border-radius:8px;padding:12px 16px;width:100%;max-width:300px;';

  var seasonTitle = document.createElement('div');
  seasonTitle.style.cssText = "font-family:'Teko';font-weight:700;font-size:16px;color:var(--a-gold);letter-spacing:2px;margin-bottom:8px;";
  seasonTitle.textContent = 'GAME ' + (gameNum + 1) + ' OF 3 COMPLETE';
  seasonBlock.appendChild(seasonTitle);

  // Game results row
  var resultsRow = document.createElement('div');
  resultsRow.style.cssText = 'display:flex;gap:6px;margin-bottom:8px;';
  var opponents = season.opponents || getSeasonOpponents(GS.team);
  for (var g = 0; g < 3; g++) {
    var oppTeam = TEAMS[opponents[g]];
    var result = season.results[g];
    var pip = document.createElement('div');
    pip.style.cssText = 'flex:1;padding:6px 4px;border-radius:4px;text-align:center;border:1px solid ' +
      (result ? (result.won ? '#00ff44' : '#ff0040') : '#333') + ';' +
      'background:' + (result ? (result.won ? 'rgba(0,255,68,0.1)' : 'rgba(255,0,64,0.1)') : 'rgba(0,0,0,0.3)') + ';';
    pip.innerHTML =
      "<div style=\"font-family:'Rajdhani';font-size:7px;color:#aaa;\">" + (oppTeam ? oppTeam.name : '???') + "</div>" +
      "<div style=\"font-family:'Teko';font-size:14px;color:" + (result ? (result.won ? '#00ff44' : '#ff0040') : '#555') + ";\">" +
      (result ? (result.won ? 'W' : 'L') : '\u2014') + "</div>";
    resultsRow.appendChild(pip);
  }
  seasonBlock.appendChild(resultsRow);

  // Season score
  var seasonScore = document.createElement('div');
  seasonScore.style.cssText = "font-family:'Rajdhani';font-size:10px;color:#aaa;text-align:center;";
  seasonScore.textContent = 'SEASON SCORE: ' + season.totalScore + (allWon ? ' (+200 SWEEP BONUS!)' : '');
  seasonBlock.appendChild(seasonScore);

  content.appendChild(seasonBlock);

  // ── FILM ROOM (2-3 key coaching moments) ──
  if (gs.snapLog && gs.snapLog.length > 2) {
    var filmBlock = document.createElement('div');
    filmBlock.style.cssText = 'background:var(--bg-surface);border:1px solid #333;border-radius:8px;padding:12px 16px;width:100%;max-width:300px;';

    var filmTitle = document.createElement('div');
    filmTitle.style.cssText = "font-family:'Teko';font-weight:700;font-size:16px;color:var(--a-gold);letter-spacing:2px;margin-bottom:8px;";
    filmTitle.textContent = 'FILM ROOM';
    filmBlock.appendChild(filmTitle);

    var filmDesc = document.createElement('div');
    filmDesc.style.cssText = "font-family:'Rajdhani';font-size:9px;color:#666;margin-bottom:8px;";
    filmDesc.textContent = 'Key plays where a different call might have helped:';
    filmBlock.appendChild(filmDesc);

    // Find 2-3 snaps where the result was bad (turnovers, sacks, short gains on key downs)
    var coachingMoments = [];
    gs.snapLog.forEach(function(log, i) {
      if (!log) return;
      var isBadResult = log.result && (
        log.result.indexOf('SACK') >= 0 ||
        log.result.indexOf('INT') >= 0 ||
        log.result.indexOf('FUMBLE') >= 0 ||
        log.result.indexOf('-') >= 0
      );
      if (isBadResult && log.team === 'CT') { // Human is CT
        coachingMoments.push({ snap: i + 1, text: log.result });
      }
    });

    // Show top 2-3
    var shown = coachingMoments.slice(0, 3);
    if (shown.length === 0) {
      // If no bad plays, show a positive message
      var noFilm = document.createElement('div');
      noFilm.style.cssText = "font-family:'Rajdhani';font-size:10px;color:#00ff44;text-align:center;padding:4px;";
      noFilm.textContent = 'Clean game, Coach. Nothing to review.';
      filmBlock.appendChild(noFilm);
    } else {
      shown.forEach(function(m) {
        var moment = document.createElement('div');
        moment.style.cssText = "font-family:'Rajdhani';font-size:9px;color:#ccc;padding:4px 0;border-bottom:1px solid #1E1610;line-height:1.3;";
        moment.innerHTML = "<span style='color:var(--a-gold);'>Snap " + m.snap + ":</span> " + m.text +
          "<br><span style='color:#666;font-size:8px;'>Watch for the coverage next time.</span>";
        filmBlock.appendChild(moment);
      });
    }
    content.appendChild(filmBlock);
  }

  // ── BUTTONS ──
  if (isLastGame) {
    // Season complete — return to hub
    var returnBtn = document.createElement('button');
    returnBtn.className = 'btn-blitz';
    returnBtn.style.cssText = 'width:100%;max-width:300px;font-size:14px;margin-top:8px;background:var(--a-gold);border-color:var(--a-gold);color:#000;box-shadow:0 0 20px rgba(255,184,0,0.3);';
    returnBtn.textContent = 'NEW SEASON';
    returnBtn.onclick = function() {
      SND.click();
      // First season complete — flip progressive disclosure flag
      localStorage.setItem('torch_first_season_done', '1');
      setGs(null); // Reset to home
    };
    content.appendChild(returnBtn);
  } else {
    // Between-game: shop then next game
    var nextOppId = opponents[gameNum + 1];
    var nextOpp = TEAMS[nextOppId];

    // Next opponent preview
    var nextBlock = document.createElement('div');
    nextBlock.style.cssText = "text-align:center;font-family:'Rajdhani';font-size:10px;color:#aaa;";
    nextBlock.innerHTML = "NEXT OPPONENT: <span style=\"color:" + (nextOpp ? nextOpp.accent : '#fff') + ";font-weight:700;\">" + (nextOpp ? nextOpp.name : '???') + "</span>";
    content.appendChild(nextBlock);

    // Between-game shop button
    var shopBtn = document.createElement('button');
    shopBtn.className = 'btn-blitz';
    shopBtn.style.cssText = 'width:100%;max-width:300px;font-size:12px;margin-top:4px;background:var(--bg-surface);border-color:var(--a-gold);color:var(--a-gold);';
    shopBtn.textContent = 'TORCH CARD SHOP (' + humanTorch + ' PTS)';
    shopBtn.onclick = function() {
      SND.click();
      showShop(el, 'betweenGame', humanTorch, season.torchCards || [], function(card, newInv, spent) {
        season.torchCards = newInv;
        season.carryoverPoints -= spent;
        // Update button text
        shopBtn.textContent = 'TORCH CARD SHOP (' + Math.max(0, humanTorch - spent) + ' PTS)';
      }, function() {});
    };
    content.appendChild(shopBtn);

    // Next game button
    var nextBtn = document.createElement('button');
    nextBtn.className = 'btn-blitz';
    nextBtn.style.cssText = 'width:100%;max-width:300px;font-size:14px;margin-top:4px;background:var(--a-gold);border-color:var(--torch);color:#000;box-shadow:6px 6px 0 var(--torch),10px 10px 0 #000;';
    nextBtn.textContent = 'NEXT GAME \u2192';
    nextBtn.onclick = function() {
      SND.snap();
      // Advance season
      season.currentGame = gameNum + 1;
      setGs(function(s) {
        return Object.assign({}, s, {
          screen: 'teamSelect',
          opponent: nextOppId,
          engine: null,
          finalEngine: null,
          humanAbbr: null,
          season: season,
          // Keep team and difficulty
        });
      });
    };
    content.appendChild(nextBtn);
  }

  el.appendChild(content);
  return el;
}
