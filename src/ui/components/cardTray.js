/**
 * TORCH — Card Tray Component
 * 8-card simultaneous layout: 4 play cards (top) + 4 player cards (bottom).
 * Manages selection, discard mode, SNAP button, and torch card prompt.
 * Does NOT own state — receives data and fires callbacks.
 */

import { buildPlayV1, buildMaddenPlayer, buildTorchCard } from './cards.js';
import { SND } from '../../engine/sound.js';

// ── CSS ──
var _cssInjected = false;
var TRAY_CSS = `
.CT-wrap{display:flex;flex-direction:column;flex-shrink:0;background:#0E0A04;border-top:2px solid #FF6B0033;position:relative;z-index:1}
.CT-side{text-align:center;padding:3px 0 1px;font-family:'Teko';font-weight:700;font-size:18px;letter-spacing:3px;flex-shrink:0}
.CT-row{display:flex;gap:3px;padding:2px 3px;flex-shrink:0}
.CT-row-label{font-family:'Rajdhani';font-weight:700;font-size:8px;letter-spacing:1px;padding:0 6px;color:#555;flex-shrink:0}
.CT-card{flex:1 1 0;min-width:0;height:120px;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;position:relative;cursor:pointer;transition:transform .12s,box-shadow .12s,opacity .12s}
.CT-card-sel{transform:translateY(-6px);box-shadow:0 4px 16px rgba(235,176,16,0.4);border:2px solid #EBB010 !important;z-index:2}
.CT-card-mark{transform:translateY(6px) rotate(-3deg);opacity:0.5}
.CT-card-disabled{opacity:0.35;pointer-events:none}
.CT-actions{display:flex;gap:6px;padding:4px 8px;align-items:center;flex-shrink:0}
.CT-disc-btn{font-family:'Rajdhani';font-weight:700;font-size:10px;letter-spacing:1px;padding:6px 10px;border-radius:4px;border:1px solid #33333388;background:transparent;cursor:pointer;color:#888;transition:all .15s}
.CT-disc-btn-active{color:#EBB010;border-color:#EBB01044}
.CT-disc-btn-used{color:#333;border-color:#1a1a1a;cursor:not-allowed}
.CT-disc-mode{background:rgba(235,176,16,0.06);border-color:#EBB01066}
.CT-snap-btn{flex:1;font-family:'Teko';font-weight:700;font-size:16px;letter-spacing:3px;padding:10px;border-radius:6px;border:2px solid #FF4511;background:linear-gradient(180deg,#EBB010,#FF4511);color:#000;cursor:pointer}
.CT-snap-btn:disabled{opacity:0.3;cursor:not-allowed}
.CT-torch-row{display:flex;gap:3px;padding:2px 3px;flex-shrink:0}
.CT-torch-card{flex:1 1 0;min-width:0;height:100px;border-radius:6px;overflow:hidden;cursor:pointer;position:relative}
.CT-skip-btn{flex:1 1 0;min-width:0;height:100px;border-radius:6px;border:2px dashed #554f8044;display:flex;align-items:center;justify-content:center;cursor:pointer}
.CT-skip-label{font-family:'Rajdhani';font-weight:700;font-size:9px;color:#554f80;letter-spacing:1px}
`;

function injectCSS() {
  if (_cssInjected) return;
  _cssInjected = true;
  var s = document.createElement('style');
  s.textContent = TRAY_CSS;
  document.head.appendChild(s);
}

// Risk lookup — same as gameplay.js
var _riskMap = {};
function getRisk(id) { return _riskMap[id] || 'med'; }

/**
 * Render the card tray.
 * @param {object} opts
 * @param {Array} opts.plays - 4 play cards in hand
 * @param {Array} opts.players - 4 player cards in hand
 * @param {object|null} opts.selectedPlay - Currently selected play
 * @param {object|null} opts.selectedPlayer - Currently selected player
 * @param {boolean} opts.isOffense - Human on offense?
 * @param {object} opts.team - Human team object { name, accent, colors }
 * @param {string} opts.teamId - Team ID for card rendering
 * @param {boolean} opts.canDiscardPlays - Can still discard plays this drive?
 * @param {boolean} opts.canDiscardPlayers - Can still discard players this drive?
 * @param {Array} opts.torchCards - Available pre-snap torch cards
 * @param {string} opts.phase - 'play'|'torch'|'ready'|'busy'
 * @param {boolean} opts.isConversion - In conversion mode?
 * @param {boolean} opts.is2Min - 2-minute drill active?
 * @param {number} opts.clockSeconds - Clock seconds remaining
 * @param {object} opts.offStar - Offensive star player (for heat check glow)
 * @param {boolean} opts.offStarHot - Is offensive star on fire?
 * @param {object} opts.defStar - Defensive star player
 * @param {boolean} opts.defStarHot - Is defensive star on fire?
 * @param {function} opts.onSelectPlay - fn(play)
 * @param {function} opts.onSelectPlayer - fn(player)
 * @param {function} opts.onSnap - fn()
 * @param {function} opts.onDiscardPlays - fn(markedCards)
 * @param {function} opts.onDiscardPlayers - fn(markedCards)
 * @param {function} opts.onTorchCard - fn(card)
 * @param {function} opts.onSkipTorch - fn()
 * @param {function} opts.onSpike - fn()
 * @param {function} opts.onKneel - fn()
 * @returns {HTMLElement}
 */
