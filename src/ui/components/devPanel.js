/**
 * TORCH — Dev Panel
 * In-game dev tools for testing torch cards, game state, bias, and possession changes.
 * Activated via ?dev or localStorage.torch_dev = '1'. Never appears in production.
 */

import { GS, setGs, getTeam, getOtherTeam, getOffCards, getDefCards, FEATURES, setFeatureFlag } from '../../state.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { TEAMS, getSeasonOpponents } from '../../data/teams.js';
import { generateConditions } from '../../data/gameConditions.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { SND } from '../../engine/sound.js';

var _panel = null;
var _open = false;
var _forceResult = null; // null, 'exploit', 'covered', 'turnover', 'td'
var _forceConversion = null; // null, 'good', 'fail'

export function getForceResult() {
  var r = _forceResult;
  _forceResult = null;
  if (r && _panel) {
    var badge = _panel.querySelector('#dev-force-badge');
    if (badge) badge.remove();
  }
  return r;
}

export function getForceConversion() {
  var r = _forceConversion;
  _forceConversion = null;
  if (r && _panel) {
    var badge = _panel.querySelector('#dev-force-badge');
    if (badge) badge.remove();
  }
  return r;
}

export function isDevMode() {
  return !!(localStorage.getItem('torch_dev') || (typeof window !== 'undefined' && window.location.search.includes('dev')));
}

