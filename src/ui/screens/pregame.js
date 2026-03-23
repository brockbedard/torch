/**
 * TORCH v0.22 — Pregame Sequence
 * 5-second broadcast-style sequence between team select and gameplay.
 * Beat-by-beat: flame → split → badges slam → VS → names + conditions → field reveal
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs } from '../../state.js';
import { TEAMS } from '../../data/teams.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import AudioStateManager from '../../engine/audioManager.js';

export function buildPregame() {
  AudioStateManager.setState('pre_game');
  var el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:#0A0804;z-index:1000;display:flex;align-items:center;justify-content:center;overflow:hidden;';

  var team = TEAMS[GS.team];
  var opp = TEAMS[GS.opponent];
  if (!team || !opp) { setGs(function(s) { return Object.assign({}, s, { screen: 'gameplay' }); }); return el; }

  var conditions = GS.gameConditions || { weather: 'clear', field: 'turf', crowd: 'home' };
  var season = GS.season || {};
  var gameNum = (season.currentGame || 0) + 1;
  var gamesPlayed = parseInt(localStorage.getItem('torch_games_played') || '0');
  var isFast = gamesPlayed >= 5;
  var speed = isFast ? 0.5 : 1.0;

  // Inject keyframe animations
  var sty = document.createElement('style');
  sty.textContent =
    '@keyframes pgFlameIn{0%{opacity:0;transform:scale(0.5)}50%{opacity:1;transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}' +
    '@keyframes pgSplit{0%{clip-path:inset(0 50% 0 50%)}100%{clip-path:inset(0 0 0 0)}}' +
    '@keyframes pgSlamL{0%{transform:translateX(-200px) scale(0);opacity:0}70%{transform:translateX(10px) scale(1.3);opacity:1}100%{transform:translateX(0) scale(1);opacity:1}}' +
    '@keyframes pgSlamR{0%{transform:translateX(200px) scale(0);opacity:0}70%{transform:translateX(-10px) scale(1.3);opacity:1}100%{transform:translateX(0) scale(1);opacity:1}}' +
    '@keyframes pgVsSlam{0%{transform:translate(-50%,-50%) scale(3);opacity:0}60%{transform:translate(-50%,-50%) scale(0.9);opacity:1}100%{transform:translate(-50%,-50%) scale(1)}}' +
    '@keyframes pgShake{0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}75%{transform:translateX(-2px)}}' +
    '@keyframes pgWipeUp{0%{clip-path:inset(100% 0 0 0)}100%{clip-path:inset(0 0 0 0)}}' +
    '@keyframes pgFadeIn{0%{opacity:0}100%{opacity:1}}' +
    '@keyframes pgBarFill{0%{width:0}100%{width:var(--fill)}}' +
    '@keyframes pgFlash{0%{opacity:0.6}100%{opacity:0}}';
  el.appendChild(sty);

  // ── BEAT 0 (0-0.3s): Dark screen, TORCH flame logo pulses ──
  var flame = document.createElement('div');
  flame.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Teko';font-weight:700;font-size:48px;color:#FF6B00;text-shadow:0 0 30px rgba(255,107,0,0.6);animation:pgFlameIn " + (300 * speed) + "ms ease-out both;letter-spacing:6px;z-index:10;";
  flame.textContent = 'TORCH';
  el.appendChild(flame);

  SND.click(); // Muffled start sound

  // ── BEAT 1 (0.3-0.8s): Diagonal split in team colors ──
  setTimeout(function() {
    flame.style.transition = 'opacity 0.2s';
    flame.style.opacity = '0';

    var split = document.createElement('div');
    split.style.cssText = 'position:absolute;inset:0;z-index:2;animation:pgSplit ' + (500 * speed) + 'ms ease-out both;';
    split.innerHTML =
      '<div style="position:absolute;top:0;left:0;width:50%;height:100%;background:linear-gradient(135deg,' + team.colors.primary + ' 0%,' + team.colors.primary + '88 100%);"></div>' +
      '<div style="position:absolute;top:0;right:0;width:50%;height:100%;background:linear-gradient(225deg,' + opp.colors.primary + ' 0%,' + opp.colors.primary + '88 100%);"></div>';
    el.appendChild(split);
  }, 300 * speed);

  // ── BEAT 2 (0.8-1.5s): Team badges slam in from sides ──
  setTimeout(function() {
    // Left badge (player's team)
    var badgeL = document.createElement('div');
    badgeL.style.cssText = 'position:absolute;top:35%;left:18%;transform:translateX(-200px);z-index:5;animation:pgSlamL ' + (400 * speed) + 'ms cubic-bezier(0.22,1.3,0.36,1) both;';
    badgeL.innerHTML = renderTeamBadge(GS.team, 90);
    el.appendChild(badgeL);

    // Right badge (opponent)
    var badgeR = document.createElement('div');
    badgeR.style.cssText = 'position:absolute;top:35%;right:18%;transform:translateX(200px);z-index:5;animation:pgSlamR ' + (400 * speed) + 'ms cubic-bezier(0.22,1.3,0.36,1) both;';
    badgeR.innerHTML = renderTeamBadge(GS.opponent, 90);
    el.appendChild(badgeR);

    // White flash
    var flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;inset:0;background:#fff;z-index:6;animation:pgFlash 150ms ease-out both;';
    el.appendChild(flash);

    SND.hit(); // Impact sound for badge slam
  }, 800 * speed);

  // ── BEAT 3 (1.5-2.0s): "VS" slams center with screen shake ──
  setTimeout(function() {
    var vs = document.createElement('div');
    vs.style.cssText = "position:absolute;top:42%;left:50%;z-index:8;font-family:'Teko';font-weight:700;font-size:56px;color:#fff;text-shadow:0 0 30px rgba(255,107,0,0.8),3px 3px 0 rgba(0,0,0,0.9);animation:pgVsSlam " + (300 * speed) + "ms cubic-bezier(0.22,1.3,0.36,1) both;letter-spacing:4px;";
    vs.textContent = 'VS';
    el.appendChild(vs);

    // Screen shake
    el.style.animation = 'pgShake ' + (300 * speed) + 'ms ease-out';
    setTimeout(function() { el.style.animation = ''; }, 350 * speed);

    // Particle burst at center
    for (var i = 0; i < 12; i++) {
      var p = document.createElement('div');
      var angle = (i / 12) * 360;
      var dist = 40 + Math.random() * 60;
      p.style.cssText = 'position:absolute;top:45%;left:50%;width:4px;height:4px;border-radius:50%;background:#FFB800;z-index:7;' +
        'transition:all ' + (400 + Math.random() * 300) + 'ms ease-out;transform:translate(-50%,-50%);opacity:1;';
      el.appendChild(p);
      setTimeout((function(particle, a, d) {
        return function() {
          particle.style.transform = 'translate(calc(-50% + ' + (Math.cos(a * Math.PI / 180) * d) + 'px), calc(-50% + ' + (Math.sin(a * Math.PI / 180) * d) + 'px))';
          particle.style.opacity = '0';
        };
      })(p, angle, dist), 20);
    }

    SND.snap(); // VS impact
    if (navigator.vibrate) try { navigator.vibrate(60); } catch(e) {}
  }, 1500 * speed);

  // ── BEAT 4 (2.0-3.0s): Team names + conditions ──
  setTimeout(function() {
    // Player team name (left)
    var nameL = document.createElement('div');
    nameL.style.cssText = "position:absolute;top:58%;left:18%;z-index:8;font-family:'Teko';font-weight:700;font-size:22px;color:#fff;letter-spacing:2px;font-style:italic;text-shadow:2px 2px 0 rgba(0,0,0,0.8);animation:pgWipeUp " + (300 * speed) + "ms ease-out both;";
    nameL.textContent = team.name;
    el.appendChild(nameL);

    // Opponent name (right)
    var nameR = document.createElement('div');
    nameR.style.cssText = "position:absolute;top:58%;right:18%;z-index:8;font-family:'Teko';font-weight:700;font-size:22px;color:#fff;letter-spacing:2px;font-style:italic;text-shadow:2px 2px 0 rgba(0,0,0,0.8);text-align:right;animation:pgWipeUp " + (300 * speed) + "ms ease-out 100ms both;";
    nameR.textContent = opp.name;
    el.appendChild(nameR);

    // Conditions badge
    var condEl = document.createElement('div');
    condEl.style.cssText = "position:absolute;top:68%;left:50%;transform:translateX(-50%);z-index:8;display:flex;gap:8px;font-family:'Rajdhani';font-weight:700;font-size:11px;color:#aaa;letter-spacing:1px;animation:pgFadeIn " + (400 * speed) + "ms ease-out 200ms both;";
    condEl.innerHTML =
      '<span style="color:#FFB800">' + conditions.weather.toUpperCase() + '</span>' +
      '<span>\u00b7</span><span>' + conditions.field.toUpperCase() + '</span>' +
      '<span>\u00b7</span><span style="color:' + (conditions.crowd === 'home' ? '#00ff44' : conditions.crowd === 'away' ? '#ff0040' : '#aaa') + '">' + conditions.crowd.toUpperCase() + '</span>';
    el.appendChild(condEl);

    // Season record if applicable
    if (season.results && season.results.length > 0) {
      var recordEl = document.createElement('div');
      recordEl.style.cssText = "position:absolute;top:74%;left:50%;transform:translateX(-50%);z-index:8;font-family:'Rajdhani';font-size:10px;color:#666;animation:pgFadeIn " + (300 * speed) + "ms ease-out 300ms both;";
      var wins = season.results.filter(function(r) { return r.won; }).length;
      var losses = season.results.length - wins;
      recordEl.textContent = 'GAME ' + gameNum + ' \u00b7 SEASON ' + wins + '-' + losses;
      el.appendChild(recordEl);
    }
  }, 2000 * speed);

  // ── BEAT 5 (3.0-4.0s): Stat comparison bars ──
  setTimeout(function() {
    var statsWrap = document.createElement('div');
    statsWrap.style.cssText = 'position:absolute;top:80%;left:50%;transform:translateX(-50%);z-index:8;width:280px;display:flex;flex-direction:column;gap:4px;';

    var stats = [
      { label: 'OFF', left: team.ratings.offense, right: opp.ratings.offense },
      { label: 'DEF', left: team.ratings.defense, right: opp.ratings.defense },
    ];
    stats.forEach(function(st, si) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:4px;opacity:0;animation:pgFadeIn 200ms ease-out ' + (si * 200) + 'ms both;';
      row.innerHTML =
        "<div style=\"width:30px;font-family:'Rajdhani';font-size:9px;color:#888;text-align:right;\">" + st.label + "</div>" +
        '<div style="flex:1;height:6px;background:#1E1610;border-radius:3px;overflow:hidden;display:flex;">' +
          '<div style="height:100%;background:' + team.colors.primary + ';border-radius:3px;--fill:' + (st.left * 20) + '%;animation:pgBarFill 400ms ease-out ' + (si * 200 + 100) + 'ms both;"></div>' +
        '</div>' +
        '<div style="flex:1;height:6px;background:#1E1610;border-radius:3px;overflow:hidden;display:flex;justify-content:flex-end;">' +
          '<div style="height:100%;background:' + opp.colors.primary + ';border-radius:3px;--fill:' + (st.right * 20) + '%;animation:pgBarFill 400ms ease-out ' + (si * 200 + 100) + 'ms both;"></div>' +
        '</div>';
      statsWrap.appendChild(row);
    });
    el.appendChild(statsWrap);
  }, 3000 * speed);

  // ── BEAT 6 (4.0-5.0s): Transition to gameplay ──
  setTimeout(function() {
    // Track games played for progressive shortening
    localStorage.setItem('torch_games_played', String(gamesPlayed + 1));

    // Fade to black then navigate
    el.style.transition = 'opacity 0.4s';
    el.style.opacity = '0';

    setTimeout(function() {
      setGs(function(s) { return Object.assign({}, s, { screen: 'gameplay' }); });
    }, 400);
  }, (isFast ? 2500 : 4500));

  return el;
}
