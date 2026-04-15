/**
 * TORCH — Team Wordmark Renderer
 *
 * Renders a team's wordmark as a DOM element at one of three tiers:
 *   t1 (hero, 28-36px, full text-shadow)
 *   t2 (label, 16-22px, scaled-down shadow)
 *   t3 (micro, 10-14px, abbreviation + fill only, no shadow)
 *
 * Spec: docs/TORCH-WORDMARK-SYSTEM.md
 */

import { TEAM_WORDMARKS } from '../data/teamWordmarks.js';

var TIER_SIZES = { t1: 28, t2: 18, t3: 12 };

/** Scale a T1 text-shadow string down for T2 (smaller offsets, reduced glow). */
function scaleShadowForT2(shadow) {
  return shadow
    .replace(/3px 3px/g, '2px 2px')
    .replace(/-1px -1px/g, '-1px -1px')
    .replace(/56px/g, '34px')
    .replace(/42px/g, '26px')
    .replace(/28px/g, '17px')
    .replace(/24px/g, '14px')
    .replace(/20px/g, '12px')
    .replace(/18px/g, '11px')
    .replace(/16px/g, '10px');
}

/**
 * Build a team-wordmark DOM element.
 *
 * @param {string} teamId   Internal team id (e.g. 'sentinels', 'pronghorns')
 * @param {string} [tier]   't1' | 't2' | 't3' — defaults to 't1'
 * @param {object} [opts]   Optional overrides
 * @param {number} [opts.fontSize]      Override font-size in px
 * @param {HTMLElement} [opts.container] Auto-append to this parent
 * @param {boolean} [opts.mascot]        At T1/T2, render the mascot only
 *                                       ("Boars") instead of the full name
 *                                       ("Ridgemont Boars").
 * @returns {HTMLElement|null}
 */
export function renderTeamWordmark(teamId, tier, opts) {
  tier = tier || 't1';
  opts = opts || {};
  var config = TEAM_WORDMARKS[teamId];
  if (!config) return null;

  var el = document.createElement('div');
  el.className = 'team-wordmark team-wordmark--' + tier;

  // Text resolution precedence:
  //   1. opts.mascot=true  → mascot (wins at every tier, including T3)
  //   2. T3 default        → abbr (for scorebug micro contexts when not asked to show mascot)
  //   3. otherwise         → full name
  var text;
  if (opts.mascot && config.mascot) text = config.mascot;
  else if (tier === 't3') text = config.abbr;
  else text = config.name;
  var fontSize = opts.fontSize || TIER_SIZES[tier] || TIER_SIZES.t1;

  var shadow = 'none';
  if (tier === 't1') shadow = config.textShadow;
  else if (tier === 't2') shadow = scaleShadowForT2(config.textShadow);

  // Per-tier weight override — some fonts need a heavier weight at T3 so
  // they don't disappear on dark backgrounds (e.g. Josefin Sans 100 is
  // invisible at 13px; the scorebugWeight override lets it bump to 400).
  var weight = config.weight;
  if (tier === 't3' && config.scorebugWeight) weight = config.scorebugWeight;

  el.style.cssText =
    'font-family:' + config.font + ';' +
    'font-weight:' + weight + ';' +
    'font-size:' + fontSize + 'px;' +
    'color:' + config.fill + ';' +
    'text-transform:' + config.transform + ';' +
    'letter-spacing:' + config.letterSpacing + ';' +
    'text-shadow:' + shadow + ';' +
    'line-height:1.15;' +
    'white-space:nowrap;';
  el.textContent = text;

  if (opts.container) opts.container.appendChild(el);
  return el;
}
