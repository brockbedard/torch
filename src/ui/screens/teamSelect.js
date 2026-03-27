/**
 * TORCH v0.21 — Team Select Screen
 * 2x2 grid of 4 teams. Tap to select → fighting-game confirmation → VS → gameplay.
 * Replaces: setup.js, draft.js, cardDraft.js, coinToss.js
 */

import { SND } from '../../engine/sound.js';
import AudioStateManager from '../../engine/audioManager.js';
import { GS, setGs, getTeam, getOffCards, getDefCards, shuffle } from '../../state.js';
import { TEAMS, getSeasonOpponents } from '../../data/teams.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { buildMaddenPlayer, teamHelmetSvg, renderFlamePips } from '../components/cards.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { generateConditions, WEATHER, FIELD, CROWD } from '../../data/gameConditions.js';

// ============================================================
// TEAM-SPECIFIC AUDIO STINGS (jsfxr presets)
// ============================================================
var TEAM_STINGS = {
  sentinels: 'powerUp',    // Regal, warm
  wolves:    'explosion',  // Heavy, ominous
  stags:     'hitHurt',    // Electric crack
  serpents:  'tone',       // Eerie
};

// ============================================================
// INJECT KEYFRAMES
// ============================================================
function injectAnimations() {
  if (document.getElementById('ts-anims')) return;
  var s = document.createElement('style');
  s.id = 'ts-anims';
  s.textContent =
    '@keyframes tsCardIn { 0%{opacity:0;transform:translateY(30px) scale(0.9)} 100%{opacity:1;transform:none} }' +
    '@keyframes tsFlash { 0%{opacity:0.7} 100%{opacity:0} }' +
    '@keyframes tsHelmetZoom { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }' +
    '@keyframes tsPlayerFan { 0%{opacity:0;transform:translateY(20px) scale(0.7)} 100%{opacity:1;transform:none} }' +
    '@keyframes tsVsSlam { 0%{transform:scale(2.5);opacity:0} 60%{transform:scale(0.9);opacity:1} 100%{transform:scale(1)} }' +
    '@keyframes tsShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-3px)} 40%{transform:translateX(3px)} 60%{transform:translateX(-2px)} 80%{transform:translateX(2px)} }' +
    '@keyframes tsWipe { 0%{clip-path:inset(0 100% 0 0)} 100%{clip-path:inset(0 0 0 0)} }' +
    '@keyframes tsTooltipIn { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:none} }';
  document.head.appendChild(s);
}

