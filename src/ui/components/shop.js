/**
 * TORCH — Card Shop (Bottom Sheet)
 * Clean, fast purchase flow: tap card → bought. No confirm step.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { Haptic } from '../../engine/haptics.js';
import { TORCH_CARDS, getRandomCard, SHOP_WEIGHTS } from '../../data/torchCards.js';
import { buildTorchCard } from './cards.js';
import { FLAME_PATH } from './brand.js';
import { flameIconSVG, flameLayersMarkup } from '../../utils/flameIcon.js';

/**
 * Show the TORCH card shop.
 * @param {HTMLElement} container
 * @param {string} trigger
 * @param {number} points — current TORCH points
 * @param {Array} inventory — current card inventory (max 3)
 * @param {function} onBuy — callback(card, newInventory, pointsSpent)
 * @param {function} onClose — callback() when shop closes
 */
export function showShop(container, trigger, points, inventory, onBuy, onClose) {
  var weights = SHOP_WEIGHTS[trigger] || SHOP_WEIGHTS.touchdown;
  var offers = [];
  for (var i = 0; i < 3; i++) offers.push(getRandomCard(weights));

  // Skip if can't afford anything
  var cheapest = offers.reduce(function(min, c) { return c.cost < min ? c.cost : min; }, Infinity);
  if (points < cheapest) { if (onClose) onClose(); return; }

  var _pts = points;
  var _purchased = false;
  var _revealed = false;  // Glow Tell — buy locked until cards reveal

  // Overlay
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:auto;';

  var backdrop = document.createElement('div');
  backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(12px) saturate(160%);-webkit-backdrop-filter:blur(12px) saturate(160%);';
  backdrop.onclick = function() { closeShop(); };
  overlay.appendChild(backdrop);

  // Sheet
  var sheet = document.createElement('div');
  sheet.style.cssText = "position:relative;z-index:1;background:linear-gradient(180deg,#1E1610,#141008);border-top:2px solid #EBB010;border-radius:12px 12px 0 0;padding:14px 14px 20px;transform:translateY(100%);transition:transform 0.3s cubic-bezier(0.22,1.3,0.36,1);";

  // Handle indicator
  var handle = document.createElement('div');
  handle.style.cssText = 'width:32px;height:3px;border-radius:2px;background:rgba(255,255,255,0.15);margin:0 auto 10px;';
  sheet.appendChild(handle);

  // Header: TORCH STORE + points
  var hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;';
  hdr.innerHTML =
    '<div style="display:flex;align-items:center;gap:6px;">' +
      "<svg viewBox='0 0 34 34' width='12' height='12' fill='#EBB010' style='opacity:0.7;'><path d='" + FLAME_PATH + "'/></svg>" +
      "<div style=\"font-family:'Oswald';font-weight:700;font-size:10px;color:#EBB010;letter-spacing:3px;\">TORCH STORE</div>" +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:4px;">' +
      "<svg viewBox='0 0 34 34' width='13' height='13' fill='#EBB010'><path d='" + FLAME_PATH + "'/></svg>" +
      "<span id='shop-pts' style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#EBB010;\">" + _pts + "</span>" +
      "<span style=\"font-family:'Rajdhani';font-weight:600;font-size:9px;color:#EBB01066;letter-spacing:1px;\">PTS</span>" +
    '</div>';
  sheet.appendChild(hdr);

  // Inventory dots (3 slots)
  var invRow = document.createElement('div');
  invRow.style.cssText = 'display:flex;gap:4px;margin-bottom:12px;';
  for (var s = 0; s < 3; s++) {
    var dot = document.createElement('div');
    dot.style.cssText = 'flex:1;height:3px;border-radius:2px;background:' + (inventory[s] ? '#EBB010' : 'rgba(255,255,255,0.06)') + ';';
    invRow.appendChild(dot);
  }
  sheet.appendChild(invRow);

  // Card offers
  var offersRow = document.createElement('div');
  offersRow.style.cssText = 'display:flex;gap:8px;justify-content:center;';

  var _glowItems = [];  // {cardEl, cover, tier} for reveal timeline

  offers.forEach(function(card, idx) {
    var canAfford = _pts >= card.cost;
    var isFull = inventory.length >= 3;

    var wrap = document.createElement('div');
    wrap.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;max-width:110px;opacity:0;transform:translateY(16px);';
    setTimeout(function() { wrap.style.opacity = '1'; wrap.style.transform = 'translateY(0)'; wrap.style.transition = 'opacity 0.3s,transform 0.3s'; }, 200 + idx * 120);

    // Card
    var cardEl = buildTorchCard(card, 95, 133);
    cardEl.style.cursor = canAfford ? 'pointer' : 'default';
    cardEl.style.opacity = canAfford ? '1' : '0.4';
    cardEl.style.position = 'relative';
    wrap.appendChild(cardEl);

    // ── GLOW TELL: face-down cover + tier-tinted pulsing glow ──
    var tierColor = card.tier === 'GOLD' ? '#EBB010' : (card.tier === 'SILVER' ? '#C0C0C0' : '#B87333');
    var cover = document.createElement('div');
    cover.style.cssText =
      'position:absolute;inset:0;border-radius:6px;' +
      'background:linear-gradient(135deg,#1a1208,#0a0804 70%);' +
      'border:1.5px solid ' + tierColor + '55;' +
      'display:flex;align-items:center;justify-content:center;' +
      'z-index:10;pointer-events:none;will-change:opacity,transform;';
    cover.innerHTML =
      flameIconSVG(40, 0.45, 'filter:drop-shadow(0 0 8px ' + tierColor + '55)');
    cardEl.appendChild(cover);
    _glowItems.push({ cardEl: cardEl, cover: cover, tier: card.tier, color: tierColor });

    // Cost
    var costEl = document.createElement('div');
    costEl.style.cssText = "display:flex;align-items:center;gap:4px;";
    costEl.innerHTML =
      "<svg viewBox='0 0 34 34' width='11' height='11' fill='" + (canAfford ? '#EBB010' : '#444') + "'><path d='" + FLAME_PATH + "'/></svg>" +
      "<span style=\"font-family:'Teko';font-weight:700;font-size:14px;color:" + (canAfford ? '#EBB010' : '#444') + ";letter-spacing:1px;\">" + card.cost + "</span>";
    wrap.appendChild(costEl);

    // Not enough text
    if (!canAfford) {
      var needEl = document.createElement('div');
      needEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:8px;color:#555;letter-spacing:0.5px;";
      needEl.textContent = 'NEED ' + (card.cost - _pts) + ' MORE';
      wrap.appendChild(needEl);
    }

    // Tap to buy (direct — no confirm step)
    if (canAfford) {
      cardEl.onclick = function() {
        if (_purchased || !_revealed) return;
        _purchased = true;
        SND.shimmer(); Haptic.shopBuy();

        // Track purchases
        var bought = parseInt(localStorage.getItem('torch_cards_bought') || '0');
        localStorage.setItem('torch_cards_bought', String(bought + 1));

        // Points animation
        var ptsSpan = sheet.querySelector('#shop-pts');
        _pts -= card.cost;
        if (ptsSpan) {
          try {
            gsap.to(ptsSpan, { color: '#ff0040', duration: 0.1 });
            gsap.to(ptsSpan, { color: '#EBB010', duration: 0.3, delay: 0.3 });
          } catch(e) {}
          ptsSpan.textContent = _pts;
        }

        // Card flies up + glow
        try {
          gsap.to(cardEl, { y: -12, scale: 1.08, duration: 0.2, ease: 'back.out(2)' });
          gsap.to(cardEl, { boxShadow: '0 0 20px rgba(235,176,16,0.5)', duration: 0.2 });
        } catch(e) {}

        // Dim other cards
        offersRow.querySelectorAll('div').forEach(function(w) {
          if (w.parentNode === offersRow && w !== wrap) {
            try { gsap.to(w, { opacity: 0.2, duration: 0.3 }); } catch(e) { w.style.opacity = '0.2'; }
          }
        });

        // Handle inventory
        if (isFull) {
          // Show swap UI after brief pause
          setTimeout(function() { showSwapUI(sheet, overlay, inventory, card, _pts, onBuy, closeShop); }, 400);
        } else {
          var newInv = inventory.slice();
          newInv.push(card);
          onBuy(card, newInv, card.cost);

          // Brief "ACQUIRED" then close
          setTimeout(function() {
            try { gsap.to(sheet, { y: 40, opacity: 0, duration: 0.3, ease: 'power2.in' }); } catch(e) {}
            setTimeout(closeShop, 350);
          }, 800);
        }
      };

      // Touch feedback
      cardEl.addEventListener('touchstart', function() {
        if (_purchased) return;
        try { gsap.to(cardEl, { scale: 0.95, duration: 0.08 }); } catch(e) {}
      }, { passive: true });
      cardEl.addEventListener('touchend', function() {
        if (_purchased) return;
        try { gsap.to(cardEl, { scale: 1, duration: 0.15, ease: 'back.out(2)' }); } catch(e) {}
      }, { passive: true });
    }

    offersRow.appendChild(wrap);
  });
  sheet.appendChild(offersRow);

  // ── GLOW TELL REVEAL — anticipation, then flip ──
  // Each card pulses with tier-tinted glow, then the cover fades away.
  // Bronze = dim, Silver = bright, Gold = radiant. Audio sting pitched by tier.
  try {
    _glowItems.forEach(function(g, i) {
      var glowMax;
      if (g.tier === 'GOLD')        glowMax = '0 0 32px 6px ' + g.color + 'cc, 0 4px 14px rgba(0,0,0,0.6)';
      else if (g.tier === 'SILVER') glowMax = '0 0 18px 3px ' + g.color + '88, 0 4px 12px rgba(0,0,0,0.5)';
      else                          glowMax = '0 0 10px 1px ' + g.color + '55, 0 4px 12px rgba(0,0,0,0.5)';
      var glowMin = '0 0 0px 0px ' + g.color + '00, 0 4px 12px rgba(0,0,0,0.5)';

      var startDelay = 0.55 + i * 0.10;  // After wrap fade-in (0.2s + idx*0.12)
      var tl = gsap.timeline({ delay: startDelay });

      // Pulse: ramp → ease → ramp again (gold pulses harder)
      tl.fromTo(g.cardEl,
          { boxShadow: glowMin },
          { boxShadow: glowMax, duration: 0.45, ease: 'sine.out',
            onStart: function() {
              // Audio tell — pitch encodes rarity
              var step = g.tier === 'GOLD' ? 7 : (g.tier === 'SILVER' ? 3 : 0);
              SND.pop(step);
            }
          })
        .to(g.cardEl, { boxShadow: glowMin, duration: 0.35, ease: 'sine.in' })
        .to(g.cardEl, { boxShadow: glowMax, duration: 0.35, ease: 'sine.out' })
        // Flip away the cover
        .to(g.cover, { opacity: 0, scale: 1.18, duration: 0.32, ease: 'power2.out',
            onStart: function() { SND.flip(); }
          }, '+=0.05')
        .set(g.cover, { display: 'none' })
        // Settle glow back to a quiet baseline so the face reads cleanly
        .to(g.cardEl, { boxShadow: glowMin, duration: 0.5, ease: 'sine.inOut' });
    });
    // Unlock buying once the longest tail completes
    var unlockAt = 550 + (_glowItems.length - 1) * 100 + 1900;
    setTimeout(function() { _revealed = true; }, unlockAt);
  } catch(e) {
    // Animation failed → unlock immediately so the shop remains usable
    _glowItems.forEach(function(g) { if (g.cover && g.cover.parentNode) g.cover.parentNode.removeChild(g.cover); });
    _revealed = true;
  }

  // Pass button
  var passBtn = document.createElement('div');
  passBtn.style.cssText = "text-align:center;margin-top:14px;padding:12px;font-family:'Rajdhani';font-weight:700;font-size:11px;color:#555;letter-spacing:2px;cursor:pointer;";
  passBtn.textContent = 'NO THANKS';
  passBtn.onclick = function() { SND.click(); closeShop(); };
  sheet.appendChild(passBtn);

  overlay.appendChild(sheet);
  container.appendChild(overlay);

  // Animate in
  requestAnimationFrame(function() { requestAnimationFrame(function() {
    sheet.style.transform = 'translateY(0)';
  }); });

  function closeShop() {
    sheet.style.transform = 'translateY(100%)';
    setTimeout(function() {
      if (overlay.parentNode) overlay.remove();
      if (onClose) onClose();
    }, 300);
  }
}

