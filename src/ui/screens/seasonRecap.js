/**
 * TORCH — Season Recap Screen
 * Shows after 3 regular season games. Championship path if 2+ wins.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam } from '../../state.js';
import { renderTeamBadge } from '../../assets/icons/teamLogos.js';
import { getSeasonOpponents } from '../../data/teams.js';
import { getFullRoster } from '../../data/players.js';
import { decoratePlayer, XP_PER_LEVEL } from '../../engine/progressionSystem.js';
import AudioStateManager from '../../engine/audioManager.js';

export function buildSeasonRecap() {
  AudioStateManager.setState('halftime');

  var team = getTeam(GS.team);
  var season = GS.season || {};
  var results = season.results || [];
  var opponents = season.opponents || getSeasonOpponents(GS.team);

  // RPG: Decorate Roster with Progression Data
  var roster = getFullRoster(GS.team).map(p => decoratePlayer(p));

  // Calculate record
  var wins = 0, losses = 0, ties = 0;
  results.forEach(function(r) {
    if (r.tied) ties++;
    else if (r.won) wins++;
    else losses++;
  });

  var record = wins + '-' + losses + (ties > 0 ? '-' + ties : '');
  var madeChampionship = wins >= 2;
  var isChampionshipResult = season.championshipPlayed;
  var isChampion = isChampionshipResult && season.championshipWon;
  var isChampLoss = isChampionshipResult && !season.championshipWon;

  // Championship opponent: the team you lost to (or hardest if undefeated)
  var champOpponentId = null;
  if (madeChampionship && !isChampionshipResult) {
    // Find first loss opponent, or the "weak" matchup if undefeated
    for (var i = 0; i < results.length; i++) {
      if (!results[i].won && !results[i].tied) { champOpponentId = opponents[i]; break; }
    }
    if (!champOpponentId) champOpponentId = opponents[0]; // undefeated: rematch vs game 1 opponent
  }

  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow-y:auto;';

  // ── HEADER ──
  var header = document.createElement('div');
  header.style.cssText = 'text-align:center;padding:24px 16px 8px;flex-shrink:0;';

  var titleText = isChampion ? 'NATIONAL CHAMPIONS' : isChampLoss ? 'CHAMPIONSHIP GAME' : madeChampionship ? 'CHAMPIONSHIP BOUND' : 'SEASON OVER';
  var titleColor = isChampion ? '#EBB010' : madeChampionship ? '#00ff44' : '#ff0040';

  header.innerHTML =
    "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#555;letter-spacing:3px;\">CONFERENCE SEASON</div>" +
    "<div style=\"font-family:'Teko';font-weight:700;font-size:36px;color:" + titleColor + ";letter-spacing:4px;text-shadow:0 0 20px " + titleColor + "40;margin-top:4px;opacity:0;\" id='sr-title'>" + titleText + "</div>" +
    "<div style=\"display:flex;justify-content:center;margin-top:8px;opacity:0;\" id='sr-badge'>" + renderTeamBadge(GS.team, 48) + "</div>" +
    "<div style=\"font-family:'Teko';font-weight:700;font-size:22px;color:" + team.accent + ";letter-spacing:3px;margin-top:4px;opacity:0;\" id='sr-record'>" + team.name + ' ' + record + "</div>";
  el.appendChild(header);

  // ── GAME RESULTS ──
  var resultsSection = document.createElement('div');
  resultsSection.style.cssText = 'padding:8px 20px;display:flex;flex-direction:column;gap:8px;';
  
  var sectionLabel = document.createElement('div');
  sectionLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#555;letter-spacing:2px;margin-bottom:4px;";
  sectionLabel.textContent = "SEASON PERFORMANCE";
  resultsSection.appendChild(sectionLabel);

  for (var g = 0; g < results.length; g++) {
    var r = results[g];
    var isChampRow = g >= 3;
    var rowOppId = isChampRow ? (r.opponent || season.championshipOpponent || opponents[0]) : opponents[g];
    var oppTeam = getTeam(rowOppId) || { name: 'Unknown' };
    var gameLabel = !isChampRow ? 'GAME ' + (g + 1) : 'CHAMPIONSHIP';
    var resultColor = r.tied ? '#EBB010' : r.won ? '#00ff44' : '#ff0040';
    var resultText = r.tied ? 'TIE' : r.won ? 'WIN' : 'LOSS';

    var row = document.createElement('div');
    row.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:6px;opacity:0;";
    row.className = 'sr-game-row';
    row.innerHTML =
      "<div style='flex-shrink:0;'>" + renderTeamBadge(rowOppId, 28) + "</div>" +
      "<div style='flex:1;'>" +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#555;letter-spacing:2px;\">" + gameLabel + "</div>" +
        "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:#ccc;letter-spacing:1px;\">vs " + oppTeam.name + "</div>" +
      "</div>" +
      "<div style='text-align:right;'>" +
        "<div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:" + resultColor + ";letter-spacing:2px;\">" + r.score + '-' + r.oppScore + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:" + resultColor + ";letter-spacing:1px;\">" + resultText + "</div>" +
      "</div>";
    resultsSection.appendChild(row);
  }
  el.appendChild(resultsSection);

  // ── ROSTER EVOLUTION (Phase 6 RPG) ──
  var rosterSection = document.createElement('div');
  rosterSection.style.cssText = 'padding:16px 20px;display:flex;flex-direction:column;gap:12px;';
  
  var rosterLabel = document.createElement('div');
  rosterLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#EBB010;letter-spacing:2px;";
  rosterLabel.textContent = "ROSTER EVOLUTION";
  rosterSection.appendChild(rosterLabel);

  // Filter to show top 4 key players
  roster.slice(0, 4).forEach(p => {
    const nextLevelXP = p.level * XP_PER_LEVEL;
    const currentLevelXP = (p.level - 1) * XP_PER_LEVEL;
    const progress = ((p.xp - currentLevelXP) / XP_PER_LEVEL) * 100;

    var pRow = document.createElement('div');
    pRow.className = 'sr-player-row';
    pRow.style.cssText = "padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.05);opacity:0;";
    pRow.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="font-family:'Teko';font-weight:700;font-size:18px;color:#fff;">${p.name.toUpperCase()}</div>
          <div style="font-family:'Rajdhani';font-weight:700;font-size:9px;color:${team.accent};background:${team.accent}22;padding:1px 6px;border-radius:4px;">LVL ${p.level}</div>
        </div>
        <div style="font-family:'Rajdhani';font-weight:700;font-size:10px;color:#555;">${p.pos}</div>
      </div>
      <div style="width:100%;height:4px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;position:relative;">
        <div style="position:absolute;left:0;top:0;height:100%;width:${progress}%;background:${team.accent};box-shadow:0 0 10px ${team.accent}66;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:4px;">
        <div style="font-family:'Rajdhani';font-size:8px;color:#444;">${p.xp} / ${nextLevelXP} XP</div>
        <div style="font-family:'Rajdhani';font-weight:700;font-size:8px;color:${team.accent};letter-spacing:1px;">${p.trait}</div>
      </div>
    `;
    rosterSection.appendChild(pRow);
  });
  el.appendChild(rosterSection);

  // ── POINTS CARRIED ──
  var ptsBanner = document.createElement('div');
  ptsBanner.style.cssText = "text-align:center;padding:16px;opacity:0;";
  ptsBanner.id = 'sr-pts';
  ptsBanner.innerHTML =
    "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#EBB010;letter-spacing:2px;\">TORCH POINTS BANKED</div>" +
    "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:28px;color:#EBB010;text-shadow:0 0 12px rgba(235,176,16,0.3);\">" + (season.carryoverPoints || 0) + "</div>";
  el.appendChild(ptsBanner);

  // ── BOTTOM BUTTON ──
  var botZone = document.createElement('div');
  botZone.style.cssText = 'padding:12px 16px 24px;flex-shrink:0;text-align:center;';

  var btn = document.createElement('button');
  btn.style.cssText = "width:100%;padding:18px;border-radius:8px;border:none;font-family:'Teko';font-weight:700;font-size:22px;letter-spacing:4px;color:#fff;cursor:pointer;opacity:0;";
  btn.id = 'sr-btn';

  if (isChampion) {
    // Won championship — new season
    btn.style.background = '#EBB010';
    btn.textContent = 'NEW SEASON';
    btn.onclick = function() {
      SND.td();
      // Save championship to localStorage
      var titles = JSON.parse(localStorage.getItem('torch_titles') || '{}');
      if (!titles[GS.team]) titles[GS.team] = 0;
      titles[GS.team]++;
      localStorage.setItem('torch_titles', JSON.stringify(titles));
      startNewSeason();
    };
  } else if (isChampLoss) {
    // Lost championship — new season
    btn.style.background = team.accent;
    btn.textContent = 'NEW SEASON';
    btn.onclick = function() { if (SND.snap) SND.snap(); else if (SND.click) SND.click(); startNewSeason(); };
  } else if (madeChampionship) {
    // Play championship game
    btn.style.background = '#EBB010';
    btn.textContent = 'CHAMPIONSHIP GAME';
    btn.onclick = function() {
      SND.td();
      setGs(function(s) {
        return Object.assign({}, s, {
          screen: 'pregame',
          opponent: champOpponentId,
          _coinTossDone: false,
          season: Object.assign({}, season, { championshipOpponent: champOpponentId })
        });
      });
    };
  } else {
    // Didn't make championship — new season
    btn.style.background = team.accent;
    btn.textContent = 'NEW SEASON';
    btn.onclick = function() { if (SND.snap) SND.snap(); else if (SND.click) SND.click(); startNewSeason(); };
  }
  botZone.appendChild(btn);
  el.appendChild(botZone);

  function startNewSeason() {
    localStorage.setItem('torch_first_season_done', '1');
    setGs(function(s) {
      return Object.assign({}, s, {
        screen: 'teamSelect',
        opponent: null, engine: null, finalEngine: null,
        _lastTeam: GS.team,
        isFirstSeason: false,
        season: {
          torchCards: season.torchCards || [],
          carryoverPoints: season.carryoverPoints || 0
        }
      });
    });
  }

  // ── ANIMATIONS ──
  requestAnimationFrame(function() {
    var tl = gsap.timeline();
    tl.to('#sr-title', { opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
    tl.from('#sr-title', { scale: 1.3, duration: 0.3, ease: 'back.out(1.5)' }, '<');
    tl.to('#sr-badge', { opacity: 1, duration: 0.2 }, '-=0.1');
    tl.to('#sr-record', { opacity: 1, duration: 0.2 }, '-=0.1');

    var rows = el.querySelectorAll('.sr-game-row');
    for (var ri = 0; ri < rows.length; ri++) {
      tl.to(rows[ri], { opacity: 1, duration: 0.2, ease: 'power2.out' }, '+=0.1');
      tl.from(rows[ri], { x: -20, duration: 0.2, ease: 'power2.out' }, '<');
    }

    var pRows = el.querySelectorAll('.sr-player-row');
    for (var pi = 0; pi < pRows.length; pi++) {
      tl.to(pRows[pi], { opacity: 1, duration: 0.2, ease: 'power2.out' }, '+=0.05');
      tl.from(pRows[pi], { y: 10, duration: 0.2, ease: 'power2.out' }, '<');
    }

    tl.to('#sr-pts', { opacity: 1, duration: 0.25 }, '+=0.1');
    tl.to('#sr-btn', { opacity: 1, duration: 0.3, ease: 'back.out(1.5)' }, '+=0.1');
    tl.from('#sr-btn', { scale: 0.9, duration: 0.3, ease: 'back.out(1.5)' }, '<');
    tl.call(function() {
      gsap.to('#sr-btn', { scale: 1.02, duration: 1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });

    // Champion confetti
    if (isChampion) {
      var champColors = team.celebration.colors;
      setTimeout(function() {
        for (var ci = 0; ci < 60; ci++) {
          var conf = document.createElement('div');
          var cx = 5 + Math.random() * 90;
          var cSize = 3 + Math.random() * 5;
          conf.style.cssText = 'position:fixed;top:-10px;left:' + cx + '%;width:' + cSize + 'px;height:' + cSize + 'px;background:' + champColors[ci % champColors.length] + ';border-radius:1px;z-index:100;pointer-events:none;';
          el.appendChild(conf);
          gsap.to(conf, { y: window.innerHeight + 20, rotation: Math.random() * 720, duration: 2 + Math.random() * 2, ease: 'power1.in', delay: Math.random() * 0.8, onComplete: function() { conf.remove(); } });
        }
      }, 600);
    }
  });

  return el;
}
