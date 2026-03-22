/**
 * TORCH v0.21 — Visual Test Harness
 * Calls the REAL build functions with mocked GS state.
 * Access via ?test URL param. Zero duplication — same code as the app.
 */

import { GS, setGs, setRender, getOffCards, getDefCards } from '../../state.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { TEAMS, getSeasonOpponents } from '../../data/teams.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { buildHome } from './home.js';
import { buildTeamSelect } from './teamSelect.js';
import { buildGameplay } from './gameplay.js';
import { buildEndGame } from './endGame.js';
import { buildHalftime } from './halftime.js';
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

  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;background:#0A0804;padding:12px;overflow-y:auto;';

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
      offRoster: offRoster.slice(0,4).map(function(p){return p.id;}),
      defRoster: defRoster.slice(0,4).map(function(p){return p.id;}),
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
      offRoster: offRoster.slice(0,4).map(function(p){return p.id;}),
      defRoster: defRoster.slice(0,4).map(function(p){return p.id;}),
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
      "<div style=\"font-family:'Teko';font-weight:700;font-size:48px;color:#3df58a;text-shadow:0 0 20px rgba(61,245,138,0.5);animation:T-beat-yds 0.6s cubic-bezier(0.22,1.3,0.36,1) both;\">+14 YDS</div>" +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#FFB800;letter-spacing:2px;text-shadow:0 0 12px rgba(255,184,0,0.5);\">SETUP!</div>" +
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
  section('COMMENTARY SAMPLES');
  note('Using real gameplay CSS classes (.T-narr, .T-pbp-line, etc.)');
  (function() {
    // Inject gameplay CSS so commentary classes work
    var sty = document.createElement('style');
    sty.textContent =
      ".vt-narr{background:#0C0804;border-top:2px solid #FF6B00;padding:8px 12px;width:375px;margin-bottom:8px;border-radius:4px;}" +
      ".vt-pbp-line{font-family:'Rajdhani';font-size:15px;color:#fff;font-weight:700;line-height:1.4;}" +
      ".vt-pbp-sub{font-family:'Rajdhani';font-size:13px;margin-top:4px;}" +
      ".vt-pbp-combo{font-family:'Rajdhani';font-size:12px;color:#FFB800;font-style:italic;margin-top:2px;}";
    el.appendChild(sty);

    var samples = [
      { type: 'ROUTINE GAIN', line: 'Calloway gains 4.', sub: 'Choice Route vs Plug the Middle', subColor: '#C4A265', combo: '' },
      { type: 'SACK', line: 'SACKED! Blackwell brings him down for a loss of 6.', sub: 'Go Seam vs Zero Blitz', subColor: '#e03050', combo: '' },
      { type: 'TOUCHDOWN', line: 'TOUCHDOWN! Monroe streaks down the sideline untouched!', sub: 'Streak vs Two-Deep Sit', subColor: '#FFB800', combo: 'SETUP! +4 yds' },
      { type: 'INCOMPLETE', line: 'Pass falls incomplete.', sub: 'Fade & Stop vs Match Right', subColor: '#aaa', combo: '' },
      { type: 'FUMBLE', line: 'FUMBLE! Ball is loose... Serpents recover!', sub: 'Inside Zone vs Stack the Box', subColor: '#e03050', combo: 'PREDICTABLE -3 yds' },
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

  // Reset state
  resetGs();

  // Footer
  var foot = document.createElement('div');
  foot.style.cssText = "padding:30px 0;text-align:center;font-family:'Rajdhani';font-size:9px;color:#333;";
  foot.textContent = 'TORCH v0.21 Visual Test Harness — Real Components';
  el.appendChild(foot);

  return el;
}