export function injectDevPanel(el, gs, callbacks) {
  if (!isDevMode()) return;

  // Floating toggle button
  var toggle = document.createElement('div');
  toggle.style.cssText = 'position:fixed;top:8px;right:8px;z-index:9999;background:#000;border:1px solid #4DA6FF;border-radius:6px;padding:4px 8px;cursor:pointer;font-family:monospace;font-size:10px;color:#4DA6FF;opacity:0.6;transition:opacity 0.15s;';
  toggle.textContent = 'DEV';
  toggle.onmouseenter = function() { toggle.style.opacity = '1'; };
  toggle.onmouseleave = function() { toggle.style.opacity = _open ? '1' : '0.6'; };
  toggle.onclick = function() {
    _open = !_open;
    panel.style.transform = _open ? 'translateX(0)' : 'translateX(100%)';
    toggle.style.opacity = _open ? '1' : '0.6';
  };
  el.appendChild(toggle);

  // Panel
  // Auto-open on desktop (no touch = browser testing)
  var isDesktop = !('ontouchstart' in window) && window.innerWidth > 500;
  if (isDesktop) _open = true;

  var panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;top:0;right:0;width:280px;height:100vh;z-index:9998;background:rgba(0,0,0,0.95);border-left:1px solid #4DA6FF;overflow-y:auto;padding:40px 10px 20px;transform:' + (_open ? 'translateX(0)' : 'translateX(100%)') + ';transition:transform 0.25s ease;font-family:monospace;font-size:10px;color:#ccc;';
  if (_open) toggle.style.opacity = '1';
  _panel = panel;

  var html = '';

  // ── QUICK START ──
  html += section('QUICK START');
  html += btn('Jump to Gameplay (OFF)', 'dev-qp-off', '#3df58a');
  html += btn('Jump to Gameplay (DEF)', 'dev-qp-def', '#4DA6FF');
  html += '<div style="display:flex;gap:4px;margin-top:4px;">';
  html += sel('dev-team', Object.keys(TEAMS).map(function(k) { return { v: k, l: TEAMS[k].name }; }), 'Team');
  html += sel('dev-opp', Object.keys(TEAMS).map(function(k) { return { v: k, l: TEAMS[k].name }; }), 'Opp');
  html += '</div>';

  // ── GAME STATE ──
  html += section('GAME STATE');
  html += '<div style="display:flex;gap:4px;flex-wrap:wrap;">';
  html += sel('dev-down', [{v:'1',l:'1st'},{v:'2',l:'2nd'},{v:'3',l:'3rd'},{v:'4',l:'4th'}], 'Down');
  html += inp('dev-dist', '10', 'Dist');
  html += inp('dev-ball', '25', 'Ball');
  html += '</div>';
  html += '<div style="display:flex;gap:4px;margin-top:4px;">';
  html += inp('dev-hscore', '0', 'You');
  html += inp('dev-oscore', '0', 'Opp');
  html += '</div>';
  html += btn('Apply State', 'dev-apply', '#EBB010');

  // ── HAND MANAGEMENT ──
  html += section('HAND MGMT');
  html += btn('Redeal Hand', 'dev-redeal', '#4DA6FF');
  html += btn('Reset Discards', 'dev-reset-disc', '#4DA6FF');
  html += btn('Show ST Deck Info', 'dev-st-info', '#FF6B00');
  html += btn('Burn 10 ST Players', 'dev-st-burn10', '#e03050');

  // ── TORCH CARDS ──
  html += section('TORCH CARDS');
  html += '<div style="display:flex;gap:3px;">';
  html += btnInline('BRONZE', 'dev-bronze', '#CD7F32');
  html += btnInline('SILVER', 'dev-silver', '#C0C0C0');
  html += btnInline('GOLD', 'dev-gold', '#EBB010');
  html += '</div>';
  html += '<div style="margin-top:3px;font-size:8px;color:#666;letter-spacing:1px;margin-bottom:2px;">GIVE SPECIFIC</div>';
  html += '<div style="display:flex;gap:3px;flex-wrap:wrap;">';
  html += btnInline('SURE HANDS', 'dev-card-sure_hands', '#4488FF');
  html += btnInline('CHALLENGE', 'dev-card-challenge_flag', '#4488FF');
  html += btnInline('BLK KICK', 'dev-card-blocked_kick', '#FF4511');
  html += '</div>';
  html += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:2px;">';
  html += btnInline('TIMEOUT', 'dev-card-timeout', '#C0C0C0');
  html += btnInline('IRON MAN', 'dev-card-iron_man', '#C0C0C0');
  html += btnInline('HSE CALL', 'dev-card-house_call', '#EBB010');
  html += '</div>';
  html += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:2px;">';
  html += btnInline('COFFIN', 'dev-card-coffin_corner', '#CD7F32');
  html += btnInline('CANNON', 'dev-card-cannon_leg', '#C0C0C0');
  html += btnInline('SCOUT RPT', 'dev-card-scout_report', '#C0C0C0');
  html += '</div>';
  html += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:2px;">';
  html += btnInline('FRESH LEGS', 'dev-card-fresh_legs', '#CD7F32');
  html += '</div>';
  html += '<div style="display:flex;gap:3px;margin-top:3px;">';
  html += btnInline('Open Store', 'dev-booster', '#FF4511');
  html += btnInline('+500 PTS', 'dev-torch-pts', '#EBB010');
  html += '</div>';
  html += btn('Clear Cards', 'dev-clear-cards', '#555');

  // ── GAME FLOW ──
  html += section('GAME FLOW');
  html += btn('View Roster', 'dev-roster', '#4DA6FF');
  html += btn('Replay Coin Toss', 'dev-coin-toss', '#EBB010');
  html += btn('Force Kickoff', 'dev-kickoff', '#EBB010');
  html += btn('Jump to Halftime', 'dev-halftime', '#FF6B00');
  html += btn('Jump to 2-Min Drill', 'dev-2min', '#e03050');
  html += btn('Jump to 4th Down (past 50)', 'dev-4th-past50', '#EBB010');
  html += btn('Jump to 4th Down (own territory)', 'dev-4th-own', '#888');
  html += btn('Force End Game', 'dev-endgame', '#e03050');

  // ── FORCE RESULT ──
  html += section('FORCE NEXT RESULT');
  html += '<div style="display:flex;gap:3px;flex-wrap:wrap;">';
  html += btnInline('TD', 'dev-force-td', '#3df58a');
  html += btnInline('Exploit', 'dev-force-exploit', '#3df58a');
  html += btnInline('Covered', 'dev-force-covered', '#e03050');
  html += btnInline('Turnover', 'dev-force-turnover', '#e03050');
  html += '</div>';
  html += '<div style="display:flex;gap:3px;margin-top:3px;">';
  html += btnInline('Conv GOOD', 'dev-force-conv-good', '#3df58a');
  html += btnInline('Conv FAIL', 'dev-force-conv-fail', '#e03050');
  html += '</div>';

  // ── BIAS TEST ──
  html += section('BIAS TEST');
  html += btn('Poss Change (good)', 'dev-poss-good', '#3df58a');
  html += btn('Poss Change (bad)', 'dev-poss-bad', '#e03050');
  html += btn('Flip Possession', 'dev-flip', '#EBB010');

  // ── SEASON & FLOW ──
  html += section('SEASON & FLOW');
  html += btn('Jump to Season Recap', 'dev-season-recap', '#4DA6FF');
  html += btn('Set Game 2/3 (currentGame+1)', 'dev-set-game', '#EBB010');
  html += btn('Trigger Daily Drive', 'dev-daily-drive', '#3df58a');

  // ── MOMENTUM & HEAT ──
  html += section('MOMENTUM & HEAT');
  html += btn('Max Momentum (P1 off)', 'dev-max-momentum', '#3df58a');
  html += btn('Max Heat (P1 off)', 'dev-max-heat', '#e03050');
  html += btn('Reset All Heat', 'dev-reset-heat', '#555');

  // ── SCORE SHORTCUTS ──
  html += section('SCORE SHORTCUTS');
  html += btn('Force 2-Min Drill', 'dev-force-2min', '#e03050');
  html += btn('Set Score 21-14 (leading)', 'dev-score-2114', '#3df58a');
  html += btn('Set Score 7-21 (trailing)', 'dev-score-0721', '#FF6B00');
  html += btn('Force Game Over', 'dev-force-gameover', '#e03050');

  // ── ACHIEVEMENTS ──
  html += section('ACHIEVEMENTS');
  html += btn('Clear Achievements', 'dev-clear-achievements', '#555');
  html += btn('Clear All Progress (torch_*)', 'dev-clear-all', '#e03050');

  // ── UTILS ──
  html += section('UTILS');
  html += btn('Reset Game', 'dev-reset', '#e03050');
  html += '<pre id="dev-state" style="margin-top:6px;font-size:8px;color:#666;white-space:pre-wrap;max-height:120px;overflow:auto;"></pre>';

  panel.innerHTML = html;
  el.appendChild(panel);

  // ── EVENT HANDLERS ──
  panel.addEventListener('click', function(e) {
    var id = e.target.id || e.target.dataset.id;
    if (!id || !gs) return;

    if (id === 'dev-qp-off' || id === 'dev-qp-def') {
      var tid = val('dev-team') || 'stags';
      var oid = val('dev-opp') || 'wolves';
      if (tid === oid) oid = Object.keys(TEAMS).find(function(k) { return k !== tid; });
      var cond = generateConditions(false);
      var opponents = getSeasonOpponents(tid);
      setGs(function(s) {
        return Object.assign({}, s || {}, {
          screen: 'gameplay', team: tid, opponent: oid, difficulty: 'MEDIUM',
          humanReceives: id === 'dev-qp-off',
          _coinTossDone: true,
          offRoster: getOffenseRoster(tid).slice(0,4).map(function(p){return p.id;}),
          defRoster: getDefenseRoster(tid).slice(0,4).map(function(p){return p.id;}),
          offHand: getOffCards(tid).slice(0,4),
          defHand: getDefCards(tid).slice(0,4),
          gameConditions: cond, isFirstSeason: false,
          season: s && s.season ? s.season : { opponents: opponents, currentGame: 0, results: [], totalScore: 0, torchCards: [], carryoverPoints: 0 },
        });
      });
      return;
    }

    if (id === 'dev-apply' && callbacks.applyState) {
      callbacks.applyState({
        down: parseInt(val('dev-down')) || 1,
        distance: parseInt(val('dev-dist')) || 10,
        ballPosition: parseInt(val('dev-ball')) || 25,
        ctScore: parseInt(val('dev-hscore')) || 0,
        irScore: parseInt(val('dev-oscore')) || 0,
      });
    }

    if (id === 'dev-roster') {
      setGs(function(s) { return Object.assign({}, s, { screen: 'roster' }); });
    }
    if (id === 'dev-coin-toss' && callbacks.showCoinToss) callbacks.showCoinToss();
    if (id === 'dev-kickoff' && callbacks.showKickoff) callbacks.showKickoff();
    if (id === 'dev-halftime') {
      gs.needsHalftime = true;
      gs.half = 1;
      setGs(function(s) { return Object.assign({}, s, { screen: 'halftime' }); });
    }
    if (id === 'dev-2min') {
      gs.playsUsed = gs.playsPerHalf;
      gs.twoMinActive = true;
      gs.clockSeconds = 120;
      if (callbacks.refresh) callbacks.refresh();
    }
    if (id === 'dev-4th-past50') {
      gs.down = 4; gs.distance = 5;
      gs.ballPosition = gs.possession === 'CT' ? 72 : 28;
      if (callbacks.reset4thDown) callbacks.reset4thDown();
      if (callbacks.refresh) callbacks.refresh();
    }
    if (id === 'dev-4th-own') {
      gs.down = 4; gs.distance = 8;
      gs.ballPosition = gs.possession === 'CT' ? 35 : 65;
      if (callbacks.reset4thDown) callbacks.reset4thDown();
      if (callbacks.refresh) callbacks.refresh();
    }
    if (id === 'dev-endgame') {
      gs.gameOver = true;
      setGs(function(s) { return Object.assign({}, s, { screen: 'end_game', finalEngine: gs, humanAbbr: 'CT' }); });
    }

    if (id === 'dev-bronze') giveTorchCards(gs, 'BRONZE', callbacks);
    if (id === 'dev-silver') giveTorchCards(gs, 'SILVER', callbacks);
    if (id === 'dev-gold') giveTorchCards(gs, 'GOLD', callbacks);
    if (id === 'dev-clear-cards') {
      gs.humanTorchCards = [];
      if (callbacks.setTorchInventory) callbacks.setTorchInventory([]);
      if (callbacks.refresh) callbacks.refresh();
    }
    if (id === 'dev-booster' && callbacks.openBooster) callbacks.openBooster();
    if (id === 'dev-torch-pts') {
      gs.ctTorchPts = (gs.ctTorchPts || 0) + 500;
      if (callbacks.refresh) callbacks.refresh();
    }
    if (id && id.startsWith('dev-card-')) {
      var cardId = id.replace('dev-card-', '');
      giveSpecificCard(gs, cardId, callbacks);
    }

    if (id === 'dev-redeal' && callbacks.redealHand) callbacks.redealHand();
    if (id === 'dev-reset-disc' && callbacks.resetDiscards) callbacks.resetDiscards();
    if (id === 'dev-st-info' && callbacks.showSTInfo) callbacks.showSTInfo();
    if (id === 'dev-st-burn10' && callbacks.burnSTPlayers) callbacks.burnSTPlayers();

    if (id === 'dev-force-td') { _forceResult = 'td'; showForceArmed('TD'); }
    if (id === 'dev-force-exploit') { _forceResult = 'exploit'; showForceArmed('EXPLOIT'); }
    if (id === 'dev-force-covered') { _forceResult = 'covered'; showForceArmed('COVERED'); }
    if (id === 'dev-force-turnover') { _forceResult = 'turnover'; showForceArmed('TURNOVER'); }
    if (id === 'dev-force-conv-good') { _forceConversion = 'good'; showForceArmed('CONV GOOD'); }
    if (id === 'dev-force-conv-fail') { _forceConversion = 'fail'; showForceArmed('CONV FAIL'); }

    if (id === 'dev-poss-good' && callbacks.showPossCut) callbacks.showPossCut('interception');
    if (id === 'dev-poss-bad' && callbacks.showPossCut) callbacks.showPossCut('score');
    if (id === 'dev-flip' && callbacks.flipPossession) callbacks.flipPossession();

    if (id === 'dev-reset') {
      localStorage.removeItem('torch_dev');
      setGs(null);
    }

    // ── SEASON & FLOW ──
    if (id === 'dev-season-recap') {
      setGs(function(s) {
        return Object.assign({}, s, {
          screen: 'seasonRecap',
          season: Object.assign({}, (s && s.season) || {}, {
            results: [
              { won: true, score: 28, oppScore: 14 },
              { won: true, score: 21, oppScore: 17 },
              { won: false, score: 10, oppScore: 24 },
            ],
            currentGame: 3,
            carryoverPoints: s && s.season && s.season.carryoverPoints ? s.season.carryoverPoints : 0,
          }),
        });
      });
    }
    if (id === 'dev-set-game') {
      if (callbacks.advanceSeason) {
        callbacks.advanceSeason();
      } else {
        setGs(function(s) {
          var cur = (s && s.season && s.season.currentGame) || 0;
          var next = Math.min(cur + 1, 2);
          return Object.assign({}, s, {
            season: Object.assign({}, (s && s.season) || {}, { currentGame: next }),
          });
        });
      }
    }
    if (id === 'dev-daily-drive') {
      setGs(function(s) { return Object.assign({}, s, { screen: 'dailyDrive' }); });
    }

    // ── MOMENTUM & HEAT ──
    if (id === 'dev-max-momentum') {
      if (callbacks.maxMomentumP1) {
        callbacks.maxMomentumP1();
      } else {
        var offKeys = Object.keys(gs.offMomentumMap || {});
        var firstOffId = offKeys.length ? offKeys[0] : null;
        if (!firstOffId && gs.ctOffRoster && gs.ctOffRoster[0]) firstOffId = gs.ctOffRoster[0].id || gs.ctOffRoster[0];
        if (firstOffId) { gs.offMomentumMap = gs.offMomentumMap || {}; gs.offMomentumMap[firstOffId] = 5; }
        if (callbacks.refresh) callbacks.refresh();
      }
    }
    if (id === 'dev-max-heat') {
      if (callbacks.maxHeatP1) {
        callbacks.maxHeatP1();
      } else {
        var offHeatKeys = Object.keys(gs.offHeatMap || {});
        var firstHeatId = offHeatKeys.length ? offHeatKeys[0] : null;
        if (!firstHeatId && gs.ctOffRoster && gs.ctOffRoster[0]) firstHeatId = gs.ctOffRoster[0].id || gs.ctOffRoster[0];
        if (firstHeatId) { gs.offHeatMap = gs.offHeatMap || {}; gs.offHeatMap[firstHeatId] = 5; }
        if (callbacks.refresh) callbacks.refresh();
      }
    }
    if (id === 'dev-reset-heat') {
      if (callbacks.resetAllHeat) {
        callbacks.resetAllHeat();
      } else {
        gs.offHeatMap = {};
        gs.defHeatMap = {};
        if (callbacks.refresh) callbacks.refresh();
      }
    }

    // ── SCORE SHORTCUTS ──
    if (id === 'dev-force-2min') {
      gs.twoMinActive = true;
      gs.clockSeconds = 60;
      gs.playsUsed = 19;
      if (callbacks.refresh) callbacks.refresh();
    }
    if (id === 'dev-score-2114') {
      if (callbacks.applyState) callbacks.applyState({ ctScore: 21, irScore: 14 });
      else { gs.ctScore = 21; gs.irScore = 14; if (callbacks.refresh) callbacks.refresh(); }
    }
    if (id === 'dev-score-0721') {
      if (callbacks.applyState) callbacks.applyState({ ctScore: 7, irScore: 21 });
      else { gs.ctScore = 7; gs.irScore = 21; if (callbacks.refresh) callbacks.refresh(); }
    }
    if (id === 'dev-force-gameover') {
      gs.gameOver = true;
      if (callbacks.refresh) callbacks.refresh();
    }

    // ── ACHIEVEMENTS ──
    if (id === 'dev-clear-achievements') {
      localStorage.removeItem('torch_achievements');
      alert('torch_achievements cleared.');
    }
    if (id === 'dev-clear-all') {
      var toClear = [];
      for (var k = 0; k < localStorage.length; k++) {
        var key = localStorage.key(k);
        if (key && key.startsWith('torch_')) toClear.push(key);
      }
      toClear.forEach(function(k) { localStorage.removeItem(k); });
      alert('Cleared ' + toClear.length + ' torch_* keys.');
    }

    updateStateReadout(gs);
  });

  updateStateReadout(gs);
}

