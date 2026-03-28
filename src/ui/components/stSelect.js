/**
 * TORCH — Special Teams Player Selection Overlay
 * Shows available players with ST ratings. Explains what you're picking and why.
 * Player taps a row to select → burns the player → callback fires → overlay closes.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { Haptic } from '../../engine/haptics.js';
import { getAvailableSorted } from '../../engine/stDeck.js';

function starIcons(count, color) {
  var s = '';
  for (var i = 0; i < 5; i++) s += '<span style="color:' + (i < count ? (color || '#EBB010') : '#333') + '">\u26A1</span>';
  return s;
}

// Context descriptions for each ST scenario
var ST_CONTEXT = {
  fg: {
    role: 'KICKER',
    explain: 'Pick a player to kick the field goal. Higher accuracy = better chance to make it. Higher power = more range.',
    tip: 'This player will be BURNED from your special teams deck for the rest of the game.',
    ratingExplain: { primary: 'ACCURACY — chance to make the kick', secondary: 'POWER — distance and strength' },
  },
  punt: {
    role: 'PUNTER',
    explain: 'Pick a player to punt the ball. Higher power = longer punt, pushing the opponent further back.',
    tip: 'This player will be BURNED from your special teams deck for the rest of the game.',
    ratingExplain: { primary: 'POWER — punt distance' },
  },
  kickoff: {
    role: 'KICKER',
    explain: 'Pick a player to kick off. Higher power = deeper kick, giving the opponent worse field position.',
    tip: 'This player will be BURNED from your special teams deck for the rest of the game.',
    ratingExplain: { primary: 'POWER — kickoff distance' },
  },
  return: {
    role: 'RETURNER',
    explain: 'Pick a player to return the kick. Higher return ability = better chance for a big return.',
    tip: 'This player will be BURNED from your special teams deck for the rest of the game.',
    ratingExplain: { primary: 'RETURN — speed and elusiveness' },
  },
};

/**
 * Show ST player selection overlay.
 * @param {HTMLElement} parent
 * @param {object} opts
 * @param {string} opts.title - e.g. 'FIELD GOAL ATTEMPT'
 * @param {string} opts.subtitle - e.g. '42-YARD KICK'
 * @param {string} opts.stType - 'fg'|'punt'|'kickoff'|'return'
 * @param {object} opts.deck - ST deck state
 * @param {string} opts.primaryRating - 'kickPower'|'kickAccuracy'|'returnAbility'
 * @param {string} opts.secondaryRating - optional
 * @param {string} opts.primaryLabel - 'PWR'|'ACC'|'RET'
 * @param {string} opts.secondaryLabel
 * @param {object} opts.team - Team object for accent color
 * @param {function} opts.onSelect - fn(player)
 */
