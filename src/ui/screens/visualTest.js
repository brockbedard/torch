/**
 * TORCH v0.21 — Visual Test Harness
 * Calls the REAL build functions with mocked GS state.
 * Access via ?test URL param. Zero duplication — same code as the app.
 */

import { GS, setGs, setRender, getOffCards, getDefCards } from '../../state.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { TEAMS, getSeasonOpponents } from '../../data/teams.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { buildHome } from './home.js';
import { buildTeamSelect } from './teamSelect.js';
import { buildGameplay } from './gameplay.js';
import { buildEndGame } from './endGame.js';
import { buildHalftime } from './halftime.js';
import { buildPregame } from './pregame.js';
import { buildDailyDrive } from './dailyDrive.js';
import { showShop } from '../components/shop.js';
import { buildTorchCard } from '../components/cards.js';
import { GameState } from '../../engine/gameState.js';

// Save original render and replace with no-op so setGs doesn't wipe the harness
var _origRender = null;

function suppressRender() {
  _origRender = null;
  // setRender installs a new render fn — we install a no-op
  setRender(function() {});
}

function mockGs(state) {
  // Directly set GS via setGs (render is suppressed)
  setGs(state);
}

function resetGs() {
  setGs(null);
}

export function buildVisualTest() {
  suppressRender();

  // Let the body scroll natively — no nested scroll container
  document.body.style.overflow = 'auto';
  document.body.style.height = 'auto';
  document.documentElement.style.overflow = 'auto';
  document.documentElement.style.height = 'auto';
  var root = document.getElementById('root');
  if (root) { root.style.overflow = 'visible'; root.style.height = 'auto'; }

  var el = document.createElement('div');
  el.style.cssText = 'background:#0A0804;padding:12px;overflow:visible;';

  function section(title) {
    var s = document.createElement('div');
    s.style.cssText = "font-family:'Teko';font-weight:700;font-size:20px;color:var(--a-gold,#FFB800);letter-spacing:3px;margin:32px 0 8px;padding:8px 0;border-bottom:2px solid #1E1610;";
    s.textContent = '=== ' + title + ' ===';
    el.appendChild(s);
  }

  // Inject override styles so child screens don't trap scrolling
  var overrideStyle = document.createElement('style');
  overrideStyle.textContent = '.vt-frame > * { height:auto !important; max-height:none !important; overflow:visible !important; position:relative !important; min-height:0 !important; }';
  el.appendChild(overrideStyle);

  function frame(child, minH) {
    var f = document.createElement('div');
    f.className = 'vt-frame';
    f.style.cssText = 'width:375px;max-width:100%;border:1px solid #333;border-radius:8px;overflow:visible;margin-bottom:16px;position:relative;background:#0A0804;min-height:' + (minH || 700) + 'px;';
    if (child) f.appendChild(child);
    el.appendChild(f);
    return f;
  }

  function note(text) {
    var n = document.createElement('div');
    n.style.cssText = "font-family:'Rajdhani';font-size:9px;color:#555;letter-spacing:1px;margin:4px 0;";
    n.textContent = text;
    el.appendChild(n);
  }

  // ============================================================
  // 1. HOME SCREEN
  // ============================================================
  section('HOME SCREEN');
  note('Real buildHome() output');
  resetGs();
  try {
    var homeEl = buildHome();
    frame(homeEl, 650);
  } catch(e) { note('ERROR: ' + e.message); }

  // ============================================================
  // 1.5 TEAM BADGE EMBLEMS — All 4 teams at all 4 sizes
  // ============================================================
  section('TEAM BADGE EMBLEMS — All sizes');
  note('Hero (140px), Card (80px), Icon (40px), Micro (24px)');
  (function() {
    var sizes = [140, 80, 40, 24];
    var sizeNames = ['Hero 140px', 'Card 80px', 'Icon 40px', 'Micro 24px'];
    var teamIds = ['sentinels', 'wolves', 'stags', 'serpents'];
    var badgeGrid = document.createElement('div');
    badgeGrid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:375px;background:#0A0804;border:1px solid #333;border-radius:8px;padding:12px;margin-bottom:12px;';
    // Header row
    teamIds.forEach(function(tid) {
      var h = document.createElement('div');
      h.style.cssText = "text-align:center;font-family:'Rajdhani';font-size:8px;color:#aaa;letter-spacing:1px;";
      h.textContent = TEAMS[tid].name;
      badgeGrid.appendChild(h);
    });
    // Size rows
    sizes.forEach(function(sz, si) {
      teamIds.forEach(function(tid) {
        var cell = document.createElement('div');
        cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 0;';
        cell.innerHTML = renderTeamBadge(tid, sz);
        var lbl = document.createElement('div');
        lbl.style.cssText = "font-family:'Rajdhani';font-size:6px;color:#555;";
        lbl.textContent = sizeNames[si];
        cell.appendChild(lbl);
        badgeGrid.appendChild(cell);
      });
    });
    el.appendChild(badgeGrid);

    // Grayscale test
    note('Grayscale silhouette test — all 4 must be distinguishable');
    var grayRow = document.createElement('div');
    grayRow.style.cssText = 'display:flex;gap:16px;padding:8px;background:#0A0804;border:1px solid #333;border-radius:8px;width:375px;justify-content:center;margin-bottom:12px;filter:grayscale(1);';
    teamIds.forEach(function(tid) {
      var w = document.createElement('div');
      w.innerHTML = renderTeamBadge(tid, 60);
      grayRow.appendChild(w);
    });
    el.appendChild(grayRow);
  })();

  // ============================================================
  // 2. TEAM SELECT — Game 2+ (difficulty visible)
  // ============================================================
  section('TEAM SELECT — Game 2+ (difficulty visible)');
  note('Real buildTeamSelect() with isFirstSeason=false');
  mockGs({ screen: 'teamSelect', team: null, isFirstSeason: false, difficulty: 'MEDIUM' });
  try {
    var tsEl = buildTeamSelect();
    frame(tsEl, 580);
  } catch(e) { note('ERROR: ' + e.message); }

  // ============================================================
  // 3. TEAM SELECT — First time (difficulty hidden)
  // ============================================================
  section('TEAM SELECT — First Time (difficulty hidden, tooltip)');
  note('Real buildTeamSelect() with isFirstSeason=true');
  // Clear the tooltip localStorage so it shows
  var tipKey = 'torch_tip_ts_tip_shown';
  var savedTip = localStorage.getItem('ts_tip_shown');
  localStorage.removeItem('ts_tip_shown');
  mockGs({ screen: 'teamSelect', team: null, isFirstSeason: true });
  try {
    var tsFirstEl = buildTeamSelect();
    frame(tsFirstEl, 520);
  } catch(e) { note('ERROR: ' + e.message); }
  // Restore tooltip state
  if (savedTip) localStorage.setItem('ts_tip_shown', savedTip);

  // ============================================================
  // 3.5 PREGAME SEQUENCE — Static keyframes
  // ============================================================
  section('PREGAME SEQUENCE — Boars vs Serpents');
  note('Real buildPregame() — the 5-second sequence auto-plays. Showing initial state.');
  (function() {
    var offRoster = getOffenseRoster('sentinels');
    var defRoster = getDefenseRoster('sentinels');
    mockGs({
      screen: 'pregame', team: 'sentinels', opponent: 'serpents',
      difficulty: 'MEDIUM', humanReceives: true, _coinTossDone: true,
      isFirstSeason: false,
      offRoster: offRoster.slice(0,5).map(function(p){return p.id;}),
      defRoster: defRoster.slice(0,5).map(function(p){return p.id;}),
      offHand: getOffCards('sentinels').slice(0,5),
      defHand: getDefCards('sentinels').slice(0,5),
      gameConditions: { weather: 'clear', field: 'turf', crowd: 'home' },
      season: { opponents: ['serpents','stags','wolves'], currentGame: 0, results: [], totalScore: 0, torchCards: [], carryoverPoints: 0 },
    });
    try {
      var pgEl = buildPregame();
      // Override fixed positioning for harness display
      pgEl.style.position = 'relative';
      pgEl.style.height = '500px';
      frame(pgEl, 500);
    } catch(e) { note('ERROR: ' + e.message); }
  })();

  // Static keyframe mockups showing each beat
  note('Static keyframes — Beat 1: Split, Beat 3: VS Slam, Beat 4: Names + Conditions');
  (function() {
    var team = TEAMS.sentinels;
    var opp = TEAMS.serpents;
    // Beat 3: VS with badges
    var kf = document.createElement('div');
    kf.style.cssText = 'width:375px;height:200px;position:relative;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:8px;';
    kf.innerHTML =
      '<div style="position:absolute;inset:0;background:linear-gradient(135deg,' + team.colors.primary + '88 0%,' + team.colors.primary + '44 48%,transparent 48%,transparent 52%,' + opp.colors.primary + '44 52%,' + opp.colors.primary + '88 100%);"></div>' +
      '<div style="position:absolute;top:30%;left:18%;">' + renderTeamBadge('sentinels', 70) + '</div>' +
      '<div style="position:absolute;top:30%;right:18%;">' + renderTeamBadge('serpents', 70) + '</div>' +
      "<div style=\"position:absolute;top:35%;left:50%;transform:translate(-50%,-50%);font-family:'Teko';font-weight:700;font-size:48px;color:#fff;text-shadow:0 0 20px rgba(255,107,0,0.8);\">VS</div>" +
      "<div style=\"position:absolute;top:60%;left:18%;font-family:'Teko';font-weight:700;font-size:20px;color:#fff;font-style:italic;\">" + team.name + "</div>" +
      "<div style=\"position:absolute;top:60%;right:18%;font-family:'Teko';font-weight:700;font-size:20px;color:#fff;font-style:italic;text-align:right;\">" + opp.name + "</div>" +
      "<div style=\"position:absolute;top:75%;left:50%;transform:translateX(-50%);font-family:'Rajdhani';font-weight:700;font-size:11px;color:#aaa;display:flex;gap:8px;\"><span style='color:#FFB800'>CLEAR</span><span>\u00b7</span><span>TURF</span><span>\u00b7</span><span style='color:#00ff44'>HOME</span></div>";
    el.appendChild(kf);
  })();

  // ============================================================
  // 4. GAMEPLAY — DEFENSE
  // ============================================================
  section('GAMEPLAY — DEFENSE');
  note('Real buildGameplay() — Sentinels vs Serpents, opponent on offense (human on defense)');
  (function() {
    var offRoster = getOffenseRoster('sentinels');
    var defRoster = getDefenseRoster('sentinels');
    mockGs({
      screen: 'gameplay', team: 'sentinels', opponent: 'serpents',
      difficulty: 'EASY', humanReceives: false, _coinTossDone: true,
      isFirstSeason: false,
      offRoster: offRoster.slice(0,5).map(function(p){return p.id;}),
      defRoster: defRoster.slice(0,5).map(function(p){return p.id;}),
      offHand: getOffCards('sentinels').slice(0,5),
      defHand: getDefCards('sentinels').slice(0,5),
      gameConditions: { weather: 'clear', field: 'turf', crowd: 'home' },
      season: { opponents: ['serpents','stags','wolves'], currentGame: 0, results: [], totalScore: 0, torchCards: [], carryoverPoints: 0 },
      engine: null,
    });
    try {
      var gpDef = buildGameplay();
      // vt-frame CSS handles overflow/height override
      frame(gpDef);
    } catch(e) { note('ERROR: ' + e.message); }
  })();

  // ============================================================
  // 5. GAMEPLAY — OFFENSE
  // ============================================================
  section('GAMEPLAY — OFFENSE');
  note('Real buildGameplay() — Sentinels vs Serpents, human on offense');
  (function() {
    var offRoster = getOffenseRoster('sentinels');
    var defRoster = getDefenseRoster('sentinels');
    mockGs({
      screen: 'gameplay', team: 'sentinels', opponent: 'serpents',
      difficulty: 'EASY', humanReceives: true, _coinTossDone: true,
      isFirstSeason: false,
      offRoster: offRoster.slice(0,5).map(function(p){return p.id;}),
      defRoster: defRoster.slice(0,5).map(function(p){return p.id;}),
      offHand: getOffCards('sentinels').slice(0,5),
      defHand: getDefCards('sentinels').slice(0,5),
      gameConditions: { weather: 'rain', field: 'grass', crowd: 'away' },
      season: { opponents: ['serpents','stags','wolves'], currentGame: 0, results: [], totalScore: 0, torchCards: [TORCH_CARDS[0], TORCH_CARDS[6]], carryoverPoints: 0 },
      engine: null,
    });
    try {
      var gpOff = buildGameplay();
      // vt-frame CSS handles overflow/height override
      frame(gpOff);
    } catch(e) { note('ERROR: ' + e.message); }
  })();

  // ============================================================
  // 6. SNAP RESULT
  // ============================================================
  section('GAMEPLAY — SNAP RESULT (3-Beat Aftermath)');
  note('Static mockup — the 3-beat animation is time-based, so we show the aftermath state');
  (function() {
    // Can't freeze a timed animation, so render the result overlay statically
    var resultFrame = document.createElement('div');
    resultFrame.style.cssText = 'width:375px;height:300px;background:rgba(10,8,4,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;';
    resultFrame.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:700;font-size:64px;color:#3df58a;text-shadow:0 0 24px rgba(61,245,138,0.5);\">+14 YDS</div>" +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#FFB800;letter-spacing:2px;text-shadow:0 0 12px rgba(255,184,0,0.5);\">SETUP!</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:13px;color:#FFB800;letter-spacing:1px;\">T +25</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:13px;color:#3df58a;opacity:0.8;letter-spacing:1px;\">Bubble Screen vs Man-Zone Blend</div>";
    frame(resultFrame);
  })();

  // ============================================================
  // 7. TORCH CARD PHASE
  // ============================================================
  section('GAMEPLAY — TORCH CARD PHASE');
  note('2 sample TORCH cards + SKIP button (static tray render)');
  (function() {
    var trayFrame = document.createElement('div');
    trayFrame.style.cssText = 'width:375px;background:#0A0804;';
    trayFrame.innerHTML = "<div style=\"text-align:center;padding:4px 0;font-family:'Rajdhani';font-size:9px;color:#FFB800;letter-spacing:1px;\">TORCH CARD \u2014 Play one or skip</div>";
    var tray = document.createElement('div');
    tray.style.cssText = 'display:flex;gap:6px;padding:6px;';
    var tc1 = buildTorchCard(TORCH_CARDS[0], 90, 130);
    tc1.style.flex = '1';
    var tc2 = buildTorchCard(TORCH_CARDS[6], 90, 130);
    tc2.style.flex = '1';
    tray.appendChild(tc1);
    tray.appendChild(tc2);
    var skip = document.createElement('div');
    skip.style.cssText = "flex:1;border:2px dashed rgba(85,79,128,0.25);border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani';font-size:8px;color:#554f80;text-align:center;min-height:130px;";
    skip.innerHTML = 'SKIP<br>TORCH';
    tray.appendChild(skip);
    trayFrame.appendChild(tray);
    frame(trayFrame);
  })();

  // ============================================================
  // 8. TORCH SHOP
  // ============================================================
  section('TORCH SHOP — Bottom Sheet (3 cards)');
  note('Real showShop() rendered into a container');
  (function() {
    var shopContainer = document.createElement('div');
    shopContainer.style.cssText = 'width:375px;min-height:380px;position:relative;background:#0A0804;overflow:visible;';
    // showShop appends a fixed overlay — we'll capture it by making the container position:relative
    // and intercepting the fixed positioning
    frame(shopContainer);
    try {
      showShop(shopContainer, 'halftime', 245,
        [TORCH_CARDS[2], TORCH_CARDS[6]], // 2 cards in inventory
        function(){}, function(){}
      );
      // Fix the overlay from position:fixed to position:absolute so it stays in the container
      var overlay = shopContainer.querySelector('div');
      if (overlay) {
        overlay.style.position = 'absolute';
      }
    } catch(e) { note('ERROR: ' + e.message); }
  })();

  // ============================================================
  // 9. HALFTIME
  // ============================================================
  section('HALFTIME');
  note('Real buildHalftime() — Sentinels 14 vs Serpents 10');
  (function() {
    var offRoster = getOffenseRoster('sentinels');
    var defRoster = getDefenseRoster('sentinels');
    // Build a mock engine state
    var mockEngine = {
      humanTeam: 'CT', ctScore: 14, irScore: 10,
      ctTorchPts: 185, irTorchPts: 120,
      humanTorchCards: [], cpuTorchCards: [],
      startSecondHalf: function() {},
      stats: { ctTotalYards: 142, irTotalYards: 98, ctFirstDowns: 6, irFirstDowns: 4, ctTurnovers: 0, irTurnovers: 1, sackCount: 2, badgeCombos: 3, explosivePlays: 2, fourthDownConversions: 0, fourthDownAttempts: 1 },
    };
    mockGs({
      screen: 'halftime', team: 'sentinels', opponent: 'serpents',
      engine: mockEngine, isFirstSeason: false,
      season: { opponents: ['serpents','stags','wolves'], currentGame: 0, results: [], totalScore: 0, torchCards: [], carryoverPoints: 0 },
    });
    try {
      var htEl = buildHalftime();
      frame(htEl);
    } catch(e) { note('ERROR: ' + e.message); }
  })();

  // ============================================================
  // 10. END GAME
  // ============================================================
  section('END GAME — Victory + Season + Film Room');
  note('Real buildEndGame() — Sentinels 28 vs Serpents 17, Game 2 of 3');
  (function() {
    var mockEngine = {
      humanTeam: 'CT', ctScore: 28, irScore: 17,
      ctTorchPts: 312, irTorchPts: 180,
      totalPlays: 40, gameOver: true,
      stats: { ctFirstDowns: 12, irFirstDowns: 8, ctTotalYards: 285, irTotalYards: 195, sackCount: 3, ctTurnovers: 1, irTurnovers: 2, badgeCombos: 5, explosivePlays: 4, fourthDownConversions: 1, fourthDownAttempts: 2 },
      snapLog: [
        { team: 'CT', result: 'CT: +8 (Choice Route vs Match Right)' },
        { team: 'IR', result: 'IR: +3 (Mesh Crossfire vs Press & Trail)' },
        { team: 'CT', result: 'CT: SACK -6 (Go Seam vs Zero Blitz)' },
        { team: 'CT', result: 'CT: TD +22 (Streak vs Two-Deep Sit)' },
        { team: 'CT', result: 'CT: INT (Fade & Stop vs Hidden Bracket)' },
      ],
    };
    mockGs({
      screen: 'end_game', team: 'sentinels', opponent: 'serpents',
      finalEngine: mockEngine, humanAbbr: 'CT', isFirstSeason: false,
      season: { opponents: ['stags','serpents','wolves'], currentGame: 1, results: [{ won: true, score: 245 }], totalScore: 245, torchCards: [TORCH_CARDS[0]], carryoverPoints: 100 },
    });
    try {
      var egEl = buildEndGame();
      frame(egEl);
    } catch(e) { note('ERROR: ' + e.message); }
  })();

  // ============================================================
  // 11. DAILY DRIVE
  // ============================================================
  section('DAILY DRIVE');
  note('Real buildDailyDrive()');
  // Temporarily remove today's daily result so we see the start screen
  var todayKey = (function() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate(); })();
  var savedDaily = localStorage.getItem('torch_daily_' + todayKey);
  localStorage.removeItem('torch_daily_' + todayKey);
  mockGs({ screen: 'dailyDrive' });
  try {
    var ddEl = buildDailyDrive();
    frame(ddEl);
  } catch(e) { note('ERROR: ' + e.message); }
  if (savedDaily) localStorage.setItem('torch_daily_' + todayKey, savedDaily);

  // ============================================================
  // 12. COMMENTARY SAMPLES
  // ============================================================
  // ============================================================
  // CARD CLASH — 3 Tiers (static states)
  // ============================================================
  section('CARD CLASH — 3 Drama Tiers');
  note('Static mockup of the 4-phase clash at each tier level');
  (function() {
    var tiers = [
      { label: 'TIER 1 — Routine', dim: '20%', shake: 'None', particles: '8', dur: '0.8-1s', cardScale: '100%', bg: 'rgba(6,4,2,0.85)' },
      { label: 'TIER 2 — Important (3rd down, red zone)', dim: '40%', shake: '3px', particles: '30', dur: '1.5s', cardScale: '110%', bg: 'rgba(6,4,2,0.88)' },
      { label: 'TIER 3 — Game-Changing (TD, turnover, close game)', dim: '70%', shake: '8px', particles: '80+', dur: '2.5-3s', cardScale: '125%', bg: 'rgba(6,4,2,0.92)' },
    ];
    tiers.forEach(function(t) {
      var row = document.createElement('div');
      row.style.cssText = 'width:375px;background:' + t.bg + ';border:1px solid #333;border-radius:8px;padding:12px;margin-bottom:8px;display:flex;flex-direction:column;align-items:center;gap:6px;';
      row.innerHTML =
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:10px;color:#FF6B00;letter-spacing:1px;align-self:flex-start;\">" + t.label + "</div>" +
        '<div style="display:flex;gap:12px;align-items:center;">' +
          "<div style='background:rgba(200,160,48,0.12);border:2px solid #c8a03066;border-radius:8px;padding:8px 10px;text-align:center;min-width:70px;transform:scale(" + t.cardScale.replace('%','').replace('1','1.').replace('100','1') + ");'>" +
            "<div style=\"font-family:'Teko';font-size:16px;color:#fff;\">Jet Sweep</div>" +
            "<div style=\"font-family:'Rajdhani';font-size:9px;color:#c8a030;\">Cortland \u00b7 RB</div></div>" +
          "<div style='background:rgba(77,166,255,0.12);border:2px solid #4DA6FF66;border-radius:8px;padding:8px 10px;text-align:center;min-width:70px;transform:scale(" + t.cardScale.replace('%','').replace('1','1.').replace('100','1') + ");'>" +
            "<div style=\"font-family:'Teko';font-size:16px;color:#fff;\">Zero Blitz</div>" +
            "<div style=\"font-family:'Rajdhani';font-size:9px;color:#4DA6FF;\">Blackwell \u00b7 EDGE</div></div>" +
        '</div>' +
        "<div style=\"font-family:'Rajdhani';font-size:8px;color:#666;margin-top:2px;\">Dim: " + t.dim + " | Shake: " + t.shake + " | Particles: " + t.particles + " | Duration: " + t.dur + "</div>";
      el.appendChild(row);
    });
  })();

  section('COMMENTARY SAMPLES — 4 Emotional Tiers');
  note('Tier 1: routine, Tier 2: elevated, Tier 3: intense, Tier 4: explosive');
  (function() {
    var sty = document.createElement('style');
    sty.textContent =
      ".vt-narr{background:#0C0804;border-top:2px solid #FF6B00;padding:8px 12px;width:375px;margin-bottom:8px;border-radius:4px;}" +
      ".vt-pbp-line{font-family:'Rajdhani';font-size:15px;color:#fff;font-weight:700;line-height:1.4;}" +
      ".vt-pbp-sub{font-family:'Rajdhani';font-size:13px;margin-top:4px;}" +
      ".vt-pbp-combo{font-family:'Rajdhani';font-size:12px;color:#FFB800;font-style:italic;margin-top:2px;}";
    el.appendChild(sty);

    var samples = [
      { type: 'TIER 1 — ROUTINE (60-70%)', line: 'Cortland hauls in a short pass for 4. Second and 6.', sub: '', subColor: '#aaa', combo: '' },
      { type: 'TIER 2 — ELEVATED (20%)', line: 'Cortland bursts through the hole for 8 — and that moves the chains on a critical third down.', sub: 'First down Stags. Chains move.', subColor: '#00ff44', combo: '' },
      { type: 'TIER 3 — INTENSE (8%)', line: 'Cortland! Cuts back — to the 40, the 45, he\'s got room! Picks up 18!', sub: 'Stags are moving.', subColor: '#FFB800', combo: '' },
      { type: 'TIER 4 — EXPLOSIVE (2%)', line: 'TOUCHDOWN STAGS! Strand rolls right, buys time, and finds Cortland streaking down the sideline — 23-yard strike!', sub: 'The Stags take the lead with under two minutes to play!', subColor: '#FFB800', combo: 'SETUP! +4 yds' },
      { type: 'SACK', line: 'SACK! Blackwell wraps up the QB for a loss of 7.', sub: 'That\'s a drive-killer. Serpents defense is swarming.', subColor: '#e03050', combo: '' },
      { type: 'INTERCEPTION', line: 'PICKED! Tillery reads it all the way — turnover Boars!', sub: 'Momentum shift.', subColor: '#e03050', combo: '' },
    ];
    samples.forEach(function(s) {
      var block = document.createElement('div');
      block.className = 'vt-narr';
      block.innerHTML =
        "<div style=\"font-family:'Rajdhani';font-size:8px;color:#666;letter-spacing:1px;margin-bottom:4px;\">" + s.type + "</div>" +
        "<div class='vt-pbp-line'>" + s.line + "</div>" +
        "<div class='vt-pbp-sub' style='color:" + s.subColor + "'>" + s.sub + "</div>" +
        (s.combo ? "<div class='vt-pbp-combo'>" + s.combo + "</div>" : '');
      el.appendChild(block);
    });
  })();

  // ============================================================
  // 12.5 POSSESSION CHANGE
  // ============================================================
  section('POSSESSION CHANGE — Your Ball');
  note('Static mockup of the upgraded possession screen');
  (function() {
    var boars = TEAMS.sentinels;
    var serpents = TEAMS.serpents;
    var pc = document.createElement('div');
    pc.style.cssText = 'width:375px;height:240px;background:#0A0804;border:1px solid #333;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;margin-bottom:12px;';
    pc.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div style="text-align:center;">' + renderTeamBadge('sentinels', 28) + "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:24px;color:#fff;\">21</div></div>" +
        "<div style=\"font-family:'Teko';font-size:18px;color:#555;\">\u2014</div>" +
        '<div style="text-align:center;">' + renderTeamBadge('serpents', 28) + "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:24px;color:#fff;\">14</div></div>" +
      '</div>' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:22px;color:" + boars.accent + ";letter-spacing:3px;\">YOUR BALL</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:12px;color:#aaa;\">TOUCHDOWN.</div>";
    frame(pc, 250);
  })();

  // ============================================================
  // 13. SCOREBUG CLOSE-UP
  // ============================================================
  section('SCOREBUG CLOSE-UP');
  note('Isolated scorebug at 375px — down/distance/field position/TORCH points');
  (function() {
    var boars = TEAMS.sentinels;
    var serpents = TEAMS.serpents;
    var sb = document.createElement('div');
    sb.style.cssText = 'width:375px;background:#0C0804;border:1px solid #333;border-radius:8px;overflow:hidden;margin-bottom:12px;';
    sb.innerHTML =
      // Main row
      "<div style='display:flex;align-items:center;padding:4px 6px;'>" +
        // Left team (possession)
        "<div style='display:flex;align-items:center;gap:4px;flex:1;padding:3px 6px;border-radius:4px 0 0 4px;background:rgba(255,255,255,0.04);'>" +
          renderTeamBadge('sentinels', 24) +
          "<div style='display:flex;flex-direction:column;align-items:center;'>" +
            "<div style=\"font-family:'Teko';font-size:11px;color:" + boars.accent + ";font-style:italic;letter-spacing:1px;line-height:1;\">" + boars.abbr + "</div>" +
            "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:28px;color:#E8E6FF;line-height:1;text-shadow:0 0 10px rgba(255,255,255,0.3);\">14</div>" +
          "</div>" +
        "</div>" +
        // Center
        "<div style='display:flex;flex-direction:column;align-items:center;padding:0 6px;min-width:60px;'>" +
          "<div style=\"font-family:'Teko';font-size:11px;color:#FF6B00;letter-spacing:2px;line-height:1;\">1ST HALF</div>" +
          "<div style=\"font-family:'Rajdhani';font-size:10px;color:#888;line-height:1;margin-top:1px;\">8/20</div>" +
        "</div>" +
        // Right team
        "<div style='display:flex;align-items:center;gap:4px;flex:1;justify-content:flex-end;flex-direction:row-reverse;padding:3px 6px;border-radius:0 4px 4px 0;'>" +
          renderTeamBadge('serpents', 24) +
          "<div style='display:flex;flex-direction:column;align-items:center;'>" +
            "<div style=\"font-family:'Teko';font-size:11px;color:" + serpents.accent + ";font-style:italic;letter-spacing:1px;line-height:1;\">" + serpents.abbr + "</div>" +
            "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:28px;color:#E8E6FF;line-height:1;\">7</div>" +
          "</div>" +
        "</div>" +
      "</div>" +
      // Situation bar with mini-field
      "<div style='display:flex;align-items:center;padding:3px 8px;background:rgba(0,0,0,0.5);border-top:1px solid rgba(255,255,255,0.04);gap:6px;white-space:nowrap;'>" +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:#FF6B00;\">2ND & 4</div>" +
        "<div style='width:1px;height:12px;background:rgba(255,255,255,0.1);'></div>" +
        // Mini field bar
        "<div style='flex:1;height:8px;background:#1a1a1a;border-radius:4px;position:relative;overflow:hidden;min-width:60px;'>" +
          "<div style='position:absolute;top:0;bottom:0;left:0;width:10%;background:" + boars.colors.primary + "88;border-radius:4px;'></div>" +
          "<div style='position:absolute;top:0;bottom:0;right:0;width:10%;background:" + serpents.colors.primary + "88;border-radius:4px;'></div>" +
          "<div style='position:absolute;top:-1px;left:65%;width:6px;height:10px;background:#FFB800;border-radius:3px;'></div>" +
          "<div style='position:absolute;top:0;bottom:0;left:72%;width:2px;background:" + boars.accent + ";opacity:0.5;'></div>" +
        "</div>" +
        "<div style='width:1px;height:12px;background:rgba(255,255,255,0.1);'></div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:#FFB800;\">T 185</div>" +
      "</div>";
    frame(sb, 100);
  })();

  // ============================================================
  // 14. POST-PLAY RESULT WITH TORCH POINTS
  // ============================================================
  section('POST-PLAY RESULT — with TORCH points earned');
  note('Result overlay: yardage (64px), combo, TORCH earned, matchup');
  (function() {
    var rf = document.createElement('div');
    rf.style.cssText = 'width:375px;height:280px;background:rgba(10,8,4,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:1px solid #333;border-radius:8px;';
    rf.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:700;font-size:64px;color:#3df58a;text-shadow:0 0 24px rgba(61,245,138,0.5);\">+6 YDS</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:13px;color:#FFB800;letter-spacing:1px;\">T +15</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:13px;color:#3df58a;opacity:0.8;letter-spacing:1px;\">Choice Route vs Plug the Middle</div>" +
      "<div style=\"margin-top:8px;padding:6px 12px;background:rgba(0,0,0,0.4);border-radius:4px;font-family:'Rajdhani';font-size:10px;color:#FF6B00;\">NEW: 2ND & 4 \u00b7 BALL ON RDG 35</div>";
    frame(rf, 290);
  })();

  // Reset state
  resetGs();

  // Footer
  var foot = document.createElement('div');
  foot.style.cssText = "padding:30px 0;text-align:center;font-family:'Rajdhani';font-size:9px;color:#333;";
  foot.textContent = 'TORCH v0.22 Visual Test Harness — Real Components';
  el.appendChild(foot);

  return el;
}