// Swap UI — when inventory is full, pick a card to drop
function showSwapUI(sheet, overlay, inventory, newCard, pts, onBuy, closeShop) {
  sheet.innerHTML = '';
  sheet.style.padding = '14px 14px 20px';

  var title = document.createElement('div');
  title.style.cssText = "font-family:'Oswald';font-weight:700;font-size:10px;color:#ff0040;letter-spacing:3px;text-align:center;margin-bottom:10px;";
  title.textContent = 'DROP A CARD TO MAKE ROOM';
  sheet.appendChild(title);

  var row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:8px;justify-content:center;';

  inventory.forEach(function(card, idx) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;';
    var cardEl = buildTorchCard(card, 85, 119);
    wrap.appendChild(cardEl);

    var dropLabel = document.createElement('div');
    dropLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:9px;color:#ff0040;letter-spacing:1px;";
    dropLabel.textContent = 'DROP';
    wrap.appendChild(dropLabel);

    wrap.addEventListener('touchstart', function() {
      try { gsap.to(wrap, { scale: 0.93, duration: 0.08 }); } catch(e) {}
    }, { passive: true });
    wrap.addEventListener('touchend', function() {
      try { gsap.to(wrap, { scale: 1, duration: 0.15, ease: 'back.out(2)' }); } catch(e) {}
    }, { passive: true });
    wrap.onclick = function() {
      SND.click();
      var newInv = inventory.slice();
      newInv.splice(idx, 1);
      newInv.push(newCard);
      onBuy(newCard, newInv, newCard.cost);
      try { gsap.to(sheet, { y: 40, opacity: 0, duration: 0.3 }); } catch(e) {}
      setTimeout(closeShop, 350);
    };
    row.appendChild(wrap);
  });
  sheet.appendChild(row);

  var cancelBtn = document.createElement('div');
  cancelBtn.style.cssText = "text-align:center;margin-top:12px;padding:10px;font-family:'Rajdhani';font-weight:700;font-size:11px;color:#555;letter-spacing:2px;cursor:pointer;";
  cancelBtn.textContent = 'CANCEL';
  cancelBtn.onclick = function() { closeShop(); };
  sheet.appendChild(cancelBtn);
}
