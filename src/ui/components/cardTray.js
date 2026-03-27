/**
 * TORCH — Card Tray Component
 * 8-card simultaneous layout: 4 play cards (top) + 4 player cards (bottom).
 * All card animations use GSAP (per design principles). No CSS transitions on cards.
 */

import { gsap } from 'gsap';
import { buildPlayV1, buildMaddenPlayer, buildTorchCard } from './cards.js';
import { SND } from '../../engine/sound.js';

// ── CSS (layout only — no card transitions, GSAP handles movement) ──
var _cssInjected = false;
var TRAY_CSS = `
.CT-wrap{display:flex;flex-direction:column;flex-shrink:0;background:#0E0A04;border-top:2px solid #FF6B0033;position:relative;z-index:1}
.CT-side{text-align:center;padding:3px 0 1px;font-family:'Teko';font-weight:700;font-size:18px;letter-spacing:3px;flex-shrink:0}
.CT-row{display:flex;gap:3px;padding:2px 3px;flex-shrink:0}
.CT-row-label{font-family:'Rajdhani';font-weight:700;font-size:8px;letter-spacing:1px;padding:0 6px;color:#555;flex-shrink:0}
.CT-card{flex:1 1 0;min-width:0;height:120px;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;position:relative;cursor:pointer;border:2px solid transparent;will-change:transform}
.CT-card-disabled{opacity:0.35;pointer-events:none}
.CT-actions{display:flex;gap:6px;padding:4px 8px;align-items:center;flex-shrink:0}
.CT-disc-btn{font-family:'Rajdhani';font-weight:700;font-size:10px;letter-spacing:1px;padding:6px 10px;border-radius:4px;border:1px solid #33333388;background:transparent;cursor:pointer;color:#888}
.CT-disc-btn-active{color:#EBB010;border-color:#EBB01044}
.CT-disc-btn-used{color:#333;border-color:#1a1a1a;cursor:not-allowed}
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

// Track previous hand IDs to detect new cards (deal animation only for new ones)
var _prevPlayIds = [];
var _prevPlayerIds = [];

function getRisk(id) { return 'med'; }

// ── GSAP ANIMATIONS ──

/** Deal cards in from above with stagger and overshoot */
function animateDeal(cards, startDelay) {
  if (!cards.length) return;
  gsap.set(cards, { y: -160, rotation: function() { return gsap.utils.random(-8, 8); }, scale: 0.8, opacity: 0 });
  gsap.to(cards, {
    y: 0, rotation: 0, scale: 1, opacity: 1,
    duration: 0.3, stagger: 0.08,
    ease: 'back.out(1.7)',
    delay: startDelay || 0,
    onStart: function() { try { SND.cardSnap(); } catch(e) {} },
  });
}

/** Select animation — lift with gold glow */
function animateSelect(card) {
  gsap.to(card, { y: -8, scale: 1.05, duration: 0.15, ease: 'power2.out' });
  card.style.borderColor = '#EBB010';
  card.style.boxShadow = '0 4px 16px rgba(235,176,16,0.4)';
  card.style.zIndex = '2';
}

/** Deselect animation — settle back */
function animateDeselect(card) {
  gsap.to(card, { y: 0, scale: 1, duration: 0.15, ease: 'power2.out' });
  card.style.borderColor = 'transparent';
  card.style.boxShadow = 'none';
  card.style.zIndex = '';
}

/** Touch hold feedback — subtle lift on press */
function attachTouchFeedback(card) {
  var pressed = false;
  card.addEventListener('touchstart', function() {
    pressed = true;
    gsap.to(card, { y: -4, scale: 1.02, duration: 0.1, ease: 'power2.out' });
  }, { passive: true });
  card.addEventListener('touchend', function() {
    if (pressed) {
      pressed = false;
      // Don't settle if it's about to get selected (onclick fires after touchend)
      setTimeout(function() {
        if (!card._selected) gsap.to(card, { y: 0, scale: 1, duration: 0.1, ease: 'power2.out' });
      }, 50);
    }
  }, { passive: true });
  card.addEventListener('touchcancel', function() {
    pressed = false;
    gsap.to(card, { y: 0, scale: 1, duration: 0.1, ease: 'power2.out' });
  }, { passive: true });
}

/**
 * Render the card tray.
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

  // ── TORCH CARD PHASE ──
  if (opts.phase === 'torch' && opts.torchCards && opts.torchCards.length > 0) {
    var torchLabel = document.createElement('div');
    torchLabel.className = 'CT-row-label';
    torchLabel.style.color = '#EBB010';
    torchLabel.textContent = 'TORCH CARD \u2014 PLAY ONE OR SKIP';
    wrap.appendChild(torchLabel);

    var torchRow = document.createElement('div');
    torchRow.className = 'CT-torch-row';

    var offCats = ['amplification', 'information'];
    var defCats = ['disruption', 'protection'];
    var applicable = opts.isOffense ? offCats : defCats;
    var torchEls = [];

    opts.torchCards.slice(0, 3).forEach(function(tc) {
      var isApp = applicable.indexOf(tc.category) >= 0;
      var c = document.createElement('div');
      c.className = 'CT-torch-card' + (isApp ? '' : ' CT-card-disabled');
      var tcEl = buildTorchCard(tc, null, 100);
      tcEl.style.width = '100%'; tcEl.style.height = '100%';
      c.appendChild(tcEl);
      if (isApp) {
        attachTouchFeedback(c);
        c.onclick = function() { SND.click(); if (opts.onTorchCard) opts.onTorchCard(tc); };
      }
      torchRow.appendChild(c);
      torchEls.push(c);
    });

    var skip = document.createElement('div');
    skip.className = 'CT-skip-btn';
    skip.innerHTML = '<div class="CT-skip-label">SKIP</div>';
    skip.onclick = function() { SND.click(); if (opts.onSkipTorch) opts.onSkipTorch(); };
    torchRow.appendChild(skip);
    torchEls.push(skip);

    wrap.appendChild(torchRow);
    // Deal animation for torch cards
    requestAnimationFrame(function() { animateDeal(torchEls, 0); });
    return wrap;
  }

  // ── PLAY CARDS ROW ──
  var playLabel = document.createElement('div');
  playLabel.className = 'CT-row-label';
  playLabel.textContent = 'PLAYS';
  wrap.appendChild(playLabel);

  var playRow = document.createElement('div');
  playRow.className = 'CT-row';
  var playCardEls = [];
  var newPlayEls = [];
  var curPlayIds = (opts.plays || []).map(function(p) { return p.id; });

  (opts.plays || []).forEach(function(play) {
    var isSel = opts.selectedPlay === play;
    var isNew = _prevPlayIds.indexOf(play.id) === -1;
    var cat = { SHORT: 'SHORT', QUICK: 'QUICK', DEEP: 'DEEP', RUN: 'RUN', SCREEN: 'SCREEN', OPTION: 'OPTION',
      BLITZ: 'BLITZ', ZONE: 'ZONE', PRESSURE: 'PRESSURE', HYBRID: 'HYBRID' }[play.playType || play.cardType] || 'RUN';
    var playCard = buildPlayV1({
      name: play.name, playType: cat,
      isRun: play.isRun === true || play.type === 'run',
      desc: play.desc || play.flavor || '',
      risk: play.risk || getRisk(play.id), cat: cat
    }, null, 120);
    playCard.style.width = '100%'; playCard.style.height = '100%';

    var c = document.createElement('div');
    c.className = 'CT-card';
    c._selected = isSel;
    c.appendChild(playCard);
    attachTouchFeedback(c);
    c.onclick = function() {
      SND.select();
      if (opts.onSelectPlay) opts.onSelectPlay(play);
    };
    playRow.appendChild(c);
    playCardEls.push(c);
    if (isNew) newPlayEls.push(c);
  });
  wrap.appendChild(playRow);

  // ── PLAYER CARDS ROW ──
  var playerLabel = document.createElement('div');
  playerLabel.className = 'CT-row-label';
  playerLabel.textContent = 'PLAYERS';
  wrap.appendChild(playerLabel);

  var playerRow = document.createElement('div');
  playerRow.className = 'CT-row';
  var playerCardEls = [];
  var newPlayerEls = [];
  var curPlayerIds = (opts.players || []).map(function(p) { return p.id; });

  (opts.players || []).forEach(function(p) {
    var isSel = opts.selectedPlayer === p;
    var isNew = _prevPlayerIds.indexOf(p.id) === -1;
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
    playerCard.style.width = '100%'; playerCard.style.height = '100%';

    var c = document.createElement('div');
    c.className = 'CT-card';
    c._selected = isSel;
    if (isHot) {
      c.style.borderColor = '#FF4511';
      c.style.boxShadow = '0 0 12px rgba(255,69,17,0.5)';
    }
    c.appendChild(playerCard);
    attachTouchFeedback(c);
    c.onclick = function() {
      if (p.injured) return;
      SND.select();
      if (opts.onSelectPlayer) opts.onSelectPlayer(p);
    };
    playerRow.appendChild(c);
    playerCardEls.push(c);
    if (isNew) newPlayerEls.push(c);
  });
  wrap.appendChild(playerRow);

  // Apply select state via GSAP (not CSS)
  requestAnimationFrame(function() {
    playCardEls.forEach(function(c) { if (c._selected) animateSelect(c); });
    playerCardEls.forEach(function(c) { if (c._selected) animateSelect(c); });
    // Deal animation for new cards only
    if (newPlayEls.length > 0) animateDeal(newPlayEls, 0);
    if (newPlayerEls.length > 0) animateDeal(newPlayerEls, newPlayEls.length > 0 ? 0.15 : 0);
  });

  // Update tracked IDs
  _prevPlayIds = curPlayIds;
  _prevPlayerIds = curPlayerIds;

  // ── ACTION BAR ──
  var actions = document.createElement('div');
  actions.className = 'CT-actions';

  var discPlayBtn = document.createElement('button');
  discPlayBtn.className = 'CT-disc-btn' + (opts.canDiscardPlays ? ' CT-disc-btn-active' : ' CT-disc-btn-used');
  discPlayBtn.textContent = opts.canDiscardPlays ? 'DISCARD PLAYS' : 'USED';
  discPlayBtn.disabled = !opts.canDiscardPlays;
  actions.appendChild(discPlayBtn);

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
