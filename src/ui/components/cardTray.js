/**
 * TORCH — Card Tray Component
 * 8-card simultaneous layout: 4 play cards (top) + 4 player cards (bottom).
 * All card animations use GSAP. Discard button next to team name.
 */

import { gsap } from 'gsap';
import { buildPlayV1, buildMaddenPlayer, buildTorchCard, buildHomeCard } from './cards.js';
import { renderTorchCardIcon } from '../../assets/icons/torchCardIcons.js';
import { SND } from '../../engine/sound.js';
import { Haptic } from '../../engine/haptics.js';
import { flameIconSVG, flameSilhouetteSVG } from '../../utils/flameIcon.js';

// Compact stat formatter — always fits on one line at 10px on 80px card
// Uses short labels, drops least important stats if too many
var _d = '<span style="opacity:0.55">';
var _e = '</span>';
function formatPlayerStats(s) {
  if (!s) return null;
  var parts = [];
  // Primary stat (most important — yards)
  if (s.passComp || s.passAtt) parts.push((s.passComp||0) + '/' + (s.passAtt||0) + ' ' + (s.passYds||0) + ' ' + _d + 'YD' + _e);
  else if (s.rec) parts.push((s.recYds||0) + ' ' + _d + 'YD' + _e);
  else if (s.rushAtt) parts.push(s.rushAtt + ' ' + _d + 'CAR' + _e + ' ' + (s.rushYds||0) + ' ' + _d + 'YD' + _e);
  // Key counting stats (max 2)
  var counts = [];
  if (s.td) counts.push(s.td + ' ' + _d + 'TD' + _e);
  if (s.rec) counts.push(s.rec + ' ' + _d + 'REC' + _e);
  if (s.tkl) counts.push(s.tkl + ' ' + _d + 'TKL' + _e);
  if (s.sack) counts.push(s.sack + ' ' + _d + 'SCK' + _e);
  if (s.int) counts.push(s.int + ' ' + _d + 'INT' + _e);
  if (s.pbu) counts.push(s.pbu + ' ' + _d + 'PBU' + _e);
  // Take top 2 counting stats
  parts = parts.concat(counts.slice(0, 2));
  if (parts.length === 0) return null;
  return parts.join(' ');
}

var _cssInjected = false;
var TRAY_CSS = `
.CT-wrap{display:flex;flex-direction:column;flex-shrink:0;background:#0E0A04;border-top:2px solid #FF6B0033;position:relative;z-index:1;padding-bottom:env(safe-area-inset-bottom,0px);transition:background-color 0.3s}
.CT-wrap-def{background:#04060A}
.CT-header{display:flex;align-items:center;justify-content:center;gap:8px;padding:3px 8px 1px;flex-shrink:0}
.CT-side{font-family:'Teko';font-weight:700;font-size:18px;letter-spacing:3px}
.CT-disc-toggle{font-family:'Rajdhani';font-weight:700;font-size:10px;letter-spacing:1px;padding:10px 14px;border-radius:4px;border:1px solid #555;background:transparent;color:#aaa;cursor:pointer}
.CT-disc-toggle-used{color:#333;border-color:rgba(255,255,255,0.06);cursor:default;opacity:0.4}
.CT-disc-toggle-active{background:rgba(235,176,16,0.1);border-color:#EBB010;animation:T-pulse 1.5s infinite}
@keyframes T-snap-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
.CT-row{display:flex;gap:3px;padding:2px 3px;flex-shrink:0}
.CT-row::-webkit-scrollbar{display:none}
.CT-row-label{height:2px;margin:2px 6px;border-radius:1px;opacity:0.4;flex-shrink:0}
.CT-row-label-text{font-family:'Rajdhani';font-weight:700;font-size:9px;letter-spacing:1px;padding:0 6px;color:#555;flex-shrink:0}
.CT-card{flex:1 1 80px;min-width:80px;height:120px;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;position:relative;cursor:pointer;border:2px solid transparent;will-change:transform;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:box-shadow 0.15s}
.CT-card-disabled{opacity:0.35;pointer-events:none}
.CT-snap-bar{display:flex;gap:6px;padding:4px 8px;align-items:center;flex-shrink:0}
.CT-snap-btn{flex:1;display:flex;align-items:stretch;overflow:hidden;padding:0;border:none;border-radius:6px;background:linear-gradient(180deg,#EBB010 0%,#FF4511 100%);box-shadow:0 4px 16px rgba(255,69,17,0.3),0 0 20px rgba(235,176,16,0.15);cursor:pointer}
.CT-snap-btn:disabled{opacity:0.4;pointer-events:none;box-shadow:none}
.CT-snap-btn.CT-snap-urgent{background:linear-gradient(180deg,#e03050 0%,#8B0020 100%);box-shadow:0 4px 16px rgba(224,48,80,0.3),0 0 20px rgba(224,48,80,0.15)}
.CT-snap-aura{animation:T-aura-pulse 2s infinite;box-shadow:0 0 20px #EBB010, 0 0 40px rgba(235,176,16,0.4) !important}
@keyframes T-aura-pulse{0%,100%{box-shadow:0 0 20px #EBB010, 0 0 40px rgba(235,176,16,0.4)}50%{box-shadow:0 0 30px #fff, 0 0 60px rgba(235,176,16,0.6)}}
.CT-hot-badge{position:absolute;top:3px;right:3px;z-index:5;display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle,#FF4511 0%,#8B0020 80%);box-shadow:0 0 8px rgba(255,69,17,0.65),0 0 14px rgba(255,69,17,0.35);pointer-events:none;animation:T-hot-pulse 1.6s ease-in-out infinite}
.CT-hot-badge.CT-hot-max{background:radial-gradient(circle,#FFD060 0%,#EBB010 60%,#8B4A1F 100%);box-shadow:0 0 12px rgba(235,176,16,0.85),0 0 22px rgba(255,200,80,0.55),0 0 32px rgba(235,176,16,0.3);animation:T-hot-max-breathe 1.2s ease-in-out infinite}
@keyframes T-hot-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
@keyframes T-hot-max-breathe{0%,100%{transform:scale(1) rotate(-2deg);filter:brightness(1)}50%{transform:scale(1.18) rotate(2deg);filter:brightness(1.3)}}
.CT-snap-pressure{animation:T-snap-heartbeat 1.4s ease-in-out infinite;will-change:transform,box-shadow}
@keyframes T-snap-heartbeat{
  0%,40%,100%{transform:scale(1);box-shadow:0 4px 16px rgba(255,0,64,0.35),0 0 24px rgba(255,0,64,0.25)}
  6%{transform:scale(1.055);box-shadow:0 4px 22px rgba(255,0,64,0.7),0 0 38px rgba(255,0,64,0.5)}
  14%{transform:scale(1);box-shadow:0 4px 16px rgba(255,0,64,0.35),0 0 24px rgba(255,0,64,0.25)}
  22%{transform:scale(1.045);box-shadow:0 4px 20px rgba(255,0,64,0.6),0 0 34px rgba(255,0,64,0.4)}
  32%{transform:scale(1);box-shadow:0 4px 16px rgba(255,0,64,0.35),0 0 24px rgba(255,0,64,0.25)}
}
@keyframes chevronPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.9)}}
.CT-disc-bar{display:flex;gap:6px;padding:4px 8px;align-items:center;flex-shrink:0}
.CT-disc-confirm{flex:1;font-family:'Teko';font-weight:700;font-size:14px;letter-spacing:2px;padding:8px;border-radius:6px;border:2px solid #EBB010;background:rgba(235,176,16,0.1);color:#EBB010;cursor:pointer}
.CT-disc-cancel{font-family:'Rajdhani';font-weight:700;font-size:10px;padding:8px 12px;border-radius:6px;border:1px solid #333;background:transparent;color:#888;cursor:pointer}
.CT-torch-row{display:flex;gap:3px;padding:2px 3px;flex-shrink:0}
.CT-torch-card{flex:1 1 0;min-width:0;height:100px;border-radius:6px;overflow:hidden;cursor:pointer;position:relative}
.CT-skip-btn{flex:1 1 0;min-width:0;height:120px;border-radius:6px;border:2px solid #EBB01066;background:rgba(235,176,16,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer}
.CT-skip-label{font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:2px}
`;

