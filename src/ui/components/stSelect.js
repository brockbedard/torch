/**
 * TORCH — Special Teams Player Selection Overlay
 * Shows available players with ST ratings, burned players grayed out.
 * Player taps a card to select → callback fires → overlay closes.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { getAvailableSorted } from '../../engine/stDeck.js';

function starIcons(count) {
  var s = '';
  for (var i = 0; i < 5; i++) s += i < count ? '\u26A1' : '\u2022';
  return s;
}

/**
 * Show ST player selection overlay.
 * @param {HTMLElement} parent - Container to append overlay to
 * @param {object} opts
 * @param {string} opts.title - e.g. 'FIELD GOAL ATTEMPT'
 * @param {string} opts.subtitle - e.g. '42-YARD KICK'
 * @param {object} opts.deck - ST deck state
 * @param {string} opts.primaryRating - 'kickPower'|'kickAccuracy'|'returnAbility'
 * @param {string} opts.secondaryRating - optional second rating to show
 * @param {string} opts.primaryLabel - 'PWR'|'ACC'|'RET'
 * @param {string} opts.secondaryLabel - optional
 * @param {object} opts.team - Team object for accent color
 * @param {function} opts.onSelect - fn(player) — called when player is picked
 */
export function showSTSelect(parent, opts) {
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:800;display:flex;flex-direction:column;background:rgba(0,0,0,0.95);opacity:0;overflow-y:auto;padding:16px;';

  // Title
  var hdr = document.createElement('div');
  hdr.style.cssText = 'text-align:center;margin-bottom:12px;flex-shrink:0;';
  hdr.innerHTML =
    "<div style=\"font-family:'Teko';font-weight:700;font-size:24px;color:#FF6B00;letter-spacing:3px;\">" + opts.title + "</div>" +
    "<div style=\"font-family:'Rajdhani';font-size:12px;color:#888;margin-top:2px;\">" + (opts.subtitle || '') + "</div>";
  ov.appendChild(hdr);

  // Instruction
  var inst = document.createElement('div');
  inst.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:11px;color:#EBB010;letter-spacing:1px;text-align:center;margin-bottom:10px;";
  inst.textContent = 'TAP A PLAYER TO SELECT';
  ov.appendChild(inst);

  // Available players sorted by primary rating
  var sorted = getAvailableSorted(opts.deck, opts.primaryRating);
  var rowEls = [];

  sorted.forEach(function(p) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px 8px;border-bottom:1px solid #1a1a1a;cursor:pointer;border-radius:4px;opacity:0;';

    // Position + Name
    var nameBlock = document.createElement('div');
    nameBlock.style.cssText = "flex:1;min-width:0;";
    nameBlock.innerHTML =
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#666;letter-spacing:1px;\">" + p.pos + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:14px;color:#e8e6ff;\">" + p.name + "</div>";

    // Primary rating
    var r1 = document.createElement('div');
    r1.style.cssText = "text-align:right;flex-shrink:0;";
    var r1Val = (p.st && p.st[opts.primaryRating]) || 1;
    r1.innerHTML =
      "<div style=\"font-family:'Rajdhani';font-size:12px;color:#EBB010;letter-spacing:1px;\">" + starIcons(r1Val) + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:8px;color:#666;letter-spacing:1px;\">" + opts.primaryLabel + "</div>";

    row.appendChild(nameBlock);
    row.appendChild(r1);

    // Secondary rating if provided
    if (opts.secondaryRating) {
      var r2 = document.createElement('div');
      r2.style.cssText = "text-align:right;flex-shrink:0;margin-left:4px;";
      var r2Val = (p.st && p.st[opts.secondaryRating]) || 1;
      r2.innerHTML =
        "<div style=\"font-family:'Rajdhani';font-size:12px;color:#4DA6FF;letter-spacing:1px;\">" + starIcons(r2Val) + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:8px;color:#666;letter-spacing:1px;\">" + (opts.secondaryLabel || '') + "</div>";
      row.appendChild(r2);
    }

    // Tap handler
    row.addEventListener('touchstart', function() {
      gsap.to(row, { scale: 0.97, duration: 0.08 });
    }, { passive: true });
    row.addEventListener('touchend', function() {
      gsap.to(row, { scale: 1, duration: 0.08 });
    }, { passive: true });
    row.onclick = function() {
      SND.select();
      // Flash the selected row
      gsap.to(row, { background: 'rgba(235,176,16,0.15)', duration: 0.15 });
      gsap.to(row, { background: 'transparent', duration: 0.3, delay: 0.15 });
      // Close overlay after brief pause
      setTimeout(function() {
        gsap.to(ov, { opacity: 0, duration: 0.2, onComplete: function() { ov.remove(); } });
        if (opts.onSelect) opts.onSelect(p);
      }, 300);
    };

    ov.appendChild(row);
    rowEls.push(row);
  });

  // Burned players section
  if (opts.deck.burned.length > 0) {
    var burnLabel = document.createElement('div');
    burnLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:9px;color:#444;letter-spacing:1px;margin-top:12px;margin-bottom:4px;";
    burnLabel.textContent = 'ALREADY USED (' + opts.deck.burned.length + ')';
    ov.appendChild(burnLabel);

    opts.deck.burned.forEach(function(entry) {
      var bRow = document.createElement('div');
      bRow.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 8px;opacity:0.35;';
      bRow.innerHTML =
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:#555;flex:1;\">" + entry.player.pos + " " + entry.player.name + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-size:9px;color:#333;\">" + entry.context + "</div>";
      ov.appendChild(bRow);
    });
  }

  // Remaining count
  var countEl = document.createElement('div');
  countEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#555;text-align:center;margin-top:12px;padding-bottom:16px;";
  countEl.textContent = sorted.length + ' PLAYERS REMAINING';
  if (sorted.length <= 3) countEl.style.color = '#e03050';
  ov.appendChild(countEl);

  parent.appendChild(ov);

  // Animate in
  gsap.to(ov, { opacity: 1, duration: 0.2 });
  requestAnimationFrame(function() {
    gsap.to(rowEls, { opacity: 1, duration: 0.2, stagger: 0.04, ease: 'power2.out' });
  });
}