function updateStateReadout(gs) {
  if (!_panel) return;
  var pre = _panel.querySelector('#dev-state');
  if (!pre || !gs) return;
  var s = gs.getSummary ? gs.getSummary() : {};
  pre.textContent = JSON.stringify({
    poss: s.possession, down: s.down, dist: s.distance,
    ball: s.ballPosition, ydsToEz: s.yardsToEndzone,
    ct: s.ctScore, ir: s.irScore, half: s.half,
    torch: { ct: s.ctTorchPts, ir: s.irTorchPts },
    engineCards: gs.humanTorchCards ? gs.humanTorchCards.length : 0,
    uiCards: gs.humanTorchCards ? gs.humanTorchCards.join(',') : '',
  }, null, 1);
}

function giveTorchCards(gs, tier, callbacks) {
  var cards = TORCH_CARDS.filter(function(c) { return c.tier === tier && c.implemented !== false; });
  cards.forEach(function(c) {
    if (gs.humanTorchCards.length < 5) gs.humanTorchCards.push(c.id);
  });
  // Sync to gameplay UI's torchInventory
  if (callbacks.setTorchInventory) {
    var inv = gs.humanTorchCards.map(function(id) {
      return TORCH_CARDS.find(function(tc) { return tc.id === id; });
    }).filter(Boolean);
    callbacks.setTorchInventory(inv);
  }
  if (callbacks.refresh) callbacks.refresh();
}