// ============================================================
// BUILD
// ============================================================
export function buildTeamSelect() {
  injectAnimations();
  AudioStateManager.setState('pre_game');
  var el = document.createElement('div');
  el.style.cssText = 'height:100vh;height:100dvh;max-height:100dvh;display:flex;flex-direction:column;background:var(--bg);position:relative;overflow:hidden;';

  var isFirst = !GS || GS.isFirstSeason !== false;

  // ── HEADER ──
  var hdr = document.createElement('div');
  hdr.style.cssText = 'background:rgba(0,0,0,0.5);padding:6px 12px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;border-bottom:2px solid var(--a-gold);z-index:10;';
  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:24px;color:var(--a-gold);letter-spacing:3px;font-style:italic;transform:skewX(-8deg);text-shadow:2px 2px 0 rgba(0,0,0,0.9);";
  hdrTitle.textContent = 'TORCH FOOTBALL';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = "font-family:'Rajdhani';font-size:10px;padding:8px 14px;cursor:pointer;background:#000;color:#fff;border:2px solid #333;border-radius:4px;";
  backBtn.textContent = '\u2190 BACK';
  backBtn.onclick = function() { SND.click(); setGs(null); };
  hdr.appendChild(hdrTitle);
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  // Team vibe one-liners (plain-English play style hint)
  var TEAM_VIBES = {
    sentinels: 'Run-first. Physical. Patient football.',
    wolves: 'Speed kills. Zone read. Ride the current.',
    stags: 'Explosive. Electric. Outscore everyone.',
    serpents: 'Cerebral and methodical. Death by paper cuts.',
  };

  // ── CONTENT ──
  var content = document.createElement('div');
  content.style.cssText = 'flex:1;min-height:0;display:flex;flex-direction:column;padding:0 10px 0;gap:0;overflow:hidden;';

  // Title + subtitle instruction
  var instrWrap = document.createElement('div');
  instrWrap.style.cssText = 'flex-shrink:0;text-align:center;padding:6px 20px 2px;';
  instrWrap.innerHTML =
    "<div style=\"font-family:'Teko';font-weight:700;font-size:22px;color:var(--a-gold);letter-spacing:3px;\">CHOOSE YOUR TEAM</div>";
  content.appendChild(instrWrap);

  // ── 2x2 TEAM GRID — fills available space ──
  var grid = document.createElement('div');
  grid.style.cssText = 'flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;padding:4px 4px 2px;';

  var teamIds = Object.keys(TEAMS);
  teamIds.forEach(function(tid, idx) {
    var team = TEAMS[tid];
    var card = document.createElement('div');
    card.style.cssText =
      'min-height:0;border-radius:12px;position:relative;overflow:hidden;cursor:pointer;' +
      'display:flex;flex-direction:column;' +
      'border:2px solid ' + team.colors.primary + '88;' +
      'box-shadow:0 4px 16px rgba(0,0,0,0.5);' +
      'transition:all 0.25s cubic-bezier(0.22,1.3,0.36,1);' +
      'opacity:0;animation:tsCardIn 0.35s ease-out ' + (idx * 0.08) + 's both;';

    // Background gradient — team color throughout so badge pops
    var bgLayer = document.createElement('div');
    bgLayer.style.cssText = 'position:absolute;inset:0;background:linear-gradient(0deg,' + team.colors.primary + 'dd 0%,' + team.colors.primary + '55 50%,' + team.colors.primary + '22 100%);z-index:0;';
    card.appendChild(bgLayer);

    // Badge — centered hero element, fills top portion
    var badgeWrap = document.createElement('div');
    badgeWrap.style.cssText = 'position:relative;z-index:1;display:flex;justify-content:center;align-items:center;flex:1;min-height:0;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.6));';
    badgeWrap.innerHTML = renderTeamBadge(tid, 115);
    card.appendChild(badgeWrap);

    // Info area — bottom of card
    var info = document.createElement('div');
    info.style.cssText = 'position:relative;z-index:1;flex-shrink:0;padding:0 10px 10px;display:flex;flex-direction:column;gap:2px;';

    // School name
    var schoolEl = document.createElement('div');
    schoolEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:2.5px;text-transform:uppercase;";
    schoolEl.textContent = (team.school || '').toUpperCase();
    info.appendChild(schoolEl);

    // Team name — consistent size
    var nameEl = document.createElement('div');
    nameEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:28px;color:#fff;letter-spacing:3px;line-height:0.9;text-shadow:2px 3px 0 rgba(0,0,0,0.8);white-space:nowrap;";
    nameEl.textContent = team.name;
    info.appendChild(nameEl);

    // Divider
    var divider = document.createElement('div');
    divider.style.cssText = 'width:36px;height:2px;border-radius:1px;margin:4px 0;background:' + team.accent + ';';
    info.appendChild(divider);

    // Scheme
    var schemeEl = document.createElement('div');
    schemeEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:13px;color:" + team.accent + ";letter-spacing:1.5px;";
    schemeEl.textContent = team.offScheme;
    info.appendChild(schemeEl);

    // Vibe one-liner
    var vibeEl = document.createElement('div');
    vibeEl.style.cssText = "font-family:'Rajdhani';font-weight:500;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.2;min-height:28px;";
    vibeEl.textContent = TEAM_VIBES[tid] || '';
    info.appendChild(vibeEl);

    // Ratings: OFF and DEF on separate rows
    var ratingsWrap = document.createElement('div');
    ratingsWrap.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-top:4px;';
    ratingsWrap.innerHTML =
      '<div style="display:flex;align-items:center;gap:5px;">' +
        "<span style=\"font-family:'Rajdhani';font-size:10px;font-weight:700;color:#aaa;letter-spacing:0.5px;min-width:22px;\">OFF</span>" +
        renderFlamePips(team.ratings.offense, 5, '#00ff44', 13) +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:5px;">' +
        "<span style=\"font-family:'Rajdhani';font-size:10px;font-weight:700;color:#aaa;letter-spacing:0.5px;min-width:22px;\">DEF</span>" +
        renderFlamePips(team.ratings.defense, 5, '#4488ff', 13) +
      '</div>';
    info.appendChild(ratingsWrap);

    card.appendChild(info);

    // ── TAP HANDLER — select team (don't auto-transition) ──
    card.onclick = function() {
      SND.click();
      selectedTeamId = tid;
      selectedTeam = team;
      var allCards = grid.querySelectorAll('[data-team]');
      allCards.forEach(function(c) {
        if (c.dataset.team === tid) {
          c.style.transform = 'scale(1.05)';
          c.style.borderColor = team.accent;
          c.style.boxShadow = '0 0 24px ' + team.colors.primary + '88, 0 8px 20px rgba(0,0,0,0.6)';
          c.style.zIndex = '10';
          c.style.opacity = '1';
          c.style.filter = '';
        } else {
          c.style.opacity = '0.35';
          c.style.transform = 'scale(0.96)';
          c.style.filter = 'brightness(0.5)';
          c.style.zIndex = '1';
        }
      });
      // Show KICK OFF button
      kickOffBtn.style.opacity = '1';
      kickOffBtn.style.pointerEvents = 'auto';
    };
    card.dataset.team = tid;

    grid.appendChild(card);
  });
  content.appendChild(grid);

  // ── KICK OFF BUTTON (hidden until team selected) ──
  var selectedTeamId = null;
  var selectedTeam = null;
  var kickOffBtn = document.createElement('button');
  kickOffBtn.className = 'btn-blitz';
  kickOffBtn.style.cssText = 'flex-shrink:0;margin:6px 20px 8px;border-color:#FF4511;color:#000;background:linear-gradient(180deg,#EBB010 0%,#FF4511 100%);font-size:24px;padding:20px 24px;letter-spacing:5px;opacity:0.3;pointer-events:none;transition:opacity 0.3s;text-align:center;display:block;width:calc(100% - 40px);animation:ctaGlow 3s ease-in-out 0.3s infinite;';
  kickOffBtn.textContent = 'KICK OFF!';
  kickOffBtn.onclick = function() {
  if (!selectedTeamId) return;
  SND.click();

  // Skip animation — go straight to pregame
  var opponents = getSeasonOpponents(selectedTeamId);
  var opponentId = opponents[0];
  var humanReceives = Math.random() < 0.5;
  var difficulty = GS && GS.difficulty ? GS.difficulty : 'EASY';
  var conditions = generateConditions(isFirst && (!GS.season || !GS.season.currentGame));

  setGs(function(s) {
    return Object.assign({}, s || {}, {
      screen: 'roster',
      team: selectedTeamId,
      difficulty: difficulty,
      opponent: opponentId,
      humanReceives: humanReceives,
      _coinTossDone: false,
      offRoster: getOffenseRoster(selectedTeamId).slice(0, 4).map(function(p) { return p.id; }),
      defRoster: getDefenseRoster(selectedTeamId).slice(0, 4).map(function(p) { return p.id; }),
      offHand: getOffCards(selectedTeamId).slice(0, 4),
      defHand: getDefCards(selectedTeamId).slice(0, 4),
      gameConditions: conditions,
      isFirstSeason: s ? s.isFirstSeason : true,
      season: s && s.season ? s.season : {
        opponents: opponents,
        currentGame: 0,
        results: [],
        totalScore: 0,
        torchCards: [],
        carryoverPoints: 0,
      },
    });
  });
  };  content.appendChild(kickOffBtn);

  // ── DIFFICULTY ROW (hidden on first game) ──
  if (!isFirst) {
    var diffRow = document.createElement('div');
    diffRow.style.cssText = 'flex-shrink:0;display:flex;gap:8px;justify-content:center;padding:0 20px 4px;';
    var diffs = [
      { id: 'EASY', label: 'EASY', color: 'var(--l-green)' },
      { id: 'MEDIUM', label: 'MEDIUM', color: 'var(--a-gold)' },
      { id: 'HARD', label: 'HARD', color: 'var(--p-red)' },
    ];
    var selDiff = GS && GS.difficulty ? GS.difficulty : 'MEDIUM';
    diffs.forEach(function(d) {
      var btn = document.createElement('button');
      btn.className = 'btn-blitz';
      var isSel = selDiff === d.id;
      btn.style.cssText = 'font-size:10px;padding:8px 16px;flex:1;' +
        (isSel ? 'background:' + d.color + ';color:#000;border-color:' + d.color + ';' : 'background:transparent;color:#aaa;border-color:#333;');
      btn.textContent = d.label;
      btn.onclick = function(e) {
        e.stopPropagation();
        SND.click();
        selDiff = d.id;
        setGs(function(s) { return Object.assign({}, s, { difficulty: d.id }); });
      };
      diffRow.appendChild(btn);
    });
    content.appendChild(diffRow);
  }

  el.appendChild(content);
  return el;
}