export function renderCardTray(opts) {
  injectCSS();

  var wrap = document.createElement('div');
  wrap.className = 'CT-wrap';

  if (opts.phase === 'busy') {
    wrap.style.display = 'none';
    return wrap;
  }

  // Side indicator
  var sideBar = document.createElement('div');
  sideBar.className = 'CT-side';
  sideBar.style.color = opts.team.accent || '#FF6B00';
  sideBar.style.background = 'linear-gradient(90deg,transparent,rgba(255,107,0,.06),transparent)';
  sideBar.textContent = opts.team.name + (opts.isOffense ? ' OFFENSE' : ' DEFENSE');
  wrap.appendChild(sideBar);

  // Torch card phase — show torch cards instead of normal hand
  if (opts.phase === 'torch' && opts.torchCards && opts.torchCards.length > 0) {
    var torchLabel = document.createElement('div');
    torchLabel.className = 'CT-row-label';
    torchLabel.style.color = '#EBB010';
    torchLabel.textContent = 'TORCH CARD — PLAY ONE OR SKIP';
    wrap.appendChild(torchLabel);

    var torchRow = document.createElement('div');
    torchRow.className = 'CT-torch-row';

    var offCats = ['amplification', 'information'];
    var defCats = ['disruption', 'protection'];
    var applicable = opts.isOffense ? offCats : defCats;

    opts.torchCards.slice(0, 3).forEach(function(tc) {
      var isApp = applicable.indexOf(tc.category) >= 0;
      var c = document.createElement('div');
      c.className = 'CT-torch-card' + (isApp ? '' : ' CT-card-disabled');
      var tcEl = buildTorchCard(tc, null, 100);
      tcEl.style.width = '100%';
      tcEl.style.height = '100%';
      c.appendChild(tcEl);
      if (isApp) {
        c.onclick = function() { SND.click(); if (opts.onTorchCard) opts.onTorchCard(tc); };
      }
      torchRow.appendChild(c);
    });

    // Skip button
    var skip = document.createElement('div');
    skip.className = 'CT-skip-btn';
    skip.innerHTML = '<div class="CT-skip-label">SKIP</div>';
    skip.onclick = function() { SND.click(); if (opts.onSkipTorch) opts.onSkipTorch(); };
    torchRow.appendChild(skip);

    wrap.appendChild(torchRow);
    return wrap;
  }

  // ── PLAY CARDS ROW ──
  var playLabel = document.createElement('div');
  playLabel.className = 'CT-row-label';
  playLabel.textContent = 'PLAYS';
  wrap.appendChild(playLabel);

  var _discPlayMode = false;
  var _markedPlays = [];
  var _discPlayerMode = false;
  var _markedPlayers = [];

  var playRow = document.createElement('div');
  playRow.className = 'CT-row';

  (opts.plays || []).forEach(function(play) {
    var isSel = opts.selectedPlay === play;
    var cat = { SHORT: 'SHORT', QUICK: 'QUICK', DEEP: 'DEEP', RUN: 'RUN', SCREEN: 'SCREEN', OPTION: 'OPTION',
      BLITZ: 'BLITZ', ZONE: 'ZONE', PRESSURE: 'PRESSURE', HYBRID: 'HYBRID' }[play.playType || play.cardType] || 'RUN';
    var playCard = buildPlayV1({
      name: play.name, playType: cat,
      isRun: play.isRun === true || play.type === 'run',
      desc: play.desc || play.flavor || '',
      risk: play.risk || getRisk(play.id), cat: cat
    }, null, 120);
    playCard.style.width = '100%';
    playCard.style.height = '100%';

    var c = document.createElement('div');
    c.className = 'CT-card' + (isSel ? ' CT-card-sel' : '');
    c.appendChild(playCard);
    c.onclick = function() {
      SND.select();
      if (opts.onSelectPlay) opts.onSelectPlay(play);
    };
    playRow.appendChild(c);
  });
  wrap.appendChild(playRow);

  // ── PLAYER CARDS ROW ──
  var playerLabel = document.createElement('div');
  playerLabel.className = 'CT-row-label';
  playerLabel.textContent = 'PLAYERS';
  wrap.appendChild(playerLabel);

  var playerRow = document.createElement('div');
  playerRow.className = 'CT-row';

  (opts.players || []).forEach(function(p) {
    var isSel = opts.selectedPlayer === p;
    var isHot = (opts.isOffense && opts.offStar && p.id === opts.offStar.id && opts.offStarHot) ||
                (!opts.isOffense && opts.defStar && p.id === opts.defStar.id && opts.defStarHot);
    var playerCard = buildMaddenPlayer({
      name: p.name, pos: p.pos, ovr: p.ovr,
      num: p.num || '', badge: p.badge, isStar: p.isStar,
      ability: p.ability || '',
      stars: p.stars, trait: p.trait,
      teamColor: opts.team.colors ? opts.team.colors.primary : (opts.team.accent || '#FF4511'),
      teamId: opts.teamId
    }, null, 120);
    playerCard.style.width = '100%';
    playerCard.style.height = '100%';

    var c = document.createElement('div');
    c.className = 'CT-card' + (isSel ? ' CT-card-sel' : '');
    if (isHot) c.style.cssText += 'border:2px solid #FF4511;box-shadow:0 0 12px rgba(255,69,17,0.5);';
    c.appendChild(playerCard);
    c.onclick = function() {
      if (p.injured) return;
      SND.select();
      if (opts.onSelectPlayer) opts.onSelectPlayer(p);
    };
    playerRow.appendChild(c);
  });
  wrap.appendChild(playerRow);

  // ── ACTION BAR ──
  var actions = document.createElement('div');
  actions.className = 'CT-actions';

  // Discard plays button
  var discPlayBtn = document.createElement('button');
  discPlayBtn.className = 'CT-disc-btn' + (opts.canDiscardPlays ? ' CT-disc-btn-active' : ' CT-disc-btn-used');
  discPlayBtn.textContent = opts.canDiscardPlays ? 'DISCARD PLAYS' : 'USED';
  discPlayBtn.disabled = !opts.canDiscardPlays;
  actions.appendChild(discPlayBtn);

  // SNAP button
  var snapBtn = document.createElement('button');
  snapBtn.className = 'CT-snap-btn';
  snapBtn.textContent = opts.isConversion ? 'ATTEMPT' : 'SNAP';
  var canSnap = opts.selectedPlay && opts.selectedPlayer;
  snapBtn.disabled = !canSnap;
  snapBtn.style.opacity = canSnap ? '1' : '0.3';
  if (canSnap) snapBtn.style.animation = 'T-pulse 1.8s ease-in-out infinite';
  snapBtn.onclick = function() {
    if (!canSnap) return;
    SND.snap();
    if (opts.onSnap) opts.onSnap();
  };
  actions.appendChild(snapBtn);

  // Discard players button
  var discPlayerBtn = document.createElement('button');
  discPlayerBtn.className = 'CT-disc-btn' + (opts.canDiscardPlayers ? ' CT-disc-btn-active' : ' CT-disc-btn-used');
  discPlayerBtn.textContent = opts.canDiscardPlayers ? 'DISCARD PLYR' : 'USED';
  discPlayerBtn.disabled = !opts.canDiscardPlayers;
  actions.appendChild(discPlayerBtn);

  wrap.appendChild(actions);

  // ── SPIKE/KNEEL (2-min drill) ──
  if (opts.is2Min && opts.isOffense) {
    var clockBtns = document.createElement('div');
    clockBtns.style.cssText = 'display:flex;gap:6px;padding:4px 8px;flex-shrink:0;';

    var spk = document.createElement('button');
    spk.className = 'T-2btn T-spike';
    spk.textContent = 'SPIKE';
    spk.style.flex = '1';
    spk.onclick = function() { if (opts.onSpike) opts.onSpike(); };
    clockBtns.appendChild(spk);

    // Kneel only when winning
    if (opts.onKneel) {
      var kn = document.createElement('button');
      kn.className = 'T-2btn T-kneel';
      kn.textContent = 'KNEEL';
      kn.style.flex = '1';
      kn.onclick = function() { opts.onKneel(); };
      clockBtns.appendChild(kn);
    }
    wrap.appendChild(clockBtns);
  }

  return wrap;
}