function giveSpecificCard(gs, cardId, callbacks) {
  var card = TORCH_CARDS.find(function(c) { return c.id === cardId; });
  if (!card) return;
  if (gs.humanTorchCards.length < 5) gs.humanTorchCards.push(card.id);
  if (callbacks.setTorchInventory) {
    var inv = gs.humanTorchCards.map(function(id) {
      return TORCH_CARDS.find(function(tc) { return tc.id === id; });
    }).filter(Boolean);
    callbacks.setTorchInventory(inv);
  }
  if (callbacks.refresh) callbacks.refresh();
}

function showForceArmed(label) {
  if (!_panel) return;
  var existing = _panel.querySelector('#dev-force-badge');
  if (existing) existing.remove();
  var badge = document.createElement('div');
  badge.id = 'dev-force-badge';
  badge.style.cssText = 'position:fixed;bottom:8px;right:8px;z-index:9999;background:#e03050;color:#fff;font-family:monospace;font-size:9px;padding:4px 8px;border-radius:4px;pointer-events:none;';
  badge.textContent = 'ARMED: ' + label;
  _panel.appendChild(badge);
}

// ── HTML HELPERS ──
function section(title) {
  return '<div style="margin-top:10px;padding-top:6px;border-top:1px solid #333;font-size:9px;color:#4DA6FF;letter-spacing:2px;margin-bottom:4px;">' + title + '</div>';
}
function btn(label, id, color) {
  return '<button id="' + id + '" style="display:block;width:100%;margin:2px 0;padding:5px 8px;background:transparent;border:1px solid ' + color + '44;color:' + color + ';font-family:monospace;font-size:9px;cursor:pointer;border-radius:3px;text-align:left;" onmouseover="this.style.background=\'' + color + '22\'" onmouseout="this.style.background=\'transparent\'">' + label + '</button>';
}
function btnInline(label, id, color) {
  return '<button id="' + id + '" style="flex:1;margin:2px 0;padding:5px 4px;background:transparent;border:1px solid ' + color + '44;color:' + color + ';font-family:monospace;font-size:9px;cursor:pointer;border-radius:3px;text-align:center;" onmouseover="this.style.background=\'' + color + '22\'" onmouseout="this.style.background=\'transparent\'">' + label + '</button>';
}
function sel(id, opts, label) {
  var h = '<select id="' + id + '" style="flex:1;min-width:0;padding:4px;background:#111;border:1px solid #333;color:#ccc;font-family:monospace;font-size:9px;border-radius:3px;">';
  opts.forEach(function(o) { h += '<option value="' + o.v + '">' + (label ? label + ': ' : '') + o.l + '</option>'; });
  return h + '</select>';
}
function inp(id, def, label) {
  return '<input id="' + id + '" type="number" value="' + def + '" placeholder="' + label + '" style="flex:1;min-width:0;width:50px;padding:4px;background:#111;border:1px solid #333;color:#ccc;font-family:monospace;font-size:9px;border-radius:3px;">';
}
function val(id) {
  var el = _panel ? _panel.querySelector('#' + id) : null;
  return el ? el.value : '';
}
