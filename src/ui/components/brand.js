/**
 * TORCH — Shared Brand Components
 * Reusable UI elements used across all screens.
 */

import { gsap } from 'gsap';
import { flameIconSVG, flameSilhouetteSVG, FLAME_SILHOUETTE_PATH } from '../../utils/flameIcon.js';

// Backward-compat export: the old FLAME_PATH was a single wiggly path on a
// 44×56 viewBox. The new 4-layer flame lives on a 34×34 viewBox. FLAME_PATH
// is now the outer silhouette (layer 1) of the new flame so anything still
// importing this constant gets a valid path for its existing viewBox="0 0 34 34"
// or for Path2D canvas use. For new code, prefer flameIconSVG() / flameSilhouetteSVG().
export var FLAME_PATH = FLAME_SILHOUETTE_PATH;

/**
 * Build the TORCH brand header (flowing gold border + dark bar + chrome title)
 * @param {string} title - Header text (e.g. "GAME DAY", "HALFTIME")
 * @param {object} [opts] - Optional: { subtitle, subtitleColor }
 * @returns {HTMLElement}
 */
export function buildTorchHeader(title, opts) {
  opts = opts || {};
  var header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;display:flex;flex-direction:column;';

  // Flowing gold border
  var border = document.createElement('div');
  border.style.cssText = 'height:2px;background:linear-gradient(90deg,#8B4A1F,#EBB010,#FFD060,#EBB010,#8B4A1F);background-size:200% 100%;animation:borderFlow 3s linear infinite;';
  header.appendChild(border);

  // Dark bar with flames + chrome title
  var bar = document.createElement('div');
  bar.style.cssText = 'background:linear-gradient(180deg,#1a1208,#0a0804);padding:10px 14px;display:flex;align-items:center;justify-content:center;gap:8px;position:relative;';

  // Noise texture
  var noise = document.createElement('div');
  noise.style.cssText = 'position:absolute;inset:0;opacity:0.03;pointer-events:none;background:repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(255,255,255,0.5) 2px,rgba(255,255,255,0.5) 3px);';
  bar.appendChild(noise);

  // 4-layer flame — built-in color depth, no need for a gradient.
  // Size 13×13 (square) so the new 34×34-viewBox flame keeps the same
  // rendered height as the old 10×13 44×56-viewBox rectangle.
  var flameSvg = flameIconSVG(13, 0.7, 'animation:emblemPulse 3s ease-in-out infinite;position:relative;z-index:1;');
  bar.innerHTML += flameSvg;

  var titleEl = document.createElement('div');
  titleEl.className = 'torch-chrome';
  titleEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:18px;letter-spacing:5px;line-height:1;position:relative;z-index:1;";
  titleEl.textContent = title;
  bar.appendChild(titleEl);

  bar.innerHTML += flameSvg;

  // Optional subtitle (e.g. "GAME 2 OF 3")
  if (opts.subtitle) {
    var sub = document.createElement('div');
    sub.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:9px;color:" + (opts.subtitleColor || '#555') + ";letter-spacing:1px;position:relative;z-index:1;margin-left:4px;";
    sub.textContent = opts.subtitle;
    bar.appendChild(sub);
  }

  header.appendChild(bar);

  // Bottom divider
  var divBottom = document.createElement('div');
  divBottom.style.cssText = 'height:1px;background:linear-gradient(90deg,transparent,#EBB01033,transparent);';
  header.appendChild(divBottom);

  return header;
}

/**
 * Build a flame badge split button (used for PLAY, SNAP, KICK OFF, CONTINUE, etc.)
 * @param {string} label - Button text
 * @param {function} onClick - Tap handler
 * @param {object} [opts] - Optional: { width, breathe, urgent }
 * @returns {HTMLElement}
 */
export function buildFlameBadgeButton(label, onClick, opts) {
  opts = opts || {};
  var btn = document.createElement('button');
  var bgGrad = opts.urgent ? 'linear-gradient(180deg,#e03050 0%,#8B0020 100%)' : 'linear-gradient(180deg,#EBB010 0%,#FF4511 100%)';
  var shadowColor = opts.urgent ? 'rgba(224,48,80,0.3)' : 'rgba(78,50,23,0.4)';
  btn.style.cssText = 'padding:0;border:none;border-radius:6px;background:' + bgGrad + ';display:flex;align-items:stretch;overflow:hidden;cursor:pointer;box-shadow:0 4px 16px ' + shadowColor + ',0 0 20px rgba(235,176,16,0.15);' + (opts.width ? 'width:' + opts.width + ';' : 'width:100%;') + (opts.breathe !== false ? 'animation:breatheGlow 2.5s ease-in-out infinite;' : '');

  var badge = document.createElement('div');
  badge.style.cssText = 'background:rgba(0,0,0,0.2);padding:12px 14px;display:flex;align-items:center;justify-content:center;border-right:1px solid rgba(0,0,0,0.15);';
  badge.innerHTML = flameIconSVG(21, 1, 'filter:drop-shadow(0 0 4px rgba(255,69,17,0.4))');

  var text = document.createElement('div');
  text.style.cssText = "flex:1;padding:14px;font-family:'Teko';font-weight:700;font-size:22px;color:#fff;letter-spacing:6px;text-align:center;text-shadow:0 2px 4px rgba(0,0,0,0.3);line-height:1;";
  text.textContent = label;

  btn.appendChild(badge);
  btn.appendChild(text);

  if (onClick) btn.onclick = function(e) { e.stopPropagation(); onClick(e); };

  // Touch feedback
  btn.addEventListener('touchstart', function() {
    try { gsap.to(btn, { scale: 0.97, duration: 0.08 }); } catch(e) {}
  }, { passive: true });
  btn.addEventListener('touchend', function() {
    try { gsap.to(btn, { scale: 1, duration: 0.15, ease: 'back.out(2)' }); } catch(e) {}
  }, { passive: true });

  return btn;
}

/**
 * Build a bottom accent bar (team-to-team color gradient)
 * @param {string} colorLeft
 * @param {string} colorRight
 * @returns {HTMLElement}
 */
export function buildAccentBar(colorLeft, colorRight) {
  var bar = document.createElement('div');
  bar.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,' + colorLeft + ',#EBB010,' + (colorRight || colorLeft) + ');z-index:20;';
  return bar;
}
