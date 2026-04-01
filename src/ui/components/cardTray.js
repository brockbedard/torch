/**
 * TORCH — Card Tray Component
 * 8-card simultaneous layout: 4 play cards (top) + 4 player cards (bottom).
 * All card animations use GSAP. Discard button next to team name.
 */

import { gsap } from 'gsap';
import { buildPlayV1, buildMaddenPlayer, buildTorchCard } from './cards.js';
import { SND } from '../../engine/sound.js';
import { Haptic } from '../../engine/haptics.js';

var _cssInjected = false;
var TRAY_CSS = `
.CT-wrap{display:flex;flex-direction:column;flex-shrink:0;background:#0E0A04;border-top:2px solid #FF6B0033;position:relative;z-index:1;padding-bottom:env(safe-area-inset-bottom,0px);overflow-y:auto;-webkit-overflow-scrolling:touch}
.CT-header{display:flex;align-items:center;justify-content:center;gap:8px;padding:3px 8px 1px;flex-shrink:0}
.CT-side{font-family:'Teko';font-weight:700;font-size:18px;letter-spacing:3px}
.CT-disc-toggle{font-family:'Rajdhani';font-weight:700;font-size:10px;letter-spacing:1px;padding:5px 10px;border-radius:3px;border:1px solid #555;background:transparent;color:#aaa;cursor:pointer}
.CT-disc-toggle-used{color:#333;border-color:#1a1a1a;cursor:default;opacity:0.4}
.CT-disc-toggle-active{background:rgba(235,176,16,0.1);border-color:#EBB010;animation:T-pulse 1.5s infinite}
@keyframes T-snap-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
.CT-row{display:flex;gap:3px;padding:2px 3px;flex-shrink:0;overflow-x:auto;-webkit-overflow-scrolling:touch}
.CT-row::-webkit-scrollbar{display:none}
.CT-row-label{font-family:'Rajdhani';font-weight:700;font-size:9px;letter-spacing:1px;padding:0 6px;color:#555;flex-shrink:0}
.CT-card{flex:1 1 80px;min-width:80px;height:120px;border-radius:6px;overflow:hidden;display:flex;flex-direction:column;position:relative;cursor:pointer;border:2px solid transparent;will-change:transform}
.CT-card-disabled{opacity:0.35;pointer-events:none}
.CT-snap-bar{display:flex;gap:6px;padding:4px 8px;align-items:center;flex-shrink:0}
.CT-snap-btn{flex:1;font-family:'Teko';font-weight:700;font-size:16px;letter-spacing:3px;padding:10px;border-radius:6px;border:2px solid #FF4511;background:linear-gradient(180deg,#EBB010,#FF4511);color:#000;cursor:pointer}
.CT-snap-btn:disabled{opacity:0.3;cursor:not-allowed}
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
  });
}

function animateMark(card) {
  gsap.to(card, { y: 6, rotation: -3, opacity: 0.55, duration: 0.15, ease: 'power2.out' });
  card.style.borderColor = '#e03050';
  var lbl = document.createElement('div');
  lbl.className = 'CT-discard-lbl';
  lbl.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(224,48,80,0.55);border-radius:4px;z-index:10;pointer-events:none;";
  lbl.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#fff;letter-spacing:2px;text-shadow:0 1px 4px rgba(0,0,0,0.8);\">DISCARD</div>";
  card.appendChild(lbl);
}

function animateUnmark(card) {
  gsap.to(card, { y: 0, rotation: 0, opacity: 1, duration: 0.15, ease: 'power2.out' });
  card.style.borderColor = 'transparent';
  var lbl = card.querySelector('.CT-discard-lbl');
  if (lbl) lbl.remove();
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
  wrap.className = 'CT-wrap';

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
  sideLabel.textContent = opts.team.name + (opts.isOffense ? ' OFFENSE' : ' DEFENSE');
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

  // First-time discard discovery — disabled, will revisit
  var _discardTipShown = true;
  if (false) {
    localStorage.setItem('torch_discard_tip', '1');

    var discTip = document.createElement('div');
    discTip.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;margin:0 6px 4px;background:rgba(10,8,4,0.95);border:1px solid #EBB01044;border-radius:6px;";
    var discTipText = document.createElement('div');
    discTipText.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:#EBB010;letter-spacing:2px;line-height:1.2;\">DON'T LIKE YOUR CARDS?</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:12px;color:#999;line-height:1.3;\">Tap DISCARD to swap out 1 play + 1 player per drive</div>";
    discTip.appendChild(discTipText);
    var discTipBtn = document.createElement('button');
    discTipBtn.style.cssText = "font-family:'Teko';font-weight:700;font-size:11px;color:#EBB010;background:transparent;border:1px solid #EBB01044;border-radius:4px;padding:3px 8px;cursor:pointer;white-space:nowrap;letter-spacing:1px;";
    discTipBtn.textContent = 'GOT IT';
    discTipBtn.onclick = function() {
      try { gsap.to(discTip, { opacity: 0, height: 0, marginBottom: 0, padding: 0, duration: 0.3, ease: 'power2.in', onComplete: function() { discTip.remove(); } }); }
      catch(e) { discTip.remove(); }
    };
    discTip.appendChild(discTipBtn);
    wrap.insertBefore(discTip, wrap.firstChild);

    // Auto-dismiss after 10 seconds
    setTimeout(function() {
      if (discTip.parentNode) {
        try { gsap.to(discTip, { opacity: 0, height: 0, marginBottom: 0, padding: 0, duration: 0.3, ease: 'power2.in', onComplete: function() { discTip.remove(); } }); }
        catch(e) { discTip.remove(); }
      }
    }, 10000);
  }

  // ── TORCH CARDS ROW (always shown in 'torch' phase — cards + SKIP) ──
  var torchPhase = opts.phase === 'torch';
  var _torchLabelEl = null, _torchRowEl = null;
  if (torchPhase) {
    var torchSlots = (opts.torchCards || []).filter(function(c) { return c.type === 'pre-snap'; }).slice(0, 3);
    var torchLabel = document.createElement('div');
    torchLabel.className = 'CT-row-label';
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
        c.appendChild(tcEl);
        if (isApp) {
          attachTouchFeedback(c);
          (function(card) {
            c.onclick = function() { SND.click(); if (opts.onTorchCard) opts.onTorchCard(card); };
          })(tc);
        } else {
          // Greyed out with explanation
          var lockText = !isPreSnap ? 'REACTIVE' : isST ? 'SPECIAL TEAMS' : (opts.isOffense ? 'DEFENSE ONLY' : 'OFFENSE ONLY');
          var lockLabel = document.createElement('div');
          lockLabel.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);border-radius:6px;z-index:3;";
          lockLabel.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#e03050;letter-spacing:2px;text-align:center;\">" + lockText + "</div>";
          c.appendChild(lockLabel);
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
  playLabel.textContent = 'PLAYS';
  if (opts.tutorialStep === 2 || opts.tutorialStep === 3) { playLabel.style.opacity = '0.2'; }
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
        ghost.onclick = function() { SND.select(); if (opts.onSelectPlay) opts.onSelectPlay(play); };
      }
      playRow.appendChild(ghost);
      playCardEls.push(ghost);
      playCards.push(play);
      return;
    }

    var cat = { SHORT:'SHORT',QUICK:'QUICK',DEEP:'DEEP',RUN:'RUN',SCREEN:'SCREEN',OPTION:'OPTION',
      BLITZ:'BLITZ',ZONE:'ZONE',PRESSURE:'PRESSURE',HYBRID:'HYBRID' }[play.playType||play.cardType] || 'RUN';
    var playCard = buildPlayV1({ name: play.name, playType: cat, isRun: play.isRun === true || play.type === 'run', desc: play.desc || play.flavor || '', risk: play.risk || 'med', cat: cat }, null, 120);
    playCard.style.width = '100%'; playCard.style.height = '100%';
    var c = document.createElement('div');
    c.className = 'CT-card';
    c._selected = false;
    c._marked = false;
    c._isNew = isNew;
    c._slotIdx = idx;
    c.appendChild(playCard);

    // Smart highlight — subtle glow on situationally strong plays
    var isStrong = false;
    if (opts.isOffense && opts.down && opts.distance) {
      var pt = play.playType || '';
      if (opts.distance <= 3 && (pt === 'RUN' || pt === 'OPTION' || play.isRun)) isStrong = true;
      if (opts.distance >= 8 && (pt === 'DEEP' || pt === 'SCREEN')) isStrong = true;
      if (opts.yardsToEndzone <= 10 && (pt === 'QUICK' || pt === 'SHORT')) isStrong = true;
      if (opts.yardsToEndzone <= 5 && (pt === 'RUN' || play.isRun)) isStrong = true;
    }
    if (isStrong && !opts.selectedPlay) {
      c.style.boxShadow = '0 0 10px rgba(235,176,16,0.35), 0 0 3px rgba(235,176,16,0.2)';
      c.style.borderColor = '#EBB01066';
      // Add subtle "STRONG" label
      var strongLabel = document.createElement('div');
      strongLabel.style.cssText = "position:absolute;bottom:18px;left:3px;z-index:5;font-family:'Rajdhani';font-weight:700;font-size:7px;color:#000;letter-spacing:0.5px;background:#EBB010;padding:1px 4px;border-radius:2px;";
      strongLabel.textContent = 'STRONG';
      c.style.position = 'relative';
      c.appendChild(strongLabel);
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
        else if (!markedPlay && opts.canDiscardPlays) { c._marked = true; markedPlay = play; animateMark(c); }
        updateDiscBar();
        return;
      }
      SND.select(); Haptic.cardSelect();
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
  playerLabel.textContent = 'PLAYERS';
  if (opts.tutorialStep === 1 || opts.tutorialStep === 3) { playerLabel.style.opacity = '0.2'; }
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
      ghost.onclick = function() { SND.select(); if (opts.onSelectPlayer) opts.onSelectPlayer(p); };
      playerRow.appendChild(ghost);
      playerCardEls.push(ghost);
      playerCards.push(p);
      return;
    }

    var isHot = (opts.isOffense && opts.offStar && p.id === opts.offStar.id && opts.offStarHot) ||
                (!opts.isOffense && opts.defStar && p.id === opts.defStar.id && opts.defStarHot);
    var playerCard = buildMaddenPlayer({ name: p.name, pos: p.pos, ovr: p.ovr, num: p.num || '', badge: p.badge, isStar: p.isStar, ability: p.ability || '', stars: p.stars, trait: p.trait, teamColor: opts.team.colors ? opts.team.colors.primary : (opts.team.accent || '#FF4511'), teamId: opts.teamId }, null, 120);
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
    c.appendChild(playerCard);
    // Per-player game stats at bottom of card
    var pStats = (opts.playerGameStats && p.id) ? opts.playerGameStats[p.id] : null;
    if (pStats) {
      var statParts = [];
      if (pStats.passComp || pStats.passAtt) statParts.push((pStats.passComp || 0) + '/' + (pStats.passAtt || 0) + ', ' + (pStats.passYds || 0) + 'y');
      if (pStats.rec) statParts.push(pStats.rec + 'rec ' + (pStats.recYds || 0) + 'y');
      if (pStats.rushAtt) statParts.push(pStats.rushAtt + 'car ' + (pStats.rushYds || 0) + 'y');
      if (pStats.td) statParts.push(pStats.td + 'TD');
      if (pStats.tkl) statParts.push(pStats.tkl + 'tkl');
      if (pStats.sack) statParts.push(pStats.sack + 'sck');
      if (pStats.int) statParts.push(pStats.int + 'INT');
      if (pStats.pbu) statParts.push(pStats.pbu + 'PBU');
      if (statParts.length > 0) {
        c.style.position = 'relative';
        var _tc = opts.team && opts.team.accent ? opts.team.accent : '#EBB010';
        var statBar = document.createElement('div');
        statBar.style.cssText = "position:absolute;bottom:0;left:0;right:0;z-index:5;background:linear-gradient(180deg,transparent," + _tc + "18);border-top:1px solid " + _tc + "33;padding:3px 4px 2px;border-radius:0 0 6px 6px;";
        var statText = document.createElement('div');
        statText.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:8px;color:" + _tc + ";text-align:center;letter-spacing:0.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 0 4px " + _tc + "40;";
        statText.textContent = statParts.join(' \u00b7 ');
        statBar.appendChild(statText);
        c.appendChild(statBar);
      }
    }
    var momentum = (opts.momentumMap && p.id) ? (opts.momentumMap[p.id] || 0) : 0;
    if (momentum >= 3) {
      var pipWrap = document.createElement('div');
      pipWrap.style.cssText = 'position:absolute;top:2px;right:2px;display:flex;gap:1px;z-index:4;';
      for (var mi = 0; mi < momentum; mi++) {
        var pip = document.createElement('div');
        pip.style.cssText = 'width:4px;height:4px;border-radius:50%;background:' + (mi >= 4 ? '#e03050' : mi >= 3 ? '#EBB010' : '#555') + ';';
        pipWrap.appendChild(pip);
      }
      c.style.position = 'relative';
      c.appendChild(pipWrap);
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
        else if (!markedPlayer && opts.canDiscardPlayers) { c._marked = true; markedPlayer = p; animateMark(c); }
        updateDiscBar();
        return;
      }
      if (p.injured) return;
      SND.select(); Haptic.cardSelect();
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
    var isFullDeal = newPlays.length >= 4 && newPlayers.length >= 4;
    var dimPlays = opts.tutorialStep === 2 || opts.tutorialStep === 3;
    var dimPlayers = opts.tutorialStep === 1 || opts.tutorialStep === 3;
    if (newPlays.length > 0 && !dimPlays) animateDeal(newPlays, 0, isFullDeal);
    if (newPlayers.length > 0 && !dimPlayers) animateDeal(newPlayers, newPlays.length > 0 && !dimPlays ? (isFullDeal ? 0.4 : 0.15) : 0, isFullDeal);
  });
  _prevPlayIds = curPlayIds;
  _prevPlayerIds = curPlayerIds;

  // ── DISCARD BAR (hidden, shown when in discard mode) ──
  var discBar = document.createElement('div');
  discBar.className = 'CT-disc-bar';
  discBar.style.display = 'none';

  var discConfirm = document.createElement('button');
  discConfirm.className = 'CT-disc-confirm';
  discConfirm.textContent = 'CONFIRM DISCARD';
  discConfirm.onclick = function() {
    var removed = [];
    if (markedPlay && opts.canDiscardPlays && opts.onDiscardPlays) {
      opts.onDiscardPlays([markedPlay]);
      removed.push('play');
    }
    if (markedPlayer && opts.canDiscardPlayers && opts.onDiscardPlayers) {
      opts.onDiscardPlayers([markedPlayer]);
      removed.push('player');
    }
    if (removed.length > 0) Haptic.cardDiscard();
    // Exit discard mode (panel will re-render via callbacks)
  };
  discBar.appendChild(discConfirm);

  var discCancel = document.createElement('button');
  discCancel.className = 'CT-disc-cancel';
  discCancel.textContent = 'CANCEL';
  discCancel.onclick = function() {
    discardMode = false;
    markedPlay = null; markedPlayer = null;
    playCardEls.forEach(function(c) { if (c._marked) { c._marked = false; animateUnmark(c); } });
    playerCardEls.forEach(function(c) { if (c._marked) { c._marked = false; animateUnmark(c); } });
    discBar.style.display = 'none';
    snapBar.style.display = '';
    if (_torchLabelEl) _torchLabelEl.style.display = '';
    if (_torchRowEl) _torchRowEl.style.display = '';
    discToggle.className = 'CT-disc-toggle';
    discToggle.textContent = 'DISCARD';
  };
  discBar.appendChild(discCancel);
  wrap.appendChild(discBar);

  function updateDiscBar() {
    var count = (markedPlay ? 1 : 0) + (markedPlayer ? 1 : 0);
    discConfirm.textContent = count > 0 ? 'DISCARD ' + count + ' CARD' + (count > 1 ? 'S' : '') : 'SELECT CARDS TO DISCARD';
    discConfirm.disabled = count === 0;
    discConfirm.style.opacity = count > 0 ? '1' : '0.4';
  }

  // ── SNAP BAR ──
  var snapBar = document.createElement('div');
  snapBar.className = 'CT-snap-bar';
  var snapBtn = document.createElement('button');
  snapBtn.className = 'CT-snap-btn';
  snapBtn.textContent = opts.isConversion ? 'ATTEMPT' : 'SNAP';
  var canSnap = opts.selectedPlay && opts.selectedPlayer && opts.phase !== 'torch';
  snapBtn.disabled = !canSnap;
  snapBtn.style.opacity = canSnap ? '1' : '0.3';
  if (canSnap) snapBtn.style.animation = 'T-snap-pulse 1.2s ease-in-out infinite';
  // Tutorial: block snap on steps 1 and 2, highlight on step 3
  if (opts.tutorialStep === 1 || opts.tutorialStep === 2) {
    snapBtn.disabled = true;
    snapBtn.style.opacity = '0.15';
    snapBtn.style.animation = '';
    snapBtn.style.pointerEvents = 'none';
  } else if (opts.tutorialStep === 3 && canSnap) {
    snapBtn.style.boxShadow = '0 0 20px rgba(0,255,68,0.6), 0 0 6px rgba(0,255,68,0.4)';
    snapBtn.style.borderColor = '#00ff44';
    snapBtn.style.padding = '16px';
    snapBtn.style.fontSize = '20px';
    snapBtn.style.minHeight = '52px';
    snapBtn.style.position = 'relative';
    snapBtn.style.zIndex = '1001';
    snapBtn.style.animation = 'T-snap-pulse 1.2s ease-in-out infinite';
  }
  snapBtn.onclick = function() { if (!canSnap) return; SND.snap(); if (opts.onSnap) opts.onSnap(); };
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
      discBar.style.display = '';
      if (_torchLabelEl) _torchLabelEl.style.display = 'none';
      if (_torchRowEl) _torchRowEl.style.display = 'none';
      updateDiscBar();
    } else {
      // Cancel
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
