/**
 * TORCH — Personnel Onboarding Tooltips
 * First game only. 4 tooltips total (2 offense, 2 defense).
 * After player selects a play card, suggest a player card with a one-line reason.
 */

import { gsap } from 'gsap';

// Tooltip suggestions keyed to play type → suggested position + trait + text
var SUGGESTIONS = {
  DEEP:     { pos: ['WR'], trait: ['BURNER', 'CONTESTED CATCH', 'DEEP BALL'], text: "He's fast. Deep routes need speed." },
  SHORT:    { pos: ['WR', 'TE'], trait: ['ROUTE IQ', 'SURE HANDS'], text: 'Quick routes need sharp cuts.' },
  QUICK:    { pos: ['WR', 'TE'], trait: ['ROUTE IQ', 'SURE HANDS', 'YAC BEAST'], text: 'Quick routes need sharp cuts.' },
  RUN:      { pos: ['RB'], trait: ['TRUCK STICK', 'POWER BACK', 'ELUSIVE'], text: "Pick your runner. He's carrying the ball." },
  SCREEN:   { pos: ['RB', 'OL'], trait: ['YAC BEAST', 'PASS CATCHER', 'ROAD GRADER'], text: 'Screens need blockers and speed.' },
  OPTION:   { pos: ['QB', 'RB'], trait: ['ESCAPE ARTIST', 'ELUSIVE'], text: 'Option plays need a dual threat.' },
  BLITZ:    { pos: ['DL'], trait: ['PASS RUSHER', 'EDGE SPEED'], text: "Turn him loose. He's rushing the QB." },
  ZONE:     { pos: ['S', 'CB'], trait: ['BALL HAWK', 'CENTERFIELDER', 'ZONE READER'], text: 'Safeties patrol the deep zones.' },
  PRESSURE: { pos: ['DL', 'LB'], trait: ['PASS RUSHER', 'BLITZ SPECIALIST'], text: 'Get to the QB. Disrupt the throw.' },
  HYBRID:   { pos: ['LB', 'S'], trait: ['COVERAGE LB', 'TACKLER'], text: 'Versatile defenders read and react.' },
};

var _shown = 0;
var _maxTooltips = 4;
var _active = null;

/**
 * Check if we should show a tooltip and show it if appropriate.
 * Call after the user selects a play card.
 * @param {string} playType - The selected play's type (DEEP, SHORT, RUN, etc.)
 * @param {Array} playerHand - The 4 player cards in hand
 * @param {Array} playerCardEls - The 4 DOM elements for player cards (same order as playerHand)
 * @param {HTMLElement} container - Parent element for the tooltip
 * @returns {boolean} Whether a tooltip was shown
 */
export function maybeShowPersonnelTooltip(playType, playerHand, playerCardEls, container) {
  if (_shown >= _maxTooltips) return false;
  var suggestion = SUGGESTIONS[playType];
  if (!suggestion) return false;

  // Find the best matching player in hand
  var bestIdx = -1;
  var bestScore = 0;
  playerHand.forEach(function(p, i) {
    var score = 0;
    if (suggestion.pos.indexOf(p.pos) >= 0) score += 2;
    if (p.trait && suggestion.trait.indexOf(p.trait) >= 0) score += 3;
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  });

  if (bestIdx === -1 || bestScore < 2) return false;

  var cardEl = playerCardEls[bestIdx];
  if (!cardEl) return false;

  _shown++;
  dismissTooltip(); // clear any existing

  // Pulse the card
  gsap.to(cardEl, { boxShadow: '0 0 12px #EBB010', yoyo: true, repeat: 2, duration: 0.4 });

  // Show tooltip text
  var tip = document.createElement('div');
  tip.style.cssText = "position:absolute;bottom:-24px;left:0;right:0;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:10px;color:#EBB010;letter-spacing:0.5px;z-index:10;pointer-events:none;opacity:0;";
  tip.textContent = suggestion.text;
  cardEl.style.position = 'relative';
  cardEl.appendChild(tip);
  gsap.to(tip, { opacity: 1, y: -3, duration: 0.2, ease: 'power2.out' });

  _active = { el: tip, cardEl: cardEl };

  // Auto-dismiss after 4 seconds
  setTimeout(dismissTooltip, 4000);
  return true;
}

export function dismissTooltip() {
  if (!_active) return;
  var a = _active;
  _active = null;
  gsap.to(a.el, { opacity: 0, duration: 0.15, onComplete: function() { if (a.el.parentNode) a.el.remove(); } });
  gsap.to(a.cardEl, { boxShadow: 'none', duration: 0.2 });
}

export function getTooltipCount() { return _shown; }
export function resetTooltips() { _shown = 0; }
