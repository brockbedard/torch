/**
 * TORCH — Dev Panel
 * In-game dev tools for testing torch cards, game state, bias, and possession changes.
 * Activated via ?dev or localStorage.torch_dev = '1'. Never appears in production.
 */

import { GS, setGs, getTeam, getOtherTeam, getOffCards, getDefCards } from '../../state.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { TEAMS, getSeasonOpponents } from '../../data/teams.js';
import { generateConditions } from '../../data/gameConditions.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { SND } from '../../engine/sound.js';

var _panel = null;
var _open = false;
var _forceResult = null; // null, 'exploit', 'covered', 'turnover', 'td'

export function getForceResult() {
  var r = _forceResult;
  _forceResult = null;
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
  var panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;top:0;right:0;width:280px;height:100vh;z-index:9998;background:rgba(0,0,0,0.95);border-left:1px solid #4DA6FF;overflow-y:auto;padding:40px 10px 20px;transform:translateX(100%);transition:transform 0.25s ease;font-family:monospace;font-size:10px;color:#ccc;';
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

  // ── TORCH CARDS ──
  html += section('TORCH CARDS');
  html += btn('Give All Bronze', 'dev-bronze', '#CD7F32');
  html += btn('Give All Silver', 'dev-silver', '#C0C0C0');
  html += btn('Give All Gold', 'dev-gold', '#EBB010');
  html += btn('Open Store', 'dev-booster', '#FF4511');
  html += btn('Clear Cards', 'dev-clear-cards', '#555');

  // ── GAME FLOW ──
  html += section('GAME FLOW');
  html += btn('Replay Coin Toss', 'dev-coin-toss', '#EBB010');
  html += btn('Force Kickoff', 'dev-kickoff', '#EBB010');

  // ── FORCE RESULT ──
  html += section('FORCE NEXT RESULT');
  html += '<div style="display:flex;gap:3px;flex-wrap:wrap;">';
  html += btn('TD', 'dev-force-td', '#3df58a');
  html += btn('Exploit', 'dev-force-exploit', '#3df58a');
  html += btn('Covered', 'dev-force-covered', '#e03050');
  html += btn('Turnover', 'dev-force-turnover', '#e03050');
  html += '</div>';

  // ── BIAS TEST ──
  html += section('BIAS TEST');
  html += btn('Poss Change (good)', 'dev-poss-good', '#3df58a');
  html += btn('Poss Change (bad)', 'dev-poss-bad', '#e03050');
  html += btn('Flip Possession', 'dev-flip', '#EBB010');

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

    if (id === 'dev-coin-toss' && callbacks.showCoinToss) callbacks.showCoinToss();
    if (id === 'dev-kickoff' && callbacks.showKickoff) callbacks.showKickoff();

    if (id === 'dev-bronze') giveTorchCards(gs, 'BRONZE', callbacks);
    if (id === 'dev-silver') giveTorchCards(gs, 'SILVER', callbacks);
    if (id === 'dev-gold') giveTorchCards(gs, 'GOLD', callbacks);
    if (id === 'dev-clear-cards') {
      gs.humanTorchCards = [];
      if (callbacks.setTorchInventory) callbacks.setTorchInventory([]);
      if (callbacks.refresh) callbacks.refresh();
    }
    if (id === 'dev-booster' && callbacks.openBooster) callbacks.openBooster();

    if (id === 'dev-force-td') _forceResult = 'td';
    if (id === 'dev-force-exploit') _forceResult = 'exploit';
    if (id === 'dev-force-covered') _forceResult = 'covered';
    if (id === 'dev-force-turnover') _forceResult = 'turnover';

    if (id === 'dev-poss-good' && callbacks.showPossCut) callbacks.showPossCut('interception');
    if (id === 'dev-poss-bad' && callbacks.showPossCut) callbacks.showPossCut('score');
    if (id === 'dev-flip' && callbacks.flipPossession) callbacks.flipPossession();

    if (id === 'dev-reset') {
      localStorage.removeItem('torch_dev');
      setGs(null);
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
  var cards = TORCH_CARDS.filter(function(c) { return c.tier === tier; });
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

// ── HTML HELPERS ──
function section(title) {
  return '<div style="margin-top:10px;padding-top:6px;border-top:1px solid #333;font-size:9px;color:#4DA6FF;letter-spacing:2px;margin-bottom:4px;">' + title + '</div>';
}
function btn(label, id, color) {
  return '<button id="' + id + '" style="display:block;width:100%;margin:2px 0;padding:5px 8px;background:transparent;border:1px solid ' + color + '44;color:' + color + ';font-family:monospace;font-size:9px;cursor:pointer;border-radius:3px;text-align:left;" onmouseover="this.style.background=\'' + color + '22\'" onmouseout="this.style.background=\'transparent\'">' + label + '</button>';
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