export function showSTSelect(parent, opts) {
  var ctx = ST_CONTEXT[opts.stType || 'fg'] || ST_CONTEXT.fg;

  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:800;display:flex;flex-direction:column;background:rgba(0,0,0,0.95);opacity:0;overflow-y:auto;padding:16px;padding-top:max(16px,env(safe-area-inset-top));padding-bottom:max(16px,env(safe-area-inset-bottom));';

  // Title block
  var hdr = document.createElement('div');
  hdr.style.cssText = 'text-align:center;margin-bottom:8px;flex-shrink:0;position:relative;';
  hdr.innerHTML =
    "<div style=\"font-family:'Teko';font-weight:700;font-size:24px;color:#FF6B00;letter-spacing:3px;\">" + opts.title + "</div>" +
    "<div style=\"font-family:'Rajdhani';font-size:13px;color:#aaa;margin-top:2px;\">" + (opts.subtitle || '') + "</div>";

  // Close/cancel button
  var closeBtn = document.createElement('button');
  closeBtn.style.cssText = "position:absolute;top:0;right:0;background:none;border:none;color:#555;font-size:20px;line-height:1;padding:4px 8px;cursor:pointer;font-family:'Teko';";
  closeBtn.textContent = '\u2715';
  closeBtn.onclick = function() {
    gsap.to(ov, { opacity: 0, duration: 0.2, onComplete: function() { ov.remove(); } });
    if (opts.onCancel) opts.onCancel();
  };
  hdr.appendChild(closeBtn);
  ov.appendChild(hdr);

  // Role + explanation
  var explainBlock = document.createElement('div');
  explainBlock.style.cssText = 'background:rgba(235,176,16,0.06);border:1px solid #EBB01033;border-radius:6px;padding:8px 10px;margin-bottom:10px;';
  explainBlock.innerHTML =
    "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:#EBB010;letter-spacing:2px;\">PICK YOUR " + ctx.role + "</div>" +
    "<div style=\"font-family:'Rajdhani';font-size:11px;color:#aaa;line-height:1.4;margin-top:4px;\">" + ctx.explain + "</div>" +
    "<div style=\"font-family:'Rajdhani';font-size:11px;color:#e03050;margin-top:6px;letter-spacing:0.5px;\">" + ctx.tip + "</div>";
  ov.appendChild(explainBlock);

  // Rating legend
  var legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:12px;justify-content:center;margin-bottom:8px;';
  legend.innerHTML =
    "<div style=\"font-family:'Rajdhani';font-size:11px;color:#EBB010;\">\u26A1 " + (ctx.ratingExplain.primary || opts.primaryLabel) + "</div>" +
    (opts.secondaryRating && ctx.ratingExplain.secondary ? "<div style=\"font-family:'Rajdhani';font-size:11px;color:#4DA6FF;\">\u26A1 " + ctx.ratingExplain.secondary + "</div>" : '');
  ov.appendChild(legend);

  // Player rows
  var sorted = getAvailableSorted(opts.deck, opts.primaryRating);
  var rowEls = [];

  sorted.forEach(function(p) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:12px 12px;border-bottom:1px solid #1a1a1a;cursor:pointer;border-radius:4px;opacity:0;';

    var fullName = (p.firstName ? p.firstName + ' ' : '') + p.name;
    var nameBlock = document.createElement('div');
    nameBlock.style.cssText = "flex:1;min-width:0;";
    nameBlock.innerHTML =
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:11px;color:#666;letter-spacing:1px;\">" + p.pos + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:14px;color:#e8e6ff;\">" + fullName + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:11px;color:#555;\">" + (p.trait || '') + "</div>";

    // Primary rating
    var r1 = document.createElement('div');
    r1.style.cssText = "text-align:center;flex-shrink:0;min-width:50px;";
    var r1Val = (p.st && p.st[opts.primaryRating]) || 1;
    r1.innerHTML = "<div style=\"font-size:11px;letter-spacing:1px;\">" + starIcons(r1Val, '#EBB010') + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:11px;color:#888;letter-spacing:1px;\">" + opts.primaryLabel + "</div>";
    row.appendChild(nameBlock);
    row.appendChild(r1);

    // Secondary rating
    if (opts.secondaryRating) {
      var r2 = document.createElement('div');
      r2.style.cssText = "text-align:center;flex-shrink:0;min-width:50px;";
      var r2Val = (p.st && p.st[opts.secondaryRating]) || 1;
      r2.innerHTML = "<div style=\"font-size:11px;letter-spacing:1px;\">" + starIcons(r2Val, '#4DA6FF') + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:11px;color:#888;letter-spacing:1px;\">" + (opts.secondaryLabel || '') + "</div>";
      row.appendChild(r2);
    }

    // Touch feedback + tap
    row.addEventListener('touchstart', function() { gsap.to(row, { scale: 0.97, duration: 0.08 }); }, { passive: true });
    row.addEventListener('touchend', function() { gsap.to(row, { scale: 1, duration: 0.08 }); }, { passive: true });
    row.onclick = function() {
      SND.select(); Haptic.cardSelect();
      gsap.to(row, { background: 'rgba(235,176,16,0.15)', duration: 0.15 });
      gsap.to(row, { background: 'transparent', duration: 0.3, delay: 0.15 });
      setTimeout(function() {
        gsap.to(ov, { opacity: 0, duration: 0.2, onComplete: function() { ov.remove(); } });
        if (opts.onSelect) opts.onSelect(p);
      }, 300);
    };

    ov.appendChild(row);
    rowEls.push(row);
  });

  // Burned players
  if (opts.deck.burned.length > 0) {
    var burnLabel = document.createElement('div');
    burnLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:11px;color:#444;letter-spacing:1px;margin-top:12px;margin-bottom:4px;";
    burnLabel.textContent = 'BURNED (' + opts.deck.burned.length + ')';
    ov.appendChild(burnLabel);

    opts.deck.burned.forEach(function(entry) {
      var burnedName = (entry.player.firstName ? entry.player.firstName + ' ' : '') + entry.player.name;
      var bRow = document.createElement('div');
      bRow.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 8px;opacity:0.3;';
      bRow.innerHTML =
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:#555;flex:1;\">" + entry.player.pos + " " + burnedName + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-size:11px;color:#333;\">" + entry.context + "</div>";
      ov.appendChild(bRow);
    });
  }

  // Remaining count
  var countEl = document.createElement('div');
  countEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#555;text-align:center;margin-top:12px;padding-bottom:16px;";
  countEl.textContent = sorted.length + ' OF 14 PLAYERS REMAINING';
  if (sorted.length <= 3) countEl.style.color = '#e03050';
  ov.appendChild(countEl);

  parent.appendChild(ov);

  gsap.to(ov, { opacity: 1, duration: 0.2 });
  requestAnimationFrame(function() {
    gsap.to(rowEls, { opacity: 1, duration: 0.2, stagger: 0.04, ease: 'power2.out' });
  });
}