function injectCSS() {
  if (_cssInjected) return;
  _cssInjected = true;
  var s = document.createElement('style');
  s.textContent = TRAY_CSS;
  document.head.appendChild(s);
}

// Track previous hand IDs for deal animation targeting
var _prevPlayIds = [];
var _prevPlayerIds = [];
export function resetCardTrayState() { _prevPlayIds = []; _prevPlayerIds = []; }
// Track which slot indices were vacated (for positional deal-in)
var _vacatedPlayIdx = -1;
var _vacatedPlayerIdx = -1;

function animateDeal(cards, startDelay, slow) {
  if (!cards.length) return;
  var stag = slow ? 0.08 : 0.04;
  gsap.set(cards, { y: -160, rotation: function() { return gsap.utils.random(-8, 8); }, scale: 0.8, opacity: 0 });
  gsap.to(cards, {
    y: 0, rotation: 0, scale: 1, opacity: 1,
    duration: slow ? 0.4 : 0.3, stagger: stag, ease: 'back.out(1.7)',
    delay: startDelay || 0,
    onStart: function() { try { SND.cardSnap(); } catch(e) {} },
    onComplete: function() {
      // Card breathing — barely-perceptible scale oscillation at staggered rates
      cards.forEach(function(c) {
        gsap.to(c, { scale: 1.015, duration: 2.5 + Math.random() * 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
    },
  });
}

function fullSlamDeal(cardEls, wrapEl, onComplete) {
  if (!cardEls.length) { if (onComplete) onComplete(); return; }
  wrapEl.style.pointerEvents = 'none';

  // Set initial state — above, invisible, face-down (back visible)
  cardEls.forEach(function(c) {
    gsap.set(c, { y: -60, opacity: 0, scale: 1.15 });
  });

  var tl = gsap.timeline({
    onComplete: function() {
      wrapEl.style.pointerEvents = '';
      // Card breathing after deal
      cardEls.forEach(function(c) {
        gsap.to(c, { scale: 1.015, duration: 2.5 + Math.random() * 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
      if (onComplete) onComplete();
    }
  });

  // Slam down with stagger
  cardEls.forEach(function(c, i) {
    tl.to(c, { y: 0, opacity: 1, scale: 1.12, duration: 0.15, ease: 'power3.in' }, i * 0.08);
    tl.to(c, { scale: 1.0, duration: 0.2, ease: 'back.out(3)' }, i * 0.08 + 0.15);
    // Sound on each card impact
    tl.call(function() { try { SND.cardSnap(); } catch(e) {} }, null, i * 0.08 + 0.15);
    // Tray shake only on first card
    if (i === 0) {
      tl.to(wrapEl, { x: 2, duration: 0.03 }, 0.15);
      tl.to(wrapEl, { x: -2, duration: 0.03 }, 0.18);
      tl.to(wrapEl, { x: 0, duration: 0.03 }, 0.21);
    }
  });

  // Hold face-down for 250ms after last card lands
  var holdStart = (cardEls.length - 1) * 0.08 + 0.35;

  // 2D flip: scaleX to 0, swap faces, scaleX back to 1
  cardEls.forEach(function(c, i) {
    var flipStart = holdStart + 0.25 + i * 0.12;
    if (!c._backEl || !c._frontEl) return;
    var backEl = c._backEl;
    var frontEl = c._frontEl;
    // Lift
    tl.to(c, { y: -8, duration: 0.1, ease: 'power2.out' }, flipStart);
    // Squish to center line
    tl.to(c, { scaleX: 0, duration: 0.12, ease: 'power2.in' }, flipStart);
    // At midpoint: swap faces
    tl.call(function() { backEl.style.display = 'none'; frontEl.style.display = ''; }, null, flipStart + 0.12);
    // Expand back out
    tl.to(c, { scaleX: 1, duration: 0.12, ease: 'power2.out' }, flipStart + 0.12);
    // Settle
    tl.to(c, { y: 0, duration: 0.15, ease: 'back.out(2)' }, flipStart + 0.24);
  });
}

function quickReplace(cardEls, onComplete) {
  if (!cardEls.length) { if (onComplete) onComplete(); return; }

  cardEls.forEach(function(c, i) {
    if (!c._backEl || !c._frontEl) {
      if (i === cardEls.length - 1 && onComplete) onComplete();
      return;
    }
    var backEl = c._backEl;
    var frontEl = c._frontEl;
    // Enter from right, face-down
    gsap.set(c, { x: 80, opacity: 0 });
    gsap.to(c, {
      x: 0, opacity: 1, duration: 0.15, ease: 'power2.out',
      delay: i * 0.1,
      onComplete: function() {
        // 2D flip: squish, swap, expand
        gsap.to(c, { scaleX: 0, duration: 0.1, ease: 'power2.in', onComplete: function() {
          backEl.style.display = 'none';
          frontEl.style.display = '';
          gsap.to(c, { scaleX: 1, duration: 0.1, ease: 'power2.out',
            onComplete: function() {
              if (i === cardEls.length - 1 && onComplete) onComplete();
            }
          });
        }});
      }
    });
  });
}

// 2D flip wrapper: back face shown first, front hidden. No 3D transforms needed.
// Both faces are position:absolute filling the container. Children scale to fit.
function wrapWithFlip(ctCard, faceEl, backType) {
  // Back face — fills container, child scales to fit
  var backWrap = document.createElement('div');
  backWrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;border-radius:4px;display:flex;align-items:center;justify-content:center;';
  var backCard = buildHomeCard(backType, 80, 120);
  // Override the fixed pixel dimensions so it fills the wrapper
  backCard.style.width = '100%';
  backCard.style.height = '100%';
  // Also override the inner card if it has fixed pixels
  var innerCard = backCard.querySelector('.torch-card-inner');
  if (innerCard) { innerCard.style.width = '100%'; innerCard.style.height = '100%'; }
  backWrap.appendChild(backCard);

  // Front face — same approach, hidden initially
  var frontWrap = document.createElement('div');
  frontWrap.style.cssText = 'position:absolute;inset:0;display:none;overflow:hidden;border-radius:4px;';
  faceEl.style.width = '100%';
  faceEl.style.height = '100%';
  frontWrap.appendChild(faceEl);

  ctCard.appendChild(backWrap);
  ctCard.appendChild(frontWrap);
  ctCard._backEl = backWrap;
  ctCard._frontEl = frontWrap;
}

function animateMark(card, idx) {
  var tiltDir = (idx || 0) % 2 === 0 ? -5 : 4;
  try {
    gsap.to(card, { rotation: tiltDir, opacity: 0.7, duration: 0.25, ease: 'back.out(1.5)' });
    // Ongoing wobble
    var wobbleTl = gsap.timeline({ repeat: -1 });
    wobbleTl.to(card, { rotation: tiltDir - 2, duration: 0.75, ease: 'sine.inOut' });
    wobbleTl.to(card, { rotation: tiltDir + 2, duration: 0.75, ease: 'sine.inOut' });
    card._wobbleTl = wobbleTl;
  } catch(e) { card.style.opacity = '0.7'; card.style.transform = 'rotate(' + tiltDir + 'deg)'; }

  card.style.borderColor = '#FF451166';
  card.style.boxShadow = '0 6px 16px rgba(255,69,17,0.2)';

  // Bottom glow pool
  var glowPool = document.createElement('div');
  glowPool.className = 'CT-discard-glow';
  glowPool.style.cssText = 'position:absolute;bottom:-4px;left:15%;right:15%;height:6px;background:radial-gradient(ellipse,rgba(255,69,17,0.3),transparent);border-radius:50%;z-index:0;pointer-events:none;';
  card.appendChild(glowPool);

  // Ember particles
  var emberColors = ['#FF8C00', '#EBB010', '#FF6600'];
  for (var e = 0; e < 3; e++) {
    var ember = document.createElement('div');
    ember.className = 'CT-discard-ember';
    var sz = 2 + Math.random() * 1.5;
    ember.style.cssText = 'position:absolute;bottom:0;left:' + (20 + Math.random() * 60) + '%;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:' + emberColors[e] + ';z-index:15;pointer-events:none;opacity:0;';
    card.appendChild(ember);
    try {
      gsap.to(ember, { opacity: 0.8, duration: 0.3, delay: 0.1 * e });
      gsap.fromTo(ember, { y: 0, opacity: 0, scale: 1 }, { y: -30, opacity: 0, scale: 0, duration: 1.3 + Math.random() * 0.5, delay: 0.3 + Math.random() * 2, repeat: -1, ease: 'power1.out' });
    } catch(e2) {}
  }
}

function animateUnmark(card) {
  // Kill wobble
  if (card._wobbleTl) { try { card._wobbleTl.kill(); } catch(e) {} card._wobbleTl = null; }
  // Remove embers and glow
  card.querySelectorAll('.CT-discard-ember, .CT-discard-glow').forEach(function(el) { el.remove(); });
  // Reset
  try { gsap.to(card, { rotation: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }); } catch(e) { card.style.opacity = '1'; card.style.transform = ''; }
  card.style.borderColor = 'transparent';
  card.style.boxShadow = '';
}

function attachTouchFeedback(card) {
  var pressed = false;
  card.addEventListener('touchstart', function() {
    pressed = true;
    Haptic.cardTap();
    try { gsap.to(card, { y: -10, scale: 1.04, duration: 0.1, ease: 'power2.out', boxShadow: '0 6px 16px rgba(0,0,0,0.4)' }); } catch(e) {}
  }, { passive: true });
  card.addEventListener('touchend', function() {
    if (pressed) { pressed = false;
      setTimeout(function() { try { if (!card._selected && !card._marked) gsap.to(card, { y: 0, scale: 1, duration: 0.15, ease: 'back.out(2)', boxShadow: '0 0px 0px rgba(0,0,0,0)' }); } catch(e) {} }, 50);
    }
  }, { passive: true });
  card.addEventListener('touchcancel', function() {
    pressed = false;
    try { gsap.to(card, { y: 0, scale: 1, duration: 0.15, ease: 'back.out(2)', boxShadow: '0 0px 0px rgba(0,0,0,0)' }); } catch(e) {}
  }, { passive: true });
}

export function renderCardTray(opts) {
  injectCSS();
  var wrap = document.createElement('div');
  wrap.className = 'CT-wrap' + (opts.isOffense === false ? ' CT-wrap-def' : '');

  if (opts.phase === 'busy') { wrap.style.display = 'none'; return wrap; }

  // ── DISCARD STATE (local to this render) ──
  var discardMode = false;
  var markedPlay = null;
  var markedPlayer = null;
  var playCardEls = [];
  var playerCardEls = [];
  var playCards = []; // parallel array of play objects
  var playerCards = []; // parallel array of player objects

  // Can discard at all?
  var canDiscAny = opts.canDiscardPlays || opts.canDiscardPlayers;

  // ── HEADER: team name + discard button ──
  var header = document.createElement('div');
  header.className = 'CT-header';
  header.style.background = 'linear-gradient(90deg,transparent,rgba(255,107,0,.06),transparent)';

  var sideLabel = document.createElement('div');
  sideLabel.className = 'CT-side';
  sideLabel.style.color = opts.team.accent || '#FF6B00';
  sideLabel.textContent = opts.team.name;
  sideLabel.style.flex = '1';
  header.appendChild(sideLabel);

  // DISCARD button
  var discToggle = document.createElement('button');
  discToggle.className = 'CT-disc-toggle' + (canDiscAny ? '' : ' CT-disc-toggle-used');
  discToggle.textContent = canDiscAny ? 'DISCARD' : 'NO DISCARDS';
  discToggle.disabled = !canDiscAny;
  if (opts.tutorialStep > 0) { discToggle.style.opacity = '0.15'; discToggle.style.pointerEvents = 'none'; }
  header.appendChild(discToggle);
  wrap.appendChild(header);

  // ── TORCH CARDS ROW (always shown in 'torch' phase — cards + SKIP) ──
  var torchPhase = opts.phase === 'torch';
  var _torchLabelEl = null, _torchRowEl = null;
  if (torchPhase) {
    var torchSlots = (opts.torchCards || []).filter(function(c) { return c.type === 'pre-snap'; }).slice(0, 3);
    var torchLabel = document.createElement('div');
    torchLabel.className = 'CT-row-label-text';
    torchLabel.style.color = '#EBB010';
    torchLabel.textContent = torchSlots.length > 0 ? 'TORCH CARD \u2014 TAP TO PLAY OR SKIP' : 'NO PLAYABLE TORCH CARDS \u2014 TAP SKIP';
    wrap.appendChild(torchLabel);
    var torchRow = document.createElement('div');
    torchRow.className = 'CT-row';
    // hand = both sides, special_teams = auto-consumed (never playable in snap phase)
    var offCats = ['amplification', 'information', 'hand'];
    var defCats = ['disruption', 'protection', 'hand'];
    var applicable = opts.isOffense ? offCats : defCats;
    var torchEls = [];
    // Show all pre-snap cards (playable or not) + reactive/ST cards greyed out
    var allCards = (opts.torchCards || []).slice(0, 3);
    for (var ti = 0; ti < 4; ti++) {
      if (ti < allCards.length) {
        var tc = allCards[ti];
        var isPreSnap = tc.type === 'pre-snap';
        var isST = tc.category === 'special_teams';
        var isApp = isPreSnap && !isST && applicable.indexOf(tc.category) >= 0;
        var c = document.createElement('div');
        c.className = 'CT-card' + (isApp ? '' : ' CT-card-disabled');
        c.style.position = 'relative';
        var tcEl = buildTorchCard(tc, null, 120);
        tcEl.style.width = '100%'; tcEl.style.height = '100%';
        c._isNew = true;
        wrapWithFlip(c, tcEl, 'torch');
        if (!isApp) {
          // Greyed out with explanation — lock overlay on the front face
          var lockText = !isPreSnap ? 'REACTIVE' : isST ? 'SPECIAL TEAMS' : (opts.isOffense ? 'DEFENSE ONLY' : 'OFFENSE ONLY');
          var lockLabel = document.createElement('div');
          lockLabel.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);border-radius:6px;z-index:3;";
          lockLabel.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#e03050;letter-spacing:2px;text-align:center;\">" + lockText + "</div>";
          c.appendChild(lockLabel);
        }
        if (isApp) {
          attachTouchFeedback(c);
          (function(card) {
            c.onclick = function() { SND.click(); if (opts.onTorchCard) opts.onTorchCard(card); };
          })(tc);
        }
        torchRow.appendChild(c);
        torchEls.push(c);
      } else {
        // SKIP slot — always present as the first empty slot after cards
        var empty = document.createElement('div');
        empty.className = 'CT-card';
        empty.style.cssText = 'border:2px dashed #554f8022;display:flex;align-items:center;justify-content:center;';
        if (ti === allCards.length) {
          empty.innerHTML = "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:10px;color:#554f80;letter-spacing:1px;\">SKIP</div>";
          empty.style.cursor = 'pointer';
          empty.onclick = function() { SND.click(); if (opts.onSkipTorch) opts.onSkipTorch(); };
        }
        torchRow.appendChild(empty);
        torchEls.push(empty);
      }
    }
    _torchLabelEl = torchLabel;
    _torchRowEl = torchRow;
    wrap.appendChild(torchRow);
  }

  // ── PLAY ROW ──
  var playLabel = document.createElement('div');
  playLabel.className = 'CT-row-label';
  playLabel.style.background = opts.isOffense !== false ? '#00ff44' : '#4DA6FF';
  if (opts.tutorialStep === 2 || opts.tutorialStep === 3) { playLabel.style.opacity = '0.1'; }
  wrap.appendChild(playLabel);

  var playRow = document.createElement('div');
  playRow.className = 'CT-row';
  var curPlayIds = (opts.plays || []).map(function(p) { return p.id; });

  (opts.plays || []).forEach(function(play, idx) {
    var isSel = opts.selectedPlay === play;
    var isNew = _prevPlayIds.indexOf(play.id) === -1;

    if (isSel) {
      // Card is on the field — show empty ghost slot
      var ghost = document.createElement('div');
      ghost.className = 'CT-card';
      ghost.style.cssText = 'border:2px dashed #00ff4433;background:rgba(0,255,68,0.03);display:flex;align-items:center;justify-content:center;';
      ghost.innerHTML = "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:8px;color:#00ff4466;letter-spacing:1px;\">ON FIELD</div>";
      if (opts.tutorialStep > 0) {
        ghost.style.opacity = '0.2';
        ghost.style.pointerEvents = 'none';
      } else {
        ghost.onclick = function() { SND.cardThud(); if (opts.onSelectPlay) opts.onSelectPlay(play); };
      }
      playRow.appendChild(ghost);
      playCardEls.push(ghost);
      playCards.push(play);
      return;
    }

    var cat = { SHORT:'SHORT',DEEP:'DEEP',RUN:'RUN',SCREEN:'SCREEN',OPTION:'OPTION',
      BLITZ:'BLITZ',ZONE:'ZONE',TRAP:'TRAP' }[play.playType||play.cardType] || 'RUN';
    var playCard = buildPlayV1({ name: play.name, playType: cat, cardType: play.cardType, isRun: play.isRun === true || play.type === 'run', desc: play.desc || play.flavor || '', risk: play.risk || 'med', cat: cat, sub: play.sub, strength: play.strength }, null, 120);
    playCard.style.width = '100%'; playCard.style.height = '100%';
    var c = document.createElement('div');
    c.className = 'CT-card';
    c._selected = false;
    c._marked = false;
    c._isNew = isNew;
    c._slotIdx = idx;
    if (isNew) {
      var backType = opts.isOffense ? 'offense' : 'defense';
      wrapWithFlip(c, playCard, backType);
    } else {
      c.appendChild(playCard);
    }

    // Smart highlight — subtle glow on situationally strong plays
    var isStrong = false;
    if (opts.isOffense && opts.down && opts.distance) {
      var pt = play.playType || '';
      if (opts.distance <= 3 && (pt === 'RUN' || pt === 'OPTION' || play.isRun)) isStrong = true;
      if (opts.distance >= 8 && (pt === 'DEEP' || pt === 'SCREEN')) isStrong = true;
      if (opts.yardsToEndzone <= 10 && pt === 'SHORT') isStrong = true;
      if (opts.yardsToEndzone <= 5 && (pt === 'RUN' || play.isRun)) isStrong = true;
    }
    if (isStrong && !opts.selectedPlay) {
      c.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4), 0 0 12px rgba(235,176,16,0.25)';
      c.style.borderColor = '#EBB01066';
    }

    // Tutorial step 1: highlight play cards, they're the active element
    if (opts.tutorialStep === 1) {
      c.style.boxShadow = '0 0 16px rgba(255,69,17,0.6), inset 0 0 8px rgba(255,69,17,0.15)';
      c.style.animation = 'T-snap-pulse 1.2s ease-in-out infinite';
      c.style.position = 'relative';
      c.style.zIndex = '1001';
    }
    // Tutorial step 2+3: dim play cards
    if (opts.tutorialStep === 2 || opts.tutorialStep === 3) {
      c.style.opacity = '0.2';
      c.style.pointerEvents = 'none';
    }

    attachTouchFeedback(c);
    c.onclick = function() {
      if (discardMode) {
        if (c._marked) { c._marked = false; markedPlay = null; animateUnmark(c); }
        else if (!markedPlay && opts.canDiscardPlays) { c._marked = true; markedPlay = play; animateMark(c, idx); }
        updateDiscBar();
        return;
      }
      SND.cardThud(); Haptic.cardSelect();
      if (opts.onSelectPlay) opts.onSelectPlay(play);
    };
    playRow.appendChild(c);
    playCardEls.push(c);
    playCards.push(play);
  });
  wrap.appendChild(playRow);

  // ── PLAYER ROW ──
  var playerLabel = document.createElement('div');
  playerLabel.className = 'CT-row-label';
  playerLabel.style.background = '#4DA6FF';
  if (opts.tutorialStep === 1 || opts.tutorialStep === 3) { playerLabel.style.opacity = '0.1'; }
  wrap.appendChild(playerLabel);

  var playerRow = document.createElement('div');
  playerRow.className = 'CT-row';
  var curPlayerIds = (opts.players || []).map(function(p) { return p.id; });

  (opts.players || []).forEach(function(p, idx) {
    var isSel = opts.selectedPlayer === p;
    var isNew = _prevPlayerIds.indexOf(p.id) === -1;

    if (isSel) {
      var ghost = document.createElement('div');
      ghost.className = 'CT-card';
      ghost.style.cssText = 'border:2px dashed #00ff4433;background:rgba(0,255,68,0.03);display:flex;align-items:center;justify-content:center;';
      ghost.innerHTML = "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:8px;color:#00ff4466;letter-spacing:1px;\">ON FIELD</div>";
      ghost.onclick = function() { SND.cardThud(); if (opts.onSelectPlayer) opts.onSelectPlayer(p); };
      playerRow.appendChild(ghost);
      playerCardEls.push(ghost);
      playerCards.push(p);
      return;
    }

    var isHot = (opts.isOffense && opts.offStar && p.id === opts.offStar.id && opts.offStarHot) ||
                (!opts.isOffense && opts.defStar && p.id === opts.defStar.id && opts.defStarHot);
    var playerCard = buildMaddenPlayer({ name: p.name, pos: p.pos, ovr: p.ovr, num: p.num || '', badge: p.badge, isStar: p.isStar, ability: p.ability || '', stars: p.stars, trait: p.trait, teamColor: opts.team.colors ? opts.team.colors.primary : (opts.team.accent || '#FF4511'), teamId: opts.teamId }, null, 120, isHot);
    playerCard.style.width = '100%'; playerCard.style.height = '100%';
    var c = document.createElement('div');
    c.className = 'CT-card';
    c._selected = false;
    c._marked = false;
    c._isNew = isNew;
    c._slotIdx = idx;
    if (isHot) { c.style.borderColor = '#FF4511'; c.style.boxShadow = '0 0 12px rgba(255,69,17,0.5)'; }
    // Tutorial step 1: dim player cards so only play cards glow
    if (opts.tutorialStep === 1) {
      c.style.opacity = '0.2';
      c.style.pointerEvents = 'none';
    }
    if (isNew) {
      var backType = opts.isOffense ? 'offense' : 'defense';
      wrapWithFlip(c, playerCard, backType);
    } else {
      c.appendChild(playerCard);
    }
    // Per-player game stats — render into the card's built-in stats bar
    var pStats = (opts.playerGameStats && p.id) ? opts.playerGameStats[p.id] : null;
    if (pStats) {
      var statParts = formatPlayerStats(pStats);
      if (statParts) {
        var statsBarEl = playerCard.querySelector('.player-stats-bar');
        if (statsBarEl) {
          statsBarEl.innerHTML = "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:10px;color:#fff;text-align:center;letter-spacing:0.3px;white-space:nowrap;line-height:1;\">" + statParts + "</div>";
        }
      }
    }
    var momentum = (opts.momentumMap && p.id) ? (opts.momentumMap[p.id] || 0) : 0;
    if (momentum >= 3) {
      var hotBadge = document.createElement('div');
      hotBadge.className = 'CT-hot-badge' + (momentum >= 5 ? ' CT-hot-max' : '');
      var iconColor = momentum >= 5 ? '#fff' : '#fff';
      var hotIcon = renderTorchCardIcon('onFire', 14, iconColor);
      if (hotIcon) hotBadge.appendChild(hotIcon);
      c.style.position = 'relative';
      c.appendChild(hotBadge);
    }
    // Heat/fatigue indicator
    var heat = (opts.heatMap && p.id) ? (opts.heatMap[p.id] || 0) : 0;
    if (heat >= 3 && opts.snapCount > 3) {
      var dimAmount = Math.min(0.4, (heat - 2) * 0.1);
      c.style.filter = 'brightness(' + (1 - dimAmount) + ')';
      var heatBadge = document.createElement('div');
      heatBadge.style.cssText = 'position:absolute;bottom:2px;left:2px;z-index:4;padding:1px 3px;border-radius:2px;' +
        'background:' + (heat >= 5 ? 'rgba(255,0,64,0.7)' : 'rgba(255,140,0,0.5)') + ';' +
        "font-family:'Rajdhani';font-weight:700;font-size:8px;color:#fff;letter-spacing:0.5px;";
      heatBadge.textContent = heat >= 5 ? 'TIRED' : 'WARM';
      c.style.position = 'relative';
      c.appendChild(heatBadge);
    }
    // Tutorial step 2: highlight player cards, they're the active element
    if (opts.tutorialStep === 2) {
      c.style.boxShadow = '0 0 16px rgba(77,166,255,0.6), inset 0 0 8px rgba(77,166,255,0.15)';
      c.style.animation = 'T-snap-pulse 1.2s ease-in-out infinite';
      c.style.position = 'relative';
      c.style.zIndex = '1001';
    }
    // Tutorial step 3: dim player cards
    if (opts.tutorialStep === 3) {
      c.style.opacity = '0.2';
      c.style.pointerEvents = 'none';
    }
    attachTouchFeedback(c);
    c.onclick = function() {
      if (discardMode) {
        if (c._marked) { c._marked = false; markedPlayer = null; animateUnmark(c); }
        else if (!markedPlayer && opts.canDiscardPlayers) { c._marked = true; markedPlayer = p; animateMark(c, idx); }
        updateDiscBar();
        return;
      }
      if (p.injured) return;
      SND.cardThud(); Haptic.cardSelect();
      if (opts.onSelectPlayer) opts.onSelectPlayer(p);
    };
    playerRow.appendChild(c);
    playerCardEls.push(c);
    playerCards.push(p);
  });
  wrap.appendChild(playerRow);

  // Deal new cards into their slots
  // During tutorial, only animate the active row — dimmed cards skip the deal animation
  requestAnimationFrame(function() {
    var newPlays = playCardEls.filter(function(c) { return c._isNew; });
    var newPlayers = playerCardEls.filter(function(c) { return c._isNew; });
    var newTorch = torchPhase ? torchEls.filter(function(c) { return c._isNew; }) : [];
    var isFullDeal = (newPlays.length >= 4 && newPlayers.length >= 4) || opts.isNewDrive;
    var dimPlays = opts.tutorialStep === 2 || opts.tutorialStep === 3;
    var dimPlayers = opts.tutorialStep === 1 || opts.tutorialStep === 3;
    var allNewCards = [];

    if (isFullDeal) {
      // Mode 1: Full Slam Deal — card backs slam down, hold, then flip
      if (!dimPlays) allNewCards = allNewCards.concat(newPlays);
      if (!dimPlayers) allNewCards = allNewCards.concat(newPlayers);
      allNewCards = allNewCards.concat(newTorch);
      fullSlamDeal(allNewCards, wrap, opts.onDealComplete || null);
    } else {
      // Mode 2: Quick Replacement — only new cards slide in and flip
      var replacements = [];
      if (newPlays.length > 0 && !dimPlays) replacements = replacements.concat(newPlays);
      if (newPlayers.length > 0 && !dimPlayers) replacements = replacements.concat(newPlayers);
      replacements = replacements.concat(newTorch);
      if (replacements.length > 0) {
        quickReplace(replacements, opts.onDealComplete || null);
      } else {
        if (opts.onDealComplete) opts.onDealComplete();
      }
    }
  });
  _prevPlayIds = curPlayIds;
  _prevPlayerIds = curPlayerIds;

  // ── DISCARD BANNER (shown at top when in discard mode) ──
  var discBanner = document.createElement('div');
  discBanner.style.cssText = "display:none;align-items:center;padding:8px 12px;background:linear-gradient(90deg,#FF451110,transparent 40%);border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;";
  // Small torch-red flame at 13×13 (square); was 10×13 rectangular.
  // Silhouette in #FF4511 to match the banner color theme.
  discBanner.innerHTML =
    '<span style="display:inline-flex;opacity:0.6;margin-right:8px;flex-shrink:0;">' +
      flameSilhouetteSVG(13, '#FF4511') +
    '</span>' +
    "<div style=\"font-family:'Oswald';font-weight:700;font-size:10px;color:#FF4511;letter-spacing:3px;flex:1;\">DISCARD</div>" +
    "<div id='disc-hint' style=\"font-family:'Rajdhani';font-weight:600;font-size:9px;color:#888;\">Tap to mark</div>";
  wrap.insertBefore(discBanner, wrap.firstChild.nextSibling); // After header

  // ── DISCARD BAR (confirm/cancel, shown at bottom when in discard mode) ──
  var discBar = document.createElement('div');
  discBar.style.cssText = 'display:none;flex-wrap:nowrap;gap:6px;padding:6px 8px 10px;flex-shrink:0;';

  var discCancel = document.createElement('button');
  discCancel.style.cssText = "flex:1;padding:10px;border-radius:6px;border:1px solid #33333366;text-align:center;cursor:pointer;background:transparent;font-family:'Teko';font-weight:700;font-size:14px;color:#888;letter-spacing:2px;";
  discCancel.textContent = 'CANCEL';
  discCancel.onclick = function() {
    discardMode = false;
    markedPlay = null; markedPlayer = null;
    playCardEls.forEach(function(c) { if (c._marked) { c._marked = false; animateUnmark(c); } });
    playerCardEls.forEach(function(c) { if (c._marked) { c._marked = false; animateUnmark(c); } });
    discBar.style.display = 'none';
    discBanner.style.display = 'none';
    snapBar.style.display = '';
    if (_torchLabelEl) _torchLabelEl.style.display = '';
    if (_torchRowEl) _torchRowEl.style.display = '';
    discToggle.className = 'CT-disc-toggle';
    discToggle.textContent = 'DISCARD';
  };

  var discConfirm = document.createElement('button');
  discConfirm.style.cssText = "flex:1;padding:10px;border-radius:6px;text-align:center;cursor:pointer;border:none;background:linear-gradient(180deg,#FF4511,#FF451188);box-shadow:0 4px 12px rgba(255,69,17,0.3);";
  discConfirm.innerHTML = "<div style=\"display:flex;align-items:center;justify-content:center;gap:6px;\">" + flameSilhouetteSVG(13, '#fff') + "<span style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#fff;letter-spacing:2px;\">BURN 0</span></div>";
  discConfirm.onclick = function() {
    var markedEls = [];
    var markedObjs = [];
    if (markedPlay) {
      var playIdx = playCards.indexOf(markedPlay);
      if (playIdx >= 0 && playCardEls[playIdx]) markedEls.push(playCardEls[playIdx]);
      markedObjs.push({ type: 'play', obj: markedPlay });
    }
    if (markedPlayer) {
      var playerIdx = playerCards.indexOf(markedPlayer);
      if (playerIdx >= 0 && playerCardEls[playerIdx]) markedEls.push(playerCardEls[playerIdx]);
      markedObjs.push({ type: 'player', obj: markedPlayer });
    }
    if (markedEls.length === 0) return;

    // Flick-off animation
    var delay = 0;
    markedEls.forEach(function(card, i) {
      if (card._wobbleTl) { try { card._wobbleTl.kill(); } catch(e) {} }
      card.querySelectorAll('.CT-discard-ember, .CT-discard-glow').forEach(function(el) { el.remove(); });
      var flickX = i % 2 === 0 ? -400 : 400;
      var flickRot = i % 2 === 0 ? -30 : 30;
      try {
        gsap.to(card, {
          x: flickX, rotation: flickRot, opacity: 0, duration: 0.3, delay: delay, ease: 'power3.in',
          onStart: function() { try { SND.cardFlick(); } catch(e) {} },
        });
      } catch(e) { card.style.display = 'none'; }
      delay += 0.12;
    });

    // After flick-off, trigger the actual discard callbacks
    var totalTime = (delay + 0.3) * 1000 + 100;
    setTimeout(function() {
      if (markedPlay && opts.canDiscardPlays && opts.onDiscardPlays) opts.onDiscardPlays([markedPlay]);
      if (markedPlayer && opts.canDiscardPlayers && opts.onDiscardPlayers) opts.onDiscardPlayers([markedPlayer]);
      Haptic.cardDiscard();
    }, totalTime);
  };

  discBar.appendChild(discCancel);
  discBar.appendChild(discConfirm);
  wrap.appendChild(discBar);

  function updateDiscBar() {
    var count = (markedPlay ? 1 : 0) + (markedPlayer ? 1 : 0);
    var burnSpan = discConfirm.querySelector('span');
    if (burnSpan) burnSpan.textContent = 'BURN ' + count;
    discConfirm.style.opacity = count > 0 ? '1' : '0.4';
    discConfirm.style.pointerEvents = count > 0 ? 'auto' : 'none';
    // Update banner hint
    var hint = discBanner.querySelector('#disc-hint');
    var remaining = (opts.canDiscardPlays ? 1 : 0) + (opts.canDiscardPlayers ? 1 : 0) - count;
    if (hint) hint.textContent = count > 0 ? remaining + ' remaining' : 'Tap to mark';
    discConfirm.disabled = count === 0;
    discConfirm.style.opacity = count > 0 ? '1' : '0.4';
  }

  // ── SNAP BAR ──
  var snapBar = document.createElement('div');
  snapBar.className = 'CT-snap-bar';
  var snapBtn = document.createElement('button');
  snapBtn.className = 'CT-snap-btn' + (opts.is2Min ? ' CT-snap-urgent' : '') + (opts.is4thDownGo ? ' CT-snap-aura' : '') + (opts.pressureBeat ? ' CT-snap-pressure' : '');
  // Flame badge left + text right — white silhouette on the SNAP button,
  // matches the buildFlameBadgeButton treatment in brand.js.
  var snapBadge = document.createElement('div');
  snapBadge.style.cssText = 'background:rgba(0,0,0,0.2);padding:12px 14px;display:flex;align-items:center;justify-content:center;border-right:1px solid rgba(0,0,0,0.15);';
  snapBadge.innerHTML = flameSilhouetteSVG(24, '#fff');
  var snapText = document.createElement('div');
  snapText.style.cssText = "flex:1;padding:14px;font-family:'Teko';font-weight:700;font-size:24px;color:#fff;letter-spacing:8px;text-align:center;text-shadow:0 2px 4px rgba(0,0,0,0.3);line-height:1;";
  snapText.textContent = opts.isConversion ? 'ATTEMPT' : 'SNAP';
  snapBtn.appendChild(snapBadge);
  snapBtn.appendChild(snapText);
  var canSnap = opts.selectedPlay && opts.selectedPlayer && opts.phase !== 'torch';
  snapBtn.disabled = !canSnap;
  if (canSnap) {
    // Ready flare — brief bright glow when snap becomes available
    snapBtn.style.transition = 'box-shadow 0.4s';
    snapBtn.style.boxShadow = '0 0 30px rgba(235,176,16,0.5), 0 4px 20px rgba(255,69,17,0.4)';
    setTimeout(function() { snapBtn.style.transition = ''; snapBtn.style.boxShadow = ''; }, 500);
  }
  // Tutorial: block snap on steps 1 and 2, highlight on step 3
  if (opts.tutorialStep === 1 || opts.tutorialStep === 2) {
    snapBtn.disabled = true;
    snapBtn.style.opacity = '0.15';
    snapBtn.style.pointerEvents = 'none';
  } else if (opts.tutorialStep === 3 && canSnap) {
    snapBtn.style.boxShadow = '0 0 20px rgba(0,255,68,0.6), 0 0 6px rgba(0,255,68,0.4)';
    snapBtn.style.position = 'relative';
    snapBtn.style.zIndex = '1001';
  }
  snapBtn.onclick = function() { if (!canSnap) return; SND.snap(); if (opts.onSnap) opts.onSnap(); };
  // Tap feedback
  snapBtn.addEventListener('touchstart', function() {
    if (snapBtn.disabled) return;
    gsap.to(snapBtn, { scale: 0.97, duration: 0.08 });
    snapBtn.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.3)';
  }, { passive: true });
  snapBtn.addEventListener('touchend', function() {
    if (snapBtn.disabled) return;
    gsap.to(snapBtn, { scale: 1, duration: 0.15, ease: 'back.out(2)' });
    snapBtn.style.boxShadow = '';
  }, { passive: true });
  snapBtn.addEventListener('touchcancel', function() {
    gsap.to(snapBtn, { scale: 1, duration: 0.15 });
    snapBtn.style.boxShadow = '';
  }, { passive: true });
  snapBar.appendChild(snapBtn);

  // PLAY-BY-PLAY toggle button
  if (opts.onTogglePBP) {
    var pbpBtn = document.createElement('button');
    var _teamCol = opts.team && opts.team.accent ? opts.team.accent : '#FF4511';
    pbpBtn.style.cssText = "font-family:'Teko';font-weight:700;font-size:12px;letter-spacing:2px;padding:6px 12px;border-radius:4px;border:1px solid " + _teamCol + "66;background:transparent;color:" + _teamCol + ";cursor:pointer;white-space:nowrap;";
    pbpBtn.textContent = 'PLAY-BY-PLAY';
    pbpBtn.onclick = function() { SND.click(); if (opts.onTogglePBP) opts.onTogglePBP(); };
    snapBar.appendChild(pbpBtn);
  }

  wrap.appendChild(snapBar);

  // ── DISCARD TOGGLE HANDLER ──
  discToggle.onclick = function() {
    if (!canDiscAny) return;
    discardMode = !discardMode;
    if (discardMode) {
      discToggle.className = 'CT-disc-toggle CT-disc-toggle-active';
      discToggle.textContent = 'MARKING...';
      snapBar.style.display = 'none';
      discBar.style.display = 'flex';
      discBanner.style.display = 'flex';
      if (_torchLabelEl) _torchLabelEl.style.display = 'none';
      if (_torchRowEl) _torchRowEl.style.display = 'none';
      updateDiscBar();
    } else {
      discCancel.onclick();
    }
  };

  // ── SPIKE/KNEEL ──
  if (opts.is2Min && opts.isOffense) {
    var clockBtns = document.createElement('div');
    clockBtns.style.cssText = 'display:flex;gap:6px;padding:4px 8px;flex-shrink:0;';
    var spk = document.createElement('button');
    spk.className = 'T-2btn T-spike'; spk.textContent = 'SPIKE'; spk.style.flex = '1';
    spk.onclick = function() { if (opts.onSpike) opts.onSpike(); };
    clockBtns.appendChild(spk);
    if (opts.onKneel) {
      var kn = document.createElement('button');
      kn.className = 'T-2btn T-kneel'; kn.textContent = 'KNEEL'; kn.style.flex = '1';
      kn.onclick = function() { opts.onKneel(); };
      clockBtns.appendChild(kn);
    }
    wrap.appendChild(clockBtns);
  }

  return wrap;
}