// ============================================================
// FIGHTING-GAME SELECTION ANIMATION
// ============================================================
function startSelectionAnimation(container, teamId, team, isFirst) {
  // Determine opponent (first in season order)
  var opponents = getSeasonOpponents(teamId);
  var opponentId = opponents[0];
  var opponent = TEAMS[opponentId];

  // Resolve coin toss silently (50/50)
  var humanReceives = Math.random() < 0.5;

  // Set game state
  var difficulty = GS && GS.difficulty ? GS.difficulty : 'EASY';
  var offRoster = getOffenseRoster(teamId);
  var defRoster = getDefenseRoster(teamId);

  // Generate Game Day Conditions
  var gameNum = (GS.season && GS.season.currentGame) || 0;
  var conditions = generateConditions(isFirst && gameNum === 0);
  var weather = WEATHER[conditions.weather];
  var field = FIELD[conditions.field];
  var crowd = CROWD[conditions.crowd];

  // ── OVERLAY for animation ──
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:1000;pointer-events:none;';

  // ── PHASE 1: Team Hype (0.8-1.2s) ──

  // Color flash
  var flash = document.createElement('div');
  flash.style.cssText = 'position:absolute;inset:0;background:' + team.colors.primary + ';opacity:0;animation:tsFlash 0.4s ease-out forwards;z-index:1;';
  ov.appendChild(flash);

  // Helmet zooms to center
  var helmCenter = document.createElement('div');
  helmCenter.style.cssText = 'position:absolute;top:35%;left:50%;transform:translate(-50%,-50%) scale(0.5);z-index:3;animation:tsHelmetZoom 0.5s cubic-bezier(0.22,1.3,0.36,1) 0.15s both;';
  helmCenter.innerHTML = teamHelmetSvg(teamId, 96);
  ov.appendChild(helmCenter);

  // Player cards fan out behind helmet (2-3 star/top players)
  var topPlayers = offRoster.slice(0, 3);
  topPlayers.forEach(function(p, i) {
    var pc = document.createElement('div');
    var angle = (i - 1) * 15;
    var xOff = (i - 1) * 50;
    pc.style.cssText = 'position:absolute;top:38%;left:50%;z-index:2;opacity:0;' +
      'transform:translate(calc(-50% + ' + xOff + 'px),-50%) rotate(' + angle + 'deg);' +
      'animation:tsPlayerFan 0.35s ease-out ' + (0.3 + i * 0.08) + 's both;';
    var card = buildMaddenPlayer({
      name: p.name, pos: p.pos, ovr: p.ovr, num: p.num,
      badge: p.badge, isStar: p.isStar, teamColor: team.colors.primary
    }, 60, 84);
    card.style.opacity = '0.7';
    pc.appendChild(card);
    ov.appendChild(pc);
  });

  // Team name text
  var teamText = document.createElement('div');
  teamText.style.cssText = "position:absolute;top:58%;left:50%;transform:translateX(-50%);z-index:4;font-family:'Teko';font-weight:700;font-size:32px;color:#fff;letter-spacing:4px;text-shadow:2px 2px 0 rgba(0,0,0,0.9),0 0 20px " + team.colors.primary + ";opacity:0;animation:tsPlayerFan 0.3s ease-out 0.4s both;white-space:nowrap;";
  teamText.textContent = team.name;
  ov.appendChild(teamText);

  // Screen shake on the container
  container.style.animation = 'tsShake 0.3s ease-out 0.2s';

  // Team audio sting
  var sting = TEAM_STINGS[teamId] || 'powerUp';
  try { SND.snap(); } catch(e) {}

  // Haptic
  if (navigator.vibrate) try { navigator.vibrate(50); } catch(e) {}

  document.body.appendChild(ov);

  // ── PHASE 2: VS Matchup (after 0.9s) ──
  setTimeout(function() {
    // Clear phase 1 elements
    ov.innerHTML = '';

    // Diagonal split background
    var split = document.createElement('div');
    split.style.cssText = 'position:absolute;inset:0;z-index:1;' +
      'background:linear-gradient(135deg,' + team.colors.primary + '88 0%,' + team.colors.primary + '88 48%,transparent 48%,transparent 52%,' + opponent.colors.primary + '88 52%,' + opponent.colors.primary + '88 100%);';
    ov.appendChild(split);

    // Your helmet (left)
    var yourHelm = document.createElement('div');
    yourHelm.style.cssText = 'position:absolute;top:40%;left:20%;transform:translate(-50%,-50%);z-index:2;';
    yourHelm.innerHTML = teamHelmetSvg(teamId, 64);
    ov.appendChild(yourHelm);

    // Your team name
    var yourName = document.createElement('div');
    yourName.style.cssText = "position:absolute;top:55%;left:20%;transform:translateX(-50%);z-index:2;font-family:'Teko';font-weight:700;font-size:16px;color:#fff;letter-spacing:2px;text-shadow:1px 1px 0 #000;";
    yourName.textContent = team.name;
    ov.appendChild(yourName);

    // Opponent helmet (right)
    var oppHelm = document.createElement('div');
    oppHelm.style.cssText = 'position:absolute;top:40%;right:20%;transform:translate(50%,-50%);z-index:2;';
    oppHelm.innerHTML = teamHelmetSvg(opponentId, 64);
    ov.appendChild(oppHelm);

    // Opponent name
    var oppName = document.createElement('div');
    oppName.style.cssText = "position:absolute;top:55%;right:20%;transform:translateX(50%);z-index:2;font-family:'Teko';font-weight:700;font-size:16px;color:#fff;letter-spacing:2px;text-shadow:1px 1px 0 #000;";
    oppName.textContent = opponent.name;
    ov.appendChild(oppName);

    // VS slam
    var vs = document.createElement('div');
    vs.style.cssText = "position:absolute;top:40%;left:50%;transform:translate(-50%,-50%) scale(2.5);z-index:3;font-family:'Teko';font-weight:700;font-size:36px;color:#fff;text-shadow:0 0 20px var(--torch),2px 2px 0 rgba(0,0,0,0.9);animation:tsVsSlam 0.3s cubic-bezier(0.22,1.3,0.36,1) both;";
    vs.textContent = 'VS';
    ov.appendChild(vs);

    // Game Day Conditions (below VS)
    var condBar = document.createElement('div');
    condBar.style.cssText = "position:absolute;top:65%;left:50%;transform:translateX(-50%);z-index:3;display:flex;gap:12px;font-family:'Rajdhani';font-weight:700;font-size:10px;color:#aaa;letter-spacing:0.5px;white-space:nowrap;";
    condBar.innerHTML =
      '<span style="color:#EBB010">' + weather.name.toUpperCase() + '</span>' +
      '<span>\u00b7</span>' +
      '<span>' + field.name.toUpperCase() + '</span>' +
      '<span>\u00b7</span>' +
      '<span style="color:' + (crowd.id === 'home' ? '#00ff44' : crowd.id === 'away' ? '#ff0040' : '#aaa') + '">' + crowd.name.toUpperCase() + '</span>';
    ov.appendChild(condBar);

    SND.hit();
  }, 900);

  // ── PHASE 3: Transition to gameplay (after 1.6s) ──
  setTimeout(function() {
    // Clean up overlay
    if (ov.parentNode) ov.remove();
    container.style.animation = '';

    // Set state and navigate to gameplay
    setGs(function(s) {
      return Object.assign({}, s || {}, {
        screen: 'roster',
        team: teamId,
        difficulty: difficulty,
        opponent: opponentId,
        humanReceives: humanReceives,
        _coinTossDone: false,
        // Pre-populate roster/hand data for gameplay
        offRoster: offRoster.slice(0, 4).map(function(p) { return p.id; }),
        defRoster: defRoster.slice(0, 4).map(function(p) { return p.id; }),
        offHand: getOffCards(teamId).slice(0, 4),
        defHand: getDefCards(teamId).slice(0, 4),
        // Game Day Conditions
        gameConditions: conditions,
        // Season
        isFirstSeason: s ? s.isFirstSeason : true,
        season: s && s.season ? s.season : {
          opponents: opponents,
          currentGame: 0,
          results: [],
          totalScore: 0,
          torchCards: [],
          carryoverPoints: 0,
        },
      });
    });
  }, isFirst ? 2200 : 1700);
}
